const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

// Import LogsDX packages
const { getTheme, DEFAULT_THEME } = require("./dist/index");
const { parseJsonLog } = require("./packages/parsers/json/dist/index");

const logs = [];

// Get the theme
const theme = getTheme(DEFAULT_THEME);

// Generate logs every second
function generateLog() {
  const timestamp = new Date().toISOString();
  const levels = ["info", "warn", "error", "debug"];
  const statuses = ["success", "error", "pending"];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // Create a JSON log
  const jsonLog = {
    timestamp,
    level,
    message: `Processing user request with status: ${status}`,
    status,
    service: "api",
    requestId: `req-${Math.floor(Math.random() * 1000)}`
  };

  // Parse the log using LogsDX
  const parsedLog = parseJsonLog(JSON.stringify(jsonLog));

  // Get color from theme
  const color = status ? theme.status[status]?.color : theme.levels[level]?.color;
  const isBold = theme.levels[level]?.bold || false;

  // Format the log
  const formattedLog = `${timestamp} [${level.toUpperCase()}] ${jsonLog.message}`;

  // Store the log with its styling
  logs.push({ text: formattedLog, color, bold: isBold, raw: jsonLog });

  // Keep only the last 100 logs
  if (logs.length > 100) {
    logs.shift();
  }

  console.log("Generated log:", formattedLog);
}

// Generate initial logs
for (let i = 0; i < 10; i++) {
  generateLog();
}

// Generate new logs every second
setInterval(generateLog, 1000);

// API endpoint to get logs
app.get("/logs", (req, res) => {
  console.log(`Sending ${logs.length} logs to client`);
  res.json({ logs });
});

// Start the server
app.listen(3000, "0.0.0.0", () => {
  console.log("JSON log server running on port 3000");
  console.log("Initial logs:", logs);
});
