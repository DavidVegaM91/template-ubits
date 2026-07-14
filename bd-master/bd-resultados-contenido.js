/**
 * Playground UBITS — resultados por contenido (edición LMS Creator → sección Resultados).
 * Fechas de inicio relativas a «hoy» para que el filtro de periodo escale en demo.
 * Clave: id de contenido. Cargar en editar-contenido.html junto a bd-contenidos-fiqsha.js.
 */
(function () {
    'use strict';

    var EVALUACIONES_DEFAULT = [
        {
            id: 'eval-parcial-1',
            nombre: 'Parcial 1',
            peso: 20,
            porcentajeAprobar: 60,
            limiteIntentos: 3,
            tiempoLimiteMinutos: 30,
            totalPreguntas: 10
        },
        {
            id: 'eval-parcial-2',
            nombre: 'Parcial 2',
            peso: 30,
            porcentajeAprobar: null,
            limiteIntentos: 2,
            tiempoLimiteMinutos: null,
            totalPreguntas: 15
        },
        {
            id: 'eval-final',
            nombre: 'Evaluación final del módulo de resolución de conflictos en equipos de trabajo',
            peso: 50,
            porcentajeAprobar: 70,
            limiteIntentos: null,
            tiempoLimiteMinutos: 45,
            totalPreguntas: 25
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

    function estudiante(nombre, email, daysAgoInicio, daysAgoFin, progresoPercent, ev1, ev2, ev3) {
        return {
            nombre: nombre,
            email: email,
            fechaInicio: daysAgoISO(daysAgoInicio),
            fechaFin: daysAgoFin != null ? daysAgoISO(daysAgoFin) : null,
            progresoPercent: progresoPercent,
            evaluaciones: {
                'eval-parcial-1': ev1,
                'eval-parcial-2': ev2,
                'eval-final': ev3
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
                evalCell('Aprobado', 70, 7, 10),
                evalCell('Fallido', 58, 7, 12),
                evalCell('Pendiente')
            ),
            estudiante(
                'Laura Patricia Gómez Ruiz',
                'lagomez@fiqsha.demo',
                4,
                12,
                100,
                evalCell('Aprobado', 80, 8, 10),
                evalCell('Aprobado', 75, 9, 12),
                evalCell('Aprobado', 82, 9, 11)
            ),
            estudiante(
                'Carlos Andrés García López',
                'cgarcl@fiqsha.demo',
                6,
                18,
                100,
                evalCell('Aprobado', 90, 9, 10),
                evalCell('Aprobado', 83, 10, 12),
                evalCell('Aprobado', 91, 10, 11)
            ),
            estudiante(
                'Laura Valentina Rodríguez Martínez',
                'lrodrm@fiqsha.demo',
                8,
                null,
                62,
                evalCell('Aprobado', 65, 6, 10),
                evalCell('Aprobado', 72, 9, 12),
                evalCell('Pendiente')
            ),
            estudiante(
                'Miguel Ángel Hernández Díaz',
                'mhernd@fiqsha.demo',
                10,
                null,
                38,
                evalCell('Fallido', 45, 4, 10),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Natalia Sofía Torres Sánchez',
                'ntorrs@fiqsha.demo',
                12,
                20,
                100,
                evalCell('Aprobado', 75, 7, 10),
                evalCell('Aprobado', 67, 8, 12),
                evalCell('Aprobado', 73, 8, 11)
            ),
            estudiante(
                'Sebastián Felipe Gómez Álvarez',
                'sgomea@fiqsha.demo',
                14,
                null,
                55,
                evalCell('Aprobado', 60, 6, 10),
                evalCell('Fallido', 50, 6, 12),
                evalCell('Pendiente')
            ),
            estudiante(
                'Juliana Andrea Pérez Castro',
                'jperec@fiqsha.demo',
                16,
                null,
                28,
                evalCell('Pendiente'),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Juan David López González',
                'jlopeg@fiqsha.demo',
                18,
                25,
                100,
                evalCell('Aprobado', 85, 8, 10),
                evalCell('Aprobado', 78, 9, 12),
                evalCell('Aprobado', 88, 10, 11)
            ),
            estudiante(
                'Diego Alejandro Martínez Romero',
                'dmartr@fiqsha.demo',
                19,
                null,
                72,
                evalCell('Aprobado', 70, 7, 10),
                evalCell('Aprobado', 68, 8, 12),
                evalCell('Pendiente')
            ),
            estudiante(
                'Camilo Ernesto Sánchez Vargas',
                'csancv@fiqsha.demo',
                21,
                null,
                15,
                evalCell('Pendiente'),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Andrés Felipe Ruiz Mendoza',
                'aruizm@fiqsha.demo',
                22,
                null,
                48,
                evalCell('Aprobado', 55, 5, 10),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Santiago José Díaz Suárez',
                'sdiazs@fiqsha.demo',
                24,
                28,
                100,
                evalCell('Aprobado', 92, 9, 10),
                evalCell('Aprobado', 88, 11, 12),
                evalCell('Aprobado', 95, 10, 11)
            ),
            estudiante(
                'Daniel Esteban Ortiz Restrepo',
                'dortir@fiqsha.demo',
                25,
                null,
                33,
                evalCell('Fallido', 40, 4, 10),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Carolina María Álvarez Torres',
                'calvat@fiqsha.demo',
                27,
                null,
                80,
                evalCell('Aprobado', 78, 8, 10),
                evalCell('Aprobado', 81, 10, 12),
                evalCell('Pendiente')
            ),
            estudiante(
                'Pablo Antonio Castro Ríos',
                'pcastr@fiqsha.demo',
                35,
                40,
                100,
                evalCell('Aprobado', 86, 9, 10),
                evalCell('Aprobado', 80, 10, 12),
                evalCell('Aprobado', 89, 10, 11)
            ),
            estudiante(
                'Sandra Milena Rojas Pineda',
                'srojap@fiqsha.demo',
                42,
                null,
                58,
                evalCell('Aprobado', 68, 7, 10),
                evalCell('Aprobado', 70, 8, 12),
                evalCell('Pendiente')
            ),
            estudiante(
                'Gustavo Hernán Mejía López',
                'gmejil@fiqsha.demo',
                48,
                null,
                35,
                evalCell('Fallido', 48, 5, 10),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Marcela Isabel Duque Vásquez',
                'mduquv@fiqsha.demo',
                52,
                55,
                100,
                evalCell('Aprobado', 77, 8, 10),
                evalCell('Aprobado', 74, 9, 12),
                evalCell('Aprobado', 80, 9, 11)
            ),
            estudiante(
                'Paola Andrea Hernández Gil',
                'pherng@fiqsha.demo',
                58,
                null,
                42,
                evalCell('Aprobado', 58, 6, 10),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'Iván Mauricio Romero Jiménez',
                'iromej@fiqsha.demo',
                98,
                null,
                20,
                evalCell('Pendiente'),
                evalCell('Pendiente'),
                evalCell('Pendiente')
            ),
            estudiante(
                'José Luis González Pérez',
                'jgonzp@fiqsha.demo',
                105,
                108,
                100,
                evalCell('Aprobado', 88, 9, 10),
                evalCell('Aprobado', 79, 9, 12),
                evalCell('Aprobado', 84, 9, 11)
            )
        ];
    }

    function buildBloqueosDemo() {
        return [
            {
                id: 'bloq-demo-001',
                nombre: 'Cristian Andrés Mejía López',
                email: 'crismejia@fiqsha.demo',
                evaluacionNombre: 'Parcial 2',
                fechaBloqueo: daysAgoISO(5)
            },
            {
                id: 'bloq-demo-002',
                nombre: 'Miguel Ángel Hernández Díaz',
                email: 'mhernd@fiqsha.demo',
                evaluacionNombre: 'Parcial 1',
                fechaBloqueo: daysAgoISO(8)
            },
            {
                id: 'bloq-demo-003',
                nombre: 'Sebastián Felipe Gómez Álvarez',
                email: 'sgomea@fiqsha.demo',
                evaluacionNombre: 'Parcial 2',
                fechaBloqueo: daysAgoISO(11)
            },
            {
                id: 'bloq-demo-004',
                nombre: 'Daniel Esteban Ortiz Restrepo',
                email: 'dortir@fiqsha.demo',
                evaluacionNombre: 'Parcial 1',
                fechaBloqueo: daysAgoISO(20)
            },
            {
                id: 'bloq-demo-005',
                nombre: 'Gustavo Hernán Mejía López',
                email: 'gmejil@fiqsha.demo',
                evaluacionNombre: 'Parcial 2',
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
            bloqueos: BLOQUEOS_DEMO
        },
        f007: {
            fechaPublicacion: daysAgoISO(24),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: ESTUDIANTES_DEMO,
            bloqueos: BLOQUEOS_DEMO
        },
        '24003': {
            fechaPublicacion: daysAgoISO(90),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: ESTUDIANTES_DEMO.slice(0, 8),
            bloqueos: []
        },
        '24000': {
            fechaPublicacion: daysAgoISO(45),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: ESTUDIANTES_DEMO,
            bloqueos: BLOQUEOS_DEMO
        },
        'testing-eval': {
            fechaPublicacion: daysAgoISO(3),
            evaluaciones: EVALUACIONES_DEFAULT,
            estudiantes: [],
            bloqueos: []
        }
    };
})();
