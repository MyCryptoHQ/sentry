import { SagaIterator } from 'redux-saga';
import { call, fork, all } from 'redux-saga/effects';
import { bootstrapApp } from './helpers';
import { slackSaga } from './slack';
import { siteDiffSaga, bootstrapSiteDiff } from './siteDiff';

export function* rootSaga(): SagaIterator {
  yield all([fork(slackSaga), fork(siteDiffSaga)]);

  yield call(bootstrapApp);
  yield call(bootstrapSiteDiff);
}
