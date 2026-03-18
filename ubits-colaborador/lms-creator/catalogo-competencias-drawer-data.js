/**
 * Catálogo de competencias e habilidades para el drawer "Agregar competencias".
 * Misma estructura que catalogo-v5 (academias → competencias → habilidades).
 * Uso: crear-plan-competencias.html.
 */
(function() {
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

    var habilidadIconMap = {
        'Autogestión': 'fa-user-check', 'Proactividad': 'fa-rocket', 'Integridad': 'fa-shield-check',
        'Empatía': 'fa-heart', 'Autoconocimiento': 'fa-brain', 'Autorregulación': 'fa-balance-scale',
        'Autocompasión': 'fa-hands-helping', 'Resiliencia': 'fa-dumbbell', 'Trabajo colaborativo': 'fa-users',
        'Gestión del conflicto': 'fa-handshake', 'Relacionamiento': 'fa-network-wired', 'Análisis de escenarios': 'fa-chart-line',
        'Toma de decisiones': 'fa-check-circle', 'Pensamiento crítico': 'fa-lightbulb', 'Asertividad': 'fa-comments',
        'Comunicación efectiva': 'fa-bullhorn', 'Marca personal': 'fa-user-tag', 'Redacción y ortografía': 'fa-pen',
        'Protocolo y etiqueta empresarial': 'fa-handshake', 'Hablar en público': 'fa-microphone', 'Gestión de stakeholders': 'fa-users-cog',
        'Gestión del tiempo': 'fa-clock', 'Planificación': 'fa-calendar-check', 'Organización': 'fa-folder-open',
        'Orientación a la mejora continua': 'fa-chart-line', 'Pensamiento sistémico': 'fa-project-diagram', 'Adaptabilidad': 'fa-sync',
        'Aprendizaje continuo': 'fa-graduation-cap', 'Persuasión': 'fa-comments-dollar', 'Generación de acuerdos': 'fa-handshake',
        'Salud mental y emocional': 'fa-heart', 'Salud física': 'fa-dumbbell', 'Balance de vida': 'fa-balance-scale',
        'Alimentación saludable': 'fa-apple-alt', 'Salud financiera': 'fa-wallet', 'Empoderamiento': 'fa-crown',
        'Motivación': 'fa-fire', 'Pensamiento estratégico': 'fa-chess', 'Coaching de equipos': 'fa-users-cog',
        'Grammar': 'fa-book', 'Listening': 'fa-headphones', 'Reading': 'fa-book-open', 'Speaking': 'fa-microphone',
        'Writing': 'fa-pen-fancy', 'Vocabulary': 'fa-book-reader', 'Creatividad': 'fa-palette', 'Pensamiento disruptivo': 'fa-lightbulb',
        'Ideación': 'fa-lightbulb-on', 'Pensamiento exponencial': 'fa-chart-line', 'Servicio al cliente': 'fa-headset',
        'Manejo de objeciones': 'fa-comments', 'Customer Relationship Management (CRM)': 'fa-address-book',
        'Diseño de la experiencia de cliente (CX)': 'fa-smile', 'Branding': 'fa-tag', 'Storytelling': 'fa-book', 'Social media': 'fa-share-alt',
        'Prospección': 'fa-search', 'Gestión de ciclo de ventas': 'fa-sync', 'Cierre de ventas': 'fa-handshake',
        'Venta consultiva': 'fa-comments-dollar', 'Gestión del equipo comercial': 'fa-users', 'Agilidad de negocios': 'fa-tachometer-alt',
        'Metodologías ágiles': 'fa-project-diagram', 'Cultura organizacional': 'fa-building', 'Adquisición del talento': 'fa-user-plus',
        'Experiencia del empleado (EX)': 'fa-user-check', 'Relaciones laborales': 'fa-handshake', 'Analítica de personas': 'fa-chart-bar',
        'Diversidad, equidad e inclusión': 'fa-users', 'Gestión del desempeño': 'fa-chart-line', 'Desarrollo del talento': 'fa-user-graduate',
        'Teletrabajo': 'fa-laptop', 'Planeación de proyectos': 'fa-calendar-alt', 'Control de proyectos': 'fa-tasks',
        'Gestión de la cadena de suministro': 'fa-truck', 'Gestión de procesos': 'fa-cogs', 'e-Operations': 'fa-server',
        'Retail': 'fa-store', 'Hospitality': 'fa-hotel', 'Automatización de procesos': 'fa-robot',
        'Planeación financiera': 'fa-chart-pie', 'Análisis de estados financieros': 'fa-file-invoice-dollar', 'Gestión contable': 'fa-calculator',
        'Control financiero': 'fa-wallet', 'Financial services': 'fa-university', 'Estrategia': 'fa-chess', 'Control de gestión': 'fa-clipboard-check',
        'Análisis económico': 'fa-chart-line', 'Sostenibilidad y RSE': 'fa-leaf', 'Propuesta de valor': 'fa-gem',
        'Modelos de negocio': 'fa-briefcase', 'Intraemprendimiento': 'fa-rocket', 'Riesgo operativo': 'fa-exclamation-triangle',
        'Continuidad del negocio': 'fa-shield-alt', 'Cumplimiento en Data & IT': 'fa-database', 'Cumplimiento financiero': 'fa-file-invoice',
        'Gobierno corporativo': 'fa-building', 'Sistemas de gestión HSEQ +RL': 'fa-clipboard-check', 'Cumplimiento operativo y de calidad': 'fa-check-circle',
        'Legislación laboral': 'fa-gavel', 'Administración de bases de datos': 'fa-database', 'Análisis de datos': 'fa-chart-bar',
        'Visualización de datos': 'fa-chart-pie', 'Inteligencia de negocios (BI)': 'fa-brain', 'Big data': 'fa-server',
        'Probabilidad y estadística': 'fa-chart-line', 'Design thinking': 'fa-lightbulb', 'Diseño UX': 'fa-mouse-pointer',
        'Diseño UI': 'fa-palette', 'Prototipado': 'fa-drafting-compass', 'UX Research': 'fa-search', 'Software testing': 'fa-vial',
        'DevOps': 'fa-code-branch', 'Herramientas de desarrollo de software': 'fa-tools', 'Herramientas No Code': 'fa-magic',
        'Pensamiento computacional': 'fa-brain', 'SQL': 'fa-database', 'Java': 'fa-coffee', 'JavaScript': 'fa-code', 'PHP': 'fa-code',
        'Python': 'fa-code', 'NoSQL': 'fa-database', 'Ruby': 'fa-gem', 'R': 'fa-chart-bar', 'C Sharp (C#)': 'fa-code',
        'Desarrollo frontend': 'fa-laptop-code', 'Desarrollo backend': 'fa-server', 'Diseño e implementación de APIs': 'fa-plug',
        'Aplicaciones Microsoft': 'fa-windows', 'Aplicaciones Google': 'fa-google', 'Herramientas para proyectos': 'fa-tasks',
        'Herramientas colaborativas': 'fa-users', 'Herramientas de diseño': 'fa-palette', 'Herramientas de ventas': 'fa-handshake',
        'Aplicaciones Amazon': 'fa-amazon', 'Sistema Linux': 'fa-linux', 'Computadores, dispositivos electrónicos e internet': 'fa-desktop',
        'Diseño gráfico digital': 'fa-paint-brush', 'Tendencias digitales': 'fa-trending-up', 'Contenido digital': 'fa-file-alt',
        'Transformación digital': 'fa-sync', 'Arquitectura TI': 'fa-network-wired', 'Infraestructura tecnológica': 'fa-server',
        'Ciberseguridad': 'fa-shield-alt', 'Derecho digital': 'fa-gavel', 'Gestión de plataformas de e-commerce': 'fa-shopping-cart',
        'Product marketing': 'fa-bullhorn', 'Analítica en marketing': 'fa-chart-bar', 'Gestión del funnel de conversión': 'fa-filter',
        'Growth marketing': 'fa-chart-line', 'Google Analytics': 'fa-chart-bar', 'Google Ads': 'fa-ad', 'Inbound marketing': 'fa-arrow-down'
    };

    // Lista plana para el drawer: cada item { id, nombre, academia, habilidades }
    var listaPlana = [];
    catalogData.academias.forEach(function(academia) {
        academia.competencias.forEach(function(comp) {
            listaPlana.push({
                id: comp.nombre,
                nombre: comp.nombre,
                academia: academia.nombre,
                habilidades: comp.habilidades.slice()
            });
        });
    });

    window.CATALOGO_ACADEMIAS = catalogData.academias;
    window.CATALOGO_COMPETENCIAS_DRAWER = listaPlana;
    window.COMPETENCIA_IMAGE_MAP = competenciaImageMap;
    window.HABILIDAD_ICON_MAP = habilidadIconMap;
})();
