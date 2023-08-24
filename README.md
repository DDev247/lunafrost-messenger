# lunafrost-messenger
General purpose bot for Messenger

# What is this
This is a custom bot for Meta Messenger, made using Puppeteer with Typescript and Node.js. It uses Puppeteer to send messages and receive them.

# How to use
## This is a experimental bot. Your account may or may not be suspended because of this. Use with caution
<br>
With that out of the way, here's how to get it running:

### Clone the git repo
```sh
git clone https://github.com/DDev247/lunafrost-messenger.git
```
or
```sh
git clone git@github.com:DDev247/lunafrost-messenger.git
```

### Install `npm` packages
```sh
npm install
```
or `pnpm` or whatever you use (I only tested with `npm`) <br>
**Don't run it yet though! We have to set up the login JSON**

### Set up `login.json`
Create a file called `login.json` in the `assets` folder <br>
Enter this:
```json
{
    "email": "",
    "pass": "",
    "group": ""
}
```
and change the `email`, `pass` and `group` to match your needs: <br>
`email`: The email address for your Facebook/Messenger account (ex `example@example.org`) <br>
`pass`: The password for your account <br>
`group`: The URL for your group/chat (ex `https://www.messenger.com/t/1234567890123456`) <br>

### Run the bot
The bot *should* now work. Run it with this command in the root of the project
```sh
npm start
```
