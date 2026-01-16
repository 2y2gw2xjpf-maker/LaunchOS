import * as React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { cn } from '@/lib/utils/cn';

export const ContactPage = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate form submission - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store in localStorage for demo purposes
      const contacts = JSON.parse(localStorage.getItem('launchos_contacts') || '[]');
      contacts.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('launchos_contacts', JSON.stringify(contacts));

      setSubmitted(true);
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-Mail',
      value: 'hello@launchos.de',
      description: 'Schreib uns jederzeit',
    },
    {
      icon: Clock,
      title: 'Antwortzeit',
      value: '< 24 Stunden',
      description: 'Werktags',
    },
    {
      icon: MapPin,
      title: 'Standort',
      value: 'Berlin, Deutschland',
      description: '100% Remote-Team',
    },
  ];

  const subjects = [
    { value: '', label: 'Betreff wählen...' },
    { value: 'general', label: 'Allgemeine Anfrage' },
    { value: 'support', label: 'Technischer Support' },
    { value: 'feedback', label: 'Feedback & Vorschläge' },
    { value: 'partnership', label: 'Partnerschaft & Kooperation' },
    { value: 'press', label: 'Presse & Medien' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <Header />
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium rounded-full mb-4">
              <MessageSquare className="w-4 h-4 mr-2" />
              Kontakt
            </span>
            <h1 className="font-display text-display-sm md:text-display-md text-text-primary mb-4">
              Wir freuen uns auf deine Nachricht
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Hast du Fragen zu LaunchOS oder möchtest Feedback geben?
              Unser Team ist für dich da.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-soft border border-purple-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">{item.title}</p>
                        <p className="font-semibold text-text-primary">{item.value}</p>
                        <p className="text-sm text-text-secondary">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* FAQ Hint */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
              >
                <h3 className="font-semibold text-text-primary mb-2">
                  Häufige Fragen?
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Schau dir unsere Methodik-Seite an für Erklärungen zu Bewertungsmethoden und mehr.
                </p>
                <a
                  href="/about"
                  className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Zur Methodik
                  <Send className="w-4 h-4 ml-1" />
                </a>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl p-8 shadow-card border border-purple-100">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-text-primary mb-2">
                      Nachricht gesendet!
                    </h3>
                    <p className="text-text-secondary mb-6">
                      Vielen Dank für deine Nachricht. Wir melden uns innerhalb von 24 Stunden bei dir.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                      className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      Weitere Nachricht senden
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Max Mustermann"
                          className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-text-primary placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          E-Mail *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="max@startup.de"
                          className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-text-primary placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Betreff *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-text-primary"
                      >
                        {subjects.map((subject) => (
                          <option key={subject.value} value={subject.value}>
                            {subject.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Nachricht *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Wie können wir dir helfen?"
                        className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-text-primary placeholder:text-gray-400 resize-none"
                      />
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all text-white',
                        loading
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40'
                      )}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Nachricht senden
                        </>
                      )}
                    </button>

                    <p className="text-xs text-text-muted text-center">
                      Mit dem Absenden stimmst du unserer Datenschutzerklärung zu.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
