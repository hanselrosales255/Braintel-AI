/**
 * ===================================
 * BRAINCORE - CONSTANTS
 * ===================================
 * Constantes globales de la aplicación
 */

// Configuración de Supabase
export const SUPABASE_CONFIG = {
  URL: 'https://ofqcvgwpokcwuclcqwcs.supabase.co',
  ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcWN2Z3dwb2tjd3VjbGNxd2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzkwMDEsImV4cCI6MjA3NDA1NTAwMX0.1dZlGHqd_KdPwxavA8HAPNrHTNKNOYe476Jh7o9SLp4',
  TABLES: {
    PROFILES: 'profiles',
    SUBSCRIPTIONS: 'subscriptions',
    CALLS: 'calls',
    AGENT_CONFIGS: 'agent_configs',
  },
};

// Configuración de Stripe
export const STRIPE_CONFIG = {
  PUBLIC_KEY:
    'pk_test_51S9tu9HzHXPhIaGbx9SGbXnI2CcaoIZF3IOdgF4hBKBXEfCRCJVHpVSk3zSItZxDY6xXY9sCtLaQBjkXlstuiFxC00yJMGEAd4',
  PRICES: {
    STARTER: 'price_1S9ucZHzHXPhIaGbY3ts5PuK',
    BUSINESS: 'price_1S9uczHzHXPhIaGbqRBUyDAT',
    ULTRA: 'price_1S9udNHzHXPhIaGbaFj0H8cD',
  },
  PLANS: {
    STARTER: {
      name: 'Starter',
      price: 329,
      currency: 'EUR',
      limit: 600,
      features: [
        'Hasta 600 interacciones/mes',
        'Teléfono + WhatsApp',
        'IA voz natural',
        'Soporte por email',
      ],
    },
    BUSINESS: {
      name: 'Business',
      price: 719,
      currency: 'EUR',
      limit: 2000,
      features: [
        'Hasta 2000 interacciones/mes',
        'Informes detallados',
        'Panel personalizado',
        'Soporte prioritario',
        'Integración CRM',
      ],
    },
    ULTRA: {
      name: 'Ultra',
      price: 1399,
      currency: 'EUR',
      limit: 4000,
      features: [
        '4000 llamadas/mes',
        'API dedicada',
        'Personalización total',
        'Soporte 24/7 dedicado',
        'SLA garantizado 99.9%',
      ],
    },
  },
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'BrainCore',
  VERSION: '1.0.0',
  BASE_URL: window.location.origin,
  API_BASE_URL: window.location.origin,
  ENDPOINTS: {
    CHECKOUT: '/create-checkout-session',
    WEBHOOK: '/stripe-webhook',
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_FORGOT: '/auth/forgot-password',
  },
  ROUTES: {
    HOME: '/',
    AUTH: '/auth.html',
    DASHBOARD: '/dashboard.html',
    PRICING: '/#precios',
  },
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255,
    ERROR_MESSAGES: {
      REQUIRED: 'El email es requerido',
      INVALID: 'Formato de email inválido',
      TOO_LONG: 'El email es demasiado largo',
    },
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    ERROR_MESSAGES: {
      REQUIRED: 'La contraseña es requerida',
      TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
      TOO_LONG: 'La contraseña es demasiado larga',
      WEAK: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial',
    },
  },
  AGENT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    ERROR_MESSAGES: {
      REQUIRED: 'El nombre del agente es requerido',
      TOO_SHORT: 'El nombre debe tener al menos 2 caracteres',
      TOO_LONG: 'El nombre es demasiado largo',
    },
  },
  TRAINING_TEXT: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 5000,
    ERROR_MESSAGES: {
      REQUIRED: 'El texto de entrenamiento es requerido',
      TOO_SHORT: 'Proporciona al menos 50 caracteres de información',
      TOO_LONG: 'El texto excede el límite de 5000 caracteres',
    },
  },
};

// Configuración de seguridad
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    AUTH_LOCKOUT: 'auth_lockout',
    LAST_ACTIVITY: 'last_activity',
  },
};

// Configuración de UI/UX
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 500,
  NOTIFICATION_DURATION: 5000,
  TOAST_DURATION: 3000,
  LOADING_DELAY: 300,
  ANIMATION_DURATION: 300,
  SKELETON_MIN_TIME: 500,
  PAGINATION: {
    RECORDS_PER_PAGE: 10,
    MAX_VISIBLE_PAGES: 5,
  },
  REFRESH_INTERVALS: {
    DASHBOARD: 30000, // 30 segundos
    STATS: 60000, // 1 minuto
    CALLS: 15000, // 15 segundos
  },
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Estados de llamada
export const CALL_STATUS = {
  COMPLETED: 'completed',
  MISSED: 'missed',
  SHORT: 'short',
  IN_PROGRESS: 'in_progress',
  FAILED: 'failed',
};

// Estados de suscripción
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  TRIALING: 'trialing',
  PENDING: 'pending',
};

// Configuración de charts
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#8B5CF6',
    SUCCESS: '#10B981',
    ERROR: '#EF4444',
    WARNING: '#F59E0B',
    INFO: '#06B6D4',
    GRAY: '#9CA3AF',
  },
  DEFAULT_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#9CA3AF',
          padding: 15,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 25, 40, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#9CA3AF',
        borderColor: '#4B5563',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#374151',
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#374151',
          drawBorder: false,
        },
      },
    },
  },
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK: 'Error de conexión. Por favor verifica tu internet.',
  SERVER: 'Error del servidor. Intenta nuevamente más tarde.',
  UNAUTHORIZED: 'No autorizado. Por favor inicia sesión.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  TIMEOUT: 'La solicitud ha tardado demasiado. Intenta nuevamente.',
  UNKNOWN: 'Ha ocurrido un error inesperado.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  PAYMENT_FAILED: 'Error en el pago. Verifica tus datos.',
  SUBSCRIPTION_REQUIRED: 'Necesitas una suscripción activa para acceder.',
};

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  LOGIN: 'Sesión iniciada correctamente',
  REGISTER: 'Cuenta creada exitosamente',
  LOGOUT: 'Sesión cerrada correctamente',
  SAVE: 'Cambios guardados correctamente',
  UPDATE: 'Actualizado correctamente',
  DELETE: 'Eliminado correctamente',
  PAYMENT_SUCCESS: 'Pago procesado exitosamente',
  SUBSCRIPTION_ACTIVE: 'Suscripción activada correctamente',
};

// Expresiones regulares útiles
export const REGEX = {
  EMAIL: VALIDATION_CONFIG.EMAIL.REGEX,
  PASSWORD: VALIDATION_CONFIG.PASSWORD.REGEX,
  PHONE: /^(\+34|0034|34)?[6789]\d{8}$/,
  DNI: /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA: /^[a-zA-Z]+$/,
  NUMERIC: /^[0-9]+$/,
};

// Idiomas disponibles
export const LANGUAGES = {
  ES: { code: 'es', name: 'Español', flag: '🇪🇸' },
  EN: { code: 'en', name: 'English', flag: '🇬🇧' },
  CA: { code: 'ca', name: 'Català', flag: '🏴' },
  EU: { code: 'eu', name: 'Euskera', flag: '🏴' },
  GL: { code: 'gl', name: 'Galego', flag: '🏴' },
};

// Tonos de conversación
export const CONVERSATION_TONES = {
  PROFESSIONAL: { value: 'professional', label: 'Profesional' },
  FRIENDLY: { value: 'friendly', label: 'Amigable' },
  FORMAL: { value: 'formal', label: 'Formal' },
  CASUAL: { value: 'casual', label: 'Informal' },
  EMPATHETIC: { value: 'empathetic', label: 'Empático' },
};

// Headers HTTP comunes
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: { 'Content-Type': 'application/json' },
  ACCEPT_JSON: { Accept: 'application/json' },
  X_REQUESTED_WITH: { 'X-Requested-With': 'XMLHttpRequest' },
};

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export default {
  SUPABASE_CONFIG,
  STRIPE_CONFIG,
  APP_CONFIG,
  VALIDATION_CONFIG,
  SECURITY_CONFIG,
  UI_CONFIG,
  NOTIFICATION_TYPES,
  CALL_STATUS,
  SUBSCRIPTION_STATUS,
  CHART_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX,
  LANGUAGES,
  CONVERSATION_TONES,
  HTTP_HEADERS,
  HTTP_STATUS,
};
