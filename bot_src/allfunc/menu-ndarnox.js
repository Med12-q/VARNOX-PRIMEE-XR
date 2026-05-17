/**
 * 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 — Menu style original (zip style)
 */

function uptimeStr(s) {
  s = Math.floor(s);
  const d = Math.floor(s/86400), h = Math.floor((s%86400)/3600);
  const mm = Math.floor((s%3600)/60), se = s%60;
  const parts = [];
  if (d) parts.push(d+'d'); if (h) parts.push(h+'h');
  parts.push(mm+'m'); parts.push(se+'s');
  return parts.join(' ');
}

const CATEGORIES = [
  ['⚡ ᴄᴏʀᴇ ʙᴏᴛ', [
    'menu','help','ping','alive','runtime','uptime',
    'owner','dev','repo','jid','botinfo','version',
    'public','private','self','stats',
  ]],
  ['🛡 ᴀɴᴛɪ-ꜰᴇᴀᴛᴜʀᴇs', [
    'antilink on/off','antispam on/off','antibadword on/off',
    'antibot on/off','antiraid on/off','antifake on/off',
    'antiinvite on/off','antizombie','antipub on/off',
    'antispy on/off','verify on/off','whitelist',
    'lockdown','lockgroup','unlockgroup',
  ]],
  ['⏰ ᴏᴜᴠᴇʀᴛᴜʀᴇ / ꜰᴇʀᴍᴇᴛᴜʀᴇ', [
    'mute','unmute','opentime <durée>','closetime <durée>',
    'lockinfo','unlockinfo','freeze','unfreeze',
  ]],
  ['📋 ɪɴꜰᴏs ɢʀᴏᴜᴘᴇ', [
    'setname <nom>','setdesc <texte>','setpp',
    'grouplink','invitelink','resetlink',
    'groupinfo','listadmin','listmembers',
    'getpp','tagadminall',
  ]],
  ['⚒ ᴍᴏᴅéʀᴀᴛɪᴏɴ', [
    'kick @user','add <num>','promote @user','demote @user',
    'kickall','kickadmins','kickfake','ban @user','unban @user',
    'warn @user','unwarn @user','clearwarn','listwarn','purge',
    'acceptall','rejectall','listrequests',
  ]],
  ['📣 ᴍᴇssᴀɢᴇs & ᴛᴀɢ', [
    'tagall <texte>','hidetag <texte>','tag',
    'setwelcome <texte>','setgoodbye <texte>',
    'welcomeon','welcomeoff','testwelcome',
    'poll','vote','say',
  ]],
  ['🤖 ᴀᴜᴛᴏ-ꜰᴏɴᴄᴛɪᴏɴs', [
    'autoread on/off','autobio on/off','autotyping on/off',
    'autorecording on/off','autoreact on/off',
    'autoreply on/off','autoviewstatus on/off',
    'autorecordtype on/off',
  ]],
  ['🎨 ᴏᴜᴛɪʟs ᴍéᴅɪᴀ', [
    'url','toimg','tomp4','tomp3','vv','vv2',
    'qc','qrcode','readqr','shorturl','getpp','color',
  ]],
  ['🔍 ʀᴇᴄʜᴇʀᴄʜᴇ / ɪɴꜰᴏ', [
    'movie','wiki','define','weather','time',
    'iplookup','myipinfo','currency','calculate',
    'book','horoscope','recipe','yts','tiktok',
    'apk','gpt4','lyrics','npm','github',
    'useragent','fakedata',
  ]],
  ['🎮 ᴊᴇᴜx & ꜰᴜɴ', [
    'tictactoe','hangman','rpsls','dice','coin',
    'emojiquiz','emojimix','math','truth','dare',
    'joke','quote','fact','8ball','riddle','advice',
    'compliment','insult','roast','ship','lovecalc',
    'gay','iq','simp','shuffle','random','choose',
    'password','uuid','say',
  ]],
  ['✨ ᴛᴇxᴛᴇ sᴛʏʟɪsé', [
    'glitchtext','neonglitch','flagtext','flag3dtext',
    'royaltext','gradienttext','glowingtext','underwatertext',
    'blackpinklogo','logomaker','cartoonstyle','galaxystyle',
    'luxurygold','sandsummer','lighteffects','makingneon',
    'sandtext','deepseatext','breakingglass','americanflag',
    'animatedheart','neondevil','pixelglitch','metallic',
    'matrix','firework','thunder','water','blood',
    'christmas','halloween','valentine','birthday',
    'graffiti','wood','toxic','ice','love','rainbow',
  ]],
  ['🖼 ɪᴍᴀɢᴇ ꜰx', [
    'wasted','jail','pet','trash','mnm','uncover',
    'drip','drake','oogway','pikachu','alert',
    'communism','doublestonk','tweet','biden','sadcat',
  ]],
  ['🐾 ᴀɴɪᴍᴇ / ᴀɴɪᴍᴀᴜx', [
    'animewlp','animesearch','kiss','hug','slap','cuddle',
    'pat','bite','wink','poke','blush','smile','dance',
    'smug','wave','highfive','glomp','happy','cringe',
    'bonk','bully','yeet','lick','nom','awoo','cry',
    'kill','handhold','shinobu','fox','koala','bird',
    'panda','cat','dog','duck','catfact','dogfact',
  ]],
  ['🔊 ᴀᴜᴅɪᴏ ꜰx', [
    'bass','blown','deep','earrape','fast','fat',
    'nightcore','reverse','robot','slow','smooth','squirrel',
  ]],
  ['🔐 ᴏᴜᴛɪʟs ᴛᴇxᴛᴇ', [
    'b64encode','b64decode','md5','sha1','sha256','sha512',
    'hex','fromhex','binary','frombinary','morse','frommorse',
    'upper','lower','reverse','repeat','count','smallcaps',
    'bold','italic','spoiler','mock','clap','sarcasm',
    'zalgo','ascii','figlet','shrug','tableflip','unflip','lenny',
  ]],
];

function buildMenu({ pushname, mode, prefix }) {
  const total = CATEGORIES.reduce((n, [, arr]) => n + arr.length, 0);
  const date = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Conakry' });
  const upt = uptimeStr(process.uptime());
  prefix = prefix || '.';

  let s = '';
  s += `*╭━━━〔 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 〕━━━╮*\n`;
  s += `*┃✪╭──────────────────*\n`;
  s += `*┃✪│🌐 ᴘʀᴇꜰɪxᴇ :❯ 𓊈${prefix}𓊉*\n`;
  s += `*┃✪│👤 ᴜsᴇʀ :❯ ${pushname || 'User'}*\n`;
  s += `*┃✪│🛰 ᴍᴏᴅᴇ :❯ ${(mode || 'PUBLIC').toUpperCase()}*\n`;
  s += `*┃✪│🕒 ᴜᴘᴛɪᴍᴇ :❯ ${upt}*\n`;
  s += `*┃✪│📅 ᴅᴀᴛᴇ :❯ ${date}*\n`;
  s += `*┃✪│📦 ᴄᴍᴅs :❯ ${total}*\n`;
  s += `*┃✪│🧑‍💻 ᴅᴇᴠ :❯ 𝐌ꝛ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋*\n`;
  s += `*┃✪╰──────────────────*\n`;
  s += `*╰━━━━━━━━━━━━━━━━━━━━━━━┈⊷*\n\n`;

  for (const [title, list] of CATEGORIES) {
    s += `*╭━━  ${title}*\n`;
    for (const cmd of list) {
      s += `*┃✪│ ${prefix}${cmd}*\n`;
    }
    s += `*╰━━━━━━━━━━━━━━━━━┈⊷*\n\n`;
  }

  s += `> ✦ *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐌ꝛ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋* ✦`;
  return s;
}

function totalCount() {
  return CATEGORIES.reduce((n, [, a]) => n + a.length, 0);
}

module.exports = { buildMenu, CATEGORIES, totalCount };
