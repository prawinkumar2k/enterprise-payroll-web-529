FROM node:20-slim

WORKDIR /app

# Install dependencies for canvas/crypto if needed (none currently but good practice)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY server/package*.json ./server/

# Install server dependencies only
RUN npm install --workspace enterprise-payroll-server

COPY server/ ./server/
COPY .env ./

EXPOSE 5005

CMD ["npm", "run", "start", "--workspace", "enterprise-payroll-server"]
