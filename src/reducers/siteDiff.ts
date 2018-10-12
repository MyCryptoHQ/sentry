import { SiteDiffTypeKeys, TSiteDiffActions, ISiteDiffChangeDetectedAction } from '../actions';

export interface IChangeInfo {
  newRootHash: string;
  timeOfChange: Date;
  slackMessage: string;
}

export interface ISiteDiffState {
  working: boolean;
  cacheRootHash: string;
  reports: IChangeInfo[];
  lastPolled: Date | null;
}

export const INITIAL_STATE: ISiteDiffState = {
  working: false,
  cacheRootHash: '',
  reports: [],
  lastPolled: null
};

export const siteDiffReducer = (
  state = INITIAL_STATE,
  action: TSiteDiffActions
): ISiteDiffState => {
  switch (action.type) {
    case SiteDiffTypeKeys.SITE_DIFF_START:
      return {
        ...state,
        working: true
      };
    case SiteDiffTypeKeys.SITE_DIFF_FINISH:
      return {
        ...state,
        working: false,
        lastPolled: new Date()
      };
    case SiteDiffTypeKeys.SITE_DIFF_INIT_ROOT_HASH:
      return {
        ...state,
        cacheRootHash: action.rootHash
      };
    case SiteDiffTypeKeys.SITE_DIFF_CHANGE_DETECTED:
      return handleSiteDiffChangeDetected(state, action);
    default:
      return state;
  }
};

function handleSiteDiffChangeDetected(
  state: ISiteDiffState,
  { report }: ISiteDiffChangeDetectedAction
): ISiteDiffState {
  return {
    ...state,
    cacheRootHash: report.clonedRootHash,
    reports: [
      ...state.reports,
      {
        newRootHash: report.clonedRootHash,
        timeOfChange: new Date(),
        slackMessage: report.slackMessage
      }
    ]
  };
}
