/**
 * ===================================
 * MIDDLEWARE DE AUTENTICACIÓN
 * ===================================
 * Middleware robusto para validar tokens y sesiones de usuarios
 */

const logger = require('../logger');
const { getUserFromToken, getActiveSubscription } = require('../services/supabaseService');

/**
 * Middleware para verificar autenticación
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar token con Supabase
    const { data, error } = await getUserFromToken(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido o expirado',
        code: 'AUTH_TOKEN_INVALID',
      });
    }

    // Agregar usuario a la request
    req.user = data.user;
    req.userId = data.user.id;
    req.userEmail = data.user.email;

    next();
  } catch (error) {
    logger.error('Error en middleware de autenticación', { error: error.message });
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al verificar autenticación',
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.userId = null;
      req.userEmail = null;
      return next();
    }

    const token = authHeader.substring(7);

    const { data } = await getUserFromToken(token);

    req.user = data?.user || null;
    req.userId = data?.user?.id || null;
    req.userEmail = data?.user?.email || null;

    next();
  } catch (error) {
    // En modo opcional, continuamos sin autenticación
    req.user = null;
    req.userId = null;
    req.userEmail = null;
    next();
  }
}

/**
 * Verificar si el usuario tiene suscripción activa
 */
async function requireActiveSubscription(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED',
      });
    }

    // Buscar suscripción activa
    const subscriptionResult = await getActiveSubscription(req.userId);

    if (subscriptionResult.error && subscriptionResult.error.code !== 'PGRST116') {
      throw subscriptionResult.error;
    }

    if (!subscriptionResult.data) {
      return res.status(403).json({
        error: 'Suscripción requerida',
        message: 'No tienes una suscripción activa',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    req.subscription = subscriptionResult.data;
    next();
  } catch (error) {
    logger.error('Error verificando suscripción', { error: error.message });
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al verificar suscripción',
      code: 'SUBSCRIPTION_ERROR',
    });
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireActiveSubscription,
};
