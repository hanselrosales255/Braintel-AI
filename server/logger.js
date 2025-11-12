const { createLogger, format, transports } = require('winston');
const config = require('./config');

const baseFormat = [format.timestamp(), format.errors({ stack: true })];

const developmentFormat = format.combine(
  ...baseFormat,
  format.colorize({ all: true }),
  format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const context = Object.keys(meta).length ? JSON.stringify(meta) : '';
    if (stack) {
      return `${timestamp} [${level}]: ${message} ${context}\n${stack}`.trim();
    }
    return `${timestamp} [${level}]: ${message} ${context}`.trim();
  })
);

const productionFormat = format.combine(...baseFormat, format.json());

const logger = createLogger({
  level: config.isProduction ? 'info' : 'debug',
  format: config.isProduction ? productionFormat : developmentFormat,
  defaultMeta: { service: 'braincore-server' },
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
