import { SagaIterator } from 'redux-saga';
import { all, call, fork } from 'redux-saga/effects';
import * as fse from 'fs-extra';

import { enumerateFilesInDir, unminifyJS, identifyJsFiles } from '../../libs';
import { getConfig, ISiteDiffConfig } from '../../configs';


export function* isDirectoryEmpty(dir: string): SagaIterator {
  const dirFiles = yield call(enumerateFilesInDir, dir);
  return dirFiles.length === 1;
}

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
