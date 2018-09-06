import { createHash } from 'crypto';

import * as klaw from 'klaw';
import * as jsBeautify from 'js-beautify';
import * as fse from 'fs-extra';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

export interface IKlawFileInfo {
  path: string;
  stats: any;
}

export const enumerateFilesInDir = (dirPath: string): Promise<IKlawFileInfo[]> =>
  new Promise((resolve, reject) => {
    const contents: IKlawFileInfo[] = [];

    klaw(dirPath)
      .on('data', (item: IKlawFileInfo) => contents.push(item))
      .on('end', () => resolve(contents))
      .on('error', err => reject(err));
  });

export const hashFileSha256 = (filePath: string): Promise<string> =>
  new Promise(async (resolve, reject) => {
    const stats = await fse.lstat(filePath);

    if (stats.isDirectory()) {
      return resolve('');
    }

    const hash = createHash('sha256');
    const input = fse.createReadStream(filePath);

    input.on('readable', () => {
      const data = input.read();
      if (data) {
        hash.update(data);
      } else {
        resolve(hash.digest('hex'));
      }
    });

    input.on('error', err => {
      reject(err);
    });
  });

export const uploadToS3 = async (params: AWS.S3.Types.PutObjectRequest) =>
  s3.upload(params).promise();

export const getProcess = () => process;
