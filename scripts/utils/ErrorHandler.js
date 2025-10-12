import Logger from '../core/Logger.js';

/**
 * Base Error Class
 */
export class PortfolioError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', context = {}) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.context = context;
        this.timestamp = new Date().toISOString();
        
        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Get error details as object
     * @returns {Object} Error details
     */
    toObject() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }

    /**
     * Get error as JSON string
     * @returns {string} JSON error
     */
    toJSON() {
        return JSON.stringify(this.toObject(), null, 2);
    }
}

/**
 * Component Error
 */
export class ComponentError extends PortfolioError {
    constructor(message, componentName, context = {}) {
        super(message, 'COMPONENT_ERROR', { componentName, ...context });
        this.componentName = componentName;
    }
}

/**
 * Configuration Error
 */
export class ConfigError extends PortfolioError {
    constructor(message, configPath, context = {}) {
        super(message, 'CONFIG_ERROR', { configPath, ...context });
        this.configPath = configPath;
    }
}

/**
 * Animation Error
 */
export class AnimationError extends PortfolioError {
    constructor(message, element, strategy, context = {}) {
        super(message, 'ANIMATION_ERROR', { element: element?.tagName, strategy, ...context });
        this.element = element;
        this.strategy = strategy;
    }
}

/**
 * Network Error
 */
export class NetworkError extends PortfolioError {
    constructor(message, url, status, context = {}) {
        super(message, 'NETWORK_ERROR', { url, status, ...context });
        this.url = url;
        this.status = status;
    }
}

/**
 * Validation Error
 */
export class ValidationError extends PortfolioError {
    constructor(message, field, value, context = {}) {
        super(message, 'VALIDATION_ERROR', { field, value, ...context });
        this.field = field;
        this.value = value;
    }
}

/**
 * Error Handler - Centralized error handling system
 */
export class ErrorHandler {
    constructor() {
        this.handlers = new Map();
        this.errorQueue = [];
        this.maxQueueSize = 100;
        this.retryAttempts = new Map();
        this.setupGlobalHandlers();
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(new PortfolioError(
                `Unhandled Promise Rejection: ${event.reason}`,
                'UNHANDLED_PROMISE',
                { reason: event.reason }
            ));
            event.preventDefault();
        });

        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(new PortfolioError(
                event.message,
                'JAVASCRIPT_ERROR',
                {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error
                }
            ));
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(new PortfolioError(
                    `Resource failed to load: ${event.target.src || event.target.href}`,
                    'RESOURCE_ERROR',
                    {
                        element: event.target.tagName,
                        src: event.target.src || event.target.href
                    }
                ));
            }
        }, true);
    }

    /**
     * Register error handler for specific error types
     * @param {string} errorCode - Error code to handle
     * @param {Function} handler - Error handler function
     */
    registerHandler(errorCode, handler) {
        if (!this.handlers.has(errorCode)) {
            this.handlers.set(errorCode, []);
        }
        this.handlers.get(errorCode).push(handler);
    }

    /**
     * Unregister error handler
     * @param {string} errorCode - Error code
     * @param {Function} handler - Handler to remove
     */
    unregisterHandler(errorCode, handler) {
        const handlers = this.handlers.get(errorCode);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Handle error with appropriate strategy
     * @param {Error} error - Error to handle
     * @param {Object} options - Handling options
     */
    async handleError(error, options = {}) {
        const {
            silent = false,
            retry = false,
            maxRetries = 3,
            fallback = null,
            notify = true
        } = options;

        // Ensure error is PortfolioError instance
        const portfolioError = error instanceof PortfolioError 
            ? error 
            : new PortfolioError(error.message || 'Unknown error', 'GENERIC_ERROR', { originalError: error });

        // Log error
        Logger.error(`Error handled: ${portfolioError.code}`, portfolioError.toObject());

        // Add to error queue
        this.addToQueue(portfolioError);

        // Execute registered handlers
        await this.executeHandlers(portfolioError);

        // Handle retry logic
        if (retry && this.shouldRetry(portfolioError, maxRetries)) {
            return this.retryOperation(portfolioError, options);
        }

        // Execute fallback if provided
        if (fallback && typeof fallback === 'function') {
            try {
                return await fallback(portfolioError);
            } catch (fallbackError) {
                Logger.error('Fallback function failed', fallbackError);
            }
        }

        // Notify user if not silent
        if (!silent && notify) {
            this.notifyUser(portfolioError);
        }

        // Return error for further handling
        return portfolioError;
    }

    /**
     * Execute registered handlers for error
     * @param {PortfolioError} error - Error to handle
     */
    async executeHandlers(error) {
        const handlers = this.handlers.get(error.code) || [];
        const globalHandlers = this.handlers.get('*') || [];
        
        const allHandlers = [...handlers, ...globalHandlers];

        for (const handler of allHandlers) {
            try {
                await handler(error);
            } catch (handlerError) {
                Logger.error('Error handler failed', handlerError);
            }
        }
    }

    /**
     * Add error to queue
     * @param {PortfolioError} error - Error to add
     */
    addToQueue(error) {
        this.errorQueue.push(error);
        
        // Maintain queue size
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }
    }

    /**
     * Check if operation should be retried
     * @param {PortfolioError} error - Error that occurred
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {boolean} Should retry
     */
    shouldRetry(error, maxRetries) {
        const key = `${error.code}-${JSON.stringify(error.context)}`;
        const attempts = this.retryAttempts.get(key) || 0;
        
        if (attempts >= maxRetries) {
            this.retryAttempts.delete(key);
            return false;
        }

        // Don't retry certain error types
        const nonRetryableErrors = ['VALIDATION_ERROR', 'CONFIG_ERROR'];
        if (nonRetryableErrors.includes(error.code)) {
            return false;
        }

        return true;
    }

    /**
     * Retry failed operation
     * @param {PortfolioError} error - Original error
     * @param {Object} options - Retry options
     */
    async retryOperation(error, options) {
        const key = `${error.code}-${JSON.stringify(error.context)}`;
        const attempts = this.retryAttempts.get(key) || 0;
        
        this.retryAttempts.set(key, attempts + 1);

        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        Logger.info(`Retrying operation: ${error.code}, attempt ${attempts + 1}`);

        // Retry logic should be implemented by the caller
        // This method prepares for retry
        return { shouldRetry: true, attempts: attempts + 1 };
    }

    /**
     * Notify user of error
     * @param {PortfolioError} error - Error to display
     */
    notifyUser(error) {
        // Create user-friendly error messages
        const userMessages = {
            'COMPONENT_ERROR': 'A component failed to load properly. Please refresh the page.',
            'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
            'ANIMATION_ERROR': 'Animation failed to run. Continuing without animation.',
            'RESOURCE_ERROR': 'Some resources failed to load. The page may not display correctly.',
            'CONFIG_ERROR': 'Configuration error detected. Using default settings.',
            'DEFAULT': 'An unexpected error occurred. Please refresh the page if problems persist.'
        };

        const message = userMessages[error.code] || userMessages.DEFAULT;

        // Show notification (you could integrate with a toast library here)
        this.showNotification(message, 'error');
    }

    /**
     * Show notification to user
     * @param {string} message - Message to show
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        // Simple console notification (replace with actual notification system)
        console.log(`[${type.toUpperCase()}] ${message}`);

        // You could integrate with a toast notification library here
        // For now, we'll create a simple notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getStatistics() {
        const stats = {
            total: this.errorQueue.length,
            byCode: {},
            recent: this.errorQueue.slice(-10),
            retryStats: Object.fromEntries(this.retryAttempts)
        };

        this.errorQueue.forEach(error => {
            stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1;
        });

        return stats;
    }

    /**
     * Clear error queue
     */
    clearQueue() {
        this.errorQueue = [];
        this.retryAttempts.clear();
    }

    /**
     * Export errors for analysis
     * @returns {string} JSON string of errors
     */
    exportErrors() {
        return JSON.stringify(this.errorQueue.map(error => error.toObject()), null, 2);
    }

    /**
     * Create safe wrapper for async functions
     * @param {Function} fn - Function to wrap
     * @param {Object} options - Error handling options
     * @returns {Function} Wrapped function
     */
    createSafeWrapper(fn, options = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                return this.handleError(error, options);
            }
        };
    }

    /**
     * Create safe wrapper for sync functions
     * @param {Function} fn - Function to wrap
     * @param {Object} options - Error handling options
     * @returns {Function} Wrapped function
     */
    createSafeSyncWrapper(fn, options = {}) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handleError(error, options);
                return null;
            }
        };
    }
}

// Export singleton instance
export default new ErrorHandler();