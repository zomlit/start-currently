# Build stage
FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies with Node.js compatibility
RUN bun install --backend=node

# Copy source code and config files, excluding extensions
COPY . .
RUN rm -rf extensions/

# Build the application
ENV NODE_ENV=production
ENV VITE_DISABLE_SOURCEMAPS=true
ENV VINXI_DISABLE_SOURCEMAPS=true
ENV DISABLE_EXTRACTION=true

# Use Node.js for the build process
RUN NODE_OPTIONS='--experimental-modules' bun run build

# Production stage
FROM nginx:alpine

# Copy the built files from builder stage
COPY --from=builder /app/.output/public /usr/share/nginx/html/

# Create a default nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]