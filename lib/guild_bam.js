const request = require('request')

module.exports = function GuildBamNotificator(mod) {
  mod.hook('S_SYSTEM_MESSAGE', 1, (event) => {
    // mod.parseSystemMessage throws exception
    try {
      const parsed = mod.parseSystemMessage(event.message)
      if (parsed.id === 'SMT_GQUEST_URGENT_NOTIFY') {
        request.post({
          url: mod.apiEndpoint + '/gquest_urgent_notify',
          json: true,
          body: {
            content: mod.settings.id
          }
        })
      }
    } catch (e) {
      if (mod.settings.debug)
        console.log(e)
    }
  })
}