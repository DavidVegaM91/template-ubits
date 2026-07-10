/**
 * LMS Creator — Modal «Agregar SCORM» + Modal edición inline + Color Picker HSV
 * Pool fijo de 15 tipos de diapositiva (una por tipo); el usuario elige tipos (checkbox);
 * se genera una diapositiva de cada tipo seleccionado, en orden pedagógico fijo.
 * Depende: modal.js, input.js, file-upload.js, color-picker.js (popover)
 */
(function (global) {
    'use strict';

    var OVERLAY_ID      = 'cc-scorm-recurso-modal';
    var EDIT_LIGHTBOX_ID = 'cc-scorm-edit-lightbox';
    var DELETE_SLIDE_MODAL_ID = 'cc-scorm-delete-slide-modal';
    var SCORM_GEN_TOKEN_COST = 15;

    /** Catálogo UI (mismo orden que buildPool / preview): col. izq. 1–8, col. der. 9–15. */
    var SCORM_SLIDE_TYPE_CATALOG = [
        { type: 'intro', label: 'Portada', tagDefault: 'Portada', icon: 'fa-comments', locked: true },
        { type: 'content', label: 'Lista viñetas', tagDefault: 'Lista viñetas', icon: 'fa-book-open' },
        { type: 'steps', label: 'Lista ordenada', tagDefault: 'Lista ordenada', icon: 'fa-list-ol' },
        { type: 'quote', label: 'Cita', tagDefault: 'Cita', icon: 'fa-quote-left' },
        { type: 'keypoint', label: 'Dato clave', tagDefault: 'Dato clave', icon: 'fa-lightbulb' },
        { type: 'split', label: 'Texto e imagen', tagDefault: 'Texto e imagen', icon: 'fa-columns' },
        { type: 'media', label: 'Imagen interactiva', tagDefault: 'Imagen interactiva', icon: 'fa-image' },
        { type: 'accordion', label: 'Acordeón', tagDefault: 'Acordeón', icon: 'fa-bars-staggered' },
        { type: 'tabs', label: 'Pestañas', tagDefault: 'Pestañas', icon: 'fa-folder-open' },
        { type: 'flashcards', label: 'Tarjetas', tagDefault: 'Tarjetas', icon: 'fa-clone' },
        { type: 'timeline', label: 'Línea de tiempo', tagDefault: 'Línea de tiempo', icon: 'fa-route' },
        { type: 'compare', label: 'Comparativa', tagDefault: 'Comparativa', icon: 'fa-scale-balanced' },
        { type: 'quiz_mc', label: 'Quiz', tagDefault: 'Quiz', icon: 'fa-list-check' },
        { type: 'match', label: 'Emparejamiento', tagDefault: 'Emparejamiento', icon: 'fa-link' },
        { type: 'summary', label: 'Resumen', tagDefault: 'Resumen', icon: 'fa-trophy' }
    ];

    function getSlideTypeMeta(type) {
        for (var i = 0; i < SCORM_SLIDE_TYPE_CATALOG.length; i++) {
            if (SCORM_SLIDE_TYPE_CATALOG[i].type === type) return SCORM_SLIDE_TYPE_CATALOG[i];
        }
        return null;
    }

    function resolveSlideTagLabel(slide) {
        if (slide && slide.tagLabel != null && String(slide.tagLabel).trim() !== '') {
            return String(slide.tagLabel).trim();
        }
        var meta = slide && slide.type ? getSlideTypeMeta(slide.type) : null;
        return meta ? meta.tagDefault : '';
    }

    function buildSlideTagHtml(slide, idx, editMode) {
        var meta = getSlideTypeMeta(slide.type) || {};
        var iconClass = slide.icon || meta.icon || 'fa-file';
        var label = resolveSlideTagLabel(slide);
        var labelHtml = editMode
            ? '<span class="sp-slide-tag__label" data-sp-key="slide-' +
              idx +
              '-tagLabel" contenteditable="true">' +
              esc(label) +
              '</span>'
            : esc(label);
        return (
            '<div class="sp-slide-tag"><i class="far ' +
            esc(iconClass) +
            '"></i>' +
            labelHtml +
            '</div>'
        );
    }

    /* ══════════════════════════════════════
       COLOR UTILITIES
    ══════════════════════════════════════ */
    function hsvToRgb(h, s, v) {
        var c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c, r, g, b;
        if      (h<60)  {r=c;g=x;b=0;} else if (h<120) {r=x;g=c;b=0;}
        else if (h<180) {r=0;g=c;b=x;} else if (h<240) {r=0;g=x;b=c;}
        else if (h<300) {r=x;g=0;b=c;} else            {r=c;g=0;b=x;}
        return {r:Math.round((r+m)*255), g:Math.round((g+m)*255), b:Math.round((b+m)*255)};
    }

    function rgbToHsv(r,g,b) {
        r/=255;g/=255;b/=255;
        var max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
        var h, s=max===0?0:d/max, v=max;
        if (max===min) {h=0;}
        else if (max===r) {h=((g-b)/d+(g<b?6:0))/6;}
        else if (max===g) {h=((b-r)/d+2)/6;}
        else              {h=((r-g)/d+4)/6;}
        return {h:h*360, s:s, v:v};
    }

    function rgbToHex(r,g,b) { return '#'+[r,g,b].map(function(v){return ('0'+v.toString(16)).slice(-2);}).join(''); }

    function hexToRgb(hex) {
        var c=hex.replace('#','');
        if (c.length===3) c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        return {r:parseInt(c.slice(0,2),16)||0, g:parseInt(c.slice(2,4),16)||0, b:parseInt(c.slice(4,6),16)||0};
    }

    function darkenHex(hex, amt) {
        var rgb=hexToRgb(hex), hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);
        hsv.v=Math.max(0, hsv.v-amt);
        var r2=hsvToRgb(hsv.h,hsv.s,hsv.v);
        return rgbToHex(r2.r,r2.g,r2.b);
    }

    function contrastColor(hex) {
        var rgb=hexToRgb(hex);
        return (0.299*rgb.r+0.587*rgb.g+0.114*rgb.b)/255 > 0.55 ? '#1a1a2e' : '#ffffff';
    }

    function esc(s) {
        if (s==null) return '';
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    var SCORM_INTRO_COVER_URL =
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85';

    /** Imagen de ejemplo local (rutas relativas desde páginas LMS Creator). */
    var SCORM_DEMO_IMG = '../../images/cards-learn/portadas-ia/01-personas-en-oficina.jpg';

    /* ══════════════════════════════════════
       ESTADO
    ══════════════════════════════════════ */
    var _onScormReady   = null;
    var _currentPageKey = null;
    var _currentTab     = 'ia';
    var _titulo         = '';
    var _enabledSlideTypes = {};
    var _color          = '#0C5BEF';
    var _pendingFiles   = [];
    var _pendingImgs    = [];
    var _zipFile        = null;
    var _tituloInputApi = null;
    var _smContextIaInputApi = null;
    var _logoDataUrl    = null;

    /* Edición por pageKey */
    var _scormDataStore = {};   /* pageKey → { slides, color, titulo, scormHtml, generatedByAi? } */

    /* ══════════════════════════════════════
       TOKENS
    ══════════════════════════════════════ */
    function getTokens() { return global._ubitsAiTokenPool!=null ? global._ubitsAiTokenPool : 500000; }

    function trySpendTokens(cost) {
        var cur=getTokens();
        if (cur<cost) {
            if (typeof global.showToast==='function') global.showToast('warning','No tienes suficientes tokens ('+cost+' requeridos).',{containerId:'ubits-toast-container'});
            return false;
        }
        var next=Math.max(0,cur-cost);
        global._ubitsAiTokenPool=next;
        if (typeof global.setIAPanelTokensBadgeValue==='function') global.setIAPanelTokensBadgeValue(next);
        syncScormTokensBadge();
        return true;
    }

    function syncScormTokensBadge() {
        var n=getTokens();
        var el=document.getElementById('cc-scorm-modal-tokens-badge');
        if (!el) return;
        var num=el.querySelector('.ubits-badge-tag__token-number');
        var display=
            typeof global.formatIaTokensBadgeNumber==='function'
                ? global.formatIaTokensBadgeNumber(n)
                : String(n);
        if (num) num.textContent=display;
        el.setAttribute(
            'aria-label',
            typeof global.formatIaTokensBadgeAriaLabel==='function'
                ? global.formatIaTokensBadgeAriaLabel(n)
                : n+' tokens restantes'
        );
        var show=_currentTab==='ia';
        el.style.display=show?'':'none';
        el.setAttribute('aria-hidden',show?'false':'true');
    }

    function emitChanged(detail) { try { document.dispatchEvent(new CustomEvent('ubits-recursos-changed',{detail:detail||{}})); } catch(e){} }

    /* ══════════════════════════════════════
       COLOR PICKER (componente UBITS color-picker.js)
    ══════════════════════════════════════ */
    function closeCpPanel() {
        if (typeof global.closeColorPickerPopover === 'function') global.closeColorPickerPopover();
    }

    /** HEX actual del acento (iframe en edición o estado modal). */
    function getPickerInitialHex(anchorEl) {
        try {
            if (anchorEl && anchorEl.ownerDocument && anchorEl.ownerDocument !== document) {
                var inline = anchorEl.ownerDocument.documentElement.style.getPropertyValue('--accent');
                if (inline && String(inline).trim()) return String(inline).trim();
            }
        } catch (e) {}
        return _color;
    }

    function openCpPanel(swatchEl, onChangeCb) {
        if (typeof global.openColorPickerPopover !== 'function') return;
        closeCpPanel();
        global.openColorPickerPopover({
            anchorEl: swatchEl,
            initialHex: getPickerInitialHex(swatchEl),
            onChange: function (hex) {
                _color = hex;
                var sw = document.getElementById('cc-sm-cp-swatch');
                if (sw) sw.style.background = hex;
                if (onChangeCb) onChangeCb(hex);
                refreshPreview();
            },
            zIndex: 2000
        });
    }

    global.ccScormOpenColorPicker = openCpPanel;

    /** Aplica acento + RGB derivados en el documento del iframe (vista edición en vivo). */
    function applyScormThemeVars(doc, hex) {
        if (!doc || !doc.documentElement || !hex) return;
        var rgb = hexToRgb(hex);
        var root = doc.documentElement;
        root.style.setProperty('--accent', hex);
        root.style.setProperty('--ar', String(rgb.r));
        root.style.setProperty('--ag', String(rgb.g));
        root.style.setProperty('--ab', String(rgb.b));
        root.style.setProperty('--dark', darkenHex(hex, 0.25));
        root.style.setProperty('--ct', contrastColor(hex));
        try {
            var parentTheme =
                document.body && document.body.getAttribute('data-theme')
                    ? document.body.getAttribute('data-theme')
                    : '';
            if (parentTheme && doc.body) {
                doc.documentElement.setAttribute('data-theme', parentTheme);
                doc.body.setAttribute('data-theme', parentTheme);
            }
        } catch (eTheme) {}
    }

    /** Cabecera/pie del visor: tokens, tipografía y botones UBITS (solo embed en Creator). */
    function getScormChromeCssLinks(editMode) {
        var links =
            '<link rel="stylesheet" href="../../general-styles/ubits-colors.css">' +
            '<link rel="stylesheet" href="../../general-styles/ubits-spacing-tokens.css">' +
            '<link rel="stylesheet" href="../../general-styles/ubits-typography.css">' +
            '<link rel="stylesheet" href="../../general-styles/fontawesome-icons.css">' +
            '<link rel="stylesheet" href="../../components/button.css">';
        if (editMode) {
            links += '<link rel="stylesheet" href="../../components/tooltip.css">';
        }
        return links;
    }

    /** Tokens + botones + indicadores para HTML descargable (sin deps relativas al playground). */
    function buildScormStandaloneChromeCss() {
        return (
            ':root{' +
            '--ubits-font-family-sans:"Inter",system-ui,-apple-system,sans-serif;' +
            '--ubits-bg-1:#fff;--ubits-bg-2:#f3f3f4;--ubits-border-1:#e7e8ea;--ubits-fg-1-high:#303a47;--ubits-fg-1-medium:#5c646f;' +
            '--ubits-button-primary-bg-default:#0c5bef;--ubits-button-primary-hover:#223a91;--ubits-button-primary-pressed:#1e4abf;' +
            '--ubits-btn-primary-fg:#fff;--ubits-btn-secondary-bg-default:#fff;--ubits-btn-secondary-bg-hover:#f3f3f4;' +
            '--ubits-btn-secondary-bg-pressed:#e7e8ea;--ubits-btn-secondary-fg-default:#303a47;--ubits-btn-secondary-border:#d0d2d5;' +
            '--ubits-bg-disabled-button:#e7e8ea;--ubits-fg-on-disabled-button:#a8abb2;--ubits-border-disabled-button:#d0d2d5;' +
            '--ubits-button-focus-ring:rgba(82,151,244,.3);' +
            '--padding-md:12px;--padding-lg:16px;--gap-sm:8px;--border-radius-sm:8px;--border-radius-full:999px;' +
            '}' +
            '*,*::before,*::after{box-sizing:border-box;}' +
            'html,body{margin:0;padding:0;height:100%;font-family:var(--ubits-font-family-sans);color:var(--ubits-fg-1-high);}' +
            '.ubits-body-sm-semibold{font-size:14px;font-weight:600;line-height:1.4;}' +
            '.ubits-body-sm-bold{font-size:14px;font-weight:700;line-height:1.4;}' +
            '.ubits-button{display:inline-flex;align-items:center;justify-content:center;gap:var(--gap-sm);padding:var(--padding-md) var(--padding-lg);border:none;border-radius:var(--border-radius-sm);font-family:inherit;font-weight:600;font-size:inherit;line-height:1;cursor:pointer;user-select:none;white-space:nowrap;}' +
            '.ubits-button--primary{background:var(--ubits-button-primary-bg-default);color:var(--ubits-btn-primary-fg);border:1px solid var(--ubits-button-primary-bg-default);}' +
            '.ubits-button--primary:hover:not(:disabled){background:var(--ubits-button-primary-hover);border-color:var(--ubits-button-primary-hover);}' +
            '.ubits-button--secondary{background:var(--ubits-btn-secondary-bg-default);color:var(--ubits-btn-secondary-fg-default);border:1px solid var(--ubits-btn-secondary-border);}' +
            '.ubits-button--secondary:hover:not(:disabled){background:var(--ubits-btn-secondary-bg-hover);}' +
            '.ubits-button:disabled{background:var(--ubits-bg-disabled-button)!important;color:var(--ubits-fg-on-disabled-button)!important;border-color:var(--ubits-border-disabled-button)!important;cursor:not-allowed;pointer-events:none;}' +
            '#sp-dots{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;max-width:min(100%,220px);margin:0 auto;}' +
            '.sp-dl-dot{width:8px;height:8px;min-width:8px;padding:0;border:none;border-radius:var(--border-radius-full);background:var(--ubits-fg-1-medium);opacity:.45;cursor:pointer;transition:transform .2s ease,opacity .2s ease,background .2s ease;}' +
            '.sp-dl-dot.is-active{width:12px;height:12px;min-width:12px;opacity:1;background:var(--ubits-button-primary-bg-default);}' +
            '.sp-footer i[class*="fa-"]{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;display:inline-block;line-height:1;}'
        );
    }

    function ccScormInlineImagesForDownload(html, done) {
        if (typeof done !== 'function') return;
        var baseHref = window.location.href;
        var imgRe = /(<img[^>]+src=")([^"]+)(")/gi;
        var urls = [];
        var seen = {};
        var m;
        while ((m = imgRe.exec(html)) !== null) {
            var u = m[2];
            if (!u || u.indexOf('data:') === 0) continue;
            if (seen[u]) continue;
            seen[u] = true;
            var abs = u;
            try {
                abs = new URL(u, baseHref).href;
            } catch (eAbs) {}
            urls.push({ orig: u, abs: abs });
        }
        if (!urls.length) {
            done(html);
            return;
        }
        var pending = urls.length;
        var map = {};
        urls.forEach(function (item) {
            fetch(item.abs)
                .then(function (r) {
                    if (!r.ok) throw new Error('fetch');
                    return r.blob();
                })
                .then(function (blob) {
                    return new Promise(function (resolve, reject) {
                        var fr = new FileReader();
                        fr.onload = function () {
                            map[item.orig] = fr.result;
                            resolve();
                        };
                        fr.onerror = reject;
                        fr.readAsDataURL(blob);
                    });
                })
                .catch(function () {
                    map[item.orig] = item.abs;
                })
                .finally(function () {
                    pending -= 1;
                    if (pending === 0) {
                        var out = html;
                        urls.forEach(function (it) {
                            if (map[it.orig]) out = out.split(it.orig).join(map[it.orig]);
                        });
                        done(out);
                    }
                });
        });
    }

    function ccScormUnescapeHtmlAttr(s) {
        if (!s) return '';
        return String(s)
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    }

    function ccScormFetchTextUrl(url, done) {
        if (typeof done !== 'function') return;
        fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('fetch-fail');
                return r.text();
            })
            .then(function (t) {
                done(t || null);
            })
            .catch(function () {
                try {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.onload = function () {
                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                            done(xhr.responseText || null);
                        } else {
                            done(null);
                        }
                    };
                    xhr.onerror = function () {
                        done(null);
                    };
                    xhr.send();
                } catch (eXhr) {
                    done(null);
                }
            });
    }

    function ccScormGetSimuladorEmbeddedHtml() {
        if (typeof global.SIMULADOR_SCORM_SRCDOC === 'string' && global.SIMULADOR_SCORM_SRCDOC.length > 100) {
            return global.SIMULADOR_SCORM_SRCDOC;
        }
        return null;
    }

    /** Extrae HTML standalone de un bloque SCORM (iframe src o srcdoc). */
    function ccScormResolveEmbeddedHtmlFromBlock(blockHtml, done) {
        if (typeof done !== 'function') return;
        var htmlStr = blockHtml != null ? String(blockHtml) : '';
        if (!htmlStr.trim()) {
            done(null);
            return;
        }

        var srcdocMatch = htmlStr.match(/<iframe[^>]*\ssrcdoc="([\s\S]*?)"[^>]*>/i);
        if (srcdocMatch && srcdocMatch[1]) {
            var fromSrcdoc = ccScormUnescapeHtmlAttr(srcdocMatch[1]);
            if (fromSrcdoc.indexOf('<html') !== -1 || fromSrcdoc.indexOf('<!DOCTYPE') !== -1) {
                ccScormInlineImagesForDownload(fromSrcdoc, done);
                return;
            }
        }

        var srcMatch = htmlStr.match(/<iframe[^>]*\ssrc="([^"]+)"[^>]*>/i);
        if (srcMatch && srcMatch[1]) {
            var src = ccScormUnescapeHtmlAttr(srcMatch[1]);
            if (src.indexOf('simulador-scorm') !== -1) {
                var bundled = ccScormGetSimuladorEmbeddedHtml();
                if (bundled) {
                    done(bundled);
                    return;
                }
            }
            var absUrl;
            try {
                absUrl = new URL(src, global.location.href).href;
            } catch (eUrl) {
                done(null);
                return;
            }
            ccScormFetchTextUrl(absUrl, function (text) {
                if (text) {
                    done(text);
                    return;
                }
                if (src.indexOf('simulador-scorm') !== -1) {
                    done(ccScormGetSimuladorEmbeddedHtml());
                    return;
                }
                done(null);
            });
            return;
        }

        done(null);
    }

    function ccScormDeleteSlideAt(pageKey, index) {
        var stored = _scormDataStore[pageKey];
        if (!stored || !stored.slides || stored.slides.length <= 1) return false;
        var i = Math.max(0, Math.min(index, stored.slides.length - 1));
        stored.slides.splice(i, 1);
        var newCur = Math.min(i, stored.slides.length - 1);
        var iframe = document.getElementById('cc-scorm-edit-iframe');
        if (!iframe) return false;
        var editHtml = generateScormHtml(stored.titulo, stored.slides, stored.color, true, false, pageKey, stored.logoDataUrl || '');
        iframe.srcdoc = editHtml;
        iframe.onload = function () {
            closeCpPanel();
            try {
                var w = iframe.contentWindow;
                if (w && typeof w.gotoSlide === 'function') w.gotoSlide(newCur);
            } catch (eGo) {}
            iframe.onload = null;
        };
        return true;
    }

    global.ccScormDeleteSlideAt = ccScormDeleteSlideAt;

    function ccScormConfirmDeleteSlide(pageKey, index) {
        var stored = _scormDataStore[pageKey];
        if (!stored || !stored.slides || stored.slides.length <= 1) {
            if (typeof showToast === 'function') {
                showToast('warning', 'Debes conservar al menos una diapositiva.', { containerId: 'ubits-toast-container' });
            }
            return;
        }
        var slideNum = Math.max(0, Math.min(index, stored.slides.length - 1)) + 1;

        if (typeof openModal !== 'function' || typeof closeModal !== 'function') {
            ccScormDeleteSlideAt(pageKey, index);
            return;
        }

        openModal({
            overlayId: DELETE_SLIDE_MODAL_ID,
            title: 'Eliminar diapositiva',
            bodyHtml:
                '<p class="ubits-body-md-regular" style="margin:0;color:var(--ubits-fg-1-medium);">' +
                '¿Estás seguro de eliminar la diapositiva <strong class="ubits-body-md-bold">' + slideNum + '</strong>? ' +
                'Esta acción no se puede deshacer.</p>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-scorm-delete-slide-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--error ubits-button--md" id="cc-scorm-delete-slide-confirm"><span>Sí, eliminar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });

        var ov = document.getElementById(DELETE_SLIDE_MODAL_ID);
        if (!ov) return;

        function closeDeleteSlideModal() {
            closeModal(DELETE_SLIDE_MODAL_ID);
        }

        var cancelBtn = ov.querySelector('#cc-scorm-delete-slide-cancel');
        var confirmBtn = ov.querySelector('#cc-scorm-delete-slide-confirm');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeDeleteSlideModal);
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                closeDeleteSlideModal();
                ccScormDeleteSlideAt(pageKey, index);
            });
        }
    }

    global.ccScormConfirmDeleteSlide = ccScormConfirmDeleteSlide;

    function getScormChromeThemeSyncScript() {
        return (
            '<script>(function(){try{var p=window.parent;if(!p||!p.document||!p.document.body)return;' +
            'var t=p.document.body.getAttribute("data-theme");if(!t)return;' +
            'document.documentElement.setAttribute("data-theme",t);' +
            'if(document.body)document.body.setAttribute("data-theme",t);}catch(e){}})();<\/script>'
        );
    }

    global.ccScormApplyTheme = applyScormThemeVars;

    /* ══════════════════════════════════════
       Contenido SCORM: 15 tipos de diapositiva (una entrada por tipo, orden fijo)
       generateSlidesFromEnabled: una slide por cada tipo marcado en el catálogo.
    ══════════════════════════════════════ */

    function createDefaultEnabledSlideTypes() {
        var map = {};
        SCORM_SLIDE_TYPE_CATALOG.forEach(function (item) {
            map[item.type] = true;
        });
        return map;
    }

    function normalizeEnabledSlideTypes(src) {
        var map = createDefaultEnabledSlideTypes();
        if (!src || typeof src !== 'object') return map;
        SCORM_SLIDE_TYPE_CATALOG.forEach(function (item) {
            if (src[item.type] === false) map[item.type] = false;
        });
        map.intro = true;
        return map;
    }

    function countEnabledSlideTypes(enabled) {
        var n = 0;
        SCORM_SLIDE_TYPE_CATALOG.forEach(function (item) {
            if (enabled[item.type] !== false) n += 1;
        });
        return n;
    }

    function generateSlidesFromEnabled(enabled) {
        var pool = buildPool();
        return pool
            .filter(function (s) {
                return enabled[s.type] !== false;
            })
            .map(function (s) {
                return JSON.parse(JSON.stringify(s));
            });
    }

    function buildPool() {
        return [
            { type:'intro', icon:'fa-comments', tagLabel:'Presentación', title:'Conversaciones difíciles según Thomas-Kilmann', subtitle:'Presentación interactiva · Thomas-Kilmann', body:'Aprende a elegir el modo de respuesta correcto ante el conflicto', image: SCORM_INTRO_COVER_URL },
            { type:'content', icon:'fa-compass', tagLabel:'Fundamentos', title:'El modelo Thomas-Kilmann: 5 modos de respuesta',
              body:'Cada modo combina cuánto priorizas tus objetivos (asertividad) y las necesidades del otro (cooperación). Ninguno es “el correcto” en todo momento: el contexto define cuál conviene.',
              bullets:[
                  'Competir — Alta asertividad, poca cooperación: defiendes tu postura con firmeza; encaja con urgencias, límites claros o principios que no cedes.',
                  'Colaborar — Alta asertividad y cooperación: buscas una solución que satisfaga por completo a ambas partes; ideal si el tema es complejo y importan resultado y relación.',
                  'Comprometer — Punto medio en ambas dimensiones: cada uno cede algo para cerrar rápido; sirve con poco tiempo o para un acuerdo provisional.',
                  'Evitar — Poca asertividad y cooperación: pospones o eludes el conflicto; puede bajar la tensión al instante, pero no resuelve si se vuelve hábito.',
                  'Acomodar — Poca asertividad, mucha cooperación: priorizas al otro para cuidar la relación; tiene sentido cuando el tema le pesa más o el vínculo es la prioridad.'
              ] },
            { type:'steps', icon:'fa-clipboard-check', title:'Antes de la conversación: prepárate', tagLabel:'Preparación',
              bullets:['Define tu objetivo: ¿qué resultado realmente necesitas?', 'Identifica tu modo natural y evalúa si es el más adecuado', 'Anticipa las emociones de la otra persona y prepara tu respuesta', 'Elige el momento y espacio adecuados para reducir la tensión'] },
            { type:'quote', tagLabel:'Reflexión', title:'¿Por qué evitamos?',
              body:'El silencio parece protector, pero solo pospone lo inevitable — y transforma conflictos pequeños en grandes con el tiempo.',
              author:'Hallazgo central del modelo Thomas-Kilmann' },
            { type:'keypoint', icon:'fa-chart-line', tagLabel:'Dato clave', stat:'85%', statement:'de los equipos han vivido un conflicto que se agravó por no abordarlo a tiempo', desc:'Fuente: estudios de clima organizacional en LATAM, 2022–2024' },
            { type:'split', icon:'fa-users', tagLabel:'En contexto', title:'Conflictos en equipo: más que una discusión',
              body:'En el trabajo, la tensión a menudo aparece antes en señales tenues: correos más fríos, reuniones donde nadie objeta, plazos que se resbalan o comentarios en pasillos. Detectar ese momento permite actuar antes de que el bloqueo o el desgaste se instalen. Aquí verás cómo dar nombre a lo que pasa y preparar conversaciones difíciles con criterio, apoyándote en el marco Thomas-Kilmann sin esperar a la “gran pelea”.',
              image: SCORM_INTRO_COVER_URL },
            { type:'media', tagLabel:'Mapa del equipo', image: SCORM_DEMO_IMG, hotspots:[
                { x: 26, y: 44, title: 'Poner el tema sobre la mesa', body: 'Un espacio donde cada quien diga qué observa —hechos y necesidades, no etiquetas— suele bajar la defensa colectiva. Sirve para aclarar supuestos sobre prioridades, plazos o expectativas que, si quedan ocultos, terminan leídos como conflictos personales.' },
                { x: 74, y: 52, title: 'Acuerdos que el equipo puede ver', body: 'Volcar decisiones en algo visible —quién hace qué, hasta cuándo y con qué criterio de “listo”— reduce la ambigüedad que alimenta rencores. Los equipos que cierran así recuperan ritmo más rápido después de un choque y evitan reabrir la misma discusión en cada stand-up.' },
                { x: 48, y: 24, title: 'Lo que el contexto presiona', body: 'Objetivos agresivos, cambios de jefatura, recorte de recursos o silos entre áreas explican parte del estrés que cada persona lleva a la sala. Reconocer esas presiones ayuda a elegir un modo de respuesta más útil que el automático y a no confundir síntoma organizacional con “falta de actitud” de alguien del equipo.' }
            ]},
            { type:'accordion', tagLabel:'Profundiza', title:'Profundiza por temas', items:[
                { title:'Preparación', body:'Anticipa objeciones y define el resultado que necesitas de la reunión.' },
                { title:'Durante el diálogo', body:'Escucha primero; valida emociones antes de proponer soluciones.' },
                { title:'Después', body:'Documenta acuerdos y fechas de seguimiento para evitar malentendidos.' }
            ]},
            { type:'tabs', tagLabel:'Tres lecturas', title:'Tres lecturas para tu equipo', tabs:[
                { label:'Conflicto con sentido', body:'En equipos de trabajo, el desacuerdo no es siempre un problema de convivencia: muchas veces señala que hay información, prioridades o criterios desalineados. Cuando todo se silencia por educación, puede parecer que “no hay conflicto”, pero la fricción sigue operando en entregas retrasadas o en comentarios al margen. Expresar el choque con foco en el asunto —qué está en juego para el proyecto y para las personas— permite mejorar decisiones y compromisos. El desafío es mantener un tono que permita discrepar sin romper la confianza que necesitarán mañana.' },
                { label:'TK en la rutina laboral', body:'Thomas-Kilmann describe formas de responder al conflicto, no “tipos de persona”: competir, colaborar, evitar, acomodar o comprometer. En una reunión real puedes preguntarte qué modo estás usando y si encaja con el tiempo, la relación y el resultado que el equipo necesita. Nombrarlo en voz alta, con cuidado (“noto que estamos posponiendo el tema de las dependencias”), reduce tensión y abre la posibilidad de elegir otro estilo más deliberado. El mapa es una brújula, no una sentencia: la práctica está en ajustar el modo según la fase del proyecto y el costo de forzar o ceder.' },
                { label:'Entrenar antes del choque fuerte', body:'Los cambios duraderos suelen empezar en situaciones de menor riesgo: repartir tareas ambiguas, corregir un supuesto en un chat o pedir una aclaración sin acusar. Prueba un modo distinto al que usas por defecto, observa cómo reacciona el equipo y ajusta. Después de cada intento, una reflexión breve —¿acercamos el resultado?, ¿alguno quedó excluido?— convierte el modelo en hábito. Así, cuando llegue un conflicto con más carga emocional o jerárquica, ya habrás ensayado el vocabulario y el ritmo que hacen falta.' }
            ]},
            { type:'flashcards', tagLabel:'Repaso', title:'Repaso rápido', cards:[
                { front:'Competidor', back:'Alta asertividad, baja cooperación: útil con urgencia y límites claros.' },
                { front:'Colaborador', back:'Alta asertividad y cooperación: ideal cuando importan relación y resultado.' },
                { front:'Evadir', back:'Baja en ambas: pausa táctica si no es el momento; peligroso si es hábito.' }
            ]},
            { type:'timeline', tagLabel:'Ruta sugerida', title:'Flujo sugerido', items:[
                { label:'Día 0', title:'Detectar', body:'Identifica el modo por defecto del equipo ante la tensión.' },
                { label:'Día 1–2', title:'Preparar', body:'Agenda, objetivo y criterios de éxito por escrito.' },
                { label:'Día 3+', title:'Cerrar', body:'Acuerdos medibles y revisión en 7–14 días.' }
            ]},
            { type:'compare', tagLabel:'Dos enfoques', title:'Relacional frente a transaccional', leftTag:'Relacional', rightTag:'Transaccional', leftTitle:'Enfoque relacional', leftBody:'Prioriza confianza y tiempo de escucha antes de negociar números o plazos.', rightTitle:'Enfoque transaccional', rightBody:'Prioriza acuerdos explícitos y entregables; útil con plazos ajustados.', rows:[
                { left:'Confianza y alineación emocional primero', right:'Plazos y alcance definidos cuanto antes' },
                { left:'Funciona muy bien en conflictos sensibles o largos', right:'Funciona muy bien con urgencia o poca historia compartida' },
                { left:'Riesgo: todo tarda más si no cierras acuerdos', right:'Riesgo: sensación de frialdad si no cuidas el tono' }
            ]},
            { type:'quiz_mc', tagLabel:'Autoevaluación', title:'Quiz', questions:[
                { question:'¿Cuándo conviene priorizar el modo colaborador?', options:['Siempre, sin excepciones','Cuando la relación y el resultado importan por igual','Solo si la otra parte cede primero'], correctIndex:1 },
                { question:'¿Qué describe mejor al “evadir”?', options:['Ganar a toda costa','Posponer o eludir la tensión','Integrar todas las partes'], correctIndex:1 },
                { question:'El mapa TK sirve principalmente para…', options:['Eliminar el conflicto','Nombrar el estilo de respuesta y elegir con intención','Medir IQ del equipo'], correctIndex:1 },
                { question:'¿Cuál suele ser el efecto del modo “competir” en relaciones ya tensas?', options:['Siempre genera confianza','Puede escalar el conflicto si la otra parte se defiende','Elimina la necesidad de acuerdos'], correctIndex:1 },
                { question:'El modo “acomodar” implica sobre todo…', options:['Ignorar el problema indefinidamente','Priorizar la relación cediendo en el contenido del desacuerdo','Imponer tu criterio sin escuchar'], correctIndex:1 }
            ] },
            { type:'match', tagLabel:'Modos TK', title:'Relaciona cada modo con su descripción', left:['Competidor','Colaborador','Evadir'], right:['Ganar ya, sin negociar','Buscar solución integradora','Posponer la conversación'], pairs:[[0,0],[1,1],[2,2]] },
            { type:'summary', tagLabel:'Cierre', title:'Lo que aprendiste', bullets:['El modelo Thomas-Kilmann ofrece 5 modos de respuesta al conflicto', 'No hay un modo ideal universal: el contexto define la elección correcta', 'Prepararse antes cambia el resultado de cualquier conversación difícil', 'Puedes desarrollar flexibilidad para moverte entre modos según la situación'] }
        ];
    }

    /* ══════════════════════════════════════
       SCORM HTML (vista previa y bloque)
    ══════════════════════════════════════ */
    function buildIxInstructionText(slideType) {
        var map = {
            media: 'Pulsa los puntos sobre la imagen para leer una nota breve.',
            accordion: 'Pulsa cada encabezado para expandir o colapsar el contenido.',
            tabs: 'Usa las pestañas superiores para cambiar de vista.',
            flashcards: 'Toca cada tarjeta para voltearla y ver la respuesta.',
            timeline: 'Sigue la línea para ver el orden sugerido.',
            compare: 'Revisa las dos columnas y la tabla comparativa.',
            quiz_mc: 'Elige la opción correcta en cada pregunta.',
            match: 'Selecciona un concepto a la izquierda y luego su pareja a la derecha.'
        };
        return map[slideType] || '';
    }

    function buildIxInteractiveHeader(slide, editMode, idx) {
        var slideType = slide.type;
        var instr = buildIxInstructionText(slideType);
        var tagBlock = buildSlideTagHtml(slide, idx, editMode);
        if (editMode || !instr) {
            return tagBlock;
        }
        return '<div class="sp-slide-meta-row">' +
            tagBlock +
            '<div class="sp-ix-wrap">' +
            '<button type="button" class="sp-ix-hint" data-sp-ix-tip="' + esc(instr) + '" aria-expanded="false" aria-controls="sp-ix-tip-' + idx + '" aria-label="Instrucciones del slide interactivo">' +
            '<i class="fas fa-circle-info" aria-hidden="true"></i><span>Slide interactivo</span></button>' +
            '<div class="sp-ix-tooltip" id="sp-ix-tip-' + idx + '" role="tooltip" hidden></div>' +
            '</div></div>';
    }

    function buildSlideDeleteControl(editMode) {
        if (!editMode) return '';
        return '<button type="button" class="sp-slide-del" aria-label="Eliminar diapositiva" data-tooltip="Eliminar diapositiva" data-tooltip-delay="1000">' +
            '<i class="far fa-trash-alt"></i></button>';
    }

    function buildCompanyLogoHtml(logoSrc) {
        if (!logoSrc) return '';
        return '<div class="sp-company-logo" aria-hidden="true"><img src="' + esc(logoSrc) + '" alt=""></div>';
    }

    function buildSlideHtml(slide, idx, editMode, companyLogo) {
        var showLogoOnSlide = idx === 0 && companyLogo;
        var base = '<div class="sp-slide sp-slide--' + slide.type + '" data-idx="' + idx + '">' +
            buildSlideDeleteControl(editMode);

        if (slide.type==='intro') {
            var coverSrc = slide.image || SCORM_INTRO_COVER_URL;
            var introImgRep = editMode
                ? '<div class="sp-split-img-replace" aria-hidden="true"><button type="button" class="sp-split-img-replace-btn" data-sp-img-rep="' + idx + '" aria-label="Cambiar imagen" data-tooltip="Cambiar imagen" data-tooltip-delay="1000"><i class="far fa-image"></i></button></div><input type="file" accept="image/*" class="sp-split-img-input" hidden data-sp-img-input="' + idx + '">'
                : '';
            var introLogo = showLogoOnSlide ? buildCompanyLogoHtml(companyLogo) : '';
            return base +
                '<div class="sp-intro-page sp-intro-page--ticket">' +
                    '<div class="sp-intro-ticket">' +
                        '<div class="sp-intro-ticket-media">' +
                            '<div class="sp-intro-ticket-media-inner' + (editMode ? ' sp-split-img-frame--editable' : '') + '">' +
                            '<img src="'+esc(coverSrc)+'" alt="" class="sp-intro-ticket-img"'+(editMode?' data-sp-key="slide-'+idx+'-image"':'')+'>' +
                            introImgRep +
                            introLogo +
                            '</div>' +
                        '</div>' +
                        '<div class="sp-intro-ticket-body">' +
                            '<span class="sp-intro-chip"'+(editMode?' data-sp-key="slide-'+idx+'-subtitle" contenteditable="true"':'')+'>'+esc(slide.subtitle||'Presentación interactiva')+'</span>' +
                            '<h1'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h1>' +
                            '<p class="sp-intro-lead"'+(editMode?' data-sp-key="slide-'+idx+'-body" contenteditable="true"':'')+'>'+esc(slide.body||'')+'</p>' +
                            '<div class="sp-start-hint sp-start-hint--ticket"><i class="fas fa-arrow-right"></i><span>Usa «Siguiente» para recorrer el módulo</span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        } else if (slide.type==='content') {
            var bullets=(slide.bullets||[]).map(function(b,bi){
                return '<li'+(editMode?' data-sp-key="slide-'+idx+'-bullet-'+bi+'" contenteditable="true"':'')+'>'+esc(b)+'</li>';
            }).join('');
            var contentListBar = editMode && bullets
                ? '<div class="sp-editor-bar">' +
                    '<button type="button" class="sp-btn sp-btn-p sp-cb-add"><i class="fas fa-plus"></i><span>Ítem</span></button>' +
                    '<button type="button" class="sp-btn sp-btn-p sp-cb-del"><i class="far fa-trash-alt"></i><span>Ítem</span></button>' +
                '</div>'
                : '';
            return base +
                '<div class="sp-slide-card">' +
                    buildSlideTagHtml(slide, idx, editMode) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    (slide.body ? '<p class="sp-body-intro"'+(editMode?' data-sp-key="slide-'+idx+'-body" contenteditable="true"':'')+'>'+esc(slide.body)+'</p>' : '') +
                    (bullets ? '<ul class="sp-ed-ul">'+bullets+'</ul>' : '') +
                    contentListBar +
                '</div>' +
            '</div>';

        } else if (slide.type==='steps') {
            var stepItems=(slide.bullets||[]).map(function(b,bi){
                return '<div class="sp-step-item">' +
                    '<div class="sp-step-num">'+(bi+1)+'</div>' +
                    '<div class="sp-step-text"'+(editMode?' data-sp-key="slide-'+idx+'-bullet-'+bi+'" contenteditable="true"':'')+'>'+esc(b)+'</div>' +
                '</div>';
            }).join('');
            var stepsBar = editMode
                ? '<div class="sp-editor-bar">' +
                    '<button type="button" class="sp-btn sp-btn-p sp-st-add"><i class="fas fa-plus"></i><span>Paso</span></button>' +
                    '<button type="button" class="sp-btn sp-btn-p sp-st-del"><i class="far fa-trash-alt"></i><span>Paso</span></button>' +
                '</div>'
                : '';
            return base +
                '<div class="sp-slide-card">' +
                    buildSlideTagHtml(slide, idx, editMode) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    '<div class="sp-steps-list">'+stepItems+'</div>' +
                    stepsBar +
                '</div>' +
            '</div>';

        } else if (slide.type==='quote') {
            return base +
                '<div class="sp-slide-card sp-quote-card">' +
                buildSlideTagHtml(slide, idx, editMode) +
                '<i class="fas fa-quote-left sp-quote-icon"></i>' +
                '<div class="sp-quote-text"'+(editMode?' data-sp-key="slide-'+idx+'-body" contenteditable="true"':'')+'>'+esc(slide.body||slide.title||'')+'</div>' +
                (slide.author ? '<div class="sp-quote-author"'+(editMode?' data-sp-key="slide-'+idx+'-author" contenteditable="true"':'')+'>— '+esc(slide.author)+'</div>' : '') +
                '</div>' +
            '</div>';

        } else if (slide.type==='keypoint') {
            return base +
                '<div class="sp-slide-card sp-kp-card">' +
                buildSlideTagHtml(slide, idx, editMode) +
                '<div class="sp-kp-icon"><i class="fas '+(slide.icon||'fa-lightbulb')+'"></i></div>' +
                '<div class="sp-kp-number"'+(editMode?' data-sp-key="slide-'+idx+'-stat" contenteditable="true"':'')+'>'+esc(slide.stat||'')+'</div>' +
                '<div class="sp-kp-statement"'+(editMode?' data-sp-key="slide-'+idx+'-statement" contenteditable="true"':'')+'>'+esc(slide.statement||'')+'</div>' +
                (slide.desc ? '<div class="sp-kp-desc"'+(editMode?' data-sp-key="slide-'+idx+'-desc" contenteditable="true"':'')+'>'+esc(slide.desc)+'</div>' : '') +
                '</div>' +
            '</div>';

        } else if (slide.type==='summary') {
            var sItems=(slide.bullets||[]).map(function(b,bi){
                return '<li><i class="fas fa-check"></i><span'+(editMode?' data-sp-key="slide-'+idx+'-bullet-'+bi+'" contenteditable="true"':'')+'>'+esc(b)+'</span></li>';
            }).join('');
            var sumBar = editMode && sItems
                ? '<div class="sp-editor-bar">' +
                    '<button type="button" class="sp-btn sp-btn-p sp-sm-add"><i class="fas fa-plus"></i><span>Ítem</span></button>' +
                    '<button type="button" class="sp-btn sp-btn-p sp-sm-del"><i class="far fa-trash-alt"></i><span>Ítem</span></button>' +
                '</div>'
                : '';
            return base +
                '<div class="sp-sum-panel">' +
                buildSlideTagHtml(slide, idx, editMode) +
                '<div class="sp-sum-check"><i class="fas fa-trophy"></i></div>' +
                '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                (sItems ? '<ul class="sp-sum-list">'+sItems+'</ul>' : '') +
                sumBar +
                '</div>' +
            '</div>';

        } else if (slide.type==='split') {
            var imgRepSplit = editMode
                ? '<div class="sp-split-img-replace" aria-hidden="true"><button type="button" class="sp-split-img-replace-btn" data-sp-img-rep="' + idx + '" aria-label="Cambiar imagen" data-tooltip="Cambiar imagen" data-tooltip-delay="1000"><i class="far fa-image"></i></button></div><input type="file" accept="image/*" class="sp-split-img-input" hidden data-sp-img-input="' + idx + '">'
                : '';
            var imgCol = slide.image
                ? '<div class="sp-split-media-col">' +
                    '<div class="sp-split-img-frame' + (editMode ? ' sp-split-img-frame--editable' : '') + '">' +
                    '<img src="' + esc(slide.image) + '" alt="" class="sp-split-side-img"' + (editMode ? ' data-sp-key="slide-' + idx + '-image"' : '') + '>' +
                    imgRepSplit +
                    '</div></div>'
                : '<div class="sp-split-media-col"><div class="sp-split-img-placeholder ubits-body-sm-regular">Sin imagen</div></div>';
            return base +
                '<div class="sp-slide-card sp-split-card sp-split-card--5050">' +
                    buildSlideTagHtml(slide, idx, editMode) +
                    '<div class="sp-split-5050">' +
                        '<div class="sp-split-text-col">' +
                            '<h2' + (editMode ? ' data-sp-key="slide-' + idx + '-title" contenteditable="true"' : '') + '>' + esc(slide.title) + '</h2>' +
                            '<p class="sp-split-desc sp-body-intro"' + (editMode ? ' data-sp-key="slide-' + idx + '-body" contenteditable="true"' : '') + '>' + esc(slide.body || '') + '</p>' +
                        '</div>' +
                        imgCol +
                    '</div>' +
                '</div>' +
            '</div>';

        } else if (slide.type==='media') {
            var hots = slide.hotspots;
            if ((!hots || !hots.length) && slide.caption) {
                hots = [{ x: 50, y: 82, title: 'Descripción', body: slide.caption }];
            }
            if (!hots || !hots.length) {
                hots = [{ x: 50, y: 50, title: 'Nota', body: 'Añade puntos interactivos editando esta diapositiva.' }];
            }
            var pinsHtml = hots.map(function (h, hi) {
                var hx = Math.max(5, Math.min(95, Number(h.x) || 50));
                var hy = Math.max(5, Math.min(95, Number(h.y) || 50));
                return '<button type="button" class="sp-hotspot-pin" data-sp-hs-i="'+hi+'" data-sp-hs-x="'+hx+'" data-sp-hs-y="'+hy+'" style="left:'+hx+'%;top:'+hy+'%;" aria-label="'+esc(h.title || ('Punto '+(hi+1)))+'"><span class="sp-hotspot-pin-ring" aria-hidden="true"></span></button>';
            }).join('');
            var panelsHtml = hots.map(function (h, hi) {
                return '<div class="sp-hotspot-panel" id="sp-hsp-'+idx+'-'+hi+'" hidden data-sp-hs-panel="'+hi+'">' +
                    '<button type="button" class="sp-hotspot-close" aria-label="Cerrar" data-tooltip="Cerrar" data-tooltip-delay="1000"><i class="fas fa-times"></i></button>' +
                    '<div class="sp-hotspot-panel-title"'+(editMode?' data-sp-key="slide-'+idx+'-hs-'+hi+'-title" contenteditable="true"':'')+'>'+esc(h.title||'')+'</div>' +
                    '<div class="sp-hotspot-panel-body"'+(editMode?' data-sp-key="slide-'+idx+'-hs-'+hi+'-body" contenteditable="true"':'')+'>'+esc(h.body||'')+'</div>' +
                    '</div>';
            }).join('');
            var mediaImgRep = editMode
                ? '<div class="sp-split-img-replace" aria-hidden="true"><button type="button" class="sp-split-img-replace-btn" data-sp-img-rep="' + idx + '" aria-label="Cambiar imagen" data-tooltip="Cambiar imagen" data-tooltip-delay="1000"><i class="far fa-image"></i></button></div><input type="file" accept="image/*" class="sp-split-img-input" hidden data-sp-img-input="' + idx + '">'
                : '';
            return base +
                '<div class="sp-slide-card sp-media-card">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title||'Comunicación visual')+'</h2>' +
                    (editMode ? '<p class="sp-hotspot-edit-hint">Arrastra el punto para moverlo. Haz clic sin arrastrar para abrir el panel y editar título y texto.</p>' : '') +
                    '<div class="sp-hotspot-root" data-sp-hs-root="'+idx+'">' +
                        '<div class="sp-media-hotspot-figure">' +
                            '<div class="sp-media-img-wrap'+(editMode?' sp-split-img-frame--editable':'')+'">' +
                                '<img src="'+esc(slide.image||'')+'" alt="" class="sp-media-img"'+(editMode?' data-sp-key="slide-'+idx+'-image"':'')+'>' +
                                '<div class="sp-hotspot-layer">'+pinsHtml+'</div>' +
                                '<div class="sp-hotspot-backdrop" hidden></div>' +
                                '<div class="sp-hotspot-stack">'+panelsHtml+'</div>' +
                                mediaImgRep +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        } else if (slide.type==='accordion') {
            var accItems=(slide.items||[]).map(function(it,ai){
                return '<details class="sp-acc-item">' +
                    '<summary><span class="sp-acc-title"'+(editMode?' data-sp-key="slide-'+idx+'-item-'+ai+'-title" contenteditable="true"':'')+'>'+esc(it.title||'')+'</span>' +
                    '<span class="sp-acc-chev" aria-hidden="true"><i class="fas fa-chevron-down"></i></span></summary>' +
                    '<div class="sp-acc-body"'+(editMode?' data-sp-key="slide-'+idx+'-item-'+ai+'-body" contenteditable="true"':'')+'>'+esc(it.body||'')+'</div>' +
                '</details>';
            }).join('');
            var accBar = editMode
                ? '<div class="sp-editor-bar">' +
                    '<button type="button" class="sp-btn sp-btn-p sp-acc-add"><i class="fas fa-plus"></i><span>Sección</span></button>' +
                    '<button type="button" class="sp-btn sp-btn-p sp-acc-del"><i class="far fa-trash-alt"></i><span>Sección</span></button>' +
                '</div>'
                : '';
            return base +
                '<div class="sp-slide-card">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    '<div class="sp-acc-list">'+accItems+'</div>' +
                    accBar +
                '</div>' +
            '</div>';

        } else if (slide.type==='tabs') {
            var tabLabels=(slide.tabs||[]).map(function(t,ti){
                return '<button type="button" role="tab" class="sp-tab-btn'+(ti===0?' sp-tab-btn--active':'')+'" data-sp-tab="'+ti+'" aria-selected="'+(ti===0?'true':'false')+'">' +
                    '<span'+(editMode?' data-sp-key="slide-'+idx+'-tab-'+ti+'-label" contenteditable="true"':'')+'>'+esc(t.label||('Pestaña '+(ti+1)))+'</span></button>';
            }).join('');
            var tabPanels=(slide.tabs||[]).map(function(t,ti){
                return '<div class="sp-tab-panel'+(ti===0?' sp-tab-panel--active':'')+'" data-sp-panel="'+ti+'" role="tabpanel"'+(ti===0?'':' hidden')+'>' +
                    '<div class="sp-tab-body"'+(editMode?' data-sp-key="slide-'+idx+'-tab-'+ti+'-body" contenteditable="true"':'')+'>'+esc(t.body||'')+'</div></div>';
            }).join('');
            var tabsBar = editMode
                ? '<div class="sp-editor-bar">' +
                    '<button type="button" class="sp-btn sp-btn-p sp-tab-add"><i class="fas fa-plus"></i><span>Pestaña</span></button>' +
                    '<button type="button" class="sp-btn sp-btn-p sp-tab-del"><i class="far fa-trash-alt"></i><span>Pestaña</span></button>' +
                '</div>'
                : '';
            return base +
                '<div class="sp-slide-card sp-tabs-card">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    '<div class="sp-tabs-shell">' +
                        '<div class="sp-tab-bar" role="tablist">'+tabLabels+'</div>' +
                        '<div class="sp-tab-panels">'+tabPanels+'</div>' +
                    '</div>' +
                    tabsBar +
                '</div>' +
            '</div>';

        } else if (slide.type==='flashcards') {
            var cards=(slide.cards||[]).map(function(c,ci){
                return '<div class="sp-fc" data-sp-fc="'+ci+'">' +
                    '<div class="sp-fc-inner">' +
                        '<div class="sp-fc-face sp-fc-front"><span'+(editMode?' data-sp-key="slide-'+idx+'-card-'+ci+'-front" contenteditable="true"':'')+'>'+esc(c.front||'')+'</span>'+(!editMode?'<span class="sp-fc-hint">Pulsa para ver la respuesta</span>':'')+'</div>' +
                        '<div class="sp-fc-face sp-fc-back"><span'+(editMode?' data-sp-key="slide-'+idx+'-card-'+ci+'-back" contenteditable="true"':'')+'>'+esc(c.back||'')+'</span></div>' +
                    '</div>' +
                '</div>';
            }).join('');
            return base +
                '<div class="sp-slide-card sp-fc-wrap">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    '<div class="sp-fc-grid">'+cards+'</div>' +
                    (editMode ? '<div class="sp-editor-bar"><button type="button" class="sp-btn sp-btn-p sp-fc-add" data-sp-fc-slide="'+idx+'"><i class="fas fa-plus"></i><span>Tarjeta</span></button><button type="button" class="sp-btn sp-btn-p sp-fc-del" data-sp-fc-slide="'+idx+'"><i class="far fa-trash-alt"></i><span>Tarjeta</span></button></div>' : '') +
                '</div>' +
            '</div>';

        } else if (slide.type==='timeline') {
            var lines=(slide.items||[]).map(function(it,li){
                var isLast = li === (slide.items||[]).length - 1;
                return '<div class="sp-tl-item">' +
                    '<div class="sp-tl-rail">' +
                        '<span class="sp-tl-dot" aria-hidden="true"></span>' +
                        (!isLast ? '<span class="sp-tl-line" aria-hidden="true"></span>' : '') +
                    '</div>' +
                    '<div class="sp-tl-panel">' +
                        '<div class="sp-tl-label"'+(editMode?' data-sp-key="slide-'+idx+'-tl-'+li+'-label" contenteditable="true"':'')+'>'+esc(it.label||'')+'</div>' +
                        '<div class="sp-tl-title"'+(editMode?' data-sp-key="slide-'+idx+'-tl-'+li+'-title" contenteditable="true"':'')+'>'+esc(it.title||'')+'</div>' +
                        '<div class="sp-tl-body"'+(editMode?' data-sp-key="slide-'+idx+'-tl-'+li+'-body" contenteditable="true"':'')+'>'+esc(it.body||'')+'</div>' +
                    '</div>' +
                '</div>';
            }).join('');
            return base +
                '<div class="sp-slide-card sp-tl-card">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    '<div class="sp-tl-track">'+lines+'</div>' +
                    (editMode ? '<div class="sp-editor-bar"><button type="button" class="sp-btn sp-btn-p sp-tl-add" data-sp-tl-slide="'+idx+'"><i class="fas fa-plus"></i><span>Paso</span></button><button type="button" class="sp-btn sp-btn-p sp-tl-del" data-sp-tl-slide="'+idx+'"><i class="far fa-trash-alt"></i><span>Paso</span></button></div>' : '') +
                '</div>' +
            '</div>';

        } else if (slide.type==='compare') {
            var rows = slide.rows || [];
            var rowHtml = rows.map(function(row, ri){
                return '<div class="sp-compare-row">' +
                    '<div class="sp-compare-cell sp-compare-cell--left"'+(editMode?' data-sp-key="slide-'+idx+'-crow-'+ri+'-left" contenteditable="true"':'')+'>'+esc(row.left||'')+'</div>' +
                    '<div class="sp-compare-cell sp-compare-cell--right"'+(editMode?' data-sp-key="slide-'+idx+'-crow-'+ri+'-right" contenteditable="true"':'')+'>'+esc(row.right||'')+'</div>' +
                '</div>';
            }).join('');
            return base +
                '<div class="sp-slide-card sp-compare-card">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    '<p class="sp-compare-lead">Misma situación, dos formas de abordarla. Lee cada columna y la tabla inferior.</p>' +
                    '<div class="sp-compare-board">' +
                        '<div class="sp-compare-pillar sp-compare-pillar--left">' +
                            '<span class="sp-compare-badge"'+(editMode?' data-sp-key="slide-'+idx+'-leftTag" contenteditable="true"':'')+'>'+esc(slide.leftTag||'Opción A')+'</span>' +
                            '<h3'+(editMode?' data-sp-key="slide-'+idx+'-leftTitle" contenteditable="true"':'')+'>'+esc(slide.leftTitle||'')+'</h3>' +
                            '<p'+(editMode?' data-sp-key="slide-'+idx+'-leftBody" contenteditable="true"':'')+'>'+esc(slide.leftBody||'')+'</p>' +
                        '</div>' +
                        '<div class="sp-compare-vs" aria-hidden="true"><span>VS</span></div>' +
                        '<div class="sp-compare-pillar sp-compare-pillar--right">' +
                            '<span class="sp-compare-badge sp-compare-badge--alt"'+(editMode?' data-sp-key="slide-'+idx+'-rightTag" contenteditable="true"':'')+'>'+esc(slide.rightTag||'Opción B')+'</span>' +
                            '<h3'+(editMode?' data-sp-key="slide-'+idx+'-rightTitle" contenteditable="true"':'')+'>'+esc(slide.rightTitle||'')+'</h3>' +
                            '<p'+(editMode?' data-sp-key="slide-'+idx+'-rightBody" contenteditable="true"':'')+'>'+esc(slide.rightBody||'')+'</p>' +
                        '</div>' +
                    '</div>' +
                    (rowHtml ? '<div class="sp-compare-matrix"><div class="sp-compare-matrix-head"><span>'+esc(slide.leftTag||'Columna A')+'</span><span>'+esc(slide.rightTag||'Columna B')+'</span></div>'+rowHtml+'</div>' : '') +
                '</div>' +
            '</div>';

        } else if (slide.type==='quiz_mc') {
            var qList = slide.questions;
            if (!qList || !qList.length) {
                qList = slide.question
                    ? [{ question: slide.question, options: slide.options || [], correctIndex: slide.correctIndex != null ? slide.correctIndex : 0 }]
                    : [{ question: '', options: ['', '', '', ''], correctIndex: 0 }];
            }
            var stepsHtml = qList.map(function (q, qi) {
                var opts = (q.options || []).map(function (op, oi) {
                    var isCor = (q.correctIndex === oi);
                    if (editMode) {
                        var nm = 'sp-q-cor-' + idx + '-' + qi;
                        return '<div class="sp-quiz-opt-row">' +
                            '<input type="radio" class="sp-quiz-opt-radio" name="' + nm + '" value="' + oi + '"' + (isCor ? ' checked' : '') + '>' +
                            '<span class="sp-quiz-opt-text" data-sp-key="slide-' + idx + '-q-' + qi + '-opt-' + oi + '" contenteditable="true">' + esc(op) + '</span>' +
                            '</div>';
                    }
                    return '<div class="sp-quiz-opt" role="button" tabindex="0" data-sp-quiz="' + oi + '" data-correct="' + (isCor ? '1' : '0') + '"><span class="sp-quiz-opt-label">' + esc(op) + '</span></div>';
                }).join('');
                var hiddenAttr = editMode ? '' : (qi === 0 ? '' : ' hidden');
                var activeCls = editMode ? ' sp-quiz-step--edit' : (qi === 0 ? ' sp-quiz-step--active' : '');
                var stepHead = editMode
                    ? '<div class="sp-quiz-step-hd">' +
                        '<p class="sp-quiz-meta">Pregunta ' + (qi + 1) + ' de ' + qList.length + '</p>' +
                        (qList.length > 1
                            ? '<button type="button" class="sp-quiz-step-del" aria-label="Eliminar pregunta" data-tooltip="Eliminar pregunta" data-tooltip-delay="1000"><i class="far fa-trash-alt"></i></button>'
                            : '<span class="sp-quiz-step-del-ph" aria-hidden="true"></span>') +
                        '</div>'
                    : '<p class="sp-quiz-meta">Pregunta ' + (qi + 1) + ' de ' + qList.length + '</p>';
                return '<section class="sp-quiz-step' + activeCls + '" data-sp-quiz-step="' + qi + '"' + hiddenAttr + '>' +
                    stepHead +
                    '<p class="sp-quiz-q"' + (editMode ? ' data-sp-key="slide-' + idx + '-q-' + qi + '-question" contenteditable="true"' : '') + '>' + esc(q.question || '') + '</p>' +
                    '<div class="sp-quiz-opts">' + opts + '</div>' +
                '</section>';
            }).join('');
            return base +
                '<div class="sp-slide-card sp-quiz-card" data-sp-quiz-total="' + qList.length + '">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    (editMode ? '<div class="sp-quiz-head"><h2 data-sp-key="slide-' + idx + '-title" contenteditable="true">' + esc(slide.title || 'Quiz') + '</h2></div>' : '') +
                    '<div class="sp-quiz-steps">' + stepsHtml + '</div>' +
                    (editMode ? '<div class="sp-quiz-editor-actions"><button type="button" class="sp-btn sp-btn-p sp-quiz-add-q"><i class="fas fa-plus"></i><span>Nueva pregunta</span></button></div>' : '') +
                    '<div class="sp-quiz-done" id="sp-quiz-done-' + idx + '" hidden>' +
                    '<p class="sp-quiz-done-text">Puntuación</p>' +
                    '<p class="sp-quiz-done-big"></p>' +
                    '<p class="sp-quiz-done-sub">Si lo deseas, puedes reiniciar el quiz o continuar con el siguiente slide usando el botón «Siguiente».</p>' +
                    '<button type="button" class="sp-quiz-restart sp-btn sp-btn-p" id="sp-quiz-restart-' + idx + '"><i class="fas fa-rotate-right"></i><span>Reiniciar quiz</span></button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        } else if (slide.type==='match') {
            var pairsAttr=esc(JSON.stringify(slide.pairs||[]));
            var previewBlock = '';
            var pairEditHtml = '';
            if (!editMode) {
                var leftCells=(slide.left||[]).map(function(txt,li){
                    return '<div role="button" tabindex="0" class="sp-match-cell sp-match-left" data-sp-match-side="L" data-sp-match-i="'+li+'">'+esc(txt)+'</div>';
                }).join('');
                var rightCells=(slide.right||[]).map(function(txt,ri){
                    return '<div role="button" tabindex="0" class="sp-match-cell sp-match-right" data-sp-match-side="R" data-sp-match-i="'+ri+'">'+esc(txt)+'</div>';
                }).join('');
                previewBlock =
                    '<p class="sp-match-hint">Toca primero un concepto en la columna izquierda y después su pareja en la derecha.</p>' +
                    '<div class="sp-match-grid">' +
                        '<div class="sp-match-col">' + leftCells + '</div>' +
                        '<div class="sp-match-col">' + rightCells + '</div>' +
                    '</div>';
            } else {
                var Lm = slide.left || [];
                var Rm = slide.right || [];
                var pairsA = (slide.pairs && slide.pairs.length >= 2) ? slide.pairs.slice() : [[0, 0], [1, 1]];
                pairEditHtml = '<div class="sp-match-edit-panel"><p class="sp-match-edit-caption">Escribe cada pareja (concepto → pareja). Mínimo dos filas completas. Para añadir otra, completa antes la fila actual.</p><div class="sp-match-pair-list" data-sp-match-pairlist="' + idx + '">';
                pairEditHtml += pairsA.map(function (pr, pi) {
                    var ltxt = String(Lm[pr[0]] != null ? Lm[pr[0]] : '');
                    var rtxt = String(Rm[pr[1]] != null ? Rm[pr[1]] : '');
                    var delBtn = pairsA.length > 2
                        ? '<button type="button" class="sp-match-pair-del" data-sp-match-pdel="' + idx + '" data-sp-pi="' + pi + '" aria-label="Quitar pareja" data-tooltip="Quitar pareja" data-tooltip-delay="1000"><i class="far fa-trash-alt"></i></button>'
                        : '<span class="sp-match-pair-del-ph"></span>';
                    return '<div class="sp-match-pair-row" data-sp-pi="' + pi + '"><input type="text" class="sp-match-inp-l" value="' + esc(ltxt) + '" placeholder="Concepto…" aria-label="Concepto"><span class="sp-match-pair-mid">→</span><input type="text" class="sp-match-inp-r" value="' + esc(rtxt) + '" placeholder="Pareja…" aria-label="Pareja">' + delBtn + '</div>';
                }).join('');
                pairEditHtml += '</div><button type="button" class="sp-btn sp-btn-p sp-match-add-pair" data-sp-match-add="' + idx + '">+ Pareja</button></div>';
            }
            return base +
                '<div class="sp-slide-card sp-match-card" data-sp-match-pairs="'+pairsAttr+'" data-sp-match-idx="'+idx+'">' +
                    buildIxInteractiveHeader(slide, editMode, idx) +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    previewBlock +
                    pairEditHtml +
                '</div>' +
            '</div>';
        }

        return base + '</div>';
    }

    function buildScormCss(color, editMode) {
        var rgb=hexToRgb(color), dark=darkenHex(color,0.25), ct=contrastColor(color);
        var css=':root{--accent:'+color+';--ar:'+rgb.r+';--ag:'+rgb.g+';--ab:'+rgb.b+';--dark:'+dark+';--ct:'+ct+';'+
        '--gap-sm:8px;--gap-xs:4px;--gap-md:12px;--padding-xl:20px;--padding-xs:4px;--padding-md:12px;--padding-6xl:40px;}' +
        '#sp-dots{min-height:40px;display:flex;align-items:center;justify-content:center;min-width:120px;}' +
        '*{box-sizing:border-box;margin:0;}' +
        'ul,ol{padding:0;}' +
        'body{height:100vh;overflow:hidden;display:flex;flex-direction:column;background:var(--ubits-bg-2);font-family:var(--ubits-font-family-sans);}' +
        '.sp-header{background:var(--ubits-bg-1);border-bottom:1px solid var(--ubits-border-1);flex-shrink:0;}' +
        '.sp-pb{height:3px;background:rgba(var(--ar),var(--ag),var(--ab),.15);}' +
        '.sp-pf{height:100%;background:var(--accent);transition:width .5s cubic-bezier(.4,0,.2,1);}' +
        '.sp-hi{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;}' +
        '.sp-hi--edit{justify-content:flex-start;gap:var(--gap-md);}' +
        '.sp-hi--edit .sp-hi__left{display:flex;align-items:center;gap:var(--gap-md);flex:1;min-width:0;}' +
        '.sp-hi--edit .sp-hi__actions{display:flex;align-items:center;gap:var(--gap-sm);flex-shrink:0;margin-left:auto;}' +
        '.sp-hi--viewer{justify-content:flex-end;}' +
        '.sp-hi--viewer--modal-preview{justify-content:space-between;}' +
        '.sp-preview-rep,.sp-title,.sp-ct{color:var(--ubits-fg-1-high);}' +
        '.sp-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;}' +
        '.sp-ct{white-space:nowrap;flex-shrink:0;}' +
        '.sp-color-field{display:flex;align-items:center;gap:12px;flex-shrink:0;min-width:0;}' +
        '.sp-color-label{line-height:1.2;white-space:nowrap;color:var(--ubits-fg-1-high);}' +
        '.sp-color-swatch-btn{box-sizing:border-box;width:32px;height:32px;min-width:32px;padding:0;margin:0;border:1px solid rgba(0,0,0,.12);border-radius:8px;cursor:pointer;flex-shrink:0;appearance:none;-webkit-appearance:none;background:transparent;display:inline-flex;align-items:center;justify-content:center;transition:transform .15s,box-shadow .15s;}' +
        '.sp-color-swatch-btn:hover{transform:scale(1.04);box-shadow:0 4px 12px rgba(0,0,0,.2);}' +
        '.sp-color-swatch{display:block;width:100%;height:100%;border-radius:6px;background:var(--accent);pointer-events:none;}' +
        '.sp-stage{--bg:#F3F3F4;--white:#ffffff;--tp:#303a47;--ts:#5c646f;--tm:#8a8aaa;flex:1;overflow:hidden;position:relative;min-height:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--tp);background:var(--bg);}' +
        '.sp-slides{position:absolute;inset:0;}' +
        '.sp-intro-ticket-media .sp-company-logo,.sp-split-img-frame .sp-company-logo,.sp-media-img-wrap .sp-company-logo{position:absolute;top:16px;right:16px;z-index:6;width:108px;height:54px;margin:0;padding:0;display:flex;align-items:flex-start;justify-content:flex-end;box-sizing:border-box;pointer-events:none;}' +
        '.sp-intro-ticket-media .sp-company-logo img,.sp-split-img-frame .sp-company-logo img,.sp-media-img-wrap .sp-company-logo img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:top right;filter:drop-shadow(0 1px 4px rgba(0,0,0,.28));}' +
        '.sp-slide{position:absolute;inset:0;opacity:0;transform:translateX(32px);transition:opacity .35s ease,transform .35s ease;pointer-events:none;display:flex;align-items:flex-start;justify-content:flex-start;padding:clamp(16px,3vw,28px) clamp(14px,3vw,32px);gap:16px;overflow-y:auto;overflow-x:hidden;scroll-padding-top:8px;scroll-padding-bottom:12px;-webkit-overflow-scrolling:touch;z-index:1;}' +
        '.sp-slide.active{opacity:1;transform:translateX(0);pointer-events:auto;z-index:10;}' +
        '.sp-slide:not(.active) *{pointer-events:none !important;}' +
        '.sp-slide--quote .sp-split-img-replace,.sp-slide--quote .sp-split-img-input,.sp-slide--keypoint .sp-split-img-replace,.sp-slide--keypoint .sp-split-img-input{display:none !important;}' +
        '.sp-slide.exit-left{opacity:0;transform:translateX(-32px);}' +
        /* center + overflow-y en el mismo flex hacía que, con contenido más alto que el viewport,
           el scroll no alcanzara el borde superior real (título/etiquetas cortados). Arriba alineado. */
        '.sp-slide--content,.sp-slide--split,.sp-slide--steps,.sp-slide--media,.sp-slide--accordion,.sp-slide--tabs,.sp-slide--flashcards,.sp-slide--timeline,.sp-slide--compare,.sp-slide--quiz_mc,.sp-slide--match{align-items:flex-start;justify-content:flex-start;}' +
        /* Centrado: portada va aparte (full layout) */
        '.sp-slide--quote,.sp-slide--keypoint,.sp-slide--summary{align-items:center;justify-content:center;}' +
        /* Portada: gradiente horizontal, texto 2/3, imagen 1/3 a la derecha */
        '.sp-slide--intro{align-items:center;justify-content:center;padding:clamp(14px,3vw,28px);background:color-mix(in srgb,var(--accent) 5%,var(--bg));}' +
        '.sp-intro-page--ticket{width:100%;max-width:min(100%,720px);margin:0 auto;}' +
        '.sp-intro-ticket{background:var(--white);border-radius:16px;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.1);border:1px solid rgba(0,0,0,.06);display:flex;flex-direction:column;}' +
        '.sp-intro-ticket-media{position:relative;width:100%;aspect-ratio:16/9;max-height:min(38vh,280px);overflow:hidden;background:color-mix(in srgb,var(--dark) 82%,var(--accent) 18%);}' +
        '.sp-intro-ticket-media-inner{position:absolute;inset:0;overflow:hidden;}' +
        '.sp-intro-ticket-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}' +
        '.sp-intro-ticket-body{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:clamp(18px,3vw,26px) clamp(18px,3vw,28px) clamp(22px,3vw,30px);}' +
        '.sp-intro-chip{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:5px 11px;border-radius:100px;background:rgba(var(--ar),var(--ag),var(--ab),.12);color:var(--accent);}' +
        '.sp-slide--intro h1{font-size:clamp(22px,4vw,32px);font-weight:800;color:var(--tp);line-height:1.15;margin:0;max-width:20ch;}' +
        '.sp-intro-ticket-body .sp-intro-lead{font-size:14px;color:var(--ts);line-height:1.6;margin:0;max-width:52ch;}' +
        '.sp-start-hint--ticket{display:flex;align-items:center;gap:8px;color:var(--tm);font-size:12px;margin-top:4px;}' +
        /* Content + Steps: stage con fondo tintado, card centrada interior */
        '.sp-slide--content,.sp-slide--steps{background:color-mix(in srgb,var(--accent) 5%,var(--bg));padding:28px 36px;}' +
        '.sp-slide-card{display:flex;flex-direction:column;gap:14px;background:var(--white);border-radius:14px;box-shadow:0 6px 32px rgba(0,0,0,.09);padding:28px;border-left:4px solid var(--accent);max-width:min(100%,720px);width:100%;margin-left:auto;margin-right:auto;overflow:visible;flex-shrink:0;}' +
        '.sp-slide-tag{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:100px;background:rgba(var(--ar),var(--ag),var(--ab),.1);color:var(--accent);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:fit-content;max-width:100%;flex-wrap:wrap;word-break:break-word;}' +
        '.sp-slide-tag__label{outline:none;min-width:1ch;}' +
        '.sp-slide-tag__label:focus{outline:1px dashed var(--accent);outline-offset:2px;}' +
        '.sp-slide-tag__label:empty::before{content:"Etiqueta";opacity:.45;}' +
        '.sp-slide-meta-row{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:10px;width:100%;flex-wrap:wrap;}' +
        '.sp-slide-meta-row .sp-slide-tag{flex:0 1 auto;min-width:0;}' +
        '.sp-ix-wrap{position:relative;margin-left:auto;flex:0 0 auto;}' +
        '.sp-ix-hint{display:inline-flex;align-items:center;gap:6px;max-width:min(100%,240px);padding:6px 10px;border-radius:10px;font-size:10px;line-height:1.35;font-weight:700;color:var(--accent);background:rgba(var(--ar),var(--ag),var(--ab),.1);border:1px solid rgba(var(--ar),var(--ag),var(--ab),.38);text-transform:none;letter-spacing:0;font-family:inherit;cursor:pointer;}' +
        '.sp-ix-hint:hover{background:rgba(var(--ar),var(--ag),var(--ab),.16);}' +
        '@keyframes sp-ix-shimmer{0%,100%{opacity:.88;filter:brightness(1);}50%{opacity:1;filter:brightness(1.08);}}' +
        '.sp-ix-hint{animation:sp-ix-shimmer 2.4s ease-in-out infinite;}' +
        '.sp-ix-hint i{font-size:12px;flex-shrink:0;}' +
        '.sp-ix-tooltip{position:absolute;top:calc(100% + 8px);right:0;z-index:40;min-width:200px;max-width:min(92vw,300px);padding:10px 12px;border-radius:10px;font-size:12px;line-height:1.45;font-weight:500;color:var(--white);background:var(--tp);box-shadow:0 12px 32px rgba(0,0,0,.22);text-align:left;}' +
        '.sp-ix-tooltip[hidden]{display:none !important;}' +
        '.sp-slide-card h2{font-size:clamp(17px,3vw,24px);font-weight:800;color:var(--tp);line-height:1.3;}' +
        '.sp-body-intro{font-size:14px;color:var(--ts);line-height:1.6;}' +
        'ul{list-style:none;display:flex;flex-direction:column;gap:8px;}' +
        'ul li{display:flex;align-items:flex-start;gap:11px;font-size:13px;color:var(--ts);line-height:1.55;}' +
        'ul li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:5px;}' +
        '.sp-sum-list li::before{display:none;}' +
        /* Steps */
        '.sp-steps-list{display:flex;flex-direction:column;gap:12px;}' +
        '.sp-step-item{display:flex;align-items:flex-start;gap:14px;}' +
        '.sp-step-num{width:30px;height:30px;min-width:30px;border-radius:50%;background:var(--accent);color:var(--ct);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;}' +
        '.sp-step-text{flex:1;font-size:13px;color:var(--ts);line-height:1.6;padding-top:5px;}' +
        /* Quote */
        '.sp-slide--quote{background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 9%,#fff) 0%,color-mix(in srgb,var(--accent) 2%,#fff) 100%);flex-direction:column;align-items:center;text-align:center;gap:20px;}' +
        '.sp-quote-card,.sp-kp-card{display:flex;flex-direction:column;align-items:center;text-align:center;gap:clamp(10px,2vw,16px);width:100%;max-width:min(100%,720px);}' +
        '.sp-quote-icon{font-size:56px;color:var(--accent);opacity:0.22;line-height:1;margin-bottom:-10px;}' +
        '.sp-quote-text{font-size:clamp(17px,3vw,24px);font-weight:700;font-style:italic;color:var(--tp);max-width:560px;line-height:1.55;}' +
        '.sp-quote-author{font-size:13px;color:var(--tm);font-weight:500;letter-spacing:0.03em;}' +
        /* Keypoint */
        '.sp-slide--keypoint{background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 10%,#fff) 0%,color-mix(in srgb,var(--accent) 3%,#fff) 100%);flex-direction:column;align-items:center;text-align:center;gap:14px;}' +
        '.sp-kp-icon{font-size:40px;color:var(--accent);}' +
        '.sp-kp-number{font-size:clamp(48px,10vw,84px);font-weight:900;color:var(--accent);line-height:1;letter-spacing:-2px;}' +
        '.sp-kp-statement{font-size:clamp(15px,2.5vw,20px);font-weight:700;color:var(--tp);max-width:500px;line-height:1.4;}' +
        '.sp-kp-desc{font-size:12px;color:var(--tm);max-width:420px;line-height:1.6;}' +
        /* Summary: mismo ancho útil que .sp-slide-card (660px); icono compacto para dejar aire al texto */
        '.sp-slide--summary{background:linear-gradient(145deg,var(--accent) 0%,var(--dark) 100%);flex-direction:column;align-items:center;justify-content:center;padding:clamp(16px,4vw,28px) clamp(12px,3vw,36px);gap:0;}' +
        '.sp-sum-panel{max-width:min(100%,720px);width:100%;display:flex;flex-direction:column;align-items:center;text-align:center;gap:clamp(10px,2.5vw,14px);padding:clamp(18px,3.5vw,28px) clamp(16px,3vw,32px);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:14px;box-sizing:border-box;overflow-y:auto;max-height:calc(100vh - 120px);}' +
        '.sp-sum-panel>.sp-slide-tag{align-self:center;}' +
        '.sp-sum-check{width:36px;height:36px;min-width:36px;min-height:36px;aspect-ratio:1;flex-shrink:0;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;}' +
        '.sp-slide--summary h2{font-size:clamp(17px,3.2vw,26px);font-weight:800;color:#fff;line-height:1.25;max-width:100%;padding:0 4px;}' +
        '.sp-sum-list{list-style:none;display:flex;flex-direction:column;gap:10px;text-align:left;width:100%;max-width:100%;margin:0;padding:0;}' +
        '.sp-sum-list li{display:flex;align-items:flex-start;gap:10px;color:rgba(255,255,255,.92);font-size:clamp(12px,2.4vw,14px);line-height:1.55;}' +
        '.sp-sum-list li i{color:rgba(255,255,255,.65);flex-shrink:0;margin-top:2px;}' +
        '.sp-sum-list li span{flex:1;}' +
        /* Tipos enriquecidos: fondo de etapa */
        '.sp-slide--split,.sp-slide--media,.sp-slide--accordion,.sp-slide--tabs,.sp-slide--flashcards,.sp-slide--timeline,.sp-slide--compare,.sp-slide--quiz_mc,.sp-slide--match{background:color-mix(in srgb,var(--accent) 5%,var(--bg));padding:clamp(14px,3vw,28px) clamp(12px,3vw,32px);}' +
        '.sp-split-card--5050{gap:16px;}' +
        '.sp-split-5050{display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,3vw,28px);align-items:start;width:100%;}' +
        '@media (max-width:700px){.sp-split-5050{grid-template-columns:1fr;}.sp-split-text-col{order:1;}.sp-split-media-col{order:2;}}' +
        '.sp-split-text-col{display:flex;flex-direction:column;gap:10px;min-width:0;}' +
        '.sp-split-text-col h2{margin:0;font-size:clamp(17px,3vw,24px);font-weight:800;color:var(--tp);line-height:1.3;}' +
        '.sp-split-desc{margin:0;}' +
        '.sp-split-media-col{min-width:0;}' +
        '.sp-split-img-placeholder{padding:24px;border-radius:12px;background:rgba(0,0,0,.06);color:var(--tm);text-align:center;}' +
        '.sp-split-img-frame{position:relative;border-radius:12px;overflow:hidden;background:rgba(0,0,0,.06);}' +
        '.sp-split-side-img{width:100%;height:auto;display:block;vertical-align:middle;object-fit:cover;max-height:min(52vh,420px);}' +
        '.sp-split-img-frame--editable .sp-split-img-replace{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;background:color-mix(in srgb,var(--tp) 55%,transparent);pointer-events:none;}' +
        '.sp-split-img-frame--editable:hover .sp-split-img-replace{opacity:1;}' +
        '.sp-split-img-replace-btn{width:52px;height:52px;border-radius:50%;border:none;background:#fff;color:var(--tp);cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:20px;}' +
        '.sp-split-img-replace-btn:hover{filter:brightness(1.05);}' +
        /* Imagen con hotspots */
        '.sp-slide--media{align-items:center;justify-content:flex-start;}' +
        '.sp-media-card .sp-media-hotspot-figure{width:100%;max-width:min(100%,720px);margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.14);background:color-mix(in srgb,var(--dark) 78%,var(--accent) 22%);}' +
        '.sp-media-card .sp-media-img-wrap{position:relative;width:100%;aspect-ratio:16/10;max-height:min(52vh,440px);background:color-mix(in srgb,var(--dark) 88%,var(--accent) 12%);}' +
        '.sp-media-card .sp-media-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}' +
        '.sp-hotspot-layer{position:absolute;inset:0;pointer-events:none;z-index:2;}' +
        '.sp-hotspot-pin{position:absolute;transform:translate(-50%,-50%);width:22px;height:22px;border:none;padding:0;border-radius:50%;cursor:pointer;pointer-events:auto;background:transparent;display:flex;align-items:center;justify-content:center;}' +
        '.sp-hotspot-pin-ring{width:14px;height:14px;border-radius:50%;background:var(--accent);border:2px solid #fff;box-shadow:0 0 0 2px rgba(var(--ar),var(--ag),var(--ab),.45),0 4px 14px rgba(0,0,0,.35);animation:sp-hotspot-breathe 1.55s ease-in-out infinite;}' +
        '@keyframes sp-hotspot-breathe{0%,100%{transform:scale(1);}50%{transform:scale(1.26);}}' +
        '.sp-hotspot-pin:hover .sp-hotspot-pin-ring{transform:scale(1.2);}' +
        '.sp-hotspot-edit-hint{font-size:12px;font-weight:600;color:var(--tm);margin:-4px 0 10px;line-height:1.45;}' +
        '.sp-fc-del[hidden]{display:none !important;}' +
        '.sp-hotspot-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.42);z-index:3;}' +
        '.sp-hotspot-stack{position:absolute;left:0;right:0;bottom:0;z-index:4;display:flex;justify-content:center;pointer-events:none;padding:10px 12px 14px;}' +
        '.sp-hotspot-panel{pointer-events:auto;position:relative;width:100%;max-width:min(100%,380px);padding:12px 36px 12px 14px;border-radius:12px;background:var(--white);border:2px solid var(--accent);box-shadow:0 14px 40px rgba(0,0,0,.2);text-align:left;}' +
        '.sp-hotspot-close{position:absolute;top:6px;right:6px;width:28px;height:28px;border:none;border-radius:8px;background:rgba(0,0,0,.06);cursor:pointer;color:var(--tm);display:flex;align-items:center;justify-content:center;}' +
        '.sp-hotspot-close:hover{background:rgba(0,0,0,.1);}' +
        '.sp-hotspot-panel-title{font-size:13px;font-weight:800;color:var(--tp);margin:0 0 6px;line-height:1.3;}' +
        '.sp-hotspot-panel-body{font-size:12px;color:var(--ts);line-height:1.5;margin:0;}' +
        /* Acordeón: cabecera clara, cuerpo oscuro, separado */
        '.sp-acc-list{display:flex;flex-direction:column;gap:12px;border:none;background:transparent;}' +
        '.sp-acc-item{border:1px solid rgba(0,0,0,.12);border-radius:12px;background:#fff;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);}' +
        '.sp-acc-item summary{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;padding:14px 16px;list-style:none;font-size:14px;font-weight:700;color:#0f172a;background:#ffffff;border:none;}' +
        '.sp-acc-item summary::-webkit-details-marker{display:none;}' +
        '.sp-acc-title{flex:1;text-align:left;color:#0f172a;}' +
        '.sp-acc-chev{color:var(--accent);font-size:11px;transition:transform .22s ease;flex-shrink:0;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(var(--ar),var(--ag),var(--ab),.12);}' +
        '.sp-acc-item[open] .sp-acc-chev{transform:rotate(180deg);}' +
        '.sp-acc-body{padding:14px 16px 16px;font-size:13px;color:var(--ts);line-height:1.65;background:color-mix(in srgb,var(--accent) 4%,var(--white));border-top:1px solid rgba(0,0,0,.08);}' +
        /* Pestañas estilo “folder tabs” */
        '.sp-tabs-shell{background:var(--white);border:1px solid rgba(0,0,0,.1);border-radius:12px;overflow:hidden;}' +
        '.sp-tab-bar{display:flex;flex-wrap:nowrap;gap:0;border-bottom:2px solid rgba(0,0,0,.07);}' +
        '.sp-tab-btn{flex:1;min-width:0;padding:12px 8px;border:none;background:transparent;font-size:12px;font-weight:600;color:var(--tm);cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;font-family:inherit;transition:color .15s,border-color .15s,background .15s;}' +
        '.sp-tab-btn:hover{color:var(--tp);background:rgba(0,0,0,.03);}' +
        '.sp-tab-btn--active{color:var(--accent);border-bottom-color:var(--accent);font-weight:800;background:rgba(var(--ar),var(--ag),var(--ab),.06);}' +
        '.sp-tab-panel{display:none;padding:16px 18px;background:color-mix(in srgb,var(--accent) 4%,var(--white));}' +
        '.sp-tab-panel[hidden]{display:none !important;}' +
        '.sp-tab-panel--active{display:block !important;}' +
        '.sp-tab-body{font-size:13px;color:var(--ts);line-height:1.6;}' +
        /* Tarjetas flip: más ancho */
        '.sp-slide-card.sp-fc-wrap{max-width:min(100%,720px);}' +
        '.sp-fc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(12px,2vw,22px);width:100%;}' +
        '@media (max-width:800px){.sp-fc-grid{grid-template-columns:1fr;}}' +
        '.sp-fc{perspective:900px;cursor:pointer;min-height:clamp(150px,22vh,210px);}' +
        '.sp-fc-inner{position:relative;width:100%;min-height:clamp(150px,22vh,210px);transition:transform .45s;transform-style:preserve-3d;}' +
        '.sp-fc--flipped .sp-fc-inner{transform:rotateY(180deg);}' +
        '.sp-fc-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:14px;line-height:1.45;border:1px solid rgba(0,0,0,.08);}' +
        '.sp-fc-front{background:var(--white);color:var(--tp);font-weight:700;}' +
        '.sp-fc-back{background:color-mix(in srgb,var(--accent) 14%,#fff);color:var(--ts);transform:rotateY(180deg);}' +
        '.sp-fc-hint{margin-top:10px;font-size:11px;font-weight:500;color:var(--tm);}' +
        /* Línea de tiempo vertical */
        '.sp-tl-track{display:flex;flex-direction:column;}' +
        '.sp-tl-item{display:flex;align-items:stretch;gap:0;}' +
        '.sp-tl-rail{width:30px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;}' +
        '.sp-tl-dot{width:14px;height:14px;border-radius:50%;background:var(--accent);border:3px solid color-mix(in srgb,var(--accent) 30%,#fff);box-shadow:0 0 0 4px rgba(var(--ar),var(--ag),var(--ab),.15);margin-top:8px;z-index:1;}' +
        '.sp-tl-line{flex:1;width:3px;min-height:20px;margin-top:2px;background:linear-gradient(180deg,var(--accent),rgba(var(--ar),var(--ag),var(--ab),.2));border-radius:3px;}' +
        '.sp-tl-panel{flex:1;padding:4px 0 22px 14px;}' +
        '.sp-tl-panel .sp-tl-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);}' +
        '.sp-tl-panel .sp-tl-title{font-weight:800;font-size:clamp(15px,2.5vw,18px);color:var(--tp);margin:6px 0 6px;line-height:1.25;}' +
        '.sp-tl-panel .sp-tl-body{font-size:13px;color:var(--ts);line-height:1.55;}' +
        /* Comparación con VS + matriz */
        '.sp-compare-lead{font-size:13px;color:var(--ts);line-height:1.5;margin:0 0 4px;}' +
        '.sp-compare-board{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:stretch;margin-top:10px;}' +
        '@media (max-width:700px){.sp-compare-board{grid-template-columns:1fr;}.sp-compare-pillar--left{order:1;}.sp-compare-vs{order:2;padding:8px 0;}.sp-compare-pillar--right{order:3;}}' +
        '.sp-compare-pillar{padding:16px;border-radius:12px;background:var(--white);border:1px solid rgba(0,0,0,.08);}' +
        '.sp-compare-pillar--left{border-top:4px solid var(--accent);}' +
        '.sp-compare-pillar--right{border-top:4px solid #64748b;}' +
        '.sp-compare-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:4px 9px;border-radius:6px;background:rgba(var(--ar),var(--ag),var(--ab),.14);color:var(--accent);margin-bottom:8px;}' +
        '.sp-compare-badge--alt{background:rgba(100,116,139,.18);color:#475569;}' +
        '.sp-compare-pillar h3{font-size:15px;font-weight:800;color:var(--tp);margin:0 0 8px;line-height:1.25;}' +
        '.sp-compare-pillar p{font-size:13px;color:var(--ts);line-height:1.55;margin:0;}' +
        '.sp-compare-vs{display:flex;align-items:center;justify-content:center;}' +
        '.sp-compare-vs span{display:inline-flex;align-items:center;justify-content:center;padding:10px 11px;border-radius:999px;border:2px solid rgba(0,0,0,.08);background:var(--white);font-size:10px;font-weight:900;letter-spacing:.12em;color:var(--accent);}' +
        '.sp-compare-matrix{margin-top:18px;border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,.1);background:var(--white);}' +
        '.sp-compare-matrix-head{display:grid;grid-template-columns:1fr 1fr;background:rgba(var(--ar),var(--ag),var(--ab),.1);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);}' +
        '.sp-compare-matrix-head span{padding:10px 12px;}' +
        '.sp-compare-row{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(0,0,0,.07);}' +
        '.sp-compare-cell{padding:11px 12px;font-size:12px;line-height:1.45;color:var(--ts);}' +
        '.sp-compare-cell--left{border-right:1px solid rgba(0,0,0,.06);}' +
        /* Evaluación multi-pregunta */
        '.sp-quiz-head{margin:0;padding:0;}' +
        '.sp-quiz-head h2{margin:0 0 4px;}' +
        '.sp-quiz-steps{min-height:0;}' +
        '.sp-quiz-step[hidden]{display:none !important;}' +
        '.sp-quiz-step--active{display:block !important;}' +
        '.sp-quiz-meta{font-size:12px;font-weight:700;color:var(--accent);margin:0 0 8px;letter-spacing:.02em;}' +
        '.sp-quiz-step-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px;flex-wrap:wrap;}' +
        '.sp-quiz-step-hd .sp-quiz-meta{margin:0;}' +
        '.sp-quiz-step-del{width:32px;height:32px;border:none;border-radius:8px;background:rgba(220,38,38,.1);color:#b91c1c;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}' +
        '.sp-quiz-step-del:hover{filter:brightness(1.06);}' +
        '.sp-quiz-step-del-ph{width:32px;height:32px;flex-shrink:0;}' +
        'body.sp--editing .sp-slide-del{position:absolute;top:clamp(12px,2vw,20px);right:clamp(12px,2vw,28px);z-index:24;width:36px;height:36px;padding:0;border:1px solid #d0d2d5;border-radius:8px;background:#ffffff;color:#b91c1c;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 10px rgba(0,0,0,.16);font-size:15px;line-height:1;}' +
        'body.sp--editing .sp-slide-del:hover:not(:disabled){background:#f3f3f4;border-color:#c5c7cb;}' +
        'body.sp--editing .sp-slide-del:disabled{opacity:.45;cursor:not-allowed;background:#f3f3f4;color:#9ca3af;box-shadow:none;}' +
        '.sp-quiz-editor-actions{margin-top:4px;padding-top:12px;border-top:1px solid rgba(0,0,0,.08);}' +
        '.sp-quiz-q{font-size:clamp(15px,2.8vw,18px);font-weight:700;color:var(--tp);margin:0 0 12px;line-height:1.4;}' +
        '.sp-quiz-opts{display:flex;flex-direction:column;gap:8px;}' +
        '.sp-quiz-opt{display:flex;flex-direction:column;align-items:stretch;gap:8px;padding:12px 14px;border-radius:10px;border:1px solid rgba(0,0,0,.1);background:var(--white);cursor:pointer;font-size:13px;text-align:left;color:var(--ts);transition:background .15s,border-color .15s;}' +
        '.sp-quiz-opt-label{display:block;width:100%;}' +
        '.sp-quiz-opt-feedback{margin:0;font-size:12px;font-weight:700;line-height:1.35;}' +
        '.sp-quiz-opt-feedback--correct{color:#15803d;}' +
        '.sp-quiz-opt-feedback--wrong{color:#b91c1c;}' +
        '.sp-quiz-step--answered .sp-quiz-opt{cursor:default;pointer-events:none;}' +
        '.sp-quiz-opt:hover{border-color:var(--accent);}' +
        '.sp-quiz-opt--pick{border-color:#16a34a;background:rgba(22,163,74,.1);}' +
        '.sp-quiz-opt--bad{border-color:#dc2626;background:rgba(220,38,38,.08);}' +
        '.sp-quiz-opt-row{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.1);background:var(--white);}' +
        '.sp-quiz-opt-radio{flex-shrink:0;margin-top:3px;width:16px;height:16px;accent-color:var(--accent);cursor:pointer;}' +
        '.sp-quiz-opt-text{flex:1;font-size:13px;color:var(--ts);line-height:1.45;min-width:0;text-align:left;}' +
        '.sp-quiz-done[hidden]{display:none !important;}' +
        '.sp-quiz-done:not([hidden]){display:flex;flex-direction:column;align-items:center;text-align:center;padding:12px 8px 8px;margin-top:8px;gap:8px;max-width:420px;margin-left:auto;margin-right:auto;}' +
        '.sp-quiz-done-text{font-size:14px;color:var(--ts);line-height:1.5;margin:0;}' +
        '.sp-quiz-done-big{font-size:clamp(18px,3.5vw,24px);font-weight:900;margin:0;line-height:1.2;}' +
        '.sp-quiz-done-big.sp-quiz-score--error{color:var(--ubits-feedback-accent-error);}' +
        '.sp-quiz-done-big.sp-quiz-score--warning{color:var(--ubits-feedback-accent-warning);}' +
        '.sp-quiz-done-big.sp-quiz-score--success{color:var(--ubits-feedback-accent-success);}' +
        '.sp-quiz-done-sub{font-size:13px;color:var(--tm);line-height:1.45;margin:0;}' +
        '.sp-quiz-restart{margin-top:4px;}' +
        '.ubits-confetti-canvas{position:fixed;inset:0;pointer-events:none;z-index:9999;}' +
        /* Relacionar: error en rojo temporal */
        '.sp-match-hint{font-size:12px;color:var(--ts);margin-bottom:10px;line-height:1.45;}' +
        '.sp-match-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;}' +
        '@media (max-width:520px){.sp-match-grid{grid-template-columns:1fr 1fr;gap:8px;}.sp-match-cell{padding:10px;font-size:12px;line-height:1.35;}.sp-match-hint{font-size:11px;}}' +
        '.sp-match-col{display:flex;flex-direction:column;gap:8px;min-width:0;}' +
        '.sp-match-cell{padding:12px;border-radius:10px;border:1px solid rgba(0,0,0,.1);background:var(--white);font-size:13px;color:var(--ts);cursor:pointer;text-align:left;line-height:1.4;transition:border-color .2s,background .2s,box-shadow .2s;word-break:break-word;}' +
        '.sp-match-cell:hover{border-color:var(--accent);}' +
        '.sp-match--sel{outline:2px solid var(--accent);background:rgba(var(--ar),var(--ag),var(--ab),.1);}' +
        '.sp-match--ok{border-color:#16a34a;background:rgba(22,163,74,.12);cursor:default;}' +
        '.sp-match--wrong{border-color:#dc2626 !important;background:rgba(220,38,38,.14) !important;box-shadow:0 0 0 1px rgba(220,38,38,.3);}' +
        '.sp-match-edit-panel{margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,0,0,.1);width:100%;}' +
        '.sp--editing .sp-match-edit-panel{margin-top:0;padding-top:0;border-top:none;}' +
        '.sp-match-edit-caption{font-size:12px;font-weight:700;color:var(--tp);margin:0 0 8px;line-height:1.45;}' +
        '.sp-match-pair-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;}' +
        '.sp-match-inp-l,.sp-match-inp-r{flex:1;min-width:120px;padding:8px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.12);font-size:13px;background:var(--white);color:var(--tp);font-family:inherit;}' +
        '.sp-match-inp-l:focus,.sp-match-inp-r:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent);}' +
        '.sp--editing .sp-match-hint,.sp--editing .sp-match-grid{display:none !important;}' +
        '.sp-match-pair-mid{font-weight:800;color:var(--accent);}' +
        '.sp-match-pair-del{width:32px;height:32px;border:none;border-radius:8px;background:rgba(220,38,38,.1);color:#b91c1c;cursor:pointer;}' +
        '.sp-match-pair-del-ph{width:32px;height:32px;flex-shrink:0;}' +
        '.sp-editor-bar{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;}' +
        '.sp--editing .sp-quiz-card{display:flex;flex-direction:column;min-height:0;max-height:calc(100vh - 140px);}' +
        '.sp--editing .sp-quiz-steps{overflow-y:auto;flex:1;min-height:0;max-height:min(56vh,420px);padding-right:4px;}' +
        '.sp--editing .sp-quiz-step{display:block !important;border-top:1px solid rgba(0,0,0,.08);padding-top:12px;margin-top:12px;}' +
        '.sp--editing .sp-quiz-step:first-child{border-top:none;padding-top:0;margin-top:0;}' +
        '.sp--editing .sp-quiz-step[hidden]{display:block !important;}' +
        '.sp--editing .sp-quiz-done{display:none !important;}' +
        '.sp--editing .sp-match-cell{cursor:text;}' +
        '.sp--editing .sp-fc{cursor:pointer;}' +
        '.sp--editing .sp-fc-face{padding:14px;}' +
        '.sp--editing .sp-fc-face [contenteditable]{cursor:text;display:block;min-height:2.5em;}' +
        '.sp--editing .sp-hotspot-pin.sp-hotspot-pin--drag{cursor:grab;}' +
        '.sp--editing .sp-hotspot-pin.sp-hotspot-pin--drag:active{cursor:grabbing;}' +
        /* Edit mode */
        '.sp-stage [contenteditable]:hover{outline:2px dashed rgba(var(--ar),var(--ag),var(--ab),.45);border-radius:4px;cursor:text;}' +
        '.sp-stage [contenteditable]:focus{outline:2px solid var(--accent);background:rgba(255,255,255,.12);border-radius:4px;}' +
        /* Footer */
        '.sp-footer{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;padding:11px 18px;background:var(--ubits-bg-1);border-top:1px solid var(--ubits-border-1);flex-shrink:0;}' +
        '#sp-prev{justify-self:start;}' +
        '#sp-dots{justify-self:center;}' +
        '#sp-next{justify-self:end;}' +
        '#sp-next[hidden]{display:none !important;}' +
        '.sp-footer .ubits-button.ubits-button--md{padding:var(--padding-md) var(--padding-lg);min-height:40px;border-radius:var(--border-radius-sm);}' +
        '.sp-footer .ubits-button.ubits-button--md::before{border-radius:var(--border-radius-sm);}' +
        '#sp-next.ubits-button--primary{background:var(--accent);color:var(--ct);border-color:var(--accent);border-radius:var(--border-radius-sm);}' +
        '#sp-next.ubits-button--primary:hover:not(:disabled){background:var(--accent);border-color:var(--accent);filter:brightness(1.08);}' +
        '.sp-stage .sp-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;border:none;font-family:inherit;}' +
        '.sp-stage .sp-btn-p{background:#ffffff;color:#303a47;border:1px solid #d0d2d5;}' +
        '.sp-stage .sp-btn-p:hover:not(:disabled){background:#f3f3f4;}' +
        '.sp-stage .sp-btn:disabled{opacity:.4;cursor:not-allowed;}' +
        /* Celular estrecho: Anterior/Siguiente icon-only; desde 481px conservan texto */
        '@media (max-width:480px){' +
        '.sp-footer #sp-prev span,.sp-footer #sp-next span{display:none !important;}' +
        '.sp-footer #sp-prev,.sp-footer #sp-next{display:inline-flex !important;align-items:center !important;justify-content:center !important;gap:0 !important;padding:var(--padding-md) !important;min-width:40px !important;width:40px !important;max-width:40px !important;min-height:40px !important;height:40px !important;}' +
        '.sp-footer #sp-prev i,.sp-footer #sp-next i{margin:0;font-size:16px;line-height:1;}' +
        '}' +
        '@media (max-width:640px){.sp-slide{padding:14px 12px;}}';
        if (!editMode) css += buildScormCompactViewportCss();
        return css;
    }

    /** Vista previa modal, recurso en página y similares: menos chrome y tipografías para reducir scroll interno. */
    function buildScormCompactViewportCss() {
        return 'body.sp--compact-viewport .sp-hi{padding:6px 14px;}' +
        'body.sp--compact-viewport .sp-footer{padding:8px 14px;gap:8px;}' +
        'body.sp--compact-viewport .sp-footer .ubits-button.ubits-button--md{min-height:34px;padding:8px 12px;font-size:13px;}' +
        'body.sp--compact-viewport #sp-dots{min-height:32px;}' +
        'body.sp--compact-viewport .sp-slide{padding:10px 12px;overflow:hidden;align-items:center !important;justify-content:center !important;}' +
        'body.sp--compact-viewport .sp-slide--intro,body.sp--compact-viewport .sp-slide--content,body.sp--compact-viewport .sp-slide--steps,body.sp--compact-viewport .sp-slide--split,body.sp--compact-viewport .sp-slide--media,body.sp--compact-viewport .sp-slide--accordion,body.sp--compact-viewport .sp-slide--tabs,body.sp--compact-viewport .sp-slide--flashcards,body.sp--compact-viewport .sp-slide--timeline,body.sp--compact-viewport .sp-slide--compare,body.sp--compact-viewport .sp-slide--quiz_mc,body.sp--compact-viewport .sp-slide--match,body.sp--compact-viewport .sp-slide--quote,body.sp--compact-viewport .sp-slide--keypoint,body.sp--compact-viewport .sp-slide--summary{align-items:center !important;justify-content:center !important;}' +
        'body.sp--compact-viewport .sp-slide--content,body.sp--compact-viewport .sp-slide--steps{padding:12px 14px;}' +
        'body.sp--compact-viewport .sp-slide--split,body.sp--compact-viewport .sp-slide--media,body.sp--compact-viewport .sp-slide--accordion,body.sp--compact-viewport .sp-slide--tabs,body.sp--compact-viewport .sp-slide--flashcards,body.sp--compact-viewport .sp-slide--timeline,body.sp--compact-viewport .sp-slide--compare,body.sp--compact-viewport .sp-slide--quiz_mc,body.sp--compact-viewport .sp-slide--match{padding:10px 12px;}' +
        'body.sp--compact-viewport .sp-slide-card{padding:14px 16px;gap:10px;}' +
        'body.sp--compact-viewport .sp-slide-card h2{font-size:clamp(15px,2.6vw,20px);}' +
        'body.sp--compact-viewport .sp-body-intro,body.sp--compact-viewport ul li{font-size:12px;line-height:1.45;}' +
        'body.sp--compact-viewport .sp-intro-ticket-media{max-height:min(24vh,180px);}' +
        'body.sp--compact-viewport .sp-split-side-img{max-height:min(32vh,240px);}' +
        'body.sp--compact-viewport .sp-media-card .sp-media-img-wrap{max-height:min(32vh,240px);}' +
        'body.sp--compact-viewport .sp-fc{min-height:clamp(110px,14vh,150px);}' +
        'body.sp--compact-viewport .sp-fc-inner{min-height:clamp(110px,14vh,150px);}' +
        'body.sp--compact-viewport .sp-sum-panel{max-height:calc(100vh - 96px);padding:14px 16px;}' +
        'body.sp--compact-viewport.sp--modal-preview .sp-slide{padding:8px 10px;}';
    }

    function buildScormScript(n, editMode, standaloneDownload) {
        var standalone = !!standaloneDownload;
        var standalonePrefix = standalone
            ? 'function launchUbitsConfetti(){}' +
              'function spInitStandaloneDots_(cid,n0,active){var c=document.getElementById(cid);var api={setActive:function(i){spUpdateStandaloneDots_(c,n0,i);}};if(!c)return api;c.innerHTML="";for(var i=0;i<n0;i++){var b=document.createElement("button");b.type="button";b.className="sp-dl-dot"+(i===active?" is-active":"");b.setAttribute("aria-label","Diapositiva "+(i+1));(function(ix){b.addEventListener("click",function(){gotoSlide(ix);});})(i);c.appendChild(b);}return api;}' +
              'function spUpdateStandaloneDots_(c,n0,active){if(!c)return;var ds=c.querySelectorAll(".sp-dl-dot");for(var i=0;i<ds.length;i++){ds[i].classList.toggle("is-active",i===active);if(i===active)ds[i].setAttribute("aria-current","true");else ds[i].removeAttribute("aria-current");}}'
            : '';
        var domReadyBlock = standalone
            ? 'document.addEventListener("DOMContentLoaded",function(){var ss=document.querySelectorAll(".sp-slide");if(ss[0])ss[0].classList.add("active");__ci=spInitStandaloneDots_("sp-dots",tot,cur);upd();wireScormIx();try{spFitSlideToStage_();}catch(eFit0){}var spRzFit_=function(){try{spFitSlideToStage_();}catch(eF){}};window.addEventListener("resize",spRzFit_,{passive:true});});'
            : 'document.addEventListener("DOMContentLoaded",function(){' +
              'try{if(!document.querySelector("base")){var pu=window.parent&&window.parent.location&&window.parent.location.href;var u=new URL(pu);u.hash="";u.search="";var p=u.pathname.split("/");p.pop();u.pathname=p.join("/")+"/";var be=document.createElement("base");be.href=u.href;document.head.insertBefore(be,document.head.firstChild);}}catch(e1){}' +
              '  var ss=document.querySelectorAll(".sp-slide");if(ss[0])ss[0].classList.add("active");' +
              '  if(typeof initCarouselIndicators==="function"){__ci=initCarouselIndicators({containerId:"sp-dots",count:tot,activeIndex:cur,maxVisible:6,dynamicFrom:11,ariaLabel:"Indicadores de diapositiva",onSelect:function(i){gotoSlide(i);}});}' +
              '  upd();wireScormIx();if(document.body.classList.contains("sp--editing")){try{wireSpTooltips_();}catch(eTt2){}}' +
              '  try{spFitSlideToStage_();}catch(eFit0){}' +
              '  if(document.body.classList.contains("sp--compact-viewport")){var spRzFit_=function(){try{spFitSlideToStage_();}catch(eF){}};window.addEventListener("resize",spRzFit_,{passive:true});}});';
        return standalonePrefix + 'var cur=0,tot='+n+',__spIxT=null,__ci=null;' +
        'function spFitSlideToStage_(){' +
        'if(document.body.classList.contains("sp--editing"))return;' +
        'var stage=document.querySelector(".sp-stage");var slide=document.querySelector(".sp-slide.active");' +
        'if(!stage||!slide)return;slide.style.zoom="";slide.scrollTop=0;' +
        'var sh=slide.scrollHeight,ch=stage.clientHeight;if(sh<=ch+4)return;' +
        'var z=Math.max(0.72,Math.min(1,(ch-6)/sh));slide.style.zoom=String(z);}' +
        'function hideAllIxTips_(){clearTimeout(__spIxT);__spIxT=null;document.querySelectorAll(".sp-ix-tooltip").forEach(function(t){t.setAttribute("hidden","hidden");});document.querySelectorAll(".sp-ix-hint").forEach(function(b){b.setAttribute("aria-expanded","false");});}' +
        'function showIxTipForSlide_(si){if(document.body.classList.contains("sp--editing"))return;hideAllIxTips_();var ss=document.querySelectorAll(".sp-slide");if(!ss[si])return;var wrap=ss[si].querySelector(".sp-ix-wrap");if(!wrap)return;var btn=wrap.querySelector(".sp-ix-hint");var tip=wrap.querySelector(".sp-ix-tooltip");if(!btn||!tip)return;var tx=btn.getAttribute("data-sp-ix-tip");if(!tx)return;tip.textContent=tx;tip.removeAttribute("hidden");btn.setAttribute("aria-expanded","true");__spIxT=setTimeout(function(){tip.setAttribute("hidden","hidden");btn.setAttribute("aria-expanded","false");__spIxT=null;},3000);}' +
        'function wireSpEditingExtras(){' +
        'document.querySelectorAll("[data-sp-img-rep]").forEach(function(btn){' +
        'btn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();if(!btn.closest(".sp-slide.active"))return;var idx=btn.getAttribute("data-sp-img-rep");var inp=document.querySelector(".sp-split-img-input[data-sp-img-input=\\""+idx+"\\"]");if(inp)inp.click();});});' +
        'document.querySelectorAll(".sp-split-img-input").forEach(function(inp){' +
        'inp.addEventListener("change",function(){var f=inp.files&&inp.files[0];if(!f||!f.type||f.type.indexOf("image")!==0)return;var r=new FileReader();r.onload=function(){var si=inp.getAttribute("data-sp-img-input");var img=document.querySelector("img[data-sp-key=\\"slide-"+si+"-image\\"]");if(img)img.src=r.result;};r.readAsDataURL(f);inp.value="";});});' +
        'function spTlRenum_(tr,sidx){if(!tr)return;tr.querySelectorAll(".sp-tl-item").forEach(function(row,i){var isLast=i===tr.querySelectorAll(".sp-tl-item").length-1;var lab=row.querySelector(".sp-tl-label");var tit=row.querySelector(".sp-tl-title");var bod=row.querySelector(".sp-tl-body");if(lab)lab.setAttribute("data-sp-key","slide-"+sidx+"-tl-"+i+"-label");if(tit)tit.setAttribute("data-sp-key","slide-"+sidx+"-tl-"+i+"-title");if(bod)bod.setAttribute("data-sp-key","slide-"+sidx+"-tl-"+i+"-body");var rail=row.querySelector(".sp-tl-rail");if(rail){var line=rail.querySelector(".sp-tl-line");if(isLast&&line)line.remove();else if(!isLast&&!line){var lineEl=document.createElement("span");lineEl.className="sp-tl-line";lineEl.setAttribute("aria-hidden","true");rail.appendChild(lineEl);}}});}' +
        'function spTlSyncBtns_(slide){if(!slide)return;var tr=slide.querySelector(".sp-tl-track");if(!tr)return;var bar=slide.querySelector(".sp-editor-bar");if(!bar)return;var add=bar.querySelector(".sp-tl-add");var del=bar.querySelector(".sp-tl-del");var n=tr.querySelectorAll(".sp-tl-item").length;if(del)del.disabled=n<=2;if(add)add.disabled=n>=12;}' +
        'document.querySelectorAll(".sp-tl-add").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var tr=slide&&slide.querySelector(".sp-tl-track");if(!tr||b.disabled)return;var n=tr.querySelectorAll(".sp-tl-item").length;if(n>=12)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;var last=tr.querySelector(".sp-tl-item:last-child");if(!last)return;var nw=last.cloneNode(true);nw.querySelectorAll("[data-sp-key]").forEach(function(el){el.removeAttribute("data-sp-key");});var lab=nw.querySelector(".sp-tl-label");var tit=nw.querySelector(".sp-tl-title");var bod=nw.querySelector(".sp-tl-body");if(lab)lab.textContent="Etapa";if(tit)tit.textContent="Título del paso";if(bod)bod.textContent="Describe qué ocurre en esta etapa.";tr.appendChild(nw);spTlRenum_(tr,sidx);spTlSyncBtns_(slide);});});' +
        'document.querySelectorAll(".sp-tl-del").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var tr=slide&&slide.querySelector(".sp-tl-track");if(!tr||b.disabled)return;var items=tr.querySelectorAll(".sp-tl-item");if(items.length<=2)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;items[items.length-1].remove();spTlRenum_(tr,sidx);spTlSyncBtns_(slide);});});' +
        'function spRenumberKeysLi_(ul,sidx){if(!ul)return;ul.querySelectorAll(":scope > li").forEach(function(li,i){li.setAttribute("data-sp-key","slide-"+sidx+"-bullet-"+i);});}' +
        'function spRenumberSteps_(list,sidx){if(!list)return;list.querySelectorAll(".sp-step-item").forEach(function(row,i){var num=row.querySelector(".sp-step-num");if(num)num.textContent=String(i+1);var tx=row.querySelector(".sp-step-text");if(tx)tx.setAttribute("data-sp-key","slide-"+sidx+"-bullet-"+i);});}' +
        'function spRenumberSummary_(ul,sidx){if(!ul)return;ul.querySelectorAll(":scope > li").forEach(function(li,i){var sp=li.querySelector("span");if(sp)sp.setAttribute("data-sp-key","slide-"+sidx+"-bullet-"+i);});}' +
        'function spRenumberAcc_(list,sidx){if(!list)return;list.querySelectorAll(".sp-acc-item").forEach(function(det,i){var tit=det.querySelector(".sp-acc-title");var bod=det.querySelector(".sp-acc-body");if(tit)tit.setAttribute("data-sp-key","slide-"+sidx+"-item-"+i+"-title");if(bod)bod.setAttribute("data-sp-key","slide-"+sidx+"-item-"+i+"-body");});}' +
        'function spTabRenum_(shell,sidx){if(!shell)return;var btns=shell.querySelectorAll(".sp-tab-btn");var pns=shell.querySelectorAll(".sp-tab-panel");btns.forEach(function(btn,i){btn.setAttribute("data-sp-tab",String(i));var lab=btn.querySelector("span");if(lab)lab.setAttribute("data-sp-key","slide-"+sidx+"-tab-"+i+"-label");});pns.forEach(function(p,i){p.setAttribute("data-sp-panel",String(i));var bod=p.querySelector(".sp-tab-body");if(bod)bod.setAttribute("data-sp-key","slide-"+sidx+"-tab-"+i+"-body");});}' +
        'function spFcRenum_(g,sidx){if(!g)return;g.querySelectorAll(".sp-fc").forEach(function(fc,i){fc.setAttribute("data-sp-fc",String(i));var fr=fc.querySelector(".sp-fc-front span");var bk=fc.querySelector(".sp-fc-back span");if(fr)fr.setAttribute("data-sp-key","slide-"+sidx+"-card-"+i+"-front");if(bk)bk.setAttribute("data-sp-key","slide-"+sidx+"-card-"+i+"-back");});}' +
        'function spFcSyncBtns_(g){if(!g)return;var bar=g.closest(".sp-fc-wrap");if(!bar)return;var del=bar.querySelector(".sp-fc-del");var add=bar.querySelector(".sp-fc-add");var n=g.querySelectorAll(".sp-fc").length;if(del)del.disabled=n<=2;if(add)add.disabled=n>=6;}' +
        'document.querySelectorAll(".sp-fc-add").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var g=slide&&slide.querySelector(".sp-fc-grid");if(!g||b.disabled)return;var n=g.querySelectorAll(".sp-fc").length;if(n>=6)return;var sidx=slide.getAttribute("data-idx")||"0";var last=g.querySelector(".sp-fc:last-child");if(!last)return;var nw=last.cloneNode(true);nw.classList.remove("sp-fc--flipped");nw.querySelectorAll("[data-sp-key]").forEach(function(el){el.removeAttribute("data-sp-key");});var fr=nw.querySelector(".sp-fc-front span");var bk=nw.querySelector(".sp-fc-back span");if(fr)fr.textContent="Concepto";if(bk)bk.textContent="Definición o respuesta";g.appendChild(nw);spFcRenum_(g,sidx);spFcSyncBtns_(g);});});' +
        'document.querySelectorAll(".sp-fc-del").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var g=slide&&slide.querySelector(".sp-fc-grid");if(!g||b.disabled)return;var items=g.querySelectorAll(".sp-fc");if(items.length<=2)return;var sidx=slide.getAttribute("data-idx")||"0";items[items.length-1].remove();spFcRenum_(g,sidx);spFcSyncBtns_(g);});});' +
        'document.querySelectorAll(".sp-fc-grid").forEach(function(g){var slide=g.closest(".sp-slide");var sidx=slide?slide.getAttribute("data-idx")||"0":"0";spFcRenum_(g,sidx);spFcSyncBtns_(g);});' +
        'function spCbSyncBtns_(slide){if(!slide)return;var ul=slide.querySelector("ul.sp-ed-ul");if(!ul)return;var bar=slide.querySelector(".sp-editor-bar");if(!bar)return;var add=bar.querySelector(".sp-cb-add");var del=bar.querySelector(".sp-cb-del");var n=ul.querySelectorAll(":scope > li").length;if(add)add.disabled=n>=7;if(del)del.disabled=n<=2;}' +
        'document.querySelectorAll(".sp-cb-add").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var ul=slide&&slide.querySelector("ul.sp-ed-ul");if(!ul||b.disabled)return;var lis=ul.querySelectorAll(":scope > li");if(lis.length>=7)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;var nw=lis[lis.length-1].cloneNode(true);nw.textContent="Escribe un punto de la lista.";ul.appendChild(nw);spRenumberKeysLi_(ul,sidx);spCbSyncBtns_(slide);});});' +
        'document.querySelectorAll(".sp-cb-del").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var ul=slide&&slide.querySelector("ul.sp-ed-ul");if(!ul||b.disabled)return;var lis=ul.querySelectorAll(":scope > li");if(lis.length<=2)return;lis[lis.length-1].remove();var sidx=slide.getAttribute("data-idx");if(sidx!=null)spRenumberKeysLi_(ul,sidx);spCbSyncBtns_(slide);});});' +
        'function spStSyncBtns_(slide){if(!slide)return;var list=slide.querySelector(".sp-steps-list");if(!list)return;var bar=slide.querySelector(".sp-editor-bar");if(!bar)return;var add=bar.querySelector(".sp-st-add");var del=bar.querySelector(".sp-st-del");var n=list.querySelectorAll(".sp-step-item").length;if(del)del.disabled=n<=2;if(add)add.disabled=n>=24;}' +
        'document.querySelectorAll(".sp-st-add").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var list=slide&&slide.querySelector(".sp-steps-list");if(!list||b.disabled)return;var rows=list.querySelectorAll(".sp-step-item");if(rows.length>=24)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;var nw=rows[rows.length-1].cloneNode(true);var tx=nw.querySelector(".sp-step-text");if(tx)tx.textContent="Paso nuevo";list.appendChild(nw);spRenumberSteps_(list,sidx);spStSyncBtns_(slide);});});' +
        'document.querySelectorAll(".sp-st-del").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var list=slide&&slide.querySelector(".sp-steps-list");if(!list||b.disabled)return;var rows=list.querySelectorAll(".sp-step-item");if(rows.length<=2)return;rows[rows.length-1].remove();var sidx=slide.getAttribute("data-idx");if(sidx!=null)spRenumberSteps_(list,sidx);spStSyncBtns_(slide);});});' +
        'function spSmSyncBtns_(slide){if(!slide)return;var ul=slide.querySelector("ul.sp-sum-list");if(!ul)return;var bar=slide.querySelector(".sp-editor-bar");if(!bar)return;var add=bar.querySelector(".sp-sm-add");var del=bar.querySelector(".sp-sm-del");var n=ul.querySelectorAll(":scope > li").length;if(add)add.disabled=n>=6;if(del)del.disabled=n<=2;}' +
        'document.querySelectorAll(".sp-sm-add").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var ul=slide&&slide.querySelector("ul.sp-sum-list");if(!ul||b.disabled)return;var lis=ul.querySelectorAll(":scope > li");if(lis.length>=6)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;var nw=lis[lis.length-1].cloneNode(true);var sp=nw.querySelector("span");if(sp)sp.textContent="Nuevo ítem";ul.appendChild(nw);spRenumberSummary_(ul,sidx);spSmSyncBtns_(slide);});});' +
        'document.querySelectorAll(".sp-sm-del").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var ul=slide&&slide.querySelector("ul.sp-sum-list");if(!ul||b.disabled)return;var lis=ul.querySelectorAll(":scope > li");if(lis.length<=2)return;lis[lis.length-1].remove();var sidx=slide.getAttribute("data-idx");if(sidx!=null)spRenumberSummary_(ul,sidx);spSmSyncBtns_(slide);});});' +
        'function spAccSyncBtns_(slide){if(!slide)return;var list=slide.querySelector(".sp-acc-list");if(!list)return;var bar=slide.querySelector(".sp-editor-bar");if(!bar)return;var add=bar.querySelector(".sp-acc-add");var del=bar.querySelector(".sp-acc-del");var n=list.querySelectorAll(".sp-acc-item").length;if(del)del.disabled=n<=2;if(add)add.disabled=n>=12;}' +
        'document.querySelectorAll(".sp-acc-add").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var list=slide&&slide.querySelector(".sp-acc-list");if(!list||b.disabled)return;var dets=list.querySelectorAll(".sp-acc-item");if(dets.length>=12)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;var nw=dets[dets.length-1].cloneNode(true);nw.removeAttribute("open");var tit=nw.querySelector(".sp-acc-title");var bod=nw.querySelector(".sp-acc-body");if(tit)tit.textContent="Nueva sección";if(bod)bod.textContent="Describe el contenido de esta sección.";list.appendChild(nw);spRenumberAcc_(list,sidx);spAccSyncBtns_(slide);});});' +
        'document.querySelectorAll(".sp-acc-del").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var list=slide&&slide.querySelector(".sp-acc-list");if(!list||b.disabled)return;var dets=list.querySelectorAll(".sp-acc-item");if(dets.length<=2)return;dets[dets.length-1].remove();var sidx=slide.getAttribute("data-idx");if(sidx!=null)spRenumberAcc_(list,sidx);spAccSyncBtns_(slide);});});' +
        'function spTabSyncBtns_(slide){if(!slide)return;var shell=slide.querySelector(".sp-tabs-shell");if(!shell)return;var card=slide.querySelector(".sp-tabs-card");var bar=card&&card.querySelector(".sp-editor-bar");if(!bar)return;var add=bar.querySelector(".sp-tab-add");var del=bar.querySelector(".sp-tab-del");var n=shell.querySelectorAll(".sp-tab-btn").length;if(add)add.disabled=n>=3;if(del)del.disabled=n<=2;}' +
        'document.querySelectorAll(".sp-tab-add").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var shell=slide&&slide.querySelector(".sp-tabs-shell");if(!shell||b.disabled)return;var btns=shell.querySelectorAll(".sp-tab-btn");if(btns.length>=3)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;var bar=shell.querySelector(".sp-tab-bar");var panWrap=shell.querySelector(".sp-tab-panels");var lastB=btns[btns.length-1];var lastP=panWrap&&panWrap.querySelector(".sp-tab-panel:last-child");if(!lastB||!lastP||!bar||!panWrap)return;var nb=lastB.cloneNode(true);nb.classList.remove("sp-tab-btn--active");nb.setAttribute("aria-selected","false");var ns=nb.querySelector("span");if(ns)ns.textContent="Nueva pestaña";var np=lastP.cloneNode(true);np.classList.remove("sp-tab-panel--active");np.setAttribute("hidden","hidden");var tb=np.querySelector(".sp-tab-body");if(tb)tb.textContent="Escribe el contenido de esta pestaña.";bar.appendChild(nb);panWrap.appendChild(np);spTabRenum_(shell,sidx);spTabSyncBtns_(slide);});});' +
        'document.querySelectorAll(".sp-tab-del").forEach(function(b){b.addEventListener("click",function(){var slide=b.closest(".sp-slide");var shell=slide&&slide.querySelector(".sp-tabs-shell");if(!shell||b.disabled)return;var btns=shell.querySelectorAll(".sp-tab-btn");var pns=shell.querySelectorAll(".sp-tab-panel");if(btns.length<=2||pns.length<=2)return;var sidx=slide.getAttribute("data-idx");if(sidx==null)return;var lastB=btns[btns.length-1];var lastP=pns[pns.length-1];var act=lastB&&lastB.classList.contains("sp-tab-btn--active");if(lastB)lastB.remove();if(lastP)lastP.remove();spTabRenum_(shell,sidx);spTabSyncBtns_(slide);if(act){var b0=shell.querySelector(".sp-tab-btn");var i0=b0?b0.getAttribute("data-sp-tab"):"0";shell.querySelectorAll(".sp-tab-btn").forEach(function(x){var on=x===b0;x.classList.toggle("sp-tab-btn--active",on);x.setAttribute("aria-selected",on?"true":"false");});shell.querySelectorAll(".sp-tab-panel").forEach(function(p){var m=p.getAttribute("data-sp-panel")===i0;p.classList.toggle("sp-tab-panel--active",m);if(m)p.removeAttribute("hidden");else p.setAttribute("hidden","hidden");});}});});' +
        'document.querySelectorAll(".sp-slide--tabs").forEach(function(sl){spTabSyncBtns_(sl);});' +
        'function spMatchSyncAddBtn_(list){if(!list)return;var slide=list.closest(".sp-slide");var add=slide&&slide.querySelector("[data-sp-match-add]");if(!add)return;var n=list.querySelectorAll(".sp-match-pair-row").length;add.disabled=n>=5;}' +
        'function spIconTip_(el,txt){if(!el)return;el.setAttribute("data-tooltip",txt);el.setAttribute("data-tooltip-delay","1000");}' +
        'function spMatchSyncDelPh_(list){var rows=list.querySelectorAll(".sp-match-pair-row");var n=rows.length;rows.forEach(function(row){var del=row.querySelector(".sp-match-pair-del");var ph=row.querySelector(".sp-match-pair-del-ph");if(n<=2){if(del){var s=document.createElement("span");s.className="sp-match-pair-del-ph";del.replaceWith(s);}}else{if(ph){var btn=document.createElement("button");btn.type="button";btn.className="sp-match-pair-del";btn.setAttribute("aria-label","Quitar pareja");btn.innerHTML="<i class=\\"far fa-trash-alt\\"></i>";spIconTip_(btn,"Quitar pareja");ph.replaceWith(btn);}}});}' +
        'document.querySelectorAll("[data-sp-match-add]").forEach(function(b){b.addEventListener("click",function(){var sid=b.getAttribute("data-sp-match-add");var list=document.querySelector("[data-sp-match-pairlist=\\""+sid+"\\"]");if(!list)return;var rows=list.querySelectorAll(".sp-match-pair-row");if(rows.length>=5)return;var last=rows[rows.length-1];if(last){var il=last.querySelector(".sp-match-inp-l");var ir=last.querySelector(".sp-match-inp-r");if(il&&ir&&(!String(il.value||"").trim()||!String(ir.value||"").trim())){alert("Completa ambos textos de la pareja actual antes de añadir otra.");return;}}var row=document.createElement("div");row.className="sp-match-pair-row";row.innerHTML="<input type=\\"text\\" class=\\"sp-match-inp-l\\" value=\\"Concepto nuevo\\" placeholder=\\"Concepto…\\" aria-label=\\"Concepto\\"><span class=\\"sp-match-pair-mid\\">→</span><input type=\\"text\\" class=\\"sp-match-inp-r\\" value=\\"Pareja del concepto\\" placeholder=\\"Pareja…\\" aria-label=\\"Pareja\\"><span class=\\"sp-match-pair-del-ph\\"></span>";list.appendChild(row);spMatchSyncDelPh_(list);spMatchSyncAddBtn_(list);});});' +
        'document.querySelectorAll("[data-sp-match-pairlist]").forEach(function(list){spMatchSyncAddBtn_(list);list.addEventListener("click",function(ev){var del=ev.target.closest(".sp-match-pair-del");if(!del||!list.contains(del))return;var rows=list.querySelectorAll(".sp-match-pair-row");if(rows.length<=2)return;var row=del.closest(".sp-match-pair-row");if(row)row.remove();spMatchSyncDelPh_(list);spMatchSyncAddBtn_(list);});});' +
        'function spQuizRenum_(card){if(!card)return;var slide=card.closest(".sp-slide");if(!slide)return;var sidx=slide.getAttribute("data-idx")||"0";var steps=card.querySelectorAll(".sp-quiz-step");var n=steps.length;steps.forEach(function(step,qi){step.setAttribute("data-sp-quiz-step",String(qi));var meta=step.querySelector(".sp-quiz-meta");if(meta)meta.textContent="Pregunta "+(qi+1)+" de "+n;var nm="sp-q-cor-"+sidx+"-"+qi;var cor=0;step.querySelectorAll(".sp-quiz-opt-row").forEach(function(row,oi){var inp=row.querySelector("input[type=radio]");if(inp&&inp.checked)cor=oi;});step.querySelectorAll(".sp-quiz-opt-row").forEach(function(row,oi){var inp=row.querySelector("input[type=radio]");if(inp){inp.name=nm;inp.value=String(oi);inp.checked=oi===cor;}var span=row.querySelector(".sp-quiz-opt-text");if(span)span.setAttribute("data-sp-key","slide-"+sidx+"-q-"+qi+"-opt-"+oi);});var qq=step.querySelector(".sp-quiz-q");if(qq)qq.setAttribute("data-sp-key","slide-"+sidx+"-q-"+qi+"-question");var qdel=step.querySelector(".sp-quiz-step-del");var qph=step.querySelector(".sp-quiz-step-del-ph");if(n<=1){if(qdel){var sp=document.createElement("span");sp.className="sp-quiz-step-del-ph";sp.setAttribute("aria-hidden","true");qdel.replaceWith(sp);}}else{if(qph){var bt=document.createElement("button");bt.type="button";bt.className="sp-quiz-step-del";bt.setAttribute("aria-label","Eliminar pregunta");bt.innerHTML="<i class=\\"far fa-trash-alt\\"></i>";spIconTip_(bt,"Eliminar pregunta");qph.replaceWith(bt);}}});card.setAttribute("data-sp-quiz-total",String(n));}' +
        'document.querySelectorAll(".sp-quiz-add-q").forEach(function(b){b.addEventListener("click",function(){var card=b.closest(".sp-quiz-card");if(!card)return;var wrap=card.querySelector(".sp-quiz-steps");if(!wrap)return;var steps=wrap.querySelectorAll(".sp-quiz-step");if(steps.length>=20)return;var last=steps[steps.length-1];if(!last)return;var nw=last.cloneNode(true);var qq=nw.querySelector(".sp-quiz-q");if(qq)qq.textContent="¿Escribe tu pregunta aquí?";var optLabs=["Opción A","Opción B","Opción C","Opción D"];nw.querySelectorAll(".sp-quiz-opt-text").forEach(function(sp,i){sp.textContent=optLabs[i]||("Opción "+(i+1));});var tmpNm="sp-q-new-"+Date.now();nw.querySelectorAll("input[type=radio]").forEach(function(r,i){r.name=tmpNm;r.checked=i===0;});wrap.appendChild(nw);spQuizRenum_(card);});});' +
        'document.querySelectorAll(".sp-quiz-steps").forEach(function(wrap){wrap.addEventListener("click",function(ev){var del=ev.target.closest(".sp-quiz-step-del");if(!del||!wrap.contains(del))return;var steps=wrap.querySelectorAll(".sp-quiz-step");if(steps.length<=1)return;var row=del.closest(".sp-quiz-step");if(row)row.remove();var card=wrap.closest(".sp-quiz-card");if(card)spQuizRenum_(card);});});' +
        'function spSyncSlideEditorBtns_(slide){if(!slide)return;spCbSyncBtns_(slide);spSmSyncBtns_(slide);spTabSyncBtns_(slide);spStSyncBtns_(slide);spAccSyncBtns_(slide);spTlSyncBtns_(slide);var g=slide.querySelector(".sp-fc-grid");if(g)spFcSyncBtns_(g);var ml=slide.querySelector("[data-sp-match-pairlist]");if(ml)spMatchSyncAddBtn_(ml);}' +
        'document.querySelectorAll(".sp-slide").forEach(function(sl){spSyncSlideEditorBtns_(sl);});' +
        'try{if(typeof wireSpTooltips_==="function")wireSpTooltips_();}catch(eWt){}' +
        '}' +
        'function nav(d){' +
        '  if((d<0&&cur===0)||(d>0&&cur===tot-1))return;' +
        '  var ss=document.querySelectorAll(".sp-slide"),prev=cur;' +
        '  cur=Math.max(0,Math.min(tot-1,cur+d));' +
        '  if(d>0){ss[prev].classList.add("exit-left");}' +
        '  ss[prev].classList.remove("active");' +
        '  if(d<0){' +
        '    ss[cur].style.transition="none";ss[cur].style.transform="translateX(-32px)";ss[cur].style.opacity="0";' +
        '    ss[cur].offsetHeight;' +
        '    ss[cur].style.transition="";ss[cur].style.transform="";ss[cur].style.opacity="";}' +
        '  ss[cur].classList.add("active");' +
        '  setTimeout(function(){if(d>0)ss[prev].classList.remove("exit-left");},380);' +
        '  upd();}' +
        'function gotoSlide(i){var ss=document.querySelectorAll(".sp-slide");ss[cur].classList.remove("active");cur=i;ss[cur].classList.add("active");upd();}' +
        'function upd(){' +
        '  var pf=document.getElementById("sp-pf");if(pf)pf.style.width=((cur+1)/tot*100)+"%";' +
        '  var ct=document.getElementById("sp-ct-num");if(ct)ct.textContent=(cur+1)+" / "+tot;' +
        '  document.getElementById("sp-prev").disabled=cur===0;' +
        '  var nx=document.getElementById("sp-next");if(nx){if(cur===tot-1)nx.setAttribute("hidden","hidden");else nx.removeAttribute("hidden");}' +
        '  document.querySelectorAll(".sp-slide-del").forEach(function(btn){var dis=tot<=1;btn.disabled=dis;btn.setAttribute("aria-disabled",dis?"true":"false");});' +
        '  if(__ci&&__ci.setActive)__ci.setActive(cur);' +
        '  try{showIxTipForSlide_(cur);}catch(eIx){}try{spFitSlideToStage_();}catch(eFit){}if(document.body.classList.contains("sp--editing")){var ss2=document.querySelectorAll(".sp-slide");if(ss2[cur])try{spSyncSlideEditorBtns_(ss2[cur]);}catch(eSb){}}}' +
        (editMode ? 'function openColorPicker(el){try{parent.ccScormOpenColorPicker(el,function(hex){if(parent.ccScormApplyTheme)parent.ccScormApplyTheme(document,hex);else document.documentElement.style.setProperty("--accent",hex);var sw=document.getElementById("sp-cpsw");if(sw)sw.style.background=hex;});}catch(e){}}' +
        'function wireSpTooltips_(){if(typeof initTooltip!=="function")return;try{initTooltip("[data-tooltip]");}catch(eT){}}' +
        'function deleteSlideAt_(slideIdx){if(typeof __spEditPageKey==="undefined")return;try{if(parent.ccScormConfirmDeleteSlide)parent.ccScormConfirmDeleteSlide(__spEditPageKey,slideIdx);}catch(eDel){}}' : '') +
        'function wireScormIx(){' +
        'document.querySelectorAll(".sp-ix-hint").forEach(function(btn){' +
        'btn.addEventListener("click",function(e){' +
        'e.stopPropagation();' +
        'if(document.body.classList.contains("sp--editing"))return;' +
        'var wrap=btn.closest(".sp-ix-wrap");if(!wrap)return;var tip=wrap.querySelector(".sp-ix-tooltip");if(!tip)return;' +
        'clearTimeout(__spIxT);__spIxT=null;' +
        'var wasOpen=!tip.hasAttribute("hidden");' +
        'document.querySelectorAll(".sp-ix-tooltip").forEach(function(t){t.setAttribute("hidden","hidden");});' +
        'document.querySelectorAll(".sp-ix-hint").forEach(function(b){b.setAttribute("aria-expanded","false");});' +
        'if(wasOpen)return;' +
        'var tx=btn.getAttribute("data-sp-ix-tip");if(!tx)return;tip.textContent=tx;tip.removeAttribute("hidden");btn.setAttribute("aria-expanded","true");' +
        '});});' +
        'if(!window.__spIxDocBound){window.__spIxDocBound=1;document.addEventListener("click",function(){hideAllIxTips_();});}' +
        'document.querySelectorAll(".sp-tabs-card").forEach(function(root){' +
        'var bar=root.querySelector(".sp-tab-bar");if(!bar)return;' +
        'bar.addEventListener("click",function(e){' +
        'var btn=e.target.closest(".sp-tab-btn");if(!btn||!bar.contains(btn))return;' +
        'if(e.target.closest("[contenteditable]"))return;' +
        'var i=btn.getAttribute("data-sp-tab");' +
        'root.querySelectorAll(".sp-tab-btn").forEach(function(b){var on=b===btn;b.classList.toggle("sp-tab-btn--active",on);b.setAttribute("aria-selected",on?"true":"false");});' +
        'root.querySelectorAll(".sp-tab-panel").forEach(function(p){var m=p.getAttribute("data-sp-panel")===i;p.classList.toggle("sp-tab-panel--active",m);if(m)p.removeAttribute("hidden");else p.setAttribute("hidden","hidden");});' +
        '});});' +
        'document.querySelectorAll("[data-sp-hs-root]").forEach(function(root){' +
        'var bd=root.querySelector(".sp-hotspot-backdrop");' +
        'var panels=root.querySelectorAll("[data-sp-hs-panel]");' +
        'function hsClose(){if(bd)bd.setAttribute("hidden","hidden");panels.forEach(function(p){p.setAttribute("hidden","hidden");});}' +
        'root.querySelectorAll(".sp-hotspot-pin").forEach(function(pin){' +
        'if(document.body.classList.contains("sp--editing")){' +
        'pin.classList.add("sp-hotspot-pin--drag");' +
        'pin.addEventListener("mousedown",function(ev){' +
        'if(ev.button!==0)return;' +
        'ev.preventDefault();' +
        'var moved=0;var sx=ev.clientX;var sy=ev.clientY;' +
        'var wrap=root.querySelector(".sp-media-img-wrap");if(!wrap)return;var r=wrap.getBoundingClientRect();' +
        'function move(ev2){var dx=ev2.clientX-sx,dy=ev2.clientY-sy;if((dx*dx+dy*dy)>36)moved=1;if(!moved)return;var x=((ev2.clientX-r.left)/r.width)*100;var y=((ev2.clientY-r.top)/r.height)*100;' +
        'var xCl=Math.max(5,Math.min(95,x));var yCl=Math.max(5,Math.min(95,y));pin.style.left=xCl+"%";pin.style.top=yCl+"%";pin.setAttribute("data-sp-hs-x",String(xCl));pin.setAttribute("data-sp-hs-y",String(yCl));}' +
        'function up(){document.removeEventListener("mousemove",move);document.removeEventListener("mouseup",up);' +
        'if(!moved){var i=pin.getAttribute("data-sp-hs-i");var p=root.querySelector("[data-sp-hs-panel=\\""+i+"\\"]");' +
        'hsClose();if(p&&bd){p.removeAttribute("hidden");bd.removeAttribute("hidden");}}}' +
        'document.addEventListener("mousemove",move);document.addEventListener("mouseup",up);});' +
        '}else{' +
        'pin.addEventListener("click",function(ev){' +
        'if(ev.target.closest("[contenteditable]"))return;' +
        'var i=pin.getAttribute("data-sp-hs-i");var p=root.querySelector("[data-sp-hs-panel=\\""+i+"\\"]");' +
        'hsClose();if(p&&bd){p.removeAttribute("hidden");bd.removeAttribute("hidden");}});}' +
        '});' +
        'if(bd)bd.addEventListener("click",hsClose);' +
        'root.querySelectorAll(".sp-hotspot-close").forEach(function(cb){cb.addEventListener("click",hsClose);});' +
        '});' +
        'if(document.body.classList.contains("sp--editing")){try{wireSpEditingExtras();}catch(eEd){}try{wireSpTooltips_();}catch(eTt){}document.querySelectorAll(".sp-slide-del").forEach(function(btn){btn.addEventListener("click",function(ev){ev.preventDefault();ev.stopPropagation();var slide=btn.closest(".sp-slide");if(!slide||btn.disabled)return;var si=parseInt(slide.getAttribute("data-idx"),10);if(isNaN(si))return;deleteSlideAt_(si);});});document.querySelectorAll(".sp-quiz-opt-text").forEach(function(sp){sp.addEventListener("mousedown",function(ev){ev.stopPropagation();});sp.addEventListener("click",function(ev){ev.stopPropagation();});});}' +
        'if(!window.__spFcGridBound){window.__spFcGridBound=1;var spFcFlipClick_=function(ev){var fc=ev.target.closest(".sp-fc");if(!fc)return;var g=fc.closest(".sp-fc-grid");if(!g)return;if(document.body.classList.contains("sp--editing")&&ev.target.closest("[contenteditable]"))return;fc.classList.toggle("sp-fc--flipped");};document.addEventListener("click",spFcFlipClick_);document.addEventListener("dblclick",function(ev){if(!document.body.classList.contains("sp--editing"))return;var fc=ev.target.closest(".sp-fc");if(!fc||!fc.closest(".sp-fc-grid"))return;ev.preventDefault();fc.classList.toggle("sp-fc--flipped");});}' +
        'document.querySelectorAll(".sp-quiz-card").forEach(function(card){' +
        'var steps=card.querySelectorAll(".sp-quiz-step"),total=steps.length,curQ=0,correctCount=0,doneEl=card.querySelector(".sp-quiz-done"),rst=card.querySelector(".sp-quiz-restart"),advanceTimer=null;' +
        'function showQ(qi){steps.forEach(function(s,j){s.classList.toggle("sp-quiz-step--active",j===qi);if(j===qi)s.removeAttribute("hidden");else s.setAttribute("hidden","hidden");});}' +
        'function resetQuiz(){curQ=0;correctCount=0;if(advanceTimer){clearTimeout(advanceTimer);advanceTimer=null;}if(doneEl)doneEl.setAttribute("hidden","hidden");steps.forEach(function(s){s.classList.remove("sp-quiz-step--answered");s.querySelectorAll(".sp-quiz-opt").forEach(function(o){o.classList.remove("sp-quiz-opt--pick","sp-quiz-opt--bad");var fb=o.querySelector(".sp-quiz-opt-feedback");if(fb)fb.remove();});});if(total)showQ(0);}' +
        'function finish(){steps.forEach(function(s){s.setAttribute("hidden","hidden");s.classList.remove("sp-quiz-step--active");});if(doneEl){doneEl.removeAttribute("hidden");var big=doneEl.querySelector(".sp-quiz-done-big");if(big){var pct=total>0?Math.round(correctCount*100/total):0;big.textContent=correctCount+"/"+total+" ("+pct+"%)";big.className="sp-quiz-done-big sp-quiz-score "+(pct>=80?"sp-quiz-score--success":pct>=60?"sp-quiz-score--warning":"sp-quiz-score--error");}if(pct>=80){try{if(typeof launchUbitsConfetti==="function")launchUbitsConfetti();}catch(eC){}}}}' +
        'if(rst)rst.addEventListener("click",function(e){e.preventDefault();resetQuiz();});' +
        'steps.forEach(function(step){' +
        'step.querySelectorAll(".sp-quiz-opt").forEach(function(opt){' +
        'function onPick(){if(document.body.classList.contains("sp--editing"))return;if(step.classList.contains("sp-quiz-step--answered"))return;var ok=opt.getAttribute("data-correct")==="1";' +
        'step.classList.add("sp-quiz-step--answered");step.querySelectorAll(".sp-quiz-opt").forEach(function(o){o.classList.remove("sp-quiz-opt--pick","sp-quiz-opt--bad");});' +
        'if(ok){opt.classList.add("sp-quiz-opt--pick");correctCount++;}else{opt.classList.add("sp-quiz-opt--bad");}' +
        'var fb=document.createElement("div");fb.className="sp-quiz-opt-feedback "+(ok?"sp-quiz-opt-feedback--correct":"sp-quiz-opt-feedback--wrong");fb.textContent=ok?"Respuesta correcta":"Respuesta incorrecta";opt.appendChild(fb);' +
        'advanceTimer=setTimeout(function(){advanceTimer=null;curQ++;if(curQ<total)showQ(curQ);else finish();},1500);}' +
        'opt.addEventListener("click",function(){onPick();});' +
        'opt.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();onPick();}});' +
        '});});' +
        'if(total)showQ(0);' +
        '});' +
        'document.querySelectorAll(".sp-match-card").forEach(function(card){' +
        'var pairs,raw=card.getAttribute("data-sp-match-pairs");try{pairs=JSON.parse(raw||"[]");}catch(e){pairs=[];}' +
        'var selL=null;' +
        'function clr(){selL=null;card.querySelectorAll(".sp-match-cell").forEach(function(x){x.classList.remove("sp-match--sel");});}' +
        'card.querySelectorAll(".sp-match-cell").forEach(function(cell){' +
        'cell.addEventListener("click",function(){' +
        'if(document.body.classList.contains("sp--editing"))return;' +
        'var side=cell.getAttribute("data-sp-match-side");var idx=parseInt(cell.getAttribute("data-sp-match-i"),10);' +
        'if(side==="L"){clr();selL=idx;cell.classList.add("sp-match--sel");return;}' +
        'if(side==="R"&&selL!==null){' +
        'var ok=pairs.some(function(pr){return pr[0]===selL&&pr[1]===idx;});' +
        'var Lc=card.querySelector(".sp-match-left[data-sp-match-i=\'"+selL+"\']");' +
        'if(ok){cell.classList.add("sp-match--ok");if(Lc)Lc.classList.add("sp-match--ok");}' +
        'else{if(Lc)Lc.classList.add("sp-match--wrong");cell.classList.add("sp-match--wrong");setTimeout(function(){if(Lc)Lc.classList.remove("sp-match--wrong");cell.classList.remove("sp-match--wrong");},1200);}' +
        'clr();}' +
        '});});});' +
        '}' +
        domReadyBlock;
    }

    function generateScormHtml(titulo, slides, color, editMode, isModalPreview, pageKey, logoSrc) {
        var n=slides.length;
        var logo = logoSrc || '';
        var slidesHtml=slides.map(function(s,i){return buildSlideHtml(s,i,editMode||false,logo);}).join('\n');
        var css=buildScormCss(color, editMode);
        var script=(editMode && pageKey ? 'var __spEditPageKey="'+esc(pageKey)+'";' : '') + buildScormScript(n, editMode||false);

        var colorTrigger = editMode
            ? '<div class="sp-color-field"><span class="sp-color-label ubits-body-sm-semibold">Color principal</span>' +
              '<button type="button" class="sp-color-swatch-btn" onclick="openColorPicker(this)" aria-label="Seleccionar color principal" data-tooltip="Seleccionar color principal" data-tooltip-delay="1000">' +
              '<span class="sp-color-swatch" id="sp-cpsw"></span></button></div>'
            : '';
        var headerInner = editMode
            ? '<div class="sp-hi__left">' + colorTrigger +
              '<span class="sp-title ubits-body-sm-bold">'+esc(titulo)+'</span></div>' +
              '<div class="sp-hi__actions">' +
              '<span class="sp-ct ubits-body-sm-semibold" id="sp-ct-num">1 / '+n+'</span></div>'
            : isModalPreview
                ? '<span class="sp-preview-rep ubits-body-sm-semibold">Vista previa representativa</span>' +
                  '<span class="sp-ct ubits-body-sm-semibold" id="sp-ct-num">1 / '+n+'</span>'
                : '<span class="sp-ct ubits-body-sm-semibold" id="sp-ct-num">1 / '+n+'</span>';
        var headerRowClass = editMode
            ? 'sp-hi sp-hi--edit'
            : 'sp-hi sp-hi--viewer' + (isModalPreview ? ' sp-hi--viewer--modal-preview' : '');

        return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
            '<script>(function(){try{var pu=window.parent&&window.parent.location&&window.parent.location.href;var u=new URL(pu);u.hash="";u.search="";var p=u.pathname.split("/");p.pop();u.pathname=p.join("/")+"/";var be=document.createElement("base");be.href=u.href;document.head.appendChild(be);}catch(e1){}})();<\/script>'+
            getScormChromeCssLinks(!!editMode) +
            getScormChromeThemeSyncScript() +
            '<link rel="stylesheet" href="../../components/carousel-indicators.css">'+
            '<style>'+css+'</style></head><body class="'+
            (editMode?'sp--editing':('sp--compact-viewport'+(isModalPreview?' sp--modal-preview':'')))+'">'+
            '<div class="sp-header">'+
                '<div class="sp-pb"><div class="sp-pf" id="sp-pf"></div></div>'+
                '<div class="'+headerRowClass+'">'+
                    headerInner+
                '</div>'+
            '</div>'+
            '<div class="sp-stage"><div class="sp-slides">'+slidesHtml+'</div></div>'+
            '<div class="sp-footer">'+
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="sp-prev" onclick="nav(-1)" aria-label="Anterior"><i class="far fa-arrow-left"></i><span>Anterior</span></button>'+
                '<div id="sp-dots"></div>'+
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="sp-next" onclick="nav(1)" aria-label="Siguiente"><span>Siguiente</span><i class="far fa-arrow-right"></i></button>'+
            '</div>'+
            '<script src="../../components/carousel-indicators.js"><\/script>'+
            '<script src="../../components/ubits-confetti.js"><\/script>'+
            (editMode ? '<script src="../../components/tooltip.js"><\/script>' : '') +
            '<script>'+script+'<\/script></body></html>';
    }

    /** HTML autocontenido para descarga local (sin iframe ni rutas relativas al playground). */
    function generateScormStandaloneDownloadHtml(titulo, slides, color, logoSrc) {
        var n = slides.length;
        var logo = logoSrc || '';
        var slidesHtml = slides.map(function (s, i) {
            return buildSlideHtml(s, i, false, logo);
        }).join('\n');
        var css = buildScormCss(color, false);
        var script = buildScormScript(n, false, true);
        var headerInner =
            '<span class="sp-ct ubits-body-sm-semibold" id="sp-ct-num">1 / ' + n + '</span>';

        return (
            '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<title>' + esc(titulo) + '</title>' +
            '<link rel="preconnect" href="https://fonts.googleapis.com">' +
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">' +
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">' +
            '<style>' + buildScormStandaloneChromeCss() + css + '</style></head>' +
            '<body class="sp--compact-viewport">' +
            '<div class="sp-header">' +
            '<div class="sp-pb"><div class="sp-pf" id="sp-pf"></div></div>' +
            '<div class="sp-hi sp-hi--viewer">' + headerInner + '</div>' +
            '</div>' +
            '<div class="sp-stage"><div class="sp-slides">' + slidesHtml + '</div></div>' +
            '<div class="sp-footer">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="sp-prev" onclick="nav(-1)" aria-label="Anterior"><i class="fas fa-arrow-left" aria-hidden="true"></i><span>Anterior</span></button>' +
            '<div id="sp-dots"></div>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="sp-next" onclick="nav(1)" aria-label="Siguiente"><span>Siguiente</span><i class="fas fa-arrow-right" aria-hidden="true"></i></button>' +
            '</div>' +
            '<script>' + script + '<\/script></body></html>'
        );
    }

    function applyPlaceholderSlidesForPreview(slides) {
        var t = 'Título de la diapositiva';
        var b = 'Texto de ejemplo sobre el tema para la vista previa.';
        var bl = 'Bullet informativo sobre el tema a tratar';
        return slides.map(function (s, idx) {
            var x = JSON.parse(JSON.stringify(s));
            var n = idx + 1;
            if (x.title != null) x.title = t;
            if (x.subtitle != null) x.subtitle = 'Subtítulo de ejemplo';
            if (x.body != null && x.body !== '') x.body = b;
            if (x.author != null) x.author = 'Autor de ejemplo';
            if (x.statement != null) x.statement = b;
            if (x.desc != null) x.desc = 'Descripción breve de apoyo.';
            if (x.stat != null) x.stat = '00%';
            if (x.bullets && x.bullets.length) x.bullets = x.bullets.map(function () { return bl; });
            if (x.items && x.items.length) {
                x.items = x.items.map(function () {
                    return { label: 'Etiqueta', title: t, body: b };
                });
            }
            if (x.tabs && x.tabs.length) {
                x.tabs = x.tabs.map(function () {
                    return { label: 'Pestaña', body: b };
                });
            }
            if (x.cards && x.cards.length) {
                x.cards = x.cards.map(function () {
                    return { front: t, back: b };
                });
            }
            if (x.rows && x.rows.length) {
                x.rows = x.rows.map(function () {
                    return { left: bl, right: bl };
                });
            }
            if (x.leftTag) x.leftTag = 'Opción A';
            if (x.rightTag) x.rightTag = 'Opción B';
            if (x.leftTitle) x.leftTitle = t;
            if (x.rightTitle) x.rightTitle = t;
            if (x.leftBody) x.leftBody = b;
            if (x.rightBody) x.rightBody = b;
            if (x.questions && x.questions.length) {
                x.questions = x.questions.map(function () {
                    return { question: t, options: ['Opción A', 'Opción B', 'Opción C'], correctIndex: 0 };
                });
            }
            if (x.left && x.left.length) x.left = x.left.map(function () { return bl; });
            if (x.right && x.right.length) x.right = x.right.map(function () { return bl; });
            if (x.hotspots && x.hotspots.length) {
                x.hotspots = x.hotspots.map(function () {
                    return { x: 50, y: 50, title: t, body: b };
                });
            }

            if (n === 1 && x.body != null && x.body !== '') {
                x.body = 'Párrafo descriptivo sobre el tema a tratar.';
            }
            if (n === 2 && x.type === 'content') {
                x.bullets = [
                    'Asertividad: cuánto priorizas tus propias necesidades',
                    'Cooperación: cuánto priorizas las necesidades del otro',
                    'Tu punto en ese mapa define tu modo natural de respuesta'
                ];
            }
            if (n === 4 && x.type === 'quote' && x.body != null) {
                x.body = 'Cita o frase relevante sobre el tema a tratar en esta presentación.';
            }
            if (n === 5 && x.type === 'keypoint' && x.statement != null) {
                x.statement =
                    'Métrica descriptiva sobre el tema que explica detalladamente algun indicador importante sobre el tema a tratar.';
            }
            if (n === 7 && x.type === 'media' && x.hotspots && x.hotspots.length) {
                x.hotspots = x.hotspots.map(function (h) {
                    return {
                        x: h.x,
                        y: h.y,
                        title: 'Título del hotspot',
                        body: 'Descripción breve del detalle que quieres resaltar de la imagen.'
                    };
                });
            }
            if (n === 8 && x.type === 'accordion' && x.items && x.items.length) {
                x.items = x.items.map(function () {
                    return {
                        title: 'Concepto a detallar',
                        body: 'Detalle explicativo del concepto relevante sobre el tema a tratar en esta presentación.'
                    };
                });
            }
            if (n === 10 && x.type === 'flashcards' && x.cards && x.cards.length) {
                x.cards = x.cards.map(function () {
                    return {
                        front: 'Título de la tarjeta',
                        back: 'Detalle explicativo del concepto relevante sobre el tema a tratar en esta presentación.'
                    };
                });
            }
            if (n === 11 && x.type === 'timeline' && x.items && x.items.length) {
                x.items = x.items.map(function (it) {
                    return {
                        label: it.label,
                        title: 'Título del paso',
                        body: 'Descripción explicativa del paso para que el estudiante tenga más contexto de dicha etapa.'
                    };
                });
            }
            if (n === 12 && x.type === 'compare') {
                x.leftTitle = 'Título del enfoque A';
                x.rightTitle = 'Título del enfoque B';
                x.leftBody = 'Descripción sobre el tema a comparar';
                x.rightBody = 'Descripción sobre el tema a comparar';
                if (x.rows && x.rows.length) {
                    x.rows = x.rows.map(function () {
                        return {
                            left: 'Descripción sobre el tema a comparar',
                            right: 'Descripción sobre el tema a comparar'
                        };
                    });
                }
            }
            if (n === 13 && x.type === 'quiz_mc' && x.questions && x.questions.length) {
                x.questions = x.questions.map(function (q) {
                    return {
                        question: 'Pregunta o enunciado sobre el tema a tratar',
                        options: q.options,
                        correctIndex: q.correctIndex
                    };
                });
            }

            return x;
        });
    }

    function refreshPreview() {
        var frame = document.getElementById('cc-sm-preview-frame');
        if (!frame) return;
        var slides = applyPlaceholderSlidesForPreview(generateSlidesFromEnabled(_enabledSlideTypes));
        var tit = (_titulo && String(_titulo).trim()) ? String(_titulo).trim() : 'Título del módulo';
        frame.srcdoc = generateScormHtml(tit, slides, _color, false, true, null, _logoDataUrl || '');
    }

    /* ══════════════════════════════════════
       BLOQUE RENDERIZADO
    ══════════════════════════════════════ */
    function buildRenderedBlock(scormHtml, pageKey, blockOpts) {
        blockOpts = blockOpts || {};
        var aiGenerated = blockOpts.aiGenerated;
        if (aiGenerated === undefined && pageKey && _scormDataStore[pageKey]) {
            aiGenerated = !!_scormDataStore[pageKey].generatedByAi;
        }
        var aiHost =
            aiGenerated && typeof global.getGeneradoConIaBadgeHtml === 'function'
                ? '<div class="cc-scorm-resource__generado-ia-host">' + global.getGeneradoConIaBadgeHtml() + '</div>'
                : '';
        var footerHtml;
        if (global.CC_PUBLISHED_EDIT_MODE && typeof global.ccBuildCrearContenidoResourceFooterHtml === 'function') {
            footerHtml = global.ccBuildCrearContenidoResourceFooterHtml(
                ' style="display:flex;align-items:center;gap:var(--gap-sm);flex-wrap:wrap;"'
            );
        } else {
            var editBtn = pageKey
                ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="cc-editar-scorm-recurso"><i class="far fa-pencil"></i><span>Editar SCORM</span></button>'
                : '';
            footerHtml =
                '<div class="ubits-resources-block__footer" style="display:flex;align-items:center;gap:var(--gap-sm);flex-wrap:wrap;">' +
                editBtn +
                '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso"><i class="far fa-trash-alt"></i><span>Eliminar</span></button>' +
                '</div>';
        }
        var escaped = scormHtml.replace(/"/g, '&quot;');
        return '<div class="ubits-resources-block ubits-resources-block--stack">' +
            '<div class="ubits-resources-block__surface cc-scorm-resource__surface" style="padding:0;">' +
                '<div class="cc-scorm-resource__embed-wrap">' +
                    aiHost +
                    '<div class="cc-scorm-iframe-container">' +
                        '<iframe srcdoc="' + escaped + '" allowfullscreen></iframe>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            footerHtml +
        '</div>';
    }

    /* ══════════════════════════════════════
       MODAL HTML BUILDERS
    ══════════════════════════════════════ */
    function buildTabBar() {
        return '<div class="cc-sm-tabbar-wrap">' +
            '<div class="cc-vmodal-tabbar" id="cc-sm-tabbar" role="tablist">' +
                '<div class="ubits-tabs-on-bg">' +
                    '<button type="button" class="ubits-tab ubits-tab--sm ubits-tab--active" role="tab" aria-selected="true" data-cc-stab="ia"><span>SCORM con IA</span></button>' +
                    '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-stab="subir"><span>Subir .zip</span></button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function buildIaPanel() {
        return '<div class="cc-smodal-panel" id="cc-stab-ia">' +
            '<div class="cc-sm-main-layout">' +
                '<div class="cc-sm-left-col">' +
                    '<div class="cc-sm-section">' +
                        '<div id="cc-sm-titulo-wrap"></div>' +
                    '</div>' +
                    '<div class="cc-sm-section-divider"></div>' +
                    '<div class="cc-sm-section">' +
                        '<span class="ubits-input-label">Contexto para la IA</span>' +
                        '<div id="cc-sm-ia-input-mount"></div>' +
                    '</div>' +
                    '<div class="cc-sm-section-divider"></div>' +
                    '<div class="cc-sm-section">' +
                        '<span class="ubits-input-label">Tipos de diapositiva</span>' +
                        '<div class="cc-sm-slide-types" id="cc-sm-slide-types-mount" role="group" aria-label="Tipos de diapositiva"></div>' +
                        '<p class="cc-sm-slide-types-meta ubits-body-xs-regular" id="cc-sm-slide-types-meta" aria-live="polite"></p>' +
                    '</div>' +
                    '<div class="cc-sm-section-divider"></div>' +
                    '<div class="cc-sm-section">' +
                        '<div class="cc-sm-controls-row cc-sm-controls-row--color-only">' +
                            '<span class="ubits-input-label cc-sm-controls-row__color-label">Color principal</span>' +
                            '<button type="button" class="ubits-color-picker-trigger cc-sm-cp-swatch" id="cc-sm-cp-swatch" style="background:'+_color+';" aria-label="Seleccionar color principal"></button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="cc-sm-section-divider"></div>' +
                    '<div class="cc-sm-section cc-sm-logo-section">' +
                        '<p class="ubits-body-md-bold cc-sm-logo-section__label">Logo de la empresa <span class="cc-sm-optional">(opcional)</span></p>' +
                        '<div id="cc-sm-logo-upload-mount"></div>' +
                    '</div>' +
                '</div>' +
                /* Columna derecha: preview (misma pauta que video legacy) */
                '<div class="cc-sm-right-col">' +
                    '<div class="cc-sm-preview-host">' +
                        '<div class="ubits-resources-block__surface cc-scorm-resource__surface" style="padding:0;">' +
                            '<div class="cc-scorm-resource__embed-wrap">' +
                                '<div class="cc-scorm-iframe-container">' +
                                    '<iframe id="cc-sm-preview-frame" srcdoc="" title="Vista previa SCORM" allowfullscreen></iframe>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function buildSubirPanel() {
        return '<div class="cc-smodal-panel cc-smodal-panel--hidden" id="cc-stab-subir">' +
            '<div class="cc-sm-subir-layout">' +
                '<div class="cc-sm-subir-centered">' +
                    '<div id="cc-sm-zip-fu-wrap"></div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function buildModalBody() {
        return '<div class="cc-smodal">' + buildTabBar() + buildIaPanel() + buildSubirPanel() + '</div>';
    }

    function buildModalFooterHtml() {
        return '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md ubits-ia-button--with-token-cost" id="cc-sm-footer-generate">' +
                '<span>Generar presentación</span>' +
                '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
                '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
                    '<i class="far fa-coin-vertical"></i>' +
                    '<span class="ubits-ia-button__token-number">'+SCORM_GEN_TOKEN_COST+'</span>' +
                '</span>' +
            '</button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-sm-footer-cargar-zip" style="display:none;" disabled><span>Cargar SCORM</span></button>';
    }

    function applyScormModalBodyOverflow(modalBody) {
        if (!modalBody) return;
        modalBody.style.padding = 'var(--padding-xl)';
        modalBody.style.display = 'flex';
        modalBody.style.flexDirection = 'column';
        modalBody.style.maxHeight = '';
        modalBody.style.flex = '1 1 auto';
        modalBody.style.minHeight = '0';
        modalBody.style.overflowX = 'hidden';
        modalBody.style.overflowY = 'auto';
    }

    function wireScormModalLayout(overlay) {
        if (!overlay || overlay._ccSmLayoutResize) return;
        var onResize = function () {
            if (_currentTab === 'ia') {
                applyScormModalBodyOverflow(overlay.querySelector('.ubits-modal-body'));
            }
        };
        overlay._ccSmLayoutResize = onResize;
        global.addEventListener('resize', onResize, { passive: true });
    }

    function unwireScormModalLayout(overlay) {
        if (!overlay || !overlay._ccSmLayoutResize) return;
        global.removeEventListener('resize', overlay._ccSmLayoutResize);
        overlay._ccSmLayoutResize = null;
    }

    function applyAiModalChrome(overlay) {
        var mc = overlay.querySelector('.ubits-modal-content');
        if (mc) mc.classList.add('portada-ia-modal-content', 'cc-scorm-ia-modal-content');
        applyScormModalBodyOverflow(overlay.querySelector('.ubits-modal-body'));
        syncScormTokensBadge();
    }

    /* ══════════════════════════════════════
       INTERACTIONS — MODAL PRINCIPAL
    ══════════════════════════════════════ */
    function switchToTab(tab) {
        _currentTab=tab;
        var overlay=document.getElementById(OVERLAY_ID);
        if (overlay) overlay.classList.toggle('cc-sm--compact', tab !== 'ia');
        var bar=document.getElementById('cc-sm-tabbar');
        if (bar) bar.querySelectorAll('[data-cc-stab]').forEach(function(b){
            var on=b.getAttribute('data-cc-stab')===tab;
            b.classList.toggle('ubits-tab--active',on);
            b.setAttribute('aria-selected',on?'true':'false');
        });
        ['ia','subir'].forEach(function(p){
            var el=document.getElementById('cc-stab-'+p);
            if (el) el.classList.toggle('cc-smodal-panel--hidden',p!==tab);
        });
        /* Footer: generar ↔ cargar según tab */
        var genBtn   = document.getElementById('cc-sm-footer-generate');
        var cargarBtn= document.getElementById('cc-sm-footer-cargar-zip');
        if (tab==='ia') {
            if (genBtn)    genBtn.style.display='';
            if (cargarBtn) cargarBtn.style.display='none';
        } else {
            if (genBtn)    genBtn.style.display='none';
            if (cargarBtn) cargarBtn.style.display='';
            initZipUpload();
        }
        syncScormTokensBadge();
    }

    function initTituloInput() {
        if (typeof global.createInput!=='function') return;
        var wrap=document.getElementById('cc-sm-titulo-wrap');
        if (!wrap || wrap.querySelector('input')) return;
        _tituloInputApi = global.createInput({
            containerId:'cc-sm-titulo-wrap', type:'text',
            label:'Título de la presentación', placeholder:'Ej: Introducción al liderazgo', size:'md',
            mandatory: true, mandatoryType: 'obligatorio',
            showHelper: false, helperText: 'Campo requerido',
            onChange:function(v){
                _titulo=v;
                if (_tituloInputApi && v.trim()) _tituloInputApi.setState('default');
                refreshPreview();
            }
        });
        if (_titulo) { var inp=wrap.querySelector('input'); if(inp) inp.value=_titulo; }
    }

    function updateSlideTypesMeta() {
        var meta = document.getElementById('cc-sm-slide-types-meta');
        if (!meta) return;
        var n = countEnabledSlideTypes(_enabledSlideTypes);
        var suffix = n === 1 ? 'diapositiva' : 'diapositivas';
        meta.textContent =
            n + ' ' + suffix + ' en el módulo · una de cada tipo seleccionado · La portada siempre se incluye';
    }

    function initSlideTypeSelector() {
        var mount = document.getElementById('cc-sm-slide-types-mount');
        if (!mount || mount._ccSlideTypesWired) return;
        mount._ccSlideTypesWired = true;

        mount.innerHTML = SCORM_SLIDE_TYPE_CATALOG.map(function (item) {
            var checked = _enabledSlideTypes[item.type] !== false;
            var disabledAttr = item.locked ? ' disabled' : '';
            var checkedAttr = checked ? ' checked' : '';
            return (
                '<label class="ubits-checkbox ubits-checkbox--sm cc-sm-slide-type-item">' +
                '<input type="checkbox" class="ubits-checkbox__input" data-cc-slide-type="' +
                esc(item.type) +
                '"' +
                checkedAttr +
                disabledAttr +
                '>' +
                '<span class="ubits-checkbox__box"><i class="fas fa-check"></i></span>' +
                '<span class="ubits-checkbox__label">' +
                esc(item.label) +
                '</span>' +
                '</label>'
            );
        }).join('');

        mount.querySelectorAll('[data-cc-slide-type]').forEach(function (inp) {
            inp.addEventListener('change', function () {
                var type = inp.getAttribute('data-cc-slide-type');
                if (!type || type === 'intro') {
                    inp.checked = true;
                    _enabledSlideTypes.intro = true;
                    return;
                }
                _enabledSlideTypes[type] = inp.checked;
                updateSlideTypesMeta();
                refreshPreview();
            });
        });

        updateSlideTypesMeta();
    }

    function initScormLogoUpload() {
        var mount = document.getElementById('cc-sm-logo-upload-mount');
        if (!mount || document.getElementById('cc-sm-logo-upload')) return;
        if (typeof global.createFileUploadCompact !== 'function') return;

        global.createFileUploadCompact({
            containerId: 'cc-sm-logo-upload-mount',
            id: 'cc-sm-logo-upload',
            hideHeader: true,
            accept: 'image/png,.png',
            maxSizeMb: 2,
            formats: 'PNG · hasta 2 MB',
            icon: 'image',
            uploadButtonLabel: 'Subir',
            changeButtonLabel: 'Cambiar',
            previewThumbnail: true,
            onChange: function (file, detail) {
                _logoDataUrl = file && detail && detail.previewUrl ? detail.previewUrl : null;
                refreshPreview();
            },
            onError: function (err) {
                if (typeof global.showToast === 'function' && err && err.message) {
                    global.showToast('warning', err.message, { containerId: 'ubits-toast-container' });
                }
            }
        });
    }

    function clearScormContextFieldError() {
        if (_smContextIaInputApi) _smContextIaInputApi.setContextError(false);
    }

    function scormContextValue() {
        if (_smContextIaInputApi && typeof _smContextIaInputApi.getValue === 'function') {
            return String(_smContextIaInputApi.getValue() || '').trim();
        }
        return '';
    }

    function smPendingImagesForApi() {
        return _pendingImgs.map(function (img) {
            return { src: img.src, alt: img.name || 'Imagen adjunta' };
        });
    }

    function smPendingFilesForApi() {
        return _pendingFiles.map(function (f) {
            return { name: f.name || 'Archivo' };
        });
    }

    function syncSmPendingToInput() {
        if (!_smContextIaInputApi) return;
        _smContextIaInputApi.setPendingImages(smPendingImagesForApi());
        _smContextIaInputApi.setPendingFiles(smPendingFilesForApi());
    }

    function handleSmContextAttachFiles(files) {
        if (!files || !files.length) return;
        Array.prototype.forEach.call(files, function (f) {
            if (f.type && f.type.indexOf('image/') === 0) {
                var reader = new FileReader();
                reader.onload = function (ev) {
                    _pendingImgs.push({
                        name: f.name,
                        src: ev && ev.target ? ev.target.result : '',
                    });
                    syncSmPendingToInput();
                    clearScormContextFieldError();
                };
                reader.readAsDataURL(f);
            } else {
                _pendingFiles.push({ name: f.name, type: f.type, size: f.size });
                syncSmPendingToInput();
                clearScormContextFieldError();
            }
        });
    }

    function initSmContextIaInput() {
        var mount = document.getElementById('cc-sm-ia-input-mount');
        if (!mount || typeof global.createUbitsIAInput !== 'function') return;
        if (_smContextIaInputApi) {
            _smContextIaInputApi.destroy();
            _smContextIaInputApi = null;
        }
        mount.innerHTML = '';
        _smContextIaInputApi = global.createUbitsIAInput({
            variant: 'panel',
            id: 'cc-sm-context-input',
            placeholder: 'Adjunta un archivo o describe el contexto específico de tu equipo o industria',
            attach: true,
            attachAriaLabel: 'Adjuntar',
            attachTooltip: 'Adjuntar',
            pendingImages: smPendingImagesForApi(),
            pendingFiles: smPendingFilesForApi(),
            onAttachFiles: handleSmContextAttachFiles,
            onRemovePendingImage: function (i) {
                _pendingImgs.splice(i, 1);
                syncSmPendingToInput();
            },
            onRemovePendingFile: function (i) {
                _pendingFiles.splice(i, 1);
                syncSmPendingToInput();
            },
            hasContextError: false,
            contextErrorMessage: 'Mensaje de error',
            action: { type: 'none' },
            onChange: clearScormContextFieldError,
        }).mount(mount);
        if (typeof global.initTooltip === 'function') {
            global.initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
        }
    }

    /** Contexto IA: texto en el área o al menos un adjunto (imagen u otro archivo). */
    function scormIaHasContextMaterial() {
        if (scormContextValue().length) return true;
        return _pendingImgs.length > 0 || _pendingFiles.length > 0;
    }

    function wireIaPanel() {
        var panel=document.getElementById('cc-stab-ia');
        if (!panel || panel._ccWired) return;
        panel._ccWired=true;

        panel.addEventListener('click', function(e) {
            var swatch=e.target.closest('#cc-sm-cp-swatch');
            if (swatch) { openCpPanel(swatch, null); return; }
        });
    }

    function wireTabBar() {
        var bar=document.getElementById('cc-sm-tabbar');
        if (!bar||bar._ccWired) return;
        bar._ccWired=true;
        bar.addEventListener('click',function(e){
            var b=e.target.closest('[data-cc-stab]');
            if (b) switchToTab(b.getAttribute('data-cc-stab'));
        });
    }

    function syncPageTitle(newTitle) {
        var activeItem = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
        if (!activeItem) return;
        var labelEl = activeItem.querySelector('.ubits-paginas-creator__label');
        if (labelEl) labelEl.textContent = newTitle;
        var titleInp = document.getElementById('crear-contenido-recursos-page-title');
        if (titleInp) {
            titleInp.value = newTitle;
            if (typeof global.autoResizeInlineEdit === 'function') global.autoResizeInlineEdit(titleInp);
        }
        document.dispatchEvent(new CustomEvent('ubits-paginas-creator-label-save', {
            bubbles: true,
            detail: { pageKey: _currentPageKey, newLabel: newTitle }
        }));
    }

    function wireFooter() {
        var genBtn=document.getElementById('cc-sm-footer-generate');
        if (genBtn&&!genBtn._ccWired) {
            genBtn._ccWired=true;
            genBtn.addEventListener('click',function(){
                var titWrap=document.getElementById('cc-sm-titulo-wrap');
                var titInp=titWrap ? titWrap.querySelector('input') : null;
                var tit=(titInp ? titInp.value.trim() : _titulo);
                var valid=true;

                if (!tit) {
                    if (_tituloInputApi) _tituloInputApi.setState('invalid');
                    else if (titInp) titInp.focus();
                    valid=false;
                }
                if (!scormIaHasContextMaterial()) {
                    if (_smContextIaInputApi) {
                        _smContextIaInputApi.setContextError(true, 'Mensaje de error');
                        var ctxTa = _smContextIaInputApi.getTextarea();
                        if (!tit && ctxTa) ctxTa.focus();
                        else if (ctxTa) ctxTa.focus();
                    }
                    valid=false;
                }
                if (!valid) return;

                _titulo=tit;
                if (!trySpendTokens(SCORM_GEN_TOKEN_COST)) return;
                syncPageTitle(_titulo);
                var slides=generateSlidesFromEnabled(_enabledSlideTypes);
                var pageKey=_currentPageKey;
                var scormHtml=generateScormHtml(_titulo,slides,_color,false,false,null,_logoDataUrl||'');
                if (pageKey) {
                    _scormDataStore[pageKey] = {
                        slides: slides,
                        color: _color,
                        titulo: _titulo,
                        scormHtml: scormHtml,
                        logoDataUrl: _logoDataUrl || null,
                        enabledSlideTypes: normalizeEnabledSlideTypes(_enabledSlideTypes),
                        generatedByAi: true
                    };
                }
                closeModal(OVERLAY_ID);
                startScormWidget({pageKey:pageKey, titulo:_titulo, slides:slides, color:_color, scormHtml:scormHtml});
            });
        }

        var cargarBtn=document.getElementById('cc-sm-footer-cargar-zip');
        if (cargarBtn&&!cargarBtn._ccWired) {
            cargarBtn._ccWired=true;
            cargarBtn.addEventListener('click', confirmZipLoad);
        }
    }

    function confirmZipLoad() {
        var html = '<div class="ubits-resources-block ubits-resources-block--stack">' +
            '<div class="ubits-resources-block__surface cc-scorm-resource__surface" style="padding:0;">' +
                '<div class="cc-scorm-resource__embed-wrap">' +
                    '<div class="cc-scorm-iframe-container">' +
                        '<iframe src="simulador-scorm.html" allowfullscreen></iframe>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="ubits-resources-block__footer" style="display:flex;align-items:center;gap:var(--gap-sm);flex-wrap:wrap;">' +
                '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso"><i class="far fa-trash-alt"></i><span>Eliminar</span></button>' +
            '</div>' +
        '</div>';
        closeModal(OVERLAY_ID);
        if (_onScormReady) _onScormReady(html);
        emitChanged({type:'scorm',pageKey:_currentPageKey,source:'upload'});
    }

    function initZipUpload() {
        var wrap=document.getElementById('cc-sm-zip-fu-wrap');
        if (!wrap||typeof global.createFileUpload!=='function') return;
        if (wrap.querySelector('.ubits-file-upload')) return;
        global.createFileUpload({
            containerId:'cc-sm-zip-fu-wrap', id:'cc-sm-zip-fu',
            title:'Paquete SCORM (.zip)', accept:'.zip,application/zip,application/x-zip-compressed',
            maxSizeMb:250, maxLabel:'250 MB', formats:'ZIP · Hasta 250 MB',
            onChange:function(file){
                _zipFile=file||null;
                var btn=document.getElementById('cc-sm-footer-cargar-zip');
                if (!file) { if(btn) btn.disabled=true; return; }
                var fu=document.getElementById('cc-sm-zip-fu');
                if (fu&&typeof global.fileUploadSetProgress==='function') {
                    var p=0, iv=setInterval(function(){
                        p+=6; global.fileUploadSetProgress(fu,p);
                        if(p>=100){ clearInterval(iv); setTimeout(function(){
                            if(typeof global.fileUploadClearProgress==='function') global.fileUploadClearProgress(fu);
                            if(typeof global.fileUploadSetSuccess==='function') global.fileUploadSetSuccess(fu,'Archivo listo.');
                            if(btn) btn.disabled=false;
                        },200); }
                    },80);
                } else { if(btn) btn.disabled=false; }
            }
        });
    }

    /* ══════════════════════════════════════
       EDICIÓN — lightbox (mismo patrón que pantalla completa SCORM)
    ══════════════════════════════════════ */
    function closeScormEditLightbox() {
        var lb = document.getElementById(EDIT_LIGHTBOX_ID);
        if (lb && lb.parentNode) lb.parentNode.removeChild(lb);
        if (window._ccScormEditLightboxKeydown) {
            document.removeEventListener('keydown', window._ccScormEditLightboxKeydown);
            window._ccScormEditLightboxKeydown = null;
        }
    }

    function openScormEditModal(pageKey) {
        var stored = _scormDataStore[pageKey];
        if (!stored) return;

        closeScormEditLightbox();

        var editHtml = generateScormHtml(stored.titulo, stored.slides, stored.color, true, false, pageKey, stored.logoDataUrl || '');

        var overlay = document.createElement('div');
        overlay.id = EDIT_LIGHTBOX_ID;
        overlay.className = 'cc-scorm-fs-overlay cc-scorm-fs-overlay--lightbox';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Editar presentación');

        var headBand = document.createElement('div');
        headBand.className = 'cc-scorm-lightbox__band cc-scorm-lightbox__band--head';
        var headInner = document.createElement('div');
        headInner.className = 'cc-scorm-lightbox__band-inner';
        var titleEl = document.createElement('p');
        titleEl.className = 'cc-scorm-fs-title';
        titleEl.textContent = 'Editar presentación';
        var closeBtn = document.createElement('button');
        closeBtn.id = 'cc-scorm-edit-close';
        closeBtn.type = 'button';
        closeBtn.className = 'ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only';
        closeBtn.setAttribute('aria-label', 'Cerrar');
        closeBtn.setAttribute('data-tooltip', 'Cerrar');
        closeBtn.setAttribute('data-tooltip-delay', '1000');
        closeBtn.innerHTML = '<i class="far fa-times"></i>';
        headInner.appendChild(titleEl);
        headInner.appendChild(closeBtn);
        headBand.appendChild(headInner);

        var main = document.createElement('div');
        main.className = 'cc-scorm-lightbox__main cc-scorm-fs-panel cc-scorm-fs-panel--edit-scorm';

        var body = document.createElement('div');
        body.className = 'cc-scorm-fs-body';
        var wrap = document.createElement('div');
        wrap.className = 'cc-scorm-edit-iframe-wrap';
        var iframe = document.createElement('iframe');
        iframe.id = 'cc-scorm-edit-iframe';
        iframe.className = 'cc-scorm-edit-iframe';
        iframe.setAttribute('allowfullscreen', 'allowfullscreen');
        iframe.srcdoc = editHtml;
        wrap.appendChild(iframe);
        body.appendChild(wrap);
        main.appendChild(body);

        var footBand = document.createElement('div');
        footBand.className = 'cc-scorm-lightbox__band cc-scorm-lightbox__band--foot';
        var footInner = document.createElement('div');
        footInner.className = 'cc-scorm-lightbox__band-inner cc-scorm-edit-lightbox__footer';
        footInner.innerHTML =
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-scorm-edit-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-scorm-edit-save"><span>Guardar</span></button>';
        footBand.appendChild(footInner);

        overlay.appendChild(headBand);
        overlay.appendChild(main);
        overlay.appendChild(footBand);
        document.body.appendChild(overlay);

        if (typeof initTooltip === 'function') {
            initTooltip('#cc-scorm-edit-close');
        }

        function onKey(e) {
            if (e.key === 'Escape') {
                closeCpPanel();
                closeScormEditLightbox();
            }
        }
        window._ccScormEditLightboxKeydown = onKey;
        document.addEventListener('keydown', onKey);

        closeBtn.addEventListener('click', function () {
            closeCpPanel();
            closeScormEditLightbox();
        });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeCpPanel();
                closeScormEditLightbox();
            }
        });

        var cancelBtn = footInner.querySelector('#cc-scorm-edit-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                closeCpPanel();
                closeScormEditLightbox();
            });
        }
        var saveBtn = footInner.querySelector('#cc-scorm-edit-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var ok = collectEditedSlides(pageKey, stored);
                closeCpPanel();
                if (!ok) {
                    if (typeof showToast === 'function') {
                        showToast('error', 'No se pudo guardar. Cierra y vuelve a abrir el editor.', { containerId: 'ubits-toast-container' });
                    }
                    return;
                }
                closeScormEditLightbox();
                if (typeof showToast === 'function') {
                    showToast('success', 'Cambios guardados exitosamente', { containerId: 'ubits-toast-container' });
                }
            });
        }
    }

    function rebuildStructuralFromDom(doc, newSlides) {
        doc.querySelectorAll('.sp-slide[data-idx]').forEach(function (el) {
            var idx = parseInt(el.getAttribute('data-idx'), 10);
            if (isNaN(idx) || !newSlides[idx]) return;
            var st = newSlides[idx].type;

            var imgEl = el.querySelector('img[data-sp-key$="-image"]');
            if (imgEl) {
                var src = imgEl.getAttribute('src');
                if (src) newSlides[idx].image = src;
            }

            if (st === 'timeline') {
                var items = [];
                el.querySelectorAll('.sp-tl-item').forEach(function (row) {
                    var lab = row.querySelector('.sp-tl-label');
                    var tit = row.querySelector('.sp-tl-title');
                    var bod = row.querySelector('.sp-tl-body');
                    items.push({
                        label: ((lab && lab.textContent) || '').trim(),
                        title: ((tit && tit.textContent) || '').trim(),
                        body: ((bod && bod.textContent) || '').trim()
                    });
                });
                if (items.length >= 2) newSlides[idx].items = items;
            }

            if (st === 'flashcards') {
                var cards = [];
                el.querySelectorAll('.sp-fc').forEach(function (fc) {
                    var f = fc.querySelector('.sp-fc-front span') || fc.querySelector('.sp-fc-front');
                    var b_ = fc.querySelector('.sp-fc-back span') || fc.querySelector('.sp-fc-back');
                    cards.push({
                        front: ((f && f.textContent) || '').trim(),
                        back: ((b_ && b_.textContent) || '').trim()
                    });
                });
                if (cards.length >= 2) newSlides[idx].cards = cards;
            }

            if (st === 'quiz_mc') {
                var qList = [];
                el.querySelectorAll('.sp-quiz-step').forEach(function (step) {
                    var qtext = step.querySelector('.sp-quiz-q');
                    var opts = [];
                    var correctIndex = 0;
                    var rows = step.querySelectorAll('.sp-quiz-opt-row');
                    if (rows.length) {
                        rows.forEach(function (row, oi) {
                            var inp = row.querySelector('input[type="radio"]');
                            var span = row.querySelector('.sp-quiz-opt-text');
                            opts.push(((span && span.textContent) || '').trim());
                            if (inp && inp.checked) correctIndex = oi;
                        });
                    } else {
                        step.querySelectorAll('.sp-quiz-opt').forEach(function (opt, oi) {
                            var lbl = opt.querySelector('.sp-quiz-opt-label');
                            opts.push(((lbl && lbl.textContent) || opt.textContent || '').trim());
                            if (opt.getAttribute('data-correct') === '1') correctIndex = oi;
                        });
                    }
                    qList.push({
                        question: ((qtext && qtext.textContent) || '').trim(),
                        options: opts,
                        correctIndex: correctIndex
                    });
                });
                if (qList.length) newSlides[idx].questions = qList;
            }

            if (st === 'match') {
                var list = el.querySelector('.sp-match-pair-list');
                var left = [];
                var right = [];
                var pairs = [];
                if (list) {
                    list.querySelectorAll('.sp-match-pair-row').forEach(function (row) {
                        var il = row.querySelector('.sp-match-inp-l');
                        var ir = row.querySelector('.sp-match-inp-r');
                        if (!il || !ir) return;
                        var a = String(il.value || '').trim();
                        var b = String(ir.value || '').trim();
                        if (!a || !b) return;
                        var li = left.indexOf(a);
                        if (li < 0) {
                            left.push(a);
                            li = left.length - 1;
                        }
                        var ri = right.indexOf(b);
                        if (ri < 0) {
                            right.push(b);
                            ri = right.length - 1;
                        }
                        pairs.push([li, ri]);
                    });
                }
                if (pairs.length >= 2) {
                    newSlides[idx].left = left;
                    newSlides[idx].right = right;
                    newSlides[idx].pairs = pairs;
                }
            }

            if (st === 'media') {
                var pinEls = el.querySelectorAll('.sp-hotspot-pin');
                if (pinEls.length) {
                    var hotsCollected = [];
                    pinEls.forEach(function (pin, hi) {
                        var x = 50;
                        var y = 50;
                        var dx = pin.getAttribute('data-sp-hs-x');
                        var dy = pin.getAttribute('data-sp-hs-y');
                        if (dx != null && dx !== '') {
                            x = parseFloat(dx);
                        } else {
                            var stl = pin.getAttribute('style') || '';
                            var mx = stl.match(/left:\s*([\d.]+)%/);
                            if (mx) x = parseFloat(mx[1]);
                        }
                        if (dy != null && dy !== '') {
                            y = parseFloat(dy);
                        } else {
                            var stl2 = pin.getAttribute('style') || '';
                            var my = stl2.match(/top:\s*([\d.]+)%/);
                            if (my) y = parseFloat(my[1]);
                        }
                        var existing = (newSlides[idx].hotspots && newSlides[idx].hotspots[hi]) || {};
                        hotsCollected.push({
                            x: Math.max(5, Math.min(95, x)),
                            y: Math.max(5, Math.min(95, y)),
                            title: existing.title || '',
                            body: existing.body || ''
                        });
                    });
                    newSlides[idx].hotspots = hotsCollected;
                }
            }

            if (st === 'content') {
                var ulc = el.querySelector('.sp-slide-card > ul.sp-ed-ul');
                if (ulc) {
                    var bsC = [];
                    ulc.querySelectorAll(':scope > li').forEach(function (li) {
                        bsC.push((li.textContent || '').trim());
                    });
                    if (bsC.length >= 2) newSlides[idx].bullets = bsC;
                }
            }

            if (st === 'steps') {
                var bsS = [];
                el.querySelectorAll('.sp-steps-list .sp-step-text').forEach(function (t) {
                    bsS.push((t.textContent || '').trim());
                });
                if (bsS.length >= 2) newSlides[idx].bullets = bsS;
            }

            if (st === 'summary') {
                var bsU = [];
                el.querySelectorAll('.sp-sum-list > li').forEach(function (li) {
                    var sp = li.querySelector('span');
                    bsU.push((sp ? sp.textContent : li.textContent || '').trim());
                });
                if (bsU.length >= 2) newSlides[idx].bullets = bsU;
            }

            if (st === 'accordion') {
                var accCollected = [];
                el.querySelectorAll('.sp-acc-list > .sp-acc-item').forEach(function (dab) {
                    var titA = dab.querySelector('.sp-acc-title');
                    var bodA = dab.querySelector('.sp-acc-body');
                    accCollected.push({
                        title: ((titA && titA.textContent) || '').trim(),
                        body: ((bodA && bodA.textContent) || '').trim()
                    });
                });
                if (accCollected.length >= 2) newSlides[idx].items = accCollected;
            }

            if (st === 'tabs') {
                var shellT = el.querySelector('.sp-tabs-shell');
                if (shellT) {
                    var tabsCollected = [];
                    var btnsT = shellT.querySelectorAll('.sp-tab-bar .sp-tab-btn');
                    var pnsT = shellT.querySelectorAll('.sp-tab-panels .sp-tab-panel');
                    for (var tj = 0; tj < btnsT.length; tj++) {
                        var labE = btnsT[tj].querySelector('span');
                        var pEl = pnsT[tj];
                        var bEl = pEl ? pEl.querySelector('.sp-tab-body') : null;
                        tabsCollected.push({
                            label: ((labE && labE.textContent) || '').trim(),
                            body: ((bEl && bEl.textContent) || '').trim()
                        });
                    }
                    if (tabsCollected.length >= 2 && tabsCollected.length <= 3) {
                        newSlides[idx].tabs = tabsCollected;
                    }
                }
            }
        });
    }

    function collectEditedSlides(pageKey, stored) {
        var iframe=document.getElementById('cc-scorm-edit-iframe');
        if (!iframe||!iframe.contentDocument) return false;
        var doc=iframe.contentDocument;

        /* Leer campos editados */
        var newSlides=JSON.parse(JSON.stringify(stored.slides));
        doc.querySelectorAll('[data-sp-key]').forEach(function(el){
            var key=el.getAttribute('data-sp-key');
            var parts=key.split('-');
            if (parts.length<3||parts[0]!=='slide') return;
            var idx=parseInt(parts[1],10);
            if (isNaN(idx) || !newSlides[idx]) return;
            var field=parts.slice(2).join('-');
            if (el.tagName === 'IMG') return;

            var text = '';
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                text = String(el.value || '').trim();
            } else if (el.tagName === 'SELECT') {
                var so = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
                text = so ? String(so.value || so.textContent || '').trim() : '';
            } else {
                text = String(el.textContent || '').trim();
            }

            if (field === 'tagLabel') {
                newSlides[idx].tagLabel = text;
                return;
            }

            if (field.indexOf('bullet-')===0) {
                var bi=parseInt(field.replace('bullet-',''),10);
                if (!newSlides[idx].bullets) newSlides[idx].bullets=[];
                newSlides[idx].bullets[bi]=text;
                return;
            }

            var mItem = field.match(/^item-(\d+)-(title|body)$/);
            if (mItem) {
                var ii = parseInt(mItem[1],10);
                if (!newSlides[idx].items) newSlides[idx].items = [];
                if (!newSlides[idx].items[ii]) newSlides[idx].items[ii] = {};
                newSlides[idx].items[ii][mItem[2]] = text;
                return;
            }

            var mTab = field.match(/^tab-(\d+)-(label|body)$/);
            if (mTab) {
                var ti = parseInt(mTab[1],10);
                if (!newSlides[idx].tabs) newSlides[idx].tabs = [];
                if (!newSlides[idx].tabs[ti]) newSlides[idx].tabs[ti] = {};
                if (mTab[2] === 'label') newSlides[idx].tabs[ti].label = text;
                else newSlides[idx].tabs[ti].body = text;
                return;
            }

            var mCard = field.match(/^card-(\d+)-(front|back)$/);
            if (mCard) {
                var ci = parseInt(mCard[1],10);
                if (!newSlides[idx].cards) newSlides[idx].cards = [];
                if (!newSlides[idx].cards[ci]) newSlides[idx].cards[ci] = {};
                newSlides[idx].cards[ci][mCard[2]] = text;
                return;
            }

            var mHs = field.match(/^hs-(\d+)-(title|body)$/);
            if (mHs) {
                var hsi = parseInt(mHs[1], 10);
                if (!newSlides[idx].hotspots) newSlides[idx].hotspots = [];
                if (!newSlides[idx].hotspots[hsi]) newSlides[idx].hotspots[hsi] = { x: 50, y: 50, title: '', body: '' };
                newSlides[idx].hotspots[hsi][mHs[2]] = text;
                return;
            }

            var mTl = field.match(/^tl-(\d+)-(label|title|body)$/);
            if (mTl) {
                var li = parseInt(mTl[1],10);
                if (!newSlides[idx].items) newSlides[idx].items = [];
                if (!newSlides[idx].items[li]) newSlides[idx].items[li] = {};
                newSlides[idx].items[li][mTl[2]] = text;
                return;
            }

            var mLeft = field.match(/^left-(\d+)$/);
            if (mLeft && newSlides[idx].left) {
                newSlides[idx].left[parseInt(mLeft[1],10)] = text;
                return;
            }
            var mRight = field.match(/^right-(\d+)$/);
            if (mRight && newSlides[idx].right) {
                newSlides[idx].right[parseInt(mRight[1],10)] = text;
                return;
            }

            var mCrow = field.match(/^crow-(\d+)-(left|right)$/);
            if (mCrow && newSlides[idx].rows) {
                var cri = parseInt(mCrow[1], 10);
                if (!newSlides[idx].rows[cri]) newSlides[idx].rows[cri] = {};
                newSlides[idx].rows[cri][mCrow[2]] = text;
                return;
            }

            var mQq = field.match(/^q-(\d+)-question$/);
            if (mQq && newSlides[idx].questions) {
                var qqi = parseInt(mQq[1], 10);
                if (!newSlides[idx].questions[qqi]) newSlides[idx].questions[qqi] = {};
                newSlides[idx].questions[qqi].question = text;
                return;
            }
            var mQopt = field.match(/^q-(\d+)-opt-(\d+)$/);
            if (mQopt && newSlides[idx].questions) {
                var qqi2 = parseInt(mQopt[1], 10);
                var ooi = parseInt(mQopt[2], 10);
                if (!newSlides[idx].questions[qqi2]) newSlides[idx].questions[qqi2] = {};
                if (!newSlides[idx].questions[qqi2].options) newSlides[idx].questions[qqi2].options = [];
                newSlides[idx].questions[qqi2].options[ooi] = text;
                return;
            }

            var mOpt = field.match(/^opt-(\d+)$/);
            if (mOpt && newSlides[idx].options) {
                newSlides[idx].options[parseInt(mOpt[1],10)] = text;
                return;
            }

            newSlides[idx][field]=text;
        });

        rebuildStructuralFromDom(doc, newSlides);

        /* Leer color actual del iframe */
        var newColor=doc.documentElement.style.getPropertyValue('--accent').trim()||stored.color;

        /* Regenerar */
        var newHtml=generateScormHtml(stored.titulo, newSlides, newColor, false, false, null, stored.logoDataUrl || '');
        _scormDataStore[pageKey] = {
            slides: newSlides,
            color: newColor,
            titulo: stored.titulo,
            scormHtml: newHtml,
            logoDataUrl: stored.logoDataUrl || null,
            generatedByAi: !!stored.generatedByAi
        };

        var blockHtml = buildRenderedBlock(newHtml, pageKey);
        if (_onScormReady) _onScormReady(blockHtml);
        else {
            var mount=document.getElementById('crear-contenido-recursos-resources-mount');
            if (mount) mount.innerHTML=blockHtml;
        }
        emitChanged({type:'scorm',pageKey:pageKey,source:'edit'});
        return true;
    }

    /* ══════════════════════════════════════
       OPEN MODAL PRINCIPAL
    ══════════════════════════════════════ */
    function openScormRecursoModal(opts) {
        _onScormReady   = (opts&&opts.onScormReady)||null;
        _currentPageKey = (opts&&opts.pageKey)||null;
        _currentTab     = 'ia';
        _zipFile        = null;
        _pendingFiles   = [];
        _pendingImgs    = [];
        _logoDataUrl    = null;

        var stored=_currentPageKey?_scormDataStore[_currentPageKey]:null;
        _color          = stored ? stored.color : '#0C5BEF';
        _titulo         = stored ? stored.titulo : '';
        _logoDataUrl    = stored && stored.logoDataUrl ? stored.logoDataUrl : null;
        if (stored && stored.enabledSlideTypes) {
            _enabledSlideTypes = normalizeEnabledSlideTypes(stored.enabledSlideTypes);
        } else if (stored && stored.slides && stored.slides.length) {
            var inferred = createDefaultEnabledSlideTypes();
            SCORM_SLIDE_TYPE_CATALOG.forEach(function (item) {
                inferred[item.type] = false;
            });
            stored.slides.forEach(function (sl) {
                if (sl && sl.type) inferred[sl.type] = true;
            });
            inferred.intro = true;
            _enabledSlideTypes = inferred;
        } else {
            _enabledSlideTypes = createDefaultEnabledSlideTypes();
        }
        _tituloInputApi = null;
        _smContextIaInputApi = null;

        var overlay=openModal({
            overlayId:           OVERLAY_ID,
            title:               'Agregar SCORM',
            bodyHtml:            buildModalBody(),
            footerHtml:          buildModalFooterHtml(),
            size:                'lg',
            closeOnOverlayClick: false,
            variant:             'ia',
            iaTokensRemaining:   getTokens(),
            iaTokensBadgeId:     'cc-scorm-modal-tokens-badge',
            iaTokensTooltip:     'Tokens restantes',
            onClose: function () {
                var el = document.getElementById(OVERLAY_ID);
                if (el) unwireScormModalLayout(el);
            }
        });
        if (overlay) {
            applyAiModalChrome(overlay);
            wireScormModalLayout(overlay);
        }

        setTimeout(function(){
            initTituloInput();
            initSlideTypeSelector();
            initScormLogoUpload();
            initSmContextIaInput();
            wireTabBar();
            wireIaPanel();
            wireFooter();
            refreshPreview();
            /* Estado inicial: SCORM con IA = modal ancho lg; Subir .zip = compacto (cc-sm--compact). */
            switchToTab(_currentTab || 'ia');
        },0);
    }

    /* ══════════════════════════════════════
       GENERACIÓN + WIDGET UNIFICADO
    ══════════════════════════════════════ */
    function startScormWidget(job) {
        var jobId = (job.pageKey || 'scorm') + '-scorm';

        if (typeof global.ccGenWidget !== 'undefined') {
            global.ccGenWidget.addJob(jobId, { type: 'scorm', label: job.titulo || 'SCORM', pageKey: job.pageKey });
        }

        var innerLoader = typeof global.getIaLoaderHTML === 'function'
            ? global.getIaLoaderHTML({ label: 'Generando presentación' })
            : '<p role="status" aria-live="polite">Generando presentación…</p>';
        if (_onScormReady) _onScormReady('<div class="cc-scorm-ia-loader-host">' + innerLoader + '</div>');

        setTimeout(function () {
            var blockHtml = buildRenderedBlock(job.scormHtml, job.pageKey, { aiGenerated: true });
            if (_onScormReady) { _onScormReady(blockHtml); _onScormReady = null; }
            if (typeof global.ccGenWidget !== 'undefined') global.ccGenWidget.finishJob(jobId);
            updateScormIndexIcon(job.pageKey);
            emitChanged({ type: 'scorm', pageKey: job.pageKey, source: 'ai' });
        }, 6000);
    }

    function updateScormIndexIcon(pageKey) {
        if (!pageKey) return;
        var item = document.querySelector('[data-paginas-creator-key="' + pageKey + '"]');
        if (!item) return;
        if (typeof global.setPaginasCreatorItemTipo === 'function') {
            global.setPaginasCreatorItemTipo(item, 'scorm');
        }
    }

    /* ══════════════════════════════════════
       PUBLIC API
    ══════════════════════════════════════ */
    global.openScormRecursoModal = openScormRecursoModal;
    global.openScormEditModal    = openScormEditModal;
    global.ccScormDataStore      = _scormDataStore;

    /** Genera HTML SCORM listo para descargar (standalone + imágenes embebidas si aplica). */
    global.ccScormPrepareDownloadHtml = function (pageKey, done, opts) {
        if (typeof done !== 'function') return;
        opts = opts || {};
        var pk = pageKey != null ? String(pageKey) : '';
        var stored = _scormDataStore[pk];
        if (stored && stored.slides && stored.slides.length) {
            var html = generateScormStandaloneDownloadHtml(
                stored.titulo || 'Presentación',
                stored.slides,
                stored.color || '#0C5BEF',
                stored.logoDataUrl || ''
            );
            ccScormInlineImagesForDownload(html, done);
            return;
        }
        var blockHtml = opts.blockHtml != null ? String(opts.blockHtml) : '';
        if (blockHtml) {
            ccScormResolveEmbeddedHtmlFromBlock(blockHtml, done);
            return;
        }
        done(null);
    };

    /** SCORM generado por IA ya renderizado (demo deep link). */
    global.ccScormBuildDemoAiRenderedBlock = function (pageKey, titulo) {
        var tit = titulo && String(titulo).trim() ? String(titulo).trim() : 'Presentación';
        var enabled = createDefaultEnabledSlideTypes();
        var slides = generateSlidesFromEnabled(enabled);
        var scormHtml = generateScormHtml(tit, slides, '#0C5BEF', false, false, null, '');
        var pk = pageKey != null ? String(pageKey) : '';
        if (pk) {
            _scormDataStore[pk] = {
                slides: slides,
                color: '#0C5BEF',
                titulo: tit,
                scormHtml: scormHtml,
                logoDataUrl: null,
                enabledSlideTypes: normalizeEnabledSlideTypes(enabled),
                generatedByAi: true
            };
        }
        return buildRenderedBlock(scormHtml, pk || null, { aiGenerated: true });
    };

}(window));
