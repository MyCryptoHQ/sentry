import { spawn } from 'child_process';
import { TWorkerConfig, IGithubAssetConfig, ISiteDiffConfig } from '../configs';

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
        return reject(
          new Error(`Child process command '${cmd}' exited with code ${code}:\n\n${output}`)
        );
      }
      resolve(output.join(''));
    });
  });

export const getDaysAndHoursBetweenDates = (oldDate: Date, newDate: Date) => {
  const diffMs: number = newDate.getTime() - oldDate.getTime();
  const diffDays = Math.floor(diffMs / 86400000); // days
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

  return `${diffDays} days, ${diffHrs} hours, ${diffMins} mins`;
};

export const isSiteDiffConfig = (value: TWorkerConfig): value is ISiteDiffConfig =>
  value.hasOwnProperty('SITE_URL');

export const isGithubAssetConfig = (value: TWorkerConfig): value is IGithubAssetConfig =>
  value.hasOwnProperty('REPO_URL');
