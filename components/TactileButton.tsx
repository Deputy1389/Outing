
import React from 'react';
import { motion } from 'framer-motion';

interface TactileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const TactileButton: React.FC<TactileButtonProps> = ({ children, onClick, className, disabled }) => {
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      /* Fix: 'onPressStart' does not exist on HTMLMotionProps<"button">. Using onPointerDown instead for haptic trigger. */
      onPointerDown={triggerHaptic}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export default TactileButton;
