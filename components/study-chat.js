/* ========================================
   UBITS STUDY CHAT COMPONENT
   JavaScript para el chat de modo estudio IA
   ======================================== */

/** Estado del plan de estudio cuando el panel está abierto (para edición). */
var currentStudyPlanState = null;

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

// Base de datos de cursos de liderazgo (las rutas se ajustan dinámicamente)
const LEADERSHIP_COURSES = [
    { 
        title: 'Cambio en el estilo de liderazgo', 
        imagePath: 'cards-learn/cambio-en-el-estilo-de-liderazgo.jpeg' 
    },
    { 
        title: 'Cómo ejercer el liderazgo inclusivo', 
        imagePath: 'cards-learn/como-ejercer-el-liderazgo-inclusivo.jpeg' 
    },
    { 
        title: 'El buen coaching inspira liderazgo', 
        imagePath: 'cards-learn/el-buen-coaching-inspira-liderazgo.jpeg' 
    },
    { 
        title: 'Emplea los valores del liderazgo femenino', 
        imagePath: 'cards-learn/emplea-los-valores-del-liderazgo-femenino.jpeg' 
    },
    { 
        title: 'Implementa el liderazgo colectivo en tu empresa', 
        imagePath: 'cards-learn/implementa-el-liderazgo-coletivo-en-tu-empresa.jpeg' 
    },
    { 
        title: 'La clave del liderazgo inclusivo', 
        imagePath: 'cards-learn/la-clave-del-liderazgo-inclusivo.jpeg' 
    },
    { 
        title: 'La confianza: una clave para el liderazgo', 
        imagePath: 'cards-learn/la-confianza-una-clave-para-el-liderazgo.jpeg' 
    },
    { 
        title: 'Liderar como los grandes directores de orquesta', 
        imagePath: 'cards-learn/liderar-como-los-grandes-directores-de-orquesta.jpeg' 
    },
    { 
        title: 'Liderar con inteligencia emocional', 
        imagePath: 'cards-learn/liderar-con-inteligencia-emocional.jpeg' 
    },
    { 
        title: 'Liderazgo en tiempos de crisis', 
        imagePath: 'cards-learn/liderazgo-en-tiempos-de-crisi.jpeg' 
    },
    { 
        title: 'Liderazgo femenino', 
        imagePath: 'cards-learn/liderazgo-femenino.jpeg' 
    },
    { 
        title: 'Líderes cotidianos', 
        imagePath: 'cards-learn/lideres-cotidianos.jpeg' 
    },
    { 
        title: 'Neuroliderazgo: configura tu mente', 
        imagePath: 'cards-learn/neuroliderazgo-configura-tu-mente.jpeg' 
    },
    { 
        title: 'Potencia tu liderazgo en entornos VUCA', 
        imagePath: 'cards-learn/potencia-tu-liderazgo-en-entornos-vuca.jpeg' 
    },
    { 
        title: '¿Qué hace que algunos equipos tengan alto desempeño?', 
        imagePath: 'cards-learn/que-hace-que-alugnos-equipos-tengan-alto-desempeno.jpeg' 
    },
    { 
        title: 'Ruta: Desarrollo de habilidades de liderazgo', 
        imagePath: 'cards-learn/ruta-desarrollo-de-habilidades-de-liderazgo.jpeg' 
    }
];

// Cursos UBITS por tema (para Plan de estudio) - solo competencias en catálogo
const COURSES_BY_TOPIC = {
    liderazgo: LEADERSHIP_COURSES,
    comunicacion: [
        { title: 'Cómo hablar y escuchar mejor: competencias de comunicación oral', imagePath: 'cards-learn/como-hablar-y-escuchar-mejor-competencias-de-comunicacion-oral.jpeg' },
        { title: 'Comunicación y empatía: claves para el éxito en equipo', imagePath: 'cards-learn/comunicacion-y-empatia-claves-para-el-exito-en-equipo.jpeg' },
        { title: 'De la comunicación a la neurocomunicación', imagePath: 'cards-learn/de-la-comunicacion-a-la-neurocomunicacion.jpeg' },
        { title: 'Agilidad emocional', imagePath: 'cards-learn/agilidad-emocional.jpeg' },
        { title: 'Reconéctate contigo y con los demás: tips para el bienestar emocional', imagePath: 'cards-learn/reconectate-contigo-y-con-los-demas-tips-para-el-bienestar-emocional.jpeg' }
    ],
    ingles: [
        { title: 'Introducción al desarrollo web', imagePath: 'cards-learn/introduccion-al-desarrollo-web.jpeg' },
        { title: 'Digital marketing master', imagePath: 'cards-learn/digital-marketing-master.jpeg' },
        { title: 'Introducción al growth marketing', imagePath: 'cards-learn/introduccion-al-growth-marketing.jpeg' },
        { title: 'Ingeniería de prompts: habla con la IA', imagePath: 'cards-learn/ingenieria-de-prompts-habla-con-la-ia.jpeg' },
        { title: 'Administración efectiva del tiempo', imagePath: 'cards-learn/administracion-efectiva-del-tiempo.jpg' }
    ]
};

/** Temas que tienen Plan de estudio (catálogo UBITS o japonés con tareas del chat). */
const STUDY_PLAN_TOPICS = ['liderazgo', 'comunicacion', 'ingles', 'japones'];

/** Tareas tipo actividad para Japonés (relacionadas con el chat): 10 alternativas por tarea para "Rehacer". */
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
    'Hacer quiz de escritura (hiragana)'
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

function generateStudyPlan(topicKey) {
    var label = TOPIC_LABELS[topicKey] || topicKey;
    var start = new Date();
    var end = new Date();
    end.setDate(end.getDate() + 28);
    var tasks = [];
    var courses = COURSES_BY_TOPIC[topicKey];
    if (courses && courses.length) {
        tasks = courses.slice(0, 6).map(function(c) {
            return { type: 'course', title: 'Ver contenido: ' + c.title, course: c };
        });
    } else if (topicKey === 'japones') {
        tasks = ACTIVITY_ALTERNATIVES_JAPANESE.slice(0, 6).map(function(text, i) {
            var alts = ACTIVITY_ALTERNATIVES_JAPANESE.slice();
            var idx = alts.indexOf(text);
            if (idx < 0) idx = 0;
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

const TUTOR_FLASHCARDS = {
    liderazgo: [
        { front: 'Liderazgo transformacional', back: 'Estilo que inspira cambios positivos y motiva al equipo con una visión compartida.' },
        { front: 'Feedback 360°', back: 'Evaluación que recibe un líder desde jefes, pares y colaboradores para mejorar.' },
        { front: 'Delegación efectiva', back: 'Asignar tareas y autoridad a otros manteniendo responsabilidad y seguimiento.' }
    ],
    comunicacion: [
        { front: 'Comunicación no verbal', back: 'Mensajes transmitidos con gestos, postura, mirada y tono de voz.' },
        { front: 'Barreras de comunicación', back: 'Ruido, suposiciones, emociones o idioma que dificultan el entendimiento.' },
        { front: 'Parafrasear', back: 'Repetir con tus palabras lo que dijo el otro para confirmar que entendiste.' }
    ],
    ingles: [
        { front: 'Present continuous', back: 'Estructura: am/is/are + verbo -ing. Ej: I am working.' },
        { front: 'Phrasal verb "take off"', back: 'Puede significar: despegar (avión) o quitarse (ropa).' },
        { front: ' "Actually"', back: 'En inglés suele significar "en realidad", no "actualmente".' }
    ],
    japones: [
        { front: 'Kana', back: 'Sistemas de escritura silábicos: hiragana y katakana.' },
        { front: 'Kanji', back: 'Caracteres de origen chino usados en japonés para muchas palabras.' },
        { front: 'Kudasai', back: 'Sufijo de cortesía que significa "por favor".' }
    ],
    hiragana: [
        { front: 'Vocales (a, i, u, e, o)', back: 'あ い う え お' },
        { front: 'Serie ka (か き く け こ)', back: 'Sonidos ka, ki, ku, ke, ko en hiragana.' },
        { front: 'Tsu pequeño (っ)', back: 'Indica pausa o geminación (consonante doble).' }
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
function renderTutorPanel(type, topic, extraData) {
    const panel = chatState.rightPanelId ? document.getElementById(chatState.rightPanelId) : null;
    const placeholder = chatState.placeholderId ? document.getElementById(chatState.placeholderId) : null;
    if (!panel) return;
    panel.classList.add('is-open');
    hideOpenButtonsInChat();
    const dataTopic = topic || chatState.currentTopic || 'liderazgo';
    const topicKey = dataTopic in TUTOR_QUIZ ? dataTopic : 'liderazgo';
    let html = '';
    if (type === 'quiz') {
        const questions = TUTOR_QUIZ[topicKey] || TUTOR_QUIZ.liderazgo;
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
                        <span class="study-chat-quiz-progress-wrong" aria-hidden="true">× <span class="study-chat-quiz-progress-wrong-n">0</span></span>
                        <span class="study-chat-quiz-progress-correct" aria-hidden="true">✓ <span class="study-chat-quiz-progress-correct-n">0</span></span>
                    </span>
                </div>
                <div class="study-chat-quiz-questions">${questions.map((qu, i) => `
                    <div class="study-chat-quiz-q" data-index="${i}" ${i > 0 ? 'style="display:none;"' : ''}>
                        <p class="ubits-body-md-regular study-chat-quiz-question-text">${i + 1}. ${qu.q}</p>
                        <div class="study-chat-quiz-options">${qu.options.map((opt, j) => `<label class="study-chat-quiz-opt" data-option-index="${j}"><input type="radio" name="quiz-${i}" value="${j}"><span class="study-chat-quiz-opt-text">${opt}</span></label>`).join('')}</div>
                        <div class="study-chat-quiz-feedback" style="display:none;" role="status"></div>
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
    } else if (type === 'flashcards') {
        const cards = TUTOR_FLASHCARDS[topicKey] || TUTOR_FLASHCARDS.liderazgo;
        const fcTotal = cards.length;
        const fcProgressBarsHtml = Array.from({ length: fcTotal }, (_, i) => '<span class="study-chat-fc-progress-bar" data-bar-index="' + i + '"></span>').join('');
        html = `<div class="study-chat-canvas-content study-chat-canvas-flashcards" data-topic="${topicKey}">
            <div class="study-chat-canvas-header">
                <span class="ubits-body-md-bold">Flashcards</span>
                <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>
            </div>
            <div class="study-chat-canvas-body">
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
                <div class="study-chat-fc-deck" data-cards='${JSON.stringify(cards).replace(/'/g, "&#39;")}' style="display:none;"></div>
            </div>
            <div class="study-chat-canvas-footer">
                <div class="study-chat-fc-actions">
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-fc-prev"><i class="far fa-chevron-left"></i><span>Anterior</span></button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-fc-next"><span>Siguiente</span><i class="far fa-chevron-right"></i></button>
                    <button class="ubits-button ubits-button--tertiary ubits-button--sm" id="study-chat-fc-shuffle"><i class="far fa-shuffle"></i><span>Barajar</span></button>
                </div>
            </div>
        </div>`;
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
    } else if (type === 'studyPlan' && extraData && extraData.studyPlan) {
        const sp = extraData.studyPlan;
        currentStudyPlanState = { plan: sp, topicKey: topicKey || '' };
        var priorityOpts = [
            { value: 'Alta', icon: 'far fa-chevrons-up', color: 'var(--ubits-feedback-accent-error)' },
            { value: 'Media', icon: 'far fa-chevron-up', color: 'var(--ubits-fg-1-medium)' },
            { value: 'Baja', icon: 'far fa-chevron-down', color: 'var(--ubits-feedback-accent-info)' }
        ];
        html = '<div class="study-chat-canvas-content study-chat-canvas-study-plan study-chat-canvas-study-plan-editable" data-topic="' + (topicKey || '') + '">' +
            '<div class="study-chat-canvas-header">' +
            '<span class="ubits-body-md-bold">Plan de estudio</span>' +
            '<button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only study-chat-canvas-close" title="Cerrar panel" aria-label="Cerrar panel"><i class="far fa-times"></i></button>' +
            '</div>' +
            '<div class="study-chat-canvas-body">' +
            '<div class="study-chat-study-plan-edit-row" id="study-chat-plan-input-title-wrap"><div id="study-chat-plan-input-title"></div></div>' +
            '<div class="study-chat-study-plan-edit-row study-chat-plan-priority-row">' +
            '<label class="study-chat-plan-edit-label ubits-body-sm-regular">Prioridad</label>' +
            '<div class="study-chat-plan-priority-dropdown-wrap">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm study-chat-plan-priority-trigger" id="study-chat-plan-priority-trigger" aria-haspopup="true" aria-expanded="false">' +
            '<span class="study-chat-plan-priority-trigger-text">' + (sp.priority || 'Media') + '</span><i class="far fa-chevron-down"></i></button>' +
            '<div class="study-chat-plan-priority-menu" id="study-chat-plan-priority-menu" role="menu" aria-label="Prioridad" style="display:none;">' +
            priorityOpts.map(function(o) {
                return '<button type="button" class="study-chat-plan-priority-option" role="menuitem" data-value="' + o.value + '"><i class="' + o.icon + '" style="color:' + o.color + '"></i><span class="ubits-body-sm-regular">' + o.value + '</span></button>';
            }).join('') +
            '</div>' +
            '</div></div>' +
            '<div class="study-chat-study-plan-edit-row" id="study-chat-plan-input-date-fin-wrap"><div id="study-chat-plan-input-date-fin"></div></div>' +
            '<p class="study-chat-study-plan-tasks-label ubits-body-sm-bold">Tareas</p>' +
            '<div class="study-chat-study-plan-tasks-cards" id="study-chat-plan-tasks-container"></div>' +
            '</div>' +
            '<div class="study-chat-canvas-footer">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="study-chat-plan-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-plan-create"><span>Crear plan</span></button>' +
            '</div></div>';
        panel.innerHTML = html;
        panel.classList.add('has-content');
        bindCanvasClose(panel);
        renderStudyPlanTaskCards(panel.querySelector('#study-chat-plan-tasks-container'), sp, topicKey || '');
        renderStudyPlanUbitsInputs(panel, sp, priorityOpts);
        bindStudyPlanPriorityMenu(panel, sp, priorityOpts);
        bindStudyPlanFooter(panel);
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
        showOpenButtonsInChat();
    });
}

function renderStudyPlanTaskCards(container, plan, topicKey) {
    if (!container || !plan || !plan.tasks) return;
    container.innerHTML = '';
    var priorityOpts = [
        { value: 'Alta', icon: 'far fa-chevrons-up', color: 'var(--ubits-feedback-accent-error)' },
        { value: 'Media', icon: 'far fa-chevron-up', color: 'var(--ubits-fg-1-medium)' },
        { value: 'Baja', icon: 'far fa-chevron-down', color: 'var(--ubits-feedback-accent-info)' }
    ];
    plan.tasks.forEach(function(task, idx) {
        var card = document.createElement('div');
        card.className = 'study-chat-plan-task-card study-chat-plan-task-card--' + (task.type || 'course');
        card.setAttribute('data-task-index', idx);
        var titleEsc = (task.title || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        var titleHtml = '<div class="study-chat-plan-task-card-title-wrap">' +
            '<span class="study-chat-plan-task-card-title ubits-body-sm-regular" data-task-index="' + idx + '">' + (task.title || '') + '</span>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm study-chat-plan-task-edit-name" data-task-index="' + idx + '" title="Editar nombre"><i class="far fa-pen"></i><span>Editar</span></button>' +
            '</div>';
        var actionsHtml = '<div class="study-chat-plan-task-card-actions">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm ubits-button--icon-only study-chat-plan-task-delete" data-task-index="' + idx + '" title="Eliminar" aria-label="Eliminar"><i class="far fa-trash"></i></button>';
        if (task.type === 'activity') {
            actionsHtml += '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm study-chat-plan-task-rehacer" data-task-index="' + idx + '" title="Rehacer (otra opción)"><i class="far fa-rotate-right"></i><span>Rehacer</span></button>';
        } else {
            actionsHtml += '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm study-chat-plan-task-cambiar" data-task-index="' + idx + '" title="Cambiar por otro curso"><i class="far fa-arrows-rotate"></i><span>Cambiar</span></button>';
        }
        actionsHtml += '</div>';
        card.innerHTML = '<div class="study-chat-plan-task-card-inner">' + titleHtml + actionsHtml + '</div>';
        container.appendChild(card);
    });
    bindStudyPlanTaskCardEvents(container, plan, topicKey);
}

function bindStudyPlanTaskCardEvents(container, plan, topicKey) {
    if (!container || !plan) return;
    var tasksContainer = container;
    var panel = container.closest('.study-chat-canvas-study-plan-editable');
    var priorityOpts = [
        { value: 'Alta', icon: 'far fa-chevrons-up', color: 'var(--ubits-feedback-accent-error)' },
        { value: 'Media', icon: 'far fa-chevron-up', color: 'var(--ubits-fg-1-medium)' },
        { value: 'Baja', icon: 'far fa-chevron-down', color: 'var(--ubits-feedback-accent-info)' }
    ];
    tasksContainer.querySelectorAll('.study-chat-plan-task-edit-name').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-task-index'), 10);
            var task = plan.tasks[idx];
            if (!task) return;
            var titleEl = tasksContainer.querySelector('.study-chat-plan-task-card-title[data-task-index="' + idx + '"]');
            if (!titleEl) return;
            var current = task.title || '';
            var newTitle = window.prompt('Editar nombre de la tarea', current);
            if (newTitle !== null && newTitle.trim() !== '') {
                task.title = newTitle.trim();
                titleEl.textContent = task.title;
            }
        });
    });
    tasksContainer.querySelectorAll('.study-chat-plan-task-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-task-index'), 10);
            plan.tasks.splice(idx, 1);
            renderStudyPlanTaskCards(tasksContainer, plan, topicKey);
        });
    });
    tasksContainer.querySelectorAll('.study-chat-plan-task-rehacer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-task-index'), 10);
            var task = plan.tasks[idx];
            if (!task || task.type !== 'activity' || !task.alternatives || !task.alternatives.length) return;
            task.currentIndex = ((task.currentIndex || 0) + 1) % task.alternatives.length;
            task.title = task.alternatives[task.currentIndex];
            var titleEl = tasksContainer.querySelector('.study-chat-plan-task-card-title[data-task-index="' + idx + '"]');
            if (titleEl) titleEl.textContent = task.title;
        });
    });
    tasksContainer.querySelectorAll('.study-chat-plan-task-cambiar').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.getAttribute('data-task-index'), 10);
            var task = plan.tasks[idx];
            if (!task || task.type !== 'course') return;
            var courses = COURSES_BY_TOPIC[topicKey];
            if (!courses || !courses.length) return;
            var others = courses.filter(function(c) { return c !== task.course && c.title !== task.course.title; });
            if (others.length === 0) return;
            var titles = others.map(function(c) { return c.title; });
            var chosen = window.prompt('Elige otro curso (escribe el número):\n' + others.map(function(c, i) { return (i + 1) + '. ' + c.title; }).join('\n'), '1');
            if (chosen === null) return;
            var num = parseInt(chosen, 10);
            if (num >= 1 && num <= others.length) {
                var newCourse = others[num - 1];
                task.course = newCourse;
                task.title = 'Ver contenido: ' + newCourse.title;
                var titleEl = tasksContainer.querySelector('.study-chat-plan-task-card-title[data-task-index="' + idx + '"]');
                if (titleEl) titleEl.textContent = task.title;
            }
        });
    });
}

function renderStudyPlanUbitsInputs(panel, sp, priorityOpts) {
    if (!panel || !sp || typeof window.createInput !== 'function') return;
    window.createInput({
        containerId: 'study-chat-plan-input-title',
        type: 'text',
        label: 'Título',
        placeholder: 'Nombre del plan',
        value: sp.title || '',
        onChange: function(v) { sp.title = v; }
    });
    window.createInput({
        containerId: 'study-chat-plan-input-date-fin',
        type: 'calendar',
        label: 'Fin',
        placeholder: 'Selecciona una fecha...',
        value: studyPlanDateToCalendarValue(sp.endDateValue),
        onChange: function(dateStr) {
            var iso = studyPlanDateFromCalendarValue(dateStr);
            sp.endDateValue = iso;
            if (iso) {
                var d = new Date(iso + 'T12:00:00');
                sp.endDate = formatStudyPlanDate(d);
            }
        }
    });
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

function bindStudyPlanFooter(panel) {
    var cancelBtn = panel.querySelector('#study-chat-plan-cancel');
    var createBtn = panel.querySelector('#study-chat-plan-create');
    if (cancelBtn) cancelBtn.addEventListener('click', function() {
        panel.classList.remove('is-open', 'has-content');
        panel.innerHTML = '';
        currentStudyPlanState = null;
        showOpenButtonsInChat();
    });
    if (createBtn) createBtn.addEventListener('click', function() {
        if (typeof showToast === 'function') showToast('success', 'Plan creado correctamente.');
        panel.classList.remove('is-open', 'has-content');
        panel.innerHTML = '';
        currentStudyPlanState = null;
        showOpenButtonsInChat();
    });
}

function renderCoursesInPanel(containerId, courses) {
    const container = document.getElementById(containerId);
    if (!container || !courses.length || typeof loadCardContentCompact !== 'function') return;
    const basePath = getImageBasePath();
    const cardsData = courses.map(c => ({
        type: 'Curso',
        title: c.title,
        provider: 'UBITS',
        providerLogo: basePath + 'Favicons/UBITS.jpg',
        duration: '60 min',
        level: 'Intermedio',
        progress: 0,
        status: 'default',
        image: basePath + (c.imagePath || 'cards-learn/cambio-en-el-estilo-de-liderazgo.jpeg'),
        competency: 'Liderazgo',
        language: 'Español'
    }));
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
        let currentIdx = 0;
        const total = questions.length;
        const answers = [];
        const answered = [];
        let correctCount = 0;
        let wrongCount = 0;
        const questionsData = TUTOR_QUIZ[topicKey] || TUTOR_QUIZ.liderazgo;
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
            const feedbackEl = qEl.querySelector('.study-chat-quiz-feedback');
            opts.forEach((label, j) => {
                label.classList.remove('study-chat-quiz-opt--correct', 'study-chat-quiz-opt--wrong');
                const input = label.querySelector('input');
                if (input) input.disabled = true;
                if (j === correctIdx) label.classList.add('study-chat-quiz-opt--correct');
                if (j === selectedValue && j !== correctIdx) label.classList.add('study-chat-quiz-opt--wrong');
            });
            const isCorrect = selectedValue === correctIdx;
            if (isCorrect) correctCount++; else wrongCount++;
            const correctText = questionsData[currentIdx].options[correctIdx];
            if (isCorrect) {
                feedbackEl.innerHTML = '<span class="study-chat-quiz-feedback-icon"><i class="far fa-check-circle"></i></span> <strong>¡Exacto!</strong> ' + (explanation || '');
            } else {
                feedbackEl.innerHTML = '<span class="study-chat-quiz-feedback-icon study-chat-quiz-feedback-icon--wrong"><i class="far fa-times-circle"></i></span> La respuesta correcta es: <strong>' + correctText + '</strong>. ' + (explanation || '');
            }
            feedbackEl.style.display = 'block';
        }
        function showResultsScreen() {
            const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const skipped = total - correctCount - wrongCount;
            resultDiv.innerHTML = `
                <div class="study-chat-quiz-result-screen">
                    <h2 class="study-chat-quiz-result-title">¡Lo lograste! Quiz completado.</h2>
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
                            <span class="study-chat-quiz-result-card-label">Desglose</span>
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
                            <span class="study-chat-quiz-result-option-icon"><i class="far fa-layer-group"></i></span>
                            <span class="study-chat-quiz-result-option-title">Flashcards</span>
                            <span class="study-chat-quiz-result-option-desc">Crea un set de flashcards con el material del quiz. Ideal para repasar y afianzar conceptos.</span>
                        </button>
                        <button type="button" class="study-chat-quiz-result-option study-chat-quiz-result-option-study-plan" data-action="studyPlan" style="display:${STUDY_PLAN_TOPICS.indexOf(topicKey) >= 0 ? 'flex' : 'none'};">
                            <span class="study-chat-quiz-result-option-icon"><i class="far fa-list-check"></i></span>
                            <span class="study-chat-quiz-result-option-title">Plan de estudio</span>
                            <span class="study-chat-quiz-result-option-desc">Crea un plan con tareas para ver contenidos UBITS sobre este tema.</span>
                        </button>
                    </div>
                    <div class="study-chat-quiz-result-actions">
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="study-chat-quiz-review"><span>Revisar quiz</span></button>
                        <button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="study-chat-quiz-more"><span>Más preguntas</span></button>
                    </div>
                </div>`;
            questionsContainer.style.display = 'none';
            if (progressWrap) progressWrap.style.display = 'none';
            actionsDiv.style.display = 'none';
            resultDiv.style.display = 'block';
            panel.querySelector('#study-chat-quiz-review').addEventListener('click', function() {
                resultDiv.style.display = 'none';
                resultDiv.innerHTML = '';
                if (progressWrap) progressWrap.style.display = 'flex';
                questionsContainer.style.display = 'block';
                actionsDiv.style.display = 'flex';
                currentIdx = 0;
                correctCount = 0;
                wrongCount = 0;
                answers.length = 0;
                answered.length = 0;
                questions.forEach((qEl, i) => {
                    qEl.style.display = i === 0 ? 'block' : 'none';
                    qEl.querySelectorAll('input[type="radio"]').forEach(function(inp) { inp.checked = false; inp.disabled = false; });
                    qEl.querySelectorAll('.study-chat-quiz-opt').forEach(function(l) { l.classList.remove('study-chat-quiz-opt--correct', 'study-chat-quiz-opt--wrong'); });
                    const fb = qEl.querySelector('.study-chat-quiz-feedback'); if (fb) { fb.style.display = 'none'; fb.innerHTML = ''; }
                });
                updateProgressBar();
                backBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'none';
            });
            panel.querySelector('#study-chat-quiz-more').addEventListener('click', function() {
                renderTutorPanel('quiz', topicKey);
                if (typeof addResourceMessage === 'function') addResourceMessage('quiz', topicKey, true);
            });
            panel.querySelectorAll('.study-chat-quiz-result-option').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    panel.classList.remove('is-open', 'has-content');
                    panel.innerHTML = '';
                    if (action === 'flashcards') renderTutorPanel('flashcards', topicKey);
                    else if (action === 'studyPlan') {
                        var plan = generateStudyPlan(topicKey);
                        if (plan) {
                            renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                            if (typeof addResourceMessage === 'function') addResourceMessage('studyPlan', topicKey, false);
                        }
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
                    const qu = questionsData[i];
                    const explanation = qu.explanation || '';
                    showImmediateFeedback(qEl, val, qu.correct, explanation);
                    updateVisibility();
                });
            });
        });
        if (backBtn) backBtn.addEventListener('click', function() { currentIdx--; updateVisibility(); });
        if (nextBtn) nextBtn.addEventListener('click', function() { currentIdx++; updateVisibility(); });
        if (submitBtn) submitBtn.addEventListener('click', showResultsScreen);
        updateVisibility();
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
        function updateFcProgress() {
            if (progressBars.length) progressBars.forEach((bar, i) => bar.classList.toggle('study-chat-fc-progress-bar--filled', i <= fcIndex));
            if (progressText) progressText.textContent = (fcIndex + 1) + ' / ' + cards.length;
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
        panel.querySelector('#study-chat-fc-prev').addEventListener('click', function(e) { e.stopPropagation(); fcIndex = (fcIndex - 1 + cards.length) % cards.length; showCard(); });
        panel.querySelector('#study-chat-fc-next').addEventListener('click', function(e) { e.stopPropagation(); fcIndex = (fcIndex + 1) % cards.length; showCard(); });
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
    waitingForMaterialChoice: false // true cuando IA ofreció quiz/flashcards/guía
};

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
        ? `<span class="ubits-study-chat__suggestions-label ubits-body-sm-regular">Recomendado para ti:</span>` + competencies.map(c => `<button class="ubits-button ubits-button--secondary ubits-button--xs ubits-study-chat__competency-chip" data-competency="${COMPETENCY_TO_TOPIC[c] || c.toLowerCase().replace(/\s/g, '')}" data-label="${c}"><span>${c}</span></button>`).join('\n')
        : `
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="contenidos"><span>Sugerencias de contenidos</span></button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="plan"><span>Crear plan de formación</span></button>
                    <button class="ubits-button ubits-button--secondary ubits-button--sm" data-suggestion="tutor"><span>Sé mi tutor</span></button>`;
    const welcomeBlock = isTutorMode ? `
            <div class="ubits-study-chat__welcome-wrapper" id="ubits-study-chat-welcome">
                <div class="ubits-study-chat__welcome">
                    <div class="ubits-study-chat__welcome-icon"><i class="far fa-sparkles"></i></div>
                    <p class="ubits-study-chat__welcome-greeting">Hola, ${userFirstName}</p>
                    <p class="ubits-study-chat__welcome-prompt">¿Qué quieres aprender hoy?</p>
                </div>
            </div>` : '';
    return `
        <div class="ubits-study-chat" id="ubits-study-chat">
            <div class="ubits-study-chat__body" id="ubits-study-chat-body">${welcomeBlock}</div>
            <div class="ubits-study-chat__input-area">
                <div class="ubits-study-chat__suggestions" id="ubits-study-chat-suggestions">${suggestionButtons}</div>
                <div class="ubits-study-chat__input-container">
                    <div class="ubits-study-chat__input-wrapper">
                        <textarea class="ubits-study-chat__input" id="ubits-study-chat-input" placeholder="Escribe tu mensaje..." rows="1"></textarea>
                    </div>
                    <div class="ubits-study-chat__input-actions">
                        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="ubits-study-chat-attach-btn" title="Adjuntar"><i class="far fa-paperclip"></i></button>
                        <button class="ubits-button ubits-button--primary ubits-button--sm ubits-button--icon-only" id="ubits-study-chat-send-btn" title="Enviar"><i class="far fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
            <p class="ubits-study-chat__disclaimer">El chat de modo estudio IA puede cometer errores; verifica sus respuestas.</p>
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
                    processedText += `<p class="ubits-study-chat__message-text">${textWithLinks}</p>`;
                }
            });
            
            textHTML = processedText;
    } else {
        // Convertir URLs en links con estilo
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const textWithLinks = text.replace(linkRegex, '<a href="$1" class="ubits-study-chat__link" target="_blank" rel="noopener noreferrer">$1</a>');
            // Dividir por saltos de línea y crear párrafos
            const lines = textWithLinks.split('\n').filter(line => line.trim());
            textHTML = lines.map(line => `<p class="ubits-study-chat__message-text">${line}</p>`).join('');
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
        return '<p class="ubits-study-chat__message-text ubits-study-chat__message-text--reveal">' + withLinks + '</p>';
    });
}

/** Delay por línea (ms) para el efecto typewriter estilo Gemini */
var AI_STREAMING_LINE_DELAY_MS = 65;

/**
 * Añade mensaje de IA con efecto typewriter línea a línea (estilo Gemini).
 */
function addMessageAIWithStreaming(text, showActions, regenerateFunction) {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
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
            setTimeout(appendNext, AI_STREAMING_LINE_DELAY_MS);
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
                const cardsData = courses.map(course => ({
                    type: 'Curso', title: course.title, provider: 'UBITS',
                    providerLogo: basePath + 'Favicons/UBITS.jpg', duration: '60 min', level: 'Intermedio',
                    progress: 0, status: 'default', image: basePath + course.imagePath, competency: 'Liderazgo', language: 'Español'
                }));
                loadCardContentCompact(containerId, cardsData);
                chatState.pendingCoursesContainer = null;
            }
        }
        if (chatState.pendingPlanContainer && typeof loadCardContentCompact === 'function') {
            const { containerId, plan } = chatState.pendingPlanContainer;
            const container = messageElement.querySelector(`#${containerId}`);
            if (container && plan && plan.courses && plan.courses.length > 0) {
                const basePath = getImageBasePath();
                const cardsData = plan.courses.map(course => ({
                    type: 'Curso', title: course.title, provider: 'UBITS',
                    providerLogo: basePath + 'Favicons/UBITS.jpg', duration: '60 min', level: 'Intermedio',
                    progress: 0, status: 'default', image: basePath + course.imagePath, competency: 'Liderazgo', language: 'Español'
                }));
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
}

var TOPIC_LABELS = { liderazgo: 'Liderazgo', comunicacion: 'Comunicación', ingles: 'Inglés', japones: 'Japonés', hiragana: 'Maratón Hiragana' };

function getResourceTitle(type, topicKey) {
    var label = TOPIC_LABELS[topicKey] || topicKey;
    if (type === 'quiz') return 'Quiz de ' + label;
    if (type === 'flashcards') return 'Flashcards de ' + label;
    if (type === 'studyPlan') return 'Plan de estudio: ' + label;
    return type + ' ' + label;
}

function hideOpenButtonsInChat() {
    document.querySelectorAll('.study-chat-resource-msg').forEach(function(el) { el.classList.remove('open-btn-visible'); });
}

function showOpenButtonsInChat() {
    document.querySelectorAll('.study-chat-resource-msg').forEach(function(el) { el.classList.add('open-btn-visible'); });
}

/**
 * Añade mensaje "He creado un [recurso] para ti: {título}" con botón Abrir (visible solo cuando el panel está cerrado).
 * @param {string} type - 'quiz' | 'flashcards' | 'guia'
 * @param {string} topicKey - tema (liderazgo, comunicacion, etc.)
 * @param {boolean} isNew - true para "He creado un nuevo quiz..." / "He creado nuevas flashcards..."
 */
function addResourceMessage(type, topicKey, isNew) {
    var body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    var title = getResourceTitle(type, topicKey);
    var text = '';
    if (type === 'quiz') text = isNew ? 'He creado un nuevo quiz para ti: ' + title + '.' : 'He creado un quiz para ti: ' + title + '.';
    else if (type === 'flashcards') text = isNew ? 'He creado nuevas flashcards para ti: ' + title + '.' : 'He creado flashcards para ti: ' + title + '.';
    else if (type === 'studyPlan') text = isNew ? 'He creado un nuevo plan de estudio para ti: ' + title + '.' : 'He creado un plan de estudio para ti: ' + title + '.';
    else return;
    var panel = chatState.rightPanelId ? document.getElementById(chatState.rightPanelId) : null;
    var panelIsOpen = panel && panel.classList.contains('is-open');
    var openVisibleClass = panelIsOpen ? '' : ' open-btn-visible';
    var timestamp = formatTime();
    var msgId = 'resource-msg-' + type + '-' + topicKey + '-' + Date.now();
    var html = '<div class="ubits-study-chat__message ubits-study-chat__message--ai study-chat-resource-msg' + openVisibleClass + '" data-resource-type="' + type + '" data-resource-topic="' + topicKey + '">' +
        '<div class="ubits-study-chat__text-globe ubits-study-chat__text-globe--ai">' +
        '<p class="ubits-study-chat__message-text">' + text + '</p>' +
        '<span class="study-chat-resource-open-wrap">' +
        '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm study-chat-resource-open-btn" data-type="' + type + '" data-topic="' + topicKey + '"><span>Abrir</span></button>' +
        '</span></div>' +
        '<p class="ubits-study-chat__timestamp">' + timestamp + '</p></div>';
    body.insertAdjacentHTML('beforeend', html);
    body.scrollTop = body.scrollHeight;
    var btn = body.querySelector('.study-chat-resource-open-btn[data-type="' + type + '"][data-topic="' + topicKey + '"]');
    if (btn) btn.addEventListener('click', function() {
        var t = this.getAttribute('data-type');
        var top = this.getAttribute('data-topic');
        if (t === 'studyPlan') {
            var plan = generateStudyPlan(top);
            if (plan) renderTutorPanel('studyPlan', top, { studyPlan: plan });
        } else if (t === 'flashcards') renderTutorPanel('flashcards', top);
        else renderTutorPanel('quiz', top);
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
    const text = showPlan
        ? 'Perfecto, trabajemos <strong>' + label + '</strong>. Puedo hacerte un quiz, crear flashcards o un plan de estudio con contenidos UBITS. ¿Qué prefieres?'
        : 'Perfecto, trabajemos <strong>' + label + '</strong>. Puedo hacerte un quiz o crear flashcards. ¿Qué prefieres?';
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
        '</div></div>';
    body.insertAdjacentHTML('beforeend', choicesHTML);
    body.scrollTop = body.scrollHeight;
    chatState.lastAIMessageElement = body.lastElementChild.querySelector('.ubits-study-chat__message');
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
                var plan = generateStudyPlan(topic);
                if (plan) renderTutorPanel('studyPlan', topic, { studyPlan: plan });
            } else {
                renderTutorPanel(choice, topic);
            }
            choicesEl.style.display = 'none';
            addResourceMessage(choice, topic, false);
        });
    });
}

function addMessage(type, text, showActions = false, regenerateFunction = null) {
    const body = document.getElementById('ubits-study-chat-body');
    if (!body) return;
    
    if (type === 'user') hideWelcomeBlock();
    
    if (type === 'ai') {
        addMessageAIWithStreaming(text, showActions, regenerateFunction);
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
    chatState.competencyTopics = {};
    chatState.competencies.forEach(c => { chatState.competencyTopics[c] = COMPETENCY_TO_TOPIC[c] || c.toLowerCase().replace(/\s/g, ''); });
    
    container.innerHTML = createStudyChatHTML(options);
    
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
            setTimeout(() => {
                addMessageWithMaterialChoiceButtons(label, topic);
            }, 1200);
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
                setTimeout(() => { addMessage('ai', response, true); }, 1500);
            }
        });
    });
    
    // Función para generar respuesta predefinida basada en el mensaje del usuario
    function generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase().trim();
        
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
                    var plan = generateStudyPlan(topicKey);
                    if (plan) renderTutorPanel('studyPlan', topicKey, { studyPlan: plan });
                    return { resourceMessage: { type: 'studyPlan', topic: topicKey }, regenerateFunction: null };
                }
                return { text: 'El plan de estudio con contenidos UBITS está disponible solo para Liderazgo, Comunicación e Inglés. Para ' + (topicKey === 'japones' || topicKey === 'hiragana' ? 'Japonés' : 'este tema') + ' puedes usar Quiz o Flashcards.', regenerateFunction: null };
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
        
        // Simular respuesta de IA después de un delay (solo efecto escritura línea a línea, sin indicador de typing)
        setTimeout(() => {
            if (materialChoice) {
                addMessageWithMaterialChoiceButtons(materialChoice.label, materialChoice.topic);
            } else if (resourceMessage) {
                addResourceMessage(resourceMessage.type, resourceMessage.topic, false);
            } else {
                addMessage('ai', response, true, regenerateFunction);
            }
        }, 1500);
    }
}

// Exportar funciones para uso global
window.initStudyChat = initStudyChat;
window.addMessage = addMessage;
window.showTypingMessage = showTypingMessage;
window.removeTypingMessage = removeTypingMessage;

