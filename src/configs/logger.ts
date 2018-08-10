import { transports, Logger, format, createLogger } from 'winston';
const { combine, timestamp, printf } = format;
const chalk = require('chalk');

import { getConfig } from './app';

export type TLogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';
export const logLevels: TLogLevel[] = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

const {
  LOG_LEVEL_CONSOLE,
  LOG_LEVEL_FILE,
  LOG_FILE_PATH,
  LOG_HEX_COLOR,
  WORKER_NAME
} = getConfig();

const consoleFormat = combine(
  printf(
    ({ level, message, moduleName }) =>
      `${chalk.hex(LOG_HEX_COLOR)(`[${WORKER_NAME}]`)} ${level}: ${
        moduleName ? `(${moduleName}) ` : ''
      }${message}`
  )
);

const fileFormat = combine(
  timestamp(),
  printf(
    ({ timestamp, level, message, moduleName }) =>
      `${timestamp ? `${timestamp} ` : ''}${chalk.hex(LOG_HEX_COLOR)(
        `[${WORKER_NAME}]`
      )} ${level}: ${moduleName ? `(${moduleName}) ` : ''}${message}`
  )
);

const winstonConsoleOptions = {
  level: LOG_LEVEL_CONSOLE,
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: false,
  format: consoleFormat
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
  json: false,
  format: fileFormat
};

export const logger = createLogger({
  transports: [
    new transports.Console(winstonConsoleOptions),
    new transports.File(winstonFileOptions)
  ]
});

type TLocalLogger = { [level in TLogLevel]: (message: string) => any };

export const makeLocalLogger = (moduleName: string): TLocalLogger => {
  const handler = (level: string) => (message: string) =>
    logger.log({ level, moduleName, message });
  let _log: any = {};
  logLevels.forEach(level => (_log[level] = handler(level)));
  return _log;
};
