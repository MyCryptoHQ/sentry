import { combineReducers } from 'redux';

// import { configReducer as config } from './config'
import { siteDiffReducer } from './siteDiff';
import { slackReducer } from './slack';

export const rootReducer = combineReducers({
  // config,
  siteDiffReducer,
  slackReducer
});
