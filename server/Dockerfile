# ============================================
# Enterprise Payroll Server — Production Dockerfile
# MySQL-Only Mode (No SQLite/better-sqlite3)
# ============================================

# Stage 1: Install dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install production dependencies only (no native build tools needed)
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY . .

# Remove dev/test/debug files from the image
RUN rm -rf \
    node_modules/.cache \
    *.log *.txt *.json.bak \
    test_*.js check_*.js debug*.js inspect_*.js \
    benchmarks/ load-test-results/ \
    .env .env.example

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

# Install dumb-init for proper PID 1 signal handling + wget for healthcheck
RUN apk add --no-cache dumb-init wget

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy node_modules from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=nodejs:nodejs . .

# Remove dev/test/debug files
RUN rm -rf \
    test_*.js check_*.js debug*.js inspect_*.js \
    benchmarks/ load-test-results/ \
    *.log *.txt \
    .env .env.example .env.* \
    node_modules/.cache

# Create necessary directories
RUN mkdir -p /app/logs /app/backups && \
    chown -R nodejs:nodejs /app/logs /app/backups

# Environment
ENV NODE_ENV=production \
    PORT=5005 \
    HOST=0.0.0.0

# Switch to non-root
USER nodejs

<<<<<<< HEAD
# Expose application port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5005/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
=======
EXPOSE 5005

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5005/api/health || exit 1
>>>>>>> 60eb1353e3ebfe73e68f225b57a8ceadc0bc0fee

# Start with dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "index.js"]
