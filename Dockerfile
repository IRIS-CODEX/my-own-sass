# ==========================================
# Multi-Stage Dockerfile for AgentLens Platform
# ==========================================

# Stage 1: Build the Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definition and install all dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy full application source code
COPY . .

# Set environment to production and build Vite bundle + Express server
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production Execution Environment
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy built application assets and configuration from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json
COPY --from=builder /app/.env ./.env

# Expose server port 3000
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
