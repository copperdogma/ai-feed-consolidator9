/**
 * Simple logger module for the application
 * Provides standardized logging with different severity levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  timestamp?: boolean;
  logLevel?: LogLevel;
}

class Logger {
  private defaultOptions: LogOptions = {
    timestamp: true,
    logLevel: 'info'
  };

  // Log level hierarchy for filtering
  private logLevels: { [key in LogLevel]: number } = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private currentLogLevel: LogLevel = 'info';

  /**
   * Set the current log level
   * @param level The minimum level to log
   */
  public setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  /**
   * Debug level log
   * @param message Main message to log
   * @param meta Optional metadata to include
   */
  public debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  /**
   * Info level log
   * @param message Main message to log
   * @param meta Optional metadata to include
   */
  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  /**
   * Warning level log
   * @param message Main message to log
   * @param meta Optional metadata to include
   */
  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  /**
   * Error level log
   * @param message Main message to log
   * @param meta Optional metadata to include
   */
  public error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  /**
   * Generic log method used by level-specific methods
   */
  private log(level: LogLevel, message: string, meta?: any): void {
    // Check if this level should be logged based on the current log level
    if (this.logLevels[level] < this.logLevels[this.currentLogLevel]) {
      return;
    }

    const timestamp = this.defaultOptions.timestamp ? new Date().toISOString() : '';
    const logPrefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    const logMessage = `${logPrefix} ${message}`;

    // Use the appropriate console method based on level
    switch (level) {
      case 'debug':
        console.debug(logMessage, meta ? meta : '');
        break;
      case 'info':
        console.info(logMessage, meta ? meta : '');
        break;
      case 'warn':
        console.warn(logMessage, meta ? meta : '');
        break;
      case 'error':
        console.error(logMessage, meta ? meta : '');
        break;
    }
  }
}

// Create a singleton instance
export const logger = new Logger();

// Export the types for external use
export type { LogLevel, LogOptions }; 