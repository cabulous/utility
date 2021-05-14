import { trimLeadingHex } from '../utils/string';

test('trim hex at the beginning of color value', () => {
  expect(trimLeadingHex('#123456')).toBe('123456');
  expect(trimLeadingHex('123456')).toBe('123456');
});
