/**
 * Playground UBITS — Mock de Evaluaciones 360.
 * Cargar ANTES de los scripts de las páginas del módulo:
 *   <script src="../../bd-master/bd-master-colaboradores.js"></script>
 *   <script src="../../bd-master/bd-evaluaciones-360.js"></script>
 * Rutas relativas desde ubits-admin/desempeno/360/
 */

window.BD_EVALUACIONES_360 = {

  /* ─── 5 evaluaciones de ejemplo ─── */
  evaluaciones: [
    {
      id: 'AXS001',
      nombre: 'Evaluación 360 Liderazgo Q1 2025',
      fechaInicio: '2025-01-15',
      fechaFin: '2025-03-31',
      estado: 'finalizada',
      checks: { tipo: true, competencias: true, evaluados: true, resultados: true }
    },
    {
      id: 'AXS002',
      nombre: 'Evaluación 360 Desempeño Comercial',
      fechaInicio: '2025-04-01',
      fechaFin: '2025-06-30',
      estado: 'activa',
      checks: { tipo: true, competencias: true, evaluados: true, resultados: true }
    },
    {
      id: 'AXS003',
      nombre: 'Evaluación 360 Equipos Técnicos',
      fechaInicio: '2025-07-01',
      fechaFin: '2025-09-30',
      estado: 'borrador',
      checks: { tipo: true, competencias: true, evaluados: false, resultados: false }
    },
    {
      id: 'AXS004',
      nombre: 'Evaluación 360 Gerencia y Directores',
      fechaInicio: '2025-05-15',
      fechaFin: '2025-08-15',
      estado: 'activa',
      checks: { tipo: true, competencias: true, evaluados: true, resultados: true }
    },
    {
      id: 'AXS005',
      nombre: 'Evaluación 360 Cultura Organizacional 2024',
      fechaInicio: '2024-09-01',
      fechaFin: '2024-12-31',
      estado: 'finalizada',
      checks: { tipo: true, competencias: true, evaluados: true, resultados: true }
    }
  ],

  /* ─── Tipos de evaluación disponibles ─── */
  tiposEvaluacion: [
    { id: 'auto',        nombre: 'Autoevaluación',  descripcion: 'El colaborador se evalúa a sí mismo.',                                                            pesoSugerido: 10 },
    { id: 'jefe',        nombre: 'Descendente',     descripcion: 'Supervisor evalúa al subordinado.',                                                                pesoSugerido: 40 },
    { id: 'pares',       nombre: 'Paralela',         descripcion: 'Colaborador evalúa a sus colegas (pares).',                                                      pesoSugerido: 20 },
    { id: 'subalternos', nombre: 'Ascendente',       descripcion: 'Colaborador evalúa al supervisor.',                                                              pesoSugerido: 20 },
    { id: 'cliente',     nombre: 'Cliente interno',  descripcion: 'Se evalúan usuarios específicos que no tienen relación directa en el organigrama.',              pesoSugerido: 10 }
  ],

  /* ─── 8 competencias base con 3 enunciados c/u ─── */
  competenciasBase: [
    {
      id: 'COMP01', nombre: 'Liderazgo',
      enunciados: [
        'Inspira y motiva a su equipo hacia el logro de objetivos.',
        'Toma decisiones asertivas en situaciones de presión.',
        'Comunica la visión y dirección del equipo con claridad.'
      ]
    },
    {
      id: 'COMP02', nombre: 'Comunicación',
      enunciados: [
        'Expresa sus ideas de forma clara y concisa.',
        'Escucha activamente y muestra interés por las opiniones del equipo.',
        'Adapta su comunicación según el interlocutor y el contexto.'
      ]
    },
    {
      id: 'COMP03', nombre: 'Trabajo en equipo',
      enunciados: [
        'Colabora activamente con otros para alcanzar metas comunes.',
        'Comparte información relevante con su equipo oportunamente.',
        'Valora y respeta la diversidad de perspectivas en el equipo.'
      ]
    },
    {
      id: 'COMP04', nombre: 'Gestión del cambio',
      enunciados: [
        'Se adapta con disposición a nuevas situaciones y entornos.',
        'Impulsa iniciativas de mejora dentro de su área.',
        'Apoya a otros durante los procesos de transformación organizacional.'
      ]
    },
    {
      id: 'COMP05', nombre: 'Resolución de problemas',
      enunciados: [
        'Identifica causas raíz de los problemas antes de actuar.',
        'Propone soluciones viables y evalúa sus consecuencias.',
        'Actúa con rapidez y efectividad frente a situaciones inesperadas.'
      ]
    },
    {
      id: 'COMP06', nombre: 'Gestión de proyectos',
      enunciados: [
        'Planifica y organiza sus actividades para cumplir plazos.',
        'Hace seguimiento al avance de las tareas asignadas.',
        'Gestiona recursos y prioridades con eficiencia.'
      ]
    },
    {
      id: 'COMP07', nombre: 'Innovación',
      enunciados: [
        'Genera ideas creativas para mejorar procesos o resultados.',
        'Experimenta con nuevas formas de abordar los retos.',
        'Promueve una cultura de mejora continua en su entorno.'
      ]
    },
    {
      id: 'COMP08', nombre: 'Experiencia del cliente',
      enunciados: [
        'Anticipa las necesidades del cliente y actúa en consecuencia.',
        'Genera soluciones oportunas ante inconformidades del cliente.',
        'Mide y reflexiona sobre la satisfacción del cliente en su trabajo.'
      ]
    }
  ],

  /* ─── Participantes de evaluaciones mock ─── */
  /* Se referencian a los ids de BD_MASTER_COLABORADORES */
  participantesMock: {
    'AXS002': ['E001','E002','E003','E004','E005','E006','E007','E008','E052'],
    'AXS003': ['E002','E003','E009','E010','E011']
  },

  /* ─── API de acceso ─── */
  getEvaluaciones: function () {
    return this.evaluaciones;
  },
  getEvaluacionById: function (id) {
    return this.evaluaciones.find(function (e) { return e.id === id; });
  },
  addEvaluacion: function (evaluacion) {
    evaluacion.id = 'AXS' + String(Date.now()).slice(-6);
    evaluacion.estado = 'activa';
    this.evaluaciones.unshift(evaluacion);
    return evaluacion;
  },
  deleteEvaluacion: function (id) {
    this.evaluaciones = this.evaluaciones.filter(function (e) { return e.id !== id; });
  }
};
