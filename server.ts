import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/generate-strategy", async (req, res) => {
    try {
      const { idea, category, audience, style, colors, referenceImage } = req.body;
      
      const prompt = `You are an expert brand strategist. Create a complete brand strategy based on the following input:
Idea: ${idea}
Category: ${category}
Audience: ${audience}
Style: ${style}
Colors: ${colors}
${referenceImage ? "A reference image has been provided to inspire the brand style." : ""}

Return a detailed JSON object representing the brand strategy. It should include:
- brandName: A catchy name for the brand.
- tagline: A short tagline.
- colorPalette: Array of exactly 5 hex codes matching the style and colors requested.
- typography: Two font names (primary, secondary).
- voice: Describe the brand voice in a short sentence.
- logoConcept: A detailed visual description prompt for generating the logo image.
- packagingConcept: A detailed visual description prompt for generating product packaging.
- websiteHeroConcept: A detailed visual description prompt for a website landing page hero section.
- adBannerConcept: A detailed visual description prompt for an advertising banner.
- instagramPostConcept: A detailed visual description prompt for a square instagram post.
- businessCardConcept: A detailed visual description prompt for a modern business card.`;

      const contents = referenceImage 
        ? [{
            parts: [
              { inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } },
              { text: prompt }
            ]
          }]
        : prompt;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              tagline: { type: Type.STRING },
              colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
              typography: { type: Type.ARRAY, items: { type: Type.STRING } },
              voice: { type: Type.STRING },
              logoConcept: { type: Type.STRING },
              packagingConcept: { type: Type.STRING },
              websiteHeroConcept: { type: Type.STRING },
              adBannerConcept: { type: Type.STRING },
              instagramPostConcept: { type: Type.STRING },
              businessCardConcept: { type: Type.STRING },
            },
            required: [
              "brandName", "tagline", "colorPalette", "typography", "voice", 
              "logoConcept", "packagingConcept", "websiteHeroConcept", 
              "adBannerConcept", "instagramPostConcept", "businessCardConcept"
            ]
          }
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("Generate strategy error:", error);
      res.status(500).json({ error: "Failed to generate brand strategy." });
    }
  });

  app.post("/api/generate-asset", async (req, res) => {
    try {
      const { prompt, aspectRatio, imageSize, model } = req.body;
      const targetModel = model || "gemini-3.1-flash-image";
      
      const config: any = {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
        }
      };

      if (targetModel !== 'gemini-3.1-flash-lite-image') {
        config.imageConfig.imageSize = imageSize || "1K";
      }

      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: targetModel,
            contents: prompt,
            config
          });
          break; // Success
        } catch (error: any) {
          retries--;
          if (retries === 0) throw error;
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        }
      }
      
      let imageUrl = null;
      for (const part of response?.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        throw new Error("No image generated.");
      }

      res.json({ imageUrl });
    } catch (error) {
      console.error("Generate asset error:", error);
      res.status(500).json({ error: "Failed to generate asset." });
    }
  });

  app.post("/api/edit-asset", async (req, res) => {
    try {
      const { prompt, referenceImage, model, aspectRatio, imageSize } = req.body;
      const targetModel = model || "gemini-3.1-flash-image";

      const config: any = {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
        }
      };

      if (targetModel !== 'gemini-3.1-flash-lite-image') {
        config.imageConfig.imageSize = imageSize || "1K";
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: referenceImage.data,
                  mimeType: referenceImage.mimeType,
                },
              },
              { text: prompt }
            ]
          }
        ],
        config
      });
      
      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        throw new Error("No edited image generated.");
      }

      res.json({ imageUrl });
    } catch (error) {
      console.error("Edit asset error:", error);
      res.status(500).json({ error: "Failed to edit asset." });
    }
  });

  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { image, prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { inlineData: { data: image.data, mimeType: image.mimeType } },
            { text: prompt || "Analyze this image and describe its brand style, colors, and key visual elements in a short paragraph." }
          ]
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        }
      });
      res.json({ analysis: response.text });
    } catch (error) {
      console.error("Analyze image error:", error);
      res.status(500).json({ error: "Failed to analyze image." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
