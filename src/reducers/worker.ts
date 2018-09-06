import { WorkerTypeKeys, TWorkerActions, IWorkerStartAction, IWorkerCloseAction } from '../actions';
import { TAppConfig } from '../configs';

export interface IWorkerState {
  workers: {
    [workerName: string]: {
      clusterId: number;
      workerName: string;
      config: TAppConfig;
    };
  };
}

export const INITIAL_STATE: IWorkerState = {
  workers: {}
};

export const workerReducer = (state = INITIAL_STATE, action: TWorkerActions): IWorkerState => {
  switch (action.type) {
    case WorkerTypeKeys.WORKER_START:
      return reduceWorkerStart(state, action);
    case WorkerTypeKeys.WORKER_CLOSE:
      return reduceWorkerClose(state, action);
    default:
      return state;
  }
};

const reduceWorkerStart = (
  state: IWorkerState,
  { workerName, clusterId, config }: IWorkerStartAction
): IWorkerState => {
  return {
    ...state,
    workers: {
      ...state.workers,
      [workerName]: {
        workerName,
        clusterId,
        config
      }
    }
  };
};

const reduceWorkerClose = (state: IWorkerState, { workerName }: IWorkerCloseAction) => {
  const newState = {
    ...state,
    workers: {
      ...state.workers
    }
  };
  delete newState.workers[workerName];
  return newState;
};
