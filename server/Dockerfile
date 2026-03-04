# ============================================
# Stage 1: Dependencies (with native build tools for better-sqlite3)
# ============================================
FROM node:20-alpine AS dependencies

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL deps first (needed for native rebuild), then prune
RUN npm ci && \
    npm cache clean --force

# ============================================
# Stage 2: Production Build
# ============================================
FROM node:20-alpine AS production

# Install sqlite runtime + dumb-init for proper PID 1 handling
RUN apk add --no-cache sqlite libstdc++ dumb-init

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from previous stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=nodejs:nodejs . .

# Create necessary directories with correct permissions
RUN mkdir -p /app/logs /app/data /app/backups && \
    chown -R nodejs:nodejs /app/logs /app/data /app/backups

# Environment
ENV NODE_ENV=production \
    PORT=5001 \
    HOST=0.0.0.0 \
    DATA_PATH=/app/data

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5001/api/health || exit 1

# Start application with dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "index.js"]
