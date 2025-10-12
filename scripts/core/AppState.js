/**
 * AppState - Singleton Pattern Implementation
 * Centralized state management for the portfolio application
 */
class AppState {
    constructor() {
        if (AppState.instance) {
            return AppState.instance;
        }

        this.state = {
            currentTheme: 'dark',
            activeModal: null,
            isLoading: false,
            userPreferences: {
                animations: true,
                reducedMotion: false
            },
            navigation: {
                currentSection: 'hero',
                history: []
            },
            performance: {
                loadTime: null,
                lastUpdate: Date.now()
            }
        };

        this.listeners = new Map();
        AppState.instance = this;
    }

    /**
     * Get current state or specific state property
     * @param {string} key - Optional key to get specific property
     * @returns {*} State value
     */
    getState(key = null) {
        if (key) {
            return this.getNestedProperty(this.state, key);
        }
        return { ...this.state };
    }

    /**
     * Update state with new values
     * @param {Object|string} updates - Object with updates or key string
     * @param {*} value - Value if using key-value syntax
     */
    setState(updates, value = undefined) {
        const oldState = { ...this.state };

        if (typeof updates === 'string') {
            this.setNestedProperty(this.state, updates, value);
        } else {
            this.state = { ...this.state, ...updates };
        }

        this.notifyListeners(oldState, this.state);
        this.state.performance.lastUpdate = Date.now();
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     * @param {string} key - Optional key to listen to specific property
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener, key = null) {
        const id = Symbol('listener');
        this.listeners.set(id, { listener, key });

        return () => {
            this.listeners.delete(id);
        };
    }

    /**
     * Reset state to initial values
     */
    reset() {
        const initialState = {
            currentTheme: 'dark',
            activeModal: null,
            isLoading: false,
            userPreferences: {
                animations: true,
                reducedMotion: false
            },
            navigation: {
                currentSection: 'hero',
                history: []
            },
            performance: {
                loadTime: null,
                lastUpdate: Date.now()
            }
        };

        const oldState = { ...this.state };
        this.state = initialState;
        this.notifyListeners(oldState, this.state);
    }

    /**
     * Get nested property from object using dot notation
     * @param {Object} obj - Object to search
     * @param {string} path - Dot notation path
     * @returns {*} Property value
     */
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Set nested property in object using dot notation
     * @param {Object} obj - Object to modify
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * Notify all listeners of state changes
     * @param {Object} oldState - Previous state
     * @param {Object} newState - New state
     */
    notifyListeners(oldState, newState) {
        this.listeners.forEach(({ listener, key }) => {
            try {
                if (key) {
                    const oldValue = this.getNestedProperty(oldState, key);
                    const newValue = this.getNestedProperty(newState, key);
                    if (oldValue !== newValue) {
                        listener(newValue, oldValue);
                    }
                } else {
                    listener(newState, oldState);
                }
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        return {
            ...this.state.performance,
            uptime: Date.now() - (this.state.performance.loadTime || Date.now()),
            listenersCount: this.listeners.size
        };
    }
}

// Export singleton instance
export default new AppState();