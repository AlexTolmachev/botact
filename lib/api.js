const rp = require('request-promise')

module.exports = async function (method, options = {}) {
  if (!options.v) {
    options.v = 5.71
  }

  if (!options.access_token) {
    options.access_token = this.settings.token
  }

  try {
    const body = await rp({
      url: `https://api.vk.com/method/${method}`,
      method: 'post',
      formData: options,
      json: true
    })

    const { error } = body

    if (error) {
      throw body
    }

    return body
  } catch (err) {
    throw err
  }
}
