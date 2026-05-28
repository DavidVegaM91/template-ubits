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

    /** blob:, http(s): o ruta relativa al HTML (p. ej. ../../pdf/archivo.pdf). */
    function resolvePdfDocumentUrl(urlOrPath) {
        var s = String(urlOrPath || '').trim();
        if (!s) return '';
        if (s.indexOf('blob:') === 0 || /^https?:/i.test(s)) return s;
        try {
            return new URL(s, window.location.href).href;
        } catch (e) {
            return s;
        }
    }

    function toPdfJsBinaryData(input) {
        if (input == null) return null;
        if (typeof Uint8Array !== 'undefined' && input instanceof Uint8Array) return input;
        if (input instanceof ArrayBuffer) return new Uint8Array(input);
        return null;
    }

    function showPdfNativeFallback(pagesEl, loadingEl, fallbackUrl) {
        var docUrl = resolvePdfDocumentUrl(fallbackUrl);
        if (!docUrl || !pagesEl) return false;
        if (loadingEl) loadingEl.style.display = 'none';
        var safe = docUrl.replace(/"/g, '&quot;');
        pagesEl.innerHTML =
            '<embed class="cc-pdf-resource__embed-fallback" type="application/pdf" src="' +
            safe +
            '" title="Vista previa del PDF" style="width:100%;min-height:min(70vh,720px);display:block;background:var(--ubits-bg-1);">';
        return true;
    }

    function showPdfIframeFallback(pagesEl, loadingEl, fallbackUrl) {
        var docUrl = resolvePdfDocumentUrl(fallbackUrl);
        if (!docUrl || !pagesEl) return false;
        if (loadingEl) loadingEl.style.display = 'none';
        pagesEl.innerHTML =
            '<iframe class="cc-pdf-resource__iframe-fallback" src="' +
            docUrl.replace(/"/g, '&quot;') +
            '" title="Vista previa del PDF" style="width:100%;min-height:min(70vh,720px);border:none;display:block;background:var(--ubits-bg-1);"></iframe>';
        return true;
    }

    function tryPdfNativeFallbackChain(pagesEl, loadingEl, urls) {
        var list = urls || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i] && showPdfNativeFallback(pagesEl, loadingEl, list[i])) return true;
        }
        for (var j = 0; j < list.length; j++) {
            if (list[j] && showPdfIframeFallback(pagesEl, loadingEl, list[j])) return true;
        }
        return false;
    }

    /**
     * Visor nativo del navegador (sin PDF.js). Solo último recurso.
     */
    function mountCrearContenidoPdfViewerNative(viewerRoot, urlOrPath) {
        if (!viewerRoot || !urlOrPath) return;
        var pagesEl = viewerRoot.querySelector('.cc-pdf-resource__pdfjs-pages');
        var loadingEl = viewerRoot.querySelector('.cc-pdf-resource__pdfjs-loading');
        if (!pagesEl) return;
        pagesEl.innerHTML = '';
        if (loadingEl) {
            loadingEl.style.display = '';
            loadingEl.textContent = 'Cargando vista previa…';
            loadingEl.classList.remove('cc-pdf-resource__pdfjs-loading--error');
        }
        if (!tryPdfNativeFallbackChain(pagesEl, loadingEl, [urlOrPath])) {
            if (loadingEl) {
                loadingEl.style.display = '';
                loadingEl.textContent = 'No se pudo mostrar el PDF.';
                loadingEl.classList.add('cc-pdf-resource__pdfjs-loading--error');
            }
        }
    }

    /**
     * @param {HTMLElement} viewerRoot
     * @param {string|Blob|ArrayBuffer|Uint8Array} source
     * @param {{ fallbackUrl?: string, nativeOnly?: boolean, allowNativeFallback?: boolean }} [opts]
     */
    function mountCrearContenidoPdfViewer(viewerRoot, source, opts) {
        opts = opts || {};
        if (!viewerRoot || source == null) return;

        var pagesEl = viewerRoot.querySelector('.cc-pdf-resource__pdfjs-pages');
        var loadingEl = viewerRoot.querySelector('.cc-pdf-resource__pdfjs-loading');
        if (!pagesEl) return;

        if (opts.nativeOnly) {
            mountCrearContenidoPdfViewerNative(viewerRoot, source);
            return;
        }

        if (typeof pdfjsLib === 'undefined') {
            if (
                opts.allowNativeFallback !== false &&
                tryPdfNativeFallbackChain(pagesEl, loadingEl, [
                    opts.fallbackUrl,
                    typeof source === 'string' ? source : null
                ])
            ) {
                return;
            }
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

        var tempObjectUrl = null;
        var sourceBlob = typeof Blob !== 'undefined' && source instanceof Blob ? source : null;

        function revokeTempUrl() {
            if (!tempObjectUrl) return;
            try {
                URL.revokeObjectURL(tempObjectUrl);
            } catch (e) {
                /* noop */
            }
            tempObjectUrl = null;
        }

        function renderPdfDocument(loadingTask) {
            return loadingTask.promise.then(function (pdf) {
                var numPages = pdf.numPages;

                function renderPageNum(n) {
                    if (n > numPages) {
                        if (loadingEl) loadingEl.style.display = 'none';
                        revokeTempUrl();
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
                        var renderTask = page.render({
                            canvasContext: ctx,
                            viewport: viewport
                        });
                        var renderDone =
                            renderTask && renderTask.promise
                                ? renderTask.promise
                                : Promise.resolve();
                        return renderDone.then(function () {
                            return renderPageNum(n + 1);
                        });
                    });
                }

                return renderPageNum(1);
            });
        }

        function onPdfJsFailed(err, extraUrls) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[crear-contenido-pdf-viewer]', err);
            }
            revokeTempUrl();
            if (opts.allowNativeFallback === false) {
                if (loadingEl) {
                    loadingEl.style.display = '';
                    loadingEl.textContent = 'No se pudo mostrar el PDF.';
                    loadingEl.classList.add('cc-pdf-resource__pdfjs-loading--error');
                }
                return;
            }
            var fallbackChain = extraUrls || [];
            if (opts.fallbackUrl) fallbackChain.push(opts.fallbackUrl);
            if (typeof source === 'string') fallbackChain.push(source);
            if (tryPdfNativeFallbackChain(pagesEl, loadingEl, fallbackChain)) {
                return;
            }
            if (loadingEl) {
                loadingEl.style.display = '';
                loadingEl.textContent = 'No se pudo mostrar el PDF.';
                loadingEl.classList.add('cc-pdf-resource__pdfjs-loading--error');
            }
        }

        /** 1) data (File/Blob) → 2) blob URL → 3) ruta http(s)/file */
        function tryLoadWithData(uint8) {
            return renderPdfDocument(pdfjsLib.getDocument({ data: uint8 }));
        }

        function tryLoadWithBlobUrl() {
            if (!sourceBlob) return Promise.reject(new Error('no-blob'));
            tempObjectUrl = URL.createObjectURL(sourceBlob);
            return renderPdfDocument(pdfjsLib.getDocument({ url: tempObjectUrl }));
        }

        function tryLoadWithUrlString() {
            var binary = toPdfJsBinaryData(source);
            if (binary) {
                return tryLoadWithData(binary);
            }
            var docUrl = resolvePdfDocumentUrl(source);
            if (!docUrl) return Promise.reject(new Error('no-url'));
            return renderPdfDocument(pdfjsLib.getDocument({ url: docUrl }));
        }

        var pipeline = Promise.resolve();

        if (sourceBlob && typeof sourceBlob.arrayBuffer === 'function') {
            pipeline = sourceBlob
                .arrayBuffer()
                .then(function (buf) {
                    return tryLoadWithData(new Uint8Array(buf));
                })
                .catch(function () {
                    return tryLoadWithBlobUrl();
                });
        } else {
            pipeline = tryLoadWithUrlString();
        }

        pipeline.catch(function (err) {
            if (sourceBlob) {
                return tryLoadWithBlobUrl().catch(function (err2) {
                    onPdfJsFailed(err2, [tempObjectUrl]);
                });
            }
            onPdfJsFailed(err, []);
        });
    }

    global.mountCrearContenidoPdfViewer = mountCrearContenidoPdfViewer;
    global.mountCrearContenidoPdfViewerNative = mountCrearContenidoPdfViewerNative;
})(typeof window !== 'undefined' ? window : this);
