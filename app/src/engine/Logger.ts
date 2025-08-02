import { debugConfig } from '../config/debug';
import { isServer } from './environment';

/**
 * Logger service that provides formatted console output with variable parameters
 * Part of the Engine infrastructure, can be used by any part of the application
 */
class LoggerClass {
    /**
     * Log a debug message
     */
    debug(...args: unknown[]) {
        if (!debugConfig.enabled) return;
        const formatted = this.formatMessage('DEBUG', ...args);
        console.log(...formatted);
    }

    /**
     * Log an info message
     */
    info(...args: unknown[]) {
        const formatted = this.formatMessage('INFO', ...args);
        console.log(...formatted);
    }

    /**
     * Log an error message
     */
    error(...args: unknown[]) {
        const formatted = this.formatMessage('ERROR', ...args);
        console.error(...formatted);
    }

    /**
     * Format a log message with timestamp, level, and convert objects to strings
     */
    private formatMessage(level: string, ...args: unknown[]) {
        const timestamp = new Date().toISOString();

        if (isServer) {
            const message = args.map(arg =>
                typeof arg === 'object' && arg !== null
                    ? JSON.stringify(arg, null, 2)
                    : String(arg),
            ).join(' ');

            return [`[${timestamp}] ${level}:`, message];
        }

        return [`[${timestamp}] ${level}:`, ...args];
    }
}

// Export single instance
export const logger = new LoggerClass();
