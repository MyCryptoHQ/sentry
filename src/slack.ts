import { CLIENT_EVENTS, RTM_EVENTS, RtmClient } from '@slack/client';

import { SLACK_API_TOKEN, logger } from './configs';
import { slackMessageIncoming, ISlackMessage } from './actions';
import { store } from './store';

// slack real-time messaging
export const slackRTM: any = new RtmClient(SLACK_API_TOKEN);

export const bindAndStartSlack = () => {
  if (!slackRTM.on) return;

  slackRTM.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData =>
    logger.info('SLACK - Authenticated successfully')
  );

  slackRTM.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    logger.info('SLACK - RTM connection ready');
  });

  slackRTM.on(RTM_EVENTS.MESSAGE, (message: ISlackMessage) => {
    store.dispatch(slackMessageIncoming(message));
  });

  slackRTM.start();
};

export const getSlackClient = (): any => slackRTM;
