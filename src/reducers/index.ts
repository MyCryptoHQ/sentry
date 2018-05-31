import { combineReducers } from 'redux';

import { 
  siteDiffReducer as siteDiff,
  ISiteDiffState
} from './siteDiff';
import { 
  slackReducer as slack,
  ISlackState
} from './slack';

export interface AppState {
  siteDiff: ISiteDiffState,
  slack: ISlackState
}

export const rootReducer = combineReducers<AppState>({
  siteDiff,
  slack
});
