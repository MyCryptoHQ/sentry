import * as cluster from 'cluster';

import * as fse from 'fs-extra';
import { SagaIterator } from 'redux-saga';
import { call, put, fork, takeEvery } from 'redux-saga/effects';

import { getChildConfigPaths } from './lib';
import { TWorkerConfig, IParentConfig, getConfig } from '../../configs';
import { store } from '../../store';
import {
  workerStart,
  workerClose,
  workerOnline,
  IWorkerStartAction,
  WorkerTypeKeys,
  slackChannelsWhitelistSet
} from '../../actions';

function* startAllWorkers(): SagaIterator {
  const configPaths: string[] = yield call(getChildConfigPaths);

  for (const configPath of configPaths) {
    yield call(startWorker, configPath);
  }
}

function* startWorker(configPath: string): SagaIterator {
  const config: TWorkerConfig = JSON.parse(yield call(fse.readFile, configPath));
  const worker = cluster.fork({
    SENTRY_CONFIG_PATH: configPath
  });

  worker.on('exit', (code, signal) => {
    store.dispatch(workerClose(code, signal, config));
  });

  worker.on('message', action => {
    // all communication is formatted as an action
    store.dispatch(action);
  });

  worker.on('online', () => {
    store.dispatch(workerOnline(worker.id, config));
  });

  yield put(workerStart(worker.id, config));
}

function* initWorker({ clusterId }: IWorkerStartAction): SagaIterator {
  const { SLACK_CHANNELS_WHITELIST }: IParentConfig = yield call(getConfig);

  cluster.workers[clusterId].send(slackChannelsWhitelistSet(SLACK_CHANNELS_WHITELIST));
}

export function* parentModeSaga() {
  yield fork(startAllWorkers);
  yield takeEvery(WorkerTypeKeys.WORKER_ONLINE, initWorker);
}
