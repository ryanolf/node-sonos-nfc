import { NFC } from 'nfc-pcsc';
import sonos_nfc from './lib/sonos_nfc.js';

const nfc = new NFC();

sonos_nfc(nfc);
