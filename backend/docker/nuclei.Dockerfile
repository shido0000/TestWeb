# ============================================
# Nuclei Dockerfile
# ============================================
# Vulnerability scanner using Nuclei templates

FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make gcc musl-dev

# Install Nuclei
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl \
    bind-tools \
    && update-ca-certificates

# Copy Nuclei binary
COPY --from=builder /go/bin/nuclei /usr/local/bin/nuclei

# Create templates directory
RUN mkdir -p /nuclei-templates

# Update templates
RUN nuclei -update-templates

# Set working directory
WORKDIR /nuclei-templates

# Default command
CMD ["nuclei", "-update-templates"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD nuclei -version || exit 1
