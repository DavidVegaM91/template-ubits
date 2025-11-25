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
 * ## 🎨 VARIANTES DISPONIBLES
 * 
 * ### Tipos de Variante:
 * - `hero` - Banner grande horizontal (21:9 desktop/tablet, 1:1 mobile) - **Por defecto**
 * 
 * **Nota:** Más variantes se agregarán en el futuro.
 * 
 * ## 🔧 API COMPLETA
 * 
 * ### Parámetros de Configuración:
 * | Parámetro | Tipo | Por Defecto | Descripción |
 * |-----------|------|-------------|-------------|
 * | `containerId` | string | **Requerido** | ID del contenedor donde se renderizará el carousel |
 * | `type` | string | `'hero'` | Tipo de variante ('hero' por ahora) |
 * | `slides` | Array | **Requerido** | Array de objetos con información de cada slide |
 * | `onButtonClick` | function | `null` | Callback cuando se hace clic en el botón "Ver ahora" |
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

    // Por ahora solo soportamos la variante 'hero'
    if (type !== 'hero') {
        console.warn(`Variante "${type}" no implementada aún. Usando variante "hero" por defecto.`);
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
                        <span class="carousel-contents--hero__type-text ubits-body-xs-regular">${slide.contentType || 'Curso'}</span>
                    </div>

                    <!-- Título -->
                    <div class="carousel-contents--hero__title-wrapper">
                        <h2 class="carousel-contents--hero__title ubits-display-d3-bold">${slide.title}</h2>
                    </div>

                    <!-- Proveedor -->
                    ${slide.provider?.name ? `
                        <div class="carousel-contents--hero__provider">
                            ${slide.provider.logo ? `
                                <div class="carousel-contents--hero__provider-avatar">
                                    <img src="${slide.provider.logo}" alt="${slide.provider.name}" class="carousel-contents--hero__provider-image">
                                </div>
                            ` : ''}
                            <span class="carousel-contents--hero__provider-name ubits-body-xs-regular">${slide.provider.name}</span>
                        </div>
                    ` : ''}

                    <!-- Competencia -->
                    ${slide.competency ? `
                        <div class="carousel-contents--hero__competency">
                            <div class="carousel-contents--hero__competency-icon">
                                <i class="far fa-tag"></i>
                            </div>
                            <span class="carousel-contents--hero__competency-text ubits-body-xs-regular">${slide.competency}</span>
                        </div>
                    ` : ''}

                    <!-- Especificaciones -->
                    <div class="carousel-contents--hero__specs">
                        ${slide.specs?.level ? `
                            <div class="carousel-contents--hero__spec-item">
                                <div class="carousel-contents--hero__spec-icon">
                                    <i class="${levelIcon}"></i>
                                </div>
                                <span class="carousel-contents--hero__spec-text ubits-body-xs-regular">${slide.specs.level}</span>
                            </div>
                        ` : ''}
                        ${slide.specs?.duration ? `
                            <div class="carousel-contents--hero__spec-item">
                                <div class="carousel-contents--hero__spec-icon">
                                    <i class="far fa-clock"></i>
                                </div>
                                <span class="carousel-contents--hero__spec-text ubits-body-xs-regular">${slide.specs.duration}</span>
                            </div>
                        ` : ''}
                        ${slide.specs?.language ? `
                            <div class="carousel-contents--hero__spec-item">
                                <div class="carousel-contents--hero__spec-icon">
                                    <i class="far fa-globe"></i>
                                </div>
                                <span class="carousel-contents--hero__spec-text ubits-body-xs-regular">${slide.specs.language}</span>
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

    // Función para actualizar el carrusel
    function updateCarousel() {
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
        resetAutoAdvance();
    }

    // Función para ir al slide anterior
    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateCarousel();
        resetAutoAdvance();
    }

    // Función para ir a un slide específico
    function goToSlide(index) {
        if (index >= 0 && index < slides.length) {
            currentSlideIndex = index;
            updateCarousel();
            resetAutoAdvance();
        }
    }

    // Función para iniciar auto-advance (solo en desktop)
    function startAutoAdvance() {
        // Asegurarse de que no haya un intervalo activo antes de crear uno nuevo
        stopAutoAdvance();
        if (window.innerWidth > 768) {
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

    // Generar HTML inicial
    const indicatorsHTML = slides.map((_, i) => `
        <div class="carousel-contents--hero__indicator ${i === currentSlideIndex ? 'active' : ''}" 
             data-slide="${i}">
        </div>
    `).join('');

    const carouselHTML = `
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

    container.innerHTML = carouselHTML;

    // Agregar event listeners
    const wrapper = container.querySelector('.carousel-contents--hero-wrapper');
    
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

    // Swipe para mobile
    const heroCard = wrapper.querySelector('.carousel-contents--hero');
    if (heroCard) {
        heroCard.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        heroCard.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    // Auto-advance en desktop
    startAutoAdvance();

    // Pausar auto-advance al hacer hover
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
