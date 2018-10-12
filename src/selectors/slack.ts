import { IAppState } from '../reducers';

export const getSlackChannelsWhitelist = (state: IAppState) => state.slack.channelsWhitelist;
