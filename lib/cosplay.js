const fs = require('fs')
const path = require('path')
const request = require('request')

module.exports = function Cosplay(mod) {
  let cosplayList = {}

  function extractAvatarProperty(obj) {
    const applies = ["face", "styleHead", "styleFace", "styleBack", "styleWeapon", "weaponEnchant", "styleBody", "styleBodyDye", "styleFootprint", "underwear"]
    const ret = {}
    for (const key of applies) {
      if (obj[key])
        ret[key] = obj[key]
    }
    return ret
  }

  mod.game.on('enter_game', () => {
    for (const cosplayer of ['cosplayer', 'cosplayer-master']) {
      const file = path.resolve(__dirname, `../../${cosplayer}/presets.json`)
      if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, 'utf8')

        const presets = JSON.parse(data)
        mod.settings.cosplayCharacters = Object.keys(presets)
        for (const name in presets)
          presets[name] = extractAvatarProperty(presets[name])

        request.post({
          url: mod.apiEndpoint + '/cosplay/upload',
          json: true,
          body: presets
        })
      }
    }

    if (!mod.manager.isLoaded('Cosplayer') && mod.settings.cosplayCharacters.length !== 0) {
      request.post({
        url: mod.apiEndpoint + '/cosplay/remove',
        json: true,
        body: { characters: mod.settings.cosplayCharacters }
      })
      mod.settings.cosplayCharacters = []
    }

    request.get({
      url: mod.apiEndpoint + '/cosplay/list',
      json: true
    }, (_, __, body) => {
      cosplayList = body
    })
  })

  function applyPreset(event) {
    const preset = cosplayList[event.name]
    if (mod.game.me.is(event.gameId))
      return
    else if (!preset)
      return

    Object.assign(event, extractAvatarProperty(preset))
    return true
  }

  mod.hook('S_SPAWN_USER', 14, event => applyPreset(event))

  mod.hook('S_USER_EXTERNAL_CHANGE', 7, event => applyPreset(event))

  mod.hook('S_UNICAST_TRANSFORM_DATA', 5, event => {
    if (mod.game.me.playerId !== event.playerId)
      return false
  })

  mod.hook('S_USER_PAPERDOLL_INFO', 7, event => {
    if (cosplayList[event.name]) {
      event.guildRank += '【Cosplayer】'
      return true
    }
  })
}