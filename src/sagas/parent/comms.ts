import { call, put } from 'redux-saga/effects';

import { parseParentCmdAndArgs, replyDirect } from '../../libs';
import { ISlackParentCommandAction, ISlackMessage, slackMessageOutgoing } from '../../actions';

export function* handleParentCommand({ msg }: ISlackParentCommandAction) {
  const parsed = parseParentCmdAndArgs(msg);
  const { channel } = msg;
  let resp;

  switch (parsed.cmd) {
    case 'ping':
      resp = handlePing(msg);
      break;
    default:
      resp = handleNotFound(msg);
      break;
  }

  yield put(slackMessageOutgoing(resp, channel));
}

function handlePing(msg: ISlackMessage): string {
  return replyDirect(msg, 'pong');
}

function handleNotFound(msg: ISlackMessage): string {
  return replyDirect(msg, 'command not found.');
}
