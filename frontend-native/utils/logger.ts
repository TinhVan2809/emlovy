/**
 * Logger Utility - Chỉ log khi development
 * Tự động tắt trong production để tối ưu performance
 */

const isDevelopment = __DEV__;

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

class Logger {
  private prefix: string;
  private enabled: boolean;

  constructor(prefix: string, enabled: boolean = isDevelopment) {
    this.prefix = prefix;
    this.enabled = enabled;
  }

  private formatMessage(message: string, data?: any): string {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    return `[${timestamp}] [${this.prefix}] ${message}`;
  }

  log(message: string, data?: any) {
    if (!this.enabled) return;
    if (data !== undefined) {
      console.log(this.formatMessage(message), data);
    } else {
      console.log(this.formatMessage(message));
    }
  }

  info(message: string, data?: any) {
    if (!this.enabled) return;
    if (data !== undefined) {
      console.info(this.formatMessage(message), data);
    } else {
      console.info(this.formatMessage(message));
    }
  }

  warn(message: string, data?: any) {
    if (!this.enabled) return;
    if (data !== undefined) {
      console.warn(this.formatMessage(message), data);
    } else {
      console.warn(this.formatMessage(message));
    }
  }

  error(message: string, error?: any) {
    if (!this.enabled) return;
    if (error !== undefined) {
      console.error(this.formatMessage(message), error);
    } else {
      console.error(this.formatMessage(message));
    }
  }

  debug(message: string, data?: any) {
    if (!this.enabled) return;
    if (data !== undefined) {
      console.debug(this.formatMessage(message), data);
    } else {
      console.debug(this.formatMessage(message));
    }
  }

  /**
   * Log chỉ khi condition = true
   */
  logIf(condition: boolean, message: string, data?: any) {
    if (condition) {
      this.log(message, data);
    }
  }
}

/**
 * Tạo logger cho module cụ thể
 * 
 * @example
 * const logger = createLogger('UnreadMessages');
 * logger.log('Fetching count...'); // [12:34:56.789] [UnreadMessages] Fetching count...
 */
export function createLogger(prefix: string, enabled?: boolean): Logger {
  return new Logger(prefix, enabled);
}

/**
 * Logger mặc định (global)
 */
export const logger = new Logger('App');

/**
 * Disable toàn bộ logging (useful cho testing)
 */
export function disableLogging() {
  // Override console methods
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.debug = () => {};
  // Giữ console.error để catch critical errors
}
