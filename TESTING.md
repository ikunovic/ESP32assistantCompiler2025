# ESP32 AI Assistant - Manual Test Guide

## 🧪 TESTOVI KOJE MOŽETE POKRENUTI

### ✅ Test 1: Provjera .env.local fajla
**Cilj**: Utvrditi da li je OpenAI API key pravilno konfigurisan

**Koraci**:
1. Otvorite: `d:\Documents\AntiGravity\ESPcodeassistant\.env.local`
2. Provjerite da linija izgleda:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxx
   ```
3. API key MORA počinjati sa `sk-proj-` ili `sk-`

**Očekivani rezultat**: API key je postavljen

---

### ✅ Test 2: AI Chat Test
**Cilj**: Provjeriti radi li AI tutor

**Koraci**:
1. Otvorite aplikaciju: http://localhost:3001
2. Skrolujte do "AI Tutor" sekcije
3. Upišite pitanje: "What is GPIO?"
4. Kliknite "Send"

**Očekivani rezultat**: AI odgovara objašnjenjem GPIO-a

**Debug output u terminalu**: Trebali bi vidjeti:
```
[AI Chat] 📩 Received request
[AI Chat] 🤖 Calling OpenAI
[AI Chat] ✅ Got response from OpenAI
```

---

### ✅ Test 3: Quiz Generation Test
**Cilj**: Provjeriti generisanje pitanja

**Koraci**:
1. Pročitajte Step 1 (Understanding ESP32 GPIO Pins)
2. Skrolujte do Quiz panela
3. Kliknite "Generate Quiz" ako je potrebno

**Očekivani rezultat**: Pojavljuje se 2-3 pitanja

**Debug output**: U konzoli browsera (F12) vidjet ćete POST zahtjev na `/api/ai/quiz?action=generate`

---

### ✅ Test 4: Code Generation Test
**Cilj**: Provjeriti AI generisanje koda

**Koraci**:
1. Kliknite "✨ AI Generate Code"
2. Sačekajte

**Očekivani rezultat**: Kod se pojavi u editoru sa komentarima

---

### ✅ Test 5: Compilation Test (ZAHTIJEVA ARDUINO CLI)
**Cilj**: Testirati kompajliranje bez greške

**Preduslovi**:
```bash
arduino-cli core install esp32:esp32
```

**Koraci**:
1. U Code Editoru, provjerite da ima koda (ili generirajte)
2. Kliknite "🔨 Compile Code"  
3. Sačekajte

**Očekivani rezultat**: "✓ Compiled Successfully"

**Debug output TERMINAL**:
```
[Compile] 📩 Received compilation request, code length: XXX
[Compile] 🔍 Checking Arduino CLI installation...
[Compile] ✅ Arduino CLI found
[Compile] 🔍 Checking ESP32 core...
[Compile] ✅ ESP32 core found
[Compile] 🔨 Starting compilation...
[Compile] ✅ Compilation successful!
[Compile] 📦 Binary encoded, size: XXXX bytes
```

---

### ✅ Test 6: Web Bluetooth Connection (ZAHTIJEVA ESP32)
**Cilj**: Testirati Bluetooth konekciju

**Preduslovi**:
- ESP32 sa Bluetooth Serial sketchom (vidi README.md)
- Chrome ili Edge browser

**Koraci**:
1. Upalite ESP32 sa BT sketchom
2. Kliknite "🔗 Connect to ESP32"
3. Iz browser dialoga odaberite ESP32
4. Kliknite "Pair"

**Očekivani rezultat**: "Connected to ESP32" poruka

---

## 🐛 DEBUG OUTPUTI KOJE ĆETE VIDJETI

### U TERMINALU (gdje je npm run dev):

**AI Chat**:
- `[AI Chat] 📩 Received request` - Primljen zahtjev
- `[AI Chat] 🤖 Calling OpenAI` - Poziva se API
- `[AI Chat] ✅ Got response` - Odgovor stigao

**Compile**:
- `[Compile] 📩 Received compilation request, code length: XXX`
- `[Compile] 🔍 Checking Arduino CLI installation...`
- `[Compile] ✅ Arduino CLI found`
- `[Compile] 🔨 Starting compilation...`
- `[Compile] ✅ Compilation successful!`

### U BROWSER KONZOLI (F12):

- Network tab pokazuje API pozive
- Console tab pokazuje eventuale greške

---

## ❌ ČESTE GREŠKE I RJEŠENJA

### Greška: "OPENAI_API_KEY environment variable is missing"
**Uzrok**: API key nije postavljen  
**Rješenje**: 
1. Otvori `.env.local`
2. Dodaj: `OPENAI_API_KEY=tvoj_api_key`
3. Restartuj server (Ctrl+C pa `npm run dev`)

### Greška: "Arduino CLI not installed"
**Uzrok**: Arduino CLI nije instaliran
**Rješenje**:
```bash
winget install ArduinoSA.CLI
arduino-cli core install esp32:esp32
```

### Greška: "Web Bluetooth is not supported"
**Uzrok**: Nije Chrome/Edge browser  
**Rješenje**: Koristi Chrome ili Edge

### Greška: "ESP32 core not installed"
**Uzrok**: ESP32 board package nije instaliran  
**Rješenje**:
```bash
arduino-cli core install esp32:esp32
```

---

## 📊 ŠEMA TOKA PODATAKA

```
[USER] → [Frontend Component] → [API Route] → [External Service/Tool]
                                      ↓ 
                             [Debug Console Log]
                                      ↓
                                [Response] → [Component Update]
```

---

## 🎯 PRIORITET TESTOVA

1. **MUST DO** - Test 1 (API Key) - BEZ OVOGA NIŠTA NE RADI
2. **RECOMMENDED** - Test 2 (AI Chat) - Potvrđuje OpenAI integraciju
3. **OPTIONAL** - Test 5 (Compilation) - Zahtijeva Arduino CLI setup

---

Sretno sa testiranjem! 🚀
