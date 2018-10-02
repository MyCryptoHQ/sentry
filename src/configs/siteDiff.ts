import { homedir } from 'os';
import * as path from 'path';

import { TLogLevel } from './logger';
import { getSiteBaseName } from '../libs';
import { APP_NAME } from './app';

export interface ISiteDiffConfigurable {
  MODE: 'siteDiff';
  TRACE_ACTIONS?: boolean;
  WORKER_NAME: string;
  SITE_URL: string;
  SITE_POLL_INTERVAL: number;
  AWS_ENABLED?: boolean;
  AWS_BUCKET?: string;
  WORKING_DIR?: string;
  LOG_HEX_COLOR?: string;
  LOG_LEVEL_CONSOLE?: TLogLevel;
  LOG_LEVEL_FILE?: TLogLevel;
  LOG_FILE_NAME?: string;
  LOG_FILE_PATH?: string;
}

export interface ISiteDiffConfig extends Required<ISiteDiffConfigurable> {
  SITE_BASE_NAME: string;
  // SITE_BASE_DIR: string;
  SITE_CLONE_DIR: string;
  SITE_CACHE_DIR: string;
  SITE_SNAPSHOTS_DIR: string;
  SITE_IGNORED_FILES: string[];
}

export const makeSiteDiffConfig = (config: ISiteDiffConfigurable): ISiteDiffConfig => {
  const SITE_BASE_NAME = getSiteBaseName(config.SITE_URL);
  const WORKING_DIR = config.WORKING_DIR
    ? path.resolve(config.WORKING_DIR)
    : path.resolve(homedir(), `.${APP_NAME}`, 'siteDiff', SITE_BASE_NAME);
  const LOG_FILE_NAME = `${config.WORKER_NAME}.log`;

  return {
    // set defaults
    TRACE_ACTIONS: false,
    AWS_ENABLED: false,
    AWS_BUCKET: '',
    LOG_LEVEL_CONSOLE: 'info',
    LOG_LEVEL_FILE: 'info',
    LOG_HEX_COLOR: '#FAEBD7',
    SITE_IGNORED_FILES: [],
    LOG_FILE_NAME,
    LOG_FILE_PATH: path.resolve(WORKING_DIR, LOG_FILE_NAME),
    WORKING_DIR,

    // merge user config
    ...config,

    // derived config
    SITE_BASE_NAME,
    SITE_CLONE_DIR: path.resolve(WORKING_DIR, `${SITE_BASE_NAME}.clone`),
    SITE_CACHE_DIR: path.resolve(WORKING_DIR, `${SITE_BASE_NAME}.cache`),
    SITE_SNAPSHOTS_DIR: path.resolve(WORKING_DIR, 'snapshots')
  };
};
