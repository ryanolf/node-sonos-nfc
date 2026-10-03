import { NFC } from 'nfc-pcsc';
import sonos_nfc from './lib/sonos_nfc.js';

// nfc-pcsc silently drops some errors (e.g. failing to connect to a card) and only reports them
// through its logger, so print its errors and warnings
const logger = {
  log() {},
  debug() {},
  info() {},
  warn: console.warn,
  error: console.error,
};

const nfc = new NFC(logger);

sonos_nfc(nfc);
