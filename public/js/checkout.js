/**
 * Checkout.js - Gestión de pagos con Stripe
 * Utiliza las utilidades compartidas para un código más limpio y mantenible
 */

import { supabaseService } from './utils/supabaseClient.js';
import { STRIPE_CONFIG, APP_CONFIG } from './utils/constants.js';
import { HttpUtils, NotificationUtils, ErrorUtils, DomUtils } from './utils/helpers.js';

// Inicializar Stripe con la clave pública
const stripe = Stripe(STRIPE_CONFIG.publicKey);

/**
 * Maneja el clic en un botón de checkout
 * @param {Event} e - Evento del click
 */
async function handleCheckoutClick(e) {
  e.preventDefault();

  const button = e.currentTarget;
  const priceId = button.dataset.priceId;

  console.log('🛒 Iniciando proceso de checkout...', { priceId });

  // Validar que el precio existe en nuestra configuración
  const planName = Object.keys(STRIPE_CONFIG.prices).find(
    (key) => STRIPE_CONFIG.prices[key] === priceId
  );

  if (!planName) {
    console.error('❌ Plan no válido:', priceId);
    NotificationUtils.error('Plan no válido. Por favor, contacta con soporte.');
    return;
  }

  console.log('✓ Plan válido:', planName);

  try {
    // Verificar autenticación
    console.log('🔐 Verificando autenticación...');
    const result = await supabaseService.getCurrentUser();

    if (!result.user) {
      console.warn('⚠️ Usuario no autenticado');
      NotificationUtils.warning('Debes iniciar sesión para continuar');
      setTimeout(() => {
        window.location.href = APP_CONFIG.routes.auth;
      }, 1500);
      return;
    }

    const user = result.user;
    console.log('✅ Usuario autenticado:', { userId: user.id, email: user.email });

    // Mostrar estado de carga en el botón
    DomUtils.setButtonLoading(button, true, 'Procesando...');

    console.log('📡 Creando sesión de checkout en Stripe...');

    // Crear sesión de checkout en el servidor
    const response = await HttpUtils.post(APP_CONFIG.endpoints.createCheckout, {
      priceId,
      customer_email: user.email,
      profile_id: user.id,
      company_id: user.id,
    });

    if (!response.sessionId) {
      console.error('❌ No se recibió sessionId del servidor');
      throw new Error('No se recibió sessionId del servidor');
    }

    console.log('✅ Sesión de checkout creada:', response.sessionId.substring(0, 20) + '...');
    console.log('🚀 Redirigiendo a Stripe Checkout...');

    // Redirigir a Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: response.sessionId,
    });

    if (error) {
      console.error('❌ Error de Stripe:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error en handleCheckoutClick:', error);

    // Mensajes de error personalizados
    let errorMessage = 'Error al procesar el pago. Inténtalo de nuevo.';

    if (error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
    } else if (error.message?.includes('sessionId')) {
      errorMessage = 'Error al crear la sesión de pago. Por favor, contacta con soporte.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    ErrorUtils.log(error, {
      context: 'handleCheckoutClick',
      priceId,
      planName,
    });

    NotificationUtils.error(errorMessage);

    // Restaurar el botón
    DomUtils.setButtonLoading(button, false);
  }
}

/**
 * Inicializa los listeners de los botones de checkout
 */
function initializeCheckoutButtons() {
  const checkoutButtons = DomUtils.$$('button[data-price-id]');

  if (checkoutButtons.length === 0) {
    console.warn('No se encontraron botones de checkout en la página');
    return;
  }

  checkoutButtons.forEach((button) => {
    button.addEventListener('click', handleCheckoutClick);
  });

  console.log(`✓ Inicializados ${checkoutButtons.length} botones de checkout`);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCheckoutButtons);
} else {
  initializeCheckoutButtons();
}
