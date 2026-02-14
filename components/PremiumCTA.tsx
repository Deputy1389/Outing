
import React from 'react';
import { ShieldCheck, Zap, Star } from 'lucide-react';
import TactileButton from './TactileButton';

const PremiumCTA: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <ShieldCheck size={12} /> Membership
        </div>
        <h3 className="text-xl font-bold text-white">Outing Plus</h3>
        <p className="text-slate-500 text-xs">Unlock advanced planning tools for enthusiasts.</p>
      </div>

      <div className="space-y-3">
        {[
          { icon: <Zap size={14} />, text: "Unlimited saved outings" },
          { icon: <Star size={14} />, text: "Priority deterministic logic" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
              {item.icon}
            </div>
            {item.text}
          </div>
        ))}
      </div>

      <TactileButton
        onClick={onUpgrade}
        className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-[10px] tracking-widest hover:bg-white/10 transition-all"
      >
        VIEW PLANS — $4.99 / MO
      </TactileButton>
    </div>
  );
};

export default PremiumCTA;
