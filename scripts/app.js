import EventBus from './core/EventBus.js';
import AppState from './core/AppState.js';
import Logger from './core/Logger.js';
import ComponentFactory from './factories/ComponentFactory.js';
import AnimationManager from './strategies/AnimationStrategy.js';
import ConfigManager from './config/portfolioConfig.js';
import ErrorHandler, { ComponentError } from './utils/ErrorHandler.js';

/**
 * Portfolio Application - Main application class
 * Orchestrates all components and manages application lifecycle
 */
class PortfolioApp {
    constructor() {
        if (PortfolioApp.instance) {
            return PortfolioApp.instance;
        }

        this.isInitialized = false;
        this.components = new Map();
        this.startTime = performance.now();
        
        // Setup error handling
        this.setupErrorHandling();
        
        PortfolioApp.instance = this;
        Logger.info('Portfolio application created');
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) {
            Logger.warn('Application already initialized');
            return;
        }

        try {
            Logger.info('Initializing Portfolio Application');

            // Set initial app state
            AppState.setState({
                isLoading: true,
                performance: {
                    loadTime: this.startTime,
                    lastUpdate: Date.now()
                }
            });

            // Setup core systems
            await this.setupConfiguration();
            await this.setupEventSystem();
            await this.setupComponents();
            await this.setupAnimations();
            await this.finishInitialization();

            this.isInitialized = true;
            Logger.info('Portfolio Application initialized successfully');

        } catch (error) {
            Logger.error('Failed to initialize application', error);
            await ErrorHandler.handleError(new ComponentError(
                'Application initialization failed',
                'PortfolioApp',
                { error: error.message }
            ));
            throw error;
        }
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Register component error handler
        ErrorHandler.registerHandler('COMPONENT_ERROR', async (error) => {
            Logger.error(`Component error: ${error.componentName}`, error);
            
            // Try to gracefully handle component errors
            if (error.componentName && this.components.has(error.componentName)) {
                const component = this.components.get(error.componentName);
                try {
                    component.destroy();
                    this.components.delete(error.componentName);
                    Logger.info(`Destroyed faulty component: ${error.componentName}`);
                } catch (destroyError) {
                    Logger.error(`Failed to destroy component: ${error.componentName}`, destroyError);
                }
            }
        });

        // Register animation error handler
        ErrorHandler.registerHandler('ANIMATION_ERROR', async (error) => {
            Logger.warn(`Animation failed: ${error.strategy}`, error);
            // Continue without animation
        });

        // Register network error handler
        ErrorHandler.registerHandler('NETWORK_ERROR', async (error) => {
            Logger.error(`Network error: ${error.url}`, error);
            // Show offline message or retry logic
        });
    }

    /**
     * Setup configuration system
     */
    async setupConfiguration() {
        // Apply theme configuration
        const theme = ConfigManager.get('theme');
        this.applyTheme(theme);

        // Setup configuration change listeners
        ConfigManager.subscribe((path, newValue, oldValue) => {
            Logger.debug(`Configuration changed: ${path}`, { newValue, oldValue });
            
            if (path.startsWith('theme')) {
                this.applyTheme(ConfigManager.get('theme'));
            }
        });

        Logger.debug('Configuration system setup completed');
    }

    /**
     * Apply theme to document
     * @param {Object} theme - Theme configuration
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        // Set CSS custom properties
        Object.entries(theme).forEach(([key, value]) => {
            if (typeof value === 'string') {
                root.style.setProperty(`--${key}`, value);
            }
        });

        EventBus.publish('theme:applied', { theme });
        Logger.debug('Theme applied', theme);
    }

    /**
     * Setup event system
     */
    async setupEventSystem() {
        // Modal events
        EventBus.subscribe('modal:open', (data) => {
            const modal = this.components.get(data.modalId);
            if (modal && modal.open) {
                modal.open();
            }
        });

        EventBus.subscribe('modal:close-all', () => {
            this.components.forEach((component, id) => {
                if (id.startsWith('modal-') && component.isOpen && component.isOpen()) {
                    component.close();
                }
            });
        });

        // Component lifecycle events
        EventBus.subscribe('component:initialized', (data) => {
            Logger.debug(`Component initialized: ${data.component}`);
        });

        EventBus.subscribe('component:destroyed', (data) => {
            Logger.debug(`Component destroyed: ${data.component}`);
        });

        // Performance monitoring
        EventBus.subscribe('performance:measure', (data) => {
            Logger.info(`Performance: ${data.name} - ${data.duration}ms`);
        });

        Logger.debug('Event system setup completed');
    }

    /**
     * Setup and initialize components
     */
    async setupComponents() {
        try {
            // Auto-discover components
            const discoveredComponents = ComponentFactory.autoDiscoverComponents();
            
            // Store components in app registry
            discoveredComponents.forEach(component => {
                const id = component.element.id || `component-${Date.now()}-${Math.random()}`;
                this.components.set(id, component);
            });

            // Manual component setup for specific functionality
            await this.setupNavigationHandlers();
            await this.setupModalHandlers();

            Logger.info(`Components setup completed: ${this.components.size} components`);

        } catch (error) {
            throw new ComponentError('Failed to setup components', 'PortfolioApp', { error: error.message });
        }
    }

    /**
     * Setup navigation-specific handlers
     */
    async setupNavigationHandlers() {
        const navigation = ConfigManager.get('navigation');
        
        // Setup navigation link handlers
        navigation.items.forEach(item => {
            if (item.type === 'modal') {
                // Already handled by component system
            } else if (item.type === 'scroll') {
                // Smooth scroll behavior is handled by Navigation component
            }
        });

        Logger.debug('Navigation handlers setup completed');
    }

    /**
     * Setup modal-specific handlers
     */
    async setupModalHandlers() {
        // Setup modal content rendering
        EventBus.subscribe('modal:opened', (data) => {
            this.trackModalUsage(data.modal);
        });

        Logger.debug('Modal handlers setup completed');
    }

    /**
     * Track modal usage for analytics
     * @param {string} modalId - Modal ID
     */
    trackModalUsage(modalId) {
        // Simple usage tracking
        Logger.info(`Modal opened: ${modalId}`);
        
        // Could integrate with analytics service here
        EventBus.publish('analytics:modal-opened', { modalId, timestamp: Date.now() });
    }

    /**
     * Setup animations
     */
    async setupAnimations() {
        // Check for reduced motion preference
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (reducedMotion) {
            ConfigManager.set('animations.reducedMotion', true);
            Logger.info('Reduced motion detected, disabling animations');
            return;
        }

        // Setup page load animations
        try {
            await this.runPageLoadAnimations();
            Logger.debug('Page load animations completed');
        } catch (error) {
            Logger.warn('Page load animations failed', error);
            // Continue without animations
        }
    }

    /**
     * Run page load animations
     */
    async runPageLoadAnimations() {
        const animationSequences = ConfigManager.get('animations.sequences.pageLoad');
        
        for (const sequence of animationSequences) {
            try {
                const elements = document.querySelectorAll(sequence.selector);
                
                if (elements.length > 0) {
                    if (sequence.stagger) {
                        await AnimationManager.animateSequence(
                            sequence.strategy,
                            Array.from(elements),
                            { direction: 'in' },
                            sequence.stagger
                        );
                    } else {
                        await AnimationManager.animate(
                            sequence.strategy,
                            elements[0],
                            { direction: 'in' }
                        );
                    }
                }

                if (sequence.delay) {
                    await new Promise(resolve => setTimeout(resolve, sequence.delay));
                }
            } catch (error) {
                Logger.warn(`Animation sequence failed: ${sequence.selector}`, error);
            }
        }
    }

    /**
     * Finish initialization
     */
    async finishInitialization() {
        // Calculate load time
        const loadTime = performance.now() - this.startTime;
        
        // Update app state
        AppState.setState({
            isLoading: false,
            performance: {
                loadTime: this.startTime,
                initializationTime: loadTime,
                lastUpdate: Date.now()
            }
        });

        // Publish initialization complete event
        EventBus.publish('app:initialized', {
            loadTime,
            componentCount: this.components.size,
            timestamp: Date.now()
        });

        // Setup resize handler
        window.addEventListener('resize', this.handleResize.bind(this));

        // Setup visibility change handler
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        Logger.info(`Application initialization completed in ${loadTime.toFixed(2)}ms`);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            EventBus.publish('app:resize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }, ConfigManager.get('performance.throttleResizeEvents'));
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        const isVisible = !document.hidden;
        
        AppState.setState('isVisible', isVisible);
        EventBus.publish('app:visibility-change', { isVisible });

        if (isVisible) {
            Logger.debug('App became visible');
        } else {
            Logger.debug('App became hidden');
        }
    }

    /**
     * Get application information
     * @returns {Object} App information
     */
    getInfo() {
        const state = AppState.getState();
        const performance = AppState.getState('performance');
        
        return {
            isInitialized: this.isInitialized,
            componentCount: this.components.size,
            performance: {
                ...performance,
                uptime: Date.now() - performance.loadTime
            },
            state: {
                currentTheme: state.currentTheme,
                activeModal: state.activeModal,
                isLoading: state.isLoading
            },
            errors: ErrorHandler.getStatistics()
        };
    }

    /**
     * Destroy application and cleanup
     */
    async destroy() {
        if (!this.isInitialized) return;

        try {
            Logger.info('Destroying Portfolio Application');

            // Destroy all components
            this.components.forEach((component, id) => {
                try {
                    component.destroy();
                } catch (error) {
                    Logger.warn(`Failed to destroy component: ${id}`, error);
                }
            });
            this.components.clear();

            // Cancel all animations
            AnimationManager.cancelAllAnimations();

            // Clear event listeners
            window.removeEventListener('resize', this.handleResize);
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);

            // Reset state
            AppState.reset();

            // Clear error queue
            ErrorHandler.clearQueue();

            this.isInitialized = false;
            Logger.info('Portfolio Application destroyed');

        } catch (error) {
            Logger.error('Error during application destruction', error);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const app = new PortfolioApp();
        await app.init().catch(error => {
            console.error('Failed to initialize portfolio application:', error);
        });
    });
} else {
    // DOM already loaded
    const app = new PortfolioApp();
    app.init().catch(error => {
        console.error('Failed to initialize portfolio application:', error);
    });
}

// Export for manual control if needed
export default PortfolioApp;