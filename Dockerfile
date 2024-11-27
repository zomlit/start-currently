# Build stage
FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy source code and config files
COPY . .

# Build the application
ENV NODE_ENV=production
ENV VITE_DISABLE_SOURCEMAPS=true
ENV VINXI_DISABLE_SOURCEMAPS=true
ENV DISABLE_EXTRACTION=true

# Build the application (Tailwind CSS is handled by the build process)
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy the built files from builder stage
COPY --from=builder /app/.output/public /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]