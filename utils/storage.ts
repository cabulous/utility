import assignIn from 'lodash/assignIn';
import is from './is';

class Storage {
  private readonly enabled: boolean;

  private readonly key: string;

  private readonly TIMESTAMP_KEY: string;

  private MAX_AGE_MILLISECONDS: number;

  constructor(key: string) {
    this.enabled = true;
    this.key = key;
    this.TIMESTAMP_KEY = 'timestamp';
    this.MAX_AGE_MILLISECONDS = 24 * 60 * 60 * 1000;

    this.setTimestampIfNotPresent();
  }

  // Check for actual support (see if we can use it0
  static get supported() {
    try {
      if (!('localStorage' in window)) {
        return false;
      }

      const test = '___test';

      // Try to use it (it might be disabled, e.g. user is in private mode)
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);

      return true;
    } catch (e) {
      return false;
    }
  }

  get(key: string = '') {
    if (!Storage.supported || !this.enabled) {
      return null;
    }

    const store = window.localStorage.getItem(this.key);

    if (is.empty(store)) {
      return null;
    }

    // @ts-ignore
    const json = JSON.parse(store);

    return is.string(key) && key.length ? json[key] : json;
  }

  set(object: {}) {
    // Bail if we don't have localStorage support or it's disabled
    if (!Storage.supported || !this.enabled) {
      return;
    }

    // Can only store objects
    if (!is.object(object)) {
      return;
    }

    // Get current storage
    let storage = this.get();

    // Default to empty object
    if (is.empty(storage)) {
      storage = {};
    }

    // Update the working copy of the values
    assignIn(storage, object);

    // Update storage
    window.localStorage.setItem(this.key, JSON.stringify(storage));
  }

  /**
   * @param {number} maxAge
   * @return {boolean}
   */
  isExpired(maxAge = this.MAX_AGE_MILLISECONDS) {
    let timestamp = this.get(this.TIMESTAMP_KEY);
    const now = +new Date();

    if (is.nullOrUndefined(timestamp)) {
      this.set({ [this.TIMESTAMP_KEY]: now });
      return false;
    }

    if (is.string(timestamp)) {
      timestamp = parseInt(timestamp, 10);
    }

    return now - timestamp >= maxAge;
  }

  refresh() {
    window.localStorage.removeItem(this.key);
    this.set({ [this.TIMESTAMP_KEY]: +new Date() });
  }

  setTimestampIfNotPresent() {
    const timestamp = this.get(this.TIMESTAMP_KEY);

    if (is.nullOrUndefined(timestamp)) {
      this.set({ [this.TIMESTAMP_KEY]: +new Date() });
    }
  }
}

export default Storage;
