FROM oven/bun:slim

WORKDIR /app

COPY . .

RUN bun install
RUN bun build src/cli.ts --outdir=/app/dist --target=bun

ENTRYPOINT ["bun", "src/cli.ts"]