import * as path from 'path';
import { homedir } from 'os';

import { TLogLevel } from './logger';
import { APP_NAME, CONFIG_PATH } from './app';

export interface IParentConfigurable {
  MODE: 'parent';
  TRACE_ACTIONS?: boolean;
  SLACK_API_TOKEN: string;
  SLACK_BOT_NAME: string;
  SLACK_BOT_ID: string;
  SLACK_CHANNELS_WHITELIST: string[];
  LOG_LEVEL_CONSOLE?: TLogLevel | null;
  LOG_LEVEL_FILE?: TLogLevel | null;
  LOG_FILE_NAME?: string | null;
  LOG_FILE_PATH?: string | null;
  CHILD_CONFIG_FOLDER?: string;
  WORKING_DIR?: string | null;
  LOG_HEX_COLOR?: string;
}

export interface IParentConfig extends Required<IParentConfigurable> {
  SLACK_BOT_REGEX: RegExp;
  WORKER_NAME: 'parent';
}

export const makeParentConfig = (config: IParentConfigurable): IParentConfig => {
  const WORKING_DIR = config.WORKING_DIR
    ? path.resolve(config.WORKING_DIR)
    : path.resolve(homedir(), `.${APP_NAME}`, 'parent');
  const LOG_FILE_NAME = 'parent.log';
  const CHILD_CONFIG_FOLDER = config.CHILD_CONFIG_FOLDER
    ? path.resolve(config.CHILD_CONFIG_FOLDER)
    : path.dirname(CONFIG_PATH);

  return {
    TRACE_ACTIONS: false,
    CHILD_CONFIG_FOLDER,
    LOG_HEX_COLOR: '#008000',
    LOG_LEVEL_CONSOLE: 'info',
    LOG_LEVEL_FILE: 'info',
    LOG_FILE_NAME,
    LOG_FILE_PATH: path.resolve(WORKING_DIR, LOG_FILE_NAME),
    WORKING_DIR,
    ...config,
    WORKER_NAME: 'parent',
    SLACK_BOT_REGEX: new RegExp(`^<@${config.SLACK_BOT_ID}>`)
  };
};
