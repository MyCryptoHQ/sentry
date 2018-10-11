import { takeEvery, call } from 'redux-saga/effects';
import { SiteDiffTypeKeys, SlackTypeKeys } from '../../actions';
import {
  bootstrapSiteDiff,
  handleSiteDiffIntervalStart,
  handleSiteDiffStart,
  handleSiteChangeDetected
} from './siteDiff';
import { handleSiteDiffCommand } from './comms';

export function* siteDiffModeSaga() {
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START, handleSiteDiffIntervalStart);
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_START, handleSiteDiffStart);
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_CHANGE_DETECTED, handleSiteChangeDetected);
  yield takeEvery(SlackTypeKeys.SLACK_WORKER_COMMAND, handleSiteDiffCommand);

  yield call(bootstrapSiteDiff);
}
