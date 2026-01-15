import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chrome, Github, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { cn } from '@/lib/utils/cn';

export function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, signInWithGitHub, user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination
  const from = (location.state as { from?: Location })?.from?.pathname || '/app';

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        setSuccess('Registrierung erfolgreich! Bitte überprüfe deine E-Mail für die Bestätigung.');
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(translateError(message));
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGitHub();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(translateError(message));
    }
  };

  // Show demo mode notice if not configured
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-cream-50 to-accent-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 text-center"
        >
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Demo Modus</h1>
          <p className="text-charcoal/60 mb-6">
            Supabase ist nicht konfiguriert. Du kannst die App im Demo-Modus nutzen.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors"
          >
            Demo starten
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-cream-50 to-accent-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-brand">
              <span className="text-2xl">🚀</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-navy">
            {isSignUp ? 'Konto erstellen' : 'Willkommen zurück'}
          </h1>
          <p className="text-charcoal/60 mt-1">
            {isSignUp
              ? 'Starte deine Startup-Journey mit LaunchOS'
              : 'Melde dich an um fortzufahren'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-sage/10 border border-sage/30 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-sage shrink-0 mt-0.5" />
              <p className="text-sm text-sage-700">{success}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-navy/10 rounded-xl hover:bg-navy/5 transition-colors"
            >
              <Chrome className="w-5 h-5 text-[#4285F4]" />
              <span className="text-sm font-medium text-navy">Mit Google fortfahren</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('github')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-navy/10 rounded-xl hover:bg-navy/5 transition-colors"
            >
              <Github className="w-5 h-5 text-navy" />
              <span className="text-sm font-medium text-navy">Mit GitHub fortfahren</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-charcoal/50 uppercase">
                Oder mit E-Mail
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (only for signup) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="w-full px-4 py-3 bg-navy/5 border border-transparent rounded-xl focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@startup.de"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-navy/5 border border-transparent rounded-xl focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-navy">
                  Passwort
                </label>
                {!isSignUp && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Vergessen?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Min. 8 Zeichen' : '••••••••'}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 bg-navy/5 border border-transparent rounded-xl focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/60"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                loading
                  ? 'bg-brand-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-glow-brand'
              )}
            >
              <span className="text-white">
                {loading
                  ? 'Laden...'
                  : isSignUp
                  ? 'Registrieren'
                  : 'Anmelden'}
              </span>
              {!loading && <ArrowRight className="w-4 h-4 text-white" />}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <p className="mt-6 text-center text-sm text-charcoal/60">
            {isSignUp ? 'Bereits ein Konto?' : 'Noch kein Konto?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-brand-600 hover:underline font-medium"
            >
              {isSignUp ? 'Anmelden' : 'Registrieren'}
            </button>
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-charcoal/50 hover:text-charcoal/70">
            Zurück zur Startseite
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== HELPERS ====================

function translateError(message: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Ungültige Anmeldedaten',
    'Email not confirmed': 'E-Mail nicht bestätigt. Bitte überprüfe dein Postfach.',
    'User already registered': 'Diese E-Mail ist bereits registriert',
    'Password should be at least 8 characters': 'Passwort muss mindestens 8 Zeichen haben',
    'Unable to validate email address: invalid format': 'Ungültiges E-Mail-Format',
    'Email rate limit exceeded': 'Zu viele Versuche. Bitte warte einen Moment.',
  };

  return translations[message] || message;
}

export default LoginPage;
