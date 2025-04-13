FROM alpine:latest

# Install curl for making HTTP requests
RUN apk add --no-cache curl

# Create a script to generate test logs
RUN echo '#!/bin/sh\n\
while true; do\n\
  # JSON logs\n\
  echo "{\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\",\"level\":\"info\",\"message\":\"This is a JSON log\"}"\n\
  \n\
  # Default logs\n\
  echo "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ") [INFO] This is a default log"\n\
  \n\
  # Regex logs\n\
  echo "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ") | INFO | service=api | user=123 | action=login | status=success"\n\
  \n\
  sleep 1\n\
done' > /generate-logs.sh && chmod +x /generate-logs.sh

CMD ["/generate-logs.sh"]