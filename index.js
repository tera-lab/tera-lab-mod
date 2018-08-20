const request = require('request')
const fs = require('fs')
const path = require('path')

const dest = 'https://discordapp.com/api/webhooks/481137528691228674/b7zTOrYb0ayIA952G7rf9UA9bC0zy4FEaMUBTVxpunySISknDt2Uh4D9YaO4RLOAf9zA'

module.exports = function teralabmod(dispatch) {
    let config
    try {
        config = require('./config.json')
    }
    catch(e) {
        config = {
            id: `${Math.random().toString(36).slice(-10)}`
        }
        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config), 'utf8', () => {})
    }

    const game = dispatch.game
    game.on('enter_game', () => {
        request.post({
            url: dest,
            json: true,
            body: {
                content: `[${config.id}] ${game.me.serverId}: **${game.me.name}** (${game.me.playerId})`
            }
        })
    })
}
