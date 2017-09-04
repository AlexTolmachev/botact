module.exports = function (ctx) {
  return new Promise((resolve, reject) => {
    if (this.flow.scenes[ctx.user_id]) {
      const current = Object.keys(this.flow.scenes[ctx.user_id])[this.flow.scenes[ctx.user_id].current]

      resolve(this.flow.scenes[ctx.user_id][current](ctx))
    }

    const command = ctx.body.toLowerCase()

    if (this.actions.commands[command]) {
      return this.actions.commands[command](ctx)
    }

    if (!Object.keys(this.actions.hears).length) {
      if (typeof this.actions.on === 'function') {
        resolve(this.actions.on(ctx))
      }

      reject('Bot can\'t found reserved reply.')
    }

    const entries = Object.keys(method).filter(string => new RegExp(string, 'i').test(command))

    if (entries.length) {
      resolve(this.actions.hears[entries[0]](ctx))
    }

    if (typeof this.actions.on === 'function') {
      resolve(this.actions.on(ctx))
    }

    reject('Bot can\'t found reserved reply.')
  })
}
