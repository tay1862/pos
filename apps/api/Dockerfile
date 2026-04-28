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

# Install ts-node and typescript globally for seeding
RUN npm install -g ts-node typescript

# Copy package files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy generated Prisma client from builder
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy the database package (including schema and seed script)
COPY --from=builder /usr/src/app/packages/database ./packages/database

# Copy built application
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist

WORKDIR /usr/src/app/apps/api

# Create a non-root user for security
RUN addgroup -S pgroup && adduser -S puser -G pgroup
# Grant puser access to the app directory so they can run the seed if needed
RUN chown -R puser:pgroup /usr/src/app
USER puser

EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
