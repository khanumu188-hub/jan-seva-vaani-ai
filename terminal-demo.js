#!/usr/bin/env node
/**
 * JAN SEVA VAANI AI 2.0 - TERMINAL INTERACTIVE SUITE
 * --------------------------------------------------
 * Interactive Voice-Powered Government Form & Google Form Simulator
 * for Rural and Non-Literate Citizens.
 * 
 * Usage:
 *   node terminal-demo.js
 */

const readline = require('readline');
const { exec } = require('child_process');

const C = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function clearScreen() {
  console.clear();
}

function printBanner() {
  console.log(`${C.yellow}${C.bright}`);
  console.log(`================================================================`);
  console.log(`   🇮🇳  जन सेवा वाणी AI 2.0 - JAN SEVA VAANI TERMINAL SUITE    `);
  console.log(`   Voice-Powered Government & Google Form Assistant for Citizens`);
  console.log(`================================================================${C.reset}`);
}

// ---------------------------------------------------------
// 1. CONVERSATIONAL GOVERNMENT FORM SIMULATOR
// ---------------------------------------------------------
async function runGovFormSimulator() {
  clearScreen();
  printBanner();
  console.log(`\n${C.cyan}${C.bright}=== [MODULE 1] बोलकर सरकारी योजना फॉर्म भरें (Voice Form Simulation) ===${C.reset}\n`);

  console.log(`${C.dim}AI सहायक आपसे सरल सवाल पूछेगा। आप बोलकर या लिखकर उत्तर दे सकते हैं:${C.reset}\n`);

  // Step 1: Scheme
  console.log(`${C.yellow}🗣️ AI सहायक:${C.reset} "नमस्ते! आप किस सरकारी योजना के लिए आवेदन करना चाहते हैं?"`);
  console.log(`   [विकल्प: पीएम किसान, आयुष्मान भारत, राशन कार्ड, ई-श्रम...]`);
  let scheme = await prompt(`   ${C.green}आपका उत्तर (या Enter): ${C.reset}`);
  if (!scheme.trim()) scheme = 'पीएम किसान सम्मान निधि';

  // Step 2: Name
  console.log(`\n${C.yellow}🗣️ AI सहायक:${C.reset} "आपका पूरा नाम क्या है?"`);
  let name = await prompt(`   ${C.green}आपका उत्तर (या Enter): ${C.reset}`);
  if (!name.trim()) name = 'रमेश कुमार पाल';

  // Step 3: Mobile
  console.log(`\n${C.yellow}🗣️ AI सहायक:${C.reset} "अपना 10 अंकों का मोबाइल नंबर बोलिए..."`);
  let mobile = await prompt(`   ${C.green}आपका उत्तर (या Enter): ${C.reset}`);
  if (!mobile.trim()) mobile = '9876543210';

  // Step 4: Village
  console.log(`\n${C.yellow}🗣️ AI सहायक:${C.reset} "आपका गाँव और जिला कौन सा है?"`);
  let address = await prompt(`   ${C.green}आपका उत्तर (या Enter): ${C.reset}`);
  if (!address.trim()) address = 'ग्राम रामपुर, जिला सीतामढ़ी (बिहार)';

  // Step 5: Occupation
  console.log(`\n${C.yellow}🗣️ AI सहायक:${C.reset} "आप क्या काम करते हैं? (किसान, मजदूर, कारीगर...)"`);
  let occ = await prompt(`   ${C.green}आपका उत्तर (या Enter): ${C.reset}`);
  if (!occ.trim()) occ = 'खेती (सीमांत किसान)';

  // Verification
  console.log(`\n${C.bright}${C.cyan}--- AI वॉयस सत्यापन (Readback & Verification) ---${C.reset}`);
  console.log(`${C.yellow}🗣️ AI सहायक:${C.reset} "मैंने आपका नाम [${name}], मोबाइल [${mobile}], गाँव [${address}], और योजना [${scheme}] दर्ज किया है।"`);
  console.log(`   "क्या यह सही है? (हाँ / नहीं)"`);
  await prompt(`   ${C.green}पुष्टि करें: ${C.reset}`);

  // Generate Receipt
  const refId = `JSV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toLocaleString('en-IN');

  console.log(`\n${C.bright}${C.green}✓ आवेदन सफलतापूर्वक दर्ज हुआ! आधिकारिक सरकारी पावती रसीद:${C.reset}`);
  console.log(`${C.dim}----------------------------------------------------------------${C.reset}`);
  console.log(`  🇮🇳  भारत सरकार • GOVT. OF INDIA`);
  console.log(`  राष्ट्रीय नागरिक जन कल्याण सेवा पोर्टल - जन सेवा वाणी पावती`);
  console.log(`${C.dim}----------------------------------------------------------------${C.reset}`);
  console.log(`  आवेदन संदर्भ संख्या : ${C.yellow}${refId}${C.reset}`);
  console.log(`  दिनांक व समय       : ${now}`);
  console.log(`  चयनित योजना        : ${C.bright}${scheme}${C.reset}`);
  console.log(`  आवेदक का नाम       : ${name}`);
  console.log(`  मोबाइल नंबर         : ${mobile}`);
  console.log(`  गाँव व जिला        : ${address}`);
  console.log(`  मुख्य व्यवसाय      : ${occ}`);
  console.log(`  स्थिति              : ${C.green}[सत्यापित एवं दर्ज / VERIFIED]${C.reset}`);
  console.log(`  QR सत्यापन कोड     : [ ||||| | | |||| ||||| ] (Scannable)`);
  console.log(`${C.dim}----------------------------------------------------------------${C.reset}`);

  console.log(`\nPress Enter to return to main menu...`);
  await prompt('');
}

// ---------------------------------------------------------
// 2. GOOGLE FORM VOICE AUTO-PILOT SIMULATOR
// ---------------------------------------------------------
async function runGoogleFormSimulator() {
  clearScreen();
  printBanner();
  console.log(`\n${C.magenta}${C.bright}=== [MODULE 2] GOOGLE FORM AI वॉयस सहायक (Live Voice Mic Demo) ===${C.reset}\n`);

  console.log(`Google Form में बिना टाइप किए, सिर्फ बोलकर फॉर्म भरें:\n`);

  const questions = [
    { q: 'Google Form Q1: आपका पूरा नाम?', defaultVal: 'सुनीता देवी' },
    { q: 'Google Form Q2: 10 अंकों का फोन नंबर?', defaultVal: '9845123456' },
    { q: 'Google Form Q3: योजना का चुनाव (Radio Button)?', defaultVal: 'आयुष्मान भारत 5 लाख कार्ड' },
    { q: 'Google Form Q4: आपका गाँव या पता?', defaultVal: 'ग्राम बरौनी, बेगूसराय' },
    { q: 'Google Form Q5: कोई विशेष टिप्पणी या समस्या?', defaultVal: 'बीमारी के मुफ्त इलाज के लिए गोल्डन कार्ड चाहिए।' }
  ];

  const answers = [];

  for (let i = 0; i < questions.length; i++) {
    const item = questions[i];
    console.log(`${C.yellow}🎙️ Google Form AI Mic:${C.reset} "${item.q}"`);
    let ans = await prompt(`   ${C.cyan}User Spoke (Enter for demo): ${C.reset}`);
    if (!ans.trim()) ans = item.defaultVal;
    answers.push({ q: item.q, a: ans });
    console.log(`   ${C.green}✓ Typed into Google Form Field: "${ans}"${C.reset}\n`);
  }

  console.log(`${C.bright}${C.green}✓ All 5 Google Form fields successfully populated by voice!${C.reset}`);
  console.log(`${C.cyan}Google Form Data Payload:${C.reset}`);
  console.table(answers);

  console.log(`\nPress Enter to return to main menu...`);
  await prompt('');
}

// ---------------------------------------------------------
// 3. LAUNCH FULL WEB UI IN BROWSER
// ---------------------------------------------------------
async function launchBrowserApp() {
  clearScreen();
  printBanner();
  console.log(`\n${C.green}Launching Jan Seva Vaani 2.0 Web Application in your default browser...${C.reset}`);
  console.log(`${C.dim}Server is running at: http://localhost:5500${C.reset}\n`);

  exec('cmd /c start http://localhost:5500', (err) => {
    if (err) {
      exec('explorer "index.html"');
    }
  });

  console.log(`Web application opened!`);
  console.log(`Press Enter to return to main menu...`);
  await prompt('');
}

// ---------------------------------------------------------
// MAIN INTERACTIVE MENU
// ---------------------------------------------------------
async function main() {
  while (true) {
    clearScreen();
    printBanner();
    console.log(`\nSelect an option to test:\n`);
    console.log(`  ${C.bright}[1]${C.reset} 🏛️  बोलकर सरकारी योजना फॉर्म भरें (Conversational Sarkari Form)`);
    console.log(`  ${C.bright}[2]${C.reset} 📝  Google Form AI वॉयस ऑटो-पायलट (Google Form Voice Auto-Pilot)`);
    console.log(`  ${C.bright}[3]${C.reset} 🌐  Launch Live Web Application (Browser at http://localhost:5500)`);
    console.log(`  ${C.bright}[4]${C.reset} 🚪  Exit\n`);

    const choice = await prompt(`${C.cyan}Select an option (1-4): ${C.reset}`);

    if (choice.trim() === '1') {
      await runGovFormSimulator();
    } else if (choice.trim() === '2') {
      await runGoogleFormSimulator();
    } else if (choice.trim() === '3') {
      await launchBrowserApp();
    } else if (choice.trim() === '4') {
      console.log(`\n${C.green}धन्यवाद! जन सेवा वाणी AI - हर नागरिक का सच्चा साथी।${C.reset}\n`);
      rl.close();
      process.exit(0);
    }
  }
}

main();
