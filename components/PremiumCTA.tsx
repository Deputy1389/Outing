
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Star, Infinity as InfinityIcon } from 'lucide-react';
import TactileButton from './TactileButton';

const PremiumCTA: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 shadow-2xl">
      <div className="absolute top-0 right-0 -m-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -m-4 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
          <ShieldCheck size={12} /> Membership
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-white">Unlock Outing Plus</h3>
          <p className="text-white/70 text-sm font-medium">Elevate your planning with premium features designed for enthusiasts.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2">
          {[
            { icon: <InfinityIcon size={14} />, text: "Unlimited saved outings" },
            { icon: <Zap size={14} />, text: "Priority AI generation" },
            { icon: <Star size={14} />, text: "Custom atmosphere modes" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-white/90 text-[11px] font-bold uppercase tracking-wider">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                {item.icon}
              </div>
              {item.text}
            </div>
          ))}
        </div>

        <TactileButton
          onClick={onUpgrade}
          className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold text-xs tracking-widest shadow-xl shadow-indigo-900/40"
        >
          JOIN PLUS — $4.99 / MO
        </TactileButton>
      </div>
    </div>
  );
};

export default PremiumCTA;
