export const FAKE_ASSET_A = {
  name: 'fakeWindowsAsset.exe',
  content: 'this is a fake windows file!',
  hash: '0f7443fe14820855a98ee2df4bc802718b390deb9824edfeee7f86675f81151a'
};

export const FAKE_ASSET_B = {
  name: 'fakeMacAsset.dmg',
  content: 'this is a fake mac file!',
  hash: 'e6690c30a0a03f8869d5b4a3cda54c83e2b64424e06976b34172046e8758723b'
};

export const FAKE_ASSET_C = {
  name: 'fakeStandalone.zip',
  content: 'this is a fake zip file!',
  hash: 'ca21635091852b3a60b5bb2930ba81c969813e46def6b524a7a41a76e5bd779e'
};

export const FAKE_ASSET_MAP = [FAKE_ASSET_A, FAKE_ASSET_B, FAKE_ASSET_C].reduce((acc, curr) => {
  acc[curr.name] = curr;
  return acc;
}, {});
