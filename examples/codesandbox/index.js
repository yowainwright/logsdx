const { LogsDX } = require('logsdx');

console.log('🎨 LogsDX Demo - Beautiful Log Styling\n');

// Sample log data
const sampleLogs = [
  '2024-01-15 10:30:42 INFO Starting application server on port 3000',
  '2024-01-15 10:30:43 DEBUG Loading configuration from config.json',
  '2024-01-15 10:30:44 WARN Memory usage is high: 85%',
  '2024-01-15 10:30:45 ERROR Database connection failed: timeout after 5s',
  '2024-01-15 10:30:46 SUCCESS Server started successfully',
  'GET /api/users/123 200 45ms - Mozilla/5.0',
  'POST /api/login 401 23ms - Invalid credentials',
  '192.168.1.100 - Processing request in 15ms'
];

// Demo 1: Built-in themes (using actual LogsDX themes)
console.log('=== Demo 1: Built-in Themes ===\n');

const availableThemes = ['oh-my-zsh', 'dracula', 'github-light', 'github-dark', 'solarized-light', 'solarized-dark'];

availableThemes.forEach(themeName => {
  console.log(`--- ${themeName.toUpperCase()} THEME ---`);
  
  const logsDX = LogsDX.getInstance({
    theme: themeName,
    outputFormat: 'ansi'
  });
  
  sampleLogs.slice(0, 4).forEach(log => {
    console.log(logsDX.processLine(log));
  });
  
  console.log('');
});

// Demo 2: Different log types with specific themes
console.log('=== Demo 2: Different Log Types ===\n');

// API logs with dracula theme
const apiLogs = [
  'GET /api/users 200 OK 45ms',
  'POST /api/login 401 Unauthorized 23ms',
  'DELETE /api/posts/123 404 Not Found 12ms',
  'PUT /api/profile 500 Internal Server Error 156ms'
];

console.log('--- API LOGS (Dracula Theme) ---');
const apiLogsDX = LogsDX.getInstance({
  theme: 'dracula',
  outputFormat: 'ansi'
});

apiLogs.forEach(log => {
  console.log(apiLogsDX.processLine(log));
});

// System logs with solarized-dark theme  
const systemLogs = [
  '[2024-01-15 10:30:45] CRITICAL: System overload detected',
  '[2024-01-15 10:30:46] WARNING: High memory usage',
  '[2024-01-15 10:30:47] INFO: Backup completed successfully', 
  '[2024-01-15 10:30:48] DEBUG: Cache cleared'
];

console.log('\n--- SYSTEM LOGS (Solarized Dark Theme) ---');
const systemLogsDX = LogsDX.getInstance({
  theme: 'solarized-dark',
  outputFormat: 'ansi'
});

systemLogs.forEach(log => {
  console.log(systemLogsDX.processLine(log));
});

// Demo 3: HTML output (for web environments)
console.log('\n=== Demo 3: HTML Output ===\n');

const htmlLogsDX = LogsDX.getInstance({
  theme: 'dracula',
  outputFormat: 'html',
  htmlStyleFormat: 'css'
});

console.log('HTML with inline CSS:');
console.log(htmlLogsDX.processLine(sampleLogs[0]));
console.log('');

const classLogsDX = LogsDX.getInstance({
  theme: 'dracula', 
  outputFormat: 'html',
  htmlStyleFormat: 'className'
});

console.log('HTML with CSS classes:');
console.log(classLogsDX.processLine(sampleLogs[0]));

console.log('\n🎉 LogsDX Demo Complete!');