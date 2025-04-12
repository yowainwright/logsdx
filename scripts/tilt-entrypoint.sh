#!/bin/bash

set -e

echo "▶ Rebuilding and testing logsx container..."
docker build -t logsx .

echo "▶ Streaming sample.log with logsx..."
cat fixtures/sample.log | docker run -i logsx