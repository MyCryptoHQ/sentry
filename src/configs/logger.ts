import { transports, Logger, format, createLogger } from 'winston';
const { combine, timestamp, printf } = format;
const { hex } = require('chalk');

import { getConfig } from './app';

export type TLogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

const {
  LOG_LEVEL_CONSOLE,
  LOG_LEVEL_FILE,
  LOG_FILE_PATH,
  LOG_HEX_COLOR,
  WORKER_NAME
} = getConfig();

const winstonConsoleOptions = {
  level: LOG_LEVEL_CONSOLE,
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: false
};

const winstonFileOptions = {
  prettyPrint: false,
  level: LOG_LEVEL_FILE,
  silent: false,
  colorize: true,
  timestamp: true,
  filename: LOG_FILE_PATH,
  maxsize: 40000,
  maxFiles: 10,
  json: false
};

const myFormat = printf(
  ({ timestamp, level, message }) =>
    `${timestamp} ${hex(LOG_HEX_COLOR)(`[${WORKER_NAME}]`)} ${level}: ${message}`
);

export const logger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.Console(winstonConsoleOptions),
    new transports.File(winstonFileOptions)
  ]
});
