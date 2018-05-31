import * as fse from 'fs-extra';
import * as AWS from 'aws-sdk';
import { delay } from 'redux-saga';
import { call, all, put, takeEvery, select } from 'redux-saga/effects';

import {
  SITE_POLL_INTERVAL,
  SITE_URL,
  SITE_BASE_DIR,
  SITE_CACHE_DIR,
  SITE_CLONE_DIR,
  SITE_SNAPSHOTS_DIR,
  SITE_IGNORED_FILES,
  SLACK_CHANNELS_WHITELIST,
  AWS_BUCKET,
  AWS_ENABLED,
  logger
} from '../configs';
import { isDirectoryEmpty, unminifyJSinDir, setCloneAsCache } from './lib';
import {
  cloneWebsite,
  enumerateFilesInDir,
  processFileList,
  generateReport,
  hasReportChanged,
  createSnapshot,
  genSlackReportMsg,
  uploadToS3,
  buildS3FileName
} from '../libs';
import {
  SiteDiffTypeKeys,
  slackMessageOutgoing,
  siteDiffIntervalStart,
  siteDiffStart,
  siteDiffFinish
} from '../actions';
import { store } from '../store';
import { getWorking } from '../selectors';

export function* bootstrapSiteDiff() {
  yield call(ensureFoldersCreated);
  yield call(initSiteDiff);
  yield put(siteDiffIntervalStart());

  logger.debug('bootstrapSiteDiff - done');
}

export function* ensureFoldersCreated() {
  yield call(fse.ensureDir, SITE_CACHE_DIR);
  yield call(fse.ensureDir, SITE_CLONE_DIR);
  yield call(fse.ensureDir, SITE_SNAPSHOTS_DIR);
}

export function* cloneAndUnminifySite() {
  yield call(cloneWebsite, SITE_URL, SITE_CLONE_DIR);

  // not unminifying due to determinism bug in lib
  // yield call(unminifyJSinDir, SITE_CLONE_DIR)
}

export function* initSiteDiff() {
  try {
    const empty = yield call(isDirectoryEmpty, SITE_CACHE_DIR);

    if (!empty) return;

    logger.debug('initSiteDiff - Cache is empty. Creating cache');

    yield call(fse.remove, SITE_CLONE_DIR);
    yield call(cloneAndUnminifySite);
    yield call(setCloneAsCache);

    logger.debug('initSiteDiff - Cache created');
  } catch (err) {
    logger.error('initSiteDiff - critical error');
    logger.error(err);
  }
}

export function* handleSiteDiffStart() {
  try {
    logger.info(`SITE_DIFF - Checking ${SITE_URL} for changes`);
    logger.debug('handleSiteDiffStart - starting report');
    const report = yield call(buildSiteDiffReport);

    logger.debug('handleSiteDiffStart - analyzing report');
    yield call(analyzeSiteDiffReport, report);

    logger.debug('handleSiteDiffStart - firing SITE_DIFF_FINISH');
    yield put(siteDiffFinish());
  } catch (err) {
    logger.error('handleSiteDiffStart - critical error');
    logger.error(err);
  }
}

export function* buildSiteDiffReport() {
  logger.debug('buildSiteDiffReport - cloning site');

  yield call(cloneAndUnminifySite);

  const cacheFiles = yield call(enumerateFilesInDir, SITE_CACHE_DIR);
  const cloneFiles = yield call(enumerateFilesInDir, SITE_CLONE_DIR);
  const cacheFilesProcessed = yield call(processFileList, cacheFiles, SITE_URL);

  const cloneFilesProcessed = yield call(processFileList, cloneFiles, SITE_URL);

  logger.debug('buildSiteDiffReport - generating report');
  const report = yield call(
    generateReport,
    cacheFilesProcessed,
    cloneFilesProcessed,
    SITE_IGNORED_FILES
  );

  logger.debug('buildSiteDiffReport - finished, returning report');
  return report;
}

export function* analyzeSiteDiffReport(report) {
  logger.debug('analyzeSiteDiffReport - analyzing report');

  const hasChanged = yield call(hasReportChanged, report);

  if (hasChanged) {
    logger.info('SITE_DIFF - Change detected');

    if (AWS_ENABLED) {
      logger.info('SITE_DIFF - uploading HTML diff to S3 bucket');
      report.location = yield call(uploadSiteDiffToS3, report);
    }

    yield call(createSnapshot, SITE_CACHE_DIR, SITE_CLONE_DIR, SITE_SNAPSHOTS_DIR, report);

    logger.debug('analyzeSiteDiffReport - setting clone as cache');
    yield call(setCloneAsCache);

    logger.info('SITE_DIFF - Sending alert to slack');
    yield call(communicateSiteChangedToSlack, report);
  } else {
    logger.info('SITE_DIFF - No change detected');
  }
}

export function* uploadSiteDiffToS3(report) {
  const params: AWS.S3.Types.PutObjectRequest = {
    ACL: 'public-read',
    Bucket: AWS_BUCKET,
    Body: report.htmlDiffs.join(''),
    Key: buildS3FileName()
  };

  const { Location } = yield call(uploadToS3, params);
  return Location;
}

export function* communicateSiteChangedToSlack(report) {
  const slackMsg = yield call(genSlackReportMsg, report, SITE_URL);

  const msgActions = SLACK_CHANNELS_WHITELIST.map(channel =>
    put(slackMessageOutgoing(slackMsg, channel))
  );
  yield all(msgActions);
}

export function* handleSiteDiffIntervalStart() {
  while (true) {
    yield call(delay, SITE_POLL_INTERVAL);

    const isWorking = yield select(getWorking);
    if (isWorking) {
      logger.debug('handleSiteDiffIntervalStart - Previous run still going, skipping site diff');
    } else {
      logger.debug('handleSiteDiffIntervalStart - No previous run, starting site diff');
      yield put(siteDiffStart());
    }
  }
}

export function* siteDiffSaga() {
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START, handleSiteDiffIntervalStart);
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_START, handleSiteDiffStart);
}
