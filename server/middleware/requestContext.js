const { randomUUID } = require('crypto');
const logger = require('../logger');

function requestContext(req, res, next) {
  const requestId = randomUUID();
  const start = Date.now();

  req.context = {
    id: requestId,
    start,
    ip: req.ip,
  };
  req.log = logger.child({ requestId, path: req.path, method: req.method });
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`;
    const logMethod = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    req.log?.[logMethod](message, {
      statusCode: res.statusCode,
      duration,
      contentLength: res.getHeader('content-length'),
    });
  });

  next();
}

module.exports = requestContext;
