import * as path from 'path';

import { call, apply } from 'redux-saga/effects';
import * as fse from 'fs-extra';
import fetch from 'node-fetch';
import { SagaIterator } from 'redux-saga';
const chalk = require('chalk');

import { getConfig, IGithubAssetConfig } from '../../configs';
import { downloadFile, hashFileSha256, IGithubAssetAnalysis } from '../../libs';
import { makeLocalLogger } from '../../configs';

const y = chalk.yellow;
const _log = makeLocalLogger('githubAsset');

export function* emptyCloneDir() {
  const { CLONE_DIR }: IGithubAssetConfig = yield call(getConfig);
  yield call(fse.emptyDir, CLONE_DIR);
}

export function* setCloneAsCache() {
  const { CACHE_DIR, CLONE_DIR } = yield call(getConfig);
  yield call(fse.remove, CACHE_DIR);
  yield call(fse.move, CLONE_DIR, CACHE_DIR);
  yield call(fse.ensureDir, CLONE_DIR);
}

export function* snapshotCache() {
  const { SNAPSHOTS_DIR, CACHE_DIR }: IGithubAssetConfig = yield call(getConfig);
  const newSnapFolder = yield call(genShapshotDirName);
  const newSnapFullPath = path.resolve(SNAPSHOTS_DIR, newSnapFolder);

  yield call(fse.move, CACHE_DIR, newSnapFullPath);
}

export function* downloadAssetsToCloneDir() {
  const { REPO_URL, CLONE_DIR }: IGithubAssetConfig = yield call(getConfig);
  const resp: any = yield call(fetch, REPO_URL);
  const { assets }: any = yield call([resp, 'json']);
  let downloaded: string[] = [];

  for (const { browser_download_url } of assets) {
    const fileName = path.basename(browser_download_url);
    const filePath = path.resolve(CLONE_DIR, fileName);

    _log.info(`downloading asset ${y(fileName)}`);

    yield call(downloadFile, browser_download_url, filePath);
    downloaded.push(filePath);
  }
  return downloaded;
}

export function* analyzeAssets(filePaths: string[]): SagaIterator {
  let analysis: IGithubAssetAnalysis[] = [];

  for (const filePath of filePaths) {
    analysis.push({
      path: filePath,
      basename: path.basename(filePath),
      hash: yield call(hashFileSha256, filePath)
    });
  }

  return analysis;
}

export function* genShapshotDirName() {
  const { SNAPSHOTS_DIR }: IGithubAssetConfig = yield call(getConfig);
  const count = ((yield call(fse.readdir, SNAPSHOTS_DIR)).length += 1);
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return `${count}__${month}-${day}-${year}`;
}
