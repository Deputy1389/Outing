
import React from 'react';
import { motion } from 'framer-motion';

const Mascot: React.FC = () => {
  return (
    <div className="flex justify-center py-6">
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 relative"
      >
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
        <svg className="w-10 h-10 text-indigo-400 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </motion.div>
    </div>
  );
};

export default Mascot;
