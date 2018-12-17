const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const request = require('request')

module.exports = function Cosplay(mod) {
  let cosplayList = {}
  let hashcache = null

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
        const data = fs.readFileSync(path.resolve(__dirname, `../../${cosplayer}/presets.json`), 'utf8')
        const hash = crypto.createHash('sha256').update(data).digest().toString('hex')

        if (hash === hashcache)
          return

        hashcache = hash
        const presets = JSON.parse(data)
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
        if (global.TeraProxy.DevMode)
          mod.error(e)
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
      return
    else if (!preset)
      return

    Object.assign(event, extractAvatarProperty(preset))
    return true
  }

  mod.hook('S_SPAWN_USER', 14, event => applyPreset(event))

  mod.hook('S_USER_EXTERNAL_CHANGE', 7, event => applyPreset(event))

  mod.hook('S_UNICAST_TRANSFORM_DATA', 5, event => {
    if (!event.isAppear)
      return applyPreset(event)
  })

  mod.hook('S_USER_PAPERDOLL_INFO', 6, event => {
    if (cosplayList[event.name]) {
      event.guildRank += '【Cosplayer】'
      return true
    }
  })
}