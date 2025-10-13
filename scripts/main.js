/**
 * Portfolio Main Entry Point
 * This file serves as the main entry point for the portfolio application
 * It imports and initializes the modular architecture
 */

// Initialize basic functionality immediately for compatibility
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio site loaded - initializing functionality');
    
    // Add global emergency close function
    window.closeAllModals = function() {
        console.log('Emergency close all modals');
        const openModals = document.querySelectorAll('.modal');
        openModals.forEach(modal => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.style.overflow = '';
        
        // Hide emergency button
        const emergencyBtn = document.getElementById('emergency-close');
        if (emergencyBtn) {
            emergencyBtn.style.display = 'none';
        }
        
        console.log('All modals closed');
    };
    
    initBasicPortfolio();
    
    // Try to load advanced modules
    loadAdvancedModules();
});

/**
 * Load advanced modular architecture
 */
function loadAdvancedModules() {
    // Import the main application class
    import('./app.js').then(module => {
        console.log('Portfolio application modules loaded successfully');
        // Advanced modules will take over functionality
    }).catch(error => {
        console.warn('Advanced modules failed to load, using fallback:', error);
        // Basic functionality is already initialized above
    });
}

/**
 * Basic portfolio functionality
 * Ensures navigation works regardless of module loading
 */
function initBasicPortfolio() {
    console.log('Initializing basic portfolio functionality');
    
    // Basic modal functionality
    const modals = document.querySelectorAll('.modal');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    // Modal navigation mapping
    const navMap = {
        'experience': 'modal-experience',
        'education': 'modal-education',
        'projects': 'modal-projects',
        'skills': 'modal-skills',
        'contact': 'modal-contact'
    };
    
    // Setup navigation with improved error handling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            
            const hash = href.replace('#','');
            console.log('Navigation clicked:', hash);
            
            if (navMap[hash]) {
                e.preventDefault();
                const modal = document.getElementById(navMap[hash]);
                if (modal) {
                    console.log('Opening modal:', navMap[hash]);
                    console.log('Modal element:', modal);
                    console.log('Modal computed style before:', window.getComputedStyle(modal).display);
                    
                    modal.style.display = 'flex';
                    modal.style.opacity = '1';
                    modal.style.zIndex = '10000';
                    
                    console.log('Modal style after:', modal.style.display);
                    console.log('Modal computed style after:', window.getComputedStyle(modal).display);
                    
                    // Show emergency close button
                    const emergencyBtn = document.getElementById('emergency-close');
                    if (emergencyBtn) {
                        emergencyBtn.style.display = 'flex';
                    }
                    
                    // Add accessibility attributes
                    modal.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden';
                    
                    // Focus first focusable element
                    setTimeout(() => {
                        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (firstFocusable) {
                            firstFocusable.focus();
                        }
                    }, 100);
                } else {
                    console.error('Modal not found:', navMap[hash]);
                }
            } else if (hash === 'hero') {
                // Smooth scroll to top for hero section
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
    
    // Setup modal close buttons with improved handling
    document.querySelectorAll('.close').forEach(btn => {
        // Remove any existing event listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('Close button clicked');
            console.log('Event target:', e.target);
            console.log('Button element:', this);
            
            // Force close any open modal
            const openModal = document.querySelector('.modal[style*="flex"]');
            if (openModal) {
                console.log('Force closing open modal:', openModal.id);
                closeModal(openModal);
                return false;
            }
            
            // Fallback: close by data-modal attribute
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    console.log('Closing modal by data-modal:', modalId);
                    closeModal(modal);
                    return false;
                }
            }
            
            // Fallback: close by closest modal
            const modal = this.closest('.modal');
            if (modal) {
                console.log('Closing modal by closest:', modal.id);
                closeModal(modal);
                return false;
            }
            
            console.error('Could not find modal to close - using emergency close');
            window.closeAllModals();
            return false;
        });
        
        // Also add touch event for mobile
        newBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.click();
        });
    });
    
    // Close modals on backdrop click
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            console.log('Modal clicked, target:', e.target, 'modal:', modal);
            if (e.target === modal) {
                console.log('Backdrop clicked, closing modal:', modal.id);
                closeModal(modal);
            }
        });
    });
    
    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
        console.log('Key pressed:', e.key);
        if (e.key === 'Escape') {
            console.log('Escape key pressed - emergency close');
            window.closeAllModals();
        }
    });
    
    // Helper function to close modal
    function closeModal(modal) {
        console.log('closeModal called for:', modal?.id);
        
        if (!modal) {
            console.error('No modal provided to closeModal');
            return;
        }
        
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Hide emergency button
        const emergencyBtn = document.getElementById('emergency-close');
        if (emergencyBtn) {
            emergencyBtn.style.display = 'none';
        }
        
        // Return focus to the trigger element if possible
        const triggerElement = document.querySelector(`nav a[href="#${modal.id.replace('modal-', '')}"]`);
        if (triggerElement) {
            triggerElement.focus();
        }
        
        console.log('Modal closed successfully:', modal.id);
    }
    
    // Setup resume dropdown
    const resumeDropdown = document.querySelector('.resume-dropdown');
    if (resumeDropdown) {
        const resumeBtn = resumeDropdown.querySelector('.resume-btn');
        const resumeContent = resumeDropdown.querySelector('.resume-dropdown-content');
        
        if (resumeBtn && resumeContent) {
            // Toggle on click
            resumeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                resumeDropdown.classList.toggle('active');
            });
            
            // Close on outside click
            document.addEventListener('click', function(e) {
                if (!resumeDropdown.contains(e.target)) {
                    resumeDropdown.classList.remove('active');
                }
            });
            
            // Keyboard navigation
            resumeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    resumeDropdown.classList.toggle('active');
                }
            });
        }
    }
    
    console.log('Basic portfolio functionality initialized successfully');
    console.log('Found modals:', modals.length);
    console.log('Found nav links:', navLinks.length);
}
