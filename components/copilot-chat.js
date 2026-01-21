/* ========================================
   COPILOT CHAT COMPONENT
   JavaScript para el chat flotante lateral
   ======================================== */

// Estado del chat
let copilotChatOpen = false;
let copilotChatExpanded = false;
let copilotMessages = [];
let currentView = 'chat'; // 'chat' o 'history'

// Función para crear mensaje de bienvenida
function createWelcomeMessage() {
    return {
        type: 'ai',
        text: '¡Hola! 👋 Soy tu asistente de UBITS. Estoy aquí para ayudarte con cualquier consulta que tengas. ¿En qué puedo asistirte hoy?',
        timestamp: new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        })
    };
}

// Datos de historial de ejemplo
const historyData = [
    {
        id: 1,
        title: 'Optimización de rendimiento',
        timestamp: '26 Sept, 10:05',
        preview: '¿Cómo puedo mejorar el rendimiento...'
    },
    {
        id: 2,
        title: 'Configuración de base de datos',
        timestamp: '25 Sept, 15:30',
        preview: 'Necesito ayuda con la configuración...'
    },
    {
        id: 3,
        title: 'Implementación de autenticación',
        timestamp: '24 Sept, 09:15',
        preview: '¿Cuál es la mejor práctica para...'
    },
    {
        id: 4,
        title: 'Diseño responsive',
        timestamp: '23 Sept, 14:20',
        preview: 'Cómo hacer que mi app sea responsive...'
    },
    {
        id: 5,
        title: 'Integración de APIs',
        timestamp: '22 Sept, 11:45',
        preview: 'Tengo problemas con la integración...'
    }
];

/**
 * Crea el HTML del historial
 * @returns {string} HTML del historial
 */
function createHistoryHTML() {
    return `
        <!-- Historial de chats -->
        <div class="copilot-history" id="copilot-history-view">
            <!-- Header del historial -->
            <div class="copilot-history-header">
                <h3 class="copilot-history-title">Historial de chats</h3>
                <button class="copilot-new-chat-btn" id="copilot-new-chat-history">
                    <i class="far fa-comment"></i>
                    <span>Nuevo chat</span>
                </button>
            </div>
            
            <!-- Lista de chats -->
            <div class="copilot-history-list">
                ${historyData.map(chat => `
                    <div class="copilot-history-item" data-chat-id="${chat.id}">
                        <div class="copilot-history-content">
                            <h4 class="copilot-history-item-title">${chat.title}</h4>
                            <div class="copilot-history-timestamp">
                                <i class="far fa-clock"></i>
                                <span>${chat.timestamp}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Crea el HTML del chat flotante
 * @returns {string} HTML del chat
 */
function createCopilotChatHTML() {
    return `
        <!-- Chat flotante -->
        <div class="copilot-chat" id="copilot-chat">
            <!-- Header -->
            <div class="copilot-header">
                <h3 class="copilot-title">Asistente UBITS</h3>
                <div class="copilot-actions">
                    <button class="copilot-action-btn" id="copilot-new-chat" title="Nuevo chat">
                        <i class="far fa-comment"></i>
                    </button>
                    <button class="copilot-action-btn" id="copilot-history" title="Historial">
                        <i class="far fa-clock"></i>
                    </button>
                    <button class="copilot-action-btn" id="copilot-expand" title="Expandir">
                        <i class="far fa-expand"></i>
                    </button>
                    <button class="copilot-action-btn" id="copilot-close" title="Cerrar">
                        <i class="far fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Área de chat -->
            <div class="copilot-chat-body" id="copilot-chat-body">
                <div class="copilot-messages" id="copilot-messages">
                    <!-- Los mensajes se cargarán aquí -->
                </div>
                <!-- Vista de historial (oculta por defecto) -->
                <div class="copilot-history-container" id="copilot-history-container" style="display: none;">
                    ${createHistoryHTML()}
                </div>
            </div>
            
            <!-- Área inferior -->
            <div class="copilot-bottom">
                <!-- Botones de acción -->
                <div class="copilot-action-buttons">
                    <button class="copilot-action-button" id="copilot-action-1">
                        <i class="far fa-lightbulb"></i>
                        <span>Ideas</span>
                    </button>
                    <button class="copilot-action-button" id="copilot-action-2">
                        <i class="far fa-code"></i>
                        <span>Código</span>
                    </button>
                </div>
                
                <!-- Input de mensaje -->
                <div class="copilot-input-wrapper">
                    <div class="copilot-input-container">
                        <input 
                            type="text" 
                            class="copilot-input" 
                            id="copilot-input" 
                            placeholder="Escribe tu mensaje..."
                        >
                        <button class="copilot-send-btn" id="copilot-send" title="Enviar mensaje">
                            <i class="far fa-paper-plane"></i>
                        </button>
                    </div>
                    <button class="copilot-voice-btn" id="copilot-voice" title="Grabar mensaje de voz">
                        <i class="far fa-microphone"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza los mensajes en el chat
 */
function renderCopilotMessages() {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    copilotMessages.forEach((message, index) => {
        const messageElement = document.createElement('div');
        messageElement.className = `copilot-message copilot-message-${message.type}`;
        
        // Crear el contenido del mensaje
        const messageContent = document.createElement('div');
        messageContent.className = 'copilot-message-content';
        messageContent.textContent = message.text;
        
        // Crear timestamp
        const timestampElement = document.createElement('div');
        timestampElement.className = 'copilot-timestamp';
        timestampElement.textContent = message.timestamp;
        
        // Crear wrapper del mensaje
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'copilot-message-wrapper';
        messageWrapper.style.display = 'flex';
        messageWrapper.style.flexDirection = 'column';
        messageWrapper.style.alignItems = message.type === 'user' ? 'flex-end' : 'flex-start';
        messageWrapper.style.width = '100%';
        messageWrapper.style.marginBottom = '16px';
        
        messageWrapper.appendChild(messageContent);
        messageWrapper.appendChild(timestampElement);
        
        // Agregar botones de feedback solo para mensajes AI
        if (message.type === 'ai') {
            const feedbackElement = document.createElement('div');
            feedbackElement.className = 'copilot-feedback';
            feedbackElement.innerHTML = `
                <button class="copilot-feedback-btn thumbs-up" title="Me gusta">
                    <i class="far fa-thumbs-up"></i>
                </button>
                <button class="copilot-feedback-btn thumbs-down" title="No me gusta">
                    <i class="far fa-thumbs-down"></i>
                </button>
                <button class="copilot-feedback-btn bookmark" title="Guardar">
                    <i class="far fa-bookmark"></i>
                </button>
            `;
            messageWrapper.appendChild(feedbackElement);
            
            // Verificar estado de bookmark después de agregar al DOM
            setTimeout(() => {
                checkBookmarkState(messageContent);
            }, 100);
        }
        
        messageElement.appendChild(messageWrapper);
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll al final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Renderiza un mensaje AI con animación de typing
 */
function renderTypingMessage(messageText, timestamp) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    // Crear el elemento del mensaje
    const messageElement = document.createElement('div');
    messageElement.className = 'copilot-message copilot-message-ai typing';
    
    // Crear el contenido del mensaje
    const messageContent = document.createElement('div');
    messageContent.className = 'copilot-message-content';
    
    // Crear timestamp
    const timestampElement = document.createElement('div');
    timestampElement.className = 'copilot-timestamp';
    timestampElement.textContent = timestamp;
    
    // Crear wrapper del mensaje
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'copilot-message-wrapper';
    messageWrapper.style.display = 'flex';
    messageWrapper.style.flexDirection = 'column';
    messageWrapper.style.alignItems = 'flex-start';
    messageWrapper.style.width = '100%';
    messageWrapper.style.marginBottom = '16px';
    
    messageWrapper.appendChild(messageContent);
    messageWrapper.appendChild(timestampElement);
    
    // Crear botones de feedback (inicialmente ocultos)
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'copilot-feedback';
    feedbackElement.style.opacity = '0';
    feedbackElement.innerHTML = `
        <button class="copilot-feedback-btn thumbs-up" title="Me gusta">
            <i class="far fa-thumbs-up"></i>
        </button>
        <button class="copilot-feedback-btn thumbs-down" title="No me gusta">
            <i class="far fa-thumbs-down"></i>
        </button>
        <button class="copilot-feedback-btn bookmark" title="Guardar">
            <i class="far fa-bookmark"></i>
        </button>
    `;
    messageWrapper.appendChild(feedbackElement);
    
    messageElement.appendChild(messageWrapper);
    messagesContainer.appendChild(messageElement);
    
    // Iniciar animación de typing
    startTypingAnimation(messageContent, messageText, feedbackElement);
    
    // Scroll al final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Inicia la animación de typing
 */
function startTypingAnimation(messageContent, text, feedbackElement) {
    let currentIndex = 0;
    const typingSpeed = 30; // milisegundos por carácter
    
    function typeNextCharacter() {
        if (currentIndex < text.length) {
            messageContent.textContent = text.substring(0, currentIndex + 1);
            currentIndex++;
            setTimeout(typeNextCharacter, typingSpeed);
        } else {
            // Typing completado
            const messageElement = messageContent.closest('.copilot-message-ai');
            if (messageElement) {
                messageElement.classList.remove('typing');
            }
            
            // Mostrar botones de feedback
            if (feedbackElement) {
                feedbackElement.style.opacity = '1';
                feedbackElement.style.transition = 'opacity 0.3s ease';
                
                // Verificar si el mensaje ya está bookmarkeado
                checkBookmarkState(messageContent);
            }
        }
    }
    
    // Iniciar typing
    typeNextCharacter();
}

/**
 * Abre el chat flotante
 */
function openCopilotChat() {
    const chat = document.getElementById('copilot-chat');
    
    if (chat) {
        chat.classList.add('active');
        copilotChatOpen = true;
        
        // Si es la primera vez, mostrar mensaje de bienvenida con typing
        if (copilotMessages.length === 0) {
            const welcomeMsg = createWelcomeMessage();
            copilotMessages.push(welcomeMsg);
            // Pequeño delay para que se vea el chat abriéndose primero
            setTimeout(() => {
                renderTypingMessage(welcomeMsg.text, welcomeMsg.timestamp);
            }, 500);
        }
        
        // Enfocar el input
        setTimeout(() => {
            const input = document.getElementById('copilot-input');
            if (input) input.focus();
        }, 300);
    }
}

/**
 * Cierra el chat flotante
 */
function closeCopilotChat() {
    const chat = document.getElementById('copilot-chat');
    const expandBtn = document.getElementById('copilot-expand');
    
    if (chat) {
        chat.classList.remove('active');
        chat.classList.remove('expanded'); // También remover estado expandido
        copilotChatOpen = false;
        copilotChatExpanded = false;
        
        // Resetear icono a expandir
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            if (icon) {
                icon.className = 'far fa-expand'; // Icono de expandir
            }
        }
    }
}

/**
 * Expande el chat flotante
 */
function expandCopilotChat() {
    const chat = document.getElementById('copilot-chat');
    const expandBtn = document.getElementById('copilot-expand');
    
    if (chat && copilotChatOpen) {
        chat.classList.add('expanded');
        copilotChatExpanded = true;
        
        // Cambiar icono a contraer
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            if (icon) {
                icon.className = 'far fa-compress'; // Icono de contraer
            }
        }
    }
}

/**
 * Contrae el chat flotante
 */
function collapseCopilotChat() {
    const chat = document.getElementById('copilot-chat');
    const expandBtn = document.getElementById('copilot-expand');
    
    if (chat && copilotChatOpen) {
        chat.classList.remove('expanded');
        copilotChatExpanded = false;
        
        // Cambiar icono a expandir
        if (expandBtn) {
            const icon = expandBtn.querySelector('i');
            if (icon) {
                icon.className = 'far fa-expand'; // Icono de expandir
            }
        }
    }
}

/**
 * Alterna el estado expandido del chat
 */
function toggleCopilotExpansion() {
    if (copilotChatExpanded) {
        collapseCopilotChat();
    } else {
        expandCopilotChat();
    }
}

/**
 * Muestra la vista del historial
 */
function showCopilotHistory() {
    const messagesContainer = document.getElementById('copilot-messages');
    const historyContainer = document.getElementById('copilot-history-container');
    const historyBtn = document.getElementById('copilot-history');
    
    if (messagesContainer && historyContainer && historyBtn) {
        // Ocultar mensajes y mostrar historial
        messagesContainer.style.display = 'none';
        historyContainer.style.display = 'flex';
        
        // Activar estado del botón (mantener icono fa-clock)
        historyBtn.classList.add('active');
        
        currentView = 'history';
    }
}

/**
 * Muestra la vista del chat
 */
function showCopilotChat() {
    const messagesContainer = document.getElementById('copilot-messages');
    const historyContainer = document.getElementById('copilot-history-container');
    const historyBtn = document.getElementById('copilot-history');
    
    if (messagesContainer && historyContainer && historyBtn) {
        // Mostrar mensajes y ocultar historial
        messagesContainer.style.display = 'block';
        historyContainer.style.display = 'none';
        
        // Desactivar estado del botón (mantener icono fa-clock)
        historyBtn.classList.remove('active');
        
        currentView = 'chat';
    }
}

/**
 * Alterna entre vista de chat e historial
 */
function toggleCopilotView() {
    if (currentView === 'chat') {
        showCopilotHistory();
    } else {
        showCopilotChat();
    }
}

/**
 * Envía un mensaje
 */
function sendCopilotMessage() {
    const input = document.getElementById('copilot-input');
    if (!input || !input.value.trim()) return;
    
    const messageText = input.value.trim();
    const timestamp = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Agregar mensaje del usuario
    copilotMessages.push({
        type: 'user',
        text: messageText,
        timestamp: timestamp
    });
    
    // Limpiar input
    input.value = '';
    
    // Actualizar estado del botón send
    updateSendButtonState();
    
    // Renderizar mensajes
    renderCopilotMessages();
    
    // Simular respuesta del AI (después de 1-2 segundos)
    const responseDelay = Math.random() * 1000 + 1000; // Entre 1-2 segundos
    setTimeout(() => {
        const aiResponse = generateAIResponse(messageText);
        const aiTimestamp = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Agregar mensaje AI al array
        copilotMessages.push({
            type: 'ai',
            text: aiResponse,
            timestamp: aiTimestamp
        });
        
        // Renderizar con animación de typing
        renderTypingMessage(aiResponse, aiTimestamp);
    }, responseDelay);
}

/**
 * Actualiza el estado del botón send
 */
function updateSendButtonState() {
    const input = document.getElementById('copilot-input');
    const sendBtn = document.getElementById('copilot-send');
    
    if (input && sendBtn) {
        if (input.value.trim()) {
            sendBtn.style.opacity = '1';
            sendBtn.style.cursor = 'pointer';
        } else {
            sendBtn.style.opacity = '0.5';
            sendBtn.style.cursor = 'not-allowed';
        }
    }
}

/**
 * Maneja el feedback positivo (thumbs up)
 */
function handlePositiveFeedback(button) {
    const messageElement = button.closest('.copilot-message-ai');
    const messageContent = messageElement.querySelector('.copilot-message-content');
    const messageText = messageContent.textContent;
    
    // Toggle estado activo
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        showToast('success', '¡Gracias por tu feedback positivo! 👍');
        console.log('Feedback positivo:', messageText);
        // Aquí se podría enviar el feedback a un servidor
    } else {
        showToast('info', 'Feedback positivo removido');
    }
}

/**
 * Maneja el feedback negativo (thumbs down)
 */
function handleNegativeFeedback(button) {
    const messageElement = button.closest('.copilot-message-ai');
    const messageContent = messageElement.querySelector('.copilot-message-content');
    const messageText = messageContent.textContent;
    
    // Toggle estado activo
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        showToast('warning', 'Gracias por tu feedback. Mejoraré mi respuesta. 👎');
        console.log('Feedback negativo:', messageText);
        // Aquí se podría enviar el feedback a un servidor
    } else {
        showToast('info', 'Feedback negativo removido');
    }
}

/**
 * Maneja el bookmark (guardar mensaje)
 */
function handleBookmark(button) {
    const messageElement = button.closest('.copilot-message-ai');
    const messageContent = messageElement.querySelector('.copilot-message-content');
    const messageText = messageContent.textContent;
    const timestamp = messageElement.querySelector('.copilot-timestamp').textContent;
    
    // Toggle estado activo
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        // Cambiar icono a bookmark sólido
        const icon = button.querySelector('i');
        icon.className = 'fas fa-bookmark';
        
        showToast('success', 'Mensaje guardado en favoritos 📌');
        console.log('Mensaje guardado:', { text: messageText, timestamp });
        
        // Aquí se podría guardar en localStorage o enviar a servidor
        saveBookmark(messageText, timestamp);
    } else {
        // Cambiar icono a bookmark vacío
        const icon = button.querySelector('i');
        icon.className = 'far fa-bookmark';
        
        showToast('info', 'Mensaje removido de favoritos');
        removeBookmark(messageText);
    }
}

/**
 * Guarda un bookmark en localStorage
 */
function saveBookmark(messageText, timestamp) {
    const bookmarks = JSON.parse(localStorage.getItem('copilot-bookmarks') || '[]');
    const bookmark = {
        id: Date.now(),
        text: messageText,
        timestamp: timestamp,
        savedAt: new Date().toISOString()
    };
    
    bookmarks.push(bookmark);
    localStorage.setItem('copilot-bookmarks', JSON.stringify(bookmarks));
}

/**
 * Remueve un bookmark de localStorage
 */
function removeBookmark(messageText) {
    const bookmarks = JSON.parse(localStorage.getItem('copilot-bookmarks') || '[]');
    const filteredBookmarks = bookmarks.filter(bookmark => bookmark.text !== messageText);
    localStorage.setItem('copilot-bookmarks', JSON.stringify(filteredBookmarks));
}

/**
 * Genera una respuesta del AI (simulada y contextual)
 */
function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Respuestas contextuales basadas en palabras clave
    if (message.includes('hola') || message.includes('hi') || message.includes('hello')) {
        return '¡Hola! 😊 Me alegra saludarte. ¿En qué puedo ayudarte hoy?';
    }
    
    if (message.includes('ayuda') || message.includes('help')) {
        return '¡Por supuesto! Estoy aquí para ayudarte. Puedo asistirte con:\n\n• Consultas técnicas\n• Desarrollo de código\n• Resolución de problemas\n• Mejores prácticas\n\n¿Hay algo específico en lo que pueda ayudarte?';
    }
    
    if (message.includes('código') || message.includes('code') || message.includes('programar')) {
        return '¡Excelente! Me encanta hablar sobre programación. ¿En qué lenguaje o tecnología necesitas ayuda?\n\nPuedo ayudarte con:\n• JavaScript/TypeScript\n• React/Vue/Angular\n• Node.js\n• CSS/HTML\n• Bases de datos\n• Y mucho más...';
    }
    
    if (message.includes('error') || message.includes('problema') || message.includes('bug')) {
        return 'Entiendo que tienes un problema. Para ayudarte mejor, ¿podrías compartir:\n\n• ¿Qué error específico estás viendo?\n• ¿En qué parte del código ocurre?\n• ¿Qué estabas intentando hacer?\n\nCon esta información podré darte una solución más precisa.';
    }
    
    if (message.includes('gracias') || message.includes('thanks')) {
        return '¡De nada! 😊 Me alegra poder ayudarte. Si tienes más preguntas o necesitas asistencia adicional, no dudes en preguntarme.';
    }
    
    if (message.includes('adiós') || message.includes('bye') || message.includes('chao')) {
        return '¡Hasta luego! 👋 Ha sido un placer ayudarte. Que tengas un excelente día y no dudes en regresar cuando necesites asistencia.';
    }
    
    if (message.includes('ubits') || message.includes('plataforma')) {
        return '¡Perfecto! Soy el asistente de UBITS. Puedo ayudarte con:\n\n• Navegación en la plataforma\n• Funcionalidades específicas\n• Configuraciones\n• Mejores prácticas\n• Resolución de problemas\n\n¿Hay algo específico de UBITS en lo que pueda asistirte?';
    }
    
    // Respuestas generales inteligentes
    const generalResponses = [
        'Interesante pregunta. Déjame analizar eso... ¿Podrías darme más detalles para poder ayudarte mejor?',
        'Entiendo tu consulta. Basándome en la información que me has dado, te sugiero explorar algunas opciones. ¿Te gustaría que profundice en algún aspecto específico?',
        'Excelente punto. Para darte la mejor respuesta, ¿podrías ser un poco más específico sobre lo que necesitas?',
        'Me parece una consulta muy válida. ¿Has considerado alguna alternativa específica o hay algún contexto particular que deba conocer?',
        'Perfecto, estoy aquí para ayudarte con eso. ¿Hay algún enfoque particular que prefieras o alguna restricción que deba tener en cuenta?'
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

/**
 * Agrega event listeners al chat
 */
function addCopilotEventListeners() {
    // Botón cerrar
    const closeBtn = document.getElementById('copilot-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCopilotChat);
    }
    
    // Botón expandir
    const expandBtn = document.getElementById('copilot-expand');
    if (expandBtn) {
        expandBtn.addEventListener('click', toggleCopilotExpansion);
    }
    
    // Botón nuevo chat (acciones principales)
    const newChatBtn = document.getElementById('copilot-new-chat');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    // Botón nuevo chat (desde historial)
    const newChatHistoryBtn = document.getElementById('copilot-new-chat-history');
    if (newChatHistoryBtn) {
        newChatHistoryBtn.addEventListener('click', startNewChat);
    }
    
    // Botón historial
    const historyBtn = document.getElementById('copilot-history');
    if (historyBtn) {
        historyBtn.addEventListener('click', toggleCopilotView);
    }
    
    // Items del historial
    const historyItems = document.querySelectorAll('.copilot-history-item');
    historyItems.forEach(item => {
        item.addEventListener('click', function() {
            const chatId = this.getAttribute('data-chat-id');
            console.log('Cargando chat:', chatId);
            // Aquí se cargaría el chat específico
            showCopilotChat();
        });
    });
    
    // Input de mensaje
    const input = document.getElementById('copilot-input');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendCopilotMessage();
            }
        });
        
        // Actualizar estado del botón send
        input.addEventListener('input', updateSendButtonState);
    }
    
    // Botón de send
    const sendBtn = document.getElementById('copilot-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendCopilotMessage);
    }
    
    // Botón de voz
    const voiceBtn = document.getElementById('copilot-voice');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            if (isRecording) {
                stopVoiceRecording();
            } else {
                startVoiceRecording();
            }
        });
    }
    
    // Botones de acción
    const action1Btn = document.getElementById('copilot-action-1');
    if (action1Btn) {
        action1Btn.addEventListener('click', function() {
            const input = document.getElementById('copilot-input');
            if (input) {
                input.value = 'Dame ideas creativas para mi proyecto';
                updateSendButtonState();
                input.focus();
            }
        });
    }
    
    const action2Btn = document.getElementById('copilot-action-2');
    if (action2Btn) {
        action2Btn.addEventListener('click', function() {
            const input = document.getElementById('copilot-input');
            if (input) {
                input.value = 'Ayúdame a escribir código';
                updateSendButtonState();
                input.focus();
            }
        });
    }
    
    // Botones de feedback
    document.addEventListener('click', function(e) {
        if (e.target.closest('.copilot-feedback-btn')) {
            const btn = e.target.closest('.copilot-feedback-btn');
            const icon = btn.querySelector('i');
            
            if (btn.classList.contains('thumbs-up')) {
                handlePositiveFeedback(btn);
            } else if (btn.classList.contains('thumbs-down')) {
                handleNegativeFeedback(btn);
            } else if (btn.classList.contains('bookmark')) {
                handleBookmark(btn);
            }
        }
    });
}

/**
 * Verifica si un mensaje ya está bookmarkeado y aplica el estado visual
 */
function checkBookmarkState(messageContent) {
    const messageText = messageContent.textContent;
    const bookmarks = JSON.parse(localStorage.getItem('copilot-bookmarks') || '[]');
    const isBookmarked = bookmarks.some(bookmark => bookmark.text === messageText);
    
    if (isBookmarked) {
        const messageElement = messageContent.closest('.copilot-message-ai');
        const bookmarkBtn = messageElement.querySelector('.bookmark');
        const icon = bookmarkBtn.querySelector('i');
        
        bookmarkBtn.classList.add('active');
        icon.className = 'fas fa-bookmark';
    }
}

/**
 * Variables globales para grabación de audio
 */
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingTimer = null;
let recordingStartTime = null;

/**
 * Inicia la grabación de audio
 */
async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            showAudioControls(audioBlob);
        };
        
        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();
        
        // Actualizar UI
        const voiceBtn = document.getElementById('copilot-voice');
        if (voiceBtn) {
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        }
        
        // Iniciar timer
        startRecordingTimer();
        
        showToast('success', '🎤 Grabación iniciada');
        
    } catch (error) {
        console.error('Error al iniciar grabación:', error);
        showToast('error', 'No se pudo acceder al micrófono');
    }
}

/**
 * Detiene la grabación de audio
 */
function stopVoiceRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Detener timer
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        
        // Actualizar UI
        const voiceBtn = document.getElementById('copilot-voice');
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
            voiceBtn.classList.add('processing');
            voiceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        showToast('info', '⏹️ Grabación detenida');
    }
}

/**
 * Inicia el timer de grabación
 */
function startRecordingTimer() {
    recordingTimer = setInterval(() => {
        if (isRecording) {
            const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
            updateRecordingTimer(elapsed);
        }
    }, 1000);
}

/**
 * Actualiza el timer de grabación
 */
function updateRecordingTimer(seconds) {
    const timerElement = document.querySelector('.copilot-audio-timer');
    if (timerElement) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * Muestra los controles de audio después de grabar
 */
function showAudioControls(audioBlob) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    const audioControlsHTML = `
        <div class="copilot-audio-controls active">
            <div class="copilot-audio-visualizer">
                <div class="copilot-audio-bar"></div>
                <div class="copilot-audio-bar"></div>
                <div class="copilot-audio-bar"></div>
                <div class="copilot-audio-bar"></div>
                <div class="copilot-audio-bar"></div>
            </div>
            <div class="copilot-audio-timer">0:00</div>
            <div class="copilot-audio-actions">
                <button class="copilot-audio-btn send" onclick="sendAudioMessage()" title="Enviar audio">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button class="copilot-audio-btn cancel" onclick="cancelAudioRecording()" title="Cancelar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', audioControlsHTML);
    
    // Resetear botón de voz
    const voiceBtn = document.getElementById('copilot-voice');
    if (voiceBtn) {
        voiceBtn.classList.remove('processing');
        voiceBtn.innerHTML = '<i class="far fa-microphone"></i>';
    }
    
    // Guardar el audio blob globalmente
    window.currentAudioBlob = audioBlob;
}

/**
 * Envía el mensaje de audio
 */
function sendAudioMessage() {
    if (!window.currentAudioBlob) return;
    
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Crear mensaje de audio
    const audioMessage = {
        type: 'audio',
        audioBlob: window.currentAudioBlob,
        timestamp: timestamp,
        duration: Math.floor((Date.now() - recordingStartTime) / 1000)
    };
    
    // Agregar a mensajes
    copilotMessages.push(audioMessage);
    
    // Renderizar mensaje de audio
    renderAudioMessage(audioMessage);
    
    // Limpiar controles
    cancelAudioRecording();
    
    // Simular respuesta del AI
    setTimeout(() => {
        const aiResponse = generateAudioAIResponse();
        copilotMessages.push({ type: 'ai', text: aiResponse, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }) });
        renderTypingMessage(aiResponse, new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    
    showToast('success', '🎵 Mensaje de audio enviado');
}

/**
 * Cancela la grabación de audio
 */
function cancelAudioRecording() {
    // Remover controles de audio
    const audioControls = document.querySelector('.copilot-audio-controls');
    if (audioControls) {
        audioControls.remove();
    }
    
    // Limpiar variables
    window.currentAudioBlob = null;
    recordingStartTime = null;
    
    // Resetear botón de voz
    const voiceBtn = document.getElementById('copilot-voice');
    if (voiceBtn) {
        voiceBtn.classList.remove('recording', 'processing');
        voiceBtn.innerHTML = '<i class="far fa-microphone"></i>';
    }
}

/**
 * Renderiza un mensaje de audio
 */
function renderAudioMessage(message) {
    const messagesContainer = document.getElementById('copilot-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'copilot-message copilot-message-user';
    
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'copilot-message-wrapper';
    messageWrapper.style.marginBottom = '16px';
    
    const audioContainer = document.createElement('div');
    audioContainer.className = 'copilot-message-audio';
    audioContainer.style.background = '#3865F5';
    audioContainer.style.color = '#ffffff';
    
    const audioPlayer = document.createElement('div');
    audioPlayer.className = 'copilot-audio-player';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'copilot-audio-play-btn';
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playBtn.onclick = () => toggleAudioPlayback(message.audioBlob, playBtn);
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'copilot-audio-progress';
    progressContainer.onclick = (e) => seekAudio(e, message.audioBlob);
    
    const progressBar = document.createElement('div');
    progressBar.className = 'copilot-audio-progress-bar';
    
    const durationSpan = document.createElement('span');
    durationSpan.className = 'copilot-audio-duration';
    durationSpan.textContent = formatDuration(message.duration);
    
    progressContainer.appendChild(progressBar);
    audioPlayer.appendChild(playBtn);
    audioPlayer.appendChild(progressContainer);
    audioPlayer.appendChild(durationSpan);
    audioContainer.appendChild(audioPlayer);
    
    const timestampElement = document.createElement('div');
    timestampElement.className = 'copilot-timestamp';
    timestampElement.textContent = message.timestamp;
    
    messageWrapper.appendChild(audioContainer);
    messageWrapper.appendChild(timestampElement);
    messageElement.appendChild(messageWrapper);
    messagesContainer.appendChild(messageElement);
    
    // Scroll al final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Alterna la reproducción de audio
 */
function toggleAudioPlayback(audioBlob, playBtn) {
    const icon = playBtn.querySelector('i');
    
    if (playBtn.dataset.playing === 'true') {
        // Pausar
        if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio = null;
        }
        playBtn.dataset.playing = 'false';
        icon.className = 'fas fa-play';
    } else {
        // Reproducir
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onloadedmetadata = () => {
            updateAudioProgress(audio, playBtn);
        };
        
        audio.onended = () => {
            playBtn.dataset.playing = 'false';
            icon.className = 'fas fa-play';
            const progressBar = playBtn.parentElement.querySelector('.copilot-audio-progress-bar');
            if (progressBar) progressBar.style.width = '0%';
        };
        
        audio.play();
        window.currentAudio = audio;
        playBtn.dataset.playing = 'true';
        icon.className = 'fas fa-pause';
    }
}

/**
 * Actualiza la barra de progreso del audio
 */
function updateAudioProgress(audio, playBtn) {
    const progressBar = playBtn.parentElement.querySelector('.copilot-audio-progress-bar');
    const durationSpan = playBtn.parentElement.querySelector('.copilot-audio-duration');
    
    if (progressBar && durationSpan) {
        const updateProgress = () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = progress + '%';
                durationSpan.textContent = formatDuration(Math.floor(audio.duration - audio.currentTime));
            }
        };
        
        audio.addEventListener('timeupdate', updateProgress);
    }
}

/**
 * Busca en el audio al hacer clic en la barra de progreso
 */
function seekAudio(event, audioBlob) {
    if (window.currentAudio) {
        const progressContainer = event.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        window.currentAudio.currentTime = window.currentAudio.duration * percentage;
    }
}

/**
 * Formatea la duración en mm:ss
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Genera una respuesta del AI para mensajes de audio
 */
function generateAudioAIResponse() {
    const responses = [
        '🎵 He recibido tu mensaje de voz. ¡Gracias por compartir!',
        '🎤 Interesante mensaje de audio. ¿Hay algo más en lo que pueda ayudarte?',
        '🔊 He escuchado tu audio. ¿Te gustaría que te ayude con algo específico?',
        '🎶 Mensaje de voz recibido. ¿En qué más puedo asistirte?',
        '📢 Perfecto, he recibido tu grabación. ¿Hay algo más que necesites?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Inicia un nuevo chat
 */
function startNewChat() {
    // Limpiar mensajes actuales
    copilotMessages = [];
    
    // Limpiar el contenedor de mensajes
    const messagesContainer = document.getElementById('copilot-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    
    // Limpiar controles de audio si existen
    const audioControls = document.querySelector('.copilot-audio-controls');
    if (audioControls) {
        audioControls.remove();
    }
    
    // Limpiar variables de audio
    window.currentAudioBlob = null;
    recordingStartTime = null;
    
    // Resetear botón de voz
    const voiceBtn = document.getElementById('copilot-voice');
    if (voiceBtn) {
        voiceBtn.classList.remove('recording', 'processing');
        voiceBtn.innerHTML = '<i class="far fa-microphone"></i>';
    }
    
    // Activar estado del botón nuevo chat
    const newChatBtn = document.getElementById('copilot-new-chat');
    if (newChatBtn) {
        newChatBtn.classList.add('active');
        
        // Quitar estado activo después de un breve momento para mostrar feedback visual
        setTimeout(() => {
            newChatBtn.classList.remove('active');
        }, 1000);
    }
    
    // Asegurar que estamos en la vista de chat
    showCopilotChat();
    
    // Mostrar mensaje de bienvenida después de un breve delay
    setTimeout(() => {
        const welcomeMsg = createWelcomeMessage();
        copilotMessages.push(welcomeMsg);
        renderTypingMessage(welcomeMsg.text, welcomeMsg.timestamp);
    }, 300);
    
    showToast('success', '✨ Nuevo chat iniciado');
}

/**
 * Muestra una notificación toast
 */
function showToast(type, message) {
    // Asegurar que el contenedor de toast existe
    let container = document.getElementById('ubits-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ubits-toast-container';
        container.style.cssText = `
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            width: auto;
            max-width: 560px;
            z-index: 10001;
            pointer-events: none;
            justify-content: center;
        `;
        document.body.appendChild(container);
    }
    
    // Crear el elemento toast con estructura UBITS
    const toast = document.createElement('div');
    toast.className = `ubits-toast ubits-toast--${type}`;
    
    // Determinar icono según el tipo
    let iconClass = 'far fa-check-circle';
    if (type === 'info') iconClass = 'far fa-info-circle';
    else if (type === 'warning') iconClass = 'far fa-exclamation-triangle';
    else if (type === 'error') iconClass = 'far fa-times-circle';
    
    // Estructura HTML del toast UBITS
    toast.innerHTML = `
        <div class="ubits-toast__icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="ubits-toast__content">
            <div class="ubits-toast__text">${message}</div>
        </div>
        <button class="ubits-toast__close" aria-label="Cerrar notificación">
            <i class="far fa-times"></i>
        </button>
    `;
    
    // Agregar al contenedor
    container.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.classList.add('ubits-toast--enter');
    }, 100);
    
    // Configurar cierre automático
    const duration = type === 'warning' ? 5000 : type === 'error' ? 6500 : 3500;
    
    // Remover después del tiempo especificado
    setTimeout(() => {
        toast.classList.add('ubits-toast--exit');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
    
    // Event listener para botón de cerrar
    const closeBtn = toast.querySelector('.ubits-toast__close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.add('ubits-toast--exit');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
}

/**
 * Inicializa el chat flotante
 */
function initCopilotChat() {
    // Crear el HTML del chat
    const chatHTML = createCopilotChatHTML();
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    // Inicializar con mensaje de bienvenida
    copilotMessages = [createWelcomeMessage()];
    renderCopilotMessages();
    
    // Agregar event listeners
    addCopilotEventListeners();
    
    // Inicializar estado del botón send
    updateSendButtonState();
}

/**
 * Función global para abrir el chat desde el botón
 */
window.openCopilotChat = openCopilotChat;
window.closeCopilotChat = closeCopilotChat;
window.expandCopilotChat = expandCopilotChat;
window.collapseCopilotChat = collapseCopilotChat;
window.toggleCopilotExpansion = toggleCopilotExpansion;
window.showCopilotHistory = showCopilotHistory;
window.showCopilotChat = showCopilotChat;
window.toggleCopilotView = toggleCopilotView;


// Exportar funciones para uso global
window.initCopilotChat = initCopilotChat;
window.addCopilotEventListeners = addCopilotEventListeners;