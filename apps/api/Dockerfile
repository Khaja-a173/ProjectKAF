FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/db/package*.json ./packages/db/
COPY packages/utils/package*.json ./packages/utils/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma client
RUN cd packages/db && npm run db:generate

# Build the application
RUN cd apps/api && npm run build

EXPOSE 8000

CMD ["npm", "run", "start"]