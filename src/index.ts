require('source-map-support').install();

import { store } from './store';
import { getConfig } from './configs';

const { MODE } = getConfig();

if (MODE !== 'parent') {
  process.on('message', action => {
    //all messages from parent process are formatted as actions
    store.dispatch(action);
  });
}
