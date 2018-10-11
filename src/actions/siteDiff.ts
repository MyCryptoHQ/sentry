import { ISiteDiffReport } from '../libs';

export enum SiteDiffTypeKeys {
  SITE_DIFF_START = 'SITE_DIFF_START',
  SITE_DIFF_FINISH = 'SITE_DIFF_FINISH',
  SITE_DIFF_CHANGE_DETECTED = 'SITE_DIFF_CHANGE_DETECTED',
  SITE_DIFF_INTERVAL_START = 'SITE_DIFF_INTERVAL_START',
  SITE_DIFF_INIT_ROOT_HASH = 'SITE_DIFF_INIT_ROOT_HASH'
}

export interface ISiteDiffChangeDetectedAction {
  type: SiteDiffTypeKeys.SITE_DIFF_CHANGE_DETECTED;
  report: ISiteDiffReport;
}

export function siteDiffChangeDetected(report: ISiteDiffReport): ISiteDiffChangeDetectedAction {
  return {
    type: SiteDiffTypeKeys.SITE_DIFF_CHANGE_DETECTED,
    report
  };
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

export interface ISiteDiffInitRootHashAction {
  type: SiteDiffTypeKeys.SITE_DIFF_INIT_ROOT_HASH;
  rootHash: string;
}

export function siteDiffInitRootHash(rootHash: string): ISiteDiffInitRootHashAction {
  return {
    type: SiteDiffTypeKeys.SITE_DIFF_INIT_ROOT_HASH,
    rootHash
  };
}

export type TSiteDiffActions =
  | ISiteDiffStartAction
  | ISiteDiffFinishAction
  | ISiteDiffIntervalStartAction
  | ISiteDiffChangeDetectedAction
  | ISiteDiffInitRootHashAction;
