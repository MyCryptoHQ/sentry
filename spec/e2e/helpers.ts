export const resolveOnMockCall = (mockFn: any, expectedNumCalls: number) =>
  new Promise(resolve => {
    const numCalls = mockFn.mock.calls.length + expectedNumCalls;
    const checkCalls = setInterval(() => {
      if (mockFn.mock.calls.length === numCalls) {
        clearInterval(checkCalls);
        resolve(mockFn.mock.calls);
      }
    }, 100);
  });

export const sleep = (interval: number) =>
  new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
