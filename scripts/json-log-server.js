const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Store logs in memory
let logs = [];
const MAX_LOGS = 1000;

// Start the log generator script
// Use the script that uses LogsDX
const logGenerator = spawn('sh', ['/app/generate-json-logs.sh']);

// Capture logs from the script
logGenerator.stdout.on('data', (data) => {
  const logLines = data.toString().split('\n').filter(line => line.trim());
  logs = [...logs, ...logLines].slice(-MAX_LOGS); // Keep only the last MAX_LOGS
  console.log('New log:', logLines[0]);
});

logGenerator.stderr.on('data', (data) => {
  console.error(`Log generator error: ${data}`);
});

// API endpoint to get logs
app.get('/logs', (req, res) => {
  res.send(logs.join('\n'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`JSON log server listening at http://0.0.0.0:${port}`);
});

// Handle process termination
process.on('SIGINT', () => {
  logGenerator.kill();
  process.exit();
});
