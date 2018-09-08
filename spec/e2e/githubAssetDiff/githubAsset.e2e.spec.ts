import * as path from 'path';

import * as fse from 'fs-extra';

import { resolveOnMockCall, sleep } from '../helpers';
import { EXPECTED_REPO_FOLDER_NAME, TEMP_WORKING, CONFIG } from './pretest';
import { githubAssetStart } from '../../../src/actions';
import { FAKE_ASSET_A, FAKE_ASSET_B, FAKE_ASSET_C } from './fakeAssets';

const { REPO_URL } = CONFIG;

jest.setTimeout(15000);
jest.mock('node-fetch');

afterAll(() => {
  jest.unmock('node-fetch');
});

const fetchRespFactory = (jsonResp: Object) => ({ json: async () => jsonResp });

const fakeGithubApiRespFactory = (files: string[]) => ({
  assets: files.map(file => ({ browser_download_url: fakeUrlFactory(file) }))
});

const fakeUrlFactory = (file: string): string =>
  `https://github.com/someOrg/someRepo/releases/download/${file}`;

const channelsWhitelist = ['FAKECHANNELA', 'FAKECHANNELB'];

describe('githubAssetDiff', () => {
  const fetch = require('node-fetch');

  const expectedCacheName = `${EXPECTED_REPO_FOLDER_NAME}.cache`;
  const expectedCachePath = path.resolve(TEMP_WORKING, expectedCacheName);
  const expectedCloneName = `${EXPECTED_REPO_FOLDER_NAME}.cache`;
  const expectedClonePath = path.resolve(TEMP_WORKING, expectedCloneName);

  let store, _process, _runChildProcess;

  describe('module bootstrap', () => {
    beforeAll(async () => {
      store = require('../../../src/store').store;
      const { getProcess } = require('../../../src/libs/utils');
      const { slackChannelsWhitelistSet } = require('../../../src/actions');
      const { runChildProcess } = require('../../../src/libs/pure');

      _process = getProcess();
      _runChildProcess = runChildProcess;

      store.dispatch(slackChannelsWhitelistSet(channelsWhitelist));
      await sleep(3000);
    });

    it('should create a cache folder in the working dir', async () => {
      const files = await fse.readdir(TEMP_WORKING);
      expect(files).toContain(expectedCacheName);
    });

    it('should create a clone folder in the working dir', async () => {
      const files = await fse.readdir(TEMP_WORKING);
      expect(files).toContain(expectedCloneName);
    });

    it('should create a log file in the working dir', async () => {
      const files = await fse.readdir(TEMP_WORKING);
      const logRegex = /^.*\.log$/;
      const logFileFound = files.find(file => logRegex.test(file));
      expect(logFileFound).toBeTruthy();
    });
  });

  describe('on first sync', () => {
    const ghAssetInfo = [FAKE_ASSET_A, FAKE_ASSET_B];
    const ghAssetNames = ghAssetInfo.map(a => a.name);
    const ghApiResp = fakeGithubApiRespFactory(ghAssetNames);
    let slackMsg, processSendCalls;

    beforeAll(async () => {
      // set fetch response
      fetch.mockReturnValueOnce(fetchRespFactory(ghApiResp));
      // fire action to start the module
      store.dispatch(githubAssetStart());
      // wait a sec for the module to complete
      processSendCalls = await resolveOnMockCall(_process.send, channelsWhitelist.length);
    });

    it('should fetch from the REPO_URL', () => {
      expect(fetch).toBeCalledWith(REPO_URL);
    });

    it('should download files', () => {
      expect(_runChildProcess).toHaveBeenCalledTimes(2);

      _runChildProcess.mock.calls.forEach(([arg1]) => {
        expect(arg1).toMatch(/^wget.*/);
      });
    });

    it('should populate the cache directory', async () => {
      const cacheList = await fse.readdir(expectedCachePath);

      ghAssetNames.forEach(name => expect(cacheList).toContain(name));
      expect(cacheList).toHaveLength(2);
    });

    it('should populate the clone directory', async () => {
      const cacheList = await fse.readdir(expectedClonePath);

      ghAssetNames.forEach(name => expect(cacheList).toContain(name));
      expect(cacheList).toHaveLength(2);
    });

    it('should broadcast the same message to all whitelisted slack channels', () => {
      let broadcastedChannels = [];

      processSendCalls.forEach(([arg], index) => {
        const { type, msg, channel } = arg;

        if (index === 0) {
          slackMsg = msg;
        }

        broadcastedChannels.push(channel);
        expect(type).toEqual('SLACK_MESSAGE_OUTGOING');
        expect(msg).toEqual(slackMsg);
      });

      channelsWhitelist.forEach(channel => expect(broadcastedChannels).toContain(channel));
    });

    it('should contain the asset name and expected hash in the slack message', () => {
      ghAssetInfo.forEach(({ name, hash }) => {
        expect(slackMsg).toMatch(new RegExp(`.*${name}.*`));
        expect(slackMsg).toMatch(new RegExp(`.*${hash}.*`));
      });
    });
  });

  describe('on asset change', () => {
    const ghAssetInfo = [FAKE_ASSET_A, FAKE_ASSET_B, FAKE_ASSET_C];
    const ghAssetNames = ghAssetInfo.map(a => a.name);
    const ghApiResp = fakeGithubApiRespFactory(ghAssetNames);

    let slackMsg, processSendCalls;

    beforeAll(async () => {
      // remove call info
      jest.clearAllMocks();
      // mock fetch return val
      fetch.mockReturnValueOnce(fetchRespFactory(ghApiResp));
      // fire action to start the module
      store.dispatch(githubAssetStart());
      // wait a sec for the module to complete

      processSendCalls = await resolveOnMockCall(_process.send, channelsWhitelist.length);
      await sleep(1000);
    });

    it('should fetch from the REPO_URL', () => {
      expect(fetch).toBeCalledWith(REPO_URL);
    });

    it('should download files', () => {
      expect(_runChildProcess).toHaveBeenCalledTimes(3);

      _runChildProcess.mock.calls.forEach(([arg1]) => {
        expect(arg1).toMatch(/^wget.*/);
      });
    });

    it('should populate the cache dir', async () => {
      const cacheList = await fse.readdir(expectedCachePath);

      ghAssetNames.forEach(name => expect(cacheList).toContain(name));
      expect(cacheList).toHaveLength(3);
    });

    it('should broadcast the same message to all whitelisted slack channels', () => {
      let broadcastedChannels = [];

      processSendCalls.forEach(([arg], index) => {
        const { type, msg, channel } = arg;

        if (index === 0) {
          slackMsg = msg;
        }

        broadcastedChannels.push(channel);
        expect(type).toEqual('SLACK_MESSAGE_OUTGOING');
        expect(msg).toEqual(slackMsg);
      });

      channelsWhitelist.forEach(channel => expect(broadcastedChannels).toContain(channel));
    });

    it('should contain name and hash of new asset in the slack message', () => {
      const { name, hash } = FAKE_ASSET_C;
      expect(slackMsg).toMatch(new RegExp(`.*${name}.*`));
      expect(slackMsg).toMatch(new RegExp(`.*${hash}.*`));
    });
  });
});
