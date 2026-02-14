
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Zap, ArrowRight } from 'lucide-react';
import TactileButton from './TactileButton';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: <Calendar className="w-8 h-8" />,
    title: "Curated Itineraries",
    description: "Every plan is a structured 3-stop journey, tailored to your chosen vibe and budget.",
    color: "indigo"
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Intelligent Logic",
    description: "We handle the details. Weather checks and operating hour conflict detection are built-in.",
    color: "emerald"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Seamless Experience",
    description: "Export to PDF, share with your partner, and keep a history of your favorite nights out.",
    color: "violet"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col p-8 justify-between">
      <div className="flex justify-between items-center pt-8">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>
        <button 
          onClick={onComplete}
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 max-w-xs"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 mx-auto shadow-2xl shadow-indigo-500/10">
              {steps[current].icon}
            </div>
            <h2 className="text-4xl font-serif text-white leading-tight">
              {steps[current].title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {steps[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-12">
        <TactileButton
          onClick={next}
          className="w-full py-5 bg-white text-[#121212] rounded-2xl font-bold text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-2xl shadow-white/5"
        >
          {current === steps.length - 1 ? "GET STARTED" : "CONTINUE"}
          <ArrowRight size={14} />
        </TactileButton>
      </div>
    </div>
  );
};

export default Onboarding;
