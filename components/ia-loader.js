/**
 * UBITS IA Loader — indicador de carga para flujos IA.
 *
 * Estructura: __frame → __stage (gradiente IA + shimmer) → __cluster (__center sparkles en 4 <g> + __label).
 * Ícono y texto en `--ubits-fg-2-high-static-inverted` en claro y oscuro.
 *
 * Uso:
 *   getIaLoaderHTML()
 *   getIaLoaderHTML({ label: 'Texto' })
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

if (typeof window !== 'undefined') {
    window.getIaLoaderHTML = getIaLoaderHTML;
}
