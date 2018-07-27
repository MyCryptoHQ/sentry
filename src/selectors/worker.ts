
import { IAppState } from '../reducers';

export type TWorkerNames = keyof IAppState['worker']['workers'];

export const getWorkerNames = (state: IAppState): TWorkerNames[] => 
  Object.keys(state.worker.workers);
