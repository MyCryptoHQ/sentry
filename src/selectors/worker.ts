import { IAppState } from '../reducers';

export type TWorkerNames = keyof IAppState['worker']['workers'];

export const getWorkerNames = (state: IAppState): TWorkerNames[] =>
  Object.keys(state.worker.workers);

export type TWorkerConfigs = IAppState['worker']['workers'];

export const getWorkerConfigs = (state: IAppState): TWorkerConfigs => state.worker.workers;

export const getWorkerNamesAndClusterIds = (state: IAppState) =>
  getWorkerNames(state).map(name => ({
    name,
    clusterId: state.worker.workers[name].clusterId
  }));
