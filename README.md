# जन सेवा वाणी AI 2.0 (Jan Seva Vaani)
## Voice-Powered Government Scheme & Google Form Assistant for Rural & Non-Literate Citizens

---

### 🇮🇳 Project Overview
Millions of rural, elderly, and non-literate citizens in India miss out on life-changing welfare schemes (like PM-Kisan, Ayushman Bharat, Ration Cards, and Pensions) because online forms are difficult to read and require typing.

**Jan Seva Vaani AI 2.0** solves this with a compassionate, multilingual AI Voice Assistant:
1. **Speaks questions aloud** in the citizen's native language (Hindi, English, etc.).
2. **Listens through the microphone**, extracting and normalizing spoken words and numbers (e.g. spoken numerals *"नौ आठ सात..."* to standard digits).
3. **Auto-fills form fields** in real time as the citizen speaks.
4. **Google Form AI Voice Auto-Pilot**: Provides an authentic Google Form replica with voice mics on every question so users can complete Google Forms without typing!
5. **Generates Official Application Slips**: Produces an official receipt with reference ID, scannable QR code, and print/PDF support.

---

### 📂 Files in this Project
- `index.html` - Complete user interface, accessible design, dual tabs (Sarkari Form & Google Form), and receipt modal.
- `styles.css` - High-contrast accessible styling, sound wave visualizer canvas, Google Forms theme, and print styles.
- `app.js` - Speech synthesis, speech recognition, vernacular number parser, form auto-fill state machine, and slip generator.
- `terminal-demo.js` - Interactive terminal CLI runner to test voice workflows inside PowerShell/CMD.
- `package.json` - NPM scripts and metadata.

---

### 🚀 How to Run

#### Option 1: Live Web Application (Browser)
1. Start a local server:
   ```bash
   python -m http.server 5500
   # or: npx serve .
   ```
2. Open in your browser:
   ```
   http://localhost:5500
   ```
   *(Or double-click `index.html`)*

#### Option 2: Terminal Interactive Demo
Run directly in PowerShell / Command Prompt:
```bash
node terminal-demo.js
```
or:
```bash
npm run terminal
```

---

### 🌟 Schemes Included
- 🌾 **पीएम किसान सम्मान निधि** (PM Kisan Samman Nidhi - ₹6,000/year)
- 🏥 **आयुष्मान भारत गोल्डन कार्ड** (Ayushman Bharat - ₹5 Lakh free health cover)
- 🍚 **राशन कार्ड एवं खाद्य सुरक्षा** (Ration Card Food Security)
- 👷 **ई-श्रम कार्ड** (e-Shram Social Security & Insurance)
- 🏠 **पीएम आवास योजना ग्रामीण** (PMAY Rural Housing Grant)
- 👵 **वृद्धावस्था व विधवा पेंशन** (Old Age & Widow Pension)

---
© 2026 Jan Seva Vaani AI Project • Digital Inclusion Initiative
