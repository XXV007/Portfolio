/**
 * Portfolio Main Entry Point
 * This file serves as the main entry point for the portfolio application
 * It imports and initializes the modular architecture
 */

// Import the main application class
// The app will auto-initialize when the DOM is ready
import('./app.js').then(module => {
    console.log('Portfolio application modules loaded successfully');
}).catch(error => {
    console.error('Failed to load portfolio application:', error);
    
    // Fallback: Initialize basic functionality
    console.log('Falling back to basic portfolio functionality');
    initBasicPortfolio();
});

/**
 * Fallback basic portfolio functionality
 * Used when the main application fails to load
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
    
    // Setup navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const hash = this.getAttribute('href').replace('#','');
            if (navMap[hash]) {
                e.preventDefault();
                const modal = document.getElementById(navMap[hash]);
                if (modal) {
                    modal.style.display = 'flex';
                }
            }
        });
    });
    
    // Setup modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals on backdrop click
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        }
    });
    
    console.log('Basic portfolio functionality initialized');
}
