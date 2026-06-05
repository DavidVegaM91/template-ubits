/**
 * Exploración de catálogo (chips, academias, aliados, tipos de contenido).
 * Reutilizable en home-learn y catálogo.
 */
(function (global) {
    'use strict';

    var competenciasAsignadas = ['Liderazgo', 'Comunicación', 'Inglés'];
    var selectedAcademia = 'Academia de Habilidades Blandas';
    var catalogEventListenersAttached = false;
    var browseInitialized = false;

    var catalogData = {
        academias: [
            {
                nombre: 'Academia de Habilidades Blandas',
                competencias: [
                    { nombre: 'Accountability', habilidades: ['Autogestión', 'Proactividad', 'Integridad'] },
                    { nombre: 'Inteligencia emocional', habilidades: ['Empatía', 'Autoconocimiento', 'Autorregulación', 'Autocompasión', 'Resiliencia'] },
                    { nombre: 'Trabajo en equipo', habilidades: ['Trabajo colaborativo', 'Gestión del conflicto', 'Relacionamiento'] },
                    { nombre: 'Resolución de problemas', habilidades: ['Análisis de escenarios', 'Toma de decisiones', 'Pensamiento crítico'] },
                    { nombre: 'Comunicación', habilidades: ['Asertividad', 'Comunicación efectiva', 'Marca personal', 'Redacción y ortografía', 'Protocolo y etiqueta empresarial', 'Hablar en público', 'Gestión de stakeholders'] },
                    { nombre: 'Productividad', habilidades: ['Gestión del tiempo', 'Planificación', 'Organización'] },
                    { nombre: 'Gestión del cambio', habilidades: ['Orientación a la mejora continua', 'Pensamiento sistémico', 'Adaptabilidad', 'Aprendizaje continuo'] },
                    { nombre: 'Negociación', habilidades: ['Persuasión', 'Generación de acuerdos'] },
                    { nombre: 'Wellness', habilidades: ['Salud mental y emocional', 'Salud física', 'Balance de vida', 'Alimentación saludable', 'Salud financiera'] },
                    { nombre: 'Liderazgo', habilidades: ['Empoderamiento', 'Motivación', 'Pensamiento estratégico', 'Coaching de equipos'] },
                    { nombre: 'Innovación', habilidades: ['Creatividad', 'Pensamiento disruptivo', 'Ideación', 'Pensamiento exponencial'] }
                ]
            },
            {
                nombre: 'Academia de Inglés',
                competencias: [
                    { nombre: 'Inglés', habilidades: ['Grammar', 'Listening', 'Reading', 'Speaking', 'Writing', 'Vocabulary'] }
                ]
            },
            {
                nombre: 'Academia de Negocios',
                competencias: [
                    { nombre: 'Experiencia del cliente', habilidades: ['Servicio al cliente', 'Manejo de objeciones', 'Customer Relationship Management (CRM)', 'Diseño de la experiencia de cliente (CX)'] },
                    { nombre: 'Marketing', habilidades: ['Branding', 'Storytelling', 'Social media'] },
                    { nombre: 'Ventas', habilidades: ['Prospección', 'Gestión de ciclo de ventas', 'Cierre de ventas', 'Venta consultiva', 'Gestión del equipo comercial'] },
                    { nombre: 'Agilidad', habilidades: ['Agilidad de negocios', 'Metodologías ágiles'] },
                    { nombre: 'People management', habilidades: ['Cultura organizacional', 'Adquisición del talento', 'Experiencia del empleado (EX)', 'Relaciones laborales', 'Analítica de personas', 'Diversidad, equidad e inclusión', 'Gestión del desempeño', 'Desarrollo del talento', 'Teletrabajo'] },
                    { nombre: 'Gestión de proyectos', habilidades: ['Planeación de proyectos', 'Control de proyectos'] },
                    { nombre: 'Gestión de procesos y operaciones', habilidades: ['Gestión de la cadena de suministro', 'Gestión de procesos', 'e-Operations', 'Retail', 'Hospitality', 'Automatización de procesos'] },
                    { nombre: 'Gestión financiera', habilidades: ['Planeación financiera', 'Análisis de estados financieros', 'Gestión contable', 'Control financiero', 'Financial services'] },
                    { nombre: 'Administración de negocios', habilidades: ['Estrategia', 'Control de gestión', 'Análisis económico', 'Sostenibilidad y RSE'] },
                    { nombre: 'Emprendimiento', habilidades: ['Propuesta de valor', 'Modelos de negocio', 'Intraemprendimiento'] }
                ]
            },
            {
                nombre: 'Academia de Compliance',
                competencias: [
                    { nombre: 'Cumplimiento (Compliance)', habilidades: ['Cumplimiento en Data & IT', 'Cumplimiento financiero', 'Gobierno corporativo', 'Sistemas de gestión HSEQ +RL', 'Cumplimiento operativo y de calidad', 'Legislación laboral'] },
                    { nombre: 'Gestión del riesgo', habilidades: ['Riesgo operativo', 'Continuidad del negocio'] }
                ]
            },
            {
                nombre: 'Academia de Tecnología',
                competencias: [
                    { nombre: 'Data skills', habilidades: ['Administración de bases de datos', 'Análisis de datos', 'Visualización de datos', 'Inteligencia de negocios (BI)', 'Big data', 'Probabilidad y estadística'] },
                    { nombre: 'Product design', habilidades: ['Design thinking', 'Diseño UX', 'Diseño UI', 'Prototipado', 'UX Research'] },
                    { nombre: 'Desarrollo de software', habilidades: ['Software testing', 'DevOps', 'Herramientas de desarrollo de software', 'Herramientas No Code', 'Pensamiento computacional'] },
                    { nombre: 'Lenguajes de Programación', habilidades: ['SQL', 'Java', 'JavaScript', 'PHP', 'Python', 'NoSQL', 'Ruby', 'R', 'C Sharp (C#)'] },
                    { nombre: 'Desarrollo web', habilidades: ['Desarrollo frontend', 'Desarrollo backend', 'Diseño e implementación de APIs'] },
                    { nombre: 'Herramientas tecnológicas', habilidades: ['Aplicaciones Microsoft', 'Aplicaciones Google', 'Herramientas para proyectos', 'Herramientas colaborativas', 'Herramientas de diseño', 'Herramientas de ventas', 'Aplicaciones Amazon', 'Sistema Linux', 'Computadores, dispositivos electrónicos e internet'] },
                    { nombre: 'Digital skills', habilidades: ['Diseño gráfico digital', 'Tendencias digitales', 'Contenido digital', 'Transformación digital'] },
                    { nombre: 'Gestión de recursos tecnológicos', habilidades: ['Arquitectura TI', 'Infraestructura tecnológica', 'Ciberseguridad', 'Derecho digital'] },
                    { nombre: 'e-Commerce', habilidades: ['Gestión de plataformas de e-commerce'] },
                    { nombre: 'Marketing digital', habilidades: ['Product marketing', 'Analítica en marketing', 'Gestión del funnel de conversión', 'Growth marketing', 'Google Analytics', 'Google Ads', 'Inbound marketing'] }
                ]
            }
        ]
    };

    var competenciaImageMap = {
        'Accountability': 'Accountability.jpg',
        'Inteligencia emocional': 'Inteligencia emocional.jpg',
        'Trabajo en equipo': 'Trabajo en equipo.jpg',
        'Resolución de problemas': 'Resolución de problemas.jpg',
        'Comunicación': 'Comunicación.jpg',
        'Productividad': 'Productividad.jpg',
        'Gestión del cambio': 'Gestión del cambio.jpg',
        'Negociación': 'Negociación.jpg',
        'Wellness': 'Wellness.jpg',
        'Liderazgo': 'Liderazgo.jpg',
        'Inglés': 'Inglés.jpg',
        'Innovación': 'Innovación.jpg',
        'Experiencia del cliente': 'Experiencia del cliente.jpg',
        'Marketing': 'Marketing.jpg',
        'Ventas': 'Ventas.jpg',
        'Agilidad': 'Agilidad.jpg',
        'People management': 'People management.jpg',
        'Gestión de proyectos': 'Gestión de proyectos.jpg',
        'Gestión de procesos y operaciones': 'Gestión de procesos y operaciones.jpg',
        'Gestión financiera': 'Gestión financiera.jpg',
        'Administración de negocios': 'Administración de negocios.jpg',
        'Emprendimiento': 'Emprendimiento.jpg',
        'Gestión del riesgo': 'Gestión del riesgo.jpg',
        'Cumplimiento (Compliance)': 'Cumplimiento (Compliance).jpg',
        'Data skills': 'Data skills.jpg',
        'Product design': 'Product design.jpg',
        'Desarrollo de software': 'Desarrollo de software.jpg',
        'Lenguajes de Programación': 'Lenguajes de Programación.jpg',
        'Desarrollo web': 'Desarrollo web.jpg',
        'Herramientas tecnológicas': 'Herramientas tecnológicas.jpg',
        'Digital skills': 'Digital skills.jpg',
        'Gestión de recursos tecnológicos': 'Gestión de recursos tecnológicos.jpg',
        'e-Commerce': 'e-Commerce.jpg',
        'Marketing digital': 'Marketing digital.jpg'
    };

    var ALIADOS_SLIDES = [
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
    ];

    var chipCallback = null;

    function getCatalogItemsForTrending() {
        if (typeof refreshCatalogoContenidosDrawer === 'function') {
            return refreshCatalogoContenidosDrawer();
        }
        if (global.CATALOGO_CURSOS_DRAWER && global.CATALOGO_CURSOS_DRAWER.length) {
            return global.CATALOGO_CURSOS_DRAWER.slice();
        }
        return [];
    }

    function buildCatalogSearchHaystack(item) {
        return [
            item.title,
            item.descripcion,
            item.type,
            item.competency,
            item.provider,
            item.categoria,
            item.level,
            item.language
        ].filter(Boolean).join(' ').toLowerCase();
    }

    function countCatalogSearchResults(query, catalogItems) {
        var q = String(query || '').toLowerCase().trim();
        if (!q || !catalogItems.length) return 0;
        var terms = q.split(/\s+/).filter(Boolean);
        var matched = 0;
        for (var i = 0; i < catalogItems.length; i++) {
            var haystack = buildCatalogSearchHaystack(catalogItems[i]);
            var ok = true;
            for (var j = 0; j < terms.length; j++) {
                if (haystack.indexOf(terms[j]) === -1) {
                    ok = false;
                    break;
                }
            }
            if (ok) matched++;
        }
        return matched;
    }

    /**
     * Términos «Lo más buscado»: competencias o habilidades presentes en BDS_CONTENIDOS_UBITS
     * con al menos minResults coincidencias en el catálogo unificado (misma lógica que home-learn).
     */
    function getTrendingTermsFromUbitsBd(limit, minResults) {
        limit = limit || 5;
        minResults = minResults == null ? 2 : minResults;

        var bd = global.BDS_CONTENIDOS_UBITS;
        var rows = bd && bd.contents ? bd.contents : [];
        if (!rows.length) {
            return ['Liderazgo', 'Marketing digital', 'Comunicación', 'Innovación', 'Trabajo en equipo'];
        }

        var compMap = {};
        var habMap = {};
        var compMaster = global.BD_MASTER_COMPETENCIAS && global.BD_MASTER_COMPETENCIAS.competencias;
        var habMaster = global.BD_MASTER_HABILIDADES && global.BD_MASTER_HABILIDADES.habilidades;
        if (compMaster) {
            for (var c = 0; c < compMaster.length; c++) {
                compMap[compMaster[c].id] = compMaster[c].nombre;
            }
        }
        if (habMaster) {
            for (var h = 0; h < habMaster.length; h++) {
                habMap[habMaster[h].id] = habMaster[h].nombre;
            }
        }

        var compIds = {};
        var habIds = {};
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            if (row.competenciaPrincipalId && compMap[row.competenciaPrincipalId]) {
                compIds[row.competenciaPrincipalId] = compMap[row.competenciaPrincipalId];
            }
            if (row.habilidadPrincipalId && habMap[row.habilidadPrincipalId]) {
                habIds[row.habilidadPrincipalId] = habMap[row.habilidadPrincipalId];
            }
            var sec = row.habilidadesSecundariasIds;
            if (sec && sec.length) {
                for (var s = 0; s < sec.length; s++) {
                    if (habMap[sec[s]]) habIds[sec[s]] = habMap[sec[s]];
                }
            }
        }

        var catalogItems = getCatalogItemsForTrending();
        var candidates = [];
        var seen = {};

        function pushCandidate(name, kind) {
            if (!name || seen[name]) return;
            seen[name] = true;
            var n = countCatalogSearchResults(name, catalogItems);
            if (n >= minResults) {
                candidates.push({ name: name, count: n, kind: kind });
            }
        }

        Object.keys(compIds).forEach(function (id) { pushCandidate(compIds[id], 'comp'); });
        Object.keys(habIds).forEach(function (id) { pushCandidate(habIds[id], 'hab'); });

        candidates.sort(function (a, b) {
            if (b.count !== a.count) return b.count - a.count;
            if (a.kind !== b.kind) return a.kind === 'comp' ? -1 : 1;
            return a.name.localeCompare(b.name, 'es');
        });

        if (!candidates.length) {
            return ['Liderazgo', 'Marketing digital', 'Comunicación', 'Innovación', 'Trabajo en equipo'].slice(0, limit);
        }

        return candidates.slice(0, limit).map(function (item) { return item.name; });
    }

    function getSkillIcon(habilidadNombre) {
        if (!global.BD_MASTER_HABILIDADES || !global.BD_MASTER_HABILIDADES.habilidades) {
            return 'far fa-circle';
        }
        var habilidades = global.BD_MASTER_HABILIDADES.habilidades;
        for (var i = 0; i < habilidades.length; i++) {
            var h = habilidades[i];
            if (h.nombre.toLowerCase().trim() === habilidadNombre.toLowerCase().trim()) {
                return h.iconoFontAwesome || 'far fa-circle';
            }
        }
        return 'far fa-circle';
    }

    function renderChips() {
        var chipsContainer = document.getElementById('catalog-chips');
        if (!chipsContainer) return;

        var busquedasFrecuentes = getTrendingTermsFromUbitsBd(5, 2);

        chipsContainer.innerHTML = busquedasFrecuentes.map(function (busqueda) {
            return (
                '<button type="button" class="home-learn-trending__chip" role="listitem" data-chip-term="' + busqueda.replace(/"/g, '&quot;') + '">' +
                    '<span class="ubits-body-sm-semibold">' + busqueda + '</span>' +
                '</button>'
            );
        }).join('');

        chipsContainer.querySelectorAll('.home-learn-trending__chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                var term = chip.getAttribute('data-chip-term') || chip.textContent.trim();
                if (typeof chipCallback === 'function') {
                    chipCallback(term);
                }
            });
        });
    }

    function attachCatalogEventListeners() {
        if (catalogEventListenersAttached) return;
        var resultsContainer = document.getElementById('catalog-results');
        if (!resultsContainer) return;

        catalogEventListenersAttached = true;

        resultsContainer.addEventListener('click', function (e) {
            var competenciaCard = e.target.closest('.competencia-card-v1');
            if (!competenciaCard) return;

            if (e.target.closest('.competencia-card-v1-filter-btn')) {
                return;
            }

            e.stopPropagation();
            var competenciaNombre = competenciaCard.dataset.competencia;
            var academiaNombre = competenciaCard.dataset.academia;
            var habilidadesContainer = document.querySelector(
                '.competencia-habilidades-container[data-competencia="' + competenciaNombre + '"][data-academia="' + academiaNombre + '"]'
            );
            var chevronBtn = competenciaCard.querySelector('.competencia-card-v1-chevron-btn');
            var chevronIcon = chevronBtn ? chevronBtn.querySelector('.competencia-card-v1-chevron') : null;
            var isCurrentlyExpanded = competenciaCard.classList.contains('expanded');

            document.querySelectorAll('.competencia-card-v1.expanded').forEach(function (openCard) {
                if (openCard === competenciaCard) return;
                openCard.classList.remove('expanded');
                var openCompetenciaNombre = openCard.dataset.competencia;
                var openAcademiaNombre = openCard.dataset.academia;
                var openContainer = document.querySelector(
                    '.competencia-habilidades-container[data-competencia="' + openCompetenciaNombre + '"][data-academia="' + openAcademiaNombre + '"]'
                );
                if (openContainer) openContainer.classList.remove('is-visible');
                var openChevronBtn = openCard.querySelector('.competencia-card-v1-chevron-btn');
                if (openChevronBtn) {
                    var openChevronIcon = openChevronBtn.querySelector('.competencia-card-v1-chevron');
                    if (openChevronIcon) openChevronIcon.style.transform = '';
                }
            });

            if (!habilidadesContainer) return;

            if (isCurrentlyExpanded) {
                competenciaCard.classList.remove('expanded');
                habilidadesContainer.classList.remove('is-visible');
                if (chevronIcon) chevronIcon.style.transform = '';
            } else {
                competenciaCard.classList.add('expanded');
                habilidadesContainer.classList.add('is-visible');
                if (chevronIcon) chevronIcon.style.transform = 'rotate(180deg)';
            }
        });
    }

    function renderCompetenciasForSelector(container, academiaNombre, academias) {
        var competenciasContainer = document.getElementById('competencias-container');

        if (!competenciasContainer) {
            competenciasContainer = document.createElement('div');
            competenciasContainer.id = 'competencias-container';
            competenciasContainer.style.marginTop = '24px';
            competenciasContainer.style.width = '100%';
            var selectorContainer = document.getElementById('academia-selector-container');
            if (selectorContainer && selectorContainer.parentNode) {
                selectorContainer.parentNode.insertBefore(competenciasContainer, selectorContainer.nextSibling);
            } else {
                container.appendChild(competenciasContainer);
            }
        }

        var academia = null;
        for (var a = 0; a < academias.length; a++) {
            if (academias[a].nombre === academiaNombre) {
                academia = academias[a];
                break;
            }
        }

        if (!academia) {
            competenciasContainer.innerHTML = '<p class="ubits-body-md-regular">No se encontró la academia seleccionada.</p>';
            return;
        }

        var competenciasOrdenadas = academia.competencias.slice().sort(function (x, y) {
            return x.nombre.localeCompare(y.nombre, 'es', { sensitivity: 'base' });
        });

        var numColumns = 3;
        if (window.innerWidth <= 768) numColumns = 1;
        else if (window.innerWidth <= 1023) numColumns = 2;

        var columns = [];
        for (var c = 0; c < numColumns; c++) columns[c] = [];

        competenciasOrdenadas.forEach(function (competencia, index) {
            columns[index % numColumns].push(competencia);
        });

        var competenciasHtml =
            '<div class="academia-competencias-container is-visible" data-academia="' + academia.nombre + '">' +
                '<div class="competencias-grid-v1">' +
                    columns.map(function (column) {
                        return (
                            '<div class="competencias-column">' +
                                column.map(function (competencia) {
                                    var imageName = competenciaImageMap[competencia.nombre] || 'Accountability.jpg';
                                    var imagePath = '../../images/imagenes competencias/' + imageName;
                                    var isAssigned = competenciasAsignadas.indexOf(competencia.nombre) !== -1;
                                    return (
                                        '<div class="competencia-card-v1-wrapper">' +
                                            '<div class="competencia-card-v1' + (isAssigned ? ' is-assigned' : '') + '" data-competencia="' + competencia.nombre + '" data-academia="' + academia.nombre + '">' +
                                                '<img src="' + imagePath + '" alt="' + competencia.nombre + '" class="competencia-card-v1-image" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop\'">' +
                                                '<div class="competencia-card-v1-content">' +
                                                    '<div class="competencia-card-v1-title-wrapper">' +
                                                        '<p class="ubits-body-sm-semibold competencia-card-v1-title">' +
                                                            '<span class="competencia-card-v1-title-text">' + competencia.nombre + '</span>' +
                                                            (isAssigned ? '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--info ubits-badge-tag--xs" aria-label="Contenido asignado"><span class="ubits-badge-tag__indicator" aria-hidden="true"></span><span class="ubits-badge-tag__text">Asignado</span></span>' : '') +
                                                        '</p>' +
                                                    '</div>' +
                                                    '<p class="ubits-body-xs-regular competencia-card-v1-count">' + competencia.habilidades.length + ' habilidades</p>' +
                                                '</div>' +
                                                '<div class="competencia-card-v1-actions">' +
                                                    '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only competencia-card-v1-filter-btn" aria-label="Filtrar por esta competencia" data-tooltip="Filtrar por esta competencia" data-tooltip-position="bottom" data-tooltip-align="center">' +
                                                        '<i class="far fa-filter"></i>' +
                                                    '</button>' +
                                                    '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only competencia-card-v1-chevron-btn" aria-label="Ver habilidades" data-competencia="' + competencia.nombre + '" data-academia="' + academia.nombre + '" data-tooltip="Ver habilidades" data-tooltip-position="bottom" data-tooltip-align="center">' +
                                                        '<i class="far fa-chevron-down competencia-card-v1-chevron"></i>' +
                                                    '</button>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div class="competencia-habilidades-container" data-competencia="' + competencia.nombre + '" data-academia="' + academia.nombre + '">' +
                                                '<div class="competencias-habilidades-grid">' +
                                                    competencia.habilidades.slice().sort(function (x, y) {
                                                        return x.localeCompare(y, 'es', { sensitivity: 'base' });
                                                    }).map(function (habilidad) {
                                                        return (
                                                            '<div class="habilidad-chip">' +
                                                                '<i class="' + getSkillIcon(habilidad) + '"></i>' +
                                                                '<span class="ubits-body-sm-regular habilidad-chip__label">' + habilidad + '</span>' +
                                                            '</div>'
                                                        );
                                                    }).join('') +
                                                '</div>' +
                                            '</div>' +
                                        '</div>'
                                    );
                                }).join('') +
                            '</div>'
                        );
                    }).join('') +
                '</div>' +
            '</div>';

        competenciasContainer.innerHTML = competenciasHtml;
        attachCatalogEventListeners();

        if (typeof initTooltip === 'function') {
            initTooltip('#competencias-container [data-tooltip]');
        }
    }

    function renderCatalog(academias) {
        var resultsContainer = document.getElementById('catalog-results');
        if (!resultsContainer || !academias.length) {
            if (resultsContainer) resultsContainer.innerHTML = '';
            return;
        }

        var selectorContainer = resultsContainer.querySelector('#academia-selector-container');
        if (!selectorContainer) {
            selectorContainer = document.createElement('div');
            selectorContainer.id = 'academia-selector-container';
            selectorContainer.style.marginBottom = '24px';
            resultsContainer.insertBefore(selectorContainer, resultsContainer.firstChild);
        }

        renderCompetenciasForSelector(resultsContainer, selectedAcademia, academias);

        if (typeof createInput !== 'function') return;

        selectorContainer.innerHTML = '';

        createInput({
            containerId: 'academia-selector-container',
            type: 'select',
            label: 'Selecciona una academia',
            placeholder: 'Selecciona una academia...',
            selectOptions: academias.map(function (academia) {
                return { value: academia.nombre, text: academia.nombre };
            }),
            value: selectedAcademia,
            onChange: function (selectedValue) {
                selectedAcademia = selectedValue;
                renderCompetenciasForSelector(resultsContainer, selectedAcademia, academias);
            }
        });
    }

    function renderTiposContenidoNuevo() {
        var carouselContainer = document.getElementById('tipos-contenido-carousel-nuevo');
        if (!carouselContainer) return;

        var tiposContenido = [
            'Curso', 'Short', 'Charla', 'Artículo', 'Podcast', 'Libro',
            'Ideas de libro', 'Caso de estudio', 'Documento técnico',
            'Ejercicios de práctica', 'Ruta de aprendizaje', 'Programa'
        ];

        var iconosPorTipo = {
            'Curso': 'fa-graduation-cap',
            'Short': 'fa-capsules',
            'Charla': 'fa-comments',
            'Artículo': 'fa-file-lines',
            'Podcast': 'fa-podcast',
            'Libro': 'fa-book',
            'Ideas de libro': 'fa-lightbulb',
            'Caso de estudio': 'fa-briefcase',
            'Documento técnico': 'fa-file-code',
            'Ejercicios de práctica': 'fa-dumbbell',
            'Ruta de aprendizaje': 'fa-route',
            'Programa': 'fa-network-wired'
        };

        carouselContainer.innerHTML = tiposContenido.map(function (tipo) {
            var icono = iconosPorTipo[tipo] || 'fa-circle';
            return (
                '<div class="tipo-contenido-card-nuevo" data-tipo="' + tipo + '">' +
                    '<div class="tipo-contenido-icon-nuevo"><i class="far ' + icono + '"></i></div>' +
                    '<span class="ubits-body-sm-regular tipo-contenido-name-nuevo">' + tipo + '</span>' +
                '</div>'
            );
        }).join('');

        var prevButton = document.getElementById('tipos-contenido-nuevo-prev');
        var nextButton = document.getElementById('tipos-contenido-nuevo-next');

        function getItemsToMoveNuevo() {
            if (window.innerWidth <= 768) return 3;
            if (window.innerWidth <= 1023) return 5;
            return 8;
        }

        function getFirstVisibleIndexNuevo() {
            var cards = carouselContainer.querySelectorAll('.tipo-contenido-card-nuevo');
            if (!cards.length) return 0;
            var containerRect = carouselContainer.getBoundingClientRect();
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].getBoundingClientRect().left >= containerRect.left) return i;
            }
            return 0;
        }

        function updateCarouselButtonsNuevo() {
            if (!prevButton || !nextButton) return;
            var scrollLeft = carouselContainer.scrollLeft;
            var scrollWidth = carouselContainer.scrollWidth;
            var clientWidth = carouselContainer.clientWidth;
            prevButton.disabled = scrollLeft <= 0;
            nextButton.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
        }

        function scrollToNextGroupNuevo() {
            var cards = carouselContainer.querySelectorAll('.tipo-contenido-card-nuevo');
            if (!cards.length) return;
            var itemsToMove = getItemsToMoveNuevo();
            var currentIndex = getFirstVisibleIndexNuevo();
            var nextIndex = Math.min(cards.length - 1, currentIndex + itemsToMove);
            if (nextIndex === currentIndex) {
                setTimeout(updateCarouselButtonsNuevo, 400);
                return;
            }
            var targetCardRect = cards[nextIndex].getBoundingClientRect();
            var containerRect = carouselContainer.getBoundingClientRect();
            carouselContainer.scrollTo({
                left: carouselContainer.scrollLeft + (targetCardRect.left - containerRect.left),
                behavior: 'smooth'
            });
            setTimeout(updateCarouselButtonsNuevo, 400);
        }

        function scrollToPrevGroupNuevo() {
            var cards = carouselContainer.querySelectorAll('.tipo-contenido-card-nuevo');
            if (!cards.length) return;
            var itemsToMove = getItemsToMoveNuevo();
            var currentIndex = getFirstVisibleIndexNuevo();
            var prevIndex = Math.max(0, currentIndex - itemsToMove);
            if (prevIndex === currentIndex) {
                setTimeout(updateCarouselButtonsNuevo, 400);
                return;
            }
            var targetCardRect = cards[prevIndex].getBoundingClientRect();
            var containerRect = carouselContainer.getBoundingClientRect();
            carouselContainer.scrollTo({
                left: carouselContainer.scrollLeft + (targetCardRect.left - containerRect.left),
                behavior: 'smooth'
            });
            setTimeout(updateCarouselButtonsNuevo, 400);
        }

        if (prevButton && !prevButton._catalogBrowseWired) {
            prevButton._catalogBrowseWired = true;
            prevButton.addEventListener('click', scrollToPrevGroupNuevo);
        }
        if (nextButton && !nextButton._catalogBrowseWired) {
            nextButton._catalogBrowseWired = true;
            nextButton.addEventListener('click', scrollToNextGroupNuevo);
        }

        carouselContainer.addEventListener('scroll', updateCarouselButtonsNuevo, { passive: true });
        updateCarouselButtonsNuevo();
    }

    function initAliadosCarousel() {
        if (typeof createCarouselContents !== 'function') return;
        var container = document.getElementById('aliados-container');
        if (!container || container._catalogBrowseRendered) return;
        container._catalogBrowseRendered = true;

        createCarouselContents({
            containerId: 'aliados-container',
            type: 'allies',
            sectionTitle: 'Explora por aliados destacados',
            slides: ALIADOS_SLIDES
        });
    }

    global.initCatalogoBrowse = function (options) {
        options = options || {};
        chipCallback = options.onChipClick || null;

        if (!browseInitialized) {
            browseInitialized = true;
            renderChips();
            renderCatalog(catalogData.academias);
            initAliadosCarousel();
            renderTiposContenidoNuevo();

            var resizeTimeout;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function () {
                    renderCatalog(catalogData.academias);
                }, 200);
            });
        } else {
            renderChips();
            renderCatalog(catalogData.academias);
        }
    };

    global.getCatalogoBrowseData = function () {
        return catalogData;
    };
})(typeof window !== 'undefined' ? window : this);
