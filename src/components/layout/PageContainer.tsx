import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useStore } from '@/store';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withSidebar?: boolean;
  withHeader?: boolean;
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full';
}

export const PageContainer = ({
  children,
  className,
  withSidebar = false,
  withHeader = true,
  maxWidth = 'default',
}: PageContainerProps) => {
  const { sidebarOpen } = useStore();

  const maxWidthClasses = {
    narrow: 'max-w-2xl',
    default: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'min-h-screen bg-cream',
        withHeader && 'pt-16 md:pt-20',
        withSidebar && (sidebarOpen ? 'md:pl-[280px]' : 'md:pl-20'),
        'pb-20 md:pb-0',
        'transition-all duration-300'
      )}
    >
      <div
        className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12',
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {children}
      </div>
    </motion.main>
  );
};
