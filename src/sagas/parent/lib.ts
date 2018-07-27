import * as path from 'path';

import * as fse from 'fs-extra';
import { call } from 'redux-saga/effects';

import { getConfig } from '../../configs';
import { SagaIterator } from 'redux-saga';

export function* getChildConfigPaths(): SagaIterator {
  const { CHILD_CONFIG_FOLDER } = yield call(getConfig);
  return (yield call(fse.readdir, CHILD_CONFIG_FOLDER)).filter(
    (p: string) => path.basename(p) !== 'parent.json'
  );
}
