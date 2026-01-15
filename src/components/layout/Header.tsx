import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Rocket } from 'lucide-react';
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
        'fixed top-0 left-0 right-0 z-40 bg-cream/80 backdrop-blur-lg border-b border-navy/5',
        className
      )}
    >
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
              <Rocket className="w-5 h-5 text-gold" />
            </div>
            <span className="font-display font-bold text-xl text-navy">LaunchOS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-navy'
                    : 'text-charcoal/60 hover:text-navy'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/tier-selection">
              <Button variant="gold" size="sm">Jetzt starten</Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-navy hover:bg-navy/5"
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
        className="md:hidden overflow-hidden bg-cream border-t border-navy/5"
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
                  ? 'bg-navy/5 text-navy'
                  : 'text-charcoal/60 hover:bg-navy/5 hover:text-navy'
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-navy/10">
            <Link to="/tier-selection" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" className="w-full">
                Jetzt starten
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </header>
  );
};
