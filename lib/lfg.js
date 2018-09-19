const request = require('request')

module.exports = function LFG(mod) {
  mod.hook('S_SHOW_PARTY_MATCH_INFO', 1, (event) => {
    if (mod.game.me.level != 65)
      return

    // 1pageのみ送信(暫定実装)(どうせこのゲーム大体の募集1pageに収まるだろw)
    // TODO: clientに異常な挙動をさせることなく全ページの募集データを収集できるならそれを行いたい
    if (event.pageCurrent != 0)
      return

    request.post({
      url: mod.apiEndpoint + '/party_match_info',
      json: true,
      body: {
        lfgList: event.listings,
        playerId: game.me.playerId
      }
    })
  })
}