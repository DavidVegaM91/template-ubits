/**
 * UBITS IA Loader — indicador de carga para flujos IA.
 *
 * Estructura: __frame → __stage (gradiente IA + shimmer) → __cluster (__center sparkles en 4 <g> + __label).
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

/** Figma 571:8065 — cuatro subtrazos (M…Z); cada <g> anima a destiempo (como el loader previo). */
var UBITS_IA_SPARKLE_P1 = 'M8.07739 2.72314L9.34375 2.23438L9.8103 0.990234C9.83252 0.87915 9.9436 0.8125 10.0547 0.8125C10.1436 0.8125 10.2546 0.87915 10.2769 0.990234L10.7656 2.23438L12.0098 2.72314C12.1208 2.74536 12.1875 2.85645 12.1875 2.94531C12.1875 3.0564 12.1208 3.16748 12.0098 3.1897L10.7656 3.65625L10.2769 4.92261C10.2546 5.01147 10.1436 5.07812 10.0547 5.07812C9.9436 5.07812 9.83252 5.01147 9.8103 4.92261L9.34375 3.65625L8.07739 3.1897C7.98853 3.16748 7.92188 3.0564 7.92188 2.94531C7.92188 2.85645 7.98853 2.74536 8.07739 2.72314Z';
var UBITS_IA_SPARKLE_P2 = 'M1.01245 6.14453L1.39014 5.98901L1.56787 5.90015H1.59009L3.54517 4.98926L4.45605 3.01196L4.54492 2.83423L4.72266 2.45654C4.76709 2.32324 4.90039 2.23438 5.03369 2.23438C5.16699 2.23438 5.30029 2.32324 5.36694 2.45654L5.54468 2.83423L5.61133 3.01196L5.63354 3.03418L6.52222 4.98926L8.49951 5.90015L8.67725 5.98901L9.05493 6.16675C9.18823 6.21118 9.2771 6.34448 9.2771 6.47778C9.2771 6.61108 9.18823 6.74438 9.05493 6.81104L8.67725 6.96655L8.49951 7.05542L6.52222 7.96631L5.61133 9.92139V9.9436L5.52246 10.1213L5.36694 10.499C5.30029 10.6323 5.16699 10.7212 5.03369 10.7212C4.90039 10.7212 4.76709 10.6323 4.72266 10.499L4.54492 10.1213L4.45605 9.9436V9.92139L3.54517 7.96631L1.59009 7.05542H1.56787L1.39014 6.96655L1.01245 6.81104C0.87915 6.74438 0.8125 6.61108 0.8125 6.47778C0.8125 6.34448 0.87915 6.21118 1.01245 6.14453Z';
var UBITS_IA_SPARKLE_P3 = 'M2.85645 6.47778L3.9895 7.01099C4.21167 7.09985 4.41162 7.2998 4.52271 7.52197L5.03369 8.65503L5.56689 7.52197C5.67798 7.2998 5.85571 7.09985 6.07788 7.01099L7.21094 6.47778L6.07788 5.94458C5.85571 5.85571 5.67798 5.65576 5.56689 5.43359L5.03369 4.30054L4.52271 5.43359C4.41162 5.65576 4.21167 5.85571 3.9895 5.94458L2.85645 6.47778Z';
var UBITS_IA_SPARKLE_P4 = 'M9.34375 9.34375L9.8103 8.09961C9.83252 7.98853 9.9436 7.92188 10.0547 7.92188C10.1436 7.92188 10.2546 7.98853 10.2769 8.09961L10.7656 9.34375L12.0098 9.83252C12.1208 9.85474 12.1875 9.96582 12.1875 10.0547C12.1875 10.1658 12.1208 10.2769 12.0098 10.2991L10.7656 10.7656L10.2769 12.032C10.2546 12.1208 10.1436 12.1875 10.0547 12.1875C9.9436 12.1875 9.83252 12.1208 9.8103 12.032L9.34375 10.7656L8.07739 10.2991C7.98853 10.2769 7.92188 10.1658 7.92188 10.0547C7.92188 9.96582 7.98853 9.85474 8.07739 9.83252L9.34375 9.34375Z';

function getIaLoaderSparklesSvg() {
    return (
        '<svg class="ubits-ia-loader__sparkles-svg" viewBox="0 0 13 13" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="ubits-ia-loader__spark-g1"><path fill="currentColor" d="' +
        UBITS_IA_SPARKLE_P1 +
        '"/></g>' +
        '<g class="ubits-ia-loader__spark-g2"><path fill="currentColor" d="' +
        UBITS_IA_SPARKLE_P2 +
        '"/></g>' +
        '<g class="ubits-ia-loader__spark-g3"><path fill="currentColor" d="' +
        UBITS_IA_SPARKLE_P3 +
        '"/></g>' +
        '<g class="ubits-ia-loader__spark-g4"><path fill="currentColor" d="' +
        UBITS_IA_SPARKLE_P4 +
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
