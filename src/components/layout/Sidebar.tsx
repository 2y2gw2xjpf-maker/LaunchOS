import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Compass,
  Calculator,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Settings,
  FileText,
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
      name: 'Was tun?',
      href: '/whats-next',
      icon: Compass,
      description: 'Route & Action Plan',
    },
    {
      name: 'Bewertung',
      href: '/valuation',
      icon: Calculator,
      description: '5 Methoden',
    },
  ];

  const secondaryNavigation = [
    { name: 'Methodik', href: '/about/methodology', icon: FileText },
    { name: 'Hilfe', href: '/about/help', icon: HelpCircle },
  ];

  const isInApp = location.pathname.startsWith('/whats-next') ||
                  location.pathname.startsWith('/valuation');

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
        <div className="flex-1 py-6 px-3 overflow-y-auto">
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

          <div className="my-6 h-px bg-navy/10" />

          <nav className="space-y-2">
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    isActive
                      ? 'bg-navy/5 text-navy'
                      : 'text-charcoal/50 hover:bg-navy/5 hover:text-navy'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-navy/5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-charcoal/50 hover:bg-navy/5 hover:text-navy transition-colors"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Einklappen</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-navy/10 z-30">
        <div className="flex items-center justify-around py-2">
          {mainNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                  isActive ? 'text-navy' : 'text-charcoal/40'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </NavLink>
            );
          })}
          <NavLink
            to="/about"
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
              location.pathname.startsWith('/about') ? 'text-navy' : 'text-charcoal/40'
            )}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Mehr</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};
