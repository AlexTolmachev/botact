const redis = require('redis')
const bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

module.exports = class Botact {
  constructor (settings) {
    const { confirmation, token } = settings

    if (!confirmation) {
      throw 'confirmation is required'
    } else if (!token) {
      throw 'token is required'
    }

    this.flow = { scenes: {}, session: {}, timeout: settings.flowTimeout }
    this.actions = { commands: [], hears: [], events: [], middlewares: [] }
    this.methods = []
    this.settings = settings
    this.redis = settings.redisConfig ? redis.createClient(settings.redisConfig) : redis.createClient()

    this.api = require('./api')
    this.getOptions = require('./methods/options/get').bind(this)
    this.setOptions = require('./methods/options/set').bind(this)
    this.deleteOptions = require('./methods/options/delete').bind(this)
    this.before = require('./methods/before').bind(this)
    this.use = require('./methods/use').bind(this)
    this.command = require('./methods/command').bind(this)
    this.hears = require('./methods/hears').bind(this)
    this.on = require('./methods/on').bind(this)
    this.event = require('./methods/event').bind(this)
    this.reply = require('./methods/reply').bind(this)
    this.handler = require('./methods/handler').bind(this)
    this.uploadDocument = require('./methods/upload/document').bind(this)
    this.uploadPhoto = require('./methods/upload/photo').bind(this)
    this.uploadAndSaveCoverPhoto = require('./methods/upload/saveCoverPhoto').bind(this)
    this.addScene = require('./methods/flow/add').bind(this)
    this.joinScene = require('./methods/flow/join').bind(this)
    this.nextScene = require('./methods/flow/next').bind(this)
    this.leaveScene = require('./methods/flow/leave').bind(this)
    this.listen = require('./methods/listen').bind(this)
    this.execute = require('./methods/execute').bind(this)
    this.executeHandler = require('./utils/executeHandler')
    this.getLastMessage = require('./utils/getLastMessage')

    setInterval(() => {
      this.executeHandler(this.methods)
      this.methods = []
    }, (1000 / 20))
  }

  get options () {
    return this.getOptions()
  }

  set options (settings) {
    return this.setOptions(settings)
  }

  static execute (method, settings, token, callback) {
    return this.execute(method, settings, token, callback)
  }

  async before (callback) {
    return await this.before(callback)
  }

  deleteOptions (keys) {
    return this.deleteOptions(keys)
  }

  use (callback) {
    return this.use(callback)
  }

  command (command, callback) {
    return this.command(command, callback)
  }

  hears (command, callback) {
    return this.hears(command, callback)
  }

  on (callback) {
    return this.on(callback)
  }

  event (event, callback) {
    return this.event(event, callback)
  }

  reply (userId, message, attachment, callback) {
    return this.reply(userId, message, attachment, callback)
  }

  handler (ctx) {
    return this.handler(ctx)
  }

  uploadDocument (file) {
    return this.uploadDocument(file)
  }

  uploadPhoto (file) {
    return this.uploadPhoto(file)
  }

  uploadAndSaveCoverPhoto (file, settings) {
    return this.uploadAndSaveCoverPhoto(file, settings)
  }

  addScene (name, ...callbacks) {
    return this.addScene(name, callbacks)
  }

  joinScene (ctx, scene, body, step, now) {
    return this.joinScene(ctx, scene, body, step, now)
  }

  leaveScene (ctx) {
    return this.leaveScene(ctx)
  }

  nextScene (ctx) {
    return this.nextScene(ctx)
  }

  listen (req, res) {
    return this.listen(req, res)
  }

  callback (methods, body) {
    return this.callback(methods, body)
  }
}
