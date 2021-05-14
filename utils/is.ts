// ==========================================================================
// Type checking utils
// ==========================================================================

const getConstructor = (input: any) => (
  input !== null
  && typeof input !== 'undefined' ? input.constructor : null
);
const instanceOf = (input: any, constructor: any) => Boolean(
  input && constructor && input instanceof constructor,
);
const isNullOrUndefined = (input: any): input is null | undefined => (
  input === null || typeof input === 'undefined'
);
const isObject = (input: any) => getConstructor(input) === Object;
const isNumber = (input: any): input is number => (
  getConstructor(input) === Number && !Number.isNaN(input)
);
const isString = (input: any):
  input is string => getConstructor(input) === String;
const isBoolean = (input: any):
  input is boolean => getConstructor(input) === Boolean;
const isFunction = (input: any) => getConstructor(input) === Function;
const isArray = (input: any) => Array.isArray(input);
const isWeakMap = (input: any) => instanceOf(input, WeakMap);
const isNodeList = (input: any) => instanceOf(input, NodeList);
const isElement = (input: any) => instanceOf(input, Element);
const isTextNode = (input: any) => getConstructor(input) === Text;
const isEvent = (input: any) => instanceOf(input, Event);
const isKeyboardEvent = (input: any) => instanceOf(input, KeyboardEvent);
const isCue = (input: any) => (
  instanceOf(input, window.TextTrackCue) || instanceOf(input, window.VTTCue)
);
const isTrack = (input: any) => (
  instanceOf(input, TextTrack)
  || (!isNullOrUndefined(input) && isString(input.kind))
);
const isPromise = (input: any) => instanceOf(input, Promise);

const isEmpty = (input: any) => (
  isNullOrUndefined(input)
  || ((isString(input) || isArray(input) || isNodeList(input)) && !input.length)
  || (isObject(input) && !Object.keys(input).length)
);

const isZero = (input: any) => {
  if (isString(input)) {
    return parseInt(input, 10) === 0;
  }

  return input === 0;
};

const isUrl = (input: any) => {
  // Accept a URL object
  if (instanceOf(input, window.URL)) {
    return true;
  }

  // Must be string from here
  if (!isString(input)) {
    return false;
  }

  // Add the protocol if required
  let string = input;
  if (!input.startsWith('http://') || !input.startsWith('https://')) {
    string = `http://${input}`;
  }

  try {
    return !isEmpty(new URL(string).hostname);
  } catch (e) {
    return false;
  }
};

export default {
  nullOrUndefined: isNullOrUndefined,
  object: isObject,
  number: isNumber,
  string: isString,
  boolean: isBoolean,
  function: isFunction,
  array: isArray,
  weakMap: isWeakMap,
  nodeList: isNodeList,
  element: isElement,
  textNode: isTextNode,
  event: isEvent,
  keyboardEvent: isKeyboardEvent,
  cue: isCue,
  track: isTrack,
  promise: isPromise,
  url: isUrl,
  empty: isEmpty,
  zero: isZero,
};
