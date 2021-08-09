import fetch from 'node-fetch';
import logger from './logger.js';
import config from './config.js';
import get_sonos_url from './get_sonos_url.js';

const reset_playback_options = async () => {
  if (!config.get('reset_playback_options_on_queue')) {
    return;
  }

  logger.info(
    'Resetting Sonos queue (clear, turn off repeat, shuffle, crossfade)'
  );

  await Promise.all([
    fetch(get_sonos_url('repeat/off')),
    fetch(get_sonos_url('shuffle/off')),
    fetch(get_sonos_url('crossfade/off')),
    fetch(get_sonos_url('clearqueue')),
  ]).catch(() => {
    throw new Error(`Could not reset playback options`);
  });

  // Wait a bit to allow these playback options to actually be reset
  await new Promise((resolve) => setTimeout(resolve, 200));
};

export default reset_playback_options;
