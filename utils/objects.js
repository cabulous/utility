// ==========================================================================
// Object utils
// ==========================================================================

import is from './is';
import { toCamelCase } from './strings';

// Clone nested objects
export function cloneDeep(object) {
  return JSON.parse(JSON.stringify(object));
}

// Get a nested value in an object
export function getDeep(object, path) {
  return path.split('.').reduce((obj, key) => obj && obj[key], object);
}

// Deep extend destination object with N more objects
export function extend(target = {}, ...sources) {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (!is.object(source)) {
    return target;
  }

  Object.keys(source).forEach(key => {
    if (is.object(source[key])) {
      if (!Object.keys(target).includes(key)) {
        Object.assign(target, { [key]: {} });
      }

      extend(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  });

  return extend(target, ...sources);
}

export function toCamelCaseKeyShallow(object = {}) {
  const newObject = {};
  let newKey = '';

  if (object instanceof Array) {
    return object.map(value => {
      if (typeof value === 'object') {
        return toCamelCaseKeyShallow(value);
      }
      return value;
    });
  }

  Object.keys(object).forEach(origKey => {
    newKey = toCamelCase(origKey);
    newObject[newKey] = object[origKey];
  });

  return newObject;
}

export function toCamelCaseKeyDeep(object = {}) {
  const newObject = {};
  let newKey = '';
  let origValue;

  if (object instanceof Array) {
    return object.map(value => {
      if (typeof value === 'object') {
        return toCamelCaseKeyDeep(value);
      }
      return value;
    });
  }

  Object.keys(object).forEach(origKey => {
    newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) ||
      origKey).toString();
    origValue = object[origKey];
    if (origValue instanceof Array ||
      (origValue !== null && origValue.constructor === Object)) {
      origValue = toCamelCaseKeyDeep(origValue);
    }

    newObject[newKey] = origValue;
  });

  return newObject;
}

/**
 * Filter keys in an object based suffix
 *  - trim the suffix
 *  - create a new object with standard keys
 * @param {Object} object
 * @param {string} suffix
 * @return {{}}
 */
export function filterKeysBasedOnSuffix(object, suffix) {
  const newObject = {};
  let standardKey = '';
  Object.keys(object).forEach(key => {
    if (key.endsWith(suffix)) {
      standardKey = key.substring(0, key.length - suffix.length);
      newObject[standardKey] = object[key];
    }
  });
  return newObject;
}
