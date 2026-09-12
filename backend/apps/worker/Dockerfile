# ============================================
# TestHub Worker Dockerfile (Phase 1 + Phase 2)
# ============================================
# Worker with Playwright, Lighthouse, axe-core, and security tools

FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Install system dependencies for security tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Nuclei
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest || \
    curl -sL https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_*_linux_amd64.tar.gz | tar xz -C /usr/local/bin

# Install testssl.sh
RUN git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl.sh && \
    ln -s /opt/testssl.sh/testssl.sh /usr/local/bin/testssl.sh

# Copy package files
COPY package*.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/scanners/package*.json ./packages/scanners/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build packages
RUN npm run build -w packages/shared
RUN npm run build -w packages/database
RUN npm run build -w packages/scanners

# Build worker
RUN npm run build -w apps/worker

# Expose port (for health checks)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start worker
CMD ["npm", "run", "start", "-w", "apps/worker"]
