import * as React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  CreditCard,
  Shield,
  Bell,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Header, Footer } from '@/components/layout';
import BillingSection from './BillingSection';

type SettingsTab = 'profile' | 'billing' | 'security' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'billing' as const, label: 'Abrechnung', icon: CreditCard },
    { id: 'security' as const, label: 'Sicherheit', icon: Shield },
    { id: 'notifications' as const, label: 'Benachrichtigungen', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <Header />
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-display-sm md:text-display-md text-text-primary mb-4">
              Einstellungen
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              Verwalte dein Konto und deine Präferenzen
            </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow-brand'
                    : 'bg-white/80 text-text-secondary border border-purple-100 hover:border-purple-200 hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-card">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'billing' && <BillingSection />}
            {activeTab === 'security' && <SecuritySection />}
            {activeTab === 'notifications' && <NotificationsSection />}
          </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ==================== Profile Section ====================

function ProfileSection() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = React.useState(profile?.full_name || '');
  const [companyName, setCompanyName] = React.useState(profile?.company_name || '');
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCompanyName(profile.company_name || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      await updateProfile({
        full_name: fullName,
        company_name: companyName,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white shadow-soft hover:shadow-medium rounded-full flex items-center justify-center text-purple-600 transition-all">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{fullName || 'Unbenannt'}</h3>
          <p className="text-text-muted">{user?.email}</p>
        </div>
      </div>

      <hr className="border-purple-100" />

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Vollständiger Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Max Mustermann"
            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            E-Mail-Adresse
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 bg-purple-50 border border-purple-100 rounded-lg text-text-muted cursor-not-allowed"
          />
          <p className="text-xs text-text-muted mt-1">
            E-Mail-Adresse kann nicht geändert werden
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Firma / Startup
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Mein Startup GmbH"
            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-200 disabled:to-pink-200 text-white font-semibold rounded-lg transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Speichern...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Gespeichert!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Änderungen speichern
              </>
            )}
          </button>
        </div>
      </div>

      <hr className="border-purple-100" />

      {/* Sign Out */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-text-primary font-medium">Abmelden</h4>
          <p className="text-sm text-text-muted">Von deinem Konto abmelden</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>
    </div>
  );
}

// ==================== Security Section ====================

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Passwort ändern</h3>
        <p className="text-text-muted text-sm">
          Aktualisiere dein Passwort regelmäßig für mehr Sicherheit
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Neues Passwort
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Passwort bestätigen
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Passwort erfolgreich geändert
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-200 disabled:to-pink-200 text-white font-semibold rounded-lg transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Wird geändert...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Passwort ändern
            </>
          )}
        </button>
      </form>

      <hr className="border-purple-100" />

      {/* Delete Account */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-grow">
            <h4 className="text-text-primary font-medium">Konto löschen</h4>
            <p className="text-sm text-text-muted mt-1">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden dauerhaft gelöscht.
            </p>
            <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
              Konto dauerhaft löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Notifications Section ====================

function NotificationsSection() {
  const [emailNotifications, setEmailNotifications] = React.useState({
    marketing: true,
    product: true,
    security: true,
  });

  const toggleNotification = (key: keyof typeof emailNotifications) => {
    setEmailNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">E-Mail-Benachrichtigungen</h3>
        <p className="text-text-muted text-sm">Wähle, welche E-Mails du erhalten möchtest</p>
      </div>

      <div className="space-y-4">
        <NotificationToggle
          label="Marketing & Newsletter"
          description="Tipps, Neuigkeiten und Angebote"
          checked={emailNotifications.marketing}
          onChange={() => toggleNotification('marketing')}
        />

        <NotificationToggle
          label="Produkt-Updates"
          description="Neue Features und Verbesserungen"
          checked={emailNotifications.product}
          onChange={() => toggleNotification('product')}
        />

        <NotificationToggle
          label="Sicherheitsbenachrichtigungen"
          description="Wichtige Sicherheitsupdates"
          checked={emailNotifications.security}
          onChange={() => toggleNotification('security')}
          disabled
        />
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function NotificationToggle({ label, description, checked, onChange, disabled }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-purple-100 rounded-lg shadow-soft">
      <div>
        <h4 className="text-text-primary font-medium">{label}</h4>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-purple-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
