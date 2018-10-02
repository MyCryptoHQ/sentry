const path = require('path');
const configPath = path.resolve(process.env.SENTRY_CONFIG_PATH);

if (!configPath.length) {
  throw new Error('Invalid config path on env var "SENTRY_CONFIG_PATH".');
}

const BOT_TOKEN = require(configPath).SLACK_API_TOKEN;
const { RTMClient, WebClient } = require('@slack/client');
const rtm = new RTMClient(BOT_TOKEN);
const web = new WebClient(BOT_TOKEN);

rtm.on('authenticated', parseDataAndExit);
rtm.start();

async function parseDataAndExit(rtmStartData) {
  const availableChannels = [];
  const botName = rtmStartData.self.name;
  const botId = rtmStartData.self.id;
  const { channels } = await web.conversations.list();
  const { groups } = await web.groups.list();

  groups.forEach(function(group) {
    availableChannels.push({
      name: group.name,
      id: group.id
    });
  });

  channels.forEach(function(channel) {
    if (channel.is_member) {
      availableChannels.push({
        name: channel.name,
        id: channel.id
      });
    }
  });

  console.log('Bot name: ', botName);
  console.log('Bot Id  : ', botId);
  console.log('\n\nPossible channels: \n');

  availableChannels.forEach(function(info) {
    console.log('Name: ', info.name);
    console.log('Id:   ', info.id, '\n');
  });

  setTimeout(function() {
    process.exit(0);
  }, 50);
}
