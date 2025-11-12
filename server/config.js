const { config: loadEnv } = require('dotenv');
const os = require('os');

loadEnv();

function assertEnv(varName) {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is required`);
  }
}

['STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].forEach(assertEnv);

const NODE_ENV = process.env.NODE_ENV || 'development';

function parseNumber(value, fallback) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCorsOrigins(value) {
  if (!value || value === '*') return '*';
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const port = parseNumber(process.env.PORT, 3000);
const rateLimitWindowMs = parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const rateLimitMax = parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100);

const config = {
  env: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  port,
  appUrl: process.env.APP_URL || `http://localhost:${port}`,
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true,
    optionsSuccessStatus: 200,
  },
  security: {
    helmet: {
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
            process.env.SUPABASE_URL,
            process.env.SUPABASE_URL?.replace('https://', 'wss://'),
            'https://api.stripe.com',
          ].filter(Boolean),
          frameSrc: ["'self'", 'https://js.stripe.com'],
          fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
    },
  },
  compression: {
    threshold: 0,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    apiVersion: '2023-10-16',
    maxNetworkRetries: parseNumber(process.env.STRIPE_MAX_RETRIES, 3),
    timeout: parseNumber(process.env.STRIPE_TIMEOUT_MS, 30000),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  rateLimit: {
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  },
  metrics: {
    host: os.hostname(),
  },
  webhooks: {
    stripePort: parseNumber(process.env.STRIPE_WEBHOOK_PORT, 4243),
    n8nPort: parseNumber(process.env.N8N_WEBHOOK_PORT, 3000),
  },
};

module.exports = config;
