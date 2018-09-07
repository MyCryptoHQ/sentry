import { getRepoBaseName } from '../../src/libs';

describe('getRepoBaseName', () => {
  const input = 'https://api.github.com/repos/MyCryptoHQ/MyCrypto/releases/latest';
  const expected = 'MyCryptoHQ__MyCrypto';
  const actual = getRepoBaseName(input);

  it('should handle github asset URLs', () => {
    expect(actual).toEqual(expected);
  });
});
