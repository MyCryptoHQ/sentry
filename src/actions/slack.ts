

export enum SlackTypeKeys {
  SLACK_MESSAGE_INCOMING = 'SLACK_MESSAGE_INCOMING',
  SLACK_MESSAGE_OUTGOING = 'SLACK_MESSAGE_OUTGOING',
  SLACK_DIRECT_COMMAND = 'SLACK_MESSAGE_DIRECT_COMMAND'
}


export interface ISlackMessage {
  type: string,
  channel: string,
  user: string,
  text: string,
  ts: string,
  source_team: string,
  team: string
}

/**
 * action type interfaces
 */

export interface ISlackMessageIncomingAction {
  type: SlackTypeKeys.SLACK_MESSAGE_INCOMING,
  payload: ISlackMessage
}

export interface ISlackMessageOutgoingAction {
  type: SlackTypeKeys.SLACK_MESSAGE_OUTGOING,
  payload: {
    msg: string,
    channel: string
  }
}

export interface ISlackDirectCommandAction {
  type: SlackTypeKeys.SLACK_DIRECT_COMMAND,
  payload: {
    msg: ISlackMessage,
    cmd: string,
    args: string[]
  }
}

/**
 * action creators
 */

export function slackMessageIncoming(message: ISlackMessage): ISlackMessageIncomingAction {
  return {
    type: SlackTypeKeys.SLACK_MESSAGE_INCOMING,
    payload: message
  }
}

export function slackMessageOutgoing(
  msg: string,
  channel: string
): ISlackMessageOutgoingAction {
  return {
    type: SlackTypeKeys.SLACK_MESSAGE_OUTGOING,
    payload: { msg, channel }
  }
}

export function slackDirectCommand(
  msg: ISlackMessage,
  cmd: string,
  args: string[]
): ISlackDirectCommandAction {
  return {
    type: SlackTypeKeys.SLACK_DIRECT_COMMAND,
    payload: { msg, cmd, args }
  }
}

