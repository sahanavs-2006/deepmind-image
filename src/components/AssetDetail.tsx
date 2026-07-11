import { useParams, Link } from 'react-router';
import { useBrand } from '../context/BrandContext';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Share2, Code2, Edit2, Wand2, RefreshCcw, ScanLine } from 'lucide-react';
import { useState } from 'react';

export default function AssetDetail() {
  const { projectId, assetId } = useParams();
  const { projects, updateProject } = useBrand();
  const project = projects.find(p => p.id === projectId);
  
  const assetIndex = (project?.assets || []).findIndex(a => a.id === assetId);
  const asset = assetIndex !== -1 && project ? project.assets[assetIndex] : null;

  const [isEditing, setIsEditing] = useState(false);
  const [studioMode, setStudioMode] = useState<'edit' | 'regenerate'>('edit');
  const [editInstruction, setEditInstruction] = useState('');
  const [prompt, setPrompt] = useState(asset?.prompt || '');
  const [model, setModel] = useState('gemini-3.1-flash-lite-image');
  const [size, setSize] = useState('1K');
  const [aspectRatio, setAspectRatio] = useState(asset?.type === 'Website' || asset?.type === 'Ad' || asset?.type === 'Business Card' ? '16:9' : (asset?.type === 'Packaging' ? '4:3' : '1:1'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!project || !asset) return null;

  const handleGenerate = async (isEditMode: boolean) => {
    setIsGenerating(true);
    setError('');
    try {
      const endpoint = isEditMode ? '/api/edit-asset' : '/api/generate-asset';
      let body: any = {
        prompt: isEditMode ? editInstruction : prompt,
        model,
        aspectRatio,
        imageSize: size,
      };

      if (isEditMode) {
        // Remove data:image/...;base64, from the image string for the backend
        const base64Data = asset.imageUrl.split(',')[1];
        const mimeType = asset.imageUrl.split(';')[0].split(':')[1];
        body.referenceImage = {
          data: base64Data,
          mimeType,
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const { imageUrl } = await res.json();
        const updatedAssets = [...project.assets];
        updatedAssets[assetIndex] = {
          ...asset,
          imageUrl,
          prompt: isEditMode ? (asset.prompt + "\n\nEdited: " + editInstruction) : prompt,
        };
        updateProject(project.id, { assets: updatedAssets });
        setIsEditing(false);
        setEditInstruction('');
        setAnalysis(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to generate image. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const base64Data = asset.imageUrl.split(',')[1];
      const mimeType = asset.imageUrl.split(';')[0].split(':')[1];
      
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: { data: base64Data, mimeType }
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link to={`/dashboard/${project.id}`} className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-[#18181B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <img 
              src={asset.imageUrl} 
              alt={asset.title} 
              className={`w-full h-auto object-contain bg-black/50 transition-opacity ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
              referrerPolicy="no-referrer"
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCcw className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white/50 uppercase tracking-wider">
                <ScanLine className="w-4 h-4" /> Deep Analysis
              </h3>
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Analyze Image
              </button>
            </div>
            
            {analysis ? (
              <p className="text-sm text-white/80 leading-relaxed bg-black/30 p-4 rounded-xl">
                {analysis}
              </p>
            ) : (
              <p className="text-sm text-white/40 italic text-center py-4">
                Click analyze to get Gemini's perspective on this generated asset.
              </p>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <div className="text-violet-400 font-semibold tracking-wider uppercase text-sm mb-2">{asset.type}</div>
            <h1 className="text-3xl font-bold">{asset.title}</h1>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <a 
                href={asset.imageUrl} 
                download={`${project.strategy?.brandName.replace(/\s+/g, '_')}_${asset.type}.png`}
                className="w-full py-4 bg-white text-black rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-4 bg-[#18181B] border border-white/10 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                Edit / Regenerate
              </button>
            </div>
          ) : (
            <div className="bg-[#18181B] border border-white/10 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Image Studio</h3>
                <button onClick={() => setIsEditing(false)} className="text-sm text-white/50 hover:text-white">Cancel</button>
              </div>

              <div className="flex gap-2 p-1 bg-black/40 rounded-xl">
                <button 
                  onClick={() => setStudioMode('edit')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${studioMode === 'edit' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  Edit Image
                </button>
                <button 
                  onClick={() => setStudioMode('regenerate')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${studioMode === 'regenerate' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  Regenerate
                </button>
              </div>

              <div className="space-y-4">
                {studioMode === 'regenerate' ? (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Prompt</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px] resize-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Edit Instructions</label>
                    <textarea 
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      placeholder="e.g. Change the background to neon blue, make it photorealistic..."
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 min-h-[100px] resize-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Model</label>
                    <select 
                      value={model} 
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="gemini-3.1-flash-lite-image">Flash Lite (Very Fast)</option>
                      <option value="gemini-3.1-flash-image">Flash (High Quality)</option>
                      <option value="gemini-3-pro-image">Pro (Studio Quality)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Size</label>
                    <select 
                      value={size} 
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">Aspect Ratio</label>
                    <select 
                      value={aspectRatio} 
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="1:1">1:1 Square</option>
                      <option value="2:3">2:3 Portrait</option>
                      <option value="3:4">3:4 Portrait</option>
                      <option value="3:2">3:2 Landscape</option>
                      <option value="4:3">4:3 Landscape</option>
                      <option value="9:16">9:16 Vertical (Story)</option>
                      <option value="16:9">16:9 Widescreen</option>
                      <option value="21:9">21:9 Cinematic</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {studioMode === 'regenerate' ? (
                  <button 
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating}
                    className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    Regenerate from Scratch
                  </button>
                ) : (
                  <button 
                    onClick={() => handleGenerate(true)}
                    disabled={isGenerating || !editInstruction.trim()}
                    className="w-full py-3 bg-fuchsia-600 text-white rounded-xl font-medium hover:bg-fuchsia-700 transition-colors disabled:opacity-50"
                  >
                    Apply Edit
                  </button>
                )}
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                <Code2 className="w-4 h-4" /> Generation Prompt
              </h3>
              <p className="text-sm text-white/70 leading-relaxed font-mono bg-black/30 p-4 rounded-xl">
                {asset.prompt}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
