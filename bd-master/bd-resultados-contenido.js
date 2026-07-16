/**
 * Playground UBITS — resultados por contenido (edición LMS Creator → sección Resultados).
 * Fechas de inicio relativas a «hoy» para que el filtro de periodo escale en demo.
 * Clave: id de contenido. Cargar en editar-contenido.html junto a bd-contenidos-fiqsha.js.
 */
(function () {
    'use strict';

    var EVALUACIONES_DEFAULT = [
        {
            id: 'eval-seccion-1',
            nombre: 'Evaluación Sección 1',
            peso: 50,
            porcentajeAprobar: 60,
            limiteIntentos: 3,
            tiempoLimiteMinutos: 30,
            totalPreguntas: 5
        },
        {
            id: 'eval-seccion-2',
            nombre: 'Evaluación Sección 2',
            peso: 50,
            porcentajeAprobar: 60,
            limiteIntentos: 2,
            tiempoLimiteMinutos: 30,
            totalPreguntas: 5
        }
    ];

    /** Filas del tab Descargas (recorrido lineal → participantes decrecientes). */
    var DESCARGAS_DEFAULT = [
        {
            id: 'eval-seccion-1',
            titulo: 'Evaluación Sección 1',
            tipo: 'evaluacion',
            participantes: 20
        },
        {
            id: 'eval-seccion-2',
            titulo: 'Evaluación Sección 2',
            tipo: 'evaluacion',
            participantes: 17
        },
        {
            id: 'encuesta-satisfaccion',
            titulo: 'Encuesta de satisfacción',
            tipo: 'encuesta',
            participantes: 10
        }
    ];

    var DESCARGAS_SMALL = [
        {
            id: 'eval-seccion-1',
            titulo: 'Evaluación Sección 1',
            tipo: 'evaluacion',
            participantes: 7
        },
        {
            id: 'eval-seccion-2',
            titulo: 'Evaluación Sección 2',
            tipo: 'evaluacion',
            participantes: 6
        },
        {
            id: 'encuesta-satisfaccion',
            titulo: 'Encuesta de satisfacción',
            tipo: 'encuesta',
            participantes: 3
        }
    ];

    function daysAgoISO(days) {
        var d = new Date();
        d.setHours(12, 0, 0, 0);
        d.setDate(d.getDate() - days);
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        var day = d.getDate();
        return y + '-' + String(m).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }

    function evalCell(estado, percent, correctas, total) {
        if (estado === 'Pendiente') {
            return { estado: 'Pendiente', percent: null, correctas: null, total: null };
        }
        return { estado: estado, percent: percent, correctas: correctas, total: total };
    }

    function estudiante(nombre, email, daysAgoInicio, daysAgoFin, progresoPercent, ev1, ev2) {
        return {
            nombre: nombre,
            email: email,
            fechaInicio: daysAgoISO(daysAgoInicio),
            fechaFin: daysAgoFin != null ? daysAgoISO(daysAgoFin) : null,
            progresoPercent: progresoPercent,
            evaluaciones: {
                'eval-seccion-1': ev1,
                'eval-seccion-2': ev2
            }
        };
    }

  /**
   * Distribución por periodo (fecha de inicio):
   * - 30 días: 15 estudiantes (hace 1–27 días)
   * - 90 días: +5 (hace 32–58 días) → 20
   * - 180 / 365 / año actual: +2 (hace 95–110 días) → 22
   */
    function buildEstudiantesDemo() {
        return [
            estudiante(
                'Cristian Andrés Mejía López',
                'crismejia@fiqsha.demo',
                2,
                null,
                45,
                evalCell('Aprobado', 70, 4, 5),
                evalCell('Fallido', 58, 3, 5)
            ),
            estudiante(
                'Laura Patricia Gómez Ruiz',
                'lagomez@fiqsha.demo',
                4,
                12,
                100,
                evalCell('Aprobado', 80, 4, 5),
                evalCell('Aprobado', 75, 4, 5)
            ),
            estudiante(
                'Carlos Andrés García López',
                'cgarcl@fiqsha.demo',
                6,
                18,
                100,
                evalCell('Aprobado', 90, 5, 5),
                evalCell('Aprobado', 83, 4, 5)
            ),
            estudiante(
                'Laura Valentina Rodríguez Martínez',
                'lrodrm@fiqsha.demo',
                8,
                null,
                62,
                evalCell('Aprobado', 65, 3, 5),
                evalCell('Aprobado', 72, 4, 5)
            ),
            estudiante(
                'Miguel Ángel Hernández Díaz',
                'mhernd@fiqsha.demo',
                10,
                null,
                38,
                evalCell('Fallido', 45, 2, 5),
                evalCell('Pendiente')
            ),
            estudiante(
                'Natalia Sofía Torres Sánchez',
                'ntorrs@fiqsha.demo',
                12,
                20,
                100,
                evalCell('Aprobado', 75, 4, 5),
                evalCell('Aprobado', 67, 3, 5)
            ),
            estudiante(
                'Sebastián Felipe Gómez Álvarez',
                'sgomea@fiqsha.demo',
                14,
                null,
                55,
                evalCell('Aprobado', 60, 3, 5),
                evalCell('Fallido', 50, 3, 5)
            ),
            estudiante(
                'Juliana Andrea Pérez Castro',
                'jperec@fiqsha.demo',
                16,
                null,
                28,
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Juan David López González',
                'jlopeg@fiqsha.demo',
                18,
                25,
                100,
                evalCell('Aprobado', 85, 4, 5),
                evalCell('Aprobado', 78, 4, 5)
            ),
            estudiante(
                'Diego Alejandro Martínez Romero',
                'dmartr@fiqsha.demo',
                19,
                null,
                72,
                evalCell('Aprobado', 70, 4, 5),
                evalCell('Aprobado', 68, 3, 5)
            ),
            estudiante(
                'Camilo Ernesto Sánchez Vargas',
                'csancv@fiqsha.demo',
                21,
                null,
                15,
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Andrés Felipe Ruiz Mendoza',
                'aruizm@fiqsha.demo',
                22,
                null,
                48,
                evalCell('Aprobado', 55, 3, 5),
                evalCell('Pendiente')
            ),
            estudiante(
                'Santiago José Díaz Suárez',
                'sdiazs@fiqsha.demo',
                24,
                28,
                100,
                evalCell('Aprobado', 92, 5, 5),
                evalCell('Aprobado', 88, 4, 5)
            ),
            estudiante(
                'Daniel Esteban Ortiz Restrepo',
                'dortir@fiqsha.demo',
                25,
                null,
                33,
                evalCell('Fallido', 40, 2, 5),
                evalCell('Pendiente')
            ),
            estudiante(
                'Carolina María Álvarez Torres',
                'calvat@fiqsha.demo',
                27,
                null,
                80,
                evalCell('Aprobado', 78, 4, 5),
                evalCell('Aprobado', 81, 4, 5)
            ),
            estudiante(
                'Pablo Antonio Castro Ríos',
                'pcastr@fiqsha.demo',
                35,
                40,
                100,
                evalCell('Aprobado', 86, 4, 5),
                evalCell('Aprobado', 80, 4, 5)
            ),
            estudiante(
                'Sandra Milena Rojas Pineda',
                'srojap@fiqsha.demo',
                42,
                null,
                58,
                evalCell('Aprobado', 68, 3, 5),
                evalCell('Aprobado', 70, 4, 5)
            ),
            estudiante(
                'Gustavo Hernán Mejía López',
                'gmejil@fiqsha.demo',
                48,
                null,
                35,
                evalCell('Fallido', 48, 2, 5),
                evalCell('Pendiente')
            ),
            estudiante(
                'Marcela Isabel Duque Vásquez',
                'mduquv@fiqsha.demo',
                52,
                55,
                100,
                evalCell('Aprobado', 77, 4, 5),
                evalCell('Aprobado', 74, 4, 5)
            ),
            estudiante(
                'Paola Andrea Hernández Gil',
                'pherng@fiqsha.demo',
                58,
                null,
                42,
                evalCell('Aprobado', 58, 3, 5),
                evalCell('Pendiente')
            ),
            estudiante(
                'Iván Mauricio Romero Jiménez',
                'iromej@fiqsha.demo',
                98,
                null,
                20,
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'José Luis González Pérez',
                'jgonzp@fiqsha.demo',
                105,
                108,
                100,
                evalCell('Aprobado', 88, 4, 5),
                evalCell('Aprobado', 79, 4, 5)
            )
        ];
    }

    function buildBloqueosDemo() {
        return [
            {
                id: 'bloq-demo-001',
                nombre: 'Cristian Andrés Mejía López',
                email: 'crismejia@fiqsha.demo',
                evaluacionNombre: 'Evaluación Sección 2',
                fechaBloqueo: daysAgoISO(5)
            },
            {
                id: 'bloq-demo-002',
                nombre: 'Miguel Ángel Hernández Díaz',
                email: 'mhernd@fiqsha.demo',
                evaluacionNombre: 'Evaluación Sección 1',
                fechaBloqueo: daysAgoISO(8)
            },
            {
                id: 'bloq-demo-003',
                nombre: 'Sebastián Felipe Gómez Álvarez',
                email: 'sgomea@fiqsha.demo',
                evaluacionNombre: 'Evaluación Sección 2',
                fechaBloqueo: daysAgoISO(11)
            },
            {
                id: 'bloq-demo-004',
                nombre: 'Daniel Esteban Ortiz Restrepo',
                email: 'dortir@fiqsha.demo',
                evaluacionNombre: 'Evaluación Sección 1',
                fechaBloqueo: daysAgoISO(20)
            },
            {
                id: 'bloq-demo-005',
                nombre: 'Gustavo Hernán Mejía López',
                email: 'gmejil@fiqsha.demo',
                evaluacionNombre: 'Evaluación Sección 2',
                fechaBloqueo: daysAgoISO(45)
            }
        ];
    }

    var ESTUDIANTES_DEMO = buildEstudiantesDemo();
    var BLOQUEOS_DEMO = buildBloqueosDemo();

    window.BD_RESULTADOS_CONTENIDO = {
        f002: {
            fechaPublicacion: daysAgoISO(76),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: ESTUDIANTES_DEMO,
            bloqueos: BLOQUEOS_DEMO,
            descargas: DESCARGAS_DEFAULT
        },
        f007: {
            fechaPublicacion: daysAgoISO(24),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: ESTUDIANTES_DEMO,
            bloqueos: BLOQUEOS_DEMO,
            descargas: DESCARGAS_DEFAULT
        },
        '24003': {
            fechaPublicacion: daysAgoISO(90),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: ESTUDIANTES_DEMO.slice(0, 8),
            bloqueos: [],
            descargas: DESCARGAS_SMALL
        },
        '24000': {
            fechaPublicacion: daysAgoISO(45),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: ESTUDIANTES_DEMO,
            bloqueos: BLOQUEOS_DEMO,
            descargas: DESCARGAS_DEFAULT
        },
        'testing-eval': {
            fechaPublicacion: daysAgoISO(3),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: [],
            bloqueos: [],
            descargas: []
        }
    };
})();
