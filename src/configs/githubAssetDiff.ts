import { homedir } from 'os';
import * as path from 'path';

import { TLogLevel } from './logger';
import { getRepoBaseName } from '../libs';
import { APP_NAME } from './app';

export interface IGithubAssetConfigurable {
  MODE: 'githubAssetDiff';
  WORKER_NAME: string;
  REPO_URL: string;
  POLL_INTERVAL: number;
  AWS_BUCKET?: string;
  TRACE_ACTIONS?: boolean;
  WORKING_DIR?: string;
  LOG_HEX_COLOR?: string;
  LOG_LEVEL_CONSOLE?: TLogLevel;
  LOG_LEVEL_FILE?: TLogLevel;
  LOG_FILE_NAME?: string;
  LOG_FILE_PATH?: string;
}

export interface IGithubAssetConfig extends Required<IGithubAssetConfigurable> {
  REPO_BASE_NAME: string;
  // SITE_BASE_DIR: string;
  CLONE_DIR: string;
  CACHE_DIR: string;
  SNAPSHOTS_DIR: string;
}

export const makeGithubAssetDiffConfig = (config: IGithubAssetConfigurable): IGithubAssetConfig => {
  const REPO_BASE_NAME = getRepoBaseName(config.REPO_URL);
  const WORKING_DIR = config.WORKING_DIR
    ? path.resolve(config.WORKING_DIR)
    : path.resolve(homedir(), `.${APP_NAME}`, 'githubAssetDiff', REPO_BASE_NAME);
  const LOG_FILE_NAME = `${config.WORKER_NAME}.log`;

  return {
    // set defaults
    TRACE_ACTIONS: false,
    AWS_BUCKET: '',
    LOG_LEVEL_CONSOLE: 'info',
    LOG_LEVEL_FILE: 'info',
    LOG_HEX_COLOR: '#FAEBD7',
    LOG_FILE_NAME,
    LOG_FILE_PATH: path.resolve(WORKING_DIR, LOG_FILE_NAME),
    WORKING_DIR,

    // merge user config
    ...config,

    // derived config
    REPO_BASE_NAME,
    CLONE_DIR: path.resolve(WORKING_DIR, `${REPO_BASE_NAME}.clone`),
    CACHE_DIR: path.resolve(WORKING_DIR, `${REPO_BASE_NAME}.cache`),
    SNAPSHOTS_DIR: path.resolve(WORKING_DIR, 'snapshots')
  };
};
