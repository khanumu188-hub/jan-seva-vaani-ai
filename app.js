/**
 * JAN SEVA VAANI AI 2.0 - VOICE-POWERED GOVERNMENT & GOOGLE FORM ASSISTANT
 * -----------------------------------------------------------------------
 * Developed for rural, elderly, and non-literate citizens to easily access
 * government welfare schemes and complete online forms purely by speaking.
 */

// --- GLOBAL STATE ---
const state = {
  theme: localStorage.getItem('jsv_theme') || 'dark',
  fontScale: parseFloat(localStorage.getItem('jsv_font_scale')) || 1.0,
  soundEnabled: localStorage.getItem('jsv_sound') !== 'false',
  currentLang: 'hi-IN',
  selectedScheme: 'पीएम किसान सम्मान निधि',
  isSpeaking: false,
  isListening: false,
  recognition: null,
  synth: window.speechSynthesis,
  activeTargetField: null,
  activeGoogleFormField: null,
  isAutoFilling: false,
  currentStepIndex: 0,
  audioCtx: null,

  // Citizen Details Model
  formData: {
    name: '',
    guardian: '',
    mobile: '',
    aadhaar: '',
    age: '',
    gender: 'पुरुष',
    address: '',
    occupation: '',
    bank: ''
  },

  // Google Form Model
  googleFormData: {
    name: '',
    mobile: '',
    scheme: 'PM Kisan',
    address: '',
    remarks: ''
  }
};

// Hindi & Regional Spoken Numerals Translation Dictionary
const SPOKEN_NUMBERS = {
  'शून्य': '0', 'जीरो': '0', 'zero': '0',
  'एक': '1', 'one': '1',
  'दो': '2', 'two': '2',
  'तीन': '3', 'three': '3',
  'चार': '4', 'four': '4',
  'पाँच': '5', 'पांच': '5', 'five': '5',
  'छह': '6', 'छः': '6', 'six': '6',
  'सात': '7', 'seven': '7',
  'आठ': '8', 'eight': '8',
  'नौ': '9', 'nine': '9',
  'दस': '10', 'ग्यारह': '11', 'बारह': '12', 'तेरह': '13', 'चौदह': '14',
  'पंद्रह': '15', 'सोलह': '16', 'सत्रह': '17', 'अट्ठारह': '18', 'उन्नीस': '19',
  'बीस': '20', 'पच्चीस': '25', 'तीस': '30', 'पैंतीस': '35', 'चालीस': '40',
  'पैंतालीस': '45', 'पचास': '50', 'पचपन': '55', 'साठ': '60', 'पैंसठ': '65',
  'सत्तर': '70', 'अस्सी': '80', 'नब्बे': '90'
};

// Scheme Audio Audio Descriptions (in Hindi & English)
const SCHEME_AUDIO_DESCRIPTIONS = {
  'pm-kisan': 'पीएम किसान सम्मान निधि योजना के तहत केंद्र सरकार सभी पात्र किसानों को साल में छह हजार रुपये की आर्थिक सहायता सीधे बैंक खाते में तीन किस्तों में देती है।',
  'ayushman': 'आयुष्मान भारत योजना के तहत गरीब परिवारों को पांच लाख रुपये तक का सालाना मुफ्त इलाज देश के किसी भी सरकारी या निजी अस्पताल में मिलता है।',
  'ration': 'राशन कार्ड और राष्ट्रीय खाद्य सुरक्षा योजना के अंतर्गत हर पात्र परिवार को हर महीने प्रति व्यक्ति पांच किलो मुफ्त अनाज उपलब्ध कराया जाता है।',
  'eshram': 'ई-श्रम कार्ड असंगठित क्षेत्र के कामगारों, मजदूरों और कारीगरों के लिए है। इसमें दो लाख रुपये का दुर्घटना बीमा और सरकारी योजनाओं का सीधा लाभ मिलता है।',
  'pmawas': 'प्रधानमंत्री आवास योजना ग्रामीण के अंतर्गत कच्चे मकानों में रहने वाले परिवारों को पक्का घर बनाने के लिए एक लाख बीस हजार रुपये का सीधा अनुदान दिया जाता है।',
  'pension': 'वृद्धावस्था और विधवा पेंशन योजना के तहत साठ वर्ष से अधिक बुजुर्गों और निराश्रित महिलाओं को हर महीने सम्मानजनक जीवन यापन हेतु पेंशन दी जाती है।'
};

// Conversational Form Steps Definition
const FORM_STEPS = [
  {
    field: 'scheme',
    id: 'step-scheme',
    name: 'योजना चयन',
    promptHi: 'नमस्ते! आप किस योजना के लिए आवेदन करना चाहते हैं? बोलिए: पीएम किसान, आयुष्मान भारत, राशन कार्ड, या ई-श्रम।',
    promptEn: 'Hello! Which scheme would you like to apply for? Say: PM Kisan, Ayushman Bharat, Ration Card, or e-Shram.'
  },
  {
    field: 'name',
    id: 'input-name',
    name: 'आवेदक का नाम',
    promptHi: 'आपका पूरा नाम क्या है? बोलिए...',
    promptEn: 'What is your full name? Please speak now.'
  },
  {
    field: 'guardian',
    id: 'input-guardian',
    name: 'पिता/पति का नाम',
    promptHi: 'आपके पिता या पति का क्या नाम है?',
    promptEn: 'What is your father or husband name?'
  },
  {
    field: 'mobile',
    id: 'input-mobile',
    name: 'मोबाइल नंबर',
    promptHi: 'अपना दस अंकों का मोबाइल नंबर बोलिए...',
    promptEn: 'Please speak your 10 digit mobile number.'
  },
  {
    field: 'aadhaar',
    id: 'input-aadhaar',
    name: 'आधार कार्ड संख्या',
    promptHi: 'अपना बारह अंकों का आधार कार्ड नंबर बोलिए...',
    promptEn: 'Please speak your 12 digit Aadhaar number.'
  },
  {
    field: 'age-gender',
    id: 'group-age-gender',
    name: 'आयु एवं लिंग',
    promptHi: 'आपकी उम्र कितनी है और आप पुरुष हैं या महिला?',
    promptEn: 'What is your age and gender?'
  },
  {
    field: 'address',
    id: 'input-address',
    name: 'गाँव व जिला',
    promptHi: 'आपका गाँव, ग्राम पंचायत और जिला कौन सा है?',
    promptEn: 'What is your village and district name?'
  },
  {
    field: 'occupation',
    id: 'input-occupation',
    name: 'व्यवसाय',
    promptHi: 'आप क्या काम करते हैं? जैसे: किसान, मजदूर, कारीगर, या पशुपालक?',
    promptEn: 'What is your occupation? For example: farmer, laborer, or artisan?'
  },
  {
    field: 'confirm',
    id: 'btn-submit-form',
    name: 'सत्यापन व जमा',
    promptHi: 'बहुत बढ़िया! सभी विवरण दर्ज हो गए हैं। फॉर्म जमा करने के लिए बोलिए: हाँ, जमा करो।',
    promptEn: 'Great! All details recorded. To submit the form, say: Submit.'
  }
];

// Google Form Voice Sequence
const GF_STEPS = [
  { target: 'gf-input-name', prompt: 'Google Form प्रश्न 1: आपका नाम क्या है?' },
  { target: 'gf-input-mobile', prompt: 'Google Form प्रश्न 2: आपका मोबाइल नंबर क्या है?' },
  { target: 'radio-scheme', prompt: 'Google Form प्रश्न 3: कौन सी योजना चुनना चाहते हैं?' },
  { target: 'gf-input-address', prompt: 'Google Form प्रश्न 4: आपका गाँव या पता क्या है?' },
  { target: 'gf-input-remarks', prompt: 'Google Form प्रश्न 5: कोई अन्य टिप्पणी या समस्या बोलें।' }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFontScale();
  initSoundButton();
  initSpeechRecognition();
  initVisualizer();
  bindEvents();
  updateProgress(0);
});

// --- AUDIO SYNTHESIZER CHIMES (WEB AUDIO API) ---
function getAudioContext() {
  if (!state.audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) state.audioCtx = new AudioCtx();
  }
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }
  return state.audioCtx;
}

function playChime(type) {
  if (!state.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      // Gentle rising tone for mic active
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'success') {
      // Pleasant affirmative ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'celebrate') {
      // Chord fanfare for receipt generation
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.08, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.4);
      });
    }
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

function initSoundButton() {
  const btn = document.getElementById('audio-sound-toggle');
  if (!btn) return;
  btn.textContent = state.soundEnabled ? '🔊' : '🔇';
  btn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('jsv_sound', state.soundEnabled);
    btn.textContent = state.soundEnabled ? '🔊' : '🔇';
    showToast(state.soundEnabled ? 'ध्वनि प्रभाव चालू' : 'ध्वनि प्रभाव मूक (Muted)');
    if (state.soundEnabled) playChime('success');
  });
}

// --- THEME & ACCESSIBILITY SETUP ---
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('jsv_theme', state.theme);
  playChime('success');
  showToast(state.theme === 'dark' ? 'डार्क थीम सक्रिय' : 'लाइट थीम सक्रिय');
}

function initFontScale() {
  document.documentElement.style.setProperty('--font-scale', state.fontScale);
}

function adjustFontScale(delta) {
  if (delta === 0) {
    state.fontScale = 1.0;
  } else {
    state.fontScale = Math.min(1.4, Math.max(0.85, state.fontScale + delta));
  }
  document.documentElement.style.setProperty('--font-scale', state.fontScale);
  localStorage.setItem('jsv_font_scale', state.fontScale);
  playChime('start');
  showToast(`अक्षर आकार: ${Math.round(state.fontScale * 100)}%`);
}

// --- SPEECH RECOGNITION SETUP ---
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported in this browser.');
    showToast('इस ब्राउज़र में वॉयस इनपुट सीमित है। Chrome या Edge का उपयोग करें।');
    return;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = state.currentLang;

  rec.onstart = () => {
    state.isListening = true;
    playChime('start');
    updateCompanionStatus('सुन रहा हूँ... बोलिए (Listening...)', 'listening');
    const box = document.getElementById('live-transcript-box');
    if (box) box.classList.add('active');
  };

  rec.onresult = (e) => {
    let interim = '';
    let final = '';

    for (let i = e.resultIndex; i < e.results.length; i++) {
      const text = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        final += text;
      } else {
        interim += text;
      }
    }

    const displayText = final || interim;
    const transcriptEl = document.getElementById('live-transcript-text');
    if (transcriptEl && displayText) {
      transcriptEl.textContent = `"${displayText}"`;
    }

    if (final.trim()) {
      playChime('success');
      handleSpokenInput(final.trim());
    }
  };

  rec.onerror = (err) => {
    console.error('Speech recognition error:', err);
    state.isListening = false;
    updateCompanionStatus('वॉयस साथी तैयार है • माइक दबाएं', 'online');
    const box = document.getElementById('live-transcript-box');
    if (box) box.classList.remove('active');
  };

  rec.onend = () => {
    state.isListening = false;
    const box = document.getElementById('live-transcript-box');
    if (box) box.classList.remove('active');
    
    if (!state.isSpeaking) {
      updateCompanionStatus('वॉयस साथी तैयार है • माइक दबाएं', 'online');
    }
    resetMicButtons();
  };

  state.recognition = rec;
}

// --- TEXT-TO-SPEECH (TTS) ENGINE ---
function speakText(text, onComplete) {
  if (!('speechSynthesis' in window)) {
    if (onComplete) onComplete();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.currentLang;
  utterance.rate = 0.94; // Calm, respectful, clear pace for rural citizens
  utterance.pitch = 1.02;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === state.currentLang) ||
                       voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    state.isSpeaking = true;
    updateCompanionStatus('वाणी दीदी बोल रही हैं... (Speaking...)', 'speaking');
  };

  utterance.onend = () => {
    state.isSpeaking = false;
    updateCompanionStatus('वॉयस साथी तैयार है • माइक दबाएं', 'online');
    if (onComplete) onComplete();
  };

  utterance.onerror = () => {
    state.isSpeaking = false;
    updateCompanionStatus('वॉयस साथी तैयार है', 'online');
    if (onComplete) onComplete();
  };

  window.speechSynthesis.speak(utterance);
}

// --- DYNAMIC AUDIO CANVAS EQUALIZER & SINE VISUALIZER ---
function initVisualizer() {
  const canvas = document.getElementById('audio-visualizer');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationId;
  let phase = 0;

  function renderWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    const isActive = state.isSpeaking || state.isListening;
    const amplitude = isActive ? 22 : 4;
    const speed = isActive ? 0.09 : 0.02;

    phase += speed;

    // Glowing Equalizer Waveform
    const waveCount = 3;
    const colors = [
      isActive ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
      isActive ? '#10b981' : 'rgba(16, 185, 129, 0.25)',
      isActive ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)'
    ];

    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = colors[w];

      for (let x = 0; x < width; x += 4) {
        const freq = 0.018 + (w * 0.006);
        const y = midY + Math.sin(x * freq + phase + w) * (amplitude * (1 - Math.abs(x - width / 2) / (width / 2)));
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    animationId = requestAnimationFrame(renderWave);
  }

  renderWave();
}

// --- CONVERSATIONAL INPUT PARSER ---
function handleSpokenInput(spokenRaw) {
  const spoken = spokenRaw.toLowerCase();

  // If in Google Form Mode
  if (state.activeGoogleFormField) {
    handleGoogleFormSpoken(spoken);
    return;
  }

  // If auto-filling step-by-step
  if (state.isAutoFilling) {
    const currentStep = FORM_STEPS[state.currentStepIndex];
    if (currentStep) {
      applyFieldInput(currentStep.field, spoken);
      advanceAutoFill();
      return;
    }
  }

  // If single field mic was tapped
  if (state.activeTargetField) {
    applyFieldInput(state.activeTargetField, spoken);
    speakText(`दर्ज कर लिया गया है।`, () => {
      resetTargetHighlights();
      state.activeTargetField = null;
    });
    return;
  }

  // General conversational intent detection
  if (spoken.includes('शुरू') || spoken.includes('start') || spoken.includes('फॉर्म भरो') || spoken.includes('form')) {
    startVoiceAutoFill();
  } else if (spoken.includes('योजना') || spoken.includes('scheme')) {
    detectSchemeFromVoice(spoken);
  } else if (spoken.includes('जमा') || spoken.includes('submit') || spoken.includes('हाँ') || spoken.includes('रसीद')) {
    submitCitizenForm();
  } else {
    const extractedNum = extractDigits(spoken);
    if (extractedNum.length === 10) {
      document.getElementById('input-mobile').value = extractedNum;
      showToast(`मोबाइल नंबर दर्ज: ${extractedNum}`);
      speakText(`आपका मोबाइल नंबर ${extractedNum} दर्ज कर लिया गया है।`);
    } else {
      showToast(`आवाज़ पहचानी: "${spokenRaw}"`);
    }
  }
}

// Intelligent Digit Extractor
function extractDigits(str) {
  let cleaned = str.toLowerCase();
  
  for (const [word, digit] of Object.entries(SPOKEN_NUMBERS)) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    cleaned = cleaned.replace(regex, digit);
  }

  return cleaned.replace(/\D/g, '');
}

// Clean conversational phrases
function cleanSpokenName(str) {
  return str
    .replace(/^(मेरा नाम|नाम है|आवेदक का नाम|my name is|i am)/gi, '')
    .replace(/(है|जी|हूँ|yes|sir)$/gi, '')
    .trim();
}

// Apply Spoken Input to Form Field
function applyFieldInput(fieldName, spoken) {
  switch (fieldName) {
    case 'scheme':
      detectSchemeFromVoice(spoken);
      break;

    case 'name':
      const nameVal = cleanSpokenName(spoken);
      const nameInput = document.getElementById('input-name');
      if (nameInput) {
        nameInput.value = capitalizeWords(nameVal);
        state.formData.name = nameInput.value;
      }
      break;

    case 'guardian':
      const gVal = spoken.replace(/^(पिता का नाम|पति का नाम|श्री|father name is)/gi, '').trim();
      const gInput = document.getElementById('input-guardian');
      if (gInput) {
        gInput.value = capitalizeWords(gVal);
        state.formData.guardian = gInput.value;
      }
      break;

    case 'mobile':
      const phoneDigits = extractDigits(spoken);
      const mobileInput = document.getElementById('input-mobile');
      if (mobileInput) {
        mobileInput.value = phoneDigits.slice(0, 10);
        state.formData.mobile = mobileInput.value;
      }
      break;

    case 'aadhaar':
      const aadhaarDigits = extractDigits(spoken);
      const aadhaarInput = document.getElementById('input-aadhaar');
      if (aadhaarInput) {
        const formatted = aadhaarDigits.slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');
        aadhaarInput.value = formatted;
        state.formData.aadhaar = formatted;
      }
      break;

    case 'age-gender':
      const ageDigits = extractDigits(spoken);
      const ageInput = document.getElementById('input-age');
      const genderSelect = document.getElementById('select-gender');
      
      if (ageInput && ageDigits) {
        ageInput.value = ageDigits.slice(0, 2);
        state.formData.age = ageInput.value;
      }

      if (genderSelect) {
        if (spoken.includes('महिला') || spoken.includes('female') || spoken.includes('स्त्री') || spoken.includes('औरत')) {
          genderSelect.value = 'महिला';
        } else {
          genderSelect.value = 'पुरुष';
        }
        state.formData.gender = genderSelect.value;
      }
      break;

    case 'address':
      const addrVal = spoken.replace(/^(मेरा गाँव|पता है|गांव|गाँव|village is|address is)/gi, '').trim();
      const addrInput = document.getElementById('input-address');
      if (addrInput) {
        addrInput.value = capitalizeWords(addrVal);
        state.formData.address = addrInput.value;
      }
      break;

    case 'occupation':
      const occVal = spoken.replace(/^(मेरा काम|मैं|काम करता हूँ|i am|occupation is)/gi, '').trim();
      const occInput = document.getElementById('input-occupation');
      if (occInput) {
        occInput.value = capitalizeWords(occVal);
        state.formData.occupation = occInput.value;
      }
      break;

    case 'bank':
      const bankVal = spoken.replace(/^(मेरा बैंक|खाता नंबर)/gi, '').trim();
      const bankInput = document.getElementById('input-bank');
      if (bankInput) {
        bankInput.value = bankVal;
        state.formData.bank = bankVal;
      }
      break;

    case 'confirm':
      if (spoken.includes('हाँ') || spoken.includes('जमा') || spoken.includes('yes') || spoken.includes('submit')) {
        submitCitizenForm();
      }
      break;
  }
}

// Detect Selected Scheme from Voice
function detectSchemeFromVoice(spoken) {
  let matched = null;
  if (spoken.includes('किसान') || spoken.includes('kisan') || spoken.includes('खेती')) {
    matched = 'पीएम किसान सम्मान निधि';
  } else if (spoken.includes('आयुष्मान') || spoken.includes('इलाज') || spoken.includes('health') || spoken.includes('गोल्डन')) {
    matched = 'आयुष्मान भारत गोल्डन कार्ड';
  } else if (spoken.includes('राशन') || spoken.includes('अनाज') || spoken.includes('ration') || spoken.includes('चावल')) {
    matched = 'राशन कार्ड एवं खाद्य सुरक्षा';
  } else if (spoken.includes('श्रम') || spoken.includes('मजदूर') || spoken.includes('shram')) {
    matched = 'ई-श्रम कार्ड';
  } else if (spoken.includes('आवास') || spoken.includes('मकान') || spoken.includes('घर') || spoken.includes('awas')) {
    matched = 'पीएम आवास योजना ग्रामीण';
  } else if (spoken.includes('पेंशन') || spoken.includes('बुढ़ापा') || spoken.includes('विधवा') || spoken.includes('pension')) {
    matched = 'वृद्धावस्था व विधवा पेंशन';
  }

  if (matched) {
    selectSchemeByName(matched);
    showToast(`योजना चुनी गई: ${matched}`);
  }
}

function selectSchemeByName(name) {
  state.selectedScheme = name;
  const label = document.getElementById('active-scheme-label');
  if (label) {
    label.innerHTML = `चयनित योजना: <strong>${name}</strong>`;
  }

  document.querySelectorAll('.scheme-card').forEach(card => {
    const cardTitle = card.querySelector('.scheme-title')?.textContent || '';
    if (cardTitle.includes(name) || name.includes(cardTitle)) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// --- CONVERSATIONAL AUTO-FILL ---
function startVoiceAutoFill() {
  state.isAutoFilling = true;
  state.currentStepIndex = 0;
  
  const masterBtn = document.getElementById('btn-master-mic');
  if (masterBtn) {
    masterBtn.classList.add('active');
    document.getElementById('master-mic-text').textContent = 'वॉयस फॉर्म चालू है... (रोकने हेतु दबाएं)';
  }

  askCurrentStep();
}

function stopVoiceAutoFill() {
  state.isAutoFilling = false;
  const masterBtn = document.getElementById('btn-master-mic');
  if (masterBtn) {
    masterBtn.classList.remove('active');
    document.getElementById('master-mic-text').textContent = 'बोलकर पूरा फॉर्म भरें (Start Voice)';
  }
  resetTargetHighlights();
}

function askCurrentStep() {
  if (!state.isAutoFilling) return;

  if (state.currentStepIndex >= FORM_STEPS.length) {
    stopVoiceAutoFill();
    return;
  }

  const step = FORM_STEPS[state.currentStepIndex];
  updateProgress(Math.round(((state.currentStepIndex + 1) / FORM_STEPS.length) * 100), step.name);

  const promptText = state.currentLang.startsWith('hi') ? step.promptHi : step.promptEn;
  const promptEl = document.getElementById('assistant-question-text');
  if (promptEl) promptEl.textContent = `"${promptText}"`;

  highlightStepField(step.id);

  speakText(promptText, () => {
    if (state.isAutoFilling) {
      startListening();
    }
  });
}

function advanceAutoFill() {
  state.currentStepIndex++;
  if (state.currentStepIndex < FORM_STEPS.length) {
    setTimeout(() => {
      askCurrentStep();
    }, 600);
  } else {
    stopVoiceAutoFill();
    showToast('फॉर्म के सभी विवरण सफलतापूर्वक भर लिए गए हैं!');
  }
}

function highlightStepField(elementId) {
  resetTargetHighlights();
  const el = document.getElementById(elementId);
  if (el) {
    const group = el.closest('.form-field-group') || el;
    group.classList.add('active-target');
    group.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function resetTargetHighlights() {
  document.querySelectorAll('.form-field-group').forEach(el => el.classList.remove('active-target'));
}

// Single Field Mic Trigger
function triggerFieldMic(fieldName) {
  state.activeTargetField = fieldName;
  const step = FORM_STEPS.find(s => s.field === fieldName);
  const prompt = step ? (state.currentLang.startsWith('hi') ? step.promptHi : step.promptEn) : `कृपया अपना ${fieldName} बोलें`;

  highlightStepField(`input-${fieldName}`);

  const promptEl = document.getElementById('assistant-question-text');
  if (promptEl) promptEl.textContent = `"${prompt}"`;

  speakText(prompt, () => {
    startListening();
  });
}

function startListening() {
  if (state.recognition && !state.isListening) {
    try {
      state.recognition.start();
    } catch (e) {
      console.warn('Recognition active:', e);
    }
  }
}

function stopListening() {
  if (state.recognition && state.isListening) {
    state.recognition.stop();
  }
}

function updateCompanionStatus(text, statusClass) {
  const statusText = document.getElementById('companion-status-text');
  const pill = document.getElementById('companion-status-pill');

  if (statusText) statusText.textContent = text;
  if (pill) {
    pill.className = `status-pill ${statusClass}`;
  }
}

function resetMicButtons() {
  document.querySelectorAll('.btn-field-mic').forEach(btn => btn.classList.remove('recording'));
  document.querySelectorAll('.gf-q-mic').forEach(btn => btn.classList.remove('active'));
}

function updateProgress(percent, stepName = '') {
  const bar = document.getElementById('form-progress-bar');
  const percentLabel = document.getElementById('step-progress-percent');
  const nameLabel = document.getElementById('current-step-name');

  if (bar) bar.style.width = `${percent}%`;
  if (percentLabel) percentLabel.textContent = `${percent}% पूर्ण`;
  if (nameLabel && stepName) nameLabel.textContent = stepName;
}

// --- READ-BACK & VERIFY BY VOICE ---
function readbackFormSummary() {
  const name = document.getElementById('input-name').value || 'नाम नहीं भरा';
  const scheme = state.selectedScheme;
  const mobile = document.getElementById('input-mobile').value || 'मोबाइल नहीं भरा';
  const address = document.getElementById('input-address').value || 'पता नहीं भरा';

  const readbackText = `कृपया अपना विवरण ध्यान से सुनें। योजना है: ${scheme}। आवेदक का नाम: ${name}। मोबाइल नंबर: ${mobile}। और गाँव या पता: ${address}। यदि सब सही है तो 'जमा करें' बटन दबाएं।`;

  const promptEl = document.getElementById('assistant-question-text');
  if (promptEl) promptEl.textContent = `"${readbackText}"`;

  speakText(readbackText);
}

// --- FORM SUBMISSION & RECEIPT GENERATION ---
function submitCitizenForm(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('input-name').value.trim();
  const mobile = document.getElementById('input-mobile').value.trim();

  if (!name) {
    showToast('कृपया पहले आवेदक का नाम दर्ज करें!');
    triggerFieldMic('name');
    return;
  }

  // Play triumphant celebratory chord
  playChime('celebrate');
  triggerConfetti();

  const randomRef = `JSV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date();
  const timeStr = now.toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                  now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  document.getElementById('slip-app-id').textContent = randomRef;
  document.getElementById('slip-timestamp').textContent = timeStr;
  document.getElementById('slip-scheme').textContent = state.selectedScheme;
  document.getElementById('slip-name').textContent = name;
  document.getElementById('slip-guardian').textContent = document.getElementById('input-guardian').value.trim() || 'स्व. रामेश्वर प्रसाद';
  document.getElementById('slip-mobile').textContent = mobile || '9876543210';
  
  const aadhaarVal = document.getElementById('input-aadhaar').value.trim();
  document.getElementById('slip-aadhaar').textContent = aadhaarVal ? `XXXX-XXXX-${aadhaarVal.slice(-4)}` : 'XXXX-XXXX-4521';
  
  const ageVal = document.getElementById('input-age').value || '40';
  const genVal = document.getElementById('select-gender').value || 'पुरुष';
  document.getElementById('slip-age-gender').textContent = `${ageVal} वर्ष / ${genVal}`;
  
  document.getElementById('slip-address').textContent = document.getElementById('input-address').value.trim() || 'ग्राम रामपुर, जिला सीतामढ़ी';
  document.getElementById('slip-occupation').textContent = document.getElementById('input-occupation').value.trim() || 'किसान';

  const modal = document.getElementById('slip-modal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  speakText(`बधाई हो! ${name} जी, आपका ${state.selectedScheme} का आवेदन सफलतापूर्वक दर्ज हो गया है। आपकी रसीद संख्या है: ${randomRef}।`);
  showToast('✓ सरकारी आवेदन पावती तैयार!');
}

function closeSlipModal() {
  const modal = document.getElementById('slip-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// --- GOOGLE FORM VOICE MODE ---
let gfStepIndex = 0;

function startGoogleFormAutoFill() {
  gfStepIndex = 0;
  advanceGoogleFormStep();
}

function advanceGoogleFormStep() {
  if (gfStepIndex >= GF_STEPS.length) {
    updateGoogleFormStatus('Google Form के सभी सवाल पूरे हो गए! जमा (Submit) बटन दबाएं।');
    speakText('Google Form के सभी सवाल पूरे हो गए हैं। आप इसे जमा कर सकते हैं।');
    return;
  }

  const step = GF_STEPS[gfStepIndex];
  state.activeGoogleFormField = step.target;

  document.querySelectorAll('.gf-card').forEach(c => c.classList.remove('focused-card'));
  const targetEl = document.getElementById(step.target);
  if (targetEl) {
    const card = targetEl.closest('.gf-card');
    if (card) {
      card.classList.add('focused-card');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  updateGoogleFormStatus(step.prompt);
  speakText(step.prompt, () => {
    startListening();
  });
}

function handleGoogleFormSpoken(spoken) {
  const target = state.activeGoogleFormField;

  if (target === 'gf-input-name') {
    document.getElementById('gf-input-name').value = capitalizeWords(cleanSpokenName(spoken));
  } else if (target === 'gf-input-mobile') {
    document.getElementById('gf-input-mobile').value = extractDigits(spoken).slice(0, 10);
  } else if (target === 'radio-scheme') {
    const radios = document.querySelectorAll('input[name="gf-scheme-choice"]');
    radios.forEach(r => {
      if (spoken.includes(r.value.toLowerCase()) || 
         (r.value === 'PM Kisan' && spoken.includes('किसान')) ||
         (r.value === 'Ayushman Bharat' && spoken.includes('आयुष्मान')) ||
         (r.value === 'Ration Card' && spoken.includes('राशन')) ||
         (r.value === 'e-Shram' && spoken.includes('श्रम'))) {
        r.checked = true;
      }
    });
  } else if (target === 'gf-input-address') {
    document.getElementById('gf-input-address').value = capitalizeWords(spoken);
  } else if (target === 'gf-input-remarks') {
    document.getElementById('gf-input-remarks').value = spoken;
  }

  gfStepIndex++;
  setTimeout(() => {
    advanceGoogleFormStep();
  }, 600);
}

function updateGoogleFormStatus(text) {
  const el = document.getElementById('gf-status-text');
  if (el) el.textContent = `"${text}"`;
}

function triggerGoogleFormMic(targetId) {
  state.activeGoogleFormField = targetId;
  const step = GF_STEPS.find(s => s.target === targetId);
  const prompt = step ? step.prompt : 'कृपया अपना उत्तर बोलें...';

  updateGoogleFormStatus(prompt);
  speakText(prompt, () => {
    startListening();
  });
}

// --- CELEBRATION CONFETTI ENGINE ---
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e', '#fbbf24'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vRotation;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (frames < 100) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

// --- SAMPLE DATA FILLER (DEMO MODE) ---
function fillSampleDemoData() {
  playChime('success');
  document.getElementById('input-name').value = 'सुरेश कुमार पाल';
  document.getElementById('input-guardian').value = 'श्री रामनरेश पाल';
  document.getElementById('input-mobile').value = '9876543210';
  document.getElementById('input-aadhaar').value = '5421 8974 6321';
  document.getElementById('input-age').value = '46';
  document.getElementById('select-gender').value = 'पुरुष';
  document.getElementById('input-address').value = 'ग्राम बिशनपुर, डाकघर बछवाड़ा, जिला बेगूसराय';
  document.getElementById('input-occupation').value = 'सीमांत किसान (खेती व पशुपालन)';
  document.getElementById('input-bank').value = 'SBI खाता: 20459871236 (IFSC: SBIN0001245)';

  document.getElementById('gf-input-name').value = 'सुरेश कुमार पाल';
  document.getElementById('gf-input-mobile').value = '9876543210';
  document.getElementById('gf-input-address').value = 'ग्राम बिशनपुर, बेगूसराय';
  document.getElementById('gf-input-remarks').value = 'मुझे किसान सम्मान निधि की किस्त और खाद-बीज सहायता चाहिए।';

  updateProgress(100, 'डेमो फॉर्म पूर्ण');
  showToast('✓ डेमो विवरण सफलतापूर्वक भर दिए गए हैं!');
  speakText('डेमो डेटा भर दिया गया है। आप नीचे दिए बटन से सरकारी रसीद देख सकते हैं।');
}

// --- EVENT BINDINGS ---
function bindEvents() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  document.getElementById('btn-font-dec')?.addEventListener('click', () => adjustFontScale(-0.08));
  document.getElementById('btn-font-reset')?.addEventListener('click', () => adjustFontScale(0));
  document.getElementById('btn-font-inc')?.addEventListener('click', () => adjustFontScale(0.08));

  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      state.currentLang = e.target.value;
      if (state.recognition) state.recognition.lang = state.currentLang;
      const langName = e.target.options[e.target.selectedIndex].text;
      document.getElementById('current-lang-tag').textContent = langName;
      playChime('start');
      showToast(`भाषा बदली: ${langName}`);
      speakText(`नमस्ते! भाषा ${langName} सेट हो गई है।`);
    });
  }

  const masterBtn = document.getElementById('btn-master-mic');
  if (masterBtn) {
    masterBtn.addEventListener('click', () => {
      if (state.isAutoFilling) {
        stopVoiceAutoFill();
        stopListening();
        window.speechSynthesis.cancel();
      } else {
        startVoiceAutoFill();
      }
    });
  }

  document.getElementById('btn-replay-question')?.addEventListener('click', () => {
    const qText = document.getElementById('assistant-question-text')?.textContent || '';
    if (qText) speakText(qText.replace(/"/g, ''));
  });

  document.getElementById('btn-readback-form')?.addEventListener('click', readbackFormSummary);

  document.getElementById('btn-reset-form')?.addEventListener('click', () => {
    document.getElementById('citizen-form')?.reset();
    updateProgress(0, 'प्रारंभ करें');
    playChime('click');
    showToast('नया फॉर्म शुरू किया गया');
  });

  // Scheme Cards Click & Audio Preview
  document.querySelectorAll('.scheme-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-scheme-audio')) return; // handled separately
      const schemeName = card.querySelector('.scheme-title')?.textContent || '';
      selectSchemeByName(schemeName);
      playChime('success');
      showToast(`योजना चुनी गई: ${schemeName}`);
      speakText(`आपने ${schemeName} चुनी है।`);
    });
  });

  // Scheme Audio Preview Buttons
  document.querySelectorAll('.btn-scheme-audio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-scheme-key');
      const desc = SCHEME_AUDIO_DESCRIPTIONS[key];
      if (desc) {
        playChime('start');
        speakText(desc);
      }
    });
  });

  // Field Individual Mics
  document.querySelectorAll('.btn-field-mic').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const field = btn.getAttribute('data-field');
      btn.classList.add('recording');
      triggerFieldMic(field);
    });
  });

  // Tabs
  document.getElementById('tab-btn-sarkari')?.addEventListener('click', () => switchTab('sarkari'));
  document.getElementById('tab-btn-google')?.addEventListener('click', () => switchTab('google'));

  // Form Submit
  document.getElementById('citizen-form')?.addEventListener('submit', submitCitizenForm);
  document.getElementById('btn-quick-fill-demo')?.addEventListener('click', fillSampleDemoData);

  // Google Form Voice Controls
  document.getElementById('btn-gf-autofill')?.addEventListener('click', startGoogleFormAutoFill);
  document.getElementById('btn-gf-next-field')?.addEventListener('click', () => {
    gfStepIndex++;
    advanceGoogleFormStep();
  });

  document.querySelectorAll('.gf-q-mic').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-gf-target');
      btn.classList.add('active');
      triggerGoogleFormMic(target);
    });
  });

  document.getElementById('btn-gf-submit')?.addEventListener('click', () => {
    playChime('celebrate');
    triggerConfetti();
    showToast('✓ Google Form सफलतापूर्वक जमा हो गया!');
    speakText('Google Form सफलतापूर्वक जमा हो गया है। आपका बहुत धन्यवाद!');
  });

  document.getElementById('btn-gf-clear')?.addEventListener('click', () => {
    document.querySelectorAll('.gf-text-field').forEach(input => input.value = '');
    showToast('Google Form खाली कर दिया गया');
  });

  // Modal
  document.getElementById('btn-close-slip')?.addEventListener('click', closeSlipModal);
  document.getElementById('btn-modal-close-bottom')?.addEventListener('click', closeSlipModal);
  document.getElementById('btn-print-slip')?.addEventListener('click', () => {
    window.print();
  });
}

function switchTab(tabName) {
  playChime('click');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  if (tabName === 'sarkari') {
    document.getElementById('tab-btn-sarkari')?.classList.add('active');
    document.getElementById('tab-pane-sarkari')?.classList.add('active');
  } else {
    document.getElementById('tab-btn-google')?.classList.add('active');
    document.getElementById('tab-pane-google')?.classList.add('active');
  }
}

// --- UTILITY FUNCTIONS ---
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>📢</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}
