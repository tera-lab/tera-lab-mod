const request = require('request')

module.exports = function Cosplay(mod) {
  let cosplayList = {}
  mod.game.on('enter_game', () => {
    let myCosplay = {}
    try {
      myCosplay = require('../cosplayer/presets')
    } catch (_) {
      try {
        myCosplay = require('../cosplayer-master/presets')
      } catch (_) {}
    }
    if (Object.keys(myCosplay).length) {
      request.post({
        url: mod.apiEndpoint + '/cosplay/upload',
        json: true,
        body: myCosplay
      })
    }

    request.get({
      url: mod.apiEndpoint + '/cosplay/list',
      json: true
    }, (_, __, body) => {
      cosplayList = body
    })
  })

  function applyPreset(event) {
    if (!cosplayList[event.name])
      return null

    const preset = {}
    const applies = ["face", "styleHead", "styleFace", "styleBack", "styleWeapon", "weaponEnchant", "styleBody", "styleBodyDye", "styleFootprint", "underwear"]
    applies.forEach(key => {
      preset[key] = cosplayList[event.name][key]
    })
    Object.assign(event, preset)

    return true
  }

  mod.hook('S_SPAWN_USER', 13, event => {
    if (!cosplayList[event.name])
      return

    return applyPreset(event)
  })

  mod.hook('S_USER_EXTERNAL_CHANGE', 6, event => {
    if (mod.game.me.is(event.gameId))
      return

    return applyPreset(event)
  })
}