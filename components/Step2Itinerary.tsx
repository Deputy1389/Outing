
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { Outing, ItinerarySlot, Venue } from '../types';
import { swapSlotDeterministic } from '../services/planner';
import ItineraryCard from './ItineraryCard';
import TactileButton from './TactileButton';

interface Step2Props {
  outing: Outing;
  setOuting: (outing: Outing) => void;
  onFinalize: () => void;
}

const SWAP_REASONS = [
  "Too far",
  "Too expensive",
  "Too loud",
  "Not my vibe",
  "Already been",
  "Dietary mismatch"
];

const Step2Itinerary: React.FC<Step2Props> = ({ outing, setOuting, onFinalize }) => {
  const [swappingId, setSwappingId] = useState<number | null>(null);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [pendingSwapSlot, setPendingSwapSlot] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('blocked_venues');
    if (saved) setBlockedIds(JSON.parse(saved));
  }, []);

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
        s.slot_index === slotIndex ? { ...s, ...payload } : s
      );
      setOuting({ ...outing, slots: newSlots });
      return;
    }

    if (action === 'swap') {
      setPendingSwapSlot(slotIndex);
    } 
    
    if (action === 'block') {
      const venueToBlock = outing.slots.find(s => s.slot_index === slotIndex)?.venue.id;
      if (venueToBlock) {
        const nextBlocked = [...blockedIds, venueToBlock];
        setBlockedIds(nextBlocked);
        localStorage.setItem('blocked_venues', JSON.stringify(nextBlocked));
        // Auto swap since it's blocked. Added await because swapSlotDeterministic is async.
        const newVenue = await swapSlotDeterministic(outing, slotIndex, nextBlocked);
        const newSlots = outing.slots.map(s => 
          s.slot_index === slotIndex ? { ...s, venue: newVenue, status: 'blocked' as const } : s
        );
        setOuting({ ...outing, slots: newSlots });
      }
    }

    if (action === 'keep') {
      const newSlots = outing.slots.map(s => 
        s.slot_index === slotIndex ? { ...s, status: 'kept' as any } : s
      );
      setOuting({ ...outing, slots: newSlots });
    }
  };

  // Made executeSwap async to handle await for swapSlotDeterministic
  const executeSwap = async (reason: string) => {
    if (pendingSwapSlot === null) return;
    
    setSwappingId(pendingSwapSlot);
    // Added await because swapSlotDeterministic is async.
    const newVenue = await swapSlotDeterministic(outing, pendingSwapSlot, blockedIds);
    const newSlots = outing.slots.map(s => 
      s.slot_index === pendingSwapSlot ? { ...s, venue: newVenue, status: 'swapped' as const } : s
    );
    setOuting({ ...outing, slots: newSlots });
    setSwappingId(null);
    setPendingSwapSlot(null);
    
    // In a real app, we'd log the 'reason' to improve the deterministic engine.
    console.debug(`Swapped slot ${pendingSwapSlot} because: ${reason}`);
  };

  const onReorder = (newSlots: ItinerarySlot[]) => {
    const reindexed = newSlots.map((s, idx) => ({ ...s, slot_index: idx + 1 }));
    setOuting({ ...outing, slots: reindexed });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', weekday: 'short'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-6 space-y-8"
    >
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white">Review Itinerary</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <Calendar size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {formatDate(outing.date)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {outing.weather_snapshot?.temp}°F • {outing.weather_snapshot?.condition}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-10 pb-20">
        <Reorder.Group 
          axis="y" 
          values={outing.slots} 
          onReorder={onReorder}
          className="space-y-10"
        >
          <AnimatePresence mode="popLayout">
            {outing.slots.map((slot) => (
              <ItineraryCard 
                key={slot.venue.id} 
                slot={slot} 
                onAction={handleAction}
                isSwapping={swappingId === slot.slot_index}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      <AnimatePresence>
        {pendingSwapSlot !== null && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-6 pb-12 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-[#1A1A1A] rounded-3xl border border-white/10 p-6 space-y-6 shadow-2xl"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Why the swap?</h3>
                <p className="text-xs text-slate-500">Your feedback helps tune the suggestions.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SWAP_REASONS.map(reason => (
                  <button 
                    key={reason}
                    onClick={() => executeSwap(reason)}
                    className="py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all text-left"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPendingSwapSlot(null)}
                className="w-full py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400"
              >
                Never mind
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 left-6 right-6 z-50">
        <TactileButton
          onClick={onFinalize}
          disabled={outing.slots.length === 0}
          className="w-full py-4 bg-white text-black rounded-xl font-bold text-xs tracking-widest shadow-2xl transition-all disabled:opacity-20"
        >
          CONFIRM {outing.slots.length} STOPS
        </TactileButton>
      </div>
    </motion.div>
  );
};

export default Step2Itinerary;
