
import React from 'react';
import { Outing } from '../types';
import TactileButton from './TactileButton';

interface Step3Props {
  outing: Outing;
}

const Step3Final: React.FC<Step3Props> = ({ outing }) => {
  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Sharing is not supported on this browser.");
      return;
    }

    try {
      const shareData: ShareData = {
        title: 'Our Outing Plan',
        text: `I've planned our night! Here's our stops: ${outing.slots.map(s => s.venue.name).join(' -> ')}`,
      };

      // Only include the URL if it's a valid web URL (e.g., not a blob or local path)
      // which can cause "Invalid URL" errors in some frame/preview environments.
      if (window.location.href.startsWith('http')) {
        shareData.url = window.location.href;
      }

      await navigator.share(shareData);
    } catch (err) {
      // AbortError is common if the user simply cancels the share sheet
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <div className="py-10 text-center space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
           <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
           </svg>
        </div>
        <h2 className="text-3xl font-serif text-white">It's a date!</h2>
        <p className="text-slate-500 px-8 text-sm">Your plan is ready. Everything starts at {formatTime(outing.start_datetime)}.</p>
      </div>

      <div className="space-y-6 text-left pt-4">
        {outing.slots.map((slot, idx) => (
          <div key={`${slot.venue.place_id}-${idx}`} className="relative pl-10 border-l-2 border-white/5 ml-4 pb-8 last:pb-0">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
              </span>
              <h4 className="font-bold text-white text-lg">{slot.venue.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 italic">"{slot.venue.short_description}"</p>
              <div className="pt-2">
                <a 
                  href={slot.venue.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-10 flex gap-4">
        <TactileButton 
          onClick={() => window.print()}
          className="flex-1 py-4 border border-white/10 rounded-xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors"
        >
          Export PDF
        </TactileButton>
        <TactileButton 
          onClick={handleShare}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
        >
          Share Plan
        </TactileButton>
      </div>
    </div>
  );
};

export default Step3Final;
