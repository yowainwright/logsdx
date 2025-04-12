#!/bin/bash

# ASCII art header
echo "
 _   _             _____  _             _    _             
| \\ | |           |  _  || |           | |  (_)            
|  \\| | ___   ___ | | | || | ___   ___ | | ___ _ __   __ _ 
| . \` |/ _ \\ / _ \\| | | || |/ _ \\ / _ \\| |/ / | '_ \\ / _\` |
| |\\  | (_) | (_) \\ \\_/ /| | (_) | (_) |   <| | | | | (_| |
\\_| \\_/\\___/ \\___/ \\___/ |_|\\___/ \\___/|_|\\_\\_|_| |_|\\__, |
                                                        __/ |
                                                       |___/ 
"

echo "Collecting logs from node-logger service..."
echo "Press Ctrl+C to stop"
echo "-------------------------------------------"

# Get the logs from the node-logger pod and pipe to logsdx
kubectl logs -f deployment/node-logger | \
  bun run src/cli.ts --level=info 