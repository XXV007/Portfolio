import { BaseComponent } from './BaseComponent.js';
import EventBus from '../core/EventBus.js';
import AppState from '../core/AppState.js';

/**
 * Modal Component - Handles modal functionality with accessibility
 */
export class Modal extends BaseComponent {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            closeOnEscape: true,
            closeOnBackdrop: true,
            focusTrap: true,
            animation: 'fade',
            animationDuration: 300
        };
    }

    setupEventListeners() {
        // Close button
        const closeBtn = this.element.querySelector('.close');
        if (closeBtn) {
            this.addEventListener(closeBtn, 'click', this.close);
        }

        // Backdrop click
        if (this.options.closeOnBackdrop) {
            this.addEventListener(this.element, 'click', (e) => {
                if (e.target === this.element) {
                    this.close();
                }
            });
        }

        // Escape key
        if (this.options.closeOnEscape) {
            this.addEventListener(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen()) {
                    this.close();
                }
            });
        }

        // Focus trap
        if (this.options.focusTrap) {
            this.addEventListener(this.element, 'keydown', this.handleFocusTrap);
        }
    }

    render() {
        // Set ARIA attributes
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('aria-hidden', 'true');
        
        // Set initial state
        this.element.style.display = 'none';
    }

    /**
     * Open the modal
     */
    open() {
        if (this.isOpen()) return;

        // Close any other open modals
        EventBus.publish('modal:close-all');

        // Store previously focused element
        this.previouslyFocused = document.activeElement;

        // Show modal
        this.element.style.display = 'flex';
        this.element.setAttribute('aria-hidden', 'false');

        // Apply animation
        this.applyAnimation('in');

        // Focus management
        setTimeout(() => {
            this.focusFirstElement();
        }, 50);

        // Update app state
        AppState.setState('activeModal', this.element.id);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        EventBus.publish('modal:opened', { modal: this.element.id });
    }

    /**
     * Close the modal
     */
    close() {
        if (!this.isOpen()) return;

        // Apply animation
        this.applyAnimation('out', () => {
            this.element.style.display = 'none';
            this.element.setAttribute('aria-hidden', 'true');

            // Restore focus
            if (this.previouslyFocused) {
                this.previouslyFocused.focus();
            }

            // Restore body scroll
            document.body.style.overflow = '';

            // Update app state
            AppState.setState('activeModal', null);

            EventBus.publish('modal:closed', { modal: this.element.id });
        });
    }

    /**
     * Check if modal is open
     * @returns {boolean}
     */
    isOpen() {
        return this.element.style.display === 'flex';
    }

    /**
     * Apply animation to modal
     * @param {string} direction - 'in' or 'out'
     * @param {Function} callback - Callback after animation
     */
    applyAnimation(direction, callback = null) {
        const content = this.element.querySelector('.modal-content');
        if (!content) return;

        const animationClass = `modal-${this.options.animation}-${direction}`;
        content.classList.add(animationClass);

        setTimeout(() => {
            content.classList.remove(animationClass);
            if (callback) callback();
        }, this.options.animationDuration);
    }

    /**
     * Focus first focusable element in modal
     */
    focusFirstElement() {
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    /**
     * Get focusable elements within modal
     * @returns {Array} Focusable elements
     */
    getFocusableElements() {
        const focusableSelectors = [
            'button',
            '[href]',
            'input',
            'select',
            'textarea',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(
            this.element.querySelectorAll(focusableSelectors.join(','))
        ).filter(el => !el.disabled && el.offsetParent !== null);
    }

    /**
     * Handle focus trap within modal
     * @param {KeyboardEvent} e 
     */
    handleFocusTrap(e) {
        if (e.key !== 'Tab') return;

        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
}

/**
 * Navigation Component - Handles navigation functionality
 */
export class Navigation extends BaseComponent {
    getDefaultOptions() {
        return {
            ...super.getDefaultOptions(),
            smoothScroll: true,
            highlightActive: true,
            mobileBreakpoint: 768
        };
    }

    setupEventListeners() {
        // Navigation links
        const navLinks = this.element.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            this.addEventListener(link, 'click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });

        // Resume dropdown
        const resumeDropdown = this.element.querySelector('.resume-dropdown');
        if (resumeDropdown) {
            this.setupResumeDropdown(resumeDropdown);
        }

        // Mobile navigation toggle
        this.setupMobileNavigation();

        // Scroll spy for active navigation
        if (this.options.highlightActive) {
            this.addEventListener(window, 'scroll', this.handleScrollSpy);
        }
    }

    /**
     * Handle navigation link clicks
     * @param {Element} link - Navigation link
     */
    handleNavigation(link) {
        const href = link.getAttribute('href');
        const section = href.replace('#', '');

        // Check if it's a modal section
        const modalMap = {
            'experience': 'modal-experience',
            'education': 'modal-education',
            'projects': 'modal-projects',
            'skills': 'modal-skills',
            'contact': 'modal-contact'
        };

        if (modalMap[section]) {
            EventBus.publish('modal:open', { modalId: modalMap[section] });
        } else {
            // Smooth scroll to section
            const targetElement = document.querySelector(href);
            if (targetElement) {
                this.scrollToElement(targetElement);
                AppState.setState('navigation.currentSection', section);
            }
        }
    }

    /**
     * Smooth scroll to element
     * @param {Element} element - Target element
     */
    scrollToElement(element) {
        if (this.options.smoothScroll) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            element.scrollIntoView();
        }
    }

    /**
     * Setup resume dropdown functionality
     * @param {Element} dropdown - Dropdown element
     */
    setupResumeDropdown(dropdown) {
        const button = dropdown.querySelector('.resume-btn');
        const content = dropdown.querySelector('.resume-dropdown-content');

        if (button && content) {
            // Keyboard navigation
            this.addEventListener(button, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });

            // Close on outside click
            this.addEventListener(document, 'click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    }

    /**
     * Setup mobile navigation
     */
    setupMobileNavigation() {
        // Create mobile toggle button if it doesn't exist
        if (window.innerWidth <= this.options.mobileBreakpoint) {
            this.createMobileToggle();
        }

        // Handle window resize
        this.addEventListener(window, 'resize', () => {
            if (window.innerWidth <= this.options.mobileBreakpoint) {
                this.enableMobileMode();
            } else {
                this.disableMobileMode();
            }
        });
    }

    /**
     * Create mobile navigation toggle
     */
    createMobileToggle() {
        const existingToggle = this.element.querySelector('.nav-toggle');
        if (existingToggle) return;

        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.innerHTML = '☰';
        toggle.setAttribute('aria-label', 'Toggle navigation');
        
        this.element.insertBefore(toggle, this.element.firstChild);
        
        this.addEventListener(toggle, 'click', () => {
            this.element.classList.toggle('nav-open');
        });
    }

    /**
     * Enable mobile navigation mode
     */
    enableMobileMode() {
        this.element.classList.add('mobile-nav');
    }

    /**
     * Disable mobile navigation mode
     */
    disableMobileMode() {
        this.element.classList.remove('mobile-nav', 'nav-open');
    }

    /**
     * Handle scroll spy for active navigation highlighting
     */
    handleScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;

        let activeSection = null;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionHeight = rect.height;

            if (scrollTop >= sectionTop - 100 && scrollTop < sectionTop + sectionHeight - 100) {
                activeSection = section.id;
            }
        });

        if (activeSection) {
            this.updateActiveNavigation(activeSection);
            AppState.setState('navigation.currentSection', activeSection);
        }
    }

    /**
     * Update active navigation highlighting
     * @param {string} activeSection - Active section ID
     */
    updateActiveNavigation(activeSection) {
        const navLinks = this.element.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === activeSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}