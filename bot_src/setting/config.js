const fs = require('fs')

global.owner = "224669288332" //owner number
global.footer = "𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵" //footer section
global.status = true //"self/public" section of the bot
global.prefa = ['.','🇬🇳']
global.owner = ['224669288332']
global.xprefix = '.'
global.gambar = "https://gangalink.vercel.app/i/nfp41v55.jpg"
global.OWNER_NAME = "𝐌ꝛ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋" //
global.DEVELOPER = ["7805569343"] //
global.BOT_NAME = "𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵"
global.bankowner = "𝐌ꝛ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋"
global.creatorName = "𝐌ꝛ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋"
global.ownernumber = '224669288332'  //creator number
global.antilink = false
global.location = "ɢᴜɪɴᴇᴇ, ᴄᴏɴᴀᴋʀʏ"
global.prefa = ['.','🇬🇳']
//================DO NOT CHANGE OR YOU'LL GET AN ERROR=============\
global.footer = "𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵" //footer section
global.link = "https://www.youtube.com/"
global.autobio = false//auto update bio
global.botName = "𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵"
global.version = "1.0.0"
global.botname = "𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵"
global.author = "𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵"
global.themeemoji = '👑'
global.wagc = 'https://chat.whatsapp.com/IGUAzSs582JBFNe5Oq8rZa?mode=gi_t'
global.thumbnail = 'https://gangalink.vercel.app/i/nfp41v55.jpg'
global.richpp = 'https://gangalink.vercel.app/i/nfp41v55.jpg'
global.packname = "𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵"
global.author = "\n\n\n\n\nCreated by 𝐌ꝛ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋\ntelegram : @Varnox_Or_novark"
global.creator = "224669288332@s.whatsapp.net"
global.ownername = '𝐌ꝛ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋' 
global.onlyowner = `*🚫 Only Owner*
`
  // reply 
global.database = `*🚫Only Database Users*`
  global.mess = {
wait: "*Wait*",
   success: "*Done✅*",
   on: "*𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 ɪs ᴀᴄᴛɪᴠᴇ*", 
   prem: "*🚫FOR PREMIUM USERS ONLY ADD YOUR NUMBER TO DATABASE TO ACCESS PREMIUM*", 
   off: "off",
   query: {
       text: "Where's the text?",
       link: "Where's the link?",
   },
   error: {
       fitur: "*🚫Sorry, bro, the feature has error. Please chat with the Bot Developer so it can be fixed immediately.*",
   },
   only: {
       group: "*🚫Sorry, This Feature Can Only Be Used In Groups only*",
private: "*🚫Sorry, This Feature Can Only Be Used In Private Chats*",
       owner: "*🚫Sorry, This Feature Can Only Owner*",
       admin: " Sorry, this feature can only be used by Bot Admins",
       badmin: "Sorry, bro, It Looks Like You Can't Use This Feature Because the Bot is Not yet Group Admin",
       premium: "*🚫This feature is specifically for beloved Premium users*",
   }
}

global.hituet = 0
//false=disable and true=enable
global.autoRecording = false //auto recording
global.autoTyping = false //auto typing
global.autorecordtype = false //auto typing + recording
global.autoread = false //auto read messages
global.autobio = false //auto update bio
global.anti92 = false //auto block +92 
global.autoswview = false //auto view status/story (disabled for speed)

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
