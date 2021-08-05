import pkg from 'signale';
const { Signale } = pkg;

const options = {
  logLevel: 'info',
};

const signale = new Signale(options);

// This is just a simple interface
const logger = {
  debug: signale.debug,
  info: signale.info,
  log: signale.log,
  error: signale.error,
  success: signale.success,
  warn: signale.warn,
};

export default logger;
