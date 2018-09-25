import { IAppState } from '../reducers';

export type TWorkerNames = keyof IAppState['worker']['workers'];

export const getWorkerNames = (state: IAppState): TWorkerNames[] =>
  Object.keys(state.worker.workers);

export type TWorkerConfigs = IAppState['worker']['workers'];

export const getWorkerConfigs = (state: IAppState): TWorkerConfigs => state.worker.workers;
