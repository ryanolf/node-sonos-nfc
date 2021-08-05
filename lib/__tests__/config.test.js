import config from '../config.js';

const options = {
  sonos_http_api: 'http://localhost:5005',
  sonos_room: 'Living Room',
  log_level: 'info',
};

describe('Config', () => {
  beforeEach(() => {
    config._init();
  });

  test('Correctly gets a setting', () => {
    expect(config.get('sonos_room')).toBe('Living Room');
  });

  test('Correctly sets a setting', () => {
    config.set('sonos_room', 'Kitchen');

    expect(config.get('sonos_room')).toBe('Kitchen');
  });

  test('Throws when trying to get an unkown setting', () => {
    expect(() => {
      config.get('not_sonos_room');
    }).toThrow();
  });

  test('Throws when trying to set an unkown setting', () => {
    expect(() => {
      config.set('not_sonos_room');
    }).toThrow();
  });
});
