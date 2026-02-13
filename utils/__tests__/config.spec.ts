import Config from '../config.ts';

describe('configuration tests', () => {
  test('valid configuration', () => {
    expect(Config).not.toBeNull();
  });  
});
