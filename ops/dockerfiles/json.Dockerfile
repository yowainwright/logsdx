FROM oven/bun:1

WORKDIR /app

# Copy package.json, tsconfig.json, and src directory
COPY package.json tsconfig.json ./
COPY src /app/src
COPY ops/scripts/generate-json-logs.sh /app/generate-json-logs.sh

# Install dependencies
RUN bun install
RUN chmod +x /app/generate-json-logs.sh

CMD ["/app/generate-json-logs.sh"] 