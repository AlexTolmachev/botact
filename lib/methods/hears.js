module.exports = function (command, callback) {
  const { hears } = this.actions
  const list = typeof command === 'object' && !/\/[\S]{1,}\/[a-z]{1,2}/.test(command)
    ? command : [command]
  const string = list
    .map(item => item instanceof RegExp ? item.toString() : item.toString().toLowerCase())
    .join(';')

  hears[string] = callback

  return this
}
