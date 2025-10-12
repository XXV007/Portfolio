/**
 * Portfolio Configuration
 * Centralized configuration management following separation of concerns
 */
export const portfolioConfig = {
    // Personal Information
    personal: {
        name: "Vishnu Priyan Bhaskar",
        title: "Seeking Internships | MS in Computer Science @ CSUF",
        subtitle: "Python, Machine Learning, NLP, Data Visualization | Passionate about Artificial Intelligence",
        email: "vishnumax03@gmail.com",
        location: "Los Angeles, California, United States",
        linkedin: "https://www.linkedin.com/in/vishnu-priyan-bhaskar-7bab71265/",
        github: "https://github.com/XXV007",
        resumePath: "assets/resume.pdf",
        profileImage: "assets/myphoto.jpg"
    },

    // Theme Configuration
    theme: {
        primary: "#e50914",
        secondary: "#ff9900",
        background: "#181818",
        surface: "#232323",
        text: "#ffffff",
        textSecondary: "#b3b3b3",
        gradient: "linear-gradient(90deg, #141414 60%, #e50914 100%)"
    },

    // Animation Settings
    animations: {
        defaultDuration: 300,
        defaultEasing: "ease-in-out",
        reducedMotion: false,
        sequences: {
            pageLoad: [
                { selector: "#hero", strategy: "fade", delay: 200 },
                { selector: "section", strategy: "slide", delay: 100, stagger: 150 }
            ]
        }
    },

    // Navigation Configuration
    navigation: {
        items: [
            { label: "Home", href: "#hero", type: "scroll" },
            { label: "Experience", href: "#experience", type: "modal", modalId: "modal-experience" },
            { label: "Education", href: "#education", type: "modal", modalId: "modal-education" },
            { label: "Projects", href: "#projects", type: "modal", modalId: "modal-projects" },
            { label: "Skills", href: "#skills", type: "modal", modalId: "modal-skills" },
            { label: "Contact", href: "#contact", type: "modal", modalId: "modal-contact" }
        ],
        resume: {
            label: "Resume",
            items: [
                { label: "Review Resume", href: "assets/resume.pdf", target: "_blank" },
                { label: "Download Resume", href: "assets/resume.pdf", download: true }
            ]
        }
    },

    // Content Configuration
    content: {
        hero: {
            title: "Seeking Internships | MS in Computer Science @ CSUF",
            subtitle: "Python, Machine Learning, NLP, Data Visualization | Passionate about Artificial Intelligence",
            cta: {
                text: "Connect on LinkedIn",
                href: "https://www.linkedin.com/in/vishnu-priyan-bhaskar-7bab71265/",
                target: "_blank"
            }
        },

        about: {
            title: "About Me",
            content: `I'm a dedicated and driven computer science student passionate about exploring the intersection of technology and problem-solving. Currently pursuing my MS at California State University, Fullerton, I have a particular interest in computer networking and its vast potential to enhance connectivity and communication.

Through my academic journey, I've gained hands-on experience in programming, algorithms, and data structures, and I am now focused on mastering networking protocols, security, and system administration. I thrive on learning new technologies and enjoy the challenge of tackling complex problems.

Beyond academics, I'm an advocate of continuous improvement, both in my professional skills and personal growth. I enjoy going to the gym and believe in maintaining a balanced, healthy lifestyle to stay energized and focused.

I'm always open to connecting with like-minded professionals, exploring internship opportunities, or collaborating on exciting tech projects.`
        },

        experience: [
            {
                company: "Kentish Publishing Company",
                position: "Game Designer",
                period: "May 2025 – Present",
                location: "Remote",
                description: "Designing narrative games with a focus on empathy, transformation, and inclusive design.",
                details: "(Publishing Cycle 2025)"
            },
            {
                company: "California State University, Fullerton",
                position: "Graduate Student Ambassador (CS)",
                period: "Apr 2025 – Present",
                location: "Hybrid",
                description: "Researching and improving university web portals for better digital accessibility and usability."
            },
            {
                company: "California State University, Fullerton",
                position: "Graduate Teaching Assistant",
                period: "Oct 2024 – May 2025",
                location: "United States",
                description: "Supported instruction in core CS courses, conducted labs, and developed tutorials."
            },
            {
                company: "California State University, Fullerton",
                position: "Information Technology Assistant",
                period: "Sep 2024 – Jan 2025",
                location: "United States",
                description: "Provided technical support and gained experience with educational technologies."
            },
            {
                company: "Freelance",
                position: "Computer Science Tutor",
                period: "2022 – 2024",
                location: "India",
                description: "Delivered personalized tutoring in programming, algorithms, and math."
            }
        ],

        education: [
            {
                institution: "California State University, Fullerton",
                degree: "Master of Science (MS), Computer Science",
                period: "Aug 2024",
                gpa: "3.7/4",
                note: "Expected Graduation: Summer 2026"
            },
            {
                institution: "SRM IST Chennai",
                degree: "Bachelor of Technology (BTech), Computer Science",
                period: "Sep 2020 – May 2024",
                gpa: "8.9/10"
            }
        ],

        projects: [
            {
                title: "AgriPal – Smart Budgeting for Farmers",
                period: "Jan 2025 – Jun 2025",
                organization: "California State University, Fullerton",
                description: "AgriPal is an Android app designed to help farmers manage agricultural income, expenses, and savings. It promotes financial literacy in rural and semi-urban communities by providing an intuitive and secure digital budgeting tool.",
                features: [
                    "User Authentication with Firebase Auth",
                    "Income & Expense Logging (by date, category, description)",
                    "Real-Time Budgeting Dashboard with Analytics",
                    "Seasonal & Monthly Views for Farming Cycles",
                    "Cloud Sync via Firebase Realtime Database",
                    "Dark Mode with Adaptive UI",
                    "Offline Mode Support (optional)"
                ],
                techStack: "Kotlin, Jetpack Compose, Firebase, Android Studio, Material Design 3",
                impact: "Empowers local farmers to track finances, reduce wasteful spending, and make informed decisions.",
                tags: ["Kotlin", "Android Development"]
            },
            {
                title: "Crash-Aware Kernel Modules with Dynamic State Checkpointing",
                period: "Feb 2025 – May 2025",
                organization: "California State University, Fullerton",
                description: "Explored how kernel modules can automatically save and restore their state after a crash, reducing downtime and improving OS reliability without a full reboot. Ideal for embedded and real-time systems, this project lays the foundation for safer dynamic updates and resilient OS design.",
                features: [
                    "Automatic state save/restore for kernel modules",
                    "Crash recovery without full OS reboot",
                    "Supports embedded and real-time systems",
                    "Foundation for resilient OS design"
                ],
                skills: "Operating Systems, Kernel Modules, Checkpointing, Crash Recovery, System Design, Reliability Engineering"
            },
            {
                title: "RgbColorMixer",
                period: "Jan 2025 – May 2025",
                description: "Developed an Android app that allows users to create custom colors by adjusting RGB values through sliders and text fields. Features real-time color preview, synchronized controls, reset button, and responsive layouts for both portrait and landscape orientations.",
                features: [
                    "Real-time color preview",
                    "Adjust RGB via sliders and text fields",
                    "Reset button for instant clearing",
                    "Responsive UI for all orientations"
                ],
                skills: "Virtual Computing, Kotlin, Algorithms"
            },
            {
                title: "MentalWell Chatbot for Mental Health Support and Well Being",
                period: "Nov 2023 – May 2024",
                organization: "SRM University",
                description: "Developed a mental health support chatbot providing empathetic, personalized, and confidential assistance. Utilizes advanced NLP (FastText, BERT, GPT, BiLSTM-Attention) for sentiment analysis, psychoeducation, coping strategies, and mood tracking. Aims to break stigma and bridge gaps in traditional care.",
                features: [
                    "24/7 support in a safe, anonymous space",
                    "Sentiment analysis and mood tracking",
                    "Psychoeducation and coping strategies",
                    "Personalized, ethical, and continuous learning"
                ],
                skills: "Hugging Face, AI, NLP, Machine Learning"
            }
        ],

        skills: [
            "Python", "Machine Learning", "NLP", "Data Visualization",
            "Game Design", "Game Development", "Operating Systems", "Networking",
            "Statistical Data Analysis", "Full-Stack Development", "Git", "Problem Solving"
        ]
    },

    // Component Settings
    components: {
        modal: {
            closeOnEscape: true,
            closeOnBackdrop: true,
            focusTrap: true,
            animation: "fade",
            animationDuration: 300
        },
        navigation: {
            smoothScroll: true,
            highlightActive: true,
            mobileBreakpoint: 768
        }
    },

    // Performance Settings
    performance: {
        lazyLoadImages: true,
        preloadCriticalResources: true,
        debounceScrollEvents: 16,
        throttleResizeEvents: 100
    },

    // Accessibility Settings
    accessibility: {
        respectReducedMotion: true,
        focusVisibleEnabled: true,
        screenReaderSupport: true,
        keyboardNavigation: true,
        highContrastMode: false
    },

    // Development Settings
    development: {
        enableLogging: true,
        logLevel: "INFO",
        enablePerformanceMonitoring: true,
        enableErrorTracking: true
    }
};

/**
 * Configuration Manager - Singleton for managing application configuration
 */
class ConfigManager {
    constructor() {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        this.config = { ...portfolioConfig };
        this.observers = new Set();
        ConfigManager.instance = this;
    }

    /**
     * Get configuration value
     * @param {string} path - Dot notation path to config value
     * @returns {*} Configuration value
     */
    get(path) {
        return this.getNestedValue(this.config, path);
    }

    /**
     * Set configuration value
     * @param {string} path - Dot notation path to config value
     * @param {*} value - New value
     */
    set(path, value) {
        const oldValue = this.get(path);
        this.setNestedValue(this.config, path, value);
        this.notifyObservers(path, value, oldValue);
    }

    /**
     * Update configuration with partial object
     * @param {Object} updates - Configuration updates
     */
    update(updates) {
        const oldConfig = { ...this.config };
        this.config = this.deepMerge(this.config, updates);
        this.notifyObservers('*', this.config, oldConfig);
    }

    /**
     * Subscribe to configuration changes
     * @param {Function} callback - Change callback
     * @param {string} path - Optional path to watch
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback, path = '*') {
        const observer = { callback, path };
        this.observers.add(observer);

        return () => {
            this.observers.delete(observer);
        };
    }

    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Source object
     * @param {string} path - Dot notation path
     * @returns {*} Value
     */
    getNestedValue(obj, path) {
        if (!path) return obj;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Set nested value in object using dot notation
     * @param {Object} obj - Target object
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    setNestedValue(obj, path, value) {
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
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    /**
     * Notify observers of configuration changes
     * @param {string} path - Changed path
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    notifyObservers(path, newValue, oldValue) {
        this.observers.forEach(observer => {
            try {
                if (observer.path === '*' || observer.path === path) {
                    observer.callback(path, newValue, oldValue);
                }
            } catch (error) {
                console.error('Error in config observer:', error);
            }
        });
    }

    /**
     * Reset configuration to defaults
     */
    reset() {
        const oldConfig = { ...this.config };
        this.config = { ...portfolioConfig };
        this.notifyObservers('*', this.config, oldConfig);
    }

    /**
     * Export configuration as JSON
     * @returns {string} JSON string
     */
    export() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonString - JSON configuration
     */
    import(jsonString) {
        try {
            const newConfig = JSON.parse(jsonString);
            this.update(newConfig);
        } catch (error) {
            throw new Error('Invalid JSON configuration');
        }
    }

    /**
     * Validate configuration structure
     * @returns {boolean} Is valid
     */
    validate() {
        const required = ['personal', 'theme', 'navigation', 'content'];
        return required.every(key => this.config[key] !== undefined);
    }

    /**
     * Get configuration schema
     * @returns {Object} Configuration schema
     */
    getSchema() {
        return {
            personal: 'object',
            theme: 'object',
            animations: 'object',
            navigation: 'object',
            content: 'object',
            components: 'object',
            performance: 'object',
            accessibility: 'object',
            development: 'object'
        };
    }
}

// Export singleton instance and config object
export default new ConfigManager();
export { portfolioConfig };