import { hashSha256 } from './utils';

export const getRepoBaseName = (url: string): string => {
  const _url = url
    .replace('http://', '')
    .replace('https://', '')
    .split('/');

  return `${_url[2]}__${_url[3]}`;
};

export interface IGithubAssetAnalysis {
  path: string;
  basename: string;
  hash: string;
}

export interface IGithubAssetReport {
  changed: boolean;
  assets: IGithubAssetAnalysis[];
  newAssets: IGithubAssetAnalysis[];
  deletedAssets: IGithubAssetAnalysis[];
  changedAssets: IChangedAssets[];
  rootHash: string;
}

export function compareGithubAssetAnalysis(
  prevAssets: IGithubAssetAnalysis[],
  currAssets: IGithubAssetAnalysis[]
): IGithubAssetReport {
  const newAssets = findUniqueAssets(currAssets, prevAssets);
  const deletedAssets = findUniqueAssets(prevAssets, currAssets);
  const changedAssets = findChangedAssets(prevAssets, currAssets);
  const rootHash = calculateRootHash(currAssets);
  const changed = !!(newAssets.length || deletedAssets.length || changedAssets.length);

  return {
    assets: currAssets,
    changed,
    newAssets,
    deletedAssets,
    changedAssets,
    rootHash
  };
}

const findUniqueAssets = (
  base: IGithubAssetAnalysis[],
  compare: IGithubAssetAnalysis[]
): IGithubAssetAnalysis[] => {
  let notFound: IGithubAssetAnalysis[] = [];

  base.forEach(a => {
    findAssetByBasename(a, compare) ? null : notFound.push(a);
  });

  return notFound;
};

const findAssetByBasename = (
  wanted: IGithubAssetAnalysis,
  list: IGithubAssetAnalysis[]
): IGithubAssetAnalysis | null => {
  let found: IGithubAssetAnalysis = null;

  list.forEach(asset => {
    if (found) return;
    if (asset.basename === wanted.basename) {
      found = asset;
    }
  });
  return found;
};

interface IChangedAssets {
  basename: string;
  oldHash: string;
  newHash: string;
}

const findChangedAssets = (
  oldList: IGithubAssetAnalysis[],
  newList: IGithubAssetAnalysis[]
): IChangedAssets[] => {
  const diffs: IChangedAssets[] = [];

  oldList.forEach(oldAsset => {
    const newAsset = findAssetByBasename(oldAsset, newList);
    if (!newAsset) return;
    if (oldAsset.hash !== newAsset.hash) {
      diffs.push({
        basename: oldAsset.basename,
        oldHash: oldAsset.hash,
        newHash: newAsset.hash
      });
    }
  });

  return diffs;
};

function calculateRootHash(assets: IGithubAssetAnalysis[]): string {
  const concatHash = assets
    .map(({ hash }) => hash)
    .sort()
    .join('');

  return hashSha256(concatHash);
}

export const genGithubAssetSlackMessage = (
  { changedAssets, newAssets, deletedAssets, rootHash }: IGithubAssetReport,
  repoName: string
) => {
  const msg =
    `<!channel> changes to the released assets on repo \`${repoName.replace(
      '__',
      '/'
    )}\` have been detected:\n\n` +
    formatList('♻️   Changed files:', changedAssets) +
    formatList('➕   New files:', newAssets) +
    formatList('🗑️   Deleted files:', deletedAssets) +
    '\n\n' +
    `Root hash is now \`${rootHash}\``;
  return msg;
};

const formatList = (title: string, list: any) => {
  if (!list.length) return '';

  const assets = list.map((i: any) => {
    const asset = i.basename;
    const hash = i.newHash || i.hash;

    return ` - ${asset}\n    - \`${hash}\`\n`;
  });

  return `*${title}*\n${assets.join('')}\n`;
};
