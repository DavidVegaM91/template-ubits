/* ========================================
   UBITS GROUP CREATION CHAT
   Chat para creación/edición/consulta de grupos (IA).
   Misma estructura visual que el hilo en study-chat.js; estilos en general-styles/ubits-ia-chat.css
   (components/study-chat.css reexporta ese shell por compatibilidad).
   ======================================== */

function escapeHtml(str) {
    if (str == null || str === '') return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Genera el HTML de un mensaje (misma estructura que el hilo de chat IA para reutilizar CSS).
 */
function createGroupChatMessageHTML(type, text) {
    var messageClass = type === 'ai' ? 'ubits-ia-chat-thread__message--ai' : 'ubits-ia-chat-thread__message--user';
    var globeClass = type === 'ai' ? 'ubits-ia-chat-thread__text-globe--ai' : 'ubits-ia-chat-thread__text-globe--user';
    var safeText = escapeHtml(text).replace(/\n/g, '<br>');
    var lines = text.split('\n').filter(function (l) { return l.trim(); });
    var textHTML = lines.length ? lines.map(function (line) {
        return '<p class="ubits-ia-chat-thread__message-text">' + escapeHtml(line) + '</p>';
    }).join('') : '<p class="ubits-ia-chat-thread__message-text">' + safeText + '</p>';
    return '<div class="ubits-ia-chat-thread__message ' + messageClass + '">' +
        '<div class="ubits-ia-chat-thread__text-globe ' + globeClass + '">' + textHTML + '</div></div>';
}

/**
 * Crea el HTML del chat de creación de grupos.
 * Misma estructura que study-chat: header visible también en bienvenida; barra welcome-top oculta en bienvenida por defecto.
 */
function createGroupCreationChatHTML(options) {
    options = options || {};
    var headerStyle = (options.welcomeLayout !== false) ? '' : 'display: none;';
    var userFirstName = escapeHtml(options.userFirstName || 'María Alejandra');
    var suggestionButtons = '<span class="ubits-ia-chat-thread__suggestions-label ubits-body-xs-regular">Puedo ayudarte a:</span>' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="crear"><span>Crear grupos</span></button>' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="editar"><span>Editar grupos</span></button>' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="consultar"><span>Consultar grupos</span></button>';
    var welcomeBlock = '<div class="ubits-ia-chat-thread__welcome-wrapper" id="group-creation-chat-welcome">' +
        '<div class="ubits-ia-chat-thread__welcome">' +
        '<div class="ubits-ia-chat-thread__welcome-head">' +
        '<div class="ubits-ia-chat-thread__welcome-icon"><i class="far fa-sparkles"></i></div>' +
        '<p class="ubits-ia-chat-thread__welcome-greeting">Hola, ' + userFirstName + '</p>' +
        '</div>' +
        '<p class="ubits-ia-chat-thread__welcome-prompt">¿En qué puedo ayudarte con <span class="ubits-ia-chat-thread__welcome-prompt-accent">grupos</span>?</p>' +
        '</div></div>';
    /* En bienvenida no se muestran Ver historial ni Nuevo chat (como modo-estudio-ia cuando no hay conversaciones) */
    var welcomeTopBar = '<div class="ubits-ia-chat-thread__welcome-top" id="group-creation-chat-welcome-top" style="display: none;">' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="group-creation-chat-btn-historial" aria-label="Ver historial de chats">' +
        '<i class="far fa-clock-rotate-left"></i><span>Ver historial</span></button>' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="group-creation-chat-btn-nuevo" aria-label="Iniciar nuevo chat">' +
        '<i class="far fa-comment-plus"></i><span>Nuevo chat</span></button>' +
        '</div>';
    var headerBar = '<div class="ubits-ia-chat-thread__header" id="group-creation-chat-header" style="' + headerStyle + '" aria-label="Encabezado del chat">' +
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-ia-chat-thread__header-back-mobile" id="group-creation-chat-header-back-mobile" data-tooltip="Volver" data-tooltip-position="bottom" aria-label="Volver a grupos">' +
        '<i class="far fa-arrow-left"></i></button>' +
        '<input type="text" class="ubits-ia-chat-thread__header-title" id="group-creation-chat-header-title" value="" placeholder="Nuevo chat" maxlength="80" aria-label="Nombre del chat" />' +
        '<div class="ubits-ia-chat-thread__header-actions">' +
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="group-creation-chat-btn-historial-header" data-tooltip="Historial" data-tooltip-position="bottom" aria-label="Abrir historial de chats">' +
        '<i class="far fa-clock-rotate-left"></i></button>' +
        '</div></div>';
    return '<div class="ubits-ia-chat-thread ubits-ia-chat-thread--welcome" id="group-creation-chat">' +
        headerBar +
        welcomeTopBar +
        '<div class="ubits-ia-chat-thread__body" id="group-creation-chat-body">' + welcomeBlock + '</div>' +
        '<div class="ubits-ia-chat-thread__input-area">' +
        '<div class="ubits-ia-chat-thread__input-container">' +
        '<div class="ubits-ia-chat-thread__input-wrapper">' +
        '<textarea class="ubits-ia-chat-thread__input" id="group-creation-chat-input" placeholder="Escribir mensaje..." rows="1"></textarea>' +
        '</div>' +
        '<div class="ubits-ia-chat-thread__input-actions">' +
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-ia-chat-thread__input-attach" id="group-creation-chat-attach-btn" data-tooltip="Adjuntar" aria-label="Adjuntar"><i class="far fa-paperclip"></i></button>' +
        '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm ubits-ia-button--icon-only ubits-ia-chat-thread__input-send" id="group-creation-chat-send-btn" data-tooltip="Enviar" aria-label="Enviar"><i class="far fa-paper-plane"></i></button>' +
        '</div></div>' +
        '<div class="ubits-ia-chat-thread__suggestions" id="group-creation-chat-suggestions">' + suggestionButtons + '</div>' +
        '</div>' +
        '<p class="ubits-ia-chat-thread__disclaimer ubits-body-xs-regular">El chat puede cometer errores; verifica la información.</p>' +
        '</div>';
}

/** Configuración de cada opción rápida: mensaje intro + subopciones (botones apilados) */
var MAIN_OPTIONS_CONFIG = {
    crear: {
        introMessage: '¡Sí, encantado! Dentro de esta opción te puedo ayudar a:',
        subOptions: [
            { key: 'crear-personalizados', label: 'Crear grupos personalizados' },
            { key: 'crear-por-area', label: 'Crear grupos por área' },
            { key: 'crear-por-cargo', label: 'Crear grupos por cargo' }
        ]
    },
    editar: {
        introMessage: '¡Sí, encantado! Dentro de esta opción te puedo ayudar a:',
        subOptions: [
            { key: 'editar-agregar-usuarios', label: 'Agregar usuarios a un grupo' },
            { key: 'editar-eliminar-usuarios', label: 'Eliminar usuarios de un grupo' },
            { key: 'editar-recomendar-optimizacion', label: 'Recomendar optimización estratégica' }
        ]
    },
    consultar: {
        introMessage: '¡Sí, encantado! Dentro de esta opción te puedo ayudar a:',
        subOptions: [
            { key: 'consultar-detalles', label: 'Ver detalles de un grupo existente' },
            { key: 'consultar-alguien-no-en-grupo', label: 'Consultar si alguien no está en un grupo' },
            { key: 'consultar-listar-todos', label: 'Listar todos los grupos existentes' }
        ]
    }
};

/** Respuesta placeholder por subopción (se sustituirán por los copy que proporciones después) */
function getSubOptionResponse(subKey) {
    return 'Próximamente te daré la información detallada para esta opción.';
}

/** Respuesta mock por mensaje de usuario libre (no opción rápida) */
function getMockResponse(suggestionKey, userMessage) {
    return 'Estoy aquí para ayudarte con la creación, edición o consulta de grupos. ¿Qué necesitas hacer?';
}

/** Estado del chat de grupos (historial y chat actual) */
var groupCreationState = {
    chats: [],
    currentChat: { id: null, title: '', createdAt: 0, lastInteractedAt: 0, messages: [] }
};

function formatGroupCreationHistorialDate(timestamp) {
    if (!timestamp) return '';
    var d = new Date(timestamp);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    var dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dDay.getTime() === today.getTime()) return 'Hoy';
    if (dDay.getTime() === yesterday.getTime()) return 'Ayer';
    var months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

/**
 * Inicializa el chat de creación de grupos en el contenedor dado.
 * @param {string} containerId - ID del elemento contenedor (ej. 'group-creation-chat-container').
 * @param {Object} [options] - Opciones: welcomeLayout (boolean, default true).
 */
function initGroupCreationChat(containerId, options) {
    options = options || {};
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = createGroupCreationChatHTML(options);

    var root = document.getElementById('group-creation-chat');
    var body = document.getElementById('group-creation-chat-body');
    var welcome = document.getElementById('group-creation-chat-welcome');
    var welcomeTop = document.getElementById('group-creation-chat-welcome-top');
    var headerEl = document.getElementById('group-creation-chat-header');
    var input = document.getElementById('group-creation-chat-input');
    var sendBtn = document.getElementById('group-creation-chat-send-btn');
    var suggestionsEl = document.getElementById('group-creation-chat-suggestions');

    var wrapper = root && (root.closest('.ubits-ia-chat__main') || root.closest('.ubits-ia-chat__main--welcome') || root.parentElement);

    if (options.welcomeLayout !== false && root) {
        root.classList.add('ubits-ia-chat-thread--welcome');
        if (wrapper && wrapper.classList) wrapper.classList.add('ubits-ia-chat__main--welcome');
    }

    function hideWelcome() {
        if (welcome) welcome.classList.add('ubits-ia-chat-thread__welcome--hidden');
        if (suggestionsEl) suggestionsEl.classList.add('ubits-ia-chat-thread__suggestions--hidden');
        if (welcomeTop) welcomeTop.style.display = 'none';
        if (headerEl) headerEl.style.display = '';
        if (root) {
            root.classList.remove('ubits-ia-chat-thread--welcome');
            if (wrapper && wrapper.classList) wrapper.classList.remove('ubits-ia-chat__main--welcome');
        }
    }

    function showWelcome() {
        if (headerEl) {
            headerEl.style.display = '';
            var ht = document.getElementById('group-creation-chat-header-title');
            if (ht) ht.value = '';
        }
        if (welcomeTop) welcomeTop.style.display = 'none'; /* En bienvenida no se muestran Ver historial / Nuevo chat */
        if (welcome) {
            welcome.classList.remove('ubits-ia-chat-thread__welcome--hidden');
        }
        if (suggestionsEl) suggestionsEl.classList.remove('ubits-ia-chat-thread__suggestions--hidden');
        if (body) {
            var children = Array.prototype.slice.call(body.children);
            children.forEach(function (el) {
                if (el.id !== 'group-creation-chat-welcome') el.remove();
            });
        }
        if (root) {
            root.classList.add('ubits-ia-chat-thread--welcome');
            if (wrapper && wrapper.classList) wrapper.classList.add('ubits-ia-chat__main--welcome');
        }
    }

    function pushCurrentMessage(type, text) {
        if (!groupCreationState.currentChat.messages) groupCreationState.currentChat.messages = [];
        var hadUserMessageBefore = groupCreationState.currentChat.messages.some(function (m) { return m.type === 'user'; });
        groupCreationState.currentChat.messages.push({ type: type, text: text || '' });
        groupCreationState.currentChat.lastInteractedAt = Date.now();
        /* El título del chat es el primer mensaje que escribe el usuario */
        var isFirstUserMessage = type === 'user' && !hadUserMessageBefore && text;
        if (isFirstUserMessage) {
            var title = String(text).trim();
            groupCreationState.currentChat.title = title.length > 40 ? title.substring(0, 40) + '…' : title;
            groupCreationState.currentChat.createdAt = Date.now();
            if (groupCreationState.currentChat.id == null) groupCreationState.currentChat.id = 'gc-' + Date.now();
            var headerTitleEl = document.getElementById('group-creation-chat-header-title');
            if (headerTitleEl) headerTitleEl.value = groupCreationState.currentChat.title || '';
        }
        refreshGroupCreationHistorialIfOpen();
    }

    function saveCurrentChatIfHasMessages() {
        var cur = groupCreationState.currentChat;
        if (!cur || !cur.messages || !cur.messages.some(function (m) { return m.type === 'user'; })) return;
        var now = Date.now();
        var chatCopy = {
            id: cur.id,
            title: cur.title || 'Nuevo chat',
            createdAt: cur.createdAt || now,
            lastInteractedAt: cur.lastInteractedAt || now,
            messages: cur.messages.slice()
        };
        if (!groupCreationState.chats) groupCreationState.chats = [];
        var idx = groupCreationState.chats.findIndex(function (c) { return c.id === chatCopy.id; });
        if (idx >= 0) groupCreationState.chats[idx] = chatCopy; else groupCreationState.chats.push(chatCopy);
    }

    function refreshGroupCreationHistorialIfOpen() {
        var panel = document.getElementById('group-creation-historial-panel');
        if (panel) renderGroupCreationHistorialList();
    }

    function renderGroupCreationChatMessages(messages) {
        if (!body) return;
        var welcome = document.getElementById('group-creation-chat-welcome');
        var toRemove = [];
        for (var i = 0; i < body.children.length; i++) {
            if (body.children[i] !== welcome) toRemove.push(body.children[i]);
        }
        toRemove.forEach(function (el) { el.remove(); });
        (messages || []).forEach(function (msg) {
            if (msg.type !== 'user' && msg.type !== 'ai') return;
            var html = createGroupChatMessageHTML(msg.type, msg.text || '');
            var div = document.createElement('div');
            div.innerHTML = html;
            while (div.firstChild) body.appendChild(div.firstChild);
        });
        body.scrollTop = body.scrollHeight;
    }

    function renderGroupCreationHistorialList() {
        var listEl = document.getElementById('group-creation-historial-list');
        var emptyEl = document.getElementById('group-creation-historial-empty');
        if (!listEl || !emptyEl) return;
        var cur = groupCreationState.currentChat;
        var currentId = (cur && cur.id) ? cur.id : null;
        var hasCurrent = cur && cur.messages && cur.messages.length > 0;
        var saved = (groupCreationState.chats || []).slice();
        if (hasCurrent && currentId) saved = saved.filter(function (c) { return c.id !== currentId; });
        var items = hasCurrent ? [cur].concat(saved) : saved;
        var sortTime = function (c) { return c.lastInteractedAt || c.createdAt || 0; };
        items.sort(function (a, b) { return sortTime(b) - sortTime(a); });
        var footerNuevoChat = document.getElementById('group-creation-historial-panel-nuevo-chat');
        if (footerNuevoChat) footerNuevoChat.disabled = items.length === 0;
        if (items.length === 0) {
            if (typeof loadEmptyState === 'function') {
                loadEmptyState('group-creation-historial-empty-state-container', {
                    icon: 'fa-comments',
                    title: 'No hay conversaciones',
                    description: 'Aún no hay chats en esta sesión. Inicia uno desde el chat.'
                });
            }
            emptyEl.style.display = 'flex';
            listEl.innerHTML = '';
            listEl.style.display = 'none';
            return;
        }
        emptyEl.style.display = 'none';
        listEl.style.display = 'flex';
        var html = '';
        items.forEach(function (chat) {
            var id = chat.id || '';
            var title = (chat.title || 'Nuevo chat').replace(/</g, '&lt;').replace(/"/g, '&quot;');
            var isActive = id && currentId === id;
            var activeClass = isActive ? ' ubits-ia-chat-historial-item--active' : '';
            var dateLabel = formatGroupCreationHistorialDate(chat.createdAt || chat.lastInteractedAt || 0);
            var dateEscaped = dateLabel.replace(/</g, '&lt;').replace(/"/g, '&quot;');
            var descriptionEscaped = 'Chat sobre grupos'.replace(/</g, '&lt;').replace(/"/g, '&quot;');
            html += '<div class="ubits-ia-chat-historial-item' + activeClass + '" data-chat-id="' + id + '" role="button" tabindex="0"' + (isActive ? ' aria-current="true"' : '') + '>' +
                '<div class="ubits-ia-chat-historial-item__content">' +
                '<span class="ubits-body-sm-regular ubits-ia-chat-historial-item__title">' + title + '</span>' +
                '<span class="ubits-body-sm-regular ubits-ia-chat-historial-item__description">' + descriptionEscaped + '</span>' +
                (dateEscaped ? '<span class="ubits-body-sm-regular ubits-ia-chat-historial-item__date">' + dateEscaped + '</span>' : '') +
                '</div>' +
                '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--xs ubits-button--icon-only ubits-ia-chat-historial-item__delete" data-delete-chat-id="' + id + '" aria-label="Eliminar chat" data-tooltip="Eliminar">' +
                '<i class="far fa-trash"></i></button>' +
                '</div>';
        });
        listEl.innerHTML = html;

        listEl.querySelectorAll('.ubits-ia-chat-historial-item').forEach(function (item) {
            item.addEventListener('click', function (e) {
                if (e.target.closest('.ubits-ia-chat-historial-item__delete')) return;
                var chatId = this.getAttribute('data-chat-id');
                if (!chatId) return;
                if (chatId === currentId) {
                    if (cur) cur.lastInteractedAt = Date.now();
                    renderGroupCreationHistorialList();
                    return;
                }
                saveCurrentChatIfHasMessages();
                var chat = (groupCreationState.chats || []).find(function (c) { return c.id === chatId; });
                if (!chat) return;
                var now = Date.now();
                var chatInList = groupCreationState.chats.findIndex(function (c) { return c.id === chatId; });
                if (chatInList >= 0) groupCreationState.chats[chatInList].lastInteractedAt = now;
                groupCreationState.currentChat = {
                    id: chat.id,
                    title: chat.title || '',
                    createdAt: chat.createdAt || 0,
                    lastInteractedAt: now,
                    messages: (chat.messages || []).slice()
                };
                var headerTitleEl = document.getElementById('group-creation-chat-header-title');
                if (headerTitleEl) headerTitleEl.value = groupCreationState.currentChat.title || '';
                renderGroupCreationChatMessages(groupCreationState.currentChat.messages);
                hideWelcome();
                renderGroupCreationHistorialList();
            });
        });
        listEl.querySelectorAll('.ubits-ia-chat-historial-item__delete').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var chatId = this.getAttribute('data-delete-chat-id');
                if (!chatId) return;
                saveCurrentChatIfHasMessages();
                groupCreationState.chats = (groupCreationState.chats || []).filter(function (c) { return c.id !== chatId; });
                if (groupCreationState.currentChat && groupCreationState.currentChat.id === chatId) {
                    groupCreationState.currentChat = { id: null, title: '', createdAt: 0, lastInteractedAt: 0, messages: [] };
                    showWelcome();
                }
                renderGroupCreationHistorialList();
            });
        });
        if (typeof window.initTooltip === 'function') window.initTooltip('#group-creation-historial-list [data-tooltip]');
    }

    /** Guarda el título editado en el encabezado: actualiza currentChat y el chat en historial, re-renderiza la lista (como modo estudio IA). */
    function commitGroupCreationChatHeaderTitle() {
        var headerTitle = document.getElementById('group-creation-chat-header-title');
        var cur = groupCreationState.currentChat;
        if (!headerTitle || !cur || !cur.id) return;
        var raw = (headerTitle.value || '').trim();
        var title = raw.length > 0 ? (raw.length > 80 ? raw.substring(0, 80) : raw) : 'Nuevo chat';
        headerTitle.value = title;
        cur.title = title;
        if (groupCreationState.chats) {
            var idx = groupCreationState.chats.findIndex(function (c) { return c.id === cur.id; });
            if (idx >= 0) groupCreationState.chats[idx].title = title;
        }
        renderGroupCreationHistorialList();
    }

    function appendMessage(type, text) {
        pushCurrentMessage(type, text);
        var html = createGroupChatMessageHTML(type, text);
        if (body) {
            var div = document.createElement('div');
            div.innerHTML = html;
            while (div.firstChild) body.appendChild(div.firstChild);
            body.scrollTop = body.scrollHeight;
        }
    }

    function sendMessage() {
        var text = (input && input.value) ? input.value.trim() : '';
        if (!text) return;
        hideWelcome();
        appendMessage('user', text);
        if (input) input.value = '';
        if (input && input.style) input.style.height = 'auto';
        appendMessage('ai', getMockResponse(null, text));
    }

    function appendSubOptionsBlock(subOptions) {
        if (!body || !subOptions || !subOptions.length) return;
        var aiMessages = body.querySelectorAll('.ubits-ia-chat-thread__message--ai');
        var lastAiMessage = aiMessages.length ? aiMessages[aiMessages.length - 1] : null;
        var globe = lastAiMessage ? lastAiMessage.querySelector('.ubits-ia-chat-thread__text-globe') : null;
        if (!globe) return;
        var wrap = document.createElement('div');
        wrap.className = 'ubits-ia-chat-thread__sub-options-wrap';
        var inner = document.createElement('div');
        inner.className = 'ubits-ia-chat-thread__sub-options';
        subOptions.forEach(function (opt) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ubits-button ubits-button--secondary ubits-button--sm';
            btn.setAttribute('data-sub-option', opt.key);
            btn.innerHTML = '<span>' + escapeHtml(opt.label) + '</span>';
            btn.addEventListener('click', function () {
                var key = this.getAttribute('data-sub-option');
                var label = (this.querySelector('span') && this.querySelector('span').textContent) || this.textContent.trim();
                appendMessage('user', label);
                appendMessage('ai', getSubOptionResponse(key));
                wrap.classList.add('ubits-ia-chat-thread__sub-options-wrap--used');
            });
            inner.appendChild(btn);
        });
        wrap.appendChild(inner);
        globe.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
    }

    function onSuggestionClick(suggestionKey, label) {
        hideWelcome();
        appendMessage('user', label);
        var config = MAIN_OPTIONS_CONFIG[suggestionKey];
        if (config) {
            appendMessage('ai', config.introMessage);
            appendSubOptionsBlock(config.subOptions);
        } else {
            appendMessage('ai', getMockResponse(suggestionKey));
        }
    }

    var MAX_INPUT_HEIGHT = 144;
    if (input) {
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, MAX_INPUT_HEIGHT) + 'px';
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);

    var suggestionBtns = suggestionsEl ? suggestionsEl.querySelectorAll('.ubits-button[data-suggestion]') : [];
    suggestionBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var key = this.getAttribute('data-suggestion');
            var label = (this.querySelector('span') && this.querySelector('span').textContent) || this.textContent.trim();
            onSuggestionClick(key, label);
        });
    });

    function onNuevoChat() {
        saveCurrentChatIfHasMessages();
        groupCreationState.currentChat = { id: null, title: '', createdAt: 0, lastInteractedAt: 0, messages: [] };
        showWelcome();
        renderGroupCreationHistorialList();
    }
    function onVerHistorial() {
        var panel = document.getElementById('group-creation-historial-panel');
        if (panel) {
            panel.classList.add('is-open');
            if (typeof window.openIaChatMobileDrawer === 'function') {
                window.openIaChatMobileDrawer();
            }
            renderGroupCreationHistorialList();
        }
    }

    var btnHistorialWelcome = document.getElementById('group-creation-chat-btn-historial');
    var btnNuevoWelcome = document.getElementById('group-creation-chat-btn-nuevo');
    var btnHistorialHeader = document.getElementById('group-creation-chat-btn-historial-header');
    if (btnHistorialWelcome) btnHistorialWelcome.addEventListener('click', onVerHistorial);
    if (btnNuevoWelcome) btnNuevoWelcome.addEventListener('click', onNuevoChat);
    if (btnHistorialHeader) btnHistorialHeader.addEventListener('click', onVerHistorial);
    var headerBackMobile = document.getElementById('group-creation-chat-header-back-mobile');
    if (headerBackMobile) {
        headerBackMobile.addEventListener('click', function () {
            window.location.href = 'grupos.html';
        });
    }
    var btnHistorialNuevoChat = document.getElementById('group-creation-historial-panel-nuevo-chat');
    if (btnHistorialNuevoChat) btnHistorialNuevoChat.addEventListener('click', onNuevoChat);

    if (typeof window.initTooltip === 'function') {
        window.initTooltip('#group-creation-chat [data-tooltip]');
    }

    var headerTitleInput = document.getElementById('group-creation-chat-header-title');
    if (headerTitleInput) {
        headerTitleInput.addEventListener('blur', commitGroupCreationChatHeaderTitle);
        headerTitleInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                headerTitleInput.blur();
            }
        });
    }

    renderGroupCreationHistorialList();
}

window.createGroupCreationChatHTML = createGroupCreationChatHTML;
window.initGroupCreationChat = initGroupCreationChat;
