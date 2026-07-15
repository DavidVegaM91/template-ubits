/**
 * Mock pedagógico Experiencia de Estudio — curso demo § 3.3 / § 11.1
 * Catálogo enlazado: f007 (Fiqsha) «Resolución efectiva de conflictos…»
 *
 * No vive en bd-master/ hasta oficializar el demo global.
 */
(function (global) {
  'use strict';

  var COMPLEMENTARIO_TEXTO =
    '<p>Un conflicto es una diferencia de intereses, necesidades o percepciones entre personas o grupos. ' +
    'Gestionarlo bien puede mejorar las decisiones del equipo; evitarlo siempre suele empeorar la tensión.</p>' +
    '<p>En esta página practicarás comunicación para desescalar: observa hechos, nombra emociones y pide con claridad.</p>';

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
            titulo: 'Guía mapa de conflicto',
            tipo: 'pdf',
            /* Mismo PDF del seed Creator (demo-assets/guia-mapa-conflicto.pdf) */
            pdfSrc: '../../lms-creator/demo-assets/guia-mapa-conflicto.pdf'
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
            id: 'p-3',
            titulo: 'Simulador de conversación difícil',
            tipo: 'scorm',
            scormSrc: '../../lms-creator/simulador-scorm.html'
          },
          {
            id: 'p-4',
            titulo: 'Conversaciones difíciles según Thomas-Kilmann',
            tipo: 'scorm',
            /* Mismo SCORM IA del seed Creator (ccScormBuildDemoAiRenderedBlock) — no el simulador */
            scormSrc: '../../lms-creator/thomas-kilmann-scorm.html'
          },
          {
            id: 'p-5',
            titulo: 'Evaluación',
            tipo: 'evaluacion',
            evalConfig: {
              maxAttempts: 2,
              timeLimitMinutes: 10,
              timeLimitEnabled: true,
              minPassScore: 7
            },
            preguntas: [
              {
                id: 'eq-1',
                type: 'multiple_choice_single',
                prompt: '¿Qué es un conflicto en el contexto de un equipo de trabajo?',
                options: [
                  { id: 'a', text: 'Una discusión sin solución' },
                  { id: 'b', text: 'Una situación de tensión entre personas con intereses distintos' },
                  { id: 'c', text: 'Un problema técnico del proyecto' },
                  { id: 'd', text: 'Una falta de recursos' }
                ],
                correctOptionIds: ['b']
              },
              {
                id: 'eq-2',
                type: 'multiple_choice_single',
                prompt: 'La comunicación no violenta (CNV) en conflictos incluye:',
                options: [
                  { id: 'a', text: 'Observación, sentimiento, necesidad, petición' },
                  { id: 'b', text: 'Acusación, demanda, sanción, archivo' },
                  { id: 'c', text: 'Juicio, evaluación, corrección, archivo' },
                  { id: 'd', text: 'Amenaza, negación, imposición, cierre' }
                ],
                correctOptionIds: ['a']
              },
              {
                id: 'eq-3',
                type: 'true_false',
                prompt: '¿Verdadero o falso? La escucha activa es clave para resolver conflictos.',
                correct: true
              },
              {
                id: 'eq-4',
                type: 'true_false',
                prompt:
                  '¿Verdadero o falso? Los conflictos de tarea (cómo se realiza el trabajo) pueden ser beneficiosos si se gestionan bien.',
                correct: true
              },
              {
                id: 'eq-5',
                type: 'multiple_choice_multiple',
                prompt: 'Selecciona todas las afirmaciones que describen correctamente el estilo evitativo:',
                options: [
                  { id: 'a', text: 'No cuida ni el resultado ni la relación.' },
                  {
                    id: 'b',
                    text: 'Aplaza el problema y, aunque a veces sirve para enfriar, suele empeorarlo.'
                  },
                  {
                    id: 'c',
                    text: 'Prioriza el resultado sobre la relación y puede generar resistencia.'
                  },
                  {
                    id: 'd',
                    text: 'Ayuda a mantener la armonía, pero si se usa siempre genera frustración.'
                  }
                ],
                correctOptionIds: ['a', 'b']
              },
              {
                id: 'eq-6',
                type: 'multiple_choice_multiple',
                prompt:
                  'Selecciona todas las que son beneficios potenciales del conflicto de tarea bien gestionado:',
                options: [
                  { id: 'a', text: 'Mayor creatividad y calidad de decisiones.' },
                  { id: 'b', text: 'Siempre elimina el conflicto de relación.' },
                  { id: 'c', text: 'Mejor detección temprana de errores en el trabajo.' },
                  { id: 'd', text: 'Reduce por completo las tensiones interpersonales.' }
                ],
                correctOptionIds: ['a', 'c']
              },
              {
                id: 'eq-7',
                type: 'short_answer',
                prompt: 'Según el modelo de Thomas-Kilmann ¿Cuántos estilos de manejo de conflictos hay?',
                correctText: '5'
              },
              {
                id: 'eq-8',
                type: 'short_answer',
                prompt:
                  'Escribe la sigla en inglés que significa “mejor alternativa si no hay acuerdo” en una negociación.',
                correctText: 'BATNA'
              },
              {
                id: 'eq-9',
                type: 'matching',
                prompt: 'Relaciona cada estilo con su descripción principal:',
                pairs: [
                  {
                    a: 'Competitivo',
                    b: 'Prioriza el resultado sobre la relación y puede generar resistencia.'
                  },
                  {
                    a: 'Acomodador',
                    b: 'Prioriza la relación sobre el resultado y ayuda a mantener la armonía.'
                  }
                ]
              },
              {
                id: 'eq-10',
                type: 'matching',
                prompt:
                  'Relaciona cada estilo de Thomas-Kilmann con su postura típica respecto al resultado y la relación:',
                pairs: [
                  {
                    a: 'Evitativo',
                    b: 'Ni alto interés en resultado ni en relación en el corto plazo; aplaza el enfrentamiento.'
                  },
                  {
                    a: 'Colaborativo',
                    b: 'Alto interés en resultado y en relación; busca integración de intereses.'
                  }
                ]
              }
            ]
          },
          {
            id: 'p-6',
            titulo: 'Fin del contenido',
            tipo: 'fin'
          }
        ]
      }
    ]
  };

  /** Páginas consumibles en orden (sin `fin`). */
  global.BD_EXP_ESTUDIO_DEMO.paginasConsumibles = ['p-1', 'p-2', 'p-3', 'p-4', 'p-5'];

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
})(typeof window !== 'undefined' ? window : globalThis);
