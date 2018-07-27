import { IAppState } from '../reducers';

export const getWorking = (state: IAppState) => state.siteDiff.working;
