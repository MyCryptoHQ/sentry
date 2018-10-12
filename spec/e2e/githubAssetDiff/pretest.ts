import { tmpdir } from 'os';
import * as path from 'path';

import * as fse from 'fs-extra';

const SESSION_ID = Math.random()
  .toString()
  .substring(7);
export const TEMP_DIR = path.resolve(tmpdir(), 'sentry-testing', SESSION_ID);
const TEMP_CONFIGS_FOLDER = path.resolve(TEMP_DIR, 'configs');
export const TEMP_WORKING = path.resolve(TEMP_DIR, 'working');
export const EXPECTED_REPO_FOLDER_NAME = 'MyCryptoHQ__MyCrypto';
export const CONFIG = {
  MODE: 'githubAssetDiff',
  WORKER_NAME: 'worker-0',
  REPO_URL: 'https://api.github.com/repos/MyCryptoHQ/MyCrypto/releases/latest',
  POLL_INTERVAL: 10000,
  WORKING_DIR: TEMP_WORKING,
  LOG_LEVEL_CONSOLE: 'error'
};
const CONFIG_PATH = path.resolve(TEMP_CONFIGS_FOLDER, 'worker.json');

fse.ensureDirSync(TEMP_CONFIGS_FOLDER);
fse.ensureDirSync(TEMP_WORKING);
fse.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG, null, 2), 'utf8');

// set config path as env var
process.env.SENTRY_CONFIG_PATH = CONFIG_PATH;

// mock out site diff interval saga so the site diff module doesn't start automatically
jest.mock('../../../src/sagas/githubAsset/root', () => {
  const original = require.requireActual('../../../src/sagas/githubAsset/root');

  return {
    ...original,
    handleGithubAssetIntervalStart: jest.fn()
    // communicateSiteChangedToSlack: mockGenerator()
  };
});

// mock out getProcess so we can intercept calls to process.send
const mockProcess = {
  send: jest.fn()
};

jest.mock('../../../src/libs/utils', () => {
  const original = require.requireActual('../../../src/libs/utils');
  return {
    ...original,
    getProcess: () => mockProcess
  };
});

const mockRunChildProcess = jest.fn(async cmd => {
  if (cmd.match(/^wget.*/)) {
    const { basename } = require('path');
    const fse = require('fs-extra');
    const { FAKE_ASSET_MAP } = require('./fakeAssets');
    const wgetArgs = cmd.split(' ');
    const fileOutPath = wgetArgs[wgetArgs.indexOf('-O') + 1];
    const fileOutName = basename(fileOutPath);
    const { content } = FAKE_ASSET_MAP[fileOutName];

    if (!content) {
      throw new Error(`Problem in test. Unexpected wget params: ${cmd}`);
    }

    await fse.writeFile(fileOutPath, content, 'utf8');
  }

  return Promise.resolve;
});

jest.mock('../../../src/libs/pure', () => {
  const original = require.requireActual('../../../src/libs/utils');
  return {
    ...original,
    runChildProcess: mockRunChildProcess
  };
});
