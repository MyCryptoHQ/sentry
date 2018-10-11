import { GithubAssetTypeKeys, TGithubAssetActions, IGithubAssetUpdatedAction } from '../actions';
import { IGithubAssetAnalysis } from '../libs';

export interface IAssetChangeInfo {
  newRootHash: string;
  timeOfChange: Date;
  slackMessage: string;
}

export interface IGithubAssetState {
  working: boolean;
  rootHash: string;
  manifest: IGithubAssetAnalysis[];
  lastPolled: Date | null;
  reports: IAssetChangeInfo[];
}

export const INITIAL_STATE: IGithubAssetState = {
  working: false,
  rootHash: '',
  manifest: [],
  lastPolled: null,
  reports: []
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
        lastPolled: new Date(),
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
  { rootHash, manifest, slackMessage }: IGithubAssetUpdatedAction
): IGithubAssetState => ({
  ...state,
  rootHash,
  manifest,
  reports: [
    ...state.reports,
    {
      newRootHash: rootHash,
      timeOfChange: new Date(),
      slackMessage
    }
  ]
});
