import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth';
import { cn } from '@/lib/utils/cn';

// Apple Icon Component
const AppleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, signInWithApple, user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || '/app';

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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
        await signIn(email, password, rememberMe);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(translateError(message));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setError(null);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      setError(translateError(message));
    }
  };

  // Demo Mode
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Demo Modus</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Du kannst LaunchOS im Demo-Modus testen ohne dich anzumelden.
          </p>
          <Link
            to="/tier-selection"
            className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/25"
          >
            Demo starten
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link to="/" className="block mt-6 text-gray-500 hover:text-gray-700 text-sm">
            Zurück zur Startseite
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600" />

        {/* Decorative Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Floating Blobs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-2xl font-bold text-white">LaunchOS</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Dein Operating System
              <br />
              <span className="text-pink-200">für den Launch</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-purple-100 leading-relaxed mb-10 max-w-md">
              Finde heraus, was deine Idee wirklich wert ist und was du als nächstes konkret tun solltest.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                'Startup-Bewertung in 5 Minuten',
                'Personalisierte Roadmap',
                'KI-gestützte Empfehlungen',
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🚀</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LaunchOS</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Konto erstellen' : 'Willkommen zurück'}
            </h2>
            <p className="text-gray-600">
              {isSignUp
                ? 'Starte deine Startup-Journey'
                : 'Melde dich an um fortzufahren'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthSignIn('apple')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-black hover:bg-gray-900 text-white rounded-2xl transition-colors font-medium"
              >
                <AppleIcon className="w-5 h-5" />
                <span>Mit Apple fortfahren</span>
              </button>

              <button
                onClick={() => handleOAuthSignIn('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-2xl transition-colors font-medium text-gray-700"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Mit Google fortfahren</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-400 uppercase tracking-wider">
                  Oder mit E-Mail
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (only for signup) */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="max@startup.de"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Passwort
                  </label>
                  {!isSignUp && (
                    <Link
                      to="/auth/reset-password"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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
                    className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox (only for login) */}
              {!isSignUp && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                      rememberMe
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-white border-gray-300 hover:border-purple-400'
                    )}
                  >
                    {rememberMe && (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                  <label
                    onClick={() => setRememberMe(!rememberMe)}
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Angemeldet bleiben
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all mt-6',
                  loading
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-500/25'
                )}
              >
                <span className="text-white">
                  {loading ? 'Laden...' : isSignUp ? 'Konto erstellen' : 'Anmelden'}
                </span>
                {!loading && <ArrowRight className="w-5 h-5 text-white" />}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <p className="mt-6 text-center text-gray-600">
              {isSignUp ? 'Bereits ein Konto?' : 'Noch kein Konto?'}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                {isSignUp ? 'Anmelden' : 'Registrieren'}
              </button>
            </p>
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Zurück zur Startseite
            </Link>
          </div>
        </motion.div>
      </div>
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
