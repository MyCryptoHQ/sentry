# sentry

A bot that polls a website for changes, uploads HTML diffs to AWS S3, and communicates the changes to Slack.

This project is under development, please use at your own risk. 

## Prerequisites

This program has only been tested in a Linux environment. The following is required for normal operation:

 - [node](https://nodejs.org/)
 - [yarn](https://yarnpkg.com/)
 - [Pygments](http://pygments.org/)
 - `wget`
 - `diff`
 
Both `wget` and `diff` are commonly found command line utilities in Linux environments.

## Installation and Running

To install, clone and build the project:

```
git clone git@github.com:MyCryptoHQ/sentry.git
cd sentry
yarn run build
```

Sentry requires a config file path to be passed in as an argument. Use `yarn` to start the app:

```
yarn start pathToYourConfig.json
```

## Config

Config files must be in JSON format. Here's an example:

```
{
    "siteDiff": {
        "url": "http://localhost:3000", 
        "pollInterval": 5000, 
        "ignoredFiles": [ 
          "robots.txt.html"
        ]
      },
      "slack": {
        "apiToken": "xoxb-000000000000-000000000000-xxxxxxxFAKESLACKAPITOKEN",
        "botName": "sentry", 
        "botId": "FAKEBOTID", 
        "channelsWhitelist": [ 
          "FAKECHANL"
        ]
      },
      "aws": {
        "enabled": true, 
        "bucket": "your-bucket" 
      }
}
```

Here's an explanation of the above properties:

 - `siteDiff`
   - `url` - the website to watch
   - `pollInterval` - interval in milliseconds to watch for changes
   - `ignoredFiles` - files that will be ignored when checking for changes
 - `slack`
   - `apiToken` - API token for Slack
   - `botName` - name of the bot as configured in Slack
   - `botId` - the ID of the bot as provided by Slack
   - `channelsWhitelist` - array of Slack channel IDs that the bot is allowed to communicate on
 - `aws`
   - `enabled` - will skip upload to AWS if set to false
   - `bucket` - the AWS S3 bucket to upload the HTML diffs to

The values for `botId` and `channelsWhitelist` can be obtained by this command:

```
yarn run showSlackInfo pathToYourConfig.json
```

Make sure your Slack `apiToken` is set in the config. If nothing is listed as a possible channel, make sure the bot is invited to a channel.

## AWS S3

If configured, generated HTML diffs will be uploaded to an S3 bucket. **These diffs will be made publicly available. Make sure this is acceptable before enabling.**

Sentry makes no attempt to manage AWS credentials. You can follow [this guide by Amazon](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) to understand how to configure access. 