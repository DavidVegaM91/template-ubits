/**
 * UBITS Loader Component
 * Loader circular oficial (doble anillo). Usa tokens --ubits-border-1 y --ubits-accent-brand.
 *
 * Uso:
 *   getLoaderHTML() → solo el <span class="ubits-loader">
 *   getLoaderHTML({ text: 'Cargando...' }) → wrap + loader + texto
 *   getLoaderHTML({ text: '...', wrap: false }) → loader + texto sin wrapper
 *
 * Requiere: components/loader.css, general-styles/ubits-colors.css
 *
 * Bugs conocidos / implementación: Ver documentación técnica en documentacion/componentes/loader.html.
 */

function getLoaderHTML(options) {
    options = options || {};
    var text = options.text;
    var wrap = options.wrap !== false;

    var html = '<span class="ubits-loader"></span>';
    if (text) {
        html += '<p class="ubits-loader-text ubits-body-md-regular">' + (String(text).replace(/</g, '&lt;').replace(/"/g, '&quot;')) + '</p>';
    }
    if (wrap && text) {
        html = '<div class="ubits-loader-wrap">' + html + '</div>';
    }
    return html;
}

if (typeof window !== 'undefined') {
    window.getLoaderHTML = getLoaderHTML;
}
