import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useBrand } from '../context/BrandContext';
import { motion } from 'motion/react';
import { Download, ExternalLink, Sparkles, Palette, Type, Zap, LayoutDashboard, Layers, Edit2, Check, X } from 'lucide-react';
import { GeneratedAsset } from '../types';
import CompareVariations from './CompareVariations';

export default function Dashboard() {
  const { projectId } = useParams();
  const { projects, updateProject } = useBrand();
  const project = projects.find(p => p.id === projectId);
  const [activeTab, setActiveTab] = useState<'kit' | 'compare'>('kit');
  const [isEditingTypography, setIsEditingTypography] = useState(false);
  const [primaryFont, setPrimaryFont] = useState(project?.strategy?.typography?.[0] || 'Inter');
  const [secondaryFont, setSecondaryFont] = useState(project?.strategy?.typography?.[1] || 'Roboto');

  if (!project || !project.strategy) return null;

  const { strategy, assets } = project;

  const handleSaveTypography = () => {
    updateProject(project.id, {
      strategy: {
        ...strategy,
        typography: [primaryFont, secondaryFont]
      }
    });
    setIsEditingTypography(false);
  };

  const renderAssetCard = (asset: GeneratedAsset | undefined, fallbackTitle: string, span: string = 'col-span-1', key?: string) => {
    if (!asset) return null;
    return (
      <Link key={key || asset.id} to={`/asset/${project.id}/${asset.id}`} className={`block group ${span}`}>
        <div className="bg-[#18181B] border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-colors h-full flex flex-col">
          <div className="relative aspect-video w-full overflow-hidden bg-black/50">
            <img 
              src={asset.imageUrl} 
              alt={asset.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-semibold tracking-wider text-violet-400 uppercase mb-1">{asset.type}</div>
            <h3 className="text-lg font-medium text-white">{asset.title}</h3>
          </div>
        </div>
      </Link>
    );
  };

  const logoAsset = (assets || []).find(a => a.type === 'Logo');
  const webAsset = (assets || []).find(a => a.type === 'Website');
  const restAssets = (assets || []).filter(a => a.type !== 'Logo' && a.type !== 'Website');

  return (
    <div className="space-y-12 pb-20">
      <header className="text-center space-y-4 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Brand Generated Successfully</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">{strategy.brandName}</h1>
          <p className="text-xl text-white/60 italic mb-6">"{strategy.tagline}"</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={`/campaign/${project.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
            >
              <Zap className="w-5 h-5" />
              Launch Velocity Pipeline
            </Link>
          </div>
        </motion.div>
      </header>

      <div className="flex justify-center mt-8">
        <div className="bg-[#18181B] border border-white/10 rounded-full p-1 inline-flex">
          <button
            onClick={() => setActiveTab('kit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'kit' 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Brand Kit
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'compare' 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            Compare Variations
          </button>
        </div>
      </div>

      {activeTab === 'kit' ? (
        <motion.div 
          key="kit"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Strategy Panel */}
          <div className="col-span-1 space-y-6">
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                  <Palette className="w-4 h-4" /> Brand Colors
                </h3>
                <div className="flex gap-2 h-16 rounded-xl overflow-hidden">
                  {(strategy.colorPalette || []).map(color => (
                    <div key={color} className="flex-1 group relative" style={{ backgroundColor: color }}>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono">
                        {color}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white/50 uppercase tracking-wider">
                    <Type className="w-4 h-4" /> Typography
                  </h3>
                  {!isEditingTypography ? (
                    <button 
                      onClick={() => setIsEditingTypography(true)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleSaveTypography}
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingTypography(false);
                          setPrimaryFont(strategy.typography?.[0] || 'Inter');
                          setSecondaryFont(strategy.typography?.[1] || 'Roboto');
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-xs text-white/40 mb-1">Primary Display</div>
                    {!isEditingTypography ? (
                      <div className="text-lg font-medium">{strategy.typography?.[0] || 'Inter'}</div>
                    ) : (
                      <input 
                        type="text" 
                        value={primaryFont}
                        onChange={(e) => setPrimaryFont(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 focus:border-violet-500 outline-none text-lg font-medium py-1"
                      />
                    )}
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-xs text-white/40 mb-1">Secondary Body</div>
                    {!isEditingTypography ? (
                      <div className="text-lg font-medium">{strategy.typography?.[1] || 'Roboto'}</div>
                    ) : (
                      <input 
                        type="text" 
                        value={secondaryFont}
                        onChange={(e) => setSecondaryFont(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 focus:border-violet-500 outline-none text-lg font-medium py-1"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Brand Voice
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {strategy.voice}
                </p>
              </div>
            </div>
            
            {renderAssetCard(logoAsset, 'Primary Logo')}
          </div>

          {/* Assets Grid */}
          <div className="col-span-1 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {renderAssetCard(webAsset, 'Website Hero', 'md:col-span-2')}
              {restAssets.map(asset => renderAssetCard(asset, asset.title))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="compare"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CompareVariations project={project} />
        </motion.div>
      )}
    </div>
  );
}
