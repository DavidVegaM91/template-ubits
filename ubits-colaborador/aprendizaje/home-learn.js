/**
 * Home Learn — lógica de la página de inicio de Aprendizaje.
 * Hero buscador, carrusel Zona de estudio y carruseles con datos mock / BD Fiqsha.
 */
(function () {
    'use strict';

    var COMPETENCIA_POR_CATEGORIA_FIQSHA = {
        'cfq-001': 'Liderazgo',
        'cfq-002': 'Comunicación',
        'cfq-003': 'Trabajo en equipo',
        'cfq-004': 'Gestión de proyectos',
        'cfq-005': 'Innovación',
        'cfq-006': 'Marketing digital',
        'cfq-007': 'Experiencia del cliente',
        'cfq-008': 'Gestión financiera',
        'cfq-009': 'People management',
        'cfq-010': 'Inteligencia emocional',
        'cfq-011': 'Resolución de problemas',
        'cfq-012': 'Productividad',
        'cfq-013': 'Negociación',
        'cfq-014': 'Ventas',
        'cfq-015': 'Marketing',
        'cfq-016': 'Gestión del cambio',
        'cfq-017': 'Desarrollo de software',
        'cfq-018': 'Data skills',
        'cfq-019': 'Wellness'
    };

    var ZONA_ESTUDIO_PLANES = [
        {
            cierre: 'Cierre: Abril 16',
            title: 'Onboarding Corporativo',
            progress: 60,
            progressLabel: '2/6 contenidos',
            empty: false
        },
        {
            cierre: 'Cierre: Abril 24',
            title: 'Formación SST Colombia - 2026',
            progress: 25,
            progressLabel: '2/4 contenidos',
            empty: false
        },
        {
            cierre: 'Cierre: Abril 28',
            title: 'PDI Q2 - 2026',
            progress: 0,
            progressLabel: 'Sin iniciar',
            empty: true
        }
    ];

    function buildFiqshaSlidesForOutstanding() {
        var bd = typeof window !== 'undefined' && window.BDS_CONTENIDOS_FIQSHA;
        if (!bd || !bd.contents || !bd.contents.length) {
            return [];
        }

        var nivelesArr = window.BD_MASTER_NIVELES_CONTENIDO && window.BD_MASTER_NIVELES_CONTENIDO.niveles;
        var aliadosArr = window.BD_MASTER_ALIADOS && window.BD_MASTER_ALIADOS.aliados;

        function nivelNombrePorId(nivelId) {
            if (!nivelesArr || !nivelId) return 'Intermedio';
            for (var j = 0; j < nivelesArr.length; j++) {
                if (nivelesArr[j].id === nivelId) {
                    return nivelesArr[j].nombre || 'Intermedio';
                }
            }
            return 'Intermedio';
        }

        function aliadoPorId(proveedorAliadoId) {
            if (!aliadosArr || !proveedorAliadoId) return null;
            for (var k = 0; k < aliadosArr.length; k++) {
                if (aliadosArr[k].id === proveedorAliadoId) {
                    return aliadosArr[k];
                }
            }
            return null;
        }

        var slides = [];
        for (var i = 0; i < bd.contents.length; i++) {
            var c = bd.contents[i];
            var a = aliadoPorId(c.proveedorAliadoId);
            var providerName = a && a.nombre ? a.nombre : 'UBITS';
            var providerLogo = '../../images/Favicons/UBITS.jpg';
            if (a && a.logo) {
                providerLogo = '../../' + String(a.logo).replace(/^\.\//, '');
            }
            var durMin = c.tiempoValor != null ? String(c.tiempoValor) : '60';
            var imgPath = c.imagen
                ? ('../../' + String(c.imagen).replace(/^\.\//, ''))
                : '../../images/Profile-image.jpg';

            slides.push({
                image: imgPath,
                contentType: c.tipoContenido || 'Curso',
                title: c.titulo || '',
                provider: {
                    name: providerName,
                    logo: providerLogo
                },
                competency: COMPETENCIA_POR_CATEGORIA_FIQSHA[c.categoriaFiqshaId] || 'Liderazgo',
                specs: {
                    level: nivelNombrePorId(c.nivelId),
                    duration: durMin + ' min',
                    language: (c.idioma || 'Español').trim()
                }
            });
        }
        return slides;
    }

    function renderZonaEstudioPlanCard(plan) {
        var progressBar = '';
        if (typeof progressBarHtml === 'function') {
            progressBar = progressBarHtml({
                value: plan.empty ? 0 : plan.progress,
                size: 'sm',
                rounded: true,
                track: plan.empty ? 'subtle' : 'default',
                status: plan.empty ? undefined : undefined,
                ariaLabel: 'Progreso del plan'
            });
        } else {
            progressBar =
                '<div class="ubits-progress-bar ubits-progress-bar--sm ubits-progress-bar--rounded" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + plan.progress + '">' +
                    '<div class="ubits-progress-bar__track"><div class="ubits-progress-bar__fill" style="width:' + (plan.empty ? 0 : plan.progress) + '%"></div></div>' +
                '</div>';
        }

        return (
            '<article class="home-learn-plan-card" tabindex="0">' +
                '<div class="home-learn-plan-card__head">' +
                    '<p class="ubits-body-sm-regular home-learn-plan-card__cierre">' + plan.cierre + '</p>' +
                    '<p class="ubits-body-md-semibold home-learn-plan-card__title">' + plan.title + '</p>' +
                '</div>' +
                '<div class="home-learn-plan-card__progress-block">' +
                    progressBar +
                    '<div class="home-learn-plan-card__progress-meta">' +
                        '<span class="ubits-body-sm-regular home-learn-plan-card__progress-label">' + plan.progressLabel + '</span>' +
                        '<span class="ubits-body-sm-semibold home-learn-plan-card__progress-pct">' + plan.progress + '%</span>' +
                    '</div>' +
                '</div>' +
            '</article>'
        );
    }

    function initZonaEstudioCarousel() {
        var root = document.getElementById('home-learn-zona-estudio');
        if (!root || root._homeLearnZonaWired) return;
        root._homeLearnZonaWired = true;

        var track = root.querySelector('.home-learn-zona-estudio__track');
        var prevBtn = root.querySelector('.home-learn-zona-estudio__prev');
        var nextBtn = root.querySelector('.home-learn-zona-estudio__next');
        if (!track) return;

        var cards = track.querySelectorAll('.home-learn-plan-card');
        var indicatorsApi = null;

        if (typeof initCarouselIndicators === 'function' && cards.length > 1) {
            indicatorsApi = initCarouselIndicators({
                containerId: 'home-learn-zona-estudio-indicators',
                count: cards.length,
                activeIndex: 0,
                ariaLabel: 'Paginación de planes de estudio',
                onSelect: function (index) {
                    if (cards[index]) {
                        cards[index].scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'start'
                        });
                    }
                }
            });
        }

        function getActivePlanIndex() {
            if (!cards.length) return 0;
            var containerRect = track.getBoundingClientRect();
            var containerLeft = containerRect.left;
            for (var i = 0; i < cards.length; i++) {
                var cardRect = cards[i].getBoundingClientRect();
                if (cardRect.left >= containerLeft - 10) {
                    return i;
                }
            }
            return 0;
        }

        function getCardWidth() {
            var card = track.querySelector('.home-learn-plan-card');
            if (!card) return track.clientWidth;
            var gap = parseFloat(getComputedStyle(track).gap) || 0;
            return card.offsetWidth + gap;
        }

        function updateControls() {
            if (!prevBtn || !nextBtn) return;
            var maxScroll = track.scrollWidth - track.clientWidth - 1;
            prevBtn.disabled = track.scrollLeft <= 1;
            nextBtn.disabled = track.scrollLeft >= maxScroll;
            prevBtn.classList.toggle('disabled', prevBtn.disabled);
            nextBtn.classList.toggle('disabled', nextBtn.disabled);
            if (indicatorsApi) {
                indicatorsApi.setActive(getActivePlanIndex());
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                track.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
            });
        }

        track.addEventListener('scroll', updateControls, { passive: true });
        window.addEventListener('resize', updateControls);
        updateControls();
    }

    function initContinuaAprendiendoCarousel() {
        if (typeof createCarouselContents !== 'function') return;

        createCarouselContents({
            containerId: 'continua-viendo-container',
            type: 'content-cards',
            sectionTitle: 'Continúa aprendiendo',
            slides: [
                {
                    image: '../../images/cards-learn/el-manejo-de-las-emociones.jpeg',
                    contentType: 'Curso',
                    title: 'El manejo de las emociones',
                    provider: {
                        name: 'Harvard Business Publishing',
                        logo: '../../images/Favicons/Harvard-Business-Publishing.jpg'
                    },
                    competency: 'Inteligencia emocional',
                    specs: {
                        level: 'Intermedio',
                        duration: '60 min',
                        language: 'Español'
                    },
                    status: 'progress',
                    progress: 85
                },
                {
                    image: '../../images/cards-learn/liderar-con-inteligencia-emocional.jpeg',
                    contentType: 'Charla',
                    title: 'Liderar con inteligencia emocional',
                    provider: {
                        name: 'TED',
                        logo: '../../images/Favicons/TED.jpg'
                    },
                    competency: 'Liderazgo',
                    specs: {
                        level: 'Avanzado',
                        duration: '90 min',
                        language: 'Inglés'
                    },
                    status: 'progress',
                    progress: 75
                },
                {
                    image: '../../images/cards-learn/comunicacion-efectiva-para-liderar-equipos.jpeg',
                    contentType: 'Short',
                    title: 'Comunicación efectiva para liderar equipos',
                    provider: {
                        name: 'UBITS',
                        logo: '../../images/Favicons/UBITS.jpg'
                    },
                    competency: 'Comunicación',
                    specs: {
                        level: 'Básico',
                        duration: '15 min',
                        language: 'Español'
                    },
                    status: 'progress',
                    progress: 65
                },
                {
                    image: '../../images/cards-learn/agilidad-emocional.jpeg',
                    contentType: 'Ruta de aprendizaje',
                    title: 'Agilidad emocional',
                    providers: [
                        { name: 'WOBI', logo: '../../images/Favicons/WOBI.jpg' },
                        { name: 'Harvard Business Publishing', logo: '../../images/Favicons/Harvard-Business-Publishing.jpg' },
                        { name: 'TED', logo: '../../images/Favicons/TED.jpg' }
                    ],
                    competency: 'Inteligencia emocional',
                    specs: {
                        level: 'Intermedio',
                        duration: '120 min',
                        language: 'Español'
                    },
                    status: 'progress',
                    progress: 55
                },
                {
                    image: '../../images/cards-learn/liderazgo-en-tiempos-de-crisi.jpeg',
                    contentType: 'Curso',
                    title: 'Liderazgo en tiempos de crisis',
                    provider: {
                        name: 'Harvard Business Publishing',
                        logo: '../../images/Favicons/Harvard-Business-Publishing.jpg'
                    },
                    competency: 'Liderazgo',
                    specs: {
                        level: 'Avanzado',
                        duration: '120 min',
                        language: 'Español'
                    },
                    status: 'progress',
                    progress: 45
                },
                {
                    image: '../../images/cards-learn/la-confianza-una-clave-para-el-liderazgo.jpeg',
                    contentType: 'Podcast',
                    title: 'La confianza: una clave para el liderazgo',
                    provider: {
                        name: 'IE University',
                        logo: '../../images/Favicons/IE-University-Publishing.jpg'
                    },
                    competency: 'Liderazgo',
                    specs: {
                        level: 'Intermedio',
                        duration: '45 min',
                        language: 'Español'
                    },
                    status: 'progress',
                    progress: 35
                }
            ]
        });
    }

    function initUniversidadCorporativaCarousel() {
        if (typeof createCarouselContents !== 'function') return;

        var slides = buildFiqshaSlidesForOutstanding();
        if (!slides.length) return;

        createCarouselContents({
            containerId: 'ucorporativa-home-container',
            type: 'outstanding',
            sectionTitle: 'Universidad corporativa',
            slides: slides,
            onButtonClick: function (slide) {
                console.log('Ver ahora:', slide.title);
            }
        });
    }

    function initAliadosCarousel() {
        if (typeof createCarouselContents !== 'function') return;

        createCarouselContents({
            containerId: 'allies-container',
            type: 'allies',
            sectionTitle: 'Aliados destacados',
            slides: [
                { name: 'UBITS', logo: '../../images/Favicons/UBITS.jpg' },
                { name: 'Microsoft', logo: '../../images/Favicons/Microsoft.jpg' },
                { name: 'TED', logo: '../../images/Favicons/TED.jpg' },
                { name: 'Harvard Business Publishing', logo: '../../images/Favicons/Harvard-Business-Publishing.jpg' },
                { name: 'All Ears English', logo: '../../images/Favicons/All Ears English.jpg' },
                { name: 'IE University Publishing', logo: '../../images/Favicons/IE-University-Publishing.jpg' },
                { name: 'WOBI', logo: '../../images/Favicons/WOBI.jpg' },
                { name: 'Hubspot', logo: '../../images/Favicons/Hubspot.jpg' },
                { name: 'AWS', logo: '../../images/Favicons/AWS.jpg' },
                { name: 'Código Facilito', logo: '../../images/Favicons/Código-Facilito.jpg' },
                { name: 'Universidad de Los Andes', logo: '../../images/Favicons/Universidad-de-Los Andes.jpg' },
                { name: 'Welu', logo: '../../images/Favicons/Welu.jpg' }
            ],
            onButtonClick: function (ally) {
                console.log('Aliado:', ally.name);
            }
        });
    }

    function renderZonaEstudioSection() {
        var mount = document.getElementById('home-learn-zona-estudio-mount');
        if (!mount) return;

        var cardsHtml = ZONA_ESTUDIO_PLANES.map(renderZonaEstudioPlanCard).join('');

        mount.innerHTML =
            '<section class="home-learn-zona-estudio" id="home-learn-zona-estudio" aria-label="Zona de estudio">' +
                '<div class="carousel-contents--content-cards__header home-learn-zona-estudio__header">' +
                    '<h2 class="carousel-contents--content-cards__title ubits-heading-h2">Zona de estudio</h2>' +
                    '<div class="carousel-contents--content-cards__controls home-learn-zona-estudio__controls">' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only home-learn-zona-estudio__prev" aria-label="Plan anterior">' +
                            '<i class="far fa-chevron-left"></i>' +
                        '</button>' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only home-learn-zona-estudio__next" aria-label="Plan siguiente">' +
                            '<i class="far fa-chevron-right"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="home-learn-zona-estudio__track">' + cardsHtml + '</div>' +
                '<div class="home-learn-zona-estudio__indicators">' +
                    '<div id="home-learn-zona-estudio-indicators" class="carousel-contents__indicators-mount"></div>' +
                '</div>' +
            '</section>';
    }

    function initHomeLearn() {
        renderZonaEstudioSection();
        initZonaEstudioCarousel();
        initContinuaAprendiendoCarousel();
        initUniversidadCorporativaCarousel();
        initAliadosCarousel();
    }

    document.addEventListener('DOMContentLoaded', initHomeLearn);
})();
