import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState<VerificationStatus>('pending');
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string>('');
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Check for verification token in URL
  React.useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
    }

    // If we have verification parameters, Supabase handles this automatically
    // via the auth callback, so we check for success/error states
    if (type === 'signup' || type === 'email_change') {
      setStatus('verifying');
      // The actual verification happens in AuthCallback component
      // This page is shown before/after that process
    }

    // Check if user is already verified
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setStatus('success');
      }
    };

    checkSession();
  }, [searchParams]);

  // Handle resend cooldown
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) throw resendError;

      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      setError((err as Error).message);
    }
  };

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
          {/* Pending State */}
          {status === 'pending' && (
            <>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-purple-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                Überprüfe deine E-Mail
              </h1>

              <p className="text-slate-400 text-center mb-6">
                Wir haben dir eine Bestätigungs-E-Mail gesendet
                {email && (
                  <span className="block text-white font-medium mt-2">{email}</span>
                )}
              </p>

              <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-white mb-2">Nächste Schritte:</h3>
                <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                  <li>Öffne dein E-Mail-Postfach</li>
                  <li>Klicke auf den Bestätigungslink in der E-Mail</li>
                  <li>Du wirst automatisch eingeloggt</li>
                </ol>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-500 mb-3">
                  Keine E-Mail erhalten?
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || !email}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Erneut senden (${resendCooldown}s)` : 'E-Mail erneut senden'}
                </button>
              </div>
            </>
          )}

          {/* Verifying State */}
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                E-Mail wird verifiziert...
              </h1>

              <p className="text-slate-400 text-center">
                Bitte warte einen Moment.
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                E-Mail bestätigt!
              </h1>

              <p className="text-slate-400 text-center mb-6">
                Deine E-Mail-Adresse wurde erfolgreich verifiziert.
                Du kannst jetzt alle Features von LaunchOS nutzen.
              </p>

              <Link
                to="/app"
                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg text-center transition-all"
              >
                Weiter zum Dashboard
              </Link>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-4">
                Verifizierung fehlgeschlagen
              </h1>

              <p className="text-slate-400 text-center mb-6">
                {error || 'Der Bestätigungslink ist ungültig oder abgelaufen.'}
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || !email}
                  className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Neue E-Mail senden
                </button>

                <Link
                  to="/login"
                  className="block w-full py-3 px-4 border border-slate-600 hover:border-slate-500 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Zurück zum Login
                </Link>
              </div>
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
