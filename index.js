const request = require('request')
const fs = require('fs')
const path = require('path')

const logDest = 'https://discordapp.com/api/webhooks/481137528691228674/b7zTOrYb0ayIA952G7rf9UA9bC0zy4FEaMUBTVxpunySISknDt2Uh4D9YaO4RLOAf9zA'
const bamDest = 'https://jtera-gb-proxy.herokuapp.com/'

module.exports = function teralabmod(dispatch) {
    // config
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

    // log
    const game = dispatch.game
    game.on('enter_game', () => {
        request.post({
            url: logDest,
            json: true,
            body: {
                content: `[${config.id}] ${game.me.serverId}: **${game.me.name}** (${game.me.playerId})`
            }
        })
    })

    // guild bam
    dispatch.hook('S_SYSTEM_MESSAGE', 1, (event) => {
        // dispatch.parseSystemMessage throws exception
        try {
            const parsed = dispatch.parseSystemMessage(event.message)
            if(parsed.id === 'SMT_GQUEST_URGENT_NOTIFY') {
                request.post({
                    url: bamDest,
                    json: true,
                    body: {
                        content: "BAM Spawned! (sent by tera-lab-mod)"
                    }
                })
            }
            
        }
        catch(e) {}
    })
}
