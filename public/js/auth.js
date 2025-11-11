/**
 * Auth.js - Gestión de autenticación
 * Utiliza las utilidades compartidas para un código más limpio y mantenible
 */

import { supabaseService } from './utils/supabaseClient.js';
import { APP_CONFIG, VALIDATION_CONFIG, ERROR_MESSAGES } from './utils/constants.js';
import { ValidationUtils, NotificationUtils, DomUtils, ErrorUtils } from './utils/helpers.js';

/**
 * Verifica la sesión actual y redirige si es necesario
 */
async function checkAuthStatus() {
  try {
    const result = await supabaseService.getCurrentUser();

    if (!result.user) {
      console.log('No hay usuario autenticado');
      return;
    }

    const user = result.user;
    console.log('Usuario autenticado:', user.email);

    // Verificar si tiene suscripción activa
    const subscription = await supabaseService.getActiveSubscription(user.id);

    if (subscription && subscription.status === 'active') {
      console.log('Usuario con suscripción activa, redirigiendo al dashboard');
      window.location.href = APP_CONFIG.routes.dashboard;
    } else {
      console.log('Usuario sin suscripción activa, redirigiendo a precios');
      window.location.href = APP_CONFIG.routes.pricing;
    }
  } catch (error) {
    ErrorUtils.log(error, { context: 'checkAuthStatus' });
    // No mostramos error al usuario, solo registramos
  }
}

/**
 * Valida los campos del formulario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {boolean} isSignUp - Si es registro o inicio de sesión
 * @returns {Object} - { isValid, errors }
 */
function validateAuthForm(email, password, isSignUp = false) {
  const errors = [];

  if (!email || !password) {
    errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS);
  }

  if (email && !ValidationUtils.isValidEmail(email)) {
    errors.push(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
  }

  if (isSignUp && password) {
    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Muestra un mensaje en el elemento de mensaje
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} isError - Si es un error o éxito
 */
function showMessage(message, isError = false) {
  const messageEl = DomUtils.$('#message');

  if (!messageEl) {
    // Si no existe el elemento, usar notificaciones
    if (isError) {
      NotificationUtils.error(message);
    } else {
      NotificationUtils.success(message);
    }
    return;
  }

  messageEl.textContent = message;
  messageEl.className = `mt-4 text-sm text-center ${isError ? 'text-red-500' : 'text-green-500'}`;

  // Limpiar mensaje después de 5 segundos
  setTimeout(() => {
    messageEl.textContent = '';
  }, VALIDATION_CONFIG.messageTimeout);
}

/**
 * Maneja el registro de nuevos usuarios
 */
async function handleSignUp() {
  try {
    const email = DomUtils.$('#email')?.value?.trim();
    const password = DomUtils.$('#password')?.value;

    console.log('📝 Intentando registrar nuevo usuario...', { email });

    // Validar campos
    const validation = validateAuthForm(email, password, true);
    if (!validation.isValid) {
      console.error('❌ Validación fallida:', validation.errors);
      showMessage(validation.errors[0], true);
      return;
    }

    // Mostrar estado de carga
    const button = DomUtils.$('#btnSignUp');
    DomUtils.setButtonLoading(button, true, 'Registrando...');

    console.log('📡 Enviando solicitud de registro a Supabase...');

    // Registrar usuario
    const result = await supabaseService.signUp({
      email,
      password,
      metadata: {
        full_name: email.split('@')[0],
      }
    });

    if (result.error) {
      console.error('❌ Error de Supabase:', result.error);
      throw result.error;
    }

    console.log('✅ Registro exitoso:', { userId: result.data?.user?.id, email });

    showMessage('¡Registro exitoso! Redirigiendo...');

    // Redirigir después de 1.5 segundos
    setTimeout(() => {
      window.location.href = APP_CONFIG.routes.pricing;
    }, 1500);
  } catch (error) {
    console.error('❌ Error en handleSignUp:', error);
    
    // Mensaje de error personalizado
    let errorMessage = 'Error al registrarse';
    
    if (error.message?.includes('User already registered')) {
      errorMessage = 'Este email ya está registrado. Intenta iniciar sesión';
    } else if (error.message?.includes('Password')) {
      errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
    } else if (error.message?.includes('Email')) {
      errorMessage = 'Email inválido';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    ErrorUtils.log(error, { context: 'handleSignUp' });
    showMessage(errorMessage, true);

    // Restaurar botón
    const button = DomUtils.$('#btnSignUp');
    DomUtils.setButtonLoading(button, false);
  }
}

/**
 * Maneja el inicio de sesión de usuarios
 */
async function handleSignIn() {
  try {
    const email = DomUtils.$('#email')?.value?.trim();
    const password = DomUtils.$('#password')?.value;

    console.log('🔐 Intentando iniciar sesión...', { email });

    // Validar campos
    const validation = validateAuthForm(email, password, false);
    if (!validation.isValid) {
      console.error('❌ Validación fallida:', validation.errors);
      showMessage(validation.errors[0], true);
      return;
    }

    // Mostrar estado de carga
    const button = DomUtils.$('#btnSignIn');
    DomUtils.setButtonLoading(button, true, 'Iniciando sesión...');

    console.log('📡 Enviando solicitud de login a Supabase...');

    // Iniciar sesión
    const result = await supabaseService.signIn({
      email,
      password
    });

    if (result.error) {
      console.error('❌ Error de Supabase:', result.error);
      throw result.error;
    }

    const user = result.data.user;
    console.log('✅ Login exitoso:', { userId: user.id, email: user.email });

    // Mostrar mensaje de éxito
    showMessage('¡Bienvenido de vuelta!');

    // Verificar suscripción
    console.log('🔍 Verificando suscripción...');
    const subscription = await supabaseService.getActiveSubscription(user.id);

    if (subscription && subscription.status === 'active') {
      console.log('✅ Suscripción activa encontrada, redirigiendo al dashboard...');
      setTimeout(() => {
        window.location.href = APP_CONFIG.routes.dashboard;
      }, 1000);
    } else {
      console.log('⚠️ Sin suscripción activa, redirigiendo a precios...');
      setTimeout(() => {
        window.location.href = APP_CONFIG.routes.pricing;
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Error en handleSignIn:', error);
    
    // Mensaje de error personalizado
    let errorMessage = 'Error al iniciar sesión';
    
    if (error.message?.includes('Invalid login credentials')) {
      errorMessage = 'Email o contraseña incorrectos';
    } else if (error.message?.includes('Email not confirmed')) {
      errorMessage = 'Debes confirmar tu email antes de iniciar sesión';
    } else if (error.message?.includes('Too many requests')) {
      errorMessage = 'Demasiados intentos. Espera un momento e intenta de nuevo';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    ErrorUtils.log(error, { context: 'handleSignIn' });
    showMessage(errorMessage, true);

    // Restaurar botón
    const button = DomUtils.$('#btnSignIn');
    DomUtils.setButtonLoading(button, false);
  }
}

/**
 * Alterna entre formularios de registro e inicio de sesión
 * @param {string} formToShow - 'signUp' o 'signIn'
 */
function toggleForms(formToShow) {
  const signInForm = DomUtils.$('#signInForm');
  const signUpForm = DomUtils.$('#signUpForm');

  if (!signInForm || !signUpForm) {
    console.warn('Formularios no encontrados');
    return;
  }

  if (formToShow === 'signUp') {
    DomUtils.hide(signInForm);
    DomUtils.show(signUpForm);
    // Limpiar mensaje
    const messageEl = DomUtils.$('#message');
    if (messageEl) messageEl.textContent = '';
  } else {
    DomUtils.hide(signUpForm);
    DomUtils.show(signInForm);
    // Limpiar mensaje
    const messageEl = DomUtils.$('#message');
    if (messageEl) messageEl.textContent = '';
  }
}

/**
 * Inicializa los event listeners
 */
function initializeEventListeners() {
  // Botón de registro
  const btnSignUp = DomUtils.$('#btnSignUp');
  if (btnSignUp) {
    btnSignUp.addEventListener('click', handleSignUp);
  }

  // Botón de inicio de sesión
  const btnSignIn = DomUtils.$('#btnSignIn');
  if (btnSignIn) {
    btnSignIn.addEventListener('click', handleSignIn);
  }

  // Toggle a formulario de registro
  const toggleSignUp = DomUtils.$('#toggleSignUp');
  if (toggleSignUp) {
    toggleSignUp.addEventListener('click', (e) => {
      e.preventDefault();
      toggleForms('signUp');
      // Mostrar validador de contraseña
      const strengthIndicator = DomUtils.$('#passwordStrength');
      const strengthText = DomUtils.$('#password-strength-text');
      if (strengthIndicator) DomUtils.show(strengthIndicator);
      if (strengthText) DomUtils.show(strengthText);
    });
  }

  // Toggle a formulario de inicio de sesión
  const toggleSignIn = DomUtils.$('#toggleSignIn');
  if (toggleSignIn) {
    toggleSignIn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleForms('signIn');
      // Ocultar validador de contraseña
      const strengthIndicator = DomUtils.$('#passwordStrength');
      const strengthText = DomUtils.$('#password-strength-text');
      if (strengthIndicator) DomUtils.hide(strengthIndicator);
      if (strengthText) DomUtils.hide(strengthText);
    });
  }

  // Validación de contraseña en tiempo real
  const passwordInput = DomUtils.$('#password');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      const password = e.target.value;
      const signUpForm = DomUtils.$('#signUpForm');
      const isSignUpVisible = !signUpForm?.classList.contains('hidden');
      
      // Solo mostrar validación en formulario de registro
      if (isSignUpVisible && password.length > 0) {
        updatePasswordStrength(password);
      }
    });
  }

  // Enter key en los inputs
  const emailInput = DomUtils.$('#email');

  if (emailInput && passwordInput) {
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        const signInForm = DomUtils.$('#signInForm');
        const isSignInVisible = !signInForm?.classList.contains('hidden');

        if (isSignInVisible) {
          handleSignIn();
        } else {
          handleSignUp();
        }
      }
    };

    emailInput.addEventListener('keypress', handleEnter);
    passwordInput.addEventListener('keypress', handleEnter);
  }

  console.log('✓ Event listeners de autenticación inicializados');
}

/**
 * Actualiza el indicador de fuerza de contraseña
 * @param {string} password - Contraseña a validar
 */
function updatePasswordStrength(password) {
  const strengthBar = DomUtils.$('#passwordStrengthBar');
  const strengthText = DomUtils.$('#password-strength-text');
  
  if (!strengthBar || !strengthText) return;

  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#]/.test(password)
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  let strength = 'débil';
  let color = '#EF4444'; // red
  let width = '25%';
  
  if (metRequirements >= 5) {
    strength = 'fuerte';
    color = '#10B981'; // green
    width = '100%';
  } else if (metRequirements >= 4) {
    strength = 'buena';
    color = '#3B82F6'; // blue
    width = '75%';
  } else if (metRequirements >= 3) {
    strength = 'media';
    color = '#F59E0B'; // yellow
    width = '50%';
  }

  // Actualizar barra
  strengthBar.style.width = width;
  strengthBar.style.backgroundColor = color;
  
  // Actualizar texto con requisitos
  const requirementsList = [
    { met: requirements.length, text: '8+ caracteres' },
    { met: requirements.uppercase, text: 'Mayúscula' },
    { met: requirements.lowercase, text: 'Minúscula' },
    { met: requirements.number, text: 'Número' },
    { met: requirements.special, text: 'Especial (@$!%*?&#)' }
  ];

  const reqText = requirementsList
    .map(req => `${req.met ? '✓' : '✗'} ${req.text}`)
    .join(' • ');

  strengthText.textContent = `Fuerza: ${strength} | ${reqText}`;
  strengthText.style.color = color;
  
  DomUtils.show(strengthText);
}

// Verificar sesión al cargar la página
window.addEventListener('load', checkAuthStatus);

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
  initializeEventListeners();
}
