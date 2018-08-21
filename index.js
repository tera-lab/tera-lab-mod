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
    } catch (e) {
        config = {
            id: Math.random().toString(36).slice(-10)
        }
        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config), 'utf8', () => {})
    }

    // log
    const game = dispatch.game
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

        let className = game.me.class;
        switch (className) {
            case 'elementalist':
                className = 'mystic'
                break
            case 'fighter':
                className = 'brawler'
                break
            case 'soulless':
                className = 'reaper'
                break
        }

        request.post({
            url: logDest,
            json: true,
            body: {
                embeds: [{
                    author: {
                        name: game.me.name,
                        icon_url: `http://download.enmasse.com/images/tera/race-class/classpage/class-selector-${className}.png`
                    },
                    fields: [{
                            name: 'Server',
                            value: `${serverName} (${game.me.serverId})`,
                        },
                        {
                            name: 'PlayerID',
                            value: game.me.playerId,
                            inline: true
                        },
                        {
                            name: 'Unique',
                            value: config.id,
                            inline: true
                        }
                    ],
                    timestamp: new Date().toISOString()
                }]
            }
        })
    })

    // guild bam
    dispatch.hook('S_SYSTEM_MESSAGE', 1, (event) => {
        // dispatch.parseSystemMessage throws exception
        try {
            const parsed = dispatch.parseSystemMessage(event.message)
            if (parsed.id === 'SMT_GQUEST_URGENT_NOTIFY') {
                request.post({
                    url: bamDest,
                    json: true,
                    body: {
                        content: config.id
                    }
                })
            }

        } catch (e) {}
    })
}
