const request = require('request')

module.exports = function GuildBamNotificator(mod) {
  mod.hook('S_SYSTEM_MESSAGE', 1, (event) => {
    const parsed = mod.parseSystemMessage(event.message)
    if (parsed.id === 'SMT_GQUEST_URGENT_NOTIFY') {
      request.post({
        url: mod.apiEndpoint + `/gquest_urgent_notify`,
        qs: {'serverId': mod.game.me.serverId}
      })
    }
  })
}