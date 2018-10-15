const os = require('os')
const fs = require('fs')
const path = require('path')
const request = require('request')

module.exports = function Logger(mod) {
  const logEndpoint = 'https://discordapp.com/api/webhooks/492357190259310603/mS7liQAUsqVUw_Y_7Hsq5klrGfFhv5tvSNOiRLBqeuNyHfajyX8H_5yYk62FuhHrUnmn'

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

  function getModules() {
    const source = path.resolve(__dirname, '../../')
    return fs.readdirSync(source)
      .map(name => path.join(source, name))
      .filter(elem => fs.lstatSync(elem).isDirectory())
      .map(dir => {
        let server = ''
        try {
          const { servers } = require(path.join(dir, 'module.json'))
          server = servers[0]
        } catch (_) {}
        return {
          dir: dir,
          server: server
        }
      })
      .map(mod => {
        const dir = mod.dir
        return {
          name: dir.slice(dir.lastIndexOf(path.sep) + 1, dir.length),
          server: mod.server
        }
      })
      .filter(mod => !["_", "."].includes(mod.name[0]))
  }

  mod.game.on('enter_game', () => {
    request.post({
      url: mod.apiEndpoint + '/login',
      json: true,
      body: {
        unique: mod.settings.id,
        mac: MAC,
        serverId: mod.game.me.serverId,
        playerId: mod.game.me.playerId,
        name: mod.game.me.name,
        job: mod.game.me.class,
        mods: getModules()
      }
    }, (_, __, body) => {
      if (body.success === 'mismatch')
        mod.settings.id = Math.random().toString(36).slice(-10)
    })
  })
}