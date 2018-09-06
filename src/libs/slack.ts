import { ISlackMessage } from '../actions';

export const messageIsNotEdit = (msg: ISlackMessage): any => !msg.hasOwnProperty('message');

export const isPureDirectMention = (msg: ISlackMessage, slackBotRegex: RegExp): boolean =>
  slackBotRegex.test(msg.text);

export const isChannelWhitelisted = (msg: ISlackMessage, channelWhitelist: string[]): boolean =>
  channelWhitelist.indexOf(msg.channel) !== -1;

export const parseMessage = (msg: ISlackMessage, slackBotRegex: RegExp): string =>
  msg.text
    .replace(slackBotRegex, '')
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
