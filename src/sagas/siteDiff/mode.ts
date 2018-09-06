import { takeEvery, call } from 'redux-saga/effects';
import { SiteDiffTypeKeys } from '../../actions';
import { bootstrapSiteDiff, handleSiteDiffIntervalStart, handleSiteDiffStart } from './siteDiff';

export function* siteDiffModeSaga() {
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START, handleSiteDiffIntervalStart);
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_START, handleSiteDiffStart);

  yield call(bootstrapSiteDiff);
}
