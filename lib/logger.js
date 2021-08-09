import pkg from 'signale';
import config from './config';
const { Signale } = pkg;

const LOG_LEVELS = [
  'info', // Displays all messages from all loggers.
  'warn', // Displays messages only from the warn, error & fatal loggers.
  'error', // Displays messages only from the error & fatal loggers.
  'off', // Disables logging entirely
];

const getLogLevel = () => {
  const logLevel = config.get('log_level');

  if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(`Unsupported log_level configured: ${logLevel}`);
  }

  return logLevel;
};

const signale = new Signale({
  disabled: getLogLevel() === 'off',
  logLevel: getLogLevel(),
});

// This is just a simple interface
const logger = {
  info: signale.info,
  error: signale.error,
  warn: signale.warn,
};

export default logger;
