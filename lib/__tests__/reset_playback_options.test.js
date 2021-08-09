import config from '../config.js';
import get_sonos_url from '../get_sonos_url.js';
import reset_playback_options from '../reset_playback_options.js';

jest.mock('../config.js');
jest.mock('../logger.js');

describe('reset_playback_options', () => {
  test('Playback options are reset when function is called', async () => {
    config.get.mockImplementation((setting) => {
      if (setting === 'reset_playback_options_on_queue') {
        return true;
      }
    });

    fetch.mockResponse(() => {
      return Promise.resolve({
        ok: true,
      });
    });

    await reset_playback_options('spotify');

    expect(fetch).toHaveBeenCalledWith(get_sonos_url('repeat/off'));
    expect(fetch).toHaveBeenCalledWith(get_sonos_url('shuffle/off'));
    expect(fetch).toHaveBeenCalledWith(get_sonos_url('crossfade/off'));
    expect(fetch).toHaveBeenCalledWith(get_sonos_url('clearqueue'));
  });

  test('Playback options are not reset when config setting ’reset_playback_options_on_queue’ is false', async () => {
    config.get.mockImplementation((setting) => {
      if (setting === 'reset_playback_options_on_queue') {
        return false;
      }
    });

    await reset_playback_options('spotify');

    expect(fetch).not.toHaveBeenCalledWith();
  });
});
