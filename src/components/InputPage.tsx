import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useBrand } from '../context/BrandContext';
import { ArrowRight, Wand2, Upload, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function InputPage() {
  const { createProject, generateStrategy } = useBrand();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState('');
  const [category, setCategory] = useState('');
  const [audience, setAudience] = useState('');
  const [style, setStyle] = useState('');
  const [colors, setColors] = useState('');
  
  const [referenceImage, setReferenceImage] = useState<{ data: string, mimeType: string } | null>(null);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const mimeType = file.type;
      const base64Data = result.split(',')[1];
      setReferenceImage({ data: base64Data, mimeType });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const project = createProject(idea, category, audience, style, colors, referenceImage);
    generateStrategy(project);
    navigate(`/generating/${project.id}`);
  };

  const currentStepIsValid = () => {
    switch (step) {
      case 1: return idea.length > 3;
      case 2: return category.length > 2 && audience.length > 2;
      case 3: return style.length > 2 && colors.length > 2;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("h-2 rounded-full transition-all duration-300", step >= i ? "w-12 bg-violet-500" : "w-4 bg-white/10")} />
          ))}
        </div>
        <div className="text-sm text-white/50">Step {step} of 3</div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-[#18181B] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">What's your idea?</h2>
                <p className="text-white/60">Describe what you are building in a few words.</p>
              </div>
              <textarea
                value={idea}
                onChange={e => setIdea(e.target.value)}
                placeholder="e.g. An organic cold brew coffee brand for busy professionals..."
                className="w-full bg-[#09090B] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[120px] resize-none"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Market & Audience</h2>
                <p className="text-white/60">Help the AI understand your positioning.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Business Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Food & Beverage"
                    className="w-full bg-[#09090B] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                    placeholder="e.g. Gen Z, Tech workers, Fitness enthusiasts"
                    className="w-full bg-[#09090B] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Visual Vibe</h2>
                <p className="text-white/60">Define the aesthetics of your new brand.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Brand Style</label>
                  <input
                    type="text"
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                    placeholder="e.g. Minimal, Playful, Luxury, Cyberpunk"
                    className="w-full bg-[#09090B] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Primary Colors</label>
                  <input
                    type="text"
                    value={colors}
                    onChange={e => setColors(e.target.value)}
                    placeholder="e.g. Earth tones, Neon pink and blue, Monochrome"
                    className="w-full bg-[#09090B] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-white/70 mb-2">Inspiration Image (Optional)</label>
                  {!referenceImage ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#09090B] border border-white/10 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-white/40 hover:text-white/80 hover:border-violet-500/50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-sm">Upload a moodboard or inspiration photo</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-32 bg-[#09090B] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={`data:${referenceImage.mimeType};base64,${referenceImage.data}`} className="h-full object-contain" alt="Reference" />
                      <button 
                        type="button" 
                        onClick={() => setReferenceImage(null)}
                        className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white/80 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            <button
              type="submit"
              disabled={!currentStepIsValid()}
              className="px-8 py-3 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-all"
            >
              {step === 3 ? (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Brand
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
