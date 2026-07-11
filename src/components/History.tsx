import { Link } from 'react-router';
import { useBrand } from '../context/BrandContext';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function History() {
  const { projects } = useBrand();

  const completedProjects = projects.filter(p => p.status === 'complete');

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Brands</h1>
          <p className="text-white/60">A history of all the creative workflows you've run.</p>
        </div>
        <Link to="/create" className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-medium transition-colors flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          New Brand
        </Link>
      </div>

      {completedProjects.length === 0 ? (
        <div className="text-center py-20 bg-[#18181B] border border-white/5 rounded-3xl">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No brands generated yet</h3>
          <p className="text-white/50 mb-8 max-w-sm mx-auto">Create your first brand by describing your business idea.</p>
          <Link to="/create" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            Get started &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedProjects.map((project, i) => {
            const logoAsset = project.assets?.find(a => a.type === 'Logo');
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/dashboard/${project.id}`} className="block group">
                  <div className="bg-[#18181B] border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-colors h-full flex flex-col">
                    <div className="aspect-video w-full bg-black/50 relative overflow-hidden">
                      {logoAsset ? (
                        <img 
                          src={logoAsset.imageUrl} 
                          alt={project.strategy?.brandName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">No Logo</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{project.strategy?.brandName || 'Unnamed Brand'}</h3>
                      <p className="text-sm text-white/50 mb-4 line-clamp-2">{project.strategy?.tagline}</p>
                      
                      <div className="flex items-center text-violet-400 text-sm font-medium group-hover:text-violet-300 transition-colors">
                        View Brand Kit <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
