import * as cluster from 'cluster';

import { SagaIterator } from 'redux-saga';
import { takeEvery, call, put, apply, select } from 'redux-saga/effects';

import {
  SlackTypeKeys,
  ISlackMessageIncomingAction,
  ISlackMessageOutgoingAction,
  ISlackMessage,
  slackParentCommand,
  slackWorkerCommand,
  slackMessageOutgoing,
  slackChannelsWhitelistSet
} from '../actions';
import {
  messageIsNotEdit,
  isChannelWhitelisted,
  isPureDirectMention
} from '../libs';
import { getSlackClient, bindAndStartSlack } from '../slack';
import { logger, getConfig, TAppConfig, IParentConfig } from '../configs';
import { getWorkerNames, TWorkerNames, getSlackChannelsWhitelist } from '../selectors';


export function* isWorkerCommand({ text }: ISlackMessage): SagaIterator {
  const firstArg = text.split(' ')[0];
  const workerNames: TWorkerNames[] = yield select(getWorkerNames)
  
  return workerNames.indexOf(firstArg) !== -1;
}

function* handleSlackMessageIncoming({ msg }: ISlackMessageIncomingAction) {
  const { SLACK_BOT_REGEX }: IParentConfig = yield call(getConfig);
  const channelsWhitelist = yield select(getSlackChannelsWhitelist);

  const isWhitelisted = yield call(isChannelWhitelisted, msg, channelsWhitelist);
  const isMention = yield call(isPureDirectMention, msg, SLACK_BOT_REGEX);
  const isNotEdit = yield call(messageIsNotEdit, msg);

  if (!isWhitelisted || !isMention || !isNotEdit) {
    return;
  }

  logger.info('SLACK - Direct message detected');

  if (yield call(isWorkerCommand, msg)) {
    yield put(slackWorkerCommand(msg))
  } else {
    yield put(slackParentCommand(msg))
  }
}

function* handleSlackMessageOutgoing({ msg, channel }: ISlackMessageOutgoingAction) {
  const { MODE }: TAppConfig = yield call(getConfig);

  if (MODE === 'parent') {
    const client = yield call(getSlackClient);
    logger.info(`SLACK - Sending message to channel ${channel}`);
    yield apply(client, client.sendMessage, [msg, channel]);
  } else {
    yield call(process.send, slackMessageOutgoing(msg, channel))
  }
}



export function* slackSaga(): SagaIterator {
  const { MODE, ...config }: TAppConfig = yield call(getConfig);

  if (MODE === 'parent') {
    yield call(bindAndStartSlack);
    yield put(slackChannelsWhitelistSet((config as IParentConfig).SLACK_CHANNELS_WHITELIST))
  }

  yield takeEvery(SlackTypeKeys.SLACK_MESSAGE_INCOMING, handleSlackMessageIncoming);
  yield takeEvery(SlackTypeKeys.SLACK_MESSAGE_OUTGOING, handleSlackMessageOutgoing);
}
