import { ApiError } from '../api/api';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface UserFacingError {
  title: string;
  description: string;
  severity: ErrorSeverity;
  /** Si true, el usuario puede reintentar sin riesgo (el recurso no fue creado) */
  canRetry: boolean;
}

/**
 * Códigos de error semánticos que el backend puede enviar.
 * Definirlos acá centraliza los mensajes y evita strings sueltos.
 */
const BACKEND_CODE_MESSAGES: Record<string, UserFacingError> = {
  EMAIL_SEND_FAILED: {
    title: 'Quote created, but email not sent',
    description:
      'The quote was saved successfully, but there was a problem sending the email. Please try sending again or contact support.',
    severity: 'warning',
    canRetry: false, // el quote ya existe, no duplicar
  },
  EMAIL_ADVISOR_FAILED: {
    title: 'Could not send email to advisor',
    description:
      'The quote was saved, but the advisor email failed to send. Please verify the email address and try again.',
    severity: 'warning',
    canRetry: false,
  },
  EMAIL_GUEST_FAILED: {
    title: 'Could not send email to guest',
    description:
      'The quote was sent to the advisor, but the guest copy failed. The advisor received their email.',
    severity: 'warning',
    canRetry: false,
  },
  QUOTE_NOT_FOUND: {
    title: 'Quote not found',
    description: 'The quote could not be found. It may have already been sent.',
    severity: 'error',
    canRetry: false,
  },
  QUOTE_ALREADY_SENT: {
    title: 'Quote already sent',
    description: 'This quote has already been sent. Refresh the page to start a new one.',
    severity: 'info',
    canRetry: false,
  },
  VALIDATION_ERROR: {
    title: 'Check required fields',
    description: 'Some required fields are missing or invalid. Please review the form and try again.',
    severity: 'error',
    canRetry: true,
  },
};

/**
 * Convierte cualquier error (ApiError, network error, unknown) en un mensaje
 * amigable para el usuario.
 */
export function parseError(err: unknown): UserFacingError {
  // ── Network / timeout errors ──────────────────────────────────────────────
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return {
      title: 'Connection error',
      description:
        'Could not reach the server. Please check your internet connection and try again.',
      severity: 'error',
      canRetry: true,
    };
  }

  if (err instanceof DOMException && err.name === 'AbortError') {
    return {
      title: 'Request timed out',
      description: 'The request took too long. Please try again in a moment.',
      severity: 'error',
      canRetry: true,
    };
  }

  // ── ApiError (nuestra clase customizada) ──────────────────────────────────
  if (err instanceof ApiError) {
    // Primero: ¿el backend envió un code semántico?
    const payload = err.data as any;
    const code: string | undefined = payload?.code || payload?.error_code;

    if (code && BACKEND_CODE_MESSAGES[code]) {
      return BACKEND_CODE_MESSAGES[code];
    }

    // Segundo: mapear por HTTP status
    return mapByStatus(err.status, payload?.message || err.message);
  }

  // ── Error genérico ────────────────────────────────────────────────────────
  const msg = err instanceof Error ? err.message : String(err);
  return {
    title: 'Something went wrong',
    description: msg || 'An unexpected error occurred. Please try again.',
    severity: 'error',
    canRetry: true,
  };
}

function mapByStatus(status: number, backendMessage?: string): UserFacingError {
  // 4xx — errores del cliente
  if (status === 400) {
    return {
      title: 'Invalid request',
      description:
        backendMessage ||
        'Please check that all required fields are filled in correctly.',
      severity: 'error',
      canRetry: true,
    };
  }

  if (status === 401) {
    return {
      title: 'Session expired',
      description: 'Please log in again to continue.',
      severity: 'error',
      canRetry: false,
    };
  }

  if (status === 403) {
    return {
      title: 'Access denied',
      description: "You don't have permission to perform this action.",
      severity: 'error',
      canRetry: false,
    };
  }

  if (status === 404) {
    return {
      title: 'Not found',
      description: backendMessage || 'The requested resource could not be found.',
      severity: 'error',
      canRetry: false,
    };
  }

  if (status === 409) {
    return {
      title: 'Conflict',
      description:
        backendMessage || 'This action conflicts with an existing record.',
      severity: 'warning',
      canRetry: false,
    };
  }

  if (status === 429) {
    return {
      title: 'Too many requests',
      description: 'You are sending requests too quickly. Please wait a moment and try again.',
      severity: 'warning',
      canRetry: true,
    };
  }

  // 5xx — errores del servidor
  if (status >= 500) {
    return {
      title: 'Server error',
      description:
        'Something went wrong on our end. Please try again in a few minutes. If the problem persists, contact support.',
      severity: 'error',
      canRetry: true,
    };
  }

  // fallback
  return {
    title: 'Unexpected error',
    description: backendMessage || 'An unexpected error occurred. Please try again.',
    severity: 'error',
    canRetry: true,
  };
}