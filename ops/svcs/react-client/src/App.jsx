import React, { useState, useEffect, useRef } from 'react';
// Import from the LogsDX React client package
// Import theme utilities directly from the core package
import { getTheme, DEFAULT_THEME, THEMES } from '../../../src/theme';

// Import the log processing utilities
const processJsonLog = (logString, themeName, theme) => {
  try {
    // Parse the log
    const parsedLog = parseJsonLog(logString);

    // Get the color
    const color = getLogColor(parsedLog, themeName, theme);

    // Determine if it should be bold
    const isBold = shouldBeBold(parsedLog, theme);

    // Format the log
    const formattedLog = formatLog(parsedLog);

    // Return the processed log
    return {
      parsedLog,
      formattedLog,
      style: {
        color,
        fontWeight: isBold ? 'bold' : 'normal'
      }
    };
  } catch (error) {
    return {
      parsedLog: { raw: logString },
      formattedLog: logString,
      style: {}
    };
  }
};

// Helper functions
function parseJsonLog(logString) {
  try {
    // Parse the JSON string
    const log = JSON.parse(logString);

    // Extract common fields
    const {
      timestamp,
      level = 'info',
      message = '',
      status = null,
      ...rest
    } = log;

    return {
      raw: logString,
      timestamp,
      level,
      message,
      status,
      metadata: rest
    };
  } catch (error) {
    // Return a basic object if parsing fails
    return {
      raw: logString,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Failed to parse log: ${logString}`,
      status: 'error',
      metadata: { parseError: error.message }
    };
  }
}

function formatLog(parsedLog) {
  const { timestamp, level, message, status } = parsedLog;

  // Format the timestamp if it exists
  const formattedTime = timestamp ? `${timestamp} ` : '';

  // Format the level
  const formattedLevel = level ? `[${level.toUpperCase()}] ` : '';

  // Format the status if it exists
  const formattedStatus = status ? ` (${status})` : '';

  // Combine all parts
  return `${formattedTime}${formattedLevel}${message}${formattedStatus}`;
}

function getLogColor(parsedLog, themeName, theme) {
  const { level, status } = parsedLog;

  // Use status color if available, otherwise use level color
  if (status && theme.status && theme.status[status]) {
    return theme.status[status].color;
  }

  return theme.levels[level]?.color || theme.levels.info.color;
}

function shouldBeBold(parsedLog, theme) {
  const { level } = parsedLog;
  return theme.levels[level]?.bold || false;
}

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
      // Get the theme
      const theme = getTheme(LogEnhancer.themeName);

      // Process the log using the LogsDX React client
      const { formattedLog, style } = processJsonLog(log, LogEnhancer.themeName, theme);

      // Return the styled log
      return <span style={style}>{formattedLog}</span>;
    } catch (error) {
      console.error('Error processing log:', error);
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
          const text = await response.text();
          try {
            // Try to parse as JSON first
            const data = JSON.parse(text);
            if (data.logs && Array.isArray(data.logs)) {
              // Filter out empty logs and add only new logs
              const newLogs = data.logs.filter(log => log.trim());
              setLogs(prev => {
                // Only add logs that aren't already in the list
                const existingLogs = new Set(prev);
                const uniqueNewLogs = newLogs.filter(log => !existingLogs.has(log));
                return [...prev, ...uniqueNewLogs];
              });
            }
          } catch (parseError) {
            // If JSON parsing fails, try to split by newlines
            const logLines = text.split('\n').filter(line => line.trim());
            if (logLines.length > 0) {
              setLogs(prev => {
                // Only add logs that aren't already in the list
                const existingLogs = new Set(prev);
                const uniqueNewLogs = logLines.filter(log => !existingLogs.has(log));
                return [...prev, ...uniqueNewLogs];
              });
            }
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
