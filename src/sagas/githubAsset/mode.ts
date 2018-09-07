import { takeEvery, call } from 'redux-saga/effects';
import { GithubAssetTypeKeys } from '../../actions';
import {
  bootstrapGithubAsset,
  handleGithubAssetIntervalStart,
  handleGithubAssetStart,
  handleGithubAssetChanged,
  handleGithubAssetUpdated
} from './root';

export function* githubAssetModeSaga() {
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_INTERVAL_START, handleGithubAssetIntervalStart);
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_START, handleGithubAssetStart);
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_CHANGED, handleGithubAssetChanged);
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_UPDATED, handleGithubAssetUpdated);

  yield call(bootstrapGithubAsset);
}
