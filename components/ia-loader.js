/**
 * UBITS IA Loader — indicador de carga para flujos IA.
 *
 * Estructura: __frame → __stage (gradiente IA + shimmer) → __cluster (__center sparkles 3×<g> + __label).
 * Ícono y texto en `--ubits-fg-2-high-static-inverted` en claro y oscuro.
 *
 * Uso:
 *   getIaLoaderHTML()
 *   getIaLoaderHTML({ label: 'Texto' })
 *   initIaLoaderParticles(loaderEl) — tras innerHTML (o MutationObserver automático)
 *
 * Requiere: ia-loader.css, ubits-colors.css; gradientes IA: --modo-ia-gradient-a…d, orbes rgb-1…3
 * (p. ej. general-styles/ubits-ia-appearance.css).
 */

/** Sparkles IA 12×12 — mismos trazos que `ia-button.js` (viewBox 12). */
var UBITS_IA_LOADER_SPARKLE_P1 =
    'M7.26489 1.91064L8.53125 1.42188L8.9978 0.177734C9.02002 0.0666504 9.1311 0 9.24219 0C9.33105 0 9.44214 0.0666504 9.46436 0.177734L9.95312 1.42188L11.1973 1.91064C11.3083 1.93286 11.375 2.04395 11.375 2.13281C11.375 2.2439 11.3083 2.35498 11.1973 2.3772L9.95312 2.84375L9.46436 4.11011C9.44214 4.19897 9.33105 4.26562 9.24219 4.26562C9.1311 4.26562 9.02002 4.19897 8.9978 4.11011L8.53125 2.84375L7.26489 2.3772C7.17603 2.35498 7.10938 2.2439 7.10938 2.13281C7.10938 2.04395 7.17603 1.93286 7.26489 1.91064Z';
var UBITS_IA_LOADER_SPARKLE_P2 =
    'M0.199951 5.33203L0.577637 5.17651L0.755371 5.08765H0.777588L2.73267 4.17676L3.64355 2.19946L3.73242 2.02173L3.91016 1.64404C3.95459 1.51074 4.08789 1.42188 4.22119 1.42188C4.35449 1.42188 4.48779 1.51074 4.55444 1.64404L4.73218 2.02173L4.79883 2.19946L4.82104 2.22168L5.70972 4.17676L7.68701 5.08765L7.86475 5.17651L8.24243 5.35425C8.37573 5.39868 8.4646 5.53198 8.4646 5.66528C8.4646 5.79858 8.37573 5.93188 8.24243 5.99854L7.86475 6.15405L7.68701 6.24292L5.70972 7.15381L4.79883 9.10889V9.1311L4.70996 9.30884L4.55444 9.68652C4.48779 9.81982 4.35449 9.90869 4.22119 9.90869C4.08789 9.90869 3.95459 9.81982 3.91016 9.68652L3.73242 9.30884L3.64355 9.1311V9.10889L2.73267 7.15381L0.777588 6.24292H0.755371L0.577637 6.15405L0.199951 5.99854C0.0666504 5.93188 0 5.79858 0 5.66528C0 5.53198 0.0666504 5.39868 0.199951 5.33203Z';
var UBITS_IA_LOADER_SPARKLE_P3 =
    'M2.04395 5.66528L3.177 6.19849C3.39917 6.28735 3.59912 6.4873 3.71021 6.70947L4.22119 7.84253L4.75439 6.70947C4.86548 6.4873 5.04321 6.28735 5.26538 6.19849L6.39844 5.66528L5.26538 5.13208C5.04321 5.04321 4.86548 4.84326 4.75439 4.62109L4.22119 3.48804L3.71021 4.62109C3.59912 4.84326 3.39917 5.04321 3.177 5.13208L2.04395 5.66528Z';
var UBITS_IA_LOADER_SPARKLE_P4 =
    'M8.53125 8.53125L8.9978 7.28711C9.02002 7.17603 9.1311 7.10938 9.24219 7.10938C9.33105 7.10938 9.44214 7.17603 9.46436 7.28711L9.95312 8.53125L11.1973 9.02002C11.3083 9.04224 11.375 9.15332 11.375 9.24219C11.375 9.35327 11.3083 9.46436 11.1973 9.48657L9.95312 9.95312L9.46436 11.2195C9.44214 11.3083 9.33105 11.375 9.24219 11.375C9.1311 11.375 9.02002 11.3083 8.9978 11.2195L8.53125 9.95312L7.26489 9.48657C7.17603 9.46436 7.10938 9.35327 7.10938 9.24219C7.10938 9.15332 7.17603 9.04224 7.26489 9.02002L8.53125 8.53125Z';

/**
 * Estrella grande en contorno (path único Figma): P3 solo recorta con evenodd, no se pinta encima.
 * Si se dibuja P3 en otro <g>, el centro queda blanco y la grande parece rellena.
 */
function iaLoaderSparkleBigOutlinePathMarkup() {
    return (
        '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="' +
        UBITS_IA_LOADER_SPARKLE_P2 +
        ' ' +
        UBITS_IA_LOADER_SPARKLE_P3 +
        '"/>'
    );
}

function getIaLoaderSparklesSvg() {
    return (
        '<svg class="ubits-ia-loader__sparkles-svg" viewBox="0 0 12 12" fill="none" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="ubits-ia-loader__spark-g1"><path fill="currentColor" d="' +
        UBITS_IA_LOADER_SPARKLE_P1 +
        '"/></g>' +
        '<g class="ubits-ia-loader__spark-g2">' +
        iaLoaderSparkleBigOutlinePathMarkup() +
        '</g>' +
        '<g class="ubits-ia-loader__spark-g3"><path fill="currentColor" d="' +
        UBITS_IA_LOADER_SPARKLE_P4 +
        '"/></g>' +
        '</svg>'
    );
}

function getIaLoaderHTML(options) {
    options = options || {};
    var label =
        options.label != null && String(options.label).trim() !== ''
            ? String(options.label)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
            : 'Generando recurso';

    var inner =
        '<div class="ubits-ia-loader__frame">' +
        '<div class="ubits-ia-loader__stage">' +
        '<canvas class="ubits-ia-loader__particles" aria-hidden="true"></canvas>' +
        '<div class="ubits-ia-loader__cluster">' +
        '<div class="ubits-ia-loader__center">' +
        '<span class="ubits-ia-loader__sparkles-wrap" aria-hidden="true">' +
        getIaLoaderSparklesSvg() +
        '</span>' +
        '</div>' +
        '<p class="ubits-ia-loader__label ubits-body-sm-regular">' +
        label +
        '<span class="ubits-ia-loader__dots" aria-hidden="true">' +
        '<span>.</span><span>.</span><span>.</span></span></p>' +
        '</div>' +
        '</div>' +
        '</div>';

    return (
        '<div class="ubits-ia-loader" role="status" aria-live="polite" aria-busy="true">' +
        inner +
        '</div>'
    );
}

/** Partículas onduladas: puntos finos; movimiento alineado con particle_wave_gradient.html */
var UBITS_IA_LOADER_PARTICLES_SPACING_CSS = 11;
var UBITS_IA_LOADER_PARTICLES_RADIUS_CSS_MIN = 0.95;
var UBITS_IA_LOADER_PARTICLES_RADIUS_CSS_MAX = 1.45;
var UBITS_IA_LOADER_PARTICLES_ALPHA_MIN = 0.14;
var UBITS_IA_LOADER_PARTICLES_ALPHA_RANGE = 0.32;
/** Referente: waveX = wave * 16 * dpr; waveY = cos(...) * 13 * dpr; t += 0.01; spring 0.13 / 0.70 */
var UBITS_IA_LOADER_PARTICLES_WAVE_AMP_X_CSS = 16;
var UBITS_IA_LOADER_PARTICLES_WAVE_AMP_Y_CSS = 13;
var UBITS_IA_LOADER_PARTICLES_MOTION_REF_CSS = 200;

function iaLoaderParticlesGradientColor(nx) {
    var stops = [
        [0, [30, 120, 255]],
        [0.25, [110, 60, 240]],
        [0.5, [200, 30, 200]],
        [0.75, [230, 20, 130]],
        [1, [240, 60, 40]]
    ];
    var i;
    for (i = 0; i < stops.length - 1; i++) {
        if (nx >= stops[i][0] && nx <= stops[i + 1][0]) {
            var t = (nx - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
            var c0 = stops[i][1];
            var c1 = stops[i + 1][1];
            return [
                Math.round(c0[0] + (c1[0] - c0[0]) * t),
                Math.round(c0[1] + (c1[1] - c0[1]) * t),
                Math.round(c0[2] + (c1[2] - c0[2]) * t)
            ];
        }
    }
    return stops[stops.length - 1][1];
}

function destroyIaLoaderParticles(loaderEl) {
    if (!loaderEl || !loaderEl._iaParticlesState) return;
    var state = loaderEl._iaParticlesState;
    if (state.rafId) cancelAnimationFrame(state.rafId);
    if (state.resizeObserver) state.resizeObserver.disconnect();
    if (state.reducedMotionMq && state.reducedMotionHandler) {
        state.reducedMotionMq.removeEventListener('change', state.reducedMotionHandler);
    }
    loaderEl._iaParticlesState = null;
    loaderEl.removeAttribute('data-ia-particles-init');
}

function initIaLoaderParticles(loaderOrRoot) {
    var loader = loaderOrRoot;
    if (!loader || typeof document === 'undefined') return;
    if (loader.nodeType === 1 && !loader.classList.contains('ubits-ia-loader')) {
        loader = loader.querySelector('.ubits-ia-loader');
    }
    if (!loader || loader.getAttribute('data-ia-particles-init') === 'true') return;

    var canvas = loader.querySelector('.ubits-ia-loader__particles');
    var stage = loader.querySelector('.ubits-ia-loader__stage');
    if (!canvas || !stage) return;

    destroyIaLoaderParticles(loader);
    loader.setAttribute('data-ia-particles-init', 'true');

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var state = {
        canvas: canvas,
        ctx: ctx,
        W: 0,
        H: 0,
        particles: [],
        t: 0,
        rafId: 0,
        running: false,
        resizeObserver: null,
        reducedMotionMq: null,
        reducedMotionHandler: null
    };
    loader._iaParticlesState = state;

    function particleGridForCanvas(w, h, dpr) {
        var spacing = UBITS_IA_LOADER_PARTICLES_SPACING_CSS * dpr;
        var cols = Math.max(14, Math.min(110, Math.round(w / spacing) + 1));
        var rows = Math.max(10, Math.min(64, Math.round(h / spacing) + 1));
        return { cols: cols, rows: rows };
    }

    function buildParticles() {
        var list = [];
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var grid = particleGridForCanvas(state.W, state.H, dpr);
        var cols = grid.cols;
        var rows = grid.rows;
        var i;
        var j;
        state.cols = cols;
        state.rows = rows;
        state.cell =
            cols > 1 && rows > 1
                ? Math.min(state.W / (cols - 1), state.H / (rows - 1))
                : Math.min(state.W, state.H);
        for (i = 0; i < cols; i++) {
            for (j = 0; j < rows; j++) {
                list.push({
                    ox: cols > 1 ? (i / (cols - 1)) * state.W : state.W * 0.5,
                    oy: rows > 1 ? (j / (rows - 1)) * state.H : state.H * 0.5,
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0
                });
            }
        }
        state.particles = list;
    }

    function resizeParticles() {
        var rect = stage.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4) return false;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        state.W = Math.max(1, Math.round(rect.width * dpr));
        state.H = Math.max(1, Math.round(rect.height * dpr));
        canvas.width = state.W;
        canvas.height = state.H;
        buildParticles();
        return true;
    }

    function drawParticlesFrame() {
        var p;
        var nx;
        var ny;
        var wave;
        var waveX;
        var waveY;
        var tx;
        var ty;
        var norm;
        var rgb;
        var alpha;
        var size;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var radiusMin = UBITS_IA_LOADER_PARTICLES_RADIUS_CSS_MIN * dpr;
        var radiusMax = UBITS_IA_LOADER_PARTICLES_RADIUS_CSS_MAX * dpr;
        var radiusCap = (state.cell || 14) * 0.22;
        var motionRef = UBITS_IA_LOADER_PARTICLES_MOTION_REF_CSS * dpr;
        var motionScale = Math.min(state.W, state.H) / motionRef;
        motionScale = Math.max(0.85, Math.min(motionScale, 1.15));
        var ampX = UBITS_IA_LOADER_PARTICLES_WAVE_AMP_X_CSS * dpr * motionScale;
        var ampY = UBITS_IA_LOADER_PARTICLES_WAVE_AMP_Y_CSS * dpr * motionScale;

        if (!state.particles.length) return;

        state.ctx.clearRect(0, 0, state.W, state.H);
        state.t += 0.01;

        for (var idx = 0; idx < state.particles.length; idx++) {
            p = state.particles[idx];
            nx = p.ox / state.W;
            ny = p.oy / state.H;
            wave =
                Math.sin(nx * Math.PI * 4 + state.t) * 0.5 +
                Math.sin(ny * Math.PI * 3 + state.t * 1.2) * 0.5;
            waveX = wave * ampX;
            waveY = Math.cos(nx * Math.PI * 3 + state.t * 0.9) * ampY;
            tx = p.ox + waveX;
            ty = p.oy + waveY;
            p.vx += (tx - p.x) * 0.13;
            p.vy += (ty - p.y) * 0.13;
            p.vx *= 0.7;
            p.vy *= 0.7;
            p.x += p.vx;
            p.y += p.vy;
            norm = (wave + 1) / 2;
            rgb = iaLoaderParticlesGradientColor(nx);
            alpha = UBITS_IA_LOADER_PARTICLES_ALPHA_MIN + norm * UBITS_IA_LOADER_PARTICLES_ALPHA_RANGE;
            size = radiusMin + (radiusMax - radiusMin) * norm;
            if (radiusCap > 0 && size > radiusCap) size = radiusCap;
            state.ctx.beginPath();
            state.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            state.ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
            state.ctx.fill();
        }
    }

    function tick() {
        if (!state.running) return;
        drawParticlesFrame();
        state.rafId = requestAnimationFrame(tick);
    }

    function startParticles() {
        if (state.running) return;
        if (!resizeParticles()) {
            requestAnimationFrame(function () {
                if (loader.getAttribute('data-ia-particles-init') !== 'true') return;
                startParticles();
            });
            return;
        }
        state.running = true;
        tick();
    }

    function stopParticles() {
        state.running = false;
        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.rafId = 0;
        state.ctx.clearRect(0, 0, state.W, state.H);
    }

    function syncMotionPreference() {
        var reduced =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) stopParticles();
        else startParticles();
    }

    resizeParticles();

    if (typeof ResizeObserver !== 'undefined') {
        state.resizeObserver = new ResizeObserver(function () {
            resizeParticles();
        });
        state.resizeObserver.observe(stage);
    } else {
        window.addEventListener('resize', resizeParticles);
    }

    if (typeof window.matchMedia === 'function') {
        state.reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
        state.reducedMotionHandler = syncMotionPreference;
        state.reducedMotionMq.addEventListener('change', state.reducedMotionHandler);
    }

    syncMotionPreference();
}

function scanAndInitIaLoaderParticles(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll
        ? scope.querySelectorAll('.ubits-ia-loader:not([data-ia-particles-init])')
        : [];
    var n;
    for (n = 0; n < nodes.length; n++) {
        initIaLoaderParticles(nodes[n]);
    }
}

if (typeof window !== 'undefined') {
    window.getIaLoaderHTML = getIaLoaderHTML;
    window.initIaLoaderParticles = initIaLoaderParticles;
    window.destroyIaLoaderParticles = destroyIaLoaderParticles;
    window.scanAndInitIaLoaderParticles = scanAndInitIaLoaderParticles;

    document.addEventListener('DOMContentLoaded', function () {
        scanAndInitIaLoaderParticles(document);
    });

    if (typeof MutationObserver !== 'undefined' && document.documentElement) {
        var iaLoaderParticlesObserver = new MutationObserver(function (mutations) {
            var m;
            var node;
            for (m = 0; m < mutations.length; m++) {
                for (node = 0; node < mutations[m].addedNodes.length; node++) {
                    var added = mutations[m].addedNodes[node];
                    if (added.nodeType !== 1) continue;
                    if (added.classList && added.classList.contains('ubits-ia-loader')) {
                        initIaLoaderParticles(added);
                    } else {
                        scanAndInitIaLoaderParticles(added);
                    }
                }
            }
        });
        iaLoaderParticlesObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
}
