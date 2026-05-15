/**
 * UBITS Carousel indicators — "Dynamic Dots"
 * Implementación inspirada en Fancybox v5 y Swiper Dynamic Bullets.
 * El strip se desplaza para mantener el punto activo centrado, y los puntos
 * se escalan según su distancia al activo.
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
     * Calcula las clases de estado para cada punto basado en la distancia al activo.
     */
    function getDotClass(idx, activeIndex) {
        var diff = Math.abs(idx - activeIndex);
        var base = 'ubits-carousel-indicators__dot';
        
        if (diff === 0) return base + ' ubits-carousel-indicators__dot--active';
        if (diff === 1) return base + ' ubits-carousel-indicators__dot--small';
        if (diff === 2) return base + ' ubits-carousel-indicators__dot--tiny';
        return base + ' ubits-carousel-indicators__dot--hidden';
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
                btn.className = getDotClass(i, state.activeIndex);
                if (i === state.activeIndex) btn.setAttribute('aria-current', 'true');
                
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
            
            updateVisuals(true);
        }

        function updateVisuals(immediate) {
            if (!state._strip) return;
            
            var dots = state._strip.children;
            var activeIdx = clamp(state.activeIndex, 0, state.count - 1);

            // 1. Actualizar clases y atributos
            for (var i = 0; i < dots.length; i++) {
                var dot = dots[i];
                dot.className = getDotClass(i, activeIdx);
                if (i === activeIdx) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            }

            // 2. Calcular desplazamiento (Translate)
            // Queremos que el punto activo esté en el centro visual del contenedor.
            // Asumiendo valores de CSS: dot=8px, gap=8px, active=24px.
            var dotSize = 8;
            var gap = 8;
            var activeWidth = 24;
            
            // Distancia desde el inicio del strip hasta el centro del punto activo:
            // (puntos antes * (size + gap)) + (mitad del ancho del activo)
            var distanceToActiveCenter = (activeIdx * (dotSize + gap)) + (activeWidth / 2);
            
            // El centro del contenedor es donde queremos que caiga el activeCenter.
            // Como el strip tiene un padding-left de 40px en el CSS, hay que compensarlo
            // o simplemente calcular el offset relativo.
            var stripPadding = 40; 
            
            // Visualmente, el "centro" del strip (sin contar el padding) es 0 si no hay translate.
            // Para centrar el punto 'i', necesitamos mover el strip hacia la izquierda:
            // transform = - (distanciaAlCentroDeI)
            // Pero el contenedor tiene un width variable (fit-content).
            // Lo más sencillo es usar la posición relativa del dot.
            
            var activeDot = dots[activeIdx];
            if (activeDot) {
                var offsetLeft = activeDot.offsetLeft;
                var offsetWidth = activeDot.offsetWidth;
                var containerWidth = state._root.offsetWidth;
                
                // Si el contenedor aún no tiene width (ej. oculto), usamos un fallback
                if (containerWidth === 0) containerWidth = 120; 

                var tx = (containerWidth / 2) - (offsetLeft + offsetWidth / 2);
                
                if (immediate) {
                    state._strip.style.transition = 'none';
                } else {
                    state._strip.style.transition = '';
                }
                
                state._strip.style.transform = 'translateX(' + tx + 'px)';
            }
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
