FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY client/package.json ./client/
RUN npm install && cd client && npm install

# Build
FROM deps AS builder
COPY . .
RUN cd client && npx vite build

# Runner
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["npx", "tsx", "server/index.ts"]
