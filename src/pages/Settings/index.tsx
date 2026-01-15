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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Einstellungen</h1>
          <p className="text-slate-400 mb-8">Verwalte dein Konto und deine Präferenzen</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'billing' && <BillingSection />}
            {activeTab === 'security' && <SecuritySection />}
            {activeTab === 'notifications' && <NotificationsSection />}
          </div>
        </motion.div>
      </div>
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
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{fullName || 'Unbenannt'}</h3>
          <p className="text-slate-400">{user?.email}</p>
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Vollständiger Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Max Mustermann"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            E-Mail-Adresse
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 bg-slate-700/30 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            E-Mail-Adresse kann nicht geändert werden
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Firma / Startup
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Mein Startup GmbH"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all"
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

      <hr className="border-slate-700" />

      {/* Sign Out */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Abmelden</h4>
          <p className="text-sm text-slate-400">Von deinem Konto abmelden</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
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
        <h3 className="text-lg font-semibold text-white mb-1">Passwort ändern</h3>
        <p className="text-slate-400 text-sm">Aktualisiere dein Passwort regelmäßig für mehr Sicherheit</p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Neues Passwort
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Passwort bestätigen
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Passwort erfolgreich geändert
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all"
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

      <hr className="border-slate-700" />

      {/* Delete Account */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-grow">
            <h4 className="text-white font-medium">Konto löschen</h4>
            <p className="text-sm text-slate-400 mt-1">
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
        <h3 className="text-lg font-semibold text-white mb-1">E-Mail-Benachrichtigungen</h3>
        <p className="text-slate-400 text-sm">Wähle, welche E-Mails du erhalten möchtest</p>
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
    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
      <div>
        <h4 className="text-white font-medium">{label}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-purple-600' : 'bg-slate-600'
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
