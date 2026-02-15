# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production && \
    npm cache clean --force

# ============================================
# Stage 2: Production Build
# ============================================
FROM node:20-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from previous stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=nodejs:nodejs . .

# Create necessary directories with correct permissions
RUN mkdir -p /app/logs /app/data && \
    chown -R nodejs:nodejs /app/logs /app/data

# Environment
ENV NODE_ENV=production \
    PORT=5001 \
    HOST=0.0.0.0

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "index.js"]
