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
  args: string[] | undefined;
}

export const parseCmdAndArgs = (isWorkerCmd: boolean) => ({ text }: ISlackMessage): ICmdAndArgs => {
  const split = isWorkerCmd ? text.split(' ').slice(2) : text.split(' ').slice(1);
  const cmd = split[0];
  const args = split.slice(1);

  return { cmd, args };
};

export const parseWorkerCmdAndArgs = (msg: ISlackMessage): ICmdAndArgs =>
  parseCmdAndArgs(true)(msg);

export const parseParentCmdAndArgs = (msg: ISlackMessage): ICmdAndArgs =>
  parseCmdAndArgs(false)(msg);

export const replyDirect = (msg: ISlackMessage, newMessage: string): string =>
  `<@${msg.user}> ${newMessage}`;

export const getWorkerNameFromSlackMsg = ({ text }: ISlackMessage): string => text.split(' ')[1];
