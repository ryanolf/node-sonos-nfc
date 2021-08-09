import process_sonos_command from '../process_sonos_command.js';
import get_sonos_url from '../get_sonos_url.js';
import logger from '../logger.js';
import reset_playback_options from '../reset_playback_options.js';

jest.mock('../logger.js');
jest.mock('../reset_playback_options.js');

describe('process_sonos_command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const identifier = 'my-awesome-url';

  const commands = [
    {
      service: 'Apple Music format #1',
      input: `apple:${identifier}`,
      expected_url: get_sonos_url(`applemusic/now/${identifier}`, 'applemusic'),
    },
    {
      service: 'Apple Music format #2',
      input: `applemusic:${identifier}`,
      expected_url: get_sonos_url(`applemusic/now/${identifier}`, 'applemusic'),
    },
    {
      service: 'Local Music Library',
      input: `http:${identifier}`,
      expected_url: get_sonos_url(`http:${identifier}`, 'completeurl'),
    },
    {
      service: 'Spotify',
      input: `spotify:${identifier}`,
      expected_url: get_sonos_url(
        `spotify/now/spotify:${identifier}`,
        'spotify'
      ),
    },
    {
      service: 'Amazon Music',
      input: `amazonmusic:${identifier}`,
      expected_url: get_sonos_url(
        `amazonmusic/now/${identifier}`,
        'amazonmusic'
      ),
    },
    {
      service: 'TuneIn',
      input: `tunein:${identifier}`,
      expected_url: get_sonos_url(`tunein/now/tunein:${identifier}`, 'tunein'),
    },
    {
      service: 'Sonos Playlist',
      input: `playlist:${identifier}`,
      expected_url: get_sonos_url(`playlist/${identifier}`, 'sonos_playlist'),
    },
  ];

  test.each(commands)(
    'Processes $service URLs',
    async ({ input, expected_url }) => {
      fetch.mockResponse(() => {
        return Promise.resolve({
          ok: true,
          body: JSON.stringify({ message: 'Hello from the mock' }),
        });
      });

      await process_sonos_command(input);

      expect(fetch).toHaveBeenCalledWith(expected_url);
    }
  );

  test('Processes playback commands', async () => {
    fetch.mockResponse(() => {
      return Promise.resolve({
        ok: true,
        body: JSON.stringify({ message: 'Hello from the mock' }),
      });
    });

    await process_sonos_command(`command:${identifier}`);

    const expected_url = get_sonos_url(identifier, 'command');

    expect(fetch).toHaveBeenCalledWith(expected_url);
  });

  test('Processes room change commands', async () => {
    const sonos_room = 'Wine Cellar';

    await process_sonos_command(`room:${sonos_room}`);

    expect(logger.info).toHaveBeenCalledWith(
      `Sonos room changed to ${sonos_room}`
    );
  });

  test('Ignores unknown services', async () => {
    await process_sonos_command(`nonexistingservice:${identifier}`);

    const expected_url = get_sonos_url('command', identifier);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Service type not recognised')
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  test('Throws when request is unsuccessful', async () => {
    fetch.mockResponse(() => {
      return Promise.resolve({
        ok: false,
        status: 422,
        body: JSON.stringify({ error: 'Oh no' }),
      });
    });

    try {
      await process_sonos_command(`command:${identifier}`);
    } catch (error) {
      expect(error).toEqual(
        new Error(`Unexpected response while sending instruction: 422`)
      );
    }
  });

  test('reset_playback_options is not called for commands', async () => {
    fetch.mockResponse(() => {
      return Promise.resolve({
        ok: true,
        body: JSON.stringify({ message: 'Hello from the mock' }),
      });
    });

    await process_sonos_command(`command:play-some-music`);

    expect(reset_playback_options).not.toHaveBeenCalled();
  });
});
