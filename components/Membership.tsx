
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, CreditCard, Sparkles } from 'lucide-react';
import TactileButton from './TactileButton';

interface MembershipProps {
  onBack: () => void;
}

const Membership: React.FC<MembershipProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 space-y-12"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto">
          <Sparkles size={32} />
        </div>
        <h2 className="text-4xl font-serif text-white">Outing Plus</h2>
        <p className="text-slate-500 text-sm font-medium px-4">Choose the plan that fits your dating frequency.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/5 p-8 rounded-3xl space-y-6 relative overflow-hidden group">
          <div className="space-y-1">
            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Base Plan</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-slate-600 text-xs">/ forever</span>
            </div>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <Check size={14} className="text-emerald-500" /> 3 saved outings
            </li>
            <li className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <Check size={14} className="text-emerald-500" /> Standard AI response
            </li>
            <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
              <X size={14} className="text-slate-800" /> PDF Exporting
            </li>
          </ul>

          <button disabled className="w-full py-4 border border-white/10 rounded-xl text-slate-600 font-bold text-xs tracking-widest">
            CURRENT PLAN
          </button>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/30 p-8 rounded-3xl space-y-6 relative overflow-hidden ring-1 ring-indigo-500/50">
          <div className="absolute top-4 right-4 bg-indigo-500 px-3 py-1 rounded-full text-[8px] font-bold text-white uppercase tracking-widest">
            Recommended
          </div>
          <div className="space-y-1">
            <h3 className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Outing Plus</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$4.99</span>
              <span className="text-slate-600 text-xs">/ month</span>
            </div>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-[10px] font-bold text-indigo-200 uppercase">
              <Check size={14} className="text-indigo-400" /> Unlimited saved outings
            </li>
            <li className="flex items-center gap-2 text-[10px] font-bold text-indigo-200 uppercase">
              <Check size={14} className="text-indigo-400" /> Priority AI Models
            </li>
            <li className="flex items-center gap-2 text-[10px] font-bold text-indigo-200 uppercase">
              <Check size={14} className="text-indigo-400" /> Premium PDF Export
            </li>
            <li className="flex items-center gap-2 text-[10px] font-bold text-indigo-200 uppercase">
              <Check size={14} className="text-indigo-400" /> Exclusive Themes
            </li>
          </ul>

          <TactileButton className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold text-xs tracking-widest shadow-xl shadow-indigo-500/20">
            UPGRADE NOW
          </TactileButton>
        </div>
      </div>

      <div className="pt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600">
          <CreditCard size={14} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Secure Payment by Stripe</span>
        </div>
        <button 
          onClick={onBack}
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          Cancel and Return
        </button>
      </div>
    </motion.div>
  );
};

export default Membership;
