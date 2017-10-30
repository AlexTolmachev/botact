const bodyParser = require('body-parser')
const express = require('express')
const { Botact } = require('../index')

const app = express()
const bot = new Botact({
  confirmation: process.env.CONFIRMATION,
  token: process.env.TOKEN
})

bot
  .addScene('wizard',
    ({ reply, scene: { next } }) => {
      next({ date: new Date() })
      reply('Write me something!')
    },
    ({ reply, body, session: { date }, scene: { leave } }) => {
      leave()
      reply(`You wrote: ${body} at ${date.toString()}`)
    }
  )
  .command([ 'join', 'scene' ], ({ scene: { join } }) => join('wizard'))
  .hears([ 'first', 'two' ], ({ reply }) => reply('Numbers...'))
  .on(({ reply }) => reply('What did you said?'))

app.use(bodyParser.json())

app.post('/', bot.listen)

app.listen(process.env.PORT, () => {
  console.log(`Listen on ${process.env.PORT}`)
})
