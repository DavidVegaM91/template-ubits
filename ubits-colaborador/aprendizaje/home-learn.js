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

    function initZonaEstudioCarousel() {
        if (typeof createCarouselContents !== 'function') return;

        createCarouselContents({
            containerId: 'home-learn-zona-estudio-mount',
            type: 'study-zone',
            sectionTitle: 'Zona de estudio',
            slides: ZONA_ESTUDIO_PLANES,
            onPlanClick: function (plan) {
                console.log('Plan:', plan.title);
            }
        });
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

    function initHomeLearn() {
        initZonaEstudioCarousel();
        initContinuaAprendiendoCarousel();
        initUniversidadCorporativaCarousel();
        initAliadosCarousel();
    }

    document.addEventListener('DOMContentLoaded', initHomeLearn);
})();
