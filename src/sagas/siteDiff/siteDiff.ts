import * as fse from 'fs-extra';
import * as AWS from 'aws-sdk';
import { delay } from 'redux-saga';
import { call, all, put, takeEvery, select } from 'redux-saga/effects';

import { ISiteDiffConfig, getConfig, makeLocalLogger } from '../../configs';
import { unminifyJSinDir, setCloneAsCache, calcCacheRootHash } from './lib';
import {
  cloneWebsite,
  enumerateFilesInDir,
  processFileList,
  generateReport,
  hasReportChanged,
  createSnapshot,
  genSlackReportMsg,
  uploadToS3,
  buildS3FileName,
  IKlawFileInfo,
  ISiteDiffReport,
  isDirectoryEmpty
} from '../../libs';
import {
  SiteDiffTypeKeys,
  slackMessageOutgoing,
  siteDiffIntervalStart,
  siteDiffStart,
  siteDiffFinish,
  siteDiffChangeDetected,
  ISiteDiffChangeDetectedAction,
  siteDiffInitRootHash
} from '../../actions';
import { getWorking, getSlackChannelsWhitelist } from '../../selectors';

const _log = makeLocalLogger('siteDiff');

export function* bootstrapSiteDiff() {
  yield call(ensureFoldersCreated);
  yield call(initSiteDiff);
  yield put(siteDiffIntervalStart());

  _log.debug('Bootstraped');
}

export function* ensureFoldersCreated() {
  const { SITE_CACHE_DIR, SITE_CLONE_DIR, SITE_SNAPSHOTS_DIR }: ISiteDiffConfig = yield call(
    getConfig
  );

  yield call(fse.ensureDir, SITE_CACHE_DIR);
  yield call(fse.ensureDir, SITE_CLONE_DIR);
  yield call(fse.ensureDir, SITE_SNAPSHOTS_DIR);
}

export function* cloneAndUnminifySite() {
  const { SITE_URL, SITE_CLONE_DIR }: ISiteDiffConfig = yield call(getConfig);

  yield call(cloneWebsite, SITE_URL, SITE_CLONE_DIR);

  // not unminifying due to determinism bug in lib
  // yield call(unminifyJSinDir, SITE_CLONE_DIR)
}

export function* initSiteDiff() {
  try {
    const { SITE_CACHE_DIR, SITE_CLONE_DIR }: ISiteDiffConfig = yield call(getConfig);

    const empty = yield call(isDirectoryEmpty, SITE_CACHE_DIR);

    if (empty) {
      _log.debug('Cache is empty, creating cache');

      yield call(fse.remove, SITE_CLONE_DIR);
      yield call(cloneAndUnminifySite);
      yield call(setCloneAsCache);

      _log.debug('Cache created');
    }

    const cacheRootHash = yield call(calcCacheRootHash);
    yield put(siteDiffInitRootHash(cacheRootHash));
  } catch (err) {
    _log.error('initSiteDiff - critical error');
    _log.error(err);
  }
}

export function* handleSiteDiffStart() {
  try {
    const { SITE_URL }: ISiteDiffConfig = yield call(getConfig);

    _log.info(`Checking ${SITE_URL}`);
    const report = yield call(buildSiteDiffReport);

    yield call(analyzeSiteDiffReport, report);

    yield put(siteDiffFinish());
  } catch (err) {
    _log.error('handleSiteDiffStart - critical error');
    _log.error(err);

    yield put(siteDiffFinish());
  }
}

export function* buildSiteDiffReport() {
  const {
    SITE_CACHE_DIR,
    SITE_CLONE_DIR,
    SITE_BASE_NAME,
    SITE_IGNORED_FILES
  }: ISiteDiffConfig = yield call(getConfig);

  _log.debug('buildSiteDiffReport - cloning site');

  yield call(cloneAndUnminifySite);

  const cacheFiles: IKlawFileInfo[] = yield call(enumerateFilesInDir, SITE_CACHE_DIR);
  const cloneFiles: IKlawFileInfo[] = yield call(enumerateFilesInDir, SITE_CLONE_DIR);
  const cacheFilesProcessed = yield call(processFileList, cacheFiles, SITE_BASE_NAME);

  const cloneFilesProcessed = yield call(processFileList, cloneFiles, SITE_BASE_NAME);

  _log.debug('buildSiteDiffReport - generating report');
  const report = yield call(
    generateReport,
    cacheFilesProcessed,
    cloneFilesProcessed,
    SITE_IGNORED_FILES
  );

  _log.debug('buildSiteDiffReport - finished, returning report');
  return report;
}

export function* analyzeSiteDiffReport(report: ISiteDiffReport) {
  const {
    AWS_ENABLED,
    SITE_CACHE_DIR,
    SITE_CLONE_DIR,
    SITE_SNAPSHOTS_DIR,
    SITE_URL
  }: ISiteDiffConfig = yield call(getConfig);

  _log.debug('analyzeSiteDiffReport - analyzing report');

  const hasChanged = yield call(hasReportChanged, report);

  if (hasChanged) {
    _log.info(`Change detected on ${SITE_URL}`);

    if (AWS_ENABLED) {
      _log.info('Uploading HTML diff to S3 bucket');
      report.location = yield call(uploadSiteDiffToS3, report);
    }
    report.slackMessage = yield call(genSlackReportMsg, report, SITE_URL);

    yield call(createSnapshot, SITE_CACHE_DIR, SITE_CLONE_DIR, SITE_SNAPSHOTS_DIR, report);

    _log.debug('analyzeSiteDiffReport - setting clone as cache');
    yield call(setCloneAsCache);

    yield put(siteDiffChangeDetected(report));
  } else {
    _log.info('No change detected');
  }
}

export function* handleSiteChangeDetected({ report }: ISiteDiffChangeDetectedAction) {
  yield call(communicateSiteChangedToSlack, report);
  _log.info('Sent alert to slack');
}

export function* uploadSiteDiffToS3(report: ISiteDiffReport) {
  const { AWS_BUCKET }: ISiteDiffConfig = yield call(getConfig);

  const params: AWS.S3.Types.PutObjectRequest = {
    ACL: 'public-read',
    Bucket: AWS_BUCKET,
    Body: report.htmlDiffs.join(''),
    Key: buildS3FileName()
  };

  const { Location } = yield call(uploadToS3, params);
  return Location;
}

export function* communicateSiteChangedToSlack(report: ISiteDiffReport) {
  const slackChannelsWhitelist: string[] = yield select(getSlackChannelsWhitelist);
  const msgActions = slackChannelsWhitelist.map(channel =>
    put(slackMessageOutgoing(report.slackMessage, channel))
  );
  yield all(msgActions);
}

export function* handleSiteDiffIntervalStart() {
  const { SITE_POLL_INTERVAL }: ISiteDiffConfig = yield call(getConfig);

  while (true) {
    try {
      yield call(delay, SITE_POLL_INTERVAL);

      const isWorking = yield select(getWorking);
      if (isWorking) {
        _log.debug('handleSiteDiffIntervalStart - Previous run still going, skipping site diff');
      } else {
        _log.debug('handleSiteDiffIntervalStart - No previous run, starting site diff');
        yield put(siteDiffStart());
      }
    } catch (err) {
      yield put(siteDiffFinish());
      _log.error(err);
    }
  }
}
