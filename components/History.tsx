
import React from 'react';
import { Outing } from '../types';
import { Clock, ChevronRight, Calendar } from 'lucide-react';

interface HistoryProps {
  history: Outing[];
  onSelect: (outing: Outing) => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="py-32 text-center space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-600 border border-white/5">
          <Calendar size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-white">No history yet</h3>
          <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Your planned outings will appear here for quick access later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-4">
      {history.map((outing) => (
        <button
          key={outing.id}
          onClick={() => onSelect(outing)}
          className="w-full text-left bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all group relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                <Calendar size={12} />
                {new Date(outing.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
              <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                {outing.vibe}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors line-clamp-1">
                {outing.slots[0]?.venue.name || "Untitled Outing"}
              </h4>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={12} />
                {/* Fix: Property 'start_datetime' does not exist on type 'Outing'. Did you mean 'start_time'? */}
                <span className="text-[10px] font-medium uppercase tracking-widest">{outing.start_time} Start</span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 pt-2 border-t border-white/5">
              {outing.slots.map((s, i) => (
                /* Fix: Property 'place_id' does not exist on type 'Venue'. Using 'id' instead. */
                <React.Fragment key={`${s.venue.id}-${i}`}>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                    {s.venue.name}
                  </span>
                  {i < outing.slots.length - 1 && (
                    <ChevronRight size={10} className="text-slate-700" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-4 transition-all text-indigo-400">
            <ChevronRight size={24} />
          </div>
        </button>
      ))}
    </div>
  );
};

export default History;
