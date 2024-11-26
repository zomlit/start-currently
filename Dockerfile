# Build stage
FROM ghcr.io/railwayapp/nixpacks:ubuntu-1727136237

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun i --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN NODE_ENV=production bun x vinxi build

# Start the application
CMD ["bun", "x", "vinxi", "start"] 