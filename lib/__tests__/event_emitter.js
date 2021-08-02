/**
 * Simple event emitter used for testing, use the emit method to
 * simulate events in tests.
 */
class EventEmitter {
  events = {};

  constructor(properties = {}) {
    Object.keys(properties).forEach((key) => {
      this[key] = properties[key];
    });
  }

  on(event, callback) {
    this.events[event] = Array.isArray(this.events[event])
      ? [...this.events[event], callback]
      : [callback];
  }

  emit(event, ...args) {
    if (!Array.isArray(this.events[event])) {
      return Promise.resolve();
    }

    return Promise.all(
      this.events[event].map(async (callback) => {
        await callback(...args);
      })
    );
  }
}

export default EventEmitter;
