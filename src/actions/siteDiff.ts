

export enum SiteDiffTypeKeys {
  SITE_DIFF_START = 'SITE_DIFF_START',
  SITE_DIFF_INTERVAL_START = 'SITE_DIFF_INTERVAL_START'
}

export interface ISiteDiffStartAction {
  type: SiteDiffTypeKeys.SITE_DIFF_START,
}

export function siteDiffStart(): ISiteDiffStartAction {
  return {
    type: SiteDiffTypeKeys.SITE_DIFF_START,
  }
}

export interface ISiteDiffIntervalStartAction {
  type: SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START
}

export function siteDiffIntervalStart(): ISiteDiffIntervalStartAction {
  return {
    type: SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START
  }
}
