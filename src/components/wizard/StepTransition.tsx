import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface StepTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'forward' | 'backward';
}

export const StepTransition = ({
  children,
  className,
  direction = 'forward',
}: StepTransitionProps) => {
  const variants = {
    initial: {
      opacity: 0,
      x: direction === 'forward' ? 50 : -50,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: direction === 'forward' ? -50 : 50,
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
