import { combineReducers } from 'redux';

import { siteDiffReducer as siteDiff, ISiteDiffState } from './siteDiff';
import { slackReducer as slack, ISlackState } from './slack';
import { workerReducer as worker, IWorkerState } from './worker';
import { githubAssetReducer as githubAsset, IGithubAssetState } from './githubAsset';

export interface IAppState {
  siteDiff: ISiteDiffState;
  slack: ISlackState;
  worker: IWorkerState;
  githubAsset: IGithubAssetState;
}

export const rootReducer = combineReducers<IAppState>({
  siteDiff,
  githubAsset,
  slack,
  worker
});
