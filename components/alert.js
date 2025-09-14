/**
 * UBITS Alert Component
 * Creates and manages alert components with different variants
 */

class UBITSAlert {
    constructor(options = {}) {
        this.options = {
            type: 'success',
            message: '',
            closable: true,
            duration: 0, // 0 = no auto close
            onClose: null,
            ...options
        };
        
        this.element = null;
        this.closeTimeout = null;
    }

    /**
     * Create the alert HTML structure
     */
    create() {
        const { type, message, closable } = this.options;
        
        // Get the appropriate icon for the alert type
        const iconClass = this.getIconClass(type);
        
        // Create the alert element
        this.element = document.createElement('div');
        this.element.className = `ubits-alert ubits-alert--${type}`;
        this.element.setAttribute('role', 'alert');
        this.element.setAttribute('aria-live', 'polite');
        
        // Create the content structure
        this.element.innerHTML = `
            <div class="ubits-alert-content">
                <div class="ubits-alert-icon">
                    <i class="far ${iconClass}"></i>
                </div>
                <div class="ubits-alert-text ubits-body-sm-regular">
                    ${message}
                </div>
            </div>
            ${closable ? `
                <button class="ubits-alert-close" aria-label="Cerrar alerta">
                    <i class="far fa-times"></i>
                </button>
            ` : ''}
        `;
        
        // Add event listeners
        this.addEventListeners();
        
        // Set up auto close if duration is specified
        if (this.options.duration > 0) {
            this.setupAutoClose();
        }
        
        return this.element;
    }

    /**
     * Get the appropriate FontAwesome icon class for each alert type
     */
    getIconClass(type) {
        const icons = {
            success: 'fa-check-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        
        return icons[type] || icons.success;
    }

    /**
     * Add event listeners to the alert
     */
    addEventListeners() {
        if (!this.element) return;
        
        const closeButton = this.element.querySelector('.ubits-alert-close');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.close();
            });
        }
    }

    /**
     * Set up auto close functionality
     */
    setupAutoClose() {
        if (this.options.duration > 0) {
            this.closeTimeout = setTimeout(() => {
                this.close();
            }, this.options.duration);
        }
    }

    /**
     * Close the alert with animation
     */
    close() {
        if (!this.element) return;
        
        // Clear auto close timeout if it exists
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
        
        // Add closing animation class
        this.element.classList.add('ubits-alert--closing');
        
        // Remove element after animation completes
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            
            // Call onClose callback if provided
            if (this.options.onClose && typeof this.options.onClose === 'function') {
                this.options.onClose();
            }
        }, 300); // Match animation duration
    }

    /**
     * Update the alert message
     */
    updateMessage(newMessage) {
        if (this.element) {
            const textElement = this.element.querySelector('.ubits-alert-text');
            if (textElement) {
                textElement.textContent = newMessage;
            }
        }
    }

    /**
     * Update the alert type
     */
    updateType(newType) {
        if (this.element) {
            // Remove old type class
            this.element.className = this.element.className.replace(/ubits-alert--\w+/, '');
            
            // Add new type class
            this.element.classList.add(`ubits-alert--${newType}`);
            
            // Update icon
            const iconElement = this.element.querySelector('.ubits-alert-icon i');
            if (iconElement) {
                iconElement.className = `far ${this.getIconClass(newType)}`;
            }
            
            this.options.type = newType;
        }
    }
}

/**
 * Static methods for easy alert creation
 */
class UBITSAlertManager {
    /**
     * Create and show a success alert
     */
    static success(message, options = {}) {
        return this.create({
            type: 'success',
            message,
            ...options
        });
    }

    /**
     * Create and show an info alert
     */
    static info(message, options = {}) {
        return this.create({
            type: 'info',
            message,
            ...options
        });
    }

    /**
     * Create and show a warning alert
     */
    static warning(message, options = {}) {
        return this.create({
            type: 'warning',
            message,
            ...options
        });
    }

    /**
     * Create and show an error alert
     */
    static error(message, options = {}) {
        return this.create({
            type: 'error',
            message,
            ...options
        });
    }

    /**
     * Create and show an alert
     */
    static create(options = {}) {
        const alert = new UBITSAlert(options);
        const element = alert.create();
        
        // Append to body or specified container
        const container = options.container || document.body;
        container.appendChild(element);
        
        return alert;
    }

    /**
     * Create alert in a specific container
     */
    static createInContainer(container, options = {}) {
        return this.create({
            ...options,
            container: container
        });
    }
}

// Make classes available globally
window.UBITSAlert = UBITSAlert;
window.UBITSAlertManager = UBITSAlertManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UBITSAlert, UBITSAlertManager };
}

