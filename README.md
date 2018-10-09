# sentry

A bot that watches a website or GitHub assets for changes and communicates them to Slack.

## Prerequisites

This program has only been tested in a Linux environment. The following is required for normal operation:

* [node](https://nodejs.org/)
* [yarn](https://yarnpkg.com/)
* [Pygments](http://pygments.org/)
* `wget`
* `diff`

Both `wget` and `diff` are commonly found command line utilities in Linux environments.

## Installation and Running

To install, clone and build the project:

```
git clone git@github.com:MyCryptoHQ/sentry.git
cd sentry
yarn run build
```

Set the environment variable `SENTRY_CONFIG_PATH` to point to your `parent.json` config (more details on this in the next section):

```
SENTRY_CONFIG_PATH="/path/to/parent.json"
```

Start the app with `yarn`:

```
yarn start
```

## Configuration

Sentry runs on JSON configuration files -- one file called `parent.json` for the parent process that describes the connection info for Slack, and an additional file for each desired worker task (named however).

These config files all need to be located in the same folder and should be the **only** files in that directory. The location for `parent.json` is set through the environment variable `SENTRY_CONFIG_PATH`. When Sentry is started, it will load in `parent.json` and read in the other files in the containing folder as worker config.

### Parent

Here's the minimum required config for `parent.json`:

```
{
  "MODE": "parent",
  "SLACK_API_TOKEN": "xoxb-000000000000-000000000000-xxxxxxxFAKESLACKAPITOKEN",
  "SLACK_BOT_NAME": "sentry",
  "SLACK_BOT_ID": "FAKEBOTID",
  "SLACK_CHANNELS_WHITELIST": [
    "FAKECHANL"
  ]
}
```

Breaking down this config:

* `SLACK_API_TOKEN` - The API token for the bot.
* `SLACK_BOT_NAME` - The plain English name for the bot.
* `SLACK_BOT_ID` - The ID assigned to the bot by Slack.
* `SLACK_CHANNELS_WHITELIST` - A list of Slack channel IDs that the bot is allowed to communicate with.

The values for `SLACK_BOT_ID` and `SLACK_CHANNELS_WHITLIST` can be obtained by running the project's `showSlackInfo` script. Make sure `SLACK_API_TOKEN` is populated in `parent.json`, set the `SENTRY_CONFIG_PATH` environment variable, and run the script:

```
yarn run showSlackInfo
```

If no possible channels are displayed, make sure you've invited the bot to a channel. **It's recommended the bot stays limited to private channels only.**

Consult the typing `IParentConfigurable` for a full list of the configurable options for `parent.json`.

### Site Diff

The `siteDiff` module syncs all files at a given URL and continuously polls for changes. To start a worker in this mode, supply a JSON file in the same directory as `parent.json` with the following properties:

```
{
  "MODE": "siteDiff",
  "WORKER_NAME": "a-name-without-spaces",
  "SITE_URL": "https://some-url-to-watch.com",
  "SITE_POLL_INTERVAL": 60000,
  "AWS_ENABLED": true,
  "AWS_BUCKET": "some-bucket-name"
}
```

Breaking down this config:

* `WORKER_NAME` - A plain English name to call the worker process. Must not have spaces. Do not configure more than one worker with the same name.
* `SITE_URL` - The site the worker will poll for changes. Do not configure more than one worker with the same URL.
* `SITE_POLL_INTERVAL` - The time, in milliseconds, for how often the worker should check for changes.

Consult the typing `ISiteDiffConfigurable` for a full list of configurable `siteDiff` options.

### GitHub Asset Diff

The `githubAssetDiff` module syncs the latest released assets of a GitHub repository and watches them for changes. To start a worker in this mode, supply a JSON file in the same directoy as `parent.json` with the following properties:

```
{
  "MODE": "githubAssetDiff",
  "WORKER_NAME": "nameWithoutSpaces",
  "REPO_URL": "https://api.github.com/repos/MyCryptoHQ/MyCrypto/releases/latest",
  "POLL_INTERVAL": 600000
}
```

Breaking down this config:

* `WORKER_NAME` - A plain English name to call the worker process. Must not have spaces. Do not configure more than one worker with the same name.
* `REPO_URL` - The URL for the GitHub assets to watch. **Please note this needs to point to the GitHub API, not the actual repository.** Do no configure than one worker with the same URL.
* `POLL_INTERVAL` - The time, in milliseconds, for how often the worker should check for changes.

Consult the typing `IGithubAssetConfigurable` for a full list of configurable `githubAssetDiff` options.

## Interacting with Sentry in Slack

It's possible to interact with Sentry by using direct mentions and passing in arguments (similar to a CLI). Communicating with the parent process takes the following form:

```
@[bot_name] [command] [args]
```

To communicate with a worker process, include the worker's name as configured in its JSON file:

```
@[bot_name] [worker_name] [command] [args]
```

Worker commands are passed down directly from the parent process.

### Parent Commands

The parent process responds only to two commands:

* `--ping` - Replies with `pong`. Used to test liveliness.
* `--summary` - Prints a summary of all the running worker processes.

### Site Diff Commands

* `--ping` - Replies with `pong`. Used to test liveliness.
* `--summary` - Prints a summary of the current state of the worker.
* `--history` - Prints the history of recorded changes through the lifetime of the worker.
* `--report [index]` - Prints the report that was communicated to Slack when a change was detected.

### GitHub Asset Diff Commands

* `--ping` - Replies with `pong`. Used to test liveliness.
* `--summary` - Prints a summary of the current state of the worker.
* `--history` - Prints the history of recorded changes through the lifetime of the worker.
* `--report [index]` - Prints the report that was communicated to Slack when a change was detected.

### Examples

Let's run through some example commands so solidify the above. Assume `sentry` is the bot's Slack name and `workerName` corresponds to the name of a worker.

To print a summary of the workers:

```
@sentry --summary
```

To print a summary of a particular worker:

```
@sentry workerName --summary
```

To print the history of a particular worker:

```
@sentry workerName --history
```

To access a report from a worker at index three:

```
@sentry workerName --report 3
```

## Data Directory

By default, Sentry stores all of its data in the `.sentry` folder in the home directory. This can be a useful place to poke around when troubleshooting. The folder is organized as such (names are approximate):

```
.sentry
└─── workerDir
    └─── urlDir
        └─── cache
        └─── clone
        └─── snapshots
```

Inside the `.sentry` folder, there's folder for each worker module, then a folder named after the configured worker URL. On the final level, a cache folder stores the current synced state, a clone directory acts as a temp directory when syncing, and a snapshots folder stores snapshots of both the clone and cache dirs (taken when a change is detected).
