import { call, put, select } from 'redux-saga/effects';
import { ISlackWorkerCommandAction, slackMessageOutgoing, ISlackMessage } from '../../actions';
import { parseWorkerCmdAndArgs, replyDirect, ICmdAndArgs } from '../../libs';
import { handleNotFound, handlePing } from '../shared';
import {
  IGithubAssetSummaryInfo,
  getAssetSummaryInfo,
  getAssetReports
} from '../../selectors/githubAsset';
import { IAssetChangeInfo } from '../../reducers/githubAsset';
const columnify: any = require('columnify');

export function* handleGitHubAssetCommand({ msg }: ISlackWorkerCommandAction) {
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
  const info: IGithubAssetSummaryInfo = yield select(getAssetSummaryInfo);
  const summary = yield call(genSummaryMsg, info);

  return replyDirect(msg, summary);
}

const genSummaryMsg = ({ rootHash, lastChange, lastPolled }: IGithubAssetSummaryInfo) =>
  `
\`\`\`
Current root hash:    ${rootHash}
Last change detected: ${lastChange.getUTCDate()}
Last checked:         ${lastPolled.getUTCDate()}
\`\`\``;

function* handleHistory(msg: ISlackMessage) {
  const reports: IAssetChangeInfo[] = yield select(getAssetReports);
  const history = genAssetHistoryMsg(reports);

  return replyDirect(msg, history);
}

const genAssetHistoryMsg = (reports: IAssetChangeInfo[]): string => {
  const cells = reports.map(({ newRootHash, timeOfChange }: IAssetChangeInfo, index) => ({
    report_index: index,
    time_of_change: timeOfChange,
    root_hash: newRootHash
  }));

  return `\n\`\`\`${columnify(cells)}\`\`\``;
};

function* handleReport(msg: ISlackMessage, parsed: ICmdAndArgs) {
  const reports: IAssetChangeInfo[] = yield select(getAssetReports);
  const report = genAssetReportMsg(parsed, reports);

  return replyDirect(msg, report);
}

const genAssetReportMsg = ({ args }: ICmdAndArgs, reports: IAssetChangeInfo[]): string => {
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
