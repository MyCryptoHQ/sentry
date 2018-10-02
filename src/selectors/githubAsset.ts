import { IAppState } from '../reducers';
import { IGithubAssetAnalysis } from '../libs';

export const getWorking = (state: IAppState): IAppState['githubAsset']['working'] =>
  state.githubAsset.working;

export const getManifest = (state: IAppState): IGithubAssetAnalysis[] => state.githubAsset.manifest;
