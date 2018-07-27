import { TWorkerConfig } from '../configs';

export enum WorkerTypeKeys {
  WORKER_START = 'WORKER_START',
  WORKER_CLOSE = 'WORKER_CLOSE',
  WORKER_MESSAGE = 'WORKER_MESSAGE'
}

export interface IWorkerStartAction {
  type: WorkerTypeKeys.WORKER_START;
  workerName: string;
  clusterId: number;
  config: TWorkerConfig;
}

export function workerStart(clusterId: number, config: TWorkerConfig): IWorkerStartAction {
  return {
    type: WorkerTypeKeys.WORKER_START,
    workerName: config.WORKER_NAME,
    clusterId,
    config
  };
}

export interface IWorkerCloseAction {
  type: WorkerTypeKeys.WORKER_CLOSE;
  code: number;
  signal: string;
  workerName: string;
  config: TWorkerConfig;
}

export function workerClose(code: number, signal: string, config: TWorkerConfig): IWorkerCloseAction {
  return {
    type: WorkerTypeKeys.WORKER_CLOSE,
    workerName: config.WORKER_NAME,
    code, 
    signal,
    config
  };
}

export interface IWorkerMessageAction {
  type: WorkerTypeKeys.WORKER_MESSAGE;
  msg: any;
}

export function workerMessage(msg: any): IWorkerMessageAction {
  return {
    type: WorkerTypeKeys.WORKER_MESSAGE,
    msg
  };
}

export type TWorkerActions =
  IWorkerStartAction |
  IWorkerCloseAction |
  IWorkerMessageAction;