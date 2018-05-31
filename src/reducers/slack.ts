export interface ISlackState {}

const INITIAL_STATE: ISlackState = {};

export const slackReducer = (state = INITIAL_STATE, action): ISlackState => {
  switch (action.type) {
    default:
      return state;
  }
};
