# 🚀 ESP32 AI Education Assistant

An AI-powered educational platform for learning ESP32 development with step-by-step guidance, interactive quizzes, code generation, compilation, and Web Bluetooth upload capabilities.

## ✨ Features

- **🤖 AI Tutor**: OpenAI-powered assistant for ESP32 programming help
- **📝 Interactive Quizzes**: Learn and validate knowledge before proceeding
- **💻 Code Generation**: AI generates ESP32 Arduino code based on requirements
- **🔨 Compilation**: Compile code using Arduino CLI
- **📡 Web Bluetooth Upload**: Upload compiled binaries directly to ESP32 via Bluetooth
- **🎯 Step-by-Step Learning**: Structured tutorials with clear objectives

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Arduino CLI** - Required for compiling ESP32 code
3. **OpenAI API Key** - For AI features
4. **Chrome or Edge browser** - For Web Bluetooth support
5. **ESP32 Board** - For testing uploads

## 🛠️ Setup Instructions

### 1. Install Arduino CLI

**Windows (PowerShell):**
```powershell
winget install ArduinoSA.CLI
```

Or download from: https://arduino.github.io/arduino-cli/installation/

**Verify installation:**
```bash
arduino-cli version
```

### 2. Install ESP32 Board Support

```bash
arduino-cli core update-index
arduino-cli core install esp32:esp32
```

**Verify ESP32 installation:**
```bash
arduino-cli board  listall esp32
```

### 3. Configure OpenAI API Key

1. Get your API key from: https://platform.openai.com/api-keys
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```
3. Edit `.env.local` and replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome or Edge browser.

## 🎓 How to Use

### Starting a Tutorial

1. **Read the lesson** - Each step explains ESP32 concepts clearly
2. **Answer quiz questions** - Test your understanding (60% required to pass)
3. **Generate or write code** - Use AI to generate code or write your own
4. **Compile** - Click "Compile Code" to build the binary
5. **Upload** - Connect via Bluetooth and upload to your ESP32
6. **Verify** - See your code running on the hardware!

### Web Bluetooth Setup (ESP32)

For Web Bluetooth to work, your ESP32 needs Bluetooth Serial enabled. Here's a basic sketch to upload once via USB:

```cpp
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32"); // Bluetooth device name
  Serial.println("Bluetooth Started!");
}

void loop() {
  if (SerialBT.available()) {
    Serial.write(SerialBT.read());
  }
  if (Serial.available()) {
    SerialBT.write(Serial.read());
  }
}
```

Upload this via USB first, then you can connect via Web Bluetooth from the browser.

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── AITutor.tsx      # AI chat interface
│   │   ├── QuizPanel.tsx    # Quiz system
│   │   ├── CodeEditor.tsx   # Code editor
│   │   ├── CompilePanel.tsx # Compilation UI
│   │   └── BluetoothUpload.tsx # BT upload interface
│   ├── data/
│   │   └── tutorials/       # Tutorial content
│   ├── pages/
│   │   ├── api/             # API routes
│   │   │   ├── ai/          # OpenAI endpoints
│   │   │   └── compile.ts   # Compilation endpoint
│   │   └── index.tsx        # Main page
│   ├── styles/
│   │   └── globals.css      # Design system
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── utils/
│       ├── arduino-cli.ts   # Arduino CLI wrapper
│       └── bluetooth.ts     # Web Bluetooth manager
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🔧 Troubleshooting

### Arduino CLI not found
- Make sure Arduino CLI is in your PATH
- Restart your terminal after installation
- Verify with: `arduino-cli version`

### ESP32 core not installed
```bash
arduino-cli core install esp32:esp32
```

### Compilation errors
- Check that your code syntax is correct
- Ask the AI Tutor for help
- Verify ESP32 board is installed

### Web Bluetooth connection issues
- Use Chrome or Edge (Firefox doesn't support Web Bluetooth)
- Make sure ESP32 has Bluetooth Serial enabled
- ESP32 should be within range and powered on
- Check browser console for detailed error messages

### OpenAI API errors
- Verify your API key in `.env.local`
- Check you have credits in your OpenAI account
- Restart the dev server after changing `.env.local`

## 🎯 Current Tutorials

- **Blink LED** - Introduction to ESP32 GPIO and digital output

## 🚧 Future Features

- More tutorials (WiFi, sensors, interrupts, etc.)
- Save progress locally
- Share code snippets
- Advanced OTA update protocol
- Multi-language support

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and pull requests.

---

Built with ❤️ using Next.js, OpenAI, and Arduino CLI
