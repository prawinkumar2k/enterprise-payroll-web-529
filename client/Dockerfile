# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ============================================
# Stage 2: Production Serve
# ============================================
FROM nginx:1.25-alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Create cache and run directories with correct permissions
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
