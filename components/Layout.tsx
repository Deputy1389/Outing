
import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, History as HistoryIcon, User } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (view: AppView) => void;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, title = "Outing" }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#121212] relative overflow-hidden font-sans">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 bg-[#121212] sticky top-0 z-30 flex items-center justify-between border-b border-white/5">
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <button 
          onClick={() => setView('membership')}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-all"
        >
          <User size={18} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-32">
        {children}
      </main>

      {/* Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-[#121212] border-t border-white/5 flex items-center justify-around py-4 px-6 safe-bottom z-40">
        <NavButton 
          active={['create', 'itinerary', 'final'].includes(activeView)} 
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
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default Layout;
