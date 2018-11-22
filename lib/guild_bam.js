const request = require('request')

module.exports = function GuildBamNotificator(mod) {
  mod.hook('S_NOTIFY_GUILD_QUEST_URGENT', 'raw', () => {
    request.post({
      url: mod.apiEndpoint + '/gquest_urgent_notify',
      qs: { 'serverId': mod.game.me.serverId }
    })
  })
}