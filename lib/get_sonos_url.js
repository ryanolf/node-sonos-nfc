import config from './config.js';

const get_sonos_url = (sonos_instruction, service_type) => {
  if (service_type === 'completeurl') {
    return sonos_instruction;
  }

  return `${config.get('sonos_http_api')}/${config.get(
    'sonos_room'
  )}/${sonos_instruction}`;
};

export default get_sonos_url;
