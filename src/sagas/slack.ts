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
import { messageIsNotEdit, isChannelWhitelisted, isPureDirectMention, getProcess } from '../libs';
import { getSlackClient, bindAndStartSlack } from '../slack';
import { makeLocalLogger, getConfig, TAppConfig, IParentConfig } from '../configs';
import { getWorkerNames, TWorkerNames, getSlackChannelsWhitelist } from '../selectors';

const _log = makeLocalLogger('slack');

export function* isWorkerCommand({ text }: ISlackMessage): SagaIterator {
  const secondArg = text.split(' ')[1];
  const workerNames: TWorkerNames[] = yield select(getWorkerNames);

  return workerNames.indexOf(secondArg) !== -1;
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

  _log.info('Direct message detected');

  if (yield call(isWorkerCommand, msg)) {
    yield put(slackWorkerCommand(msg));
  } else {
    yield put(slackParentCommand(msg));
  }
}

function* handleSlackMessageOutgoing({ msg, channel }: ISlackMessageOutgoingAction) {
  const { MODE }: TAppConfig = yield call(getConfig);
  const _process = yield call(getProcess);

  if (MODE === 'parent') {
    const client = yield call(getSlackClient);
    _log.info(`Sending message to channel ${channel}`);
    yield apply(client, client.sendMessage, [msg, channel]);
  } else {
    yield apply(_process, _process.send, [slackMessageOutgoing(msg, channel)]);
  }
}

export function* slackSaga(): SagaIterator {
  const { MODE, ...config }: TAppConfig = yield call(getConfig);

  if (MODE === 'parent') {
    yield call(bindAndStartSlack);
    yield put(slackChannelsWhitelistSet((config as IParentConfig).SLACK_CHANNELS_WHITELIST));
  }

  yield takeEvery(SlackTypeKeys.SLACK_MESSAGE_INCOMING, handleSlackMessageIncoming);
  yield takeEvery(SlackTypeKeys.SLACK_MESSAGE_OUTGOING, handleSlackMessageOutgoing);
}
