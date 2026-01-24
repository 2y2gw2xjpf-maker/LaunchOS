import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitCompare,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useStore } from '@/store';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const { sidebarOpen, setSidebarOpen } = useStore();
  const location = useLocation();

  const mainNavigation = [
    {
      name: 'Founders Journey',
      href: '/journey',
      icon: Map,
      description: 'Dein Fortschritt',
    },
    {
      name: 'Was tun?',
      href: '/whats-next',
      icon: Compass,
      description: 'Route & Action Plan',
    },
    {
      name: 'Vergleich',
      href: '/compare',
      icon: GitCompare,
      description: 'Szenarien vergleichen',
    },
    {
      name: 'Bewertung',
      href: '/valuation',
      icon: Calculator,
      description: '5 Methoden',
    },
    {
      name: 'Methodik',
      href: '/about/methodology',
      icon: FileText,
      description: 'So funktioniert es',
    },
  ];

  const isInApp = location.pathname.startsWith('/whats-next') ||
                  location.pathname.startsWith('/valuation') ||
                  location.pathname.startsWith('/compare') ||
                  location.pathname.startsWith('/journey') ||
                  location.pathname.startsWith('/settings') ||
                  location.pathname.startsWith('/app/');

  if (!isInApp) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-20 bottom-0 bg-white border-r border-navy/5 z-30',
          className
        )}
      >
        {/* Collapse Toggle Button at Top */}
        <div className="px-3 pt-4 pb-2 flex justify-end">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center',
              'bg-gradient-to-r from-purple-600 to-pink-600',
              'hover:shadow-lg hover:shadow-purple-500/30 transition-all',
              'active:scale-95'
            )}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-white" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        <div className="flex-1 py-2 px-3 overflow-y-auto">
          <nav className="space-y-2">
            {mainNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-navy text-white'
                      : 'text-charcoal/60 hover:bg-navy/5 hover:text-navy'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="whitespace-nowrap">
                          <div className="font-medium">{item.name}</div>
                          <div
                            className={cn(
                              'text-xs',
                              isActive ? 'text-white/60' : 'text-charcoal/40'
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-navy/10 z-30">
        <div className="flex items-center justify-around py-2">
          {mainNavigation.slice(0, 4).map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
                  isActive ? 'text-navy' : 'text-charcoal/40'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
              </NavLink>
            );
          })}
          <NavLink
            to="/about/methodology"
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
              location.pathname.startsWith('/about') ? 'text-navy' : 'text-charcoal/40'
            )}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">Methodik</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};
