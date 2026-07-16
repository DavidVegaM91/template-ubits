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

  /** Eval Sección 1 (deep link `#eval-*`) / Eval Sección 2 (`#eval2-*`) / Fin */
  var EVAL_PAGE_1 = 'p-3';
  var EVAL_PAGE_2 = 'p-6';
  var FIN_PAGE_ID = 'p-7';

  var HASH_PAGE = {
    portada: { view: 'portada', mode: 'por-iniciar' },
    'portada-sin-iniciar': { view: 'portada', mode: 'por-iniciar' },
    'portada-en-progreso': { view: 'portada', mode: 'en-progreso' },
    'portada-completado': { view: 'portada', mode: 'completado' },
    video: { view: 'recursos', pageId: 'p-1' },
    'pagina-p-1': { view: 'recursos', pageId: 'p-1' },
    'scorm-1': { view: 'recursos', pageId: 'p-2' },
    'pagina-p-2': { view: 'recursos', pageId: 'p-2' },
    evaluacion: { view: 'recursos', pageId: EVAL_PAGE_1, evalFase: 'bienvenida' },
    'pagina-p-3': { view: 'recursos', pageId: EVAL_PAGE_1, evalFase: 'bienvenida' },
    'eval-bienvenida': { view: 'recursos', pageId: EVAL_PAGE_1, evalFase: 'bienvenida' },
    'eval-intento': { view: 'recursos', pageId: EVAL_PAGE_1, evalFase: 'evaluacion' },
    'eval-retomar': { view: 'recursos', pageId: EVAL_PAGE_1, evalFase: 'retomar' },
    'eval-resultado-aprobado': {
      view: 'recursos',
      pageId: EVAL_PAGE_1,
      evalFase: 'resultado',
      evalResultadoKind: 'aprobado'
    },
    'eval-resultado-reprobado': {
      view: 'recursos',
      pageId: EVAL_PAGE_1,
      evalFase: 'resultado',
      evalResultadoKind: 'reprobado'
    },
    'eval-resultado-tiempo': {
      view: 'recursos',
      pageId: EVAL_PAGE_1,
      evalFase: 'resultado',
      evalResultadoKind: 'tiempo'
    },
    'eval-resultado-limite': {
      view: 'recursos',
      pageId: EVAL_PAGE_1,
      evalFase: 'resultado',
      evalResultadoKind: 'limite'
    },
    'scorm-2': { view: 'recursos', pageId: 'p-4' },
    'pagina-p-4': { view: 'recursos', pageId: 'p-4' },
    pdf: { view: 'recursos', pageId: 'p-5' },
    'pagina-p-5': { view: 'recursos', pageId: 'p-5' },
    'evaluacion-2': { view: 'recursos', pageId: EVAL_PAGE_2, evalFase: 'bienvenida' },
    'pagina-p-6': { view: 'recursos', pageId: EVAL_PAGE_2, evalFase: 'bienvenida' },
    'eval2-bienvenida': { view: 'recursos', pageId: EVAL_PAGE_2, evalFase: 'bienvenida' },
    'eval2-intento': { view: 'recursos', pageId: EVAL_PAGE_2, evalFase: 'evaluacion' },
    'eval2-retomar': { view: 'recursos', pageId: EVAL_PAGE_2, evalFase: 'retomar' },
    'eval2-resultado-aprobado': {
      view: 'recursos',
      pageId: EVAL_PAGE_2,
      evalFase: 'resultado',
      evalResultadoKind: 'aprobado'
    },
    'eval2-resultado-reprobado': {
      view: 'recursos',
      pageId: EVAL_PAGE_2,
      evalFase: 'resultado',
      evalResultadoKind: 'reprobado'
    },
    'eval2-resultado-tiempo': {
      view: 'recursos',
      pageId: EVAL_PAGE_2,
      evalFase: 'resultado',
      evalResultadoKind: 'tiempo'
    },
    'eval2-resultado-limite': {
      view: 'recursos',
      pageId: EVAL_PAGE_2,
      evalFase: 'resultado',
      evalResultadoKind: 'limite'
    },
    cierre: { view: 'cierre', pageId: FIN_PAGE_ID },
    'pagina-p-7': { view: 'cierre', pageId: FIN_PAGE_ID }
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
      'p-5',
      'p-6'
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

  function isEvalPageId(pageId) {
    var p = getPage(pageId);
    return !!(p && p.tipo === 'evaluacion');
  }

  function evalHashPrefix(pageId) {
    return pageId === EVAL_PAGE_2 ? 'eval2' : 'eval';
  }

  function evalHashFor(pageId, fase, resultadoKind) {
    var prefix = evalHashPrefix(pageId);
    if (fase === 'evaluacion') return prefix + '-intento';
    if (fase === 'retomar') return prefix + '-retomar';
    if (fase === 'resultado') return prefix + '-resultado-' + (resultadoKind || 'reprobado');
    return prefix + '-bienvenida';
  }

  function finPageId() {
    if (
      global.BD_EXP_ESTUDIO_DEMO &&
      typeof global.BD_EXP_ESTUDIO_DEMO.getFinPageId === 'function'
    ) {
      return global.BD_EXP_ESTUDIO_DEMO.getFinPageId();
    }
    return FIN_PAGE_ID;
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
    var fin = finPageId();
    var order = consumibles().concat([fin]);
    var idx = order.indexOf(pageId);
    session.completedPageIds = {};
    for (var i = 0; i < idx; i++) {
      if (order[i] !== fin) session.completedPageIds[order[i]] = true;
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
        session.completedPageIds[finPageId()] = true;
        session.lastPageId = finPageId();
      }
      return;
    }

    if (cfg.view === 'cierre') {
      consumibles().forEach(function (pid) {
        session.completedPageIds[pid] = true;
      });
      session.completedPageIds[finPageId()] = true;
      session.view = 'cierre';
      session.currentPageId = finPageId();
      session.lastPageId = finPageId();
      session.portadaMode = 'completado';
      return;
    }

    // Recursos / eval
    session.view = 'recursos';
    session.currentPageId = cfg.pageId;
    session.lastPageId = cfg.pageId;
    seedCompletedBefore(cfg.pageId);

    if (isEvalPageId(cfg.pageId)) {
      session.evalFase = cfg.evalFase || 'bienvenida';
      session.evalResultadoKind = cfg.evalResultadoKind || null;
      if (session.evalFase === 'evaluacion') {
        session.evalIntentoActual = session.evalIntentoActual || 1;
        session.answers = {};
      }
      if (session.evalFase === 'resultado') {
        var kind = session.evalResultadoKind;
        var evalPageSeed = getPage(cfg.pageId);
        var total = (evalPageSeed && evalPageSeed.preguntas && evalPageSeed.preguntas.length) || 5;
        var minPassSeed =
          (evalPageSeed && evalPageSeed.evalConfig && evalPageSeed.evalConfig.minPassScore) || 4;
        if (kind === 'aprobado') {
          session.evalScore = {
            aprobado: true,
            correctas: Math.max(minPassSeed, Math.min(total, minPassSeed + 1)),
            total: total,
            puntajeMin: minPassSeed
          };
          session.evalIntentoActual = 1;
        } else if (kind === 'reprobado') {
          session.evalScore = {
            aprobado: false,
            correctas: Math.max(0, minPassSeed - 1),
            total: total,
            puntajeMin: minPassSeed
          };
          session.evalIntentoActual = 1;
        } else if (kind === 'tiempo') {
          session.evalScore = {
            aprobado: false,
            correctas: Math.max(0, minPassSeed - 2),
            total: total,
            puntajeMin: minPassSeed
          };
          session.evalIntentoActual = 1;
        } else if (kind === 'limite') {
          session.evalScore = {
            aprobado: false,
            correctas: Math.max(0, minPassSeed - 2),
            total: total,
            puntajeMin: minPassSeed
          };
          session.evalIntentoActual = 2;
        }
      }
    }
  }

  function pageState(pageId) {
    var fin = finPageId();
    var isCompleted = !!session.completedPageIds[pageId];
    if (pageId === fin && (session.view === 'cierre' || session.completedPageIds[fin])) {
      isCompleted = true;
    }
    var isCurrent =
      (session.view === 'recursos' && session.currentPageId === pageId) ||
      (session.view === 'cierre' && pageId === fin) ||
      (session.view === 'portada' &&
        session.portadaMode === 'en-progreso' &&
        pageId === session.lastPageId);

    if (session.view === 'cierre' && pageId === fin) return 'activa';
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
    if (pageId === fin) return 'bloqueada';
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

  function categoriaFiqshaLabel(categoriaId) {
    var bd = global.BD_MASTER_CATEGORIAS_FIQSHA;
    if (!bd || !bd.categorias) return '';
    for (var i = 0; i < bd.categorias.length; i++) {
      if (String(bd.categorias[i].id) === String(categoriaId)) return bd.categorias[i].nombre;
    }
    return '';
  }

  function getCompetencia(compId) {
    var comps = (global.BD_MASTER_COMPETENCIAS && global.BD_MASTER_COMPETENCIAS.competencias) || [];
    for (var i = 0; i < comps.length; i++) {
      if (String(comps[i].id) === String(compId)) return comps[i];
    }
    return null;
  }

  function getHabilidad(habId) {
    var habs = (global.BD_MASTER_HABILIDADES && global.BD_MASTER_HABILIDADES.habilidades) || [];
    for (var i = 0; i < habs.length; i++) {
      if (String(habs[i].id) === String(habId)) return habs[i];
    }
    return null;
  }

  function competenciaImageSrc(archivoImagen) {
    return resolveImage('images/imagenes competencias/' + (archivoImagen || 'Liderazgo.jpg'));
  }

  var EXPERT_AVATAR_POOL = [
    'images/avatars/fin_f45_beatriz.jpg',
    'images/avatars/cons_m45_hugo.jpg',
    'images/avatars/crea_f27_lorena.jpg',
    'images/avatars/ener_m45_javier.jpg',
    'images/avatars/gob_f27_isabella.jpg',
    'images/avatars/cmas_m27_luis.jpg'
  ];

  /** Género del archivo: `_f` mujer, `_m` hombre (convención avatares playground). */
  function avatarGenderFromPath(path) {
    var m = String(path).match(/_(f|m)\d/i);
    return m ? m[1].toLowerCase() : null;
  }

  var EXPERT_AVATARS_BY_GENDER = {
    f: EXPERT_AVATAR_POOL.filter(function (p) {
      return avatarGenderFromPath(p) === 'f';
    }),
    m: EXPERT_AVATAR_POOL.filter(function (p) {
      return avatarGenderFromPath(p) === 'm';
    })
  };

  function expertoIsFemale(nombre) {
    var n = String(nombre || '').trim();
    if (/^Dra\.?\b/i.test(n) || /^Mtra\.?\b/i.test(n)) return true;
    if (/^Dr\.?\b/i.test(n) || /^Mg\.?\b/i.test(n)) return false;
    var first = n
      .replace(/^(Dra|Dr|Mtra|Mg|Lic|Ing)\.?\s+/i, '')
      .split(/\s+/)[0]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    var female = {
      ana: 1,
      elena: 1,
      paula: 1,
      laura: 1,
      maria: 1,
      beatriz: 1,
      lorena: 1,
      isabella: 1,
      sofia: 1,
      camila: 1,
      carolina: 1
    };
    var male = {
      carlos: 1,
      jorge: 1,
      pedro: 1,
      hugo: 1,
      javier: 1,
      luis: 1,
      andres: 1,
      diego: 1,
      miguel: 1,
      jose: 1,
      juan: 1
    };
    if (female[first]) return true;
    if (male[first]) return false;
    return false;
  }

  function pickExpertoAvatar(nombre, index) {
    var pool = expertoIsFemale(nombre) ? EXPERT_AVATARS_BY_GENDER.f : EXPERT_AVATARS_BY_GENDER.m;
    if (!pool.length) return EXPERT_AVATAR_POOL[index % EXPERT_AVATAR_POOL.length];
    return pool[index % pool.length];
  }

  var LINKEDIN_PLAYGROUND_URL = 'https://www.linkedin.com/in/david-vega-ux/';

  var ALIADO_BIO_PREVIEW =
    'Aquí va la descripción de este aliado proporcionada por el equipo de Customer Success. ' +
    'Este es un texto de previsualización solo para el prototipo del playground: resume la propuesta de valor del aliado, ' +
    'su trayectoria y cómo aporta contenidos prácticos al catálogo UBITS.';

  var EXPERTO_BIO_PREVIEW =
    'Aquí va la biografía de previsualización del experto para el playground. Este texto es ficticio y solo sirve para ' +
    'validar el layout de la portada: experiencia docente, trayectoria profesional y el enfoque con el que guía este contenido.';

  function homeLearnSearchUrl(term) {
    return '../home-learn.html?q=' + encodeURIComponent(String(term || '').trim());
  }

  function uCorporativaCategoriaUrl(categoriaId) {
    return '../u-corporativa.html?categoria=' + encodeURIComponent(String(categoriaId || '').trim());
  }

  function parseExpertoEntry(raw, index) {
    var text = String(raw || '').trim();
    var parts = text.split(/\s*[·|]\s*/);
    var nombre = (parts[0] || 'Experto').trim();
    var rol = (parts.slice(1).join(' · ') || 'Especialista UBITS').trim();
    return {
      nombre: nombre,
      rol: rol,
      avatar: pickExpertoAvatar(nombre, index),
      bio: EXPERTO_BIO_PREVIEW
    };
  }

  function collectHabilidades(content) {
    var ids = [];
    if (content.habilidadPrincipalId) ids.push(content.habilidadPrincipalId);
    var secs = content.habilidadesSecundariasIds || [];
    for (var i = 0; i < secs.length; i++) {
      if (secs[i] && ids.indexOf(secs[i]) === -1) ids.push(secs[i]);
    }
    var out = [];
    for (var j = 0; j < ids.length; j++) {
      var h = getHabilidad(ids[j]);
      if (h) out.push(h);
    }
    return out;
  }

  function chipHtml(label, href) {
    var text =
      '<span class="ubits-chip__text">' + esc(label) + '</span>';
    if (href) {
      return (
        '<a class="ubits-chip ubits-chip--sm exp-estudio-meta-chip-link" href="' +
        esc(href) +
        '" target="_blank" rel="noopener noreferrer">' +
        text +
        '</a>'
      );
    }
    return '<span class="ubits-chip ubits-chip--sm">' + text + '</span>';
  }

  function renderPortadaMetaHtml(content, isFiqsha) {
    var parts = [];
    if (isFiqsha) {
      var catId = content.categoriaFiqshaId || '';
      var catName = categoriaFiqshaLabel(catId) || 'Sin categoría';
      parts.push(
        '<div class="exp-estudio-ficha">' +
          '<p class="exp-estudio-ficha__label ubits-body-sm-semibold">Categoría</p>' +
          '<div class="exp-estudio-ficha__row">' +
          chipHtml(catName, catId ? uCorporativaCategoriaUrl(catId) : '') +
          '</div></div>'
      );
    } else {
      var comp = getCompetencia(content.competenciaPrincipalId);
      var habs = collectHabilidades(content);
      var fichaInner = '';
      if (comp) {
        var compImg = competenciaImageSrc(comp.archivoImagen);
        var compHref = homeLearnSearchUrl(comp.nombre);
        var avatarHtml =
          '<span class="ubits-avatar ubits-avatar--sm">' +
          '<img class="ubits-avatar__img" src="' +
          esc(compImg) +
          '" alt="' +
          esc(comp.nombre || '') +
          '" /></span>';
        fichaInner +=
          '<div class="exp-estudio-ficha__block">' +
          '<p class="exp-estudio-ficha__label ubits-body-sm-semibold">Competencia</p>' +
          '<a class="exp-estudio-competencia-chip" href="' +
          esc(compHref) +
          '" target="_blank" rel="noopener noreferrer">' +
          avatarHtml +
          '<span class="exp-estudio-competencia-chip__name ubits-body-sm-regular">' +
          esc(comp.nombre) +
          '</span></a></div>';
      }
      if (habs.length) {
        fichaInner +=
          '<div class="exp-estudio-ficha__block">' +
          '<p class="exp-estudio-ficha__label ubits-body-sm-semibold">Habilidades de este contenido</p>' +
          '<div class="exp-estudio-ficha__row">' +
          habs
            .map(function (h) {
              return chipHtml(h.nombre, homeLearnSearchUrl(h.nombre));
            })
            .join('') +
          '</div></div>';
      }
      if (fichaInner) {
        parts.push('<div class="exp-estudio-ficha">' + fichaInner + '</div>');
      }
    }

    parts.push(
      '<div class="exp-estudio-ficha">' +
        '<p class="exp-estudio-ficha__title ubits-body-md-semibold">Descripción</p>' +
        '<p class="exp-estudio-desc ubits-body-md-regular">' +
        esc(content.descripcion || '') +
        '</p></div>'
    );

    if (!isFiqsha) {
      var imagesPrefix = '../../../';
      var aliadoId =
        typeof global.resolvePrimaryAliadoId === 'function'
          ? global.resolvePrimaryAliadoId(content)
          : content.aliadoId;
      var aliado =
        typeof global.resolveAliadoDisplay === 'function'
          ? global.resolveAliadoDisplay(aliadoId, imagesPrefix)
          : null;
      if (aliado && aliado.nombre) {
        parts.push(
          '<div class="exp-estudio-ficha">' +
            '<p class="exp-estudio-ficha__title ubits-body-md-semibold">Aliado</p>' +
            '<div class="exp-estudio-media-row">' +
            '<div class="exp-estudio-media-avatar">' +
            '<img class="exp-estudio-media-avatar__img" src="' +
            esc(aliado.logo) +
            '" alt="" />' +
            '</div>' +
            '<div class="exp-estudio-media-body">' +
            '<a class="exp-estudio-media-name ubits-body-md-semibold" href="' +
            esc(homeLearnSearchUrl(aliado.nombre)) +
            '" target="_blank" rel="noopener noreferrer">' +
            esc(aliado.nombre) +
            '</a>' +
            '<p class="exp-estudio-media-bio ubits-body-md-regular">' +
            esc(ALIADO_BIO_PREVIEW) +
            '</p></div></div></div>'
        );
      }

      var expertosRaw = content.expertos || [];
      if (expertosRaw.length) {
        var expertosHtml = expertosRaw
          .map(function (raw, idx) {
            var ex = parseExpertoEntry(raw, idx);
            return (
              '<div class="exp-estudio-media-row">' +
              '<div class="exp-estudio-media-avatar">' +
              '<img class="exp-estudio-media-avatar__img" src="' +
              esc(resolveImage(ex.avatar)) +
              '" alt="" />' +
              '<a class="exp-estudio-media-avatar__linkedin" href="' +
              esc(LINKEDIN_PLAYGROUND_URL) +
              '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de ' +
              esc(ex.nombre) +
              '">' +
              '<i class="fab fa-linkedin-in" aria-hidden="true"></i></a>' +
              '</div>' +
              '<div class="exp-estudio-media-body">' +
              '<a class="exp-estudio-media-name ubits-body-md-semibold" href="' +
              esc(homeLearnSearchUrl(ex.nombre)) +
              '" target="_blank" rel="noopener noreferrer">' +
              esc(ex.nombre) +
              '</a>' +
              '<p class="exp-estudio-media-role ubits-body-sm-regular">' +
              esc(ex.rol) +
              '</p>' +
              '<p class="exp-estudio-media-bio ubits-body-md-regular">' +
              esc(ex.bio) +
              '</p></div></div>'
            );
          })
          .join('');
        parts.push(
          '<div class="exp-estudio-ficha">' +
            '<p class="exp-estudio-ficha__title ubits-body-md-semibold">Expertos</p>' +
            '<div class="exp-estudio-expertos-list">' +
            expertosHtml +
            '</div></div>'
        );
      }
    }

    return parts.join('');
  }

  /* ─── Portada ─── */
  function renderPortada(content) {
    var stage = document.getElementById('exp-estudio-stage');
    if (!stage) return;
    var img = resolveImage(content.imagen || content.imagePath);
    var isFiqsha =
      content.catalogoId === 'catalogo_fiqsha' || String(content.origen || '').indexOf('fiqsha') !== -1;
    /* Tres hijos directos (como React): hero | aside | meta — grid areas controlan orden */
    stage.className = 'exp-estudio-stage exp-estudio-stage--portada';
    stage.innerHTML =
      '<div class="exp-estudio-hero"><img src="' +
      esc(img) +
      '" alt="" /></div>' +
      '<aside id="exp-estudio-aside" class="exp-estudio-col exp-estudio-col--aside"></aside>' +
      '<div class="exp-estudio-portada-meta">' +
      renderPortadaMetaHtml(content, isFiqsha) +
      '</div>';
    renderPortadaAside(document.getElementById('exp-estudio-aside'), content, isFiqsha);
  }

  function renderPortadaAside(aside, content, isFiqsha) {
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
        subtitles: isFiqsha ? false : 'Subtítulos: Español, Inglés, Portugués',
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
    var page = getPage(session.currentPageId);
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
    return { correctas: correct, total: preguntas.length || 5 };
  }

  function stopEvalTimer() {
    if (stickyApi && typeof stickyApi.stop === 'function') stickyApi.stop();
    if (stickyApi && typeof stickyApi.destroy === 'function') stickyApi.destroy();
    stickyApi = null;
  }

  /** Guarda tiempo restante (+ respuestas) si sale a mitad de un intento abierto. */
  function pauseOpenEvalAttemptIfNeeded(leavingPageId) {
    var page = getPage(leavingPageId);
    if (!page || page.tipo !== 'evaluacion') return;
    if (session.evalFase !== 'evaluacion') return;
    var remaining = null;
    if (stickyApi && typeof stickyApi.getRemainingSeconds === 'function') {
      remaining = stickyApi.getRemainingSeconds();
    }
    var answers = [];
    questionApis.forEach(function (api) {
      answers.push(api && typeof api.getCollabAnswer === 'function' ? api.getCollabAnswer() : null);
    });
    session.evalAttemptPaused = true;
    session.evalPausedPageId = leavingPageId;
    session.evalRemainingSeconds = remaining;
    session.evalPausedAnswers = answers;
    stopEvalTimer();
    session.evalFase = 'retomar';
  }

  function clearEvalPauseState() {
    session.evalAttemptPaused = false;
    session.evalPausedPageId = null;
    session.evalRemainingSeconds = null;
    session.evalPausedAnswers = null;
  }

  function finishEvalWithKind(kind, score) {
    stopEvalTimer();
    clearEvalPauseState();
    session.evalFase = 'resultado';
    session.evalResultadoKind = kind;
    session.evalScore = score || session.evalScore;
    if (kind === 'aprobado') {
      session.completedPageIds[session.currentPageId] = true;
    }
    setHash(evalHashFor(session.currentPageId, 'resultado', kind));
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
      ' intentos disponibles.</li>';

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

  /** APP Evaluation-resuming evaluation (3341:13137) — demo #eval-retomar */
  function renderEvalRetomar(main) {
    main.innerHTML =
      '<div class="exp-estudio-eval exp-estudio-eval--retomar">' +
      '<img class="exp-estudio-eval__icon" src="' +
      ICONS.info +
      '" alt="" />' +
      '<h2 class="exp-estudio-eval__heading ubits-heading-h2">Evaluación de conocimientos</h2>' +
      '<p class="exp-estudio-eval__lead ubits-body-md-regular">Dejaste en pausa la evaluación, te invitamos a retomarla desde nuestro sitio web.</p>' +
      '</div>';
  }

  function renderEvalPreguntas(main, page) {
    main.innerHTML =
      '<div class="exp-estudio-eval">' +
      '<div id="exp-estudio-eval-sticky"></div>' +
      '<div class="exp-estudio-eval__questions" id="exp-estudio-eval-questions"></div></div>';

    var cfg = page.evalConfig || {};
    var fullSeconds =
      cfg.timeLimitEnabled !== false ? Math.max(1, (cfg.timeLimitMinutes || 10) * 60) : 99999;
    var seconds =
      session.evalRemainingSeconds != null && session.evalRemainingSeconds >= 0
        ? Math.max(0, Math.floor(session.evalRemainingSeconds))
        : fullSeconds;
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
          var minPass = (cfg && cfg.minPassScore) || 4;
          if (attempts >= maxA) {
            finishEvalWithKind('limite', {
              aprobado: false,
              correctas: scored.correctas,
              total: scored.total,
              puntajeMin: minPass
            });
          } else {
            finishEvalWithKind('tiempo', {
              aprobado: false,
              correctas: scored.correctas,
              total: scored.total,
              puntajeMin: minPass
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

    /* Restaurar respuestas del intento pausado (si las hay) */
    var paused = session.evalPausedAnswers;
    if (paused && paused.length) {
      setTimeout(function () {
        questionApis.forEach(function (api, i) {
          restoreCollabAnswer(api, paused[i], i + 1);
        });
        updateEvalContinuarEnabled();
      }, 0);
    }
  }

  function restoreCollabAnswer(api, answer, qId) {
    if (!api || answer == null) return;
    var root = api.el;
    if (!root) return;
    var model = typeof api.getModel === 'function' ? api.getModel() : null;
    var t = (model && model.type) || '';

    if (t === 'multiple_choice_single' || t === 'true_false') {
      var radio = root.querySelector(
        'input[name="collab-q-' + qId + '"][value="' + String(answer) + '"]'
      );
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    if (t === 'multiple_choice_multiple' && Array.isArray(answer)) {
      answer.forEach(function (val) {
        var cb = root.querySelector(
          'input[name="collab-q-' + qId + '"][value="' + String(val) + '"]'
        );
        if (cb) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  }

  function renderEvalResultado(main) {
    var kind = session.evalResultadoKind || 'reprobado';
    var score = session.evalScore || { correctas: 0, total: 5, puntajeMin: 4 };
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
      else if (session.evalFase === 'retomar') renderEvalRetomar(main);
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
    if (session.evalFase === 'retomar') return 'Responder la evaluación';
    if (session.evalFase === 'resultado') {
      if (session.evalResultadoKind === 'aprobado') return 'Continuar';
      if (session.evalResultadoKind === 'limite') return 'Ir al inicio';
      return 'Reintentar';
    }
    return 'Continuar';
  }

  function handleEvalPrimary() {
    var page = getPage(session.currentPageId);
    var cfg = (page && page.evalConfig) || {};
    var maxA = cfg.maxAttempts || 2;
    var evalId = session.currentPageId;

    if (session.evalFase === 'retomar') {
      session.evalFase = 'evaluacion';
      setHash(evalHashFor(evalId, 'evaluacion'));
      render();
      return;
    }
    if (session.evalFase === 'bienvenida') {
      clearEvalPauseState();
      session.evalFase = 'evaluacion';
      session.answers = {};
      setHash(evalHashFor(evalId, 'evaluacion'));
      render();
      return;
    }
    if (session.evalFase === 'evaluacion') {
      if (!allQuestionsAnswered()) return;
      var scored = gradeEval();
      var minPass = (page && page.evalConfig && page.evalConfig.minPassScore) || 4;
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
        session.completedPageIds[evalId] = true;
        var next = nextPageId(evalId);
        var nextPage = next ? getPage(next) : null;
        if (!next || (nextPage && nextPage.tipo === 'fin')) {
          goToCierre();
        } else {
          session.evalFase = null;
          session.evalResultadoKind = null;
          session.answers = {};
          session.evalIntentoActual = 1;
          if (nextPage && nextPage.tipo === 'evaluacion') {
            session.evalFase = 'bienvenida';
          }
          goToPage(next);
        }
      } else if (kind === 'limite') {
        goHomeLearn();
      } else {
        clearEvalPauseState();
        session.evalIntentoActual = (session.evalIntentoActual || 1) + 1;
        session.evalFase = 'evaluacion';
        session.evalResultadoKind = null;
        session.answers = {};
        setHash(evalHashFor(evalId, 'evaluacion'));
        render();
      }
    }
  }

  function goToCierre() {
    var fin = finPageId();
    consumibles().forEach(function (pid) {
      session.completedPageIds[pid] = true;
    });
    session.completedPageIds[fin] = true;
    session.view = 'cierre';
    session.currentPageId = fin;
    session.lastPageId = fin;
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
    var leavingId = session.currentPageId;
    if (leavingId && leavingId !== pageId) {
      pauseOpenEvalAttemptIfNeeded(leavingId);
    }
    var switchingEval =
      page.tipo === 'evaluacion' &&
      leavingId &&
      leavingId !== pageId &&
      isEvalPageId(leavingId);
    session.view = 'recursos';
    session.currentPageId = pageId;
    session.lastPageId = pageId;
    if (page.tipo === 'evaluacion') {
      if (session.evalAttemptPaused && session.evalPausedPageId === pageId) {
        session.evalFase = 'retomar';
        session.evalResultadoKind = null;
      } else if (switchingEval || !session.evalFase) {
        if (session.completedPageIds[pageId]) {
          session.evalFase = 'resultado';
          session.evalResultadoKind = 'aprobado';
        } else {
          session.evalFase = 'bienvenida';
          session.evalResultadoKind = null;
          session.evalIntentoActual = 1;
          session.answers = {};
          if (session.evalPausedPageId !== pageId) clearEvalPauseState();
        }
      } else if (
        session.evalFase === 'resultado' &&
        session.evalResultadoKind === 'aprobado' &&
        !session.completedPageIds[pageId]
      ) {
        /* mantener resultado aprobado hasta marcar completada */
      } else if (
        !session.completedPageIds[pageId] &&
        session.evalFase !== 'retomar' &&
        session.evalFase !== 'evaluacion' &&
        !(session.evalFase === 'resultado' && session.evalResultadoKind)
      ) {
        session.evalFase = 'bienvenida';
      }
      setHash(evalHashFor(pageId, session.evalFase, session.evalResultadoKind));
    } else {
      /* No pisar evalFase si quedó en retomar por pausa (ya guardado en pauseOpen…) */
      if (!(session.evalAttemptPaused && session.evalFase === 'retomar')) {
        session.evalFase = null;
        session.evalResultadoKind = null;
      }
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
      if (session.evalAttemptPaused && session.evalPausedPageId === next) {
        session.evalFase = 'retomar';
      } else {
        session.evalFase = 'bienvenida';
        session.evalResultadoKind = null;
      }
    }
    goToPage(next);
  }

  function handleRegresar() {
    if (session.view === 'cierre') {
      goToPage(EVAL_PAGE_2);
      session.evalFase = 'resultado';
      session.evalResultadoKind = 'aprobado';
      session.completedPageIds[EVAL_PAGE_2] = true;
      setHash(evalHashFor(EVAL_PAGE_2, 'resultado', 'aprobado'));
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

    if (session.view === 'cierre') {
      primaryLabel = 'Ver más contenidos';
    } else if (page && page.tipo === 'evaluacion') {
      /* En evaluación (aunque el % ya esté en 100 tras aprobar) el CTA sigue siendo el de la fase */
      primaryLabel = evalPrimaryLabel();
      if (session.evalFase === 'evaluacion') primaryDisabled = true;
    } else if (mode === 'completado') {
      primaryLabel = 'Ver más contenidos';
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
          /* Leer página al clic (no del closure): en eval aprobatoria Continuar avanza,
             no debe ir a home-learn#buscar solo porque el % ya llegó a 100. */
          var livePage = getPage(session.currentPageId);
          var liveMode = navModeForProgress();
          if (session.view === 'cierre') {
            goHomeLearn();
            return;
          }
          if (
            liveMode === 'completado' &&
            !(livePage && livePage.tipo === 'evaluacion')
          ) {
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
    var routes = bd.contents.filter(function (c) {
      return c.tipoContenido === 'Ruta de aprendizaje';
    });
    /* En progreso: el colaborador ya completó un contenido de la ruta (este curso). */
    var progressValues = [40, 55, 30, 65, 20, 45];
    var slides = [];
    var max = Math.min(6, routes.length);
    var cp = global.CATALOGO_PROVEEDORES;
    for (var i = 0; i < max; i++) {
      var c = routes[i];
      var slide = {
        id: c.id,
        image: resolveImage(c.imagen),
        contentType: 'Ruta de aprendizaje',
        title: c.titulo || '',
        competency: 'Aprendizaje',
        specs: {
          level: nivelLabel(c.nivelId),
          duration: durationLabel(c),
          language: (c.idioma || 'Español').trim()
        },
        status: 'progress',
        progress: progressValues[i] || 40
      };
      if (
        cp &&
        typeof cp.resolveProveedoresCatalogoUbits === 'function' &&
        typeof cp.buildProvidersMultiForCard === 'function'
      ) {
        var provs = cp.resolveProveedoresCatalogoUbits(c, '../../../');
        var multi = cp.buildProvidersMultiForCard(c, provs);
        if (multi && multi.length > 1) {
          slide.providers = multi.map(function (p) {
            return { name: p.name || p.provider, logo: p.logo || p.providerLogo };
          });
        } else if (typeof cp.resolveProviderFromCatalogoItem === 'function') {
          var prov = cp.resolveProviderFromCatalogoItem(c, '../../../');
          slide.provider = {
            name: prov.nombre || 'UBITS',
            logo: prov.logo || '../../../images/Favicons/UBITS.jpg'
          };
        } else {
          slide.provider = {
            name: 'UBITS',
            logo: '../../../images/Favicons/UBITS.jpg'
          };
        }
      } else {
        slide.provider = {
          name: 'UBITS',
          logo: '../../../images/Favicons/UBITS.jpg'
        };
      }
      slides.push(slide);
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
      answers: {},
      evalAttemptPaused: false,
      evalPausedPageId: null,
      evalRemainingSeconds: null,
      evalPausedAnswers: null
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
