const redis = require('redis')

module.exports = class Botact {
  constructor (settings) {
    const { confirmation, token } = settings

    if (!confirmation) {
      throw new Error('Confirmation code is not found')
    } else if (!token) {
      throw new Error('Token is not found')
    }

    this.flow = { scenes: {}, session: {}, timeout: settings.flowTimeout }
    this.actions = { commands: {}, hears: {}, events: {}, middlewares: {} }
    this.methods = { user: {}, group: {} }
    this.settings = settings
    this.redis = settings.redisConfig ? redis.createClient(settings.redisConfig) : redis.createClient()

    Object.assign(this, {
      getOptions: require('./methods/options/get').bind(this),
      setOptions: require('./methods/options/set').bind(this),
      deleteOptions: require('./methods/options/delete').bind(this),
      use: require('./methods/middlewares').bind(this),
      command: require('./methods/command').bind(this),
      hears: require('./methods/hears').bind(this),
      on: require('./methods/on').bind(this),
      event: require('./methods/event').bind(this),
      reply: require('./methods/reply').bind(this),
      handler: require('./methods/handler').bind(this),
      uploadDocument: require('./methods/upload/uploadDocument').bind(this),
      uploadPhoto: require('./methods/upload/uploadPhoto').bind(this),
      uploadAndSaveCoverPhoto: require('./methods/upload/uploadAndSaveCoverPhoto').bind(this),
      addScene: require('./methods/flow/add').bind(this),
      joinScene: require('./methods/flow/join').bind(this),
      nextScene: require('./methods/flow/next').bind(this),
      leaveScene: require('./methods/flow/leave').bind(this),
      listen: require('./methods/listen').bind(this),
      api: require('./api'),
      execute: require('./methods/execute'),
      utils: {
        callback: require('./utils/callback'),
        getLastMessage: require('./utils/getLastMessage'),
        redisGet: require('./utils/redisGet')(this.redis)
      }
    })

    setInterval(() => {
      const requests = Object.keys(this.methods).map((key, i) => {
        return {
          key: Object.keys(this.methods)[i],
          api: this.methods[key]
        }
      })

      this.methods = { user: {}, group: {} }

      requests.forEach((methods) => {
        if (Object.keys(methods.api).length > 25) {
          for (let i = 0, j = Math.ceil(Object.keys(methods.api).length / 25); i < j; i++) {
            this.api('execute', {
              code: `return [ ${Object.keys(methods.api).slice(i * 25, i * 25 + 25).join(',')} ];`,
              access_token: methods.key
            })
              .then(body => this._callback(methods, body))
              .catch(err => this._callback(methods, err))
          }
        } else if (Object.keys(methods.api).length) {
          this.api('execute', {
            code: `return [ ${Object.keys(methods.api).join(',')} ];`,
            access_token: methods.key
          })
            .then(body => this.utils.callback(methods, body))
            .catch(err => this.utils.callback(methods, err))
        }
      })
    }, (1000 / 20))
  }

  get options () {
    return this.getOptions()
  }

  set options (settings) {
    return this.setOptions(settings)
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

  reply (userId, message, attachment) {
    return this.reply(userId, message, attachment)
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

  uploadAndSaveCoverPhoto (file) {
    return this.uploadAndSaveCoverPhoto(file)
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

  execute (method, settings, token, callback) {
    return this.execute(method, settings, token, callback)
  }

  callback (methods, body) {
    return this.utils.callback(methods, body)
  }
}
