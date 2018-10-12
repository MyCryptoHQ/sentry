import { TSlackActions, ISlackChannelsWhitelistSet, SlackTypeKeys } from '../actions';

export interface ISlackState {
  channelsWhitelist: string[];
}

const INITIAL_STATE: ISlackState = {
  channelsWhitelist: []
};

export const slackReducer = (state = INITIAL_STATE, action: TSlackActions): ISlackState => {
  switch (action.type) {
    case SlackTypeKeys.SLACK_CHANNELS_WHITELIST_SET:
      return reduceSlackChannelsWhitelistSet(state, action);
    default:
      return state;
  }
};

const reduceSlackChannelsWhitelistSet = (
  state: ISlackState,
  { channelsWhitelist }: ISlackChannelsWhitelistSet
): ISlackState => {
  return {
    ...state,
    channelsWhitelist
  };
};
