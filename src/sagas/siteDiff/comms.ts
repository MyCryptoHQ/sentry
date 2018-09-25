import { call, put, select } from 'redux-saga/effects';
import { ISlackWorkerCommandAction, slackMessageOutgoing, ISlackMessage } from '../../actions';
import { parseWorkerCmdAndArgs, replyDirect, ICmdAndArgs } from '../../libs';
import { handleNotFound, handlePing } from '../shared';
import { getSummaryInfo, ISummaryInfo, getReports } from '../../selectors';
import { IChangeInfo } from '../../reducers/siteDiff';
const columnify: any = require('columnify');

export function* handleSiteDiffCommand({ msg }: ISlackWorkerCommandAction) {
  const parsed: ICmdAndArgs = parseWorkerCmdAndArgs(msg);
  const { channel } = msg;
  let resp;

  switch (parsed.cmd) {
    case '--ping':
      resp = handlePing(msg);
      break;
    case '--summary':
      resp = yield call(handleSummary, msg);
    case '--history':
      resp = yield call(handleHistory, msg);
    case '--report':
      resp = yield call(handleReport, msg, parsed);
    default:
      resp = handleNotFound(msg);
      break;
  }

  yield put(slackMessageOutgoing(resp, channel));
}

function* handleSummary(msg: ISlackMessage) {
  const info: ISummaryInfo = yield select(getSummaryInfo);
  const summary = yield call(genSummaryMsg, info);

  return replyDirect(msg, summary);
}

const genSummaryMsg = ({ cacheRootHash, lastChange, lastPolled }: ISummaryInfo) =>
  `
\`\`\`
Current root hash:    ${cacheRootHash}
Last change detected: ${lastChange.getUTCDate()}
Last checked:         ${lastPolled.getUTCDate()}
\`\`\``;

function* handleHistory(msg: ISlackMessage) {
  const reports: IChangeInfo[] = yield select(getReports);
  const history = genHistoryMsg(reports);

  return replyDirect(msg, history);
}

const genHistoryMsg = (reports: IChangeInfo[]): string => {
  const cells = reports.map(({ newRootHash, timeOfChange }: IChangeInfo, index) => ({
    report_index: index,
    time_of_change: timeOfChange,
    root_hash: newRootHash
  }));

  return `\n\`\`\`${columnify(cells)}\`\`\``;
};

function* handleReport(msg: ISlackMessage, parsed: ICmdAndArgs) {
  const reports: IChangeInfo[] = yield select(getReports);
  const report = genReportMsg(parsed, reports);

  return replyDirect(msg, report);
}

const genReportMsg = ({ args }: ICmdAndArgs, reports: IChangeInfo[]): string => {
  const failMsg = 'that is not a valid report index.';

  try {
    const index = parseInt(args[0]);
    const slackReport = reports[index].slackMessage;

    if (!slackReport) {
      return failMsg;
    }

    return `\n\`\`\`${slackReport}\`\`\``;
  } catch {
    return failMsg;
  }
};
