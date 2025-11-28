# Use Node.js 18 on Debian Bullseye (required for python3 and build tools)
FROM node:18-bullseye

# Install required system dependencies
# python3 and python3-pip are often needed by ESP32 tools (esptool)
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Arduino CLI
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Configure Arduino CLI and install ESP32 core
# We do this BEFORE copying app code to cache this heavy layer
RUN arduino-cli config init
RUN arduino-cli core update-index
RUN arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
RUN arduino-cli core update-index
# Install esp32 core (this takes a while)
RUN arduino-cli core install esp32:esp32

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
