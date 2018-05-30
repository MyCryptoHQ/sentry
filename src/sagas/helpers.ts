import { call } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import * as fse from 'fs-extra';

import { logger, WORKING_DIR } from '../configs';
import { bindAndStartSlack } from '../slack';

export function* bootstrapApp(): SagaIterator {
  yield call(ensureFoldersCreated);
  yield call(bindAndStartSlack);
  logger.info('Bootstrapped');
}

function* ensureFoldersCreated(): SagaIterator {
  yield call(fse.ensureDir, WORKING_DIR);
}
