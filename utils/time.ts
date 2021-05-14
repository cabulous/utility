import Storage from './storage';
import is from './is';

/**
 * Add leading zeros
 * @param {string|number} num
 * @param {number} length
 * @return {string}
 */
export function leadingZeros(num, length) {
  const digitLength = length || 2;
  const digit = String(num);
  if (digit.length > digitLength) {
    return digit;
  }
  return (Array(digitLength + 1).join('0') + digit).substr(-digitLength);
}

/**
 * @param {number} maxAge
 * @param {number|string} timestamp
 * @return {boolean}
 */
export function isExpired(maxAge, timestamp) {
  const now = +new Date();
  let aTimestamp = timestamp;

  if (is.string(timestamp)) {
    aTimestamp = parseInt(timestamp, 10);
  }

  return now - aTimestamp >= maxAge;
}

export function getRemainingTimeFromStorage(
  storage: Storage, timerKey: string,
) {
  const expires = storage.get(timerKey);
  if (is.nullOrUndefined(expires)) {
    return 0;
  }
  const end = parseInt(expires, 10);
  const now = +new Date();
  if (end <= now) {
    return 0;
  }
  return end - now;
}

export function setDeadlineToStorage(
  storage: Storage, timerKey: string, diff: number,
) {
  storage.set({ [timerKey]: +new Date() + diff });
}

// Time helpers
export const getHours = value => Math.trunc((value / 60 / 60) % 60);
export const getMinutes = value => Math.trunc((value / 60) % 60);
export const getSeconds = value => Math.trunc(value % 60);

// Format time to UI friendly string
export function formatTime(time = 0, displayHours = false, inverted = false) {
  // Bail if the value isn't a number
  if (!is.number(time)) {
    return formatTime(null, displayHours, inverted);
  }

  // Format time component to add leading zero
  const format = value => `0${value}`.slice(-2);
  // Breakdown to hours, mins, secs
  let hours = getHours(time);
  const mins = getMinutes(time);
  const secs = getSeconds(time);

  // Do we need to display hours?
  if (displayHours || hours > 0) {
    hours = `${hours}:`;
  } else {
    hours = '';
  }

  // Render
  return `${inverted && time > 0 ? '-' : ''}${hours}${format(mins)}:${format(
    secs)}`;
}
