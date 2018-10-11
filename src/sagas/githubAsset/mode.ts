import { takeEvery, call } from 'redux-saga/effects';
import { GithubAssetTypeKeys, SlackTypeKeys } from '../../actions';
import {
  bootstrapGithubAsset,
  handleGithubAssetIntervalStart,
  handleGithubAssetStart,
  handleGithubAssetChanged,
  handleGithubAssetUpdated
} from './root';
import { handleGitHubAssetCommand } from './comms';

export function* githubAssetModeSaga() {
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_INTERVAL_START, handleGithubAssetIntervalStart);
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_START, handleGithubAssetStart);
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_CHANGED, handleGithubAssetChanged);
  yield takeEvery(GithubAssetTypeKeys.GITHUB_ASSET_UPDATED, handleGithubAssetUpdated);
  yield takeEvery(SlackTypeKeys.SLACK_WORKER_COMMAND, handleGitHubAssetCommand);

  yield call(bootstrapGithubAsset);
}
