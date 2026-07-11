import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Zap, Layers } from 'lucide-react';
import { BrandProject } from '../types';

interface CompareVariationsProps {
  project: BrandProject;
}

interface Variation {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'done' | 'error';
}

const VARIATION_STYLES = [
  { name: 'Minimalist & Modern', description: 'Clean lines, plenty of whitespace, highly legible.' },
  { name: 'Bold & Playful', description: 'Vibrant colors, energetic typography, highly expressive.' },
  { name: 'Elegant & Premium', description: 'Sophisticated, luxurious, refined details.' },
  { name: 'Raw & Industrial', description: 'Brutalist, edgy, high contrast, technical.' }
];

export default function CompareVariations({ project }: CompareVariationsProps) {
  const [variations, setVariations] = useState<Variation[]>(
    VARIATION_STYLES.map((v, i) => ({ ...v, id: `var-${i}`, status: 'idle' }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const generateVariations = async () => {
    setIsRunning(true);
    setGlobalError('');
    setVariations(prev => prev.map(v => ({ ...v, status: 'generating', imageUrl: undefined })));

    const promises = variations.map(async (variant) => {
      try {
        const fullPrompt = `A beautiful branding kit moodboard layout for a brand called "${project.strategy?.brandName}". Style: ${variant.name} - ${variant.description}. The board should contain logo concepts, color palettes, and typography samples. Highly professional and aesthetic.`;
        
        const response = await fetch('/api/generate-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: fullPrompt,
            aspectRatio: '1:1',
            model: 'gemini-3.1-flash-lite-image'
          }),
        });

        if (!response.ok) throw new Error('Generation failed');
        const data = await response.json();
        
        setVariations(prev => prev.map(v => 
          v.id === variant.id ? { ...v, status: 'done', imageUrl: data.imageUrl } : v
        ));
      } catch (error) {
        console.error(`Failed to generate variation ${variant.id}:`, error);
        setVariations(prev => prev.map(v => 
          v.id === variant.id ? { ...v, status: 'error' } : v
        ));
        setGlobalError('Some variations failed to generate. You can try again.');
      }
    });

    await Promise.allSettled(promises);
    setIsRunning(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Compare Variations</h2>
          <p className="text-white/60">Generate alternative brand identities instantly using the Nano Banana 2 Lite pipeline.</p>
        </div>
        <button
          onClick={generateVariations}
          disabled={isRunning}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          {isRunning ? 'Generating...' : 'Generate Alternatives'}
        </button>
      </div>

      {globalError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <p>{globalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {variations.map((variant) => (
            <motion.div 
              key={variant.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#18181B] border border-white/10 rounded-2xl overflow-hidden flex flex-col group relative"
            >
              <div className="aspect-square w-full bg-black/50 relative overflow-hidden flex items-center justify-center">
                {variant.status === 'idle' && (
                  <div className="text-white/20 flex flex-col items-center gap-2 p-6 text-center">
                    <Layers className="w-8 h-8" />
                    <span className="text-sm font-medium">Ready to generate</span>
                  </div>
                )}
                
                {variant.status === 'generating' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-violet-500/20 flex flex-col items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-8 h-8 text-orange-400" />
                    </motion.div>
                    <span className="mt-4 text-xs font-medium text-orange-400 font-mono text-center px-4">
                      Generating {variant.name}...
                    </span>
                  </div>
                )}

                {variant.status === 'error' && (
                  <div className="text-red-400 flex flex-col items-center gap-2 text-center p-6">
                    <span className="text-sm font-medium">Failed to generate</span>
                  </div>
                )}

                {variant.status === 'done' && variant.imageUrl && (
                  <>
                    <img 
                      src={variant.imageUrl} 
                      alt={`${variant.name} variation`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-50" />
                  </>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col relative z-10 bg-[#18181B]">
                <h3 className="text-lg font-medium text-white mb-2">{variant.name}</h3>
                <p className="text-sm text-white/60">
                  {variant.description}
                </p>
                {variant.status === 'done' && (
                   <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                     <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                       <Zap className="w-3 h-3" />
                       Sub-4s Generation
                     </span>
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
