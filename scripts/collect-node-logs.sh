#!/bin/bash

# Get the logs from the node-logger pod
kubectl logs -f deployment/node-logger | \
  # Pipe the logs to logsdx for formatting
  bun run src/cli.ts --level=info 