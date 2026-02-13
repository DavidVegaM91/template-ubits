/* ========================================
   UBITS STUDY CHAT COMPONENT
   JavaScript para el chat de modo estudio IA
   ======================================== */

/** Estado del plan de estudio cuando el panel está abierto (para edición). */
var currentStudyPlanState = null;
/** Planes ya creados por tema (al reabrir se muestran en modo lectura con botón "Ver plan"; en prototipo no hace nada, en producción abriría un drawer con el plan). */
var createdStudyPlansByTopic = {};

function getStudyPlanForTopic(topicKey, planIndex) {
    if (typeof planIndex !== 'number' || planIndex < 0) planIndex = 0;
    return createdStudyPlansByTopic[topicKey] || generateStudyPlan(topicKey, planIndex);
}

/** Número de variantes de plan por tema (por cortes de 5 cursos/actividades). */
function getNumPlanVariants(topicKey) {
    var courses = COURSES_BY_TOPIC[topicKey];
    if (courses && courses.length) return Math.max(1, Math.ceil(courses.length / 5));
    if (topicKey === 'japones') return Math.max(1, Math.ceil(ACTIVITY_ALTERNATIVES_JAPANESE.length / 5));
    return 1;
}

// Función para obtener la ruta base de imágenes según la ubicación actual
function getImageBasePath() {
    const currentPath = window.location.pathname;
    
    // Si estamos en ubits-colaborador/aprendizaje/ o ubits-admin/aprendizaje/
    if (currentPath.includes('/ubits-colaborador/') || currentPath.includes('/ubits-admin/')) {
        return '../../images/';
    }
    // Si estamos en documentacion/
    if (currentPath.includes('/documentacion/')) {
        return '../images/';
    }
    // Default: raíz del proyecto
    return 'images/';
}

// Base de datos de cursos de liderazgo (las rutas se ajustan dinámicamente). Opcional: duration, level (Básico|Intermedio|Avanzado).
const LEADERSHIP_COURSES = [
    { title: 'Cambio en el estilo de liderazgo', imagePath: 'cards-learn/cambio-en-el-estilo-de-liderazgo.jpeg', duration: '30 min', level: 'Básico' },
    { title: 'Cómo ejercer el liderazgo inclusivo', imagePath: 'cards-learn/como-ejercer-el-liderazgo-inclusivo.jpeg', duration: '45 min', level: 'Intermedio' },
    { title: 'El buen coaching inspira liderazgo', imagePath: 'cards-learn/el-buen-coaching-inspira-liderazgo.jpeg', duration: '60 min', level: 'Intermedio' },
    { title: 'Emplea los valores del liderazgo femenino', imagePath: 'cards-learn/emplea-los-valores-del-liderazgo-femenino.jpeg', duration: '60 min', level: 'Intermedio' },
    { title: 'Implementa el liderazgo colectivo en tu empresa', imagePath: 'cards-learn/implementa-el-liderazgo-coletivo-en-tu-empresa.jpeg', duration: '90 min', level: 'Avanzado' },
    { title: 'La clave del liderazgo inclusivo', imagePath: 'cards-learn/la-clave-del-liderazgo-inclusivo.jpeg', duration: '60 min', level: 'Intermedio' },
    { title: 'La confianza: una clave para el liderazgo', imagePath: 'cards-learn/la-confianza-una-clave-para-el-liderazgo.jpeg', duration: '45 min', level: 'Básico' },
    { title: 'Liderar como los grandes directores de orquesta', imagePath: 'cards-learn/liderar-como-los-grandes-directores-de-orquesta.jpeg', duration: '60 min', level: 'Intermedio' },
    { title: 'Liderar con inteligencia emocional', imagePath: 'cards-learn/liderar-con-inteligencia-emocional.jpeg', duration: '75 min', level: 'Avanzado' },
    { title: 'Liderazgo en tiempos de crisis', imagePath: 'cards-learn/liderazgo-en-tiempos-de-crisi.jpeg', duration: '60 min', level: 'Intermedio' },
    { title: 'Liderazgo femenino', imagePath: 'cards-learn/liderazgo-femenino.jpeg', duration: '30 min', level: 'Básico' },
    { title: 'Líderes cotidianos', imagePath: 'cards-learn/lideres-cotidianos.jpeg', duration: '60 min', level: 'Intermedio' },
    { title: 'Neuroliderazgo: configura tu mente', imagePath: 'cards-learn/neuroliderazgo-configura-tu-mente.jpeg', duration: '90 min', level: 'Avanzado' },
    { title: 'Potencia tu liderazgo en entornos VUCA', imagePath: 'cards-learn/potencia-tu-liderazgo-en-entornos-vuca.jpeg', duration: '60 min', level: 'Intermedio' },
    { title: '¿Qué hace que algunos equipos tengan alto desempeño?', imagePath: 'cards-learn/que-hace-que-alugnos-equipos-tengan-alto-desempeno.jpeg', duration: '45 min', level: 'Intermedio' },
    { title: 'Ruta: Desarrollo de habilidades de liderazgo', imagePath: 'cards-learn/ruta-desarrollo-de-habilidades-de-liderazgo.jpeg', duration: '120 min', level: 'Avanzado' }
];

// Cursos UBITS por tema (para Plan de estudio) - solo competencias en catálogo
const COURSES_BY_TOPIC = {
    liderazgo: LEADERSHIP_COURSES,
    comunicacion: [
        { title: 'Cómo hablar y escuchar mejor: competencias de comunicación oral', imagePath: 'cards-learn/como-hablar-y-escuchar-mejor-competencias-de-comunicacion-oral.jpeg', duration: '60 min', level: 'Intermedio' },
        { title: 'Comunicación y empatía: claves para el éxito en equipo', imagePath: 'cards-learn/comunicacion-y-empatia-claves-para-el-exito-en-equipo.jpeg', duration: '45 min', level: 'Básico' },
        { title: 'De la comunicación a la neurocomunicación', imagePath: 'cards-learn/de-la-comunicacion-a-la-neurocomunicacion.jpeg', duration: '90 min', level: 'Avanzado' },
        { title: 'Agilidad emocional', imagePath: 'cards-learn/agilidad-emocional.jpeg', duration: '30 min', level: 'Básico' },
        { title: 'Reconéctate contigo y con los demás: tips para el bienestar emocional', imagePath: 'cards-learn/reconectate-contigo-y-con-los-demas-tips-para-el-bienestar-emocional.jpeg', duration: '60 min', level: 'Intermedio' }
    ],
    ingles: [
        { title: 'Introducción al desarrollo web', imagePath: 'cards-learn/introduccion-al-desarrollo-web.jpeg', duration: '60 min', level: 'Básico' },
        { title: 'Digital marketing master', imagePath: 'cards-learn/digital-marketing-master.jpeg', duration: '120 min', level: 'Avanzado' },
        { title: 'Introducción al growth marketing', imagePath: 'cards-learn/introduccion-al-growth-marketing.jpeg', duration: '45 min', level: 'Intermedio' },
        { title: 'Ingeniería de prompts: habla con la IA', imagePath: 'cards-learn/ingenieria-de-prompts-habla-con-la-ia.jpeg', duration: '60 min', level: 'Intermedio' },
        { title: 'Administración efectiva del tiempo', imagePath: 'cards-learn/administracion-efectiva-del-tiempo.jpg', duration: '30 min', level: 'Básico' }
    ]
};

/** Temas que tienen Plan de estudio (catálogo UBITS o japonés con tareas del chat). */
const STUDY_PLAN_TOPICS = ['liderazgo', 'comunicacion', 'ingles', 'japones'];

/** Formato visual del contenido recomendado (según componente Card content compact): nivel, duración e idioma. */
var RECOMMENDED_CONTENT_LEVELS = ['Básico', 'Intermedio', 'Avanzado'];
/** Iconos de nivel (mismos que card-content-compact). */
var RECOMMENDED_CONTENT_LEVEL_ICONS = { 'Básico': 'far fa-gauge-min', 'Intermedio': 'far fa-gauge', 'Avanzado': 'far fa-gauge-max' };
var RECOMMENDED_CONTENT_DURATIONS = ['15 min', '30 min', '45 min', '60 min', '75 min', '90 min', '120 min', '180 min', '240 min'];
var RECOMMENDED_CONTENT_DEFAULT_LEVEL = 'Intermedio';
var RECOMMENDED_CONTENT_DEFAULT_DURATION = '60 min';
var RECOMMENDED_CONTENT_DEFAULT_LANGUAGE = 'Español';

/**
 * Construye el objeto card para contenido recomendado (panel y mensajes).
 * Formato: nivel + duración + idioma (componente card-content-compact).
 * El curso puede tener opcionalmente .duration y .level; si no, se usan los valores por defecto.
 */
function getRecommendedContentCardData(course, basePath) {
    var level = (course.level && RECOMMENDED_CONTENT_LEVELS.indexOf(course.level) >= 0) ? course.level : RECOMMENDED_CONTENT_DEFAULT_LEVEL;
    var duration = (course.duration && RECOMMENDED_CONTENT_DURATIONS.indexOf(course.duration) >= 0) ? course.duration : RECOMMENDED_CONTENT_DEFAULT_DURATION;
    var language = course.language || RECOMMENDED_CONTENT_DEFAULT_LANGUAGE;
    return {
        type: 'Curso',
        title: course.title,
        provider: 'UBITS',
        providerLogo: basePath + 'Favicons/UBITS.jpg',
        duration: duration,
        level: level,
        progress: 0,
        status: 'default',
        image: basePath + (course.imagePath || 'cards-learn/cambio-en-el-estilo-de-liderazgo.jpeg'),
        competency: 'Liderazgo',
        language: language
    };
}

/** Tareas tipo actividad para Japonés (relacionadas con el chat): 30+ alternativas; "Rehacer" no repite una ya usada en otra tarea. */
var ACTIVITY_ALTERNATIVES_JAPANESE = [
    'Completar quiz de saludos japoneses',
    'Practicar flashcards de hiragana',
    'Hacer maratón de hiragana (50 preguntas)',
    'Completar quiz de vocabulario básico',
    'Practicar flashcards de saludos y cortesía',
    'Hacer quiz de números en japonés',
    'Repasar flashcards de partículas básicas',
    'Completar quiz de frases útiles',
    'Practicar flashcards de verbos básicos',
    'Hacer quiz de escritura (hiragana)',
    'Completar quiz de vocales en hiragana',
    'Practicar flashcards de la serie ka-wa',
    'Hacer quiz de hiragana ん y dakuten',
    'Repasar flashcards de expresiones de cortesía',
    'Completar quiz de días y meses',
    'Practicar flashcards de colores en japonés',
    'Hacer quiz de familia y personas',
    'Repasar flashcards de comida y bebida',
    'Completar quiz de verbos en presente',
    'Practicar flashcards de lugares y direcciones',
    'Hacer quiz de katakana básico',
    'Repasar flashcards de tiempo y frecuencia',
    'Completar quiz de adjetivos i y na',
    'Practicar flashcards de transporte',
    'Hacer quiz de contar objetos (contadores)',
    'Repasar flashcards de verbos en pasado',
    'Completar quiz de te-form (verbos)',
    'Practicar flashcards de invitaciones y ofertas',
    'Hacer quiz de partículas wa, ga, o, ni',
    'Repasar flashcards de compras y precios',
    'Completar quiz de oraciones negativas',
    'Practicar flashcards de salud y cuerpo',
    'Hacer quiz de hiragana con handakuten (ぱ)',
    'Repasar flashcards de kana combinados (きゃ, しゅ)'
];

function formatStudyPlanDate(d) {
    var day = d.getDate();
    var months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return day + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function formatStudyPlanDateInput(d) {
    var y = d.getFullYear();
    var m = (d.getMonth() + 1).toString().padStart(2, '0');
    var day = d.getDate().toString().padStart(2, '0');
    return y + '-' + m + '-' + day;
}

/** Convierte YYYY-MM-DD a dd/mm/yyyy para el input tipo calendar UBITS. */
function studyPlanDateToCalendarValue(iso) {
    if (!iso) return '';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
}

/** Convierte dd/mm/yyyy (del calendar) a YYYY-MM-DD para guardar en el plan. */
function studyPlanDateFromCalendarValue(s) {
    if (!s) return '';
    var parts = String(s).trim().split('/');
    if (parts.length !== 3) return s;
    return parts[2] + '-' + parts[1] + '-' + parts[0];
}

function generateStudyPlan(topicKey, planIndex) {
    if (typeof planIndex !== 'number' || planIndex < 0) planIndex = 0;
    var label = TOPIC_LABELS[topicKey] || topicKey;
    var start = new Date();
    var end = new Date();
    end.setDate(end.getDate() + 28);
    var tasks = [];
    var courses = COURSES_BY_TOPIC[topicKey];
    if (courses && courses.length) {
        var numVariants = Math.ceil(courses.length / 5);
        var variant = planIndex % numVariants;
        var from = variant * 5;
        var to = Math.min(from + 5, courses.length);
        tasks = courses.slice(from, to).map(function(c) {
            return { type: 'course', title: 'Ver contenido: ' + c.title, course: c };
        });
    } else if (topicKey === 'japones') {
        var alts = ACTIVITY_ALTERNATIVES_JAPANESE.slice();
        var numVariants = Math.ceil(ACTIVITY_ALTERNATIVES_JAPANESE.length / 5);
        var variant = planIndex % numVariants;
        var from = variant * 5;
        var to = Math.min(from + 5, ACTIVITY_ALTERNATIVES_JAPANESE.length);
        var sliceAlts = ACTIVITY_ALTERNATIVES_JAPANESE.slice(from, to);
        tasks = sliceAlts.map(function(text, i) {
            var idx = alts.indexOf(text);
            if (idx < 0) idx = from + i;
            return { type: 'activity', title: text, alternatives: alts, currentIndex: idx };
        });
    } else {
        return null;
    }
    return {
        title: 'Plan de estudio: ' + label,
        startDate: formatStudyPlanDate(start),
        endDate: formatStudyPlanDate(end),
        startDateValue: formatStudyPlanDateInput(start),
        endDateValue: formatStudyPlanDateInput(end),
        priority: 'Media',
        topicKey: topicKey,
        tasks: tasks
    };
}

/* ========== Modo Tutor IA: datos simulados para Quiz, Flashcards ========== */
const TUTOR_QUIZ = {
    liderazgo: [
        { q: '¿Qué define principalmente a un líder?', options: ['Solo da órdenes', 'Inspira y guía al equipo hacia un objetivo', 'Trabaja solo', 'Evita conflictos'], correct: 1, explanation: 'Un líder inspira y guía al equipo hacia un objetivo común, no solo da órdenes.' },
        { q: '¿Cuál es un estilo de liderazgo participativo?', options: ['Autocrático', 'Democrático', 'Laissez-faire', 'Directivo'], correct: 1, explanation: 'El estilo democrático fomenta la participación del equipo en las decisiones.' },
        { q: 'La inteligencia emocional en el liderazgo ayuda a:', options: ['Ignorar sentimientos', 'Gestionar equipos con empatía y autoconocimiento', 'Solo dar feedback negativo', 'Evitar la comunicación'], correct: 1, explanation: 'La IE permite gestionar equipos con empatía, autoconocimiento y comunicación efectiva.' },
        { q: 'La delegación efectiva consiste en:', options: ['Hacer todo uno mismo', 'Asignar tareas y autoridad manteniendo responsabilidad', 'Evitar dar instrucciones', 'Solo supervisar resultados'], correct: 1, explanation: 'Delegar bien es asignar tareas y autoridad a otros manteniendo responsabilidad y seguimiento.' },
        { q: 'Un líder transformacional se caracteriza por:', options: ['Mantener el statu quo', 'Inspirar cambios positivos y una visión compartida', 'Evitar el contacto con el equipo', 'Solo medir resultados'], correct: 1, explanation: 'El liderazgo transformacional inspira cambios y motiva con una visión compartida.' }
    ],
    comunicacion: [
        { q: 'La escucha activa implica:', options: ['Solo oír palabras', 'Prestar atención, interpretar y dar retroalimentación', 'Interrumpir para responder', 'Pensar en otra cosa'], correct: 1, explanation: 'La escucha activa implica prestar atención, interpretar y dar retroalimentación al otro.' },
        { q: '¿Qué es la comunicación asertiva?', options: ['Ser agresivo', 'Expresar ideas con claridad y respeto', 'Callar siempre', 'Solo escribir mensajes'], correct: 1, explanation: 'Es expresar ideas y necesidades con claridad y respeto, sin agredir ni callar.' },
        { q: 'Un feedback efectivo debe ser:', options: ['Solo negativo', 'Específico, oportuno y constructivo', 'Genérico y tardío', 'Solo elogios'], correct: 1, explanation: 'El feedback efectivo es específico, oportuno y constructivo para que sea útil.' },
        { q: 'Parafrasear en una conversación sirve para:', options: ['Cambiar de tema', 'Confirmar que entendiste lo que dijo el otro', 'Ganar tiempo', 'Interrumpir'], correct: 1, explanation: 'Parafrasear es repetir con tus palabras lo que dijo el otro para confirmar que entendiste.' },
        { q: 'Las barreras de comunicación pueden ser:', options: ['Solo el idioma', 'Ruido, suposiciones, emociones o idioma', 'Solo la distancia', 'Solo la tecnología'], correct: 1, explanation: 'Ruido, suposiciones, emociones o idioma dificultan el entendimiento.' }
    ],
    ingles: [
        { q: '"Schedule" significa:', options: ['Cancelar', 'Calendario o programación', 'Despedida', 'Rápido'], correct: 1, explanation: '"Schedule" se refiere al calendario o a la programación de actividades.' },
        { q: '¿Cuál es la forma pasada de "to go"?', options: ['goed', 'went', 'gone', 'going'], correct: 1, explanation: 'El pasado simple de "to go" es "went"; es un verbo irregular.' },
        { q: '"Deadline" en contexto laboral significa:', options: ['Límite de tiempo para entregar algo', 'Reunión', 'Vacaciones', 'Contrato'], correct: 0, explanation: '"Deadline" es el plazo o límite de tiempo para entregar un trabajo.' },
        { q: '"Actually" en inglés suele significar:', options: ['Actualmente', 'En realidad', 'Actualmente o en realidad', 'Rápido'], correct: 1, explanation: 'En inglés "actually" suele significar "en realidad", no "actualmente".' },
        { q: '¿Cuál es un phrasal verb que puede significar "despegar" o "quitarse (ropa)"?', options: ['Take on', 'Take off', 'Take in', 'Take out'], correct: 1, explanation: '"Take off" puede significar despegar (avión) o quitarse (ropa).' }
    ],
    japones: [
        { q: "Si quieres decir 'Hola' o 'Buenas tardes' de manera general durante el día, ¿qué expresión usarías?", options: ['Ohayou', 'Konnichiwa', 'Konbanwa', 'Sayounara'], correct: 1, explanation: '"Konnichiwa" es el saludo estándar para hola o buenas tardes durante el día.' },
        { q: 'En una oración básica en japonés, ¿en qué posición se coloca normalmente el verbo?', options: ['Al principio de la oración', 'Justo después del sujeto', 'Al final de la oración', 'Es opcional su posición'], correct: 2, explanation: 'En japonés el orden típico es sujeto-objeto-verbo; el verbo va al final.' },
        { q: "¿Cuál es el significado de 'Arigatou'?", options: ['Lo siento', 'Por favor', 'Gracias', 'Mucho gusto'], correct: 2, explanation: '"Arigatou" (arigatō) significa "gracias" en japonés.' },
        { q: "¿Qué número representa el carácter 'ichi' (いち)?", options: ['1', '2', '3', '10'], correct: 0, explanation: '"Ichi" (いち) es el número 1 en japonés.' },
        { q: "¿Cuál de estos saludos se utiliza específicamente antes de irse a dormir?", options: ['Oyasumi nasai', 'Konbanwa', 'Itadakimasu', 'Tadaima'], correct: 0, explanation: '"Oyasumi nasai" es el saludo para despedirse antes de dormir (buenas noches).' }
    ],
    hiragana: [
        { q: "¿Cuál es el carácter para la vocal 'a'?", options: ['あ', 'お', 'め', 'ぬ'], correct: 0, explanation: 'あ (a) es la vocal "a" en hiragana.' },
        { q: "¿Cómo se escribe el sonido 'i'?", options: ['い', 'り', 'こ', 'に'], correct: 0, explanation: 'い (i) es la vocal "i" en hiragana.' },
        { q: "¿Cuál es el carácter para 'u'?", options: ['う', 'つ', 'ら', 'ろ'], correct: 0, explanation: 'う (u) es la vocal "u" en hiragana.' },
        { q: "Identifica el carácter para 'e'.", options: ['え', 'ん', 'そ', 'る'], correct: 0, explanation: 'え (e) es la vocal "e" en hiragana.' },
        { q: "¿Cómo se escribe la vocal 'o'?", options: ['お', 'あ', 'む', 'す'], correct: 0, explanation: 'お (o) es la vocal "o" en hiragana.' },
        { q: "¿Cuál es el carácter para 'ka'?", options: ['か', 'が', 'け', 'な'], correct: 0, explanation: 'か (ka) es el sonido "ka" en hiragana.' },
        { q: "Identifica el carácter para 'ki'.", options: ['き', 'さ', 'ち', 'ま'], correct: 0, explanation: 'き (ki) es el sonido "ki" en hiragana.' },
        { q: "¿Cómo se escribe 'ku'?", options: ['く', 'へ', 'し', 'て'], correct: 0, explanation: 'く (ku) es el sonido "ku" en hiragana.' },
        { q: "Identifica el carácter para 'ke'.", options: ['け', 'は', 'ほ', 'に'], correct: 0, explanation: 'け (ke) es el sonido "ke" en hiragana.' },
        { q: "¿Cuál es el carácter para 'ko'?", options: ['こ', 'い', 'た', 'に'], correct: 0, explanation: 'こ (ko) es el sonido "ko" en hiragana.' },
        { q: "¿Cómo se escribe 'sa'?", options: ['さ', 'き', 'ち', 'せ'], correct: 0, explanation: 'さ (sa) es el sonido "sa" en hiragana.' },
        { q: "Identifica el carácter para 'shi'.", options: ['し', 'つ', 'く', 'い'], correct: 0, explanation: 'し (shi) es el sonido "shi" en hiragana.' },
        { q: "¿Cuál es el carácter para 'su'?", options: ['す', 'む', 'よ', 'お'], correct: 0, explanation: 'す (su) es el sonido "su" en hiragana.' },
        { q: "¿Cómo se escribe 'se'?", options: ['せ', 'や', 'も', 'を'], correct: 0, explanation: 'せ (se) es el sonido "se" en hiragana.' },
        { q: "Identifica el carácter para 'so'.", options: ['そ', 'ろ', 'え', 'て'], correct: 0, explanation: 'そ (so) es el sonido "so" en hiragana.' },
        { q: "¿Cuál es el carácter para 'ta'?", options: ['た', 'な', 'に', 'だ'], correct: 0, explanation: 'た (ta) es el sonido "ta" en hiragana.' },
        { q: "¿Cómo se escribe 'chi'?", options: ['ち', 'さ', 'ら', 'ろ'], correct: 0, explanation: 'ち (chi) es el sonido "chi" en hiragana.' },
        { q: "Identifica el carácter para 'tsu'.", options: ['つ', 'し', 'う', 'く'], correct: 0, explanation: 'つ (tsu) es el sonido "tsu" en hiragana.' },
        { q: "¿Cuál es el carácter para 'te'?", options: ['て', 'そ', 'で', 'と'], correct: 0, explanation: 'て (te) es el sonido "te" en hiragana.' },
        { q: "Identifica el carácter para 'to'.", options: ['と', 'て', 'ど', 'を'], correct: 0, explanation: 'と (to) es el sonido "to" en hiragana.' },
        { q: "¿Cómo se escribe 'na'?", options: ['な', 'た', 'は', 'ぬ'], correct: 0, explanation: 'な (na) es el sonido "na" en hiragana.' },
        { q: "Identifica el carácter para 'ni'.", options: ['に', 'た', 'こ', 'け'], correct: 0, explanation: 'に (ni) es el sonido "ni" en hiragana.' },
        { q: "¿Cuál es el carácter para 'nu'?", options: ['ぬ', 'め', 'ね', 'あ'], correct: 0, explanation: 'ぬ (nu) es el sonido "nu" en hiragana.' },
        { q: "¿Cómo se escribe 'ne'?", options: ['ね', 'れ', 'わ', 'ぬ'], correct: 0, explanation: 'ね (ne) es el sonido "ne" en hiragana.' },
        { q: "Identifica el carácter para 'no'.", options: ['の', 'め', 'ぬ', 'あ'], correct: 0, explanation: 'の (no) es el sonido "no" en hiragana.' },
        { q: "¿Cuál es el carácter para 'ha'?", options: ['は', 'ほ', 'け', 'ば'], correct: 0, explanation: 'は (ha) es el sonido "ha" en hiragana.' },
        { q: "Identifica el carácter para 'hi'.", options: ['ひ', 'り', 'い', 'へ'], correct: 0, explanation: 'ひ (hi) es el sonido "hi" en hiragana.' },
        { q: "¿Cómo se escribe 'fu'?", options: ['ふ', 'ぶ', 'ぷ', 'お'], correct: 0, explanation: 'ふ (fu) es el sonido "fu" en hiragana.' },
        { q: "Identifica el carácter para 'he'.", options: ['へ', 'く', 'い', 'て'], correct: 0, explanation: 'へ (he) es el sonido "he" en hiragana.' },
        { q: "¿Cuál es el carácter para 'ho'?", options: ['ほ', 'は', 'ま', 'ぼ'], correct: 0, explanation: 'ほ (ho) es el sonido "ho" en hiragana.' },
        { q: "¿Cómo se escribe 'ma'?", options: ['ま', 'ほ', 'は', 'も'], correct: 0, explanation: 'ま (ma) es el sonido "ma" en hiragana.' },
        { q: "Identifica el carácter para 'mi'.", options: ['み', 'め', 'む', 'に'], correct: 0, explanation: 'み (mi) es el sonido "mi" en hiragana.' },
        { q: "¿Cuál es el carácter para 'mu'?", options: ['む', 'す', 'お', 'ま'], correct: 0, explanation: 'む (mu) es el sonido "mu" en hiragana.' },
        { q: "Identifica el carácter para 'me'.", options: ['め', 'ぬ', 'の', 'あ'], correct: 0, explanation: 'め (me) es el sonido "me" en hiragana.' },
        { q: "¿Cómo se escribe 'mo'?", options: ['も', 'ま', 'し', 'む'], correct: 0, explanation: 'も (mo) es el sonido "mo" en hiragana.' },
        { q: "¿Cuál es el carácter para 'ya'?", options: ['や', 'せ', 'か', 'ゆ'], correct: 0, explanation: 'や (ya) es el sonido "ya" en hiragana.' },
        { q: "Identifica el carácter para 'yu'.", options: ['ゆ', 'よ', 'め', 'わ'], correct: 0, explanation: 'ゆ (yu) es el sonido "yu" en hiragana.' },
        { q: "¿Cómo se escribe 'yo'?", options: ['よ', 'ま', 'は', 'ゆ'], correct: 0, explanation: 'よ (yo) es el sonido "yo" en hiragana.' },
        { q: "Identifica el carácter para 'ra'.", options: ['ら', 'う', 'ち', 'ろ'], correct: 0, explanation: 'ら (ra) es el sonido "ra" en hiragana.' },
        { q: "¿Cuál es el carácter para 'ri'?", options: ['り', 'い', 'け', 'は'], correct: 0, explanation: 'り (ri) es el sonido "ri" en hiragana.' },
        { q: "Identifica el carácter para 'ru'.", options: ['る', 'ろ', 'そ', 'ぬ'], correct: 0, explanation: 'る (ru) es el sonido "ru" en hiragana.' },
        { q: "¿Cómo se escribe 're'?", options: ['れ', 'ね', 'わ', 'ぬ'], correct: 0, explanation: 'れ (re) es el sonido "re" en hiragana.' },
        { q: "Identifica el carácter para 'ro'.", options: ['ろ', 'る', 'ら', 'ち'], correct: 0, explanation: 'ろ (ro) es el sonido "ro" en hiragana.' },
        { q: "¿Cuál es el carácter para 'wa'?", options: ['わ', 'ね', 'れ', 'め'], correct: 0, explanation: 'わ (wa) es el sonido "wa" en hiragana.' },
        { q: "Identifica el carácter para la partícula 'wo' (o).", options: ['を', 'お', 'と', 'せ'], correct: 0, explanation: 'を (wo) se usa como partícula de objeto; se pronuncia como "o".' },
        { q: "¿Cuál es el carácter para el sonido nasal 'n'?", options: ['ん', 'え', 'そ', 'い'], correct: 0, explanation: 'ん (n) es el único carácter que representa una sola consonante en hiragana.' },
        { q: "¿Cómo se escribe 'ga'?", options: ['が', 'か', 'ぎ', 'ぐ'], correct: 0, explanation: 'が (ga) es la versión sonora de か (ka) en hiragana.' },
        { q: "¿Cómo se escribe 'pa'?", options: ['ぱ', 'ば', 'は', 'ほ'], correct: 0, explanation: 'ぱ (pa) es la versión con handakuten de は en hiragana.' },
        { q: "¿Cómo se representa el sonido combinado 'kya'?", options: ['きゃ', 'きや', 'か', 'きゅ'], correct: 0, explanation: 'きゃ (kya) se escribe con き más una や pequeña.' },
        { q: "¿Qué indica un 'tsu' pequeño (っ) antes de otra consonante?", options: ['Pausa/Geminación', 'Pregunta', 'Vocal larga', 'Sonido agudo'], correct: 0, explanation: 'El っ pequeño indica una pausa o geminación (consonante doble) antes del siguiente sonido.' }
    ]
};

/** Sets 2 a 5 de quiz por tema (5 preguntas por set; hiragana usa slice del set principal). */
const TUTOR_QUIZ_SET1 = {
    liderazgo: [
        { q: '¿Qué favorece la confianza en un equipo?', options: ['Ocultar errores', 'Transparencia y coherencia entre decir y hacer', 'Solo reuniones formales', 'Evitar el conflicto'], correct: 1, explanation: 'La transparencia y la coherencia entre lo que se dice y se hace construyen confianza.' },
        { q: 'Un líder que delega bien:', options: ['Controla cada detalle', 'Define resultado esperado, da recursos y hace seguimiento', 'Solo asigna tareas fáciles', 'No pide cuentas'], correct: 1, explanation: 'Delegar bien implica claridad en el resultado, recursos y seguimiento.' },
        { q: 'El feedback efectivo debe darse:', options: ['Solo al final del año', 'A tiempo y con ejemplos concretos', 'Solo por escrito', 'Solo cuando hay problemas'], correct: 1, explanation: 'El feedback es más útil cuando es oportuno y está basado en hechos.' },
        { q: '¿Qué es la escucha activa en liderazgo?', options: ['Oír mientras se piensa la respuesta', 'Prestar atención plena, preguntar y parafrasear', 'Asentir siempre', 'Interrumpir para aclarar'], correct: 1, explanation: 'La escucha activa implica atención plena, preguntas y parafraseo.' },
        { q: 'La resiliencia en liderazgo se refiere a:', options: ['No mostrar debilidad', 'Recuperarse de adversidades y aprender', 'Evitar el estrés', 'Trabajar más horas'], correct: 1, explanation: 'La resiliencia es la capacidad de recuperarse y aprender de las dificultades.' }
    ],
    comunicacion: [
        { q: '¿Qué es un mensaje "yo"?', options: ['Hablar solo de uno mismo', 'Expresar lo que sientes o necesitas sin culpar al otro', 'Siempre empezar con "Yo"', 'Evitar el conflicto'], correct: 1, explanation: 'El mensaje yo expresa sentimientos o necesidades sin acusar: "Yo me siento..."' },
        { q: 'Las preguntas abiertas sirven para:', options: ['Obtener sí o no', 'Profundizar y que el otro explique (qué, cómo, por qué)', 'Cerrar temas', 'Interrogar'], correct: 1, explanation: 'Las preguntas abiertas invitan a explicar y profundizar.' },
        { q: 'En una reunión, parafrasear ayuda a:', options: ['Ganar tiempo', 'Confirmar que se entendió y alinear a todos', 'Dominar la conversación', 'Evitar desacuerdos'], correct: 1, explanation: 'Parafrasear confirma el entendimiento y alinea al equipo.' },
        { q: 'La comunicación no verbal incluye:', options: ['Solo los gestos', 'Gestos, postura, mirada, tono de voz y espacio', 'Solo el tono', 'Solo la mirada'], correct: 1, explanation: 'Incluye cuerpo, voz, mirada y uso del espacio.' },
        { q: '¿Cuándo es mejor dar feedback negativo?', options: ['En público', 'En privado, a tiempo y con foco en el comportamiento', 'Solo por email', 'Nunca'], correct: 1, explanation: 'En privado, pronto y centrado en comportamientos concretos.' }
    ],
    ingles: [
        { q: '"Brief" como sustantivo en trabajo significa:', options: ['Corto', 'Resumen o instrucciones (e.g. project brief)', 'Rápido', 'Reunión'], correct: 1, explanation: '"Brief" puede ser un resumen o documento de instrucciones.' },
        { q: '¿Cuál es el pasado de "to have"?', options: ['haved', 'had', 'has', 'having'], correct: 1, explanation: 'El pasado simple de "to have" es "had".' },
        { q: '"To schedule a meeting" significa:', options: ['Cancelar una reunión', 'Programar o agendar una reunión', 'Llegar tarde', 'Terminar una reunión'], correct: 1, explanation: '"To schedule" es programar o agendar.' },
        { q: 'En un email formal, "I am writing to..." sirve para:', options: ['Despedirse', 'Introducir el motivo del mensaje', 'Pedir disculpas', 'Adjuntar archivos'], correct: 1, explanation: 'Introduce el propósito del correo de forma formal.' },
        { q: '"Deadline" se refiere a:', options: ['Fecha de inicio', 'Fecha límite de entrega', 'Reunión', 'Vacaciones'], correct: 1, explanation: '"Deadline" es la fecha límite para entregar algo.' }
    ],
    japones: [
        { q: "¿Qué partícula indica el objeto directo en japonés?", options: ['は (wa)', 'を (wo)', 'に (ni)', 'で (de)'], correct: 1, explanation: 'を (wo) marca el objeto directo del verbo.' },
        { q: "¿Cuál es un saludo para la mañana?", options: ['Konnichiwa', 'Ohayou gozaimasu', 'Konbanwa', 'Sayounara'], correct: 1, explanation: '"Ohayou gozaimasu" es buenos días (formal).' },
        { q: "¿Qué significa 'Itadakimasu'?", options: ['Gracias', 'Se dice antes de comer (como bendición)', 'Buen provecho', 'Adiós'], correct: 1, explanation: 'Se dice antes de comer, agradeciendo la comida.' },
        { q: "El sufijo '-san' se usa para:", options: ['Insultar', 'Mostrar respeto (ej. Tanaka-san)', 'Hablar de uno mismo', 'Objetos'], correct: 1, explanation: '-san es un sufijo de respeto tras el nombre.' },
        { q: "¿Cómo se dice 'No' en japonés?", options: ['Hai', 'Iie', 'Ee', 'Un'], correct: 1, explanation: '"Iie" es la forma estándar de decir no.' }
    ],
    hiragana: [] // se rellena con slice de TUTOR_QUIZ.hiragana
};
const TUTOR_QUIZ_SET2 = {
    liderazgo: [
        { q: '¿Qué es un objetivo SMART?', options: ['Cualquier meta', 'Específico, Medible, Alcanzable, Relevante y con Tiempo', 'Solo medible', 'Solo a largo plazo'], correct: 1, explanation: 'SMART: Specific, Measurable, Achievable, Relevant, Time-bound.' },
        { q: 'La gestión del cambio requiere:', options: ['Solo comunicar una vez', 'Comunicar el porqué, involucrar y celebrar avances', 'Ocultar resistencias', 'Imponer sin explicar'], correct: 1, explanation: 'Comunicación, involucración y reconocimiento facilitan el cambio.' },
        { q: 'Las reuniones 1:1 sirven para:', options: ['Solo dar órdenes', 'Feedback, prioridades y desarrollo del colaborador', 'Solo revisar tareas', 'Evitar hablar en grupo'], correct: 1, explanation: 'Son espacios para feedback, alineación y desarrollo.' },
        { q: '¿Qué caracteriza al liderazgo situacional?', options: ['Un solo estilo', 'Adaptar el estilo al nivel de madurez y la tarea', 'Solo apoyar', 'Solo dirigir'], correct: 1, explanation: 'Se adapta el estilo al contexto y a la persona.' },
        { q: 'La rendición de cuentas (accountability) implica:', options: ['Culpar a otros', 'Asumir responsabilidad por resultados y acciones', 'Solo informar', 'Delegar todo'], correct: 1, explanation: 'Es asumir la responsabilidad por lo que nos corresponde.' }
    ],
    comunicacion: [
        { q: 'En comunicación en crisis, es importante:', options: ['Esperar a tener toda la información', 'Ser claro, frecuente y honesto aunque la info sea parcial', 'Solo comunicar por escrito', 'Evitar mencionar problemas'], correct: 1, explanation: 'Comunicar pronto y con transparencia reduce rumores.' },
        { q: 'La escucha empática consiste en:', options: ['Dar soluciones rápido', 'Ponerse en el lugar del otro y validar emociones', 'Interrumpir para aconsejar', 'Solo asentir'], correct: 1, explanation: 'Validar emociones antes de proponer soluciones.' },
        { q: 'El storytelling en presentaciones:', options: ['Solo entretiene', 'Hace el mensaje memorable y conecta con la audiencia', 'Sustituye datos', 'Solo para niños'], correct: 1, explanation: 'Las historias ayudan a que el mensaje se recuerde.' },
        { q: 'Un mensaje clave en una presentación debe:', options: ['Decirse solo al final', 'Repetirse al inicio, desarrollo y cierre', 'Ser muy largo', 'Incluir todo el detalle'], correct: 1, explanation: 'Una idea clave repetida se fija mejor.' },
        { q: 'En emails profesionales conviene:', options: ['Un tema por mensaje y párrafos cortos', 'Varios temas en un solo mail', 'Solo asunto', 'Sin llamada a la acción'], correct: 0, explanation: 'Un tema por correo y estructura clara mejoran la respuesta.' }
    ],
    ingles: [
        { q: '"To meet a deadline" significa:', options: ['Perder el plazo', 'Cumplir la fecha límite', 'Posponer', 'Cancelar'], correct: 1, explanation: '"To meet" aquí es cumplir o llegar a.' },
        { q: 'En reuniones, "Could you repeat that?" sirve para:', options: ['Terminar', 'Pedir que repitan lo dicho', 'Estar de acuerdo', 'Presentarse'], correct: 1, explanation: 'Pide que repitan para entender mejor.' },
        { q: '"As per" en un email significa:', options: ['Según (as per our conversation)', 'Antes de', 'Después de', 'En contra de'], correct: 0, explanation: '"As per" es "según" en contexto formal.' },
        { q: 'El "past continuous" se usa para:', options: ['Acciones futuras', 'Acción en curso en un momento del pasado', 'Solo hábitos', 'Condicionales'], correct: 1, explanation: 'Was/were + -ing: algo estaba ocurriendo en el pasado.' },
        { q: '"Looking forward to" va seguido de:', options: ['Infinitivo (to + verbo)', 'Verbo en -ing', 'Pasado', 'Sustantivo solo'], correct: 1, explanation: 'I am looking forward to hearing from you ( -ing ).' }
    ],
    japones: [
        { q: "¿Qué expresión se usa al volver a casa?", options: ['Ittekimasu', 'Tadaima', 'Gochisousama', 'Oyasumi'], correct: 1, explanation: '"Tadaima" = "Ya llegué".' },
        { q: "¿Cuál es la respuesta a 'Tadaima'?", options: ['Sayounara', 'Okaeri (nasai)', 'Ittekimasu', 'Konnichiwa'], correct: 1, explanation: '"Okaeri" = "Bienvenido de vuelta".' },
        { q: "¿Qué se dice al terminar de comer?", options: ['Itadakimasu', 'Gochisousama', 'Sumimasen', 'Arigatou'], correct: 1, explanation: '"Gochisousama" agradece la comida.' },
        { q: "La partícula 'ni' puede indicar:", options: ['Solo lugar', 'Lugar, tiempo, destino o receptor', 'Solo tiempo', 'Solo objeto'], correct: 1, explanation: 'に (ni) tiene varios usos: lugar, tiempo, destino.' },
        { q: "¿Qué significa 'Onegaishimasu'?", options: ['Gracias', 'Por favor / al pedir algo', 'Lo siento', 'No'], correct: 1, explanation: 'Por favor, o al iniciar una actividad.' }
    ],
    hiragana: []
};
const TUTOR_QUIZ_SET3 = {
    liderazgo: [
        { q: 'El liderazgo servicial (servant leadership) prioriza:', options: ['El poder del líder', 'Las necesidades del equipo y su desarrollo', 'Solo resultados a corto plazo', 'La jerarquía'], correct: 1, explanation: 'El líder sirve al equipo para que este brille.' },
        { q: '¿Qué ayuda a resolver conflictos en equipo?', options: ['Evitar el tema', 'Escuchar a las partes, identificar intereses y buscar opciones', 'Imponer una solución', 'Solo mediar una vez'], correct: 1, explanation: 'Escucha, intereses comunes y opciones facilitan acuerdos.' },
        { q: 'La visión compartida en un equipo:', options: ['Solo la tiene el líder', 'Une al equipo y guía las decisiones', 'Es opcional', 'Solo para proyectos grandes'], correct: 1, explanation: 'Una visión compartida alinea y motiva.' },
        { q: 'El mentoring se diferencia del coaching en que:', options: ['Son lo mismo', 'El mentoring transmite experiencia; el coaching hace preguntas', 'Solo el coaching existe', 'El mentoring es más corto'], correct: 1, explanation: 'Mentoring = experiencia; coaching = preguntas y reflexión.' },
        { q: '¿Qué es la autoconciencia en liderazgo?', options: ['Conocer solo al equipo', 'Reconocer las propias emociones, fortalezas y límites', 'No mostrar emociones', 'Solo escuchar'], correct: 1, explanation: 'La autoconciencia es la base de la IE.' }
    ],
    comunicacion: [
        { q: 'La asertividad se sitúa entre:', options: ['Pasividad y agresividad', 'Solo pasividad', 'Solo agresividad', 'Indiferencia'], correct: 0, explanation: 'Es el punto medio: defender derechos con respeto.' },
        { q: 'Un resumen al cerrar una reunión debe incluir:', options: ['Solo quién asistió', 'Qué se decidió, quién hace qué y para cuándo', 'Solo el próximo encuentro', 'Nada'], correct: 1, explanation: 'Acuerdos, responsables y plazos cierran bien.' },
        { q: 'El feedback "sandwich" (positivo-negativo-positivo):', options: ['Siempre es la mejor opción', 'Puede diluir el mensaje; a veces es mejor ser directo', 'Solo debe usarse con jefes', 'Sustituye el feedback negativo'], correct: 1, explanation: 'A veces la claridad directa es más útil.' },
        { q: 'La comunicación escrita en remoto debe:', options: ['Ser muy breve siempre', 'Ser clara, con contexto y llamada a la acción cuando aplique', 'Solo por chat', 'Evitar emojis siempre'], correct: 1, explanation: 'Claridad, contexto y siguiente paso ayudan.' },
        { q: '¿Qué es validar en una conversación difícil?', options: ['Estar de acuerdo con todo', 'Reconocer la emoción o perspectiva del otro sin juzgar', 'Ceder siempre', 'Cortar la conversación'], correct: 1, explanation: 'Validar es reconocer lo que siente el otro.' }
    ],
    ingles: [
        { q: '"To reach out" significa:', options: ['Colgar', 'Contactar o comunicarse con alguien', 'Alejarse', 'Rechazar'], correct: 1, explanation: '"To reach out" = contactar o tender la mano.' },
        { q: '"Follow up" como verbo significa:', options: ['Empezar', 'Dar seguimiento', 'Terminar', 'Cancelar'], correct: 1, explanation: 'Dar seguimiento a algo (reunión, tarea).' },
        { q: 'En un email, "Please find attached" indica:', options: ['Que no hay adjuntos', 'Que se adjunta un archivo', 'Una disculpa', 'El cierre'], correct: 1, explanation: 'Fórmula formal para indicar adjunto.' },
        { q: '"To wrap up" una reunión es:', options: ['Empezarla', 'Terminarla o cerrar temas', 'Posponerla', 'Cancelarla'], correct: 1, explanation: '"To wrap up" = concluir o cerrar.' },
        { q: '"Backlog" en trabajo suele referirse a:', options: ['El futuro', 'Tareas o ítems pendientes acumulados', 'Solo bugs', 'Reuniones'], correct: 1, explanation: 'Acumulado de trabajo pendiente.' }
    ],
    japones: [
        { q: "¿Qué partícula suele indicar lugar donde ocurre la acción?", options: ['を', 'で', 'は', 'が'], correct: 1, explanation: 'で (de) indica lugar donde se realiza la acción.' },
        { q: "¿Cuál es la forma cortés de 'gracias'?", options: ['Arigatou', 'Arigatou gozaimasu', 'Doumo', 'Iie'], correct: 1, explanation: '"Arigatou gozaimasu" es la forma formal.' },
        { q: "¿Qué se dice al salir de casa (el que se va)?", options: ['Tadaima', 'Ittekimasu', 'Okaeri', 'Gochisousama'], correct: 1, explanation: '"Ittekimasu" = "Me voy" (el que sale).' },
        { q: "La partícula 'ga' marca:", options: ['Solo objeto', 'Sujeto (énfasis) o preferencia', 'Solo tiempo', 'Solo lugar'], correct: 1, explanation: 'が (ga) marca el sujeto o preferencia (X ga suki).' },
        { q: "¿Cómo se dice 'Por favor' al pedir un favor?", options: ['Iie', 'Onegaishimasu', 'Sumimasen', 'Hai'], correct: 1, explanation: '"Onegaishimasu" al solicitar algo.' }
    ],
    hiragana: []
};
const TUTOR_QUIZ_SET4 = {
    liderazgo: [
        { q: 'La diversidad en equipo aporta:', options: ['Solo conflictos', 'Perspectivas distintas y mejor toma de decisiones', 'Solo lentitud', 'Solo en creatividad'], correct: 1, explanation: 'Diversidad bien gestionada mejora decisiones e innovación.' },
        { q: 'Un líder que da reconocimiento:', options: ['Solo lo hace en público', 'Reconoce esfuerzos y logros de forma específica y oportuna', 'Solo al final del año', 'Solo con dinero'], correct: 1, explanation: 'Reconocimiento específico y a tiempo motiva.' },
        { q: 'La toma de decisiones en consenso busca:', options: ['Que gane la mayoría', 'Acuerdo que todos pueden apoyar', 'Solo la opinión del líder', 'Votación secreta'], correct: 1, explanation: 'Consenso = todos pueden apoyar la decisión.' },
        { q: '¿Qué es el burnout y cómo lo previene un líder?', options: ['Solo estrés; no se puede prevenir', 'Agotamiento crónico; se previene con límites, prioridades y apoyo', 'Solo cansancio', 'Solo falta de motivación'], correct: 1, explanation: 'Burnout es agotamiento; límites y apoyo ayudan.' },
        { q: 'La humildad en liderazgo implica:', options: ['Saberlo todo', 'Reconocer límites, aprender de otros y dar crédito', 'Solo ser amable', 'Nunca equivocarse'], correct: 1, explanation: 'Reconocer límites y dar crédito al equipo.' }
    ],
    comunicacion: [
        { q: 'En una negociación, la escucha activa permite:', options: ['Solo ganar tiempo', 'Entender intereses del otro y buscar opciones ganar-ganar', 'Solo defender tu posición', 'Solo ceder'], correct: 1, explanation: 'Entender intereses abre opciones mutuamente beneficiosas.' },
        { q: 'El lenguaje inclusivo en el trabajo:', options: ['Solo es político', 'Incluye a todas las personas y evita suposiciones', 'Solo en escritos', 'Solo con clientes'], correct: 1, explanation: 'Incluye a todos y evita exclusiones.' },
        { q: 'Una "elevator pitch" debe ser:', options: ['Muy larga', 'Breve, clara y memorable (ej. 30-60 segundos)', 'Solo para ventas', 'Solo oral'], correct: 1, explanation: 'Pitch corto que resume la idea en poco tiempo.' },
        { q: 'Al dar malas noticias, conviene:', options: ['Ocultar detalles', 'Ser claro, empático y ofrecer próximos pasos', 'Solo por email', 'Dejar que otros lo comuniquen'], correct: 1, explanation: 'Claridad, empatía y pasos siguientes.' },
        { q: 'La comunicación intercultural requiere:', options: ['Solo hablar más alto', 'Curiosidad, evitar suposiciones y adaptar el estilo', 'Solo traducir', 'Solo gestos'], correct: 1, explanation: 'Curiosidad y adaptación reducen malentendidos.' }
    ],
    ingles: [
        { q: '"To step down" significa:', options: ['Subir', 'Dejar un cargo o posición', 'Continuar', 'Empezar'], correct: 1, explanation: '"To step down" = renunciar o dejar el cargo.' },
        { q: '"Onboarding" se refiere a:', options: ['Despedida', 'Proceso de integración de un nuevo empleado', 'Reunión', 'Proyecto'], correct: 1, explanation: 'Integración de nuevos en la empresa.' },
        { q: 'En un email, "I hope this email finds you well" es:', options: ['Una queja', 'Un saludo formal de apertura', 'El cierre', 'Una pregunta'], correct: 1, explanation: 'Fórmula de cortesía al inicio del correo.' },
        { q: '"To brainstorm" significa:', options: ['Criticar', 'Generar ideas en grupo sin juzgar al inicio', 'Votar', 'Decidir'], correct: 1, explanation: 'Lluvia de ideas, sin filtrar al principio.' },
        { q: '"Quarter" en contexto empresarial suele ser:', options: ['Medio año', 'Trimestre (Q1, Q2, etc.)', 'Mes', 'Año'], correct: 1, explanation: 'Quarter = trimestre (Q1-Q4).' }
    ],
    japones: [
        { q: "¿Qué partícula indica tema o contraste (como 'respecto a')?", options: ['を', 'に', 'は', 'で'], correct: 2, explanation: 'は (wa) marca el tema de la oración.' },
        { q: "¿Cuál es una despedida formal?", options: ['Bye', 'Sayounara', 'Mata ne', 'Otsukaresama desu'], correct: 3, explanation: '"Otsukaresama desu" se usa al terminar la jornada.' },
        { q: "¿Qué significa 'Sumimasen'?", options: ['Solo gracias', 'Perdón / Disculpe / Gracias (cuando molestas)', 'Solo no', 'Sí'], correct: 1, explanation: 'Tiene varios usos según el contexto.' },
        { q: "Los números japoneses 1-10 (hitotsu, futatsu...):", options: ['Solo para contar personas', 'Son contadores; la forma depende de qué se cuenta', 'Solo para tiempo', 'Son iguales siempre'], correct: 1, explanation: 'Hay distintos contadores según el objeto.' },
        { q: "¿Cómo se responde a 'Ogenki desu ka?'?", options: ['Iie', 'Hai, genki desu', 'Sayounara', 'Sumimasen'], correct: 1, explanation: '"¿Cómo estás?" → "Sí, estoy bien".' }
    ],
    hiragana: []
};

(function () {
    var h = TUTOR_QUIZ.hiragana;
    var L = h ? h.length : 0;
    if (L >= 10) {
        TUTOR_QUIZ_SET1.hiragana = h.slice(10, 20);
        TUTOR_QUIZ_SET2.hiragana = h.slice(20, 30);
        TUTOR_QUIZ_SET3.hiragana = h.slice(30, 40);
        TUTOR_QUIZ_SET4.hiragana = h.slice(40, 50);
    }
})();

/** 5 sets de quiz por tema; set 0 usa TUTOR_QUIZ con hiragana slice(0,10); sets 1-4 usan TUTOR_QUIZ_SET1..SET4 (hiragana ya asignado por slice). */
var TUTOR_QUIZ_SETS = [
    { liderazgo: TUTOR_QUIZ.liderazgo, comunicacion: TUTOR_QUIZ.comunicacion, ingles: TUTOR_QUIZ.ingles, japones: TUTOR_QUIZ.japones, hiragana: TUTOR_QUIZ.hiragana.slice(0, 10) },
    TUTOR_QUIZ_SET1,
    TUTOR_QUIZ_SET2,
    TUTOR_QUIZ_SET3,
    TUTOR_QUIZ_SET4
];

/** Sets de flashcards por tema: 5 iteraciones × 5 cartas = 25 por tema (liderazgo, comunicacion, ingles, japones, hiragana). */
const TUTOR_FLASHCARDS = {
    liderazgo: [
        { front: 'Liderazgo transformacional', back: 'Estilo que inspira cambios positivos y motiva al equipo con una visión compartida.' },
        { front: 'Feedback 360°', back: 'Evaluación que recibe un líder desde jefes, pares y colaboradores para mejorar.' },
        { front: 'Delegación efectiva', back: 'Asignar tareas y autoridad a otros manteniendo responsabilidad y seguimiento.' },
        { front: 'Coaching', back: 'Acompañar al colaborador con preguntas y reflexión para que encuentre sus propias soluciones.' },
        { front: 'Empoderamiento', back: 'Dar autonomía y recursos para que el equipo tome decisiones y asuma responsabilidades.' }
    ],
    comunicacion: [
        { front: 'Comunicación no verbal', back: 'Mensajes transmitidos con gestos, postura, mirada y tono de voz.' },
        { front: 'Barreras de comunicación', back: 'Ruido, suposiciones, emociones o idioma que dificultan el entendimiento.' },
        { front: 'Parafrasear', back: 'Repetir con tus palabras lo que dijo el otro para confirmar que entendiste.' },
        { front: 'Escucha activa', back: 'Atender con atención plena, hacer preguntas y resumir lo que dijo el otro.' },
        { front: 'Mensaje yo', back: 'Expresar lo que sientes o necesitas sin culpar: "Yo me siento..." en lugar de "Tú siempre..."' }
    ],
    ingles: [
        { front: 'Present continuous', back: 'Estructura: am/is/are + verbo -ing. Ej: I am working.' },
        { front: 'Phrasal verb "take off"', back: 'Puede significar: despegar (avión) o quitarse (ropa).' },
        { front: '"Actually"', back: 'En inglés suele significar "en realidad", no "actualmente".' },
        { front: 'Present simple', back: 'Para rutinas y hechos. Ej: She works from home.' },
        { front: '"Eventually"', back: 'Significa "al final" o "con el tiempo", no "eventualmente" en español.' }
    ],
    japones: [
        { front: 'Kana', back: 'Sistemas de escritura silábicos: hiragana y katakana.' },
        { front: 'Kanji', back: 'Caracteres de origen chino usados en japonés para muchas palabras.' },
        { front: 'Kudasai', back: 'Sufijo de cortesía que significa "por favor".' },
        { front: 'Ohayou gozaimasu', back: 'Buenos días (formal).' },
        { front: 'Konnichiwa', back: 'Hola / Buenas tardes.' }
    ],
    hiragana: [
        { front: 'Vocales (a, i, u, e, o)', back: 'あ い う え お' },
        { front: 'Serie ka (か き く け こ)', back: 'Sonidos ka, ki, ku, ke, ko en hiragana.' },
        { front: 'Tsu pequeño (っ)', back: 'Indica pausa o geminación (consonante doble).' },
        { front: 'Serie sa (さ し す せ そ)', back: 'Sonidos sa, shi, su, se, so en hiragana.' },
        { front: 'Serie ta (た ち つ て と)', back: 'Sonidos ta, chi, tsu, te, to en hiragana.' }
    ]
};

/** Set 2 de flashcards (iteración 2 de "Más flashcards"). */
const TUTOR_FLASHCARDS_ALT = {
    liderazgo: [
        { front: 'Escucha activa', back: 'Prestar atención plena al otro, preguntar y parafrasear para entender bien.' },
        { front: 'Inteligencia emocional', back: 'Capacidad de reconocer y gestionar las propias emociones y las de otros.' },
        { front: 'Visión compartida', back: 'Objetivo común que une al equipo y guía las decisiones.' },
        { front: 'Resolución de conflictos', back: 'Identificar el problema, escuchar a las partes y buscar soluciones que sumen.' },
        { front: 'Mentoring', back: 'Transmitir experiencia y guiar el desarrollo de otra persona a largo plazo.' }
    ],
    comunicacion: [
        { front: 'Feedback constructivo', back: 'Comentario específico, a tiempo y centrado en comportamientos mejorables.' },
        { front: 'Asertividad', back: 'Expresar tu opinión o necesidad con claridad y respeto.' },
        { front: 'Comunicación asertiva', back: 'Decir lo que piensas sin agredir ni someterte; defender tus derechos con educación.' },
        { front: 'Preguntas abiertas', back: 'Preguntas que no se responden con sí/no; invitan a explicar (qué, cómo, por qué).' },
        { front: 'Resumen en reuniones', back: 'Cerrar acuerdos repitiendo qué se decidió, quién hace qué y para cuándo.' }
    ],
    ingles: [
        { front: 'Phrasal verb "look up"', back: 'Buscar (información) o levantar la vista.' },
        { front: 'Past simple', back: 'Para acciones acabadas en el pasado. Ej: I worked yesterday.' },
        { front: 'Phrasal verb "carry out"', back: 'Llevar a cabo, realizar (ej. carry out a project).' },
        { front: '"Due to" vs "because of"', back: 'Ambos indican causa; "due to" suele ir tras be (The delay was due to...).' },
        { front: 'Email: "Please find attached"', back: 'Fórmula formal para indicar que adjuntas un archivo al correo.' }
    ],
    japones: [
        { front: 'Arigatou gozaimasu', back: 'Gracias (formal).' },
        { front: 'Sumimasen', back: 'Perdón / Disculpe / Gracias (cuando molestas a alguien).' },
        { front: '-san (honorífico)', back: 'Sufijo de respeto tras el apellido o nombre. Ej: Tanaka-san.' },
        { front: 'Hai / Iie', back: 'Sí / No. "Hai" también se usa para mostrar que estás escuchando.' },
        { front: 'Onegaishimasu', back: 'Por favor (al pedir algo). También al inicio de una actividad.' }
    ],
    hiragana: [
        { front: 'Dakuten (゛)', back: 'Marcas que cambian consonantes: か→が, た→だ, さ→ざ.' },
        { front: 'Serie na (な に ぬ ね の)', back: 'Sonidos na, ni, nu, ne, no en hiragana.' },
        { front: 'Serie ha (は ひ ふ へ ほ)', back: 'Sonidos ha, hi, fu, he, ho. は como partícula se lee "wa".' },
        { front: 'Handakuten (゜)', back: 'Solo con は: ぱ ぴ ぷ ぺ ぽ (pa, pi, pu, pe, po).' },
        { front: 'Tsu pequeño (っ)', back: 'Geminación: la siguiente consonante se duplica (e.g. がっこう gakkou).' }
    ]
};

/** Set 3 de flashcards (iteración 3 de "Más flashcards"). */
const TUTOR_FLASHCARDS_SET2 = {
    liderazgo: [
        { front: 'Estilos de liderazgo', back: 'Directivo, participativo, orientado a resultados, transformacional; el contexto define cuál usar.' },
        { front: 'Gestión del cambio', back: 'Comunicar el porqué, involucrar a las personas y celebrar avances para adoptar lo nuevo.' },
        { front: 'Reuniones 1:1', back: 'Espacio periódico con cada colaborador para feedback, prioridades y desarrollo.' },
        { front: 'Objetivos SMART', back: 'Específicos, Medibles, Alcanzables, Relevantes y con un Tiempo definido.' },
        { front: 'Cultura de equipo', back: 'Valores, normas y ritos compartidos que definen cómo se trabaja y se relacionan.' }
    ],
    comunicacion: [
        { front: 'Comunicación en crisis', back: 'Ser claro, frecuente y honesto; dar información aunque sea parcial para reducir rumores.' },
        { front: 'Escucha empática', back: 'Ponerse en el lugar del otro sin juzgar; validar emociones antes de dar soluciones.' },
        { front: 'Storytelling', back: 'Usar historias o ejemplos para que un mensaje sea memorable y conecte con la audiencia.' },
        { front: 'Mensaje clave', back: 'Una idea principal que la audiencia debe recordar; repetirla al inicio, desarrollo y cierre.' },
        { front: 'Comunicación escrita', back: 'En emails: asunto claro, un tema por mensaje, párrafos cortos y llamada a la acción.' }
    ],
    ingles: [
        { front: 'Present perfect', back: 'Conecta pasado con presente. Ej: I have finished the report (ya está listo).' },
        { front: 'Phrasal verb "follow up"', back: 'Dar seguimiento (e.g. follow up on the meeting).' },
        { front: 'Reuniones: "Let\'s move on"', back: 'Frase para pasar al siguiente punto del orden del día.' },
        { front: '"Looking forward to"', back: 'Esperar con ganas. Va seguido de -ing: I am looking forward to hearing from you.' },
        { front: 'Small talk', back: 'Conversación ligera para romper el hielo (weather, weekend, travel) antes de temas de trabajo.' }
    ],
    japones: [
        { front: 'Konbanwa', back: 'Buenas noches.' },
        { front: 'Oyasumi nasai', back: 'Buenas noches (al despedirse para dormir).' },
        { front: 'Ittekimasu / Itterasshai', back: 'Quien sale: "Me voy". Quien se queda: "Que vaya bien".' },
        { front: 'Tadaima / Okaeri', back: 'Al volver a casa: "Ya llegué" / "Bienvenido de vuelta".' },
        { front: 'Gochisousama', back: 'Se dice al terminar de comer; agradece la comida (y a quien la preparó).' }
    ],
    hiragana: [
        { front: 'Serie ma (ま み む め も)', back: 'Sonidos ma, mi, mu, me, mo en hiragana.' },
        { front: 'Serie ya (や ゆ よ)', back: 'Solo tres caracteres: ya, yu, yo.' },
        { front: 'Serie ra (ら り る れ ろ)', back: 'Sonidos ra, ri, ru, re, ro (entre r y l).' },
        { front: 'Serie wa (わ を ん)', back: 'わ (wa), を (wo, partícula de objeto), ん (n).' },
        { front: 'Combinaciones きゃ きゅ きょ', back: 'Sílabas con y: kya, kyu, kyo. Se escriben con や ゆ よ pequeños.' }
    ]
};

/** Set 4 de flashcards. */
const TUTOR_FLASHCARDS_SET3 = {
    liderazgo: [
        { front: 'Liderazgo servicial', back: 'Prioriza las necesidades del equipo y su desarrollo; el líder sirve al equipo.' },
        { front: 'Rendición de cuentas', back: 'Asumir responsabilidad por los resultados y acciones propias.' },
        { front: 'Resolución de conflictos', back: 'Identificar el problema, escuchar a las partes y buscar soluciones que sumen.' },
        { front: 'Reconocimiento', back: 'Valorar esfuerzos y logros de forma específica y oportuna para motivar.' },
        { front: 'Autoconciencia', back: 'Reconocer las propias emociones, fortalezas y límites (base de la IE).' }
    ],
    comunicacion: [
        { front: 'Negociación', back: 'Proceso para alcanzar acuerdos; la escucha activa permite entender intereses.' },
        { front: 'Lenguaje inclusivo', back: 'Formas de comunicar que incluyen a todas las personas y evitan suposiciones.' },
        { front: 'Elevator pitch', back: 'Presentación breve (30-60 s), clara y memorable de una idea o proyecto.' },
        { front: 'Malas noticias', back: 'Comunicarlas con claridad, empatía y ofreciendo próximos pasos.' },
        { front: 'Comunicación intercultural', back: 'Curiosidad, evitar suposiciones y adaptar el estilo al contexto cultural.' }
    ],
    ingles: [
        { front: '"To step down"', back: 'Dejar un cargo o posición (renunciar al rol).' },
        { front: '"Onboarding"', back: 'Proceso de integración de un nuevo empleado en la empresa.' },
        { front: '"To reach out"', back: 'Contactar o comunicarse con alguien.' },
        { front: '"To brainstorm"', back: 'Generar ideas en grupo sin juzgar al inicio (lluvia de ideas).' },
        { front: '"Quarter" (Q1, Q2...)', back: 'Trimestre en contexto empresarial.' }
    ],
    japones: [
        { front: 'Partícula で (de)', back: 'Indica lugar donde ocurre la acción o medio/instrumento.' },
        { front: 'Partícula は (wa)', back: 'Marca el tema de la oración (a veces se lee "wa").' },
        { front: 'Otsukaresama desu', back: 'Se dice al terminar la jornada; reconoce el esfuerzo.' },
        { front: 'Contadores japoneses', back: 'La forma del número depende de qué se cuenta (hitotsu, futatsu...).' },
        { front: 'Ogenki desu ka?', back: '¿Cómo estás? Respuesta: Hai, genki desu (estoy bien).' }
    ],
    hiragana: [
        { front: 'Vocales largas', back: 'Se alargan con otra vocal: ああ (aa), いい (ii).' },
        { front: 'Serie ga (が ぎ ぐ げ ご)', back: 'Dakuten en か: ga, gi, gu, ge, go.' },
        { front: 'Serie za (ざ じ ず ぜ ぞ)', back: 'Dakuten en さ: za, ji, zu, ze, zo.' },
        { front: 'Serie da (だ ぢ づ で ど)', back: 'Dakuten en た: da, ji, zu, de, do.' },
        { front: 'Serie ba (ば び ぶ べ ぼ)', back: 'Dakuten en は: ba, bi, bu, be, bo.' }
    ]
};

/** Set 5 de flashcards. */
const TUTOR_FLASHCARDS_SET4 = {
    liderazgo: [
        { front: 'Diversidad en equipo', back: 'Perspectivas distintas que mejoran la toma de decisiones e innovación.' },
        { front: 'Burnout', back: 'Agotamiento crónico; el líder puede prevenir con límites, prioridades y apoyo.' },
        { front: 'Consenso', back: 'Decisión que todos pueden apoyar, no solo mayoría.' },
        { front: 'Humildad en liderazgo', back: 'Reconocer límites, aprender de otros y dar crédito al equipo.' },
        { front: 'Liderazgo situacional', back: 'Adaptar el estilo al nivel de madurez y la tarea del colaborador.' }
    ],
    comunicacion: [
        { front: 'Feedback sandwich', back: 'Positivo-negativo-positivo; a veces la claridad directa es mejor.' },
        { front: 'Validar', back: 'Reconocer la emoción o perspectiva del otro sin juzgar.' },
        { front: 'Comunicación remota', back: 'Claridad, contexto y llamada a la acción en escritos y reuniones.' },
        { front: 'Cerrar reuniones', back: 'Resumir: qué se decidió, quién hace qué y para cuándo.' },
        { front: 'Mensaje clave', back: 'Una idea principal a repetir al inicio, desarrollo y cierre.' }
    ],
    ingles: [
        { front: '"I hope this email finds you well"', back: 'Saludo formal de apertura en correos.' },
        { front: '"To wrap up"', back: 'Terminar o cerrar (reunión, tema).' },
        { front: '"Backlog"', back: 'Acumulado de tareas o ítems pendientes.' },
        { front: '"As per"', back: 'Según (as per our conversation).' },
        { front: 'Past continuous', back: 'Was/were + -ing: acción en curso en un momento del pasado.' }
    ],
    japones: [
        { front: 'Partícula を (wo)', back: 'Marca el objeto directo del verbo.' },
        { front: 'Partícula に (ni)', back: 'Lugar, tiempo, destino o receptor (indirecto).' },
        { front: 'Partícula が (ga)', back: 'Sujeto (con énfasis) o preferencia (X ga suki).' },
        { front: 'Ittekimasu / Itterasshai', back: 'Quien sale: "Me voy". Quien se queda: "Que vaya bien".' },
        { front: 'Tadaima / Okaeri', back: 'Al volver: "Ya llegué" / "Bienvenido de vuelta".' }
    ],
    hiragana: [
        { front: 'Serie pa (ぱ ぴ ぷ ぺ ぽ)', back: 'Handakuten en は: pa, pi, pu, pe, po.' },
        { front: 'Combinaciones con や ゆ よ', back: 'Sílabas como kya, kyu, kyo con や ゆ よ pequeños.' },
        { front: 'Geminación (っ)', back: 'Tsu pequeño: la siguiente consonante se duplica (gakkou).' },
        { front: 'ん (n) final', back: 'Único carácter que es solo consonante; nasal.' },
        { front: 'Lectura de は y を', back: 'は como partícula = "wa"; を como partícula = "o".' }
    ]
};

const TUTOR_GUIDE = {
    liderazgo: { title: 'Guía rápida: Liderazgo', sections: ['Concepto: capacidad de influir y guiar a otros hacia metas comunes.', 'Estilos: directivo, participativo, orientado a resultados, transformacional.', 'Claves: comunicación clara, escucha activa, feedback y delegación.', 'Práctica: pide feedback a tu equipo y trabaja un plan de mejora.'] },
    comunicacion: { title: 'Guía rápida: Comunicación efectiva', sections: ['Escucha activa: atención plena, preguntas y parafraseo.', 'Asertividad: expresar tu postura con respeto y claridad.', 'Feedback: específico, a tiempo y orientado a comportamientos.', 'No verbal: coherencia entre lo que dices y tu cuerpo y tono.'] },
    ingles: { title: 'Guía rápida: Inglés laboral', sections: ['Saludos y despedidas: Hi, How are you? / See you later.', 'Reuniones: Let\'s get started. / Could you repeat that?', 'Email: I am writing to... / Please find attached.', 'Práctica: leer y escribir un correo corto cada día.'] },
    japones: { title: 'Guía rápida: Japonés básico', sections: ['Saludos: Ohayou (mañana), Konnichiwa (día), Konbanwa (noche).', 'Cortesía: -san tras el nombre (ej. Tanaka-san).', 'Frases útiles: Arigatou (gracias), Sumimasen (perdón).', 'Escritura: hiragana y katakana son los primeros que se aprenden.'] },
    hiragana: { title: 'Guía rápida: Hiragana', sections: ['Vocales: あ い う え お (a, i, u, e, o).', 'Consonantes + vocal: か-こ, さ-そ, た-と, etc.', 'Handakuten (゜) y dakuten (゛) para sonidos como が, ぱ.', 'Tsu pequeño (っ): indica geminación.'] }
};

/**
 * Abre el panel derecho (Canvas) y opcionalmente muestra contenido. Solo se activa cuando hay algo que mostrar (estilo Gemini).
 * @param {string} type - 'quiz' | 'flashcards' | 'guia' | 'courses' | 'plan'
 * @param {string} topic - tema para quiz/flashcards/guia
 * @param {Object} extraData - para 'courses' o 'plan': { courses } o { plan }
 */
/**
 * Baraja las opciones de cada pregunta y actualiza el índice correcto (evita que la correcta sea siempre la A).
 * @param {Array} questions - Array de { q, options, correct, explanation }
 * @returns {Array} Nuevo array de preguntas con opciones reordenadas
 */
function shuffleQuizOptions(questions) {
    if (!questions || !questions.length) return questions;
    return questions.map(function(qu) {
        var opts = qu.options.slice();
        var correctIdx = qu.correct;
        var correctValue = opts[correctIdx];
        for (var i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = opts[i];
            opts[i] = opts[j];
            opts[j] = t;
        }
        var newCorrect = opts.indexOf(correctValue);
        return { q: qu.q, options: opts, correct: newCorrect, explanation: qu.explanation };
    });
}

function setCanvasPanelOpen(open) {
    document.body.classList.toggle('canvas-panel-open', !!open);
}

function getCanvasLoaderHTML() {
    var loaderBody = (typeof getLoaderHTML === 'function')
        ? getLoaderHTML({ text: 'Generando recurso...', wrap: false })
        : '<span class="ubits-loader"></span><p class="ubits-loader-text ubits-body-md-regular">Generando recurso...</p>';
    return '<div class="study-chat-canvas-content study-chat-canvas-content--generating">' +
        '<div class="study-chat-canvas-header">' +
        '<span class="ubits-body-md-bold">Recurso</span>' +
        '<button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>' +
        '</div>' +
        '<div class="study-chat-canvas-body study-chat-canvas-body--generating">' +
        loaderBody +
        '</div>' +
        '</div>';
}

function renderTutorPanel(type, topic, extraData) {
    const panel = chatState.rightPanelId ? document.getElementById(chatState.rightPanelId) : null;
    const placeholder = chatState.placeholderId ? document.getElementById(chatState.placeholderId) : null;
    if (!panel) return;
    panel.classList.add('is-open');
    setCanvasPanelOpen(true);
    hideOpenButtonsInChat();
    const dataTopic = topic || chatState.currentTopic || 'liderazgo';
    const topicKey = dataTopic in TUTOR_QUIZ ? dataTopic : 'liderazgo';
    let html = '';
    if (type === 'quiz') {
        var lastResult = chatState.quizLastResultByTopic && chatState.quizLastResultByTopic[topicKey];
        var quizSetIndex;
        if (lastResult && typeof lastResult.setIndex === 'number') {
            quizSetIndex = lastResult.setIndex % 5;
        } else {
            quizSetIndex = (chatState.shownQuizIndex[topicKey] || 0) % 5;
            chatState.shownQuizIndex[topicKey] = (chatState.shownQuizIndex[topicKey] || 0) + 1;
        }
        var questionSet = (typeof TUTOR_QUIZ_SETS !== 'undefined' && TUTOR_QUIZ_SETS[quizSetIndex]) ? TUTOR_QUIZ_SETS[quizSetIndex] : { liderazgo: TUTOR_QUIZ.liderazgo, comunicacion: TUTOR_QUIZ.comunicacion, ingles: TUTOR_QUIZ.ingles, japones: TUTOR_QUIZ.japones, hiragana: TUTOR_QUIZ.hiragana.slice(0, 10) };
        var questionList = questionSet[topicKey] || questionSet.liderazgo;
        if (!questionList || !questionList.length) questionList = TUTOR_QUIZ.liderazgo;
        const questions = shuffleQuizOptions(questionList);
        const totalQuestions = questions.length;
        const useBars = totalQuestions >= 1 && totalQuestions <= 19;
        const progressBlock = useBars
            ? '<div class="study-chat-quiz-progress-bars">' + Array.from({ length: totalQuestions }, (_, i) => '<span class="study-chat-quiz-progress-bar" data-bar-index="' + i + '"></span>').join('') + '</div>'
            : '<div class="study-chat-quiz-progress-slider" role="presentation"><div class="study-chat-quiz-progress-track"><div class="study-chat-quiz-progress-fill"></div><div class="study-chat-quiz-progress-thumb"></div></div></div>';
        html = `<div class="study-chat-canvas-content study-chat-canvas-quiz" data-topic="${topicKey}" data-quiz-total="${totalQuestions}">
            <div class="study-chat-canvas-header">
                <span class="ubits-body-md-bold">Quiz</span>
                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>
            </div>
            <div class="study-chat-canvas-body">
                <div class="study-chat-quiz-progress">
                    ${progressBlock}
                    <span class="study-chat-quiz-progress-text">1 / ${totalQuestions}</span>
                    <span class="study-chat-quiz-progress-stats">
                        <span class="study-chat-quiz-progress-stat-pill study-chat-quiz-progress-wrong" title="Respuestas incorrectas" aria-label="Respuestas incorrectas"><i class="far fa-times"></i><span class="study-chat-quiz-progress-wrong-n">0</span></span>
                        <span class="study-chat-quiz-progress-stat-pill study-chat-quiz-progress-correct" title="Respuestas correctas" aria-label="Respuestas correctas"><i class="far fa-check"></i><span class="study-chat-quiz-progress-correct-n">0</span></span>
                    </span>
                </div>
                <div class="study-chat-quiz-questions">${questions.map((qu, i) => `
                    <div class="study-chat-quiz-q" data-index="${i}" data-correct-index="${qu.correct}" data-explanation="${(qu.explanation || '').replace(/"/g, '&quot;')}" ${i > 0 ? 'style="display:none;"' : ''}>
                        <p class="ubits-body-md-regular study-chat-quiz-question-text">${i + 1}. ${qu.q}</p>
                        <div class="study-chat-quiz-options">${qu.options.map((opt, j) => {
                    const letter = String.fromCharCode(65 + j);
                    return `<label class="study-chat-quiz-opt" data-option-index="${j}"><div class="study-chat-quiz-opt-row ubits-radio ubits-radio--sm"><input type="radio" name="quiz-${i}" class="ubits-radio__input" value="${j}"><span class="ubits-radio__circle"></span><span class="ubits-radio__label"><span class="study-chat-quiz-opt-letter">${letter}</span> <span class="study-chat-quiz-opt-text">${opt}</span></span></div></label>`;
                }).join('')}</div>
                        <div class="study-chat-quiz-feedback" style="display:none;" role="status" aria-hidden="true"></div>
                    </div>`).join('')}</div>
                <div class="study-chat-quiz-result" style="display:none;" role="region" aria-label="Resultados del quiz"></div>
            </div>
            <div class="study-chat-canvas-footer">
                <div class="study-chat-quiz-actions">
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-quiz-back" style="display:none;"><span>Anterior</span></button>
                    <button class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-next" style="display:none;"><span>Siguiente</span></button>
                    <button class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-submit" style="display:none;"><span>Hecho</span></button>
                </div>
            </div>
        </div>`;
        var resourceKey = 'quiz:' + topicKey;
        var needLoader = !lastResult && !(chatState.canvasResourceGenerated && chatState.canvasResourceGenerated[resourceKey]);
        if (needLoader) {
            panel.innerHTML = getCanvasLoaderHTML();
            panel.classList.add('has-content');
            if (placeholder) placeholder.style.display = 'none';
            setTimeout(function() {
                var contentHtml = html.replace(/class="study-chat-canvas-content study-chat-canvas-quiz"/, 'class="study-chat-canvas-content study-chat-canvas-quiz study-chat-canvas-content--reveal-stagger"');
                panel.innerHTML = contentHtml;
                panel.classList.add('has-content');
                bindCanvasClose(panel);
                bindTutorPanelEvents(panel, 'quiz', topicKey);
                if (!chatState.canvasResourceGenerated) chatState.canvasResourceGenerated = {};
                chatState.canvasResourceGenerated[resourceKey] = true;
            }, 2000);
            return;
        }
    } else if (type === 'flashcards') {
        const fcSetIndex = (extraData && typeof extraData.fcSetIndex === 'number') ? Math.max(0, Math.min(4, extraData.fcSetIndex)) : ((chatState.shownFcSetIndex[topicKey] || 0) % 5);
        chatState.shownFcSetIndex[topicKey] = (chatState.shownFcSetIndex[topicKey] || 0) + 1;
        const sets = [TUTOR_FLASHCARDS, TUTOR_FLASHCARDS_ALT, TUTOR_FLASHCARDS_SET2, TUTOR_FLASHCARDS_SET3, TUTOR_FLASHCARDS_SET4];
        const cards = (sets[fcSetIndex][topicKey] || sets[fcSetIndex].liderazgo).slice();
        const fcSet = String(fcSetIndex);
        const fcTotal = cards.length;
        const fcProgressBarsHtml = Array.from({ length: fcTotal }, (_, i) => '<span class="study-chat-fc-progress-bar" data-bar-index="' + i + '"></span>').join('');
        html = `<div class="study-chat-canvas-content study-chat-canvas-flashcards" data-topic="${topicKey}" data-fc-set="${fcSet}">
            <div class="study-chat-canvas-header">
                <span class="ubits-body-md-bold">Flashcards</span>
                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>
            </div>
            <div class="study-chat-canvas-body">
                <div class="study-chat-fc-main">
                    <div class="study-chat-fc-progress">
                        <div class="study-chat-fc-progress-bars">${fcProgressBarsHtml}</div>
                        <span class="study-chat-fc-progress-text">1 / ${fcTotal}</span>
                    </div>
                    <div class="study-chat-fc-card" data-index="0" role="button" tabindex="0" aria-label="Clic para voltear la tarjeta">
                        <div class="study-chat-fc-card-inner">
                            <div class="study-chat-fc-face study-chat-fc-front"><p class="ubits-body-md-regular">${cards[0].front}</p></div>
                            <div class="study-chat-fc-face study-chat-fc-back"><p class="ubits-body-md-regular">${cards[0].back}</p></div>
                        </div>
                    </div>
                    <p class="study-chat-fc-hint ubits-body-sm-regular">Tocá la tarjeta para girarla y ver la respuesta.</p>
                    <div class="study-chat-fc-deck" data-cards='${JSON.stringify(cards).replace(/'/g, "&#39;")}' style="display:none;"></div>
                </div>
                <div class="study-chat-fc-result" style="display:none;" role="region" aria-label="Seguir aprendiendo"></div>
            </div>
            <div class="study-chat-canvas-footer">
                <div class="study-chat-fc-actions">
                    <button class="ubits-button ubits-button--tertiary ubits-button--sm" id="study-chat-fc-shuffle"><i class="far fa-shuffle"></i><span>Barajar</span></button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-fc-prev" style="display:none;"><i class="far fa-chevron-left"></i><span>Anterior</span></button>
                    <button class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-fc-next"><span>Siguiente</span><i class="far fa-chevron-right"></i></button>
                    <button class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-fc-done" style="display:none;"><span>Hecho</span></button>
                </div>
            </div>
        </div>`;
        var resourceKeyFc = 'flashcards:' + topicKey;
        var needLoaderFc = !(chatState.canvasResourceGenerated && chatState.canvasResourceGenerated[resourceKeyFc]);
        if (needLoaderFc) {
            panel.innerHTML = getCanvasLoaderHTML();
            panel.classList.add('has-content');
            if (placeholder) placeholder.style.display = 'none';
            setTimeout(function() {
                var contentHtml = html.replace(/class="study-chat-canvas-content study-chat-canvas-flashcards"/, 'class="study-chat-canvas-content study-chat-canvas-flashcards study-chat-canvas-content--reveal-stagger"');
                panel.innerHTML = contentHtml;
                panel.classList.add('has-content');
                bindCanvasClose(panel);
                bindTutorPanelEvents(panel, 'flashcards', topicKey);
                if (!chatState.canvasResourceGenerated) chatState.canvasResourceGenerated = {};
                chatState.canvasResourceGenerated[resourceKeyFc] = true;
            }, 2000);
            return;
        }
    } else if (type === 'courses' && extraData && extraData.courses && extraData.courses.length > 0) {
        const containerId = 'tutor-panel-courses-' + Date.now();
        html = `<div class="study-chat-canvas-content study-chat-canvas-courses">
            <div class="study-chat-canvas-header">
                <span class="ubits-body-md-bold">Cursos sugeridos</span>
                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>
            </div>
            <div class="study-chat-canvas-body">
                <div id="${containerId}" class="study-chat-canvas-courses-container"></div>
            </div>
        </div>`;
        panel.innerHTML = html;
        panel.classList.add('has-content');
        renderCoursesInPanel(containerId, extraData.courses);
        bindCanvasClose(panel);
        return;
    } else if (type === 'plan' && extraData && extraData.plan) {
        const plan = extraData.plan;
        const planContainerId = 'tutor-panel-plan-' + Date.now();
        html = `<div class="study-chat-canvas-content study-chat-canvas-plan">
            <div class="study-chat-canvas-header">
                <span class="ubits-body-md-bold">Plan de formación</span>
                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>
            </div>
            <div class="study-chat-canvas-body">
                <div class="study-chat-plan-title">${plan.title}</div>
                <div class="study-chat-plan-details">
                    <div class="study-chat-plan-detail-item"><strong>Cursos:</strong> ${plan.courses.length}</div>
                    <div class="study-chat-plan-detail-item"><strong>Inicio:</strong> ${plan.startDate}</div>
                    <div class="study-chat-plan-detail-item"><strong>Fin:</strong> ${plan.endDate}</div>
                </div>
                <div id="${planContainerId}" class="study-chat-courses-container"></div>
            </div>
        </div>`;
        panel.innerHTML = html;
        panel.classList.add('has-content');
        renderPlanCoursesInPanel(planContainerId, plan.courses);
        bindCanvasClose(panel);
        return;
    } else if (type === 'studyPlan' && topicKey && STUDY_PLAN_TOPICS.indexOf(topicKey) >= 0) {
        var planIndex = (chatState.shownPlanIndex[topicKey] || 0) % getNumPlanVariants(topicKey);
        var sp = getStudyPlanForTopic(topicKey, planIndex);
        if (!sp) return;
        chatState.shownPlanIndex[topicKey] = (chatState.shownPlanIndex[topicKey] || 0) + 1;
        const viewMode = !!sp.created;
        currentStudyPlanState = { plan: sp, topicKey: topicKey || '', planUiState: viewMode ? 'readonly' : 'unsaved' };
        var footerPrimaryLabel = viewMode ? 'Editar plan' : 'Crear plan';
        html = '<div class="study-chat-canvas-content study-chat-canvas-study-plan study-chat-canvas-study-plan-editable" data-topic="' + (topicKey || '') + '">' +
            '<div class="study-chat-canvas-header">' +
            '<span class="ubits-body-md-bold">Plan de estudio</span>' +
            '<button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>' +
            '</div>' +
            '<div class="study-chat-canvas-body">' +
            '<div class="study-chat-study-plan-edit-row" id="study-chat-plan-input-title-wrap"><div id="study-chat-plan-input-title"></div></div>' +
            '<div class="study-chat-study-plan-edit-row study-chat-study-plan-edit-row--dual">' +
            '<div class="study-chat-study-plan-edit-field" id="study-chat-plan-input-priority-wrap"><div id="study-chat-plan-input-priority"></div></div>' +
            '<div class="study-chat-study-plan-edit-field" id="study-chat-plan-input-date-fin-wrap"><div id="study-chat-plan-input-date-fin"></div></div>' +
            '</div>' +
            '<p class="study-chat-study-plan-tasks-label ubits-body-sm-bold">Tareas</p>' +
            '<div class="study-chat-study-plan-tasks-cards" id="study-chat-plan-tasks-container"></div>' +
            '<div class="study-chat-plan-add-task-wrap" id="study-chat-plan-add-task-wrap"><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-plan-add-task"><span>+ Agregar tarea</span></button></div>' +
            '</div>' +
            '<div class="study-chat-canvas-footer">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-plan-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-plan-primary-btn"><span>' + footerPrimaryLabel + '</span></button>' +
            '</div></div>';
        var resourceKeySp = 'studyPlan:' + (topicKey || '');
        var needLoaderSp = !(chatState.canvasResourceGenerated && chatState.canvasResourceGenerated[resourceKeySp]);
        if (needLoaderSp) {
            panel.innerHTML = getCanvasLoaderHTML();
            panel.classList.add('has-content');
            setTimeout(function() {
                var contentHtml = html.replace('study-chat-canvas-content study-chat-canvas-study-plan study-chat-canvas-study-plan-editable', 'study-chat-canvas-content study-chat-canvas-study-plan study-chat-canvas-study-plan-editable study-chat-canvas-content--reveal-stagger');
                panel.innerHTML = contentHtml;
                panel.classList.add('has-content');
                bindCanvasClose(panel);
                var tasksContainer = panel.querySelector('#study-chat-plan-tasks-container');
                var readonly = currentStudyPlanState.planUiState === 'readonly';
                renderStudyPlanTaskCards(tasksContainer, sp, topicKey || '', { readonly: readonly });
                sp._inputInstances = renderStudyPlanUbitsInputs(panel, sp, readonly);
                bindStudyPlanFooter(panel, sp, topicKey || '');
                if (currentStudyPlanState.planUiState === 'unsaved') bindStudyPlanAddTaskButton(panel, sp, topicKey || '');
                applyStudyPlanUiState(panel, sp, topicKey || '');
                if (!chatState.canvasResourceGenerated) chatState.canvasResourceGenerated = {};
                chatState.canvasResourceGenerated[resourceKeySp] = true;
            }, 2000);
            return;
        }
        panel.innerHTML = html;
        panel.classList.add('has-content');
        bindCanvasClose(panel);
        var tasksContainer = panel.querySelector('#study-chat-plan-tasks-container');
        var readonlyInitial = currentStudyPlanState.planUiState === 'readonly';
        renderStudyPlanTaskCards(tasksContainer, sp, topicKey || '', { readonly: readonlyInitial });
        sp._inputInstances = renderStudyPlanUbitsInputs(panel, sp, readonlyInitial);
        bindStudyPlanFooter(panel, sp, topicKey || '');
        if (currentStudyPlanState.planUiState === 'unsaved') bindStudyPlanAddTaskButton(panel, sp, topicKey || '');
        applyStudyPlanUiState(panel, sp, topicKey || '');
        return;
    } else if (type === 'podcast') {
        extraData = extraData || {};
        if (chatState.podcastDefaults) {
            if (!extraData.audioUrl) extraData.audioUrl = chatState.podcastDefaults.audioUrl;
            if (!extraData.transcription || String(extraData.transcription).indexOf('La transcripción se mostrará aquí') === 0) extraData.transcription = chatState.podcastDefaults.transcription;
            if (!extraData.title || String(extraData.title).indexOf('Podcast de ') === 0) extraData.title = chatState.podcastDefaults.title;
        }
        const podTopic = topic || chatState.currentTopic || 'liderazgo';
        const podTitle = (extraData && extraData.title) ? String(extraData.title).replace(/</g, '&lt;').replace(/"/g, '&quot;') : 'Podcast';
        const audioUrl = (extraData && extraData.audioUrl) ? String(extraData.audioUrl) : '';
        const transcriptionRaw = (extraData && extraData.transcription) ? String(extraData.transcription) : 'La transcripción se mostrará aquí cuando el chat genere el podcast.';
        const transcription = transcriptionRaw.replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
        const showPlanPodcast = STUDY_PLAN_TOPICS.indexOf(podTopic) >= 0;
        html = '<div class="study-chat-canvas-content study-chat-canvas-podcast" data-topic="' + (podTopic.replace(/"/g, '&quot;')) + '">' +
            '<div class="study-chat-canvas-header">' +
            '<span class="ubits-body-md-bold">Podcast</span>' +
            '<button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>' +
            '</div>' +
            '<div class="study-chat-canvas-body">' +
            '<div class="study-chat-podcast-player">' +
            '<p class="study-chat-podcast-title ubits-body-md-bold">' + podTitle + '</p>' +
            '<audio class="study-chat-podcast-audio" controls preload="metadata" ' + (audioUrl ? 'src="' + audioUrl.replace(/"/g, '&quot;') + '"' : '') + '></audio>' +
            '</div>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm study-chat-podcast-transcription-btn" id="study-chat-podcast-toggle-transcription" aria-expanded="false">' +
            '<i class="far fa-file-lines"></i><span>Ver transcripción del podcast</span>' +
            '</button>' +
            '<div class="study-chat-podcast-transcription" id="study-chat-podcast-transcription" role="region" aria-label="Transcripción" hidden>' +
            '<div class="study-chat-podcast-transcription-inner ubits-body-sm-regular">' + transcription + '</div>' +
            '</div>' +
            '<h3 class="study-chat-quiz-result-section-title study-chat-podcast-seguir-title">Seguir aprendiendo</h3>' +
            '<div class="study-chat-quiz-result-learn study-chat-podcast-seguir">' +
            '<button type="button" class="study-chat-quiz-result-option" data-action="quiz">' +
            '<span class="study-chat-quiz-result-option-icon"><i class="far fa-circle-question"></i></span>' +
            '<span class="study-chat-quiz-result-option-title">Quiz</span>' +
            '<span class="study-chat-quiz-result-option-desc">Responde preguntas sobre el tema y recibe feedback inmediato.</span></button>' +
            '<button type="button" class="study-chat-quiz-result-option" data-action="flashcards">' +
            '<span class="study-chat-quiz-result-option-icon"><i class="far fa-bring-forward"></i></span>' +
            '<span class="study-chat-quiz-result-option-title">Flashcards</span>' +
            '<span class="study-chat-quiz-result-option-desc">Crea un set de flashcards para repasar y afianzar conceptos.</span></button>' +
            (showPlanPodcast ? '<button type="button" class="study-chat-quiz-result-option study-chat-quiz-result-option-study-plan" data-action="studyPlan">' +
            '<span class="study-chat-quiz-result-option-icon"><i class="far fa-layer-group"></i></span>' +
            '<span class="study-chat-quiz-result-option-title">Plan de estudio</span>' +
            '<span class="study-chat-quiz-result-option-desc">Crea un plan con tareas para ver contenidos UBITS sobre este tema.</span></button>' : '') +
            '</div>' +
            '</div>' +
            '</div>';
        var resourceKeyPod = 'podcast:' + (podTopic || topicKey || 'liderazgo');
        var needLoaderPod = !(chatState.canvasResourceGenerated && chatState.canvasResourceGenerated[resourceKeyPod]);
        if (needLoaderPod) {
            panel.innerHTML = getCanvasLoaderHTML();
            panel.classList.add('has-content');
            if (placeholder) placeholder.style.display = 'none';
            setTimeout(function() {
                var contentHtml = html.replace('class="study-chat-canvas-content study-chat-canvas-podcast"', 'class="study-chat-canvas-content study-chat-canvas-podcast study-chat-canvas-content--reveal-stagger"');
                panel.innerHTML = contentHtml;
                panel.classList.add('has-content');
                bindCanvasClose(panel);
                bindPodcastTranscriptionToggle(panel);
                bindPodcastSeguirAprendiendo(panel);
                if (!chatState.canvasResourceGenerated) chatState.canvasResourceGenerated = {};
                chatState.canvasResourceGenerated[resourceKeyPod] = true;
            }, 2000);
            return;
        }
        panel.innerHTML = html;
        panel.classList.add('has-content');
        if (placeholder) placeholder.style.display = 'none';
        bindCanvasClose(panel);
        bindPodcastTranscriptionToggle(panel);
        bindPodcastSeguirAprendiendo(panel);
        return;
    } else {
        return;
    }
    panel.innerHTML = html;
    panel.classList.add('has-content');
    if (placeholder) placeholder.style.display = 'none';
    const closeBtn = panel.querySelector('.study-chat-canvas-close');
    if (closeBtn) bindCanvasClose(panel);
    bindTutorPanelEvents(panel, type, topicKey);
}

function bindCanvasClose(panel) {
    const btn = panel && panel.querySelector('.study-chat-canvas-close');
    if (btn) btn.addEventListener('click', function() {
        panel.classList.remove('is-open', 'has-content');
        panel.innerHTML = '';
        currentStudyPlanState = null;
        setCanvasPanelOpen(false);
        showOpenButtonsInChat();
    });
}

function bindPodcastTranscriptionToggle(panel) {
    const btn = panel && panel.querySelector('#study-chat-podcast-toggle-transcription');
    const region = panel && panel.querySelector('#study-chat-podcast-transcription');
    if (!btn || !region) return;
    btn.addEventListener('click', function() {
        const isOpen = region.classList.toggle('is-open');
        region.hidden = !isOpen;
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const span = btn.querySelector('span');
        if (span) span.textContent = isOpen ? 'Ocultar transcripción' : 'Ver transcripción del podcast';
    });
}

function bindPodcastSeguirAprendiendo(panel) {
    const content = panel && panel.querySelector('.study-chat-canvas-podcast');
    const topicKey = content && content.getAttribute('data-topic') ? content.getAttribute('data-topic') : (chatState.currentTopic || 'liderazgo');
    const options = panel && panel.querySelectorAll('.study-chat-podcast-seguir .study-chat-quiz-result-option');
    if (!options || !options.length) return;
    options.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            panel.classList.remove('is-open', 'has-content');
            panel.innerHTML = '';
            currentStudyPlanState = null;
            if (action === 'quiz') {
                renderTutorPanel('quiz', topicKey);
                if (typeof addResourceMessage === 'function') addResourceMessage('quiz', topicKey, true);
            } else if (action === 'flashcards') {
                renderTutorPanel('flashcards', topicKey);
                if (typeof addResourceMessage === 'function') addResourceMessage('flashcards', topicKey, false);
            } else if (action === 'studyPlan') {
                var plan = getStudyPlanForTopic(topicKey);
                if (plan) {
                    renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                    if (typeof addResourceMessage === 'function') addResourceMessage('studyPlan', topicKey, false);
                }
            } else if (action === 'podcast') {
                var podLabel = TOPIC_LABELS[topicKey] || topicKey;
                renderTutorPanel('podcast', topicKey, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                if (typeof addResourceMessage === 'function') addResourceMessage('podcast', topicKey, false);
            }
        });
    });
}

function renderStudyPlanTaskCards(container, plan, topicKey, options) {
    if (!container || !plan || !plan.tasks) return;
    var readonly = options && options.readonly;
    container.innerHTML = '';
    var priorityOpts = [
        { value: 'Alta', icon: 'far fa-chevrons-up', color: 'var(--ubits-feedback-accent-error)' },
        { value: 'Media', icon: 'far fa-chevron-up', color: 'var(--ubits-fg-1-medium)' },
        { value: 'Baja', icon: 'far fa-chevron-down', color: 'var(--ubits-feedback-accent-info)' }
    ];
    var basePath = getImageBasePath();
    plan.tasks.forEach(function(task, idx) {
        var card = document.createElement('div');
        card.className = 'study-chat-plan-task-card study-chat-plan-task-card--' + (task.type || 'course');
        card.setAttribute('data-task-index', idx);
        var titleEsc = (task.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        var actionsHtml = '';
        if (!readonly) {
            if (task.type === 'custom') {
                actionsHtml = '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--xs ubits-button--icon-only study-chat-plan-task-delete" data-task-index="' + idx + '" title="Eliminar" aria-label="Eliminar"><i class="far fa-trash"></i></button>';
            } else if (task.type === 'activity') {
                actionsHtml = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only study-chat-plan-task-rehacer" data-task-index="' + idx + '" title="Rehacer (otra opción)" aria-label="Rehacer"><i class="far fa-rotate-right"></i></button>' +
                    '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--xs ubits-button--icon-only study-chat-plan-task-delete" data-task-index="' + idx + '" title="Eliminar" aria-label="Eliminar"><i class="far fa-trash"></i></button>';
            } else {
                actionsHtml = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only study-chat-plan-task-cambiar" data-task-index="' + idx + '" title="Cambiar por otro curso" aria-label="Cambiar"><i class="far fa-arrows-rotate"></i></button>' +
                    '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--xs ubits-button--icon-only study-chat-plan-task-delete" data-task-index="' + idx + '" title="Eliminar" aria-label="Eliminar"><i class="far fa-trash"></i></button>';
            }
        }
        var titleHtml = '<div class="study-chat-plan-task-card-title-wrap">' +
            '<span class="study-chat-plan-task-card-title ubits-body-sm-regular study-chat-plan-task-title-editable" data-task-index="' + idx + '" title="Clic para editar">' + (task.title || '') + '</span>' +
            '<div class="study-chat-plan-task-card-actions">' + actionsHtml + '</div></div>';
        var metaHtml = '';
        if (task.type === 'course' && task.course) {
            var contentType = (task.course.type != null && task.course.type !== '') ? task.course.type : 'Curso';
            var contentLevel = (task.course.level && RECOMMENDED_CONTENT_LEVELS.indexOf(task.course.level) >= 0) ? task.course.level : RECOMMENDED_CONTENT_DEFAULT_LEVEL;
            var contentDuration = (task.course.duration != null && task.course.duration !== '') ? task.course.duration : RECOMMENDED_CONTENT_DEFAULT_DURATION;
            var levelIcon = RECOMMENDED_CONTENT_LEVEL_ICONS[contentLevel] || RECOMMENDED_CONTENT_LEVEL_ICONS['Intermedio'];
            metaHtml = '<div class="study-chat-plan-task-card-meta study-chat-plan-task-card-specs">' +
                '<span class="study-chat-plan-task-card-spec study-chat-plan-task-card-spec--type"><span class="ubits-body-xs-regular">' + (contentType.replace(/</g, '&lt;').replace(/"/g, '&quot;')) + '</span></span>' +
                '<span class="study-chat-plan-task-card-spec"><i class="' + levelIcon + '"></i><span class="ubits-body-xs-regular">' + contentLevel + '</span></span>' +
                '<span class="study-chat-plan-task-card-spec"><i class="far fa-clock"></i><span class="ubits-body-xs-regular">' + contentDuration + '</span></span>' +
                '</div>';
        }
        var thumbHtml = '';
        if (task.type === 'course' && task.course && task.course.imagePath) {
            var imgSrc = basePath + task.course.imagePath;
            var imgAlt = (task.title || task.course.title || 'Curso').replace(/"/g, '&quot;');
            thumbHtml = '<div class="study-chat-plan-task-card-thumb"><img src="' + imgSrc + '" alt="' + imgAlt + '" class="study-chat-plan-task-card-thumb-img"></div>';
        }
        var bodyBlock = titleHtml + (metaHtml ? metaHtml : '');
        var innerContent;
        if (thumbHtml) {
            innerContent = '<div class="study-chat-plan-task-card-row">' + thumbHtml + '<div class="study-chat-plan-task-card-body">' + bodyBlock + '</div></div>';
        } else if (metaHtml) {
            innerContent = '<div class="study-chat-plan-task-card-body">' + bodyBlock + '</div>';
        } else {
            innerContent = titleHtml;
        }
        card.innerHTML = '<div class="study-chat-plan-task-card-inner">' + innerContent + '</div>';
        container.appendChild(card);
    });
    bindStudyPlanTaskCardEvents(container, plan, topicKey, options);
}

function bindStudyPlanTaskCardEvents(container, plan, topicKey, options) {
    if (!container || !plan) return;
    var readonly = options && options.readonly;
    var tasksContainer = container;
    var panel = container.closest('.study-chat-canvas-study-plan-editable');
    var priorityOpts = [
        { value: 'Alta', icon: 'far fa-chevrons-up', color: 'var(--ubits-feedback-accent-error)' },
        { value: 'Media', icon: 'far fa-chevron-up', color: 'var(--ubits-fg-1-medium)' },
        { value: 'Baja', icon: 'far fa-chevron-down', color: 'var(--ubits-feedback-accent-info)' }
    ];
    // Edición inline del nombre: clic en el título → input; blur/Enter → guardar (solo si no readonly)
    if (!readonly) {
    tasksContainer.querySelectorAll('.study-chat-plan-task-title-editable').forEach(function(span) {
        span.addEventListener('click', function() {
            var idx = parseInt(span.getAttribute('data-task-index'), 10);
            var task = plan.tasks[idx];
            if (!task) return;
            var current = task.title || '';
            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'study-chat-plan-task-title-input ubits-body-sm-regular';
            input.value = current;
            input.setAttribute('data-task-index', String(idx));
            span.parentNode.replaceChild(input, span);
            input.focus();
            input.select();
            function saveAndRevert() {
                var newTitle = (input.value || '').trim();
                if (task._isNew) {
                    if (newTitle === '' || newTitle === 'Nueva tarea') {
                        plan.tasks.splice(idx, 1);
                        renderStudyPlanTaskCards(tasksContainer, plan, topicKey, options);
                        return;
                    }
                    task.title = newTitle;
                    delete task._isNew;
                } else if (newTitle !== '') {
                    task.title = newTitle;
                }
                var newSpan = document.createElement('span');
                newSpan.className = 'study-chat-plan-task-card-title ubits-body-sm-regular study-chat-plan-task-title-editable';
                newSpan.setAttribute('data-task-index', String(idx));
                newSpan.title = 'Clic para editar';
                newSpan.textContent = task.title || '';
                input.parentNode.replaceChild(newSpan, input);
                bindStudyPlanTaskCardEvents(tasksContainer, plan, topicKey, options);
            }
            input.addEventListener('blur', saveAndRevert);
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    if (task._isNew) {
                        plan.tasks.splice(idx, 1);
                        renderStudyPlanTaskCards(tasksContainer, plan, topicKey, options);
                        return;
                    }
                    var newSpan = document.createElement('span');
                    newSpan.className = 'study-chat-plan-task-card-title ubits-body-sm-regular study-chat-plan-task-title-editable';
                    newSpan.setAttribute('data-task-index', String(idx));
                    newSpan.title = 'Clic para editar';
                    newSpan.textContent = task.title || '';
                    input.parentNode.replaceChild(newSpan, input);
                    bindStudyPlanTaskCardEvents(tasksContainer, plan, topicKey, options);
                }
            });
        });
    });
    }
    tasksContainer.querySelectorAll('.study-chat-plan-task-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-task-index'), 10);
            plan.tasks.splice(idx, 1);
            renderStudyPlanTaskCards(tasksContainer, plan, topicKey, options);
        });
    });
    tasksContainer.querySelectorAll('.study-chat-plan-task-rehacer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-task-index'), 10);
            var task = plan.tasks[idx];
            if (!task || task.type !== 'activity' || !task.alternatives || !task.alternatives.length) return;
            var usedTitles = new Set();
            plan.tasks.forEach(function(t, i) {
                if (i !== idx && t.type === 'activity' && t.title) usedTitles.add(t.title);
            });
            var currentIdx = task.currentIndex != null ? task.currentIndex : 0;
            var nextTitle = null;
            var nextIndex = currentIdx;
            for (var off = 1; off <= task.alternatives.length; off++) {
                var j = (currentIdx + off) % task.alternatives.length;
                var candidate = task.alternatives[j];
                if (!usedTitles.has(candidate)) {
                    nextTitle = candidate;
                    nextIndex = j;
                    break;
                }
            }
            if (nextTitle == null) return;
            task.currentIndex = nextIndex;
            task.title = nextTitle;
            var titleEl = tasksContainer.querySelector('.study-chat-plan-task-card-title[data-task-index="' + idx + '"]');
            if (titleEl) titleEl.textContent = task.title;
        });
    });
    tasksContainer.querySelectorAll('.study-chat-plan-task-cambiar').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-task-index'), 10);
            var task = plan.tasks[idx];
            if (!task || task.type !== 'course' || !task.course) return;
            var courses = COURSES_BY_TOPIC[topicKey];
            if (!courses || !courses.length) return;
            var usedTitles = new Set();
            plan.tasks.forEach(function(t, i) {
                if (i !== idx && t.type === 'course' && t.course && t.course.title) usedTitles.add(t.course.title);
            });
            var currentIdx = courses.findIndex(function(c) { return c.title === task.course.title; });
            if (currentIdx < 0) currentIdx = 0;
            var nextCourse = null;
            for (var off = 1; off <= courses.length; off++) {
                var i = (currentIdx + off) % courses.length;
                var c = courses[i];
                if (usedTitles.has(c.title)) continue;
                nextCourse = c;
                break;
            }
            if (!nextCourse) return;
            task.course = nextCourse;
            task.title = 'Ver contenido: ' + nextCourse.title;
            renderStudyPlanTaskCards(tasksContainer, plan, topicKey, options);
        });
    });
}

function renderStudyPlanUbitsInputs(panel, sp, isReadonly) {
    if (!panel || !sp || typeof window.createInput !== 'function') return null;
    var inputState = isReadonly ? 'disabled' : 'default';
    var titleInput = window.createInput({
        containerId: 'study-chat-plan-input-title',
        type: 'text',
        label: 'Título',
        placeholder: 'Nombre del plan',
        value: sp.title || '',
        size: 'sm',
        state: inputState,
        onChange: function(v) { sp.title = v; }
    });
    var priorityInput = window.createInput({
        containerId: 'study-chat-plan-input-priority',
        type: 'select',
        label: 'Prioridad',
        placeholder: 'Selecciona prioridad',
        size: 'sm',
        state: inputState,
        value: sp.priority || 'Media',
        selectOptions: [
            { value: 'Alta', text: 'Alta' },
            { value: 'Media', text: 'Media' },
            { value: 'Baja', text: 'Baja' }
        ],
        onChange: function(v) { sp.priority = v; }
    });
    var dateInput = window.createInput({
        containerId: 'study-chat-plan-input-date-fin',
        type: 'calendar',
        label: 'Fin',
        placeholder: 'Selecciona una fecha...',
        value: studyPlanDateToCalendarValue(sp.endDateValue),
        size: 'sm',
        state: inputState,
        onChange: function(dateStr) {
            var iso = studyPlanDateFromCalendarValue(dateStr);
            sp.endDateValue = iso;
            if (iso) {
                var d = new Date(iso + 'T12:00:00');
                sp.endDate = formatStudyPlanDate(d);
            }
        }
    });
    return { title: titleInput, priority: priorityInput, date: dateInput };
}

function bindStudyPlanPriorityMenu(panel, sp, priorityOpts) {
    var trigger = panel.querySelector('#study-chat-plan-priority-trigger');
    var menu = panel.querySelector('#study-chat-plan-priority-menu');
    var triggerText = panel.querySelector('.study-chat-plan-priority-trigger-text');
    if (!trigger || !menu || !triggerText) return;
    function closeMenu() {
        menu.style.display = 'none';
        trigger.setAttribute('aria-expanded', 'false');
    }
    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = menu.style.display === 'block';
        menu.style.display = isOpen ? 'none' : 'block';
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
    menu.querySelectorAll('.study-chat-plan-priority-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var val = btn.getAttribute('data-value');
            sp.priority = val;
            triggerText.textContent = val;
            closeMenu();
        });
    });
    document.addEventListener('click', function(e) {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });
}

function bindStudyPlanAddTaskButton(panel, sp, topicKey) {
    var addBtn = panel.querySelector('#study-chat-plan-add-task');
    var addWrap = panel.querySelector('#study-chat-plan-add-task-wrap');
    var tasksContainer = panel.querySelector('#study-chat-plan-tasks-container');
    if (!addBtn || !tasksContainer || !sp || !sp.tasks) return;
    addBtn.addEventListener('click', function() {
        sp.tasks.push({ type: 'custom', title: 'Nueva tarea', _isNew: true });
        renderStudyPlanTaskCards(tasksContainer, sp, topicKey);
        var lastIdx = sp.tasks.length - 1;
        setTimeout(function() {
            var lastTitle = tasksContainer.querySelector('.study-chat-plan-task-title-editable[data-task-index="' + lastIdx + '"]');
            if (lastTitle) lastTitle.click();
            if (addWrap) addWrap.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 0);
    });
}

function applyStudyPlanUiState(panel, sp, topicKey) {
    if (!currentStudyPlanState || !panel || !sp) return;
    var state = currentStudyPlanState.planUiState;
    var addWrap = panel.querySelector('#study-chat-plan-add-task-wrap');
    var primaryBtn = panel.querySelector('#study-chat-plan-primary-btn');
    var primaryLabel = primaryBtn && primaryBtn.querySelector('span');
    var tasksContainer = panel.querySelector('#study-chat-plan-tasks-container');
    var inst = sp._inputInstances;

    var planInputContainers = '#study-chat-plan-input-title, #study-chat-plan-input-priority, #study-chat-plan-input-date-fin';
    var planInputs = panel.querySelectorAll(planInputContainers + ' .ubits-input');

    function setPlanInputsDisabled(disabled) {
        planInputs.forEach(function(el) {
            if (disabled) {
                el.classList.add('ubits-input--disabled');
                el.disabled = true;
            } else {
                el.classList.remove('ubits-input--disabled');
                el.disabled = false;
            }
        });
    }

    if (state === 'readonly') {
        if (addWrap) addWrap.style.display = 'none';
        if (primaryLabel) primaryLabel.textContent = 'Editar plan';
        if (inst) {
            [inst.title, inst.priority, inst.date].forEach(function(inputApi) {
                if (inputApi && (typeof inputApi.disable === 'function')) inputApi.disable();
                else if (inputApi && (typeof inputApi.setState === 'function')) inputApi.setState('disabled');
            });
        }
        setPlanInputsDisabled(true);
        if (tasksContainer) {
            renderStudyPlanTaskCards(tasksContainer, sp, topicKey, { readonly: true });
        }
    } else if (state === 'editing') {
        if (addWrap) addWrap.style.display = '';
        if (primaryLabel) primaryLabel.textContent = 'Guardar plan';
        if (inst) {
            [inst.title, inst.priority, inst.date].forEach(function(inputApi) {
                if (inputApi && (typeof inputApi.enable === 'function')) inputApi.enable();
                else if (inputApi && (typeof inputApi.setState === 'function')) inputApi.setState('default');
            });
        }
        setPlanInputsDisabled(false);
        if (tasksContainer) {
            renderStudyPlanTaskCards(tasksContainer, sp, topicKey, { readonly: false });
        }
    } else {
        if (addWrap) addWrap.style.display = '';
        if (primaryLabel) primaryLabel.textContent = 'Crear plan';
        setPlanInputsDisabled(false);
    }
}

function bindStudyPlanFooter(panel, sp, topicKey) {
    var cancelBtn = panel.querySelector('#study-chat-plan-cancel');
    var primaryBtn = panel.querySelector('#study-chat-plan-primary-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', function() {
        panel.classList.remove('is-open', 'has-content');
        panel.innerHTML = '';
        currentStudyPlanState = null;
        setCanvasPanelOpen(false);
        showOpenButtonsInChat();
    });
    if (primaryBtn) primaryBtn.addEventListener('click', function() {
        var state = currentStudyPlanState && currentStudyPlanState.planUiState;
        if (state === 'unsaved') {
            sp.created = true;
            if (typeof createdStudyPlansByTopic !== 'undefined') createdStudyPlansByTopic[topicKey] = sp;
            currentStudyPlanState.planUiState = 'readonly';
            applyStudyPlanUiState(panel, sp, topicKey);
        } else if (state === 'readonly') {
            currentStudyPlanState.planUiState = 'editing';
            applyStudyPlanUiState(panel, sp, topicKey);
        } else if (state === 'editing') {
            if (typeof showToast === 'function') showToast('success', 'Cambios guardados.');
            currentStudyPlanState.planUiState = 'readonly';
            applyStudyPlanUiState(panel, sp, topicKey);
        }
    });
}

function renderCoursesInPanel(containerId, courses) {
    const container = document.getElementById(containerId);
    if (!container || !courses.length || typeof loadCardContentCompact !== 'function') return;
    const basePath = getImageBasePath();
    const cardsData = courses.map(function(c) { return getRecommendedContentCardData(c, basePath); });
    loadCardContentCompact(containerId, cardsData);
}

function renderPlanCoursesInPanel(containerId, courses) {
    renderCoursesInPanel(containerId, courses);
}

function bindTutorPanelEvents(panel, type, topicKey) {
    if (!panel) return;
    if (type === 'quiz') {
        const questions = panel.querySelectorAll('.study-chat-quiz-q');
        const progressWrap = panel.querySelector('.study-chat-quiz-progress');
        const progressBars = panel.querySelectorAll('.study-chat-quiz-progress-bar');
        const progressSliderFill = panel.querySelector('.study-chat-quiz-progress-fill');
        const progressSliderThumb = panel.querySelector('.study-chat-quiz-progress-thumb');
        const progressText = panel.querySelector('.study-chat-quiz-progress-text');
        const progressWrongN = panel.querySelector('.study-chat-quiz-progress-wrong-n');
        const progressCorrectN = panel.querySelector('.study-chat-quiz-progress-correct-n');
        const backBtn = panel.querySelector('#study-chat-quiz-back');
        const nextBtn = panel.querySelector('#study-chat-quiz-next');
        const submitBtn = panel.querySelector('#study-chat-quiz-submit');
        const resultDiv = panel.querySelector('.study-chat-quiz-result');
        const questionsContainer = panel.querySelector('.study-chat-quiz-questions');
        const actionsDiv = panel.querySelector('.study-chat-quiz-actions');
        const quizFooterOriginalHtml = actionsDiv ? actionsDiv.innerHTML : '';
        let currentIdx = 0;
        const total = questions.length;
        const answers = [];
        const answered = [];
        let correctCount = 0;
        let wrongCount = 0;
        function updateProgressBar() {
            if (!progressText) return;
            if (progressBars.length) {
                progressBars.forEach(function(bar, i) {
                    bar.classList.toggle('study-chat-quiz-progress-bar--filled', i <= currentIdx);
                });
            } else if (progressSliderFill && progressSliderThumb && total > 0) {
                var pct = total === 1 ? 100 : ((currentIdx + 1) / total) * 100;
                progressSliderFill.style.width = pct + '%';
                progressSliderThumb.style.left = pct + '%';
            }
            progressText.textContent = (currentIdx + 1) + ' / ' + total;
            if (progressWrongN) progressWrongN.textContent = wrongCount;
            if (progressCorrectN) progressCorrectN.textContent = correctCount;
        }
        function showImmediateFeedback(qEl, selectedValue, correctIdx, explanation) {
            const opts = qEl.querySelectorAll('.study-chat-quiz-opt');
            var explanationEsc = (explanation || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
            opts.forEach(function(label, j) {
                var existing = label.querySelector('.study-chat-quiz-opt-inline-feedback');
                if (existing) existing.remove();
                label.classList.remove('study-chat-quiz-opt--correct', 'study-chat-quiz-opt--wrong');
                var input = label.querySelector('input');
                if (input) input.disabled = true;
                if (j === correctIdx) {
                    label.classList.add('study-chat-quiz-opt--correct');
                    var correctHtml = '<div class="study-chat-quiz-opt-inline-feedback study-chat-quiz-opt-inline-feedback--correct">' +
                        '<span class="study-chat-quiz-opt-inline-feedback-status"><i class="far fa-check"></i> Respuesta correcta</span>' +
                        (explanationEsc ? '<p class="study-chat-quiz-opt-inline-feedback-explanation">' + explanationEsc + '</p>' : '') +
                        '</div>';
                    label.insertAdjacentHTML('beforeend', correctHtml);
                } else if (j === selectedValue && j !== correctIdx) {
                    label.classList.add('study-chat-quiz-opt--wrong');
                    var wrongHtml = '<div class="study-chat-quiz-opt-inline-feedback study-chat-quiz-opt-inline-feedback--wrong">' +
                        '<span class="study-chat-quiz-opt-inline-feedback-status"><i class="far fa-times"></i> Respuesta incorrecta</span>' +
                        (explanationEsc ? '<p class="study-chat-quiz-opt-inline-feedback-explanation">' + explanationEsc + '</p>' : '') +
                        '</div>';
                    label.insertAdjacentHTML('beforeend', wrongHtml);
                }
            });
            var isCorrect = selectedValue === correctIdx;
            if (isCorrect) correctCount++; else wrongCount++;
        }
        function showResultsScreen() {
            const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const skipped = total - correctCount - wrongCount;
            var setIndexUsed = ((chatState.shownQuizIndex[topicKey] || 1) - 1) % 5;
            if (!chatState.quizLastResultByTopic) chatState.quizLastResultByTopic = {};
            chatState.quizLastResultByTopic[topicKey] = {
                setIndex: setIndexUsed,
                correctCount: correctCount,
                wrongCount: wrongCount,
                total: total,
                accuracy: accuracy,
                userAnswers: answers.slice()
            };
            resultDiv.innerHTML = `
                <div class="study-chat-quiz-result-screen">
                    <h2 class="study-chat-quiz-result-title">Quiz completado</h2>
                    <div class="study-chat-quiz-result-cards">
                        <div class="study-chat-quiz-result-card">
                            <span class="study-chat-quiz-result-card-label">Puntuación</span>
                            <span class="study-chat-quiz-result-card-value">${correctCount}/${total}</span>
                        </div>
                        <div class="study-chat-quiz-result-card">
                            <span class="study-chat-quiz-result-card-label">Precisión</span>
                            <span class="study-chat-quiz-result-card-value">${accuracy}%</span>
                        </div>
                        <div class="study-chat-quiz-result-card study-chat-quiz-result-card--breakdown">
                            <div class="study-chat-quiz-result-breakdown">
                                <div class="study-chat-quiz-result-row"><span>Correctas</span><span>${correctCount}</span></div>
                                <div class="study-chat-quiz-result-row"><span>Incorrectas</span><span>${wrongCount}</span></div>
                                <div class="study-chat-quiz-result-row"><span>Omitidas</span><span>${skipped}</span></div>
                            </div>
                        </div>
                    </div>
                    <h3 class="study-chat-quiz-result-section-title">Seguir aprendiendo</h3>
                    <div class="study-chat-quiz-result-learn">
                        <button type="button" class="study-chat-quiz-result-option" data-action="flashcards">
                            <span class="study-chat-quiz-result-option-icon"><i class="far fa-bring-forward"></i></span>
                            <span class="study-chat-quiz-result-option-title">Flashcards</span>
                            <span class="study-chat-quiz-result-option-desc">Crea un set de flashcards con el material del quiz. Ideal para repasar y afianzar conceptos.</span>
                    </button>
                        <button type="button" class="study-chat-quiz-result-option study-chat-quiz-result-option-study-plan" data-action="studyPlan" style="display:${STUDY_PLAN_TOPICS.indexOf(topicKey) >= 0 ? 'flex' : 'none'};">
                            <span class="study-chat-quiz-result-option-icon"><i class="far fa-layer-group"></i></span>
                            <span class="study-chat-quiz-result-option-title">Plan de estudio</span>
                            <span class="study-chat-quiz-result-option-desc">Crea un plan con tareas para ver contenidos UBITS sobre este tema.</span>
                    </button>
                        <button type="button" class="study-chat-quiz-result-option" data-action="podcast">
                            <span class="study-chat-quiz-result-option-icon"><i class="far fa-podcast"></i></span>
                            <span class="study-chat-quiz-result-option-title">Podcast</span>
                            <span class="study-chat-quiz-result-option-desc">Escucha un podcast sobre este tema para aprender mientras haces otras cosas.</span>
                    </button>
                </div>
                </div>`;
            questionsContainer.style.display = 'none';
            if (progressWrap) progressWrap.style.display = 'none';
            actionsDiv.innerHTML = '<div class="study-chat-quiz-result-actions">' +
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="study-chat-quiz-reset"><span>Resetear quiz</span></button>' +
                '<div class="study-chat-quiz-result-actions-right">' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-quiz-review"><span>Revisar quiz</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-more"><span>Más preguntas</span></button>' +
                '</div></div>';
            actionsDiv.style.display = 'flex';
            resultDiv.style.display = 'block';
            panel.querySelector('#study-chat-quiz-review').addEventListener('click', function() {
                resultDiv.style.display = 'none';
                if (progressWrap) progressWrap.style.display = 'flex';
                questionsContainer.style.display = 'block';
                actionsDiv.innerHTML = '<div class="study-chat-quiz-result-actions">' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-quiz-review-prev"><span>Anterior</span></button>' +
                    '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-review-next"><span>Siguiente</span></button>' +
                    '</div>';
                currentIdx = 0;
                updateVisibility();
                function goBackToResults() {
                    questionsContainer.style.display = 'none';
                    if (progressWrap) progressWrap.style.display = 'none';
                    actionsDiv.innerHTML = '<div class="study-chat-quiz-result-actions">' +
                        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="study-chat-quiz-reset"><span>Resetear quiz</span></button>' +
                        '<div class="study-chat-quiz-result-actions-right">' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-quiz-review"><span>Revisar quiz</span></button>' +
                        '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-more"><span>Más preguntas</span></button>' +
                        '</div></div>';
                    resultDiv.style.display = 'block';
                    bindQuizResultButtons();
                }
                function updateReviewNav() {
                    var prev = panel.querySelector('#study-chat-quiz-review-prev');
                    var next = panel.querySelector('#study-chat-quiz-review-next');
                    if (prev) prev.style.display = currentIdx > 0 ? 'inline-flex' : 'none';
                    if (next) {
                        next.style.display = 'inline-flex';
                        var nextLabel = next.querySelector('span');
                        if (nextLabel) nextLabel.textContent = currentIdx < total - 1 ? 'Siguiente' : 'Volver a resultados';
                    }
                }
                updateReviewNav();
                panel.querySelector('#study-chat-quiz-review-prev').addEventListener('click', function() { currentIdx--; updateVisibility(); updateReviewNav(); });
                panel.querySelector('#study-chat-quiz-review-next').addEventListener('click', function() {
                    if (currentIdx < total - 1) { currentIdx++; updateVisibility(); updateReviewNav(); } else { goBackToResults(); }
                });
            });
            function bindQuizResultButtons() {
                panel.querySelector('#study-chat-quiz-more').addEventListener('click', function() {
                    if (chatState.quizLastResultByTopic) delete chatState.quizLastResultByTopic[topicKey];
                    renderTutorPanel('quiz', topicKey);
                    if (typeof addResourceMessage === 'function') addResourceMessage('quiz', topicKey, true);
                });
                panel.querySelector('#study-chat-quiz-review').addEventListener('click', function() {
                    resultDiv.style.display = 'none';
                    if (progressWrap) progressWrap.style.display = 'flex';
                    questionsContainer.style.display = 'block';
                    actionsDiv.innerHTML = '<div class="study-chat-quiz-result-actions">' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-quiz-review-prev"><span>Anterior</span></button>' +
                        '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-review-next"><span>Siguiente</span></button>' +
                        '</div>';
                    currentIdx = 0;
                    updateVisibility();
                    function goBackToResults() {
                        questionsContainer.style.display = 'none';
                        if (progressWrap) progressWrap.style.display = 'none';
                        actionsDiv.innerHTML = '<div class="study-chat-quiz-result-actions">' +
                            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="study-chat-quiz-reset"><span>Resetear quiz</span></button>' +
                            '<div class="study-chat-quiz-result-actions-right">' +
                            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-quiz-review"><span>Revisar quiz</span></button>' +
                            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-more"><span>Más preguntas</span></button>' +
                            '</div></div>';
                        resultDiv.style.display = 'block';
                        bindQuizResultButtons();
                    }
                    function updateReviewNav() {
                        var prev = panel.querySelector('#study-chat-quiz-review-prev');
                        var next = panel.querySelector('#study-chat-quiz-review-next');
                        if (prev) prev.style.display = currentIdx > 0 ? 'inline-flex' : 'none';
                        if (next) {
                            next.style.display = 'inline-flex';
                            var nextLabel = next.querySelector('span');
                            if (nextLabel) nextLabel.textContent = currentIdx < total - 1 ? 'Siguiente' : 'Volver a resultados';
                        }
                    }
                    updateReviewNav();
                    panel.querySelector('#study-chat-quiz-review-prev').addEventListener('click', function() { currentIdx--; updateVisibility(); updateReviewNav(); });
                    panel.querySelector('#study-chat-quiz-review-next').addEventListener('click', function() {
                        if (currentIdx < total - 1) { currentIdx++; updateVisibility(); updateReviewNav(); } else { goBackToResults(); }
                    });
                });
                panel.querySelector('#study-chat-quiz-reset').addEventListener('click', function() {
                    if (chatState.quizLastResultByTopic) delete chatState.quizLastResultByTopic[topicKey];
                    chatState.shownQuizIndex[topicKey] = 0;
                    if (chatState.canvasResourceGenerated) delete chatState.canvasResourceGenerated['quiz:' + topicKey];
                    renderTutorPanel('quiz', topicKey);
                });
            }
            bindQuizResultButtons();
            panel.querySelectorAll('.study-chat-quiz-result-option').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    panel.classList.remove('is-open', 'has-content');
                    panel.innerHTML = '';
                    if (action === 'flashcards') {
                        renderTutorPanel('flashcards', topicKey);
                        if (typeof addResourceMessage === 'function') addResourceMessage('flashcards', topicKey, false);
                    } else if (action === 'studyPlan') {
                        var plan = getStudyPlanForTopic(topicKey);
                        if (plan) {
                            renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                            if (typeof addResourceMessage === 'function') addResourceMessage('studyPlan', topicKey, false);
                        }
                    } else if (action === 'podcast') {
                        var podLabel = TOPIC_LABELS[topicKey] || topicKey;
                        renderTutorPanel('podcast', topicKey, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                        if (typeof addResourceMessage === 'function') addResourceMessage('podcast', topicKey, false);
                    }
                });
            });
        }
        function updateVisibility() {
            questions.forEach((q, i) => { q.style.display = i === currentIdx ? 'block' : 'none'; });
            if (backBtn) backBtn.style.display = currentIdx > 0 ? 'inline-flex' : 'none';
            if (nextBtn) nextBtn.style.display = currentIdx < total - 1 ? 'inline-flex' : 'none';
            if (submitBtn) submitBtn.style.display = currentIdx === total - 1 ? 'inline-flex' : 'none';
            updateProgressBar();
        }
        questions.forEach((qEl, i) => {
            const inputs = qEl.querySelectorAll('input[type="radio"]');
            inputs.forEach((input) => {
                input.addEventListener('change', function() {
                    const val = parseInt(this.value, 10);
                    answers[i] = val;
                    answered[i] = true;
                    const correctIdx = parseInt(qEl.getAttribute('data-correct-index'), 10);
                    const explanation = (qEl.getAttribute('data-explanation') || '').replace(/&quot;/g, '"');
                    showImmediateFeedback(qEl, val, correctIdx, explanation);
                    updateVisibility();
                });
            });
        });
        if (backBtn) backBtn.addEventListener('click', function() { currentIdx--; updateVisibility(); });
        if (nextBtn) nextBtn.addEventListener('click', function() { currentIdx++; updateVisibility(); });
        if (submitBtn) submitBtn.addEventListener('click', showResultsScreen);
        updateVisibility();
        var lastResult = chatState.quizLastResultByTopic && chatState.quizLastResultByTopic[topicKey];
        if (lastResult && lastResult.userAnswers && lastResult.userAnswers.length > 0) {
            correctCount = 0;
            wrongCount = 0;
            lastResult.userAnswers.forEach(function(sel, i) {
                if (sel === undefined) return;
                var qEl = questions[i];
                if (!qEl) return;
                var correctIdx = parseInt(qEl.getAttribute('data-correct-index'), 10);
                var explanation = (qEl.getAttribute('data-explanation') || '').replace(/&quot;/g, '"');
                qEl.querySelectorAll('input[type="radio"]').forEach(function(inp) {
                    inp.checked = parseInt(inp.value, 10) === sel;
                    inp.disabled = true;
                });
                answers[i] = sel;
                answered[i] = true;
                showImmediateFeedback(qEl, sel, correctIdx, explanation);
            });
            updateProgressBar();
            showResultsScreen();
        }
    } else if (type === 'flashcards') {
        const deck = panel.querySelector('.study-chat-fc-deck');
        const cards = JSON.parse(deck.getAttribute('data-cards').replace(/&#39;/g, "'"));
        let fcIndex = 0;
        const cardEl = panel.querySelector('.study-chat-fc-card');
        const cardInner = panel.querySelector('.study-chat-fc-card-inner');
        const frontEl = panel.querySelector('.study-chat-fc-front');
        const backEl = panel.querySelector('.study-chat-fc-back');
        const progressBars = panel.querySelectorAll('.study-chat-fc-progress-bar');
        const progressText = panel.querySelector('.study-chat-fc-progress-text');
        const prevBtn = panel.querySelector('#study-chat-fc-prev');
        const nextBtn = panel.querySelector('#study-chat-fc-next');
        const doneBtn = panel.querySelector('#study-chat-fc-done');
        function updateFcProgress() {
            if (progressBars.length) progressBars.forEach((bar, i) => bar.classList.toggle('study-chat-fc-progress-bar--filled', i <= fcIndex));
            if (progressText) progressText.textContent = (fcIndex + 1) + ' / ' + cards.length;
            var isFirst = fcIndex === 0;
            var isLast = fcIndex === cards.length - 1;
            if (prevBtn) prevBtn.style.display = isFirst ? 'none' : '';
            if (nextBtn) nextBtn.style.display = isLast ? 'none' : '';
            if (doneBtn) doneBtn.style.display = isLast ? '' : 'none';
        }
        function showCard() {
            frontEl.innerHTML = '<p class="ubits-body-md-regular">' + cards[fcIndex].front + '</p>';
            backEl.innerHTML = '<p class="ubits-body-md-regular">' + cards[fcIndex].back + '</p>';
            cardEl.classList.remove('study-chat-fc-card--flipped');
            cardEl.setAttribute('data-index', fcIndex);
            updateFcProgress();
        }
        function flipCard() {
            cardEl.classList.toggle('study-chat-fc-card--flipped');
        }
        if (cardEl) {
            cardEl.addEventListener('click', function(e) {
                if (e.target.closest('button') || e.target.closest('.study-chat-fc-actions')) return;
                flipCard();
            });
            cardEl.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
            });
        }
        if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); fcIndex = (fcIndex - 1 + cards.length) % cards.length; showCard(); });
        if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); fcIndex = Math.min(fcIndex + 1, cards.length - 1); showCard(); });
        const fcMain = panel.querySelector('.study-chat-fc-main');
        const resultDiv = panel.querySelector('.study-chat-fc-result');
        const actionsDiv = panel.querySelector('.study-chat-fc-actions');
        const fcFooterOriginalHtml = actionsDiv ? actionsDiv.innerHTML : '';
        const showFcResultScreen = function() {
            var content = panel.querySelector('.study-chat-canvas-content');
            var showPlan = STUDY_PLAN_TOPICS.indexOf(topicKey) >= 0;
            resultDiv.innerHTML = '<div class="study-chat-quiz-result-screen">' +
                '<h3 class="study-chat-quiz-result-section-title">Seguir aprendiendo</h3>' +
                '<div class="study-chat-quiz-result-learn">' +
                '<button type="button" class="study-chat-quiz-result-option" data-action="quiz">' +
                '<span class="study-chat-quiz-result-option-icon"><i class="far fa-circle-question"></i></span>' +
                '<span class="study-chat-quiz-result-option-title">Quiz</span>' +
                '<span class="study-chat-quiz-result-option-desc">Responde preguntas sobre el tema y recibe feedback inmediato para afianzar conceptos.</span></button>' +
                (showPlan ? '<button type="button" class="study-chat-quiz-result-option study-chat-quiz-result-option-study-plan" data-action="studyPlan">' +
                '<span class="study-chat-quiz-result-option-icon"><i class="far fa-layer-group"></i></span>' +
                '<span class="study-chat-quiz-result-option-title">Plan de estudio</span>' +
                '<span class="study-chat-quiz-result-option-desc">Crea un plan con tareas para ver contenidos UBITS sobre este tema.</span></button>' : '') +
                '<button type="button" class="study-chat-quiz-result-option" data-action="podcast">' +
                '<span class="study-chat-quiz-result-option-icon"><i class="far fa-podcast"></i></span>' +
                '<span class="study-chat-quiz-result-option-title">Podcast</span>' +
                '<span class="study-chat-quiz-result-option-desc">Escucha un podcast sobre este tema para aprender mientras haces otras cosas.</span></button>' +
                '</div></div>';
            if (fcMain) fcMain.style.display = 'none';
            if (actionsDiv) {
                actionsDiv.innerHTML = '<div class="study-chat-quiz-result-actions"><button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="study-chat-fc-review"><span>Revisar flashcards</span></button><button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-fc-more"><span>Más flashcards</span></button></div>';
                actionsDiv.style.display = 'flex';
            }
            resultDiv.style.display = 'block';
            panel.querySelector('#study-chat-fc-review').addEventListener('click', function() {
                resultDiv.style.display = 'none';
                resultDiv.innerHTML = '';
                if (fcMain) fcMain.style.display = '';
                if (actionsDiv) {
                    actionsDiv.innerHTML = fcFooterOriginalHtml;
                    actionsDiv.style.display = 'flex';
                    const prevBtnNew = panel.querySelector('#study-chat-fc-prev');
                    const nextBtnNew = panel.querySelector('#study-chat-fc-next');
                    const doneBtnNew = panel.querySelector('#study-chat-fc-done');
                    const shuffleBtnNew = panel.querySelector('#study-chat-fc-shuffle');
                    if (prevBtnNew) prevBtnNew.addEventListener('click', function(e) { e.stopPropagation(); fcIndex = (fcIndex - 1 + cards.length) % cards.length; showCard(); });
                    if (nextBtnNew) nextBtnNew.addEventListener('click', function(e) { e.stopPropagation(); fcIndex = Math.min(fcIndex + 1, cards.length - 1); showCard(); });
                    if (doneBtnNew) doneBtnNew.addEventListener('click', function(e) { e.stopPropagation(); showFcResultScreen(); });
                    if (shuffleBtnNew) shuffleBtnNew.addEventListener('click', function(e) {
                        e.stopPropagation();
                        for (let i = cards.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [cards[i], cards[j]] = [cards[j], cards[i]];
                        }
                        fcIndex = 0;
                        deck.setAttribute('data-cards', JSON.stringify(cards).replace(/'/g, '&#39;'));
                        showCard();
                    });
                }
                fcIndex = 0;
                showCard();
            });
            panel.querySelector('#study-chat-fc-more').addEventListener('click', function() {
                var currentSet = parseInt(content.getAttribute('data-fc-set') || '0', 10);
                var nextSet = (currentSet + 1) % 3;
                renderTutorPanel('flashcards', topicKey, { fcSetIndex: nextSet });
                if (typeof addResourceMessage === 'function') addResourceMessage('flashcards', topicKey, true);
            });
            panel.querySelectorAll('.study-chat-fc-result .study-chat-quiz-result-option').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var action = this.getAttribute('data-action');
                    panel.classList.remove('is-open', 'has-content');
                    panel.innerHTML = '';
                    if (action === 'quiz') {
                        renderTutorPanel('quiz', topicKey);
                        if (typeof addResourceMessage === 'function') addResourceMessage('quiz', topicKey, false);
                    } else if (action === 'studyPlan') {
                        var plan = getStudyPlanForTopic(topicKey);
                        if (plan) {
                            renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                            if (typeof addResourceMessage === 'function') addResourceMessage('studyPlan', topicKey, false);
                        }
                    } else if (action === 'podcast') {
                        var podLabel = TOPIC_LABELS[topicKey] || topicKey;
                        renderTutorPanel('podcast', topicKey, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                        if (typeof addResourceMessage === 'function') addResourceMessage('podcast', topicKey, false);
                    }
                });
            });
        };
        if (doneBtn) doneBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showFcResultScreen();
        });
        panel.querySelector('#study-chat-fc-shuffle').addEventListener('click', function(e) {
            e.stopPropagation();
            for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
            fcIndex = 0; showCard();
        });
        showCard();
    }
}

// Estado del chat para gestionar contexto
let chatState = {
    waitingForTopic: false,
    waitingForPlanTopic: false,
    waitingForPlanAcceptance: false,
    currentTopic: null,
    suggestedCourses: [],
    currentPlan: null,
    lastAIMessageElement: null,
    lastAIMessageText: null,
    lastRegenerateFunction: null,
    pendingCoursesContainer: null,
    pendingPlanContainer: null,
    // Modo Tutor IA: panel derecho y usuario
    userFirstName: 'Usuario',
    competencies: [],
    competencyTopics: {}, // { 'Liderazgo': 'liderazgo', 'Comunicación': 'comunicacion', 'Inglés': 'ingles' }
    rightPanelId: null,
    placeholderId: null,
    podcastDefaults: null, // { title, audioUrl, transcription } para modo-estudio-ia cuando se abre podcast sin audio generado
    waitingForMaterialChoice: false, // true cuando IA ofreció quiz/flashcards/guía
    waitingForTopicForResource: null, // 'quiz' | 'flashcards' | 'studyPlan' | 'podcast' cuando el usuario pidió recurso sin tema
    // Índices de recurso mostrado por tema (para no repetir: siguiente quiz, siguiente set de flashcards, siguiente plan)
    shownQuizIndex: {},   // por tema: cuántas veces se ha mostrado quiz (se usa shuffle cada vez)
    quizLastResultByTopic: {}, // por tema: último resultado completado { setIndex, correctCount, wrongCount, total, accuracy, userAnswers } para reabrir en resultados
    canvasResourceGenerated: {}, // 'quiz:liderazgo', 'flashcards:liderazgo', etc. Si está generado no se muestra loader al reabrir
    shownFcSetIndex: {},  // por tema: 0, 1, 2 para TUTOR_FLASHCARDS, _ALT, _SET2
    shownPlanIndex: {},   // por tema: variante del plan (diferentes cortes de cursos)
    // Historial y nuevo chat (Bloque 2)
    chats: [],
    currentChat: { id: null, title: '', createdAt: 0, messages: [] }
};

/**
 * Añade un mensaje al chat actual en memoria (para historial).
 * Si es el primer mensaje de usuario, asigna title, createdAt e id del chat.
 * @param {string|Object} typeOrMsg - Tipo ('user'|'ai') o objeto mensaje { type, text?, resource?, quickReplies?, topic?, waitingForTopicForResource? }
 * @param {string} [text] - Texto (si typeOrMsg es tipo)
 */
function pushCurrentChatMessage(typeOrMsg, text) {
    if (!chatState.currentChat.messages) chatState.currentChat.messages = [];
    var msg;
    if (typeof typeOrMsg === 'object' && typeOrMsg !== null && typeof typeOrMsg.type === 'string') {
        msg = typeOrMsg;
    } else {
        msg = { type: typeOrMsg, text: text || '' };
    }
    var isFirstUserMessage = msg.type === 'user' && !chatState.currentChat.messages.some(function(m) { return m.type === 'user'; });
    chatState.currentChat.messages.push(msg);
    chatState.currentChat.lastInteractedAt = Date.now();
    if (isFirstUserMessage && msg.text) {
        var title = String(msg.text).trim();
        chatState.currentChat.title = title.length > 40 ? title.substring(0, 40) + '…' : title;
        chatState.currentChat.createdAt = Date.now();
        if (chatState.currentChat.id == null) chatState.currentChat.id = 'chat-' + Date.now();
        var headerTitleEl = document.getElementById('ubits-study-chat-header-title');
        if (headerTitleEl) headerTitleEl.value = chatState.currentChat.title || '';
    }
    refreshHistorialIfOpen();
}

/**
 * Refresca la lista del panel de historial solo si el panel está abierto.
 * Útil para actualizar en tiempo real al enviar/recibir mensajes.
 */
function refreshHistorialIfOpen() {
    var panel = document.getElementById('historial-panel');
    if (panel && panel.classList.contains('is-open')) renderHistorialList();
}

/**
 * Aplica el título editado en el encabezado del chat: actualiza currentChat y la entrada en chats, re-renderiza historial.
 */
function commitChatHeaderTitle() {
    var headerTitle = document.getElementById('ubits-study-chat-header-title');
    if (!headerTitle) return;
    var raw = (headerTitle.value || '').trim();
    var title = raw.length > 0 ? (raw.length > 80 ? raw.substring(0, 80) : raw) : 'Sin título';
    var cur = chatState.currentChat;
    if (!cur) return;
    cur.title = title;
    headerTitle.value = title;
    if (chatState.chats && cur.id) {
        var idx = chatState.chats.findIndex(function(c) { return c.id === cur.id; });
        if (idx >= 0) chatState.chats[idx].title = title;
    }
    renderHistorialList();
}

/**
 * Indica si ya existen conversaciones (chat actual con mensajes de usuario o chats guardados).
 * Usado por Modo estudio IA para mostrar/ocultar botones "Nuevo chat" e "Historial".
 */
function hasAnyConversations() {
    var cur = chatState.currentChat;
    var hasCurrent = cur && cur.messages && cur.messages.some(function(m) { return m.type === 'user'; });
    var savedCount = (chatState.chats || []).length;
    return hasCurrent || savedCount > 0;
}

/**
 * Notifica a la página (Modo estudio IA) que actualice la visibilidad de la barra de acciones (Nuevo chat / Historial).
 */
function notifyModoEstudioIaActionsVisibility() {
    if (typeof window.updateModoEstudioIaActionsVisibility === 'function') window.updateModoEstudioIaActionsVisibility();
}

/**
 * Guarda el chat actual en chats (si tiene al menos un mensaje de usuario), cierra canvas (no el historial),
 * resetea currentChat y muestra de nuevo la pantalla de bienvenida.
 * Si el panel de historial está abierto, se mantiene abierto y se actualiza la lista.
 */
function startNewChat() {
    saveCurrentChatIfHasMessages();

    var panel = chatState.rightPanelId ? document.getElementById(chatState.rightPanelId) : null;
    if (panel && panel.classList.contains('is-open')) {
        panel.classList.remove('is-open', 'has-content');
        panel.innerHTML = '';
        if (typeof setCanvasPanelOpen === 'function') setCanvasPanelOpen(false);
    }

    chatState.currentChat = { id: null, title: '', createdAt: 0, messages: [] };

    var body = document.getElementById('ubits-study-chat-body');
    if (body) {
        var welcome = document.getElementById('ubits-study-chat-welcome');
        var toRemove = [];
        for (var i = 0; i < body.children.length; i++) {
            if (body.children[i] !== welcome) toRemove.push(body.children[i]);
        }
        toRemove.forEach(function(el) { el.remove(); });
    }
    showWelcomeBlock();
    refreshHistorialIfOpen();
    notifyModoEstudioIaActionsVisibility();
}

/**
 * Re-renderiza los mensajes del chat actual en el DOM (para cargar un chat desde el historial).
 * Soporta mensajes simples, recursos (quiz/flashcards/plan/podcast) y mensajes con botones (material/tema).
 */
function renderChatMessages() {
    var body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    var welcome = document.getElementById('ubits-study-chat-welcome');
    var toRemove = [];
    for (var i = 0; i < body.children.length; i++) {
        if (body.children[i] !== welcome) toRemove.push(body.children[i]);
    }
    toRemove.forEach(function(el) { el.remove(); });

    var messages = (chatState.currentChat && chatState.currentChat.messages) ? chatState.currentChat.messages : [];
    var panel = chatState.rightPanelId ? document.getElementById(chatState.rightPanelId) : null;
    var panelIsOpen = panel && panel.classList.contains('is-open');

    messages.forEach(function(msg) {
        if (!msg || !msg.type) return;
        if (msg.resource) {
            var r = msg.resource;
            var resHtml = getResourceMessageHTML(r.type, r.topicKey, r.isNew, !panelIsOpen);
            if (resHtml) {
                body.insertAdjacentHTML('beforeend', resHtml);
                var lastMsg = body.lastElementChild;
                var btn = lastMsg ? lastMsg.querySelector('.study-chat-resource-open-btn') : null;
                if (btn) btn.addEventListener('click', function() {
                    var t = this.getAttribute('data-type');
                    var top = this.getAttribute('data-topic');
                    if (t === 'studyPlan') {
                        var plan = getStudyPlanForTopic(top);
                        if (plan) renderTutorPanel('studyPlan', top, { studyPlan: plan });
                    } else if (t === 'flashcards') renderTutorPanel('flashcards', top);
                    else if (t === 'podcast') {
                        var podLabel = TOPIC_LABELS[top] || top;
                        renderTutorPanel('podcast', top, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                    } else renderTutorPanel('quiz', top);
                    hideOpenButtonsInChat();
                });
            }
            return;
        }
        if (msg.quickReplies === 'material' && msg.topic) {
            var showPlan = STUDY_PLAN_TOPICS.indexOf(msg.topic) >= 0;
            var planBtnHtml = showPlan ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="studyPlan"><span>Plan de estudio</span></button>' : '';
            var choicesId = 'material-choices-restore-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            var messageHTML = createMessageHTML('ai', msg.text, '', false, false);
            var choicesHTML = '<div class="ubits-study-chat__message-with-choices">' +
                messageHTML +
                '<div class="ubits-study-chat__material-choices" id="' + choicesId + '">' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="quiz"><span>Quiz</span></button>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="flashcards"><span>Flashcards</span></button>' +
                planBtnHtml +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="podcast"><span>Podcast</span></button>' +
                '</div></div>';
            body.insertAdjacentHTML('beforeend', choicesHTML);
            var choicesEl = document.getElementById(choicesId);
            if (choicesEl) {
                choicesEl.querySelectorAll('.ubits-study-chat__material-choice-btn').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var choice = this.getAttribute('data-choice');
                        if (!choice) return;
                        chatState.waitingForMaterialChoice = false;
                        var topic = msg.topic;
                        if (choice === 'studyPlan') {
                            var plan = getStudyPlanForTopic(topic);
                            if (plan) renderTutorPanel('studyPlan', topic, { studyPlan: plan });
                        } else if (choice === 'podcast') {
                            var podLabel = TOPIC_LABELS[topic] || topic;
                            renderTutorPanel('podcast', topic, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                        } else renderTutorPanel(choice, topic);
                        choicesEl.style.display = 'none';
                        addResourceMessage(choice, topic, false);
                    });
                });
            }
            return;
        }
        if (msg.quickReplies === 'topic' && msg.waitingForTopicForResource) {
            var topicText = msg.text || '';
            var topicChoicesId = 'topic-choices-restore-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            var topicMessageHTML = createMessageHTML('ai', topicText, '', false, false);
            var topicButtonsHTML = SUGGESTED_TOPIC_BUTTONS.map(function(t) {
                return '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-topic-key="' + (t.key.replace(/"/g, '&quot;')) + '" data-topic-label="' + (t.label.replace(/"/g, '&quot;')) + '"><span>' + t.label + '</span></button>';
            }).join('');
            var topicChoicesHTML = '<div class="ubits-study-chat__message-with-choices">' +
                topicMessageHTML +
                '<div class="ubits-study-chat__material-choices" id="' + topicChoicesId + '">' +
                topicButtonsHTML +
                '</div></div>';
            body.insertAdjacentHTML('beforeend', topicChoicesHTML);
            var topicChoicesEl = document.getElementById(topicChoicesId);
            if (topicChoicesEl) {
                topicChoicesEl.querySelectorAll('.ubits-study-chat__material-choice-btn').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var topicKey = this.getAttribute('data-topic-key');
                        var topicLabel = this.getAttribute('data-topic-label');
                        if (!topicKey) return;
                        chatState.waitingForTopicForResource = null;
                        chatState.currentTopic = topicKey;
                        hideWelcomeBlock();
                        var resType = msg.waitingForTopicForResource;
                        if (resType === 'quiz') {
                            renderTutorPanel('quiz', topicKey);
                            if (typeof addResourceMessage === 'function') addResourceMessage('quiz', topicKey, false);
                        } else if (resType === 'flashcards') {
                            renderTutorPanel('flashcards', topicKey);
                            if (typeof addResourceMessage === 'function') addResourceMessage('flashcards', topicKey, false);
                        } else if (resType === 'studyPlan') {
                            var plan = getStudyPlanForTopic(topicKey);
                            if (plan) {
                                renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                                if (typeof addResourceMessage === 'function') addResourceMessage('studyPlan', topicKey, false);
                            }
                        } else if (resType === 'podcast') {
                            var podLabel = TOPIC_LABELS[topicKey] || topicKey;
                            renderTutorPanel('podcast', topicKey, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                            if (typeof addResourceMessage === 'function') addResourceMessage('podcast', topicKey, false);
                        }
                        topicChoicesEl.style.display = 'none';
                        pushCurrentChatMessage('user', topicLabel);
                        var userMsgHtml = createMessageHTML('user', topicLabel, formatTime(), false, false);
                        body.insertAdjacentHTML('beforeend', userMsgHtml);
                        body.scrollTop = body.scrollHeight;
                        refreshHistorialIfOpen();
                    });
                });
            }
            return;
        }
        var text = (msg && msg.text) ? msg.text : '';
        var type = (msg && msg.type === 'user') ? 'user' : 'ai';
        var html = createMessageHTML(type, text, '', false, false);
        body.insertAdjacentHTML('beforeend', html);
    });

    if (messages.length > 0) hideWelcomeBlock();
    /* Al restaurar desde historial, mostrar todo el texto de IA sin animación palabra por palabra */
    body.querySelectorAll('.ubits-study-chat__word').forEach(function(w) {
        w.classList.add('ubits-study-chat__word--visible');
    });
    body.scrollTop = body.scrollHeight;
}

/**
 * Guarda el chat actual en chats si tiene al menos un mensaje de usuario (reutilizable).
 * Usa lastInteractedAt para ordenar por interacción más reciente.
 */
function saveCurrentChatIfHasMessages() {
    var cur = chatState.currentChat;
    if (!cur || !cur.messages || !cur.messages.some(function(m) { return m.type === 'user'; })) return;
    var now = Date.now();
    var chatCopy = {
        id: cur.id,
        title: cur.title || 'Sin título',
        createdAt: cur.createdAt || now,
        lastInteractedAt: cur.lastInteractedAt || now,
        messages: cur.messages.slice()
    };
    if (!chatState.chats) chatState.chats = [];
    var idx = chatState.chats.findIndex(function(c) { return c.id === chatCopy.id; });
    if (idx >= 0) chatState.chats[idx] = chatCopy; else chatState.chats.push(chatCopy);
}

/** ID del chat pendiente de eliminar (modal de confirmación) */
var pendingDeleteChatId = null;

/**
 * Abre el modal de confirmación de eliminación para un chat.
 * @param {string} chatId - ID del chat a eliminar
 */
function openDeleteChatModal(chatId) {
    pendingDeleteChatId = chatId;
    if (typeof showModal === 'function') showModal('delete-chat-modal-overlay');
}

/**
 * Cierra el modal de eliminación y limpia pendingDeleteChatId.
 */
function cancelDeleteChatModal() {
    if (typeof closeModal === 'function') closeModal('delete-chat-modal-overlay');
    pendingDeleteChatId = null;
}

/**
 * Confirma la eliminación: quita el chat de chats, re-renderiza la lista y, si era el actual, muestra bienvenida.
 */
function confirmDeleteChat() {
    if (pendingDeleteChatId == null) return;
    var idToRemove = pendingDeleteChatId;
    var wasCurrentChat = chatState.currentChat && chatState.currentChat.id === idToRemove;
    /* Limpiar currentChat antes de renderHistorialList para que el ítem no vuelva a aparecer en la lista */
    if (wasCurrentChat) {
        chatState.currentChat = { id: null, title: '', createdAt: 0, messages: [] };
        var body = document.getElementById('ubits-study-chat-body');
        if (body) {
            var welcome = document.getElementById('ubits-study-chat-welcome');
            var toRemove = [];
            for (var i = 0; i < body.children.length; i++) {
                if (body.children[i] !== welcome) toRemove.push(body.children[i]);
            }
            toRemove.forEach(function(el) { el.remove(); });
        }
        showWelcomeBlock();
    }
    if (chatState.chats) {
        chatState.chats = chatState.chats.filter(function(c) { return c.id !== idToRemove; });
    }
    renderHistorialList();
    if (typeof closeModal === 'function') closeModal('delete-chat-modal-overlay');
    pendingDeleteChatId = null;
    notifyModoEstudioIaActionsVisibility();
}

/**
 * Rellena la lista del panel de historial: cada chat una sola vez, ordenado por interacción más reciente.
 * El activo es el que coincide con currentChat.id (el que se ve a la derecha).
 */
function renderHistorialList() {
    var listEl = document.getElementById('historial-list');
    var emptyEl = document.getElementById('historial-empty');
    if (!listEl || !emptyEl) return;
    var cur = chatState.currentChat;
    var currentId = (cur && cur.id) ? cur.id : null;
    var hasCurrent = cur && cur.messages && cur.messages.length > 0;
    var saved = (chatState.chats || []).slice();
    if (hasCurrent && currentId) saved = saved.filter(function(c) { return c.id !== currentId; });
    var items = hasCurrent ? [cur].concat(saved) : saved;
    var sortTime = function(c) { return c.lastInteractedAt || c.createdAt || 0; };
    items.sort(function(a, b) { return sortTime(b) - sortTime(a); });
    if (items.length === 0) {
        if (typeof loadEmptyState === 'function') {
            loadEmptyState('historial-empty-state-container', {
                icon: 'fa-comments',
                title: 'No hay conversaciones',
                description: 'Aún no hay chats en esta sesión. Inicia uno nuevo desde el chat.'
            });
        }
        emptyEl.style.display = 'flex';
        listEl.innerHTML = '';
        listEl.style.display = 'none';
        return;
    }
    emptyEl.style.display = 'none';
    listEl.style.display = 'flex';
    var html = '';
    items.forEach(function(chat) {
        var id = chat.id || '';
        var title = (chat.title || 'Sin título').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        var isActive = id && currentId === id;
        var activeClass = isActive ? ' modo-estudio-ia-historial-item--active' : '';
        html += '<div class="modo-estudio-ia-historial-item' + activeClass + '" data-chat-id="' + id + '" role="button" tabindex="0"' + (isActive ? ' aria-current="true"' : '') + '>' +
            '<span class="ubits-body-sm-regular modo-estudio-ia-historial-item__title">' + title + '</span>' +
            '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--xs ubits-button--icon-only modo-estudio-ia-historial-item__delete" data-delete-chat-id="' + id + '" aria-label="Eliminar chat" title="Eliminar">' +
            '<i class="far fa-trash"></i></button>' +
            '</div>';
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll('.modo-estudio-ia-historial-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.modo-estudio-ia-historial-item__delete')) return;
            var chatId = this.getAttribute('data-chat-id');
            if (!chatId) return;
            if (chatId === currentId) {
                if (cur) cur.lastInteractedAt = Date.now();
                renderHistorialList();
                return;
            }
            saveCurrentChatIfHasMessages();
            var chat = (chatState.chats || []).find(function(c) { return c.id === chatId; });
            if (!chat) return;
            var now = Date.now();
            var chatInList = chatState.chats.findIndex(function(c) { return c.id === chatId; });
            if (chatInList >= 0) chatState.chats[chatInList].lastInteractedAt = now;
            chatState.currentChat = {
                id: chat.id,
                title: chat.title || '',
                createdAt: chat.createdAt || 0,
                lastInteractedAt: now,
                messages: (chat.messages || []).slice()
            };
            renderChatMessages();
            renderHistorialList();
            notifyModoEstudioIaActionsVisibility();
        });
    });
    listEl.querySelectorAll('.modo-estudio-ia-historial-item__delete').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var chatId = this.getAttribute('data-delete-chat-id');
            if (chatId && typeof openDeleteChatModal === 'function') openDeleteChatModal(chatId);
        });
    });
}

/**
 * Mapeo de competencia (label) a id de tema
 */
const COMPETENCY_TO_TOPIC = {
    'Liderazgo': 'liderazgo',
    'Comunicación': 'comunicacion',
    'Inglés': 'ingles',
    'Japonés': 'japones'
};

/**
 * Crea el HTML del chat de estudio (soporta Modo Tutor: empty state con competencias)
 * @param {Object} options - Opciones: userFirstName, competencies (array de strings), rightPanelId, placeholderId
 * @returns {string} HTML del chat
 */
function createStudyChatHTML(options = {}) {
    const competencies = options.competencies || [];
    const isTutorMode = competencies.length > 0;
    const userFirstName = options.userFirstName || 'Usuario';
    const suggestionButtons = isTutorMode
        ? `<span class="ubits-study-chat__suggestions-label ubits-body-xs-regular">Recomendado para ti:</span>` + competencies.map(c => `<button class="ubits-button ubits-button--secondary ubits-button--xs ubits-study-chat__competency-chip" data-competency="${COMPETENCY_TO_TOPIC[c] || c.toLowerCase().replace(/\s/g, '')}" data-label="${c}"><span>${c}</span></button>`).join('\n')
        : `
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="contenidos"><span>Sugerencias de contenidos</span></button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="plan"><span>Crear plan de formación</span></button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="tutor"><span>Sé mi tutor</span></button>`;
    const welcomeBlock = isTutorMode ? `
            <div class="ubits-study-chat__welcome-wrapper" id="ubits-study-chat-welcome">
                <div class="ubits-study-chat__welcome">
                    <div class="ubits-study-chat__welcome-head">
                        <div class="ubits-study-chat__welcome-icon"><i class="far fa-sparkles"></i></div>
                        <p class="ubits-study-chat__welcome-greeting">Hola, ${userFirstName}</p>
                    </div>
                    <p class="ubits-study-chat__welcome-prompt">¿Qué quieres <span class="ubits-study-chat__welcome-prompt-accent">aprender hoy</span>?</p>
                </div>
            </div>` : '';
    return `
        <div class="ubits-study-chat" id="ubits-study-chat">
            <div class="ubits-study-chat__header" id="ubits-study-chat-header" style="display: none;" aria-label="Encabezado del chat">
                <input type="text" class="ubits-study-chat__header-title" id="ubits-study-chat-header-title" value="" placeholder="Sin título" maxlength="80" aria-label="Nombre del chat editable" />
                <div class="ubits-study-chat__header-actions">
                    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="btn-historial" data-tooltip="Historial" data-tooltip-position="bottom" aria-label="Abrir historial de chats">
                        <i class="far fa-clock-rotate-left"></i>
                    </button>
                    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="btn-nuevo-chat" data-tooltip="Nuevo chat" data-tooltip-position="bottom" aria-label="Iniciar nuevo chat">
                        <i class="far fa-comment-plus"></i>
                    </button>
                </div>
            </div>
            <div class="ubits-study-chat__body" id="ubits-study-chat-body">${welcomeBlock}</div>
            <div class="ubits-study-chat__input-area">
                <div class="ubits-study-chat__input-container">
                    <div class="ubits-study-chat__input-wrapper">
                        <textarea class="ubits-study-chat__input" id="ubits-study-chat-input" placeholder="Escribir mensaje..." rows="1"></textarea>
                    </div>
                    <div class="ubits-study-chat__input-bottom">
                        <div class="ubits-study-chat__suggestions" id="ubits-study-chat-suggestions">${suggestionButtons}</div>
                    <div class="ubits-study-chat__input-actions">
                            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="ubits-study-chat-attach-btn" title="Adjuntar"><i class="far fa-paperclip"></i></button>
                            <button class="ubits-button ubits-button--primary ubits-button--sm ubits-button--icon-only" id="ubits-study-chat-send-btn" title="Enviar"><i class="far fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
            </div>
            <p class="ubits-study-chat__disclaimer ubits-body-xs-regular">El chat de modo estudio IA puede cometer errores; verifica sus respuestas.</p>
        </div>
    `;
}

/**
 * Formatea la hora actual
 * @returns {string} Hora formateada (ej: "10:06 am")
 */
function formatTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Envuelve cada palabra (token separado por espacios) en un span para animación palabra por palabra.
 * Respeta HTML existente (ej. <strong>...</strong> se trata como una palabra).
 */
function wrapWordsInSpans(html) {
    if (!html || !html.trim()) return html;
    var tokens = html.split(/\s+/).filter(function(t) { return t.length > 0; });
    return tokens.map(function(t) { return '<span class="ubits-study-chat__word">' + t + '</span>'; }).join(' ');
}

/**
 * Crea el HTML de un mensaje
 * @param {string} type - Tipo de mensaje: 'ai' o 'user'
 * @param {string} text - Texto del mensaje
 * @param {string} timestamp - Timestamp del mensaje
 * @param {boolean} showActions - Si mostrar botones de acción (solo para IA)
 * @param {boolean} isTyping - Si es un mensaje de carga/typing
 * @returns {string} HTML del mensaje
 */
function createMessageHTML(type, text, timestamp, showActions = false, isTyping = false) {
    const messageClass = type === 'ai' ? 'ubits-study-chat__message--ai' : 'ubits-study-chat__message--user';
    const globeClass = type === 'ai' 
        ? (isTyping ? 'ubits-study-chat__text-globe--ai ubits-study-chat__text-globe--typing' : 'ubits-study-chat__text-globe--ai')
        : 'ubits-study-chat__text-globe--user';
    
    let textHTML = '';
    if (isTyping) {
        textHTML = `
            <div class="ubits-study-chat__typing-icon" aria-hidden="true">
                <span class="ubits-study-chat__typing-dot"></span>
                <span class="ubits-study-chat__typing-dot"></span>
                <span class="ubits-study-chat__typing-dot"></span>
            </div>
        `;
    } else {
        // Detectar si el texto contiene HTML (divs, etc.)
        const hasHTML = /<[^>]+>/.test(text);
        
        if (hasHTML) {
            // Si tiene HTML, dividir el texto en partes (texto plano y HTML)
            // Convertir URLs en links antes de procesar
            const linkRegex = /(https?:\/\/[^\s]+)/g;
            // Dividir por saltos de línea primero para separar texto de HTML
            const lines = text.split('\n');
            let processedText = '';
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('<div')) {
                    // Es HTML, agregarlo directamente
                    processedText += line;
                } else if (trimmedLine.length > 0) {
                    // Es texto plano, convertir URLs y envolver en párrafo
                    const textWithLinks = trimmedLine.replace(linkRegex, '<a href="$1" class="ubits-study-chat__link" target="_blank" rel="noopener noreferrer">$1</a>');
                    const content = type === 'ai' ? wrapWordsInSpans(textWithLinks) : textWithLinks;
                    processedText += '<p class="ubits-study-chat__message-text">' + content + '</p>';
                }
            });
            
            textHTML = processedText;
    } else {
        // Convertir URLs en links con estilo
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const textWithLinks = text.replace(linkRegex, '<a href="$1" class="ubits-study-chat__link" target="_blank" rel="noopener noreferrer">$1</a>');
            // Dividir por saltos de línea y crear párrafos
            const lines = textWithLinks.split('\n').filter(function(line) { return line.trim(); });
            textHTML = lines.map(function(line) {
                var content = type === 'ai' ? wrapWordsInSpans(line) : line;
                return '<p class="ubits-study-chat__message-text">' + content + '</p>';
            }).join('');
        }
    }
    
    const actionsHTML = (type === 'ai' && showActions && !isTyping) ? `
        <div class="ubits-study-chat__message-actions">
            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" title="Copiar">
                <i class="far fa-copy"></i>
            </button>
            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" title="Regenerar">
                <i class="far fa-arrows-rotate"></i>
            </button>
        </div>
    ` : '';
    
    return `
        <div class="ubits-study-chat__message ${messageClass}">
            <div class="ubits-study-chat__text-globe ${globeClass}">
                ${textHTML}
            </div>
            <p class="ubits-study-chat__timestamp">${timestamp}</p>
            ${actionsHTML}
        </div>
    `;
}

/**
 * Formatea la lista de cursos como cards compactos
 * @param {Array} courses - Array de cursos a mostrar
 * @param {boolean} isAddingMore - Si es true, indica que se están agregando más cursos
 * @returns {string} HTML con contenedor para cards compactos
 */
function formatCoursesHTML(courses, isAddingMore = false) {
    // Generar ID único para el contenedor
    const containerId = `courses-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar los cursos en el estado para poder renderizarlos después
    chatState.pendingCoursesContainer = {
        containerId: containerId,
        courses: courses
    };
    
    let introText = '';
    if (isAddingMore) {
        introText = 'He agregado otros 3 cursos a tu lista. Aquí está la lista completa:';
    } else {
        introText = '';
    }
    
    return `<div class="study-chat-courses-section"><div id="${containerId}" class="study-chat-courses-container"></div><div class="study-chat-courses-prompt">¿Te gustaría que agregue otros 3 cursos? Solo dime "agrégame otros 3" o "agrega más".</div></div>`;
}

/**
 * Formatea un plan de formación con cards compactos
 * @param {Object} plan - Objeto con la información del plan
 * @returns {string} HTML formateado del plan con cards compactos
 */
function formatPlanHTML(plan) {
    // Generar ID único para el contenedor
    const containerId = `plan-courses-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar el plan en el estado para poder renderizar los cards después
    chatState.pendingPlanContainer = {
        containerId: containerId,
        plan: plan
    };
    
    let text = `<div class="study-chat-plan-section">`;
    text += `<div class="study-chat-plan-title">Plan de Formación</div>`;
    text += `<div class="study-chat-plan-details">`;
    text += `<div class="study-chat-plan-detail-item"><strong>Título:</strong> ${plan.title}</div>`;
    text += `<div class="study-chat-plan-detail-item"><strong>Cursos incluidos:</strong> ${plan.courses.length}</div>`;
    text += `</div>`;
    text += `<div class="study-chat-plan-courses-title">Cursos del plan</div>`;
    text += `<div id="${containerId}" class="study-chat-courses-container"></div>`;
    text += `<div class="study-chat-plan-details" style="margin-top: 16px;">`;
    text += `<div class="study-chat-plan-detail-item"><strong>Fecha de inicio:</strong> ${plan.startDate}</div>`;
    text += `<div class="study-chat-plan-detail-item"><strong>Fecha de fin:</strong> ${plan.endDate}</div>`;
    text += `</div>`;
    text += `<div class="study-chat-plan-prompt">¿Deseas aceptar este plan o modificar el listado de cursos? Responde "acepto" o "modificar".</div>`;
    text += `</div>`;
    
    return text;
}

/**
 * Genera fechas para un plan de formación (1 mes de duración)
 * @returns {Object} Objeto con fecha de inicio y fin formateadas
 */
function generatePlanDates() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    };
    
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
}

/**
 * Genera un plan de formación con 5 cursos de liderazgo
 * @returns {Object} Objeto con la información del plan
 */
function generateLeadershipPlan() {
    // Seleccionar 5 cursos aleatorios sin repetir
    const availableCourses = [...LEADERSHIP_COURSES].sort(() => 0.5 - Math.random());
    const selectedCourses = availableCourses.slice(0, 5);
    
    const dates = generatePlanDates();
    
    return {
        title: 'Plan de Formación en Liderazgo',
        courses: selectedCourses,
        startDate: dates.startDate,
        endDate: dates.endDate,
        topic: 'liderazgo'
    };
}

/**
 * Selecciona cursos aleatorios que no hayan sido sugeridos antes
 * @param {number} count - Cantidad de cursos a seleccionar
 * @returns {Array} Array de cursos seleccionados
 */
function selectRandomCourses(count = 3) {
    const availableCourses = LEADERSHIP_COURSES.filter(course => 
        !chatState.suggestedCourses.some(suggested => suggested.title === course.title)
    );
    
    if (availableCourses.length === 0) {
        // Si ya se sugirieron todos, resetear la lista
        chatState.suggestedCourses = [];
        return selectRandomCourses(count);
    }
    
    const shuffled = [...availableCourses].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, availableCourses.length));
    
    // Agregar a la lista de cursos sugeridos
    chatState.suggestedCourses.push(...selected);
    
    return selected;
}

/**
 * Genera una respuesta con cursos de liderazgo
 * @param {number} count - Cantidad de cursos a sugerir (default: 3)
 * @param {boolean} isAddingMore - Si es true, indica que se están agregando más cursos a los ya existentes
 * @returns {Object} Objeto con el texto de respuesta y los cursos
 */
function generateLeadershipCoursesResponse(count = 3, isAddingMore = false) {
    const courses = selectRandomCourses(count);
    let intro = '';
    let coursesText = '';
    
    if (isAddingMore) {
        // Si estamos agregando más cursos, mantener todos los cursos sugeridos hasta ahora
        const allCourses = chatState.suggestedCourses;
        intro = '¡Perfecto! He agregado otros 3 cursos a tu lista.';
        coursesText = formatCoursesHTML(allCourses, true);
    } else {
        // Primera vez que se sugieren cursos
        intro = '¡Excelente elección! El liderazgo es fundamental para el desarrollo profesional. Aquí tienes algunos cursos que te pueden interesar:';
        coursesText = formatCoursesHTML(courses, false);
    }
    
    const responseText = intro + '\n\n' + coursesText;
    
    return {
        text: responseText,
        courses: courses
    };
}

/**
 * Convierte el texto de un mensaje en un array de HTML por línea (para efecto typewriter línea a línea).
 */
function getMessageLinesAsHTML(text) {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const lines = text.split('\n');
    return lines.filter(l => l.trim().length > 0).map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('<div')) return trimmed;
        const withLinks = trimmed.replace(linkRegex, '<a href="$1" class="ubits-study-chat__link" target="_blank" rel="noopener noreferrer">$1</a>');
        return '<p class="ubits-study-chat__message-text">' + withLinks + '</p>';
    });
}

/** Delay por palabra (ms) para animación palabra por palabra en mensajes de IA */
var AI_WORD_REVEAL_DELAY_MS = 35;

/**
 * Anima la aparición palabra por palabra en un mensaje de IA (text-globe--ai).
 * @param {HTMLElement} messageEl - Elemento .ubits-study-chat__message
 */
function animateWordsInMessage(messageEl) {
    if (!messageEl) return;
    var words = messageEl.querySelectorAll('.ubits-study-chat__text-globe--ai .ubits-study-chat__word');
    if (words.length === 0) return;
    var delay = AI_WORD_REVEAL_DELAY_MS;
    words.forEach(function(word, i) {
        setTimeout(function() {
            word.classList.add('ubits-study-chat__word--visible');
        }, i * delay);
    });
}

/**
 * Añade mensaje de IA con efecto typewriter línea a línea (estilo Gemini).
 */
function addMessageAIWithStreaming(text, showActions, regenerateFunction) {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    pushCurrentChatMessage('ai', text);
    removeTypingMessage();
    const timestamp = formatTime();
    const linesHTML = getMessageLinesAsHTML(text);
    if (linesHTML.length === 0) {
        addMessage('ai', text, showActions, regenerateFunction);
        return;
    }
    const shellHTML = createMessageHTML('ai', '', timestamp, showActions, false);
    body.insertAdjacentHTML('beforeend', shellHTML);
    const messageEl = body.lastElementChild;
    const globeEl = messageEl.querySelector('.ubits-study-chat__text-globe');
    if (!globeEl) return;
    messageEl.classList.add('ubits-study-chat__message--streaming');
    let index = 0;
    function appendNext() {
        if (index >= linesHTML.length) {
            messageEl.classList.remove('ubits-study-chat__message--streaming');
            chatState.lastAIMessageElement = messageEl;
        chatState.lastAIMessageText = text;
        chatState.lastRegenerateFunction = regenerateFunction;
            attachAIMessageActions(messageEl, text, regenerateFunction);
            runPendingCardsRender(messageEl);
            body.scrollTop = body.scrollHeight;
            return;
        }
        globeEl.insertAdjacentHTML('beforeend', linesHTML[index]);
        index++;
        body.scrollTop = body.scrollHeight;
        if (index < linesHTML.length) {
            setTimeout(appendNext, 65);
        } else {
            appendNext();
        }
    }
    setTimeout(appendNext, 0);
}

function runPendingCardsRender(messageElement) {
    if (!messageElement) return;
        setTimeout(() => {
            if (chatState.pendingCoursesContainer && typeof loadCardContentCompact === 'function') {
                const { containerId, courses } = chatState.pendingCoursesContainer;
                const container = messageElement.querySelector(`#${containerId}`);
                if (container && courses && courses.length > 0) {
                    const basePath = getImageBasePath();
                    const cardsData = courses.map(function(course) { return getRecommendedContentCardData(course, basePath); });
                    loadCardContentCompact(containerId, cardsData);
                    chatState.pendingCoursesContainer = null;
                }
            }
            if (chatState.pendingPlanContainer && typeof loadCardContentCompact === 'function') {
                const { containerId, plan } = chatState.pendingPlanContainer;
                const container = messageElement.querySelector(`#${containerId}`);
                if (container && plan && plan.courses && plan.courses.length > 0) {
                    const basePath = getImageBasePath();
                    const cardsData = plan.courses.map(function(course) { return getRecommendedContentCardData(course, basePath); });
                    loadCardContentCompact(containerId, cardsData);
                    chatState.pendingPlanContainer = null;
                }
            }
    }, 150);
    }
    
function attachAIMessageActions(messageElement, text, regenerateFunction) {
    if (!messageElement) return;
        const copyBtn = messageElement.querySelector('button[title="Copiar"]');
        const regenerateBtn = messageElement.querySelector('button[title="Regenerar"]');
    const plainText = (() => {
        const div = document.createElement('div');
        div.innerHTML = text;
        return div.textContent || div.innerText || text;
    })();
        if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(plainText).then(() => {
                if (typeof showToast === 'function') showToast('success', '¡Texto copiado exitosamente! 😉', { containerId: 'ubits-toast-container', duration: 3500 });
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = plainText;
                ta.style.position = 'fixed';
                ta.style.left = '-999999px';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (e) {}
                document.body.removeChild(ta);
            });
        });
    }
    if (regenerateBtn && regenerateFunction) {
        regenerateBtn.addEventListener('click', () => regenerateFunction());
    }
}

function hideWelcomeBlock() {
    const welcome = document.getElementById('ubits-study-chat-welcome');
    if (welcome) welcome.classList.add('ubits-study-chat__welcome--hidden');
    const suggestions = document.getElementById('ubits-study-chat-suggestions');
    if (suggestions) suggestions.classList.add('ubits-study-chat__suggestions--hidden');
    if (chatState.welcomeLayout) {
        const root = document.getElementById('ubits-study-chat');
        if (root) {
            root.classList.remove('ubits-study-chat--welcome');
            const wrapper = root.closest('.modo-tutor-ia-chat-main');
            if (wrapper) wrapper.classList.remove('study-chat-wrapper--welcome');
        }
    }
    var header = document.getElementById('ubits-study-chat-header');
    var headerTitle = document.getElementById('ubits-study-chat-header-title');
    if (header && headerTitle) {
        header.style.display = '';
        headerTitle.value = (chatState.currentChat && chatState.currentChat.title) ? chatState.currentChat.title : '';
    }
}

/**
 * Muestra de nuevo el bloque de bienvenida y las sugerencias (reversa de hideWelcomeBlock).
 * Usado al iniciar un nuevo chat o al resetear la vista.
 */
function showWelcomeBlock() {
    const welcome = document.getElementById('ubits-study-chat-welcome');
    if (welcome) welcome.classList.remove('ubits-study-chat__welcome--hidden');
    const suggestions = document.getElementById('ubits-study-chat-suggestions');
    if (suggestions) suggestions.classList.remove('ubits-study-chat__suggestions--hidden');
    if (chatState.welcomeLayout) {
        const root = document.getElementById('ubits-study-chat');
        if (root) {
            root.classList.add('ubits-study-chat--welcome');
            const wrapper = root.closest('.modo-tutor-ia-chat-main');
            if (wrapper) wrapper.classList.add('study-chat-wrapper--welcome');
        }
    }
    var header = document.getElementById('ubits-study-chat-header');
    var headerTitle = document.getElementById('ubits-study-chat-header-title');
    if (header) {
        if (hasAnyConversations()) {
            header.style.display = '';
            if (headerTitle) headerTitle.value = '';
                    } else {
            header.style.display = 'none';
        }
    }
}

/**
 * Guarda el título editado en el encabezado: actualiza currentChat y el chat en historial, re-renderiza la lista.
 */
function commitChatHeaderTitle() {
    var headerTitle = document.getElementById('ubits-study-chat-header-title');
    var cur = chatState.currentChat;
    if (!headerTitle || !cur || !cur.id) return;
    var raw = (headerTitle.value || '').trim();
    var title = raw.length > 0 ? (raw.length > 80 ? raw.substring(0, 80) : raw) : 'Sin título';
    headerTitle.value = title;
    cur.title = title;
    if (chatState.chats) {
        var idx = chatState.chats.findIndex(function(c) { return c.id === cur.id; });
        if (idx >= 0) chatState.chats[idx].title = title;
    }
    renderHistorialList();
}

var TOPIC_LABELS = { liderazgo: 'Liderazgo', comunicacion: 'Comunicación', ingles: 'Inglés', japones: 'Japonés', hiragana: 'Maratón Hiragana' };

function getResourceTitle(type, topicKey) {
    var label = TOPIC_LABELS[topicKey] || topicKey;
    if (type === 'quiz') return topicKey === 'hiragana' ? 'Quiz Maratón de Hiragana' : 'Quiz de ' + label;
    if (type === 'flashcards') return 'Flashcards de ' + label;
    if (type === 'studyPlan') return 'Plan de estudio: ' + label;
    if (type === 'podcast') return 'Podcast de ' + label;
    return type + ' ' + label;
}

/** Devuelve { count, label } para el recurso (preguntas, flashcards, tareas). */
function getResourceCount(type, topicKey) {
    if (type === 'quiz') {
        var qSet = (typeof TUTOR_QUIZ_SETS !== 'undefined' && TUTOR_QUIZ_SETS[0]) ? TUTOR_QUIZ_SETS[0] : (typeof TUTOR_QUIZ !== 'undefined' ? { liderazgo: TUTOR_QUIZ.liderazgo, comunicacion: TUTOR_QUIZ.comunicacion, ingles: TUTOR_QUIZ.ingles, japones: TUTOR_QUIZ.japones, hiragana: (TUTOR_QUIZ.hiragana || []).slice(0, 10) } : { liderazgo: [] });
        var q = (qSet[topicKey] || qSet.liderazgo) || [];
        return { count: q.length, label: q.length === 1 ? 'pregunta' : 'preguntas' };
    }
    if (type === 'flashcards') {
        var fc = (typeof TUTOR_FLASHCARDS !== 'undefined' && TUTOR_FLASHCARDS[topicKey]) ? TUTOR_FLASHCARDS[topicKey] : (typeof TUTOR_FLASHCARDS !== 'undefined' ? TUTOR_FLASHCARDS.liderazgo : []);
        var n = Array.isArray(fc) ? fc.length : 5;
        return { count: n, label: n === 1 ? 'flashcard' : 'flashcards' };
    }
    if (type === 'studyPlan') {
        var plan = typeof getStudyPlanForTopic === 'function' ? getStudyPlanForTopic(topicKey) : null;
        var t = plan && plan.tasks ? plan.tasks.length : 5;
        return { count: t, label: t === 1 ? 'tarea' : 'tareas' };
    }
    if (type === 'podcast') return { count: 1, label: 'episodio' };
    return { count: 0, label: '' };
}

function hideOpenButtonsInChat() {
    document.querySelectorAll('.study-chat-resource-msg').forEach(function(el) { el.classList.remove('open-btn-visible'); });
}

function showOpenButtonsInChat() {
    document.querySelectorAll('.study-chat-resource-msg').forEach(function(el) { el.classList.add('open-btn-visible'); });
}

/**
 * Iconos por tipo de recurso (FontAwesome).
 */
function getResourceIcon(type) {
    if (type === 'quiz') return 'far fa-circle-question';
    if (type === 'flashcards') return 'far fa-bring-forward';
    if (type === 'studyPlan') return 'far fa-layer-group';
    if (type === 'podcast') return 'far fa-podcast';
    return 'far fa-file';
}

/**
 * Devuelve el HTML de un mensaje de recurso (para añadir al DOM o para restaurar en historial).
 * @param {string} type - 'quiz' | 'flashcards' | 'studyPlan' | 'podcast'
 * @param {string} topicKey - tema (liderazgo, comunicacion, etc.)
 * @param {boolean} isNew - true para "He creado un nuevo..."
 * @param {boolean} showOpenButton - si el botón Abrir debe ser visible (ej. al restaurar historial)
 * @returns {string} HTML del mensaje
 */
function getResourceMessageHTML(type, topicKey, isNew, showOpenButton) {
    var title = getResourceTitle(type, topicKey);
    var intro = '';
    if (type === 'quiz') intro = isNew ? 'He creado un nuevo quiz para ti.' : 'He creado un quiz para ti.';
    else if (type === 'flashcards') intro = isNew ? 'He creado nuevas flashcards para ti.' : 'He creado flashcards para ti.';
    else if (type === 'studyPlan') intro = isNew ? 'He creado un nuevo plan de estudio para ti.' : 'He creado un plan de estudio para ti.';
    else if (type === 'podcast') intro = isNew ? 'He creado un nuevo podcast para ti.' : 'He creado un podcast para ti.';
    else return '';
    var countInfo = getResourceCount(type, topicKey);
    var countText = countInfo.count + ' ' + countInfo.label;
    var iconClass = getResourceIcon(type);
    var openVisibleClass = showOpenButton ? ' open-btn-visible' : '';
    var timestamp = formatTime();
    return '<div class="ubits-study-chat__message ubits-study-chat__message--ai study-chat-resource-msg' + openVisibleClass + '" data-resource-type="' + type + '" data-resource-topic="' + topicKey + '">' +
        '<div class="ubits-study-chat__text-globe ubits-study-chat__text-globe--ai">' +
        '<p class="ubits-study-chat__message-text">' + intro + '</p>' +
        '<div class="study-chat-resource-card">' +
        '<div class="study-chat-resource-card__main">' +
        '<span class="study-chat-resource-card__icon"><i class="' + iconClass + '"></i></span>' +
        '<div class="study-chat-resource-card__content">' +
        '<span class="study-chat-resource-card__title ubits-body-sm-bold">' + (title.replace(/</g, '&lt;').replace(/"/g, '&quot;')) + '</span>' +
        '<span class="study-chat-resource-card__meta ubits-body-xs-regular">' + countText + '</span>' +
        '</div></div>' +
        '<div class="study-chat-resource-card__action study-chat-resource-open-wrap">' +
        '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm study-chat-resource-open-btn" data-type="' + type + '" data-topic="' + topicKey + '"><span>Abrir</span></button>' +
        '</div></div></div>' +
        '<p class="ubits-study-chat__timestamp">' + timestamp + '</p></div>';
}

/**
 * Añade mensaje con texto intro + card del recurso (icono, título elaborado, cantidad, botón Abrir).
 * El botón Abrir solo se muestra cuando el panel derecho está cerrado.
 * @param {string} type - 'quiz' | 'flashcards' | 'studyPlan' | 'podcast'
 * @param {string} topicKey - tema (liderazgo, comunicacion, etc.)
 * @param {boolean} isNew - true para "He creado un nuevo..."
 */
function addResourceMessage(type, topicKey, isNew) {
    var body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    var panel = chatState.rightPanelId ? document.getElementById(chatState.rightPanelId) : null;
    var panelIsOpen = panel && panel.classList.contains('is-open');
    var html = getResourceMessageHTML(type, topicKey, isNew, !panelIsOpen);
    if (!html) return;
    body.insertAdjacentHTML('beforeend', html);
    var lastMsg = body.lastElementChild;
    if (lastMsg) {
        lastMsg.classList.add('study-chat-resource-msg--reveal');
        setTimeout(function() { lastMsg.classList.remove('study-chat-resource-msg--reveal'); }, 520);
    }
    body.scrollTop = body.scrollHeight;
    pushCurrentChatMessage({ type: 'ai', resource: { type: type, topicKey: topicKey, isNew: isNew } });
    var btn = lastMsg ? lastMsg.querySelector('.study-chat-resource-open-btn') : null;
    if (btn) btn.addEventListener('click', function() {
        var t = this.getAttribute('data-type');
        var top = this.getAttribute('data-topic');
        if (t === 'studyPlan') {
            var plan = getStudyPlanForTopic(top);
            if (plan) renderTutorPanel('studyPlan', top, { studyPlan: plan });
        } else if (t === 'flashcards') renderTutorPanel('flashcards', top);
        else if (t === 'podcast') {
            var podLabel = TOPIC_LABELS[top] || top;
            renderTutorPanel('podcast', top, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
        } else renderTutorPanel('quiz', top);
        hideOpenButtonsInChat();
    });
}

/**
 * Añade mensaje de IA con botones de elección de material (Quiz, Flashcards, Plan de estudio si aplica).
 * @param {string} label - Nombre de la competencia/tema (ej: "Liderazgo")
 * @param {string} topic - Id del tema (ej: "liderazgo") para renderTutorPanel
 */
function addMessageWithMaterialChoiceButtons(label, topic) {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    const showPlan = STUDY_PLAN_TOPICS.indexOf(topic) >= 0;
    var text;
    if (topic === 'japones') {
        text = 'Perfecto, trabajemos <strong>Japonés</strong>. Puedo hacerte un quiz, crear flashcards, un plan de estudio o un podcast. ¿Qué prefieres?';
    } else if (showPlan) {
        text = 'Perfecto, trabajemos <strong>' + label + '</strong>. Puedo hacerte un quiz, crear flashcards, un plan de estudio o un podcast con contenidos UBITS. ¿Qué prefieres?';
    } else {
        text = 'Perfecto, trabajemos <strong>' + label + '</strong>. Puedo hacerte un quiz, crear flashcards o un podcast. ¿Qué prefieres?';
    }
    const timestamp = formatTime();
    const messageHTML = createMessageHTML('ai', text, timestamp, false, false);
    const choicesId = 'material-choices-' + Date.now();
    const planBtnHtml = showPlan ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="studyPlan"><span>Plan de estudio</span></button>' : '';
    const choicesHTML = '<div class="ubits-study-chat__message-with-choices">' +
        messageHTML +
        '<div class="ubits-study-chat__material-choices" id="' + choicesId + '">' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="quiz"><span>Quiz</span></button>' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="flashcards"><span>Flashcards</span></button>' +
        planBtnHtml +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-choice="podcast"><span>Podcast</span></button>' +
        '</div></div>';
    body.insertAdjacentHTML('beforeend', choicesHTML);
    var wrapperEl = body.lastElementChild;
    var messageEl = wrapperEl.querySelector('.ubits-study-chat__message');
    if (messageEl) animateWordsInMessage(messageEl);
    wrapperEl.classList.add('ubits-study-chat__message-with-choices--reveal');
    setTimeout(function() { wrapperEl.classList.remove('ubits-study-chat__message-with-choices--reveal'); }, 520);
    body.scrollTop = body.scrollHeight;
    pushCurrentChatMessage({ type: 'ai', text: text, quickReplies: 'material', topic: topic });
    chatState.lastAIMessageElement = messageEl;
    chatState.lastAIMessageText = text;
    chatState.lastRegenerateFunction = null;

    const choicesEl = document.getElementById(choicesId);
    if (!choicesEl) return;
    choicesEl.querySelectorAll('.ubits-study-chat__material-choice-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const choice = this.getAttribute('data-choice');
            if (!choice) return;
            chatState.waitingForMaterialChoice = false;
            if (choice === 'studyPlan') {
                var plan = getStudyPlanForTopic(topic);
                if (plan) renderTutorPanel('studyPlan', topic, { studyPlan: plan });
            } else if (choice === 'podcast') {
                var podLabel = TOPIC_LABELS[topic] || topic;
                renderTutorPanel('podcast', topic, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
            } else {
                renderTutorPanel(choice, topic);
            }
            choicesEl.style.display = 'none';
            addResourceMessage(choice, topic, false);
                });
            });
        }
        
/** Temas sugeridos cuando se pide recurso sin tema (mismo orden que en el mensaje). */
var SUGGESTED_TOPIC_BUTTONS = [
    { key: 'liderazgo', label: 'Liderazgo' },
    { key: 'comunicacion', label: 'Comunicación' },
    { key: 'ingles', label: 'Inglés' }
];

/**
 * Añade mensaje de IA con botones de tema sugeridos (Liderazgo, Comunicación, Inglés).
 * Se usa cuando el usuario pidió un recurso sin tema (quiz, flashcards, plan, podcast).
 * @param {string} resourceType - 'quiz' | 'flashcards' | 'studyPlan' | 'podcast'
 * @param {string} text - Texto del mensaje (ej: "¿Sobre qué tema quieres el quiz?...")
 */
function addMessageWithTopicChoiceButtons(resourceType, text) {
    var body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    var timestamp = formatTime();
    var messageHTML = createMessageHTML('ai', text, timestamp, false, false);
    var choicesId = 'topic-choices-' + Date.now();
    var buttonsHTML = SUGGESTED_TOPIC_BUTTONS.map(function(t) {
        return '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-study-chat__material-choice-btn" data-topic-key="' + (t.key.replace(/"/g, '&quot;')) + '" data-topic-label="' + (t.label.replace(/"/g, '&quot;')) + '"><span>' + t.label + '</span></button>';
    }).join('');
    var choicesHTML = '<div class="ubits-study-chat__message-with-choices">' +
        messageHTML +
        '<div class="ubits-study-chat__material-choices" id="' + choicesId + '">' +
        buttonsHTML +
        '</div></div>';
    body.insertAdjacentHTML('beforeend', choicesHTML);
    var wrapperEl = body.lastElementChild;
    var messageEl = wrapperEl.querySelector('.ubits-study-chat__message');
    if (messageEl) animateWordsInMessage(messageEl);
    wrapperEl.classList.add('ubits-study-chat__message-with-choices--reveal');
    setTimeout(function() { wrapperEl.classList.remove('ubits-study-chat__message-with-choices--reveal'); }, 520);
    body.scrollTop = body.scrollHeight;
    pushCurrentChatMessage({ type: 'ai', text: text, quickReplies: 'topic', waitingForTopicForResource: resourceType });

    var choicesEl = document.getElementById(choicesId);
    if (!choicesEl) return;
    choicesEl.querySelectorAll('.ubits-study-chat__material-choice-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var topicKey = this.getAttribute('data-topic-key');
            var topicLabel = this.getAttribute('data-topic-label');
            if (!topicKey) return;
            chatState.waitingForTopicForResource = null;
            chatState.currentTopic = topicKey;
            hideWelcomeBlock();
            if (resourceType === 'quiz') {
                renderTutorPanel('quiz', topicKey);
                if (typeof addResourceMessage === 'function') addResourceMessage('quiz', topicKey, false);
            } else if (resourceType === 'flashcards') {
                renderTutorPanel('flashcards', topicKey);
                if (typeof addResourceMessage === 'function') addResourceMessage('flashcards', topicKey, false);
            } else if (resourceType === 'studyPlan') {
                var plan = getStudyPlanForTopic(topicKey);
                if (plan) {
                    renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                    if (typeof addResourceMessage === 'function') addResourceMessage('studyPlan', topicKey, false);
                }
            } else if (resourceType === 'podcast') {
                var podLabel = TOPIC_LABELS[topicKey] || topicKey;
                renderTutorPanel('podcast', topicKey, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                if (typeof addResourceMessage === 'function') addResourceMessage('podcast', topicKey, false);
            }
            choicesEl.style.display = 'none';
            pushCurrentChatMessage('user', topicLabel);
            var userMsgHtml = createMessageHTML('user', topicLabel, formatTime(), false, false);
            body.insertAdjacentHTML('beforeend', userMsgHtml);
            body.scrollTop = body.scrollHeight;
            refreshHistorialIfOpen();
        });
    });
}

function addMessage(type, text, showActions = false, regenerateFunction = null) {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    if (type === 'user') {
        hideWelcomeBlock();
        pushCurrentChatMessage('user', text);
        notifyModoEstudioIaActionsVisibility();
    }
    
    if (type === 'ai') {
        pushCurrentChatMessage('ai', text);
        removeTypingMessage();
        const timestamp = formatTime();
        const messageHTML = createMessageHTML(type, text, timestamp, showActions, false);
        body.insertAdjacentHTML('beforeend', messageHTML);
        const messageEl = body.lastElementChild;
        chatState.lastAIMessageElement = messageEl;
        chatState.lastAIMessageText = text;
        chatState.lastRegenerateFunction = regenerateFunction;
        if (messageEl) {
            messageEl.classList.add('ubits-study-chat__message--reveal');
            setTimeout(function() { messageEl.classList.remove('ubits-study-chat__message--reveal'); }, 520);
            animateWordsInMessage(messageEl);
            attachAIMessageActions(messageEl, text, regenerateFunction);
        }
        runPendingCardsRender(messageEl);
        body.scrollTop = body.scrollHeight;
        return;
    }
    
    const timestamp = formatTime();
    const messageHTML = createMessageHTML(type, text, timestamp, showActions, false);
    body.insertAdjacentHTML('beforeend', messageHTML);
    body.scrollTop = body.scrollHeight;
}

/**
 * Muestra un mensaje de typing (carga)
 */
function showTypingMessage() {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    const timestamp = formatTime();
    const messageHTML = createMessageHTML('ai', '', timestamp, false, true);
    body.insertAdjacentHTML('beforeend', messageHTML);
    body.scrollTop = body.scrollHeight;
    
    return body.lastElementChild;
}

/**
 * Remueve el mensaje de typing
 */
function removeTypingMessage() {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    const typingMessage = body.querySelector('.ubits-study-chat__text-globe--typing');
    if (typingMessage) {
        typingMessage.closest('.ubits-study-chat__message').remove();
    }
}

/**
 * Inicializa el chat de estudio (soporta Modo Tutor IA con empty state y panel derecho)
 * @param {string} containerId - ID del contenedor donde se renderizará el chat
 * @param {Object} options - userFirstName, competencies[], rightPanelId, placeholderId
 */
function initStudyChat(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`UBITS Study Chat: No se encontró el contenedor con ID "${containerId}"`);
        return;
    }
    chatState.userFirstName = options.userFirstName || chatState.userFirstName;
    chatState.competencies = options.competencies || [];
    chatState.rightPanelId = options.rightPanelId || null;
    chatState.placeholderId = options.placeholderId || null;
    chatState.welcomeLayout = options.welcomeLayout === true; // Pantalla bienvenida: input debajo del mensaje, menos ancho, sin icono ni advertencia
    chatState.podcastDefaults = options.podcastDefaults || null;
    chatState.competencyTopics = {};
    chatState.competencies.forEach(c => { chatState.competencyTopics[c] = COMPETENCY_TO_TOPIC[c] || c.toLowerCase().replace(/\s/g, ''); });
    
    container.innerHTML = createStudyChatHTML(options);
    if (typeof window.initTooltip === 'function') {
        window.initTooltip('#ubits-study-chat [data-tooltip]');
    }
    if (chatState.welcomeLayout) {
        const root = document.getElementById('ubits-study-chat');
        if (root) {
            root.classList.add('ubits-study-chat--welcome');
            const wrapper = root.closest('.modo-tutor-ia-chat-main');
            if (wrapper) wrapper.classList.add('study-chat-wrapper--welcome');
        }
    }

    var headerTitleInput = document.getElementById('ubits-study-chat-header-title');
    if (headerTitleInput) {
        headerTitleInput.addEventListener('blur', commitChatHeaderTitle);
        headerTitleInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                headerTitleInput.blur();
            }
        });
    }
    
    if (chatState.competencies.length === 0) {
    addMessage('ai', '¡Hola! ¿En qué puedo ayudarte?', true);
    }
    
    const input = document.getElementById('ubits-study-chat-input');
    const sendBtn = document.getElementById('ubits-study-chat-send-btn');
    const attachBtn = document.getElementById('ubits-study-chat-attach-btn');
    const suggestionBtns = document.querySelectorAll('.ubits-study-chat__suggestions .ubits-button');
    const competencyChips = document.querySelectorAll('.ubits-study-chat__competency-chip');
    
    // Auto-resize del textarea
    if (input) {
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // Enviar con Enter (sin Shift)
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Botón enviar
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // Botón adjuntar (por ahora solo log)
    if (attachBtn) {
        attachBtn.addEventListener('click', function() {
            console.log('Adjuntar archivo');
        });
    }
    
    // Chips de competencias (Modo Tutor): al clic = elegir tema y ofrecer quiz/flashcards/guía con botones
    competencyChips.forEach(btn => {
        btn.addEventListener('click', function() {
            hideWelcomeBlock();
            const topic = this.getAttribute('data-competency');
            const label = this.getAttribute('data-label') || topic;
            chatState.currentTopic = topic;
            chatState.waitingForMaterialChoice = true;
            addMessage('user', label);
            addMessageWithMaterialChoiceButtons(label, topic);
        });
    });
    
    // Botones de sugerencias (modo clásico cuando no hay competencias)
    suggestionBtns.forEach(btn => {
        if (btn.classList.contains('ubits-study-chat__competency-chip')) return;
        btn.addEventListener('click', function() {
            const suggestion = this.getAttribute('data-suggestion');
            let message = '';
            let response = '';
            switch(suggestion) {
                case 'contenidos':
                    message = 'Sugerencias de contenidos';
                    response = '¡Perfecto! Te puedo ayudar a encontrar contenidos personalizados. ¿Sobre qué tema te gustaría capacitarte?';
                    chatState.waitingForTopic = true;
                    chatState.currentTopic = null;
                    chatState.suggestedCourses = [];
                    break;
                case 'plan':
                    message = 'Crear plan de formación';
                    response = '¡Excelente idea! ¿Sobre qué tema te gustaría crear el plan de formación?';
                    chatState.waitingForPlanTopic = true;
                    chatState.waitingForTopic = false;
                    chatState.currentPlan = null;
                    break;
                case 'tutor':
                    message = 'Sé mi tutor';
                    response = '¡Claro! ¿Qué tema te gustaría que revisemos juntos hoy?';
                    chatState.waitingForTopic = false;
                    break;
            }
            if (message && response) {
                addMessage('user', message);
                    addMessage('ai', response, true);
            }
        });
    });
    
    // Función para generar respuesta predefinida basada en el mensaje del usuario
    function generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase().trim();
        var topicPatterns = [
            { key: 'liderazgo', regex: /liderazgo|lider/ },
            { key: 'comunicacion', regex: /comunicaci[oó]n/ },
            { key: 'ingles', regex: /ingl[eé]s/ },
            { key: 'japones', regex: /japon[eé]s|japonesa/ },
            { key: 'hiragana', regex: /hiragana/ }
        ];
        var hasTopicInMessage = topicPatterns.some(function(p) { return p.regex.test(lowerMessage); });

        // ----- Usuario ya pidió un recurso sin tema: ahora respondió con el tema -----
        if (chatState.waitingForTopicForResource) {
            var resourceType = chatState.waitingForTopicForResource;
            chatState.waitingForTopicForResource = null;
            var matchedTopic = null;
            for (var t = 0; t < topicPatterns.length; t++) {
                if (topicPatterns[t].regex.test(lowerMessage)) {
                    matchedTopic = topicPatterns[t].key;
                    break;
                }
            }
            if (matchedTopic) {
                hideWelcomeBlock();
                chatState.currentTopic = matchedTopic;
                var label = TOPIC_LABELS[matchedTopic] || matchedTopic;
                if (resourceType === 'quiz') {
                    renderTutorPanel('quiz', matchedTopic);
                    return { resourceMessage: { type: 'quiz', topic: matchedTopic }, regenerateFunction: null };
                }
                if (resourceType === 'flashcards') {
                    renderTutorPanel('flashcards', matchedTopic);
                    return { resourceMessage: { type: 'flashcards', topic: matchedTopic }, regenerateFunction: null };
                }
                if (resourceType === 'studyPlan' && matchedTopic !== 'hiragana' && STUDY_PLAN_TOPICS.indexOf(matchedTopic) >= 0) {
                    var plan = getStudyPlanForTopic(matchedTopic);
                    if (plan) {
                        renderTutorPanel('studyPlan', matchedTopic, { studyPlan: plan });
                        return { resourceMessage: { type: 'studyPlan', topic: matchedTopic }, regenerateFunction: null };
                    }
                }
                if (resourceType === 'podcast') {
                    var podLabel = TOPIC_LABELS[matchedTopic] || matchedTopic;
                    renderTutorPanel('podcast', matchedTopic, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                    return { resourceMessage: { type: 'podcast', topic: matchedTopic }, regenerateFunction: null };
                }
            }
            var resourceLabel = resourceType === 'quiz' ? 'quiz' : resourceType === 'flashcards' ? 'flashcards' : resourceType === 'studyPlan' ? 'plan de estudio' : 'podcast';
            chatState.waitingForTopicForResource = resourceType;
            return { text: 'No reconozco ese tema. Te recomiendo Liderazgo, Comunicación o Inglés. ¿Sobre cuál quieres el ' + resourceLabel + '?', regenerateFunction: null, topicChoice: { resourceType: resourceType } };
        }

        // ----- Pidió solo el recurso sin tema: si ya hay tema en el chat, usarlo; si no, preguntar -----
        var resourceOnly = !hasTopicInMessage && lowerMessage.length <= 50 && (
            /^quiz$/.test(lowerMessage) || /^flashcards?$/.test(lowerMessage) || /^podcast$/.test(lowerMessage) ||
            /^plan(\s+de\s+estudio)?$/.test(lowerMessage) || /^(dame|quiero|genera|quiero un?)\s+(un?\s+)?(quiz|podcast|flashcards?|plan(\s+de\s+estudio)?)$/.test(lowerMessage)
        );
        if (resourceOnly) {
            var resType = /podcast/.test(lowerMessage) ? 'podcast' : /flashcard/.test(lowerMessage) ? 'flashcards' : /plan/.test(lowerMessage) ? 'studyPlan' : 'quiz';
            var inferredTopic = chatState.currentTopic && topicPatterns.some(function(p) { return p.key === chatState.currentTopic; }) ? chatState.currentTopic : null;
            if (inferredTopic) {
                hideWelcomeBlock();
                chatState.waitingForTopicForResource = null;
                if (resType === 'quiz') {
                    renderTutorPanel('quiz', inferredTopic);
                    return { resourceMessage: { type: 'quiz', topic: inferredTopic }, regenerateFunction: null };
                }
                if (resType === 'flashcards') {
                    renderTutorPanel('flashcards', inferredTopic);
                    return { resourceMessage: { type: 'flashcards', topic: inferredTopic }, regenerateFunction: null };
                }
                if (resType === 'studyPlan' && STUDY_PLAN_TOPICS.indexOf(inferredTopic) >= 0) {
                    var plan = getStudyPlanForTopic(inferredTopic);
                    if (plan) renderTutorPanel('studyPlan', inferredTopic, { studyPlan: plan });
                    return { resourceMessage: { type: 'studyPlan', topic: inferredTopic }, regenerateFunction: null };
                }
                if (resType === 'podcast') {
                    var podLabel = TOPIC_LABELS[inferredTopic] || inferredTopic;
                    renderTutorPanel('podcast', inferredTopic, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                    return { resourceMessage: { type: 'podcast', topic: inferredTopic }, regenerateFunction: null };
                }
            }
            chatState.waitingForTopicForResource = resType;
            var resName = resType === 'quiz' ? 'quiz' : resType === 'flashcards' ? 'flashcards' : resType === 'studyPlan' ? 'plan de estudio' : 'podcast';
            return { text: '¿Sobre qué tema quieres el ' + resName + '? Te recomiendo Liderazgo, Comunicación o Inglés, pero puedes escribir el tema que prefieras.', regenerateFunction: null, topicChoice: { resourceType: resType } };
        }

        // ----- Abrir directo si escribe "quiz de [tema]", "flashcards de [tema]" o "plan de [tema]" -----
        for (var i = 0; i < topicPatterns.length; i++) {
            var topicKey = topicPatterns[i].key;
            if (!topicPatterns[i].regex.test(lowerMessage)) continue;
            if (lowerMessage.includes('quiz')) {
                hideWelcomeBlock();
                chatState.currentTopic = topicKey;
                chatState.waitingForMaterialChoice = false;
                renderTutorPanel('quiz', topicKey);
                return { resourceMessage: { type: 'quiz', topic: topicKey }, regenerateFunction: null };
            }
            if (lowerMessage.includes('flashcard')) {
                hideWelcomeBlock();
                chatState.currentTopic = topicKey;
                chatState.waitingForMaterialChoice = false;
                renderTutorPanel('flashcards', topicKey);
                return { resourceMessage: { type: 'flashcards', topic: topicKey }, regenerateFunction: null };
            }
            if ((lowerMessage.includes('plan') || lowerMessage.includes('plan de estudio')) && topicKey !== 'hiragana' && STUDY_PLAN_TOPICS.indexOf(topicKey) >= 0) {
                hideWelcomeBlock();
                chatState.currentTopic = topicKey;
                chatState.waitingForMaterialChoice = false;
                var plan = getStudyPlanForTopic(topicKey);
                if (plan) renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                return { resourceMessage: { type: 'studyPlan', topic: topicKey }, regenerateFunction: null };
            }
            if (lowerMessage.includes('podcast')) {
                hideWelcomeBlock();
                chatState.currentTopic = topicKey;
                chatState.waitingForMaterialChoice = false;
                var podLabel = TOPIC_LABELS[topicKey] || topicKey;
                renderTutorPanel('podcast', topicKey, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                return { resourceMessage: { type: 'podcast', topic: topicKey }, regenerateFunction: null };
            }
        }
        
        // ----- Modo Tutor IA: elección de material (quiz / flashcards / guía) -----
        if (chatState.waitingForMaterialChoice && chatState.currentTopic) {
            var topicKey = chatState.currentTopic;
            if (lowerMessage.includes('quiz') || lowerMessage === '1') {
                chatState.waitingForMaterialChoice = false;
                renderTutorPanel('quiz', topicKey);
                return { resourceMessage: { type: 'quiz', topic: topicKey }, regenerateFunction: null };
            }
            if (lowerMessage.includes('flashcard') || lowerMessage.includes('tarjeta')) {
                chatState.waitingForMaterialChoice = false;
                renderTutorPanel('flashcards', topicKey);
                return { resourceMessage: { type: 'flashcards', topic: topicKey }, regenerateFunction: null };
            }
            if (lowerMessage.includes('plan de estudio') || lowerMessage.includes('guía') || lowerMessage.includes('guia')) {
                chatState.waitingForMaterialChoice = false;
                if (STUDY_PLAN_TOPICS.indexOf(topicKey) >= 0) {
                    var plan = getStudyPlanForTopic(topicKey);
                    if (plan) renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                    return { resourceMessage: { type: 'studyPlan', topic: topicKey }, regenerateFunction: null };
                }
                return { text: 'El plan de estudio con contenidos UBITS está disponible solo para Liderazgo, Comunicación e Inglés. Para ' + (topicKey === 'japones' || topicKey === 'hiragana' ? 'Japonés' : 'este tema') + ' puedes usar Quiz o Flashcards.', regenerateFunction: null };
            }
            if (lowerMessage.includes('podcast')) {
                chatState.waitingForMaterialChoice = false;
                var podLabel = TOPIC_LABELS[topicKey] || topicKey;
                renderTutorPanel('podcast', topicKey, { title: 'Podcast de ' + podLabel, audioUrl: '', transcription: 'La transcripción se mostrará aquí cuando tengas el audio generado.' });
                return { resourceMessage: { type: 'podcast', topic: topicKey }, regenerateFunction: null };
            }
        }
        
        // ----- Maratón / muchas preguntas de hiragana: abrir quiz de 50 preguntas -----
        if (/hiragana/.test(lowerMessage) && (/marat[oó]n|preguntas|\b50\b/.test(lowerMessage))) {
            hideWelcomeBlock();
            chatState.currentTopic = 'hiragana';
            chatState.waitingForMaterialChoice = false;
            renderTutorPanel('quiz', 'hiragana');
            return { resourceMessage: { type: 'quiz', topic: 'hiragana' }, regenerateFunction: null };
        }
        
        // ----- Modo Tutor IA: usuario escribe un tema -----
        const topicMatch = { liderazgo: /liderazgo|lider/, comunicacion: /comunicaci[oó]n/, ingles: /ingl[eé]s/, japones: /japon[eé]s|japonesa/ };
        for (const [topic, regex] of Object.entries(topicMatch)) {
            if (regex.test(lowerMessage)) {
                chatState.currentTopic = topic;
                chatState.waitingForMaterialChoice = true;
                const label = topic === 'liderazgo' ? 'Liderazgo' : topic === 'comunicacion' ? 'Comunicación' : topic === 'ingles' ? 'Inglés' : 'Japonés';
                return { materialChoice: { label: label, topic: topic }, regenerateFunction: null };
            }
        }
        
        // Recordar competencias si escribe algo genérico en modo tutor
        if (chatState.competencies.length > 0 && (lowerMessage.includes('ayuda') || lowerMessage.includes('aprender') && lowerMessage.length < 30)) {
            const names = chatState.competencies.join(', ');
            return { text: 'Tienes asignadas: ' + names + '. ¿Empezamos por alguna? Puedes hacer clic en los botones de arriba o escribir otro tema (por ejemplo "japonés" si quieres aprender algo que no esté en tu catálogo).', regenerateFunction: null };
        }
        
        // Si estamos esperando respuesta sobre el tema del plan
        if (chatState.waitingForPlanTopic) {
            // Detectar si el usuario menciona "liderazgo"
            if (lowerMessage.includes('liderazgo') || lowerMessage.includes('lider')) {
                chatState.waitingForPlanTopic = false;
                chatState.waitingForPlanAcceptance = true;
                
                // Función para regenerar el plan con otros cursos
                const createPlanRegenerateFunction = function() {
                    return function() {
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        // Generar nuevo plan de formación
                        const plan = generateLeadershipPlan();
                        chatState.currentPlan = plan;
                        
                        const planText = formatPlanHTML(plan);
                        const responseText = '¡Perfecto! He diseñado un plan de formación en liderazgo para ti. Aquí están los detalles:' + planText;
                        
                        const newRegenerateFunction = createPlanRegenerateFunction();
                        addMessage('ai', responseText, true, newRegenerateFunction);
                    };
                };
                
                const plan = generateLeadershipPlan();
                chatState.currentPlan = plan;
                const planText = formatPlanHTML(plan);
                const responseText = '¡Perfecto! He diseñado un plan de formación en liderazgo para ti. Aquí están los detalles:' + planText;
                const regenerateFunction = createPlanRegenerateFunction();
                if (chatState.rightPanelId) {
                    renderTutorPanel('plan', null, { plan: plan });
                    return { text: 'Te armé un plan de formación en liderazgo. Está en el panel de la derecha. ¿Deseas aceptar o modificar? Responde "acepto" o "modificar".', regenerateFunction: regenerateFunction };
                }
                return { text: responseText, regenerateFunction: regenerateFunction };
            } else {
                chatState.waitingForPlanTopic = false;
                return {
                    text: 'Entiendo. Por ahora puedo ayudarte a crear planes de formación sobre liderazgo. ¿Te gustaría crear un plan de formación en liderazgo?',
                    regenerateFunction: null
                };
            }
        }
        
        // Si estamos esperando que el usuario acepte o modifique el plan
        if (chatState.waitingForPlanAcceptance && chatState.currentPlan) {
            if (lowerMessage.includes('acepto') || lowerMessage.includes('aceptar') || lowerMessage.includes('sí') || lowerMessage.includes('si') || lowerMessage.includes('ok') || lowerMessage.includes('de acuerdo')) {
                chatState.waitingForPlanAcceptance = false;
                
                const plan = chatState.currentPlan;
                const planId = Math.floor(Math.random() * 10000); // ID aleatorio para el ejemplo
                const planLink = `https://ubits.com/planes/${planId}`; // Link de ejemplo
                
                const confirmationText = `¡Excelente! He creado el plan de formación a tu nombre.\n\n` +
                    `Detalles del plan:\n` +
                    `- Título: ${plan.title}\n` +
                    `- Número de cursos: ${plan.courses.length}\n` +
                    `- Fecha de inicio: ${plan.startDate}\n` +
                    `- Fecha de fin: ${plan.endDate}\n\n` +
                    `Puedes acceder a tu plan aquí: ${planLink}`;
                
                // Limpiar el plan actual
                chatState.currentPlan = null;
                
                return {
                    text: confirmationText,
                    regenerateFunction: null
                };
            } else if (lowerMessage.includes('modificar') || lowerMessage.includes('cambiar') || lowerMessage.includes('otro')) {
                // Regenerar el plan con otros cursos
                chatState.waitingForPlanAcceptance = true;
                
                // Función para regenerar el plan con otros cursos
                const createPlanRegenerateFunction = function() {
                    return function() {
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        // Generar nuevo plan de formación
                        const plan = generateLeadershipPlan();
                        chatState.currentPlan = plan;
                        
                        const planText = formatPlanHTML(plan);
                        const responseText = '¡Por supuesto! He modificado el plan con otros cursos. Aquí está la nueva propuesta:' + planText;
                        
                        const newRegenerateFunction = createPlanRegenerateFunction();
                        addMessage('ai', responseText, true, newRegenerateFunction);
                    };
                };
                
                const plan = generateLeadershipPlan();
                chatState.currentPlan = plan;
                const planText = formatPlanHTML(plan);
                const responseText = '¡Por supuesto! He modificado el plan con otros cursos. Aquí está la nueva propuesta:' + planText;
                const regenerateFunction = createPlanRegenerateFunction();
                if (chatState.rightPanelId) {
                    renderTutorPanel('plan', null, { plan: plan });
                    return { text: 'He actualizado el plan en el panel de la derecha. ¿Aceptas o quieres modificar de nuevo?', regenerateFunction: regenerateFunction };
                }
                return { text: responseText, regenerateFunction: regenerateFunction };
            } else {
                return {
                    text: 'Por favor, responde "acepto" si quieres crear el plan con estos cursos, o "modificar" si quieres cambiar el listado de cursos.',
                    regenerateFunction: null
                };
            }
        }
        
        // Si estamos esperando respuesta sobre el tema (para sugerencias de contenidos)
        if (chatState.waitingForTopic) {
            // Detectar si el usuario menciona "liderazgo"
            if (lowerMessage.includes('liderazgo') || lowerMessage.includes('lider')) {
                chatState.currentTopic = 'liderazgo';
                chatState.waitingForTopic = false;
                
                // Función para regenerar esta respuesta con otros cursos
                const createRegenerateFunction = function() {
                    return function() {
                        // Remover los últimos 3 cursos de la lista de sugeridos (para poder sugerirlos de nuevo)
                        chatState.suggestedCourses = chatState.suggestedCourses.slice(0, -3);
                        
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        const responseData = generateLeadershipCoursesResponse(3);
                        const newRegenerateFunction = createRegenerateFunction();
                        addMessage('ai', responseData.text, true, newRegenerateFunction);
                    };
                };
                
                const regenerateFunction = createRegenerateFunction();
                const responseData = generateLeadershipCoursesResponse(3);
                if (chatState.rightPanelId) {
                    renderTutorPanel('courses', null, { courses: responseData.courses });
                    return { text: 'Te sugerí ' + responseData.courses.length + ' cursos. Míralos en el panel de la derecha. ¿Quieres que agregue más? Dime "agrega más" u "otros 3".', regenerateFunction: regenerateFunction };
                }
                return { text: responseData.text, regenerateFunction: regenerateFunction };
            } else {
                chatState.waitingForTopic = false;
                return { text: 'Entiendo. Te puedo ayudar con varios temas. Por ahora, puedo sugerirte cursos sobre liderazgo, tecnología, comunicación, gestión de proyectos y más. ¿Hay algún tema específico que te interese?', regenerateFunction: null };
            }
        }
        
        // Detectar si el usuario pide agregar más cursos
        if (chatState.currentTopic === 'liderazgo' && 
            (lowerMessage.includes('agrégame otros 3') || 
             lowerMessage.includes('agrega más') || 
             lowerMessage.includes('otros 3') ||
             lowerMessage.includes('más cursos'))) {
            
            // Función para regenerar esta respuesta con otros cursos (solo los últimos 3)
            const regenerateFunction = function() {
                // Remover los últimos 3 cursos de la lista de sugeridos (para poder sugerirlos de nuevo)
                chatState.suggestedCourses = chatState.suggestedCourses.slice(0, -3);
                
                if (chatState.lastAIMessageElement) {
                    chatState.lastAIMessageElement.remove();
                }
                
                // Crear función recursiva para regenerar
                const createRegenerateFunction = function() {
                    return function() {
                        // Remover los últimos 3 cursos de la lista de sugeridos
                        chatState.suggestedCourses = chatState.suggestedCourses.slice(0, -3);
                        
                        if (chatState.lastAIMessageElement) {
                            chatState.lastAIMessageElement.remove();
                        }
                        
                        // Agregar otros 3 cursos manteniendo los anteriores
                        const responseData = generateLeadershipCoursesResponse(3, true);
                        const newRegenerateFunction = createRegenerateFunction();
                        addMessage('ai', responseData.text, true, newRegenerateFunction);
                    };
                };
                
                // Agregar otros 3 cursos manteniendo los anteriores
                const responseData = generateLeadershipCoursesResponse(3, true);
                const newRegenerateFunction = createRegenerateFunction();
                addMessage('ai', responseData.text, true, newRegenerateFunction);
            };
            
            const responseData = generateLeadershipCoursesResponse(3, true);
            if (chatState.rightPanelId) {
                const allCourses = chatState.suggestedCourses;
                renderTutorPanel('courses', null, { courses: allCourses });
                return { text: 'Listo, agregué más cursos. Están en el panel de la derecha. ¿Quieres otros 3?', regenerateFunction: regenerateFunction };
            }
            return { text: responseData.text, regenerateFunction: regenerateFunction };
        }
        
        // Respuestas predefinidas basadas en palabras clave
        if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas tardes')) {
            return {
                text: '¡Hola! Me alegra saludarte. Estoy aquí para ayudarte con tus necesidades de aprendizaje y formación. ¿En qué puedo asistirte hoy?',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('curso') || lowerMessage.includes('contenido') || lowerMessage.includes('aprender')) {
            return {
                text: 'Excelente pregunta sobre contenidos de aprendizaje. Te puedo ayudar a encontrar cursos y recursos que se ajusten a tus necesidades. ¿Hay algún tema específico que te interese? Por ejemplo: liderazgo, tecnología, comunicación, gestión de proyectos, entre otros.',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('plan') || lowerMessage.includes('programa') || lowerMessage.includes('ruta')) {
            return {
                text: 'Perfecto, podemos crear un plan de formación personalizado para ti. Para diseñar el mejor plan, me ayudaría conocer: tus objetivos profesionales, las competencias que quieres desarrollar y el tiempo que puedes dedicar al aprendizaje. ¿Podrías compartirme esta información?',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('ayuda') || lowerMessage.includes('help') || lowerMessage.includes('cómo')) {
            return {
                text: '¡Por supuesto! Estoy aquí para ayudarte. Puedo asistirte con: sugerencias de contenidos, creación de planes de formación, explicación de conceptos, resolución de dudas y más. ¿Qué necesitas específicamente?',
                regenerateFunction: null
            };
        }
        
        if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
            return {
                text: '¡De nada! Es un placer ayudarte. Si tienes más preguntas o necesitas asistencia adicional, no dudes en preguntarme. ¡Que tengas un excelente día de aprendizaje!',
                regenerateFunction: null
            };
        }
        
        // Respuesta genérica por defecto
        return {
            text: 'Gracias por tu mensaje. Estoy aquí para ayudarte con tus necesidades de aprendizaje y formación. Puedo asistirte con sugerencias de contenidos, creación de planes de estudio, explicación de conceptos y más. ¿Hay algo específico en lo que pueda ayudarte?',
            regenerateFunction: null
        };
    }
    
    // Función para enviar mensaje
    function sendMessage() {
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        
        // Agregar mensaje del usuario
        addMessage('user', message);
        
        // Limpiar input
        input.value = '';
        input.style.height = 'auto';
        
        // Generar respuesta predefinida
        const responseData = generateResponse(message);
        const response = typeof responseData === 'object' ? responseData.text : responseData;
        const regenerateFunction = typeof responseData === 'object' ? responseData.regenerateFunction : null;
        const materialChoice = typeof responseData === 'object' ? responseData.materialChoice : null;
        const resourceMessage = typeof responseData === 'object' ? responseData.resourceMessage : null;
        const topicChoice = typeof responseData === 'object' ? responseData.topicChoice : null;
        
        // Mostrar respuesta de IA de inmediato (sin delay artificial)
        if (materialChoice) {
            addMessageWithMaterialChoiceButtons(materialChoice.label, materialChoice.topic);
        } else if (topicChoice && topicChoice.resourceType) {
            addMessageWithTopicChoiceButtons(topicChoice.resourceType, response);
        } else if (resourceMessage) {
            addResourceMessage(resourceMessage.type, resourceMessage.topic, false);
        } else {
            addMessage('ai', response, true, regenerateFunction);
    }
    }

    notifyModoEstudioIaActionsVisibility();
}

// Exportar funciones para uso global
window.initStudyChat = initStudyChat;
window.hasAnyConversations = hasAnyConversations;
window.addMessage = addMessage;
window.showTypingMessage = showTypingMessage;
window.removeTypingMessage = removeTypingMessage;
window.renderHistorialList = renderHistorialList;
window.startNewChat = startNewChat;
window.showOpenButtonsInChat = showOpenButtonsInChat;
window.openDeleteChatModal = openDeleteChatModal;
window.cancelDeleteChatModal = cancelDeleteChatModal;
window.confirmDeleteChat = confirmDeleteChat;

