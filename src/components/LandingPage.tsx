import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Layers, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>The Ultimate Creative Workflow</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          Create an Entire Brand in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Seconds.</span>
        </h1>
        
        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          One prompt generates a complete brand strategy, logo, packaging, social media assets, and website UI. Professional branding, fully automated.
        </p>

        <div className="flex items-center justify-center gap-4 pt-8">
          <Link
            to="/create"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-200 bg-violet-600 border border-transparent rounded-full hover:bg-violet-700 hover:shadow-[0_0_40px_8px_rgba(124,58,237,0.3)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-600 focus:ring-offset-[#09090B]"
          >
            Start Generating
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-5xl"
      >
        <div className="bg-[#18181B] border border-white/5 p-6 rounded-2xl text-left space-y-4">
          <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold">Complete Assets</h3>
          <p className="text-white/60">Logos, business cards, Instagram posts, and UI mockups generated simultaneously.</p>
        </div>
        <div className="bg-[#18181B] border border-white/5 p-6 rounded-2xl text-left space-y-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold">Instant Strategy</h3>
          <p className="text-white/60">Color palettes, typography, and brand voice are formulated based on your core idea.</p>
        </div>
        <div className="bg-[#18181B] border border-white/5 p-6 rounded-2xl text-left space-y-4">
          <div className="w-12 h-12 bg-fuchsia-500/10 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-fuchsia-400" />
          </div>
          <h3 className="text-xl font-semibold">Production Ready</h3>
          <p className="text-white/60">Export high-quality assets ready for your pitch deck or marketing campaign.</p>
        </div>
      </motion.div>
    </div>
  );
}
