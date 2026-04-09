# Stage 1: Build
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies
RUN npm install --workspace enterprise-payroll-client

COPY client/ ./client/
RUN npm run build --workspace enterprise-payroll-client

# Stage 2: Serve
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom config (needed for React SPA routing)
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
