require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  startupPassword: process.env.STARTUP_PASSWORD || 'Varnoxornovark224'
};
