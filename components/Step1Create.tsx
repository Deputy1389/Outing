
import React, { useState } from 'react';
import TactileButton from './TactileButton';
import { Vibe, BudgetLevel, AlcoholPref, LocationMode, Outing, DietaryTag } from '../types';
import { Clock, Calendar as CalendarIcon, MapPin, SlidersHorizontal } from 'lucide-react';

interface Step1Props {
  onGenerate: (params: Partial<Outing>) => void;
  isLoading: boolean;
}

const Step1Create: React.FC<Step1Props> = ({ onGenerate, isLoading }) => {
  const [vibe, setVibe] = useState<Vibe>(Vibe.COZY);
  const [budget, setBudget] = useState<BudgetLevel>(BudgetLevel.MODERATE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("19:00");
  const [range, setRange] = useState(5);
  const [alcohol, setAlcohol] = useState<AlcoholPref>(AlcoholPref.NEUTRAL);
  const [diets, setDiets] = useState<DietaryTag[]>([]);
  const [io, setIo] = useState<'indoor' | 'outdoor' | 'either'>('either');

  const toggleDiet = (tag: DietaryTag) => {
    setDiets(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleGenerate = () => {
    onGenerate({ 
      vibe, 
      budget_level: budget, 
      date,
      start_time: startTime,
      range_miles: range,
      alcohol_pref: alcohol,
      dietary_tags: diets,
      indoor_outdoor: io
    });
  };

  const sectionClass = "space-y-3 pb-6 border-b border-white/5";
  const labelClass = "text-[10px] font-bold text-slate-500 uppercase tracking-widest";

  return (
    <div className="py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Plan Outing</h2>
        <p className="text-slate-400 text-sm">Deterministic itinerary generator for local rendezvous.</p>
      </div>
      
      <div className="space-y-8">
        <div className={sectionClass}>
          <h3 className={labelClass}>Time & Date</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white outline-none focus:border-white/20"
                style={{ colorScheme: 'dark' }}
              />
              <CalendarIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            <div className="relative">
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white outline-none focus:border-white/20"
              />
              <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className={labelClass}>Vibe & Budget</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.values(Vibe).map((v) => (
                <button
                  key={v}
                  onClick={() => setVibe(v)}
                  className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    vibe === v ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setBudget(lvl as any)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border ${
                    budget === lvl ? 'bg-slate-200 text-black border-slate-200' : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  {"$".repeat(lvl)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <div className="flex justify-between items-center">
            <h3 className={labelClass}>Range (Miles)</h3>
            <span className="text-xs font-bold text-white">{range}mi</span>
          </div>
          <input 
            type="range" 
            min="1" max="25" 
            value={range} 
            onChange={(e) => setRange(parseInt(e.target.value))}
            className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className={sectionClass}>
          <h3 className={labelClass}>Dietary Needs</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(DietaryTag).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleDiet(tag)}
                className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  diets.includes(tag) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className={labelClass}>Alcohol Preference</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(AlcoholPref).map((pref) => (
              <button
                key={pref}
                onClick={() => setAlcohol(pref)}
                className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-tighter transition-all border ${
                  alcohol === pref ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>

        <div className="pb-10">
          <TactileButton
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 bg-white text-black rounded-xl font-bold text-xs tracking-[0.2em] shadow-2xl disabled:opacity-20 transition-all hover:bg-slate-100"
          >
            {isLoading ? "CALCULATING..." : "BUILD ITINERARY"}
          </TactileButton>
        </div>
      </div>
    </div>
  );
};

export default Step1Create;
