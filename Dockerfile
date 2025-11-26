# Stage 1: Install production dependencies only
FROM node:18-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .

# Build Next.js application with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production image with standalone output
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy only necessary files from standalone build
COPY --from=builder /app/public ./public

# Copy standalone server files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
