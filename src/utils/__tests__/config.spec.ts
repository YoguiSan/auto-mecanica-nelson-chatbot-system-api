import Config from '../config.ts';

describe('Configuration tests', () => {
  test('Configuration exists and is valid', () => {
    expect(Config).toBeDefined();
  });  
});
