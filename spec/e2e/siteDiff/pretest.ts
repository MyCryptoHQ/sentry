import { tmpdir } from 'os';
import * as path from 'path';

import * as fse from 'fs-extra';

import { startServer } from './testServer';

startServer();

const SESSION_ID = Math.random()
  .toString()
  .substring(7);
export const TEMP_DIR = path.resolve(tmpdir(), 'sentry-testing', SESSION_ID);
const TEMP_CONFIGS_FOLDER = path.resolve(TEMP_DIR, 'configs');
export const TEMP_WORKING = path.resolve(TEMP_DIR, 'working');
export const EXPECTED_SITE_FOLDER_NAME = 'localhost:3000';
export const CONFIG = {
  MODE: 'siteDiff',
  WORKER_NAME: 'worker-0',
  SITE_URL: 'http://localhost:3000',
  SITE_POLL_INTERVAL: 10000,
  AWS_ENABLED: true,
  WORKING_DIR: TEMP_WORKING,
  AWS_BUCKET: 'FAKE_BUCKET_NAME',
  LOG_LEVEL_CONSOLE: 'error'
};
const CONFIG_PATH = path.resolve(TEMP_CONFIGS_FOLDER, 'worker.json');

fse.ensureDirSync(TEMP_CONFIGS_FOLDER);
fse.ensureDirSync(TEMP_WORKING);
fse.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG, null, 2), 'utf8');

// set config path as env var
process.env.SENTRY_CONFIG_PATH = CONFIG_PATH;

// mock out site diff interval saga so the site diff module doesn't start automatically
jest.mock('../../../src/sagas/siteDiff/siteDiff', () => {
  const original = require.requireActual('../../../src/sagas/siteDiff/siteDiff');

  return {
    ...original,
    handleSiteDiffIntervalStart: jest.fn()
    // communicateSiteChangedToSlack: mockGenerator()
  };
});

// mock out getProcess so we can intercept calls to process.send
// mock out AWS S3 uploader
const mockProcess = {
  send: jest.fn()
};
jest.mock('../../../src/libs/utils', () => {
  const original = require.requireActual('../../../src/libs/utils');
  return {
    ...original,
    getProcess: () => mockProcess,
    uploadToS3: jest.fn(() => ({ Location: 'FAKE_AWS_URL' }))
  };
});
