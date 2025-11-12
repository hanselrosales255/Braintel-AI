const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config');
const logger = require('./logger');
const requestContext = require('./middleware/requestContext');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const healthRouter = require('./routes/health');
const pagesRouter = require('./routes/pages');
const authRouter = require('./routes/auth');
const checkoutRouter = require('./routes/checkout');

function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet(config.security.helmet));
  app.use(cors(config.cors));
  app.use(compression(config.compression));
  app.use(requestContext);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const limiter = rateLimit({
    ...config.rateLimit,
    message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
  });

  app.use('/api', limiter);
  app.use('/create-checkout-session', limiter);

  app.use(
    express.static(path.join(__dirname, '..', 'public'), {
      maxAge: config.isProduction ? '1d' : 0,
      etag: true,
    })
  );

  app.use('/health', healthRouter);
  app.use('/api', authRouter);
  app.use('/', checkoutRouter);
  app.use('/', pagesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.on('error', (err) => {
    logger.error('Error no manejado en la aplicación Express', {
      message: err.message,
      stack: err.stack,
    });
  });

  return app;
}

module.exports = {
  createApp,
};
