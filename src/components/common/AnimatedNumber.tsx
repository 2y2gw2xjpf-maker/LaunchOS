import * as React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}

export const AnimatedNumber = ({
  value,
  format = (v) => Math.round(v).toLocaleString('de-DE'),
  duration = 1,
  className,
}: AnimatedNumberProps) => {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) => format(current));

  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={cn('tabular-nums', className)}>{display}</motion.span>;
};
