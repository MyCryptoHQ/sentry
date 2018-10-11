import { IAppState } from '../reducers';
import { IAssetChangeInfo } from '../reducers/githubAsset';
import { IGithubAssetAnalysis } from '../libs';

export const getWorking = (state: IAppState): IAppState['githubAsset']['working'] =>
  state.githubAsset.working;

export const getManifest = (state: IAppState): IGithubAssetAnalysis[] => state.githubAsset.manifest;

export interface IGithubAssetSummaryInfo {
  rootHash: string;
  lastPolled: Date | null;
  lastChange: Date | null;
}
export const getAssetSummaryInfo = (state: IAppState): IGithubAssetSummaryInfo => {
  const { rootHash, reports, lastPolled } = state.githubAsset;
  let lastChange = null;

  if (reports.length) {
    lastChange = reports[reports.length - 1].timeOfChange;
  }

  return {
    rootHash,
    lastChange,
    lastPolled
  };
};

export const getAssetReports = (state: IAppState): IAssetChangeInfo[] => state.githubAsset.reports;
