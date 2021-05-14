import is from './is';

// Generate a random ID
export function generateId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 10000)}`;
}

// Format string
export function format(input, ...args) {
  if (is.empty(input)) {
    return input;
  }

  return input.toString().replace(/{(\d+)}/g, (match, i) => args[i].toString());
}

// Get percentage
export function getPercentage(current, max) {
  if (current === 0 || max === 0 || Number.isNaN(current) ||
    Number.isNaN(max)) {
    return 0;
  }

  return ((current / max) * 100).toFixed(2);
}

// Replace all occurrences of a string in a string
export function replaceAll(input = '', find = '', replace = '') {
  return input.replace(
    new RegExp(find.toString().replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'),
      'g'),
    replace.toString(),
  );
}

// Convert to title case
export function toTitleCase(input = '') {
  return input.toString()
    .replace(/\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase());
}

// Convert string to pascalCase
export function toPascalCase(input = '') {
  let string = input.toString();

  // Convert kebab case
  string = replaceAll(string, '-', ' ');

  // Convert snake case
  string = replaceAll(string, '_', ' ');

  // Convert to title case
  string = toTitleCase(string);

  // Convert to pascal case
  return replaceAll(string, ' ', '');
}

// Convert string to camelCase
export function toCamelCase(input = '') {
  let string = input.toString();

  // Convert to pascal case
  string = toPascalCase(string);

  // Convert first character to lowercase
  return string.charAt(0).toLowerCase() + string.slice(1);
}

// Convert underscore to space
export function underscoreToSpace(input = '') {
  return input.toString().replace(/_/g, ' ');
}

// Convert font name to Google font naming convention
export function toGoogleFontName(input = '') {
  return input.toString().replace(/ /g, '+');
}

// Remove HTML from a string
export function stripHTML(source) {
  const fragment = document.createDocumentFragment();
  const element = document.createElement('div');
  fragment.appendChild(element);
  element.innerHTML = source;
  return fragment.firstChild.innerText;
}

// Get outerHTML, also works for DocumentFragment
export function getHTML(element) {
  const wrapper = document.createElement('div');
  wrapper.appendChild(element);
  return wrapper.innerHTML;
}

/**
 * Encode the HTML entities like "&amp;"
 * @param {string} str
 * @return {string}
 */
export function encodeHtmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} hex
 * @return {string}
 */
export function hexToRgbA(hex) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') +
      ',1)';
  }
  throw new Error(`expect a hex but got ${hex}`);
}

export function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export function rgbToHex(r, g, b) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function trimLeadingHex(string: string) {
  const firstChar = string[0];

  if (firstChar !== '#') {
    return string;
  }

  return string.substring(1, string.length);
}

export function generateRandomState() {
  if (window.crypto) {
    const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    array = array.map((x) => validChars.charCodeAt(x % validChars.length));
    // @ts-ignore
    return String.fromCharCode.apply(null, array);
  }

  // A fallback random string
  return 'm7jbs5NW6V2vgvhJIwCI4NfPHT4611iT';
}
