/**
 * LMS Creator — Modal «Agregar imagen» (Portada con IA · Subir portada · Enlace de tráiler opcional).
 * Estilo y tabs alineados a video-recurso-modal.js.
 * Portada con IA: al abrir, mismo ancho/alto que Subir/Tráiler y solo bloque «Describe tu idea»; al pulsar «Generar portada» se expande
 * (transición max-width) y aparece la columna de vista previa con loader y resultado.
 *
 * Depende: modal.js, input.js (+ dropdown-menu.js antes de input) para pestaña tráiler, file-upload.js, ia-loader.js,
 * empty-state.js, ai-panel.css (+ general-styles/ubits-ia-chat.css para .ubits-ia-chat-thread__input-area), tab.css,
 * portada-imagen-modal.css.
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'cc-portada-imagen-modal';
    var TOKEN_GENERATE = 2;
    var TOKEN_REGEN = 2;
    var MAX_IMAGE_MB = 5;
    var AI_IMAGES = [
        '../../images/cards-learn/portadas-ia/01-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/02-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/03-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/04-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/05-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/06-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/07-personas-en-oficina.jpg'
    ];

    var _onApply = null;
    var _onTrailerSaved = null;
    var _currentTab = 'ia';
    var _iaImageIndex = 0;
    var _iaResultSrc = '';
    var _uploadDataUrl = '';
    var _modalTrailerUrl = '';
    var _trailerInputInited = false;
    var _subirFuInited = false;
    /** Primera vez en la pestaña IA: modal pequeño, solo input; tras «Generar portada» se expande con preview. */
    var _pimIaLayoutExpanded = false;

    function getTokens() {
        return global._ubitsAiTokenPool != null ? global._ubitsAiTokenPool : 200;
    }

    function syncPimTokensBadge() {
        var n = getTokens();
        var el = document.getElementById('cc-pim-modal-tokens-badge');
        if (!el) return;
        var num = el.querySelector('.ubits-badge-tag__token-number');
        if (num) num.textContent = String(n);
        el.setAttribute('aria-label', String(n) + ' tokens restantes');
    }

    function trySpendTokens(cost) {
        var cur = getTokens();
        if (cur < cost) {
            if (typeof global.showToast === 'function') {
                global.showToast('warning', 'No tienes suficientes tokens (' + cost + ' requeridos).', {
                    containerId: 'ubits-toast-container'
                });
            }
            return false;
        }
        var next = Math.max(0, cur - cost);
        global._ubitsAiTokenPool = next;
        if (typeof global.setAIPanelTokensBadgeValue === 'function') {
            global.setAIPanelTokensBadgeValue(next);
        }
        syncPimTokensBadge();
        return true;
    }

    function esc(s) {
        if (s == null) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function isAllowedTrailerUrl(value) {
        var v = String(value || '').trim();
        if (!v.length) return true;
        try {
            var u = new URL(v);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
            var h = u.hostname.toLowerCase();
            if (h === 'youtu.be' || h.endsWith('.youtu.be')) return true;
            if (h.includes('youtube.com') || h.includes('youtube-nocookie.com')) return true;
            if (h.includes('vimeo.com')) return true;
            if (h.includes('drive.google.com') || h.includes('docs.google.com')) return true;
            if (h.includes('google.com') && u.pathname.indexOf('/drive') !== -1) return true;
            if (h.includes('onedrive.') || h.includes('1drv.ms') || h.includes('sharepoint.com')) return true;
            return false;
        } catch (e) {
            return false;
        }
    }

    function randomizeIaImageIndex() {
        var n = AI_IMAGES.length;
        if (n <= 1) return;
        var prev = _iaImageIndex;
        var next = Math.floor(Math.random() * n);
        var tries = 0;
        while (next === prev && tries < 16) {
            next = Math.floor(Math.random() * n);
            tries += 1;
        }
        if (next === prev) next = (prev + 1) % n;
        _iaImageIndex = next;
    }

    function applyAiChrome(overlay) {
        var titleSpan = overlay.querySelector('.ubits-modal-title');
        if (titleSpan) titleSpan.textContent = 'Agregar imagen';

        var modalContent = overlay.querySelector('.ubits-modal-content');
        if (modalContent) {
            modalContent.classList.add('portada-ia-modal-content', 'cc-pim-modal-content');
            modalContent.style.backgroundColor = 'var(--surface-default, #FFFFFF)';
            modalContent.style.backgroundImage =
                'radial-gradient(ellipse 100% 80% at 10% 0%, rgba(var(--modo-ia-glow-orb-rgb-1, 26, 107, 255), 0.15) 0%, transparent 50%),' +
                'radial-gradient(ellipse 95% 78% at 50% 0%, rgba(var(--modo-ia-glow-orb-rgb-2, 76, 230, 255), 0.15) 0%, transparent 48%),' +
                'radial-gradient(ellipse 95% 75% at 90% 0%, rgba(var(--modo-ia-glow-orb-rgb-3, 255, 84, 22), 0.15) 0%, transparent 50%)';
        }

        var modalHeader = overlay.querySelector('.ubits-modal-header');
        if (modalHeader) {
            modalHeader.style.background = 'transparent';
            modalHeader.style.borderBottom = '';
        }

        var modalBody = overlay.querySelector('.ubits-modal-body');
        if (modalBody) {
            modalBody.style.padding = 'var(--padding-xl, 32px)';
            modalBody.style.overflow = 'hidden';
            modalBody.style.display = 'flex';
            modalBody.style.flexDirection = 'column';
        }

        var closeBtn = overlay.querySelector('.ubits-modal-close');
        if (modalHeader && closeBtn) {
            var wrap = document.createElement('div');
            wrap.style.display = 'inline-flex';
            wrap.style.alignItems = 'center';
            wrap.style.gap = 'var(--gap-sm)';

            var badge = document.createElement('span');
            badge.id = 'cc-pim-modal-tokens-badge';
            badge.className = 'ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs';
            badge.setAttribute('tabindex', '0');
            badge.setAttribute('data-tooltip', 'Número de tokens restantes.');
            badge.setAttribute('data-tooltip-delay', '0');
            badge.setAttribute('data-tooltip-tap-toggle', '');
            badge.setAttribute('aria-label', getTokens() + ' tokens restantes');
            badge.innerHTML =
                '<span class="ubits-badge-tag__token-cost" aria-hidden="true">' +
                '<i class="far fa-coin-vertical"></i>' +
                '<span class="ubits-badge-tag__token-number">' +
                String(getTokens()) +
                '</span>' +
                '</span>';

            wrap.appendChild(badge);
            wrap.appendChild(closeBtn);
            modalHeader.appendChild(wrap);

            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#' + badge.id);
            }
            syncPimTokensBadge();
        }
    }

    function buildTabBar() {
        return (
            '<div id="cc-pim-tabbar" class="cc-vmodal-tabbar" role="tablist">' +
            '<div class="ubits-tabs-on-bg">' +
            '<button type="button" class="ubits-tab ubits-tab--sm ubits-tab--active" role="tab" aria-selected="true" data-cc-pim-tab="ia">' +
            '<span>Portada con IA</span></button>' +
            '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-pim-tab="subir">' +
            '<span>Subir portada</span></button>' +
            '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-pim-tab="trailer">' +
            '<span>Tráiler (opcional)</span></button>' +
            '</div></div>'
        );
    }

    function buildIaPanel() {
        return (
            '<div class="cc-vmodal-panel" id="cc-pim-tab-ia">' +
            '<div class="cc-vm-ia-layout" id="cc-pim-ia-layout">' +
            '<div class="cc-vm-left-col">' +
            '<div class="cc-vm-section">' +
            '<div class="cc-pim-idea-headline-intro" role="presentation">' +
            '<p class="cc-pim-idea-headline-intro__text">Tú lo imaginas, nosotros ' +
            '<span class="cc-pim-idea-headline-intro__gradient">lo generamos</span></p>' +
            '</div>' +
            '<p class="cc-vm-section-label ubits-body-md-bold cc-pim-idea-label-after">Describe tu idea</p>' +
            '<div class="ubits-ia-chat-thread__input-area">' +
            '<div class="ai-panel__input-box" id="cc-pim-idea-input-box">' +
            '<textarea id="cc-pim-idea-input" class="ai-panel__input ubits-body-md-regular" rows="2" placeholder="Describe la portada que imaginas"></textarea>' +
            '<div class="ai-panel__input-actions">' +
            '<div class="ai-panel__input-spacer" aria-hidden="true"></div>' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm ubits-ia-button--with-token-cost" id="cc-pim-btn-generar">' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
            '<span class="ubits-ia-button__token-number">' +
            TOKEN_GENERATE +
            '</span><i class="far fa-coin-vertical"></i></span>' +
            '<span>Generar portada</span></button>' +
            '</div></div></div></div></div>' +
            '<div class="cc-vm-right-col">' +
            '<div class="cc-pim-preview-stage" id="cc-pim-preview-stage" aria-live="polite">' +
            '<div id="cc-pim-preview-empty-host"></div>' +
            '<div class="cc-pim-preview-loader-host" id="cc-pim-preview-loader" style="display:none" aria-busy="true"></div>' +
            '<div class="cc-pim-preview-result" id="cc-pim-preview-result" style="display:none"></div>' +
            '</div></div></div></div>'
        );
    }

    function buildSubirPanel() {
        return (
            '<div class="cc-vmodal-panel cc-vmodal-panel--hidden" id="cc-pim-tab-subir">' +
            '<div class="cc-vmodal-subir-layout">' +
            '<div class="cc-vmodal-subir-centered">' +
            '<div id="cc-pim-subir-fu-wrap"></div></div></div></div>'
        );
    }

    function buildTrailerPanel() {
        return (
            '<div class="cc-vmodal-panel cc-vmodal-panel--hidden" id="cc-pim-tab-trailer">' +
            '<div class="cc-vmodal-enlace-layout">' +
            '<div class="cc-vmodal-enlace-centered">' +
            '<p class="cc-vmodal-enlace-title">Pega el <span class="cc-vmodal-enlace-title-em">enlace del tráiler</span> que quieres cargar</p>' +
            '<div id="cc-pim-trailer-input-wrap"></div></div></div></div>'
        );
    }

    function buildBody() {
        return '<div class="cc-vmodal">' + buildTabBar() + buildIaPanel() + buildSubirPanel() + buildTrailerPanel() + '</div>';
    }

    function buildFooter() {
        return (
            '<div class="ubits-modal-footer__right">' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-pim-footer-use-ia" style="display:none">' +
            '<span>Usar esta imagen</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-pim-footer-use-upload" style="display:none">' +
            '<span>Usar esta imagen</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-pim-footer-save-trailer" style="display:none">' +
            '<span>Guardar tráiler</span></button>' +
            '</div>'
        );
    }

    function setPreviewState(mode) {
        var emptyHost = document.getElementById('cc-pim-preview-empty-host');
        var ld = document.getElementById('cc-pim-preview-loader');
        var rs = document.getElementById('cc-pim-preview-result');
        if (emptyHost) {
            emptyHost.style.display = mode === 'placeholder' ? 'flex' : 'none';
        }
        if (ld) ld.style.display = mode === 'loader' ? '' : 'none';
        if (rs) rs.style.display = mode === 'result' ? '' : 'none';
    }

    function initPimPreviewEmptyState() {
        var host = document.getElementById('cc-pim-preview-empty-host');
        if (!host || typeof global.loadEmptyState !== 'function') return;
        global.loadEmptyState('cc-pim-preview-empty-host', {
            icon: 'fa-image',
            iconSize: 'md',
            title: 'Vista previa de la portada',
            description: 'Aquí verás la portada cuando la generes con IA.'
        });
    }

    function renderIaResult(src) {
        var rs = document.getElementById('cc-pim-preview-result');
        if (!rs) return;
        rs.innerHTML =
            '<div class="cc-pim-result-surface">' +
            '<img id="cc-pim-result-img" class="cc-pim-result-img" src="' +
            esc(src) +
            '" alt="Portada generada">' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--xs ubits-ia-button--with-token-cost cc-pim-result-regen" id="cc-pim-btn-regen">' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
            '<span class="ubits-ia-button__token-number">' +
            TOKEN_REGEN +
            '</span><i class="far fa-coin-vertical"></i></span>' +
            '<span>Regenerar</span></button></div>';
        wireRegen();
        refreshGenButtons();
    }

    function refreshGenButtons() {
        var g = getTokens();
        var gen = document.getElementById('cc-pim-btn-generar');
        var reg = document.getElementById('cc-pim-btn-regen');
        if (gen) gen.disabled = g < TOKEN_GENERATE;
        if (reg) reg.disabled = g < TOKEN_REGEN;
    }

    function wireRegen() {
        var reg = document.getElementById('cc-pim-btn-regen');
        if (!reg) return;
        reg.onclick = function () {
            if (!trySpendTokens(TOKEN_REGEN)) return;
            reg.disabled = true;
            _iaResultSrc = '';
            syncFooter();
            randomizeIaImageIndex();
            setPreviewState('loader');
            var ld = document.getElementById('cc-pim-preview-loader');
            if (ld) {
                ld.innerHTML =
                    typeof global.getIaLoaderHTML === 'function'
                        ? global.getIaLoaderHTML({ label: 'Regenerando portada' })
                        : '<p class="ubits-body-sm-regular" role="status">Regenerando…</p>';
            }
            setTimeout(function () {
                _iaResultSrc = AI_IMAGES[_iaImageIndex];
                renderIaResult(_iaResultSrc);
                setPreviewState('result');
                var reg2 = document.getElementById('cc-pim-btn-regen');
                if (reg2) reg2.disabled = false;
                refreshGenButtons();
                syncFooter();
            }, 3000);
        };
    }

    function getPimIdeaText() {
        var ta = document.getElementById('cc-pim-idea-input');
        return ta ? String(ta.value || '').trim() : '';
    }

    var PIM_IDEA_TEXTAREA_AUTOSIZE_MAX_PX = 360;

    function autosizePimIdeaTextarea() {
        var ta = document.getElementById('cc-pim-idea-input');
        if (!ta) return;
        ta.style.height = 'auto';
        var sh = ta.scrollHeight;
        var cap = PIM_IDEA_TEXTAREA_AUTOSIZE_MAX_PX;
        var next = Math.min(sh, cap);
        ta.style.height = Math.max(40, next) + 'px';
        ta.style.overflowY = sh > cap ? 'auto' : 'hidden';
    }

    function initIdeaInput() {
        var ta = document.getElementById('cc-pim-idea-input');
        if (!ta || ta._ccPimIdeaWired) return;
        ta._ccPimIdeaWired = true;
        ta.addEventListener('input', function () {
            refreshGenButtons();
            autosizePimIdeaTextarea();
        });
        setTimeout(autosizePimIdeaTextarea, 0);
    }

    function initGenerarPortada() {
        var btn = document.getElementById('cc-pim-btn-generar');
        if (!btn || btn._ccPimWired) return;
        btn._ccPimWired = true;
        btn.addEventListener('click', function () {
            var text = getPimIdeaText();
            if (!text.length) {
                if (typeof global.showToast === 'function') {
                    global.showToast('warning', 'Escribe una descripción para generar la portada.', {
                        containerId: 'ubits-toast-container'
                    });
                }
                return;
            }
            if (!trySpendTokens(TOKEN_GENERATE)) return;
            btn.disabled = true;
            _iaResultSrc = '';
            var justExpanded = false;
            if (!_pimIaLayoutExpanded) {
                _pimIaLayoutExpanded = true;
                justExpanded = true;
                syncPimOverlayLayout();
            }
            syncFooter();
            randomizeIaImageIndex();
            function runLoader() {
                setPreviewState('loader');
                var ld = document.getElementById('cc-pim-preview-loader');
                if (ld) {
                    ld.innerHTML =
                        typeof global.getIaLoaderHTML === 'function'
                            ? global.getIaLoaderHTML({ label: 'Generando portada' })
                            : '<p class="ubits-body-sm-regular" role="status">Generando portada…</p>';
                }
            }
            if (justExpanded) {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        setTimeout(runLoader, 140);
                    });
                });
            } else {
                runLoader();
            }
            setTimeout(function () {
                _iaResultSrc = AI_IMAGES[_iaImageIndex];
                renderIaResult(_iaResultSrc);
                setPreviewState('result');
                btn.disabled = false;
                syncFooter();
                refreshGenButtons();
            }, 3000);
        });
    }

    function initSubirFileUpload() {
        var wrap = document.getElementById('cc-pim-subir-fu-wrap');
        if (!wrap || _subirFuInited || typeof global.createFileUpload !== 'function') return;
        _subirFuInited = true;
        global.createFileUpload({
            containerId: 'cc-pim-subir-fu-wrap',
            id: 'cc-pim-subir-fu',
            title: 'Imagen de portada',
            accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
            maxSizeMb: MAX_IMAGE_MB,
            maxLabel: '5 MB',
            formats: 'JPG, PNG · Hasta 5 MB',
            successMessage: 'Imagen lista.',
            onChange: function (file) {
                _uploadDataUrl = '';
                if (!file) {
                    syncFooter();
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (ev) {
                    _uploadDataUrl = ev && ev.target ? ev.target.result : '';
                    syncFooter();
                };
                reader.readAsDataURL(file);
            },
            onError: function (err) {
                _uploadDataUrl = '';
                if (typeof global.showToast === 'function' && err && err.message) {
                    global.showToast('warning', err.message, { containerId: 'ubits-toast-container' });
                }
                syncFooter();
            }
        });
        syncFooter();
    }

    function initTrailerInput() {
        var wrap = document.getElementById('cc-pim-trailer-input-wrap');
        if (!wrap || _trailerInputInited || typeof global.createInput !== 'function') return;
        _trailerInputInited = true;
        global.createInput({
            containerId: 'cc-pim-trailer-input-wrap',
            type: 'text',
            label: '',
            showLabel: false,
            placeholder: 'https://www.youtube.com/watch?v=...',
            size: 'lg',
            value: _modalTrailerUrl,
            helperText: 'Solo se admiten enlaces de YouTube, Vimeo, Google Drive y OneDrive.',
            showHelper: true,
            onChange: function (val) {
                _modalTrailerUrl = String(val || '').trim();
                var inp = wrap.querySelector('input');
                if (inp) {
                    var ok = !_modalTrailerUrl.length || isAllowedTrailerUrl(_modalTrailerUrl);
                    if (ok) {
                        inp.style.borderColor = 'var(--ubits-border-1)';
                        inp.style.borderWidth = '1px';
                    } else {
                        inp.style.borderColor = 'var(--ubits-feedback-accent-error)';
                        inp.style.borderWidth = '2px';
                    }
                }
                syncFooter();
            }
        });
        syncFooter();
    }

    function syncFooter() {
        var useIa = document.getElementById('cc-pim-footer-use-ia');
        var useUp = document.getElementById('cc-pim-footer-use-upload');
        var saveT = document.getElementById('cc-pim-footer-save-trailer');
        var hasIaResult = !!_iaResultSrc;
        var trailerSaveEnabled =
            _modalTrailerUrl.length > 0 && isAllowedTrailerUrl(_modalTrailerUrl);

        if (useIa) {
            useIa.style.display = _currentTab === 'ia' ? '' : 'none';
            useIa.disabled = !hasIaResult;
        }
        if (useUp) {
            useUp.style.display = _currentTab === 'subir' ? '' : 'none';
            useUp.disabled = !_uploadDataUrl;
        }
        if (saveT) {
            saveT.style.display = _currentTab === 'trailer' ? '' : 'none';
            saveT.disabled = !trailerSaveEnabled;
        }

        syncPimOverlayLayout();
    }

    function syncPimOverlayLayout() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;
        var compactTab = _currentTab !== 'ia';
        overlay.classList.toggle('cc-pim--compact', compactTab);
        overlay.classList.toggle('cc-pim--ia-intro', _currentTab === 'ia' && !_pimIaLayoutExpanded);

        var mc = overlay.querySelector('.cc-pim-modal-content');
        if (mc) {
            mc.setAttribute(
                'data-cc-pim-ia-expanded',
                _currentTab === 'ia' && _pimIaLayoutExpanded ? 'true' : 'false'
            );
        }

        var stage = document.getElementById('cc-pim-preview-stage');
        if (stage) {
            var hidePreviewA11y = _currentTab !== 'ia' || !_pimIaLayoutExpanded;
            stage.setAttribute('aria-hidden', hidePreviewA11y ? 'true' : 'false');
        }
    }

    function wireFooterActions() {
        var useIa = document.getElementById('cc-pim-footer-use-ia');
        if (useIa) {
            useIa.onclick = function () {
                if (!_iaResultSrc || !_onApply) return;
                _onApply({ dataUrl: _iaResultSrc, trailerUrl: _modalTrailerUrl, fromAi: true });
                if (typeof global.closeModal === 'function') global.closeModal(OVERLAY_ID);
            };
        }
        var useUp = document.getElementById('cc-pim-footer-use-upload');
        if (useUp) {
            useUp.onclick = function () {
                if (!_uploadDataUrl || !_onApply) return;
                _onApply({ dataUrl: _uploadDataUrl, trailerUrl: _modalTrailerUrl, fromAi: false });
                if (typeof global.closeModal === 'function') global.closeModal(OVERLAY_ID);
            };
        }
        var saveT = document.getElementById('cc-pim-footer-save-trailer');
        if (saveT) {
            saveT.onclick = function () {
                if (saveT.disabled) return;
                if (!_modalTrailerUrl.length || !isAllowedTrailerUrl(_modalTrailerUrl)) return;
                if (_onTrailerSaved) _onTrailerSaved(_modalTrailerUrl);
                if (typeof global.showToast === 'function') {
                    global.showToast('success', 'Tráiler guardado. Se aplicará al confirmar la portada.', {
                        containerId: 'ubits-toast-container'
                    });
                }
            };
        }
    }

    function switchToTab(tab) {
        _currentTab = tab;

        var bar = document.getElementById('cc-pim-tabbar');
        if (bar) {
            bar.querySelectorAll('[data-cc-pim-tab]').forEach(function (btn) {
                var t = btn.getAttribute('data-cc-pim-tab');
                var on = t === tab;
                btn.classList.toggle('ubits-tab--active', on);
                btn.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        }
        ['ia', 'subir', 'trailer'].forEach(function (p) {
            var el = document.getElementById('cc-pim-tab-' + p);
            if (el) el.classList.toggle('cc-vmodal-panel--hidden', p !== tab);
        });
        if (tab === 'trailer' && !_trailerInputInited) {
            initTrailerInput();
        }
        if (tab === 'subir' && !_subirFuInited) {
            initSubirFileUpload();
        }
        syncFooter();
    }

    function wireTabBar() {
        var bar = document.getElementById('cc-pim-tabbar');
        if (!bar || bar._ccPimTabWired) return;
        bar._ccPimTabWired = true;
        bar.addEventListener('click', function (e) {
            var b = e.target.closest('[data-cc-pim-tab]');
            if (!b || !bar.contains(b)) return;
            switchToTab(b.getAttribute('data-cc-pim-tab'));
        });
    }

    function resetState(opts) {
        opts = opts || {};
        _onApply = typeof opts.onApply === 'function' ? opts.onApply : null;
        _onTrailerSaved = typeof opts.onTrailerSaved === 'function' ? opts.onTrailerSaved : null;
        _currentTab = 'ia';
        _iaImageIndex = 0;
        _iaResultSrc = '';
        _uploadDataUrl = '';
        _modalTrailerUrl = opts.initialTrailerUrl != null ? String(opts.initialTrailerUrl).trim() : '';
        _trailerInputInited = false;
        _subirFuInited = false;
        _pimIaLayoutExpanded = false;
    }

    function openPortadaImagenModal(opts) {
        if (typeof global.openModal !== 'function') return;
        resetState(opts);

        var overlay = global.openModal({
            overlayId: OVERLAY_ID,
            title: 'Agregar imagen',
            bodyHtml: buildBody(),
            size: 'lg',
            closeOnOverlayClick: false,
            footerHtml: buildFooter(),
            onClose: function () {
                _onApply = null;
                _onTrailerSaved = null;
            }
        });

        if (overlay) applyAiChrome(overlay);

        setTimeout(function () {
            wireTabBar();
            initIdeaInput();
            initGenerarPortada();
            wireFooterActions();
            setPreviewState('placeholder');
            initPimPreviewEmptyState();
            switchToTab('ia');
            refreshGenButtons();
            syncFooter();
            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
            }
        }, 0);
    }

    global.openPortadaImagenModal = openPortadaImagenModal;
})(window);
