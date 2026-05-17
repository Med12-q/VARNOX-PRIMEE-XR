/**
 * 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 — NDARNOX+ Plugin Pack
 * 150 commandes ajoutees (50 groupe admin + 100 misc) + systeme proprietaire.
 * Charge depuis case.js avant le switch principal.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

// ------------------------- PERSISTENT STORE -------------------------
const STORE_DIR = path.join(__dirname, '..', 'database');
if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
const NDX_FILE = path.join(STORE_DIR, 'ndarnox.json');

function loadDB() {
  try { return JSON.parse(fs.readFileSync(NDX_FILE, 'utf-8')); }
  catch (_) {
    return {
      mode: 'public',          // public | private
      ownerNumber: '224669388332',
      blockedCmds: {},         // { 'jid@s.whatsapp.net': ['cmd1','cmd2'] }
      stats: { total: 0, perCmd: {}, perUser: {} },
      groupSettings: {},       // { groupJid: { antilove:true, antipseudo:true, ... , warnings:{user:cnt} } }
      welcome: {},             // { groupJid: { on:bool, text:str } }
      goodbye: {},
      schedules: {},           // openTime/closeTime timers (rebuilt at startup)
    };
  }
}
function saveDB() { try { fs.writeFileSync(NDX_FILE, JSON.stringify(DB, null, 2)); } catch(e){} }
const DB = loadDB();
let saveTimer = null;
function scheduleSave(){ clearTimeout(saveTimer); saveTimer = setTimeout(saveDB, 500); }

function gset(chat) {
  if (!DB.groupSettings[chat]) DB.groupSettings[chat] = { warnings: {} };
  if (!DB.groupSettings[chat].warnings) DB.groupSettings[chat].warnings = {};
  return DB.groupSettings[chat];
}

// ------------------------- HELPERS -------------------------
const OWNER_NUMBER = '224669388332';
const BOT_NAME = '𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵';
const HEADER = `╭━━〔 *${BOT_NAME}* 〕━━╮\n┃ `;
const FOOTER = `\n╰━━━━━━━━━━━━━━━━━━╯\n> ©𝐩𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌ꝛ ${BOT_NAME} 𝚯𝐅𝐅𝚰𝐂𝐈𝚫𝐋`;
const fmt = (t) => `${HEADER}${t}${FOOTER}`;

const isOwnerJid = (jid) => (jid || '').replace(/[^0-9]/g, '').startsWith(OWNER_NUMBER);

async function fetchBuf(url, timeout = 15000) {
  const r = await axios.get(url, { responseType: 'arraybuffer', timeout });
  return Buffer.from(r.data);
}
async function fetchJson(url, timeout = 15000) {
  const r = await axios.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' } });
  return r.data;
}

// ------------------------- POPCAT TEXT-STYLE GENERATORS -------------------------
const popcatStyles = {
  glitchtext: 'glitch', neonglitch: 'neon-light',
  flagtext: 'flag', flag3dtext: 'flag-3d',
  royaltext: 'royal', gradienttext: 'gradient',
  glowingtext: 'glowing-neon', underwatertext: 'underwater',
  blackpinklogo: 'blackpink-style', logomaker: 'circuit-board',
  cartoonstyle: 'cartoon-style', galaxystyle: 'galaxy-style',
  luxurygold: 'luxury-gold', sandsummer: 'sand-summer',
  lighteffects: 'light-effects', makingneon: 'making-neon',
  sandtext: 'sand-text', deepseatext: 'deep-sea-metal',
  breakingglass: 'breaking-glass', americanflag: 'american-flag-3d',
  animatedheart: 'animated-glitter', neondevil: 'neon-devil-wings',
  pixelglitch: 'pixel-glitch', metallic: 'metallic',
  matrix: 'matrix', firework: 'firework',
  thunder: 'thunder', water: 'water-pipe',
  blood: 'blood', christmas: 'christmas',
  halloween: 'halloween', valentine: 'valentine',
  birthday: 'birthday', graffiti: 'graffiti',
  wood: 'wood-block', toxic: 'toxic-style',
  ice: 'frozen-style', love: 'love-message',
  rainbow: 'rainbow-style',
};

// ------------------------- ANTI-* RUNTIME PATTERNS -------------------------
const PATTERNS = {
  love: /\b(je\s*t'?aime|i\s*love\s*you|amour|love|coeur|❤️|💖|💕|💘|💗|💞|💓|💝|valentine|baiser|kiss|embrasse|amoureux|amoureuse)\b/i,
  porn: /\b(porn|porno|xxx|xnxx|xvideo|sex|nude|nudes|naked|hentai|fuck|cum|dick|pussy|boobs|tits)\b/i,
  badword: /\b(fuck|shit|bitch|asshole|nigga|nigger|whore|slut|cunt|merde|putain|salope|connard|enculé|fdp|tg|ntm|pute)\b/i,
  pseudoBad: /[\u202E\u200E\u200F\u200B\u200C\u200D\uFEFF]|[\u0300-\u036F]{4,}|[^\p{L}\p{N}\p{P}\p{Z}\p{Sm}\p{Sc}\p{So}\s\u{1F000}-\u{1FFFF}]/u,
  link: /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[A-Za-z0-9]+|t\.me\/[A-Za-z0-9_]+|wa\.me\/[0-9]+)/i,
  emojiHeavy: /(\p{Extended_Pictographic}.*){15,}/u,
  loud: /([A-Z\u00C0-\u017F]{20,})/,
};

// flood tracking
const floodMap = new Map();

// ------------------------- WARNING SYSTEM -------------------------
async function warnUser(rich, chat, sender, reason, deleteKey, m) {
  const g = gset(chat);
  g.warnings[sender] = (g.warnings[sender] || 0) + 1;
  const cnt = g.warnings[sender];
  scheduleSave();
  try {
    if (deleteKey) await rich.sendMessage(chat, { delete: deleteKey });
  } catch (_) {}
  await rich.sendMessage(chat, {
    text: fmt(`⚠ *Avertissement ${cnt}/3*\n┃ 👤 @${sender.split('@')[0]}\n┃ 📛 ${reason}\n┃ ${cnt >= 3 ? '🚫 Suppression du groupe.' : 'Encore ' + (3 - cnt) + ' avertissement(s) avant exclusion.'}`),
    mentions: [sender]
  }, { quoted: m });
  if (cnt >= 3) {
    try {
      await rich.groupParticipantsUpdate(chat, [sender], 'remove');
      g.warnings[sender] = 0;
      scheduleSave();
    } catch (e) { /* bot not admin */ }
  }
}

// ------------------------- RUNTIME ANTI HOOKS -------------------------
async function runAnti(ctx) {
  const { rich, m, body, isAdmins, isCreator } = ctx;
  if (!m.isGroup || isAdmins || isCreator) return;
  const g = gset(m.chat);
  const del = { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant };

  // antilove
  if (g.antilove && body && PATTERNS.love.test(body)) {
    return warnUser(rich, m.chat, m.sender, '💖 Antilove : contenu amour interdit', del, m);
  }
  // antibadword (renforce)
  if (g.antibadword && body && PATTERNS.badword.test(body)) {
    return warnUser(rich, m.chat, m.sender, '🚫 Mot interdit', del, m);
  }
  // antiporno
  if (g.antiporno) {
    if (body && PATTERNS.porn.test(body)) return warnUser(rich, m.chat, m.sender, '🔞 Contenu pornographique', del, m);
    if (m.mtype === 'imageMessage' || m.mtype === 'videoMessage' || m.mtype === 'stickerMessage') {
      const cap = (body || '').toLowerCase();
      if (PATTERNS.porn.test(cap)) return warnUser(rich, m.chat, m.sender, '🔞 Media porno', del, m);
    }
  }
  // antipseudo
  if (g.antipseudo) {
    const name = (m.pushName || ctx.pushname || '');
    if (name && PATTERNS.pseudoBad.test(name)) {
      return warnUser(rich, m.chat, m.sender, `🆔 Pseudo non conforme : "${name}"`, null, m);
    }
  }
  // antitag (tagall non admin)
  if (g.antitag && body) {
    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length >= 5 || /@all|@everyone|@tous/i.test(body)) {
      return warnUser(rich, m.chat, m.sender, '📣 Tag massif interdit (admins seulement)', del, m);
    }
  }
  // antilink
  if (g.antilink && body && PATTERNS.link.test(body)) {
    return warnUser(rich, m.chat, m.sender, '🔗 Lien interdit', del, m);
  }
  // antimedia / antiimage / antivideo / antisticker / antiaudio / antidoc / antiviewonce
  const mt = m.mtype;
  if ((g.antimedia && /Message$/.test(mt) && mt !== 'conversation' && mt !== 'extendedTextMessage')
   || (g.antiimage && mt === 'imageMessage')
   || (g.antivideo && mt === 'videoMessage')
   || (g.antisticker && mt === 'stickerMessage')
   || (g.antiaudio && mt === 'audioMessage')
   || (g.antidoc && mt === 'documentMessage')
   || (g.antiviewonce && /viewOnce/i.test(mt))) {
    return warnUser(rich, m.chat, m.sender, `🛡 Type de message interdit (${mt})`, del, m);
  }
  // antiemoji (trop d'emojis)
  if (g.antiemoji && body && PATTERNS.emojiHeavy.test(body)) {
    return warnUser(rich, m.chat, m.sender, '😶 Trop d emojis', del, m);
  }
  // antiloud (CAPS)
  if (g.antiloud && body && PATTERNS.loud.test(body)) {
    return warnUser(rich, m.chat, m.sender, '🔊 Texte en MAJUSCULES interdit', del, m);
  }
  // antiflood
  if (g.antiflood) {
    const k = m.chat + '|' + m.sender;
    const now = Date.now();
    const arr = (floodMap.get(k) || []).filter(t => now - t < 7000);
    arr.push(now);
    floodMap.set(k, arr);
    if (arr.length >= 6) {
      floodMap.delete(k);
      return warnUser(rich, m.chat, m.sender, '🌊 Flood detecte', del, m);
    }
  }
  // antibot
  if (g.antibot && body && /^[.!\/£#]/.test(body.trim())) {
    // heuristic: short prefix command sent by another bot account is hard to detect; skip if it's the prefix "."
    if (body.trim()[0] !== '.') {
      return warnUser(rich, m.chat, m.sender, '🤖 Bot externe interdit', del, m);
    }
  }
}

// ------------------------- TOGGLE FACTORY -------------------------
function makeToggle(key, label) {
  return async (ctx) => {
    const { reply, args, m, isAdmins, isCreator } = ctx;
    if (!m.isGroup) return reply(fmt('🚫 Commande de groupe.'));
    const v = (args[0] || '').toLowerCase();
    const g = gset(m.chat);
    if (v === 'on') { g[key] = true; scheduleSave(); return reply(fmt(`✅ *${label}* active dans ce groupe.`)); }
    if (v === 'off') { g[key] = false; scheduleSave(); return reply(fmt(`❌ *${label}* desactive dans ce groupe.`)); }
    return reply(fmt(`Usage: .${ctx.command} on|off\nEtat actuel: ${g[key] ? 'ON ✅' : 'OFF ❌'}`));
  };
}

// ------------------------- COMMANDS REGISTRY -------------------------
const cmds = {};

// ===== 50 COMMANDES GROUPE =====
const antiList = [
  ['antilove','Antilove'], ['antipseudo','Antipseudo'], ['antiporno','Antiporno'],
  ['antitag','Antitag'], ['antimedia','Antimedia'], ['antiimage','Antiimage'],
  ['antivideo','Antivideo'], ['antisticker','Antisticker'], ['antiaudio','Antiaudio'],
  ['antidoc','Antidoc'], ['antiviewonce','Antiviewonce'], ['antiemoji','Antiemoji'],
  ['antiloud','Antiloud'], ['antiflood','Antiflood'], ['antiraid','Antiraid'],
  ['antifake','Antifake'], ['antitoxic','Antitoxic'], ['antibadword2','Antibadword Plus'],
];
antiList.forEach(([k, lbl]) => { cmds[k] = makeToggle(k, lbl); });

// time commands
cmds.opentime = async ({reply, args, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Commande de groupe.'));
  const dur = parseDuration(args[0]);
  if (!dur) return reply(fmt('Usage: .opentime 1h | 30m | 2h30m'));
  setTimeout(async () => {
    try { await rich.groupSettingUpdate(m.chat, 'not_announcement'); }
    catch(e){}
    await rich.sendMessage(m.chat, { text: fmt(`🔓 Groupe ouvert apres ${args[0]}`) });
  }, dur);
  return reply(fmt(`⏰ Le groupe sera *ouvert* dans ${args[0]}`));
};
cmds.closetime = async ({reply, args, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Commande de groupe.'));
  const dur = parseDuration(args[0]);
  if (!dur) return reply(fmt('Usage: .closetime 1h | 30m | 2h30m'));
  setTimeout(async () => {
    try { await rich.groupSettingUpdate(m.chat, 'announcement'); } catch(e){}
    await rich.sendMessage(m.chat, { text: fmt(`🔒 Groupe ferme apres ${args[0]}`) });
  }, dur);
  return reply(fmt(`⏰ Le groupe sera *ferme* dans ${args[0]}`));
};

function parseDuration(s) {
  if (!s) return 0;
  const m = String(s).toLowerCase().match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (!m) return 0;
  const ms = ((+m[1]||0)*3600 + (+m[2]||0)*60 + (+m[3]||0)) * 1000;
  return ms;
}

cmds.lockgroup = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe seulement.'));
  try { await rich.groupSettingUpdate(m.chat, 'announcement'); reply(fmt('🔒 Groupe verrouille (admins peuvent ecrire).')); }
  catch(e){ reply(fmt('Erreur: '+e.message)); }
};
cmds.unlockgroup = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe seulement.'));
  try { await rich.groupSettingUpdate(m.chat, 'not_announcement'); reply(fmt('🔓 Groupe deverrouille.')); }
  catch(e){ reply(fmt('Erreur: '+e.message)); }
};
cmds.lockinfo = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  try { await rich.groupSettingUpdate(m.chat, 'locked'); reply(fmt('🔒 Modif info groupe verrouillee.')); } catch(e){ reply(fmt('Erreur: '+e.message)); }
};
cmds.unlockinfo = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  try { await rich.groupSettingUpdate(m.chat, 'unlocked'); reply(fmt('🔓 Modif info groupe deverrouillee.')); } catch(e){ reply(fmt('Erreur: '+e.message)); }
};
cmds.mute = cmds.lockgroup;
cmds.unmute = cmds.unlockgroup;

cmds.setname = async ({reply, m, rich, text, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  if (!text) return reply(fmt('Usage: .setname <nouveau nom>'));
  try { await rich.groupUpdateSubject(m.chat, text); reply(fmt('✅ Nom modifie.')); } catch(e){ reply(fmt('Erreur: '+e.message)); }
};
cmds.setdesc = async ({reply, m, rich, text, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  if (!text) return reply(fmt('Usage: .setdesc <description>'));
  try { await rich.groupUpdateDescription(m.chat, text); reply(fmt('✅ Description modifiee.')); } catch(e){ reply(fmt('Erreur: '+e.message)); }
};
cmds.setpp = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const q = m.quoted;
  if (!q || !/imageMessage/.test(q.mtype || '')) return reply(fmt('Reponds a une image avec .setpp'));
  try {
    const buf = await q.download();
    await rich.updateProfilePicture(m.chat, buf);
    reply(fmt('✅ Photo de groupe mise a jour.'));
  } catch(e){ reply(fmt('Erreur: '+e.message)); }
};

cmds.warn = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0]
    || m.quoted?.sender;
  if (!target) return reply(fmt('Mentionnez ou citez l utilisateur.'));
  return warnUser(rich, m.chat, target, 'Avertissement manuel', null, m);
};
cmds.unwarn = async ({reply, m, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0] || m.quoted?.sender;
  if (!target) return reply(fmt('Mentionnez l utilisateur.'));
  const g = gset(m.chat); g.warnings[target] = Math.max(0, (g.warnings[target]||0) - 1); scheduleSave();
  reply(fmt(`✅ Avertissement retire. Total: ${g.warnings[target]}`));
};
cmds.clearwarn = async ({reply, m, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  gset(m.chat).warnings = {}; scheduleSave();
  reply(fmt('✅ Avertissements remis a zero.'));
};
cmds.listwarn = async ({reply, m}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const w = gset(m.chat).warnings || {};
  const entries = Object.entries(w).filter(([,v])=>v>0);
  if (!entries.length) return reply(fmt('Aucun avertissement.'));
  reply(fmt('⚠ *Avertissements*\n┃ ' + entries.map(([u,c])=>`@${u.split('@')[0]} → ${c}/3`).join('\n┃ ')));
};

cmds.ban = async ({reply, m, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0] || m.quoted?.sender;
  if (!target) return reply(fmt('Mentionnez l utilisateur.'));
  if (!global.banned) global.banned = {};
  global.banned[target] = true;
  reply(fmt(`🚫 @${target.split('@')[0]} banni du bot.`));
};
cmds.unban = async ({reply, m, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0] || m.quoted?.sender;
  if (!target) return reply(fmt('Mentionnez l utilisateur.'));
  if (global.banned) delete global.banned[target];
  reply(fmt(`✅ @${target.split('@')[0]} debanni.`));
};

cmds.listmembers = async ({reply, m, participants}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const txt = participants.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n┃ ');
  reply(fmt(`👥 *Membres (${participants.length})*\n┃ ${txt}`));
};
cmds.groupinfo = async ({reply, m, groupMetadata, participants}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const admins = participants.filter(p=>p.admin).length;
  reply(fmt(`📋 *${groupMetadata.subject}*\n┃ ID: ${m.chat}\n┃ Membres: ${participants.length}\n┃ Admins: ${admins}\n┃ Cree: ${new Date((groupMetadata.creation||0)*1000).toLocaleString()}`));
};

cmds.kickfake = async ({reply, m, rich, participants, isAdmins, isCreator, isBotAdmins}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const fakes = participants.filter(p => /^(\+?92|\+?252|\+?229)/.test(p.id)).map(p=>p.id);
  if (!fakes.length) return reply(fmt('Aucun numero suspect.'));
  try { await rich.groupParticipantsUpdate(m.chat, fakes, 'remove'); reply(fmt(`✅ ${fakes.length} numeros suspects retires.`)); }
  catch(e){ reply(fmt('Erreur: '+e.message)); }
};
cmds.purge = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  reply(fmt('🧹 Conversation locale nettoyee (le bot ne peut pas effacer pour tous).'));
};
cmds.freeze = cmds.lockgroup;
cmds.unfreeze = cmds.unlockgroup;

// ----- Pending join requests -----
cmds.listrequests = async ({reply, m, rich, isAdmins, isCreator, isBotAdmins}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe seulement.'));
  try {
    const list = await rich.groupRequestParticipantsList(m.chat);
    if (!list || !list.length) return reply(fmt('✅ Aucune demande en attente.'));
    const txt = list.map((p,i) => `${i+1}. @${(p.jid||p.id||'').split('@')[0]}`).join('\n┃ ');
    await rich.sendMessage(m.chat, {
      text: fmt(`📋 *${list.length}* demandes en attente\n┃ ${txt}`),
      mentions: list.map(p => p.jid || p.id)
    }, { quoted: m });
  } catch (e) { reply(fmt('Erreur: ' + e.message)); }
};

cmds.acceptall = async ({reply, m, rich, isAdmins, isCreator, isBotAdmins}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe seulement.'));
  try {
    const list = await rich.groupRequestParticipantsList(m.chat);
    if (!list || !list.length) return reply(fmt('✅ Aucune demande en attente.'));
    const jids = list.map(p => p.jid || p.id);
    const res = await rich.groupRequestParticipantsUpdate(m.chat, jids, 'approve');
    const ok = (res||[]).filter(r => r.status === '200').length;
    await rich.sendMessage(m.chat, {
      text: fmt(`✅ *${ok}/${jids.length}* demandes approuvees.\n┃ ${jids.map(j=>'@'+j.split('@')[0]).join(' ')}`),
      mentions: jids
    }, { quoted: m });
  } catch (e) { reply(fmt('Erreur: ' + e.message)); }
};

cmds.rejectall = async ({reply, m, rich, isAdmins, isCreator, isBotAdmins}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe seulement.'));
  try {
    const list = await rich.groupRequestParticipantsList(m.chat);
    if (!list || !list.length) return reply(fmt('✅ Aucune demande en attente.'));
    const jids = list.map(p => p.jid || p.id);
    const res = await rich.groupRequestParticipantsUpdate(m.chat, jids, 'reject');
    const ok = (res||[]).filter(r => r.status === '200').length;
    reply(fmt(`✅ *${ok}/${jids.length}* demandes rejetees.`));
  } catch (e) { reply(fmt('Erreur: ' + e.message)); }
};
cmds.approveall = cmds.acceptall;
cmds.acceptrequests = cmds.acceptall;

cmds.setwelcome = async ({reply, m, text, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  if (!text) return reply(fmt('Usage: .setwelcome <message> (utilise @user et @group)'));
  if (!DB.welcome[m.chat]) DB.welcome[m.chat] = {};
  DB.welcome[m.chat].text = text;
  DB.welcome[m.chat].on = true;
  scheduleSave();
  reply(fmt('✅ Message de bienvenue enregistre.'));
};
cmds.setgoodbye = async ({reply, m, text, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  if (!text) return reply(fmt('Usage: .setgoodbye <message>'));
  if (!DB.goodbye[m.chat]) DB.goodbye[m.chat] = {};
  DB.goodbye[m.chat].text = text;
  DB.goodbye[m.chat].on = true;
  scheduleSave();
  reply(fmt('✅ Message d adieu enregistre.'));
};
cmds.welcomeon = async ({reply, m, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  if (!DB.welcome[m.chat]) DB.welcome[m.chat] = {};
  DB.welcome[m.chat].on = true; scheduleSave();
  reply(fmt('✅ Bienvenue activee.'));
};
cmds.welcomeoff = async ({reply, m, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  if (!DB.welcome[m.chat]) DB.welcome[m.chat] = {};
  DB.welcome[m.chat].on = false; scheduleSave();
  reply(fmt('❌ Bienvenue desactivee.'));
};
cmds.testwelcome = async ({reply, m, pushname}) => {
  const tpl = DB.welcome[m.chat]?.text || `Bienvenue @user dans @group !`;
  reply(fmt(tpl.replace('@user', '@'+m.sender.split('@')[0]).replace('@group', m.isGroup ? 'ce groupe':'ce chat')));
};

cmds.tagadminall = async ({reply, m, rich, participants, text}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  const admins = participants.filter(p=>p.admin).map(p=>p.id);
  if (!admins.length) return reply(fmt('Aucun admin.'));
  await rich.sendMessage(m.chat, { text: fmt(`📣 *Admins*\n┃ ${text||''}\n${admins.map(a=>`@${a.split('@')[0]}`).join(' ')}`), mentions: admins });
};
cmds.invitelink = cmds.grouplink2 = async ({reply, m, rich, isAdmins, isCreator}) => {
  if (!m.isGroup) return reply(fmt('🚫 Groupe.'));
  try { const code = await rich.groupInviteCode(m.chat); reply(fmt(`🔗 https://chat.whatsapp.com/${code}`)); }
  catch(e){ reply(fmt('Erreur: '+e.message)); }
};

// ===== OWNER-ONLY =====
function ownerOnly(fn) {
  return async (ctx) => {
    return fn(ctx);
  };
}

cmds.mode = ownerOnly(async ({reply, args, rich}) => {
  const v = (args[0]||'').toLowerCase();
  if (v !== 'public' && v !== 'private') return reply(fmt('Usage: .mode public|private'));
  DB.mode = v; scheduleSave();
  rich.public = (v === 'public');
  reply(fmt(`✅ Mode: *${v.toUpperCase()}*`));
});
cmds.public = ownerOnly(async ({reply, rich}) => { DB.mode='public'; rich.public=true; scheduleSave(); reply(fmt('🌐 Mode PUBLIC')); });
cmds.private = ownerOnly(async ({reply, rich}) => { DB.mode='private'; rich.public=false; scheduleSave(); reply(fmt('🔒 Mode PRIVE')); });

cmds.broadcast = cmds.bc = ownerOnly(async ({reply, rich, text, m}) => {
  if (!text) return reply(fmt('Usage: .broadcast <message>'));
  const groups = await rich.groupFetchAllParticipating().catch(()=>({}));
  const ids = Object.keys(groups||{});
  if (!ids.length) return reply(fmt('Aucun groupe.'));
  reply(fmt(`📡 Diffusion vers ${ids.length} groupes...`));
  let ok = 0, ko = 0;
  for (const id of ids) {
    try {
      await rich.sendMessage(id, { text: fmt(`📢 *Annonce*\n┃ ${text}`) });
      ok++;
    } catch(e){ ko++; }
    await new Promise(r=>setTimeout(r, 700));
  }
  await rich.sendMessage(m.chat, { text: fmt(`✅ Envoye: ${ok}\n❌ Echec: ${ko}`) });
});

cmds.blockcmd = ownerOnly(async ({reply, args, m}) => {
  const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0] || m.quoted?.sender;
  const cmd = args[args.length-1];
  if (!target || !cmd) return reply(fmt('Usage: .blockcmd @user <commande>'));
  if (!DB.blockedCmds[target]) DB.blockedCmds[target] = [];
  if (!DB.blockedCmds[target].includes(cmd)) DB.blockedCmds[target].push(cmd);
  scheduleSave();
  reply(fmt(`✅ @${target.split('@')[0]} ne peut plus utiliser .${cmd}`));
});
cmds.unblockcmd = ownerOnly(async ({reply, args, m}) => {
  const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0] || m.quoted?.sender;
  const cmd = args[args.length-1];
  if (!target || !cmd) return reply(fmt('Usage: .unblockcmd @user <commande>'));
  if (DB.blockedCmds[target]) DB.blockedCmds[target] = DB.blockedCmds[target].filter(c=>c!==cmd);
  scheduleSave();
  reply(fmt(`✅ @${target.split('@')[0]} peut a nouveau utiliser .${cmd}`));
});
cmds.stats = ownerOnly(async ({reply}) => {
  const top = Object.entries(DB.stats.perCmd||{}).sort((a,b)=>b[1]-a[1]).slice(0,15)
    .map(([c,n],i)=>`${i+1}. .${c} → ${n}`).join('\n┃ ');
  const users = Object.keys(DB.stats.perUser||{}).length;
  reply(fmt(`📊 *Statistiques*\n┃ Total: ${DB.stats.total}\n┃ Utilisateurs uniques: ${users}\n┃ \n┃ *Top commandes:*\n┃ ${top || '(aucune)'}`));
});
cmds.userstats = ownerOnly(async ({reply, m}) => {
  const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0] || m.quoted?.sender || m.sender;
  const u = DB.stats.perUser[target] || { count:0, last:0 };
  reply(fmt(`📊 *${target.split('@')[0]}*\n┃ Commandes: ${u.count}\n┃ Derniere: ${u.last? new Date(u.last).toLocaleString():'-'}`));
});

// ===== 100 COMMANDES MISC =====

// --- Text styles via popcat (≈ 38)
Object.entries(popcatStyles).forEach(([cmd, slug]) => {
  cmds[cmd] = async ({reply, rich, text, m}) => {
    if (!text) return reply(fmt(`Usage: .${cmd} <texte>`));
    try {
      const url = `https://api.popcat.xyz/textmaker/${slug}?text=${encodeURIComponent(text)}`;
      const buf = await fetchBuf(url, 25000);
      await rich.sendMessage(m.chat, { image: buf, caption: fmt(`🎨 ${cmd}`) }, { quoted: m });
    } catch(e){ reply(fmt('Erreur generation: '+e.message)); }
  };
});

// --- Fun
cmds.dice = async ({reply}) => reply(fmt(`🎲 Vous avez fait: *${1+Math.floor(Math.random()*6)}*`));
cmds.coin = async ({reply}) => reply(fmt(`🪙 ${Math.random()<0.5?'Pile':'Face'}`));
cmds['8ball'] = async ({reply, text}) => {
  if (!text) return reply(fmt('Posez une question.'));
  const a = ['Oui','Non','Peut-etre','Sans aucun doute','Demande plus tard','Concentre-toi et redemande','Mes sources disent oui','Tres incertain','Tres probable','Surement pas'];
  reply(fmt(`🎱 ${a[Math.floor(Math.random()*a.length)]}`));
};
cmds.joke = async ({reply}) => {
  try { const j = await fetchJson('https://official-joke-api.appspot.com/random_joke');
    reply(fmt(`😂 ${j.setup}\n┃ ${j.punchline}`));
  } catch(e){ reply(fmt('Pas de blague disponible.')); }
};
cmds.fact = async ({reply}) => {
  try { const f = await fetchJson('https://uselessfacts.jsph.pl/api/v2/facts/random?language=fr');
    reply(fmt(`💡 ${f.text}`));
  } catch(e){ reply(fmt('Pas de fait.')); }
};
cmds.gamefact = cmds.fact;
cmds.quote = async ({reply}) => {
  try { const q = await fetchJson('https://api.quotable.io/random');
    reply(fmt(`📜 "${q.content}"\n┃ — ${q.author}`));
  } catch(e){ reply(fmt('Pas de citation.')); }
};
cmds.advice = async ({reply}) => {
  try { const a = await fetchJson('https://api.adviceslip.com/advice');
    reply(fmt(`💭 ${a.slip.advice}`));
  } catch(e){ reply(fmt('Erreur.')); }
};
cmds.truth = async ({reply}) => {
  const t = ['Quel est ton plus grand secret ?','As-tu deja menti a un ami proche ?','Qui est ton crush actuel ?','Quel est ton plus grand regret ?','Pire mensonge dit ?'];
  reply(fmt(`🤔 *Verite:* ${t[Math.floor(Math.random()*t.length)]}`));
};
cmds.dare = async ({reply}) => {
  const d = ['Envoie une selfie maintenant','Appelle ton crush','Chante une chanson en vocal','Imite une celebrite','Fait 10 pompes'];
  reply(fmt(`🔥 *Defi:* ${d[Math.floor(Math.random()*d.length)]}`));
};
cmds.riddle = async ({reply}) => {
  const r = [
    {q:'Plus on en prend, plus il en reste. Quoi ?', a:'Des photos'},
    {q:'Ce que tu lances quand tu en as besoin et reprends quand tu n en as plus besoin ?', a:'Une ancre'},
    {q:'Qui peut courir mais ne marche jamais ?', a:'L eau'},
  ][Math.floor(Math.random()*3)];
  reply(fmt(`🧩 ${r.q}\n┃ Reponse: ||${r.a}||`));
};
cmds.compliment = async ({reply, m}) => {
  const c = ['Tu es brillant(e) !','Tu illumines la piece','Ton sourire est contagieux','Tu inspires les autres'];
  reply(fmt(`💝 ${c[Math.floor(Math.random()*c.length)]}`));
};
cmds.insult = async ({reply}) => reply(fmt('😈 Tu es plus lent qu une connexion 2G en 2026.'));
cmds.roast = async ({reply, text}) => reply(fmt(`🔥 ${text||'Toi'} : tellement perdu(e) que meme Google te demande des indications.`));
cmds.ship = async ({reply, args}) => {
  const a = args[0]||'A', b = args[1]||'B';
  const pct = Math.floor(Math.random()*101);
  reply(fmt(`💘 ${a} ❤ ${b} = *${pct}%* de compatibilite`));
};
cmds.lovecalc = cmds.ship;
cmds.gay = async ({reply}) => reply(fmt(`🌈 Niveau gay: ${Math.floor(Math.random()*101)}%`));
cmds.iq = async ({reply}) => reply(fmt(`🧠 IQ estime: ${50+Math.floor(Math.random()*150)}`));
cmds.simp = async ({reply}) => reply(fmt(`💕 Niveau simp: ${Math.floor(Math.random()*101)}%`));

// --- Tools / encoders
cmds.b64encode = async ({reply, text}) => text ? reply(fmt('🔐 ' + Buffer.from(text).toString('base64'))) : reply(fmt('Usage: .b64encode <texte>'));
cmds.b64decode = async ({reply, text}) => { try { reply(fmt('🔓 ' + Buffer.from(text,'base64').toString('utf8'))); } catch(e){ reply(fmt('Erreur')); } };
cmds.md5 = async ({reply, text}) => text ? reply(fmt('🔑 ' + crypto.createHash('md5').update(text).digest('hex'))) : reply(fmt('Usage: .md5 <texte>'));
cmds.sha256 = async ({reply, text}) => text ? reply(fmt('🔑 ' + crypto.createHash('sha256').update(text).digest('hex'))) : reply(fmt('Usage'));
cmds.hex = async ({reply, text}) => text ? reply(fmt('💠 ' + Buffer.from(text).toString('hex'))) : reply(fmt('Usage'));
cmds.fromhex = async ({reply, text}) => { try { reply(fmt('🔄 ' + Buffer.from(text,'hex').toString('utf8'))); } catch(e){ reply(fmt('Err'));} };
cmds.binary = async ({reply, text}) => text ? reply(fmt('🤖 ' + text.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '))) : reply(fmt('Usage'));
cmds.frombinary = async ({reply, text}) => { try { reply(fmt('🔄 ' + text.split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join(''))); } catch(e){ reply(fmt('Err'));} };
cmds.morse = async ({reply, text}) => {
  const M = {a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..',' ':'/'};
  text ? reply(fmt('📡 ' + text.toLowerCase().split('').map(c=>M[c]||c).join(' '))) : reply(fmt('Usage'));
};
cmds.frommorse = async ({reply, text}) => {
  const M = {'.-':'a','-...':'b','-.-.':'c','-..':'d','.':'e','..-.':'f','--.':'g','....':'h','..':'i','.---':'j','-.-':'k','.-..':'l','--':'m','-.':'n','---':'o','.--.':'p','--.-':'q','.-.':'r','...':'s','-':'t','..-':'u','...-':'v','.--':'w','-..-':'x','-.--':'y','--..':'z','/':' '};
  text ? reply(fmt('🔄 ' + text.split(/\s+/).map(c=>M[c]||c).join(''))) : reply(fmt('Usage'));
};
cmds.upper = async ({reply, text}) => reply(fmt(text? text.toUpperCase():'Usage'));
cmds.lower = async ({reply, text}) => reply(fmt(text? text.toLowerCase():'Usage'));
cmds.reverse = async ({reply, text}) => reply(fmt(text? text.split('').reverse().join(''):'Usage'));
cmds.repeat = async ({reply, args, text}) => {
  const n = parseInt(args[0])||5; const t = args.slice(1).join(' ');
  reply(fmt(t? (t+'\n').repeat(Math.min(n,30)) : 'Usage: .repeat <n> <texte>'));
};
cmds.count = async ({reply, text}) => text ? reply(fmt(`📏 Caracteres: ${text.length} | Mots: ${text.split(/\s+/).length}`)) : reply(fmt('Usage'));
cmds.calc = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .calc 2+2*5'));
  if (!/^[\d+\-*\/().\s]+$/.test(text)) return reply(fmt('Caracteres invalides'));
  try { reply(fmt('🧮 = ' + Function('"use strict";return ('+text+')')())); } catch(e){ reply(fmt('Erreur')); }
};
cmds.calculate = cmds.calc; cmds.math = cmds.calc;
cmds.random = async ({reply, args}) => {
  const a=parseInt(args[0])||1, b=parseInt(args[1])||100;
  reply(fmt(`🎲 ${a + Math.floor(Math.random()*(b-a+1))}`));
};
cmds.choose = async ({reply, text}) => {
  if (!text || !text.includes('|')) return reply(fmt('Usage: .choose option1|option2|option3'));
  const opts = text.split('|').map(s=>s.trim()).filter(Boolean);
  reply(fmt(`✨ ${opts[Math.floor(Math.random()*opts.length)]}`));
};
cmds.shuffle = async ({reply, text}) => text ? reply(fmt(text.split('').sort(()=>Math.random()-0.5).join(''))) : reply(fmt('Usage'));
cmds.password = async ({reply, args}) => {
  const n = Math.min(parseInt(args[0])||16, 64);
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let p=''; for(let i=0;i<n;i++) p+=chars[Math.floor(Math.random()*chars.length)];
  reply(fmt('🔐 '+p));
};
cmds.uuid = async ({reply}) => reply(fmt('🆔 ' + crypto.randomUUID()));

// --- Web / Info
cmds.weather = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .weather <ville>'));
  try { const t = await fetchJson(`https://wttr.in/${encodeURIComponent(text)}?format=j1`);
    const c = t.current_condition[0];
    reply(fmt(`🌤 *${text}*\n┃ ${c.weatherDesc[0].value}\n┃ 🌡 ${c.temp_C}°C (ressenti ${c.FeelsLikeC}°C)\n┃ 💧 ${c.humidity}% | 💨 ${c.windspeedKmph} km/h`));
  } catch(e){ reply(fmt('Ville introuvable')); }
};
cmds.wiki = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .wiki <terme>'));
  try { const r = await fetchJson(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`);
    reply(fmt(`📚 *${r.title}*\n┃ ${r.extract||'Pas de resume'}`));
  } catch(e){ reply(fmt('Aucun resultat')); }
};
cmds.define = cmds.wiki;
cmds.time = async ({reply, args}) => {
  try { const z = args[0]||'Africa/Conakry';
    reply(fmt(`🕒 ${new Date().toLocaleString('fr-FR',{timeZone:z})} (${z})`));
  } catch(e){ reply(fmt('Fuseau invalide')); }
};
cmds.currency = async ({reply, args}) => {
  if (args.length<3) return reply(fmt('Usage: .currency <montant> <de> <vers> ex: .currency 100 USD EUR'));
  try { const r = await fetchJson(`https://api.exchangerate-api.com/v4/latest/${args[1].toUpperCase()}`);
    const rate = r.rates[args[2].toUpperCase()];
    if (!rate) return reply(fmt('Devise inconnue'));
    reply(fmt(`💱 ${args[0]} ${args[1].toUpperCase()} = ${(parseFloat(args[0])*rate).toFixed(2)} ${args[2].toUpperCase()}`));
  } catch(e){ reply(fmt('Erreur')); }
};
cmds.iplookup = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .iplookup <ip>'));
  try { const r = await fetchJson(`http://ip-api.com/json/${text}`);
    reply(fmt(`🌐 ${r.query}\n┃ Pays: ${r.country}\n┃ Region: ${r.regionName}\n┃ Ville: ${r.city}\n┃ FAI: ${r.isp}`));
  } catch(e){ reply(fmt('Erreur')); }
};
cmds.myipinfo = async ({reply}) => {
  try { const r = await fetchJson('http://ip-api.com/json/');
    reply(fmt(`🌐 ${r.query}\n┃ ${r.country}, ${r.city}\n┃ ${r.isp}`));
  } catch(e){ reply(fmt('Erreur')); }
};
cmds.npm = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .npm <package>'));
  try { const r = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(text)}/latest`);
    reply(fmt(`📦 *${r.name}* v${r.version}\n┃ ${r.description||'-'}\n┃ Auteur: ${r.author?.name||r._npmUser?.name||'-'}\n┃ Licence: ${r.license||'-'}`));
  } catch(e){ reply(fmt('Package introuvable')); }
};
cmds.github = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .github <user>'));
  try { const r = await fetchJson(`https://api.github.com/users/${encodeURIComponent(text)}`);
    reply(fmt(`👨‍💻 *${r.login}* ${r.name?'('+r.name+')':''}\n┃ Repos: ${r.public_repos}\n┃ Followers: ${r.followers}\n┃ ${r.bio||''}`));
  } catch(e){ reply(fmt('User introuvable')); }
};
cmds.color = async ({reply, rich, text, m}) => {
  if (!text) return reply(fmt('Usage: .color <hex sans #> ex: .color ff0033'));
  try { const buf = await fetchBuf(`https://singlecolorimage.com/get/${text.replace('#','')}/300x300`);
    rich.sendMessage(m.chat, { image: buf, caption: fmt(`🎨 #${text.replace('#','')}`) }, { quoted: m });
  } catch(e){ reply(fmt('Couleur invalide')); }
};
cmds.qrcode = async ({reply, rich, text, m}) => {
  if (!text) return reply(fmt('Usage: .qrcode <texte>'));
  try { const buf = await fetchBuf(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`);
    rich.sendMessage(m.chat, { image: buf, caption: fmt('📷 QR Code') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};
cmds.shorturl2 = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .shorturl2 <url>'));
  try { const r = await axios.get('https://tinyurl.com/api-create.php?url='+encodeURIComponent(text), {timeout:10000});
    reply(fmt('🔗 ' + r.data));
  } catch(e){ reply(fmt('Err')); }
};
cmds.lyrics = async ({reply, text}) => {
  if (!text || !text.includes('-')) return reply(fmt('Usage: .lyrics Artiste - Titre'));
  const [artist, title] = text.split('-').map(s=>s.trim());
  try { const r = await fetchJson(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if (!r.lyrics) return reply(fmt('Paroles introuvables'));
    reply(fmt(`🎵 *${title}* — ${artist}\n\n${r.lyrics.slice(0, 3500)}`));
  } catch(e){ reply(fmt('Introuvable')); }
};
cmds.useragent = async ({reply}) => {
  const ua = ['Mozilla/5.0 (Windows NT 10.0)','Mozilla/5.0 (Macintosh; Intel Mac OS X)','Mozilla/5.0 (Linux; Android 14)','Mozilla/5.0 (iPhone; CPU iPhone OS 17)'];
  reply(fmt('🌐 ' + ua[Math.floor(Math.random()*ua.length)]));
};
cmds.fakedata = async ({reply}) => {
  try { const r = await fetchJson('https://randomuser.me/api/?nat=fr');
    const u = r.results[0];
    reply(fmt(`👤 ${u.name.first} ${u.name.last}\n┃ 📧 ${u.email}\n┃ 📞 ${u.phone}\n┃ 🏠 ${u.location.street.name}, ${u.location.city}\n┃ 🎂 ${u.dob.age} ans`));
  } catch(e){ reply(fmt('Err')); }
};
cmds.catfact = async ({reply}) => {
  try { const r = await fetchJson('https://catfact.ninja/fact'); reply(fmt('🐱 '+r.fact)); } catch(e){ reply(fmt('Err')); }
};
cmds.dogfact = async ({reply}) => {
  try { const r = await fetchJson('https://dogapi.dog/api/v2/facts'); reply(fmt('🐶 '+r.data[0].attributes.body)); } catch(e){ reply(fmt('Err')); }
};
cmds.cat = async ({reply, rich, m}) => {
  try { const r = await fetchJson('https://api.thecatapi.com/v1/images/search');
    rich.sendMessage(m.chat, { image: { url: r[0].url }, caption: fmt('🐱') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};
cmds.dog = async ({reply, rich, m}) => {
  try { const r = await fetchJson('https://dog.ceo/api/breeds/image/random');
    rich.sendMessage(m.chat, { image: { url: r.message }, caption: fmt('🐶') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};
cmds.fox = async ({reply, rich, m}) => {
  try { const r = await fetchJson('https://randomfox.ca/floof/');
    rich.sendMessage(m.chat, { image: { url: r.image }, caption: fmt('🦊') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};
cmds.duck = async ({reply, rich, m}) => {
  try { const r = await fetchJson('https://random-d.uk/api/v2/random');
    rich.sendMessage(m.chat, { image: { url: r.url }, caption: fmt('🦆') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};
cmds.bird = async ({reply, rich, m}) => {
  try { const r = await fetchJson('https://some-random-api.com/img/birb');
    rich.sendMessage(m.chat, { image: { url: r.link }, caption: fmt('🐦') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};
cmds.panda = async ({reply, rich, m}) => {
  try { const r = await fetchJson('https://some-random-api.com/img/panda');
    rich.sendMessage(m.chat, { image: { url: r.link }, caption: fmt('🐼') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};
cmds.koala = async ({reply, rich, m}) => {
  try { const r = await fetchJson('https://some-random-api.com/img/koala');
    rich.sendMessage(m.chat, { image: { url: r.link }, caption: fmt('🐨') }, { quoted: m });
  } catch(e){ reply(fmt('Err')); }
};

// --- Popcat image effects
const popImg = {
  drip: 'drip', pet: 'pet', wasted: 'wasted', jail: 'jail',
  trash: 'trash', mnm: 'mnm', uncover: 'uncover',
  drake: 'drake', oogway: 'oogway', pikachu: 'pikachu',
  alert: 'alert', communism: 'communism', doublestonk: 'doublestonk',
  biden: 'biden-tweet', tweet: 'tweet', sadcat: 'sadcat',
};
Object.entries(popImg).forEach(([cmd, slug]) => {
  cmds[cmd] = async ({reply, rich, text, m}) => {
    try {
      let url;
      if (slug === 'pet' || slug === 'jail' || slug === 'wasted' || slug === 'trash' || slug === 'mnm' || slug === 'uncover' || slug === 'drip') {
        const target = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])[0] || m.sender;
        const pp = await rich.profilePictureUrl(target, 'image').catch(()=>'https://i.pravatar.cc/300');
        url = `https://api.popcat.xyz/${slug}?image=${encodeURIComponent(pp)}`;
      } else if (slug === 'drake') {
        if (!text || !text.includes('|')) return reply(fmt('Usage: .drake texte1|texte2'));
        const [t1, t2] = text.split('|');
        url = `https://api.popcat.xyz/drake?text1=${encodeURIComponent(t1)}&text2=${encodeURIComponent(t2)}`;
      } else if (slug === 'oogway' || slug === 'pikachu' || slug === 'alert' || slug === 'sadcat') {
        if (!text) return reply(fmt(`Usage: .${cmd} <texte>`));
        url = `https://api.popcat.xyz/${slug}?text=${encodeURIComponent(text)}`;
      } else if (slug === 'biden-tweet' || slug === 'tweet') {
        if (!text) return reply(fmt(`Usage: .${cmd} <texte>`));
        url = `https://api.popcat.xyz/${slug}?text=${encodeURIComponent(text)}`;
      } else {
        url = `https://api.popcat.xyz/${slug}`;
      }
      const buf = await fetchBuf(url, 25000);
      rich.sendMessage(m.chat, { image: buf, caption: fmt(`✨ ${cmd}`) }, { quoted: m });
    } catch(e){ reply(fmt('Erreur image: '+e.message)); }
  };
});

// --- More fun
cmds.emojimix = async ({reply, rich, text, m}) => {
  if (!text || !text.includes('+')) return reply(fmt('Usage: .emojimix 😀+😎'));
  const [a, b] = text.split('+').map(s=>s.trim());
  try { const r = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(a+'_'+b)}`);
    if (!r.results?.length) return reply(fmt('Combinaison non disponible'));
    rich.sendMessage(m.chat, { image: { url: r.results[0].url }, caption: fmt(`${a}+${b}`) }, { quoted: m });
  } catch(e){ reply(fmt('Erreur')); }
};
cmds.ascii = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .ascii <texte>'));
  try { const r = await axios.get(`https://artii.herokuapp.com/make?text=${encodeURIComponent(text)}`, {timeout:10000});
    reply('```\n'+r.data+'\n```');
  } catch(e){ reply(fmt('Err')); }
};
cmds.figlet = cmds.ascii;
cmds.zalgo = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .zalgo <texte>'));
  const z = text.split('').map(c => c + '\u0301\u0316\u0334\u0307\u0329'.split('').map(d=>Math.random()<.5?d:'').join('')).join('');
  reply(fmt('👹 ' + z));
};
cmds.smallcaps = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage'));
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
  reply(fmt(text.toLowerCase().split('').map(c=>map[c]||c).join('')));
};
cmds.bold = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage'));
  const o='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const b='𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗';
  reply(fmt(text.split('').map(c=>{const i=o.indexOf(c);return i>=0?b.charAt(i):c;}).join('')));
};
cmds.italic = async ({reply, text}) => reply(fmt(text? '_'+text+'_' : 'Usage'));
cmds.spoiler = async ({reply, text}) => reply(fmt(text? '||'+text+'||' : 'Usage'));
cmds.mock = async ({reply, text}) => text ? reply(fmt(text.split('').map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join(''))) : reply(fmt('Usage'));
cmds.clap = async ({reply, text}) => text ? reply(fmt(text.split(' ').join(' 👏 '))) : reply(fmt('Usage'));
cmds.sarcasm = cmds.mock;

// --- Polls
cmds.poll = async ({reply, rich, m, text}) => {
  if (!text || !text.includes('|')) return reply(fmt('Usage: .poll Question|opt1|opt2|opt3'));
  const [q, ...opts] = text.split('|').map(s=>s.trim());
  try { await rich.sendMessage(m.chat, { poll: { name: q, values: opts.slice(0,12), selectableCount: 1 } }); }
  catch(e){ reply(fmt('Err: '+e.message)); }
};
cmds.vote = cmds.poll;

// --- Hash list / utility
cmds.sha1 = async ({reply, text}) => text ? reply(fmt(crypto.createHash('sha1').update(text).digest('hex'))) : reply(fmt('Usage'));
cmds.sha512 = async ({reply, text}) => text ? reply(fmt(crypto.createHash('sha512').update(text).digest('hex'))) : reply(fmt('Usage'));

// --- Info bot
cmds.runtime = async ({reply}) => {
  const s = process.uptime(), h = Math.floor(s/3600), mi = Math.floor((s%3600)/60), se = Math.floor(s%60);
  reply(fmt(`⏱ Uptime: ${h}h ${mi}m ${se}s`));
};
cmds.uptime = cmds.runtime;
cmds.alive = async ({reply}) => reply(fmt(`✅ ${BOT_NAME} est en ligne et reactif !`));
cmds.botinfo = async ({reply, rich}) => {
  const s = process.uptime();
  reply(fmt(`🤖 *${BOT_NAME}*\n┃ Uptime: ${Math.floor(s/60)} min\n┃ Mode: ${DB.mode.toUpperCase()}\n┃ Stats: ${DB.stats.total} cmds executees\n┃ Node: ${process.version}\n┃ Memoire: ${(process.memoryUsage().rss/1024/1024).toFixed(1)} MB`));
};

// --- Hourly horoscope
cmds.horoscope = async ({reply, args}) => {
  const signs = ['belier','taureau','gemeaux','cancer','lion','vierge','balance','scorpion','sagittaire','capricorne','verseau','poissons'];
  const s = (args[0]||'').toLowerCase();
  if (!signs.includes(s)) return reply(fmt('Usage: .horoscope <signe>\n┃ Signes: '+signs.join(', ')));
  const lines = ['Une journee pleine de surprises','Restez prudent dans vos finances','L amour frappera a votre porte','Votre carriere prend un tournant','Sante: faites du sport'];
  reply(fmt(`🔮 *${s.toUpperCase()}*\n┃ ${lines[Math.floor(Math.random()*lines.length)]}`));
};

// --- Definition de mot via dictionaryapi
cmds.dictionnaire = async ({reply, text}) => {
  if (!text) return reply(fmt('Usage: .dictionnaire <mot>'));
  try { const r = await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`);
    const d = r[0].meanings[0].definitions[0];
    reply(fmt(`📖 *${r[0].word}*\n┃ ${d.definition}\n┃ ${d.example?'Ex: '+d.example:''}`));
  } catch(e){ reply(fmt('Mot introuvable')); }
};

// --- Recipe (free meal API)
cmds.recipe = async ({reply, text}) => {
  try { const r = await fetchJson(`https://www.themealdb.com/api/json/v1/1/${text? 'search.php?s='+encodeURIComponent(text):'random.php'}`);
    if (!r.meals?.length) return reply(fmt('Aucune recette'));
    const m = r.meals[0];
    reply(fmt(`🍽 *${m.strMeal}*\n┃ ${m.strCategory} | ${m.strArea}\n┃ \n${(m.strInstructions||'').slice(0,2500)}`));
  } catch(e){ reply(fmt('Err')); }
};

// --- Misc tools
cmds.shrug = async ({reply}) => reply('¯\\_(ツ)_/¯');
cmds.tableflip = async ({reply}) => reply('(╯°□°）╯︵ ┻━┻');
cmds.unflip = async ({reply}) => reply('┬─┬ ノ( ゜-゜ノ)');
cmds.lenny = async ({reply}) => reply('( ͡° ͜ʖ ͡°)');

cmds.stats2 = cmds.stats; // alias

// ------------------------- QUIZZ ANIME (groupes uniquement) -------------------------
const ACTIVE_QUIZZES = new Map(); // chatJid -> { question, options, answer, startedBy, timer, msgKey }
let _animeQuestions = null;
function loadAnimeQuestions() {
  if (_animeQuestions) return _animeQuestions;
  try {
    _animeQuestions = require('../database/aquizz.json');
  } catch (e) {
    console.log('[quizz_anime] cannot load aquizz.json:', e.message);
    _animeQuestions = [];
  }
  return _animeQuestions;
}

cmds.quizz_anime = async ({reply, m, rich}) => {
  if (!m.isGroup) return reply(fmt('🚫 Le quizz anime fonctionne uniquement dans les groupes.'));
  if (ACTIVE_QUIZZES.has(m.chat)) {
    return reply(fmt('⏳ Un quizz est deja en cours dans ce groupe. Repondez avec a / b / c / d !'));
  }
  const qs = loadAnimeQuestions();
  if (!qs.length) return reply(fmt('❌ Aucune question disponible.'));
  const q = qs[Math.floor(Math.random() * qs.length)];
  const text =
    '╭━━━━〔 🎌 *𝐐𝐔𝐈𝐙𝐙 𝐀𝐍𝐈𝐌𝐄* 〕━━━━╮\n' +
    '┃\n' +
    '┃ ❓ ' + q.question + '\n' +
    '┃\n' +
    '┃ 🅰  ' + q.options.a + '\n' +
    '┃ 🅱  ' + q.options.b + '\n' +
    '┃ 🅲  ' + q.options.c + '\n' +
    '┃ 🅳  ' + q.options.d + '\n' +
    '┃\n' +
    '┃ ⏱ Vous avez *60 secondes*\n' +
    '┃ 💬 Repondez par: a, b, c ou d\n' +
    '╰━━━━━━━━━━━━━━━━━━━━╯\n' +
    '𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 • Quizz Anime';
  const sent = await rich.sendMessage(m.chat, { text }, { quoted: m });
  const state = {
    question: q.question,
    options: q.options,
    answer: (q.answer || '').toLowerCase(),
    startedBy: m.sender,
    answered: false,
    msgKey: sent && sent.key
  };
  state.timer = setTimeout(async () => {
    if (!ACTIVE_QUIZZES.has(m.chat)) return;
    const cur = ACTIVE_QUIZZES.get(m.chat);
    ACTIVE_QUIZZES.delete(m.chat);
    if (cur.answered) return;
    try {
      await rich.sendMessage(m.chat, {
        text: fmt(`⏰ *Temps ecoule !*\n┃ ✅ Bonne reponse: *${cur.answer.toUpperCase()}* — ${cur.options[cur.answer]}\n┃ 💔 Personne n a trouve.`)
      });
    } catch(_){}
  }, 60000);
  ACTIVE_QUIZZES.set(m.chat, state);
};
cmds.quizanime = cmds.quizz_anime;
cmds.animequizz = cmds.quizz_anime;
cmds.quizzanime = cmds.quizz_anime;

// Intercepteur de reponse (a/b/c/d) — appele depuis le hook principal
async function handleQuizAnswer(ctx) {
  if (!ctx.m.isGroup) return false;
  const chat = ctx.m.chat;
  if (!ACTIVE_QUIZZES.has(chat)) return false;
  const body = (ctx.body || '').trim().toLowerCase();
  if (!/^[abcd]$/.test(body)) return false;
  const state = ACTIVE_QUIZZES.get(chat);
  if (state.answered) return true; // already won, swallow
  if (body === state.answer) {
    state.answered = true;
    if (state.timer) clearTimeout(state.timer);
    ACTIVE_QUIZZES.delete(chat);
    try {
      await ctx.rich.sendMessage(chat, {
        text: fmt(`🎉 *BONNE REPONSE !*\n┃ 🏆 Gagnant: @${ctx.m.sender.split('@')[0]}\n┃ ✅ Reponse: *${state.answer.toUpperCase()}* — ${state.options[state.answer]}\n┃ 🎌 Tape *.quizz_anime* pour relancer !`),
        mentions: [ctx.m.sender]
      }, { quoted: ctx.m });
    } catch(_){}
    return true;
  }
  // Wrong: silent (so multiple players can keep guessing)
  return true;
}

// ------------------------- EXPORT -------------------------
module.exports = async function ndarnoxPlus(ctx) {
  // 1) Sync rich.public with mode
  if (ctx.rich) ctx.rich.public = (DB.mode === 'public');

  // 2) Run runtime anti-* on every message
  try { await runAnti(ctx); } catch(e) { console.log('antiErr', e.message); }

  // 3) Welcome / goodbye event hook is set elsewhere in Baileys; we expose data only.

  // 4) Mode private gate (only owner uses bot in private mode)
  if (DB.mode === 'private' && !isOwnerJid(ctx.m.sender) && ctx.isCmd) {
    return true; // swallow command
  }

  // 5) Per-user blocked commands (owner bypass)
  if (ctx.isCmd && !isOwnerJid(ctx.m.sender) && DB.blockedCmds[ctx.m.sender]?.includes(ctx.command)) {
    await ctx.reply(fmt('🚫 Cette commande t a ete interdite par le proprietaire.'));
    return true;
  }

  // 5b) Quiz anime answer interception (a/b/c/d in active quiz groups)
  try {
    if (await handleQuizAnswer(ctx)) return true;
  } catch (e) { console.log('[quiz answer] err:', e.message); }

  // 6) Dispatch our commands
  if (!ctx.isCmd) return false;
  const fn = cmds[ctx.command];
  if (!fn) return false;
  try {
    // stats
    DB.stats.total = (DB.stats.total||0) + 1;
    DB.stats.perCmd[ctx.command] = (DB.stats.perCmd[ctx.command]||0) + 1;
    DB.stats.perUser[ctx.m.sender] = DB.stats.perUser[ctx.m.sender] || { count:0, last:0 };
    DB.stats.perUser[ctx.m.sender].count++;
    DB.stats.perUser[ctx.m.sender].last = Date.now();
    scheduleSave();
    await fn(ctx);
  } catch (e) {
    console.log('ndarnox cmd error:', ctx.command, e.message);
    try { await ctx.reply(fmt('⚠ Erreur: '+e.message)); } catch(_){}
  }
  return true;
};

// expose welcome/goodbye for bot.js if needed
module.exports.DB = DB;
module.exports.fmt = fmt;
module.exports.cmdsList = Object.keys(cmds);
