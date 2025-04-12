#!/bin/bash

# Format logs from the node-logger service
kubectl logs -f deployment/node-logger | bun run src/cli/index.ts 