import { SiteDiffTypeKeys, TSiteDiffActions } from '../actions';

export interface ISiteDiffState {
  working: boolean;
}

export const INITIAL_STATE: ISiteDiffState = {
  working: false
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
        working: false
      };
    default:
      return state;
  }
};
