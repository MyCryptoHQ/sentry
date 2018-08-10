const { RTMClient } = require('@slack/client');

import { getConfig, IParentConfig, makeLocalLogger } from './configs';
import { slackMessageIncoming, ISlackMessage } from './actions';
import { store } from './store';

const _log = makeLocalLogger('slack');

// slack real-time messaging
export const slackRTM: any = (() => {
  const { SLACK_API_TOKEN } = <IParentConfig>getConfig();
  return new RTMClient(SLACK_API_TOKEN);
})();

export const bindAndStartSlack = () => {
  if (!slackRTM.on) {
    _log.info('NOT binding slack');
    return;
  }

  slackRTM.on('authenticated', () => _log.info('RTM authenticated'));

  slackRTM.on('connected', () => {
    _log.info('RTM connected');
  });

  slackRTM.on('disconnected', () => {
    _log.info('RTM disconnected');
  });

  slackRTM.on('message', (message: ISlackMessage) => {
    store.dispatch(slackMessageIncoming(message));
  });

  slackRTM.start();
};

export const getSlackClient = (): any => slackRTM;
