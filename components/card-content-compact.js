/* ========================================
   UBITS CARD CONTENT COMPACT COMPONENT - COMPLETO
   Variante horizontal y compacta de content-card
   ======================================== */

/* ========================================
   REUTILIZAR CONFIGURACIÓN DE CONTENT-CARD
   ======================================== */

// Importar constantes del componente original (se cargan desde card-content.js)
// Si card-content.js ya está cargado, usar sus constantes
// Si no, definir aquí las mismas constantes

// TIPOS DE CONTENIDO DISPONIBLES (12 tipos)
const CONTENT_TYPES_COMPACT = [
    'Curso',
    'Short', 
    'Charla',
    'Artículo',
    'Podcast',
    'Libro',
    'Ideas de libro',
    'Caso de estudio',
    'Documento técnico',
    'Ejercicios de práctica',
    'Ruta de aprendizaje',
    'Programa'
];

// COMPETENCIAS OFICIALES UBITS (35 competencias)
const COMPETENCIES_COMPACT = [
    'Accountability',
    'Administración de negocios',
    'Agilidad',
    'Comunicación',
    'Cumplimiento (Compliance)',
    'Data skills',
    'Desarrollo de software',
    'Desarrollo web',
    'Digital skills',
    'e-Commerce',
    'Emprendimiento',
    'Experiencia del cliente',
    'Gestión de procesos y operaciones',
    'Gestión de proyectos',
    'Gestión de recursos tecnológicos',
    'Gestión del cambio',
    'Gestión del riesgo',
    'Gestión financiera',
    'Herramientas tecnológicas',
    'Inglés',
    'Innovación',
    'Inteligencia emocional',
    'Lenguajes de Programación',
    'Liderazgo',
    'Marketing',
    'Marketing digital',
    'Negociación',
    'People management',
    'Product design',
    'Productividad',
    'Resolución de problemas',
    'Trabajo en equipo',
    'Ventas',
    'Wellness'
];

// NIVELES DISPONIBLES (3 niveles con iconos FontAwesome)
const LEVELS_COMPACT = {
    'Básico': 'far fa-gauge-min',
    'Intermedio': 'far fa-gauge',
    'Avanzado': 'far fa-gauge-max'
};

// TIEMPOS OFICIALES (9 duraciones)
const DURATIONS_COMPACT = [
    '15 min',
    '30 min', 
    '45 min',
    '60 min',
    '75 min',
    '90 min',
    '120 min',
    '180 min',
    '240 min'
];

// IDIOMAS DISPONIBLES (3 idiomas)
const LANGUAGES_COMPACT = [
    'Español',
    'Inglés',
    'Portugués'
];

// ESTADOS DISPONIBLES (3 estados)
const STATUSES_COMPACT = {
    'default': { class: '', text: '' },
    'progress': { class: 'course-status-compact--progress', text: 'En progreso' },
    'completed': { class: 'course-status-compact--completed', text: 'Completado' }
};

// ALIADOS OFICIALES (18 proveedores)
const PROVIDERS_COMPACT = {
    'UBITS': '../../images/Favicons/UBITS.jpg',
    'Microsoft': '../../images/Favicons/Microsoft.jpg',
    'Hubspot': '../../images/Favicons/Hubspot.jpg',
    'Harvard Business Publishing': '../../images/Favicons/Harvard-Business-Publishing.jpg',
    'TED': '../../images/Favicons/TED.jpg',
    'AWS': '../../images/Favicons/AWS.jpg',
    'Universidad de Los Andes': '../../images/Favicons/Universidad-de-Los Andes.jpg',
    'Advanced English': '../../images/Favicons/Advanced-English.jpg',
    'IE University': '../../images/Favicons/IE-University-Publishing.jpg',
    'Código Facilito': '../../images/Favicons/Código-Facilito.jpg',
    'Hackers del Talento': '../../images/Favicons/Hackers-del-Talento.jpg',
    'All Ears English': '../../images/Favicons/All Ears English.jpg',
    'American & British Academy': '../../images/Favicons/American & British Academy.jpg',
    'Bureau Veritas': '../../images/Favicons/Bureau-Veritas.jpg',
    'Welu': '../../images/Favicons/Welu.jpg',
    'Fiqsha Smart Consulting': '../../images/Favicons/Fiqsha Smart Consulting.jpg',
    'Fiqsha Decoraciones S.A.S.': '../../images/Favicons/Fiqsha Smart Consulting.jpg',
    'Figsha Smart Consulting': '../../images/Favicons/Fiqsha Smart Consulting.jpg',
    'Instafit': '../../images/Favicons/Instafit.jpg',
    'WOBI': '../../images/Favicons/WOBI.jpg'
};

/* ========================================
   REGLAS DE NEGOCIO
   ======================================== */

// REGLA: Los Shorts normalmente son de 15 minutos
function getRecommendedDurationCompact(type) {
    if (type === 'Short') return '15 min';
    if (type === 'Artículo') return '15 min';
    if (type === 'Ruta de aprendizaje') return '120 min';
    if (type === 'Programa') return '120 min';
    return '60 min';
}

// Función para validar datos antes de renderizar
function escapeHtmlCompact(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function validateCardDataCompact(cardData) {
    const errors = [];
    
    // Usar constantes del componente original si están disponibles, sino usar las locales
    const contentTypes = window.CARD_CONTENT_OPTIONS?.CONTENT_TYPES || CONTENT_TYPES_COMPACT;
    const competencies = window.CARD_CONTENT_OPTIONS?.COMPETENCIES || COMPETENCIES_COMPACT;
    
    if (!contentTypes.includes(cardData.type)) {
        errors.push(`Tipo de contenido no válido: ${cardData.type}`);
    }
    
    if (!competencies.includes(cardData.competency)) {
        errors.push(`Competencia no válida: ${cardData.competency}`);
    }
    
    if (errors.length > 0) {
        console.warn('Errores de validación en card compact:', errors);
        console.warn('Opciones disponibles:', {
            types: contentTypes,
            competencies: competencies
        });
    }
    
    return errors.length === 0;
}

/**
 * Renderiza una course-card-compact con todos sus datos
 * @param {Object} cardData - Datos de la card (igual estructura que content-card)
 * @param {string} cardData.type - Tipo de contenido
 * @param {string} cardData.title - Título del contenido
 * @param {string} cardData.provider - Nombre del proveedor/aliado
 * @param {string} cardData.providerLogo - Ruta del logo del proveedor
 * @param {string} cardData.duration - Duración
 * @param {string} cardData.level - Nivel (Básico, Intermedio, Avanzado)
 * @param {number} cardData.progress - Progreso (0-100)
 * @param {string} cardData.status - Estado (default, progress, completed)
 * @param {string} cardData.image - Ruta de la imagen
 * @param {string} cardData.competency - Competencia
 * @param {string} cardData.language - Idioma
 */
function renderCardContentCompact(cardData) {
    // Validar datos
    validateCardDataCompact(cardData);
    
    // Usar constantes del componente original si están disponibles
    const STATUSES = window.CARD_CONTENT_OPTIONS?.STATUSES || STATUSES_COMPACT;
    const LEVELS = window.CARD_CONTENT_OPTIONS?.LEVELS || LEVELS_COMPACT;
    const PROVIDERS = window.CARD_CONTENT_OPTIONS?.PROVIDERS || PROVIDERS_COMPACT;
    
    // Determinar clase de estado
    let statusClass = '';
    let statusText = '';
    
    if (cardData.status === 'progress') {
        statusClass = 'course-status-compact--progress';
        statusText = 'En progreso';
    } else if (cardData.status === 'completed') {
        statusClass = 'course-status-compact--completed';
        statusText = 'Completado';
    }
    
    // Determinar icono según el nivel
    const levelIcon = LEVELS[cardData.level] || LEVELS['Intermedio'];
    
    // Detectar si es Ruta de aprendizaje o Programa y tiene múltiples proveedores
    const isRutaAprendizaje = cardData.type === 'Ruta de aprendizaje';
    const isPrograma = cardData.type === 'Programa';
    const hasMultipleProviders = (isRutaAprendizaje || isPrograma) && Array.isArray(cardData.providers) && cardData.providers.length > 1;
    
    // Renderizar avatares según el tipo
    let providerHTML = '';
    if (hasMultipleProviders) {
        // Múltiples avatares para Ruta de aprendizaje o Programa
        const providers = cardData.providers;
        const totalCount = providers.length;
        const visibleCount = Math.min(totalCount, 3);
        const remainingCount = totalCount > 3 ? totalCount - 3 : 0;
        
        providerHTML = `
            <div class="course-provider-compact course-provider-compact--multiple">
                <div class="provider-avatars-list-compact">
                    ${providers.slice(0, visibleCount).map((provider, index) => {
                        const zIndex = visibleCount - index;
                        const marginRight = (index < visibleCount - 1) || remainingCount > 0 ? '-5px' : '0';
                        return `
                            <div class="provider-avatar-compact provider-avatar-compact--stacked" style="z-index: ${zIndex}; margin-right: ${marginRight};">
                                <img src="${provider.logo || provider.providerLogo || PROVIDERS['UBITS']}" 
                                     alt="${provider.name || provider.provider || 'Provider'}" 
                                     class="provider-icon-compact">
                            </div>
                        `;
                    }).join('')}
                    ${remainingCount > 0 ? `
                        <div class="provider-avatar-compact provider-avatar-compact--stacked provider-avatar-compact--count" style="z-index: 0; margin-right: 0;">
                            <span class="provider-count-text-compact">+${remainingCount}</span>
                        </div>
                    ` : ''}
                </div>
                <span class="provider-name-compact ubits-body-xs-regular">Varios</span>
            </div>
        `;
    } else {
        // Avatar único (comportamiento normal)
        const providerLogo = cardData.providerLogo || PROVIDERS[cardData.provider] || PROVIDERS['UBITS'];
        providerHTML = `
            <div class="course-provider-compact">
                <div class="provider-avatar-compact">
                    <img src="${providerLogo}" alt="${cardData.provider}" class="provider-icon-compact">
                </div>
                <span class="provider-name-compact ubits-body-xs-regular">${cardData.provider}</span>
                <span class="provider-separator-compact ubits-body-xs-regular">|</span>
                <span class="course-type-compact ubits-body-xs-regular">${cardData.type}</span>
            </div>
        `;
    }

    var listRow = cardData.listRow === true;
    var contentId = cardData.contentId != null ? String(cardData.contentId) : '';
    var titleInner =
        '<h3 class="course-title-compact ubits-body-sm-bold" style="color: var(--ubits-fg-1-high);">' +
        escapeHtmlCompact(cardData.title) +
        '</h3>';
    var titleBlock =
        listRow && cardData.showActionsMenu
            ? '<div class="course-title-row-compact">' +
              titleInner +
              '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only course-card-compact__menu-btn" data-card-compact-menu="' +
              escapeHtmlCompact(contentId) +
              '" aria-label="Opciones" data-tooltip="Opciones" data-tooltip-delay="1000"><i class="far fa-ellipsis-v"></i></button></div>'
            : titleInner;
    var dragHandleHtml =
        listRow && cardData.draggable !== false
            ? '<span class="course-card-compact__drag-handle" draggable="true" aria-label="Arrastrar para reordenar" data-tooltip="Arrastrar para reordenar" data-tooltip-delay="1000"><i class="far fa-grip-vertical"></i></span>'
            : '';
    var listRowClass = listRow ? ' course-card-compact--list-row' : '';
    var dataContentId = listRow && contentId ? ' data-content-id="' + escapeHtmlCompact(contentId) + '"' : '';

    // Template de la card compact (estructura según Figma)
    return `
        <div class="course-card-compact${listRowClass}"${dataContentId} data-progress="${cardData.progress || 0}" data-status="${cardData.status || 'default'}">
            ${dragHandleHtml}
            <div class="course-card-compact-inner">
                <!-- Parte superior: Imagen y título -->
                <div class="course-header-compact-wrapper">
                    <div class="course-thumbnail-compact-wrapper">
                        <div class="course-thumbnail-compact">
                            <img src="${cardData.image}" alt="${escapeHtmlCompact(cardData.title)}" class="course-image-compact">
                        </div>
                    </div>
                    <div class="course-title-wrapper-compact">
                        ${titleBlock}
                    </div>
                </div>
                <!-- Debajo: Avatar y tipo de contenido -->
                <div class="course-content-compact">
                    ${providerHTML}
                </div>
                <!-- Debajo: Nivel, tiempo e idioma -->
                <div class="course-specs-compact">
                    <div class="spec-item-compact">
                        <div class="spec-icon-compact">
                            <i class="${levelIcon}"></i>
                        </div>
                        <span class="ubits-body-xs-regular">${cardData.level}</span>
                    </div>
                    <div class="spec-item-compact">
                        <div class="spec-icon-compact">
                            <i class="far fa-clock"></i>
                        </div>
                        <span class="ubits-body-xs-regular">${cardData.duration}</span>
                    </div>
                    <div class="spec-item-compact">
                        <div class="spec-icon-compact">
                            <i class="far fa-globe"></i>
                        </div>
                        <span class="ubits-body-xs-regular">${cardData.language}</span>
                    </div>
                </div>
            </div>
            ${(cardData.progress > 0 || cardData.status !== 'default') ? `
            <div class="course-progress-overlay-compact">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${cardData.progress || 0}%"></div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

/**
 * Carga múltiples course-cards-compact en un contenedor
 * @param {string} containerId - ID del contenedor donde cargar las cards
 * @param {Array} cardsData - Array de objetos con datos de las cards (misma estructura que content-card)
 */
function loadCardContentCompact(containerId, cardsData) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    // Renderizar cada card
    cardsData.forEach(cardData => {
        const cardHTML = renderCardContentCompact(cardData);
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

var CARD_CONTENT_COMPACT_LIST_MENU_OPTIONS = [
    { text: 'Mover arriba', value: 'mover-arriba', leftIcon: 'arrow-up' },
    { text: 'Mover abajo', value: 'mover-abajo', leftIcon: 'arrow-down' },
    { text: 'Eliminar', value: 'eliminar', leftIcon: 'trash' }
];

/** Handle con draggable="true": usar setDragImage con la fila completa (no solo el icono ⋮⋮). */
function setCardCompactDragImage(dataTransfer, rowEl, clientX, clientY) {
    if (!dataTransfer || !rowEl) return;
    var rect = rowEl.getBoundingClientRect();
    var ox = Math.max(0, Math.min(rect.width, clientX - rect.left));
    var oy = Math.max(0, Math.min(rect.height, clientY - rect.top));
    try {
        dataTransfer.setDragImage(rowEl, ox, oy);
    } catch (err) {
        try {
            dataTransfer.setDragImage(rowEl, rect.width / 2, rect.height / 2);
        } catch (err2) {}
    }
}

var cardCompactMenuOutsideClose = null;

function clearCardCompactMenuOutsideClose() {
    if (cardCompactMenuOutsideClose) {
        document.removeEventListener('click', cardCompactMenuOutsideClose, true);
        cardCompactMenuOutsideClose = null;
    }
}

function bindCardCompactMenuOutsideClose(overlayId, anchorBtn) {
    clearCardCompactMenuOutsideClose();
    cardCompactMenuOutsideClose = function (e) {
        var overlay = document.getElementById(overlayId);
        if (!overlay || overlay.style.display === 'none' || overlay.getAttribute('aria-hidden') === 'true') {
            clearCardCompactMenuOutsideClose();
            return;
        }
        var content = overlay.querySelector('.ubits-dropdown-menu__content');
        if (content && content.contains(e.target)) return;
        if (anchorBtn && anchorBtn.contains(e.target)) return;
        if (typeof window.closeDropdownMenu === 'function') {
            window.closeDropdownMenu(overlayId);
        }
        clearCardCompactMenuOutsideClose();
    };
    setTimeout(function () {
        if (cardCompactMenuOutsideClose) {
            document.addEventListener('click', cardCompactMenuOutsideClose, true);
        }
    }, 0);
}

function wireCardCompactMenuOverlayDismiss(overlay, overlayId) {
    if (!overlay) return;
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            if (typeof window.closeDropdownMenu === 'function') {
                window.closeDropdownMenu(overlayId);
            }
            clearCardCompactMenuOutsideClose();
        }
    });
}

/**
 * Lista ordenable con menú ⋮ (paso Contenidos de ruta). Requiere dropdown-menu.js, tooltip.js.
 * @param {HTMLElement|string} root
 * @param {{ menuOverlayIdPrefix?: string, onAction?: function(detail), onReorder?: function() }} [options]
 */
function initCardContentCompactList(root, options) {
    options = options || {};
    if (typeof root === 'string') root = document.getElementById(root);
    if (!root) return;

    var prefix = options.menuOverlayIdPrefix || 'card-compact-list-menu';
    var dragging = null;

    function getCards() {
        return Array.prototype.slice.call(root.querySelectorAll('.course-card-compact--list-row'));
    }

    function notifyReorder() {
        if (typeof options.onReorder === 'function') options.onReorder();
        root.dispatchEvent(
            new CustomEvent('ubits-card-content-compact-list-reorder', { bubbles: true })
        );
    }

    function moveCard(card, delta) {
        var parent = card.parentNode;
        if (!parent) return;
        if (delta < 0 && card.previousElementSibling) {
            parent.insertBefore(card, card.previousElementSibling);
            notifyReorder();
        } else if (delta > 0 && card.nextElementSibling) {
            parent.insertBefore(card.nextElementSibling, card);
            notifyReorder();
        }
    }

    /** Mismo criterio que paginas-creator / evaluaciones: ocultar opciones inválidas (el dropdown no soporta disabled). */
    function getMenuOptionsForCard(card) {
        var cards = getCards();
        var idx = cards.indexOf(card);
        return CARD_CONTENT_COMPACT_LIST_MENU_OPTIONS.filter(function (o) {
            if (idx < 0) {
                return o.value !== 'mover-arriba' && o.value !== 'mover-abajo';
            }
            if (o.value === 'mover-arriba' && idx <= 0) return false;
            if (o.value === 'mover-abajo' && idx >= cards.length - 1) return false;
            return true;
        });
    }

    function updateMenuOptions(card) {
        var id = card.getAttribute('data-content-id');
        if (!id) return null;
        var overlayId = prefix + '-' + id;
        if (typeof window.getDropdownMenuHtml !== 'function') return null;
        var opts = getMenuOptionsForCard(card);
        var existing = document.getElementById(overlayId);
        if (existing) existing.remove();
        document.body.insertAdjacentHTML(
            'beforeend',
            window.getDropdownMenuHtml({ overlayId: overlayId, options: opts })
        );
        var overlay = document.getElementById(overlayId);
        if (!overlay) return null;
        wireCardCompactMenuOverlayDismiss(overlay, overlayId);
        var content = overlay.querySelector('.ubits-dropdown-menu__content');
        if (content) {
            content.addEventListener('click', function (e) {
                var opt = e.target.closest('.ubits-dropdown-menu__option');
                if (!opt) return;
                var val = opt.getAttribute('data-value');
                if (typeof window.closeDropdownMenu === 'function') {
                    window.closeDropdownMenu(overlayId);
                }
                clearCardCompactMenuOutsideClose();
                if (val === 'mover-arriba') moveCard(card, -1);
                else if (val === 'mover-abajo') moveCard(card, 1);
                else if (val === 'eliminar') {
                    card.remove();
                    notifyReorder();
                }
                var detail = { action: val, contentId: id, cardEl: card };
                if (typeof options.onAction === 'function') options.onAction(detail);
                root.dispatchEvent(
                    new CustomEvent('ubits-card-content-compact-list-action', { detail: detail, bubbles: true })
                );
                setTimeout(function () {
                    initCardContentCompactList(root, options);
                }, 0);
            });
        }
        return overlayId;
    }

    root.querySelectorAll('.course-card-compact__menu-btn').forEach(function (btn) {
        if (btn.getAttribute('data-card-compact-menu-bound') === 'true') return;
        btn.setAttribute('data-card-compact-menu-bound', 'true');
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var id = btn.getAttribute('data-card-compact-menu');
            var card = root.querySelector('.course-card-compact[data-content-id="' + id + '"]');
            var overlayId = card ? updateMenuOptions(card) : null;
            if (overlayId && typeof window.openDropdownMenu === 'function') {
                window.openDropdownMenu(overlayId, btn, { alignRight: true });
                bindCardCompactMenuOutsideClose(overlayId, btn);
            }
        });
    });

    if (!root.getAttribute('data-card-compact-dnd-bound')) {
        root.setAttribute('data-card-compact-dnd-bound', 'true');
        root.addEventListener('dragstart', function (e) {
            var handle = e.target.closest('.course-card-compact__drag-handle');
            if (!handle || !root.contains(handle)) return;
            var card = handle.closest('.course-card-compact--list-row');
            if (!card) return;
            dragging = card;
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                setCardCompactDragImage(e.dataTransfer, card, e.clientX, e.clientY);
                try {
                    e.dataTransfer.setData('text/plain', card.getAttribute('data-content-id') || '');
                } catch (err) {}
            }
            card.classList.add('is-dragging');
        });
        root.addEventListener('dragover', function (e) {
            if (!dragging) return;
            e.preventDefault();
            var over = e.target.closest('.course-card-compact--list-row');
            if (!over || over === dragging) return;
            var parent = dragging.parentNode;
            var rect = over.getBoundingClientRect();
            var before = e.clientY < rect.top + rect.height / 2;
            if (before) parent.insertBefore(dragging, over);
            else parent.insertBefore(dragging, over.nextSibling);
        });
        root.addEventListener('dragend', function () {
            if (dragging) dragging.classList.remove('is-dragging');
            dragging = null;
            notifyReorder();
        });
    }

    if (typeof window.initTooltip === 'function') {
        window.initTooltip(root.querySelectorAll('[data-tooltip]'));
    }
}

/* ========================================
   EXPORTAR FUNCIONES Y CONSTANTES
   ======================================== */

// Exponer funciones principales
window.renderCardContentCompact = renderCardContentCompact;
window.loadCardContentCompact = loadCardContentCompact;
window.initCardContentCompactList = initCardContentCompactList;
window.validateCardDataCompact = validateCardDataCompact;
window.getRecommendedDurationCompact = getRecommendedDurationCompact;

// Exponer todas las opciones disponibles
window.CARD_CONTENT_COMPACT_OPTIONS = {
    CONTENT_TYPES: CONTENT_TYPES_COMPACT,
    COMPETENCIES: COMPETENCIES_COMPACT,
    LEVELS: LEVELS_COMPACT,
    DURATIONS: DURATIONS_COMPACT,
    LANGUAGES: LANGUAGES_COMPACT,
    STATUSES: STATUSES_COMPACT,
    PROVIDERS: PROVIDERS_COMPACT
};

/* ========================================
   INSTRUCCIONES DE USO
   ======================================== */

console.log(`
🚀 UBITS Card Content Compact Component cargado exitosamente!

📋 CARACTERÍSTICAS:
• Variante horizontal y compacta de content-card
• Misma funcionalidad que content-card (tipos, competencias, aliados)
• Layout horizontal siempre: imagen 85x48px arriba izquierda, título alineado verticalmente
• Estructura: Imagen + Título → Avatar + Tipo → Nivel + Tiempo + Idioma
• Barra de progreso en la parte inferior del card completo
• Efecto zoom en imagen al hacer hover (igual que content-card)

💡 USO BÁSICO:
loadCardContentCompact('mi-contenedor', [
    {
        type: 'Curso',
        title: 'Mi contenido compacto',
        provider: 'UBITS',
        providerLogo: '../../images/Favicons/UBITS.jpg',
        duration: '60 min',
        level: 'Intermedio',
        progress: 50,
        status: 'progress',
        image: 'images/mi-imagen.jpg',
        competency: 'Product design',
        language: 'Español'
    }
]);

📷 NOTA SOBRE IMÁGENES:
• Las rutas de imagen pueden ser diferentes en cada proyecto
• El componente se adapta automáticamente a cualquier imagen
• Tamaño fijo: 85x48px con zoom elegante en hover

🔍 VER TODAS LAS OPCIONES:
console.log(window.CARD_CONTENT_COMPACT_OPTIONS);
`);

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

/**
 * RENDERIZADO DEL COMPONENTE CARD CONTENT COMPACT
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/card-content-compact.css">
 * 2. JS: <script src="components/card-content-compact.js"></script>
 * 3. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 4. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 5. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Container para las cards compactas -->
 * <div id="mi-contenedor-compact"></div>
 * 
 * <!-- JavaScript -->
 * <script>
 * const cardsData = [
 *   {
 *     type: 'Curso',
 *     title: 'Mi contenido de aprendizaje compacto',
 *     provider: 'UBITS',
 *     providerLogo: '../../images/Favicons/UBITS.jpg',
 *     duration: '60 min',
 *     level: 'Intermedio',
 *     progress: 75,
 *     status: 'progress',
 *     image: '../../images/cards-learn/mi-imagen.jpg',
 *     competency: 'Product design',
 *     language: 'Español'
 *   }
 * ];
 * loadCardContentCompact('mi-contenedor-compact', cardsData);
 * </script>
 * ```
 * 
 * TIPOS DE CONTENIDO: Curso, Short, Charla, Artículo, Podcast, Libro, Ideas de libro, Caso de estudio, Documento técnico, Ejercicios de práctica, Ruta de aprendizaje, Programa
 * COMPETENCIAS: 35 competencias oficiales UBITS (Product design, Desarrollo de software, Liderazgo, etc.)
 * PROVEEDORES: 18 aliados oficiales (UBITS, Microsoft, TED, AWS, etc.)
 * NIVELES: Básico, Intermedio, Avanzado
 * 
 * ESTRUCTURA DEL COMPONENTE:
 * - Parte superior: Imagen (85x48px) y título (body-sm-bold) alineados horizontalmente
 * - Parte media: Avatar del proveedor (28px) + nombre + "|" + tipo de contenido (body-xs-regular)
 * - Parte inferior: Nivel + Tiempo + Idioma con iconos (body-xs-regular)
 * - Barra de progreso: En la parte inferior del card completo (4px de altura)
 * 
 * VARIANTES DE AVATARES PARA RUTA DE APRENDIZAJE Y PROGRAMA:
 * Cuando el tipo de contenido es "Ruta de aprendizaje" o "Programa" y se proporciona un array de `providers` con más de 1 elemento,
 * se mostrarán múltiples avatares superpuestos con el texto "Varios":
 * - 2 proveedores: Muestra 2 avatares superpuestos + texto "Varios"
 * - 3 proveedores: Muestra 3 avatares superpuestos + texto "Varios"
 * - 4+ proveedores: Muestra 3 avatares visibles + 1 avatar con "+N" (donde N es el número restante) + texto "Varios"
 * 
 * Los avatares se superponen con un margen negativo de -5px y z-index decreciente (el primero tiene el z-index más alto).
 * El texto "Varios" usa la clase `ubits-body-xs-regular` (11px, regular, 16.5px line-height).
 * El texto "+N" usa font semibold (600) con tamaño 13px y line-height 19.5px.
 * ESTADOS: default, progress, completed
 * 
 * DIFERENCIAS CON CARD CONTENT:
 * - Layout siempre horizontal (nunca cambia a vertical)
 * - Imagen fija de 85x48px (no 16:9 responsive)
 * - Título: body-sm-bold en lugar de body-sm-bold (mismo tamaño)
 * - Tipo, aliado, nivel, tiempo, idioma: body-xs-regular (más pequeños)
 * - Barra de progreso en la parte inferior del card completo
 * - Estructura vertical: Imagen+Título → Avatar+Tipo → Specs
 */
