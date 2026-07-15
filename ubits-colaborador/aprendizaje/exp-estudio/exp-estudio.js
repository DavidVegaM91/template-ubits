/**
 * Orquestador Experiencia de Estudio — Portada / Recursos / Cierre
 * Deep links § 2.3.1 · curso demo f007
 */
(function (global) {
  'use strict';

  var ICONS = {
    success: '../../../images/icons/success-icon.svg',
    error: '../../../images/icons/error-icon.svg',
    info: '../../../images/icons/info-icon.svg',
    warning: '../../../images/icons/warning-icon.svg',
    time: '../../../images/icons/time-icon.svg'
  };

  var HASH_PAGE = {
    portada: { view: 'portada', mode: 'por-iniciar' },
    'portada-sin-iniciar': { view: 'portada', mode: 'por-iniciar' },
    'portada-en-progreso': { view: 'portada', mode: 'en-progreso' },
    'portada-completado': { view: 'portada', mode: 'completado' },
    video: { view: 'recursos', pageId: 'p-1' },
    'pagina-p-1': { view: 'recursos', pageId: 'p-1' },
    pdf: { view: 'recursos', pageId: 'p-2' },
    'pagina-p-2': { view: 'recursos', pageId: 'p-2' },
    'scorm-1': { view: 'recursos', pageId: 'p-3' },
    'pagina-p-3': { view: 'recursos', pageId: 'p-3' },
    'scorm-2': { view: 'recursos', pageId: 'p-4' },
    'pagina-p-4': { view: 'recursos', pageId: 'p-4' },
    evaluacion: { view: 'recursos', pageId: 'p-5', evalFase: 'bienvenida' },
    'pagina-p-5': { view: 'recursos', pageId: 'p-5', evalFase: 'bienvenida' },
    'eval-bienvenida': { view: 'recursos', pageId: 'p-5', evalFase: 'bienvenida' },
    'eval-intento': { view: 'recursos', pageId: 'p-5', evalFase: 'evaluacion' },
    'eval-resultado-aprobado': {
      view: 'recursos',
      pageId: 'p-5',
      evalFase: 'resultado',
      evalResultadoKind: 'aprobado'
    },
    'eval-resultado-reprobado': {
      view: 'recursos',
      pageId: 'p-5',
      evalFase: 'resultado',
      evalResultadoKind: 'reprobado'
    },
    'eval-resultado-tiempo': {
      view: 'recursos',
      pageId: 'p-5',
      evalFase: 'resultado',
      evalResultadoKind: 'tiempo'
    },
    'eval-resultado-limite': {
      view: 'recursos',
      pageId: 'p-5',
      evalFase: 'resultado',
      evalResultadoKind: 'limite'
    },
    cierre: { view: 'cierre', pageId: 'p-6' },
    'pagina-p-6': { view: 'cierre', pageId: 'p-6' }
  };

  var session = null;
  var destroyers = [];
  var questionApis = [];
  var stickyApi = null;
  var navApi = null;
  var confettiLaunched = false;
  var applyingHash = false;

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getQueryId() {
    try {
      var p = new URLSearchParams(global.location.search);
      return String(p.get('id') || '').trim() || 'f007';
    } catch (e) {
      return 'f007';
    }
  }

  function findContentById(id) {
    var lists = [];
    if (global.BDS_CONTENIDOS_UBITS && global.BDS_CONTENIDOS_UBITS.contents) {
      lists.push(global.BDS_CONTENIDOS_UBITS.contents);
    }
    if (global.BDS_CONTENIDOS_FIQSHA) {
      if (global.BDS_CONTENIDOS_FIQSHA.contents) lists.push(global.BDS_CONTENIDOS_FIQSHA.contents);
      if (global.BDS_CONTENIDOS_FIQSHA.contentsCreatorOnly) {
        lists.push(global.BDS_CONTENIDOS_FIQSHA.contentsCreatorOnly);
      }
    }
    for (var i = 0; i < lists.length; i++) {
      for (var j = 0; j < lists[i].length; j++) {
        if (String(lists[i][j].id) === String(id)) return lists[i][j];
      }
    }
    return null;
  }

  function nivelLabel(nivelId) {
    var bd = global.BD_MASTER_NIVELES_CONTENIDO;
    if (!bd || !bd.niveles) return 'Básico';
    for (var i = 0; i < bd.niveles.length; i++) {
      if (String(bd.niveles[i].id) === String(nivelId)) return bd.niveles[i].nombre;
    }
    return 'Básico';
  }

  function durationLabel(content) {
    var v = content.tiempoValor != null ? content.tiempoValor : 30;
    var u = String(content.unidadTiempo || 'minutos').toLowerCase();
    if (u.indexOf('min') === 0) return v + ' min';
    return v + ' ' + (content.unidadTiempo || 'min');
  }

  function resolveImage(src) {
    if (!src) return '../../../images/Profile-image.jpg';
    var s = String(src);
    if (/^https?:|^data:|^blob:/i.test(s)) return s;
    if (s.indexOf('../') === 0) return s;
    return '../../../' + s.replace(/^\.\//, '');
  }

  function consumibles() {
    return (global.BD_EXP_ESTUDIO_DEMO && global.BD_EXP_ESTUDIO_DEMO.paginasConsumibles) || [
      'p-1',
      'p-2',
      'p-3',
      'p-4',
      'p-5'
    ];
  }

  function flatPages() {
    return global.BD_EXP_ESTUDIO_DEMO && typeof global.BD_EXP_ESTUDIO_DEMO.getFlatPages === 'function'
      ? global.BD_EXP_ESTUDIO_DEMO.getFlatPages()
      : [];
  }

  function getPage(id) {
    return global.BD_EXP_ESTUDIO_DEMO && typeof global.BD_EXP_ESTUDIO_DEMO.getPageById === 'function'
      ? global.BD_EXP_ESTUDIO_DEMO.getPageById(id)
      : null;
  }

  function progressPercent() {
    var list = consumibles();
    var done = 0;
    list.forEach(function (pid) {
      if (session.completedPageIds[pid]) done += 1;
    });
    return Math.round((done / Math.max(list.length, 1)) * 100);
  }

  function portadaModeFromProgress() {
    var list = consumibles();
    var done = 0;
    list.forEach(function (pid) {
      if (session.completedPageIds[pid]) done += 1;
    });
    if (done >= list.length && session.view === 'cierre') return 'completado';
    if (done >= list.length) return 'completado';
    if (done > 0 || session.lastPageId) return 'en-progreso';
    return 'por-iniciar';
  }

  function clearDestroyers() {
    destroyers.forEach(function (d) {
      try {
        if (d && typeof d.destroy === 'function') d.destroy();
      } catch (e) {}
    });
    destroyers = [];
    questionApis = [];
    if (stickyApi && typeof stickyApi.destroy === 'function') stickyApi.destroy();
    stickyApi = null;
    navApi = null;
  }

  function track(api) {
    if (api) destroyers.push(api);
    return api;
  }

  function setHash(hash) {
    applyingHash = true;
    var h = hash ? '#' + String(hash).replace(/^#/, '') : '';
    if (global.location.hash !== h) {
      global.history.replaceState(null, '', global.location.pathname + global.location.search + h);
    }
    applyingHash = false;
  }

  function seedCompletedBefore(pageId) {
    var order = consumibles().concat(['p-6']);
    var idx = order.indexOf(pageId);
    session.completedPageIds = {};
    for (var i = 0; i < idx; i++) {
      if (order[i] !== 'p-6') session.completedPageIds[order[i]] = true;
    }
  }

  function applyDeepLink(hashRaw) {
    var key = String(hashRaw || '')
      .replace(/^#/, '')
      .trim()
      .toLowerCase();
    if (!key) {
      session.view = 'portada';
      session.portadaMode = portadaModeFromProgress();
      session.currentPageId = null;
      return;
    }
    var cfg = HASH_PAGE[key];
    if (!cfg) {
      session.view = 'portada';
      session.portadaMode = 'por-iniciar';
      return;
    }

    if (cfg.view === 'portada') {
      session.view = 'portada';
      session.portadaMode = cfg.mode;
      session.currentPageId = null;
      if (cfg.mode === 'por-iniciar') {
        session.completedPageIds = {};
        session.lastPageId = null;
      } else if (cfg.mode === 'en-progreso') {
        session.completedPageIds = { 'p-1': true, 'p-2': true };
        session.lastPageId = 'p-3';
      } else if (cfg.mode === 'completado') {
        consumibles().forEach(function (pid) {
          session.completedPageIds[pid] = true;
        });
        session.completedPageIds['p-6'] = true;
        session.lastPageId = 'p-6';
      }
      return;
    }

    if (cfg.view === 'cierre') {
      consumibles().forEach(function (pid) {
        session.completedPageIds[pid] = true;
      });
      session.completedPageIds['p-6'] = true;
      session.view = 'cierre';
      session.currentPageId = 'p-6';
      session.lastPageId = 'p-6';
      session.portadaMode = 'completado';
      return;
    }

    // Recursos / eval
    session.view = 'recursos';
    session.currentPageId = cfg.pageId;
    session.lastPageId = cfg.pageId;
    seedCompletedBefore(cfg.pageId);

    if (cfg.pageId === 'p-5') {
      session.evalFase = cfg.evalFase || 'bienvenida';
      session.evalResultadoKind = cfg.evalResultadoKind || null;
      if (session.evalFase === 'evaluacion') {
        session.evalIntentoActual = session.evalIntentoActual || 1;
        session.answers = {};
      }
      if (session.evalFase === 'resultado') {
        var kind = session.evalResultadoKind;
        var total = 10;
        var minPassSeed =
          (getPage('p-5') && getPage('p-5').evalConfig && getPage('p-5').evalConfig.minPassScore) ||
          7;
        if (kind === 'aprobado') {
          session.evalScore = {
            aprobado: true,
            correctas: Math.max(minPassSeed, 8),
            total: total,
            puntajeMin: minPassSeed
          };
          session.evalIntentoActual = 1;
        } else if (kind === 'reprobado') {
          session.evalScore = { aprobado: false, correctas: 4, total: total, puntajeMin: minPassSeed };
          session.evalIntentoActual = 1;
        } else if (kind === 'tiempo') {
          session.evalScore = { aprobado: false, correctas: 3, total: total, puntajeMin: minPassSeed };
          session.evalIntentoActual = 1;
        } else if (kind === 'limite') {
          session.evalScore = { aprobado: false, correctas: 3, total: total, puntajeMin: minPassSeed };
          session.evalIntentoActual = 2;
        }
      }
    }
  }

  function pageState(pageId) {
    var isCompleted = !!session.completedPageIds[pageId];
    if (pageId === 'p-6' && (session.view === 'cierre' || session.completedPageIds['p-6'])) {
      isCompleted = true;
    }
    var isCurrent =
      (session.view === 'recursos' && session.currentPageId === pageId) ||
      (session.view === 'cierre' && pageId === 'p-6') ||
      (session.view === 'portada' &&
        session.portadaMode === 'en-progreso' &&
        pageId === session.lastPageId);

    if (session.view === 'cierre' && pageId === 'p-6') return 'activa';
    if (isCompleted && isCurrent && session.view !== 'cierre') return 'completada-activa';
    if (isCompleted) return 'completada';
    if (session.view === 'recursos' && session.currentPageId === pageId) return 'activa';
    if (
      session.view === 'portada' &&
      session.portadaMode === 'en-progreso' &&
      pageId === session.lastPageId
    ) {
      return 'activa';
    }
    if (pageId === 'p-6') return 'bloqueada';
    return 'bloqueada';
  }

  function isPageClickable(pageId, state) {
    if (session.view === 'portada' && session.portadaMode === 'por-iniciar') return false;
    if (state === 'completada' || state === 'completada-activa' || state === 'activa') return true;
    var order = flatPages().map(function (p) {
      return p.id;
    });
    var idx = order.indexOf(pageId);
    if (idx === 0) return session.portadaMode !== 'por-iniciar' || session.view !== 'portada';
    if (idx < 0) return false;
    var prev = order[idx - 1];
    return !!session.completedPageIds[prev];
  }

  function buildIndiceSections() {
    var demo = global.BD_EXP_ESTUDIO_DEMO;
    if (!demo) return [];
    return (demo.secciones || []).map(function (sec) {
      return {
        id: sec.id,
        title: sec.titulo,
        descriptionHtml: sec.descripcionHtml || '',
        pages: (sec.paginas || []).map(function (p) {
          var st = pageState(p.id);
          return {
            id: p.id,
            title: p.titulo,
            tipo: p.tipo,
            state: st,
            clickable: isPageClickable(p.id, st)
          };
        })
      };
    });
  }

  function mountIndice(container) {
    if (!container || typeof global.indiceExpEstudioHtml !== 'function') return;
    var sections = buildIndiceSections();
    container.innerHTML = global.indiceExpEstudioHtml({ sections: sections });
    track(
      global.initIndiceExpEstudio(container.querySelector('.ubits-indice-exp') || container, {
        sections: sections,
        onPageClick: function (pageId) {
          goToPage(pageId);
        }
      })
    );
  }

  function toast(type, msg) {
    if (typeof global.showToast === 'function') global.showToast(type, msg);
  }

  function goHomeLearn() {
    global.location.href = '../home-learn.html#buscar';
  }

  function downloadCertToast() {
    toast('success', 'Certificado descargado (demo)');
  }

  /* ─── Stage shell ─── */
  function ensureStandardStage() {
    var stage = document.getElementById('exp-estudio-stage');
    if (!stage) return null;
    stage.className = 'exp-estudio-stage';
    if (!document.getElementById('exp-estudio-main') || !document.getElementById('exp-estudio-aside')) {
      stage.innerHTML =
        '<div id="exp-estudio-main" class="exp-estudio-col" aria-live="polite"></div>' +
        '<aside id="exp-estudio-aside" class="exp-estudio-col exp-estudio-col--aside"></aside>';
    }
    return {
      stage: stage,
      main: document.getElementById('exp-estudio-main'),
      aside: document.getElementById('exp-estudio-aside')
    };
  }

  /* ─── Portada ─── */
  function renderPortada(content) {
    var stage = document.getElementById('exp-estudio-stage');
    if (!stage) return;
    var img = resolveImage(content.imagen || content.imagePath);
    var isFiqsha =
      content.catalogoId === 'catalogo_fiqsha' || String(content.origen || '').indexOf('fiqsha') !== -1;
    var ficha = '';
    if (isFiqsha) {
      ficha =
        '<div class="exp-estudio-ficha">' +
        '<p class="exp-estudio-ficha__label ubits-body-sm-semibold">Categoría</p>' +
        '<div class="exp-estudio-ficha__row">' +
        '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--neutral ubits-badge-tag--sm">' +
        '<span class="ubits-badge-tag__text">Trabajo en equipo</span></span></div></div>';
    }
    /* Tres hijos directos (como React): hero | aside | meta — grid areas controlan orden */
    stage.className = 'exp-estudio-stage exp-estudio-stage--portada';
    stage.innerHTML =
      '<div class="exp-estudio-hero"><img src="' +
      esc(img) +
      '" alt="" /></div>' +
      '<aside id="exp-estudio-aside" class="exp-estudio-col exp-estudio-col--aside"></aside>' +
      '<div class="exp-estudio-portada-meta">' +
      ficha +
      '<div class="exp-estudio-ficha">' +
      '<p class="exp-estudio-ficha__title ubits-body-md-semibold">Descripción</p>' +
      '<p class="exp-estudio-desc ubits-body-md-regular">' +
      esc(content.descripcion || '') +
      '</p></div></div>';
    renderPortadaAside(document.getElementById('exp-estudio-aside'), content);
  }

  function renderPortadaAside(aside, content) {
    if (!aside) return;
    var mode = session.portadaMode || 'por-iniciar';
    var pct = progressPercent();
    var html = '<div class="exp-estudio-aside-stack">';
    if (typeof global.tituloSpecsCtaExpEstudioHtml === 'function') {
      html += global.tituloSpecsCtaExpEstudioHtml({
        contentType: content.tipoContenido || 'Curso',
        title: content.titulo || content.title || '',
        level: nivelLabel(content.nivelId),
        duration: durationLabel(content),
        language: content.idioma || 'Español',
        hasCertificate: !!content.conCertificacion,
        subtitles: false,
        mode: mode,
        progressValue: mode === 'completado' ? 100 : pct
      });
    }
    html += '<div id="exp-estudio-indice-mount"></div></div>';
    aside.innerHTML = html;
    var ctaRoot = aside.querySelector('.ubits-titulo-specs-cta-exp');
    track(
      global.initTituloSpecsCtaExpEstudio(ctaRoot, {
        onPrimary: function () {
          if (mode === 'por-iniciar') {
            session.view = 'recursos';
            session.currentPageId = 'p-1';
            session.lastPageId = 'p-1';
            session.portadaMode = 'en-progreso';
            setHash('pagina-p-1');
            render();
          } else if (mode === 'en-progreso') {
            var target = session.lastPageId || 'p-1';
            goToPage(target);
          } else {
            goHomeLearn();
          }
        },
        onSecondary: function () {
          downloadCertToast();
        }
      })
    );
    mountIndice(document.getElementById('exp-estudio-indice-mount'));
  }

  /* ─── Recursos mount ─── */
  /** Paridad React formatPesoBytes (MiB, 1 decimal es-CO) */
  function formatBytes(n) {
    var mb = Number(n || 0) / (1024 * 1024);
    return mb.toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' MB';
  }

  function renderComplementarios(comps) {
    if (!comps || !comps.length) return '';
    return (
      '<div class="exp-estudio-comps">' +
      comps
        .map(function (c) {
          if (c.tipo === 'archivo-descargable') {
            /* Paridad React downloadCard: ícono + nombre/peso + Descargar archivo tertiary sm */
            return (
              '<div class="exp-estudio-download-card">' +
              '<span class="exp-estudio-download-card__icon" aria-hidden="true">' +
              '<i class="far fa-file-pdf"></i></span>' +
              '<div class="exp-estudio-download-card__meta">' +
              '<p class="exp-estudio-download-card__name ubits-body-sm-semibold">' +
              esc(c.nombre || 'Archivo') +
              '</p>' +
              '<p class="exp-estudio-download-card__size ubits-body-xs-regular">' +
              formatBytes(c.pesoBytes || 0) +
              '</p></div>' +
              '<a class="ubits-button ubits-button--tertiary ubits-button--sm" href="' +
              esc(c.url || '#') +
              '" download>' +
              '<i class="far fa-file-arrow-down" aria-hidden="true"></i>' +
              '<span>Descargar archivo</span></a></div>'
            );
          }
          if (c.tipo === 'texto') {
            return (
              '<div class="exp-estudio-comp">' +
              '<div class="exp-estudio-comp__body ubits-body-md-regular">' +
              (c.html || '') +
              '</div></div>'
            );
          }
          return '';
        })
        .join('') +
      '</div>'
    );
  }

  function mapQuestionToModel(q, index) {
    var type = q.type;
    var model = { type: type, statement: q.prompt || '' };
    if (type === 'multiple_choice_single' || type === 'multiple_choice_multiple') {
      var correctIds = q.correctOptionIds || [];
      model.options = (q.options || []).map(function (o) {
        return { text: o.text, correct: correctIds.indexOf(o.id) !== -1 };
      });
    } else if (type === 'true_false') {
      model.trueFalseCorrect = q.correct ? 'true' : 'false';
    } else if (type === 'short_answer') {
      model.shortAnswer = { answer: String(q.correctText || ''), accuracy: 'exact' };
    } else if (type === 'matching') {
      model.pairs = (q.pairs || []).map(function (p) {
        return { a: p.a, b: p.b };
      });
    }
    return model;
  }

  function isAnswerComplete(api) {
    if (!api || typeof api.getCollabAnswer !== 'function') return false;
    var ans = api.getCollabAnswer();
    var model = typeof api.getModel === 'function' ? api.getModel() : {};
    var t = model.type;
    if (t === 'matching') {
      return typeof api.isCollabAnswerComplete === 'function'
        ? api.isCollabAnswerComplete()
        : Array.isArray(ans) &&
            ans.every(function (a) {
              return a && a.selectedBIndex != null;
            });
    }
    if (t === 'multiple_choice_multiple') return Array.isArray(ans) && ans.length > 0;
    if (t === 'short_answer') return String(ans || '').trim().length > 0;
    return ans != null && String(ans).trim() !== '';
  }

  function allQuestionsAnswered() {
    if (!questionApis.length) return false;
    return questionApis.every(isAnswerComplete);
  }

  function updateEvalContinuarEnabled() {
    if (navApi && typeof navApi.setPrimaryDisabled === 'function') {
      if (session.evalFase === 'evaluacion') {
        navApi.setPrimaryDisabled(!allQuestionsAnswered());
      }
    }
  }

  function gradeEval() {
    var page = getPage('p-5');
    var preguntas = (page && page.preguntas) || [];
    var correct = 0;
    questionApis.forEach(function (api, i) {
      var q = preguntas[i];
      if (!q || !api) return;
      var ans = api.getCollabAnswer();
      var t = q.type;
      if (t === 'multiple_choice_single') {
        var idx = parseInt(String(ans), 10) - 1;
        var opt = q.options && q.options[idx];
        if (opt && (q.correctOptionIds || []).indexOf(opt.id) !== -1) correct += 1;
      } else if (t === 'multiple_choice_multiple') {
        var selected = (Array.isArray(ans) ? ans : []).map(function (v) {
          return parseInt(String(v), 10) - 1;
        });
        var want = {};
        (q.correctOptionIds || []).forEach(function (id) {
          want[id] = true;
        });
        var ok = true;
        (q.options || []).forEach(function (o, oi) {
          var should = !!want[o.id];
          var has = selected.indexOf(oi) !== -1;
          if (should !== has) ok = false;
        });
        if (ok) correct += 1;
      } else if (t === 'true_false') {
        var expect = q.correct ? 'true' : 'false';
        if (String(ans) === expect) correct += 1;
      } else if (t === 'short_answer') {
        if (
          String(ans || '')
            .trim()
            .toLowerCase() ===
          String(q.correctText || '')
            .trim()
            .toLowerCase()
        ) {
          correct += 1;
        }
      } else if (t === 'matching') {
        var matches = Array.isArray(ans) ? ans : [];
        var allOk =
          matches.length === (q.pairs || []).length &&
          matches.every(function (m) {
            return m && String(m.selectedBIndex) === String(m.pairIndex);
          });
        if (allOk) correct += 1;
      }
    });
    return { correctas: correct, total: preguntas.length || 10 };
  }

  function stopEvalTimer() {
    if (stickyApi && typeof stickyApi.stop === 'function') stickyApi.stop();
    if (stickyApi && typeof stickyApi.destroy === 'function') stickyApi.destroy();
    stickyApi = null;
  }

  function finishEvalWithKind(kind, score) {
    stopEvalTimer();
    session.evalFase = 'resultado';
    session.evalResultadoKind = kind;
    session.evalScore = score || session.evalScore;
    if (kind === 'aprobado') {
      session.completedPageIds['p-5'] = true;
    }
    setHash('eval-resultado-' + kind);
    render();
  }

  function renderEvalBienvenida(main, page) {
    var cfg = page.evalConfig || {};
    var M = cfg.timeLimitMinutes || 10;
    var N = cfg.maxAttempts || 2;
    var bullets =
      (cfg.timeLimitEnabled !== false
        ? '<li><strong>Tiempo límite:</strong> ' + M + ' minutos para completar la evaluación.</li>'
        : '') +
      '<li><strong>Intentos:</strong> Tienes ' +
      N +
      ' intentos disponibles.</li>' +
      '<li><strong>Importante:</strong> Una vez inicies la evaluación, cualquier salida, recarga o cierre de esta ventana, contará como un intento.</li>';

    main.innerHTML =
      '<div class="exp-estudio-eval exp-estudio-eval--bienvenida">' +
      '<img class="exp-estudio-eval__icon" src="' +
      ICONS.info +
      '" alt="" />' +
      '<h2 class="exp-estudio-eval__heading ubits-heading-h2">Vas a iniciar una evaluación</h2>' +
      '<p class="exp-estudio-eval__lead ubits-body-md-regular">Antes de hacerlo, ten en cuenta lo siguiente:</p>' +
      '<div class="exp-estudio-eval" style="align-items:stretch;text-align:left;background:var(--ubits-feedback-bg-info-subtle);border:none;">' +
      '<p class="ubits-body-md-semibold" style="margin:0;color:var(--ubits-feedback-fg-info-subtle);">Recordatorio</p>' +
      '<ul class="exp-estudio-eval__list ubits-body-md-regular">' +
      bullets +
      '</ul></div></div>';
  }

  function renderEvalPreguntas(main, page) {
    main.innerHTML =
      '<div class="exp-estudio-eval">' +
      '<div id="exp-estudio-eval-sticky"></div>' +
      '<div class="exp-estudio-eval__questions" id="exp-estudio-eval-questions"></div></div>';

    var cfg = page.evalConfig || {};
    var seconds =
      cfg.timeLimitEnabled !== false ? Math.max(1, (cfg.timeLimitMinutes || 10) * 60) : 99999;
    var stickyHost = document.getElementById('exp-estudio-eval-sticky');
    if (typeof global.createEvalStickyBarExpEstudio === 'function' && stickyHost) {
      stickyApi = global.createEvalStickyBarExpEstudio({
        container: stickyHost,
        remainingSeconds: seconds,
        attempt: session.evalIntentoActual || 1,
        maxAttempts: cfg.maxAttempts || 2,
        onExpire: function () {
          var scored = gradeEval();
          var attempts = session.evalIntentoActual || 1;
          var maxA = cfg.maxAttempts || 2;
          if (attempts >= maxA) {
            finishEvalWithKind('limite', {
              aprobado: false,
              correctas: scored.correctas,
              total: scored.total,
              puntajeMin: 7
            });
          } else {
            finishEvalWithKind('tiempo', {
              aprobado: false,
              correctas: scored.correctas,
              total: scored.total,
              puntajeMin: 7
            });
          }
        }
      });
    }

    var host = document.getElementById('exp-estudio-eval-questions');
    questionApis = [];
    (page.preguntas || []).forEach(function (q, i) {
      var wrapId = 'exp-estudio-q-' + (i + 1);
      var wrap = document.createElement('div');
      wrap.id = wrapId;
      host.appendChild(wrap);
      if (typeof global.createLearnQuestion === 'function') {
        var api = global.createLearnQuestion({
          containerId: wrapId,
          qId: i + 1,
          mode: 'collab',
          model: mapQuestionToModel(q, i),
          onCollabChange: function () {
            updateEvalContinuarEnabled();
          }
        });
        if (api) {
          questionApis.push(api);
          // Ocultar menú ⋮ en modo colaborador
          var menu = wrap.querySelector('.learn-question__menu');
          if (menu) menu.style.display = 'none';
        }
      }
    });
    host.addEventListener('change', updateEvalContinuarEnabled);
    host.addEventListener('input', updateEvalContinuarEnabled);
  }

  function renderEvalResultado(main) {
    var kind = session.evalResultadoKind || 'reprobado';
    var score = session.evalScore || { correctas: 0, total: 10, puntajeMin: 7 };
    var icon = ICONS.error;
    var title = '¡No aprobaste!';
    var body = '';

    if (kind === 'aprobado') {
      icon = ICONS.success;
      title = '¡Aprobaste!';
      body =
        '<p class="exp-estudio-eval__result-line ubits-body-md-regular">El puntaje requerido para aprobar es ' +
        esc(String(score.puntajeMin != null ? score.puntajeMin : 7)) +
        '</p>' +
        '<p class="exp-estudio-eval__result-line exp-estudio-eval__result-line--strong ubits-body-md-semibold">Respuestas correctas ' +
        score.correctas +
        ' de ' +
        score.total +
        '</p>' +
        '<p class="exp-estudio-eval__result-line ubits-body-md-regular">Sigue aprendiendo,</p>' +
        '<p class="exp-estudio-eval__result-line ubits-body-md-regular">¡puedes continuar a la siguiente página!</p>';
    } else if (kind === 'tiempo') {
      icon = ICONS.time;
      title = '¡Tiempo agotado!';
      body =
        '<p class="exp-estudio-eval__lead ubits-body-md-regular">Se ha agotado el tiempo para responder la evaluación correctamente. Inténtalo de nuevo para poder continuar</p>';
    } else if (kind === 'limite') {
      icon = ICONS.warning;
      title = '¡Alcanzaste el límite de intentos permitidos!';
      body =
        '<p class="exp-estudio-eval__result-line ubits-body-md-regular">Para aprobar necesitas 70%, es decir, al menos 7 de las ' +
        score.total +
        ' preguntas</p>' +
        '<p class="exp-estudio-eval__result-line exp-estudio-eval__result-line--strong ubits-body-md-semibold">Respuestas correctas ' +
        score.correctas +
        ' de ' +
        score.total +
        '</p>' +
        '<p class="exp-estudio-eval__lead ubits-body-md-regular">Has agotado todos tus intentos y no alcanzaste la puntuación mínima para aprobar. Comunícate con el administrador de capacitación de tu empresa para solicitar un nuevo intento.</p>';
    } else {
      body =
        '<p class="exp-estudio-eval__result-line ubits-body-md-regular">El puntaje requerido para aprobar es ' +
        esc(String(score.puntajeMin != null ? score.puntajeMin : 7)) +
        '</p>' +
        '<p class="exp-estudio-eval__result-line exp-estudio-eval__result-line--strong ubits-body-md-semibold">Respuestas correctas ' +
        score.correctas +
        ' de ' +
        score.total +
        '</p>' +
        '<p class="exp-estudio-eval__result-line ubits-body-md-regular">Inténtalo de nuevo para poder continuar</p>';
    }

    main.innerHTML =
      '<div class="exp-estudio-eval exp-estudio-eval--resultado">' +
      '<img class="exp-estudio-eval__icon" src="' +
      icon +
      '" alt="" />' +
      '<h2 class="exp-estudio-eval__heading ubits-heading-h2">' +
      esc(title) +
      '</h2>' +
      body +
      '</div>';
  }

  function renderRecursoMain(main, page) {
    if (!page) {
      main.innerHTML = '<p>Página no encontrada</p>';
      return;
    }
    if (page.tipo === 'evaluacion') {
      if (session.evalFase === 'evaluacion') renderEvalPreguntas(main, page);
      else if (session.evalFase === 'resultado') renderEvalResultado(main);
      else renderEvalBienvenida(main, page);
      return;
    }

    var surface = '';
    if (page.tipo === 'video') {
      var posterAttr = page.videoPoster
        ? ' poster="' + esc(page.videoPoster) + '"'
        : '';
      surface =
        '<video controls playsinline preload="metadata" src="' +
        esc(page.videoSrc || '') +
        '"' +
        posterAttr +
        '></video>';
    } else if (page.tipo === 'pdf') {
      surface =
        '<iframe title="PDF" src="' + esc(page.pdfSrc || '') + '"></iframe>';
    } else if (page.tipo === 'scorm') {
      surface =
        '<iframe title="SCORM" src="' + esc(page.scormSrc || '') + '" allowfullscreen></iframe>';
    } else if (page.tipo === 'embebido') {
      surface =
        '<iframe title="Contenido embebido" src="' +
        esc(page.embedSrc || '') +
        '" loading="lazy" allow="fullscreen; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    } else {
      surface = '<p class="ubits-body-md-regular" style="padding:var(--padding-lg)">Recurso</p>';
    }

    /* Sin título encima del recurso (paridad Creator). SCORM IA lleva el título solo adentro del paquete. */
    var actionsHtml = buildResourceActionsHtml(page);
    main.innerHTML =
      '<div class="exp-estudio-recurso-stack">' +
      '<div class="exp-estudio-recurso">' +
      '<div class="exp-estudio-recurso__surface">' +
      surface +
      '</div>' +
      '</div>' +
      actionsHtml +
      '</div>' +
      renderComplementarios(page.complementarios);
  }

  function getPageFullscreenSrc(page) {
    if (!page) return '';
    if (page.tipo === 'pdf') return String(page.pdfSrc || '').trim();
    if (page.tipo === 'scorm') return String(page.scormSrc || '').trim();
    if (page.tipo === 'embebido') return String(page.embedSrc || '').trim();
    return '';
  }

  function buildResourceActionsHtml(page) {
    if (!page) return '';
    var tipo = page.tipo;
    var showFs = tipo === 'pdf' || tipo === 'scorm' || tipo === 'embebido';
    var parts = [];
    if (tipo === 'pdf' && page.allowPdfDownload !== false && page.pdfSrc) {
      parts.push(
        '<a class="ubits-button ubits-button--secondary ubits-button--sm" href="' +
          esc(page.pdfSrc) +
          '" download>' +
          '<i class="far fa-download" aria-hidden="true"></i><span>Descargar</span></a>'
      );
    }
    if (showFs) {
      var fsSrc = getPageFullscreenSrc(page);
      if (fsSrc) {
        parts.push(
          '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" ' +
            'data-exp-estudio-fs' +
            ' data-fs-src="' +
            esc(fsSrc) +
            '"' +
            ' data-fs-title="' +
            esc(page.titulo || '') +
            '"' +
            ' data-fs-tipo="' +
            esc(tipo) +
            '">' +
            '<i class="far fa-expand" aria-hidden="true"></i><span>Ver en pantalla completa</span></button>'
        );
      }
    }
    if (!parts.length) return '';
    return (
      '<div class="exp-estudio-recurso__actions">' + parts.join('') + '</div>'
    );
  }

  function closeExpEstudioFullscreenLightbox() {
    var overlay = document.getElementById('exp-estudio-fs-lightbox');
    if (overlay) overlay.remove();
    document.body.classList.remove('exp-estudio-fs-open');
    if (global.__expEstudioFsKeydown) {
      document.removeEventListener('keydown', global.__expEstudioFsKeydown);
      global.__expEstudioFsKeydown = null;
    }
  }

  function openExpEstudioFullscreenLightbox(src, title, tipo) {
    closeExpEstudioFullscreenLightbox();
    if (!src) return;
    var label = title || 'Recurso';
    var iframeTitle =
      tipo === 'pdf' ? 'PDF' : tipo === 'scorm' ? 'SCORM' : 'Contenido embebido';
    var overlay = document.createElement('div');
    overlay.id = 'exp-estudio-fs-lightbox';
    overlay.className = 'exp-estudio-fs-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', label);
    overlay.innerHTML =
      '<div class="exp-estudio-fs-lightbox__band exp-estudio-fs-lightbox__band--head">' +
      '<div class="exp-estudio-fs-lightbox__band-inner">' +
      '<p class="exp-estudio-fs-lightbox__title">' +
      esc(label) +
      '</p>' +
      '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" ' +
      'data-exp-estudio-fs-close aria-label="Cerrar" data-tooltip="Cerrar" data-tooltip-delay="1000">' +
      '<i class="far fa-times" aria-hidden="true"></i></button>' +
      '</div></div>' +
      '<div class="exp-estudio-fs-lightbox__main">' +
      '<div class="exp-estudio-fs-lightbox__body">' +
      '<iframe title="' +
      esc(iframeTitle) +
      '" src="' +
      esc(src) +
      '" allowfullscreen></iframe>' +
      '</div></div>';

    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) closeExpEstudioFullscreenLightbox();
    });
    document.body.appendChild(overlay);
    document.body.classList.add('exp-estudio-fs-open');

    global.__expEstudioFsKeydown = function (ev) {
      if (ev.key === 'Escape') closeExpEstudioFullscreenLightbox();
    };
    document.addEventListener('keydown', global.__expEstudioFsKeydown);
  }

  function bindExpEstudioFullscreenOnce() {
    if (global.__expEstudioFsBound) return;
    global.__expEstudioFsBound = true;
    document.addEventListener('click', function (ev) {
      var closeBtn = ev.target && ev.target.closest && ev.target.closest('[data-exp-estudio-fs-close]');
      if (closeBtn) {
        ev.preventDefault();
        closeExpEstudioFullscreenLightbox();
        return;
      }
      var openBtn = ev.target && ev.target.closest && ev.target.closest('[data-exp-estudio-fs]');
      if (!openBtn) return;
      ev.preventDefault();
      openExpEstudioFullscreenLightbox(
        openBtn.getAttribute('data-fs-src') || '',
        openBtn.getAttribute('data-fs-title') || '',
        openBtn.getAttribute('data-fs-tipo') || ''
      );
    });
  }

  function evalPrimaryLabel() {
    if (session.evalFase === 'resultado') {
      if (session.evalResultadoKind === 'aprobado') return 'Continuar';
      if (session.evalResultadoKind === 'limite') return 'Ir al inicio';
      return 'Reintentar';
    }
    return 'Continuar';
  }

  function handleEvalPrimary() {
    var page = getPage('p-5');
    var cfg = (page && page.evalConfig) || {};
    var maxA = cfg.maxAttempts || 2;

    if (session.evalFase === 'bienvenida') {
      session.evalFase = 'evaluacion';
      session.answers = {};
      setHash('eval-intento');
      render();
      return;
    }
    if (session.evalFase === 'evaluacion') {
      if (!allQuestionsAnswered()) return;
      var scored = gradeEval();
      var minPass =
        (getPage('p-5') && getPage('p-5').evalConfig && getPage('p-5').evalConfig.minPassScore) ||
        7;
      var pass = scored.correctas >= minPass;
      if (pass) {
        finishEvalWithKind('aprobado', {
          aprobado: true,
          correctas: scored.correctas,
          total: scored.total,
          puntajeMin: minPass
        });
      } else if ((session.evalIntentoActual || 1) >= maxA) {
        finishEvalWithKind('limite', {
          aprobado: false,
          correctas: scored.correctas,
          total: scored.total,
          puntajeMin: minPass
        });
      } else {
        finishEvalWithKind('reprobado', {
          aprobado: false,
          correctas: scored.correctas,
          total: scored.total,
          puntajeMin: minPass
        });
      }
      return;
    }
    if (session.evalFase === 'resultado') {
      var kind = session.evalResultadoKind;
      if (kind === 'aprobado') {
        session.completedPageIds['p-5'] = true;
        goToCierre();
      } else if (kind === 'limite') {
        goHomeLearn();
      } else {
        session.evalIntentoActual = (session.evalIntentoActual || 1) + 1;
        session.evalFase = 'evaluacion';
        session.evalResultadoKind = null;
        session.answers = {};
        setHash('eval-intento');
        render();
      }
    }
  }

  function goToCierre() {
    consumibles().forEach(function (pid) {
      session.completedPageIds[pid] = true;
    });
    session.completedPageIds['p-6'] = true;
    session.view = 'cierre';
    session.currentPageId = 'p-6';
    session.lastPageId = 'p-6';
    session.portadaMode = 'completado';
    confettiLaunched = false;
    setHash('cierre');
    render();
  }

  function nextPageId(fromId) {
    var order = flatPages().map(function (p) {
      return p.id;
    });
    var idx = order.indexOf(fromId);
    if (idx < 0 || idx >= order.length - 1) return null;
    return order[idx + 1];
  }

  function prevPageId(fromId) {
    var order = flatPages().map(function (p) {
      return p.id;
    });
    var idx = order.indexOf(fromId);
    if (idx <= 0) return null;
    return order[idx - 1];
  }

  function goToPage(pageId) {
    var page = getPage(pageId);
    if (!page) return;
    if (page.tipo === 'fin') {
      goToCierre();
      return;
    }
    session.view = 'recursos';
    session.currentPageId = pageId;
    session.lastPageId = pageId;
    if (page.tipo === 'evaluacion') {
      if (!session.evalFase || session.evalFase === 'resultado' && session.evalResultadoKind === 'aprobado') {
        /* keep */
      }
      if (!session.completedPageIds['p-5']) {
        session.evalFase = session.evalFase || 'bienvenida';
        if (session.evalFase === 'resultado' && session.evalResultadoKind === 'aprobado') {
          /* ok */
        } else if (!session.evalResultadoKind) {
          session.evalFase = 'bienvenida';
        }
      }
      setHash(
        session.evalFase === 'evaluacion'
          ? 'eval-intento'
          : session.evalFase === 'resultado'
            ? 'eval-resultado-' + (session.evalResultadoKind || 'reprobado')
            : 'eval-bienvenida'
      );
    } else {
      setHash('pagina-' + pageId);
    }
    render();
  }

  function handleContinuarRecurso() {
    var page = getPage(session.currentPageId);
    if (!page) return;
    if (page.tipo === 'evaluacion') {
      handleEvalPrimary();
      return;
    }
    session.completedPageIds[page.id] = true;
    var next = nextPageId(page.id);
    if (!next) {
      goToCierre();
      return;
    }
    var nextPage = getPage(next);
    if (nextPage && nextPage.tipo === 'fin') {
      goToCierre();
      return;
    }
    if (nextPage && nextPage.tipo === 'evaluacion') {
      session.evalFase = 'bienvenida';
      session.evalResultadoKind = null;
    }
    goToPage(next);
  }

  function handleRegresar() {
    if (session.view === 'cierre') {
      goToPage('p-5');
      session.evalFase = 'resultado';
      session.evalResultadoKind = 'aprobado';
      session.completedPageIds['p-5'] = true;
      setHash('eval-resultado-aprobado');
      render();
      return;
    }
    var cur = session.currentPageId;
    if (cur === 'p-1') {
      session.view = 'portada';
      session.portadaMode = portadaModeFromProgress();
      session.currentPageId = null;
      setHash(session.portadaMode === 'en-progreso' ? 'portada-en-progreso' : 'portada');
      render();
      return;
    }
    var prev = prevPageId(cur);
    if (prev) goToPage(prev);
  }

  function navModeForProgress() {
    var pct = progressPercent();
    if (session.view === 'cierre' || pct >= 100) return 'completado';
    if (pct <= 0) return 'no-progress';
    return 'en-progreso';
  }

  function renderRecursosAside(aside, content) {
    var pct = progressPercent();
    var mode = navModeForProgress();
    var primaryLabel = 'Continuar';
    var primaryDisabled = false;
    var page = getPage(session.currentPageId);

    if (session.view === 'cierre' || mode === 'completado') {
      primaryLabel = 'Ver más contenidos';
    } else if (page && page.tipo === 'evaluacion') {
      primaryLabel = evalPrimaryLabel();
      if (session.evalFase === 'evaluacion') primaryDisabled = true;
    }

    var html = '<div class="exp-estudio-aside-stack">';
    if (typeof global.tituloProgresoYNavExpEstudioHtml === 'function') {
      html += global.tituloProgresoYNavExpEstudioHtml({
        title: content.titulo || content.title || '',
        mode: mode,
        progressValue: mode === 'completado' ? 100 : pct,
        primaryLabel: primaryLabel,
        primaryDisabled: primaryDisabled
      });
    }
    html += '<div id="exp-estudio-indice-mount"></div></div>';
    aside.innerHTML = html;

    navApi = track(
      global.initTituloProgresoYNavExpEstudio(aside.querySelector('.ubits-titulo-progreso-nav-exp'), {
        onRegresar: handleRegresar,
        onPrimary: function () {
          if (session.view === 'cierre' || (mode === 'completado' && (!page || page.tipo !== 'evaluacion'))) {
            goHomeLearn();
            return;
          }
          handleContinuarRecurso();
        }
      })
    );
    if (page && page.tipo === 'evaluacion' && session.evalFase === 'evaluacion') {
      setTimeout(updateEvalContinuarEnabled, 50);
    }
    mountIndice(document.getElementById('exp-estudio-indice-mount'));
  }

  /* ─── Cierre ─── */
  function buildCarouselSlides() {
    var bd = global.BDS_CONTENIDOS_UBITS;
    if (!bd || !bd.contents) return [];
    var slides = [];
    var max = Math.min(6, bd.contents.length);
    for (var i = 0; i < max; i++) {
      var c = bd.contents[i];
      var providerName = 'UBITS';
      var providerLogo = '../../../images/Favicons/UBITS.jpg';
      if (global.CATALOGO_PROVEEDORES && typeof global.CATALOGO_PROVEEDORES.resolveProviderFromCatalogoItem === 'function') {
        var prov = global.CATALOGO_PROVEEDORES.resolveProviderFromCatalogoItem(c, '../../../');
        providerName = prov.nombre || providerName;
        providerLogo = prov.logo || providerLogo;
      }
      slides.push({
        image: resolveImage(c.imagen),
        contentType: c.tipoContenido || 'Curso',
        title: c.titulo || '',
        provider: { name: providerName, logo: providerLogo },
        competency: 'Aprendizaje',
        specs: {
          level: nivelLabel(c.nivelId),
          duration: durationLabel(c),
          language: (c.idioma || 'Español').trim()
        }
      });
    }
    return slides;
  }

  function renderCierre(main, aside, content) {
    if (typeof global.cierreExpEstudioHtml === 'function') {
      main.innerHTML = global.cierreExpEstudioHtml({
        contentTitle: content.titulo || content.title || '',
        showCertificate: !!content.conCertificacion,
        iconSrc: ICONS.success,
        certThumbSrc: './assets/cierre-cert-thumb.png'
      });
      track(
        global.initCierreExpEstudio(main.querySelector('.ubits-cierre-exp') || main, {
          onDownloadCertificate: downloadCertToast,
          carouselSlides: buildCarouselSlides()
        })
      );
    }
    if (!confettiLaunched && typeof global.launchUbitsConfetti === 'function') {
      confettiLaunched = true;
      global.launchUbitsConfetti();
    }
    renderRecursosAside(aside, content);
  }

  /* ─── Render root ─── */
  function render() {
    clearDestroyers();
    if (!session) return;

    var content = session.content;
    if (!content) {
      var empty = ensureStandardStage();
      if (empty && empty.main) {
        empty.main.innerHTML = '<p class="ubits-body-md-regular">Contenido no encontrado.</p>';
        if (empty.aside) empty.aside.innerHTML = '';
      }
      return;
    }

    if (session.view === 'portada') {
      session.portadaMode = session.portadaMode || portadaModeFromProgress();
      renderPortada(content);
      return;
    }

    var shell = ensureStandardStage();
    if (!shell || !shell.main || !shell.aside) return;
    if (session.view === 'cierre') {
      renderCierre(shell.main, shell.aside, content);
      return;
    }
    // Recursos
    var page = getPage(session.currentPageId) || getPage('p-1');
    session.currentPageId = page.id;
    renderRecursoMain(shell.main, page);
    renderRecursosAside(shell.aside, content);
  }

  function createSession() {
    var id = getQueryId();
    var content = findContentById(id);
    if (!content) {
      id = 'f007';
      content = findContentById(id);
    }
    session = {
      contentId: id,
      content: content,
      view: 'portada',
      portadaMode: 'por-iniciar',
      currentPageId: null,
      completedPageIds: {},
      lastPageId: null,
      evalFase: 'bienvenida',
      evalResultadoKind: null,
      evalIntentoActual: 1,
      evalScore: null,
      answers: {}
    };
    global.__expEstudioSession = session;
  }

  function onHashChange() {
    if (applyingHash) return;
    closeExpEstudioFullscreenLightbox();
    applyDeepLink(global.location.hash);
    render();
  }

  function initExpEstudioPage() {
    createSession();
    applyDeepLink(global.location.hash);
    bindExpEstudioFullscreenOnce();
    render();
    global.addEventListener('hashchange', onHashChange);
  }

  global.initExpEstudioPage = initExpEstudioPage;
  global.__expEstudioRender = render;
})(typeof window !== 'undefined' ? window : globalThis);
