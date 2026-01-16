import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'left' | 'center';
  className?: string;
  children?: React.ReactNode;
}

export const SectionHeader = ({
  title,
  subtitle,
  badge,
  align = 'left',
  className,
  children,
}: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'mb-12',
        align === 'center' && 'text-center',
        className
      )}
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
          {badge}
        </span>
      )}
      <h2 className="font-display text-display-sm md:text-display-md text-text-primary mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'text-lg text-text-secondary',
          align === 'center' && 'max-w-2xl mx-auto'
        )}>
          {subtitle}
        </p>
      )}
      {children}
    </motion.div>
  );
};
