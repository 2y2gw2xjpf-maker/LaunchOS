// ═══════════════════════════════════════════════════════════════════════════
// LaunchOS Error Handler
// Centralized error handling with German translations
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Nicht autorisiert') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} nicht gefunden`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      `Zu viele Anfragen. ${retryAfter ? `Versuche es in ${retryAfter} Sekunden erneut.` : ''}`,
      'RATE_LIMIT',
      429
    );
    this.name = 'RateLimitError';
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Zahlungsfehler') {
    super(message, 'PAYMENT_ERROR', 402);
    this.name = 'PaymentError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Netzwerkfehler. Bitte Verbindung prüfen.') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR MESSAGES (German translations)
// ═══════════════════════════════════════════════════════════════════════════

const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors (Supabase)
  'Invalid login credentials': 'Ungültige Anmeldedaten',
  'Email not confirmed': 'E-Mail nicht bestätigt. Bitte prüfe dein Postfach.',
  'User already registered': 'Diese E-Mail ist bereits registriert',
  'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen haben',
  'Password should be at least 8 characters': 'Passwort muss mindestens 8 Zeichen haben',
  'Invalid email': 'Ungültige E-Mail-Adresse',
  'Signup requires a valid password': 'Bitte gib ein Passwort ein',
  'User not found': 'Benutzer nicht gefunden',
  'Email rate limit exceeded': 'Zu viele Anfragen. Bitte warte kurz.',
  'For security purposes, you can only request this once every 60 seconds':
    'Aus Sicherheitsgründen kannst du dies nur alle 60 Sekunden anfordern',

  // JWT/Session errors
  'JWT expired': 'Sitzung abgelaufen. Bitte erneut anmelden.',
  'Invalid JWT': 'Sitzung ungültig. Bitte erneut anmelden.',
  'JWT claim is invalid': 'Sitzung ungültig. Bitte erneut anmelden.',
  'No API key found': 'API-Fehler. Bitte Seite neu laden.',
  'Invalid API key': 'API-Fehler. Bitte Seite neu laden.',

  // Stripe errors
  card_declined: 'Karte wurde abgelehnt',
  insufficient_funds: 'Nicht genügend Deckung',
  expired_card: 'Karte ist abgelaufen',
  incorrect_cvc: 'CVC ist falsch',
  processing_error: 'Verarbeitungsfehler. Bitte erneut versuchen.',
  incorrect_number: 'Kartennummer ist falsch',
  'Your card was declined.': 'Karte wurde abgelehnt',
  'Your card has expired.': 'Karte ist abgelaufen',

  // Network errors
  'Failed to fetch': 'Netzwerkfehler. Bitte Verbindung prüfen.',
  'Network request failed': 'Netzwerkfehler. Bitte Verbindung prüfen.',
  'Load failed': 'Laden fehlgeschlagen. Bitte erneut versuchen.',
  'NetworkError when attempting to fetch resource':
    'Netzwerkfehler. Bitte Verbindung prüfen.',

  // Database errors
  'duplicate key value violates unique constraint': 'Eintrag existiert bereits',
  'violates foreign key constraint': 'Verknüpfte Daten existieren nicht',
  'Row was already deleted': 'Eintrag wurde bereits gelöscht',

  // Generic
  'Something went wrong': 'Ein Fehler ist aufgetreten',
  'Internal server error': 'Serverfehler. Bitte später erneut versuchen.',
  'Service unavailable': 'Service nicht verfügbar. Bitte später erneut versuchen.',
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export function handleError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    const message = ERROR_MESSAGES[error.message] || error.message;

    // Detect specific error types
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      return new NetworkError(message);
    }
    if (error.message.includes('JWT') || error.message.includes('auth')) {
      return new AuthError(message);
    }

    return new AppError(message, 'UNKNOWN_ERROR', 500);
  }

  // String error
  if (typeof error === 'string') {
    const message = ERROR_MESSAGES[error] || error;
    return new AppError(message, 'UNKNOWN_ERROR', 500);
  }

  // Object with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: string }).message;
    const message = ERROR_MESSAGES[msg] || msg;
    return new AppError(message, 'UNKNOWN_ERROR', 500);
  }

  // Object with error property (common API response format)
  if (error && typeof error === 'object' && 'error' in error) {
    const errObj = error as { error: string | { message: string } };
    const msg = typeof errObj.error === 'string' ? errObj.error : errObj.error.message;
    const message = ERROR_MESSAGES[msg] || msg;
    return new AppError(message, 'API_ERROR', 500);
  }

  // Unknown error
  return new AppError('Ein unbekannter Fehler ist aufgetreten', 'UNKNOWN_ERROR', 500);
}

export function getErrorMessage(error: unknown): string {
  return handleError(error).message;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASYNC ERROR WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    onError?: (error: AppError) => void;
    fallback?: T;
    rethrow?: boolean;
  }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleError(error);

    if (options?.onError) {
      options.onError(appError);
    }

    if (options?.fallback !== undefined) {
      return options.fallback;
    }

    if (options?.rethrow !== false) {
      throw appError;
    }

    throw appError;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR LOGGING
// ═══════════════════════════════════════════════════════════════════════════

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const appError = handleError(error);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[Error]', {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      context,
      stack: appError.stack,
    });
  }

  // In production, send to analytics/error tracking
  if (!import.meta.env.DEV) {
    try {
      // PostHog error tracking
      import('./analytics').then(({ trackEvent }) => {
        trackEvent('ERROR_OCCURRED', {
          error_message: appError.message,
          error_code: appError.code,
          error_status: appError.statusCode,
          ...context,
        });
      });
    } catch {
      // Silent fail for analytics
    }
  }
}
