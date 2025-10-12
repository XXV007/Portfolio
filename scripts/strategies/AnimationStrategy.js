import Logger from '../core/Logger.js';

/**
 * Animation Strategy Interface
 */
export class AnimationStrategy {
    /**
     * Execute animation
     * @param {Element} element - Target element
     * @param {Object} options - Animation options
     * @returns {Promise} Animation promise
     */
    async execute(element, options = {}) {
        throw new Error('execute method must be implemented by animation strategy');
    }

    /**
     * Get strategy name
     * @returns {string} Strategy name
     */
    getName() {
        return this.constructor.name;
    }

    /**
     * Validate element and options
     * @param {Element} element - Target element
     * @param {Object} options - Animation options
     */
    validate(element, options) {
        if (!element || !element.nodeType) {
            throw new Error('Invalid element provided to animation strategy');
        }
    }
}

/**
 * Fade Animation Strategy
 */
export class FadeAnimationStrategy extends AnimationStrategy {
    async execute(element, options = {}) {
        this.validate(element, options);

        const {
            duration = 300,
            easing = 'ease-in-out',
            direction = 'in',
            opacity = direction === 'in' ? [0, 1] : [1, 0]
        } = options;

        return new Promise((resolve) => {
            const animation = element.animate([
                { opacity: opacity[0] },
                { opacity: opacity[1] }
            ], {
                duration,
                easing,
                fill: 'forwards'
            });

            animation.onfinish = () => {
                Logger.debug(`Fade animation completed: ${direction}`, { element });
                resolve(animation);
            };
        });
    }
}

/**
 * Slide Animation Strategy
 */
export class SlideAnimationStrategy extends AnimationStrategy {
    async execute(element, options = {}) {
        this.validate(element, options);

        const {
            duration = 300,
            easing = 'ease-in-out',
            direction = 'in',
            axis = 'y',
            distance = 50
        } = options;

        const transforms = this.getTransforms(axis, distance, direction);

        return new Promise((resolve) => {
            const animation = element.animate([
                { 
                    transform: transforms.start,
                    opacity: direction === 'in' ? 0 : 1
                },
                { 
                    transform: transforms.end,
                    opacity: direction === 'in' ? 1 : 0
                }
            ], {
                duration,
                easing,
                fill: 'forwards'
            });

            animation.onfinish = () => {
                Logger.debug(`Slide animation completed: ${direction}`, { element });
                resolve(animation);
            };
        });
    }

    getTransforms(axis, distance, direction) {
        const sign = direction === 'in' ? 1 : -1;
        const startDistance = distance * sign;
        
        if (axis === 'x') {
            return {
                start: `translateX(${startDistance}px)`,
                end: 'translateX(0)'
            };
        } else {
            return {
                start: `translateY(${startDistance}px)`,
                end: 'translateY(0)'
            };
        }
    }
}

/**
 * Scale Animation Strategy
 */
export class ScaleAnimationStrategy extends AnimationStrategy {
    async execute(element, options = {}) {
        this.validate(element, options);

        const {
            duration = 300,
            easing = 'ease-in-out',
            direction = 'in',
            scale = direction === 'in' ? [0.8, 1] : [1, 0.8]
        } = options;

        return new Promise((resolve) => {
            const animation = element.animate([
                { 
                    transform: `scale(${scale[0]})`,
                    opacity: direction === 'in' ? 0 : 1
                },
                { 
                    transform: `scale(${scale[1]})`,
                    opacity: direction === 'in' ? 1 : 0
                }
            ], {
                duration,
                easing,
                fill: 'forwards'
            });

            animation.onfinish = () => {
                Logger.debug(`Scale animation completed: ${direction}`, { element });
                resolve(animation);
            };
        });
    }
}

/**
 * Bounce Animation Strategy
 */
export class BounceAnimationStrategy extends AnimationStrategy {
    async execute(element, options = {}) {
        this.validate(element, options);

        const {
            duration = 600,
            direction = 'in'
        } = options;

        const keyframes = direction === 'in' 
            ? this.getBounceInKeyframes()
            : this.getBounceOutKeyframes();

        return new Promise((resolve) => {
            const animation = element.animate(keyframes, {
                duration,
                easing: 'ease-out',
                fill: 'forwards'
            });

            animation.onfinish = () => {
                Logger.debug(`Bounce animation completed: ${direction}`, { element });
                resolve(animation);
            };
        });
    }

    getBounceInKeyframes() {
        return [
            { transform: 'scale(0.3)', opacity: 0 },
            { transform: 'scale(1.05)', opacity: 0.8 },
            { transform: 'scale(0.9)', opacity: 0.9 },
            { transform: 'scale(1)', opacity: 1 }
        ];
    }

    getBounceOutKeyframes() {
        return [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.9)', opacity: 0.9 },
            { transform: 'scale(1.05)', opacity: 0.8 },
            { transform: 'scale(0.3)', opacity: 0 }
        ];
    }
}

/**
 * Animation Manager - Context for Animation Strategies
 */
export class AnimationManager {
    constructor() {
        this.strategies = new Map();
        this.activeAnimations = new Map();
        this.registerDefaultStrategies();
    }

    /**
     * Register default animation strategies
     */
    registerDefaultStrategies() {
        this.addStrategy('fade', new FadeAnimationStrategy());
        this.addStrategy('slide', new SlideAnimationStrategy());
        this.addStrategy('scale', new ScaleAnimationStrategy());
        this.addStrategy('bounce', new BounceAnimationStrategy());
    }

    /**
     * Add animation strategy
     * @param {string} name - Strategy name
     * @param {AnimationStrategy} strategy - Strategy instance
     */
    addStrategy(name, strategy) {
        if (!(strategy instanceof AnimationStrategy)) {
            throw new Error('Strategy must extend AnimationStrategy');
        }
        
        this.strategies.set(name, strategy);
        Logger.debug(`Animation strategy registered: ${name}`);
    }

    /**
     * Remove animation strategy
     * @param {string} name - Strategy name
     */
    removeStrategy(name) {
        this.strategies.delete(name);
        Logger.debug(`Animation strategy removed: ${name}`);
    }

    /**
     * Execute animation using specified strategy
     * @param {string} strategyName - Animation strategy name
     * @param {Element} element - Target element
     * @param {Object} options - Animation options
     * @returns {Promise} Animation promise
     */
    async animate(strategyName, element, options = {}) {
        const strategy = this.strategies.get(strategyName);
        
        if (!strategy) {
            throw new Error(`Animation strategy not found: ${strategyName}`);
        }

        // Cancel existing animation on element
        this.cancelAnimation(element);

        try {
            const animationPromise = strategy.execute(element, options);
            this.activeAnimations.set(element, animationPromise);

            const result = await animationPromise;
            this.activeAnimations.delete(element);
            
            return result;
        } catch (error) {
            this.activeAnimations.delete(element);
            Logger.error(`Animation failed: ${strategyName}`, error);
            throw error;
        }
    }

    /**
     * Cancel animation on element
     * @param {Element} element - Target element
     */
    cancelAnimation(element) {
        const activeAnimation = this.activeAnimations.get(element);
        if (activeAnimation) {
            // Cancel Web Animations API animation
            const animations = element.getAnimations();
            animations.forEach(animation => animation.cancel());
            
            this.activeAnimations.delete(element);
            Logger.debug('Animation cancelled', { element });
        }
    }

    /**
     * Cancel all active animations
     */
    cancelAllAnimations() {
        this.activeAnimations.forEach((animation, element) => {
            this.cancelAnimation(element);
        });
    }

    /**
     * Get available animation strategies
     * @returns {Array} Array of strategy names
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }

    /**
     * Check if strategy exists
     * @param {string} name - Strategy name
     * @returns {boolean} Strategy exists
     */
    hasStrategy(name) {
        return this.strategies.has(name);
    }

    /**
     * Get active animations count
     * @returns {number} Number of active animations
     */
    getActiveCount() {
        return this.activeAnimations.size;
    }

    /**
     * Animate multiple elements with the same strategy
     * @param {string} strategyName - Animation strategy name
     * @param {Array} elements - Array of elements
     * @param {Object} options - Animation options
     * @returns {Promise} Promise that resolves when all animations complete
     */
    async animateMultiple(strategyName, elements, options = {}) {
        const promises = elements.map(element => 
            this.animate(strategyName, element, { ...options })
        );

        return Promise.all(promises);
    }

    /**
     * Animate elements in sequence
     * @param {string} strategyName - Animation strategy name
     * @param {Array} elements - Array of elements
     * @param {Object} options - Animation options
     * @param {number} delay - Delay between animations
     * @returns {Promise} Promise that resolves when all animations complete
     */
    async animateSequence(strategyName, elements, options = {}, delay = 100) {
        for (let i = 0; i < elements.length; i++) {
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            await this.animate(strategyName, elements[i], options);
        }
    }
}

// Export singleton instance
export default new AnimationManager();