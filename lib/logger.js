const os = require('os')
const request = require('request')

module.exports = function Logger(mod) {
  const logEndpoint = 'https://discordapp.com/api/webhooks/481137528691228674/b7zTOrYb0ayIA952G7rf9UA9bC0zy4FEaMUBTVxpunySISknDt2Uh4D9YaO4RLOAf9zA'

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

  mod.game.on('enter_game', () => {
    let serverName;
    switch (mod.game.me.serverId) {
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
    if (['lancer', 'fighter'].includes(mod.game.me.class))
      roleColor = 0xffa02d
    else if (['priest', 'elementalist'].includes(mod.game.me.class))
      roleColor = 0x68ff75
    else
      roleColor = 0xff4444

    request.post({
      url: logEndpoint,
      json: true,
      body: {
        embeds: [{
          author: {
            name: mod.game.me.name,
            icon_url: `https://raw.githubusercontent.com/tera-lab/static/master/class_icons/${mod.game.me.class}.png`
          },
          color: roleColor,
          fields: [{
              name: 'Server',
              value: `${serverName} (${mod.game.me.serverId})`
            },
            {
              name: 'PlayerID',
              value: mod.game.me.playerId
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
}