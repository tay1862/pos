# Use Node 20 as base image
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy root package.json and workspace configurations
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database ./packages/database/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Copy the entire api app source
COPY apps/api ./apps/api

# Build the api project
WORKDIR /usr/src/app/apps/api
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy generated Prisma client from builder
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy built application
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist

WORKDIR /usr/src/app/apps/api

# Create a non-root user for security
RUN addgroup -S pgroup && adduser -S puser -G pgroup
USER puser

EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
