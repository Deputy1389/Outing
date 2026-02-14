
import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import { Outing, ItinerarySlot } from '../types';
import { swapSlot, generateAdditionalSlot } from '../services/gemini';
import ItineraryCard from './ItineraryCard';
import TactileButton from './TactileButton';

interface Step2Props {
  outing: Outing;
  setOuting: (outing: Outing) => void;
  onFinalize: () => void;
}

const Step2Itinerary: React.FC<Step2Props> = ({ outing, setOuting, onFinalize }) => {
  const [swappingId, setSwappingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAction = async (slotIndex: number, action: 'keep' | 'swap' | 'block' | 'remove' | 'time', payload?: any) => {
    if (action === 'remove') {
      const remainingSlots = outing.slots
        .filter(s => s.slot_index !== slotIndex)
        .map((s, idx) => ({ ...s, slot_index: idx + 1 }));
      setOuting({ ...outing, slots: remainingSlots });
      return;
    }

    if (action === 'time') {
      const newSlots = outing.slots.map(s => 
        s.slot_index === slotIndex 
          ? { ...s, ...payload } 
          : s
      );
      setOuting({ ...outing, slots: newSlots });
      return;
    }

    if (action === 'swap') {
      setSwappingId(slotIndex);
      try {
        const newVenue = await swapSlot(outing, slotIndex, "Preference shift");
        const newSlots = outing.slots.map(s => 
          s.slot_index === slotIndex 
            ? { ...s, venue: newVenue, status: 'swapped' as const } 
            : s
        );
        setOuting({ ...outing, slots: newSlots });
      } catch (err) {
        console.error(err);
      } finally {
        setSwappingId(null);
      }
    } else {
      const newSlots = outing.slots.map(s => 
        s.slot_index === slotIndex 
          ? { ...s, status: (action === 'keep' ? 'kept' : 'blocked') as any } 
          : s
      );
      setOuting({ ...outing, slots: newSlots });
    }
  };

  const handleAddStop = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const nextIndex = outing.slots.length + 1;
      const newSlot = await generateAdditionalSlot(outing, nextIndex);
      setOuting({ ...outing, slots: [...outing.slots, newSlot].sort((a,b) => a.slot_index - b.slot_index) });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const onReorder = (newSlots: ItinerarySlot[]) => {
    const reindexed = newSlots.map((s, idx) => ({ ...s, slot_index: idx + 1 }));
    setOuting({ ...outing, slots: reindexed });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="py-6 space-y-10"
    >
      <div className="space-y-3">
        <h2 className="text-2xl font-serif text-white leading-tight">Refine your plan</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            <Calendar size={12} className="text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
              {formatDate(outing.date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {outing.weather_snapshot?.temp}°F • {outing.weather_snapshot?.condition}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12 pb-10">
        <Reorder.Group 
          axis="y" 
          values={outing.slots} 
          onReorder={onReorder}
          className="space-y-12"
        >
          <AnimatePresence mode="popLayout">
            {outing.slots.map((slot) => (
              <ItineraryCard 
                key={slot.venue.place_id} 
                slot={slot} 
                onAction={handleAction}
                isSwapping={swappingId === slot.slot_index}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <TactileButton
          onClick={handleAddStop}
          disabled={isAdding}
          className={`w-full py-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-indigo-500/30 transition-all ${isAdding ? 'liquid-glass' : ''}`}
        >
          {isAdding ? (
            <div className="flex flex-col items-center gap-2">
               <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               >
                 <Plus size={24} className="text-indigo-400" />
               </motion.div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Finding new stop...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <Plus size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Add another stop</span>
            </>
          )}
        </TactileButton>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-50">
        <TactileButton
          onClick={onFinalize}
          disabled={outing.slots.length === 0}
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-sm tracking-widest shadow-2xl shadow-indigo-500/20 active:bg-indigo-700 transition-colors disabled:opacity-20"
        >
          CONFIRM {outing.slots.length} STOPS
        </TactileButton>
      </div>
    </motion.div>
  );
};

export default Step2Itinerary;
