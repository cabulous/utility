import { writeCookie, readCookie, removeCookie } from '../utils/cookies';

describe('get cookie value', () => {
  const originalDocument = { ...document };
  const documentSpy = jest.spyOn(global, 'document', 'get');

  documentSpy.mockImplementation(() => ({
    ...originalDocument,
    cookie: 'test=isFun',
  }));

  afterAll(() => {
    documentSpy.mockRestore();
  })

  it('should return the value when found', () => {
    const result = readCookie('test');
    expect(result).toBe('isFun');
  });

  it('should return null when value not found', () => {
    const result = readCookie('noExistingCookie');
    expect(result).toBeNull();
  });
})

describe('write cookie', () => {
  const originalDocument = { ...document };
  const documentSpy = jest.spyOn(global, 'document', 'get');

  documentSpy.mockImplementation(() => ({
    ...originalDocument,
    cookie: 'test=isFun',
  }));

  afterAll(() => {
    documentSpy.mockRestore();
  })

  it('should write the cookie', () => {
    writeCookie('newCookie', 'isAwesome');
    expect(readCookie('newCookie')).toBe('isAwesome');
  });
})

describe('remove cookie', () => {
  const originalDocument = { ...document };
  const documentSpy = jest.spyOn(global, 'document', 'get');

  documentSpy.mockImplementation(() => ({
    ...originalDocument,
    cookie: 'test=isFun',
  }));

  afterAll(() => {
    documentSpy.mockRestore();
  })

  it('should write the cookie', () => {
    removeCookie('test');
    expect(readCookie('test')).toBeNull();
  });
})
