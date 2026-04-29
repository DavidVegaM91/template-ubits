/* ========================================
   AI PANEL COMPONENT
   Sidebar anclado a la derecha, redimensionable con el mouse.
   ========================================

   API PÚBLICA:
   ------------
   initAIPanel(options)          — Inicializa e inyecta el panel (una sola vez)
   openAIPanel()                 — Abre el panel
   closeAIPanel()                — Cierra el panel
   addAIPanelMessage(text, type, attachments?, opts?) — Agrega mensaje ('user' | 'ai').
     opts (solo type ai): { richHtml: string, hideAiCopy?: boolean } — HTML del globo (sin streaming).
   showAIPanelTyping()           — Muestra “Pensando” (con ia-chat-streaming.js) → retorna removeTyping()
   clearAIPanelMessages()        — Limpia mensajes, restaura bienvenida
   setAIPanelTitle(title)        — Cambia título en tiempo real
   setAIPanelTokensBadgeValue(n) — Actualiza el número del badge de tokens en cabecera (si existe)
   destroyAIPanel()              — Desmonta el panel del DOM

   OPCIONES (initAIPanel):
   -----------------------
   title, agentLabel, placeholder, disclaimer,
   welcomeTitle, welcomeSubtitle,
   tokensBadge — true (por defecto): badge IA de tokens junto al cierre; false lo oculta;
     u objeto { value, tooltip, ariaLabel } para personalizar (p. ej. value: 50).
   Requiere CSS: badge-tag.css + aprendizaje-ia-gradientes.css; tooltip.js + tooltip.css para el hover.
  onSend(text) — tras insertar el mensaje del usuario (y el «Pensando» si hay ia-chat-streaming); solo respuesta / backend, no duplicar 'user',
  onAttach(), onClose(),
  dockDesktop, dockContainerSelector, dockBreakpoint

   CSS recomendado (misma pila que Modo estudio / Chat IA grupos):
   button.css → chip.css (adjuntos: chips en preview y en mensajes; sin chip.css se ven sin estilo)
   → aprendizaje-ia-gradientes.css → badge-tag.css → tooltip.css → ubits-ia-chat.css → ai-panel.css
   (+ tooltip.js antes de ai-panel.js si usas el badge de tokens en cabecera).
   ======================================== */

// ---------------------------------------------------------------------------
// SVG ícono del agente (Subtract.svg con gradiente IA)
// ---------------------------------------------------------------------------
const _AI_PANEL_ICON_SVG = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.4932 0.613375C12.0444 -0.204461 13.9557 -0.204455 15.5068 0.613375L23.4932 4.82431C25.0444 5.64213 26 7.15351 26 8.78916V17.211C25.9999 18.8466 25.0444 20.3581 23.4932 21.1759L15.5068 25.3868C13.9557 26.2046 12.0444 26.2046 10.4932 25.3868L2.50684 21.1759C0.955703 20.3581 6.05295e-05 18.8466 0 17.211V8.78916C4.65813e-05 7.15351 0.955692 5.64213 2.50684 4.82431L10.4932 0.613375ZM10.2285 9.45322C9.78152 9.45322 9.38147 9.70709 9.22656 10.0899L9.08301 10.4454C8.64869 11.5189 7.72346 12.3649 6.55078 12.7618L6.16211 12.8927C5.74356 13.0343 5.46604 13.3991 5.46582 13.8067C5.46582 14.2144 5.74338 14.5801 6.16211 14.7218L6.55078 14.8526C7.7235 15.2495 8.6487 16.0956 9.08301 17.169L9.22656 17.5245C9.38147 17.9073 9.78152 18.1612 10.2285 18.1612C10.6752 18.1611 11.0746 17.9072 11.2295 17.5245L11.373 17.169C11.8073 16.0957 12.7327 15.2496 13.9053 14.8526L14.2939 14.7218C14.7126 14.5801 14.9912 14.2145 14.9912 13.8067C14.991 13.3991 14.7125 13.0343 14.2939 12.8927L13.9053 12.7618C12.7327 12.365 11.8073 11.5187 11.373 10.4454L11.373 10.4454L11.2295 10.0899C11.0745 9.7072 10.6752 9.45332 10.2285 9.45322ZM10.2285 12.5733C10.6087 13.0436 11.0643 13.4592 11.5791 13.8067C11.0643 14.1543 10.6087 14.5707 10.2285 15.0411C9.84818 14.5706 9.39278 14.1543 8.87793 13.8067C9.39262 13.4592 9.84827 13.0436 10.2285 12.5733ZM17.7881 7.83798C17.3182 7.83817 16.9032 8.11882 16.7666 8.52939C16.6257 8.95299 16.2636 9.28369 15.8018 9.4122C15.3527 9.53734 15.046 9.91603 15.0459 10.3448C15.0459 10.7736 15.3527 11.1523 15.8018 11.2774C16.2634 11.4058 16.6256 11.7369 16.7666 12.1602C16.9032 12.5708 17.3182 12.8515 17.7881 12.8517C18.2581 12.8517 18.6739 12.5709 18.8105 12.1602C18.9516 11.7369 19.3137 11.4058 19.7754 11.2774C20.2244 11.1523 20.5312 10.7736 20.5312 10.3448C20.5311 9.91605 20.2244 9.53736 19.7754 9.4122C19.3136 9.28369 18.9515 8.95299 18.8105 8.52939C18.6739 8.11868 18.2581 7.83798 17.7881 7.83798Z" fill="url(#ai-panel-icon-grad)"/>
<defs>
<linearGradient id="ai-panel-icon-grad" x1="24.8936" y1="20.8" x2="-0.0945594" y2="17.5486" gradientUnits="userSpaceOnUse">
<stop stop-color="#FF5416"/>
<stop offset="0.341346" stop-color="#EA066F"/>
<stop offset="0.706731" stop-color="#8823EA"/>
<stop offset="1" stop-color="#0C5BEF"/>
</linearGradient>
</defs>
</svg>`;

// Ícono del empty state (welcome)
const _AI_PANEL_ICON_SVG_LG = `<svg width="75" height="78" viewBox="0 0 75 78" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M40.9134 19.8574L26.1989 23.8002C20.8616 25.2303 18.5914 29.1881 20.0262 34.543L24.8858 52.6794C26.3442 58.122 30.2703 60.3443 35.6076 58.9141L50.3221 54.9714C55.7455 53.5182 57.9467 49.6541 56.4884 44.2115L51.6287 26.0751C50.1939 20.7203 46.3367 18.4043 40.9134 19.8574Z" fill="url(#paint0_linear_2091_161)"/>
<g filter="url(#filter0_f_2091_161)">
<rect x="30.8442" y="52.5874" width="23.4737" height="19.8778" rx="9.93891" transform="rotate(-105 30.8442 52.5874)" fill="#8237FF" fill-opacity="0.5"/>
</g>
<path data-figma-bg-blur-radius="24" d="M54.7507 28.7427C57.653 28.7427 59.9805 29.5808 61.5817 31.2017C63.182 32.8218 63.9919 35.1579 63.9919 38.022V56.7983C63.9918 59.7056 63.1836 62.0471 61.5817 63.6616C59.9791 65.2768 57.6502 66.0952 54.7507 66.0952H39.5173C36.6603 66.0952 34.3323 65.2764 32.7194 63.6636C31.1066 62.0507 30.2742 59.7095 30.2741 56.7983V38.022C30.2741 35.1541 31.1083 32.8191 32.7194 31.2007C34.3308 29.582 36.6573 28.7427 39.5173 28.7427H54.7507Z" fill="#0C5BEF" fill-opacity="0.2" stroke="url(#paint1_linear_2091_161)" stroke-linecap="round" stroke-linejoin="round"/>
<g filter="url(#filter2_d_2091_161)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M40.0076 54.2178H54.2585C54.9835 54.2907 55.53 54.9092 55.53 55.6543C55.5298 56.3792 54.9834 56.9984 54.2585 57.0713H40.0076C39.4624 57.1439 38.935 56.8713 38.6443 56.417C38.3537 55.9446 38.3537 55.3449 38.6443 54.8906C38.935 54.4181 39.4624 54.1634 40.0076 54.2178ZM54.2576 45.9277C55.0391 45.9277 55.6755 46.5661 55.6755 47.3477C55.6754 48.1291 55.039 48.7646 54.2576 48.7646H40.0076C39.2243 48.7646 38.5897 48.129 38.5896 47.3477C38.5896 46.5661 39.2242 45.9278 40.0076 45.9277H54.2576ZM45.4402 37.6953C46.2236 37.6953 46.8601 38.3316 46.8601 39.1113C46.8601 39.9129 46.2236 40.5488 45.4402 40.5488H40.0076C39.2242 40.5487 38.5896 39.9124 38.5896 39.1309C38.5898 38.3495 39.2244 37.714 40.0076 37.7139V37.6953H45.4402Z" fill="url(#paint2_linear_2091_161)"/>
</g>
<defs>
<filter id="filter0_f_2091_161" x="0" y="0" width="74.8135" height="77.356" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="13.5" result="effect1_foregroundBlur_2091_161"/>
</filter>
<filter id="filter2_d_2091_161" x="23.4264" y="22.6953" width="47.2492" height="49.3877" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="5" dy="5"/>
<feGaussianBlur stdDeviation="5"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0470588 0 0 0 0 0.356863 0 0 0 0 0.937255 0 0 0 0.5 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2091_161"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2091_161" result="shape"/>
</filter>
<linearGradient id="paint0_linear_2091_161" x1="33.5553" y1="21.829" x2="42.964" y2="56.943" gradientUnits="userSpaceOnUse">
<stop stop-color="#0C5BEF"/>
<stop offset="1" stop-color="#4082FF"/>
</linearGradient>
<linearGradient id="paint1_linear_2091_161" x1="35.9822" y1="33.4778" x2="59.5648" y2="59.7647" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.25"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint2_linear_2091_161" x1="54.4526" y1="41.1963" x2="25.2729" y2="40.2634" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0.2"/>
</linearGradient>
</defs>
</svg>`;

// ---------------------------------------------------------------------------
// Estado interno
// ---------------------------------------------------------------------------
let _aiPanel = {
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
};

/** Alinea el scroll del panel con ubits-ia-chat (máscara superior solo en conversación). */
function _aiPanelSyncScrollFade() {
    var scroll = _aiEl('ai-panel-scroll');
    var messages = _aiEl('ai-panel-messages');
    if (!scroll || !messages) return;
    var visible = window.getComputedStyle(messages).display !== 'none';
    if (visible) scroll.classList.add('ai-panel__chat-scroll--conversation');
    else scroll.classList.remove('ai-panel__chat-scroll--conversation');
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

// ---------------------------------------------------------------------------
// Badge de tokens (cabecera, a la izquierda del cierre) — mismo patrón que modal IA portada
// ---------------------------------------------------------------------------
function _aiPanelTokensBadgeHtml(o) {
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
            : String(num) + ' tokens restantes';
    return (
        '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs ai-panel__tokens-badge" id="ai-panel-tokens-badge" tabindex="0" ' +
        'data-tooltip="' +
        _aiEscape(tip) +
        '" data-tooltip-delay="1000" aria-label="' +
        _aiEscape(aria) +
        '">' +
        '<span class="ubits-badge-tag__token-cost" aria-hidden="true">' +
        '<i class="far fa-coin-vertical"></i>' +
        '<span class="ubits-badge-tag__token-number">' +
        _aiEscape(String(num)) +
        '</span>' +
        '</span></span>'
    );
}

function _aiPanelInitTokensBadgeTooltip() {
    var cfg = _aiPanel.options.tokensBadge;
    if (cfg === false) return;
    if (typeof window.initTooltip !== 'function') return;
    window.setTimeout(function () {
        var el = _aiEl('ai-panel-tokens-badge');
        if (el) window.initTooltip('#ai-panel-tokens-badge');
    }, 0);
}

// ---------------------------------------------------------------------------
// HTML del panel
// ---------------------------------------------------------------------------
function _buildAIPanelHTML(o) {
    const title       = o.title       || 'IA';
    const agentLabel  = o.agentLabel  || '';
    const placeholder = o.placeholder || '¿Cómo puedo ayudarte hoy?';
    const disclaimer  = o.disclaimer  || _defaultIaDisclaimerText();
    const wTitle      = o.welcomeTitle    || title;
    const wSubtitle   = o.welcomeSubtitle || '¿En qué puedo ayudarte hoy?';

    return `
<div class="ai-panel" id="ai-panel" role="dialog" aria-modal="false" aria-label="${_aiEscape(title)}">

    <!-- Handle de resize -->
    <div class="ai-panel__resize-handle" id="ai-panel-resize"></div>

    <!-- Header -->
    <header class="ai-panel__header">
        <div class="ai-panel__icon" aria-hidden="true">${_AI_PANEL_ICON_SVG}</div>
        <div class="ai-panel__header-text">
            <h2 class="ai-panel__title" id="ai-panel-title">${_aiEscape(title)}</h2>
        </div>
        <div class="ai-panel__header-actions">
            ${_aiPanelTokensBadgeHtml(o)}
            <button class="ai-panel__hdr-btn" id="ai-panel-close-btn" type="button" title="Cerrar panel" aria-label="Cerrar">
                <i class="far fa-xmark"></i>
            </button>
        </div>
    </header>

    <!-- Body -->
    <div class="ai-panel__body" id="ai-panel-body">

        <!-- Contenedor con gradiente y border-radius (la "card" del chat) -->
        <div class="ai-panel__chat-container">

            <!-- Zona scrollable: bienvenida o mensajes -->
            <div class="ai-panel__chat-scroll" id="ai-panel-scroll">

                <!-- Bienvenida (sin mensajes) -->
                <div class="ai-panel__welcome" id="ai-panel-welcome">
                    <div class="ai-panel__welcome-icon" aria-hidden="true">${_AI_PANEL_ICON_SVG_LG}</div>
                    <p class="ai-panel__welcome-subtitle">${_aiEscape(wSubtitle)}</p>
                </div>

                <!-- Mensajes -->
                <div class="ai-panel__messages" id="ai-panel-messages" style="display:none;"></div>

            </div>

            <!-- Misma estructura que .ubits-ia-chat-thread: input-area + disclaimer (hermanos) -->
            <div class="ubits-ia-chat-thread__input-area" id="ai-panel-input-area">
                <div class="ai-panel__input-box" id="ai-panel-input-box">
                    <input type="file" id="ai-panel-files" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx" multiple hidden />
                    <div class="ai-panel__pending-images-strip" id="ai-panel-pending-images"></div>
                    <div class="ai-panel__pending-files-strip" id="ai-panel-pending-files"></div>
                    <textarea
                        class="ai-panel__input"
                        id="ai-panel-input"
                        placeholder="${_aiEscape(placeholder)}"
                        rows="1"
                        aria-label="Mensaje"
                    ></textarea>
                    <div class="ai-panel__input-actions">
                        <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ai-panel__attach-btn" id="ai-panel-attach" type="button" aria-label="Adjuntar">
                            <i class="far fa-plus"></i>
                        </button>
                        <div class="ai-panel__input-spacer"></div>
                        <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--icon-only--sm ai-panel__send-btn" id="ai-panel-send" type="button" aria-label="Enviar">
                            <i class="far fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            <p class="ubits-ia-chat-thread__disclaimer ubits-body-xs-regular">${_aiEscape(disclaimer)}</p>

        </div>
    </div>

</div>`;
}

// ---------------------------------------------------------------------------
// initAIPanel
// ---------------------------------------------------------------------------
function initAIPanel(options) {
    if (_aiPanel.inited) return;
    _aiPanel.inited  = true;
    _aiPanel.options = Object.assign({
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
    root.id = 'ai-panel-root';
    root.innerHTML = _buildAIPanelHTML(_aiPanel.options);
    document.body.appendChild(root);
    _aiPanel.rootEl = root;
    _aiPanel.originalParent = document.body;

    _aiPanelBindEvents();
    _aiPanelBindResize();
    _aiPanelSyncDockMode();
    _aiPanel.resizeHandler = _aiPanelSyncDockMode;
    window.addEventListener('resize', _aiPanel.resizeHandler);
    _aiPanelInitTokensBadgeTooltip();
}

function _aiPanelSyncDockMode() {
    var panel = _aiEl('ai-panel');
    var root = _aiPanel.rootEl;
    if (!panel || !root) return;

    var shouldDock = !!_aiPanel.options.dockDesktop &&
        window.matchMedia('(min-width: ' + (_aiPanel.options.dockBreakpoint || 1024) + 'px)').matches;

    if (shouldDock) {
        var host = document.querySelector(_aiPanel.options.dockContainerSelector || '.dashboard-container');
        if (host && root.parentNode !== host) host.appendChild(root);
        root.classList.add('ai-panel-root--docked');
        panel.classList.add('ai-panel--docked-desktop');
        return;
    }

    if (root.parentNode !== _aiPanel.originalParent && _aiPanel.originalParent) {
        _aiPanel.originalParent.appendChild(root);
    }
    root.classList.remove('ai-panel-root--docked');
    panel.classList.remove('ai-panel--docked-desktop');
}

// ---------------------------------------------------------------------------
// Eventos de interacción
// ---------------------------------------------------------------------------
function _aiPanelEnsureInputInteractive() {
    var input = _aiEl('ai-panel-input');
    if (!input) return;
    input.disabled = false;
    input.removeAttribute('readonly');
    input.removeAttribute('aria-disabled');
    input.style.pointerEvents = '';
    input.style.opacity = '';
}

function _aiPanelBindEvents() {
    // Cerrar
    var closeBtn = _aiEl('ai-panel-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeAIPanel);

    // Enviar con botón
    var sendBtn = _aiEl('ai-panel-send');
    if (sendBtn) sendBtn.addEventListener('click', _aiPanelSend);

    // Adjuntar
    var attachBtn = _aiEl('ai-panel-attach');
    if (attachBtn) attachBtn.addEventListener('click', function() {
        var fileInput = _aiEl('ai-panel-files');
        if (fileInput) {
            fileInput.click();
            return;
        }
        if (typeof _aiPanel.options.onAttach === 'function') _aiPanel.options.onAttach();
    });

    var fileInput = _aiEl('ai-panel-files');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            var files = this.files;
            if (!files || !files.length) return;
            var toLoad = 0;
            for (var i = 0; i < files.length; i++) {
                if (files[i].type && files[i].type.indexOf('image/') === 0) toLoad++;
            }
            var loaded = 0;
            for (var j = 0; j < files.length; j++) {
                var file = files[j];
                if (file.type && file.type.indexOf('image/') === 0) {
                    (function (f) {
                        var reader = new FileReader();
                        reader.onload = function() {
                            if (reader.result) _aiPanel.pendingImages.push(String(reader.result));
                            loaded++;
                            if (loaded >= toLoad) _renderAIPanelPendingImages();
                        };
                        reader.readAsDataURL(f);
                    })(file);
                } else {
                    _aiPanel.pendingFiles.push({ name: file.name, type: file.type, size: file.size });
                }
            }
            _renderAIPanelPendingFiles();
            this.value = '';
            if (typeof _aiPanel.options.onAttach === 'function') _aiPanel.options.onAttach();
        });
    }

    // Textarea: Enter envía, Shift+Enter nueva línea; auto-resize
    var input = _aiEl('ai-panel-input');
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _aiPanelSend(); }
        });
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 140) + 'px';
        });
        _aiPanelEnsureInputInteractive();
    }

    var inputBox = _aiEl('ai-panel-input-box');
    if (inputBox && input) {
        inputBox.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            if (e.target.closest('button')) return;
            if (e.target === input) return;
            requestAnimationFrame(function () {
                _aiPanelEnsureInputInteractive();
                try {
                    input.focus({ preventScroll: true });
                } catch (err) {
                    input.focus();
                }
            });
        });
    }

    // Escape cierra
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && _aiPanel.open) closeAIPanel();
    });

    // Acciones en mensajes IA (delegación)
    var messages = _aiEl('ai-panel-messages');
    if (messages) {
        messages.addEventListener('click', function(e) {
            var actionBtn = e.target.closest('[data-ai-panel-action]');
            if (!actionBtn) return;
            var action = actionBtn.getAttribute('data-ai-panel-action');
            var msgRoot = actionBtn.closest('.ai-panel__msg');
            var msgText = msgRoot ? (msgRoot.getAttribute('data-ai-text') || '') : '';

            if (action === 'copy') {
                _aiCopyText(msgText);
                return;
            }

        });
    }
}

function _buildAIPanelAttachmentsHtml(images, files) {
    var imagesHtml = (images || []).map(function(src) {
        return '<img src="' + _aiEscape(src) + '" alt="Imagen adjunta" class="ai-panel__msg-attachment-img" />';
    }).join('');
    var filesHtml = (files || []).map(function(f) {
        return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ai-panel__msg-file-chip"><i class="far fa-file-lines"></i><span class="ubits-chip__text">' + _aiEscape((f && f.name) ? f.name : 'Archivo') + '</span></span>';
    }).join('');
    var out = '';
    if (imagesHtml) out += '<div class="ai-panel__msg-attachments-images">' + imagesHtml + '</div>';
    if (filesHtml) out += '<div class="ai-panel__msg-attachments-files">' + filesHtml + '</div>';
    return out;
}

function _renderAIPanelPendingImages() {
    var strip = _aiEl('ai-panel-pending-images');
    if (!strip) return;
    if (!_aiPanel.pendingImages.length) {
        strip.innerHTML = '';
        strip.style.display = 'none';
        return;
    }
    strip.style.display = 'flex';
    strip.innerHTML = _aiPanel.pendingImages.map(function(src, idx) {
        return '<div class="ai-panel__pending-img-wrap">' +
            '<img src="' + _aiEscape(src) + '" alt="Imagen adjunta" class="ai-panel__pending-img" />' +
            '<button type="button" class="ai-panel__pending-img-remove" data-idx="' + idx + '" aria-label="Eliminar imagen"><i class="far fa-times"></i></button>' +
            '</div>';
    }).join('');
    strip.querySelectorAll('.ai-panel__pending-img-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = Number(btn.getAttribute('data-idx'));
            if (isNaN(idx)) return;
            _aiPanel.pendingImages.splice(idx, 1);
            _renderAIPanelPendingImages();
        });
    });
}

function _renderAIPanelPendingFiles() {
    var strip = _aiEl('ai-panel-pending-files');
    if (!strip) return;
    if (!_aiPanel.pendingFiles.length) {
        strip.innerHTML = '';
        strip.style.display = 'none';
        return;
    }
    strip.style.display = 'flex';
    strip.innerHTML = _aiPanel.pendingFiles.map(function(f, idx) {
        return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close ai-panel__pending-file-chip">' +
            '<i class="far fa-file-lines"></i><span class="ubits-chip__text">' + _aiEscape((f && f.name) ? f.name : 'Archivo') + '</span>' +
            '<button type="button" class="ubits-chip__close ai-panel__pending-file-remove" data-idx="' + idx + '" aria-label="Quitar archivo"><i class="far fa-times"></i></button>' +
            '</span>';
    }).join('');
    strip.querySelectorAll('.ai-panel__pending-file-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = Number(btn.getAttribute('data-idx'));
            if (isNaN(idx)) return;
            _aiPanel.pendingFiles.splice(idx, 1);
            _renderAIPanelPendingFiles();
        });
    });
}

function _aiPanelSend() {
    var input = _aiEl('ai-panel-input');
    if (!input) return;
    var text = input.value.trim();
    var hasAttachments = _aiPanel.pendingImages.length > 0 || _aiPanel.pendingFiles.length > 0;
    if (!text && !hasAttachments) return;
    addAIPanelMessage(text || 'Adjuntos', 'user', {
        images: _aiPanel.pendingImages.slice(),
        files: _aiPanel.pendingFiles.slice()
    });
    input.value = '';
    input.style.height = 'auto';
    _aiPanel.pendingImages = [];
    _aiPanel.pendingFiles = [];
    _renderAIPanelPendingImages();
    _renderAIPanelPendingFiles();
    if (typeof _aiPanel.options.onSend !== 'function') return;

    var messages = _aiEl('ai-panel-messages');
    if (window.UbitsIaChatStreaming && typeof window.UbitsIaChatStreaming.afterMinDelay === 'function' && messages) {
        messages.insertAdjacentHTML('beforeend', window.UbitsIaChatStreaming.thinkingIndicatorHtml('Pensando'));
        var thinkRow = messages.lastElementChild;
        if (thinkRow) thinkRow.id = 'ai-panel-typing';
        var scroll = _aiEl('ai-panel-scroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
        _aiPanelSyncScrollFade();
        var runAfterThink = function () {
            if (thinkRow && thinkRow.parentNode) thinkRow.remove();
            if (messages && window.UbitsIaChatStreaming.removeThinkingRows) {
                window.UbitsIaChatStreaming.removeThinkingRows(messages);
            }
            _aiPanelSyncScrollFade();
            try {
                var r = _aiPanel.options.onSend(text || 'Adjuntos');
                return r && typeof r.then === 'function' ? r : Promise.resolve(r);
            } catch (err) {
                return Promise.resolve();
            }
        };
        if (typeof window.UbitsIaChatStreaming.afterMinDelay === 'function') {
            window.UbitsIaChatStreaming.afterMinDelay(window.UbitsIaChatStreaming.MIN_THINKING_MS, runAfterThink).finally(function () {
                _aiPanelSyncScrollFade();
            });
        } else {
            setTimeout(function () {
                Promise.resolve(runAfterThink()).finally(function () {
                    _aiPanelSyncScrollFade();
                });
            }, window.UbitsIaChatStreaming.MIN_THINKING_MS || 1000);
        }
        return;
    }

    _aiPanel.options.onSend(text || 'Adjuntos');
}

// ---------------------------------------------------------------------------
// Resize con el mouse (arrastrar borde izquierdo)
// ---------------------------------------------------------------------------
function _aiPanelBindResize() {
    var handle = _aiEl('ai-panel-resize');
    var panel  = _aiEl('ai-panel');
    if (!handle || !panel) return;

    var startX = 0;
    var startW = 0;

    function onMouseMove(e) {
        var dx = startX - e.clientX;            // cuánto se movió hacia la izquierda
        var newW = Math.min(
            Math.max(startW + dx, parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ai-panel-width-min')) || 260),
            parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ai-panel-width-max')) || 600
        );
        panel.style.width = newW + 'px';
        _aiPanel.width = newW;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup',  onMouseUp);
        document.body.classList.remove('ai-panel-resizing');
        panel.classList.remove('resizing');
    }

    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX;
        startW = panel.offsetWidth;
        document.body.classList.add('ai-panel-resizing');
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
        var newW = Math.min(Math.max(startW + dx, 260), 600);
        panel.style.width = newW + 'px';
        _aiPanel.width = newW;
    }, { passive: true });

    handle.addEventListener('touchend', function() {
        panel.classList.remove('resizing');
    });
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------
function openAIPanel() {
    if (!_aiPanel.inited) { console.warn('[AIPanel] Llama initAIPanel() primero.'); return; }
    var panel = _aiEl('ai-panel');
    if (panel) panel.classList.add('active');
    _aiPanel.open = true;
    if (panel && panel.classList.contains('ai-panel--docked-desktop')) {
        panel.style.width = (_aiPanel.width && _aiPanel.width > 0 ? _aiPanel.width : (parseInt(getComputedStyle(panel).getPropertyValue('--ai-panel-width-default')) || 340)) + 'px';
    }
    setTimeout(function() {
        var input = _aiEl('ai-panel-input');
        _aiPanelEnsureInputInteractive();
        if (input) input.focus();
    }, 300);
}

function closeAIPanel() {
    var panel = _aiEl('ai-panel');
    if (panel) panel.classList.remove('active');
    if (panel && panel.classList.contains('ai-panel--docked-desktop')) {
        panel.style.width = '0px';
    }
    _aiPanel.open = false;
    if (typeof _aiPanel.options.onClose === 'function') _aiPanel.options.onClose();
}

function addAIPanelMessage(text, type, attachments, opts) {
    opts = opts || {};
    var welcome  = _aiEl('ai-panel-welcome');
    var messages = _aiEl('ai-panel-messages');
    if (!messages) return;

    if (welcome)  welcome.style.display  = 'none';
    messages.style.display = 'flex';

    var msgType = (type === 'user') ? 'user' : 'ai';
    var el = document.createElement('div');
    el.className = 'ai-panel__msg ai-panel__msg--' + msgType;
    if (msgType === 'user') {
        _aiPanel.lastUserMessage = String(text || '');
    }

    var sentAt = new Date();
    el.setAttribute('data-msg-at', sentAt.toISOString());
    var timeLabel = _aiEscape(_aiFormatMsgTimeLabel(sentAt));
    var copyBtn =
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" data-tooltip="Copiar" data-tooltip-delay="1000" data-ai-panel-action="copy" aria-label="Copiar">' +
            '<i class="far fa-copy"></i>' +
        '</button>';
    var showAiCopy = msgType === 'ai' && !opts.hideAiCopy;
    var footerHtml =
        '<div class="ai-panel__msg-footer ubits-ia-chat-thread__message-footer">' +
        '<span class="ai-panel__msg-time ubits-ia-chat-thread__timestamp">' + timeLabel + '</span>' +
        (showAiCopy
            ? '<div class="ai-panel__msg-actions ubits-ia-chat-thread__message-actions">' + copyBtn + '</div>'
            : '') +
        '</div>';

    el.setAttribute('data-ai-text', String(text || ''));
    var attHtml = _buildAIPanelAttachmentsHtml(attachments && attachments.images, attachments && attachments.files) || '';
    var useRichAi = msgType === 'ai' && opts.richHtml;
    var useStream = !useRichAi && msgType === 'ai' && window.UbitsIaChatStreaming && typeof window.UbitsIaChatStreaming.buildAiGlobeInnerHtmlFromPlainText === 'function';
    if (useRichAi) {
        el.innerHTML =
            '<div class="ai-panel__msg-bubble ai-panel__msg-bubble--rich">' + opts.richHtml + '</div>' +
            footerHtml;
    } else if (useStream) {
        el.classList.add('ubits-ia-chat-thread__message', 'ubits-ia-chat-thread__message--ai', 'ubits-ia-chat-thread__message--typing');
        var innerGlobe = window.UbitsIaChatStreaming.buildAiGlobeInnerHtmlFromPlainText(text) + attHtml;
        el.innerHTML =
            '<div class="ai-panel__msg-bubble ubits-ia-chat-thread__text-globe ubits-ia-chat-thread__text-globe--ai">' + innerGlobe + '</div>' +
            footerHtml;
    } else {
        el.innerHTML =
            '<div class="ai-panel__msg-bubble">' + _aiEscape(text) + attHtml + '</div>' +
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
        setTimeout(function () { window.initTooltip('#ai-panel [data-tooltip]'); }, 0);
    }

    var scroll = _aiEl('ai-panel-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    _aiPanelSyncScrollFade();
}

function showAIPanelTyping() {
    var welcome  = _aiEl('ai-panel-welcome');
    var messages = _aiEl('ai-panel-messages');
    if (!messages) return function() {};

    if (welcome)  welcome.style.display  = 'none';
    messages.style.display = 'flex';

    if (window.UbitsIaChatStreaming && typeof window.UbitsIaChatStreaming.thinkingIndicatorHtml === 'function') {
        messages.insertAdjacentHTML('beforeend', window.UbitsIaChatStreaming.thinkingIndicatorHtml('Pensando'));
        var row = messages.lastElementChild;
        if (row) row.id = 'ai-panel-typing';
    } else {
        var el = document.createElement('div');
        el.className = 'ai-panel__msg ai-panel__msg--ai';
        el.id = 'ai-panel-typing';
        el.innerHTML =
            '<div class="ai-panel__typing">' +
            '<span class="ai-panel__typing-dot"></span>' +
            '<span class="ai-panel__typing-dot"></span>' +
            '<span class="ai-panel__typing-dot"></span>' +
            '</div>';
        messages.appendChild(el);
    }
    var scroll = _aiEl('ai-panel-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    _aiPanelSyncScrollFade();

    return function() {
        var t = _aiEl('ai-panel-typing');
        if (t) t.remove();
        if (window.UbitsIaChatStreaming && window.UbitsIaChatStreaming.removeThinkingRows) {
            window.UbitsIaChatStreaming.removeThinkingRows(messages);
        }
        _aiPanelSyncScrollFade();
    };
}

function clearAIPanelMessages() {
    var welcome  = _aiEl('ai-panel-welcome');
    var messages = _aiEl('ai-panel-messages');
    if (messages) { messages.innerHTML = ''; messages.style.display = 'none'; }
    if (welcome)  welcome.style.display = 'flex';
    _aiPanelSyncScrollFade();
}

function setAIPanelTitle(title) {
    var el = _aiEl('ai-panel-title');
    if (el) el.textContent = title;
}

/** Actualiza el valor mostrado del badge de tokens (cabecera). No-op si `tokensBadge: false` o el nodo no existe. */
function setAIPanelTokensBadgeValue(value) {
    var n = parseInt(value, 10);
    if (isNaN(n) || n < 0) n = 0;
    var el = _aiEl('ai-panel-tokens-badge');
    if (!el) return;
    var numEl = el.querySelector('.ubits-badge-tag__token-number');
    if (numEl) numEl.textContent = String(n);
    el.setAttribute('aria-label', String(n) + ' tokens restantes');
    if (_aiPanel.options && _aiPanel.options.tokensBadge !== false) {
        if (_aiPanel.options.tokensBadge && typeof _aiPanel.options.tokensBadge === 'object') {
            _aiPanel.options.tokensBadge.value = n;
        }
    }
}

function destroyAIPanel() {
    var root = _aiEl('ai-panel-root');
    if (_aiPanel.resizeHandler) {
        window.removeEventListener('resize', _aiPanel.resizeHandler);
    }
    if (root) root.remove();
    _aiPanel.inited = false;
    _aiPanel.open   = false;
    _aiPanel.options = {};
    _aiPanel.width   = null;
    _aiPanel.lastUserMessage = '';
    _aiPanel.pendingImages = [];
    _aiPanel.pendingFiles = [];
    _aiPanel.rootEl = null;
    _aiPanel.resizeHandler = null;
    _aiPanel.originalParent = null;
}
