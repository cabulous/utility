import is from './is';

/**
 * Convert Hex colors to RGB string
 * @param {string} aHex
 * @return {string}
 */
export function hexTORgb(aHex) {
  // A correct hex color looks like this: #123456
  let hex = aHex;
  if (hex.length > 7) {
    hex = hex.substring(0, 7);
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const rgb = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };

  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

/**
 * @param H
 * @return {{s: number, h: number, l: number}}
 */
export function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0;
  let g = 0;
  let b = 0;

  if (H.length === 4) {
    r = `0x${H[1]}${H[1]}`;
    g = `0x${H[2]}${H[2]}`;
    b = `0x${H[3]}${H[3]}`;
  } else if (H.length === 7) {
    r = `0x${H[1]}${H[2]}`;
    g = `0x${H[3]}${H[4]}`;
    b = `0x${H[5]}${H[6]}`;
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0)
    h = 0;
  else if (cmax === r)
    h = ((g - b) / delta) % 6;
  else if (cmax === g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { s, h, l };
}

/**
 * @param {string} H
 * @param {number} percentage
 * @return {string}
 */
export function lightenInHSL(H, percentage) {
  const { s, h } = hexToHSL(H);
  let { l } = hexToHSL(H);
  l = Math.max(l * (1 + percentage), 1);
  return `hsl(${h},${s}%,${l}%)`;
}

/**
 * Check whether a color is white
 * @param {string} aHex
 * @return {boolean}
 */
export function isWhite(aHex) {
  let hex = aHex.toLowerCase();

  if (hex.length > 7) {
    hex = hex.substring(0, 7);
  }

  return ['#fff', '#ffffff'].includes(hex);
}

/**
 * Return the first non-white color from an array
 * @param {string[]} hexColors
 * @param {string} fallbackHexColor
 * @return {string}
 */
export function getFirstNonWhiteColor(hexColors, fallbackHexColor = '#ffffff') {
  if (!is.array(hexColors)) {
    throw new Error(`Expected an array, but got ${hexColors}`);
  }

  for (let i = 0; i < hexColors.length; i += 1) {
    if (!isWhite(hexColors[i])) {
      return hexColors[i];
    }
  }

  return fallbackHexColor;
}
