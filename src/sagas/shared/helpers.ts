import { call } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import * as fse from 'fs-extra';

import { logger, getConfig, TAppConfig } from '../../configs';

export function* bootstrapApp(): SagaIterator {
  yield call(ensureFoldersCreated);
  // yield call(bindAndStartSlack);
  logger.info('Bootstrapped');
}

function* ensureFoldersCreated(): SagaIterator {
  const { WORKING_DIR }: TAppConfig = yield call(getConfig);
  yield call(fse.ensureDir, WORKING_DIR);
}
