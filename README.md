[![botact](https://img.shields.io/npm/v/botact.svg?style=flat-square)](https://www.npmjs.com/package/botact/)
[![botact](https://img.shields.io/node/v/botact.svg?style=flat-square)](https://nodejs.org/en/)
[![botact](https://img.shields.io/npm/dm/botact.svg?style=flat-square)](https://www.npmjs.com/package/botact/)
[![botact](https://img.shields.io/travis/bifot/botact.svg?branch=master&style=flat-square)](https://travis-ci.org/bifot/botact/)
[![botact](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)


# botact.js

Botact enables developers to focus on writing reusable application logic instead of spending time building infrastructure.


## Table of content 
* [Install](#install)
* [Usage](#usage)
* [Botact API](#botact-api)
* [Botact Flow API](#botact-flow-api)
* [TypeScript](#typescript)
* [Tests](#tests)
* [Donate](#donate-)
* [License](#license)


## Install

```sh
$ npm i botact
```


## Usage

```javascript
const bodyParser = require('body-parser')
const express = require('express')
const { Botact } = require('botact')

const app = express()
const bot = new Botact({
  confirmation: process.env.CONFIRMATION,
  token: process.env.TOKEN
})

bot.command('start', ({ reply }) => reply('This is start!'))
bot.hears(/(car|tesla)/, ({ reply }) => reply('I love Tesla!'))
bot.event('group_join', ({ reply }) => reply('Thanks!'))
bot.on(({ reply }) => reply('What?'))

app.use(bodyParser.json())
app.post('/', bot.listen)
app.listen(process.env.PORT)
```


## Botact API
### Methods
**Core**
* [constructor(settings)](#constructorsettings)
* [.api(method, settings)](#apimethod-settings)
* [.execute(method, settings, callback)](#executemethod-settings-callback)
* [.reply(user_id, message, attachment)](#replyuser_id-message-attachment)
* [.listen(req, res)](#listenreq-res)

**Actions**
* [.before(callback)](#beforecallback)
* [.command(command, callback)](#commandcommand-callback)
* [.event(event, callback)](#eventevent-callback)
* [.hears(command, callback)](#hearscommand-callback)
* [.on(type, callback)](#ontype-callback)
* [.use(callback)](#usecallback)

**Options**
* [[getter] options](#getter-options)
* [[setter] options](#setter-options)
* [.deleteOptions(settings)](#deleteoptionssettings)

**Upload helpers**
* [.uploadCover(file, settings)](#uploadcoverfile-settings)
* [.uploadDocument(file, peer_id ,type)](#uploaddocumentfile-peer_id-type)
* [.uploadPhoto(file, peer_id)](#uploadphotofile-peer_id)
---

## Botact API: Core [↑](#botact-api)
### constructor(settings)
Create bot.  

Botact Flow:  
Turn `settings.redis` to true, if you will use [Botact Flow](#botact-flow-api).  
For detailed redis config see [this](https://github.com/NodeRedis/node_redis#options-object-properties)

Definition: 
```typescript
constructor (settings: {
  confirmation: string;   // required
  token: string;          // required
  group_id?: number;

  // Flow Settings
  flowTimeout?: number;   // Document expire time, in seconds
  redis?: boolean;        // false by default
  redisConfig?: object;   // {} by default
})
```
Usage:

```javascript
const { Botact } = require('botact')

const bot = new Botact({
  confirmation: process.env.CONFIRMATION,
  token: process.env.TOKEN
})
```

### .api(method, settings)
Call API method (https://vk.com/dev/methods).

Definition:
```typescript
async api (
  method: string,        // required 
  options?: object,      // api call parameters
): Promise<any>;         // Promise with response/error
```
Usage:
```js
const user_data = await bot.api('users.get', {
  user_ids: 1
})
```

### .execute(method, settings, callback)
Call API by [execute](https://vk.com/dev/execute).

Definition:
```typescript
async execute (
  method: string,        // required 
  options?: object,      // api call  parameters
  callback?: function    
): Promise<any>;         // Promise with response/error
 ```

Usage:
```js
bot.execute('users.get', {
  user_ids: 1
}, (body) => {
  // {
  //   response: [{
  //     id: 1,
  //     first_name: 'Павел',
  //     last_name: 'Дуров'
  //   }]
  // }
})
```

### .reply(user_id, message, attachment)
Sends message to user

Definition:
```typescript
async reply (
  user_id: number, 
  message: string,      // required, if attachment not setten 
  attachment: string    // required, if message not setten 
): Promise<any>         // Promise with response/error
```

Usage:
```javascript
bot.command('start', (ctx) => {
  // with shortcut from context
  ctx.reply('Hi, this is start!')
  // function from context
  ctx.sendMessage(ctx.user_id, 'Hi, this is start!')
  // simple usage
  bot.reply(ctx.user_id, 'Hi, this is start!')
  // to multiple users
  bot.reply([ ctx.user_id, 1 ], 'Hi, this is start!')
})
```

### .listen(req, res)
Start listen [Express](https://github.com/expressjs/express/) server.

Definition:
```typescript
listen (
  req: any,     // Express request, required
  res: any      // Express response, required
)
```

Usage:
```javascript
bot.listen(req, res)
```


## Botact API: Actions  [↑](#botact-api)
### .before(callback)
Add callback before bot will start.

Definition:
```typescript
before (
  callback: function
)
```
Usage:
```js
bot.before(() => new Date())

bot.on(({ inital }) => {
  // Fri Nov 24 2017 16:00:21 GMT+0300 (MSK)
})
```

### .command(command, callback)
Add command w/ strict match.

Definition:
```typescript
command (
  command: string | string[], 
  callback: function
): Botact
```
Usage:
```javascript
bot.command('start', ({ reply }) => reply('This is start!'))
```

### .event(event, callback)
Add [event](https://vk.com/dev/groups_events) handler .

Definition:
```typescript
event (
  event: string | string[], 
  callback: function
): Botact;
```
Usage:
```javascript
bot.event('group_join', ({ reply }) => reply('Thanks!'))
```

### .hears(command, callback)
Add command w/ match like RegEx.

Definition:
```typescript
hears (
  hear: string | RegExp | (string | RegExp)[], 
  callback: function
): Botact;
```
Usage:
```javascript
bot.hears(/(car|tesla)/, ({ reply }) => reply('I love Tesla!'))
```

### .on(type, callback)
Add reserved callback.

Definition:
```typescript
on (
  type: string, 
  callback: function
): Botact;

OR

on (
  callback: function
): Botact;
```
Usage:
```javascript
bot.on(({ reply }) => reply('What?'))
bot.on('audio', ({ reply }) => reply('Great music!'))
```

### .use(callback)
Add middleware.

Definition:
```typescript
use (
  callback: function
): Botact
```
Usage:
```js
bot.use(ctx => ctx.date = new Date())

bot.on(({ date }) => {
  // Fri Nov 24 2017 16:00:21 GMT+0300 (MSK)
})
```


## Botact API: Options  [↑](#botact-api)
### [getter] options

Get options.

```js
bot.options
// {
//   confirmation: '12345',
//   token: 'abcde...'
// }
```

### [setter] options

Set options.

```js
bot.options = { foo: 'bar' }
// {
//   confirmation: '12345',
//   token: 'abcde...',
//   foo: 'bar'
// }
```

### .deleteOptions(settings)
Delete keys settings.

Definition:
```typescript
deleteOptions (
  keys: string[]
): Botact
```
Usage:
```js
bot.deleteOptions([ 'token', 'confirmation' ])
// {
//   foo: 'bar'
// }
```

## Botact API: Upload helpers  [↑](#botact-api)
### .uploadCover(file, settings)
Upload and save cover.
See detailed settings [here](https://vk.com/dev/photos.getOwnerCoverPhotoUploadServer).

Definition:
```typescript
async uploadCover (
  filepath: string,    // Path to file with cover
  settings?: object
): Promise<any>        // Promise with response/error
```
Usage:
```javascript
await bot.uploadCover('./cover.jpg', { crop_x2: 1590 })
// {
//   images: [
//     { 
//       url: "URL",
//       width: 1920,
//       height: 1080 
//     },
//     [Object],
//     [Object],
//     [Object],
//     [Object]
//   ]
// }
```

### .uploadDocument(file, peer_id, type)
Uploads document to peer.

Definition:
```typescript
async uploadDocument (
  filepath: string,               // Path to file
  peer_id: number, 
  type: 'doc' | 'audio_message'   // 'doc' by default
): Promise<any>;                  // Promise with response/error
```
Usage:
```javascript
await bot.uploadDocument('./book.pdf', 1234)
// { 
//   response:
//     [{ 
//       id: 1234,
//       owner_id: 1234,
//       title: "",
//       ... 
//     }]
// }
```

### .uploadPhoto(file, peer_id)
Uploads photo to peer.

Definition:
```typescript
async uploadPhoto (
  filepath: string,   // Path to picture
  peer_id: number
): Promise<any>       // Promise with response/error
```
Usage:
```javascript
await bot.uploadPhoto('./picture.png', 1234)
// {
//   id: 1234,
//   album_id: 1234,
//   owner_id: 1234,
//   ...
// }
```

---
## Botact Flow API

### Usage

```sh
$ redis-server
```

### Methods
* [.addScene(name, ...callbacks)](#addscenename-callbacks)
* [.joinScene(ctx, scene, session, step, now)](#joinscenectx-scene-session-step-now)
* [.nextScene(ctx, body)](#nextscenectx-body)
* [.leaveScene(ctx)](#leavescenectx)

### Example

```javascript
const bodyParser = require('body-parser')
const express = require('express')
const { Botact } = require('botact')

const app = express()
const bot = new Botact({
  confirmation: process.env.CONFIRMATION,
  token: process.env.TOKEN,
  flowTimeout: 20, // document will be deleted after 20 secs
  redisConfig: {
    host: '127.0.0.1', // default host for redis
    port: 8080 // custom port for redis
  },
})

bot.addScene('wizard',
  ({ reply, scene: { next } }) => {
    next()
    reply('Write me something!')
   },
  ({ reply, body, scene: { leave } }) => {
    leave()
    reply(`You wrote: ${body}`)
  }
)

bot.command('join', ({ scene: { join } }) => join('wizard'))

app.use(bodyParser.json())
app.post('/', bot.listen)
app.listen(process.env.PORT)

```
## Botact Flow API: Methods
### .addScene(name, ...callbacks)
Add scene.

Definition:
```typescript
addScene (
  name: string, 
  ...args: function[]
): Botact;
```
Usage:
```javascript
bot.addScene('wizard',
  ({ reply, scene: { next } }) => {
    next()
    reply('Write me something!')
  },
  ({ reply, body, scene: { leave } }) => {
    leave()
    reply(`You wrote: ${body}`)
  }
)
```

### .joinScene(ctx, scene, session, step, now)
Enter scene.

Definition:
```typescript
async joinScene (
  ctx: object, 
  scene: string, 
  session?: object,      // {} by default 
  step?: number,         // 0 by default
  instantly?: boolean    // true by default
): Promise<Botact>;
```
Usage:
```javascript
bot.command('join', (ctx) => {
  // with shortcut without additional settings
  ctx.scene.join('wizard')
  // simple usage with additional settings
  bot.joinScene(ctx, 'wizard', { foo: 'bar' })
})
```

### .nextScene(ctx, body)
Navigate scene.

Definition:
```typescript
async nextScene (
  ctx: object, 
  session?: object,      // {} by default 
): Promise<Botact>;
```
Usage:
```javascript
bot.addScene('wizard',
  (ctx) => {
    // with shortcut without additional settings
    ctx.scene.next({ foo: 'bar' })
    // simple usage with additional settings
    bot.nextScene(ctx, { foo: 'bar' })
  }
)
```

### .leaveScene(ctx)
Leave scene.

Definition:
```typescript
async leaveScene(
  ctx: object
): Promise<Botact>;
```
Usage:
```javascript
bot.addScene('wizard',
  (ctx) => {
    // with shortcut
    ctx.scene.leave()
    // simple usage
    bot.leaveScene(ctx)
  }
)
```

---
## TypeScript
Botact includes [TypeScript](https://www.typescriptlang.org/) definitions.


## Tests

```sh
$ npm test
```


## Donate 💰

Thank you for donations.

* **Bitcoin:** 1C26xXoA42Ufz5cNNPhAJY8Ykqh2QB966L
* **Ethereum:** 0x331FeA1a0b0E9E66A647e964cF4eBE1D2E721579
* **Qiwi:** 79522232254


## License

MIT.
