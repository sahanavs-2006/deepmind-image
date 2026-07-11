import { Outlet, Link, useNavigate } from 'react-router';
import { Sparkles, History as HistoryIcon, Settings, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBrand } from '../context/BrandContext';

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { projects } = useBrand();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const completedProjects = projects.filter(p => p.status === 'complete');
  
  const searchResults = completedProjects.filter(p => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    const nameMatch = p.strategy?.brandName?.toLowerCase()?.includes(query);
    const categoryMatch = p.category?.toLowerCase()?.includes(query);
    return nameMatch || categoryMatch;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-sans">
      <header className="border-b border-white/10 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight shrink-0">
            <Sparkles className="w-6 h-6 text-violet-500" />
            <span className="hidden sm:inline">BrandForge <span className="text-violet-500">AI</span></span>
          </Link>
          
          <div className="flex-1 max-w-md mx-4 sm:mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search brands by name or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>

            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full mt-2 w-full bg-[#18181B] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto p-2">
                    {searchResults.map(project => {
                      const logo = project.assets?.find(a => a.type === 'Logo');
                      return (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(false);
                            navigate(`/dashboard/${project.id}`);
                          }}
                          className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-black/50 overflow-hidden flex items-center justify-center shrink-0">
                            {logo ? (
                              <img src={logo.imageUrl} alt={project.strategy?.brandName} className="w-full h-full object-cover" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-white/20" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {project.strategy?.brandName || 'Unnamed Brand'}
                            </div>
                            <div className="text-xs text-white/50 truncate">
                              {project.category}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-white/50">
                    No brands found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex items-center gap-2 sm:gap-6 shrink-0">
            <Link to="/history" className="hidden sm:flex text-sm font-medium text-white/70 hover:text-white items-center gap-2 transition-colors">
              <HistoryIcon className="w-4 h-4" />
              History
            </Link>
            <Link to="/settings" className="hidden sm:flex text-sm font-medium text-white/70 hover:text-white items-center gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <Link to="/create" className="text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white px-3 sm:px-4 py-2 rounded-full transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
