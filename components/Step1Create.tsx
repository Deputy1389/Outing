
import React, { useState } from 'react';
import TactileButton from './TactileButton';
import { Vibe, BudgetLevel, AlcoholPref, LocationMode, Outing } from '../types';
import { Clock, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import PremiumCTA from './PremiumCTA';

interface Step1Props {
  onGenerate: (params: Partial<Outing>) => void;
  isLoading: boolean;
  onUpgrade: () => void;
}

const Step1Create: React.FC<Step1Props> = ({ onGenerate, isLoading, onUpgrade }) => {
  const [vibe, setVibe] = useState<Vibe>(Vibe.COZY);
  const [budget, setBudget] = useState<BudgetLevel>(BudgetLevel.MODERATE);
  const [locationMode, setLocationMode] = useState<LocationMode>(LocationMode.MINE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("");

  const handleGenerate = () => {
    onGenerate({ 
      vibe, 
      budget_level: budget, 
      location_mode: locationMode, 
      date,
      start_datetime: startTime, 
      end_datetime: endTime || undefined,
      alcohol_pref: AlcoholPref.NEUTRAL 
    });
  };

  return (
    <div className="py-8 space-y-12">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
          <Sparkles size={28} />
        </div>
        <h2 className="text-4xl font-serif text-white tracking-tight leading-tight">Design your night</h2>
        <p className="text-slate-500 text-sm font-medium">Configure your perfect rendezvous below</p>
      </div>
      
      <div className="space-y-10">
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">When</h3>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">Select Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500/30 transition-all appearance-none"
                    style={{ colorScheme: 'dark' }}
                  />
                  <CalendarIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">Start Time</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500/30 transition-all"
                  />
                  <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">End Time (Optional)</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500/30 transition-all"
                  />
                  <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Rendezvous Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(LocationMode).map((mode) => (
              <button
                key={mode}
                onClick={() => setLocationMode(mode)}
                className={`py-4 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  locationMode === mode 
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                  : 'bg-white/5 border-white/5 text-slate-500'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Select Vibe</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(Vibe).map((v) => (
              <button
                key={v}
                onClick={() => setVibe(v)}
                className={`py-3 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  vibe === v 
                  ? 'bg-white text-[#121212] border-white shadow-xl shadow-white/10' 
                  : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Investment Level</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setBudget(lvl as any)}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${
                  budget === lvl 
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                  : 'bg-white/5 border-white/5 text-slate-600'
                }`}
              >
                {"$".repeat(lvl)}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-6">
          <PremiumCTA onUpgrade={onUpgrade} />
        </section>
      </div>

      <div className="pt-6">
        <TactileButton
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-sm tracking-[0.2em] shadow-2xl shadow-indigo-500/20 disabled:opacity-20 active:bg-indigo-700 transition-colors"
        >
          {isLoading ? "CALCULATING..." : "BUILD ITINERARY"}
        </TactileButton>
      </div>
    </div>
  );
};

export default Step1Create;
