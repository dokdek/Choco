# Choco
A Discord bot made for learning Japanese kanji/vocabulary via SRS.

Implements a spaced repetition system of studying to assist users in learning over 6000 vocabularly and kanji. Implements Wanikani levels and algorithm.

# Usage
Invite Choco to a server [here](https://discord.com/api/oauth2/authorize?client_id=803097728917700630&permissions=0&scope=bot).

DM the bot a command to get started, Choco will only work in DMs, but you must have a shared server for bots to be able to DM you.

## Commands
```
~help
- List of commands and what they do.

~new
- Creates a new user profile if one does not exist.

~review 
- Starts any reviews that are due.

~learn
- Start a learning session. Will give you all the kanji/vocab for your level.
```

## Installation

- Clone project into desired repo
- Install dependencies and run index.js to start the bot.

```bash
npm install
node index.js
```

- Bot uses a .env file for sensitive information like Discord token and MongoDB Atlas key with the following format. You will need your own tokens.
```
TOKEN=DISCORD_TOKEN_HERE
ATLAS_URI=MONGODB_TOKEN_HERE
```
## Known Issues
- DMing a bot a command when you are currently using another command will cause both to run at the same time.
- Not replying to the bot for a long time when it is expecting a response can sometimes lead to odd behaviour.

Bot is currently under development, not all features are fully implemented and Choco may go down/be buggy. Please contact me at dokdek#8413 on Discord or open an issue here with any suggestions or comments!

## Roadmap
[Trello](https://trello.com/b/AkzrJsm1/choco)

## Acknowledgements

[kanji-data](https://github.com/davidluzgouveia/kanji-data/) for a list of WaniKani kanji.

[jisho](https://jisho.org/) for their API.

[WaniKani](https://docs.api.wanikani.com/20170710/) for their API.

