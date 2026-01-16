import * as React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Users, Sparkles, Bell } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const WaitlistSection = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const waitlist = JSON.parse(localStorage.getItem('launchos_waitlist') || '[]');
      if (!waitlist.includes(email)) {
        waitlist.push(email);
        localStorage.setItem('launchos_waitlist', JSON.stringify(waitlist));
      }
      setSubmitted(true);
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium rounded-full mb-4">
              <Bell className="w-4 h-4 mr-2 text-purple-600" />
              Early Access
            </span>
            <h2 className="font-display text-display-sm md:text-display-md text-text-primary mb-4">
              Sei unter den Ersten
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Sichere dir exklusiven Zugang zur Premium-Version von LaunchOS.
              Early Adopters erhalten <strong className="text-purple-600">50% Rabatt</strong> auf alle Pläne.
            </p>
          </div>

          {/* Benefits - mit Lovable Farben */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-soft border border-purple-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">50% Rabatt</h3>
              <p className="text-sm text-text-secondary">
                Exklusiver Founder-Rabatt für alle Pläne - für immer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-soft border border-pink-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Direkte Linie</h3>
              <p className="text-sm text-text-secondary">
                Direkter Kontakt zum Gründer-Team für Feedback & Support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-soft border border-purple-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Früher Zugang</h3>
              <p className="text-sm text-text-secondary">
                Erhalte neue Features vor allen anderen.
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Du bist auf der Liste!
                </h3>
                <p className="text-text-secondary">
                  Wir melden uns, sobald LaunchOS Premium verfügbar ist.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.de"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-text-primary placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all whitespace-nowrap text-white',
                    loading
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40'
                  )}
                >
                  <span>
                    {loading ? 'Wird eingetragen...' : 'Auf die Warteliste'}
                  </span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}

            {!submitted && (
              <p className="mt-4 text-xs text-center text-text-muted">
                Kein Spam, versprochen. Nur wichtige Updates.
              </p>
            )}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-text-muted">
              Bereits <strong className="text-purple-600">127+ Gründer</strong> auf der Warteliste
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistSection;
