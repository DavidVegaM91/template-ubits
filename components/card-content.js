/* ========================================
   UBITS CARD CONTENT COMPONENT - COMPLETO
   Componente autocontenido con todas las opciones
   ======================================== */

/* ========================================
   CONFIGURACIÓN DE SPECS DISPONIBLES
   ======================================== */

// TIPOS DE CONTENIDO DISPONIBLES (12 tipos)
const CONTENT_TYPES = [
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
const COMPETENCIES = [
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
const LEVELS = {
    'Básico': 'far fa-gauge-min',
    'Intermedio': 'far fa-gauge',
    'Avanzado': 'far fa-gauge-max'
};

// TIEMPOS OFICIALES (9 duraciones)
const DURATIONS = [
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
const LANGUAGES = [
    'Español',
    'Inglés',
    'Portugués'
];

// ESTADOS DISPONIBLES (3 estados)
const STATUSES = {
    'default': { class: '', text: '' },
    'progress': { class: 'course-status--progress', text: 'En progreso' },
    'completed': { class: 'course-status--completed', text: 'Completado' }
};

/**
 * Tags de visibilidad LMS Creator (opcional en card; status-tag esquina superior izquierda de la imagen).
 *
 * Regla visual (card-content.css): si lmsTag === 'Archivado', la miniatura usa escala de grises (filter: grayscale)
 * sobre .course-image para indicar contenido archivado. El atributo data-lms-tag="Archivado" en .course-card activa el estilo.
 */
const LMS_TAG_LABELS = ['Publicado', 'Borrador', 'Privado', 'Oculto', 'Archivado'];

const LMS_TAG_TO_STATUS_CLASS = {
    'Publicado': 'ubits-status-tag--success',
    'Borrador': 'ubits-status-tag--info',
    'Privado': 'ubits-status-tag--warning',
    'Oculto': 'ubits-status-tag--neutral',
    'Archivado': 'ubits-status-tag--error'
};

/**
 * @param {string} label
 * @returns {string|null} clase modificadora ubits-status-tag--* o null si no es válida
 */
function getLmsTagStatusClass(label) {
    if (!label || typeof label !== 'string') return null;
    return LMS_TAG_TO_STATUS_CLASS[label.trim()] || null;
}

// ALIADOS OFICIALES (18 proveedores)
// NOTA: Las rutas son relativas al HTML que carga el componente, no al JS
// Desde subcarpetas (ubits-admin/*, ubits-colaborador/*) usar: '../../images/Favicons/...'
// Desde raíz usar: 'images/Favicons/...'
const PROVIDERS = {
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
function getRecommendedDuration(type) {
    if (type === 'Short') return '15 min';
    if (type === 'Artículo') return '15 min';
    if (type === 'Ruta de aprendizaje') return '120 min';
    if (type === 'Programa') return '120 min';
    return '60 min';
}

// Función para validar datos antes de renderizar
function validateCardData(cardData) {
    const errors = [];
    
    if (!CONTENT_TYPES.includes(cardData.type)) {
        errors.push(`Tipo de contenido no válido: ${cardData.type}`);
    }
    
    if (!COMPETENCIES.includes(cardData.competency)) {
        errors.push(`Competencia no válida: ${cardData.competency}`);
    }
    
    if (errors.length > 0) {
        console.warn('Errores de validación en card:', errors);
        console.warn('Opciones disponibles:', {
            types: CONTENT_TYPES,
            competencies: COMPETENCIES
        });
    }
    
    return errors.length === 0;
}

/**
 * Renderiza una course-card con todos sus datos
 * @param {Object} cardData - Datos de la card
 * @param {string} cardData.type - Tipo de contenido (Curso, Short, Charla, Artículo, Podcast, Libro, Ideas de libro, Caso de estudio, Documento técnico, Ejercicios de práctica, Ruta de aprendizaje, Programa)
 * @param {string} cardData.title - Título del contenido
 * @param {string} cardData.provider - Nombre del proveedor/aliado
 * @param {string} cardData.providerLogo - Ruta del logo del proveedor
 * @param {string} cardData.duration - Duración (15 min, 30 min, etc.)
 * @param {string} cardData.level - Nivel (Básico, Intermedio, Avanzado)
 * @param {number} cardData.progress - Progreso (0-100)
 * @param {string} cardData.status - Estado (default, progress, completed)
 * @param {string} cardData.image - Ruta de la imagen (puede ser cualquier imagen disponible en tu proyecto)
 * @param {string} cardData.competency - Competencia (Accountability, Administración de negocios, Agilidad, Comunicación, Cumplimiento (Compliance), Data skills, Desarrollo de software, Desarrollo web, Digital skills, e-Commerce, Emprendimiento, Experiencia del cliente, Gestión de procesos y operaciones, Gestión de proyectos, Gestión de recursos tecnológicos, Gestión del cambio, Gestión del riesgo, Gestión financiera, Herramientas tecnológicas, Inglés, Innovación, Inteligencia emocional, Lenguajes de Programación, Liderazgo, Marketing, Marketing digital, Negociación, People management, Product design, Productividad, Resolución de problemas, Trabajo en equipo, Ventas, Wellness)
 * @param {string} cardData.language - Idioma (Español, Inglés, etc.)
 * @param {string} [cardData.lmsTag] - Opcional. Tag LMS (Publicado, Borrador, Privado, Oculto, Archivado) en la esquina superior izquierda de la imagen; solo pantallas como LMS Creator / contenidos. Si es Archivado, la imagen se muestra en blanco y negro (grayscale) vía data-lms-tag + CSS.
 */
function renderCardContent(cardData) {
    // Determinar clase de estado
    let statusClass = '';
    let statusText = '';
    
    if (cardData.status === 'progress') {
        statusClass = 'course-status--progress';
        statusText = 'En progreso';
    } else if (cardData.status === 'completed') {
        statusClass = 'course-status--completed';
        statusText = 'Completado';
    }
    
    // Determinar icono según el nivel
    const levelIcon = LEVELS[cardData.level] || LEVELS['Intermedio'];

    // Detectar si es Ruta de aprendizaje o Programa y tiene múltiples proveedores
    const isRutaAprendizaje = cardData.type === 'Ruta de aprendizaje';
    const isPrograma = cardData.type === 'Programa';
    const hasMultipleProviders = (isRutaAprendizaje || isPrograma) && Array.isArray(cardData.providers) && cardData.providers.length > 1;
    
    // Renderizar avatares según el tipo (usa componente Avatar/Profile list si está disponible)
    let providerHTML = '';
    if (hasMultipleProviders) {
        const providers = cardData.providers;
        if (typeof renderProfileList === 'function') {
            const personas = providers.map(p => ({
                name: p.name || p.provider || 'Provider',
                avatar: p.logo || p.providerLogo || '../../images/Favicons/UBITS.jpg'
            }));
            providerHTML = `
                <div class="course-provider course-provider--multiple">
                    ${renderProfileList(personas, { size: 'sm', maxVisible: 3 })}
                    <span class="provider-name ubits-body-xs-regular">Varios</span>
                </div>
            `;
        } else {
            const totalCount = providers.length;
            const visibleCount = Math.min(totalCount, 3);
            const remainingCount = totalCount > 3 ? totalCount - 3 : 0;
            providerHTML = `
                <div class="course-provider course-provider--multiple">
                    <div class="ubits-profile-list ubits-profile-list--sm">
                        ${providers.slice(0, visibleCount).map((provider, index) => {
                            const zIndex = visibleCount - index;
                            const marginRight = (index < visibleCount - 1) || remainingCount > 0 ? '-5px' : '0';
                            const avatarUrl = provider.logo || provider.providerLogo || '../../images/Favicons/UBITS.jpg';
                            const alt = provider.name || provider.provider || 'Provider';
                            return `<span class="ubits-profile-list__avatar" style="z-index: ${zIndex}; margin-right: ${marginRight};"><span class="ubits-avatar ubits-avatar--sm"><img src="${avatarUrl}" alt="${alt}" class="ubits-avatar__img"></span></span>`;
                        }).join('')}
                        ${remainingCount > 0 ? `<span class="ubits-profile-list__count" style="z-index: 0; margin-right: 0;"><span class="ubits-profile-list__count-text">+${remainingCount}</span></span>` : ''}
                    </div>
                    <span class="provider-name ubits-body-xs-regular">Varios</span>
                </div>
            `;
        }
    } else {
        if (typeof renderAvatar === 'function') {
            providerHTML = `
                <div class="course-provider">
                    ${renderAvatar({ nombre: cardData.provider, avatar: cardData.providerLogo }, { size: 'sm' })}
                    <span class="provider-name ubits-body-xs-regular">${cardData.provider}</span>
                </div>
            `;
        } else {
            providerHTML = `
                <div class="course-provider">
                    <span class="ubits-avatar ubits-avatar--sm"><img src="${cardData.providerLogo}" alt="${cardData.provider}" class="ubits-avatar__img"></span>
                    <span class="provider-name ubits-body-xs-regular">${cardData.provider}</span>
                </div>
            `;
        }
    }

    let lmsTagBlock = '';
    /** Atributo data-lms-tag en la raíz de la card: usado por CSS (p. ej. Archivado → imagen en escala de grises). */
    let lmsTagDataAttr = '';
    if (cardData.lmsTag) {
        const label = String(cardData.lmsTag).trim();
        const lmsClass = getLmsTagStatusClass(label);
        if (lmsClass) {
            lmsTagDataAttr = ` data-lms-tag="${label}"`;
            lmsTagBlock = `
                <div class="course-card__lms-tag">
                    <span class="ubits-status-tag ubits-status-tag--sm ${lmsClass}">
                        <span class="ubits-status-tag__text">${label}</span>
                    </span>
                </div>`;
        }
    }

    // Template de la card
    return `
        <div class="course-card" data-progress="${cardData.progress}" data-status="${cardData.status}"${lmsTagDataAttr}>
            <div class="course-thumbnail-wrapper">
                <div class="course-thumbnail">
                    <img src="${cardData.image}" alt="${cardData.title}" class="course-image">
                </div>
                ${lmsTagBlock}
                ${(cardData.progress > 0 || cardData.status !== 'default') ? `
                <div class="course-progress-overlay">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${cardData.progress || 0}%"></div>
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="course-content">
                <div class="course-header">
                    <div class="course-type-status">
                        <span class="course-type ubits-body-xs-regular">${cardData.type}</span>
                        ${statusText ? `<span class="course-status ${statusClass} ubits-body-sm-bold">${statusText}</span>` : ''}
                    </div>
                </div>
                <h3 class="course-title ubits-body-sm-bold">${cardData.title}</h3>
                ${providerHTML}
                <div class="course-competency">
                    <div class="spec-icon">
                        <i class="far fa-tag"></i>
                    </div>
                    <span class="ubits-body-xs-regular">${cardData.competency}</span>
                </div>
                <div class="course-specs">
                    <div class="spec-item">
                        <div class="spec-icon">
                            <i class="${levelIcon}"></i>
                        </div>
                        <span class="ubits-body-xs-regular">${cardData.level}</span>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon">
                            <i class="far fa-clock"></i>
                        </div>
                        <span class="ubits-body-xs-regular">${cardData.duration}</span>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon">
                            <i class="far fa-globe"></i>
                        </div>
                        <span class="ubits-body-xs-regular">${cardData.language}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Carga múltiples course-cards en un contenedor
 * @param {string} containerId - ID del contenedor donde cargar las cards
 * @param {Array} cardsData - Array de objetos con datos de las cards
 */
function loadCardContent(containerId, cardsData) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    // Renderizar cada card
    cardsData.forEach(cardData => {
        const cardHTML = renderCardContent(cardData);
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}


/* ========================================
   DATOS DE EJEMPLO PARA QUICK START
   ======================================== */

// Ejemplo básico de uso
const sampleCardData = {
    type: 'Short',
    title: 'Mi primer contenido',
    provider: 'UBITS',
    providerLogo: '../../images/Favicons/UBITS.jpg',
    duration: '15 min',
    level: 'Básico',
    progress: 0,
    status: 'default',
    image: '../../images/cards-learn/descubre-las-bases-del-design-thinking.jpeg',
    competency: 'Product design',
    language: 'Español'
};

/* ========================================
   EXPORTAR FUNCIONES Y CONSTANTES
   ======================================== */

// Exponer funciones principales
window.renderCardContent = renderCardContent;
window.loadCardContent = loadCardContent;
window.validateCardData = validateCardData;
window.getRecommendedDuration = getRecommendedDuration;
window.getLmsTagStatusClass = getLmsTagStatusClass;

// Exponer todas las opciones disponibles
window.CARD_CONTENT_OPTIONS = {
    CONTENT_TYPES,
    COMPETENCIES,
    LEVELS,
    DURATIONS,
    LANGUAGES,
    STATUSES,
    PROVIDERS,
    LMS_TAG_LABELS
};

// Exponer datos de ejemplo
window.CARD_SAMPLES = {
    sampleCardData
};

/* ========================================
   INSTRUCCIONES DE USO
   ======================================== */

console.log(`
🚀 UBITS Card Content Component cargado exitosamente!

📋 OPCIONES DISPONIBLES:
• Tipos de contenido: ${CONTENT_TYPES.length} tipos
• Competencias: ${COMPETENCIES.length} competencias oficiales UBITS
• Niveles: ${Object.keys(LEVELS).length} niveles con iconos FontAwesome
• Duraciones: ${DURATIONS.length} tiempos oficiales
• Idiomas: ${LANGUAGES.length} idiomas
• Aliados: ${Object.keys(PROVIDERS).length} proveedores oficiales

💡 USO BÁSICO:
loadCardContent('mi-contenedor', [
    {
        type: 'Short',
        title: 'Mi contenido',
        provider: 'UBITS',
        duration: '15 min',
        level: 'Básico',
        progress: 50,
        status: 'progress',
        image: '../../images/mi-imagen.jpg',  // ✅ Usa cualquier imagen de tu proyecto (ruta relativa desde subcarpetas)
        competency: 'Product design',
        language: 'Español'
    }
]);

📷 NOTA SOBRE IMÁGENES:
• Las rutas de imagen pueden ser diferentes en cada proyecto
• El componente se adapta automáticamente a cualquier imagen
• Proporción 16:9 automática con zoom elegante en hover

🔍 VER TODAS LAS OPCIONES:
console.log(window.CARD_CONTENT_OPTIONS);
`);

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

/**
 * RENDERIZADO DEL COMPONENTE CARD CONTENT
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/card-content.css">
 * 2. JS: <script src="components/card-content.js"></script>
 * 3. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 4. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 5. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Container para las cards -->
 * <div id="mi-contenedor-cards"></div>
 * 
 * <!-- JavaScript -->
 * <script>
 * const cardsData = [
 *   {
 *     type: 'Curso',
 *     title: 'Mi contenido de aprendizaje',
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
 * loadCardContent('mi-contenedor-cards', cardsData);
 * </script>
 * ```
 * 
 * TIPOS DE CONTENIDO: Curso, Short, Charla, Artículo, Podcast, Libro, Ideas de libro, Caso de estudio, Documento técnico, Ejercicios de práctica, Ruta de aprendizaje, Programa
 * COMPETENCIAS: 35 competencias oficiales UBITS (Product design, Desarrollo de software, Liderazgo, etc.)
 * PROVEEDORES: 18 aliados oficiales (UBITS, Microsoft, TED, AWS, etc.)
 * NIVELES: Básico, Intermedio, Avanzado
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
 */
