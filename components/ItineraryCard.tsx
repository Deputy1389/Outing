
import React from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { MapPin, Star, CheckCircle2, RotateCw, Ban, ExternalLink, X, GripVertical, Clock } from 'lucide-react';
import { ItinerarySlot } from '../types';
import TactileButton from './TactileButton';

interface ItineraryCardProps {
  slot: ItinerarySlot;
  onAction: (slotIndex: number, action: 'keep' | 'swap' | 'block' | 'remove' | 'time', payload?: any) => void;
  isSwapping: boolean;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ slot, onAction, isSwapping }) => {
  const { venue, slot_index, status, start_time, end_time } = slot;
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={slot}
      dragListener={false}
      dragControls={controls}
      className="relative w-full list-none"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-slate-400 transition-colors"
          >
            <GripVertical size={18} />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Stop {slot_index}</span>
        </div>
        <button 
          onClick={() => onAction(slot_index, 'remove')}
          className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="h-32 bg-slate-800 relative">
          <img 
            src={venue.imageUrl} 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
            alt={venue.name} 
          />
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-white border border-white/10">
            {"$".repeat(venue.priceLevel)}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-bold text-white">{venue.name}</h4>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <Star size={10} className="text-slate-400 fill-slate-400" /> {venue.rating}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium uppercase tracking-tight">
              {/* Fix: 'address' does not exist on type 'Venue'. Using neighborhood or category fallback. */}
              <MapPin size={10} /> {venue.neighborhood || venue.categories[0]}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg px-3 py-2 space-y-1 border border-white/5">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Arrival</span>
              <input 
                type="time" 
                value={start_time}
                onChange={(e) => onAction(slot_index, 'time', { start_time: e.target.value })}
                className="bg-transparent text-[11px] font-bold text-white outline-none w-full block"
              />
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 space-y-1 border border-white/5">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Depart</span>
              <input 
                type="time" 
                value={end_time}
                onChange={(e) => onAction(slot_index, 'time', { end_time: e.target.value })}
                className="bg-transparent text-[11px] font-bold text-white outline-none w-full block"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <TactileButton
              onClick={() => onAction(slot_index, 'keep')}
              className={`flex-1 py-3 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all ${
                status === 'kept' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500'
              }`}
            >
              Keep Stop
            </TactileButton>
            <TactileButton
              onClick={() => onAction(slot_index, 'swap')}
              disabled={isSwapping}
              className="flex-1 py-3 rounded-xl border bg-white/5 border-white/5 text-slate-500 text-[9px] font-bold uppercase tracking-widest hover:border-white/20"
            >
              {isSwapping ? 'Swapping...' : 'Swap'}
            </TactileButton>
            <TactileButton
              onClick={() => onAction(slot_index, 'block')}
              className="px-4 py-3 rounded-xl border bg-white/5 border-white/5 text-slate-500 hover:text-rose-400 hover:border-rose-400/20"
            >
              <Ban size={14} />
            </TactileButton>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};

export default ItineraryCard;
