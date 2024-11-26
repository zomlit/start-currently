# Build stage
FROM oven/bun:1 as builder

# Enable BuildKit cache mount
RUN --mount=type=cache,target=/root/.bun \
    --mount=type=cache,target=/app/node_modules

WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lockb ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.bun \
    --mount=type=cache,target=/app/node_modules \
    bun i --frozen-lockfile

# Copy source code
COPY . .

# Build with caching
RUN --mount=type=cache,target=/app/.vinxi \
    --mount=type=cache,target=/app/.output \
    bun run build

# Production stage
FROM nginx:alpine

WORKDIR /usr/share/nginx/html/

# Copy built assets from builder
COPY --from=builder /app/.output/public .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 