import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useBrand } from '../context/BrandContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function GenerationScreen() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects } = useBrand();
  const project = projects.find(p => p.id === projectId);

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps = [
    { id: 'strategy', label: 'Formulating Brand Strategy' },
    { id: 'logo', label: 'Designing Primary Logo' },
    { id: 'packaging', label: 'Rendering Product Packaging' },
    { id: 'website', label: 'Building Website UI' },
    { id: 'social', label: 'Creating Social Media Assets' },
    { id: 'marketing', label: 'Generating Marketing Banners' },
  ];

  useEffect(() => {
    if (!project) return;
    
    if (project.status === 'complete') {
      // Small delay for dramatic effect before redirecting
      const timer = setTimeout(() => {
        navigate(`/dashboard/${project.id}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Fake progress animation since actual generation is a block process server-side
    // We'll just advance the UI based on time while we wait for 'complete'
    if (project.status === 'generating_assets') {
      const interval = setInterval(() => {
        setActiveStepIndex(current => {
          if (current < steps.length - 1) return current + 1;
          return current;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [project, navigate]);

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto pt-12 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-violet-400 hover:text-violet-300">Return to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-12 text-center">
      {project.status === 'idea' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
             <CircleDashed className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">Generation Failed</h2>
          <p className="text-white/60 mb-6">Something went wrong while formulating the brand strategy. Please try again.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-2 border-violet-500 opacity-50"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-b-2 border-fuchsia-500 opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Forging your brand...</h2>
          <p className="text-white/60">Our AI agents are working together to design your assets.</p>
        </motion.div>
      )}

      {project.status !== 'idea' && (
        <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md mx-auto text-left shadow-2xl">
        <div className="space-y-6">
          {steps.map((step, index) => {
            let status: 'waiting' | 'active' | 'done' = 'waiting';
            if (project.status === 'complete') {
              status = 'done';
            } else if (project.status === 'generating_strategy') {
               status = index === 0 ? 'active' : 'waiting';
            } else if (project.status === 'generating_assets') {
              if (index < activeStepIndex + 1) status = 'done';
              else if (index === activeStepIndex + 1) status = 'active';
            }

            return (
              <div key={step.id} className="flex items-center gap-4">
                <div className="relative">
                  {status === 'done' ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </motion.div>
                  ) : status === 'active' ? (
                    <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                  ) : (
                    <CircleDashed className="w-6 h-6 text-white/20" />
                  )}
                </div>
                <span className={cn(
                  "font-medium transition-colors duration-300",
                  status === 'done' ? "text-white" : 
                  status === 'active' ? "text-violet-400" : 
                  "text-white/30"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
