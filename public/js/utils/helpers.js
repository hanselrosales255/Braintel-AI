/**
 * ===================================
 * BRAINCORE - UTILITY FUNCTIONS
 * ===================================
 * Funciones auxiliares reutilizables para toda la aplicación
 */

import { ERROR_MESSAGES, UI_CONFIG, NOTIFICATION_TYPES, HTTP_STATUS } from './constants.js';

/**
 * ===================================
 * STRING UTILITIES
 * ===================================
 */

export const StringUtils = {
  /**
   * Sanitizar entrada de usuario
   * @param {string} input
   * @returns {string}
   */
  sanitize(input) {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
  },

  /**
   * Capitalizar primera letra
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Truncar texto
   * @param {string} text
   * @param {number} maxLength
   * @param {string} suffix
   * @returns {string}
   */
  truncate(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
  },

  /**
   * Generar slug desde texto
   * @param {string} text
   * @returns {string}
   */
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  },

  /**
   * Escapar HTML
   * @param {string} html
   * @returns {string}
   */
  escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Remover acentos
   * @param {string} str
   * @returns {string}
   */
  removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },
};

/**
 * ===================================
 * NUMBER UTILITIES
 * ===================================
 */

export const NumberUtils = {
  /**
   * Formatear número con locales
   * @param {number} number
   * @param {string} locale
   * @returns {string}
   */
  format(number, locale = 'es-ES') {
    return new Intl.NumberFormat(locale).format(number);
  },

  /**
   * Formatear como moneda
   * @param {number} amount
   * @param {string} currency
   * @param {string} locale
   * @returns {string}
   */
  formatCurrency(amount, currency = 'EUR', locale = 'es-ES') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * Formatear porcentaje
   * @param {number} value
   * @param {number} decimals
   * @returns {string}
   */
  formatPercentage(value, decimals = 0) {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Redondear a decimales
   * @param {number} number
   * @param {number} decimals
   * @returns {number}
   */
  round(number, decimals = 2) {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Generar número aleatorio
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Verificar si es número válido
   * @param {any} value
   * @returns {boolean}
   */
  isValid(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },
};

/**
 * ===================================
 * DATE UTILITIES
 * ===================================
 */

export const DateUtils = {
  /**
   * Formatear fecha
   * @param {Date|string} date
   * @param {string} locale
   * @param {Object} options
   * @returns {string}
   */
  format(date, locale = 'es-ES', options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Date(date).toLocaleString(locale, { ...defaultOptions, ...options });
  },

  /**
   * Formatear fecha relativa (hace X tiempo)
   * @param {Date|string} date
   * @returns {string}
   */
  formatRelative(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'hace unos segundos';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30)
      return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays < 365)
      return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
    return `hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
  },

  /**
   * Formatear duración desde segundos
   * @param {number} seconds
   * @returns {string}
   */
  formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  },

  /**
   * Obtener rango de fechas
   * @param {string} period - 'today', '7days', '30days', '90days'
   * @returns {{start: string, end: string}}
   */
  getDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  },

  /**
   * Verificar si fecha es válida
   * @param {any} date
   * @returns {boolean}
   */
  isValid(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  },

  /**
   * Agregar días a fecha
   * @param {Date|string} date
   * @param {number} days
   * @returns {Date}
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
};

/**
 * ===================================
 * VALIDATION UTILITIES
 * ===================================
 */

export const ValidationUtils = {
  /**
   * Validar email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validar contraseña fuerte
   * @param {string} password
   * @returns {{valid: boolean, errors: Array<string>}}
   */
  validatePassword(password) {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minúscula');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial (@$!%*?&)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validar teléfono español
   * @param {string} phone
   * @returns {boolean}
   */
  isValidPhone(phone) {
    const regex = /^(\+34|0034|34)?[6789]\d{8}$/;
    return regex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validar DNI español
   * @param {string} dni
   * @returns {boolean}
   */
  isValidDNI(dni) {
    const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    if (!regex.test(dni)) return false;

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = dni.substr(0, 8);
    const letter = dni.substr(8, 1).toUpperCase();

    return letters.charAt(parseInt(number, 10) % 23) === letter;
  },

  /**
   * Validar URL
   * @param {string} url
   * @returns {boolean}
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validar longitud de texto
   * @param {string} text
   * @param {number} min
   * @param {number} max
   * @returns {boolean}
   */
  isValidLength(text, min = 0, max = Infinity) {
    const length = text ? text.length : 0;
    return length >= min && length <= max;
  },
};

/**
 * ===================================
 * DOM UTILITIES
 * ===================================
 */

export const DomUtils = {
  /**
   * Seleccionar elemento del DOM
   * @param {string} selector
   * @param {Element} parent
   * @returns {Element|null}
   */
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Seleccionar múltiples elementos
   * @param {string} selector
   * @param {Element} parent
   * @returns {NodeList}
   */
  $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
  },

  /**
   * Agregar clase
   * @param {Element} element
   * @param {...string} classes
   */
  addClass(element, ...classes) {
    if (element) {
      element.classList.add(...classes);
    }
  },

  /**
   * Remover clase
   * @param {Element} element
   * @param {...string} classes
   */
  removeClass(element, ...classes) {
    if (element) {
      element.classList.remove(...classes);
    }
  },

  /**
   * Toggle clase
   * @param {Element} element
   * @param {string} className
   * @param {boolean} force
   */
  toggleClass(element, className, force) {
    if (element) {
      element.classList.toggle(className, force);
    }
  },

  /**
   * Mostrar elemento
   * @param {Element} element
   */
  show(element) {
    if (element) {
      element.classList.remove('hidden');
      element.style.display = '';
    }
  },

  /**
   * Ocultar elemento
   * @param {Element} element
   */
  hide(element) {
    if (element) {
      element.classList.add('hidden');
    }
  },

  /**
   * Scroll suave a elemento
   * @param {Element|string} target
   * @param {number} offset
   */
  scrollToElement(target, offset = 80) {
    const element = typeof target === 'string' ? this.$(target) : target;

    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  },

  /**
   * Obtener altura del viewport
   * @returns {number}
   */
  getViewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight;
  },

  /**
   * Obtener ancho del viewport
   * @returns {number}
   */
  getViewportWidth() {
    return window.innerWidth || document.documentElement.clientWidth;
  },

  /**
   * Verificar si elemento está en viewport
   * @param {Element} element
   * @returns {boolean}
   */
  isInViewport(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= this.getViewportHeight() &&
      rect.right <= this.getViewportWidth()
    );
  },

  /**
   * Establecer estado de carga en botón
   * @param {Element} button
   * @param {boolean} isLoading
   * @param {string} loadingText
   */
  setButtonLoading(button, isLoading, loadingText = 'Cargando...') {
    if (!button) return;

    // Guardar texto original si no existe
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }

    if (isLoading) {
      button.disabled = true;
      button.textContent = loadingText;
      button.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText;
      button.classList.remove('opacity-70', 'cursor-not-allowed');
    }
  },

  /**
   * Crear elemento HTML desde string
   * @param {string} htmlString
   * @returns {Element}
   */
  createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  },

  /**
   * Animar elemento con clase
   * @param {Element} element
   * @param {string} animationClass
   * @param {Function} callback
   */
  animateCSS(element, animationClass, callback) {
    if (!element) return;

    element.classList.add('animate__animated', animationClass);

    function handleAnimationEnd(event) {
      event.stopPropagation();
      element.classList.remove('animate__animated', animationClass);
      if (typeof callback === 'function') callback();
    }

    element.addEventListener('animationend', handleAnimationEnd, { once: true });
  },
};

/**
 * ===================================
 * ASYNC UTILITIES
 * ===================================
 */

export const AsyncUtils = {
  /**
   * Debounce function
   * @param {Function} func
   * @param {number} wait
   * @returns {Function}
   */
  debounce(func, wait = UI_CONFIG.DEBOUNCE_DELAY) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func
   * @param {number} limit
   * @returns {Function}
   */
  throttle(func, limit = 1000) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Sleep/delay function
   * @param {number} ms
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Retry with exponential backoff
   * @param {Function} fn
   * @param {number} maxRetries
   * @param {number} delay
   * @returns {Promise}
   */
  async retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.sleep(delay * Math.pow(2, i));
      }
    }
  },

  /**
   * Timeout promise
   * @param {Promise} promise
   * @param {number} ms
   * @returns {Promise}
   */
  timeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
    ]);
  },
};

/**
 * ===================================
 * STORAGE UTILITIES
 * ===================================
 */

export const StorageUtils = {
  /**
   * Obtener item de localStorage
   * @param {string} key
   * @param {any} defaultValue
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Guardar item en localStorage
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  /**
   * Eliminar item de localStorage
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  /**
   * Limpiar todo localStorage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Verificar si existe key
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  },
};

/**
 * ===================================
 * NOTIFICATION UTILITIES
 * ===================================
 */

export const NotificationUtils = {
  /**
   * Mostrar notificación toast
   * @param {string} message
   * @param {string} type
   * @param {number} duration
   */
  show(message, type = NOTIFICATION_TYPES.INFO, duration = UI_CONFIG.NOTIFICATION_DURATION) {
    const container = DomUtils.$('#notificationContainer');

    if (!container) {
      console.warn('Notification container not found');
      return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
      [NOTIFICATION_TYPES.SUCCESS]: 'ri-check-line',
      [NOTIFICATION_TYPES.ERROR]: 'ri-error-warning-line',
      [NOTIFICATION_TYPES.WARNING]: 'ri-alert-line',
      [NOTIFICATION_TYPES.INFO]: 'ri-information-line',
    };

    notification.innerHTML = `
      <div class="flex items-center">
        <i class="${icons[type] || icons[NOTIFICATION_TYPES.INFO]} mr-2"></i>
        <span>${StringUtils.escapeHtml(message)}</span>
        <button class="ml-4 hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
          <i class="ri-close-line"></i>
        </button>
      </div>
    `;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },

  success(message, duration) {
    this.show(message, NOTIFICATION_TYPES.SUCCESS, duration);
  },

  error(message, duration) {
    this.show(message, NOTIFICATION_TYPES.ERROR, duration);
  },

  warning(message, duration) {
    this.show(message, NOTIFICATION_TYPES.WARNING, duration);
  },

  info(message, duration) {
    this.show(message, NOTIFICATION_TYPES.INFO, duration);
  },
};

/**
 * ===================================
 * ERROR HANDLING UTILITIES
 * ===================================
 */

export const ErrorUtils = {
  /**
   * Parsear error y obtener mensaje amigable
   * @param {Error|Object} error
   * @returns {string}
   */
  getMessage(error) {
    if (!error) return ERROR_MESSAGES.UNKNOWN;

    // Si es un error con mensaje personalizado
    if (error.message) {
      return error.message;
    }

    // Si es un error de red
    if (error.name === 'NetworkError' || !navigator.onLine) {
      return ERROR_MESSAGES.NETWORK;
    }

    // Si es un error HTTP
    if (error.status) {
      switch (error.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          return ERROR_MESSAGES.UNAUTHORIZED;
        case HTTP_STATUS.FORBIDDEN:
          return ERROR_MESSAGES.FORBIDDEN;
        case HTTP_STATUS.NOT_FOUND:
          return ERROR_MESSAGES.NOT_FOUND;
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          return 'Demasiadas solicitudes. Intenta más tarde.';
        case HTTP_STATUS.SERVER_ERROR:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          return ERROR_MESSAGES.SERVER;
        default:
          return ERROR_MESSAGES.UNKNOWN;
      }
    }

    return ERROR_MESSAGES.UNKNOWN;
  },

  /**
   * Log error en consola con contexto
   * @param {string} context
   * @param {Error} error
   * @param {Object} metadata
   */
  log(context, error, metadata = {}) {
    console.error(`[${context}]`, error, metadata);

    // En producción, aquí podrías enviar a un servicio de logging
    // como Sentry, LogRocket, etc.
  },

  /**
   * Crear error personalizado
   * @param {string} message
   * @param {string} code
   * @param {Object} data
   * @returns {Error}
   */
  create(message, code, data = {}) {
    const error = new Error(message);
    error.code = code;
    error.data = data;
    return error;
  },
};

/**
 * ===================================
 * HTTP UTILITIES
 * ===================================
 */

export const HttpUtils = {
  /**
   * Fetch con manejo de errores mejorado
   * @param {string} url
   * @param {Object} options
   * @returns {Promise}
   */
  async fetch(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw ErrorUtils.create(errorData.error || ERROR_MESSAGES.SERVER, 'HTTP_ERROR', {
          status: response.status,
          statusText: response.statusText,
        });
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * GET request
   * @param {string} url
   * @param {Object} options
   * @returns {Promise}
   */
  get(url, options = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  },

  /**
   * POST request
   * @param {string} url
   * @param {Object} data
   * @param {Object} options
   * @returns {Promise}
   */
  post(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   * @param {string} url
   * @param {Object} data
   * @param {Object} options
   * @returns {Promise}
   */
  put(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   * @param {string} url
   * @param {Object} options
   * @returns {Promise}
   */
  delete(url, options = {}) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  },
};

// Exportar todo
export default {
  StringUtils,
  NumberUtils,
  DateUtils,
  ValidationUtils,
  DomUtils,
  AsyncUtils,
  StorageUtils,
  NotificationUtils,
  ErrorUtils,
  HttpUtils,
};
