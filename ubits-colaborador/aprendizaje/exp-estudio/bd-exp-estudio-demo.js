/**
 * Mock pedagógico Experiencia de Estudio — curso demo § 3.3 / § 11.1
 * Catálogo enlazado: f007 (Fiqsha) «Resolución efectiva de conflictos…»
 *
 * No vive en bd-master/ hasta oficializar el demo global.
 *
 * Índice (2 evaluaciones × 5 preguntas):
 * Sección 1 — video, SCORM Thomas-Kilmann, Evaluación Sección 1
 * Sección 2 — simulador, PDF, Evaluación Sección 2, Fin
 */
(function (global) {
  'use strict';

  var COMPLEMENTARIO_TEXTO =
    '<p>Un conflicto es una diferencia de intereses, necesidades o percepciones entre personas o grupos. ' +
    'Gestionarlo bien puede mejorar las decisiones del equipo; evitarlo siempre suele empeorar la tensión.</p>' +
    '<p>En esta página practicarás comunicación para desescalar: observa hechos, nombra emociones y pide con claridad.</p>';

  var PREGUNTAS_EVAL_1 = [
    // Banco Creator B-01
    {
      "id": "eq-1",
      "type": "multiple_choice_single",
      "prompt": "¿Qué es un conflicto en el contexto de un equipo de trabajo?",
      "options": [
        {
          "id": "a",
          "text": "Una discusión sin solución"
        },
        {
          "id": "b",
          "text": "Una situación de tensión entre personas con intereses distintos"
        },
        {
          "id": "c",
          "text": "Un problema técnico del proyecto"
        },
        {
          "id": "d",
          "text": "Una falta de recursos"
        }
      ],
      "correctOptionIds": [
        "b"
      ]
    },
    // Banco Creator I-27
    {
      "id": "eq-2",
      "type": "multiple_choice_multiple",
      "prompt": "Selecciona todas las afirmaciones verdaderas sobre el estilo colaborativo (Thomas-Kilmann):",
      "options": [
        {
          "id": "a",
          "text": "Busca soluciones que satisfagan las necesidades de ambas partes."
        },
        {
          "id": "b",
          "text": "Es siempre la opción más rápida cuando hay urgencia."
        },
        {
          "id": "c",
          "text": "Requiere confianza y tiempo para explorar intereses."
        },
        {
          "id": "d",
          "text": "Consiste en imponer la solución más racional."
        }
      ],
      "correctOptionIds": [
        "a",
        "c"
      ]
    },
    // Banco Creator B-31
    {
      "id": "eq-3",
      "type": "matching",
      "prompt": "Relaciona el concepto con su definición breve:",
      "pairs": [
        {
          "a": "Empatía",
          "b": "Reconocer y validar las emociones del otro sin necesidad de estar de acuerdo."
        },
        {
          "a": "Escucha activa",
          "b": "Atención plena, reformulación y clarificación sin interrumpir."
        }
      ]
    },
    // Banco Creator I-20
    {
      "id": "eq-4",
      "type": "true_false",
      "prompt": "¿Verdadero o falso? Documentar los acuerdos alcanzados tras un conflicto reduce la probabilidad de recaída.",
      "correct": true
    },
    // Banco Creator I-24
    {
      "id": "eq-5",
      "type": "multiple_choice_single",
      "prompt": "¿Qué papel juegan los acuerdos de equipo en la prevención de conflictos?",
      "options": [
        {
          "id": "a",
          "text": "Ninguno relevante"
        },
        {
          "id": "b",
          "text": "Establecen expectativas claras que reducen malentendidos futuros"
        },
        {
          "id": "c",
          "text": "Aumentan la burocracia"
        },
        {
          "id": "d",
          "text": "Solo sirven en equipos nuevos"
        }
      ],
      "correctOptionIds": [
        "b"
      ]
    },
  ];

  var PREGUNTAS_EVAL_2 = [
    // Banco Creator B-27
    {
      "id": "eq-6",
      "type": "multiple_choice_multiple",
      "prompt": "Selecciona todas las conductas que suelen favorecer una escucha activa en un conflicto:",
      "options": [
        {
          "id": "a",
          "text": "Parafrasear lo escuchado para confirmar comprensión."
        },
        {
          "id": "b",
          "text": "Planificar la réplica mientras el otro habla."
        },
        {
          "id": "c",
          "text": "Hacer preguntas abiertas antes de juzgar."
        },
        {
          "id": "d",
          "text": "Interrumpir para corregir hechos al instante."
        }
      ],
      "correctOptionIds": [
        "a",
        "c"
      ]
    },
    // Banco Creator B-30
    {
      "id": "eq-7",
      "type": "matching",
      "prompt": "Relaciona cada estilo con su descripción principal:",
      "pairs": [
        {
          "a": "Competitivo",
          "b": "Prioriza el resultado sobre la relación y puede generar resistencia."
        },
        {
          "a": "Acomodador",
          "b": "Prioriza la relación sobre el resultado y ayuda a mantener la armonía."
        }
      ]
    },
    // Banco Creator I-08
    {
      "id": "eq-8",
      "type": "true_false",
      "prompt": "¿Verdadero o falso? La retroalimentación basada en hechos es más efectiva que la basada en interpretaciones.",
      "correct": true
    },
    // Banco Creator I-29
    {
      "id": "eq-9",
      "type": "multiple_choice_multiple",
      "prompt": "Selecciona todas las señales de que un conflicto está escalando de forma riesgosa:",
      "options": [
        {
          "id": "a",
          "text": "Interrupciones constantes y tono personalizado."
        },
        {
          "id": "b",
          "text": "Aumento explícito del interés por datos y acuerdos de normas de conversación."
        },
        {
          "id": "c",
          "text": "Generalizaciones (“siempre”, “nunca”)."
        },
        {
          "id": "d",
          "text": "Mayor curiosidad genuina por la perspectiva del otro."
        }
      ],
      "correctOptionIds": [
        "a",
        "c"
      ]
    },
    // Banco Creator B-02
    {
      "id": "eq-10",
      "type": "multiple_choice_single",
      "prompt": "El primer paso para resolver un conflicto en un equipo es:",
      "options": [
        {
          "id": "a",
          "text": "Ignorar la situación"
        },
        {
          "id": "b",
          "text": "Identificar y reconocer la existencia del conflicto"
        },
        {
          "id": "c",
          "text": "Escalar al director"
        },
        {
          "id": "d",
          "text": "Sancionar al responsable"
        }
      ],
      "correctOptionIds": [
        "b"
      ]
    },
  ];

  var EVAL_CONFIG_5 = {
    maxAttempts: 2,
    timeLimitMinutes: 5,
    timeLimitEnabled: true,
    minPassScore: 4
  };

  global.BD_EXP_ESTUDIO_DEMO = {
    contentId: 'f007',
    secciones: [
      {
        id: 'sec-1',
        titulo: 'Sección 1: Fundamentos',
        /* Sin descripción → sin botón info (§ 4.3.1: solo Sección 2) */
        paginas: [
          {
            id: 'p-1',
            titulo: 'Comunicación para desescalar un conflicto',
            tipo: 'video',
            /* Mismo MP4 + thumb del seed Creator (avatar staff Antonia) */
            videoSrc: '../../../videos/avatars/preview-video-generado.mp4',
            videoPoster: '../../../images/avatar-temp-thumbs/thumb_staff_f23_antonia.jpg',
            complementarios: [
              {
                tipo: 'archivo-descargable',
                nombre: 'guia-mapa-conflicto.pdf',
                pesoBytes: 2200000,
                url: '../../lms-creator/demo-assets/guia-mapa-conflicto.pdf'
              },
              {
                tipo: 'texto',
                html: COMPLEMENTARIO_TEXTO
              }
            ]
          },
          {
            id: 'p-2',
            titulo: 'Conversaciones difíciles según Thomas-Kilmann',
            tipo: 'scorm',
            /* Mismo SCORM IA del seed Creator (ccScormBuildDemoAiRenderedBlock) — no el simulador */
            scormSrc: '../../lms-creator/thomas-kilmann-scorm.html'
          },
          {
            id: 'p-3',
            titulo: 'Evaluación Sección 1',
            tipo: 'evaluacion',
            evalConfig: Object.assign({}, EVAL_CONFIG_5),
            preguntas: PREGUNTAS_EVAL_1
          }
        ]
      },
      {
        id: 'sec-2',
        titulo: 'Sección 2: Herramientas para resolver conflictos',
        descripcionHtml:
          '<p class="ubits-body-md-regular">Simulaciones, marcos de referencia y evaluación para aplicar lo aprendido en situaciones reales de conflicto en el trabajo.</p>',
        paginas: [
          {
            id: 'p-4',
            titulo: 'Simulador de conversación difícil',
            tipo: 'scorm',
            scormSrc: '../../lms-creator/simulador-scorm.html'
          },
          {
            id: 'p-5',
            titulo: 'Guía mapa de conflicto',
            tipo: 'pdf',
            /* Mismo PDF del seed Creator (demo-assets/guia-mapa-conflicto.pdf) */
            pdfSrc: '../../lms-creator/demo-assets/guia-mapa-conflicto.pdf',
            /* Paridad Creator: switch «Permitir descarga del PDF…» ON por defecto */
            allowPdfDownload: true
          },
          {
            id: 'p-6',
            titulo: 'Evaluación Sección 2',
            tipo: 'evaluacion',
            evalConfig: Object.assign({}, EVAL_CONFIG_5),
            preguntas: PREGUNTAS_EVAL_2
          },
          {
            id: 'p-7',
            titulo: 'Fin del contenido',
            tipo: 'fin'
          }
        ]
      }
    ]
  };

  /** Páginas consumibles en orden (sin `fin`). */
  global.BD_EXP_ESTUDIO_DEMO.paginasConsumibles = ['p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6'];

  global.BD_EXP_ESTUDIO_DEMO.getFlatPages = function () {
    var out = [];
    (global.BD_EXP_ESTUDIO_DEMO.secciones || []).forEach(function (sec) {
      (sec.paginas || []).forEach(function (p) {
        out.push(
          Object.assign({}, p, {
            sectionId: sec.id,
            sectionTitle: sec.titulo
          })
        );
      });
    });
    return out;
  };

  global.BD_EXP_ESTUDIO_DEMO.getPageById = function (pageId) {
    return (
      global.BD_EXP_ESTUDIO_DEMO.getFlatPages().find(function (p) {
        return p.id === pageId;
      }) || null
    );
  };

  global.BD_EXP_ESTUDIO_DEMO.getFinPageId = function () {
    var fin = global.BD_EXP_ESTUDIO_DEMO.getFlatPages().find(function (p) {
      return p.tipo === 'fin';
    });
    return fin ? fin.id : 'p-7';
  };
})(typeof window !== 'undefined' ? window : globalThis);
