import { parseCmdAndArgs, parseParentCmdAndArgs, parseWorkerCmdAndArgs } from '../../src/libs';

describe('parseCmdAndArgs, parseParentCmdAndArgs, parseWorkerCmdAndArgs', () => {
  const workerMsg: any = { text: 'botId workerName command --andOneArg --andTwoArg' };
  const parentMsg: any = { text: 'botId command --andOneArg --andTwoArg' };
  const expectedCmd = 'command';
  const expectedArgs = ['--andOneArg', '--andTwoArg'];

  const worker1 = parseCmdAndArgs(true)(workerMsg);
  const worker2 = parseWorkerCmdAndArgs(workerMsg);
  const parent1 = parseCmdAndArgs(false)(parentMsg);
  const parent2 = parseParentCmdAndArgs(parentMsg);

  const actuals = [worker1, worker2, parent1, parent2];

  it('should parse as expected in all three versions', () => {
    actuals.forEach(({ cmd, args }) => {
      expect(cmd).toEqual(expectedCmd);
      expect(args).toEqual(expectedArgs);
    });
  });
});
