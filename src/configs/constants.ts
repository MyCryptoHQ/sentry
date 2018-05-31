import * as path from 'path';
import { homedir } from 'os';

import { getSiteBaseName } from '../libs';
import { IUserConfig } from './types';

const configPath: string = path.resolve(process.argv[2]);
const USER_CONFIG: IUserConfig = require(configPath);
const { slack, aws, siteDiff, logLevels } = USER_CONFIG;
const siteBaseName = getSiteBaseName(siteDiff.url);

export const APP_NAME = 'sentry';
export const WORKING_DIR = path.resolve(`${homedir()}/${APP_NAME}/${siteBaseName}`);

export const SLACK_API_TOKEN = slack.apiToken;
export const SLACK_BOT_NAME = slack.botName;
export const SLACK_BOT_ID = slack.botId;
export const SLACK_CHANNELS_WHITELIST = slack.channelsWhitelist;
export const SLACK_BOT_REGEX = new RegExp(`^<@${slack.botId}>`);

export const AWS_ENABLED = aws.enabled;
export const AWS_BUCKET = aws.bucket;

export const SITE_URL = siteDiff.url;
export const SITE_POLL_INTERVAL = siteDiff.pollInterval;
export const SITE_BASE_NAME = siteBaseName;
export const SITE_BASE_DIR = WORKING_DIR; // path.resolve(WORKING_DIR, SITE_BASE_NAME)
export const SITE_CLONE_DIR = path.resolve(SITE_BASE_DIR, `${SITE_BASE_NAME}.clone`);
export const SITE_CACHE_DIR = path.resolve(SITE_BASE_DIR, `${SITE_BASE_NAME}.cache`);
export const SITE_SNAPSHOTS_DIR = path.resolve(SITE_BASE_DIR, 'snapshots');
export const SITE_IGNORED_FILES = siteDiff.ignoredFiles;

export const LOG_LEVEL_CONSOLE = logLevels && logLevels.console
    ? logLevels.console
    : 'info';
export const LOG_LEVEL_FILE = logLevels && logLevels.file
    ? logLevels.file
    : 'info';