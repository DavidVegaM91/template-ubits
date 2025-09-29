/* ========================================
   UBITS CARD CONTENT COMPONENT - COMPLETO
   Componente autocontenido con todas las opciones
   ======================================== */

/* ========================================
   CONFIGURACIÓN DE SPECS DISPONIBLES
   ======================================== */

// TIPOS DE CONTENIDO DISPONIBLES (11 tipos)
const CONTENT_TYPES = [
    'Curso',
    'Cápsula', 
    'Charla',
    'Artículo',
    'Podcast',
    'Libro',
    'Ideas de libro',
    'Caso de estudio',
    'Documento técnico',
    'Ejercicios de práctica',
    'Ruta de aprendizaje'
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

// ALIADOS OFICIALES (18 proveedores)
const PROVIDERS = {
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

// REGLA: Las cápsulas normalmente son de 15 minutos
function getRecommendedDuration(type) {
    if (type === 'Cápsula') return '15 min';
    if (type === 'Artículo') return '15 min';
    if (type === 'Ruta de aprendizaje') return '120 min';
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
 * @param {string} cardData.type - Tipo de contenido (Curso, Cápsula, Charla, Artículo, Podcast, Libro, Ideas de libro, Caso de estudio, Documento técnico, Ejercicios de práctica, Ruta de aprendizaje)
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

    // Template de la card
    return `
        <div class="course-card" data-progress="${cardData.progress}" data-status="${cardData.status}">
            <div class="course-thumbnail-wrapper">
                <div class="course-thumbnail">
                    <img src="${cardData.image}" alt="${cardData.title}" class="course-image">
                </div>
                <div class="course-progress-overlay">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${cardData.progress}%"></div>
                    </div>
                </div>
            </div>
            <div class="course-content">
                <div class="course-header">
                    <div class="course-type-status">
                        <span class="course-type ubits-body-sm-regular">${cardData.type}</span>
                        ${statusText ? `<span class="course-status ${statusClass} ubits-body-sm-bold">${statusText}</span>` : ''}
                    </div>
                </div>
                <h3 class="course-title ubits-body-sm-bold">${cardData.title}</h3>
                <div class="course-provider">
                    <div class="provider-avatar">
                        <img src="${cardData.providerLogo}" alt="${cardData.provider}" class="provider-icon">
                    </div>
                    <span class="provider-name ubits-body-sm-regular">${cardData.provider}</span>
                </div>
                <div class="course-competency">
                    <div class="spec-icon">
                        <i class="far fa-tag"></i>
                    </div>
                    <span class="ubits-body-sm-regular">${cardData.competency}</span>
                </div>
                <div class="course-specs">
                    <div class="spec-item">
                        <div class="spec-icon">
                            <i class="${levelIcon}"></i>
                        </div>
                        <span class="ubits-body-sm-regular">${cardData.level}</span>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon">
                            <i class="far fa-clock"></i>
                        </div>
                        <span class="ubits-body-sm-regular">${cardData.duration}</span>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon">
                            <i class="far fa-globe"></i>
                        </div>
                        <span class="ubits-body-sm-regular">${cardData.language}</span>
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
    type: 'Cápsula',
    title: 'Mi primer contenido',
    provider: 'UBITS',
    providerLogo: 'images/Favicons/UBITS.jpg',
    duration: '15 min',
    level: 'Básico',
    progress: 0,
    status: 'default',
    image: 'images/cards-learn/descubre-las-bases-del-design-thinking.jpeg',
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

// Exponer todas las opciones disponibles
window.CARD_CONTENT_OPTIONS = {
    CONTENT_TYPES,
    COMPETENCIES,
    LEVELS,
    DURATIONS,
    LANGUAGES,
    STATUSES,
    PROVIDERS
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
        type: 'Cápsula',
        title: 'Mi contenido',
        provider: 'UBITS',
        duration: '15 min',
        level: 'Básico',
        progress: 50,
        status: 'progress',
        image: 'images/mi-imagen.jpg',  // ✅ Usa cualquier imagen de tu proyecto
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
 * loadCardContent('mi-contenedor-cards', cardsData);
 * </script>
 * ```
 * 
 * TIPOS DE CONTENIDO: Curso, Cápsula, Charla, Artículo, Podcast, Libro, Ideas de libro, Caso de estudio, Documento técnico, Ejercicios de práctica, Ruta de aprendizaje
 * COMPETENCIAS: 35 competencias oficiales UBITS (Product design, Desarrollo de software, Liderazgo, etc.)
 * PROVEEDORES: 18 aliados oficiales (UBITS, Microsoft, TED, AWS, etc.)
 * NIVELES: Básico, Intermedio, Avanzado
 * ESTADOS: default, progress, completed
 */
