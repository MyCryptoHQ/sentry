import { getComparePath } from '../../src/libs';

describe('getComparePath', () => {
  const filePath =
    '/home/user/.sentry/siteDiff/download.mycrypto.com/download.mycrypto.com.clone/common/assets/meta-fe1afc0ffc5a0dde50cf70fdd4e77e3d/apple-touch-icon-152x152.png';
  const siteUrl =
    'https://download.mycrypto.com/common/assets/meta-fe1afc0ffc5a0dde50cf70fdd4e77e3d/apple-touch-icon-152x152.png';
  const expected =
    'common/assets/meta-fe1afc0ffc5a0dde50cf70fdd4e77e3d/apple-touch-icon-152x152.png';
  const actual = getComparePath(filePath, siteUrl);

  it('should identify the compare path correctly', () => {
    expect(actual).toEqual(expected);
  });
});
