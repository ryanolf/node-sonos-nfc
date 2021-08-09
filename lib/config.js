import path from 'path';
import fs from 'fs';

/**
 * Simple key/value config store
 *
 * This class reads the usersettings JSON file upon startup, and returns
 * the values from memory afterwards.
 */
class Config {
  constructor() {
    this._init();
  }

  /**
   * Init should not be used by code, but can be used as a reset by tests
   */
  _init() {
    const values = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'usersettings.json'), 'utf-8')
    );

    this.sonos_room = values.sonos_room;
    this.sonos_http_api = values.sonos_http_api;
    this.log_level = values.log_level;
    this.reset_playback_options_on_queue =
      values.reset_playback_options_on_queue;
  }

  set(setting, value) {
    if (!this.hasOwnProperty(setting)) {
      throw new Error(`Can’t set values for unkown settings: ${setting}`);
    }

    this[setting] = value;
  }

  get(setting) {
    if (!this.hasOwnProperty(setting)) {
      throw new Error(`Unkown setting: ${setting}`);
    }

    return this[setting];
  }
}

// Export as singleton so all consumers will receive the same instance
export default new Config();
