export interface ISiteManifest {
  file: string;
  hash: string;
}

export interface ISiteDiffState {}

export const INITIAL_STATE: ISiteDiffState = {};

export const siteDiffReducer = (state = INITIAL_STATE, action): ISiteDiffState => {
  switch (action.type) {
    default:
      return state;
  }
};
