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
    'UBITS': 'images/Favicons/UBITS.jpg',
    'Microsoft': 'images/Favicons/Microsoft.jpg',
    'Hubspot': 'images/Favicons/Hubspot.jpg',
    'Harvard Business Publishing': 'images/Favicons/Harvard-Business-Publishing.jpg',
    'TED': 'images/Favicons/TED.jpg',
    'AWS': 'images/Favicons/AWS.jpg',
    'Universidad de Los Andes': 'images/Favicons/Universidad-de-Los Andes.jpg',
    'Advanced English': 'images/Favicons/Advanced-English.jpg',
    'IE University': 'images/Favicons/IE-University-Publishing.jpg',
    'Código Facilito': 'images/Favicons/Código-Facilito.jpg',
    'Hackers del Talento': 'images/Favicons/Hackers-del-Talento.jpg',
    'All Ears English': 'images/Favicons/All Ears English.jpg',
    'American & British Academy': 'images/Favicons/American & British Academy.jpg',
    'Bureau Veritas': 'images/Favicons/Bureau-Veritas.jpg',
    'Welu': 'images/Favicons/Welu.jpg',
    'Figsha Smart Consulting': 'images/Favicons/Figsha Smart Consulting.jpg',
    'Instafit': 'images/Favicons/Instafit.jpg',
    'WOBI': 'images/Favicons/WOBI.jpg'
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

    // Template de la card compact (estructura según Figma)
    return `
        <div class="course-card-compact" data-progress="${cardData.progress || 0}" data-status="${cardData.status || 'default'}">
            <div class="course-card-compact-inner">
                <!-- Parte superior: Imagen y título -->
                <div class="course-header-compact-wrapper">
                    <div class="course-thumbnail-compact-wrapper">
                        <div class="course-thumbnail-compact">
                            <img src="${cardData.image}" alt="${cardData.title}" class="course-image-compact">
                        </div>
                    </div>
                    <div class="course-title-wrapper-compact">
                        <h3 class="course-title-compact ubits-body-sm-bold" style="color: var(--ubits-fg-1-high);">${cardData.title}</h3>
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

/* ========================================
   EXPORTAR FUNCIONES Y CONSTANTES
   ======================================== */

// Exponer funciones principales
window.renderCardContentCompact = renderCardContentCompact;
window.loadCardContentCompact = loadCardContentCompact;
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
        providerLogo: 'images/Favicons/UBITS.jpg',
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
 *     providerLogo: 'images/Favicons/UBITS.jpg',
 *     duration: '60 min',
 *     level: 'Intermedio',
 *     progress: 75,
 *     status: 'progress',
 *     image: 'images/cards-learn/mi-imagen.jpg',
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
