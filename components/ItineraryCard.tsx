
import React, { useMemo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { MapPin, Star, CheckCircle2, RotateCw, Ban, ExternalLink, X, GripVertical, Clock, AlertTriangle } from 'lucide-react';
import { ItinerarySlot, Venue } from '../types';
import TactileButton from './TactileButton';

interface ItineraryCardProps {
  slot: ItinerarySlot;
  onAction: (slotIndex: number, action: 'keep' | 'swap' | 'block' | 'remove' | 'time', payload?: any) => void;
  isSwapping: boolean;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ slot, onAction, isSwapping }) => {
  const { venue, slot_index, status, start_time, end_time } = slot;
  const controls = useDragControls();

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const hasConflict = useMemo(() => {
    const start = timeToMinutes(start_time);
    const end = timeToMinutes(end_time);
    const open = timeToMinutes(venue.open_time);
    const close = timeToMinutes(venue.close_time);

    // Basic logic for hours (handles cases where close is after midnight by allowing close < open if needed, 
    // but for simplicity here we assume standard 24h day within a single date)
    if (close < open) {
      // Overnight venue (e.g., 20:00 - 02:00)
      return (start < open && start > close) || (end < open && end > close);
    }
    
    return start < open || end > close;
  }, [start_time, end_time, venue.open_time, venue.close_time]);

  const getPhaseTitle = (idx: number) => {
    return `Stop ${idx}`;
  };
  
  return (
    <Reorder.Item 
      value={slot}
      dragListener={false}
      dragControls={controls}
      className="relative w-full list-none"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-slate-400 transition-colors"
          >
            <GripVertical size={20} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
            status === 'kept' ? 'border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-indigo-500/30 text-indigo-400'
          }`}>
            {slot_index}
          </div>
          <h3 className="font-semibold text-slate-300 uppercase tracking-widest text-xs">{getPhaseTitle(slot_index)}</h3>
        </div>
        
        <TactileButton 
          onClick={() => onAction(slot_index, 'remove')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <X size={16} />
        </TactileButton>
      </div>

      <motion.div
        className={`bg-[#1E1E1E] rounded-3xl border shadow-2xl overflow-hidden relative transition-colors duration-500 ${
          hasConflict ? 'border-amber-500/40' : 'border-white/5'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={venue.place_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col"
          >
            {/* Venue Image */}
            <div className="h-44 relative overflow-hidden">
              <img 
                src={venue.imageUrl || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400`}
                className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
                alt={venue.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                {"$".repeat(venue.price_level)}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 -mt-8 relative z-10 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold text-white leading-tight">{venue.name}</h4>
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                    <Star size={12} className="text-indigo-400 fill-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-300">{venue.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <MapPin size={12} />
                  <span className="truncate">{venue.address}</span>
                </div>
              </div>

              {/* Time Inputs with Conflict Detection */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 py-2">
                  <div className={`bg-white/5 border rounded-xl px-3 py-2 flex items-center gap-2 transition-colors ${hasConflict ? 'border-amber-500/30' : 'border-white/5'}`}>
                    <Clock size={12} className="text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-600 uppercase">Arrival</span>
                      <input 
                        type="time" 
                        value={start_time}
                        onChange={(e) => onAction(slot_index, 'time', { start_time: e.target.value })}
                        className="bg-transparent text-xs font-bold text-slate-300 outline-none w-full"
                      />
                    </div>
                  </div>
                  <div className={`bg-white/5 border rounded-xl px-3 py-2 flex items-center gap-2 transition-colors ${hasConflict ? 'border-amber-500/30' : 'border-white/5'}`}>
                    <Clock size={12} className="text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-600 uppercase">Depart</span>
                      <input 
                        type="time" 
                        value={end_time}
                        onChange={(e) => onAction(slot_index, 'time', { end_time: e.target.value })}
                        className="bg-transparent text-xs font-bold text-slate-300 outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {hasConflict && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl"
                    >
                      <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-tighter">
                        Closed at this time (Open {venue.open_time} - {venue.close_time})
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-sm text-slate-400 font-light italic line-clamp-2">
                "{venue.short_description}"
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <TactileButton
                  onClick={() => onAction(slot_index, 'keep')}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
                    status === 'kept' 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
                      : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  <CheckCircle2 size={18} fill={status === 'kept' ? 'currentColor' : 'none'} />
                  <span className="text-[10px] font-bold">KEEP</span>
                </TactileButton>

                <TactileButton
                  onClick={() => onAction(slot_index, 'swap')}
                  disabled={isSwapping}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border bg-white/5 border-white/5 text-slate-500 hover:text-indigo-400 hover:border-indigo-400/30`}
                >
                  <RotateCw size={18} className={isSwapping ? 'animate-spin' : ''} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">SWAP</span>
                </TactileButton>

                <TactileButton
                  onClick={() => onAction(slot_index, 'block')}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border ${
                    status === 'blocked'
                      ? 'bg-rose-500/10 border-rose-500/50 text-rose-500'
                      : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  <Ban size={18} fill={status === 'blocked' ? 'currentColor' : 'none'} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">BLOCK</span>
                </TactileButton>
              </div>

              <a 
                href={venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-bold text-slate-500 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors tracking-widest"
              >
                OPEN IN MAPS <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  );
};

export default ItineraryCard;
