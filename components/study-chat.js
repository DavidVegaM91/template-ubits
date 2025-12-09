/* ========================================
   UBITS STUDY CHAT COMPONENT
   JavaScript para el chat de modo estudio IA
   ======================================== */

/**
 * Crea el HTML del chat de estudio
 * @returns {string} HTML del chat
 */
function createStudyChatHTML() {
    return `
        <div class="ubits-study-chat" id="ubits-study-chat">
            <!-- Body del chat -->
            <div class="ubits-study-chat__body" id="ubits-study-chat-body">
                <!-- Mensajes se renderizarán aquí -->
            </div>
            
            <!-- Área de input y sugerencias -->
            <div class="ubits-study-chat__input-area">
                <!-- Botones de sugerencias -->
                <div class="ubits-study-chat__suggestions" id="ubits-study-chat-suggestions">
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="contenidos">
                        <span>Sugerencias de contenidos</span>
                    </button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="plan">
                        <span>Crear plan de formación</span>
                    </button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="tutor">
                        <span>Sé mi tutor</span>
                    </button>
                </div>
                
                <!-- Input de chat -->
                <div class="ubits-study-chat__input-container">
                    <div class="ubits-study-chat__input-wrapper">
                        <textarea 
                            class="ubits-study-chat__input" 
                            id="ubits-study-chat-input"
                            placeholder="Escribe tu mensaje..."
                            rows="1"
                        ></textarea>
                    </div>
                    <div class="ubits-study-chat__input-actions">
                        <button class="ubits-study-chat__input-action-btn" id="ubits-study-chat-attach-btn" title="Adjuntar">
                            <i class="far fa-paperclip"></i>
                        </button>
                        <button class="ubits-study-chat__input-action-btn ubits-study-chat__input-action-btn--send" id="ubits-study-chat-send-btn" title="Enviar">
                            <i class="far fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Formatea la hora actual
 * @returns {string} Hora formateada (ej: "10:06 am")
 */
function formatTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Crea el HTML de un mensaje
 * @param {string} type - Tipo de mensaje: 'ai' o 'user'
 * @param {string} text - Texto del mensaje
 * @param {string} timestamp - Timestamp del mensaje
 * @param {boolean} showActions - Si mostrar botones de acción (solo para IA)
 * @param {boolean} isTyping - Si es un mensaje de carga/typing
 * @returns {string} HTML del mensaje
 */
function createMessageHTML(type, text, timestamp, showActions = false, isTyping = false) {
    const messageClass = type === 'ai' ? 'ubits-study-chat__message--ai' : 'ubits-study-chat__message--user';
    const globeClass = type === 'ai' 
        ? (isTyping ? 'ubits-study-chat__text-globe--ai ubits-study-chat__text-globe--typing' : 'ubits-study-chat__text-globe--ai')
        : 'ubits-study-chat__text-globe--user';
    
    let textHTML = '';
    if (isTyping) {
        textHTML = `
            <div class="ubits-study-chat__typing-icon">
                <i class="far fa-ellipsis"></i>
            </div>
            <p class="ubits-study-chat__typing-text">Espera por favor...</p>
        `;
    } else {
        textHTML = `<p class="ubits-study-chat__message-text">${text}</p>`;
    }
    
    const actionsHTML = (type === 'ai' && showActions && !isTyping) ? `
        <div class="ubits-study-chat__message-actions">
            <button class="ubits-study-chat__action-btn" title="Copiar">
                <i class="far fa-copy"></i>
            </button>
            <button class="ubits-study-chat__action-btn" title="Regenerar">
                <i class="far fa-arrows-rotate"></i>
            </button>
        </div>
    ` : '';
    
    return `
        <div class="ubits-study-chat__message ${messageClass}">
            <div class="ubits-study-chat__text-globe ${globeClass}">
                ${textHTML}
            </div>
            <p class="ubits-study-chat__timestamp">${timestamp}</p>
            ${actionsHTML}
        </div>
    `;
}

/**
 * Agrega un mensaje al chat
 * @param {string} type - Tipo de mensaje: 'ai' o 'user'
 * @param {string} text - Texto del mensaje
 * @param {boolean} showActions - Si mostrar botones de acción (solo para IA)
 */
function addMessage(type, text, showActions = false) {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    const timestamp = formatTime();
    const messageHTML = createMessageHTML(type, text, timestamp, showActions, false);
    body.insertAdjacentHTML('beforeend', messageHTML);
    
    // Scroll al final
    body.scrollTop = body.scrollHeight;
    
    // Agregar event listeners a los botones de acción
    if (type === 'ai' && showActions) {
        const messageElement = body.lastElementChild;
        const copyBtn = messageElement.querySelector('.ubits-study-chat__action-btn[title="Copiar"]');
        const regenerateBtn = messageElement.querySelector('.ubits-study-chat__action-btn[title="Regenerar"]');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(text).then(() => {
                    // Opcional: mostrar toast de confirmación
                    console.log('Mensaje copiado');
                });
            });
        }
        
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', function() {
                // Por ahora solo log, la funcionalidad de regenerar se implementará después
                console.log('Regenerar mensaje');
            });
        }
    }
}

/**
 * Muestra un mensaje de typing (carga)
 */
function showTypingMessage() {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    const timestamp = formatTime();
    const messageHTML = createMessageHTML('ai', '', timestamp, false, true);
    body.insertAdjacentHTML('beforeend', messageHTML);
    body.scrollTop = body.scrollHeight;
    
    return body.lastElementChild;
}

/**
 * Remueve el mensaje de typing
 */
function removeTypingMessage() {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    const typingMessage = body.querySelector('.ubits-study-chat__text-globe--typing');
    if (typingMessage) {
        typingMessage.closest('.ubits-study-chat__message').remove();
    }
}

/**
 * Inicializa el chat de estudio
 * @param {string} containerId - ID del contenedor donde se renderizará el chat
 */
function initStudyChat(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`UBITS Study Chat: No se encontró el contenedor con ID "${containerId}"`);
        return;
    }
    
    // Renderizar HTML
    container.innerHTML = createStudyChatHTML();
    
    // Mensaje de bienvenida
    addMessage('ai', '¡Hola! ¿En qué puedo ayudarte?', true);
    
    // Event listeners
    const input = document.getElementById('ubits-study-chat-input');
    const sendBtn = document.getElementById('ubits-study-chat-send-btn');
    const attachBtn = document.getElementById('ubits-study-chat-attach-btn');
    const suggestionBtns = document.querySelectorAll('.ubits-study-chat__suggestions .ubits-button');
    
    // Auto-resize del textarea
    if (input) {
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // Enviar con Enter (sin Shift)
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Botón enviar
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // Botón adjuntar (por ahora solo log)
    if (attachBtn) {
        attachBtn.addEventListener('click', function() {
            console.log('Adjuntar archivo');
        });
    }
    
    // Botones de sugerencias
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const suggestion = this.getAttribute('data-suggestion');
            let message = '';
            
            switch(suggestion) {
                case 'contenidos':
                    message = 'Sugerencias de contenidos';
                    break;
                case 'plan':
                    message = 'Crear plan de formación';
                    break;
                case 'tutor':
                    message = 'Sé mi tutor';
                    break;
            }
            
            if (message) {
                // Agregar mensaje del usuario
                addMessage('user', message);
                
                // Mostrar typing
                const typingElement = showTypingMessage();
                
                // Simular respuesta de IA (por ahora solo un placeholder)
                setTimeout(() => {
                    removeTypingMessage();
                    // Por ahora no agregamos respuesta de IA
                    // addMessage('ai', 'Respuesta de IA...', true);
                }, 1000);
            }
        });
    });
    
    // Función para enviar mensaje
    function sendMessage() {
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        
        // Agregar mensaje del usuario
        addMessage('user', message);
        
        // Limpiar input
        input.value = '';
        input.style.height = 'auto';
        
        // Mostrar typing
        const typingElement = showTypingMessage();
        
        // Simular respuesta de IA (por ahora solo remover typing después de un delay)
        setTimeout(() => {
            removeTypingMessage();
            // Por ahora no agregamos respuesta de IA
            // addMessage('ai', 'Respuesta de IA...', true);
        }, 1000);
    }
}

// Exportar funciones para uso global
window.initStudyChat = initStudyChat;
window.addMessage = addMessage;
window.showTypingMessage = showTypingMessage;
window.removeTypingMessage = removeTypingMessage;

