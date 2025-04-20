FROM oven/bun:1

WORKDIR /app

# Copy package.json, tsconfig.json, bunfig.toml, and src directory
COPY package.json tsconfig.json bunfig.toml ./
COPY src /app/src
COPY packages /app/packages
COPY scripts/generate-json-logs.sh /app/generate-json-logs.sh
COPY scripts/json-log-server.js /app/json-log-server.js

# Install dependencies
RUN bun install
RUN bun add express cors

# Build the packages
RUN bun run build:packages

# Make script executable
RUN chmod +x /app/generate-json-logs.sh

# Expose the API port
EXPOSE 3000

CMD ["bun", "run", "/app/json-log-server.js"]