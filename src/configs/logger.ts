import * as path from 'path';
import * as winston from 'winston';

import { WORKING_DIR, LOG_LEVEL_CONSOLE, LOG_LEVEL_FILE } from './constants';

export const LOG_FILE_NAME = 'log.txt';
export const LOG_FILE_PATH = path.resolve(WORKING_DIR, LOG_FILE_NAME);
export const logger = new winston.Logger();

logger.add(winston.transports.Console, {
  level: LOG_LEVEL_CONSOLE,
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: false
});

logger.add(winston.transports.File, {
  prettyPrint: false,
  level: LOG_LEVEL_FILE,
  silent: false,
  colorize: true,
  timestamp: true,
  filename: LOG_FILE_PATH,
  maxsize: 40000,
  maxFiles: 10,
  json: false
});
