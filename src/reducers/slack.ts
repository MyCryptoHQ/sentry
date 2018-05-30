

interface IConfigState {}

const INITIAL_STATE: IConfigState = {}

export const slackReducer = (state = INITIAL_STATE, action): IConfigState => {
  switch (action.type) {
    default:
      return state
  }
}