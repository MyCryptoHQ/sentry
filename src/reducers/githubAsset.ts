import { GithubAssetTypeKeys, TGithubAssetActions, IGithubAssetUpdatedAction } from '../actions';
import { IGithubAssetAnalysis } from '../libs';

export interface IGithubAssetState {
  working: boolean;
  rootHash: string;
  manifest: IGithubAssetAnalysis[];
}

export const INITIAL_STATE: IGithubAssetState = {
  working: false,
  rootHash: '',
  manifest: []
};

export const githubAssetReducer = (
  state: IGithubAssetState = INITIAL_STATE,
  action: TGithubAssetActions
): IGithubAssetState => {
  switch (action.type) {
    case GithubAssetTypeKeys.GITHUB_ASSET_START:
      return {
        ...state,
        working: true
      };
    case GithubAssetTypeKeys.GITHUB_ASSET_FINISH:
      return {
        ...state,
        working: false
      };
    case GithubAssetTypeKeys.GITHUB_ASSET_UPDATED:
      return handleGithubAssetUpdated(state, action);
    default:
      return state;
  }
};

const handleGithubAssetUpdated = (
  state: IGithubAssetState,
  { rootHash, manifest }: IGithubAssetUpdatedAction
): IGithubAssetState => ({
  ...state,
  rootHash,
  manifest
});
