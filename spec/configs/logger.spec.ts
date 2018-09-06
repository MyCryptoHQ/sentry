import { makeLocalLogger, logLevels } from '../../src/configs';

describe('makeLocalLogger', () => {
  it('should make a logger with all the log levels', () => {
    logLevels.forEach(level => expect(Object.keys(makeLocalLogger('test'))).toContain(level));
  });
});
