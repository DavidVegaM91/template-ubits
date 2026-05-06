/**
 * UBITS IA Loader — indicador de carga para flujos IA (laboratorio 01+34 unificado).
 *
 * Estructura: __frame → __stage → __ambient + __cluster (__center + __label) centrados con gap compacto.
 * Tema (`body[data-theme]`): claro = 34 (neón + sparkles gradiente); oscuro = 01 (nebulosa + chispas claras).
 *
 * Uso:
 *   getIaLoaderHTML()
 *   getIaLoaderHTML({ label: 'Texto' })
 *   getIaLoaderHTML({ idSuffix: 'mi-modal' }) — sufijo estable para ids de gradiente (varias instancias).
 *
 * Requiere: ia-loader.css, ubits-colors.css; para sparkles/orbes en claro con gradiente modo IA: --modo-ia-* (p. ej. aprendizaje-ia-gradientes.css).
 */

function getIaLoaderSparklesLightSvg(gradId) {
    var gid = String(gradId).replace(/[^a-zA-Z0-9_-]/g, '');
    return (
        '<svg class="ubits-ia-loader__sparkles-svg" viewBox="0 0 100 100" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="' +
        gid +
        '" x1="8" y1="12" x2="92" y2="88" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0%" stop-color="var(--modo-ia-gradient-a, var(--ubits-accent-brand))" />' +
        '<stop offset="35%" stop-color="var(--modo-ia-gradient-b, var(--ubits-accent-brand))" />' +
        '<stop offset="65%" stop-color="var(--modo-ia-gradient-c, var(--ubits-accent-brand))" />' +
        '<stop offset="100%" stop-color="var(--modo-ia-gradient-d, var(--ubits-accent-brand))" />' +
        '</linearGradient>' +
        '</defs>' +
        '<g class="ubits-ia-loader__spark-g1" fill="url(#' +
        gid +
        ')">' +
        '<path d="M34.38,14.31c.51-1.11,1.62-1.81,2.85-1.81s2.32.71,2.83,1.81l10.29,22.27,22.27,10.29c1.11.51,1.82,1.62,1.82,2.85s-.7,2.32-1.82,2.83l-22.27,10.29-10.29,22.27c-.51,1.11-1.62,1.82-2.83,1.82s-2.34-.7-2.85-1.82l-10.29-22.27L1.81,52.56c-1.11-.51-1.81-1.62-1.81-2.83s.71-2.34,1.81-2.85l22.27-10.29,10.29-22.27Z" />' +
        '<path d="M32.6,40.53c-.94,2.01-2.56,3.63-4.57,4.57l-10,4.63,10,4.61c2.01.76,3.63,2.56,4.57,4.57l4.63,10,4.61-10c.76-2.01,2.56-3.81,4.57-4.57l10-4.61-10-4.63c-2.01-.94-3.81-2.56-4.57-4.57l-4.61-10-4.63,10Z" />' +
        '</g>' +
        '<g class="ubits-ia-loader__spark-g2" fill="url(#' +
        gid +
        ')">' +
        '<path d="M63.96,16.64l11.04-4.14,4.14-11.04c.33-.88,1.17-1.46,2.11-1.46s1.78.58,2.11,1.46l4.14,11.04,11.04,4.14c.88.33,1.46,1.17,1.46,2.11s-.59,1.78-1.46,2.11l-11.04,4.14-4.14,11.04c-.33.88-1.17,1.46-2.11,1.46s-1.78-.59-2.11-1.46l-4.14-11.04-11.04-4.14c-1.05-.33-1.46-1.17-1.46-2.11s.41-1.78,1.46-2.11Z" />' +
        '</g>' +
        '<g class="ubits-ia-loader__spark-g3" fill="url(#' +
        gid +
        ')">' +
        '<path d="M79.14,63.96c.33-1.05,1.17-1.46,2.11-1.46s1.78.41,2.11,1.46l4.14,11.04,11.04,4.14c.88.33,1.46,1.17,1.46,2.11s-.59,1.78-1.46,2.11l-11.04,4.14-4.14,11.04c-.33.88-1.17,1.46-2.11,1.46s-1.78-.59-2.11-1.46l-4.14-11.04-11.04-4.14c-1.05-.33-1.46-1.17-1.46-2.11s.41-1.78,1.46-2.11l11.04-4.14,4.14-11.04Z" />' +
        '</g>' +
        '</svg>'
    );
}

function getIaLoaderSparklesDarkSvg() {
    return (
        '<svg class="ubits-ia-loader__sparkles-svg" viewBox="0 0 100 100" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="ubits-ia-loader__spark-g1" fill="currentColor">' +
        '<path d="M34.38,14.31c.51-1.11,1.62-1.81,2.85-1.81s2.32.71,2.83,1.81l10.29,22.27,22.27,10.29c1.11.51,1.82,1.62,1.82,2.85s-.7,2.32-1.82,2.83l-22.27,10.29-10.29,22.27c-.51,1.11-1.62,1.82-2.83,1.82s-2.34-.7-2.85-1.82l-10.29-22.27L1.81,52.56c-1.11-.51-1.81-1.62-1.81-2.83s.71-2.34,1.81-2.85l22.27-10.29,10.29-22.27Z" />' +
        '<path d="M32.6,40.53c-.94,2.01-2.56,3.63-4.57,4.57l-10,4.63,10,4.61c2.01.76,3.63,2.56,4.57,4.57l4.63,10,4.61-10c.76-2.01,2.56-3.81,4.57-4.57l10-4.61-10-4.63c-2.01-.94-3.81-2.56-4.57-4.57l-4.61-10-4.63,10Z" />' +
        '</g>' +
        '<g class="ubits-ia-loader__spark-g2" fill="currentColor">' +
        '<path d="M63.96,16.64l11.04-4.14,4.14-11.04c.33-.88,1.17-1.46,2.11-1.46s1.78.58,2.11,1.46l4.14,11.04,11.04,4.14c.88.33,1.46,1.17,1.46,2.11s-.59,1.78-1.46,2.11l-11.04,4.14-4.14,11.04c-.33.88-1.17,1.46-2.11,1.46s-1.78-.59-2.11-1.46l-4.14-11.04-11.04-4.14c-1.05-.33-1.46-1.17-1.46-2.11s.41-1.78,1.46-2.11Z" />' +
        '</g>' +
        '<g class="ubits-ia-loader__spark-g3" fill="currentColor">' +
        '<path d="M79.14,63.96c.33-1.05,1.17-1.46,2.11-1.46s1.78.41,2.11,1.46l4.14,11.04,11.04,4.14c.88.33,1.46,1.17,1.46,2.11s-.59,1.78-1.46,2.11l-11.04,4.14-4.14,11.04c-.33.88-1.17,1.46-2.11,1.46s-1.78-.59-2.11-1.46l-4.14-11.04-11.04-4.14c-1.05-.33-1.46-1.17-1.46-2.11s.41-1.78,1.46-2.11l11.04-4.14,4.14-11.04Z" />' +
        '</g>' +
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

    var suffix =
        options.idSuffix != null && String(options.idSuffix).trim() !== ''
            ? String(options.idSuffix).replace(/[^a-zA-Z0-9_-]/g, '')
            : 'g' + Math.random().toString(36).slice(2, 10);
    var gradId = 'ubits-ia-spark-' + suffix;

    var inner =
        '<div class="ubits-ia-loader__frame">' +
        '<div class="ubits-ia-loader__stage">' +
        '<div class="ubits-ia-loader__ambient" aria-hidden="true">' +
        '<span class="ubits-ia-loader__orb ubits-ia-loader__orb--1"></span>' +
        '<span class="ubits-ia-loader__orb ubits-ia-loader__orb--2"></span>' +
        '<span class="ubits-ia-loader__orb ubits-ia-loader__orb--3"></span>' +
        '</div>' +
        '<div class="ubits-ia-loader__cluster">' +
        '<div class="ubits-ia-loader__center">' +
        '<span class="ubits-ia-loader__halo" aria-hidden="true"></span>' +
        '<div class="ubits-ia-loader__proto ubits-ia-loader__proto--neon" aria-hidden="true"></div>' +
        '<div class="ubits-ia-loader__proto ubits-ia-loader__proto--nebula" aria-hidden="true"><span></span><span></span></div>' +
        '<span class="ubits-ia-loader__sparkles-wrap ubits-ia-loader__sparkles-wrap--light" aria-hidden="true">' +
        getIaLoaderSparklesLightSvg(gradId) +
        '</span>' +
        '<span class="ubits-ia-loader__sparkles-wrap ubits-ia-loader__sparkles-wrap--dark" aria-hidden="true">' +
        getIaLoaderSparklesDarkSvg() +
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

if (typeof window !== 'undefined') {
    window.getIaLoaderHTML = getIaLoaderHTML;
}
