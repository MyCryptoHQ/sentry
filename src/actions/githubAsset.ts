import { IGithubAssetReport, IGithubAssetAnalysis } from '../libs/githubAsset';

export enum GithubAssetTypeKeys {
  GITHUB_ASSET_START = 'GITHUB_ASSET_START',
  GITHUB_ASSET_FINISH = 'GITHUB_ASSET_FINISH',
  GITHUB_ASSET_INTERVAL_START = 'GITHUB_ASSET_DIFF_INTERVAL_START',
  GITHUB_ASSET_CHANGED = 'GITHUB_ASSET_CHANGED',
  GITHUB_ASSET_UPDATED = 'GITHUB_ASSET_UPDATED'
}

export interface IGithubAssetStartAction {
  type: GithubAssetTypeKeys.GITHUB_ASSET_START;
}

export function githubAssetStart(): IGithubAssetStartAction {
  return {
    type: GithubAssetTypeKeys.GITHUB_ASSET_START
  };
}

export interface IGithubAssetFinishAction {
  type: GithubAssetTypeKeys.GITHUB_ASSET_FINISH;
}

export function githubAssetFinish(): IGithubAssetFinishAction {
  return {
    type: GithubAssetTypeKeys.GITHUB_ASSET_FINISH
  };
}

export interface IGithubAssetIntervalStartAction {
  type: GithubAssetTypeKeys.GITHUB_ASSET_INTERVAL_START;
}

export function githubAssetIntervalStart(): IGithubAssetIntervalStartAction {
  return {
    type: GithubAssetTypeKeys.GITHUB_ASSET_INTERVAL_START
  };
}

export interface IGithubAssetChangedAction {
  type: GithubAssetTypeKeys.GITHUB_ASSET_CHANGED;
  report: IGithubAssetReport;
}

export function githubAssetChanged(report: IGithubAssetReport): IGithubAssetChangedAction {
  return {
    type: GithubAssetTypeKeys.GITHUB_ASSET_CHANGED,
    report
  };
}

export interface IGithubAssetUpdatedAction {
  type: GithubAssetTypeKeys.GITHUB_ASSET_UPDATED;
  manifest: IGithubAssetAnalysis[];
  rootHash: string;
  report: IGithubAssetReport;
}

export function githubAssetUpdated(report: IGithubAssetReport): IGithubAssetUpdatedAction {
  const { assets, rootHash } = report;
  return {
    type: GithubAssetTypeKeys.GITHUB_ASSET_UPDATED,
    manifest: assets,
    rootHash,
    report
  };
}

export type TGithubAssetActions =
  | IGithubAssetStartAction
  | IGithubAssetFinishAction
  | IGithubAssetIntervalStartAction
  | IGithubAssetChangedAction
  | IGithubAssetUpdatedAction;
