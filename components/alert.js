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
        const wrap = document.createElement('div');
        wrap.innerHTML = buildAlertHtml(type, message, { noClose: !closable });
        this.element = wrap.firstElementChild;

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
            error: 'fa-times-circle',
            ia: 'fa-sparkles',
            invert: 'fa-bell',
            neutral: 'fa-info-circle'
        };
        
        return icons[type] || icons.info;
    }

    /**
     * Add event listeners to the alert
     */
    addEventListeners() {
        if (!this.element) return;
        
        const closeButton = this.element.querySelector('[data-alert-dismiss]');
        
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
            const textElement = this.element.querySelector('.ubits-alert__description')
                || this.element.querySelector('.ubits-alert__text');
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
            const iconElement = this.element.querySelector('.ubits-alert__icon i');
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

const ALERT_ICON_MAP = {
    success: 'fa-check-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle',
    error: 'fa-times-circle',
    ia: 'fa-sparkles',
    invert: 'fa-bell',
    neutral: 'fa-info-circle',
};

function getAlertIconClass(type, options = {}) {
    if (options.icon) {
        return String(options.icon).replace(/^far\s+/, '').replace(/^fas\s+/, '');
    }
    return ALERT_ICON_MAP[type] || ALERT_ICON_MAP.info;
}

/**
 * Markup canónico del alert (ReUI grid). Reutilizable en strings embebidos o showAlert().
 */
function buildAlertHtml(type, message, options = {}) {
    const iconClass = getAlertIconClass(type, options);
    const hasActions = Boolean(options.actionsHtml);
    const hasClose = !options.noClose;
    const hasMedia = Boolean(options.leadingHtml) || !options.noIcon;
    const titleHtml = options.titleHtml || options.title || '';
    const hasTitle = Boolean(titleHtml);
    const hasDesc = Boolean(message);
    const hasTitleDesc = hasTitle && hasDesc;
    const extraClass = options.extraClass ? String(options.extraClass).trim() : '';
    const rootId = options.rootId ? ` id="${options.rootId}"` : '';
    const role = options.role || 'alert';
    const ariaLive = options.ariaLive != null ? options.ariaLive : 'polite';

    const mods = [
        hasMedia ? 'ubits-alert--has-media' : 'ubits-alert--no-icon',
        hasClose ? 'ubits-alert--dismissible' : '',
        hasActions ? 'ubits-alert--has-actions' : '',
        hasTitleDesc ? 'ubits-alert--has-title-desc' : '',
        options.blockText ? 'ubits-alert--block-text' : '',
        options.clampDescription ? 'ubits-alert--clamp-description' : '',
        options.leadingHtml ? 'ubits-alert--with-leading' : '',
        !hasClose ? 'ubits-alert--no-close' : '',
        extraClass,
    ].filter(Boolean).join(' ');

    let media = '';
    if (options.leadingHtml) {
        media = `<div class="ubits-alert__media"><div class="ubits-alert__leading">${options.leadingHtml}</div></div>`;
    } else if (!options.noIcon) {
        media = `<div class="ubits-alert__media"><div class="ubits-alert__icon"><i class="far ${iconClass}"></i></div></div>`;
    }

    const titleMods = options.titleInline ? ' ubits-alert__title--inline' : '';
    const titleEl = hasTitle ? `<div class="ubits-alert__title${titleMods}">${titleHtml}</div>` : '';
    const descEl = hasDesc ? `<div class="ubits-alert__description">${message}</div>` : '';

    let trailing = '';
    if (hasActions) {
        trailing = `<div class="ubits-alert__trailing"><div class="ubits-alert__actions">${options.actionsHtml}</div></div>`;
    }
    const dismissBtn = hasClose
        ? `<div class="ubits-alert__dismiss"><button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" aria-label="Cerrar alerta" data-tooltip="Cerrar alerta" data-alert-dismiss="true"><i class="far fa-xmark"></i></button></div>`
        : '';

    return `<div class="ubits-alert ubits-alert--${type} ${mods}"${rootId} role="${role}" aria-live="${ariaLive}">${media}${titleEl}${descEl}${trailing}${dismissBtn}</div>`;
}

function wireAlertDismiss(root, onClose) {
    const rootEl = typeof root === 'string' ? document.getElementById(root) : root;
    if (!rootEl) return;
    const closeBtn = rootEl.querySelector('[data-alert-dismiss]');
    if (!closeBtn || closeBtn.dataset.alertDismissWired === '1') return;
    closeBtn.dataset.alertDismissWired = '1';
    closeBtn.addEventListener('click', () => {
        if (typeof onClose === 'function') {
            onClose();
        } else if (rootEl.parentNode) {
            rootEl.remove();
        }
    });
}

function showAlert(type, message, options = {}) {
    const containerId = options.containerId;
    const container = containerId ? document.getElementById(containerId) : document.body;

    if (!container) {
        console.error('Alert container not found:', containerId);
        return null;
    }

    container.innerHTML = buildAlertHtml(type, message, options);
    const alertEl = container.firstElementChild;

    if (!options.noClose && alertEl) {
        wireAlertDismiss(alertEl, () => {
            if (typeof options.onClose === 'function') {
                options.onClose();
            } else {
                container.innerHTML = '';
            }
        });
    }

    return { element: alertEl, container };
}

/**
 * Stack de alertas (paridad con UbitsAlertStack).
 * @param {HTMLElement|string} containerOrId
 * @param {Array<{type:string,message:string,options?:object}>} items
 * @param {'xs'|'sm'|'md'} [gap='sm']
 * @param {'separated'|'joined'} [variant='separated']
 */
function showAlertStack(containerOrId, items = [], gap = 'sm', variant = 'separated') {
    const container = typeof containerOrId === 'string'
        ? document.getElementById(containerOrId)
        : containerOrId;
    if (!container) return null;

    const isJoined = variant === 'joined';
    const stack = document.createElement('div');
    stack.className = [
        'ubits-alert-stack',
        isJoined ? 'ubits-alert-stack--joined' : `ubits-alert-stack--gap-${gap}`,
    ].filter(Boolean).join(' ');
    stack.setAttribute('role', 'region');
    stack.setAttribute('aria-label', 'Alertas');

    stack.innerHTML = items.map((item) => {
        const type = item.type || 'info';
        const opts = { ...(item.options || {}) };
        if (opts.noClose !== false) {
            opts.noClose = true;
        }
        return buildAlertHtml(type, item.message, opts);
    }).join('');

    container.innerHTML = '';
    container.appendChild(stack);
    return { element: stack, container };
}

// Make helper functions available globally
window.buildAlertHtml = buildAlertHtml;
window.wireAlertDismiss = wireAlertDismiss;
window.showAlert = showAlert;
window.showAlertStack = showAlertStack;

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

/**
 * RENDERIZADO DEL COMPONENTE ALERT
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/alert.css">
 * 2. JS: <script src="components/alert.js"></script>
 * 3. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 
 * OPCIÓN 1: HTML DIRECTO (Recomendado para alerts estáticos)
 * ```html
 * <div class="ubits-alert ubits-alert--success">
 *   <div class="ubits-alert__icon">
 *     <i class="far fa-check-circle"></i>
 *   </div>
 *   <div class="ubits-alert__content">
 *     <div class="ubits-alert__text">Tu mensaje aquí</div>
 *   </div>
 *   <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" aria-label="Cerrar alerta" data-tooltip="Cerrar alerta" data-alert-dismiss="true">
 *     <i class="far fa-xmark"></i>
 *   </button>
 * </div>
 * ```
 * 
 * OPCIÓN 2: JAVASCRIPT (Recomendado para alerts dinámicos)
 * ```html
 * <div id="alert-container"></div>
 * <script>
 * showAlert('success', 'Tu mensaje aquí', {
 *   containerId: 'alert-container',
 *   noClose: true
 * });
 * </script>
 * ```
 * 
 * TIPOS DISPONIBLES: 'success', 'info', 'warning', 'error', 'ia', 'invert', 'neutral'
 * ICONOS: fa-check-circle, fa-info-circle, fa-exclamation-triangle, fa-times-circle, fa-sparkles, fa-bell
 * OPCIONES showAlert: noClose, noIcon, blockText, withAction, leadingHtml, actionsHtml, icon, onClose
 * STACK: showAlertStack(containerId, [{ type, message, options }], gap)
 *   options por ítem: noClose, noIcon, blockText, leadingHtml, actionsHtml, icon
 *
 * NOTA — ÉNFASIS Y COPY MULTILÍNEA (.ubits-alert__text)
 * __text usa display:flex. Varios hijos directos (texto + <strong>, <p>, etc.) se ven como
 * columnas separadas. Para resaltar un fragmento: <span class="ubits-alert__emphasis">…</span>
 * (inline, font-weight 600). No uses <strong> suelto sin el modificador block-text.
 * Mensajes largos o HTML en modales: class="ubits-alert … ubits-alert--block-text" en el root.
 * Ejemplo (certificados confirmación):
 * ```html
 * <div class="ubits-alert ubits-alert--warning ubits-alert--no-close ubits-alert--block-text">
 *   …
 *   <div class="ubits-alert__text">El enlace … <span class="ubits-alert__emphasis">estará disponible por 2 días.</span> …</div>
 * </div>
 * ```
 */

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UBITSAlert, UBITSAlertManager, buildAlertHtml, wireAlertDismiss, showAlert, showAlertStack };
}

