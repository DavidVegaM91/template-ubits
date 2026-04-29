/* ========================================
   UBITS SKELETON — helpers opcionales
   El contrato principal es skeleton.css (clases BEM).
   Usa estos helpers solo si generas HTML desde JS (innerHTML).
   ======================================== */

/**
 * Devuelve HTML de un bloque línea skeleton.
 * @param {string} classes — clases extra (ej. "ubits-skeleton--w-2-3")
 */
function ubitsSkeletonLineHtml(classes) {
    var extra = classes ? ' ' + String(classes).trim() : '';
    return (
        '<span class="ubits-skeleton ubits-skeleton--line ubits-skeleton--md' +
        extra +
        '" aria-hidden="true"></span>'
    );
}

/**
 * Pila de líneas con anchos típicos (100%, 92%, 67%).
 * @param {number} count — número de líneas (default 3)
 */
function ubitsSkeletonTextBlockHtml(count) {
    var n = count != null ? Math.min(8, Math.max(1, parseInt(count, 10))) : 3;
    if (isNaN(n)) n = 3;
    var widths = ['ubits-skeleton--w-full', 'ubits-skeleton--w-11-12', 'ubits-skeleton--w-2-3'];
    var inner = '';
    for (var i = 0; i < n; i++) {
        inner += ubitsSkeletonLineHtml(widths[i % widths.length]);
    }
    return '<div class="ubits-skeleton-stack">' + inner + '</div>';
}

/**
 * Fila avatar + líneas (patrón lista).
 */
function ubitsSkeletonRowHtml(lineCount) {
    var lines = ubitsSkeletonTextBlockHtml(lineCount != null ? lineCount : 2);
    return (
        '<div class="ubits-skeleton-row">' +
        '<span class="ubits-skeleton ubits-skeleton--circle ubits-skeleton--avatar-md" aria-hidden="true"></span>' +
        '<div class="ubits-skeleton-row__main">' +
        lines +
        '</div></div>'
    );
}
