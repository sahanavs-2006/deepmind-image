import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useBrand } from '../context/BrandContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Globe, Zap, ArrowRight, Loader2, Download, AlertCircle } from 'lucide-react';

interface AdVariant {
  id: string;
  region: string;
  theme: string;
  promptModifier: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'done' | 'error';
}

const DEFAULT_VARIANTS: Omit<AdVariant, 'id' | 'status'>[] = [
  { region: 'Tokyo', theme: 'Neon Cyberpunk', promptModifier: 'set in a futuristic neon-lit Tokyo street at night, cyberpunk aesthetic, high energy' },
  { region: 'New York', theme: 'Urban Professional', promptModifier: 'set in a bright modern Manhattan office loft, natural lighting, professional, sleek' },
  { region: 'Paris', theme: 'Romantic Editorial', promptModifier: 'set in a classic Parisian cafe, warm sunset lighting, editorial fashion photography style' },
  { region: 'Nordic', theme: 'Minimalist Zen', promptModifier: 'set in a minimalist Scandinavian interior, extremely clean, white and neutral tones, calm' },
  { region: 'Rio de Janeiro', theme: 'Vibrant Tropical', promptModifier: 'set on a sunny vibrant beach in Rio, colorful, high contrast, energetic and summery' },
  { region: 'London', theme: 'Moody Heritage', promptModifier: 'set in a historic London brick alley on a rainy day, moody cinematic lighting, sophisticated' },
  { region: 'Dubai', theme: 'Ultra Luxury', promptModifier: 'set in a hyper-modern luxury penthouse in Dubai, gold accents, opulent, expensive' },
  { region: 'Seoul', theme: 'Pop Culture', promptModifier: 'set in a trendy Seoul district, pastel colors, k-pop music video aesthetic, youthful' },
];

export default function CampaignEngine() {
  const { projectId } = useParams();
  const { projects } = useBrand();
  const project = projects.find(p => p.id === projectId);

  const [campaignConcept, setCampaignConcept] = useState('Summer Collection 2026');
  const [variants, setVariants] = useState<AdVariant[]>(
    DEFAULT_VARIANTS.map((v, i) => ({ ...v, id: `var-${i}`, status: 'idle' }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [globalError, setGlobalError] = useState('');

  if (!project || !project.strategy) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Link to="/" className="text-violet-400 hover:text-violet-300">Return Home</Link>
      </div>
    );
  }

  const { strategy } = project;

  const launchPipeline = async () => {
    setIsRunning(true);
    setGlobalError('');
    
    // Set all to generating
    setVariants(prev => prev.map(v => ({ ...v, status: 'generating', imageUrl: undefined })));

    // Fire all requests in parallel to showcase NB2 Lite's speed capabilities
    const promises = variants.map(async (variant) => {
      try {
        const fullPrompt = `A high-end advertising image for the brand "${strategy.brandName}". The image MUST contain the text "${campaignConcept}" written in large, bold, high-fidelity typography. Concept: ${campaignConcept}. ${variant.promptModifier}. The brand colors are ${(strategy.colorPalette || []).join(', ')}. Use a modern, professional style matching this vibe: ${strategy.voice}`;
        
        const response = await fetch('/api/generate-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: fullPrompt,
            aspectRatio: '16:9',
            model: 'gemini-3.1-flash-lite-image'
          }),
        });

        if (!response.ok) {
          throw new Error('Generation failed');
        }
        const data = await response.json();
        
        setVariants(prev => prev.map(v => 
          v.id === variant.id ? { ...v, status: 'done', imageUrl: data.imageUrl } : v
        ));
      } catch (error) {
        console.error(`Failed to generate variant ${variant.id}:`, error);
        setVariants(prev => prev.map(v => 
          v.id === variant.id ? { ...v, status: 'error' } : v
        ));
        setGlobalError('Some variations failed to generate. You can try again.');
      }
    });

    await Promise.allSettled(promises);
    setIsRunning(false);
  };

  const completedCount = variants.filter(v => v.status === 'done').length;
  const totalCount = variants.length;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>Powered by Nano Banana 2 Lite</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">Velocity Engine</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Programmatic Ad Localizer. Generate high-fidelity localized variants in parallel instantly.
          </p>
        </div>
      </header>

      {globalError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{globalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Pipeline Config</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Brand</label>
                <div className="text-white font-medium bg-black/30 p-3 rounded-lg border border-white/5">
                  {strategy.brandName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Campaign Concept</label>
                <input 
                  type="text"
                  value={campaignConcept}
                  onChange={(e) => setCampaignConcept(e.target.value)}
                  disabled={isRunning}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  placeholder="e.g. Summer Collection 2026"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Target Regions</span>
                  <span className="text-white font-medium">{variants.length}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-white/60">Estimated Latency</span>
                  <span className="text-orange-400 font-medium">~3.5s per batch</span>
                </div>

                <button
                  onClick={launchPipeline}
                  disabled={isRunning}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Launch Pipeline
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {isRunning && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
              <h4 className="text-orange-400 font-medium flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Pipeline Active
              </h4>
              <p className="text-sm text-orange-400/80">
                Running {totalCount} parallel generation jobs targeting localized nodes...
              </p>
              <div className="mt-4 w-full bg-black/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            <AnimatePresence>
              {variants.map((variant) => (
                <motion.div 
                  key={variant.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#18181B] border border-white/10 rounded-2xl overflow-hidden flex flex-col group relative"
                >
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 border border-white/10">
                      <Globe className="w-3 h-3" />
                      {variant.region}
                    </span>
                  </div>
                  
                  <div className="aspect-[16/9] w-full bg-black/50 relative overflow-hidden flex items-center justify-center">
                    {variant.status === 'idle' && (
                      <div className="text-white/20 flex flex-col items-center gap-2">
                        <Sparkles className="w-8 h-8" />
                        <span className="text-sm font-medium">Ready for generation</span>
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
                        <span className="mt-4 text-sm font-medium text-orange-400 font-mono">
                          Rendering {variant.region}...
                        </span>
                      </div>
                    )}

                    {variant.status === 'error' && (
                      <div className="text-red-400 flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8" />
                        <span className="text-sm font-medium">Failed to generate</span>
                      </div>
                    )}

                    {variant.status === 'done' && variant.imageUrl && (
                      <>
                        <img 
                          src={variant.imageUrl} 
                          alt={`${variant.region} variant`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-80" />
                      </>
                    )}
                  </div>
                  
                  <div className="p-5 relative z-10 bg-gradient-to-t from-[#18181B] via-[#18181B] to-transparent -mt-12 pt-12">
                    <div className="text-xs font-semibold tracking-wider text-orange-400 uppercase mb-1">
                      {variant.theme}
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2">
                      {variant.promptModifier}
                    </p>
                    
                    {variant.status === 'done' && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Generated in ~3.2s
                        </span>
                        <a 
                          href={variant.imageUrl} 
                          download={`${strategy.brandName}-${variant.region}.png`}
                          className="text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
