import { createHash } from 'crypto';
import { spawn } from 'child_process';
import * as path from 'path';

import * as klaw from 'klaw';
import * as jsBeautify from 'js-beautify';
import * as fse from 'fs-extra';

import { enumerateFilesInDir, hashFileSha256, KlawFileInfo } from './utils';

export const getSiteBaseName = (url: string): string =>
  url
    .replace('http://', '')
    .replace('https://', '')
    .replace('/', '');

export const runChildProcess = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', cmd]);
    const output: string[] = [];

    child.stdout.on('data', (data: Buffer) => {
      output.push(data.toString());
    });

    child.stderr.on('data', (data: string) => {
      output.push(data);
    });

    child.on('close', (code: any) => {
      if (code !== 0) {
        return reject(`Child process exited with code: ${code}, ${output}`);
      }
      resolve(output.join(''));
    });
  });

export const cloneWebsite = (url: string, targetDir: string): Promise<string> =>
  runChildProcess(
    `wget \\
  --mirror \\
  --page-requisites \\
  --no-parent \\
  --reject-regex ".*b[TXT|CSV|JSON|lobEnc].*" \\
  --random-wait \\
  -e robots=off \\
  -P "${targetDir}" \\
  --no-host-directories \\
  ${url}`
  );

export const unminifyJSinDir = (directory: string): Promise<any> =>
  new Promise(async (resolve, reject) => {
    try {
      const files = await enumerateFilesInDir(directory);
      const minified = files
        .map((fileInfo: any) => fileInfo.path)
        .filter(filePath =>
          // /\.min\.js$/.test(path.basename(filePath))
          /\.js$/.test(path.basename(filePath))
        )
        .map(unminifyJS);

      await Promise.all(minified);
      resolve();
    } catch (err) {
      reject(err);
    }
  });

export const identifyJsFiles = (files: KlawFileInfo[]) =>
  files.map(info => info.path).filter(filePath => /\.js$/.test(path.basename(filePath)));

export const processFileList = (fileList: object[], siteUrl: string): Promise<object[]> =>
  new Promise(async (resolve, reject) => {
    const hashedList: any = [];

    try {
      await Promise.all(
        fileList.map(async (item: any) => {
          hashedList.push({
            fullPath: item.path,
            comparePath: getComparePath(item.path, siteUrl),
            hash: await hashFileSha256(item.path),
            type: item.stats.isDirectory() ? 'folder' : 'file'
          });
        })
      );
      resolve(hashedList);
    } catch (err) {
      reject(err);
    }
  });

export const generateReport = async (
  oldFileList: object[],
  newFileList: object[],
  ignoredFilesConfig: string[]
): Promise<any> => {
  const newFiles = detectNewFiles(oldFileList, newFileList);
  const deletedFiles = detectDeletedFiles(oldFileList, newFileList);
  let changedFiles = detectChangedFiles(oldFileList, newFileList);

  const ignoredFiles = changedFiles.filter(
    file => ignoredFilesConfig.indexOf(file.comparePath) !== -1
  );

  changedFiles = changedFiles.filter(file => ignoredFilesConfig.indexOf(file.comparePath) === -1);

  const htmlDiffPromises = changedFiles
    .map(newFile => ({
      newFilePath: newFile.fullPath,
      oldFilePath: oldFileList.reduce((filepath, oldFile: any) => {
        if (filepath) {
          return filepath;
        }
        if (newFile.comparePath === oldFile.comparePath) {
          return oldFile.fullPath;
        }
      }, '')
    }))
    .map((files: any) => getHTMLDiffFromTwoFiles(files.oldFilePath, files.newFilePath));

  const htmlDiffs = await Promise.all(htmlDiffPromises);

  return {
    cachedManifest: oldFileList,
    clonedManifest: newFileList,
    newFiles,
    deletedFiles,
    changedFiles,
    ignoredFiles,
    htmlDiffs
  };
};

export const getHTMLDiffFromTwoFiles = (file1Path: string, file2Path: string): Promise<string> =>
  runChildProcess(
    `diff \\
  -u "${file1Path}" \\
  "${file2Path}" \\
  | pygmentize \\
  -l diff -f html -O full`
  );

export const unminifyJS = (file: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fse.readFile(file, 'utf8', (err, data) => {
      if (err) return reject(err);
      const unmin = jsBeautify(data, { indent_size: 2 });

      fse.writeFile(file, unmin, 'utf8', err1 => {
        if (err1) return reject(err1);

        console.log('UNMINIFIED file');
        resolve();
      });
    });
  });

export const detectNewFiles = (oldFileList: object[], newFileList: object[]): any =>
  newFileList.filter(
    (newItem: any) =>
      !oldFileList.reduce((found, oldItem: any) => {
        if (found) {
          return found;
        }
        return newItem.comparePath === oldItem.comparePath;
      }, false)
  );

export const detectDeletedFiles = (oldFileList: object[], newFileList: object[]): any =>
  oldFileList.filter(
    (oldItem: any) =>
      !newFileList.reduce((found, newItem: any) => {
        if (found) {
          return found;
        }
        return oldItem.comparePath === newItem.comparePath;
      }, false)
  );

export const detectChangedFiles = (oldFileList: object[], newFileList: object[]): any =>
  newFileList.filter((newItem: any) =>
    oldFileList.reduce((found, oldItem: any) => {
      if (found) {
        return found;
      }
      if (newItem.comparePath === oldItem.comparePath) {
        return newItem.hash !== oldItem.hash;
      }
    }, false)
  );

export const getComparePath = (filePath: string, siteUrl: string): string =>
  filePath
    .split('/')
    .reduce((sum, val) => {
      const siteBase = siteUrl
        .replace('http://', '')
        .replace('https://', '')
        .replace('.', '\.');

      const regex = new RegExp(`^${siteBase}\.(clone|cache)`);

      if (sum.length) {
        return [...sum, val];
      } else if (regex.test(val)) {
        return [''];
      } else {
        return [];
      }
    }, [])
    .filter(x => x.length)
    .join('/');

export const hasReportChanged = (report): boolean =>
  report.newFiles.length || report.changedFiles.length || report.deletedFiles.length;

export const createSnapshot = (
  cacheDir: string,
  cloneDir: string,
  snapshotDir: string,
  report: any
): Promise<any> =>
  new Promise(async (resolve, reject) => {
    const newSnapDirFull = `${snapshotDir}/${buildSnapshotDirName()}`;
    const newCacheDirFull = `${newSnapDirFull}/${path.basename(cacheDir)}`;
    const newCloneDirFull = `${newSnapDirFull}/${path.basename(cloneDir)}`;
    const newReportPathFull = `${newSnapDirFull}/report.json`;
    const newDiffPathFull = `${newSnapDirFull}/diff.html`;

    try {
      await fse.ensureDir(newSnapDirFull);
    } catch (err) {
      return reject(err);
    }

    try {
      await fse.copy(cacheDir, newCacheDirFull);
      await fse.copy(cloneDir, newCloneDirFull);
      await fse.writeFile(newReportPathFull, JSON.stringify(report, null, 2), 'utf8');
      await fse.writeFile(newDiffPathFull, report.htmlDiffs.join(''), 'utf8');
    } catch (err) {
      return reject(err);
    }

    resolve(report);
  });

export const buildTimestampName = (): string => {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const year = now.getUTCFullYear();
  const rand = Math.random()
    .toString()
    .slice(-6, -1);

  return `${month}_${day}_${year}__${rand}`;
};

export const buildSnapshotDirName = (): string => `snapshot_${buildTimestampName()}`;

export const buildS3FileName = (): string => `diff_${buildTimestampName()}.html`;

export const buildMsgFileList = (files: any[]): string =>
  files.length ? files.map(file => ` - \`${file.comparePath}\`\n`).join('') : '';

export const genDiffMsg = (report: any): string =>
  report.location ? `\nA HTML diff can be viewed here: ${report.location}` : '';

export const genSlackReportMsg = (report: any, website: string): string =>
  `<!channel>, changes to ${website} have been detected:` +
  `\n\n` +
  `*${report.newFiles.length} new files*\n` +
  `${buildMsgFileList(report.newFiles)}` +
  `*${report.deletedFiles.length} deleted files*\n` +
  `${buildMsgFileList(report.deletedFiles)}` +
  `*${report.changedFiles.length} changed files*\n` +
  `${buildMsgFileList(report.changedFiles)}` +
  `*${report.ignoredFiles.length} ignored files*\n` +
  `${buildMsgFileList(report.ignoredFiles)}` +
  `${genDiffMsg(report)}`;


