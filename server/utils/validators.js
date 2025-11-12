/**
 * ===================================
 * VALIDADORES DE ENTRADA
 * ===================================
 * Validaciones robustas para datos de entrada
 */

/**
 * Validar email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validar contraseña
 */
function isValidPassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Contraseña requerida' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'La contraseña es demasiado larga' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&#]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      valid: false,
      error: 'La contraseña debe contener: mayúscula, minúscula, número y carácter especial',
    };
  }

  return { valid: true };
}

/**
 * Validar price ID de Stripe
 */
function isValidPriceId(priceId) {
  return (
    priceId && typeof priceId === 'string' && priceId.startsWith('price_') && priceId.length > 10
  );
}

/**
 * Validar UUID
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitizar input de texto
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().slice(0, 1000);
}

/**
 * Validar datos de checkout
 */
function validateCheckoutData(data) {
  const errors = [];

  if (!data.priceId || !isValidPriceId(data.priceId)) {
    errors.push('Price ID inválido');
  }

  if (!data.customer_email || !isValidEmail(data.customer_email)) {
    errors.push('Email inválido');
  }

  if (data.profile_id && !isValidUUID(data.profile_id)) {
    errors.push('Profile ID inválido');
  }

  if (data.company_id && !isValidUUID(data.company_id)) {
    errors.push('Company ID inválido');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validar datos de registro
 */
function validateSignupData(data) {
  const errors = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email inválido o faltante');
  }

  if (!data.password) {
    errors.push('Contraseña requerida');
  } else {
    const passwordValidation = isValidPassword(data.password);
    if (!passwordValidation.valid) {
      errors.push(passwordValidation.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validar datos de login
 */
function validateLoginData(data) {
  const errors = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email inválido o faltante');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Contraseña requerida');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPriceId,
  isValidUUID,
  sanitizeText,
  validateCheckoutData,
  validateSignupData,
  validateLoginData,
};
