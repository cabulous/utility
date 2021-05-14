// ==========================================================================
// URL utils
// ==========================================================================

import is from './is';
import { getLocale } from './shopify';

/**
 * Parse a string to a URL object
 * @param {string} input - the URL to be parsed
 * @param {Boolean} safe - failsafe parsing
 */
export function parseUrl(input, safe = true) {
  let url = input;

  if (safe) {
    const parser = document.createElement('a');
    parser.href = url;
    url = parser.href;
  }

  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
}

// Convert object to URLSearchParams
export function buildUrlParams(input) {
  const params = new URLSearchParams();

  if (is.object(input)) {
    Object.entries(input).forEach(([key, value]) => {
      params.set(key, value);
    });
  }

  return params;
}

export function getUrlEncodedData(input) {
  const formBody = [];
  let keyEncoded;
  let valueEncoded;
  Object.keys(input).forEach(key => {
    keyEncoded = encodeURIComponent(key);
    valueEncoded = encodeURIComponent(input[key]);
    formBody.push(`${keyEncoded}=${valueEncoded}`);
  });
  return formBody.join('&');
}

export function getPathnameWithSearch() {
  const { pathname, search = '' } = window.location;
  if (is.nullOrUndefined(pathname)) {
    throw new Error(`Expect a pathname but got ${pathname}`);
  }
  const locale = getLocale(pathname);
  if (is.nullOrUndefined(locale)) {
    return pathname + search;
  }
  if (pathname === `/${locale}`) {
    return '/';
  }

  return pathname.replace(`/${locale}`, '') + search;
}

/**
 * Redirect to a new URL
 *  - Using replace() is better
 *  - https://stackoverflow.com/questions/4744751/how-do-i-redirect-with-javascript
 * @param {string} url
 */
export function redirectTo(url) {
  if (!is.string(url)) {
    throw new Error(`wrong param type: expect a string but got ${typeof url}`);
  }

  window.location.replace(url);
}
