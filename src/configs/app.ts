import * as path from 'path';

import { IParentConfig, IParentConfigurable, makeParentConfig } from './parent';
import { ISiteDiffConfig, ISiteDiffConfigurable, makeSiteDiffConfig } from './siteDiff';
import {
  IGithubAssetConfig,
  IGithubAssetConfigurable,
  makeGithubAssetDiffConfig
} from './githubAssetDiff';

type TWorkerConfigurable = ISiteDiffConfigurable | IGithubAssetConfigurable;
type TAppConfigurable = IParentConfigurable | TWorkerConfigurable;

export type TWorkerConfig = ISiteDiffConfig | IGithubAssetConfig;
export type TAppConfig = IParentConfig | TWorkerConfig;

export const APP_NAME = 'sentry';
export const CONFIG_PATH: string = path.resolve(process.env.SENTRY_CONFIG_PATH);
const SUPPLIED_CONFIG: TAppConfigurable = require(CONFIG_PATH);

const CONFIG: TAppConfig = (() => {
  switch (SUPPLIED_CONFIG.MODE) {
    case 'parent':
      return makeParentConfig(SUPPLIED_CONFIG);
    case 'siteDiff':
      return makeSiteDiffConfig(SUPPLIED_CONFIG);
    case 'githubAssetDiff':
      return makeGithubAssetDiffConfig(SUPPLIED_CONFIG);
    default:
      throw new Error(`Unknown mode in config:\n\n${JSON.stringify(SUPPLIED_CONFIG, null, 2)}`);
  }
})();

export const getConfig = () => CONFIG;
