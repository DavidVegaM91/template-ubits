/* ========================================
   IA PANEL COMPONENT
   Sidebar anclado a la derecha, redimensionable con el mouse.
   ========================================

   API PÚBLICA:
   ------------
   initIAPanel(options)          — Inicializa e inyecta el panel (una sola vez)
   openIAPanel()                 — Abre el panel
   closeIAPanel()                — Cierra el panel
   addIAPanelMessage(text, type, attachments?, opts?) — Agrega mensaje ('user' | 'ai').
     opts (solo type ai): { richHtml: string, hideAiCopy?: boolean } — HTML del globo (sin streaming).
   showIAPanelTyping()           — Muestra “Pensando” (con ia-chat-streaming.js) → retorna removeTyping()
   clearIAPanelMessages()        — Limpia mensajes, restaura bienvenida
   setIAPanelTitle(title)        — Cambia título en tiempo real
   setIAPanelTokensBadgeValue(n) — Actualiza el número del badge de tokens en cabecera (si existe)
   setIAPanelAlternateMount(mount|null) — Mensajes / typing / bottom-sheet / envío usan nodos alternativos (p. ej. chat dentro de un modal). mount: { messages, scroll?, welcome?, chatBody?, inputArea?, inputEl?, sendBtn?, typingId?, tooltipRoot? }
   openIAPanelArtifactView(html, opts?) — Superpone el detalle de un artifact (opts.title en cabecera; oculta tokens/cierre; muestra «Atrás»).
   closeIAPanelArtifactView()    — Vuelve al chat del panel (restaura cabecera).
   destroyIAPanel()              — Desmonta el panel del DOM

   OPCIONES (initIAPanel):
   -----------------------
   title, agentLabel, placeholder, disclaimer,
   welcomeTitle, welcomeSubtitle,
   tokensBadge — true (por defecto): badge IA de tokens junto al cierre; false lo oculta;
     u objeto { value, tooltip, ariaLabel } para personalizar (p. ej. value: 50).
   Requiere CSS: badge-tag.css + general-styles/ubits-ia-appearance.css; tooltip.js + tooltip.css para el hover.
  onSend(text) — tras insertar el mensaje del usuario (y el «Pensando» si hay ia-chat-streaming); solo respuesta / backend, no duplicar 'user',
  onAttach(), onClose(),
  dockDesktop, dockContainerSelector, dockBreakpoint

   CSS recomendado (misma pila que Modo estudio / Chat IA grupos):
   button.css → chip.css (adjuntos: chips en preview y en mensajes; sin chip.css se ven sin estilo)
   → ubits-ia-appearance.css → badge-tag.css → tooltip.css → ubits-ia-chat.css → ia-panel.css
   (+ tooltip.js antes de ia-panel.js si usas el badge de tokens en cabecera).
   ======================================== */

// ---------------------------------------------------------------------------
// Ícono del empty state (welcome) — FontAwesome sparkles con gradiente IA
// ---------------------------------------------------------------------------
const _IA_PANEL_WELCOME_ICON = '<i class="far fa-sparkles"></i>';

// ---------------------------------------------------------------------------
// Estado interno
// ---------------------------------------------------------------------------
let _iaPanel = {
    inited:  false,
    open:    false,
    options: {},
    width:   null,   // ancho actual (px)
    lastUserMessage: '',
    pendingImages: [],
    pendingFiles: [],
    rootEl: null,
    resizeHandler: null,
    originalParent: null,
    artifactOpen: false,
    titleBeforeArtifact: '',
    alternateMount: null,
    iaInputApi: null,
};

/** Alinea el scroll del panel con ubits-ia-chat (máscara superior solo en conversación). */
function _iaPanelSyncScrollFade() {
    var mount = _iaPanelResolveMount({});
    var scroll = mount.scroll;
    var messages = mount.messages;
    if (!scroll || !messages) return;
    var visible = window.getComputedStyle(messages).display !== 'none';
    if (visible) scroll.classList.add('ia-panel__chat-scroll--conversation');
    else scroll.classList.remove('ia-panel__chat-scroll--conversation');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function _aiTime() {
    return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function _aiFormatMsgTimeLabel(d) {
    if (window.UbitsIaChatTime && typeof window.UbitsIaChatTime.formatMessageTimeLabel === 'function') {
        return window.UbitsIaChatTime.formatMessageTimeLabel(d);
    }
    return _aiTime();
}

function _aiEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _aiEl(id) { return document.getElementById(id); }

/** Normaliza el objeto mount para mensajes/input/bottom-sheet fuera del panel (p. ej. modal). */
function _normalizeIaPanelMount(m) {
    if (!m || !m.messages) return null;
    return {
        welcome: m.welcome || null,
        messages: m.messages,
        scroll: m.scroll || null,
        chatBody: m.chatBody || null,
        inputArea: m.inputArea || null,
        inputEl: m.inputEl || null,
        sendBtn: m.sendBtn || null,
        typingId: m.typingId || 'ia-panel-typing',
        tooltipRoot: m.tooltipRoot || '#ia-panel',
    };
}

/** Prioridad: opts.mount → alternateMount global → DOM del panel por defecto */
function _iaPanelResolveMount(opts) {
    opts = opts || {};
    var raw = opts.mount || _iaPanel.alternateMount || null;
    var m = _normalizeIaPanelMount(raw);
    if (m) return m;
    return {
        welcome: _aiEl('ia-panel-welcome'),
        messages: _aiEl('ia-panel-messages'),
        scroll: _aiEl('ia-panel-scroll'),
        chatBody: _aiEl('ia-panel-body'),
        inputArea: _aiEl('ia-panel-input-area'),
        inputEl: (_iaPanel.iaInputApi && typeof _iaPanel.iaInputApi.getTextarea === 'function'
            ? _iaPanel.iaInputApi.getTextarea()
            : _aiEl('ia-panel-input')),
        sendBtn: null,
        typingId: 'ia-panel-typing',
        tooltipRoot: '#ia-panel',
    };
}

/** Enlace opcional del chat IA a contenedores fuera del panel (cerrar modal → pasar null). */
function setIAPanelAlternateMount(mount) {
    _iaPanel.alternateMount = mount && mount.messages ? mount : null;
}

function _defaultIaDisclaimerText() {
    return (typeof window !== 'undefined' && window.UbitsIaChatDisclaimer && window.UbitsIaChatDisclaimer.DEFAULT_TEXT)
        || 'El agente puede cometer errores; verifica la información.';
}

function _aiCopyText(text) {
    if (!text) return;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).catch(function() {});
        return;
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
}

function _iaPanelFormatTokensBadgeNumber(value) {
    var n = Number(value);
    if (!isFinite(n) || n < 0) n = 0;
    if (typeof window.formatCounterNumber === 'function') {
        return window.formatCounterNumber(n);
    }
    return n.toLocaleString('en-US');
}

function _iaPanelTokensBadgeAriaLabel(value) {
    return _iaPanelFormatTokensBadgeNumber(value) + ' tokens restantes';
}

// ---------------------------------------------------------------------------
// Badge de tokens (cabecera, a la izquierda del cierre) — mismo patrón que modal IA portada
// ---------------------------------------------------------------------------
function _iaPanelTokensBadgeHtml(o) {
    var cfg = o.tokensBadge;
    if (cfg === false) return '';
    var defaults = { value: 50, tooltip: 'Número de tokens restantes.', ariaLabel: '' };
    var merged = defaults;
    if (cfg && typeof cfg === 'object') {
        merged = Object.assign({}, defaults, cfg);
    }
    var num = merged.value != null ? merged.value : 50;
    var tip = merged.tooltip != null ? merged.tooltip : defaults.tooltip;
    var aria =
        merged.ariaLabel != null && merged.ariaLabel !== ''
            ? merged.ariaLabel
            : _iaPanelTokensBadgeAriaLabel(num);
    return (
        '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs ia-panel__tokens-badge" id="ia-panel-tokens-badge" tabindex="0" ' +
        'data-tooltip="' +
        _aiEscape(tip) +
        '" data-tooltip-delay="0" data-tooltip-tap-toggle aria-label="' +
        _aiEscape(aria) +
        '">' +
        '<span class="ubits-badge-tag__token-cost" aria-hidden="true">' +
        '<i class="far fa-coin-vertical"></i>' +
        '<span class="ubits-badge-tag__token-number">' +
        _aiEscape(_iaPanelFormatTokensBadgeNumber(num)) +
        '</span>' +
        '</span></span>'
    );
}

function _iaPanelInitTokensBadgeTooltip() {
    var cfg = _iaPanel.options.tokensBadge;
    if (cfg === false) return;
    if (typeof window.initTooltip !== 'function') return;
    window.setTimeout(function () {
        var el = _aiEl('ia-panel-tokens-badge');
        if (el) window.initTooltip('#ia-panel-tokens-badge');
    }, 0);
}

// ---------------------------------------------------------------------------
// HTML del panel
// ---------------------------------------------------------------------------
function _buildIAPanelHTML(o) {
    const title       = o.title       || 'IA';
    const agentLabel  = o.agentLabel  || '';
    const placeholder = o.placeholder || '¿Cómo puedo ayudarte hoy?';
    const disclaimer  = o.disclaimer  || _defaultIaDisclaimerText();
    const wTitle      = o.welcomeTitle    || title;
    const wSubtitle   = o.welcomeSubtitle || '¿En qué puedo ayudarte hoy?';

    return `
<div class="ia-panel" id="ia-panel" role="dialog" aria-modal="false" aria-label="${_aiEscape(title)}">

    <!-- Handle de resize -->
    <div class="ia-panel__resize-handle" id="ia-panel-resize"></div>

    <!-- Header -->
    <header class="ia-panel__header">
        <div class="ia-panel__hdr-leading">
            <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only ia-panel__hdr-back" id="ia-panel-hdr-back" aria-label="Volver al chat">
                <i class="far fa-chevron-left"></i>
            </button>
        </div>
        <div class="ia-panel__header-text">
            <h2 class="ia-panel__title" id="ia-panel-title">${_aiEscape(title)}</h2>
        </div>
        <div class="ia-panel__header-actions" id="ia-panel-header-actions">
            ${_iaPanelTokensBadgeHtml(o)}
            <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" id="ia-panel-close-btn" title="Cerrar panel" aria-label="Cerrar">
                <i class="far fa-xmark"></i>
            </button>
        </div>
    </header>

    <!-- Body -->
    <div class="ia-panel__body" id="ia-panel-body">

        <div class="ia-panel__main-stack" id="ia-panel-main-stack">
        <!-- Chat: capa inferior; el artifact se superpone visualmente -->
        <div class="ia-panel__chat-shell" id="ia-panel-chat-shell">
        <!-- Contenedor con gradiente y border-radius (la "card" del chat) -->
        <div class="ia-panel__chat-container">

            <!-- Zona scrollable: bienvenida o mensajes -->
            <div class="ia-panel__chat-scroll" id="ia-panel-scroll">

                <!-- Bienvenida (sin mensajes) -->
                <div class="ia-panel__welcome" id="ia-panel-welcome">
                    <div class="ia-panel__welcome-icon" aria-hidden="true">${_IA_PANEL_WELCOME_ICON}</div>
                    <p class="ia-panel__welcome-subtitle">${_aiEscape(wSubtitle)}</p>
                </div>

                <!-- Mensajes -->
                <div class="ia-panel__messages" id="ia-panel-messages" style="display:none;"></div>

            </div>

            <!-- Input IA (createUbitsIAInput) -->
            <div class="ubits-ia-chat-thread__input-area" id="ia-panel-input-area">
                <div id="ia-panel-ia-input-mount"></div>
            </div>

        </div>
        </div>

        <div class="ia-panel__artifact-layer" id="ia-panel-artifact-layer" aria-hidden="true">
            <div class="ia-panel__artifact-scroll" id="ia-panel-artifact-scroll"></div>
        </div>
        </div>
    </div>

</div>`;
}

// ---------------------------------------------------------------------------
// initIAPanel
// ---------------------------------------------------------------------------
function initIAPanel(options) {
    if (_iaPanel.inited) return;
    _iaPanel.inited  = true;
    _iaPanel.options = Object.assign({
        title: 'IA', agentLabel: '', placeholder: '¿Cómo puedo ayudarte hoy?',
        disclaimer: _defaultIaDisclaimerText(),
        welcomeTitle: '', welcomeSubtitle: '',
        tokensBadge: true,
        onSend: null, onAttach: null, onClose: null,
        onRegenerate: null,
        dockDesktop: false,
        dockContainerSelector: '.dashboard-container',
        dockBreakpoint: 1024,
    }, options);

    // Inyectar en el DOM
    const root = document.createElement('div');
    root.id = 'ia-panel-root';
    root.innerHTML = _buildIAPanelHTML(_iaPanel.options);
    document.body.appendChild(root);
    _iaPanel.rootEl = root;
    _iaPanel.originalParent = document.body;

    _iaPanelBindEvents();
    _iaPanelInitIAInput();
    _iaPanelBindResize();
    _iaPanelSyncDockMode();
    _iaPanel.resizeHandler = _iaPanelSyncDockMode;
    window.addEventListener('resize', _iaPanel.resizeHandler);
    _iaPanelInitTokensBadgeTooltip();
    if (typeof window.initIaButtonSparkles === 'function') {
        window.initIaButtonSparkles(root);
    }
}

function _iaPanelSyncDockMode() {
    var panel = _aiEl('ia-panel');
    var root = _iaPanel.rootEl;
    if (!panel || !root) return;

    var shouldDock = !!_iaPanel.options.dockDesktop &&
        window.matchMedia('(min-width: ' + (_iaPanel.options.dockBreakpoint || 1024) + 'px)').matches;

    if (shouldDock) {
        var host = document.querySelector(_iaPanel.options.dockContainerSelector || '.dashboard-container');
        if (host && root.parentNode !== host) host.appendChild(root);
        root.classList.add('ia-panel-root--docked');
        panel.classList.add('ia-panel--docked-desktop');
        return;
    }

    if (root.parentNode !== _iaPanel.originalParent && _iaPanel.originalParent) {
        _iaPanel.originalParent.appendChild(root);
    }
    root.classList.remove('ia-panel-root--docked');
    panel.classList.remove('ia-panel--docked-desktop');
}

// ---------------------------------------------------------------------------
// Input IA (createUbitsIAInput)
// ---------------------------------------------------------------------------
function _iaPanelPendingImagesForApi() {
    return _iaPanel.pendingImages.map(function (src) {
        return { src: src, alt: 'Imagen adjunta' };
    });
}

function _iaPanelPendingFilesForApi() {
    return _iaPanel.pendingFiles.slice();
}

function _iaPanelSyncPendingToInput() {
    if (!_iaPanel.iaInputApi) return;
    _iaPanel.iaInputApi.setPendingImages(_iaPanelPendingImagesForApi());
    _iaPanel.iaInputApi.setPendingFiles(_iaPanelPendingFilesForApi());
}

function _iaPanelHandleAttachFiles(files) {
    if (!files || !files.length) return;
    var toLoad = 0;
    Array.prototype.forEach.call(files, function (f) {
        if (f.type && f.type.indexOf('image/') === 0) toLoad++;
    });
    var loaded = 0;
    Array.prototype.forEach.call(files, function (file) {
        if (file.type && file.type.indexOf('image/') === 0) {
            (function (f) {
                var reader = new FileReader();
                reader.onload = function () {
                    if (reader.result) _iaPanel.pendingImages.push(String(reader.result));
                    loaded++;
                    if (loaded >= toLoad) _iaPanelSyncPendingToInput();
                };
                reader.readAsDataURL(f);
            })(file);
        } else {
            _iaPanel.pendingFiles.push({ name: file.name, type: file.type, size: file.size });
        }
    });
    _iaPanelSyncPendingToInput();
    _iaPanelRefreshSendAction();
    if (typeof _iaPanel.options.onAttach === 'function') _iaPanel.options.onAttach();
}

function _iaPanelRefreshSendAction() {
    if (!_iaPanel.iaInputApi) return;
    var text = String(_iaPanel.iaInputApi.getValue() || '').trim();
    var hasAttachments =
        _iaPanel.pendingImages.length > 0 || _iaPanel.pendingFiles.length > 0;
    _iaPanel.iaInputApi.setActionDisabled(!text && !hasAttachments);
}

function _iaPanelInitIAInput() {
    var mount = _aiEl('ia-panel-ia-input-mount');
    if (!mount || typeof window.createUbitsIAInput !== 'function') return;
    if (_iaPanel.iaInputApi) {
        _iaPanel.iaInputApi.destroy();
        _iaPanel.iaInputApi = null;
    }
    mount.innerHTML = '';
    var o = _iaPanel.options || {};
    var disclaimer = o.disclaimer != null ? o.disclaimer : _defaultIaDisclaimerText();
    _iaPanel.iaInputApi = window.createUbitsIAInput({
        wrapInInputArea: false,
        variant: 'panel',
        id: 'ia-panel-input',
        inputBoxId: 'ia-panel-input-box',
        placeholder: o.placeholder || '¿Cómo puedo ayudarte hoy?',
        ariaLabel: 'Mensaje',
        autosizeMaxPx: 140,
        attach: true,
        attachAriaLabel: 'Adjuntar',
        attachTooltip: 'Adjuntar',
        pendingImages: _iaPanelPendingImagesForApi(),
        pendingFiles: _iaPanelPendingFilesForApi(),
        onAttachFiles: _iaPanelHandleAttachFiles,
        onRemovePendingImage: function (i) {
            _iaPanel.pendingImages.splice(i, 1);
            _iaPanelSyncPendingToInput();
            _iaPanelRefreshSendAction();
        },
        onRemovePendingFile: function (i) {
            _iaPanel.pendingFiles.splice(i, 1);
            _iaPanelSyncPendingToInput();
            _iaPanelRefreshSendAction();
        },
        action: {
            type: 'send',
            ariaLabel: 'Enviar mensaje',
            disabled: true,
            onClick: _iaPanelSend,
        },
        onEnterSubmit: _iaPanelSend,
        onChange: _iaPanelRefreshSendAction,
        disclaimer: disclaimer,
    }).mount(mount);
    if (typeof window.initIaButtonSparkles === 'function') {
        window.initIaButtonSparkles(mount);
    }
    if (typeof window.initTooltip === 'function') {
        window.initTooltip('#ia-panel [data-tooltip]');
    }
    _iaPanelRefreshSendAction();
}

function _iaPanelSetInputDisabled(disabled) {
    if (!_iaPanel.alternateMount && _iaPanel.iaInputApi) {
        _iaPanel.iaInputApi.setDisabled(disabled);
        if (disabled) _iaPanel.iaInputApi.setActionDisabled(true);
        else _iaPanelRefreshSendAction();
        return;
    }
    var mount = _iaPanelResolveMount({});
    if (mount.inputEl) mount.inputEl.disabled = disabled;
    if (mount.sendBtn) mount.sendBtn.disabled = disabled;
}

// ---------------------------------------------------------------------------
// Eventos de interacción
// ---------------------------------------------------------------------------
function _iaPanelEnsureInputInteractive() {
    if (!_iaPanel.alternateMount && _iaPanel.iaInputApi) {
        _iaPanel.iaInputApi.setDisabled(false);
        _iaPanelRefreshSendAction();
        return;
    }
    var mount = _iaPanelResolveMount({});
    var input = mount.inputEl || _aiEl('ia-panel-input');
    if (!input) return;
    input.disabled = false;
    input.removeAttribute('readonly');
    input.removeAttribute('aria-disabled');
    input.style.pointerEvents = '';
    input.style.opacity = '';
}

function _iaPanelBindEvents() {
    // Cerrar
    var closeBtn = _aiEl('ia-panel-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeIAPanel);

    var backBtn = _aiEl('ia-panel-hdr-back');
    if (backBtn) backBtn.addEventListener('click', function () {
        if (_iaPanel.artifactOpen) closeIAPanelArtifactView();
    });

    // Escape: primero cierra la vista artifact; si no, cierra el panel
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape' || !_iaPanel.open) return;
        if (_iaPanel.artifactOpen) {
            e.preventDefault();
            closeIAPanelArtifactView();
            return;
        }
        closeIAPanel();
    });

    // Acciones en mensajes IA (delegación)
    var messages = _aiEl('ia-panel-messages');
    if (messages) {
        messages.addEventListener('click', function(e) {
            var actionBtn = e.target.closest('[data-ia-panel-action]');
            if (!actionBtn) return;
            var action = actionBtn.getAttribute('data-ia-panel-action');
            var msgRoot = actionBtn.closest('.ia-panel__msg');
            var msgText = msgRoot ? (msgRoot.getAttribute('data-ai-text') || '') : '';

            if (action === 'copy') {
                _aiCopyText(msgText);
                return;
            }

        });
    }
}

function _buildIAPanelAttachmentsHtml(images, files) {
    var imagesHtml = (images || []).map(function(src) {
        return '<img src="' + _aiEscape(src) + '" alt="Imagen adjunta" class="ia-panel__msg-attachment-img" />';
    }).join('');
    var filesHtml = (files || []).map(function(f) {
        return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ia-panel__msg-file-chip"><i class="far fa-file-lines"></i><span class="ubits-chip__text">' + _aiEscape((f && f.name) ? f.name : 'Archivo') + '</span></span>';
    }).join('');
    var out = '';
    if (imagesHtml) out += '<div class="ia-panel__msg-attachments-images">' + imagesHtml + '</div>';
    if (filesHtml) out += '<div class="ia-panel__msg-attachments-files">' + filesHtml + '</div>';
    return out;
}

function _renderIAPanelPendingImages() {
    var strip = _aiEl('ia-panel-pending-images');
    if (!strip) return;
    if (!_iaPanel.pendingImages.length) {
        strip.innerHTML = '';
        strip.style.display = 'none';
        return;
    }
    strip.style.display = 'flex';
    strip.innerHTML = _iaPanel.pendingImages.map(function(src, idx) {
        return '<div class="ia-panel__pending-img-wrap">' +
            '<img src="' + _aiEscape(src) + '" alt="Imagen adjunta" class="ia-panel__pending-img" />' +
            '<button type="button" class="ia-panel__pending-img-remove" data-idx="' + idx + '" aria-label="Eliminar imagen"><i class="far fa-times"></i></button>' +
            '</div>';
    }).join('');
    strip.querySelectorAll('.ia-panel__pending-img-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = Number(btn.getAttribute('data-idx'));
            if (isNaN(idx)) return;
            _iaPanel.pendingImages.splice(idx, 1);
            _renderIAPanelPendingImages();
        });
    });
}

function _renderIAPanelPendingFiles() {
    var strip = _aiEl('ia-panel-pending-files');
    if (!strip) return;
    if (!_iaPanel.pendingFiles.length) {
        strip.innerHTML = '';
        strip.style.display = 'none';
        return;
    }
    strip.style.display = 'flex';
    strip.innerHTML = _iaPanel.pendingFiles.map(function(f, idx) {
        return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close ia-panel__pending-file-chip">' +
            '<i class="far fa-file-lines"></i><span class="ubits-chip__text">' + _aiEscape((f && f.name) ? f.name : 'Archivo') + '</span>' +
            '<button type="button" class="ubits-chip__close ia-panel__pending-file-remove" data-idx="' + idx + '" aria-label="Quitar archivo"><i class="far fa-times"></i></button>' +
            '</span>';
    }).join('');
    strip.querySelectorAll('.ia-panel__pending-file-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = Number(btn.getAttribute('data-idx'));
            if (isNaN(idx)) return;
            _iaPanel.pendingFiles.splice(idx, 1);
            _renderIAPanelPendingFiles();
        });
    });
}

function _iaPanelSend() {
    var mount = _iaPanelResolveMount({});
    var useApi = !_iaPanel.alternateMount && _iaPanel.iaInputApi;
    var text = useApi
        ? String(_iaPanel.iaInputApi.getValue() || '').trim()
        : mount.inputEl
          ? mount.inputEl.value.trim()
          : '';
    var hasAttachments = _iaPanel.pendingImages.length > 0 || _iaPanel.pendingFiles.length > 0;
    if (!text && !hasAttachments) return;
    addIAPanelMessage(text || 'Adjuntos', 'user', {
        images: _iaPanel.pendingImages.slice(),
        files: _iaPanel.pendingFiles.slice()
    });
    if (useApi) {
        _iaPanel.iaInputApi.setValue('');
        _iaPanel.iaInputApi.setPendingImages([]);
        _iaPanel.iaInputApi.setPendingFiles([]);
    } else if (mount.inputEl) {
        mount.inputEl.value = '';
        mount.inputEl.style.height = 'auto';
    }
    _iaPanel.pendingImages = [];
    _iaPanel.pendingFiles = [];
    _iaPanelRefreshSendAction();
    if (typeof _iaPanel.options.onSend !== 'function') return;

    var messages = mount.messages;
    if (window.UbitsIaChatStreaming && typeof window.UbitsIaChatStreaming.afterMinDelay === 'function' && messages) {
        messages.insertAdjacentHTML('beforeend', window.UbitsIaChatStreaming.thinkingIndicatorHtml('Pensando'));
        var thinkRow = messages.lastElementChild;
        if (thinkRow) thinkRow.id = mount.typingId;
        var scroll = mount.scroll;
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
        _iaPanelSyncScrollFade();
        var runAfterThink = function () {
            if (thinkRow && thinkRow.parentNode) thinkRow.remove();
            if (messages && window.UbitsIaChatStreaming.removeThinkingRows) {
                window.UbitsIaChatStreaming.removeThinkingRows(messages);
            }
            _iaPanelSyncScrollFade();
            try {
                var r = _iaPanel.options.onSend(text || 'Adjuntos');
                return r && typeof r.then === 'function' ? r : Promise.resolve(r);
            } catch (err) {
                return Promise.resolve();
            }
        };
        if (typeof window.UbitsIaChatStreaming.afterMinDelay === 'function') {
            window.UbitsIaChatStreaming.afterMinDelay(window.UbitsIaChatStreaming.MIN_THINKING_MS, runAfterThink).finally(function () {
                _iaPanelSyncScrollFade();
            });
        } else {
            setTimeout(function () {
                Promise.resolve(runAfterThink()).finally(function () {
                    _iaPanelSyncScrollFade();
                });
            }, window.UbitsIaChatStreaming.MIN_THINKING_MS || 1000);
        }
        return;
    }

    _iaPanel.options.onSend(text || 'Adjuntos');
}

// ---------------------------------------------------------------------------
// Resize con el mouse (arrastrar borde izquierdo)
// ---------------------------------------------------------------------------
function _iaPanelGetWidthMin_() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ia-panel-width-min'), 10) || 320;
}

/** Máximo del token CSS, acotado al viewport para no desbordar en pantallas estrechas. */
function _iaPanelGetWidthMax_() {
    var token = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ia-panel-width-max'), 10) || 720;
    return Math.min(token, Math.max(_iaPanelGetWidthMin_(), window.innerWidth - 16));
}

function _iaPanelBindResize() {
    var handle = _aiEl('ia-panel-resize');
    var panel  = _aiEl('ia-panel');
    if (!handle || !panel) return;

    var startX = 0;
    var startW = 0;

    function onMouseMove(e) {
        var dx = startX - e.clientX;            // cuánto se movió hacia la izquierda
        var newW = Math.min(
            Math.max(startW + dx, _iaPanelGetWidthMin_()),
            _iaPanelGetWidthMax_()
        );
        panel.style.width = newW + 'px';
        _iaPanel.width = newW;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup',  onMouseUp);
        document.body.classList.remove('ia-panel-resizing');
        panel.classList.remove('resizing');
    }

    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX;
        startW = panel.offsetWidth;
        document.body.classList.add('ia-panel-resizing');
        panel.classList.add('resizing');
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup',  onMouseUp);
    });

    // Touch support (móvil)
    handle.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startW = panel.offsetWidth;
        panel.classList.add('resizing');
    }, { passive: true });

    handle.addEventListener('touchmove', function(e) {
        var dx = startX - e.touches[0].clientX;
        var newW = Math.min(Math.max(startW + dx, _iaPanelGetWidthMin_()), _iaPanelGetWidthMax_());
        panel.style.width = newW + 'px';
        _iaPanel.width = newW;
    }, { passive: true });

    handle.addEventListener('touchend', function() {
        panel.classList.remove('resizing');
    });
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------
function openIAPanel() {
    if (!_iaPanel.inited) { console.warn('[IAPanel] Llama initIAPanel() primero.'); return; }
    var panel = _aiEl('ia-panel');
    if (panel) panel.classList.add('active');
    _iaPanel.open = true;
    if (panel && panel.classList.contains('ia-panel--docked-desktop')) {
        panel.style.width = (_iaPanel.width && _iaPanel.width > 0 ? _iaPanel.width : (parseInt(getComputedStyle(panel).getPropertyValue('--ia-panel-width-default'), 10) || 440)) + 'px';
    }
    setTimeout(function() {
        _iaPanelEnsureInputInteractive();
        if (_iaPanel.iaInputApi && typeof _iaPanel.iaInputApi.focus === 'function') {
            _iaPanel.iaInputApi.focus();
        } else {
            var input = _aiEl('ia-panel-input');
            if (input) input.focus();
        }
    }, 300);
}

function closeIAPanel() {
    if (_iaPanel.artifactOpen) closeIAPanelArtifactView();
    var panel = _aiEl('ia-panel');
    if (panel) panel.classList.remove('active');
    if (panel && panel.classList.contains('ia-panel--docked-desktop')) {
        panel.style.width = '0px';
    }
    _iaPanel.open = false;
    if (typeof _iaPanel.options.onClose === 'function') _iaPanel.options.onClose();
}

/**
 * Superpone el contenido de un artifact (HTML del tutor / detalle) sobre el chat.
 * @param {string} html - Markup a insertar en #ia-panel-artifact-scroll (p. ej. bloque .ubits-ia-chat-side__content).
 * @param {Object} [opts]
 * @param {string} [opts.title] - Título mostrado en la cabecera del panel mientras el artifact está abierto.
 */
function openIAPanelArtifactView(html, opts) {
    if (!_iaPanel.inited) { console.warn('[IAPanel] Llama initIAPanel() primero.'); return; }
    opts = opts || {};
    var panel = _aiEl('ia-panel');
    var layer = _aiEl('ia-panel-artifact-layer');
    var scroll = _aiEl('ia-panel-artifact-scroll');
    var titleEl = _aiEl('ia-panel-title');
    if (!panel || !layer || !scroll) return;

    if (!_iaPanel.artifactOpen && titleEl) {
        _iaPanel.titleBeforeArtifact = titleEl.textContent || '';
    }
    scroll.innerHTML = html || '';
    if (titleEl && opts.title != null && String(opts.title).length) {
        titleEl.textContent = opts.title;
    }
    panel.classList.add('ia-panel--artifact-open');
    layer.setAttribute('aria-hidden', 'false');
    var chatShell = _aiEl('ia-panel-chat-shell');
    if (chatShell) chatShell.setAttribute('aria-hidden', 'true');
    _iaPanel.artifactOpen = true;
    if (typeof opts.onAfterMount === 'function') {
        try { opts.onAfterMount(scroll); } catch (e) {}
    }
}

function _iaPanelRestoreArtifactOpenButtons() {
    var messages = _aiEl('ia-panel-messages');
    if (!messages) return;
    var rows = messages.querySelectorAll('.ubits-ia-chat-artifact-row[data-artifact-shows-open="1"]');
    for (var i = 0; i < rows.length; i++) {
        rows[i].classList.add('open-btn-visible');
    }
}

function closeIAPanelArtifactView() {
    var panel = _aiEl('ia-panel');
    var layer = _aiEl('ia-panel-artifact-layer');
    var scroll = _aiEl('ia-panel-artifact-scroll');
    var titleEl = _aiEl('ia-panel-title');
    if (!panel) return;
    panel.classList.remove('ia-panel--artifact-open');
    if (layer) layer.setAttribute('aria-hidden', 'true');
    var chatShell = _aiEl('ia-panel-chat-shell');
    if (chatShell) chatShell.removeAttribute('aria-hidden');
    if (scroll) scroll.innerHTML = '';
    if (titleEl && _iaPanel.titleBeforeArtifact != null) {
        titleEl.textContent = _iaPanel.titleBeforeArtifact;
    }
    _iaPanel.artifactOpen = false;
    _iaPanel.titleBeforeArtifact = '';
    _iaPanelRestoreArtifactOpenButtons();
}

function addIAPanelMessage(text, type, attachments, opts) {
    opts = opts || {};
    var mount = _iaPanelResolveMount(opts);
    var welcome = mount.welcome;
    var messages = mount.messages;
    if (!messages) return;

    if (welcome)  welcome.style.display  = 'none';
    messages.style.display = 'flex';

    var msgType = (type === 'user') ? 'user' : 'ai';
    var el = document.createElement('div');
    el.className = 'ia-panel__msg ia-panel__msg--' + msgType;
    if (msgType === 'user') {
        _iaPanel.lastUserMessage = String(text || '');
    }

    var sentAt = new Date();
    el.setAttribute('data-msg-at', sentAt.toISOString());
    var timeLabel = _aiEscape(_aiFormatMsgTimeLabel(sentAt));
    var copyBtn =
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" data-tooltip="Copiar" data-tooltip-delay="1000" data-ia-panel-action="copy" aria-label="Copiar">' +
            '<i class="far fa-copy"></i>' +
        '</button>';
    var showAiCopy = msgType === 'ai' && !opts.hideAiCopy;
    var footerHtml =
        '<div class="ia-panel__msg-footer ubits-ia-chat-thread__message-footer">' +
        '<span class="ia-panel__msg-time ubits-ia-chat-thread__timestamp">' + timeLabel + '</span>' +
        (showAiCopy
            ? '<div class="ia-panel__msg-actions ubits-ia-chat-thread__message-actions">' + copyBtn + '</div>'
            : '') +
        '</div>';

    el.setAttribute('data-ai-text', String(text || ''));
    var attHtml = _buildIAPanelAttachmentsHtml(attachments && attachments.images, attachments && attachments.files) || '';
    var useRichAi = msgType === 'ai' && opts.richHtml;
    var useStream = !useRichAi && msgType === 'ai' && window.UbitsIaChatStreaming && typeof window.UbitsIaChatStreaming.buildAiGlobeInnerHtmlFromPlainText === 'function';
    if (useRichAi) {
        el.innerHTML =
            '<div class="ia-panel__msg-bubble ia-panel__msg-bubble--rich">' + opts.richHtml + '</div>' +
            footerHtml;
    } else if (useStream) {
        el.classList.add('ubits-ia-chat-thread__message', 'ubits-ia-chat-thread__message--ai', 'ubits-ia-chat-thread__message--typing');
        var innerGlobe = window.UbitsIaChatStreaming.buildAiGlobeInnerHtmlFromPlainText(text) + attHtml;
        el.innerHTML =
            '<div class="ia-panel__msg-bubble ubits-ia-chat-thread__text-globe ubits-ia-chat-thread__text-globe--ai">' + innerGlobe + '</div>' +
            footerHtml;
    } else {
        el.innerHTML =
            '<div class="ia-panel__msg-bubble">' + _aiEscape(text) + attHtml + '</div>' +
            footerHtml;
    }
    messages.appendChild(el);

    if (useStream) {
        window.UbitsIaChatStreaming.animateWordsParagraphByParagraph(el, function () {
            if (window.UbitsIaChatStreaming.finishAiMessageStreamReveal) {
                window.UbitsIaChatStreaming.finishAiMessageStreamReveal(el);
            }
        });
    }

    if (typeof window.initTooltip === 'function') {
        var tipSel = mount.tooltipRoot ? mount.tooltipRoot + ' [data-tooltip]' : '#ia-panel [data-tooltip]';
        setTimeout(function () { window.initTooltip(tipSel); }, 0);
    }

    var scroll = mount.scroll;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    _iaPanelSyncScrollFade();
}

function showIAPanelTyping() {
    var mount = _iaPanelResolveMount({});
    var welcome = mount.welcome;
    var messages = mount.messages;
    if (!messages) return function() {};

    if (welcome) welcome.style.display = 'none';
    messages.style.display = 'flex';

    if (window.UbitsIaChatStreaming && typeof window.UbitsIaChatStreaming.thinkingIndicatorHtml === 'function') {
        messages.insertAdjacentHTML('beforeend', window.UbitsIaChatStreaming.thinkingIndicatorHtml('Pensando'));
        var row = messages.lastElementChild;
        if (row) row.id = mount.typingId;
    } else {
        var el = document.createElement('div');
        el.className = 'ia-panel__msg ia-panel__msg--ai';
        el.id = mount.typingId;
        el.innerHTML =
            '<div class="ia-panel__typing">' +
            '<span class="ia-panel__typing-dot"></span>' +
            '<span class="ia-panel__typing-dot"></span>' +
            '<span class="ia-panel__typing-dot"></span>' +
            '</div>';
        messages.appendChild(el);
    }
    var scroll = mount.scroll;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    _iaPanelSyncScrollFade();

    var typingId = mount.typingId;
    return function() {
        var t = document.getElementById(typingId);
        if (t) t.remove();
        if (window.UbitsIaChatStreaming && window.UbitsIaChatStreaming.removeThinkingRows) {
            window.UbitsIaChatStreaming.removeThinkingRows(messages);
        }
        _iaPanelSyncScrollFade();
    };
}

function clearIAPanelMessages() {
    var mount = _iaPanelResolveMount({});
    var welcome = mount.welcome;
    var messages = mount.messages;
    if (messages) { messages.innerHTML = ''; messages.style.display = 'none'; }
    if (welcome) welcome.style.display = 'flex';
    _iaPanelSyncScrollFade();
}

function setIAPanelTitle(title) {
    var el = _aiEl('ia-panel-title');
    if (el) el.textContent = title;
}

/** Actualiza el valor mostrado del badge de tokens (cabecera). No-op si `tokensBadge: false` o el nodo no existe. */
function setIAPanelTokensBadgeValue(value) {
    var n = parseInt(value, 10);
    if (isNaN(n) || n < 0) n = 0;
    var el = _aiEl('ia-panel-tokens-badge');
    if (!el) return;
    var numEl = el.querySelector('.ubits-badge-tag__token-number');
    if (numEl) numEl.textContent = _iaPanelFormatTokensBadgeNumber(n);
    el.setAttribute('aria-label', _iaPanelTokensBadgeAriaLabel(n));
    if (_iaPanel.options && _iaPanel.options.tokensBadge !== false) {
        if (_iaPanel.options.tokensBadge && typeof _iaPanel.options.tokensBadge === 'object') {
            _iaPanel.options.tokensBadge.value = n;
        }
    }
}

// ---------------------------------------------------------------------------
// Tipos de interacción conversacional
// API pública: addIAPanelInteraction(type, options)
//
// Tipos disponibles:
//   'quick-reply'  — botones de respuesta rápida bajo el último mensaje IA
//   'multiselect'  — chips seleccionables múltiples + botón «Listo»
//   'cards'        — tarjetas con emoji, título y descripción (selección única)
//   'artifacts'    — filas tipo recurso generado + Abrir; options.rows: [{ title, meta, iconClass, openButtonVisible, onOpen }]
//   'bottom-sheet' — formulario conversacional que se superpone sobre el input
//
// options comunes:
//   onReply(value, label) — callback al enviar la respuesta
//
// options por tipo:
//   quick-reply:  { items: ['Python', 'JavaScript', 'Swift'] }
//   multiselect:  { hint: '...', items: ['Figma', 'Sketch'], confirmLabel: 'Listo →' }
//   cards:        { items: [{ emoji, title, description, value }] }
//   bottom-sheet: { steps: [...], onReply(answers, steps), onClose } — onClose solo si el usuario cierra la hoja (X) sin completar el envío; al enviar el último paso no se llama onClose.
//   Navegación: cabecera solo indicador «N de M» (si hay varios pasos) + cerrar; pie con Anterior (desde paso 2), Siguiente / Enviar (último paso).
//   artifacts:    { rows: [{ title, meta?, iconClass?, openButtonVisible?, onOpen(row, rowEl) }] }
// ---------------------------------------------------------------------------

function addIAPanelInteraction(type, options) {
    options = options || {};
    var mount = _iaPanelResolveMount(options);
    var messages = mount.messages;
    var welcome = mount.welcome;
    if (!messages) return;
    if (welcome) welcome.style.display = 'none';
    messages.style.display = 'flex';

    if (type === 'quick-reply') {
        _iaPanelInteractionQuickReply(options);
    } else if (type === 'multiselect') {
        _iaPanelInteractionMultiselect(options);
    } else if (type === 'cards') {
        _iaPanelInteractionCards(options);
    } else if (type === 'bottom-sheet') {
        _iaPanelInteractionBottomSheet(options);
    } else if (type === 'artifacts') {
        _iaPanelInteractionArtifacts(options);
    }

    var scroll = mount.scroll;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    _iaPanelSyncScrollFade();
}

/* ---- helpers internos ---- */

function _iaPanelConsumeInteraction(wrap) {
    wrap.classList.add('ubits-ia-chat-interaction--consumed');
}

// Inyecta un bloque de interacción DENTRO del último mensaje IA (antes del footer),
// para que el timestamp quede debajo de la interacción.
function _iaPanelInjectInLastAiMsg(el) {
    var mount = _iaPanelResolveMount({});
    var messages = mount.messages;
    if (!messages) return;
    var msgs = messages.querySelectorAll('.ia-panel__msg--ai');
    var lastMsg = msgs.length ? msgs[msgs.length - 1] : null;
    if (lastMsg) {
        var footer = lastMsg.querySelector('.ia-panel__msg-footer');
        if (footer) {
            lastMsg.insertBefore(el, footer);
        } else {
            lastMsg.appendChild(el);
        }
    } else {
        messages.appendChild(el);
    }
}

function _iaPanelSendInteractionReply(text, onReply, label) {
    addIAPanelMessage(label || text, 'user');
    if (typeof onReply === 'function') onReply(text, label || text);
    var mount = _iaPanelResolveMount({});
    var scroll = mount.scroll;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

/** Texto legible para el chat a partir de los values seleccionados en multiselect (items: string | { value, label }). */
function _iaPanelMultiselectLabelsForChat(items, selectedValues) {
    var parts = [];
    (selectedValues || []).forEach(function(val) {
        var strVal = String(val);
        var human = strVal;
        var i;
        var it;
        for (i = 0; i < items.length; i++) {
            it = items[i];
            if (typeof it === 'string') {
                if (it === strVal) {
                    human = it;
                    break;
                }
            } else {
                var v = String(it.value != null ? it.value : '');
                if (v === strVal) {
                    human = String(it.label || it.value || strVal);
                    break;
                }
            }
        }
        parts.push(human);
    });
    return parts.join(', ');
}

/* ---- 1. Quick Reply — botones UBITS oficiales dentro del último mensaje IA ---- */
function _iaPanelInteractionQuickReply(opts) {
    var items = opts.items || [];
    if (!items.length) return;

    var wrap = document.createElement('div');
    wrap.className = 'ubits-ia-chat-interaction ubits-ia-chat-interaction--quick-reply';

    items.forEach(function(item) {
        var label = typeof item === 'string' ? item : (item.label || item.value || '');
        var value = typeof item === 'string' ? item : (item.value || item.label || '');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ubits-button ubits-button--secondary ubits-button--sm';
        btn.innerHTML = '<span>' + _aiEscape(label) + '</span>';

        btn.addEventListener('click', function() {
            if (wrap.classList.contains('ubits-ia-chat-interaction--consumed')) return;
            btn.classList.add('ubits-button--active');
            _iaPanelConsumeInteraction(wrap);
            _iaPanelSendInteractionReply(value, opts.onReply, label);
        });
        wrap.appendChild(btn);
    });

    _iaPanelInjectInLastAiMsg(wrap);
}

/* ---- 2. Multiselect chips — dentro del último mensaje IA ---- */
function _iaPanelInteractionMultiselect(opts) {
    var items = opts.items || [];
    if (!items.length) return;
    var confirmLabel = opts.confirmLabel || 'Listo →';
    var hint = opts.hint || 'Puedes elegir varias';

    var selected = [];

    var wrap = document.createElement('div');
    wrap.className = 'ubits-ia-chat-interaction ubits-ia-chat-interaction--multiselect';

    if (hint) {
        var hintEl = document.createElement('p');
        hintEl.className = 'ubits-ia-chat-interaction__hint';
        hintEl.textContent = hint;
        wrap.appendChild(hintEl);
    }

    var chipsWrap = document.createElement('div');
    chipsWrap.className = 'ubits-ia-chat-interaction__chips';

    items.forEach(function(item) {
        var label = typeof item === 'string' ? item : (item.label || item.value || '');
        var value = typeof item === 'string' ? item : (item.value || item.label || '');

        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ubits-chip ubits-chip--sm';
        chip.setAttribute('role', 'checkbox');
        chip.setAttribute('aria-checked', 'false');
        chip.innerHTML = '<span class="ubits-chip__text">' + _aiEscape(label) + '</span>';

        chip.addEventListener('click', function() {
            if (wrap.classList.contains('ubits-ia-chat-interaction--consumed')) return;
            var idx = selected.indexOf(value);
            if (idx === -1) {
                selected.push(value);
                chip.classList.add('ubits-chip--active');
                chip.setAttribute('aria-checked', 'true');
            } else {
                selected.splice(idx, 1);
                chip.classList.remove('ubits-chip--active');
                chip.setAttribute('aria-checked', 'false');
            }
            // Activar/desactivar el botón Listo según haya selección
            if (confirmBtn) confirmBtn.disabled = (selected.length === 0);
        });

        chipsWrap.appendChild(chip);
    });

    wrap.appendChild(chipsWrap);

    var footer = document.createElement('div');
    footer.className = 'ubits-ia-chat-interaction__multiselect-footer';

    var confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'ubits-button ubits-button--primary ubits-button--sm';
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span>' + _aiEscape(confirmLabel) + '</span>';
    confirmBtn.addEventListener('click', function() {
        if (wrap.classList.contains('ubits-ia-chat-interaction--consumed')) return;
        if (!selected.length) return;
        _iaPanelConsumeInteraction(wrap);
        var label = _iaPanelMultiselectLabelsForChat(items, selected);
        _iaPanelSendInteractionReply(selected.join(','), opts.onReply, label);
    });

    footer.appendChild(confirmBtn);
    wrap.appendChild(footer);
    _iaPanelInjectInLastAiMsg(wrap);
}

/* ---- 3. Card-based — dentro del último mensaje IA ---- */
function _iaPanelInteractionCards(opts) {
    var items = opts.items || [];
    if (!items.length) return;

    var wrap = document.createElement('div');
    wrap.className = 'ubits-ia-chat-interaction ubits-ia-chat-interaction--cards';

    items.forEach(function(item) {
        var emoji = item.emoji || '';
        var title = item.title || '';
        var desc  = item.description || item.desc || '';
        var value = item.value || title;

        var card = document.createElement('div');
        card.className = 'ubits-ia-chat-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.innerHTML =
            (emoji ? '<span class="ubits-ia-chat-card__emoji" aria-hidden="true">' + _aiEscape(emoji) + '</span>' : '') +
            '<div class="ubits-ia-chat-card__body">' +
            '<p class="ubits-ia-chat-card__title">' + _aiEscape(title) + '</p>' +
            (desc ? '<p class="ubits-ia-chat-card__desc">' + _aiEscape(desc) + '</p>' : '') +
            '</div>';

        var select = function() {
            if (wrap.classList.contains('ubits-ia-chat-interaction--consumed')) return;
            card.classList.add('ubits-ia-chat-card--selected');
            _iaPanelConsumeInteraction(wrap);
            _iaPanelSendInteractionReply(value, opts.onReply, title);
        };
        card.addEventListener('click', select);
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
        });

        wrap.appendChild(card);
    });

    _iaPanelInjectInLastAiMsg(wrap);
}

/* ---- 3b. Artifact cards (recursos generados con Abrir) ---- */
function _iaPanelInteractionArtifacts(opts) {
    var rows = opts.rows || [];
    if (!rows.length) return;

    var wrap = document.createElement('div');
    wrap.className = 'ubits-ia-chat-interaction ubits-ia-chat-interaction--artifacts';

    rows.forEach(function (row) {
        var openVisible = row.openButtonVisible !== false;
        var rowEl = document.createElement('div');
        rowEl.className = 'ubits-ia-chat-artifact-row' + (openVisible ? ' open-btn-visible' : '');
        rowEl.setAttribute('data-artifact-shows-open', openVisible ? '1' : '0');

        var iconClass = row.iconClass || row.icon || 'far fa-file-lines';
        var title = row.title || 'Artifact';
        var meta = row.meta || '';

        rowEl.innerHTML =
            '<div class="ubits-ia-chat-thread__resource-card">' +
            '<div class="ubits-ia-chat-thread__resource-card-main">' +
            '<span class="ubits-ia-chat-thread__resource-card-icon"><i class="' + _aiEscape(iconClass) + '"></i></span>' +
            '<div class="ubits-ia-chat-thread__resource-card-content">' +
            '<span class="ubits-ia-chat-thread__resource-card-title ubits-body-sm-bold">' + _aiEscape(title) + '</span>' +
            (meta ? '<span class="ubits-ia-chat-thread__resource-card-meta ubits-body-xs-regular">' + _aiEscape(meta) + '</span>' : '') +
            '</div></div>' +
            '<div class="ubits-ia-chat-thread__resource-card-action ubits-ia-chat-thread__resource-open-wrap">' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm ubits-ia-chat-thread__resource-open-btn"><span>Abrir</span></button>' +
            '</div></div>';

        var openBtn = rowEl.querySelector('.ubits-ia-chat-thread__resource-open-btn');
        if (openBtn) {
            openBtn.addEventListener('click', function () {
                if (typeof row.onOpen === 'function') row.onOpen(row, rowEl);
                rowEl.classList.remove('open-btn-visible');
            });
        }
        wrap.appendChild(rowEl);
    });

    _iaPanelInjectInLastAiMsg(wrap);
}

/* ---- 4. Bottom Sheet Form ---- */
function _iaPanelInteractionBottomSheet(opts) {
    var steps = opts.steps || [];
    if (!steps.length) return;

    var mount = _iaPanelResolveMount(opts || {});
    // La hoja se superpone sobre el cuerpo del chat (panel-body o contenedor del modal)
    var inputArea = mount.inputArea || _aiEl('ia-panel-input-area');
    var scroll = mount.scroll || _aiEl('ia-panel-scroll');
    var chatCont = mount.chatBody || _aiEl('ia-panel-body');
    if (!chatCont) chatCont = inputArea && inputArea.parentElement;
    if (!chatCont) return;

    // Deshabilitar input mientras la hoja está abierta
    var inputEl = mount.inputEl || _aiEl('ia-panel-input');
    var sendBtn = mount.sendBtn || _aiEl('ia-panel-send');
    _iaPanelSetInputDisabled(true);

    var currentStep = 0;
    var answers = steps.map(function() { return { selected: [], freeText: '' }; });

    /** Devuelve el texto visible en chat para una respuesta (usa label si existe; evita mostrar value técnico en inglés). */
    function formatBottomSheetAnswerForChat(step, ans) {
        if (!step || !ans) return '';
        var optList = step.options || [];
        var map = {};
        optList.forEach(function(opt) {
            var lbl = typeof opt === 'string' ? opt : (opt.label || opt);
            var val = typeof opt === 'string' ? opt : (opt.value || opt.label || opt);
            map[String(val)] = lbl;
        });
        if (step.type === 'multi') {
            var parts = (ans.selected || []).map(function(v) {
                var key = String(v);
                return map[key] != null ? map[key] : v;
            }).filter(Boolean);
            var ftMulti = String(ans.freeText || '').trim();
            if (parts.length && ftMulti) {
                return parts.join(', ') + ' (+ otro: ' + ftMulti + ')';
            }
            if (parts.length) return parts.join(', ');
            return ftMulti;
        }
        var raw = (ans.selected && ans.selected[0]) || String(ans.freeText || '').trim();
        if (!raw) return '';
        var key = String(raw);
        return map[key] != null ? map[key] : raw;
    }

    // Contenedor principal de la hoja
    var sheet = document.createElement('div');
    sheet.className = 'ubits-ia-chat-bottom-sheet';
    sheet.id = 'ia-panel-bottom-sheet';

    function closeSheet(skipOnClose) {
        sheet.remove();
        _iaPanelSetInputDisabled(false);
        if (!skipOnClose && typeof opts.onClose === 'function') opts.onClose();
    }

    // Construye y envía UN único mensaje con todas las respuestas acumuladas
    function sendAllAnswers() {
        var lines = [];
        steps.forEach(function(step, idx) {
            var ans = answers[idx];
            if (!ans) return;
            var label = formatBottomSheetAnswerForChat(step, ans);
            if (!label) return; // paso omitido, no lo incluimos
            if (steps.length > 1) {
                lines.push('P: ' + (step.question || '') + '\nR: ' + label);
            } else {
                lines.push(label);
            }
        });
        if (!lines.length) return;

        var combinedLabel = lines.join('\n\n');
        addIAPanelMessage(combinedLabel, 'user');
        if (typeof opts.onReply === 'function') opts.onReply(answers, steps);
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
    }

    function submitStep() {
        var step = steps[currentStep];
        var ans  = answers[currentStep];

        // Validar que haya algo seleccionado o escrito
        var hasAnswer = step.type === 'multi'
            ? (ans.selected.length > 0 || ans.freeText.trim() !== '')
            : (ans.selected.length > 0 || ans.freeText.trim() !== '');
        if (!hasAnswer) return;

        // Sincronizar texto libre como selección si no hay opción marcada (single select)
        if (step.type !== 'multi' && !ans.selected.length && ans.freeText.trim()) {
            ans.selected = [ans.freeText.trim()];
        }

        // Ir al siguiente paso o enviar todo al final
        if (currentStep < steps.length - 1) {
            currentStep++;
            if (!answers[currentStep]) answers[currentStep] = { selected: [], freeText: '' };
            renderSheet();
        } else {
            // Último paso: enviar respuestas al chat y cerrar sin onClose (onClose = solo abandono / cerrar sin enviar)
            sendAllAnswers();
            closeSheet(true);
        }
    }

    function renderSheet() {
        var step = steps[currentStep];
        var ans  = answers[currentStep];
        var total = steps.length;
        var isMulti = step.type === 'multi';

        sheet.innerHTML = '';

        // Header
        var header = document.createElement('div');
        header.className = 'ubits-ia-chat-bottom-sheet__header';

        var qEl = document.createElement('p');
        qEl.className = 'ubits-ia-chat-bottom-sheet__question';
        qEl.textContent = step.question || '';
        header.appendChild(qEl);

        var nav = document.createElement('div');
        nav.className = 'ubits-ia-chat-bottom-sheet__nav';

        if (total > 1) {
            var navLabel = document.createElement('span');
            navLabel.className = 'ubits-ia-chat-bottom-sheet__nav-label';
            navLabel.textContent = (currentStep + 1) + ' de ' + total;
            nav.appendChild(navLabel);
        }

        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'ubits-ia-chat-bottom-sheet__close';
        closeBtn.innerHTML = '<i class="far fa-xmark"></i>';
        closeBtn.setAttribute('aria-label', 'Cerrar');
        closeBtn.addEventListener('click', closeSheet);
        nav.appendChild(closeBtn);

        header.appendChild(nav);
        sheet.appendChild(header);

        // Opciones
        var optionsEl = document.createElement('div');
        optionsEl.className = 'ubits-ia-chat-bottom-sheet__options';

        var optList = step.options || [];
        var countsEl; // referencia al contador en el footer (para multi)
        var nextFooterBtn = null;
        /** Input «Otro» (se asigna más abajo); permite limpiarlo al elegir opción en single. */
        var freeTextInputRef = null;
        var syncNextFooter = function () {
            if (!nextFooterBtn) return;
            var ft = ans.freeText != null ? String(ans.freeText).trim() : '';
            var has = ans.selected.length > 0 || ft !== '';
            nextFooterBtn.disabled = !has;
        };

        optList.forEach(function(opt, idx) {
            var label = typeof opt === 'string' ? opt : (opt.label || opt);
            var value = typeof opt === 'string' ? opt : (opt.value || opt.label || opt);
            var row = document.createElement('div');

            if (isMulti) {
                row.className = 'ubits-ia-chat-bs-option ubits-ia-chat-bs-option--check';
                if (ans.selected.indexOf(value) !== -1) row.classList.add('ubits-ia-chat-bs-option--checked');

                var chk = document.createElement('span');
                chk.className = 'ubits-ia-chat-bs-option__checkbox';
                if (ans.selected.indexOf(value) !== -1) chk.innerHTML = '<i class="far fa-check"></i>';

                var lblEl = document.createElement('span');
                lblEl.className = 'ubits-ia-chat-bs-option__label';
                lblEl.textContent = label;

                row.appendChild(chk);
                row.appendChild(lblEl);

                row.addEventListener('click', function() {
                    var selIdx = ans.selected.indexOf(value);
                    if (selIdx === -1) {
                        ans.selected.push(value);
                        row.classList.add('ubits-ia-chat-bs-option--checked');
                        chk.innerHTML = '<i class="far fa-check"></i>';
                    } else {
                        ans.selected.splice(selIdx, 1);
                        row.classList.remove('ubits-ia-chat-bs-option--checked');
                        chk.innerHTML = '';
                    }
                    if (countsEl) {
                        countsEl.textContent = ans.selected.length
                            ? ans.selected.length + ' seleccionado' + (ans.selected.length !== 1 ? 's' : '')
                            : '';
                    }
                    syncNextFooter();
                });
            } else {
                row.className = 'ubits-ia-chat-bs-option';
                if (ans.selected.length && String(ans.selected[0]) === String(value)) {
                    row.classList.add('ubits-ia-chat-bs-option--selected');
                }

                var numEl = document.createElement('span');
                numEl.className = 'ubits-ia-chat-bs-option__num';
                numEl.textContent = String(idx + 1);

                var lblEl = document.createElement('span');
                lblEl.className = 'ubits-ia-chat-bs-option__label';
                lblEl.textContent = label;

                var arrow = document.createElement('span');
                arrow.className = 'ubits-ia-chat-bs-option__arrow';
                arrow.innerHTML = '<i class="far fa-arrow-right"></i>';

                row.appendChild(numEl);
                row.appendChild(lblEl);
                row.appendChild(arrow);

                function applySingleSelect() {
                    ans.selected = [value];
                    ans.freeText = '';
                    if (freeTextInputRef) freeTextInputRef.value = '';
                    optionsEl.querySelectorAll('.ubits-ia-chat-bs-option').forEach(function(r) {
                        r.classList.remove('ubits-ia-chat-bs-option--selected');
                    });
                    row.classList.add('ubits-ia-chat-bs-option--selected');
                    syncNextFooter();
                }
                row.addEventListener('click', applySingleSelect);
                /* Doble clic: avanza de inmediato (el clic simple solo marca; «Otro» sigue requiriendo Siguiente). */
                row.addEventListener('dblclick', function(e) {
                    e.preventDefault();
                    applySingleSelect();
                    submitStep();
                });
            }

            optionsEl.appendChild(row);
        });

        sheet.appendChild(optionsEl);

        // Campo de texto libre (opcional)
        if (step.freeText !== false) {
            var ftWrap = document.createElement('div');
            ftWrap.className = 'ubits-ia-chat-bottom-sheet__free-text';
            ftWrap.innerHTML = '<i class="far fa-pencil"></i>';

            var ftInput = document.createElement('input');
            ftInput.type = 'text';
            ftInput.placeholder = (typeof step.freeText === 'string' && step.freeText) ? step.freeText : 'Otro';
            ftInput.value = ans.freeText;
            freeTextInputRef = ftInput;
            ftInput.addEventListener('input', function() {
                ans.freeText = ftInput.value;
                if (!isMulti && String(ftInput.value).trim()) {
                    ans.selected = [];
                    optionsEl.querySelectorAll('.ubits-ia-chat-bs-option').forEach(function(r) {
                        r.classList.remove('ubits-ia-chat-bs-option--selected');
                    });
                }
                syncNextFooter();
            });
            ftInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); submitStep(); }
            });
            ftWrap.appendChild(ftInput);
            sheet.appendChild(ftWrap);
        }

        // Footer
        var footer = document.createElement('div');
        footer.className = 'ubits-ia-chat-bottom-sheet__footer';

        countsEl = document.createElement('span');
        countsEl.className = 'ubits-ia-chat-bottom-sheet__counter';
        if (isMulti && ans.selected.length) {
            countsEl.textContent = ans.selected.length + ' seleccionado' + (ans.selected.length !== 1 ? 's' : '');
        }
        footer.appendChild(countsEl);

        var footerActions = document.createElement('div');
        footerActions.className = 'ubits-ia-chat-bottom-sheet__footer-actions';

        var prevFooterBtn = document.createElement('button');
        prevFooterBtn.type = 'button';
        prevFooterBtn.className = 'ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm';
        prevFooterBtn.innerHTML = '<span>Anterior</span>';
        prevFooterBtn.setAttribute('aria-label', 'Paso anterior');
        if (total <= 1 || currentStep === 0) {
            prevFooterBtn.style.display = 'none';
        }
        prevFooterBtn.addEventListener('click', function() {
            if (currentStep > 0) {
                currentStep--;
                renderSheet();
            }
        });
        footerActions.appendChild(prevFooterBtn);

        nextFooterBtn = document.createElement('button');
        nextFooterBtn.type = 'button';
        nextFooterBtn.className = 'ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm';
        var isLastStep = currentStep >= total - 1;
        nextFooterBtn.innerHTML = '<span>' + (isLastStep ? 'Enviar' : 'Siguiente') + '</span>';
        nextFooterBtn.setAttribute('aria-label', isLastStep ? 'Enviar respuestas' : 'Ir al siguiente paso');
        nextFooterBtn.addEventListener('click', function() {
            if (nextFooterBtn.disabled) return;
            if (step.type !== 'multi' && !ans.selected.length && ans.freeText.trim()) {
                ans.selected = [ans.freeText.trim()];
            }
            submitStep();
        });
        footerActions.appendChild(nextFooterBtn);

        footer.appendChild(footerActions);

        syncNextFooter();

        sheet.appendChild(footer);

        // Foco en el input de texto libre si existe
        if (step.freeText !== false) {
            var ft = sheet.querySelector('.ubits-ia-chat-bottom-sheet__free-text input');
            if (ft) setTimeout(function() { /* no auto-focus en panel */ }, 0);
        }
    }

    renderSheet();
    chatCont.appendChild(sheet);
    if (getComputedStyle(chatCont).position === 'static') chatCont.style.position = 'relative';
}

function destroyIAPanel() {
    var root = _aiEl('ia-panel-root');
    if (_iaPanel.resizeHandler) {
        window.removeEventListener('resize', _iaPanel.resizeHandler);
    }
    if (root) root.remove();
    _iaPanel.inited = false;
    _iaPanel.open   = false;
    _iaPanel.options = {};
    _iaPanel.width   = null;
    _iaPanel.lastUserMessage = '';
    _iaPanel.pendingImages = [];
    _iaPanel.pendingFiles = [];
    _iaPanel.iaInputApi = null;
    _iaPanel.rootEl = null;
    _iaPanel.resizeHandler = null;
    _iaPanel.originalParent = null;
    _iaPanel.artifactOpen = false;
    _iaPanel.titleBeforeArtifact = '';
    _iaPanel.alternateMount = null;
}

// Referencia explícita para páginas que cargan el panel en IIFE strict (p. ej. evaluaciones-recurso.js).
if (typeof window !== 'undefined') {
    window._iaPanelSend = _iaPanelSend;
    window.setIAPanelAlternateMount = setIAPanelAlternateMount;
    window.showIAPanelTyping = showIAPanelTyping;
}
