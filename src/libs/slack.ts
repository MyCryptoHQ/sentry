import { ISlackMessage } from '../actions';
import { SLACK_BOT_REGEX, SLACK_CHANNELS_WHITELIST } from '../configs';

export const messageIsNotEdit = (msg: ISlackMessage): any => !msg.hasOwnProperty('message');

export const isPureDirectMention = (msg: ISlackMessage): boolean => SLACK_BOT_REGEX.test(msg.text);

export const isChannelWhitelisted = (msg: ISlackMessage): boolean =>
  SLACK_CHANNELS_WHITELIST.indexOf(msg.channel) !== -1;

export const parseMessage = (msg: ISlackMessage): string =>
  msg.text
    .replace(SLACK_BOT_REGEX, '')
    .toLocaleLowerCase()
    .trim();

export interface ICmdAndArgs {
  cmd: string | undefined;
  args: string[];
}

export const parseCmdAndArgs = (text: string): ICmdAndArgs => {
  const args = text.split(' ');
  const cmd = args.shift();

  return { cmd, args };
};

export const replyDirect = (msg: ISlackMessage, newMessage: string): string =>
  `<@${msg.user}> ${newMessage}`;
