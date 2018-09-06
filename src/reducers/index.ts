import { combineReducers } from 'redux';

import { siteDiffReducer as siteDiff, ISiteDiffState } from './siteDiff';
import { slackReducer as slack, ISlackState } from './slack';
import { workerReducer as worker, IWorkerState } from './worker';

export interface IAppState {
  siteDiff: ISiteDiffState;
  slack: ISlackState;
  worker: IWorkerState;
}

export const rootReducer = combineReducers<IAppState>({
  siteDiff,
  slack,
  worker
});
