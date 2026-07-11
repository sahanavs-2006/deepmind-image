import { motion } from 'motion/react';
import { Settings as SettingsIcon, Monitor, Image as ImageIcon, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-white/60">Manage your BrandForge AI preferences.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-[#18181B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl divide-y divide-white/5">
          <div className="p-6 md:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Theme Preference</h3>
                <p className="text-sm text-white/50">Choose between dark and light mode.</p>
              </div>
            </div>
            <select className="bg-[#09090B] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option>Dark Mode (Default)</option>
              <option>Light Mode</option>
              <option>System Default</option>
            </select>
          </div>

          <div className="p-6 md:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Export Quality</h3>
                <p className="text-sm text-white/50">Set the default resolution for downloaded assets.</p>
              </div>
            </div>
            <select className="bg-[#09090B] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option>High (1K - Default)</option>
              <option>Ultra (4K)</option>
              <option>Web (512px)</option>
            </select>
          </div>

          <div className="p-6 md:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Language</h3>
                <p className="text-sm text-white/50">Change the generation model language.</p>
              </div>
            </div>
            <select className="bg-[#09090B] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Japanese</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
