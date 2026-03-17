/**
 * Lista de todos los contenidos disponibles (images/cards-learn).
 * Se usa en crear-plan-contenidos.html para el drawer "Agregar contenidos".
 * Título desde nombre de archivo; competency por palabras clave.
 */
(function() {
    var base = '../../images/';
    var favicon = base + 'Favicons/UBITS.jpg';
    var files = [
        '360-grados-Citas-glosas-reflexiones.jpeg',
        'abm-marketing-la-mejor-estrategia-para-ventas-b2b.jpeg',
        'administracion-efectiva-del-tiempo.jpg',
        'agilidad-emocional.jpeg',
        'analisis-de-mercado.jpeg',
        'apps-de-inteligencia-artificial-que-todo-profe-debe-conocer.jpeg',
        'apps-para-acelerar-tu-productividad-con-ia.jpeg',
        'autodireccion-de-equipos-de-alto-desmpeno.jpeg',
        'cambio-en-el-estilo-de-liderazgo.jpeg',
        'campanas-de-marketing.jpeg',
        'comienza-el-camino-hacia-la-gestion-emocional.jpeg',
        'como-dirigir-un-equipo-de-producto.jpeg',
        'como-disenar-una-organizacion-para-la-creatividad.jpeg',
        'como-ejercer-el-liderazgo-inclusivo.jpeg',
        'como-hablar-y-escuchar-mejor-competencias-de-comunicacion-oral.jpeg',
        'componentes y propiedades en react.jpeg',
        'comunicacion-efectiva-para-liderar-equipos.jpeg',
        'comunicacion-efectiva-para-lideres.jpeg',
        'comunicacion-y-empatia-claves-para-el-exito-en-equipo.jpeg',
        'conoce-el-diagnostico-de-innovacion-empresarial.jpeg',
        'content-marketing-crea-el-plan-de-tu-marca.jpeg',
        'content-marketing-mas-alla-de-las-redes-sociales.jpeg',
        'content-marketing-mide-el-rendimiento-de-tu-estrategia.jpeg',
        'crea-historias-de-usuario-mas-efectivas.jpeg',
        'creatividad-e-innovacion-en-equipos.jpeg',
        'de-la-comunicacion-a-la-neurocomunicacion.jpeg',
        'de-soldado-a-ceo.jpeg',
        'define-una-estrategia-de-marketing-de-influencia.jpeg',
        'desarrollo-y-gestion-de-talento.jpeg',
        'descubre-las-bases-del-design-thinking.jpeg',
        'digital-marketing-master.jpeg',
        'disena-el-modelo-de-negocio-de-tu-producto.jpeg',
        'disena-la-estrategia-de-lanzamiento-de-tu-producto.jpeg',
        'disena-tu-primer-contenido-con-ayuda-de-ux-writing.jpeg',
        'ejecuta-tu-campana-de-marketing-de-influencia.jpeg',
        'el-buen-coaching-inspira-liderazgo.jpeg',
        'el-liderazgo-suficiente.jpeg',
        'el-manejo-de-las-emociones.jpeg',
        'el-producto-interior-bruto-pib.jpeg',
        'emplea-los-valores-del-liderazgo-femenino.jpeg',
        'estrategias-de-marketing-digital-y-de-contenidos.jpeg',
        'etica-y-responsabilidad-en-la-inteligencia-artificial.jpeg',
        'experto-en-diseno-y-desarrollo-web.jpeg',
        'flexbox-y-grid.jpeg',
        'hooks-secundariosypersonalizados-en-react.jpeg',
        'implementa-el-liderazgo-coletivo-en-tu-empresa.jpeg',
        'implementa-la-estrategia-de-go-to-market.jpeg',
        'ingenieria-de-prompts-habla-con-la-ia.jpeg',
        'innovacion-disruptiva.jpeg',
        'introduccion-a-la-innovacion-corporativa.jpeg',
        'introduccion-al-backend-node-js.jpeg',
        'introduccion-al-desarrollo-web.jpeg',
        'introduccion-al-growth-marketing.jpeg',
        'introduccion-al-marketing-con-google-ads.jpeg',
        'la-clave-del-liderazgo-inclusivo.jpeg',
        'la-confianza-una-clave-para-el-liderazgo.jpeg',
        'la-inteligencia-artificial-como-habilidad-digital-en-los-negocios.jpeg',
        'la-inteligencia-social-y-biologia-del-liderazgo.jpeg',
        'lean-startup-emprendimiento-agil.jpeg',
        'liderar-como-los-grandes-directores-de-orquesta.jpeg',
        'liderar-con-inteligencia-emocional.jpeg',
        'liderazgo-ambicion-y-culpa.jpeg',
        'liderazgo-en-planeacion-estrategica.jpeg',
        'liderazgo-en-tiempos-de-crisi.jpeg',
        'liderazgo-femenino.jpeg',
        'lideres-cotidianos.jpeg',
        'neuroliderazgo-configura-tu-mente.jpeg',
        'personaliza-tu-pagina-web-con-css.jpeg',
        'potencia-tu-liderazgo-en-entornos-vuca.jpeg',
        'primeros-pasos-en-react.jpeg',
        'prototipo-y-mvp-de-los-productos.jpeg',
        'que-hace-que-alugnos-equipos-tengan-alto-desempeno.jpeg',
        'react-context-api.jpeg',
        'react-reducers.jpeg',
        'reconectate-contigo-y-con-los-demas-tips-para-el-bienestar-emocional.jpeg',
        'resolver-las-disfunciones-del-equipo.jpeg',
        'ruta-desarrollo-de-habilidades-de-liderazgo.jpeg',
        'ruta-experto-en-inbound-marketing.jpeg',
        'ruta-liderazgo-centrado-en-la-estrategia-empresarial.jpeg',
        'ruta-pensamiento-creativo-e-innovacion.jpeg',
        'segmenta-la-experiencia-del-cliente.jpg',
        'seo-impacto-en-tu-estrategia-de-content-marketing.jpeg',
        'simplified-suite-de-herramientas-de-inteligencia-artificial-todo-en-uno.jpeg',
        'subastas-en-google-ads.jpeg',
        'ux-research-conoce-tu-usuario-y-aumenta-el-engagement.jpeg'
    ];

    function filenameToTitle(filename) {
        var name = filename.replace(/\.(jpe?g|png)$/i, '').trim();
        return name.split(/[\s-]+/).map(function(word) {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    /** Solo primera letra en mayúscula; preserva nombres propios (UBITS, React, Google, etc.) */
    function toSentenceCase(str) {
        if (!str || typeof str !== 'string') return str;
        var s = str.trim();
        if (s.length === 0) return str;
        var lower = s.toLowerCase();
        var result = lower.charAt(0).toUpperCase() + lower.slice(1);
        var properNouns = ['UBITS', 'React', 'Node.js', 'JavaScript', 'Google', 'Excel', 'CEO', 'CRM', 'B2B', 'B2C', 'HTML', 'CSS', 'API', 'MVP', 'UX', 'PIB', 'VUCA', 'IA'];
        properNouns.forEach(function(noun) {
            var re = new RegExp('\\b' + noun.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            result = result.replace(re, noun);
        });
        return result;
    }

    /** Corrige tildes en palabras que suelen perderlas (p. ej. en nombres de archivo). */
    function fixTildes(str) {
        if (!str || typeof str !== 'string') return str;
        var tildes = [
            ['comunicacion', 'comunicación'], ['organizacion', 'organización'], ['organizaciones', 'organizaciones'],
            ['gestion', 'gestión'], ['introduccion', 'introducción'], ['innovacion', 'innovación'], ['presentacion', 'presentación'], ['presentaciones', 'presentaciones'],
            ['atencion', 'atención'], ['preparacion', 'preparación'], ['administracion', 'administración'], ['participacion', 'participación'],
            ['evaluacion', 'evaluación'], ['creacion', 'creación'], ['implementacion', 'implementación'], ['aplicacion', 'aplicación'], ['aplicaciones', 'aplicaciones'],
            ['informacion', 'información'], ['situacion', 'situación'], ['situaciones', 'situaciones'], ['decision', 'decisión'], ['decisiones', 'decisiones'],
            ['ejecucion', 'ejecución'], ['produccion', 'producción'], ['descripcion', 'descripción'], ['direccion', 'dirección'], ['conexion', 'conexión'],
            ['correccion', 'corrección'], ['seleccion', 'selección'], ['proteccion', 'protección'], ['eleccion', 'elección'], ['reduccion', 'reducción'],
            ['construccion', 'construcción'], ['instruccion', 'instrucción'], ['distraccion', 'distracción'], ['satisfaccion', 'satisfacción'],
            ['accion', 'acción'], ['reaccion', 'reacción'], ['reacciones', 'reacciones'], ['leccion', 'lección'], ['lecciones', 'lecciones'],
            ['seccion', 'sección'], ['secciones', 'secciones'], ['analisis', 'análisis'], ['critico', 'crítico'], ['critica', 'crítica'], ['criticas', 'críticas'],
            ['metodo', 'método'], ['metodos', 'métodos'], ['metodologia', 'metodología'], ['metodologias', 'metodologías'],
            ['tecnica', 'técnica'], ['tecnicas', 'técnicas'], ['tecnico', 'técnico'], ['tecnicos', 'técnicos'], ['tecnologica', 'tecnológica'], ['tecnologicas', 'tecnológicas'],
            ['practica', 'práctica'], ['practicas', 'prácticas'], ['practico', 'práctico'],
            ['area', 'área'], ['areas', 'áreas'], ['linea', 'línea'], ['lineas', 'líneas'], ['dia', 'día'], ['dias', 'días'],
            ['economia', 'economía'], ['economico', 'económico'], ['economicos', 'económicos'],
            ['basico', 'básico'], ['basica', 'básica'], ['basicos', 'básicos'], ['basicas', 'básicas'],
            ['diseno', 'diseño'], ['disena', 'diseña'], ['disenar', 'diseñar'], ['disenado', 'diseñado'],
            ['codigo', 'código'], ['codigos', 'códigos'], ['electronico', 'electrónico'], ['electronica', 'electrónica'], ['electronicos', 'electrónicos'],
            ['politica', 'política'], ['politicas', 'políticas'], ['politico', 'político'], ['etico', 'ético'], ['etica', 'ética'],
            ['cientifica', 'científica'], ['cientifico', 'científico'], ['biologico', 'biológico'], ['psicologico', 'psicológico'],
            ['historico', 'histórico'], ['especifico', 'específico'], ['publico', 'público'], ['unico', 'único'], ['unica', 'única'],
            ['academico', 'académico'], ['automatico', 'automático'], ['democratico', 'democrático'], ['civico', 'cívico'],
            ['fisico', 'físico'], ['quimico', 'químico'], ['tipico', 'típico'], ['mecanico', 'mecánico'], ['medico', 'médico'],
            ['logico', 'lógico'], ['grafico', 'gráfico'], ['estetico', 'estético'],
            ['planeacion', 'planeación'], ['ambicion', 'ambición'], ['desempeno', 'desempeño'], ['reconectate', 'reconéctate'],
            ['prevencion', 'prevención'], ['resolucion', 'resolución'], ['colaboracion', 'colaboración'], ['delegacion', 'delegación'],
            ['induccion', 'inducción'], ['motivacion', 'motivación'], ['agiles', 'ágiles'], ['hibridos', 'híbridos'], ['estres', 'estrés'],
            ['lideres', 'líderes'], ['lider', 'líder'], ['empatia', 'empatía'], ['campana', 'campaña'], ['campanas', 'campañas']
        ];
        var result = str;
        for (var i = 0; i < tildes.length; i++) {
            var re = new RegExp('\\b' + tildes[i][0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            result = result.replace(re, tildes[i][1]);
        }
        return result;
    }

    function guessCompetency(filename) {
        var lower = filename.toLowerCase();
        if (lower.indexOf('liderazgo') !== -1 || lower.indexOf('liderar') !== -1 || lower.indexOf('equipo') !== -1) return 'Liderazgo';
        if (lower.indexOf('comunicacion') !== -1 || lower.indexOf('empatia') !== -1) return 'Comunicación';
        if (lower.indexOf('marketing') !== -1 || lower.indexOf('content') !== -1 || lower.indexOf('seo') !== -1 || lower.indexOf('campana') !== -1) return 'Marketing digital';
        if (lower.indexOf('react') !== -1 || lower.indexOf('web') !== -1 || lower.indexOf('css') !== -1 || lower.indexOf('flexbox') !== -1 || lower.indexOf('backend') !== -1) return 'Desarrollo web';
        if (lower.indexOf('innovacion') !== -1 || lower.indexOf('creatividad') !== -1) return 'Innovación';
        if (lower.indexOf('producto') !== -1 || lower.indexOf('ux') !== -1 || lower.indexOf('diseno') !== -1) return 'Product design';
        if (lower.indexOf('inteligencia-artificial') !== -1 || lower.indexOf('prompts') !== -1 || lower.indexOf('ia') !== -1) return 'Herramientas tecnológicas';
        if (lower.indexOf('emocional') !== -1 || lower.indexOf('bienestar') !== -1 || lower.indexOf('reconectate') !== -1) return 'Inteligencia emocional';
        if (lower.indexOf('tiempo') !== -1 || lower.indexOf('productividad') !== -1) return 'Productividad';
        if (lower.indexOf('talento') !== -1 || lower.indexOf('gestion') !== -1) return 'People management';
        return 'Liderazgo';
    }

    var ubitsCourses = files.map(function(f, idx) {
        var imagePath = 'cards-learn/' + f;
        return {
            id: 'c' + (idx + 1),
            type: 'Curso',
            title: fixTildes(toSentenceCase(filenameToTitle(f))),
            provider: 'UBITS',
            providerLogo: favicon,
            duration: '60 min',
            level: 'Intermedio',
            progress: 0,
            status: 'default',
            image: base + imagePath,
            competency: guessCompetency(f),
            language: 'Español',
            courseSource: 'ubits'
        };
    });

    // Cursos de U. Corporativa (creados por la empresa) - mismos datos que u-corporativa.html
    var empresaLogo = base + 'Favicons/Figsha Smart Consulting.jpg';
    var empresaCourses = [
        { title: 'Inducción a la cultura y valores corporativos', imagePath: 'cards-learn/U-Corporativa/Inducción-a-la-cultura-y-valores-corporativos.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Prevención del acoso laboral', imagePath: 'cards-learn/U-Corporativa/prevencion-acoso-laboral.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Seguridad y salud en el trabajo 2025', imagePath: 'cards-learn/U-Corporativa/seguridad-y-salud-en-el-trabajo.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Cumplimiento normativo y código de conducta', imagePath: 'cards-learn/U-Corporativa/Cumplimiento-normativo-y-código-de-conducta.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Comunicación efectiva en el trabajo', imagePath: 'cards-learn/U-Corporativa/Comunicación-efectiva-en-el-trabajo.jpg', duration: '60 min', level: 'Básico', competency: 'Comunicación' },
        { title: 'Gestión del tiempo y productividad', imagePath: 'cards-learn/U-Corporativa/gestion-del-tiempo-y-productividad.jpg', duration: '60 min', level: 'Básico', competency: 'Comunicación' },
        { title: 'Resolución efectiva de conflictos en equipos de trabajo', imagePath: 'cards-learn/U-Corporativa/resolucion-de-conflictos.jpg', duration: '60 min', level: 'Básico', competency: 'Comunicación' },
        { title: 'Pensamiento crítico y toma de decisiones', imagePath: 'cards-learn/U-Corporativa/Pensamiento-crítico-y-toma-de-decisiones.jpg', duration: '90 min', level: 'Intermedio', competency: 'Comunicación' },
        { title: 'Creatividad e innovación', imagePath: 'cards-learn/U-Corporativa/creatividad-e-innovacion.jpg', duration: '60 min', level: 'Básico', competency: 'Comunicación' },
        { title: 'Presentaciones de alto impacto', imagePath: 'cards-learn/U-Corporativa/presentaciones-de-alto-impacto.jpg', duration: '60 min', level: 'Básico', competency: 'Comunicación' },
        { title: 'Manejo del estrés laboral', imagePath: 'cards-learn/U-Corporativa/manejo-del-estres-laboral.jpg', duration: '30 min', level: 'Básico', competency: 'Comunicación' },
        { title: 'Trabajo en equipo y colaboración', imagePath: 'cards-learn/U-Corporativa/trabajo-en-equipo.jpg', duration: '60 min', level: 'Básico', competency: 'Comunicación' },
        { title: 'Gestión de equipos remotos e híbridos', imagePath: 'cards-learn/U-Corporativa/gestion-equipos-remotos.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Delegación efectiva', imagePath: 'cards-learn/U-Corporativa/delegacion-efectiva.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Cómo dar y recibir feedback', imagePath: 'cards-learn/U-Corporativa/dar-y-recibir-feedback.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Comunicación asertiva para líderes', imagePath: 'cards-learn/U-Corporativa/Comunicación-asertiva-para-líderes.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' },
        { title: 'Ciberseguridad y protección de datos', imagePath: 'cards-learn/U-Corporativa/Ciberseguridad-y-protección-de-datos.jpg', duration: '60 min', level: 'Básico', competency: 'Herramientas tecnológicas' },
        { title: 'Gestión de proyectos con metodologías ágiles', imagePath: 'cards-learn/U-Corporativa/Gestión-de-proyectos-con-metodologías-ágiles.jpg', duration: '60 min', level: 'Básico', competency: 'Herramientas tecnológicas' },
        { title: 'Uso eficiente del correo electrónico y calendarios', imagePath: 'cards-learn/U-Corporativa/Uso-eficiente-del-correo-electrónico-y-calendarios.jpg', duration: '60 min', level: 'Básico', competency: 'Herramientas tecnológicas' },
        { title: 'Motivación y reconocimiento del talento', imagePath: 'cards-learn/U-Corporativa/motivacion-y-reconocimiento-del-talento.jpg', duration: '60 min', level: 'Básico', competency: 'Liderazgo' }
    ].map(function(it, idx) {
        return {
            id: 'c' + (files.length + idx + 1),
            type: 'Curso',
            title: fixTildes(toSentenceCase(it.title)),
            provider: 'Mi empresa',
            providerLogo: empresaLogo,
            duration: it.duration,
            level: it.level,
            progress: 0,
            status: 'default',
            image: base + it.imagePath,
            competency: it.competency,
            language: 'Español',
            courseSource: 'empresa'
        };
    });

    window.CATALOGO_CURSOS_DRAWER = ubitsCourses.concat(empresaCourses);
})();
