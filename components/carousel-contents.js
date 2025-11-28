/**
 * UBITS Carousel Contents Component
 * Componente de carrusel con múltiples variantes
 * Variante principal: Hero (banner grande horizontal)
 * 
 * @author UBITS
 * @version 1.0.0
 * 
 * ========================================
 * DOCUMENTACIÓN TÉCNICA UBITS CAROUSEL CONTENTS
 * ========================================
 * 
 * ## 📋 ESTRUCTURA DEL COMPONENTE
 * 
 * ### HTML Base:
 * ```html
 * <div id="hero-card-container"></div>
 * ```
 * 
 * ### CSS Requerido:
 * ```html
 * <link rel="stylesheet" href="ubits-colors.css">
 * <link rel="stylesheet" href="ubits-typography.css">
 * <link rel="stylesheet" href="fontawesome-icons.css">
 * <link rel="stylesheet" href="components/carousel-contents.css">
 * <link rel="stylesheet" href="components/button.css">
 * ```
 * 
 * ### JavaScript Requerido:
 * ```html
 * <script src="components/carousel-contents.js"></script>
 * ```
 * 
 * ## 🎯 IMPLEMENTACIÓN BÁSICA
 * 
 * ### Carousel con un slide:
 * ```javascript
 * createCarouselContents({
 *     containerId: 'hero-card-container',
 *     type: 'hero',
 *     slides: [{
 *         image: 'images/cards-learn/el-manejo-de-las-emociones.jpeg',
 *         contentType: 'Curso',
 *         title: 'El manejo de las emociones',
 *         provider: {
 *             name: 'Harvard Business Publishing',
 *             logo: 'images/Favicons/Harvard-Business-Publishing.jpg'
 *         },
 *         competency: 'Inteligencia emocional',
 *         specs: {
 *             level: 'Intermedio',
 *             duration: '60 min',
 *             language: 'Español'
 *         }
 *     }]
 * });
 * ```
 * 
 * ### Carousel con múltiples slides:
 * ```javascript
 * createCarouselContents({
 *     containerId: 'hero-card-container',
 *     type: 'hero',
 *     slides: [
 *         {
 *             image: 'images/cards-learn/el-manejo-de-las-emociones.jpeg',
 *             contentType: 'Curso',
 *             title: 'El manejo de las emociones',
 *             provider: {
 *                 name: 'Harvard Business Publishing',
 *                 logo: 'images/Favicons/Harvard-Business-Publishing.jpg'
 *             },
 *             competency: 'Inteligencia emocional',
 *             specs: {
 *                 level: 'Intermedio',
 *                 duration: '60 min',
 *                 language: 'Español'
 *             }
 *         },
 *         // ... más slides
 *     ],
 *     onButtonClick: function(slide, index) {
 *         console.log('Ver ahora clicked:', slide.title, 'Slide:', index + 1);
 *     }
 * });
 * ```
 * 
 * ### Carousel Promo Vertical (solo imágenes):
 * ```javascript
 * createCarouselContents({
 *     containerId: 'promo-vertical-container',
 *     type: 'promo-vertical',
 *     sectionTitle: 'Libros recomendados',
 *     slides: [
 *         {
 *             image: 'images/cards-learn/libro-1.jpeg',
 *             title: 'El camino del lobo'
 *         },
 *         {
 *             image: 'images/cards-learn/libro-2.jpeg',
 *             title: 'Quiet: El poder de los introvertidos'
 *         },
 *         // ... más slides
 *     ]
 * });
 * ```
 * 
 * ### Carousel Allies (aliados destacados):
 * ```javascript
 * createCarouselContents({
 *     containerId: 'allies-container',
 *     type: 'allies',
 *     sectionTitle: 'Explora por aliados destacados',
 *     slides: [
 *         {
 *             name: 'UBITS',
 *             logo: 'images/Favicons/UBITS.jpg'
 *         },
 *         {
 *             name: 'Microsoft',
 *             logo: 'images/Favicons/Microsoft.jpg'
 *         },
 *         {
 *             name: 'Harvard Business Publishing',
 *             logo: 'images/Favicons/Harvard-Business-Publishing.jpg'
 *         },
 *         // ... más slides
 *     ],
 *     onButtonClick: function(ally, index) {
 *         console.log('Ally clicked:', ally.name, 'Index:', index);
 *     }
 * });
 * ```
 * 
 * ### Carousel Content Cards (cards de contenido):
 * ```javascript
 * createCarouselContents({
 *     containerId: 'content-cards-container',
 *     type: 'content-cards',
 *     sectionTitle: 'Section title',
 *     slides: [
 *         {
 *             image: 'images/cards-learn/el-manejo-de-las-emociones.jpeg',
 *             contentType: 'Curso',
 *             title: 'AMB Marketing, la mejor estrategia para ventas B2B',
 *             provider: {
 *                 name: 'UBITS',
 *                 logo: 'images/Favicons/UBITS.jpg'
 *             },
 *             competency: 'Marketing',
 *             specs: {
 *                 level: 'Avanzado',
 *                 duration: '30 min',
 *                 language: 'Español'
 *             },
 *             status: 'default',
 *             progress: 0
 *         },
 *         // ... más slides
 *     ]
 * });
 * ```
 * 
 * ### Carousel Content Cards con Ruta de aprendizaje (múltiples proveedores):
 * ```javascript
 * createCarouselContents({
 *     containerId: 'content-cards-container',
 *     type: 'content-cards',
 *     sectionTitle: 'Rutas de aprendizaje',
 *     slides: [
 *         {
 *             image: 'images/cards-learn/ruta-marketing.jpeg',
 *             contentType: 'Ruta de aprendizaje',
 *             title: 'Ruta completa de Marketing Digital',
 *             providers: [
 *                 {name: 'UBITS', logo: 'images/Favicons/UBITS.jpg'},
 *                 {name: 'Microsoft', logo: 'images/Favicons/Microsoft.jpg'},
 *                 {name: 'Hubspot', logo: 'images/Favicons/Hubspot.jpg'},
 *                 {name: 'TED', logo: 'images/Favicons/TED.jpg'}
 *             ],
 *             competency: 'Marketing digital',
 *             specs: {
 *                 level: 'Intermedio',
 *                 duration: '120 min',
 *                 language: 'Español'
 *             },
 *             status: 'progress',
 *             progress: 45
 *         },
 *         // ... más slides
 *     ]
 * });
 * ```
 * 
 * **Nota:** La variante `content-cards` usa el componente oficial `card-content` de UBITS. 
 * Asegúrate de importar `components/card-content.js` y `components/card-content.css` antes de usar esta variante.
 * 
 * **Variantes de avatares para Ruta de aprendizaje:**
 * - **2 proveedores:** Muestra 2 avatares superpuestos + texto "Varios"
 * - **3 proveedores:** Muestra 3 avatares superpuestos + texto "Varios"
 * - **4+ proveedores:** Muestra 3 avatares visibles + 1 avatar con "+N" + texto "Varios"
 * 
 * ## 🎨 VARIANTES DISPONIBLES
 * 
 * ### Tipos de Variante:
 * - `hero` - Banner grande horizontal (21:9 desktop/tablet, 1:1 mobile) - **Por defecto**
 * - `promo-vertical` - Carrusel de cards verticales con imágenes (aspect ratio 3:4)
 * - `allies` - Carrusel de aliados destacados con logos circulares y tooltips
 * - `content-cards` - Carrusel de cards de contenido usando el componente oficial `card-content`
 * 
 * **Nota:** Más variantes se agregarán en el futuro.
 * 
 * ## 🔧 API COMPLETA
 * 
 * ### Parámetros de Configuración:
 * | Parámetro | Tipo | Por Defecto | Descripción |
 * |-----------|------|-------------|-------------|
 * | `containerId` | string | **Requerido** | ID del contenedor donde se renderizará el carousel |
 * | `type` | string | `'hero'` | Tipo de variante ('hero', 'promo-vertical', 'allies' o 'content-cards') |
 * | `slides` | Array | **Requerido** | Array de objetos con información de cada slide |
 * | `sectionTitle` | string | `'Section title'` | Título de la sección (para variantes 'promo-vertical' y 'allies') |
 * | `onButtonClick` | function | `null` | Callback cuando se hace clic en el botón "Ver ahora" (variante 'hero') o en un card (variante 'allies') |
 * 
 * ### Estructura de un Slide:
 * | Propiedad | Tipo | Requerido | Descripción |
 * |-----------|------|-----------|-------------|
 * | `image` | string | **Sí** | URL de la imagen de fondo del slide |
 * | `contentType` | string | No | Tipo de contenido (Curso, Charla, etc.) - Por defecto: 'Curso' |
 * | `title` | string | **Sí** | Título del contenido |
 * | `provider` | Object | No | Información del proveedor |
 * | `provider.name` | string | No | Nombre del proveedor |
 * | `provider.logo` | string | No | URL del logo del proveedor |
 * | `competency` | string | No | Competencia/Categoría del contenido |
 * | `specs` | Object | No | Especificaciones del contenido |
 * | `specs.level` | string | No | Nivel: 'Básico', 'Intermedio', 'Avanzado' |
 * | `specs.duration` | string | No | Duración (ej: '60 min', '90 min') |
 * | `specs.language` | string | No | Idioma (ej: 'Español', 'Inglés', 'Portugués') |
 * 
 * ### Métodos Disponibles (instancia):
 * | Método | Descripción | Ejemplo |
 * |--------|-------------|---------|
 * | `nextSlide()` | Avanzar al siguiente slide | `window.carouselContentsInstances['containerId'].nextSlide()` |
 * | `prevSlide()` | Retroceder al slide anterior | `window.carouselContentsInstances['containerId'].prevSlide()` |
 * | `goToSlide(index)` | Ir a un slide específico | `window.carouselContentsInstances['containerId'].goToSlide(2)` |
 * | `currentSlide()` | Obtener índice del slide actual | `window.carouselContentsInstances['containerId'].currentSlide()` |
 * | `handleButtonClick()` | Ejecutar callback del botón "Ver ahora" | `window.carouselContentsInstances['containerId'].handleButtonClick()` |
 * 
 * ## 🎨 CARACTERÍSTICAS Y COMPORTAMIENTO
 * 
 * ### Desktop/Tablet (>768px):
 * - **Proporción:** 21:9 (aspect-ratio)
 * - **Auto-advance:** Cada 5 segundos automáticamente
 * - **Controles:** Botones de navegación (anterior/siguiente) en la parte inferior derecha
 * - **Indicadores:** Dots centrados en la parte inferior dentro del card
 * - **Pausa:** Se pausa automáticamente al hacer hover
 * - **Efecto hover:** Zoom suave en la imagen (1.08x) con transición de 0.6s
 * - **Botón "Ver ahora":** Visible y funcional
 * 
 * ### Mobile (≤768px):
 * - **Proporción:** 1:1 (aspect-ratio)
 * - **Auto-advance:** Deshabilitado
 * - **Controles:** Ocultos
 * - **Indicadores:** Dots fuera del card, a 8px de distancia debajo
 * - **Botón "Ver ahora":** Oculto
 * - **Swipe:** Funcional (deslizar derecha = siguiente, izquierda = anterior)
 * - **Título:** Cambia a `ubits-body-md-bold` (16px) en lugar de `ubits-display-d3-bold`
 * 
 * ## 🎨 DISEÑO Y ESTILOS
 * 
 * ### Colores:
 * - Todos los textos usan `var(--ubits-fg-1-high-static-inverted)` para contraste sobre imagen oscura
 * - Indicadores activos: `var(--ubits-accent-brand)`
 * - Indicadores inactivos: `var(--ubits-fg-gray-subtle-hover)`
 * 
 * ### Tipografía:
 * - **Título (Desktop):** `ubits-display-d3-bold` (32px, bold, 48px line-height)
 * - **Título (Mobile):** `ubits-body-md-bold` (16px, bold, 24px line-height)
 * - **Textos descriptivos:** `ubits-body-xs-regular` (11px, regular, 16.5px line-height)
 * 
 * ### Componentes UBITS Utilizados:
 * - **Botón "Ver ahora":** `ubits-button--secondary--md` oficial UBITS
 * - **Controles:** `ubits-button--secondary--md--icon-only` oficial UBITS
 * 
 * ### Efectos Visuales:
 * - **Zoom en hover:** La imagen de fondo hace zoom suave (1.08x) al pasar el mouse sobre el carrusel
 * - **Transición:** 0.6s ease para una animación fluida
 * - **Combinado con pausa:** El zoom se activa junto con la pausa del auto-advance al hacer hover
 * 
 * ## 📱 RESPONSIVE
 * 
 * - **Desktop (>1023px):** Proporción 21:9, todos los controles visibles
 * - **Tablet (768px-1023px):** Proporción 21:9, todos los controles visibles
 * - **Mobile (≤768px):** Proporción 1:1, controles ocultos, indicadores fuera
 * 
 * ## ⚠️ NOTAS IMPORTANTES
 * 
 * - El componente requiere que el contenedor tenga `padding: 0` si está dentro de un widget
 * - Las imágenes deben estar en formato adecuado (recomendado: JPEG, mínimo 1920x1080px para desktop)
 * - Los logos de proveedores deben estar en `images/Favicons/`
 * - Las imágenes de contenido deben estar en `images/cards-learn/`
 * - El componente maneja automáticamente el ciclo infinito (del último al primero y viceversa)
 * - Los indicadores se actualizan automáticamente al cambiar de slide
 * 
 * @param {Object} options - Opciones del carousel
 * @param {string} options.containerId - ID del contenedor donde se renderizará el carousel
 * @param {string} options.type - Tipo de variante ('hero' por defecto)
 * @param {Array<Object>} options.slides - Array de slides con información de cada contenido
 * @param {Function} options.onButtonClick - Callback cuando se hace clic en el botón "Ver ahora". Recibe (slide, index)
 */
function createCarouselContents(options) {
    const {
        containerId,
        type = 'hero',
        slides = [],
        sectionTitle = 'Section title',
        onButtonClick
    } = options;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }

    if (!slides || slides.length === 0) {
        console.error('No slides provided');
        return;
    }

    // Validar variante
    if (type !== 'hero' && type !== 'promo-vertical' && type !== 'allies' && type !== 'content-cards' && type !== 'outstanding') {
        console.warn(`Variante "${type}" no implementada aún. Usando variante "hero" por defecto.`);
        type = 'hero';
    }

    // Estado del carrusel
    let currentSlideIndex = 0;
    let autoAdvanceInterval = null;
    let touchStartX = 0;
    let touchEndX = 0;

    // Iconos según el nivel
    const levelIcons = {
        'Básico': 'far fa-gauge-min',
        'Intermedio': 'far fa-gauge',
        'Avanzado': 'far fa-gauge-max'
    };

    // Función para renderizar un slide
    function renderSlide(slideIndex) {
        const slide = slides[slideIndex];
        if (!slide) return '';

        const levelIcon = levelIcons[slide.specs?.level] || levelIcons['Intermedio'];

        return `
            <div class="carousel-contents--hero__slide ${slideIndex === currentSlideIndex ? 'active' : ''}" data-slide-index="${slideIndex}">
                <!-- Imagen de fondo -->
                <div class="carousel-contents--hero__image-wrapper">
                    <img src="${slide.image}" alt="${slide.title}" class="carousel-contents--hero__image">
                    <div class="carousel-contents--hero__gradient"></div>
                </div>

                <!-- Contenido superpuesto -->
                <div class="carousel-contents--hero__content">
                    <!-- Tipo de contenido -->
                    <div class="carousel-contents--hero__type">
                        <span class="carousel-contents--hero__type-text ubits-body-sm-regular">${slide.contentType || 'Curso'}</span>
                    </div>

                    <!-- Título -->
                    <div class="carousel-contents--hero__title-wrapper">
                        <h2 class="carousel-contents--hero__title ubits-display-d3-bold">${slide.title}</h2>
                    </div>

                    <!-- Proveedor -->
                    ${(() => {
                        const isRutaAprendizaje = slide.contentType === 'Ruta de aprendizaje';
                        const hasMultipleProviders = isRutaAprendizaje && Array.isArray(slide.providers) && slide.providers.length > 1;
                        
                        if (hasMultipleProviders) {
                            // Múltiples avatares para Ruta de aprendizaje
                            const providers = slide.providers;
                            const totalCount = providers.length;
                            const visibleCount = Math.min(totalCount, 3);
                            const remainingCount = totalCount > 3 ? totalCount - 3 : 0;
                            
                            return `
                                <div class="carousel-contents--hero__provider carousel-contents--hero__provider--multiple">
                                    <div class="carousel-contents--hero__provider-avatars-list">
                                        ${providers.slice(0, visibleCount).map((provider, index) => {
                                            const zIndex = visibleCount - index;
                                            // Si hay un avatar con "+N" después, el último avatar visible también debe tener margin-right: -5px
                                            const marginRight = (index < visibleCount - 1) || remainingCount > 0 ? '-5px' : '0';
                                            return `
                                                <div class="carousel-contents--hero__provider-avatar carousel-contents--hero__provider-avatar--stacked" style="z-index: ${zIndex}; margin-right: ${marginRight};">
                                                    <img src="${provider.logo || 'images/Favicons/UBITS.jpg'}" alt="${provider.name || 'Provider'}" class="carousel-contents--hero__provider-image">
                                                </div>
                                            `;
                                        }).join('')}
                                        ${remainingCount > 0 ? `
                                            <div class="carousel-contents--hero__provider-avatar carousel-contents--hero__provider-avatar--stacked carousel-contents--hero__provider-avatar--count" style="z-index: 0; margin-right: 0;">
                                                <span class="carousel-contents--hero__provider-count-text">+${remainingCount}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <span class="carousel-contents--hero__provider-name ubits-body-sm-regular">Varios</span>
                                </div>
                            `;
                        } else if (slide.provider?.name) {
                            // Avatar único (comportamiento normal)
                            return `
                                <div class="carousel-contents--hero__provider">
                                    ${slide.provider.logo ? `
                                        <div class="carousel-contents--hero__provider-avatar">
                                            <img src="${slide.provider.logo}" alt="${slide.provider.name}" class="carousel-contents--hero__provider-image">
                                        </div>
                                    ` : ''}
                                    <span class="carousel-contents--hero__provider-name ubits-body-sm-regular">${slide.provider.name}</span>
                                </div>
                            `;
                        }
                        return '';
                    })()}

                    <!-- Competencia -->
                    ${slide.competency ? `
                        <div class="carousel-contents--hero__competency">
                            <div class="carousel-contents--hero__competency-icon">
                                <i class="far fa-tag"></i>
                            </div>
                            <span class="carousel-contents--hero__competency-text ubits-body-sm-regular">${slide.competency}</span>
                        </div>
                    ` : ''}

                    <!-- Especificaciones -->
                    <div class="carousel-contents--hero__specs">
                        ${slide.specs?.level ? `
                            <div class="carousel-contents--hero__spec-item">
                                <div class="carousel-contents--hero__spec-icon">
                                    <i class="${levelIcon}"></i>
                                </div>
                                <span class="carousel-contents--hero__spec-text ubits-body-sm-regular">${slide.specs.level}</span>
                            </div>
                        ` : ''}
                        ${slide.specs?.duration ? `
                            <div class="carousel-contents--hero__spec-item">
                                <div class="carousel-contents--hero__spec-icon">
                                    <i class="far fa-clock"></i>
                                </div>
                                <span class="carousel-contents--hero__spec-text ubits-body-sm-regular">${slide.specs.duration}</span>
                            </div>
                        ` : ''}
                        ${slide.specs?.language ? `
                            <div class="carousel-contents--hero__spec-item">
                                <div class="carousel-contents--hero__spec-icon">
                                    <i class="far fa-globe"></i>
                                </div>
                                <span class="carousel-contents--hero__spec-text ubits-body-sm-regular">${slide.specs.language}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Acciones -->
                    <div class="carousel-contents--hero__actions">
                        <div class="carousel-contents--hero__button-wrapper">
                            <button class="ubits-button ubits-button--secondary ubits-button--md" 
                                    onclick="window.carouselContentsInstances['${containerId}'].handleButtonClick()">
                                <i class="far fa-play"></i>
                                <span>Ver ahora</span>
                            </button>
                        </div>
                        ${slides.length > 1 ? `
                            <div class="carousel-contents--hero__indicators carousel-contents--hero__indicators--inside">
                                ${slides.map((_, i) => `
                                    <div class="carousel-contents--hero__indicator ${i === currentSlideIndex ? 'active' : ''}" 
                                         data-slide="${i}">
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Función para renderizar un slide de promo-vertical (solo imagen)
    function renderPromoVerticalSlide(slideIndex) {
        const slide = slides[slideIndex];
        if (!slide) return '';

        return `
            <div class="carousel-contents--promo-vertical__card" data-slide-index="${slideIndex}">
                <img src="${slide.image}" alt="${slide.title || 'Promo card'}" class="carousel-contents--promo-vertical__card-image">
            </div>
        `;
    }

    // Función para renderizar un slide de allies (card circular con logo)
    function renderAlliesSlide(slideIndex) {
        const slide = slides[slideIndex];
        if (!slide) return '';

        return `
            <div class="carousel-contents--allies__card" data-slide-index="${slideIndex}" data-ally="${slide.name || slide.title}">
                <div class="carousel-contents--allies__card-image">
                    <img src="${slide.logo || slide.image}" alt="${slide.name || slide.title || 'Ally'}" loading="lazy">
                </div>
                <div class="carousel-contents--allies__card-tooltip">${slide.name || slide.title || 'Ally'}</div>
            </div>
        `;
    }

    // Función para renderizar un slide de outstanding (layout horizontal: contenido izquierda, imagen derecha)
    function renderOutstandingSlide(slideIndex) {
        const slide = slides[slideIndex];
        if (!slide) return '';

        const levelIcon = levelIcons[slide.specs?.level] || levelIcons['Intermedio'];

        return `
            <div class="carousel-contents--outstanding__slide ${slideIndex === currentSlideIndex ? 'active' : ''}" data-slide-index="${slideIndex}">
                <!-- Contenido izquierda -->
                <div class="carousel-contents--outstanding__content">
                    <!-- Tipo de contenido -->
                    <div class="carousel-contents--outstanding__type">
                        <span class="carousel-contents--outstanding__type-text ubits-body-sm-regular">${slide.contentType || 'Curso'}</span>
                    </div>

                    <!-- Título -->
                    <div class="carousel-contents--outstanding__title-wrapper">
                        <h2 class="carousel-contents--outstanding__title ubits-display-d4-bold">${slide.title}</h2>
                    </div>

                    <!-- Proveedor -->
                    ${(() => {
                        const isRutaAprendizaje = slide.contentType === 'Ruta de aprendizaje';
                        const hasMultipleProviders = isRutaAprendizaje && Array.isArray(slide.providers) && slide.providers.length > 1;
                        
                        if (hasMultipleProviders) {
                            // Múltiples avatares para Ruta de aprendizaje
                            const providers = slide.providers;
                            const totalCount = providers.length;
                            const visibleCount = Math.min(totalCount, 3);
                            const remainingCount = totalCount > 3 ? totalCount - 3 : 0;
                            
                            return `
                                <div class="carousel-contents--outstanding__provider carousel-contents--outstanding__provider--multiple">
                                    <div class="carousel-contents--outstanding__provider-avatars-list">
                                        ${providers.slice(0, visibleCount).map((provider, index) => {
                                            const zIndex = visibleCount - index;
                                            // Si hay un avatar con "+N" después, el último avatar visible también debe tener margin-right: -5px
                                            const marginRight = (index < visibleCount - 1) || remainingCount > 0 ? '-5px' : '0';
                                            return `
                                                <div class="carousel-contents--outstanding__provider-avatar carousel-contents--outstanding__provider-avatar--stacked" style="z-index: ${zIndex}; margin-right: ${marginRight};">
                                                    <img src="${provider.logo || 'images/Favicons/UBITS.jpg'}" alt="${provider.name || 'Provider'}" class="carousel-contents--outstanding__provider-image">
                                                </div>
                                            `;
                                        }).join('')}
                                        ${remainingCount > 0 ? `
                                            <div class="carousel-contents--outstanding__provider-avatar carousel-contents--outstanding__provider-avatar--stacked carousel-contents--outstanding__provider-avatar--count" style="z-index: 0; margin-right: 0;">
                                                <span class="carousel-contents--outstanding__provider-count-text">+${remainingCount}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <span class="carousel-contents--outstanding__provider-name ubits-body-sm-regular">Varios</span>
                                </div>
                            `;
                        } else if (slide.provider?.name) {
                            // Avatar único (comportamiento normal)
                            return `
                                <div class="carousel-contents--outstanding__provider">
                                    ${slide.provider.logo ? `
                                        <div class="carousel-contents--outstanding__provider-avatar">
                                            <img src="${slide.provider.logo}" alt="${slide.provider.name}" class="carousel-contents--outstanding__provider-image">
                                        </div>
                                    ` : ''}
                                    <span class="carousel-contents--outstanding__provider-name ubits-body-sm-regular">${slide.provider.name}</span>
                                </div>
                            `;
                        }
                        return '';
                    })()}

                    <!-- Competencia -->
                    ${slide.competency ? `
                        <div class="carousel-contents--outstanding__competency">
                            <div class="carousel-contents--outstanding__competency-icon">
                                <i class="far fa-tag"></i>
                            </div>
                            <span class="carousel-contents--outstanding__competency-text ubits-body-sm-regular">${slide.competency}</span>
                        </div>
                    ` : ''}

                    <!-- Especificaciones -->
                    <div class="carousel-contents--outstanding__specs">
                        ${slide.specs?.level ? `
                            <div class="carousel-contents--outstanding__spec-item">
                                <div class="carousel-contents--outstanding__spec-icon">
                                    <i class="${levelIcon}"></i>
                                </div>
                                <span class="carousel-contents--outstanding__spec-text ubits-body-sm-regular">${slide.specs.level}</span>
                            </div>
                        ` : ''}
                        ${slide.specs?.duration ? `
                            <div class="carousel-contents--outstanding__spec-item">
                                <div class="carousel-contents--outstanding__spec-icon">
                                    <i class="far fa-clock"></i>
                                </div>
                                <span class="carousel-contents--outstanding__spec-text ubits-body-sm-regular">${slide.specs.duration}</span>
                            </div>
                        ` : ''}
                        ${slide.specs?.language ? `
                            <div class="carousel-contents--outstanding__spec-item">
                                <div class="carousel-contents--outstanding__spec-icon">
                                    <i class="far fa-globe"></i>
                                </div>
                                <span class="carousel-contents--outstanding__spec-text ubits-body-sm-regular">${slide.specs.language}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Botón Ver ahora -->
                    <div class="carousel-contents--outstanding__button-wrapper">
                        <button class="ubits-button ubits-button--secondary ubits-button--md" 
                                onclick="window.carouselContentsInstances['${containerId}'].handleButtonClick()">
                            <i class="far fa-play"></i>
                            <span>Ver ahora</span>
                        </button>
                    </div>
                </div>

                <!-- Imagen derecha -->
                <div class="carousel-contents--outstanding__image-wrapper">
                    <img src="${slide.image}" alt="${slide.title}" class="carousel-contents--outstanding__image">
                    ${slides.length > 1 ? `
                        <div class="carousel-contents--outstanding__controls">
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--outstanding__prev-btn">
                                <i class="far fa-chevron-left"></i>
                            </button>
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--outstanding__next-btn">
                                <i class="far fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Función para actualizar el carrusel
    function updateCarousel() {
        if (type === 'allies' || type === 'promo-vertical') {
            // Para allies y promo-vertical, la navegación se maneja directamente con scroll
            // No necesita actualización especial aquí
            return;
        }

        if (type === 'outstanding') {
            // Lógica para variante outstanding
            const wrapper = container.querySelector('.carousel-contents--outstanding-wrapper');
            if (!wrapper) return;

            // Actualizar slides activos
            const allSlides = wrapper.querySelectorAll('.carousel-contents--outstanding__slide');
            allSlides.forEach((slide, i) => {
                const slideIndex = parseInt(slide.getAttribute('data-slide-index') || i);
                if (slideIndex === currentSlideIndex) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Actualizar indicadores (solo visibles en mobile)
            const indicators = wrapper.querySelectorAll('.carousel-contents--outstanding__indicator');
            indicators.forEach((indicator) => {
                const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
                if (slideIndex === currentSlideIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });

            return;
        }

        // Lógica para variante hero
        const wrapper = container.querySelector('.carousel-contents--hero-wrapper');
        if (!wrapper) return;

        // Actualizar slides activos (sin regenerar HTML)
        const allSlides = wrapper.querySelectorAll('.carousel-contents--hero__slide');
        allSlides.forEach((slide, i) => {
            const slideIndex = parseInt(slide.getAttribute('data-slide-index') || i);
            if (slideIndex === currentSlideIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Actualizar indicadores dentro del card
        const indicatorsInside = wrapper.querySelectorAll('.carousel-contents--hero__indicators--inside .carousel-contents--hero__indicator');
        indicatorsInside.forEach((indicator) => {
            const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
            if (slideIndex === currentSlideIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        // Actualizar indicadores fuera del card (mobile)
        const indicatorsOutside = wrapper.querySelectorAll('.carousel-contents--hero__indicators--outside .carousel-contents--hero__indicator');
        indicatorsOutside.forEach((indicator) => {
            const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
            if (slideIndex === currentSlideIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        // Actualizar botones de control
        const prevBtn = wrapper.querySelector('.carousel-contents--hero__prev-btn');
        const nextBtn = wrapper.querySelector('.carousel-contents--hero__next-btn');
        
        if (prevBtn) {
            prevBtn.disabled = currentSlideIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentSlideIndex === slides.length - 1;
        }
    }

    // Función para ir al siguiente slide
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateCarousel();
        if (type === 'hero' || type === 'outstanding') {
            resetAutoAdvance();
        }
    }

    // Función para ir al slide anterior
    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateCarousel();
        if (type === 'hero' || type === 'outstanding') {
            resetAutoAdvance();
        }
    }

    // Función para ir a un slide específico
    function goToSlide(index) {
        if (index >= 0 && index < slides.length) {
            currentSlideIndex = index;
            updateCarousel();
            if (type === 'hero' || type === 'outstanding') {
                resetAutoAdvance();
            }
        }
    }

    // Función para iniciar auto-advance (solo en desktop)
    function startAutoAdvance() {
        // Asegurarse de que no haya un intervalo activo antes de crear uno nuevo
        stopAutoAdvance();
        if ((type === 'hero' || type === 'outstanding') && window.innerWidth > 768) {
            autoAdvanceInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        }
    }

    // Función para detener auto-advance
    function stopAutoAdvance() {
        if (autoAdvanceInterval) {
            clearInterval(autoAdvanceInterval);
            autoAdvanceInterval = null;
        }
    }

    // Función para resetear auto-advance
    function resetAutoAdvance() {
        stopAutoAdvance();
        startAutoAdvance();
    }

    // Función para manejar swipe en mobile
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe izquierda - siguiente
                nextSlide();
            } else {
                // Swipe derecha - anterior
                prevSlide();
            }
        }
    }

    // Generar HTML inicial según la variante
    let carouselHTML = '';
    
    if (type === 'promo-vertical') {
        // HTML para variante promo-vertical
        carouselHTML = `
            <div class="carousel-contents--promo-vertical-wrapper">
                <div class="carousel-contents--promo-vertical__header">
                    <h2 class="carousel-contents--promo-vertical__title ubits-heading-h2">${sectionTitle}</h2>
                    ${slides.length > 1 ? `
                        <div class="carousel-contents--promo-vertical__controls">
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--promo-vertical__prev-btn">
                                <i class="far fa-chevron-left"></i>
                            </button>
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--promo-vertical__next-btn">
                                <i class="far fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="carousel-contents--promo-vertical__cards-container">
                    ${slides.map((_, i) => renderPromoVerticalSlide(i)).join('')}
                </div>
                ${slides.length > 1 ? `
                    <div class="carousel-contents--promo-vertical__indicators">
                        ${slides.map((_, i) => `
                            <div class="carousel-contents--promo-vertical__indicator ${i === 0 ? 'active' : ''}" 
                                 data-slide="${i}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else if (type === 'allies') {
        // HTML para variante allies
        carouselHTML = `
            <div class="carousel-contents--allies-wrapper">
                <div class="carousel-contents--allies__header">
                    <h2 class="carousel-contents--allies__title ubits-heading-h2">${sectionTitle}</h2>
                    ${slides.length > 1 ? `
                        <div class="carousel-contents--allies__controls">
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--allies__prev-btn">
                                <i class="far fa-chevron-left"></i>
                            </button>
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--allies__next-btn">
                                <i class="far fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="carousel-contents--allies__carousel">
                    ${slides.map((_, i) => renderAlliesSlide(i)).join('')}
                </div>
                ${slides.length > 1 ? `
                    <div class="carousel-contents--allies__indicators">
                        ${slides.map((_, i) => `
                            <div class="carousel-contents--allies__indicator ${i === 0 ? 'active' : ''}" 
                                 data-slide="${i}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else if (type === 'content-cards') {
        // HTML para variante content-cards
        carouselHTML = `
            <div class="carousel-contents--content-cards-wrapper">
                <div class="carousel-contents--content-cards__header">
                    <h2 class="carousel-contents--content-cards__title ubits-heading-h2">${sectionTitle}</h2>
                    ${slides.length > 1 ? `
                        <div class="carousel-contents--content-cards__controls">
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--content-cards__prev-btn">
                                <i class="far fa-chevron-left"></i>
                            </button>
                            <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only carousel-contents--content-cards__next-btn">
                                <i class="far fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="carousel-contents--content-cards__cards-container" id="${containerId}-cards-container">
                    <!-- Los cards se cargarán aquí usando loadCardContent() -->
                </div>
                ${slides.length > 1 ? `
                    <div class="carousel-contents--content-cards__indicators">
                        ${slides.map((_, i) => `
                            <div class="carousel-contents--content-cards__indicator ${i === 0 ? 'active' : ''}" 
                                 data-slide="${i}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else if (type === 'outstanding') {
        // HTML para variante outstanding
        carouselHTML = `
            <div class="carousel-contents--outstanding-wrapper">
                <div class="carousel-contents--outstanding__header">
                    <h2 class="carousel-contents--outstanding__title ubits-heading-h2">${sectionTitle}</h2>
                </div>
                <div class="carousel-contents--outstanding__slides-container">
                    ${slides.map((_, i) => renderOutstandingSlide(i)).join('')}
                </div>
                ${slides.length > 1 ? `
                    <div class="carousel-contents--outstanding__indicators">
                        ${slides.map((_, i) => `
                            <div class="carousel-contents--outstanding__indicator ${i === 0 ? 'active' : ''}" 
                                 data-slide="${i}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // HTML para variante hero
        const indicatorsHTML = slides.map((_, i) => `
            <div class="carousel-contents--hero__indicator ${i === currentSlideIndex ? 'active' : ''}" 
                 data-slide="${i}">
            </div>
        `).join('');

        carouselHTML = `
            <div class="carousel-contents--hero-wrapper">
                <div class="carousel-contents--hero">
                    <div class="carousel-contents--hero__slides-container">
                        ${slides.map((_, i) => renderSlide(i)).join('')}
                    </div>
                    ${slides.length > 1 ? `
                        <div class="carousel-contents--hero__controls">
                            <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only carousel-contents--hero__prev-btn">
                                <i class="far fa-chevron-left"></i>
                            </button>
                            <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only carousel-contents--hero__next-btn">
                                <i class="far fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                ${slides.length > 1 ? `
                    <div class="carousel-contents--hero__indicators carousel-contents--hero__indicators--outside">
                        ${indicatorsHTML}
                    </div>
                ` : ''}
            </div>
        `;
    }

    container.innerHTML = carouselHTML;

    // Agregar event listeners según la variante
    if (type === 'promo-vertical') {
        // Lógica para variante promo-vertical (navegación por grupos como allies)
        const carouselContainer = container.querySelector('.carousel-contents--promo-vertical__cards-container');
        const prevBtn = container.querySelector('.carousel-contents--promo-vertical__prev-btn');
        const nextBtn = container.querySelector('.carousel-contents--promo-vertical__next-btn');

        // Función para obtener número de items a mover según breakpoint
        function getItemsToMove() {
            const windowWidth = window.innerWidth;
            if (windowWidth <= 480) {
                return 1; // Mobile pequeño
            } else if (windowWidth <= 767) {
                return 2; // Mobile
            } else if (windowWidth <= 1023) {
                return 3; // Tablet
            }
            return 4; // Desktop
        }

        // Función para encontrar el índice del primer item visible
        function getFirstVisibleIndex() {
            const cards = carouselContainer.querySelectorAll('.carousel-contents--promo-vertical__card');
            if (cards.length === 0) return 0;
            
            const containerRect = carouselContainer.getBoundingClientRect();
            const containerLeft = containerRect.left;
            
            for (let i = 0; i < cards.length; i++) {
                const cardRect = cards[i].getBoundingClientRect();
                if (cardRect.left >= containerLeft - 10) { // -10 para tolerancia
                    return i;
                }
            }
            return 0;
        }

        // Función para actualizar los indicadores (dots)
        function updateIndicators() {
            const indicators = container.querySelectorAll('.carousel-contents--promo-vertical__indicator');
            if (indicators.length === 0) return;
            
            const firstVisibleIndex = getFirstVisibleIndex();
            
            indicators.forEach((indicator, i) => {
                if (i === firstVisibleIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        // Función para actualizar el estado de los botones
        function updateCarouselButtons() {
            if (!carouselContainer || !prevBtn || !nextBtn) return;

            const scrollLeft = carouselContainer.scrollLeft;
            const scrollWidth = carouselContainer.scrollWidth;
            const clientWidth = carouselContainer.clientWidth;
            const isAtStart = scrollLeft <= 0;
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

            prevBtn.disabled = isAtStart;
            if (isAtStart) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }

            nextBtn.disabled = isAtEnd;
            if (isAtEnd) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
            
            // Actualizar indicadores también
            updateIndicators();
        }

        // Scroll al siguiente grupo de items
        function scrollToNextGroup() {
            const cards = carouselContainer.querySelectorAll('.carousel-contents--promo-vertical__card');
            if (cards.length === 0) return;
            
            const itemsToMove = getItemsToMove();
            const currentIndex = getFirstVisibleIndex();
            const nextIndex = Math.min(currentIndex + itemsToMove, cards.length - 1);
            
            // Si ya estamos al final, scroll hasta el último card
            if (nextIndex >= cards.length - 1) {
                const lastCard = cards[cards.length - 1];
                lastCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
                setTimeout(updateCarouselButtons, 400);
                return;
            }
            
            // Scroll hasta el card objetivo, alineándolo al inicio del contenedor
            const targetCard = cards[nextIndex];
            targetCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            });
            setTimeout(updateCarouselButtons, 400);
        }

        // Scroll al grupo anterior de items
        function scrollToPrevGroup() {
            const cards = carouselContainer.querySelectorAll('.carousel-contents--promo-vertical__card');
            if (cards.length === 0) return;
            
            const itemsToMove = getItemsToMove();
            const currentIndex = getFirstVisibleIndex();
            const prevIndex = Math.max(0, currentIndex - itemsToMove);
            
            // Si ya estamos al inicio, scroll hasta el primer card
            if (prevIndex === 0) {
                carouselContainer.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
                setTimeout(updateCarouselButtons, 400);
                return;
            }
            
            // Scroll hasta el card objetivo, alineándolo al inicio del contenedor
            const targetCard = cards[prevIndex];
            targetCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            });
            setTimeout(updateCarouselButtons, 400);
        }

        // Agregar event listeners para los botones de control
        if (prevBtn && nextBtn) {
            // Inicializar estado de los botones
            updateCarouselButtons();

            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (this.disabled) return;
                scrollToPrevGroup();
            });

            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (this.disabled) return;
                scrollToNextGroup();
            });

            // Actualizar estado de botones al hacer scroll manual
            carouselContainer.addEventListener('scroll', function() {
                setTimeout(updateCarouselButtons, 100);
            });

            // Actualizar estado al redimensionar la ventana
            window.addEventListener('resize', function() {
                setTimeout(updateCarouselButtons, 100);
            });
        }

        // Swipe para mobile en promo-vertical
        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            carouselContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        // Swipe izquierda - siguiente grupo
                        scrollToNextGroup();
                    } else {
                        // Swipe derecha - grupo anterior
                        scrollToPrevGroup();
                    }
                }
            });
        }

        // Event listeners para indicadores (dots)
        const indicators = container.querySelectorAll('.carousel-contents--promo-vertical__indicator');
        indicators.forEach((indicator) => {
            const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
            indicator.addEventListener('click', () => {
                const cards = carouselContainer.querySelectorAll('.carousel-contents--promo-vertical__card');
                if (cards[slideIndex]) {
                    cards[slideIndex].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'start'
                    });
                    setTimeout(updateCarouselButtons, 400);
                }
            });
        });

        // Actualizar estado inicial
        updateCarouselButtons();
    } else if (type === 'allies') {
        // Lógica para variante allies
        const carouselContainer = container.querySelector('.carousel-contents--allies__carousel');
        const prevBtn = container.querySelector('.carousel-contents--allies__prev-btn');
        const nextBtn = container.querySelector('.carousel-contents--allies__next-btn');

        // Función para obtener número de items a mover según breakpoint
        function getItemsToMove() {
            const windowWidth = window.innerWidth;
            if (windowWidth <= 767) {
                return 4; // Mobile
            } else if (windowWidth <= 1023) {
                return 6; // Tablet
            }
            return 8; // Desktop
        }

        // Función para encontrar el índice del primer item visible
        function getFirstVisibleIndex() {
            const cards = carouselContainer.querySelectorAll('.carousel-contents--allies__card');
            if (cards.length === 0) return 0;
            
            const containerRect = carouselContainer.getBoundingClientRect();
            const containerLeft = containerRect.left;
            
            for (let i = 0; i < cards.length; i++) {
                const cardRect = cards[i].getBoundingClientRect();
                if (cardRect.left >= containerLeft - 10) { // -10 para tolerancia
                    return i;
                }
            }
            return 0;
        }

        // Función para actualizar los indicadores (dots)
        function updateIndicators() {
            const indicators = container.querySelectorAll('.carousel-contents--allies__indicator');
            if (indicators.length === 0) return;
            
            const firstVisibleIndex = getFirstVisibleIndex();
            
            indicators.forEach((indicator, i) => {
                if (i === firstVisibleIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        // Función para actualizar el estado de los botones
        function updateCarouselButtons() {
            if (!carouselContainer || !prevBtn || !nextBtn) return;

            const scrollLeft = carouselContainer.scrollLeft;
            const scrollWidth = carouselContainer.scrollWidth;
            const clientWidth = carouselContainer.clientWidth;
            const isAtStart = scrollLeft <= 0;
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

            prevBtn.disabled = isAtStart;
            if (isAtStart) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }

            nextBtn.disabled = isAtEnd;
            if (isAtEnd) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
            
            // Actualizar indicadores también
            updateIndicators();
        }

        // Scroll al siguiente grupo de items
        function scrollToNextGroup() {
            const cards = carouselContainer.querySelectorAll('.carousel-contents--allies__card');
            if (cards.length === 0) return;
            
            const itemsToMove = getItemsToMove();
            const currentIndex = getFirstVisibleIndex();
            const nextIndex = Math.min(currentIndex + itemsToMove, cards.length - 1);
            
            if (nextIndex >= cards.length - 1) {
                const lastCard = cards[cards.length - 1];
                const lastCardRect = lastCard.getBoundingClientRect();
                const containerRect = carouselContainer.getBoundingClientRect();
                carouselContainer.scrollTo({
                    left: carouselContainer.scrollLeft + (lastCardRect.right - containerRect.right),
                    behavior: 'smooth'
                });
                setTimeout(updateCarouselButtons, 400);
                return;
            }
            
            const targetCard = cards[nextIndex];
            const targetCardRect = targetCard.getBoundingClientRect();
            const containerRect = carouselContainer.getBoundingClientRect();
            const scrollLeft = carouselContainer.scrollLeft;
            
            carouselContainer.scrollTo({
                left: scrollLeft + (targetCardRect.left - containerRect.left),
                behavior: 'smooth'
            });
            setTimeout(updateCarouselButtons, 400);
        }

        // Scroll al grupo anterior de items
        function scrollToPrevGroup() {
            const cards = carouselContainer.querySelectorAll('.carousel-contents--allies__card');
            if (cards.length === 0) return;
            
            const itemsToMove = getItemsToMove();
            const currentIndex = getFirstVisibleIndex();
            const prevIndex = Math.max(0, currentIndex - itemsToMove);
            
            if (prevIndex === 0) {
                carouselContainer.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
                setTimeout(updateCarouselButtons, 400);
                return;
            }
            
            const targetCard = cards[prevIndex];
            const targetCardRect = targetCard.getBoundingClientRect();
            const containerRect = carouselContainer.getBoundingClientRect();
            const scrollLeft = carouselContainer.scrollLeft;
            
            carouselContainer.scrollTo({
                left: scrollLeft + (targetCardRect.left - containerRect.left),
                behavior: 'smooth'
            });
            setTimeout(updateCarouselButtons, 400);
        }

        // Función para ajustar posición del tooltip dinámicamente
        function adjustTooltipPosition(tooltip, card) {
            // El tooltip ya debe estar visible por los estilos inline de mouseenter
            // Solo necesitamos calcular y ajustar la posición
            
            const tooltipRect = tooltip.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const margin = 10;
            
            // Resetear clases
            tooltip.classList.remove('tooltip-right', 'tooltip-left', 'tooltip-bottom');
            
            // Calcular espacio disponible
            const spaceAbove = cardRect.top;
            const spaceBelow = viewportHeight - cardRect.bottom;
            const spaceLeft = cardRect.left;
            const spaceRight = viewportWidth - cardRect.right;
            
            // Determinar posición vertical
            const useBottom = spaceAbove < tooltipRect.height + margin;
            
            // Determinar posición horizontal
            let horizontalPos = 'center';
            if (spaceRight < tooltipRect.width / 2 + margin) {
                horizontalPos = 'right';
            } else if (spaceLeft < tooltipRect.width / 2 + margin) {
                horizontalPos = 'left';
            }
            
            // Aplicar clases
            if (useBottom) {
                tooltip.classList.add('tooltip-bottom');
            }
            if (horizontalPos === 'right') {
                tooltip.classList.add('tooltip-right');
            } else if (horizontalPos === 'left') {
                tooltip.classList.add('tooltip-left');
            }
        }

        // Agregar event listeners para los botones de control
        if (prevBtn && nextBtn) {
            // Inicializar estado de los botones
            updateCarouselButtons();

            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (this.disabled) return;
                scrollToPrevGroup();
            });

            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (this.disabled) return;
                scrollToNextGroup();
            });

            // Actualizar estado de botones al hacer scroll manual
            carouselContainer.addEventListener('scroll', function() {
                setTimeout(updateCarouselButtons, 100);
            });

            // Actualizar estado al redimensionar la ventana
            window.addEventListener('resize', function() {
                setTimeout(updateCarouselButtons, 100);
                // Actualizar tooltips visibles
                carouselContainer.querySelectorAll('.carousel-contents--allies__card').forEach(card => {
                    const tooltip = card.querySelector('.carousel-contents--allies__card-tooltip');
                    if (tooltip && (tooltip.style.visibility === 'visible' || tooltip.classList.contains('active'))) {
                        adjustTooltipPosition(tooltip, card);
                    }
                });
            });
        }

        // Agregar event listeners para los cards y tooltips
        if (carouselContainer) {
            carouselContainer.querySelectorAll('.carousel-contents--allies__card').forEach(card => {
                const tooltip = card.querySelector('.carousel-contents--allies__card-tooltip');
                
                // Click en card
                card.addEventListener('click', function() {
                    const allyName = this.dataset.ally;
                    if (onButtonClick) {
                        onButtonClick({ name: allyName }, parseInt(this.dataset.slideIndex));
                    }
                });
                
                // Ajustar posición del tooltip en hover
                if (tooltip) {
                    card.addEventListener('mouseenter', function() {
                        // Mostrar tooltip inmediatamente
                        tooltip.style.opacity = '1';
                        tooltip.style.visibility = 'visible';
                        tooltip.style.display = 'block';
                        
                        // Ajustar posición después de que sea visible
                        requestAnimationFrame(() => {
                            adjustTooltipPosition(tooltip, card);
                        });
                    });
                    
                    card.addEventListener('mouseleave', function() {
                        // Ocultar tooltip
                        tooltip.style.opacity = '0';
                        tooltip.style.visibility = 'hidden';
                    });
                    
                    // Actualizar posición al mover el mouse (por si cambia el viewport)
                    card.addEventListener('mousemove', function() {
                        if (tooltip.style.opacity === '1') {
                            adjustTooltipPosition(tooltip, card);
                        }
                    });
                }
            });

            // Swipe para mobile en allies
            carouselContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            carouselContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        // Swipe izquierda - siguiente grupo
                        scrollToNextGroup();
                    } else {
                        // Swipe derecha - grupo anterior
                        scrollToPrevGroup();
                    }
                }
            });
        }

        // Event listeners para indicadores (dots)
        const indicators = container.querySelectorAll('.carousel-contents--allies__indicator');
        indicators.forEach((indicator) => {
            const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
            indicator.addEventListener('click', () => {
                const cards = carouselContainer.querySelectorAll('.carousel-contents--allies__card');
                if (cards[slideIndex]) {
                    cards[slideIndex].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'start'
                    });
                    setTimeout(updateCarouselButtons, 400);
                }
            });
        });

        // Actualizar estado inicial
        updateCarouselButtons();
    } else if (type === 'content-cards') {
        // Lógica para variante content-cards
        // Convertir slides a formato compatible con loadCardContent()
        const cardsData = slides.map(slide => {
            const contentType = slide.contentType || slide.type || 'Curso';
            const isRutaAprendizaje = contentType === 'Ruta de aprendizaje';
            
            // Si es Ruta de aprendizaje y tiene múltiples proveedores, usar providers
            if (isRutaAprendizaje && Array.isArray(slide.providers) && slide.providers.length > 1) {
                return {
                    type: contentType,
                    title: slide.title,
                    image: slide.image,
                    providers: slide.providers.map(p => ({
                        name: p.name || p.provider || 'Provider',
                        logo: p.logo || p.providerLogo || 'images/Favicons/UBITS.jpg'
                    })),
                    competency: slide.competency || '',
                    level: slide.specs?.level || slide.level || 'Intermedio',
                    duration: slide.specs?.duration || slide.duration || '60 min',
                    language: slide.specs?.language || slide.language || 'Español',
                    status: slide.status || 'default',
                    progress: slide.progress || 0
                };
            }
            
            // Comportamiento normal (un solo proveedor)
            return {
                type: contentType,
                title: slide.title,
                image: slide.image,
                provider: slide.provider?.name || slide.provider || 'UBITS',
                providerLogo: slide.provider?.logo || slide.providerLogo || 'images/Favicons/UBITS.jpg',
                competency: slide.competency || '',
                level: slide.specs?.level || slide.level || 'Intermedio',
                duration: slide.specs?.duration || slide.duration || '60 min',
                language: slide.specs?.language || slide.language || 'Español',
                status: slide.status || 'default',
                progress: slide.progress || 0
            };
        });

        // Cargar los cards usando el componente oficial
        const cardsContainer = container.querySelector(`#${containerId}-cards-container`);
        if (cardsContainer && typeof loadCardContent === 'function') {
            loadCardContent(`${containerId}-cards-container`, cardsData);
        } else {
            console.error('loadCardContent no está disponible. Asegúrate de importar components/card-content.js');
        }

        // Esperar a que los cards se rendericen antes de agregar event listeners
        setTimeout(() => {
            const carouselContainer = container.querySelector('.carousel-contents--content-cards__cards-container');
            const prevBtn = container.querySelector('.carousel-contents--content-cards__prev-btn');
            const nextBtn = container.querySelector('.carousel-contents--content-cards__next-btn');

            if (!carouselContainer) return;

            // Función para obtener número de items a mover según breakpoint
            function getItemsToMove() {
                const windowWidth = window.innerWidth;
                if (windowWidth <= 480) {
                    return 1; // Mobile pequeño
                } else if (windowWidth <= 767) {
                    return 2; // Mobile
                } else if (windowWidth <= 1365) {
                    return 3; // Tablet
                }
                return 4; // Desktop
            }

            // Función para encontrar el índice del primer item visible
            function getFirstVisibleIndex() {
                const cards = carouselContainer.querySelectorAll('.course-card');
                if (cards.length === 0) return 0;
                
                const containerRect = carouselContainer.getBoundingClientRect();
                const containerLeft = containerRect.left;
                
                for (let i = 0; i < cards.length; i++) {
                    const cardRect = cards[i].getBoundingClientRect();
                    if (cardRect.left >= containerLeft - 10) { // -10 para tolerancia
                        return i;
                    }
                }
                return 0;
            }

            // Función para actualizar los indicadores (dots)
            function updateIndicators() {
                const indicators = container.querySelectorAll('.carousel-contents--content-cards__indicator');
                if (indicators.length === 0) return;
                
                const firstVisibleIndex = getFirstVisibleIndex();
                
                indicators.forEach((indicator, i) => {
                    if (i === firstVisibleIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }

            // Función para actualizar el estado de los botones
            function updateCarouselButtons() {
                if (!carouselContainer || !prevBtn || !nextBtn) return;

                const scrollLeft = carouselContainer.scrollLeft;
                const scrollWidth = carouselContainer.scrollWidth;
                const clientWidth = carouselContainer.clientWidth;
                const isAtStart = scrollLeft <= 0;
                const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

                prevBtn.disabled = isAtStart;
                if (isAtStart) {
                    prevBtn.classList.add('disabled');
                } else {
                    prevBtn.classList.remove('disabled');
                }

                nextBtn.disabled = isAtEnd;
                if (isAtEnd) {
                    nextBtn.classList.add('disabled');
                } else {
                    nextBtn.classList.remove('disabled');
                }
                
                // Actualizar indicadores también
                updateIndicators();
            }

            // Scroll al siguiente grupo de items
            function scrollToNextGroup() {
                const cards = carouselContainer.querySelectorAll('.course-card');
                if (cards.length === 0) return;
                
                const itemsToMove = getItemsToMove();
                const currentIndex = getFirstVisibleIndex();
                const nextIndex = Math.min(currentIndex + itemsToMove, cards.length - 1);
                
                if (nextIndex >= cards.length - 1) {
                    const lastCard = cards[cards.length - 1];
                    const lastCardRect = lastCard.getBoundingClientRect();
                    const containerRect = carouselContainer.getBoundingClientRect();
                    carouselContainer.scrollTo({
                        left: carouselContainer.scrollLeft + (lastCardRect.right - containerRect.right),
                        behavior: 'smooth'
                    });
                    setTimeout(updateCarouselButtons, 400);
                    return;
                }
                
                const targetCard = cards[nextIndex];
                const targetCardRect = targetCard.getBoundingClientRect();
                const containerRect = carouselContainer.getBoundingClientRect();
                const scrollLeft = carouselContainer.scrollLeft;
                
                carouselContainer.scrollTo({
                    left: scrollLeft + (targetCardRect.left - containerRect.left),
                    behavior: 'smooth'
                });
                setTimeout(updateCarouselButtons, 400);
            }

            // Scroll al grupo anterior de items
            function scrollToPrevGroup() {
                const cards = carouselContainer.querySelectorAll('.course-card');
                if (cards.length === 0) return;
                
                const itemsToMove = getItemsToMove();
                const currentIndex = getFirstVisibleIndex();
                const prevIndex = Math.max(0, currentIndex - itemsToMove);
                
                if (prevIndex === 0) {
                    carouselContainer.scrollTo({
                        left: 0,
                        behavior: 'smooth'
                    });
                    setTimeout(updateCarouselButtons, 400);
                    return;
                }
                
                const targetCard = cards[prevIndex];
                const targetCardRect = targetCard.getBoundingClientRect();
                const containerRect = carouselContainer.getBoundingClientRect();
                const scrollLeft = carouselContainer.scrollLeft;
                
                carouselContainer.scrollTo({
                    left: scrollLeft + (targetCardRect.left - containerRect.left),
                    behavior: 'smooth'
                });
                setTimeout(updateCarouselButtons, 400);
            }

            // Agregar event listeners para los botones de control
            if (prevBtn && nextBtn) {
                // Inicializar estado de los botones
                updateCarouselButtons();

                prevBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.disabled) return;
                    scrollToPrevGroup();
                });

                nextBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.disabled) return;
                    scrollToNextGroup();
                });
            }

            // Actualizar botones al hacer scroll
            carouselContainer.addEventListener('scroll', updateCarouselButtons);

            // Swipe para mobile
            let touchStartX = 0;
            let touchEndX = 0;

            carouselContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            carouselContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        scrollToNextGroup();
                    } else {
                        scrollToPrevGroup();
                    }
                }
            });

            // Event listeners para indicadores (dots)
            const indicators = container.querySelectorAll('.carousel-contents--content-cards__indicator');
            indicators.forEach((indicator) => {
                const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
                indicator.addEventListener('click', () => {
                    const cards = carouselContainer.querySelectorAll('.course-card');
                    if (cards[slideIndex]) {
                        cards[slideIndex].scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'start'
                        });
                        setTimeout(updateCarouselButtons, 400);
                    }
                });
            });
        }, 100);
    } else if (type === 'outstanding') {
        // Lógica para variante outstanding
        const wrapper = container.querySelector('.carousel-contents--outstanding-wrapper');
        if (!wrapper) return;

        // Botones de control dentro de la imagen - usar delegación de eventos
        wrapper.addEventListener('click', (e) => {
            if (e.target.closest('.carousel-contents--outstanding__prev-btn')) {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
            } else if (e.target.closest('.carousel-contents--outstanding__next-btn')) {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
            }
        });

        // Indicadores (dots) - solo en mobile
        const indicators = wrapper.querySelectorAll('.carousel-contents--outstanding__indicator');
        indicators.forEach((indicator) => {
            const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
            indicator.addEventListener('click', () => goToSlide(slideIndex));
        });

        // Swipe para mobile - usar el elemento outstanding card directamente con capture phase
        const outstandingCard = wrapper.querySelector('.carousel-contents--outstanding');
        if (outstandingCard) {
            let isSwiping = false;
            let touchStartY = 0;
            
            outstandingCard.addEventListener('touchstart', (e) => {
                // Ignorar si el touch es en un botón o indicador
                if (e.target.closest('.carousel-contents--outstanding__prev-btn') ||
                    e.target.closest('.carousel-contents--outstanding__next-btn') ||
                    e.target.closest('.carousel-contents--outstanding__indicator')) {
                    return;
                }
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
                isSwiping = false;
            }, { passive: true, capture: true });

            outstandingCard.addEventListener('touchmove', (e) => {
                if (!touchStartX) return;
                
                const touchCurrentX = e.changedTouches[0].screenX;
                const touchCurrentY = e.changedTouches[0].screenY;
                const diffX = Math.abs(touchStartX - touchCurrentX);
                const diffY = Math.abs(touchStartY - touchCurrentY);
                
                // Si el movimiento es más horizontal que vertical, prevenir scroll
                if (diffX > diffY && diffX > 10) {
                    isSwiping = true;
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, { passive: false, capture: true });

            outstandingCard.addEventListener('touchend', (e) => {
                if (!touchStartX) return;
                
                // Ignorar si el touch es en un botón o indicador
                if (e.target.closest('.carousel-contents--outstanding__prev-btn') ||
                    e.target.closest('.carousel-contents--outstanding__next-btn') ||
                    e.target.closest('.carousel-contents--outstanding__indicator')) {
                    touchStartX = 0;
                    touchEndX = 0;
                    touchStartY = 0;
                    return;
                }
                
                touchEndX = e.changedTouches[0].screenX;
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;

                if (isSwiping && Math.abs(diff) > swipeThreshold) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (diff > 0) {
                        // Swipe izquierda - siguiente
                        nextSlide();
                    } else {
                        // Swipe derecha - anterior
                        prevSlide();
                    }
                }
                
                touchStartX = 0;
                touchEndX = 0;
                touchStartY = 0;
                isSwiping = false;
            }, { passive: true, capture: true });
        }

        // Pausar auto-advance al hacer hover
        const slidesContainer = wrapper.querySelector('.carousel-contents--outstanding__slides-container');
        if (slidesContainer) {
            slidesContainer.addEventListener('mouseenter', stopAutoAdvance);
            slidesContainer.addEventListener('mouseleave', startAutoAdvance);
        }

        // Auto-advance en desktop
        startAutoAdvance();

        // Manejar resize para auto-advance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                stopAutoAdvance();
                startAutoAdvance();
            }, 250);
        });

        // Actualizar estado inicial
        updateCarousel();
    } else if (type === 'hero') {
        // Lógica para variante hero
        const wrapper = container.querySelector('.carousel-contents--hero-wrapper');
        if (!wrapper) return;
        
        // Botones de control - usar delegación de eventos para que funcionen en todos los slides
        wrapper.addEventListener('click', (e) => {
            if (e.target.closest('.carousel-contents--hero__prev-btn')) {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
            } else if (e.target.closest('.carousel-contents--hero__next-btn')) {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
            }
        });
        
        // Actualizar estado inicial
        updateCarousel();

        // Indicadores
        const indicators = wrapper.querySelectorAll('.carousel-contents--hero__indicator');
        indicators.forEach((indicator) => {
            const slideIndex = parseInt(indicator.getAttribute('data-slide') || '0');
            indicator.addEventListener('click', () => goToSlide(slideIndex));
        });

        // Swipe para mobile - usar el elemento hero card directamente con capture phase
        const heroCard = wrapper.querySelector('.carousel-contents--hero');
        if (heroCard) {
            let isSwiping = false;
            let touchStartY = 0;
            
            heroCard.addEventListener('touchstart', (e) => {
                // Ignorar si el touch es en un botón o indicador
                if (e.target.closest('.carousel-contents--hero__prev-btn') ||
                    e.target.closest('.carousel-contents--hero__next-btn') ||
                    e.target.closest('.carousel-contents--hero__indicator')) {
                    return;
                }
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
                isSwiping = false;
            }, { passive: true, capture: true });

            heroCard.addEventListener('touchmove', (e) => {
                if (!touchStartX) return;
                
                const touchCurrentX = e.changedTouches[0].screenX;
                const touchCurrentY = e.changedTouches[0].screenY;
                const diffX = Math.abs(touchStartX - touchCurrentX);
                const diffY = Math.abs(touchStartY - touchCurrentY);
                
                // Si el movimiento es más horizontal que vertical, prevenir scroll
                if (diffX > diffY && diffX > 10) {
                    isSwiping = true;
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, { passive: false, capture: true });

            heroCard.addEventListener('touchend', (e) => {
                if (!touchStartX) return;
                
                // Ignorar si el touch es en un botón o indicador
                if (e.target.closest('.carousel-contents--hero__prev-btn') ||
                    e.target.closest('.carousel-contents--hero__next-btn') ||
                    e.target.closest('.carousel-contents--hero__indicator')) {
                    touchStartX = 0;
                    touchEndX = 0;
                    touchStartY = 0;
                    return;
                }
                
                touchEndX = e.changedTouches[0].screenX;
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;

                if (isSwiping && Math.abs(diff) > swipeThreshold) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (diff > 0) {
                        // Swipe izquierda - siguiente
                        nextSlide();
                    } else {
                        // Swipe derecha - anterior
                        prevSlide();
                    }
                }
                
                touchStartX = 0;
                touchEndX = 0;
                touchStartY = 0;
                isSwiping = false;
            }, { passive: true, capture: true });
        }

        // Auto-advance en desktop
        startAutoAdvance();

        // Pausar auto-advance al hacer hover (reutilizar heroCard ya declarado)
        if (heroCard) {
            heroCard.addEventListener('mouseenter', stopAutoAdvance);
            heroCard.addEventListener('mouseleave', startAutoAdvance);
        }

        // Manejar resize para auto-advance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                stopAutoAdvance();
                startAutoAdvance();
            }, 250);
        });
    }

    // Guardar instancia para callbacks
    if (!window.carouselContentsInstances) {
        window.carouselContentsInstances = {};
    }
    
    window.carouselContentsInstances[containerId] = {
        nextSlide,
        prevSlide,
        goToSlide,
        currentSlide: () => currentSlideIndex,
        handleButtonClick: () => {
            if (onButtonClick) {
                onButtonClick(slides[currentSlideIndex], currentSlideIndex);
            }
        }
    };
}
