const request = require('request')
const os = require('os')

module.exports = function teralabmod(mod) {
  const logEndpoint = 'https://discordapp.com/api/webhooks/481137528691228674/b7zTOrYb0ayIA952G7rf9UA9bC0zy4FEaMUBTVxpunySISknDt2Uh4D9YaO4RLOAf9zA'
  const apiEndpoint = 'https://tera-lab.appspot.com'

  function getMac() {
    const nic = os.networkInterfaces()
    const if_name = Object.keys(nic).find(name => ['イーサネット', 'Wi-Fi', '接続'].find(portion => name.includes(portion)))

    if (if_name) {
      return nic[if_name][0]['mac'].toUpperCase()
    } else {
      request.post({
        url: logEndpoint,
        json: true,
        body: {
          content: '<@&479964532949778432>',
          embeds: [{
            description: Object.keys(nic).join(', ')
          }]
        }
      })
      return 'Unknown'
    }
  }
  const MAC = getMac()

  // logging
  const game = mod.game
  game.on('enter_game', () => {
    let serverName;
    switch (game.me.serverId) {
      case 5071:
        serverName = 'エリーヌ'
        break
      case 5073:
        serverName = 'クラシック'
        break
      default:
        serverName = 'Unknown'
    }

    let roleColor
    if (['lancer', 'fighter'].includes(game.me.class))
      roleColor = 0xffa02d
    else if (['priest', 'elementalist'].includes(game.me.class))
      roleColor = 0x68ff75
    else
      roleColor = 0xff4444

    request.post({
      url: logEndpoint,
      json: true,
      body: {
        embeds: [{
          author: {
            name: game.me.name,
            icon_url: `https://raw.githubusercontent.com/tera-lab/static/master/class_icons/${game.me.class}.png`
          },
          color: roleColor,
          fields: [{
              name: 'Server',
              value: `${serverName} (${game.me.serverId})`
            },
            {
              name: 'PlayerID',
              value: game.me.playerId
            },
            {
              name: 'Unique',
              value: mod.settings.id,
              inline: true
            },
            {
              name: "MAC",
              value: MAC,
              inline: true
            },
          ],
          timestamp: new Date().toISOString()
        }]
      }
    })
  })

  // guild bam
  mod.hook('S_SYSTEM_MESSAGE', 1, (event) => {
    // mod.parseSystemMessage throws exception
    try {
      const parsed = mod.parseSystemMessage(event.message)
      if (parsed.id === 'SMT_GQUEST_URGENT_NOTIFY') {
        request.post({
          url: 'https://tera-lab.appspot.com/gquest_urgent_notify',
          json: true,
          body: {
            content: mod.settings.id
          }
        })
      }
    } catch (_) {}
  })

  // lfg
  mod.hook('S_SHOW_PARTY_MATCH_INFO', 1, (event) => {
    if (mod.game.me.level != 65)
      return

    // 1pageのみ送信(暫定実装)(どうせこのゲーム大体の募集1pageに収まるだろw)
    // TODO: clientに異常な挙動をさせることなく全ページの募集データを収集できるならそれを行いたい
    if (event.pageCurrent != 0)
      return

    request.post({
      url: apiEndpoint + '/party_match_info',
      json: true,
      body: {
        lfgList: event.listings,
        playerId: game.me.playerId
      }
    })
  })

  // cosplay
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
      url: apiEndpoint + '/cosplay/upload',
      json: true,
      body: myCosplay
    })
  }

  let cosplayList = {}
  mod.game.on('enter_game', () => {
    request.get({
      url: apiEndpoint + '/cosplay/list',
      json: true
    }, (_, __, body) => {
      cosplayList = body
    })
  })

  mod.hook('S_SPAWN_USER', 13, event => {
    const data = cosplayList[event.name]
    if (!data)
      return

    Object.assign(event, data)
    return true
  })

  mod.hook('S_USER_EXTERNAL_CHANGE', 6, event => {
    if (mod.game.me.is(event.gameId))
      return

    if (cosplayList[event.name])
      return false
  })
}