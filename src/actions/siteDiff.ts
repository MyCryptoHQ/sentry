export enum SiteDiffTypeKeys {
  SITE_DIFF_START = 'SITE_DIFF_START',
  SITE_DIFF_FINISH = 'SITE_DIFF_FINISH',
  SITE_DIFF_INTERVAL_START = 'SITE_DIFF_INTERVAL_START'
}

export interface ISiteDiffStartAction {
  type: SiteDiffTypeKeys.SITE_DIFF_START;
}

export function siteDiffStart(): ISiteDiffStartAction {
  return {
    type: SiteDiffTypeKeys.SITE_DIFF_START
  };
}

export interface ISiteDiffFinishAction {
  type: SiteDiffTypeKeys.SITE_DIFF_FINISH;
}

export function siteDiffFinish(): ISiteDiffFinishAction {
  return {
    type: SiteDiffTypeKeys.SITE_DIFF_FINISH
  };
}

export interface ISiteDiffIntervalStartAction {
  type: SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START;
}

export function siteDiffIntervalStart(): ISiteDiffIntervalStartAction {
  return {
    type: SiteDiffTypeKeys.SITE_DIFF_INTERVAL_START
  };
}

export type TSiteDiffActions = 
  ISiteDiffStartAction |
  ISiteDiffFinishAction |
  ISiteDiffIntervalStartAction;