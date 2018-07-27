export enum SlackTypeKeys {
  SLACK_MESSAGE_INCOMING = 'SLACK_MESSAGE_INCOMING',
  SLACK_MESSAGE_OUTGOING = 'SLACK_MESSAGE_OUTGOING',
  SLACK_DIRECT_COMMAND = 'SLACK_MESSAGE_DIRECT_COMMAND',
  SLACK_PARENT_COMMAND = 'SLACK_PARENT_COMMAND',
  SLACK_WORKER_COMMAND = 'SLACK_WORKER_COMMAND',
  SLACK_CHANNELS_WHITELIST_SET = 'SLACK_CHANNELS_WHITELIST_SET'
}

export interface ISlackMessage {
  type: string;
  channel: string;
  user: string;
  text: string;
  ts: string;
  source_team: string;
  team: string;
}

/**
 * action type interfaces
 */





/**
 * action creators
 */

export interface ISlackMessageIncomingAction {
  type: SlackTypeKeys.SLACK_MESSAGE_INCOMING;
  msg: ISlackMessage;
}


export function slackMessageIncoming(msg: ISlackMessage): ISlackMessageIncomingAction {
  return {
    type: SlackTypeKeys.SLACK_MESSAGE_INCOMING,
    msg
  };
}

export interface ISlackMessageOutgoingAction {
  type: SlackTypeKeys.SLACK_MESSAGE_OUTGOING;
  msg: string;
  channel: string;
}

export function slackMessageOutgoing(msg: string, channel: string): ISlackMessageOutgoingAction {
  return {
    type: SlackTypeKeys.SLACK_MESSAGE_OUTGOING,
    msg, 
    channel
  };
}

export interface ISlackParentCommandAction {
  type: SlackTypeKeys.SLACK_PARENT_COMMAND;
  msg: ISlackMessage;
}

export function slackParentCommand(msg: ISlackMessage): ISlackParentCommandAction {
  return {
    type: SlackTypeKeys.SLACK_PARENT_COMMAND,
    msg
  }
}

export interface ISlackWorkerCommandAction {
  type: SlackTypeKeys.SLACK_WORKER_COMMAND;
  msg: ISlackMessage;
}

export function slackWorkerCommand(msg: ISlackMessage): ISlackWorkerCommandAction {
  return {
    type: SlackTypeKeys.SLACK_WORKER_COMMAND,
    msg
  }
}

export interface ISlackChannelsWhitelistSet {
  type: SlackTypeKeys.SLACK_CHANNELS_WHITELIST_SET,
  channelsWhitelist: string[]
}

export function slackChannelsWhitelistSet(channelsWhitelist: string[]): ISlackChannelsWhitelistSet {
  return {
    type: SlackTypeKeys.SLACK_CHANNELS_WHITELIST_SET,
    channelsWhitelist
  }
}

export type TSlackActions = 
  ISlackMessageIncomingAction |
  ISlackMessageOutgoingAction | 
  ISlackParentCommandAction | 
  ISlackWorkerCommandAction | 
  ISlackChannelsWhitelistSet