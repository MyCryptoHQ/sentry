
import * as fse from 'fs-extra'
import * as AWS from 'aws-sdk'
import { delay } from 'redux-saga'
import { call, all, put, takeEvery } from 'redux-saga/effects'

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
  logger } from '../configs'
import { 
  isDirectoryEmpty,
  unminifyJSinDir,
  setCloneAsCache
} from './lib'
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
} from '../libs'
import { 
  SiteDiffTypeKeys,
  slackMessageOutgoing,
  siteDiffIntervalStart,
  siteDiffStart
} from '../actions'
import { store } from '../store'


export function* bootstrapSiteDiff() {
  yield call(ensureFoldersCreated)
  yield call(initSiteDiff)
  yield put(siteDiffIntervalStart())

  logger.info('bootstrapSiteDiff - done')
}


export function* ensureFoldersCreated() {
  yield call(fse.ensureDir, SITE_CACHE_DIR)
  yield call(fse.ensureDir, SITE_CLONE_DIR)
  yield call(fse.ensureDir, SITE_SNAPSHOTS_DIR)
}

export function* cloneAndUnminifySite() {
  yield call(cloneWebsite, SITE_URL, SITE_CLONE_DIR)

  // not unminifying due to determinism bug in lib
  // yield call(unminifyJSinDir, SITE_CLONE_DIR)
}


export function* initSiteDiff() {
  const empty = yield call(isDirectoryEmpty, SITE_CACHE_DIR)
  
  if (!empty) return

  yield call(fse.remove, SITE_CLONE_DIR)
  yield call(cloneAndUnminifySite)
  logger.info('initSiteDiff A')
  yield call(setCloneAsCache)
  logger.info('initSiteDiff B')  
}


export function* buildSiteDiffReport() {
  logger.info('Build site diff report!')
  
  yield call(cloneAndUnminifySite)

  const cacheFiles = yield call(enumerateFilesInDir, SITE_CACHE_DIR) 
  const cloneFiles = yield call(enumerateFilesInDir, SITE_CLONE_DIR)
  const cacheFilesProcessed = yield call(processFileList, cacheFiles, SITE_URL)

  const cloneFilesProcessed = yield call(processFileList, cloneFiles, SITE_URL)
  const report = yield call(generateReport, cacheFilesProcessed, cloneFilesProcessed, SITE_IGNORED_FILES)

  yield call(analyzeSiteDiffReport, report)
}

export function* analyzeSiteDiffReport(report) {
  logger.info('Analyze site diff report!')
  
  const hasChanged = yield call(hasReportChanged, report)

  if (hasChanged) {

    if (AWS_ENABLED) {
      report.location = yield call(uploadSiteDiffToS3, report);
    } 
  
    yield call(createSnapshot, SITE_CACHE_DIR, SITE_CLONE_DIR, SITE_SNAPSHOTS_DIR, report)
    yield call(setCloneAsCache)
    yield call(communicateSiteChangedToSlack, report)
  }
}

export function* uploadSiteDiffToS3(report) {
  
  const params: AWS.S3.Types.PutObjectRequest = {
    ACL: 'public-read',
    Bucket: AWS_BUCKET,
    Body: report.htmlDiffs.join(''),
    Key: buildS3FileName()
  }

  const { Location } = yield call(uploadToS3, params);
  return Location;   
}

export function* communicateSiteChangedToSlack(report) {
  logger.info('Communicate site changed to slack!')
  
  const slackMsg = yield call(genSlackReportMsg, report, SITE_URL)

  const msgActions = SLACK_CHANNELS_WHITELIST.map(channel => 
    put(slackMessageOutgoing(slackMsg, channel))
  )
  yield all(msgActions)
}


export function* handleSiteDiffIntervalStart() {
  while (true) {
    yield call(delay, SITE_POLL_INTERVAL)
    yield put(siteDiffStart())
  }
}

export function* siteDiffSaga() {
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START, handleSiteDiffIntervalStart)
  yield takeEvery(SiteDiffTypeKeys.SITE_DIFF_START, buildSiteDiffReport)
}



