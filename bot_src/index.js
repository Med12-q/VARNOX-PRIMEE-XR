/**
   𓊈𖣐𓊉DEV BY @Varnox_Or_novark𓊈𖣐𓊉
   𓊈𖣐𓊉MY PRIME SHALL COME BACK𓊈𖣐𓊉
*/
// Import required modules
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const { startupPassword } = require('./token');

const AUTH_FILE = './richstore/auth.json'; // file to store authentication state
const startpairing = require('./pair');

// Utility function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/*const autoLoadPairs = async () => {
  console.log(chalk.yellow('🔄 Auto-loading all paired users...'));

  const pairingDir = './richstore/pairing/';
  if (!fs.existsSync(pairingDir)) {
    console.log(chalk.red('❌ Pairing directory not found.'));
    return;
  }

  const pairUsers = fs.readdirSync(pairingDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.endsWith('@s.whatsapp.net'));

  if (pairUsers.length === 0) {
    console.log(chalk.yellow('ℹ️ No paired users found.'));
    return;
  }

  console.log(chalk.green(`✅ Found ${pairUsers.length} users. Starting connections...`));

  // Add initial delay before starting connections
  console.log(chalk.blue('⏳ Waiting 4 seconds before starting connections...'));
  await delay(4000);

  for (let i = 0; i < pairUsers.length; i++) {
    const user = pairUsers[i];
    
    try {
      console.log(chalk.blue(`🔄 Connecting user ${i + 1}/${pairUsers.length}: ${user}`));
      
      await startpairing(user);
      console.log(chalk.green(`✅ Connected: ${user}`));
      
      // Add delay between connections (except for the last user)
      if (i < pairUsers.length - 1) {
        console.log(chalk.blue(`⏳ Waiting 4 seconds before next connection...`));
        await delay(4000);
      }
      
    } catch (e) {
      console.log(chalk.red(`❌ Failed for ${user}: ${e.message}`));
      
      // Add delay even on error to prevent overwhelming the system
      if (i < pairUsers.length - 1) {
        console.log(chalk.blue(`⏳ Waiting 4 seconds before retry/next connection...`));
        await delay(4000);
      }
    }
  }

  console.log(chalk.green('✅ All paired users processed.'));
  
  // Add final delay before continuing
  console.log(chalk.blue('⏳ Waiting 4 seconds before continuing...'));
  await delay(4000);
};*/

const autoLoadPairs = async () => {
  const pairingDir = './richstore/pairing/';
  if (!fs.existsSync(pairingDir)) return;

  const pairUsers = fs.readdirSync(pairingDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.endsWith('@s.whatsapp.net'));

  if (pairUsers.length === 0) return;

  console.log(chalk.green(`🔄 Auto-reconnecting ${pairUsers.length} WhatsApp session(s)...`));
  await delay(2000);

  for (let i = 0; i < pairUsers.length; i++) {
    const user = pairUsers[i];
    try {
      console.log(chalk.blue(`🔌 Connecting: ${user}`));
      startpairing(user).catch(e => console.log(chalk.red(`❌ WA error [${user}]: ${e.message}`)));
      await delay(3000);
    } catch (e) {
      console.log(chalk.red(`❌ Failed for ${user}: ${e.message}`));
    }
  }
};

// Modified: password prompt skipped, auto-launch bot
const initializeBot = async () => {
  console.log(chalk.green('Auto-auth enabled. Skipping password...'));
  setAuthenticated(true);
  launchBot();
  await autoLoadPairs();
};

function isAuthenticated() {
  return fs.existsSync(AUTH_FILE) && JSON.parse(fs.readFileSync(AUTH_FILE)).authenticated;
}

function setAuthenticated(value) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ authenticated: value }));
}

// Telegram bot launcher
function launchBot() {
  console.clear();
  console.log(chalk.green('Starting Telegram bot...'));
  
  // Only start the Telegram bot
  require('./bot');
  
  console.log(chalk.green('✅ 𝛁𝚫𝚪𝚴𝚯𝚾•𝚸𝚪𝚰𝚳𝚵𝚵 𝙸𝚂 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈!'));

  // Error handling for the Telegram bot
  const ignoredErrors = [
    'Socket connection timeout',
    'EKEYTYPE',
    'item-not-found',
    'rate-overlimit',
    'Connection Closed',
    'Timed Out',
    'Value not found',
  ];

  process.on('unhandledRejection', (reason) => {
    if (ignoredErrors.some((e) => String(reason).includes(e))) return;
    console.log('Unhandled Rejection: ', reason);
  });

  const originalConsoleError = console.error;
  console.error = function (message, ...optionalParams) {
    if (
      typeof message === 'string' &&
      ignoredErrors.some((e) => message.includes(e))
    )
      return;
    originalConsoleError.apply(console, [message, ...optionalParams]);
  };

  const originalStderrWrite = process.stderr.write;
  process.stderr.write = function (message, encoding, fd) {
    if (
      typeof message === 'string' &&
      ignoredErrors.some((e) => message.includes(e))
    )
      return;
    originalStderrWrite.apply(process.stderr, arguments);
  };
}

// Initialize the bot with proper async handling
initializeBot().catch(console.error);