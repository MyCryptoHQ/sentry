import { call, select, put, all } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import * as fse from 'fs-extra';

import { logger, getConfig, TAppConfig } from '../../configs';
import { store } from '../../store';
import { getSlackChannelsWhitelist } from '../../selectors';
import { slackMessageOutgoing } from '../../actions';

export function* bootstrapApp(): SagaIterator {
  const { MODE }: TAppConfig = yield call(getConfig);

  yield call(ensureWorkingDirCreated);

  // if (MODE !== 'parent') {
  //   yield call(bindWorkerProcessListener)
  // }

  // yield call(bindAndStartSlack);
  logger.info('Bootstrapped');
}

function* ensureWorkingDirCreated(): SagaIterator {
  const { WORKING_DIR }: TAppConfig = yield call(getConfig);
  yield call(fse.ensureDir, WORKING_DIR);
}

export function* broadcastToSlackWhitelist(slackMsg: string) {
  const slackChannelsWhitelist: string[] = yield select(getSlackChannelsWhitelist);
  const msgActions = slackChannelsWhitelist.map(channel =>
    put(slackMessageOutgoing(slackMsg, channel))
  );
  yield all(msgActions);
}
