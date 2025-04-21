import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

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
  // Log processing complete
});

logGenerator.stderr.on('data', (data) => {
  console.error(`Log generator error: ${data}`);
});

// API endpoint to get logs
app.get('/logs', (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ logs }));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  // Server started successfully
});

// Handle process termination
process.on('SIGINT', () => {
  logGenerator.kill();
  process.exit();
});
