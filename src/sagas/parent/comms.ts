import { call, put, select } from 'redux-saga/effects';
const columnify: any = require('columnify');

import {
  parseParentCmdAndArgs,
  replyDirect,
  ICmdAndArgs,
  getDaysAndHoursBetweenDates,
  isSiteDiffConfig,
  isGithubAssetConfig
} from '../../libs';
import { ISlackParentCommandAction, ISlackMessage, slackMessageOutgoing } from '../../actions';
import { getWorkerConfigs, TWorkerConfigs } from '../../selectors';
import { SagaIterator } from 'redux-saga';
import { TWorkerConfig } from '../../configs';
import { handlePing, handleNotFound } from '../shared';

export function* handleParentCommand({ msg }: ISlackParentCommandAction) {
  const parsed = parseParentCmdAndArgs(msg);
  const { channel } = msg;
  let resp;

  switch (parsed.cmd) {
    case '--ping':
      resp = handlePing(msg);
      break;
    case '--summary':
      resp = yield call(handleSummary, msg);
      break;
    default:
      resp = handleNotFound(msg);
      break;
  }

  yield put(slackMessageOutgoing(resp, channel));
}

function* handleSummary(msg: ISlackMessage): SagaIterator {
  const configs: TWorkerConfigs = yield select(getWorkerConfigs);
  try {
    const reply = constructSummaryMessage(configs);
    if (!reply) return;
    return replyDirect(msg, reply);
  } catch (err) {
    console.log(err);
  }
}

const constructSummaryMessage = (configs: TWorkerConfigs) => {
  const info = Object.entries(configs).map(([name, props]) => {
    const { workerName, startedAt } = props;
    const workerConfig: TWorkerConfig = props.config;
    const target = isSiteDiffConfig(workerConfig)
      ? workerConfig.SITE_URL
      : isGithubAssetConfig(workerConfig) ? workerConfig.REPO_URL : '';

    const ret = {
      name: workerName,
      mode: workerConfig.MODE,
      target,
      uptime: getDaysAndHoursBetweenDates(startedAt, new Date())
    };

    return ret;
  });
  const columns = columnify(info);

  return `\`\`\`\n${columns}\n\`\`\``;
};
