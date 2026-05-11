/**
 * Visor PDF embebido (PDF.js) para el paso Recursos de Crear contenido.
 * Sin panel lateral del visor nativo del navegador: páginas apiladas en vertical.
 *
 * Requiere: vendor/pdfjs/pdf.min.js (expone pdfjsLib), vendor/pdfjs/pdf.worker.min.js
 */
(function (global) {
    'use strict';

    function getPdfWorkerAbsoluteUrl() {
        try {
            return new URL('../../vendor/pdfjs/pdf.worker.min.js', window.location.href).href;
        } catch (e) {
            return '../../vendor/pdfjs/pdf.worker.min.js';
        }
    }

    /**
     * @param {HTMLElement} viewerRoot — .cc-pdf-resource__viewer-wrap[data-cc-pdf-js-viewer]
     * @param {string} blobUrl — object URL del PDF
     */
    function mountCrearContenidoPdfViewer(viewerRoot, blobUrl) {
        if (!viewerRoot || !blobUrl) return;

        var pagesEl = viewerRoot.querySelector('.cc-pdf-resource__pdfjs-pages');
        var loadingEl = viewerRoot.querySelector('.cc-pdf-resource__pdfjs-loading');
        if (!pagesEl) return;

        if (typeof pdfjsLib === 'undefined') {
            if (loadingEl) {
                loadingEl.textContent = 'No se pudo cargar el visor PDF.';
                loadingEl.classList.add('cc-pdf-resource__pdfjs-loading--error');
                loadingEl.style.display = '';
            }
            return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = getPdfWorkerAbsoluteUrl();

        pagesEl.innerHTML = '';
        if (loadingEl) {
            loadingEl.style.display = '';
            loadingEl.textContent = 'Cargando vista previa…';
            loadingEl.classList.remove('cc-pdf-resource__pdfjs-loading--error');
        }

        var loadingTask = pdfjsLib.getDocument({ url: blobUrl });
        loadingTask.promise
            .then(function (pdf) {
                var numPages = pdf.numPages;

                function renderPageNum(n) {
                    if (n > numPages) {
                        if (loadingEl) loadingEl.style.display = 'none';
                        return Promise.resolve();
                    }
                    return pdf.getPage(n).then(function (page) {
                        var wrap = document.createElement('div');
                        wrap.className = 'cc-pdf-resource__pdfjs-page';
                        var canvas = document.createElement('canvas');
                        canvas.setAttribute('role', 'presentation');
                        wrap.appendChild(canvas);
                        pagesEl.appendChild(wrap);

                        var cw = viewerRoot.clientWidth || 640;
                        var pad = 24;
                        var maxW = Math.max(200, cw - pad);
                        var vp1 = page.getViewport({ scale: 1 });
                        var scale = Math.min(maxW / vp1.width, 2.5);
                        var viewport = page.getViewport({ scale: scale });
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        var ctx = canvas.getContext('2d');
                        return page
                            .render({
                                canvasContext: ctx,
                                viewport: viewport
                            })
                            .promise.then(function () {
                                return renderPageNum(n + 1);
                            });
                    });
                }

                return renderPageNum(1);
            })
            .catch(function (err) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('[crear-contenido-pdf-viewer]', err);
                }
                if (loadingEl) {
                    loadingEl.style.display = '';
                    loadingEl.textContent = 'No se pudo mostrar el PDF.';
                    loadingEl.classList.add('cc-pdf-resource__pdfjs-loading--error');
                }
            });
    }

    global.mountCrearContenidoPdfViewer = mountCrearContenidoPdfViewer;
})(typeof window !== 'undefined' ? window : this);
