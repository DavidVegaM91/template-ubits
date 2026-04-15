/* ========================================
   UBITS TOOLTIP COMPONENT
   ======================================== */

/**
 * UBITS TOOLTIP COMPONENT
 * 
 * Componente de tooltip con posicionamiento inteligente y 12 posiciones posibles para la colita.
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/tooltip.css">
 * 2. JS: <script src="components/tooltip.js"></script>
 * 3. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 4. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <button data-tooltip="Este es un tooltip">Hover me</button>
 * 
 * <script>
 * initTooltip('[data-tooltip]');
 * </script>
 * ```
 * 
 * IMPLEMENTACIÓN AVANZADA:
 * ```html
 * <button id="mi-boton">Hover me</button>
 * 
 * <script>
 * showTooltip(document.getElementById('mi-boton'), 'Texto del tooltip', {
 *     position: 'top', // 'top', 'bottom', 'left', 'right'
 *     align: 'center', // 'left', 'center', 'right' (para top/bottom) o 'top', 'center', 'bottom' (para left/right)
 *     delay: 200, // milisegundos antes de mostrar
 *     duration: 0 // milisegundos antes de ocultar (0 = persistente)
 * });
 * </script>
 * ```
 * 
 * POSICIONES DISPONIBLES:
 * - top-left, top-center, top-right
 * - bottom-left, bottom-center, bottom-right
 * - left-top, left-center, left-bottom
 * - right-top, right-center, right-bottom
 * 
 * CARACTERÍSTICAS:
 * - Posicionamiento inteligente según viewport
 * - 12 posiciones posibles para la colita
 * - Auto-detección de mejor posición si no cabe
 * - Soporte para hover, focus
 * - Ocultar al mousedown/clic (por defecto): el tooltip se cierra al hacer clic en el elemento para no quedar visible al abrir menús o activar acciones. Desactivar con data-tooltip-hide-on-click="false".
 * - Modo claro y oscuro automático
 */

(function () {
    'use strict';

    // Contenedor global para tooltips
    let tooltipContainer = null;

    /**
     * Crea o obtiene el contenedor de tooltips
     */
    function ensureContainer() {
        if (!tooltipContainer) {
            tooltipContainer = document.createElement('div');
            tooltipContainer.id = 'ubits-tooltip-container';
            tooltipContainer.style.cssText = 'position: fixed; top: 0; left: 0; pointer-events: none; z-index: 10000;';
            document.body.appendChild(tooltipContainer);
        }
        return tooltipContainer;
    }

    /**
     * Calcula top/left para la posición indicada (sin buscar alternativa). Útil para docs/preview.
     * @returns {Object} - { position, align, top, left }
     */
    function calculatePositionOnly(element, tooltip, preferredPosition, preferredAlign, hasArrow) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const arrowSize = hasArrow ? 9 : 0;
        let top = 0, left = 0;
        const position = preferredPosition;
        const align = preferredAlign;

        if (position === 'top') {
            top = elementRect.top - tooltipRect.height - arrowSize;
            if (align === 'left') left = elementRect.left;
            else if (align === 'center') left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
            else left = elementRect.right - tooltipRect.width;
        } else if (position === 'bottom') {
            top = elementRect.bottom + arrowSize;
            if (align === 'left') left = elementRect.left;
            else if (align === 'center') left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
            else left = elementRect.right - tooltipRect.width;
        } else if (position === 'left') {
            left = elementRect.left - tooltipRect.width - arrowSize;
            if (align === 'top') top = elementRect.top;
            else if (align === 'center') top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
            else top = elementRect.bottom - tooltipRect.height;
        } else {
            left = elementRect.right + arrowSize;
            if (align === 'top') top = elementRect.top;
            else if (align === 'center') top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
            else top = elementRect.bottom - tooltipRect.height;
        }
        return { position, align, top, left };
    }

    /**
     * Calcula la mejor posición para el tooltip según el viewport
     * @param {HTMLElement} element - Elemento al que se adjunta el tooltip
     * @param {HTMLElement} tooltip - Elemento del tooltip
     * @param {string} preferredPosition - Posición preferida (ej: 'top', 'bottom', 'left', 'right')
     * @param {string} preferredAlign - Alineación preferida (ej: 'center', 'left', 'right', 'top', 'bottom')
     * @param {boolean} hasArrow - Si el tooltip tiene flecha (default: true)
     * @returns {Object} - { position, align, top, left }
     */
    function calculateBestPosition(element, tooltip, preferredPosition = 'top', preferredAlign = 'center', hasArrow = true) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        // Contenedor es position: fixed → coordenadas relativas al viewport (no sumar scroll)
        const padding = 12; // Padding mínimo del viewport
        const arrowSize = hasArrow ? 9 : 0; // Tamaño de la flecha

        let position = preferredPosition;
        let align = preferredAlign;
        let top = 0;
        let left = 0;

        // Función para verificar si una posición cabe
        function fitsPosition(pos, align) {
            let testTop, testLeft;

            if (pos === 'top') {
                testTop = elementRect.top - tooltipRect.height - arrowSize;
                if (align === 'left') testLeft = elementRect.left;
                else if (align === 'center') testLeft = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                else testLeft = elementRect.right - tooltipRect.width;
            } else if (pos === 'bottom') {
                testTop = elementRect.bottom + arrowSize;
                if (align === 'left') testLeft = elementRect.left;
                else if (align === 'center') testLeft = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                else testLeft = elementRect.right - tooltipRect.width;
            } else if (pos === 'left') {
                testLeft = elementRect.left - tooltipRect.width - arrowSize;
                if (align === 'top') testTop = elementRect.top;
                else if (align === 'center') testTop = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                else testTop = elementRect.bottom - tooltipRect.height;
            } else { // right
                testLeft = elementRect.right + arrowSize;
                if (align === 'top') testTop = elementRect.top;
                else if (align === 'center') testTop = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                else testTop = elementRect.bottom - tooltipRect.height;
            }

            return testTop >= padding &&
                testTop + tooltipRect.height <= viewportHeight - padding &&
                testLeft >= padding &&
                testLeft + tooltipRect.width <= viewportWidth - padding;
        }

        // Intentar posición preferida primero
        if (fitsPosition(preferredPosition, preferredAlign)) {
            position = preferredPosition;
            align = preferredAlign;
        } else {
            // Probar otras posiciones en orden de preferencia
            const positions = ['top', 'bottom', 'right', 'left'];
            const aligns = {
                top: ['center', 'left', 'right'],
                bottom: ['center', 'left', 'right'],
                left: ['center', 'top', 'bottom'],
                right: ['center', 'top', 'bottom']
            };

            let found = false;
            for (let pos of positions) {
                if (found) break;
                for (let al of aligns[pos]) {
                    if (fitsPosition(pos, al)) {
                        position = pos;
                        align = al;
                        found = true;
                        break;
                    }
                }
            }
        }

        // Calcular posición final (viewport: contenedor es position: fixed)
        if (position === 'top') {
            top = elementRect.top - tooltipRect.height - arrowSize;
            if (align === 'left') left = elementRect.left;
            else if (align === 'center') left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
            else left = elementRect.right - tooltipRect.width;
        } else if (position === 'bottom') {
            top = elementRect.bottom + arrowSize;
            if (align === 'left') left = elementRect.left;
            else if (align === 'center') left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
            else left = elementRect.right - tooltipRect.width;
        } else if (position === 'left') {
            left = elementRect.left - tooltipRect.width - arrowSize;
            if (align === 'top') top = elementRect.top;
            else if (align === 'center') top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
            else top = elementRect.bottom - tooltipRect.height;
        } else { // right
            left = elementRect.right + arrowSize;
            if (align === 'top') top = elementRect.top;
            else if (align === 'center') top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
            else top = elementRect.bottom - tooltipRect.height;
        }

        // Asegurar que no se salga del viewport
        left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));
        top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

        return { position, align, top, left };
    }

    /**
     * Muestra un tooltip
     * @param {HTMLElement|string} element - Elemento o selector al que se adjunta el tooltip
     * @param {string} text - Texto del tooltip
     * @param {Object} options - Opciones de configuración
     * @param {string} options.position - Posición preferida: 'top', 'bottom', 'left', 'right'
     * @param {string} options.align - Alineación: 'left', 'center', 'right' (para top/bottom) o 'top', 'center', 'bottom' (para left/right)
     * @param {number} options.delay - Delay antes de mostrar (ms, default: 200)
     * @param {number} options.duration - Duración antes de ocultar (ms, 0 = persistente, default: 0)
     * @param {boolean} options.noArrow - Ocultar la flecha/cola (default: false)
     * @param {boolean} options.normal - Usar variación normal (bg-1 y fg-1-high sin modificadores) (default: false)
     * @param {boolean} options.forcePosition - No ajustar a otra posición si no cabe; usar siempre la indicada (útil para docs) (default: false)
     * @returns {HTMLElement} - Elemento del tooltip creado
     */
    function showTooltip(element, text, options = {}) {
        if (!element) return null;

        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return null;

        const config = {
            position: options.position || 'top',
            align: options.align || 'center',
            delay: options.delay !== undefined ? options.delay : 200,
            duration: options.duration !== undefined ? options.duration : 0,
            noArrow: options.noArrow || false,
            normal: options.normal || false,
            forcePosition: options.forcePosition || false
        };

        // Ocultar tooltip existente si hay uno
        hideTooltip();

        const container = ensureContainer();
        const tooltip = document.createElement('div');
        tooltip.className = 'ubits-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.setAttribute('aria-live', 'polite');

        const content = document.createElement('div');
        content.className = 'ubits-tooltip__content';
        content.textContent = text;
        tooltip.appendChild(content);

        // Crear flecha solo si no está deshabilitada
        if (!config.noArrow) {
            const arrow = document.createElement('div');
            arrow.className = 'ubits-tooltip__arrow';
            content.appendChild(arrow);
        }

        container.appendChild(tooltip);

        // Calcular posición: si forcePosition, usar siempre la indicada; si no, elegir la que quepa
        const position = config.forcePosition
            ? calculatePositionOnly(el, tooltip, config.position, config.align, !config.noArrow)
            : calculateBestPosition(el, tooltip, config.position, config.align, !config.noArrow);

        // Aplicar clases de posición
        let tooltipClasses = `ubits-tooltip ubits-tooltip--${position.position} ubits-tooltip--align-${position.align}`;
        if (config.noArrow) {
            tooltipClasses += ' ubits-tooltip--no-arrow';
        }
        if (config.normal) {
            tooltipClasses += ' ubits-tooltip--normal';
        }
        tooltip.className = tooltipClasses;

        // Aplicar posición
        tooltip.style.top = position.top + 'px';
        tooltip.style.left = position.left + 'px';

        // Mostrar con delay
        let showTimeout;
        if (config.delay > 0) {
            showTimeout = setTimeout(() => {
                tooltip.classList.add('ubits-tooltip--visible');
            }, config.delay);
        } else {
            tooltip.classList.add('ubits-tooltip--visible');
        }

        // Ocultar después de duration si está configurado
        let hideTimeout;
        if (config.duration > 0) {
            hideTimeout = setTimeout(() => {
                hideTooltip();
            }, config.delay + config.duration);
        }

        // Guardar referencias para poder limpiar
        tooltip._showTimeout = showTimeout;
        tooltip._hideTimeout = hideTimeout;

        // Reposicionar en scroll y resize
        function reposition() {
            const newPosition = config.forcePosition
                ? calculatePositionOnly(el, tooltip, config.position, config.align, !config.noArrow)
                : calculateBestPosition(el, tooltip, config.position, config.align, !config.noArrow);
            let tooltipClasses = `ubits-tooltip ubits-tooltip--${newPosition.position} ubits-tooltip--align-${newPosition.align} ubits-tooltip--visible`;
            if (config.noArrow) {
                tooltipClasses += ' ubits-tooltip--no-arrow';
            }
            if (config.normal) {
                tooltipClasses += ' ubits-tooltip--normal';
            }
            tooltip.className = tooltipClasses;
            tooltip.style.top = newPosition.top + 'px';
            tooltip.style.left = newPosition.left + 'px';
        }

        const repositionHandler = reposition;
        window.addEventListener('scroll', repositionHandler, true);
        window.addEventListener('resize', repositionHandler);

        tooltip._repositionHandler = repositionHandler;

        return tooltip;
    }

    /**
     * Oculta el tooltip actual
     */
    /** Suprimir hover/focus tooltips (p. ej. durante drag & drop de Páginas creator). */
    function isTooltipGloballySuppressed() {
        return document.body && document.body.classList.contains('ubits-paginas-creator-dragging');
    }

    function hideTooltip() {
        const container = ensureContainer();
        const tooltips = container.querySelectorAll('.ubits-tooltip');
        tooltips.forEach(tooltip => {
            if (tooltip._showTimeout) clearTimeout(tooltip._showTimeout);
            if (tooltip._hideTimeout) clearTimeout(tooltip._hideTimeout);
            if (tooltip._repositionHandler) {
                window.removeEventListener('scroll', tooltip._repositionHandler, true);
                window.removeEventListener('resize', tooltip._repositionHandler);
            }
            tooltip.remove();
        });
    }

    /**
     * Inicializa tooltips automáticamente para elementos con data-tooltip.
     * @param {string} selector - Selector CSS (default: '[data-tooltip]')
     *
     * Atributos data opcionales:
     * - data-tooltip: texto del tooltip (puede cambiarse en DOM para texto dinámico)
     * - data-tooltip-delay: ms antes de mostrar (default 200)
     * - data-tooltip-position, data-tooltip-align: posición y alineación
     * - data-tooltip-hide-on-click: "true" (default) oculta el tooltip al hacer mousedown en el elemento; "false" no lo oculta (útil si el clic no abre menús/acciones)
     */
    function initTooltip(selector = '[data-tooltip]') {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            // Limpiar listeners anteriores si existen (para evitar duplicados)
            if (element._tooltipInitialized) {
                if (element._tooltipMouseEnterHandler) {
                    element.removeEventListener('mouseenter', element._tooltipMouseEnterHandler);
                    element.removeEventListener('mouseleave', element._tooltipMouseLeaveHandler);
                    if (element._tooltipMouseDownHandler) element.removeEventListener('mousedown', element._tooltipMouseDownHandler);
                    element.removeEventListener('focus', element._tooltipFocusHandler);
                    element.removeEventListener('blur', element._tooltipBlurHandler);
                }
            }

            const position = element.getAttribute('data-tooltip-position') || 'top';
            const align = element.getAttribute('data-tooltip-align') || 'center';
            const delay = parseInt(element.getAttribute('data-tooltip-delay')) || 200;
            const duration = parseInt(element.getAttribute('data-tooltip-duration')) || 0;
            const noArrow = element.hasAttribute('data-tooltip-no-arrow');
            const normal = element.hasAttribute('data-tooltip-normal');
            const hideOnClick = element.getAttribute('data-tooltip-hide-on-click') !== 'false';

            let tooltipTimeout;
            let currentTooltip = null;

            function getOptions() {
                return {
                    position: element.getAttribute('data-tooltip-position') || 'top',
                    align: element.getAttribute('data-tooltip-align') || 'center',
                    delay: 0,
                    duration: duration,
                    noArrow: noArrow,
                    normal: normal
                };
            }

            // Mostrar en hover (texto actual por si data-tooltip cambia dinámicamente)
            const mouseEnterHandler = function () {
                if (isTooltipGloballySuppressed()) return;
                tooltipTimeout = setTimeout(() => {
                    if (isTooltipGloballySuppressed()) return;
                    var text = element.getAttribute('data-tooltip');
                    if (text) currentTooltip = showTooltip(element, text, getOptions());
                }, delay);
            };

            // Ocultar al salir
            const mouseLeaveHandler = function () {
                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                hideTooltip();
                currentTooltip = null;
            };

            // Ocultar al mousedown (propiedad hideOnClick; por defecto true)
            const mouseDownHandler = function () {
                if (!hideOnClick) return;
                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                hideTooltip();
                currentTooltip = null;
            };

            // Mostrar en focus (accesibilidad)
            const focusHandler = function () {
                if (isTooltipGloballySuppressed()) return;
                var text = element.getAttribute('data-tooltip');
                if (!text) return;
                tooltipTimeout = setTimeout(() => {
                    if (isTooltipGloballySuppressed()) return;
                    currentTooltip = showTooltip(element, text, getOptions());
                }, delay);
            };

            // Ocultar al perder focus
            const blurHandler = function () {
                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                hideTooltip();
                currentTooltip = null;
            };

            // Agregar listeners
            element.addEventListener('mouseenter', mouseEnterHandler);
            element.addEventListener('mouseleave', mouseLeaveHandler);
            if (hideOnClick) element.addEventListener('mousedown', mouseDownHandler);
            element.addEventListener('focus', focusHandler);
            element.addEventListener('blur', blurHandler);

            // Guardar referencias para poder limpiarlas después
            element._tooltipMouseEnterHandler = mouseEnterHandler;
            element._tooltipMouseLeaveHandler = mouseLeaveHandler;
            element._tooltipMouseDownHandler = hideOnClick ? mouseDownHandler : null;
            element._tooltipFocusHandler = focusHandler;
            element._tooltipBlurHandler = blurHandler;
            element._tooltipInitialized = true;
        });
    }

    // Exportar funciones globales
    window.showTooltip = showTooltip;
    window.hideTooltip = hideTooltip;
    window.initTooltip = initTooltip;

    // Auto-inicializar si hay elementos con data-tooltip al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initTooltip();
        });
    } else {
        initTooltip();
    }

    console.log(`
🚀 UBITS Tooltip Component cargado exitosamente!

📋 USO BÁSICO:
<button data-tooltip="Este es un tooltip">Hover me</button>
<script>initTooltip();</script>

💡 USO AVANZADO:
showTooltip(element, 'Texto del tooltip', {
    position: 'top',    // 'top', 'bottom', 'left', 'right'
    align: 'center',    // 'left', 'center', 'right' (top/bottom) o 'top', 'center', 'bottom' (left/right)
    delay: 200,         // ms antes de mostrar
    duration: 0,        // ms antes de ocultar (0 = persistente)
    noArrow: false,     // true para ocultar la flecha/cola
    normal: false       // true para variación normal (bg-1 y fg-1-high sin modificadores)
});

🎯 POSICIONES DISPONIBLES:
- top-left, top-center, top-right
- bottom-left, bottom-center, bottom-right
- left-top, left-center, left-bottom
- right-top, right-center, right-bottom

🎨 VARIACIONES:
- Por defecto: bg-1-inverted, fg-1-high-inverted (fondo oscuro, letra clara)
- Normal: bg-1, fg-1-high (fondo claro, letra oscura) - usar normal: true o data-tooltip-normal
- Sin cola: usar noArrow: true o data-tooltip-no-arrow
    `);
})();
