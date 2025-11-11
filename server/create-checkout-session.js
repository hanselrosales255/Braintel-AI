/**
 * ===================================
 * BRAINCORE - SERVIDOR PRINCIPAL
 * ===================================
 * Servidor Express con mejores prácticas de seguridad,
 * logging, manejo de errores y middleware optimizado
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ===================================
// CONFIGURATION
// ===================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Validate required environment variables
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: ${envVar} no está definido en las variables de entorno`);
    process.exit(1);
  }
}

// Initialize services
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 3,
  timeout: 30000,
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ===================================
// EXPRESS APP SETUP
// ===================================
const app = express();

// Trust proxy (necesario si usas Heroku, Railway, etc.)
app.set('trust proxy', 1);

// ===================================
// MIDDLEWARE
// ===================================

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.tailwindcss.com',
          'https://cdn.jsdelivr.net',
          'https://js.stripe.com',
          'https://unpkg.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.tailwindcss.com',
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
        ],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: [
          "'self'",
          'https://ofqcvgwpokcwuclcqwcs.supabase.co',
          'wss://ofqcvgwpokcwuclcqwcs.supabase.co',
          'https://api.stripe.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (IS_PRODUCTION) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/create-checkout-session', limiter);

// Static files
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    maxAge: IS_PRODUCTION ? '1d' : 0,
    etag: true,
  })
);

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Logger personalizado
 */
const logger = {
  info: (message, meta = {}) => {
    console.log(`ℹ️  [INFO] ${message}`, meta);
  },
  error: (message, error = {}) => {
    console.error(`❌ [ERROR] ${message}`, error);
  },
  warn: (message, meta = {}) => {
    console.warn(`⚠️  [WARN] ${message}`, meta);
  },
  success: (message, meta = {}) => {
    console.log(`✅ [SUCCESS] ${message}`, meta);
  },
};

/**
 * Validar datos de entrada
 */
function validateCheckoutData(data) {
  const errors = [];

  if (!data.priceId || typeof data.priceId !== 'string') {
    errors.push('priceId es requerido y debe ser un string');
  }

  if (!data.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) {
    errors.push('email es requerido y debe ser válido');
  }

  if (!data.company_id || typeof data.company_id !== 'string') {
    errors.push('company_id es requerido');
  }

  return errors;
}

/**
 * Verificar que el precio existe en Stripe
 */
async function verifyStripePrice(priceId) {
  try {
    const price = await stripe.prices.retrieve(priceId);
    logger.info('Precio verificado en Stripe', { priceId: price.id, amount: price.unit_amount });
    return { valid: true, price };
  } catch (error) {
    logger.error('Error verificando precio en Stripe', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Obtener o crear customer en Stripe
 */
async function getOrCreateStripeCustomer(email) {
  try {
    // Buscar customer existente
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      logger.info('Customer existente encontrado', { customerId: existingCustomers.data[0].id });
      return existingCustomers.data[0].id;
    }

    // Crear nuevo customer
    const newCustomer = await stripe.customers.create({
      email,
      metadata: {
        source: 'braincore_web_app',
        created_at: new Date().toISOString(),
      },
    });

    logger.success('Nuevo customer creado en Stripe', { customerId: newCustomer.id });
    return newCustomer.id;
  } catch (error) {
    logger.error('Error gestionando customer en Stripe', error);
    throw error;
  }
}

// ===================================
// ROUTES
// ===================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

// Main routes (HTML pages)
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '..', 'public') });
});

app.get('/auth', (req, res) => {
  res.sendFile('auth.html', { root: path.join(__dirname, '..', 'public') });
});

app.get('/dashboard', (req, res) => {
  res.sendFile('dashboard.html', { root: path.join(__dirname, '..', 'public') });
});

// ===================================
// AUTHENTICATION ENDPOINTS
// ===================================

// Verificar sesión actual
app.get('/api/auth/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ user: null, session: null });
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.json({ user: null, session: null });
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Obtener suscripción activa
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    res.json({
      user,
      profile,
      subscription,
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    logger.error('Error verificando sesión', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al verificar sesión',
    });
  }
});

// Endpoint para obtener suscripción activa
app.get('/api/subscription/active', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación requerido',
      });
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido',
      });
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw subError;
    }

    res.json({
      subscription: subscription || null,
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    logger.error('Error obteniendo suscripción', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener suscripción',
    });
  }
});

// ===================================
// CHECKOUT ENDPOINTS
// ===================================

// Checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  const requestId = Date.now();

  try {
    logger.info(`[${requestId}] Nueva solicitud de checkout`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    const { priceId, customer_email, profile_id, company_id } = req.body;

    // Validar datos de entrada
    const validationErrors = validateCheckoutData(req.body);
    if (validationErrors.length > 0) {
      logger.warn(`[${requestId}] Datos de entrada inválidos`, { errors: validationErrors });
      return res.status(400).json({
        error: 'Datos inválidos',
        details: validationErrors,
      });
    }

    // Verificar precio en Stripe
    const priceVerification = await verifyStripePrice(priceId);
    if (!priceVerification.valid) {
      logger.error(`[${requestId}] Precio no encontrado en Stripe`, { priceId });
      return res.status(400).json({
        error: `El plan seleccionado no está disponible`,
        code: 'INVALID_PRICE',
      });
    }

    // Obtener o crear customer
    const stripeCustomerId = await getOrCreateStripeCustomer(customer_email);

    // Crear sesión de Stripe Checkout
    logger.info(`[${requestId}] Creando sesión de Stripe Checkout`, {
      priceId,
      customerId: stripeCustomerId,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: stripeCustomerId,
      client_reference_id: company_id,
      metadata: {
        company_id,
        profile_id: profile_id || '',
        environment: NODE_ENV,
      },
      success_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/#precios`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      subscription_data: {
        metadata: {
          company_id,
          profile_id: profile_id || '',
        },
      },
    });

    // Guardar registro temporal en Supabase
    try {
      const { error: dbError } = await supabase.from('subscriptions').insert([
        {
          user_id: profile_id || null,
          company_id: company_id || null,
          stripe_customer_id: stripeCustomerId,
          stripe_session_id: session.id,
          price_id: priceId,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) {
        logger.warn(`[${requestId}] Error guardando en Supabase (no crítico)`, dbError);
      }
    } catch (dbError) {
      logger.warn(`[${requestId}] Error con Supabase (continuando)`, dbError);
    }

    logger.success(`[${requestId}] Sesión creada exitosamente`, {
      sessionId: session.id,
      url: session.url,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    logger.error(`[${requestId}] Error en checkout`, {
      message: error.message,
      stack: error.stack,
    });

    // Determinar código de error apropiado
    let statusCode = 500;
    let errorMessage = 'Error procesando el pago';

    if (error.type === 'StripeCardError') {
      statusCode = 400;
      errorMessage = 'Error con la tarjeta de crédito';
    } else if (error.type === 'StripeInvalidRequestError') {
      statusCode = 400;
      errorMessage = 'Solicitud inválida';
    }

    res.status(statusCode).json({
      error: errorMessage,
      code: error.code || 'CHECKOUT_ERROR',
      ...(IS_PRODUCTION ? {} : { details: error.message }),
    });
  }
});

// ===================================
// ERROR HANDLING
// ===================================

// 404 handler
app.use((req, res) => {
  logger.warn('Ruta no encontrada', { path: req.path });
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error no manejado', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(err.status || 500).json({
    error: IS_PRODUCTION ? 'Error interno del servidor' : err.message,
    ...(IS_PRODUCTION ? {} : { stack: err.stack }),
  });
});

// ===================================
// GRACEFUL SHUTDOWN
// ===================================

const gracefulShutdown = () => {
  logger.info('Recibiendo señal de cierre, cerrando servidor gracefully...');

  server.close(() => {
    logger.success('Servidor cerrado correctamente');
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error('No se pudo cerrar el servidor gracefully, forzando cierre');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada', { reason, promise });
  process.exit(1);
});

// ===================================
// START SERVER
// ===================================

const server = app.listen(PORT, () => {
  logger.success(`
╔═══════════════════════════════════════════╗
║                                           ║
║        🧠 BRAINCORE SERVER RUNNING       ║
║                                           ║
╠═══════════════════════════════════════════╣
║                                           ║
║  Environment: ${NODE_ENV.padEnd(27)}   ║
║  Port:        ${PORT.toString().padEnd(27)}   ║
║  URL:         http://localhost:${PORT}       ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);

  logger.info('Servicios inicializados:', {
    stripe: '✅ Configurado',
    supabase: '✅ Configurado',
    rateLimit: '✅ Activo',
    compression: '✅ Activo',
    security: '✅ Helmet activo',
  });
});

module.exports = app;
