/* ========================================
   UBITS STUDY CHAT COMPONENT
   JavaScript para el chat de modo estudio IA
   ======================================== */

// Base de datos de cursos de liderazgo
const LEADERSHIP_COURSES = [
    { 
        title: 'Cambio en el estilo de liderazgo', 
        image: 'images/cards-learn/cambio-en-el-estilo-de-liderazgo.jpeg' 
    },
    { 
        title: 'Cómo ejercer el liderazgo inclusivo', 
        image: 'images/cards-learn/como-ejercer-el-liderazgo-inclusivo.jpeg' 
    },
    { 
        title: 'El buen coaching inspira liderazgo', 
        image: 'images/cards-learn/el-buen-coaching-inspira-liderazgo.jpeg' 
    },
    { 
        title: 'Emplea los valores del liderazgo femenino', 
        image: 'images/cards-learn/emplea-los-valores-del-liderazgo-femenino.jpeg' 
    },
    { 
        title: 'Implementa el liderazgo colectivo en tu empresa', 
        image: 'images/cards-learn/implementa-el-liderazgo-coletivo-en-tu-empresa.jpeg' 
    },
    { 
        title: 'La clave del liderazgo inclusivo', 
        image: 'images/cards-learn/la-clave-del-liderazgo-inclusivo.jpeg' 
    },
    { 
        title: 'La confianza: una clave para el liderazgo', 
        image: 'images/cards-learn/la-confianza-una-clave-para-el-liderazgo.jpeg' 
    },
    { 
        title: 'Liderar como los grandes directores de orquesta', 
        image: 'images/cards-learn/liderar-como-los-grandes-directores-de-orquesta.jpeg' 
    },
    { 
        title: 'Liderar con inteligencia emocional', 
        image: 'images/cards-learn/liderar-con-inteligencia-emocional.jpeg' 
    },
    { 
        title: 'Liderazgo en tiempos de crisis', 
        image: 'images/cards-learn/liderazgo-en-tiempos-de-crisi.jpeg' 
    },
    { 
        title: 'Liderazgo femenino', 
        image: 'images/cards-learn/liderazgo-femenino.jpeg' 
    },
    { 
        title: 'Líderes cotidianos', 
        image: 'images/cards-learn/lideres-cotidianos.jpeg' 
    },
    { 
        title: 'Neuroliderazgo: configura tu mente', 
        image: 'images/cards-learn/neuroliderazgo-configura-tu-mente.jpeg' 
    },
    { 
        title: 'Potencia tu liderazgo en entornos VUCA', 
        image: 'images/cards-learn/potencia-tu-liderazgo-en-entornos-vuca.jpeg' 
    },
    { 
        title: '¿Qué hace que algunos equipos tengan alto desempeño?', 
        image: 'images/cards-learn/que-hace-que-alugnos-equipos-tengan-alto-desempeno.jpeg' 
    },
    { 
        title: 'Ruta: Desarrollo de habilidades de liderazgo', 
        image: 'images/cards-learn/ruta-desarrollo-de-habilidades-de-liderazgo.jpeg' 
    }
];

// Estado del chat para gestionar contexto
let chatState = {
    waitingForTopic: false, // Si está esperando que el usuario responda sobre el tema
    waitingForPlanTopic: false, // Si está esperando que el usuario responda sobre el tema del plan
    waitingForPlanAcceptance: false, // Si está esperando que el usuario acepte o modifique el plan
    currentTopic: null, // Tema actual (ej: 'liderazgo')
    suggestedCourses: [], // Cursos ya sugeridos en esta sesión
    currentPlan: null, // Plan de formación actual propuesto
    lastAIMessageElement: null, // Referencia al último mensaje de IA para regenerar
    lastAIMessageText: null, // Texto del último mensaje de IA
    lastRegenerateFunction: null, // Función para regenerar el último mensaje
    pendingCoursesContainer: null, // Contenedor pendiente para renderizar cards de cursos
    pendingPlanContainer: null // Contenedor pendiente para renderizar cards del plan
};

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
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="ubits-study-chat-attach-btn" title="Adjuntar">
                            <i class="far fa-paperclip"></i>
                        </button>
                        <button class="ubits-button ubits-button--primary ubits-button--sm ubits-button--icon-only" id="ubits-study-chat-send-btn" title="Enviar">
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
        // Detectar si el texto contiene HTML (divs, etc.)
        const hasHTML = /<[^>]+>/.test(text);
        
        if (hasHTML) {
            // Si tiene HTML, dividir el texto en partes (texto plano y HTML)
            // Convertir URLs en links antes de procesar
            const linkRegex = /(https?:\/\/[^\s]+)/g;
            // Dividir por saltos de línea primero para separar texto de HTML
            const lines = text.split('\n');
            let processedText = '';
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('<div')) {
                    // Es HTML, agregarlo directamente
                    processedText += line;
                } else if (trimmedLine.length > 0) {
                    // Es texto plano, convertir URLs y envolver en párrafo
                    const textWithLinks = trimmedLine.replace(linkRegex, '<a href="$1" class="ubits-study-chat__link" target="_blank" rel="noopener noreferrer">$1</a>');
                    processedText += `<p class="ubits-study-chat__message-text">${textWithLinks}</p>`;
                }
            });
            
            textHTML = processedText;
        } else {
            // Convertir URLs en links con estilo
            const linkRegex = /(https?:\/\/[^\s]+)/g;
            const textWithLinks = text.replace(linkRegex, '<a href="$1" class="ubits-study-chat__link" target="_blank" rel="noopener noreferrer">$1</a>');
            // Dividir por saltos de línea y crear párrafos
            const lines = textWithLinks.split('\n').filter(line => line.trim());
            textHTML = lines.map(line => `<p class="ubits-study-chat__message-text">${line}</p>`).join('');
        }
    }
    
    const actionsHTML = (type === 'ai' && showActions && !isTyping) ? `
        <div class="ubits-study-chat__message-actions">
            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" title="Copiar">
                <i class="far fa-copy"></i>
            </button>
            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" title="Regenerar">
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
 * Formatea la lista de cursos como cards compactos
 * @param {Array} courses - Array de cursos a mostrar
 * @param {boolean} isAddingMore - Si es true, indica que se están agregando más cursos
 * @returns {string} HTML con contenedor para cards compactos
 */
function formatCoursesHTML(courses, isAddingMore = false) {
    // Generar ID único para el contenedor
    const containerId = `courses-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar los cursos en el estado para poder renderizarlos después
    chatState.pendingCoursesContainer = {
        containerId: containerId,
        courses: courses
    };
    
    let introText = '';
    if (isAddingMore) {
        introText = 'He agregado otros 3 cursos a tu lista. Aquí está la lista completa:';
    } else {
        introText = '';
    }
    
    return `<div class="study-chat-courses-section"><div id="${containerId}" class="study-chat-courses-container"></div><div class="study-chat-courses-prompt">¿Te gustaría que agregue otros 3 cursos? Solo dime "agrégame otros 3" o "agrega más".</div></div>`;
}

/**
 * Formatea un plan de formación con cards compactos
 * @param {Object} plan - Objeto con la información del plan
 * @returns {string} HTML formateado del plan con cards compactos
 */
function formatPlanHTML(plan) {
    // Generar ID único para el contenedor
    const containerId = `plan-courses-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar el plan en el estado para poder renderizar los cards después
    chatState.pendingPlanContainer = {
        containerId: containerId,
        plan: plan
    };
    
    let text = `<div class="study-chat-plan-section">`;
    text += `<div class="study-chat-plan-title">Plan de Formación</div>`;
    text += `<div class="study-chat-plan-details">`;
    text += `<div class="study-chat-plan-detail-item"><strong>Título:</strong> ${plan.title}</div>`;
    text += `<div class="study-chat-plan-detail-item"><strong>Cursos incluidos:</strong> ${plan.courses.length}</div>`;
    text += `</div>`;
    text += `<div class="study-chat-plan-courses-title">Cursos del plan</div>`;
    text += `<div id="${containerId}" class="study-chat-courses-container"></div>`;
    text += `<div class="study-chat-plan-details" style="margin-top: 16px;">`;
    text += `<div class="study-chat-plan-detail-item"><strong>Fecha de inicio:</strong> ${plan.startDate}</div>`;
    text += `<div class="study-chat-plan-detail-item"><strong>Fecha de fin:</strong> ${plan.endDate}</div>`;
    text += `</div>`;
    text += `<div class="study-chat-plan-prompt">¿Deseas aceptar este plan o modificar el listado de cursos? Responde "acepto" o "modificar".</div>`;
    text += `</div>`;
    
    return text;
}

/**
 * Genera fechas para un plan de formación (1 mes de duración)
 * @returns {Object} Objeto con fecha de inicio y fin formateadas
 */
function generatePlanDates() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    };
    
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
}

/**
 * Genera un plan de formación con 5 cursos de liderazgo
 * @returns {Object} Objeto con la información del plan
 */
function generateLeadershipPlan() {
    // Seleccionar 5 cursos aleatorios sin repetir
    const availableCourses = [...LEADERSHIP_COURSES].sort(() => 0.5 - Math.random());
    const selectedCourses = availableCourses.slice(0, 5);
    
    const dates = generatePlanDates();
    
    return {
        title: 'Plan de Formación en Liderazgo',
        courses: selectedCourses,
        startDate: dates.startDate,
        endDate: dates.endDate,
        topic: 'liderazgo'
    };
}

/**
 * Selecciona cursos aleatorios que no hayan sido sugeridos antes
 * @param {number} count - Cantidad de cursos a seleccionar
 * @returns {Array} Array de cursos seleccionados
 */
function selectRandomCourses(count = 3) {
    const availableCourses = LEADERSHIP_COURSES.filter(course => 
        !chatState.suggestedCourses.some(suggested => suggested.title === course.title)
    );
    
    if (availableCourses.length === 0) {
        // Si ya se sugirieron todos, resetear la lista
        chatState.suggestedCourses = [];
        return selectRandomCourses(count);
    }
    
    const shuffled = [...availableCourses].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, availableCourses.length));
    
    // Agregar a la lista de cursos sugeridos
    chatState.suggestedCourses.push(...selected);
    
    return selected;
}

/**
 * Genera una respuesta con cursos de liderazgo
 * @param {number} count - Cantidad de cursos a sugerir (default: 3)
 * @param {boolean} isAddingMore - Si es true, indica que se están agregando más cursos a los ya existentes
 * @returns {Object} Objeto con el texto de respuesta y los cursos
 */
function generateLeadershipCoursesResponse(count = 3, isAddingMore = false) {
    const courses = selectRandomCourses(count);
    let intro = '';
    let coursesText = '';
    
    if (isAddingMore) {
        // Si estamos agregando más cursos, mantener todos los cursos sugeridos hasta ahora
        const allCourses = chatState.suggestedCourses;
        intro = '¡Perfecto! He agregado otros 3 cursos a tu lista.';
        coursesText = formatCoursesHTML(allCourses, true);
    } else {
        // Primera vez que se sugieren cursos
        intro = '¡Excelente elección! El liderazgo es fundamental para el desarrollo profesional. Aquí tienes algunos cursos que te pueden interesar:';
        coursesText = formatCoursesHTML(courses, false);
    }
    
    const responseText = intro + '\n\n' + coursesText;
    
    return {
        text: responseText,
        courses: courses
    };
}

/**
 * Agrega un mensaje al chat
 * @param {string} type - Tipo de mensaje: 'ai' o 'user'
 * @param {string} text - Texto del mensaje
 * @param {boolean} showActions - Si mostrar botones de acción (solo para IA)
 * @param {Function} regenerateFunction - Función opcional para regenerar este mensaje
 */
function addMessage(type, text, showActions = false, regenerateFunction = null) {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    const timestamp = formatTime();
    const messageHTML = createMessageHTML(type, text, timestamp, showActions, false);
    body.insertAdjacentHTML('beforeend', messageHTML);
    
    // Scroll al final
    body.scrollTop = body.scrollHeight;
    
    // Guardar referencia al último mensaje de IA
    if (type === 'ai') {
        chatState.lastAIMessageElement = body.lastElementChild;
        chatState.lastAIMessageText = text;
        chatState.lastRegenerateFunction = regenerateFunction;
        
        // Buscar contenedores de cards compactos y renderizarlos
        setTimeout(() => {
            const messageElement = body.lastElementChild;
            
            // Renderizar cards de cursos sugeridos si hay un contenedor pendiente
            if (chatState.pendingCoursesContainer && typeof loadCardContentCompact === 'function') {
                const { containerId, courses } = chatState.pendingCoursesContainer;
                const container = messageElement.querySelector(`#${containerId}`);
                
                if (container && courses && courses.length > 0) {
                    const cardsData = courses.map(course => ({
                        type: 'Curso',
                        title: course.title,
                        provider: 'UBITS',
                        providerLogo: 'images/Favicons/UBITS.jpg',
                        duration: '60 min',
                        level: 'Intermedio',
                        progress: 0,
                        status: 'default',
                        image: course.image,
                        competency: 'Liderazgo',
                        language: 'Español'
                    }));
                    loadCardContentCompact(containerId, cardsData);
                    // Limpiar el estado pendiente
                    chatState.pendingCoursesContainer = null;
                }
            }
            
            // Renderizar cards del plan de formación si hay un contenedor pendiente
            if (chatState.pendingPlanContainer && typeof loadCardContentCompact === 'function') {
                const { containerId, plan } = chatState.pendingPlanContainer;
                const container = messageElement.querySelector(`#${containerId}`);
                
                if (container && plan && plan.courses && plan.courses.length > 0) {
                    const cardsData = plan.courses.map(course => ({
                        type: 'Curso',
                        title: course.title,
                        provider: 'UBITS',
                        providerLogo: 'images/Favicons/UBITS.jpg',
                        duration: '60 min',
                        level: 'Intermedio',
                        progress: 0,
                        status: 'default',
                        image: course.image,
                        competency: 'Liderazgo',
                        language: 'Español'
                    }));
                    loadCardContentCompact(containerId, cardsData);
                    // Limpiar el estado pendiente
                    chatState.pendingPlanContainer = null;
                }
            }
        }, 200);
    }
    
    // Agregar event listeners a los botones de acción
    if (type === 'ai' && showActions) {
        const messageElement = body.lastElementChild;
        const copyBtn = messageElement.querySelector('button[title="Copiar"]');
        const regenerateBtn = messageElement.querySelector('button[title="Regenerar"]');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(text).then(() => {
                    // Mostrar toast de confirmación UBITS
                    if (typeof showToast === 'function') {
                        showToast('success', '¡Texto copiado exitosamente! 😉', {
                            containerId: 'ubits-toast-container',
                            duration: 3500
                        });
                    } else {
                        console.log('Mensaje copiado');
                    }
                }).catch((err) => {
                    console.error('Error al copiar:', err);
                    // Fallback para navegadores antiguos
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        if (typeof showToast === 'function') {
                            showToast('success', '¡Texto copiado exitosamente! 😉', {
                                containerId: 'ubits-toast-container',
                                duration: 3500
                            });
                        }
                    } catch (e) {
                        if (typeof showToast === 'function') {
                            showToast('error', 'Error al copiar el texto', {
                                containerId: 'ubits-toast-container',
                                duration: 3500
                            });
                        }
                    }
                    document.body.removeChild(textArea);
                });
            });
        }
        
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', function() {
                // Si hay una función de regenerar asociada, ejecutarla
                if (regenerateFunction) {
                    regenerateFunction();
                } else {
                    console.log('Regenerar mensaje');
                }
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
            let response = '';
            let shouldWaitForTopic = false;
            
            switch(suggestion) {
                case 'contenidos':
                    message = 'Sugerencias de contenidos';
                    response = '¡Perfecto! Te puedo ayudar a encontrar contenidos personalizados. ¿Sobre qué tema te gustaría capacitarte? Puedes mencionar áreas como liderazgo, tecnología, comunicación, gestión de proyectos, entre otras.';
                    shouldWaitForTopic = true;
                    // Resetear estado
                    chatState.waitingForTopic = true;
                    chatState.currentTopic = null;
                    chatState.suggestedCourses = [];
                    break;
                case 'plan':
                    message = 'Crear plan de formación';
                    response = '¡Excelente idea! Me encantaría ayudarte a crear un plan de formación personalizado. ¿Sobre qué tema te gustaría crear el plan de formación? Puedes mencionar áreas como liderazgo, tecnología, comunicación, gestión de proyectos, entre otras.';
                    chatState.waitingForPlanTopic = true;
                    chatState.waitingForTopic = false;
                    chatState.currentPlan = null;
                    break;
                case 'tutor':
                    message = 'Sé mi tutor';
                    response = '¡Claro! Estoy aquí para ser tu tutor personal. Puedo ayudarte a entender conceptos complejos, resolver dudas, hacer ejercicios prácticos y acompañarte en tu proceso de aprendizaje. ¿Qué tema te gustaría que revisemos juntos hoy?';
                    chatState.waitingForTopic = false;
                    break;
            }
            
            if (message && response) {
                // Agregar mensaje del usuario
                addMessage('user', message);
                
                // Mostrar typing
                const typingElement = showTypingMessage();
                
                // Simular respuesta de IA después de un delay
                setTimeout(() => {
                    removeTypingMessage();
                    addMessage('ai', response, true);
                }, 1500);
            }
        });
    });
    
    // Función para generar respuesta predefinida basada en el mensaje del usuario
    function generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Si estamos esperando respuesta sobre el tema del plan
        if (chatState.waitingForPlanTopic) {
            // Detectar si el usuario menciona "liderazgo"
            if (lowerMessage.includes('liderazgo') || lowerMessage.includes('lider')) {
                chatState.waitingForPlanTopic = false;
                chatState.waitingForPlanAcceptance = true;
                
                // Función para regenerar el plan con otros cursos
                const createPlanRegenerateFunction = function() {
                    return function() {
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        // Generar nuevo plan de formación
                        const plan = generateLeadershipPlan();
                        chatState.currentPlan = plan;
                        
                        const planText = formatPlanHTML(plan);
                        const responseText = '¡Perfecto! He diseñado un plan de formación en liderazgo para ti. Aquí están los detalles:' + planText;
                        
                        const newRegenerateFunction = createPlanRegenerateFunction();
                        addMessage('ai', responseText, true, newRegenerateFunction);
                    };
                };
                
                // Generar plan de formación
                const plan = generateLeadershipPlan();
                chatState.currentPlan = plan;
                
                const planText = formatPlanHTML(plan);
                const responseText = '¡Perfecto! He diseñado un plan de formación en liderazgo para ti. Aquí están los detalles:' + planText;
                
                const regenerateFunction = createPlanRegenerateFunction();
                
                return {
                    text: responseText,
                    regenerateFunction: regenerateFunction
                };
            } else {
                // Si no menciona liderazgo, dar respuesta genérica
                chatState.waitingForPlanTopic = false;
                return {
                    text: 'Entiendo. Por ahora puedo ayudarte a crear planes de formación sobre liderazgo. ¿Te gustaría crear un plan de formación en liderazgo?',
                    regenerateFunction: null
                };
            }
        }
        
        // Si estamos esperando que el usuario acepte o modifique el plan
        if (chatState.waitingForPlanAcceptance && chatState.currentPlan) {
            if (lowerMessage.includes('acepto') || lowerMessage.includes('aceptar') || lowerMessage.includes('sí') || lowerMessage.includes('si') || lowerMessage.includes('ok') || lowerMessage.includes('de acuerdo')) {
                chatState.waitingForPlanAcceptance = false;
                
                const plan = chatState.currentPlan;
                const planId = Math.floor(Math.random() * 10000); // ID aleatorio para el ejemplo
                const planLink = `https://ubits.com/planes/${planId}`; // Link de ejemplo
                
                const confirmationText = `¡Excelente! He creado el plan de formación a tu nombre.\n\n` +
                    `Detalles del plan:\n` +
                    `- Título: ${plan.title}\n` +
                    `- Número de cursos: ${plan.courses.length}\n` +
                    `- Fecha de inicio: ${plan.startDate}\n` +
                    `- Fecha de fin: ${plan.endDate}\n\n` +
                    `Puedes acceder a tu plan aquí: ${planLink}`;
                
                // Limpiar el plan actual
                chatState.currentPlan = null;
                
                return {
                    text: confirmationText,
                    regenerateFunction: null
                };
            } else if (lowerMessage.includes('modificar') || lowerMessage.includes('cambiar') || lowerMessage.includes('otro')) {
                // Regenerar el plan con otros cursos
                chatState.waitingForPlanAcceptance = true;
                
                // Función para regenerar el plan con otros cursos
                const createPlanRegenerateFunction = function() {
                    return function() {
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        // Generar nuevo plan de formación
                        const plan = generateLeadershipPlan();
                        chatState.currentPlan = plan;
                        
                        const planText = formatPlanHTML(plan);
                        const responseText = '¡Por supuesto! He modificado el plan con otros cursos. Aquí está la nueva propuesta:' + planText;
                        
                        const newRegenerateFunction = createPlanRegenerateFunction();
                        addMessage('ai', responseText, true, newRegenerateFunction);
                    };
                };
                
                const plan = generateLeadershipPlan();
                chatState.currentPlan = plan;
                
                const planText = formatPlanHTML(plan);
                const responseText = '¡Por supuesto! He modificado el plan con otros cursos. Aquí está la nueva propuesta:' + planText;
                
                const regenerateFunction = createPlanRegenerateFunction();
                
                return {
                    text: responseText,
                    regenerateFunction: regenerateFunction
                };
            } else {
                // Si no es una respuesta clara, recordar las opciones
                return {
                    text: 'Por favor, responde "acepto" si quieres crear el plan con estos cursos, o "modificar" si quieres cambiar el listado de cursos.',
                    regenerateFunction: null
                };
            }
        }
        
        // Si estamos esperando respuesta sobre el tema (para sugerencias de contenidos)
        if (chatState.waitingForTopic) {
            // Detectar si el usuario menciona "liderazgo"
            if (lowerMessage.includes('liderazgo') || lowerMessage.includes('lider')) {
                chatState.currentTopic = 'liderazgo';
                chatState.waitingForTopic = false;
                
                // Función para regenerar esta respuesta con otros cursos
                const createRegenerateFunction = function() {
                    return function() {
                        // Remover los últimos 3 cursos de la lista de sugeridos (para poder sugerirlos de nuevo)
                        chatState.suggestedCourses = chatState.suggestedCourses.slice(0, -3);
                        
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        const responseData = generateLeadershipCoursesResponse(3);
                        const newRegenerateFunction = createRegenerateFunction();
                        addMessage('ai', responseData.text, true, newRegenerateFunction);
                    };
                };
                
                const regenerateFunction = createRegenerateFunction();
                
                const responseData = generateLeadershipCoursesResponse(3);
                return {
                    text: responseData.text,
                    regenerateFunction: regenerateFunction
                };
            } else {
                // Si no menciona liderazgo, dar respuesta genérica
                chatState.waitingForTopic = false;
                return {
                    text: 'Entiendo. Te puedo ayudar con varios temas. Por ahora, puedo sugerirte cursos sobre liderazgo, tecnología, comunicación, gestión de proyectos y más. ¿Hay algún tema específico que te interese?',
                    regenerateFunction: null
                };
            }
        }
        
        // Detectar si el usuario pide agregar más cursos
        if (chatState.currentTopic === 'liderazgo' && 
            (lowerMessage.includes('agrégame otros 3') || 
             lowerMessage.includes('agrega más') || 
             lowerMessage.includes('otros 3') ||
             lowerMessage.includes('más cursos'))) {
            
            // Función para regenerar esta respuesta con otros cursos (solo los últimos 3)
            const regenerateFunction = function() {
                // Remover los últimos 3 cursos de la lista de sugeridos (para poder sugerirlos de nuevo)
                chatState.suggestedCourses = chatState.suggestedCourses.slice(0, -3);
                
                if (chatState.lastAIMessageElement) {
                    chatState.lastAIMessageElement.remove();
                }
                
                // Crear función recursiva para regenerar
                const createRegenerateFunction = function() {
                    return function() {
                        // Remover los últimos 3 cursos de la lista de sugeridos
                        chatState.suggestedCourses = chatState.suggestedCourses.slice(0, -3);
                        
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        // Agregar otros 3 cursos manteniendo los anteriores
                        const responseData = generateLeadershipCoursesResponse(3, true);
                        const newRegenerateFunction = createRegenerateFunction();
                        addMessage('ai', responseData.text, true, newRegenerateFunction);
                    };
                };
                
                // Agregar otros 3 cursos manteniendo los anteriores
                const responseData = generateLeadershipCoursesResponse(3, true);
                const newRegenerateFunction = createRegenerateFunction();
                addMessage('ai', responseData.text, true, newRegenerateFunction);
            };
            
            // Agregar otros 3 cursos manteniendo los anteriores
            const responseData = generateLeadershipCoursesResponse(3, true);
            return {
                text: responseData.text,
                regenerateFunction: regenerateFunction
            };
        }
        
        // Respuestas predefinidas basadas en palabras clave
        if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas tardes')) {
            return {
                text: '¡Hola! Me alegra saludarte. Estoy aquí para ayudarte con tus necesidades de aprendizaje y formación. ¿En qué puedo asistirte hoy?',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('curso') || lowerMessage.includes('contenido') || lowerMessage.includes('aprender')) {
            return {
                text: 'Excelente pregunta sobre contenidos de aprendizaje. Te puedo ayudar a encontrar cursos y recursos que se ajusten a tus necesidades. ¿Hay algún tema específico que te interese? Por ejemplo: liderazgo, tecnología, comunicación, gestión de proyectos, entre otros.',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('plan') || lowerMessage.includes('programa') || lowerMessage.includes('ruta')) {
            return {
                text: 'Perfecto, podemos crear un plan de formación personalizado para ti. Para diseñar el mejor plan, me ayudaría conocer: tus objetivos profesionales, las competencias que quieres desarrollar y el tiempo que puedes dedicar al aprendizaje. ¿Podrías compartirme esta información?',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('ayuda') || lowerMessage.includes('help') || lowerMessage.includes('cómo')) {
            return {
                text: '¡Por supuesto! Estoy aquí para ayudarte. Puedo asistirte con: sugerencias de contenidos, creación de planes de formación, explicación de conceptos, resolución de dudas y más. ¿Qué necesitas específicamente?',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
            return {
                text: '¡De nada! Es un placer ayudarte. Si tienes más preguntas o necesitas asistencia adicional, no dudes en preguntarme. ¡Que tengas un excelente día de aprendizaje!',
                regenerateFunction: null
            };
        }
        
        // Respuesta genérica por defecto
        return {
            text: 'Gracias por tu mensaje. Estoy aquí para ayudarte con tus necesidades de aprendizaje y formación. Puedo asistirte con sugerencias de contenidos, creación de planes de estudio, explicación de conceptos y más. ¿Hay algo específico en lo que pueda ayudarte?',
            regenerateFunction: null
        };
    }
    
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
        
        // Generar respuesta predefinida
        const responseData = generateResponse(message);
        const response = typeof responseData === 'object' ? responseData.text : responseData;
        const regenerateFunction = typeof responseData === 'object' ? responseData.regenerateFunction : null;
        
        // Simular respuesta de IA después de un delay
        setTimeout(() => {
            removeTypingMessage();
            addMessage('ai', response, true, regenerateFunction);
        }, 1500);
    }
}

// Exportar funciones para uso global
window.initStudyChat = initStudyChat;
window.addMessage = addMessage;
window.showTypingMessage = showTypingMessage;
window.removeTypingMessage = removeTypingMessage;

