# Use Node 20 as base image
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy root package.json and workspace configurations if any
COPY package.json package-lock.json ./
# If you are using npm workspaces, this helps install dependencies correctly
COPY apps/api/package.json ./apps/api/

# Install dependencies (ignoring scripts to speed up and avoid errors)
RUN npm ci --ignore-scripts

# Copy the entire api app source and any shared libs if applicable
COPY apps/api ./apps/api
# If Prisma is used, copy prisma schema to generate client
# COPY packages/prisma ./packages/prisma

# Build the api project
WORKDIR /usr/src/app/apps/api
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Only copy what's necessary for production
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/apps/api/package.json ./apps/api/
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
# If you have Prisma, copy the generated client and schema
# COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
# COPY --from=builder /usr/src/app/packages/prisma ./packages/prisma

# Install ONLY production dependencies
RUN npm ci --only=production --ignore-scripts

WORKDIR /usr/src/app/apps/api

# Create a non-root user for security
RUN addgroup -S pgroup && adduser -S puser -G pgroup
USER puser

EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
