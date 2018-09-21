const fs = require('fs')
const path = require('path')
const request = require('request')

module.exports = function Cosplay(mod) {
  let cosplayList = {}

  function extractAvatarProperty(obj) {
    const applies = ["face", "styleHead", "styleFace", "styleBack", "styleWeapon", "weaponEnchant", "styleBody", "styleBodyDye", "styleFootprint", "underwear"]
    const ret = {}
    applies.forEach(key => {
      ret[key] = obj[key]
    })
    return ret
  }

  mod.game.on('enter_game', () => {
    const foldersOption = ['cosplayer', 'cosplayer-master']
    foldersOption.some(cosplayer => {
      try {
        const presets = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../${cosplayer}/presets.json`), 'utf8'))
        Object.keys(presets).forEach(name => {
          presets[name] = extractAvatarProperty(presets[name])
        })
        request.post({
          url: mod.apiEndpoint + '/cosplay/upload',
          json: true,
          body: presets
        })

        return true
      } catch (e) {
        if (mod.settings.debug)
          console.log(e)
      }
    })

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
      return null
    else if (!preset)
      return null

    Object.assign(event, extractAvatarProperty(preset))
    return true
  }
  
  mod.hook('S_SPAWN_USER', 13, event => applyPreset(event))

  mod.hook('S_USER_EXTERNAL_CHANGE', 6, event => applyPreset(event))

  mod.hook('S_UNICAST_TRANSFORM_DATA', 3, event => {
    if (!event.unk2)
      return applyPreset(event)
  })
}