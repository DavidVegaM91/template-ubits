/**
 * Sitemap del playground vanilla — pantallas con diseño real + variantes (empty, pasos, demos).
 * Las hrefs son rutas desde la raíz del repo (sin / inicial). El renderer las resuelve
 * desde documentacion/sitemap.html.
 */
(function (global) {
  'use strict';

  var KIND_LABEL = {
    default: 'Base',
    variant: 'Variante',
    empty: 'Empty',
    step: 'Paso',
  };

  var KIND_STATUS = {
    default: 'neutral',
    variant: 'info',
    empty: 'warning',
    step: 'success',
  };

  function sitemapKindLabel(kind) {
    return KIND_LABEL[kind] || KIND_LABEL.default;
  }

  function sitemapKindStatus(kind) {
    return KIND_STATUS[kind] || 'neutral';
  }

  function link(id, title, href, kind, description) {
    return {
      id: id,
      title: title,
      href: href,
      kind: kind || 'default',
      description: description || '',
    };
  }

  function firstPlanId(tipo) {
    try {
      var bd = global.BD_PLANES_FORMACION;
      if (!bd || typeof bd.getPlanesListData !== 'function') return undefined;
      var row = bd.getPlanesListData(tipo)[0];
      return row && row.id ? String(row.id) : undefined;
    } catch (e) {
      return undefined;
    }
  }

  function firstGrupoId() {
    try {
      var bd = global.BD_PLANES_FORMACION;
      if (bd && typeof bd.getGruposListData === 'function') {
        var row = bd.getGruposListData()[0];
        if (row && row.id) return String(row.id);
      }
      if (bd && typeof bd.getGrupos === 'function') {
        var g = bd.getGrupos()[0];
        if (g && g.id) return String(g.id);
      }
    } catch (e) { /* noop */ }
    return undefined;
  }

  function firstColaboradorPlanId() {
    try {
      var db = global.TAREAS_PLANES_DB;
      var planes = db && typeof db.getPlanesVistaPlanes === 'function' ? db.getPlanesVistaPlanes() : null;
      if (!planes || !planes.length) return undefined;
      var metas = null;
      for (var i = 0; i < planes.length; i++) {
        if ((planes[i].name || '').indexOf('Metas personales') === 0) {
          metas = planes[i];
          break;
        }
      }
      var pick = metas || planes[0];
      return pick && pick.id != null ? String(pick.id) : undefined;
    } catch (e) {
      return undefined;
    }
  }

  function firstSubtaskDemo() {
    try {
      var db = global.TAREAS_PLANES_DB;
      if (!db || typeof db.getTaskDetail !== 'function') return undefined;
      for (var id = 10001; id < 10500; id++) {
        var detail = db.getTaskDetail(id);
        var first = detail && detail.subtasks && detail.subtasks[0];
        if (first && first.id != null) {
          return { taskId: String(id), subId: String(first.id) };
        }
      }
    } catch (e) { /* noop */ }
    return undefined;
  }

  function getPlaygroundSitemap() {
    var expId = 'f007';
    var expNavLibreId = 'f002';
    var editContentId = 'f007';
    var planContenidosId = firstPlanId('contenidos') || 'pf-c-gerencia-general-2026-q1';
    var planCompetenciasId = firstPlanId('competencias') || 'pf-k-024-2026';
    var grupoId = firstGrupoId();
    var colaboradorPlanId = firstColaboradorPlanId();
    var subtaskDemo = firstSubtaskDemo();

    var C = {
      home: 'ubits-colaborador/aprendizaje/home-learn.html',
      uCorp: 'ubits-colaborador/aprendizaje/u-corporativa.html',
      zona: 'ubits-colaborador/aprendizaje/zona-estudio.html',
      progreso: 'ubits-colaborador/aprendizaje/progreso.html',
      exp: 'ubits-colaborador/aprendizaje/exp-estudio/exp-estudio.html',
      expRuta: 'ubits-colaborador/aprendizaje/exp-ruta/exp-ruta.html',
      modoIa: 'ubits-colaborador/aprendizaje/modo-estudio-ia.html',
      iaHr: 'ubits-colaborador/ia-para-hr/ia-para-hr.html',
      tareas: 'ubits-colaborador/tareas/tareas.html',
      planes: 'ubits-colaborador/tareas/planes.html',
      seguimiento: 'ubits-colaborador/tareas/seguimiento.html',
      taskDetail: 'ubits-colaborador/tareas/task-detail.html',
      planDetail: 'ubits-colaborador/tareas/plan-detail.html',
      subtask: 'ubits-colaborador/tareas/subtask-detail.html',
      perfil: 'ubits-colaborador/perfil/profile.html',
      adminInicio: 'ubits-admin/inicio/admin.html',
      contenidos: 'ubits-admin/lms-creator/contenidos.html',
      crear: 'ubits-admin/lms-creator/crear-contenido.html',
      editar: 'ubits-admin/lms-creator/editar-contenido.html',
      crearRuta: 'ubits-admin/lms-creator/crear-ruta.html',
      planesC: 'ubits-admin/lms-creator/planes-formacion/planes-contenidos.html',
      planesK: 'ubits-admin/lms-creator/planes-formacion/planes-competencias.html',
      grupos: 'ubits-admin/lms-creator/planes-formacion/grupos.html',
      crearPC: 'ubits-admin/lms-creator/planes-formacion/crear-plan-contenidos.html',
      crearPK: 'ubits-admin/lms-creator/planes-formacion/crear-plan-competencias.html',
      crearG: 'ubits-admin/lms-creator/planes-formacion/crear-grupo.html',
      chatG: 'ubits-admin/lms-creator/planes-formacion/chat-ia-grupos.html',
      detPC: 'ubits-admin/lms-creator/planes-formacion/detalle-plan.html',
      editPC: 'ubits-admin/lms-creator/planes-formacion/editar-plan-contenidos.html',
      detPK: 'ubits-admin/lms-creator/planes-formacion/detalle-plan-competencias.html',
      editPK: 'ubits-admin/lms-creator/planes-formacion/editar-plan-competencias.html',
      detG: 'ubits-admin/lms-creator/planes-formacion/detalle-grupo.html',
      certs: 'ubits-admin/lms-creator/certificados/certificados.html',
      e360: 'ubits-admin/desempeno/360/admin-360.html',
      e360crear: 'ubits-admin/desempeno/360/crear-360.html',
      plantilla: 'documentacion/plantilla-ubits.html',
      mailG: 'ubits-admin/lms-creator/certificados/mails/mail-certificados-global.html',
      mailC: 'ubits-admin/lms-creator/certificados/mails/mail-certificados-contenido.html',
      mailCol: 'ubits-admin/lms-creator/certificados/mails/mail-certificados-colaborador.html',
      mailRec: 'ubits-colaborador/aprendizaje/mails/mail-recordatorio-plan-formacion.html',
      errores: 'errores/index.html',
      err404: 'errores/404.html',
      errSinAcceso: 'errores/sin-acceso.html',
      errOffline: 'errores/sin-conexion.html',
      errLicencia: 'errores/licencia-vencida.html',
      errServidor: 'errores/error-servidor.html',
      docsInicio: 'documentacion/documentacion.html',
      docsGuia: 'documentacion/guia-prompts.html',
      docsComp: 'documentacion/componentes.html',
      docsColores: 'documentacion/guias/colores.html',
      docsIconos: 'documentacion/guias/iconos.html',
      docsTipo: 'documentacion/guias/tipografia.html',
    };

    var tareasDetalle = [
      link('t-task', 'Detalle de tarea (aprendizaje)', C.taskDetail + '?id=9000000000001', 'default'),
      link('t-task-prog', 'Tarea en progreso (75 %)', C.taskDetail + '?id=9000000000002', 'variant'),
      link('t-task-done', 'Tarea finalizada', C.taskDetail + '?id=9000000000003', 'variant'),
    ];
    if (colaboradorPlanId) {
      tareasDetalle.push(
        link(
          't-plan',
          'Detalle de plan',
          C.planDetail + '?id=' + colaboradorPlanId,
          'default',
          'Vista planes · Metas personales (o primer plan)',
        ),
      );
    }
    if (subtaskDemo) {
      tareasDetalle.push(
        link(
          't-subtask',
          'Detalle de subtarea',
          C.subtask + '?id=' + subtaskDemo.subId + '&taskId=' + subtaskDemo.taskId,
          'default',
          'Inmersivo · desde tarea con subtareas',
        ),
      );
    }

    var lmsPlanes = [
      link('pf-planes', 'Planes (contenidos)', C.planesC, 'default'),
      link('pf-comp', 'Planes (competencias)', C.planesK, 'variant'),
      link('pf-grupos', 'Grupos', C.grupos, 'default'),
      link('pf-crear-c', 'Crear plan contenidos', C.crearPC, 'default'),
      link('pf-crear-k', 'Crear plan competencias', C.crearPK, 'default'),
      link('pf-crear-g', 'Crear grupo', C.crearG, 'default'),
      link('pf-chat', 'Chat IA grupos', C.chatG, 'default'),
    ];
    if (planContenidosId) {
      lmsPlanes.push(
        link('pf-det-c', 'Detalle plan contenidos', C.detPC + '?id=' + planContenidosId, 'default'),
        link('pf-ed-c', 'Editar plan contenidos', C.editPC + '?id=' + planContenidosId, 'default'),
      );
    }
    if (planCompetenciasId) {
      lmsPlanes.push(
        link('pf-det-k', 'Detalle plan competencias', C.detPK + '?id=' + planCompetenciasId, 'default'),
        link('pf-ed-k', 'Editar plan competencias', C.editPK + '?id=' + planCompetenciasId, 'default'),
      );
    }
    if (grupoId) {
      lmsPlanes.push(link('pf-det-g', 'Detalle grupo', C.detG + '?id=' + grupoId, 'default'));
    }

    return [
      {
        id: 'docs-vanilla',
        title: 'Documentación',
        description: 'Secciones extra de vanilla (público menos técnico) + foundations.',
        audience: 'shared',
        groups: [
          {
            id: 'docs-onboarding',
            title: 'Onboarding',
            links: [
              link('d-inicio', 'Inicio', C.docsInicio, 'default', 'Solo vanilla'),
              link('d-guia', 'Guía de prompts', C.docsGuia, 'default', 'Solo vanilla'),
              link('d-comp', 'Componentes', C.docsComp, 'default'),
            ],
          },
          {
            id: 'docs-foundations',
            title: 'Foundations',
            links: [
              link('d-colores', 'Colores', C.docsColores, 'default'),
              link('d-iconos', 'Iconos', C.docsIconos, 'default'),
              link('d-tipo', 'Tipografía', C.docsTipo, 'default'),
            ],
          },
        ],
      },
      {
        id: 'colaborador-aprendizaje',
        title: 'Colaborador · Aprendizaje',
        description: 'Catálogo, zona de estudio, progreso, experiencia de estudio y de ruta (deep links).',
        audience: 'colaborador',
        groups: [
          {
            id: 'home-learn',
            title: 'Catálogo (Home learn)',
            links: [
              link('hl-base', 'Home learn', C.home, 'default', 'Hero search + carruseles'),
              link('hl-buscar', 'Modo búsqueda', C.home + '#buscar', 'variant', 'Foco en el buscador (browse)'),
              link(
                'hl-empty',
                'Sin resultados de búsqueda',
                C.home + '?q=zzzz-sin-resultados',
                'empty',
                'Empty state de búsqueda',
              ),
            ],
          },
          {
            id: 'u-corp',
            title: 'U. corporativa',
            links: [link('uc-base', 'U. corporativa', C.uCorp, 'default')],
          },
          {
            id: 'zona-estudio',
            title: 'Zona de estudio',
            links: [
              link('ze-contenidos', 'Plan de contenidos', C.zona + '#contenidos', 'default'),
              link('ze-competencias', 'Plan de competencias', C.zona + '#competencias', 'variant'),
              link('ze-exclusivo', 'Exclusivo para mi', C.zona + '#exclusivo', 'variant'),
              link('ze-historial', 'Historial y certificados', C.zona + '#historial', 'variant'),
            ],
          },
          {
            id: 'progreso',
            title: 'Progreso (líder)',
            links: [
              link('pr-base', 'Progreso', C.progreso, 'default', 'Equipo normal (~7 personas)'),
              link(
                'pr-grande',
                'Equipo grande',
                C.progreso + '?demo=equipo-grande',
                'variant',
                '25 personas · 10 avatares + chip +N',
              ),
              link(
                'pr-empty',
                'Sin planes vigentes',
                C.progreso + '?demo=sin-planes',
                'empty',
                'Empty en hero + rankings vacíos',
              ),
            ],
          },
          {
            id: 'exp-estudio-portada',
            title: 'Experiencia de estudio · Portada',
            links: [
              link(
                'exp-base',
                'Portada (sin iniciar)',
                C.exp + '?id=' + expId + '#portada-sin-iniciar',
                'default',
                'Demo ' + expId + ' · CTA Comenzar ahora',
              ),
              link(
                'exp-portada-progreso',
                'Portada en progreso',
                C.exp + '?id=' + expId + '#portada-en-progreso',
                'variant',
                'CTA Continuar · índice parcial',
              ),
              link(
                'exp-portada-done',
                'Portada completado',
                C.exp + '?id=' + expId + '#portada-completado',
                'variant',
                '100 % · Ver más + Descargar certificado',
              ),
            ],
          },
          {
            id: 'exp-ruta-portada',
            title: 'Experiencia de ruta · Portada',
            links: [
              link(
                'er-lineal-sin',
                'Lineal · Sin iniciar',
                C.expRuta + '?id=u007&nav=lineal#portada-sin-iniciar',
                'default',
                'Cards bloqueadas · Comenzar ahora',
              ),
              link(
                'er-lineal-prog',
                'Lineal · En progreso',
                C.expRuta + '?id=u007&nav=lineal#portada-en-progreso',
                'variant',
                '2/5 finalizados (40 %) · siguiente desbloqueado',
              ),
              link(
                'er-lineal-done',
                'Lineal · Completado',
                C.expRuta + '?id=u007&nav=lineal#portada-completado',
                'variant',
                '100 % · Ver más contenidos',
              ),
              link(
                'er-libre-sin',
                'Libre · Sin iniciar',
                C.expRuta + '?id=u007&nav=libre#portada-sin-iniciar',
                'variant',
                'Cards bloqueadas hasta Comenzar',
              ),
              link(
                'er-libre-prog',
                'Libre · En progreso',
                C.expRuta + '?id=u007&nav=libre#portada-en-progreso',
                'variant',
                '2/5 finalizados · todos desbloqueados',
              ),
              link(
                'er-libre-done',
                'Libre · Completado',
                C.expRuta + '?id=u007&nav=libre#portada-completado',
                'variant',
                '100 %',
              ),
            ],
          },
          {
            id: 'exp-estudio-recursos',
            title: 'Experiencia de estudio · Recursos',
            links: [
              link('exp-video', 'Video (p-1)', C.exp + '?id=' + expId + '#video', 'step', 'Comunicación para desescalar un conflicto'),
              link('exp-scorm-1', 'SCORM Thomas-Kilmann (p-2)', C.exp + '?id=' + expId + '#scorm-1', 'step'),
              link('exp-scorm-2', 'SCORM simulador (p-4)', C.exp + '?id=' + expId + '#scorm-2', 'step'),
              link('exp-pdf', 'PDF (p-5)', C.exp + '?id=' + expId + '#pdf', 'step', 'Guía mapa de conflicto'),
              link('exp-cierre', 'Cierre', C.exp + '?id=' + expId + '#cierre', 'step', 'Fin del contenido + confeti'),
              link(
                'exp-nav-libre',
                'Experiencia de estudio · Navegación libre',
                C.exp + '?id=' + expNavLibreId + '#portada-sin-iniciar',
                'variant',
                'f002 Prevención del acoso laboral · índice permite saltar',
              ),
            ],
          },
          {
            id: 'exp-estudio-eval-1',
            title: 'Experiencia de estudio · Evaluación Sección 1',
            links: [
              link('exp-eval-bienvenida', 'Bienvenida', C.exp + '?id=' + expId + '#eval-bienvenida', 'step'),
              link('exp-eval-intento', 'Intento (preguntas)', C.exp + '?id=' + expId + '#eval-intento', 'step'),
              link('exp-eval-retomar', 'Retomar (en pausa)', C.exp + '?id=' + expId + '#eval-retomar', 'variant'),
              link('exp-eval-aprobado', 'Resultado aprobado', C.exp + '?id=' + expId + '#eval-resultado-aprobado', 'variant'),
              link('exp-eval-reprobado', 'Resultado reprobado', C.exp + '?id=' + expId + '#eval-resultado-reprobado', 'variant'),
              link(
                'exp-eval-aprobado-tiempo',
                'Tiempo agotado · Aprobado',
                C.exp + '?id=' + expId + '#eval-resultado-aprobado-tiempo',
                'variant',
              ),
              link(
                'exp-eval-reprobado-tiempo',
                'Tiempo agotado · Reprobado',
                C.exp + '?id=' + expId + '#eval-resultado-reprobado-tiempo',
                'variant',
              ),
              link('exp-eval-limite', 'Límite de intentos', C.exp + '?id=' + expId + '#eval-resultado-limite', 'variant'),
            ],
          },
          {
            id: 'exp-estudio-eval-2',
            title: 'Experiencia de estudio · Evaluación Sección 2',
            links: [
              link('exp-eval2-bienvenida', 'Bienvenida', C.exp + '?id=' + expId + '#eval2-bienvenida', 'step'),
              link('exp-eval2-intento', 'Intento (preguntas)', C.exp + '?id=' + expId + '#eval2-intento', 'step'),
              link('exp-eval2-retomar', 'Retomar (en pausa)', C.exp + '?id=' + expId + '#eval2-retomar', 'variant'),
              link('exp-eval2-aprobado', 'Resultado aprobado', C.exp + '?id=' + expId + '#eval2-resultado-aprobado', 'variant'),
              link('exp-eval2-reprobado', 'Resultado reprobado', C.exp + '?id=' + expId + '#eval2-resultado-reprobado', 'variant'),
              link(
                'exp-eval2-aprobado-tiempo',
                'Tiempo agotado · Aprobado',
                C.exp + '?id=' + expId + '#eval2-resultado-aprobado-tiempo',
                'variant',
              ),
              link(
                'exp-eval2-reprobado-tiempo',
                'Tiempo agotado · Reprobado',
                C.exp + '?id=' + expId + '#eval2-resultado-reprobado-tiempo',
                'variant',
              ),
              link('exp-eval2-limite', 'Límite de intentos', C.exp + '?id=' + expId + '#eval2-resultado-limite', 'variant'),
            ],
          },
          {
            id: 'modo-ia',
            title: 'Modo estudio IA',
            links: [link('mia-base', 'Modo estudio IA', C.modoIa, 'default')],
          },
        ],
      },
      {
        id: 'colaborador-tareas',
        title: 'Colaborador · Tareas',
        description: 'Planes, seguimiento y detalle.',
        audience: 'colaborador',
        groups: [
          {
            id: 'tareas-listas',
            title: 'Listas',
            links: [
              link('t-tareas', 'Mis tareas', C.tareas, 'default'),
              link('t-planes', 'Planes', C.planes, 'default'),
              link('t-seguimiento', 'Seguimiento', C.seguimiento, 'default'),
            ],
          },
          { id: 'tareas-detalle', title: 'Detalle (IDs demo estables)', links: tareasDetalle },
        ],
      },
      {
        id: 'colaborador-otros',
        title: 'Colaborador · IA y perfil',
        audience: 'colaborador',
        groups: [
          {
            id: 'colab-ia',
            title: 'IA',
            links: [link('c-agentes', 'Agentes (IA para HR)', C.iaHr, 'default')],
          },
          {
            id: 'colab-perfil',
            title: 'Perfil',
            links: [link('c-perfil', 'Mi perfil', C.perfil, 'default', 'Solo vanilla')],
          },
        ],
      },
      {
        id: 'admin-inicio',
        title: 'Admin · Inicio',
        audience: 'admin',
        groups: [
          {
            id: 'admin-home',
            title: 'Home',
            links: [link('a-inicio', 'Inicio admin', C.adminInicio, 'default')],
          },
        ],
      },
      {
        id: 'admin-lms',
        title: 'Admin · LMS Creator',
        description: 'Listas Workspace + flujos inmersivos (pasos por hash).',
        audience: 'admin',
        groups: [
          {
            id: 'lms-listas',
            title: 'Contenidos',
            links: [link('lms-contenidos', 'Lista de contenidos', C.contenidos, 'default')],
          },
          {
            id: 'lms-crear',
            title: 'Crear contenido (inmersivo)',
            links: [
              link('cc-portada', 'Paso Portada', C.crear + '#portada', 'step'),
              link('cc-recursos', 'Paso Recursos', C.crear + '#recursos', 'step'),
              link(
                'cc-eval-80',
                'Recursos · Evaluación 80 preguntas (borde)',
                C.crear + '#recursos/eval-80',
                'variant',
              ),
              link('cc-cert', 'Paso Certificado', C.crear + '#certificado', 'step'),
              link('cc-ajustes', 'Paso Ajustes', C.crear + '#ajustes', 'step'),
              link('cc-vis', 'Ajustes · Visibilidad', C.crear + '#ajustes-visibilidad', 'step'),
              link('cc-pesos', 'Ajustes · Pesos de evaluación', C.crear + '#ajustes-pesos', 'step'),
              link(
                'cc-nav',
                'Ajustes · Tipo de navegación',
                C.crear + '#ajustes-navegacion',
                'step',
                'Lineal (default) o Libre',
              ),
            ],
          },
          {
            id: 'lms-editar',
            title: 'Editar contenido',
            links: [
              link('ec-base', 'Editar contenido', C.editar + '?id=' + editContentId, 'default', 'Demo ' + editContentId),
              link(
                'ec-recursos',
                'Editar · Recursos',
                C.editar + '?id=' + editContentId + '&seccion=recursos',
                'step',
                'Abre el aviso de impacto encima de Recursos',
              ),
              link(
                'ec-cert',
                'Editar · Certificado',
                C.editar + '?id=' + editContentId + '#certificado',
                'step',
              ),
            ],
          },
          {
            id: 'lms-ruta',
            title: 'Ruta',
            links: [
              link('cr-portada', 'Crear ruta · Portada', C.crearRuta + '#portada', 'step'),
              link('cr-cert', 'Crear ruta · Certificado', C.crearRuta + '#certificado', 'step'),
              link('cr-ajustes', 'Crear ruta · Ajustes', C.crearRuta + '#ajustes', 'step'),
              link(
                'cr-ajustes-vis',
                'Ajustes · Visibilidad',
                C.crearRuta + '#ajustes-visibilidad',
                'step',
              ),
              link(
                'cr-ajustes-nav',
                'Ajustes · Tipo de navegación',
                C.crearRuta + '#ajustes-navegacion',
                'step',
              ),
            ],
          },
          { id: 'lms-planes', title: 'Planes de formación', links: lmsPlanes },
          {
            id: 'lms-certs',
            title: 'Certificados',
            links: [link('cert-desc', 'Descarga de certificados', C.certs, 'default')],
          },
        ],
      },
      {
        id: 'admin-desempeno',
        title: 'Admin · Desempeño',
        audience: 'admin',
        groups: [
          {
            id: 'eval-360',
            title: 'Evaluaciones 360',
            links: [
              link('e360-list', 'Lista de evaluaciones', C.e360, 'default'),
              link('e360-crear', 'Crear evaluación · Hub', C.e360crear + '#hub', 'step'),
              link('e360-tipo', 'Crear · Tipo', C.e360crear + '#tipo', 'step'),
              link('e360-comp', 'Crear · Competencias', C.e360crear + '#competencias', 'step'),
              link('e360-eval', 'Crear · Evaluados', C.e360crear + '#evaluados', 'step'),
            ],
          },
        ],
      },
      {
        id: 'referencia',
        title: 'Referencia del playground',
        audience: 'shared',
        groups: [
          {
            id: 'ref-layouts',
            title: 'Layouts y correos',
            links: [
              link('ref-layouts', 'Plantilla UBITS (layouts)', C.plantilla, 'default'),
              link('ref-mail-g', 'Mail certificados (global)', C.mailG, 'default'),
              link('ref-mail-c', 'Mail certificados (contenido)', C.mailC, 'default'),
              link('ref-mail-col', 'Mail certificados (colaborador)', C.mailCol, 'default'),
              link('ref-mail-rec', 'Mail recordatorio plan', C.mailRec, 'default'),
            ],
          },
          {
            id: 'ref-errores',
            title: 'Errores de sistema',
            links: [
              link('ref-errores-hub', 'Índice de errores', C.errores, 'default'),
              link('ref-errores-404', 'Error 404', C.err404, 'empty'),
              link('ref-errores-sin-acceso', 'Sin acceso al contenido', C.errSinAcceso, 'empty'),
              link('ref-errores-offline', 'Sin conexión a internet', C.errOffline, 'empty'),
              link('ref-errores-licencia', 'Licencia vencida', C.errLicencia, 'empty'),
              link('ref-errores-servidor', 'Error 500 / 503 / 504', C.errServidor, 'empty'),
            ],
          },
        ],
      },
    ];
  }

  function flattenSitemapLinks(sections) {
    sections = sections || getPlaygroundSitemap();
    var out = [];
    sections.forEach(function (s) {
      s.groups.forEach(function (g) {
        g.links.forEach(function (l) {
          out.push(l);
        });
      });
    });
    return out;
  }

  function resolveSitemapHref(href) {
    if (!href) return '#';
    if (/^https?:/i.test(href)) return href;
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var depth = 1;
    if (path.indexOf('/documentacion/') !== -1) {
      var after = path.split('/documentacion/')[1] || '';
      depth = Math.max(1, after.split('/').filter(Boolean).length);
    }
    return '../'.repeat(depth) + String(href).replace(/^\//, '');
  }

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function sectionAudience(section) {
    if (section.audience) return section.audience;
    if (section.id.indexOf('admin') === 0) return 'admin';
    if (section.id.indexOf('colaborador') === 0) return 'colaborador';
    return 'shared';
  }

  function filterByScope(sections, scope) {
    if (scope === 'all') return sections;
    return sections
      .map(function (section) {
        var aud = sectionAudience(section);
        if (aud === scope) return section;
        if (aud !== 'shared') return null;
        var groups = section.groups
          .map(function (group) {
            var links = group.links.filter(function (item) {
              var h = item.href || '';
              if (scope === 'admin') return h.indexOf('ubits-admin/') === 0;
              if (scope === 'colaborador') return h.indexOf('ubits-colaborador/') === 0;
              return true;
            });
            return links.length ? Object.assign({}, group, { links: links }) : null;
          })
          .filter(Boolean);
        return groups.length ? Object.assign({}, section, { groups: groups }) : null;
      })
      .filter(Boolean);
  }

  function filterSections(sections, query, scope) {
    var scoped = filterByScope(sections, scope);
    var q = normalize(query);
    if (!q) return scoped;
    return scoped
      .map(function (section) {
        var groups = section.groups
          .map(function (group) {
            var links = group.links.filter(function (item) {
              var hay = normalize(
                [item.title, item.description || '', item.href, sitemapKindLabel(item.kind)].join(' '),
              );
              return (
                hay.indexOf(q) !== -1 ||
                normalize(section.title).indexOf(q) !== -1 ||
                normalize(group.title).indexOf(q) !== -1
              );
            });
            return links.length ? Object.assign({}, group, { links: links }) : null;
          })
          .filter(Boolean);
        return groups.length ? Object.assign({}, section, { groups: groups }) : null;
      })
      .filter(Boolean);
  }

  function countLinks(sections) {
    return sections.reduce(function (n, s) {
      return (
        n +
        s.groups.reduce(function (m, g) {
          return m + g.links.length;
        }, 0)
      );
    }, 0);
  }

  function statusTagHtml(kind) {
    return (
      '<span class="ubits-status-tag ubits-status-tag--' +
      sitemapKindStatus(kind) +
      ' ubits-status-tag--xs">' +
      '<span class="ubits-status-tag__text">' +
      sitemapKindLabel(kind) +
      '</span></span>'
    );
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderLink(item) {
    var href = resolveSitemapHref(item.href);
    return (
      '<li><a class="ubits-sitemap-card" href="' +
      esc(href) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<div class="ubits-sitemap-card__main">' +
      '<div class="ubits-sitemap-card__title-row">' +
      '<span class="ubits-body-md-semibold ubits-sitemap-card__title">' +
      esc(item.title) +
      '</span>' +
      statusTagHtml(item.kind) +
      '</div>' +
      (item.description
        ? '<p class="ubits-body-sm-regular ubits-sitemap-card__desc">' + esc(item.description) + '</p>'
        : '') +
      '<code class="ubits-sitemap-card__href">' +
      esc('/' + String(item.href || '').replace(/^\//, '')) +
      '</code></div>' +
      '<i class="far fa-arrow-up-right ubits-sitemap-card__arrow" aria-hidden="true"></i></a></li>'
    );
  }

  function renderSections(sections) {
    if (!sections.length) {
      return (
        '<div class="ubits-sitemap-empty">' +
        '<p class="ubits-body-md-regular">No se encontraron resultados</p>' +
        '<p class="ubits-body-sm-regular">Intenta ajustar tu búsqueda.</p></div>'
      );
    }
    return (
      '<div class="ubits-sitemap-sections">' +
      sections
        .map(function (section) {
          return (
            '<section class="ubits-sitemap-section">' +
            '<header class="ubits-sitemap-section__head">' +
            '<h2 class="ubits-heading-h2 ubits-sitemap-section__title">' +
            esc(section.title) +
            '</h2>' +
            (section.description
              ? '<p class="ubits-body-sm-regular ubits-sitemap-section__desc">' +
                esc(section.description) +
                '</p>'
              : '') +
            '</header><div class="ubits-sitemap-groups">' +
            section.groups
              .map(function (group) {
                return (
                  '<div class="ubits-sitemap-group">' +
                  '<h3 class="ubits-body-sm-semibold ubits-sitemap-group__title">' +
                  esc(group.title) +
                  '</h3><ul class="ubits-sitemap-list">' +
                  group.links.map(renderLink).join('') +
                  '</ul></div>'
                );
              })
              .join('') +
            '</div></section>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function mountPlaygroundSitemap(rootId) {
    var root = document.getElementById(rootId || 'playground-sitemap-root');
    if (!root) return;
    var all = getPlaygroundSitemap();
    var state = { query: '', scope: 'all' };

    function paint() {
      var scoped = filterByScope(all, state.scope);
      var visible = filterSections(all, state.query, state.scope);
      var total = countLinks(scoped);
      var shown = countLinks(visible);
      var countEl = root.querySelector('[data-sitemap-count]');
      var listEl = root.querySelector('[data-sitemap-list]');
      if (countEl) {
        countEl.textContent = state.query.trim()
          ? shown + ' de ' + total + ' enlaces'
          : total + ' enlaces';
      }
      if (listEl) listEl.innerHTML = renderSections(visible);
    }

    var search = root.querySelector('[data-sitemap-search]');
    var scope = root.querySelector('[data-sitemap-scope]');
    if (search) {
      search.addEventListener('input', function () {
        state.query = search.value || '';
        paint();
      });
    }
    if (scope) {
      scope.addEventListener('change', function () {
        state.scope = scope.value || 'all';
        if (search) {
          search.placeholder =
            state.scope === 'admin'
              ? 'Buscar en Admin…'
              : state.scope === 'colaborador'
                ? 'Buscar en Colaborador…'
                : 'Buscar pantalla, variante o URL…';
        }
        paint();
      });
    }
    paint();
  }

  global.sitemapKindLabel = sitemapKindLabel;
  global.sitemapKindStatus = sitemapKindStatus;
  global.getPlaygroundSitemap = getPlaygroundSitemap;
  global.flattenSitemapLinks = flattenSitemapLinks;
  global.resolveSitemapHref = resolveSitemapHref;
  global.mountPlaygroundSitemap = mountPlaygroundSitemap;
})(typeof window !== 'undefined' ? window : this);
