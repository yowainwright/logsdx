FROM node:23-alpine as build

WORKDIR /app

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

# Create a simple React app
RUN mkdir -p /app/ops/svcs/react-client/dist

# Create index.js
RUN echo 'document.addEventListener("DOMContentLoaded", () => {' > /app/ops/svcs/react-client/dist/index.js
RUN echo '  const root = document.getElementById("root");' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  const logs = [];' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  let currentTheme = "dracula";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  // Theme colors from LogsDX' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  const theme = {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    levels: {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      error: { color: "#ff5555", bold: true },' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      warn: { color: "#f1fa8c" },' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      info: { color: "#8be9fd" },' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      debug: { color: "#6272a4" }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    },' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    status: {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      success: { color: "#50fa7b" },' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      error: { color: "#ff5555" },' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      pending: { color: "#f1fa8c" }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  };' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  // Fetch logs from the server' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  async function fetchLogs() {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    try {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      const response = await fetch("/api/logs");' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      if (response.ok) {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        const data = await response.json();' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        if (data.logs && Array.isArray(data.logs)) {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          // Clear logs and add new ones' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          logs.length = 0;' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          data.logs.forEach(log => {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '            logs.push(log);' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          });' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          // Render logs' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          renderLogs();' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    } catch (error) {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      console.error("Error fetching logs:", error);' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  // Render logs to the DOM' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  function renderLogs() {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    // Clear the root element' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    root.innerHTML = "";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    ' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    // Create header' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    const header = document.createElement("h1");' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    header.textContent = "LogsDX React Client";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    header.style.color = "#bd93f9";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    root.appendChild(header);' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    ' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    // Create log container' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    const logContainer = document.createElement("div");' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    logContainer.style.backgroundColor = "#1e1f29";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    logContainer.style.padding = "10px";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    logContainer.style.borderRadius = "4px";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    logContainer.style.height = "70vh";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    logContainer.style.overflowY = "auto";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    logContainer.style.fontFamily = "monospace";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    ' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    // Add logs' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    if (logs.length === 0) {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      const emptyMessage = document.createElement("div");' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      emptyMessage.textContent = "No logs to display";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      emptyMessage.style.color = "#6272a4";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      emptyMessage.style.textAlign = "center";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      emptyMessage.style.padding = "20px";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      logContainer.appendChild(emptyMessage);' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    } else {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      logs.forEach(log => {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        const logLine = document.createElement("div");' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        logLine.textContent = log.text || log;' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        logLine.style.padding = "4px 0";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        logLine.style.borderBottom = "1px solid #44475a";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        ' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        // Apply styling based on log level and status' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        if (log.color) {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          logLine.style.color = log.color;' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        if (log.bold) {' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '          logLine.style.fontWeight = "bold";' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        ' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '        logContainer.appendChild(logLine);' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '      });' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    ' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    root.appendChild(logContainer);' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    ' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    // Scroll to bottom' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '    logContainer.scrollTop = logContainer.scrollHeight;' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  }' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  // Fetch logs initially and then every 2 seconds' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  fetchLogs();' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '  setInterval(fetchLogs, 2000);' >> /app/ops/svcs/react-client/dist/index.js
RUN echo '});' >> /app/ops/svcs/react-client/dist/index.js

# Create index.html
RUN echo '<!DOCTYPE html>' > /app/ops/svcs/react-client/dist/index.html
RUN echo '<html lang="en">' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '<head>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '  <meta charset="UTF-8">' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '  <title>LogsDX React Client</title>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '  <style>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '    body {' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      margin: 0;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      padding: 20px;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      background-color: #282a36;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      color: #f8f8f2;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '    }' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '    h1 {' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      color: #bd93f9;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      margin-bottom: 20px;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '    }' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '    #root {' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      max-width: 1200px;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '      margin: 0 auto;' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '    }' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '  </style>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '</head>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '<body>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '  <div id="root"></div>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '  <script src="/index.js"></script>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '</body>' >> /app/ops/svcs/react-client/dist/index.html
RUN echo '</html>' >> /app/ops/svcs/react-client/dist/index.html

FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/ops/svcs/react-client/dist /usr/share/nginx/html

# Copy the nginx configuration
COPY ops/svcs/react-client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
