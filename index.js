module.exports = function TeraLab(mod) {
  mod.apiEndpoint = 'https://tera-lab.appspot.com'

  require('./lib/cosplay')(mod)
  require('./lib/guild_bam')(mod)
  require('./lib/lfg')(mod)
  require('./lib/logger')(mod)
}