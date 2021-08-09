import get_sonos_url from '../get_sonos_url.js';
import config from '../config.js';

jest.mock('../config.js');

describe('get_sonos_url', () => {
  test('Prepends instruction with endpoint URL and room', () => {
    const instruction = `spotify/now/spotify:abc123`;
    const service_type = 'spotify';

    config.get.mockImplementation((setting) => setting);

    expect(get_sonos_url(instruction, service_type)).toBe(
      `sonos_http_api/sonos_room/${instruction}`
    );
  });

  test('Returns instruction without modification if it’s already an HTTP url', () => {
    const instruction = 'http://my-sonos-endpoint:5000/party-mode';
    const service_type = 'completeurl';

    expect(get_sonos_url(instruction, service_type)).toBe(instruction);
  });
});
