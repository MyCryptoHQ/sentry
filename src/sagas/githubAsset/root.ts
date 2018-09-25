import { call, put, select } from 'redux-saga/effects';
import { delay, SagaIterator } from 'redux-saga';
import * as fse from 'fs-extra';

import {
  githubAssetFinish,
  githubAssetStart,
  githubAssetIntervalStart,
  githubAssetChanged,
  githubAssetUpdated,
  IGithubAssetUpdatedAction
} from '../../actions';
import { IGithubAssetConfig, getConfig, makeLocalLogger } from '../../configs';
import { getWorking, getManifest } from '../../selectors/githubAsset';
import {
  isDirectoryEmpty,
  IGithubAssetAnalysis,
  IGithubAssetReport,
  compareGithubAssetAnalysis,
  genGithubAssetSlackMessage
} from '../../libs';
import {
  emptyCloneDir,
  downloadAssetsToCloneDir,
  analyzeAssets,
  snapshotCache,
  setCloneAsCache
} from './lib';
import { broadcastToSlackWhitelist } from '../shared';

const _log = makeLocalLogger('githubAsset');

export function* bootstrapGithubAsset() {
  const { CACHE_DIR, CLONE_DIR, SNAPSHOTS_DIR }: IGithubAssetConfig = yield call(getConfig);

  // create necessary folders
  yield call(fse.ensureDir, CACHE_DIR);
  yield call(fse.ensureDir, CLONE_DIR);
  yield call(fse.ensureDir, SNAPSHOTS_DIR);

  // const isCacheEmpty = yield call(isDirectoryEmpty, CACHE_DIR);

  // if (isCacheEmpty) {
  // cloneGithubAssets
  // analyzeClonedAssets
  // setCloneAsCache
  // }

  yield put(githubAssetIntervalStart());
}

export function* handleGithubAssetIntervalStart() {
  const { POLL_INTERVAL }: IGithubAssetConfig = yield call(getConfig);

  while (true) {
    yield call(delay, POLL_INTERVAL);

    const isWorking = yield select(getWorking);
    if (isWorking) {
      _log.debug('Previous run still going, skipping interval');
    } else {
      _log.debug('No previous run, starting syncing github assets');
      yield put(githubAssetStart());
    }
  }
}

export function* handleGithubAssetStart() {
  const manifest: IGithubAssetAnalysis[] = yield select(getManifest);

  try {
    yield call(emptyCloneDir);

    const assetPaths = yield call(downloadAssetsToCloneDir);
    const analysis: IGithubAssetAnalysis[] = yield call(analyzeAssets, assetPaths);
    const report: IGithubAssetReport = yield call(compareGithubAssetAnalysis, manifest, analysis);

    if (report.changed) {
      yield put(githubAssetChanged(report));
    } else {
      yield put(githubAssetFinish());
    }
  } catch (err) {
    console.log(err);
    _log.error('A fatal error occurred in handleGithubAssetStart:', err);
    yield put(githubAssetFinish());
  }
}

export function* handleGithubAssetChanged({ report }: IGithubAssetUpdatedAction): SagaIterator {
  try {
    // snapshot current cache
    yield call(snapshotCache);

    // set clone as new cache
    yield call(setCloneAsCache);

    const { REPO_BASE_NAME }: IGithubAssetConfig = yield call(getConfig);
    const slackMessage = genGithubAssetSlackMessage(report, REPO_BASE_NAME);

    yield put(githubAssetUpdated(report, slackMessage));
  } catch (err) {
    _log.error('A critical error occurred:\n');
    _log.error(err);
    yield put(githubAssetFinish());
  }
}

export function* handleGithubAssetUpdated({ slackMessage }: IGithubAssetUpdatedAction) {
  // communicate to slack
  yield call(broadcastToSlackWhitelist, slackMessage);
  yield put(githubAssetFinish());
}
