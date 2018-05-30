
export interface IUserConfig {
  siteDiff: {
    url: string,
    ignoredFiles: string[],
    pollInterval: number
  },
  slack: {
    apiToken: string,
    botName: string,
    botId: string,
    channelsWhitelist: string[]
  },
  aws: {
    enabled: boolean,
    bucket: string
  }
}
