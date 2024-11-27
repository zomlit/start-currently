# Build stage
FROM node:20-slim AS builder

# Install bun
RUN npm install -g bun

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.bun \
    bun install --frozen-lockfile

# Copy source files
COPY . .

# Build with cache mount
RUN --mount=type=cache,target=/app/node_modules/.cache \
    NODE_ENV=production \
    VITE_DISABLE_SOURCEMAPS=true \
    VINXI_DISABLE_SOURCEMAPS=true \
    DISABLE_EXTRACTION=true \
    bun x vinxi build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lockb ./bun.lockb
COPY --from=builder /app/node_modules ./node_modules

# Install only production dependencies
RUN npm install -g bun && \
    bun install --production --frozen-lockfile

# Ensure react-dom/server.node.js is available
RUN mkdir -p .output/server/node_modules/react-dom && \
    cp -r node_modules/react-dom/server* .output/server/node_modules/react-dom/

# Start command
CMD ["bun", "x", "vinxi", "start"]