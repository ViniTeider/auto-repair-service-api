# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies required for building
COPY package*.json ./
RUN npm ci

# Copy source code and build NestJS
COPY . .
RUN npm run build

# Remove development dependencies to keep production light
RUN npm prune --omit=dev

# ==========================================
# 2. Production Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Run container as non-root user for security compliance
USER node

# Copy production artifacts from the builder stage
COPY --chown=node:node --from=builder /usr/src/app/package*.json ./
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Launch compiled NestJS main entrypoint
CMD ["node", "dist/main.js"]