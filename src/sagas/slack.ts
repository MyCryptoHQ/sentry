import { SagaIterator } from 'redux-saga';
import { takeEvery, call, put, apply } from 'redux-saga/effects';

import {
  SlackTypeKeys,
  ISlackMessageIncomingAction,
  ISlackMessageOutgoingAction,
  ISlackDirectCommandAction,
  ISlackMessage,
  slackDirectCommand,
  slackMessageOutgoing
} from '../actions';
import {
  messageIsNotEdit,
  isChannelWhitelisted,
  isPureDirectMention,
  parseMessage,
  parseCmdAndArgs,
  replyDirect
} from '../libs';
import { getSlackClient } from '../slack';
import { logger } from '../configs'

function* handleMessageIncoming(action: ISlackMessageIncomingAction) {
  const msg: ISlackMessage = action.payload;
  const isWhitelisted = yield call(isChannelWhitelisted, msg);
  const isMention = yield call(isPureDirectMention, msg);
  const isNotEdit = yield call(messageIsNotEdit, msg);

  if (!isWhitelisted || !isMention || !isNotEdit) {
    return;
  }

  const parsedMessage = yield call(parseMessage, msg);
  const { cmd, args } = yield call(parseCmdAndArgs, parsedMessage);

  if (!cmd) {
    return;
  }

  logger.info('SLACK - Direct message detected');

  yield put(slackDirectCommand(msg, cmd, args));
}

function* handleMessageOutgoing(action: ISlackMessageOutgoingAction) {
  const { msg, channel } = action.payload;
  const client = yield call(getSlackClient);

  logger.info(`SLACK - Sending message to channel ${channel}`);

  yield apply(client, client.sendMessage, [msg, channel]);
}

function* handleDirectCommand(action: ISlackDirectCommandAction) {
  const { msg, cmd, args } = action.payload;
  const { channel } = msg;

  switch (cmd) {
    case 'ping':
      const reply = replyDirect(msg, 'pong');
      return yield put(slackMessageOutgoing(reply, channel));
  }
}

export function* slackSaga(): SagaIterator {
  yield takeEvery(SlackTypeKeys.SLACK_MESSAGE_INCOMING, handleMessageIncoming);
  yield takeEvery(SlackTypeKeys.SLACK_MESSAGE_OUTGOING, handleMessageOutgoing);
  yield takeEvery(SlackTypeKeys.SLACK_DIRECT_COMMAND, handleDirectCommand);
}
