import EventBus from '../core/EventBus.js';
import Logger from '../core/Logger.js';

/**
 * BaseComponent - Abstract base class for all UI components
 * Implements common functionality following Single Responsibility Principle
 */
export class BaseComponent {
    constructor(element, options = {}) {
        if (typeof element === 'string') {
            this.element = document.querySelector(element);
        } else {
            this.element = element;
        }

        if (!this.element) {
            throw new Error(`Element not found: ${element}`);
        }

        this.options = { ...this.getDefaultOptions(), ...options };
        this.isInitialized = false;
        this.eventListeners = new Map();
        this.childComponents = new Set();
        
        Logger.debug(`Creating component: ${this.constructor.name}`, { element: this.element, options: this.options });
    }

    /**
     * Get default options for the component
     * @returns {Object} Default options
     */
    getDefaultOptions() {
        return {
            autoInit: true,
            destroyOnRemove: true
        };
    }

    /**
     * Initialize the component
     */
    init() {
        if (this.isInitialized) {
            Logger.warn(`Component ${this.constructor.name} is already initialized`);
            return;
        }

        try {
            this.setupEventListeners();
            this.render();
            this.isInitialized = true;
            
            EventBus.publish('component:initialized', {
                component: this.constructor.name,
                element: this.element
            });
            
            Logger.info(`Component ${this.constructor.name} initialized successfully`);
        } catch (error) {
            Logger.error(`Failed to initialize component ${this.constructor.name}`, error);
            throw error;
        }
    }

    /**
     * Setup event listeners - to be implemented by subclasses
     */
    setupEventListeners() {
        // Override in subclasses
    }

    /**
     * Render the component - to be implemented by subclasses
     */
    render() {
        // Override in subclasses
    }

    /**
     * Add event listener with automatic cleanup
     * @param {string|Element} target - Event target
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(target, event, handler, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) {
            Logger.warn(`Event target not found: ${target}`);
            return;
        }

        const wrappedHandler = (e) => {
            try {
                handler.call(this, e);
            } catch (error) {
                Logger.error(`Error in event handler for ${event}`, error);
            }
        };

        element.addEventListener(event, wrappedHandler, options);

        // Store for cleanup
        const key = `${target}-${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({
            element,
            event,
            handler: wrappedHandler,
            options
        });
    }

    /**
     * Remove specific event listener
     * @param {string|Element} target - Event target
     * @param {string} event - Event type
     */
    removeEventListener(target, event) {
        const key = `${target}-${event}`;
        const listeners = this.eventListeners.get(key);
        
        if (listeners) {
            listeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
            this.eventListeners.delete(key);
        }
    }

    /**
     * Add child component
     * @param {BaseComponent} component - Child component
     */
    addChild(component) {
        if (component instanceof BaseComponent) {
            this.childComponents.add(component);
        }
    }

    /**
     * Remove child component
     * @param {BaseComponent} component - Child component
     */
    removeChild(component) {
        this.childComponents.delete(component);
        if (component.options.destroyOnRemove) {
            component.destroy();
        }
    }

    /**
     * Show the component
     */
    show() {
        this.element.style.display = '';
        this.element.setAttribute('aria-hidden', 'false');
        EventBus.publish('component:shown', { component: this.constructor.name });
    }

    /**
     * Hide the component
     */
    hide() {
        this.element.style.display = 'none';
        this.element.setAttribute('aria-hidden', 'true');
        EventBus.publish('component:hidden', { component: this.constructor.name });
    }

    /**
     * Toggle component visibility
     */
    toggle() {
        if (this.element.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Update component options
     * @param {Object} newOptions - New options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        if (this.isInitialized) {
            this.render();
        }
    }

    /**
     * Get component data attributes
     * @returns {Object} Data attributes
     */
    getData() {
        const data = {};
        Array.from(this.element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
                const key = attr.name.substring(5).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                data[key] = attr.value;
            }
        });
        return data;
    }

    /**
     * Set component data attribute
     * @param {string} key - Data key
     * @param {string} value - Data value
     */
    setData(key, value) {
        const attr = `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        this.element.setAttribute(attr, value);
    }

    /**
     * Destroy the component and cleanup
     */
    destroy() {
        if (!this.isInitialized) return;

        try {
            // Destroy child components
            this.childComponents.forEach(child => child.destroy());
            this.childComponents.clear();

            // Remove all event listeners
            this.eventListeners.forEach((listeners, key) => {
                listeners.forEach(({ element, event, handler, options }) => {
                    element.removeEventListener(event, handler, options);
                });
            });
            this.eventListeners.clear();

            // Remove element if configured
            if (this.options.destroyOnRemove && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            this.isInitialized = false;
            
            EventBus.publish('component:destroyed', {
                component: this.constructor.name
            });
            
            Logger.info(`Component ${this.constructor.name} destroyed successfully`);
        } catch (error) {
            Logger.error(`Error destroying component ${this.constructor.name}`, error);
        }
    }

    /**
     * Validate component state
     * @returns {boolean} Is valid
     */
    validate() {
        return this.element && this.isInitialized;
    }

    /**
     * Get component information
     * @returns {Object} Component info
     */
    getInfo() {
        return {
            name: this.constructor.name,
            element: this.element.tagName.toLowerCase() + (this.element.id ? `#${this.element.id}` : ''),
            isInitialized: this.isInitialized,
            childrenCount: this.childComponents.size,
            listenersCount: this.eventListeners.size,
            options: this.options
        };
    }
}