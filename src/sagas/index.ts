import { SagaIterator } from 'redux-saga';
import { call, fork } from 'redux-saga/effects';
import { bootstrapApp } from './shared';
import { parentModeSaga } from './parent';
import { siteDiffModeSaga } from './siteDiff';
import { getConfig, TAppConfig } from '../configs';
import { slackSaga } from './slack';

export * from './parent';
export * from './shared';
export * from './siteDiff';

export function* rootSaga(): SagaIterator {
  const { MODE }: TAppConfig = yield call(getConfig);

  yield fork(bootstrapApp);
  yield fork(slackSaga);

  switch (MODE) {
    case 'parent':
      return yield fork(parentModeSaga);
    case 'siteDiff':
      return yield fork(siteDiffModeSaga);
  }

  // yield all([fork(slackSaga), fork(siteDiffSaga)]);

  // yield call(bootstrapApp);
  // yield call(bootstrapSiteDiff);
}
