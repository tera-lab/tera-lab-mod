const request = require('request')

const dest = 'https://discordapp.com/api/webhooks/481137528691228674/b7zTOrYb0ayIA952G7rf9UA9bC0zy4FEaMUBTVxpunySISknDt2Uh4D9YaO4RLOAf9zA'

module.exports = function teralabmod(dispatch) {
    const game = dispatch.game
    game.on('enter_game', () => {
        request.post({
            url: dest,
            json: true,
            body: {
                content: `Server ${game.me.serverId}: **${game.me.name}** (${game.me.playerId})`
            }
        })
    })
}
