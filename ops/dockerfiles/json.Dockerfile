FROM node:23-alpine

WORKDIR /app

# Install express and cors
RUN npm install express cors

# Create a simple theme module
RUN mkdir -p /app/dist
RUN echo 'module.exports = {' > /app/dist/index.js
RUN echo '  getTheme: () => ({' >> /app/dist/index.js
RUN echo '    levels: {' >> /app/dist/index.js
RUN echo '      error: { color: "#ff5555", bold: true },' >> /app/dist/index.js
RUN echo '      warn: { color: "#f1fa8c" },' >> /app/dist/index.js
RUN echo '      info: { color: "#8be9fd" },' >> /app/dist/index.js
RUN echo '      debug: { color: "#6272a4" }' >> /app/dist/index.js
RUN echo '    },' >> /app/dist/index.js
RUN echo '    status: {' >> /app/dist/index.js
RUN echo '      success: { color: "#50fa7b" },' >> /app/dist/index.js
RUN echo '      error: { color: "#ff5555" },' >> /app/dist/index.js
RUN echo '      pending: { color: "#f1fa8c" }' >> /app/dist/index.js
RUN echo '    }' >> /app/dist/index.js
RUN echo '  }),' >> /app/dist/index.js
RUN echo '  DEFAULT_THEME: "dracula",' >> /app/dist/index.js
RUN echo '  THEMES: {' >> /app/dist/index.js
RUN echo '    dracula: {' >> /app/dist/index.js
RUN echo '      levels: {' >> /app/dist/index.js
RUN echo '        error: { color: "#ff5555", bold: true },' >> /app/dist/index.js
RUN echo '        warn: { color: "#f1fa8c" },' >> /app/dist/index.js
RUN echo '        info: { color: "#8be9fd" },' >> /app/dist/index.js
RUN echo '        debug: { color: "#6272a4" }' >> /app/dist/index.js
RUN echo '      },' >> /app/dist/index.js
RUN echo '      status: {' >> /app/dist/index.js
RUN echo '        success: { color: "#50fa7b" },' >> /app/dist/index.js
RUN echo '        error: { color: "#ff5555" },' >> /app/dist/index.js
RUN echo '        pending: { color: "#f1fa8c" }' >> /app/dist/index.js
RUN echo '      }' >> /app/dist/index.js
RUN echo '    }' >> /app/dist/index.js
RUN echo '  }' >> /app/dist/index.js
RUN echo '};' >> /app/dist/index.js

# Create a simple JSON parser module
RUN mkdir -p /app/packages/parsers/json/dist
RUN echo 'module.exports = {' > /app/packages/parsers/json/dist/index.js
RUN echo '  parseJsonLog: (logString) => {' >> /app/packages/parsers/json/dist/index.js
RUN echo '    try {' >> /app/packages/parsers/json/dist/index.js
RUN echo '      return JSON.parse(logString);' >> /app/packages/parsers/json/dist/index.js
RUN echo '    } catch (error) {' >> /app/packages/parsers/json/dist/index.js
RUN echo '      return { level: "error", message: `Failed to parse log: ${logString}` };' >> /app/packages/parsers/json/dist/index.js
RUN echo '    }' >> /app/packages/parsers/json/dist/index.js
RUN echo '  }' >> /app/packages/parsers/json/dist/index.js
RUN echo '};' >> /app/packages/parsers/json/dist/index.js

# Create server.js file
RUN echo 'const express = require("express");' > /app/server.js
RUN echo 'const cors = require("cors");' >> /app/server.js
RUN echo 'const app = express();' >> /app/server.js
RUN echo 'app.use(cors());' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '// Import LogsDX packages' >> /app/server.js
RUN echo 'const { getTheme, DEFAULT_THEME } = require("./dist/index");' >> /app/server.js
RUN echo 'const { parseJsonLog } = require("./packages/parsers/json/dist/index");' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo 'const logs = [];' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '// Get the theme' >> /app/server.js
RUN echo 'const theme = getTheme(DEFAULT_THEME);' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '// Generate logs every second' >> /app/server.js
RUN echo 'function generateLog() {' >> /app/server.js
RUN echo '  const timestamp = new Date().toISOString();' >> /app/server.js
RUN echo '  const levels = ["info", "warn", "error", "debug"];' >> /app/server.js
RUN echo '  const statuses = ["success", "error", "pending"];' >> /app/server.js
RUN echo '  const level = levels[Math.floor(Math.random() * levels.length)];' >> /app/server.js
RUN echo '  const status = statuses[Math.floor(Math.random() * statuses.length)];' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  // Create a JSON log' >> /app/server.js
RUN echo '  const jsonLog = {' >> /app/server.js
RUN echo '    timestamp,' >> /app/server.js
RUN echo '    level,' >> /app/server.js
RUN echo '    message: `Processing user request with status: ${status}`,' >> /app/server.js
RUN echo '    status,' >> /app/server.js
RUN echo '    service: "api",' >> /app/server.js
RUN echo '    requestId: `req-${Math.floor(Math.random() * 1000)}`' >> /app/server.js
RUN echo '  };' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  // Parse the log using LogsDX' >> /app/server.js
RUN echo '  parseJsonLog(JSON.stringify(jsonLog));' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  // Get color from theme based on level and status' >> /app/server.js
RUN echo '  let color;' >> /app/server.js
RUN echo '  if (status && theme.status && theme.status[status]) {' >> /app/server.js
RUN echo '    color = theme.status[status].color;' >> /app/server.js
RUN echo '  } else if (theme.levels && theme.levels[level]) {' >> /app/server.js
RUN echo '    color = theme.levels[level].color;' >> /app/server.js
RUN echo '  } else {' >> /app/server.js
RUN echo '    color = "#ffffff";' >> /app/server.js
RUN echo '  }' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  const isBold = theme.levels[level]?.bold || false;' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  // Format the log' >> /app/server.js
RUN echo '  const formattedLog = `${timestamp} [${level.toUpperCase()}] ${jsonLog.message}`;' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  // Log to console with color' >> /app/server.js
RUN echo '  console.log(`\x1b[38;2;${parseInt(color.substring(1, 3), 16)};${parseInt(color.substring(3, 5), 16)};${parseInt(color.substring(5, 7), 16)}m${formattedLog}\x1b[0m`);' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  // Store the log with its styling' >> /app/server.js
RUN echo '  logs.push({' >> /app/server.js
RUN echo '    text: formattedLog,' >> /app/server.js
RUN echo '    color,' >> /app/server.js
RUN echo '    bold: isBold,' >> /app/server.js
RUN echo '    raw: jsonLog' >> /app/server.js
RUN echo '  });' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '  // Keep only the last 100 logs' >> /app/server.js
RUN echo '  if (logs.length > 100) {' >> /app/server.js
RUN echo '    logs.shift();' >> /app/server.js
RUN echo '  }' >> /app/server.js
RUN echo '}' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '// Generate initial logs' >> /app/server.js
RUN echo 'for (let i = 0; i < 10; i++) {' >> /app/server.js
RUN echo '  generateLog();' >> /app/server.js
RUN echo '}' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '// Generate new logs every second' >> /app/server.js
RUN echo 'setInterval(generateLog, 1000);' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '// API endpoint to get logs' >> /app/server.js
RUN echo 'app.get("/logs", (req, res) => {' >> /app/server.js
RUN echo '  res.json({ logs });' >> /app/server.js
RUN echo '});' >> /app/server.js
RUN echo '' >> /app/server.js
RUN echo '// Start the server' >> /app/server.js
RUN echo 'app.listen(3000, "0.0.0.0", () => {' >> /app/server.js
RUN echo '  console.log("JSON log server running on port 3000");' >> /app/server.js
RUN echo '});' >> /app/server.js

# Expose the API port
EXPOSE 3000

CMD ["node", "server.js"]
