const { createApp } = require('./app');
const config = require('./config');
const logger = require('./logger');

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info('BrainCore server en ejecución', {
    port: config.port,
    environment: config.env,
    url: `${config.appUrl}`,
  });
});

function gracefulShutdown(signal) {
  logger.warn(`Recibida señal ${signal}, deteniendo servidor...`);

  server.close(() => {
    logger.info('Servidor detenido correctamente');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Cierre forzado tras 10s sin completar conexiones pendientes');
    process.exit(1);
  }, 10000).unref();
}

['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada', { reason });
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada', { message: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

module.exports = app;
