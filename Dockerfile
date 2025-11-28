# 🏗️ Stage 1: Builder (Compiles Next.js app)
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies
RUN npm ci
COPY . .
# Build the Next.js app
RUN npm run build
# Prune dev dependencies
RUN npm prune --production

# 🚀 Stage 2: Runner (Final Image)
FROM node:18-slim

# Install minimal runtime dependencies
# python3 is required for esptool
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
# We chain commands and aggressively clean up unused toolchains (S2, S3, C3, RISC-V)
RUN arduino-cli config init && \
    arduino-cli config set board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json && \
    arduino-cli core update-index && \
    arduino-cli core install esp32:esp32 && \
    # Cleanup 1: Remove staging and cache
    arduino-cli cache clean && \
    rm -rf /root/.arduino15/staging && \
    # Cleanup 2: Remove unused toolchains (We only need xtensa-esp32-elf)
    rm -rf /root/.arduino15/packages/esp32/tools/xtensa-esp32s2-elf-gcc && \
    rm -rf /root/.arduino15/packages/esp32/tools/xtensa-esp32s3-elf-gcc && \
    rm -rf /root/.arduino15/packages/esp32/tools/riscv32-esp-elf-gcc && \
    rm -rf /root/.arduino15/packages/esp32/tools/openocd-esp32 && \
    # Cleanup 3: Remove examples and docs from the core
    find /root/.arduino15/packages/esp32/hardware/esp32 -name "examples" -type d -exec rm -rf {} + && \
    find /root/.arduino15/packages/esp32/hardware/esp32 -name "doc" -type d -exec rm -rf {} + && \
    find /root/.arduino15/packages/esp32/hardware/esp32 -name "docs" -type d -exec rm -rf {} +

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
