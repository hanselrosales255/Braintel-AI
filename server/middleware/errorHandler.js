const config = require('../config');
const logger = require('../logger');

function notFoundHandler(req, res, next) {
  const error = new Error('Ruta no encontrada');
  error.status = 404;
  next(error);
}

function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const response = {
    error: status === 404 ? 'Ruta no encontrada' : 'Error interno del servidor',
    requestId: req.context?.id,
  };

  const shouldLog = status >= 500 || !err.skipLogging;
  if (shouldLog) {
    req.log?.error(err.message, {
      status,
      stack: err.stack,
    }) || logger.error(err.message, { status, stack: err.stack });
  }

  if (!config.isProduction) {
    response.details = err.message;
    if (err.stack) {
      response.stack = err.stack.split('\n');
    }
  }

  res.status(status).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
