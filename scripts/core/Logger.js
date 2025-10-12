/**
 * Logger - Singleton Pattern Implementation
 * Centralized logging system with different log levels
 */
class Logger {
    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }

        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };

        this.currentLevel = this.levels.INFO;
        this.logs = [];
        this.maxLogs = 1000;

        Logger.instance = this;
    }

    /**
     * Set logging level
     * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG)
     */
    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }

    /**
     * Log error message
     * @param {string} message - Error message
     * @param {*} data - Additional data
     */
    error(message, data = null) {
        this.log('ERROR', message, data);
    }

    /**
     * Log warning message
     * @param {string} message - Warning message
     * @param {*} data - Additional data
     */
    warn(message, data = null) {
        this.log('WARN', message, data);
    }

    /**
     * Log info message
     * @param {string} message - Info message
     * @param {*} data - Additional data
     */
    info(message, data = null) {
        this.log('INFO', message, data);
    }

    /**
     * Log debug message
     * @param {string} message - Debug message
     * @param {*} data - Additional data
     */
    debug(message, data = null) {
        this.log('DEBUG', message, data);
    }

    /**
     * Internal log method
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {*} data - Additional data
     */
    log(level, message, data) {
        if (this.levels[level] <= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                data,
                stack: level === 'ERROR' ? new Error().stack : null
            };

            this.logs.push(logEntry);

            // Keep only recent logs
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(-this.maxLogs);
            }

            // Console output
            const consoleMethod = level.toLowerCase();
            if (console[consoleMethod]) {
                console[consoleMethod](`[${timestamp}] ${level}: ${message}`, data || '');
            }
        }
    }

    /**
     * Get all logs or filtered logs
     * @param {string} level - Optional level filter
     * @returns {Array} Log entries
     */
    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return [...this.logs];
    }

    /**
     * Clear all logs
     */
    clear() {
        this.logs = [];
    }

    /**
     * Export logs as JSON
     * @returns {string} JSON string of logs
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Get log statistics
     * @returns {Object} Log statistics
     */
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {}
        };

        Object.keys(this.levels).forEach(level => {
            stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
        });

        return stats;
    }
}

// Export singleton instance
export default new Logger();