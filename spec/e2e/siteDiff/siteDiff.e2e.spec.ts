import * as path from 'path';

import * as fse from 'fs-extra';

import './pretest';
import { EXPECTED_SITE_FOLDER_NAME, TEMP_WORKING, CONFIG } from './pretest';
import { stopServer, getSentResponses } from './testServer';
import { resolveOnMockCall, sleep } from '../helpers';

jest.setTimeout(15000);

describe('siteDiff', () => {
  const channelsWhitelist = ['FAKECHANNELA', 'FAKECHANNELB'];
  const expectedCacheName = `${EXPECTED_SITE_FOLDER_NAME}.cache`;
  const expectedCachePath = path.resolve(TEMP_WORKING, expectedCacheName);
  const cachedIndexPath = path.resolve(expectedCachePath, 'index.html');
  let store, _process, _uploadToS3;

  afterAll(() => stopServer());

  describe('module bootstrap', () => {
    beforeAll(async () => {
      store = require('../../../src/store').store;
      const { getProcess, uploadToS3 } = require('../../../src/libs/utils');
      const { slackChannelsWhitelistSet } = require('../../../src/actions');

      _process = getProcess();
      _uploadToS3 = uploadToS3;

      store.dispatch(slackChannelsWhitelistSet(channelsWhitelist));
      await sleep(3000);
    });

    it('should create a cache folder in the working dir', async () => {
      const files = await fse.readdir(TEMP_WORKING);

      expect(files).toContain(expectedCacheName);
    });

    it('should create a log file in the working dir', async () => {
      const files = await fse.readdir(TEMP_WORKING);
      const logRegex = /^.*\.log$/;
      const logFileFound = files.find(file => logRegex.test(file));

      expect(logFileFound).toBeTruthy();
    });

    it('should clone the original site exactly and set as cache', async () => {
      const cachedFile = await fse.readFile(cachedIndexPath, 'utf8');
      const sentIndex = getSentResponses()[0];

      expect(cachedFile).toEqual(sentIndex);
    });
  });

  describe('on site change', () => {
    let calls;

    beforeAll(async () => {
      const { siteDiffStart } = require('../../../src/actions');
      store.dispatch(siteDiffStart());
      calls = await resolveOnMockCall(_process.send, 2);
    });

    it('should clone the new site exactly and set as cache', async () => {
      const cachedFile = await fse.readFile(cachedIndexPath, 'utf8');
      const sentIndex = getSentResponses()[1];

      expect(cachedFile).toEqual(sentIndex);
    });

    it('should broadcast a message to all whitelisted slack channels', () => {
      let broadcastedChannels = [];

      calls.forEach(([arg]) => {
        const { type, msg, channel } = arg;
        broadcastedChannels.push(channel);
        expect(type).toEqual('SLACK_MESSAGE_OUTGOING');
      });

      channelsWhitelist.forEach(channel => expect(broadcastedChannels).toContain(channel));
    });

    it('should attempt to upload a site diff to S3', () => {
      const { ACL, Bucket, Body, Key } = _uploadToS3.mock.calls[0][0];
      const { AWS_BUCKET } = CONFIG;
      expect(Bucket).toEqual(AWS_BUCKET);
      expect(Body).toBeTruthy();
    });
  });
});
