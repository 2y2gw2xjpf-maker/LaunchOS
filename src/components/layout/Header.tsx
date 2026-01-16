import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/components/auth';

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Different navigation for landing vs app
  const isLandingPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/pricing';

  // Landing page navigation (public)
  const landingNavigation = [
    { name: 'Features', href: '/#features' },
    { name: 'Preise', href: '/#pricing' },
    { name: 'Methodik', href: '/about' },
  ];

  // App navigation (after login)
  const appNavigation = [
    { name: 'Was tun?', href: '/whats-next' },
    { name: 'Bewertung', href: '/valuation' },
    { name: 'Methodik', href: '/about' },
  ];

  const navigation = (isLandingPage && !user) ? landingNavigation : appNavigation;

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return location.pathname.startsWith(href);
  };

  // Scroll to top on navigation
  const handleNavigation = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      // Handle anchor links on landing page
      const elementId = href.replace('/#', '');
      if (location.pathname === '/') {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate(href);
      window.scrollTo(0, 0);
    }
  };

  // Handle CTA click - go to login if not authenticated
  const handleCTAClick = () => {
    setMobileMenuOpen(false);
    if (user) {
      navigate('/tier-selection');
    } else {
      navigate('/login');
    }
    window.scrollTo(0, 0);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-purple-100/50',
        className
      )}
    >
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-purple-600'
                    : 'text-text-secondary hover:text-purple-600'
                )}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/app/settings"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm font-medium text-text-secondary hover:text-purple-600 transition-colors"
                >
                  Einstellungen
                </Link>
                <button onClick={handleCTAClick} className="btn-primary text-base px-6 py-3">
                  <span>Zur App</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm font-medium text-text-secondary hover:text-purple-600 transition-colors"
                >
                  Anmelden
                </Link>
                <button onClick={handleCTAClick} className="btn-primary text-base px-6 py-3">
                  <span>Kostenlos starten</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-purple-600 hover:bg-purple-50"
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
        className="md:hidden overflow-hidden bg-white/90 backdrop-blur-lg border-t border-purple-100/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'block w-full text-left px-4 py-3 rounded-xl font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-text-secondary hover:bg-purple-50 hover:text-purple-600'
              )}
            >
              {item.name}
            </button>
          ))}
          <div className="pt-4 border-t border-purple-100">
            <button onClick={handleCTAClick} className="btn-primary w-full">
              <span>{user ? 'Zur App' : 'Kostenlos starten'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </header>
  );
};
