# Use Node.js base image
FROM node:20-slim

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN NODE_ENV=production bun x vinxi build

# Start the application
CMD ["bun", "x", "vinxi", "start"] 