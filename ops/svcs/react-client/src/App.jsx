import React, { useState, useEffect, useRef } from 'react';
// Import from the LogsDX package
import { getTheme, getLevelColor, getStatusColor, DEFAULT_THEME, THEMES } from '../../../src/theme';

// Enhanced log processor with theme support
const LogEnhancer = {
  // Current theme name
  themeName: DEFAULT_THEME,

  // Set the theme
  setTheme(themeName) {
    this.themeName = themeName;
  },

  // Process a log line with theme-based styling
  process: (log) => {
    try {
      // Parse the log as JSON
      const parsedLog = JSON.parse(log);

      // Extract level and status from the parsed log
      const level = parsedLog.level || 'info';
      const status = parsedLog.status || null;

      // Get color from theme
      const theme = getTheme(LogEnhancer.themeName);
      const color = status ? getStatusColor(status, LogEnhancer.themeName) : getLevelColor(level, LogEnhancer.themeName);

      // Format the log for display
      const formattedLog = `${parsedLog.timestamp} [${level.toUpperCase()}] ${parsedLog.message} ${status ? `(${status})` : ''}`;

      // Apply styling
      return <span style={{ color, fontWeight: theme.levels[level]?.bold ? 'bold' : 'normal' }}>{formattedLog}</span>;
    } catch (error) {
      // If parsing fails, just return the raw log
      return <span>{log}</span>;
    }
  }
};

function App() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const logContainerRef = useRef(null);
  const enhancerRef = useRef(null);

  // Available themes for the dropdown
  const availableThemes = Object.keys(THEMES);

  // Handle theme change
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setCurrentTheme(newTheme);
    if (enhancerRef.current) {
      enhancerRef.current.setTheme(newTheme);
    }
  };

  useEffect(() => {
    // Set the enhancer reference
    enhancerRef.current = LogEnhancer;
    // Set initial theme
    enhancerRef.current.setTheme(currentTheme);

    // Fetch logs from the JSON logger service
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (response.ok) {
          const data = await response.json();
          if (data.logs && Array.isArray(data.logs)) {
            setLogs(prev => [...prev, ...data.logs.filter(log => log.trim())]);
          }
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    // Fetch logs initially and then every 2 seconds
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter logs based on search term
  const filteredLogs = logs.filter(log =>
    filter ? log.toLowerCase().includes(filter.toLowerCase()) : true
  );

  // Process logs through the enhancer
  const processLog = (log) => {
    if (!enhancerRef.current) return log;
    try {
      return enhancerRef.current.process(log);
    } catch (error) {
      console.error('Error processing log:', error);
      return log;
    }
  };

  return (
    <div className="app">
      <h1>LogsDX React Client</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          value={currentTheme}
          onChange={handleThemeChange}
          className="theme-selector"
        >
          {availableThemes.map(theme => (
            <option key={theme} value={theme}>{theme}</option>
          ))}
        </select>
        <button onClick={() => setAutoScroll(!autoScroll)}>
          {autoScroll ? 'Disable Auto-scroll' : 'Enable Auto-scroll'}
        </button>
        <button onClick={() => setLogs([])}>Clear Logs</button>
      </div>

      <div className="log-container" ref={logContainerRef}>
        {filteredLogs.length === 0 ? (
          <div className="empty-logs">No logs to display</div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className="log-line">
              {processLog(log)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
