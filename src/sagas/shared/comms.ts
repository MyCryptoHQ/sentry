import { ISlackMessage } from '../../actions';
import { replyDirect } from '../../libs';

export function handlePing(msg: ISlackMessage): string {
  return replyDirect(msg, 'pong');
}

export function handleNotFound(msg: ISlackMessage): string {
  return replyDirect(msg, 'command not found.');
}
