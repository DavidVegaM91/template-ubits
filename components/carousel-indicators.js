/**
 * UBITS Carousel indicators — "Dynamic Dots"
 * Ventana de 5 puntos con strip deslizante. Colores y espaciado vía tokens UBITS en CSS.
 *
 * API: initCarouselIndicators({ containerId | container, count, activeIndex, ariaLabel, onSelect })
 * → { setActive, setCount, getState, destroy }
 */
(function (global) {
    'use strict';

    function clamp(n, lo, hi) {
        return Math.max(lo, Math.min(hi, n));
    }

    /**
     * Calcula las clases de estado para mantener siempre una ventana de 5 puntos visibles.
     */
    function getDotClass(idx, activeIndex, count) {
        var base = 'ubits-carousel-indicators__dot';
        
        if (count <= 5) {
            if (idx === activeIndex) return base + ' ubits-carousel-indicators__dot--active';
            return base + ' ubits-carousel-indicators__dot--small';
        }

        // Ventana deslizante de 5 puntos
        var windowStart = clamp(activeIndex - 2, 0, count - 5);
        var windowEnd = windowStart + 4;

        if (idx < windowStart || idx > windowEnd) {
            return base + ' ubits-carousel-indicators__dot--hidden';
        }

        if (idx === activeIndex) return base + ' ubits-carousel-indicators__dot--active';
        
        // Puntos en los extremos exactos de la ventana son diminutos
        if (idx === windowStart || idx === windowEnd) return base + ' ubits-carousel-indicators__dot--tiny';
        
        // El resto dentro de la ventana son pequeños
        return base + ' ubits-carousel-indicators__dot--small';
    }

    function initCarouselIndicators(opts) {
        opts = opts || {};
        var el = null;
        if (opts.container && opts.container.nodeType === 1) {
            el = opts.container;
        } else if (opts.containerId) {
            el = document.getElementById(opts.containerId);
        }
        if (!el) return null;

        var state = {
            count: Math.max(0, Math.floor(Number(opts.count)) || 0),
            activeIndex: Math.max(0, Math.floor(Number(opts.activeIndex)) || 0),
            ariaLabel: opts.ariaLabel || 'Paginación de diapositivas',
            onSelect: typeof opts.onSelect === 'function' ? opts.onSelect : function () {},
            _strip: null,
            _root: null
        };

        function render() {
            el.innerHTML = '';
            if (state.count <= 0) return;

            var root = document.createElement('div');
            root.className = 'ubits-carousel-indicators';
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', state.ariaLabel);

            var strip = document.createElement('div');
            strip.className = 'ubits-carousel-indicators__strip';

            for (var i = 0; i < state.count; i++) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.setAttribute('data-index', i);
                btn.setAttribute('aria-label', 'Ir a diapositiva ' + (i + 1));
                // Nota: La clase se asignará en updateVisuals
                
                btn.addEventListener('click', function (e) {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    state.onSelect(idx);
                });

                strip.appendChild(btn);
            }

            root.appendChild(strip);
            el.appendChild(root);
            
            state._root = root;
            state._strip = strip;
            
            // Forzamos un reflow antes de calcular posiciones
            void strip.offsetWidth;
            updateVisuals(true);
        }

        function updateVisuals(immediate) {
            if (!state._strip) return;
            
            var dots = state._strip.children;
            var activeIdx = clamp(state.activeIndex, 0, state.count - 1);
            var count = state.count;

            // 1. Actualizar clases y atributos
            for (var i = 0; i < dots.length; i++) {
                var dot = dots[i];
                dot.className = getDotClass(i, activeIdx, count);
                if (i === activeIdx) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            }

            // 2. Desplazamiento: leer --ci-* y padding del strip desde CSS (tokens), sin números mágicos sueltos.
            var rootEl = state._root;
            var stripEl = state._strip;
            var dotBase = 8;
            var gap = 10;
            var activeVis = 12;
            var containerWidth = 120;
            var stripPad = 0;
            if (rootEl && typeof global.getComputedStyle === 'function') {
                var rcs = getComputedStyle(rootEl);
                dotBase = parseFloat(rcs.getPropertyValue('--ci-dot-size')) || dotBase;
                gap = parseFloat(rcs.getPropertyValue('--ci-dot-gap')) || gap;
                var activeW = parseFloat(rcs.getPropertyValue('--ci-active-size')) || 10;
                activeVis = activeW * 1.2;
                containerWidth = parseFloat(rcs.width) || containerWidth;
            }
            if (stripEl && typeof global.getComputedStyle === 'function') {
                stripPad = parseFloat(getComputedStyle(stripEl).paddingLeft) || 0;
            }

            var centerOfActive = activeIdx * (dotBase + gap) + activeVis / 2;
            var tx = containerWidth / 2 - centerOfActive - stripPad;

            if (immediate) {
                state._strip.style.transition = 'none';
            } else {
                state._strip.style.transition = '';
            }
            
            state._strip.style.transform = 'translateX(' + tx + 'px)';
        }

        render();

        return {
            setActive: function (i) {
                state.activeIndex = Math.max(0, Math.floor(Number(i)) || 0);
                updateVisuals(false);
            },
            setCount: function (n) {
                state.count = Math.max(0, Math.floor(Number(n)) || 0);
                state.activeIndex = clamp(state.activeIndex, 0, Math.max(0, state.count - 1));
                render();
            },
            getState: function () {
                return {
                    count: state.count,
                    activeIndex: state.activeIndex
                };
            },
            destroy: function () {
                el.innerHTML = '';
            }
        };
    }

    global.initCarouselIndicators = initCarouselIndicators;
})(typeof window !== 'undefined' ? window : this);
