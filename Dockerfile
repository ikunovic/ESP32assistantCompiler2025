# 🏗️ Stage 1: Builder (Compiles Next.js app)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies (including devDependencies like TypeScript)
RUN npm ci
COPY . .
# Build the Next.js app
RUN npm run build
# Prune dev dependencies to save space
RUN npm prune --production

# 🚀 Stage 2: Runner (Final Image)
FROM node:18-slim

# Install minimal runtime dependencies for Arduino CLI
# --no-install-recommends reduces size by skipping optional packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    python3 \
    python3-pip \
    python3-serial \
    && rm -rf /var/lib/apt/lists/*

# Install Arduino CLI
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Configure Arduino CLI and install ESP32 core
# We chain commands to reduce layer size and clean up immediately
RUN arduino-cli config init && \
    arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json && \
    arduino-cli core update-index && \
    arduino-cli core install esp32:esp32 && \
    arduino-cli cache clean && \
    rm -rf /root/.arduino15/staging && \
    rm -rf /root/.arduino15/packages/esp32/hardware/esp32/*/tools/sdk/esp32s2 && \
    rm -rf /root/.arduino15/packages/esp32/hardware/esp32/*/tools/sdk/esp32s3 && \
    rm -rf /root/.arduino15/packages/esp32/hardware/esp32/*/tools/sdk/esp32c3

# Create app directory
WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
