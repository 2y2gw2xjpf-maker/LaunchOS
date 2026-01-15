import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Rocket, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Was tun?', href: '/whats-next' },
    { name: 'Bewertung', href: '/valuation' },
    { name: 'Methodik', href: '/about' },
  ];

  const isActive = (href: string) => location.pathname.startsWith(href);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 bg-cream/80 backdrop-blur-lg border-b border-brand-100',
        className
      )}
    >
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-glow-brand">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">LaunchOS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-brand-700'
                    : 'text-charcoal/60 hover:text-brand-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/app/settings"
              className="p-2 rounded-lg text-charcoal/60 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              title="Einstellungen"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link to="/tier-selection">
              <Button variant="primary" size="sm">Jetzt starten</Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-brand-700 hover:bg-brand-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-cream border-t border-brand-100"
      >
        <div className="container-wide py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block px-4 py-3 rounded-xl font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-charcoal/60 hover:bg-brand-50 hover:text-brand-700'
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-brand-100">
            <Link to="/tier-selection" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Jetzt starten
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </header>
  );
};
