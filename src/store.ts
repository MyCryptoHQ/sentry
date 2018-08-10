import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware } from 'redux';
// import logger from 'redux-logger';
const chalk = require('chalk');

import { rootSaga } from './sagas';
import { rootReducer } from './reducers';
import { makeLocalLogger, getConfig } from './configs';

const _log = makeLocalLogger('store');
const { TRACE_ACTIONS } = getConfig();
const sagaMiddleware = createSagaMiddleware();

const debugLogger = (store: any) => (next: any) => (action: any) => {
  if (TRACE_ACTIONS) {
    _log.info(`${chalk.yellow('dispatching:')} ${JSON.stringify(action, null, 2)}`);
  }

  let result = next(action);
  // _log.debug(`${chalk.yellow('next state: ')} ${JSON.stringify(store.getState(), null, 2)}`)
  return result;
};

export const store = createStore(
  rootReducer,
  // applyMiddleware(logger),
  applyMiddleware(debugLogger, sagaMiddleware)
);

sagaMiddleware.run(rootSaga);
