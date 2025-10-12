import { Modal, Navigation } from './UIComponents.js';
import { BaseComponent } from './BaseComponent.js';
import Logger from '../core/Logger.js';

/**
 * ComponentFactory - Factory Pattern Implementation
 * Creates different types of components based on configuration
 */
export class ComponentFactory {
    constructor() {
        this.componentTypes = new Map();
        this.registerDefaultComponents();
    }

    /**
     * Register default component types
     */
    registerDefaultComponents() {
        this.register('modal', Modal);
        this.register('navigation', Navigation);
        this.register('base', BaseComponent);
    }

    /**
     * Register a new component type
     * @param {string} type - Component type name
     * @param {Class} ComponentClass - Component class
     */
    register(type, ComponentClass) {
        if (typeof ComponentClass !== 'function') {
            throw new Error(`Component class must be a constructor function`);
        }

        this.componentTypes.set(type, ComponentClass);
        Logger.info(`Registered component type: ${type}`);
    }

    /**
     * Unregister a component type
     * @param {string} type - Component type name
     */
    unregister(type) {
        if (this.componentTypes.has(type)) {
            this.componentTypes.delete(type);
            Logger.info(`Unregistered component type: ${type}`);
        }
    }

    /**
     * Create a component instance
     * @param {string} type - Component type
     * @param {string|Element} element - Element or selector
     * @param {Object} options - Component options
     * @returns {BaseComponent} Component instance
     */
    create(type, element, options = {}) {
        const ComponentClass = this.componentTypes.get(type);
        
        if (!ComponentClass) {
            throw new Error(`Unknown component type: ${type}`);
        }

        try {
            const component = new ComponentClass(element, options);
            
            if (options.autoInit !== false) {
                component.init();
            }

            Logger.debug(`Created component: ${type}`, { element, options });
            return component;
        } catch (error) {
            Logger.error(`Failed to create component: ${type}`, error);
            throw error;
        }
    }

    /**
     * Create multiple components from configuration
     * @param {Array} configs - Array of component configurations
     * @returns {Array} Array of component instances
     */
    createFromConfig(configs) {
        const components = [];

        configs.forEach(config => {
            try {
                const { type, element, options } = config;
                const component = this.create(type, element, options);
                components.push(component);
            } catch (error) {
                Logger.error(`Failed to create component from config`, { config, error });
            }
        });

        return components;
    }

    /**
     * Auto-discover and create components from DOM
     * @param {string} selector - Base selector to search within
     * @returns {Array} Array of component instances
     */
    autoDiscoverComponents(selector = 'body') {
        const container = document.querySelector(selector);
        if (!container) {
            Logger.warn(`Container not found: ${selector}`);
            return [];
        }

        const components = [];

        // Discover modals
        const modals = container.querySelectorAll('.modal');
        modals.forEach(modal => {
            try {
                const component = this.create('modal', modal);
                components.push(component);
            } catch (error) {
                Logger.error('Failed to auto-discover modal component', error);
            }
        });

        // Discover navigation
        const navs = container.querySelectorAll('nav');
        navs.forEach(nav => {
            try {
                const component = this.create('navigation', nav);
                components.push(component);
            } catch (error) {
                Logger.error('Failed to auto-discover navigation component', error);
            }
        });

        // Discover custom components with data attributes
        const customComponents = container.querySelectorAll('[data-component]');
        customComponents.forEach(element => {
            try {
                const type = element.getAttribute('data-component');
                const optionsAttr = element.getAttribute('data-component-options');
                const options = optionsAttr ? JSON.parse(optionsAttr) : {};
                
                const component = this.create(type, element, options);
                components.push(component);
            } catch (error) {
                Logger.error('Failed to auto-discover custom component', error);
            }
        });

        Logger.info(`Auto-discovered ${components.length} components`);
        return components;
    }

    /**
     * Get registered component types
     * @returns {Array} Array of registered types
     */
    getRegisteredTypes() {
        return Array.from(this.componentTypes.keys());
    }

    /**
     * Check if component type is registered
     * @param {string} type - Component type
     * @returns {boolean} Is registered
     */
    isRegistered(type) {
        return this.componentTypes.has(type);
    }

    /**
     * Get component class by type
     * @param {string} type - Component type
     * @returns {Class} Component class
     */
    getComponentClass(type) {
        return this.componentTypes.get(type);
    }

    /**
     * Create component with validation
     * @param {string} type - Component type
     * @param {string|Element} element - Element or selector
     * @param {Object} options - Component options
     * @returns {BaseComponent|null} Component instance or null if validation fails
     */
    createSafe(type, element, options = {}) {
        try {
            // Validate element exists
            const targetElement = typeof element === 'string' 
                ? document.querySelector(element) 
                : element;

            if (!targetElement) {
                Logger.warn(`Element not found for ${type} component: ${element}`);
                return null;
            }

            // Validate component type
            if (!this.isRegistered(type)) {
                Logger.warn(`Component type not registered: ${type}`);
                return null;
            }

            return this.create(type, element, options);
        } catch (error) {
            Logger.error(`Safe component creation failed: ${type}`, error);
            return null;
        }
    }

    /**
     * Batch create components with error handling
     * @param {Array} requests - Array of creation requests
     * @returns {Object} Results with success and error arrays
     */
    batchCreate(requests) {
        const results = {
            success: [],
            errors: []
        };

        requests.forEach((request, index) => {
            try {
                const { type, element, options } = request;
                const component = this.create(type, element, options);
                results.success.push({ component, index, request });
            } catch (error) {
                results.errors.push({ error, index, request });
                Logger.error(`Batch creation failed at index ${index}`, { request, error });
            }
        });

        Logger.info(`Batch creation completed: ${results.success.length} success, ${results.errors.length} errors`);
        return results;
    }
}

// Export singleton instance
export default new ComponentFactory();