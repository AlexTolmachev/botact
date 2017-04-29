const api = require('../api')
const getLastMessage = require('./modules/getlastmessage')

let settings = {}
let messages = []

setInterval(() => {
  const method = messages.map(obj => `API.messages.send(${JSON.stringify(obj)})`)

  messages = []

  if (method.length) {
    api('execute', {
      code: `return [ ${method.join(',')} ];`,
      access_token: settings.token
    }).then(console.log).catch(console.log)
  }
}, 350)

class Botact {
  constructor(options) {
    if (!options.confirmation || !options.token) {
      throw 'Bot\'s options isn\'t full.'
    }

    settings = options

    this.settings = options
    this.action = {}
    this.messages = { commands: [], hears: [] }
  }

  confirm(req, res) {
    if (req.body.type === 'confirmation') {
      this.settings.group_id = req.body.group_id
      return res.end(this.settings.confirmation)
    }

    return false
  }

  command(command, callback) {
    if (typeof command === 'object') {
      return command.some(cmd => this.messages.commands[cmd.toLowerCase()] = callback)
    }

    this.messages.commands[command.toLowerCase()] = callback
  }

  hears(command, callback) {
    if (typeof command === 'object') {
      return command.some(cmd => this.messages.hears[cmd.toLowerCase()] = callback)
    }

    this.messages.hears[command.toLowerCase()] = callback
  }

  on(callback) {
    this.messages.on = callback
  }

  reply(user_id, message, attachments) {
    messages.push({
      user_id: user_id,
      message: message,
      attachment: attachments
    })
  }

  event(event, callback) {
    this.action[event] = callback
  }

  listen(req, res) {
    const data = req.body.object
          data.body = getLastMessage(data).body

    if (req.body.type === 'message_new') {
      let methods = {}

      Object.keys(this.messages.hears).map(method => methods[method] = this.messages.hears[method])

      if (this.messages.commands[data.body.toLowerCase()]) {
        this.messages.commands[data.body.toLowerCase()](data)
      } else {
        if (!Object.keys(methods).length) {
          if (typeof this.messages.on === 'function') {
            return this.messages.on(data)
          }

          return console.log('Bot can\'t found reserved reply.')
        }

        Object.keys(methods).some((key, i) => {
          if (new RegExp(key, 'i').test(data.body.toLowerCase())) {
            return methods[key](data) || true
          }

          if (i === --Object.keys(methods).length) {
            return this.messages.on(data)
          }
        })
      }
    }

    if (typeof this.action[req.body.type] === 'function') {
      this.action[req.body.type](data)
    }

    res.end('ok')
  }
}

module.exports = Botact
