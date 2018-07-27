import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';

import { rootSaga } from './sagas';
import { rootReducer } from './reducers';

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
  rootReducer,
  // applyMiddleware(logger),
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);
