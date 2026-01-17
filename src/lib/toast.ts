/**
 * Toast Notifications Helper
 * Centralized toast management for LaunchOS
 */

import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════════
// TOAST HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════

export const showToast = {
  // Erfolg
  success: (message: string) => {
    toast.success(message);
  },

  // Fehler
  error: (message: string) => {
    toast.error(message);
  },

  // Info
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
    });
  },

  // Loading mit Promise
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },

  // Custom mit Action (JSX wird separat gehandhabt)
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

// Vordefinierte Messages
export const toastMessages = {
  // Allgemein
  saved: 'Erfolgreich gespeichert',
  deleted: 'Erfolgreich gelöscht',
  copied: 'In Zwischenablage kopiert',

  // Auth
  loginSuccess: 'Willkommen zurück!',
  logoutSuccess: 'Erfolgreich abgemeldet',

  // Ventures
  ventureCreated: 'Venture erstellt',
  ventureUpdated: 'Venture aktualisiert',
  ventureSwitched: 'Venture gewechselt',

  // Investor CRM
  contactSaved: 'Kontakt gespeichert',
  contactDeleted: 'Kontakt gelöscht',
  stageMoved: 'Stage aktualisiert',

  // Data Room
  fileUploaded: 'Datei hochgeladen',
  fileDeleted: 'Datei gelöscht',
  linkCopied: 'Link kopiert',
  linkCreated: 'Freigabe-Link erstellt',

  // Chat
  messageSent: 'Nachricht gesendet',
  chatLimitReached: 'Chat-Limit erreicht. Upgrade auf Pro für unbegrenzte Nachrichten.',

  // Toolkit
  bookmarkAdded: 'Zu Favoriten hinzugefügt',
  bookmarkRemoved: 'Aus Favoriten entfernt',

  // Errors
  genericError: 'Ein Fehler ist aufgetreten',
  networkError: 'Netzwerkfehler. Bitte prüfe deine Verbindung.',
  saveError: 'Speichern fehlgeschlagen',
  loadError: 'Laden fehlgeschlagen',
  deleteError: 'Löschen fehlgeschlagen',
  uploadError: 'Upload fehlgeschlagen',
};

export default showToast;
