import { SagaIterator } from 'redux-saga';
import { all, call, fork } from 'redux-saga/effects';
import * as fse from 'fs-extra';

import {
  enumerateFilesInDir,
  unminifyJS,
  identifyJsFiles,
  processFileList,
  calcSiteDiffRootHash
} from '../../libs';
import { getConfig, ISiteDiffConfig } from '../../configs';

export function* unminifyJSinDir(dir: string): SagaIterator {
  const dirFiles = yield call(enumerateFilesInDir, dir);
  const jsFiles = identifyJsFiles(dirFiles);

  yield all(jsFiles.map(file => fork(unminifyJS, file)));
}

export function* setCloneAsCache() {
  const { SITE_CACHE_DIR, SITE_CLONE_DIR }: ISiteDiffConfig = yield call(getConfig);

  // delete cache dir
  yield call(fse.remove, SITE_CACHE_DIR);

  // make clone dir the cache
  yield call(fse.move, SITE_CLONE_DIR, SITE_CACHE_DIR);
}

export function* calcCacheRootHash() {
  const { SITE_CACHE_DIR, SITE_BASE_NAME }: ISiteDiffConfig = yield call(getConfig);
  const fileList = yield call(enumerateFilesInDir, SITE_CACHE_DIR);
  const processedFileList = yield call(processFileList, fileList, SITE_BASE_NAME);

  return calcSiteDiffRootHash(processedFileList);
}
