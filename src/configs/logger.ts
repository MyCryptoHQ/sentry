import * as path from 'path';
import * as winston from 'winston';

import { WORKING_DIR } from './constants';

export const LOG_FILE_NAME = 'log.txt';
export const LOG_FILE_PATH = path.resolve(WORKING_DIR, LOG_FILE_NAME);
export const logger = winston.add(winston.transports.File, {
  filename: LOG_FILE_PATH
});
