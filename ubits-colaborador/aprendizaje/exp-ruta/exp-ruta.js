/**
 * Experiencia de ruta (learner) — portada con lista de contenidos compact.
 * ?id=u007 (default) · ?nav=lineal|libre · #portada-sin-iniciar | #portada-en-progreso | #portada-completado
 */
(function (global) {
  'use strict';

  var DEFAULT_RUTA_ID = 'u007';
  var LIST_TITLE = 'Contenidos que conforman esta ruta';

  var session = {
    rutaId: DEFAULT_RUTA_ID,
    nav: 'lineal',
    portadaMode: 'por-iniciar', // por-iniciar | en-progreso | completado
    finishedIds: {},
    started: false
  };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getQueryParam(name) {
    try {
      return String(new URLSearchParams(global.location.search).get(name) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function getQueryId() {
    return getQueryParam('id') || DEFAULT_RUTA_ID;
  }

  function getQueryNav() {
    var v = getQueryParam('nav').toLowerCase();
    if (v === 'libre' || v === 'lineal') return v;
    return null;
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
    if (s.indexOf('images/') === 0) return '../../../' + s;
    if (s.indexOf('cards-learn/') === 0) return '../../../images/' + s;
    return '../../../' + s.replace(/^\.\//, '');
  }

  function resolveNavType(ruta) {
    var q = getQueryNav();
    if (q) return q;
    var fromBd = String((ruta && ruta.tipoNavegacion) || 'lineal').toLowerCase();
    return fromBd === 'libre' ? 'libre' : 'lineal';
  }

  function childIds(ruta) {
    var ids = (ruta && ruta.contenidosIds) || [];
    return ids.map(function (id) {
      return String(id);
    });
  }

  function progressPercent() {
    var ids = childIds(session.ruta);
    if (!ids.length) return 0;
    var done = 0;
    ids.forEach(function (id) {
      if (session.finishedIds[id]) done += 1;
    });
    return Math.round((done / ids.length) * 100);
  }

  function finishedCount() {
    var n = 0;
    childIds(session.ruta).forEach(function (id) {
      if (session.finishedIds[id]) n += 1;
    });
    return n;
  }

  function hashForMode(mode) {
    if (mode === 'en-progreso') return '#portada-en-progreso';
    if (mode === 'completado') return '#portada-completado';
    return '#portada-sin-iniciar';
  }

  function setHash(mode) {
    var target = hashForMode(mode);
    if (location.hash !== target && typeof history.replaceState === 'function') {
      history.replaceState(null, '', location.pathname + location.search + target);
    }
  }

  function applyHashDemo(hash) {
    var h = String(hash || '').replace(/^#/, '');
    var ids = childIds(session.ruta);
    session.finishedIds = {};
    session.started = false;
    session.portadaMode = 'por-iniciar';

    if (h === 'portada-en-progreso' || h === 'en-progreso') {
      session.portadaMode = 'en-progreso';
      session.started = true;
      /* Demo: primeros 2 de 5 finalizados (40%). */
      for (var i = 0; i < Math.min(2, ids.length); i++) {
        session.finishedIds[ids[i]] = true;
      }
      return;
    }
    if (h === 'portada-completado' || h === 'completado') {
      session.portadaMode = 'completado';
      session.started = true;
      ids.forEach(function (id) {
        session.finishedIds[id] = true;
      });
      return;
    }
    /* sin iniciar (default) */
  }

  function isUnlocked(index, id) {
    if (!session.started || session.portadaMode === 'por-iniciar') return false;
    if (session.portadaMode === 'completado') return true;
    if (session.nav === 'libre') return true;
    /* lineal: unlock finished + next after last finished */
    if (session.finishedIds[id]) return true;
    var ids = childIds(session.ruta);
    var firstLocked = 0;
    for (var i = 0; i < ids.length; i++) {
      if (!session.finishedIds[ids[i]]) {
        firstLocked = i;
        break;
      }
      firstLocked = i + 1;
    }
    return index === firstLocked;
  }

  function nextContentId() {
    var ids = childIds(session.ruta);
    if (!ids.length) return null;
    var lastFinishedIdx = -1;
    for (var i = 0; i < ids.length; i++) {
      if (session.finishedIds[ids[i]]) lastFinishedIdx = i;
    }
    if (lastFinishedIdx < 0) return ids[0];
    if (lastFinishedIdx + 1 < ids.length) return ids[lastFinishedIdx + 1];
    return ids[0];
  }

  function goToChild(id) {
    if (!id) return;
    global.location.href =
      '../exp-estudio/exp-estudio.html?id=' + encodeURIComponent(String(id));
  }

  function goHomeLearn() {
    global.location.href = '../home-learn.html#buscar';
  }

  function resolveProvider(content) {
    var prefix = '../../../';
    if (global.CATALOGO_PROVEEDORES && typeof global.CATALOGO_PROVEEDORES.resolveProviderFromCatalogoItem === 'function') {
      var p = global.CATALOGO_PROVEEDORES.resolveProviderFromCatalogoItem(content, prefix);
      return { name: p.nombre || p.name || 'UBITS', logo: p.logo || prefix + 'images/Favicons/UBITS.jpg' };
    }
    return { name: 'UBITS', logo: prefix + 'images/Favicons/UBITS.jpg' };
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

  function competenciaLabel(content) {
    var comp = getCompetencia(content && content.competenciaPrincipalId);
    return (comp && comp.nombre) || 'Liderazgo';
  }

  function competenciaImageSrc(archivoImagen) {
    return resolveImage('images/imagenes competencias/' + (archivoImagen || 'Liderazgo.jpg'));
  }

  function categoriaFiqshaLabel(categoriaId) {
    var bd = global.BD_MASTER_CATEGORIAS_FIQSHA;
    if (!bd || !bd.categorias) return '';
    for (var i = 0; i < bd.categorias.length; i++) {
      if (String(bd.categorias[i].id) === String(categoriaId)) return bd.categorias[i].nombre;
    }
    return '';
  }

  function isFiqshaContent(content) {
    if (!content) return false;
    return (
      content.catalogoId === 'catalogo_fiqsha' ||
      String(content.origen || '').indexOf('fiqsha') !== -1 ||
      String(content.id || '').indexOf('f') === 0
    );
  }

  var EXPERT_AVATAR_POOL = [
    'images/avatars/fin_f45_beatriz.jpg',
    'images/avatars/cons_m45_hugo.jpg',
    'images/avatars/crea_f27_lorena.jpg',
    'images/avatars/ener_m45_javier.jpg',
    'images/avatars/gob_f27_isabella.jpg',
    'images/avatars/cmas_m27_luis.jpg'
  ];

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

  /** Unión ruta + hijos (contenidosIds → findContentById). */
  function metaSources(ruta) {
    var list = [];
    if (ruta) list.push(ruta);
    childIds(ruta).forEach(function (id) {
      var child = findContentById(id);
      if (child) list.push(child);
    });
    return list;
  }

  function collectCompetencias(ruta) {
    var seen = {};
    var out = [];
    metaSources(ruta).forEach(function (src) {
      var id = src.competenciaPrincipalId;
      if (!id || seen[id]) return;
      var comp = getCompetencia(id);
      if (!comp) return;
      seen[id] = true;
      out.push(comp);
    });
    return out;
  }

  function collectHabilidades(ruta) {
    var seen = {};
    var out = [];
    metaSources(ruta).forEach(function (src) {
      var ids = [];
      if (src.habilidadPrincipalId) ids.push(src.habilidadPrincipalId);
      var secs = src.habilidadesSecundariasIds || [];
      for (var i = 0; i < secs.length; i++) {
        if (secs[i]) ids.push(secs[i]);
      }
      for (var j = 0; j < ids.length; j++) {
        var hid = ids[j];
        if (seen[hid]) continue;
        var h = getHabilidad(hid);
        if (!h) continue;
        seen[hid] = true;
        out.push(h);
      }
    });
    return out;
  }

  function collectAliados(ruta) {
    var imagesPrefix = '../../../';
    var cp = global.CATALOGO_PROVEEDORES || {};
    var seen = {};
    var out = [];
    metaSources(ruta).forEach(function (src) {
      var primary =
        typeof cp.resolvePrimaryAliadoId === 'function' ? cp.resolvePrimaryAliadoId(src) : src.aliadoId;
      var ids =
        src.providersAliadosIds && src.providersAliadosIds.length
          ? src.providersAliadosIds
          : primary
            ? [primary]
            : [];
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (!id || seen[id]) continue;
        seen[id] = true;
        var aliado =
          typeof cp.resolveAliadoDisplay === 'function'
            ? cp.resolveAliadoDisplay(id, imagesPrefix)
            : null;
        if (aliado && aliado.nombre) out.push(aliado);
      }
    });
    return out;
  }

  function collectExpertos(ruta) {
    var seen = {};
    var out = [];
    var idx = 0;
    metaSources(ruta).forEach(function (src) {
      var raws = src.expertos || [];
      for (var i = 0; i < raws.length; i++) {
        var key = String(raws[i] || '')
          .trim()
          .toLowerCase();
        if (!key || seen[key]) continue;
        seen[key] = true;
        out.push(parseExpertoEntry(raws[i], idx));
        idx += 1;
      }
    });
    return out;
  }

  function chipHtml(label, href) {
    var text = '<span class="ubits-chip__text">' + esc(label) + '</span>';
    if (href) {
      return (
        '<a class="ubits-chip ubits-chip--sm exp-ruta-meta-chip-link" href="' +
        esc(href) +
        '" target="_blank" rel="noopener noreferrer">' +
        text +
        '</a>'
      );
    }
    return '<span class="ubits-chip ubits-chip--sm">' + text + '</span>';
  }

  function toCompactCard(content, opts) {
    opts = opts || {};
    var prov = resolveProvider(content);
    var status = 'default';
    var progress = 0;
    if (opts.finished) {
      status = 'completed';
      progress = 100;
    }
    return {
      type: content.tipoContenido || 'Curso',
      title: content.titulo || content.title || '',
      provider: prov.name,
      providerLogo: prov.logo,
      duration: durationLabel(content),
      level: nivelLabel(content.nivelId),
      progress: progress,
      status: status,
      image: resolveImage(content.imagen || content.imagePath),
      language: content.idioma || 'Español',
      contentId: String(content.id),
      competency: competenciaLabel(content)
    };
  }

  function renderPortadaMeta(ruta) {
    var parts = [];
    var fiqsha = isFiqshaContent(ruta);

    if (fiqsha) {
      var catId = ruta.categoriaFiqshaId || '';
      var catName = categoriaFiqshaLabel(catId) || 'Sin categoría';
      parts.push(
        '<div class="exp-ruta-ficha">' +
          '<p class="exp-ruta-ficha__label ubits-body-sm-semibold">Categoría</p>' +
          '<div class="exp-ruta-ficha__row">' +
          chipHtml(catName, catId ? uCorporativaCategoriaUrl(catId) : '') +
          '</div></div>'
      );
    } else {
      var comps = collectCompetencias(ruta);
      var habs = collectHabilidades(ruta);
      var fichaInner = '';
      if (comps.length) {
        var compLabel = comps.length === 1 ? 'Competencia' : 'Competencias';
        fichaInner +=
          '<div class="exp-ruta-ficha__block">' +
          '<p class="exp-ruta-ficha__label ubits-body-sm-semibold">' +
          compLabel +
          '</p>' +
          '<div class="exp-ruta-competencias-list">' +
          comps
            .map(function (comp) {
              var compImg = competenciaImageSrc(comp.archivoImagen);
              var compHref = homeLearnSearchUrl(comp.nombre);
              return (
                '<a class="exp-ruta-competencia-chip" href="' +
                esc(compHref) +
                '" target="_blank" rel="noopener noreferrer">' +
                '<span class="ubits-avatar ubits-avatar--sm">' +
                '<img class="ubits-avatar__img" src="' +
                esc(compImg) +
                '" alt="' +
                esc(comp.nombre || '') +
                '" /></span>' +
                '<span class="exp-ruta-competencia-chip__name ubits-body-sm-regular">' +
                esc(comp.nombre) +
                '</span></a>'
              );
            })
            .join('') +
          '</div></div>';
      }
      if (habs.length) {
        fichaInner +=
          '<div class="exp-ruta-ficha__block">' +
          '<p class="exp-ruta-ficha__label ubits-body-sm-semibold">Habilidades de esta ruta</p>' +
          '<div class="exp-ruta-ficha__row">' +
          habs
            .map(function (h) {
              return chipHtml(h.nombre, homeLearnSearchUrl(h.nombre));
            })
            .join('') +
          '</div></div>';
      }
      if (fichaInner) {
        parts.push('<div class="exp-ruta-ficha">' + fichaInner + '</div>');
      }
    }

    parts.push(
      '<div class="exp-ruta-ficha">' +
        '<p class="exp-ruta-ficha__title ubits-body-md-semibold">Descripción</p>' +
        '<p class="exp-ruta-desc ubits-body-md-regular">' +
        esc(ruta.descripcion || '') +
        '</p></div>'
    );

    if (!fiqsha) {
      var aliados = collectAliados(ruta);
      if (aliados.length) {
        var aliadoTitle = aliados.length === 1 ? 'Aliado' : 'Aliados';
        parts.push(
          '<div class="exp-ruta-ficha">' +
            '<p class="exp-ruta-ficha__title ubits-body-md-semibold">' +
            aliadoTitle +
            '</p>' +
            '<div class="exp-ruta-media-stack">' +
            aliados
              .map(function (aliado) {
                return (
                  '<div class="exp-ruta-media-row">' +
                  '<div class="exp-ruta-media-avatar">' +
                  '<img class="exp-ruta-media-avatar__img" src="' +
                  esc(aliado.logo) +
                  '" alt="" />' +
                  '</div>' +
                  '<div class="exp-ruta-media-body">' +
                  '<a class="exp-ruta-media-name ubits-body-md-semibold" href="' +
                  esc(homeLearnSearchUrl(aliado.nombre)) +
                  '" target="_blank" rel="noopener noreferrer">' +
                  esc(aliado.nombre) +
                  '</a>' +
                  '<p class="exp-ruta-media-bio ubits-body-md-regular">' +
                  esc(ALIADO_BIO_PREVIEW) +
                  '</p></div></div>'
                );
              })
              .join('') +
            '</div></div>'
        );
      }

      var expertos = collectExpertos(ruta);
      if (expertos.length) {
        parts.push(
          '<div class="exp-ruta-ficha">' +
            '<p class="exp-ruta-ficha__title ubits-body-md-semibold">Expertos</p>' +
            '<div class="exp-ruta-expertos-list">' +
            expertos
              .map(function (ex) {
                return (
                  '<div class="exp-ruta-media-row">' +
                  '<div class="exp-ruta-media-avatar">' +
                  '<img class="exp-ruta-media-avatar__img" src="' +
                  esc(resolveImage(ex.avatar)) +
                  '" alt="" />' +
                  '<a class="exp-ruta-media-avatar__linkedin" href="' +
                  esc(LINKEDIN_PLAYGROUND_URL) +
                  '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de ' +
                  esc(ex.nombre) +
                  '">' +
                  '<i class="fab fa-linkedin-in" aria-hidden="true"></i></a>' +
                  '</div>' +
                  '<div class="exp-ruta-media-body">' +
                  '<a class="exp-ruta-media-name ubits-body-md-semibold" href="' +
                  esc(homeLearnSearchUrl(ex.nombre)) +
                  '" target="_blank" rel="noopener noreferrer">' +
                  esc(ex.nombre) +
                  '</a>' +
                  '<p class="exp-ruta-media-role ubits-body-sm-regular">' +
                  esc(ex.rol) +
                  '</p>' +
                  '<p class="exp-ruta-media-bio ubits-body-md-regular">' +
                  esc(ex.bio) +
                  '</p></div></div>'
                );
              })
              .join('') +
            '</div></div>'
        );
      }
    }

    return parts.join('');
  }

  function renderLista() {
    var mount = document.getElementById('exp-ruta-cards-mount');
    if (!mount || typeof global.loadCardContentCompact !== 'function') return;
    var ids = childIds(session.ruta);
    var cards = [];
    ids.forEach(function (id, index) {
      var child = findContentById(id);
      if (!child) return;
      var finished = !!session.finishedIds[id];
      cards.push(toCompactCard(child, { finished: finished, index: index }));
    });
    global.loadCardContentCompact('exp-ruta-cards-mount', cards);
    var nodes = mount.querySelectorAll('.course-card-compact');
    nodes.forEach(function (card, index) {
      var id = ids[index];
      if (!id) return;
      card.setAttribute('data-content-id', id);
      var unlocked = isUnlocked(index, id);
      card.classList.toggle('exp-ruta-card--locked', !unlocked);
      card.classList.toggle('exp-ruta-card--unlocked', unlocked);
      if (unlocked) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
          if (e.target.closest('button, a')) return;
          goToChild(id);
        });
      }
    });
  }

  function render() {
    var stage = document.getElementById('exp-ruta-stage');
    if (!stage || !session.ruta) return;
    var ruta = session.ruta;
    var img = resolveImage(ruta.imagen || ruta.imagePath);
    var mode = session.portadaMode;
    var pct = progressPercent();

    stage.className = 'exp-ruta-stage exp-ruta-stage--portada';
    stage.innerHTML =
      '<div class="exp-ruta-hero"><img src="' +
      esc(img) +
      '" alt="" /></div>' +
      '<aside id="exp-ruta-aside" class="exp-ruta-col exp-ruta-col--aside"></aside>' +
      '<div class="exp-ruta-portada-meta">' +
      renderPortadaMeta(ruta) +
      '</div>';

    var aside = document.getElementById('exp-ruta-aside');
    if (!aside) return;

    var html = '<div class="exp-ruta-aside-stack">';
    if (typeof global.tituloSpecsCtaExpEstudioHtml === 'function') {
      html += global.tituloSpecsCtaExpEstudioHtml({
        contentType: ruta.tipoContenido || 'Ruta de aprendizaje',
        title: ruta.titulo || ruta.title || '',
        level: nivelLabel(ruta.nivelId),
        duration: durationLabel(ruta),
        language: ruta.idioma || 'Español',
        hasCertificate: !!ruta.conCertificacion,
        subtitles: false,
        mode: mode,
        progressValue: mode === 'completado' ? 100 : pct
      });
    }
    html +=
      '<div class="exp-ruta-lista">' +
      '<h3 class="exp-ruta-lista__title ubits-body-md-semibold">' +
      esc(LIST_TITLE) +
      '</h3>' +
      '<div id="exp-ruta-cards-mount" class="exp-ruta-lista__cards"></div></div></div>';
    aside.innerHTML = html;

    var ctaRoot = aside.querySelector('.ubits-titulo-specs-cta-exp');
    if (typeof global.initTituloSpecsCtaExpEstudio === 'function') {
      global.initTituloSpecsCtaExpEstudio(ctaRoot, {
        onPrimary: function () {
          if (mode === 'por-iniciar') {
            /* Solo desbloquea cards según Lineal/Libre; no navega al contenido. */
            session.started = true;
            session.portadaMode = 'en-progreso';
            setHash('en-progreso');
            render();
            return;
          }
          if (mode === 'en-progreso') {
            goToChild(nextContentId());
            return;
          }
          goHomeLearn();
        },
        onSecondary: function () {
          if (typeof global.showToast === 'function') {
            global.showToast('success', 'Certificado descargado (demo)', {
              containerId: 'ubits-toast-container',
              duration: 3000
            });
          }
        }
      });
    }

    renderLista();
    if (typeof global.initTooltip === 'function') {
      global.initTooltip('#exp-ruta-stage [data-tooltip]');
    }
  }

  function initExpRuta() {
    session.rutaId = getQueryId();
    var ruta = findContentById(session.rutaId);
    if (!ruta) {
      var stage = document.getElementById('exp-ruta-stage');
      if (stage) {
        stage.innerHTML =
          '<p class="ubits-body-md-regular">No se encontró la ruta <code>' +
          esc(session.rutaId) +
          '</code>.</p>';
      }
      return;
    }
    session.ruta = ruta;
    session.nav = resolveNavType(ruta);
    applyHashDemo(location.hash || '#portada-sin-iniciar');
    if (!location.hash && typeof history.replaceState === 'function') {
      history.replaceState(
        null,
        '',
        location.pathname + location.search + hashForMode(session.portadaMode)
      );
    }
    render();
    global.addEventListener('hashchange', function () {
      applyHashDemo(location.hash);
      render();
    });
  }

  global.initExpRuta = initExpRuta;
})(typeof window !== 'undefined' ? window : this);
