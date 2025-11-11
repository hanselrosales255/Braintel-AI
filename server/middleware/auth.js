/**
 * ===================================
 * MIDDLEWARE DE AUTENTICACIÓN
 * ===================================
 * Middleware robusto para validar tokens y sesiones de usuarios
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido o expirado',
        code: 'AUTH_TOKEN_INVALID',
      });
    }

    // Agregar usuario a la request
    req.user = user;
    req.userId = user.id;
    req.userEmail = user.email;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
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

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    req.user = user || null;
    req.userId = user?.id || null;
    req.userEmail = user?.email || null;

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
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return res.status(403).json({
        error: 'Suscripción requerida',
        message: 'No tienes una suscripción activa',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error verificando suscripción:', error);
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
  supabase,
};
