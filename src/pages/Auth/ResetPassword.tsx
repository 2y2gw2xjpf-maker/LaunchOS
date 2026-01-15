import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ResetStep = 'request' | 'reset' | 'success' | 'error';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = React.useState<ResetStep>('request');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [emailSent, setEmailSent] = React.useState(false);

  // Check if we have a reset token (user clicked link in email)
  React.useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');

    if (type === 'recovery' || accessToken) {
      setStep('reset');
    }
  }, [searchParams]);

  // Handle request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) throw resetError;

      setEmailSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setStep('success');

      // Redirect to app after 3 seconds
      setTimeout(() => {
        navigate('/app');
      }, 3000);
    } catch (err) {
      setError((err as Error).message);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Schwach', color: 'bg-red-500' };
    if (score <= 2) return { score, label: 'Mittel', color: 'bg-yellow-500' };
    if (score <= 3) return { score, label: 'Gut', color: 'bg-blue-500' };
    return { score, label: 'Stark', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Login
        </Link>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
          {/* Request Reset Step */}
          {step === 'request' && !emailSent && (
            <>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound className="w-8 h-8 text-purple-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                Passwort zurücksetzen
              </h1>

              <p className="text-slate-400 text-center mb-6">
                Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
              </p>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.de"
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    'Reset-Link senden'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Email Sent Confirmation */}
          {step === 'request' && emailSent && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                E-Mail gesendet!
              </h1>

              <p className="text-slate-400 text-center mb-6">
                Wir haben einen Reset-Link an <span className="text-white font-medium">{email}</span> gesendet.
                Bitte überprüfe auch deinen Spam-Ordner.
              </p>

              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full py-3 px-4 border border-slate-600 hover:border-slate-500 text-white font-semibold rounded-lg transition-colors"
              >
                Andere E-Mail verwenden
              </button>
            </>
          )}

          {/* Reset Password Step */}
          {step === 'reset' && (
            <>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound className="w-8 h-8 text-purple-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                Neues Passwort wählen
              </h1>

              <p className="text-slate-400 text-center mb-6">
                Wähle ein sicheres Passwort mit mindestens 8 Zeichen.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Neues Passwort
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded ${
                              level <= strength.score ? strength.color : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Stärke: <span className="text-white">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Passwort bestätigen
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwörter stimmen nicht überein</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword || password.length < 8}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    'Passwort speichern'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                Passwort geändert!
              </h1>

              <p className="text-slate-400 text-center mb-6">
                Dein Passwort wurde erfolgreich geändert.
                Du wirst automatisch weitergeleitet...
              </p>

              <Link
                to="/app"
                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg text-center transition-all"
              >
                Weiter zum Dashboard
              </Link>
            </>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                Etwas ist schiefgelaufen
              </h1>

              <p className="text-slate-400 text-center mb-6">
                {error || 'Der Reset-Link ist ungültig oder abgelaufen.'}
              </p>

              <Link
                to="/auth/reset-password"
                onClick={() => {
                  setStep('request');
                  setError(null);
                }}
                className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-center transition-colors"
              >
                Erneut versuchen
              </Link>
            </>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Probleme? Kontaktiere uns unter{' '}
          <a href="mailto:support@launchos.com" className="text-purple-400 hover:text-purple-300">
            support@launchos.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
