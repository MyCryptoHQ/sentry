import { IAppState } from '../reducers';
import { IChangeInfo } from '../reducers/siteDiff';

export const getWorking = (state: IAppState) => state.siteDiff.working;

export interface ISummaryInfo {
  cacheRootHash: string;
  lastPolled: Date;
  lastChange: Date;
}
export const getSummaryInfo = (state: IAppState): ISummaryInfo => {
  const { cacheRootHash, reports, lastPolled } = state.siteDiff;
  const lastChange = reports[reports.length - 1].timeOfChange;

  return {
    cacheRootHash,
    lastChange,
    lastPolled
  };
};

export const getReports = (state: IAppState): IChangeInfo[] => state.siteDiff.reports;
