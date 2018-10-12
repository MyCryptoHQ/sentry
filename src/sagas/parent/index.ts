import * as cluster from 'cluster';

import * as fse from 'fs-extra';
import { SagaIterator } from 'redux-saga';
import { call, put, fork, select, takeEvery } from 'redux-saga/effects';

import { getChildConfigPaths } from './lib';
import { handleParentCommand } from './comms';
import { TWorkerConfig, IParentConfig, getConfig } from '../../configs';
import { store } from '../../store';
import {
  workerStart,
  workerClose,
  workerOnline,
  IWorkerStartAction,
  WorkerTypeKeys,
  SlackTypeKeys,
  slackChannelsWhitelistSet,
  ISlackMessage,
  ISlackWorkerCommandAction,
  slackWorkerCommand
} from '../../actions';
import { getWorkerNamesAndClusterIds } from '../../selectors';
import { getWorkerNameFromSlackMsg } from '../../libs';

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

function* handleWorkerCommand({ msg }: ISlackWorkerCommandAction) {
  const workerName = getWorkerNameFromSlackMsg(msg);
  const namesAndIds = yield select(getWorkerNamesAndClusterIds);
  const nameAndId = namesAndIds.find((o: any) => o.name === workerName);

  if (!nameAndId) {
    throw new Error(`Could not find clusterId with worker name ${workerName}`);
  }

  cluster.workers[nameAndId.clusterId].send(slackWorkerCommand(msg));
}

export function* parentModeSaga() {
  yield fork(startAllWorkers);
  yield takeEvery(WorkerTypeKeys.WORKER_ONLINE, initWorker);
  yield takeEvery(SlackTypeKeys.SLACK_PARENT_COMMAND, handleParentCommand);
  yield takeEvery(SlackTypeKeys.SLACK_WORKER_COMMAND, handleWorkerCommand);
}
