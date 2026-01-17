import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Settings, CreditCard, LogOut, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/components/auth';
import { VentureSwitcher } from '@/components/ventures/VentureSwitcher';
import { VentureModal } from '@/components/ventures/VentureModal';
import { useOptionalVentureContext } from '@/contexts/VentureContext';
import type { Venture } from '@/contexts/VentureContext';

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [ventureModalOpen, setVentureModalOpen] = React.useState(false);
  const [editingVenture, setEditingVenture] = React.useState<Venture | null>(null);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, profile, signOut } = useAuth();
  const ventureContext = useOptionalVentureContext();

  // Check if we're on a landing/public page FIRST
  const isLandingPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/pricing' || location.pathname === '/contact';

  // In dev mode with SKIP_AUTH, treat as logged in for UI purposes - BUT ONLY on app pages, NOT on landing page
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
  const user = authUser || (skipAuth && !isLandingPage ? { email: 'dev@launchos.de' } : null);

  // Close profile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Different navigation for landing vs app (isLandingPage already defined above)

  // Landing page navigation (public) - nur Features, Preise, Kontakt
  const landingNavigation = [
    { name: 'Features', href: '/#features' },
    { name: 'Preise', href: '/#pricing' },
    { name: 'Kontakt', href: '/contact' },
  ];

  // App navigation (after login)
  const appNavigation = [
    { name: 'Was tun?', href: '/whats-next' },
    { name: 'Bewertung', href: '/valuation' },
    { name: 'Methodik', href: '/about/methodology' },
    { name: 'Kontakt', href: '/contact' },
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

  // Handle venture creation
  const handleCreateVenture = () => {
    setEditingVenture(null);
    setVentureModalOpen(true);
  };

  // Handle venture management/edit
  const handleManageVenture = (ventureId: string) => {
    const venture = ventureContext?.ventures.find(v => v.id === ventureId);
    if (venture) {
      setEditingVenture(venture);
      setVentureModalOpen(true);
    }
  };

  // Close venture modal
  const handleCloseVentureModal = () => {
    setVentureModalOpen(false);
    setEditingVenture(null);
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
            {/* Venture Switcher - nur wenn eingeloggt und nicht auf Landing */}
            {user && !isLandingPage && (
              <VentureSwitcher
                onCreateNew={handleCreateVenture}
                onManage={handleManageVenture}
              />
            )}

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                    "hover:bg-purple-50",
                    profileMenuOpen && "bg-purple-50"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-charcoal max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-purple-50">
                        <p className="text-sm font-semibold text-charcoal truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-charcoal/60 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/settings"
                          onClick={() => { setProfileMenuOpen(false); window.scrollTo(0, 0); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-purple-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-purple-500" />
                          Einstellungen
                        </Link>
                        <Link
                          to="/settings/billing"
                          onClick={() => { setProfileMenuOpen(false); window.scrollTo(0, 0); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-purple-50 transition-colors"
                        >
                          <CreditCard className="w-4 h-4 text-purple-500" />
                          Abrechnung
                        </Link>
                      </div>

                      <div className="border-t border-purple-50 py-1">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Abmelden
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

          {/* Mobile: User Menu wenn eingeloggt */}
          {user ? (
            <div className="pt-4 border-t border-purple-100 space-y-2">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-charcoal/60 truncate">{user.email}</p>
                </div>
              </div>

              {/* Settings Links */}
              <Link
                to="/settings"
                onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal hover:bg-purple-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Einstellungen</span>
              </Link>
              <Link
                to="/settings/billing"
                onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal hover:bg-purple-50 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Abrechnung</span>
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Abmelden</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-purple-100 space-y-2">
              <Link
                to="/login"
                onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                className="block w-full text-center px-4 py-3 rounded-xl font-medium text-purple-600 hover:bg-purple-50 transition-colors"
              >
                Anmelden
              </Link>
              <button onClick={handleCTAClick} className="btn-primary w-full">
                <span>Kostenlos starten</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Venture Modal */}
      <VentureModal
        isOpen={ventureModalOpen}
        onClose={handleCloseVentureModal}
        editVenture={editingVenture}
      />
    </header>
  );
};
