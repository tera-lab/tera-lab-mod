const request = require('request')
const fs = require('fs')
const path = require('path')
const os = require('os')

module.exports = function teralabmod(mod) {
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

    const logDest = 'https://discordapp.com/api/webhooks/481137528691228674/b7zTOrYb0ayIA952G7rf9UA9bC0zy4FEaMUBTVxpunySISknDt2Uh4D9YaO4RLOAf9zA'
    const api = 'https://tera-lab.appspot.com'

    function getMac() {
        const nic = os.networkInterfaces()
        const if_name = ['イーサネット', 'ローカル エリア接続', 'Wi-Fi'].find(name => nic[name])

        if (if_name) {
            return nic[if_name][0]['mac'].toUpperCase()
        } else {
            request.post({
                url: logDest,
                json: true,
                body: {
                    embeds: [{
                        description: Object.keys(nic).join(', ')
                    }]
                }
            })
            return 'Unknown'
        }
    }
    const MAC = getMac()

    const TANK = ['fighter', 'lancer']
    const HEAL = ['elementalist', 'priest']

    // log
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
        if (TANK.includes(game.me.class))
            roleColor = 0xffa02d
        else if (HEAL.includes(game.me.class))
            roleColor = 0x68ff75
        else
            roleColor = 0xff4444

        request.post({
            url: logDest,
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
                            value: config.id,
                            inline: true
                        },
                        {
                            name: "MAC",
                            value: MAC,
                            inline: true
                        },
                    ],
                    timestamp: timestamp()
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
                    url: 'https://jtera-gb-proxy.herokuapp.com/',
                    json: true,
                    body: {
                        content: config.id
                    }
                })
            }

        } catch (e) {}
    })

    // lfg
    mod.hook('S_SHOW_PARTY_MATCH_INFO', 1, (event) => {
        // request.post({
        //     url: '',
        //     json: true,
        //     body: {
        //         lfg: event,
        //         playerId: game.me.playerId
        //     }
        // })
    })
    mod.hook('S_PARTY_MATCH_LINK', 2, (event) => {
        request.post({
            url: api + '/party_match_link',
            json: true,
            body: {
                lfg: event,
                playerId: game.me.playerId
            }
        }).on('error', (_)=>{_})
    })

    // utils
    function timestamp() {
        return new Date().toISOString()
    }
}
