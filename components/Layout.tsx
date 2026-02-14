
import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, History as HistoryIcon, User, Sparkles } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (view: AppView) => void;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, title = "Outing" }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#121212] shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 bg-[#121212]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between border-b border-white/5">
        <div className="flex flex-col">
          {activeView === 'membership' ? (
            <h1 className="text-2xl font-serif text-white">Plus</h1>
          ) : (
            <h1 className="text-2xl font-serif text-white">{title}</h1>
          )}
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setView('membership')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
            activeView === 'membership' 
            ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
            : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          {activeView === 'membership' ? <Sparkles size={18} /> : <User size={20} />}
        </motion.button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-32">
        {children}
      </main>

      {/* Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around py-4 px-6 safe-bottom z-40">
        <NavButton 
          active={activeView === 'create' || activeView === 'itinerary' || activeView === 'final'} 
          onClick={() => setView('create')}
          label="Plan"
          Icon={PlusCircle}
        />
        <NavButton 
          active={activeView === 'history'} 
          onClick={() => setView('history')}
          label="History"
          Icon={HistoryIcon}
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, label, Icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
  >
    <Icon size={24} fill={active ? 'currentColor' : 'none'} className="transition-all" strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default Layout;
