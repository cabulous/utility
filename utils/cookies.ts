// ==========================================================================
// Cookies utils
// ==========================================================================

export function readCookie(key: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${key}=`);
  if (parts.length === 2) {
    // @ts-ignore
    return parts.pop().split(';').shift();
  }
  return null;
}

export function writeCookie(key: string, value: string, seconds?: number) {
  let expires;
  if (seconds) {
    const date = new Date();
    date.setTime(date.getTime() + (seconds * 1000));
    expires = `; expires=${date.toUTCString()}`;
  } else {
    expires = '';
  }
  document.cookie = `${key}=${value}${expires}; path=/`;
}

export function removeCookie(key: string) {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}
