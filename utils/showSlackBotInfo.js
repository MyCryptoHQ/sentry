
const path = require('path');
const configPath = path.resolve(process.argv[2])

const BOT_TOKEN = require(configPath).slack.apiToken
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS
const RTM_EVENTS = require('@slack/client').RTM_EVENTS
const RtmClient = require('@slack/client').RtmClient
const rtm = new RtmClient(BOT_TOKEN)

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, parseDataAndExit)
rtm.start()

function parseDataAndExit(rtmStartData) {
  const availableChannels = []
  const botName = rtmStartData.self.name
  const botId = rtmStartData.self.id

  rtmStartData.groups.forEach(function(group) {
    availableChannels.push({
      name: group.name,
      id: group.id
    })
  })

  rtmStartData.channels.forEach(function(channel) {
    if (channel.is_member) {
      availableChannels.push({
        name: channel.name,
        id: channel.id
      })
    }
  })

  console.log('Bot name: ', botName)
  console.log('Bot Id  : ', botId)
  console.log('\n\nPossible channels: \n')

  availableChannels.forEach(function(info) {
    console.log('Name: ', info.name)
    console.log('Id:   ', info.id, '\n')
  })

  setTimeout(function() {
    process.exit(0)
  }, 50)
}





