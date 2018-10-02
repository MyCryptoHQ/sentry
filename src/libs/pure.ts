import { spawn } from 'child_process';

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
