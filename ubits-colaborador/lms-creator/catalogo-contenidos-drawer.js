/**
 * LMS Creator — helper: arma window.CATALOGO_CURSOS_DRAWER leyendo las BDs ya cargadas
 * (bd-contenidos-ubits, bd-contenidos-fiqsha + maestros). No es una base de datos.
 *
 * Orden antes de este: niveles, aliados, competencias, habilidades, categorias-fiqsha,
 * bd-contenidos-ubits, bd-contenidos-fiqsha.
 * Rutas ../../ respecto a esta carpeta (lms-creator).
 */
(function (global) {
    'use strict';

    function getAliadosByIdMap() {
        var out = {};
        var arr = (global.BD_MASTER_ALIADOS && global.BD_MASTER_ALIADOS.aliados) || [];
        for (var i = 0; i < arr.length; i++) {
            out[arr[i].id] = arr[i];
        }
        return out;
    }

    function logoMaestroAliadoAPagina(logoRel) {
        if (logoRel && String(logoRel).indexOf('images/') === 0) {
            return '../../' + logoRel;
        }
        return '../../images/Favicons/UBITS.jpg';
    }

    function resolveAliadoPorId(aliadoId) {
        var byId = getAliadosByIdMap();
        var a = byId[aliadoId];
        if (!a) {
            return { nombre: 'UBITS', logo: '../../images/Favicons/UBITS.jpg', id: aliadoId };
        }
        return { id: a.id, nombre: a.nombre, logo: logoMaestroAliadoAPagina(a.logo) };
    }

    function resolveProveedoresCatalogoUbits(item) {
        var ids = item.providersAliadosIds;
        if (ids && ids.length) {
            return ids.map(function (aid) {
                return resolveAliadoPorId(aid);
            });
        }
        if (item.providersNombres && item.providersNombres.length) {
            return item.providersNombres.map(function (nombre) {
                var arr = (global.BD_MASTER_ALIADOS && global.BD_MASTER_ALIADOS.aliados) || [];
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].nombre === nombre) {
                        return resolveAliadoPorId(arr[j].id);
                    }
                }
                return { nombre: nombre, logo: '../../images/Favicons/UBITS.jpg', id: null };
            });
        }
        return [resolveAliadoPorId(item.aliadoId || 'aly-001')];
    }

    function formatDuracionPlayground(item) {
        if (item.tiempoValor != null && item.unidadTiempo === 'minutos') {
            return String(item.tiempoValor) + ' min';
        }
        if (item.tiempoValor != null && item.unidadTiempo === 'horas') {
            return String(item.tiempoValor) + ' h';
        }
        return '60 min';
    }

    function nivelNombreDesdeCatalogoItem(item, idx) {
        var master = global.BD_MASTER_NIVELES_CONTENIDO;
        var lista = master && master.niveles ? master.niveles : [];
        var byId = {};
        for (var i = 0; i < lista.length; i++) {
            byId[lista[i].id] = lista[i];
        }
        if (item.nivelId && byId[item.nivelId]) {
            return byId[item.nivelId].nombre;
        }
        if (item.nivel) return item.nivel;
        var levels = ['Básico', 'Intermedio', 'Avanzado'];
        return levels[idx % levels.length];
    }

    function imagenPlaygroundAHtml(item) {
        if (item.imagen && String(item.imagen).indexOf('images/') === 0) {
            return '../../' + item.imagen;
        }
        if (item.imagePath) {
            return '../../images/' + item.imagePath;
        }
        return '../../images/cards-learn/default.jpg';
    }

    function getCompetenciasByIdMap() {
        var out = {};
        var arr = (global.BD_MASTER_COMPETENCIAS && global.BD_MASTER_COMPETENCIAS.competencias) || [];
        for (var i = 0; i < arr.length; i++) {
            out[arr[i].id] = arr[i];
        }
        return out;
    }

    function nombreCompetenciaCatalogoUbits(item, idx) {
        var m = getCompetenciasByIdMap();
        var cid = item.competenciaPrincipalId;
        if (cid && m[cid]) return m[cid].nombre;
        if (item.competenciaPrincipalNombre) return item.competenciaPrincipalNombre;
        var fallbacks = ['Liderazgo', 'Comunicación', 'Productividad', 'Marketing digital'];
        return fallbacks[idx % fallbacks.length];
    }

    function getCategoriasFiqshaByIdMap() {
        var out = {};
        var arr = (global.BD_MASTER_CATEGORIAS_FIQSHA && global.BD_MASTER_CATEGORIAS_FIQSHA.categorias) || [];
        for (var i = 0; i < arr.length; i++) {
            out[arr[i].id] = arr[i];
        }
        return out;
    }

    function nombreCategoriaFiqshaDesdeItem(item) {
        var m = getCategoriasFiqshaByIdMap();
        var id = item.categoriaFiqshaId;
        if (id && m[id]) return m[id].nombre;
        if (item.categoria) return item.categoria;
        return 'Universidad corporativa';
    }

    function buildUbitsCatalogFromJson(jsonData) {
        var rows = jsonData && jsonData.contents ? jsonData.contents : [];
        var types = ['Curso', 'Short', 'Charla', 'Artículo', 'Podcast', 'Caso de estudio', 'Documento técnico', 'Ejercicios de práctica'];

        return rows.map(function (item, idx) {
            var titulo = item.titulo || item.title || 'Contenido UBITS';
            var tipo = item.tipoContenido || types[idx % types.length];
            var nivel = nivelNombreDesdeCatalogoItem(item, idx);
            var competency = nombreCompetenciaCatalogoUbits(item, idx);
            var provs = resolveProveedoresCatalogoUbits(item);
            var providerPrim = provs[0] ? provs[0].nombre : 'UBITS';
            var providerPrimLogo = provs[0] ? provs[0].logo : '../../images/Favicons/UBITS.jpg';
            var providersMulti = null;
            if (tipo === 'Ruta de aprendizaje' && provs.length > 1) {
                providersMulti = provs.map(function (p) {
                    return { name: p.nombre, provider: p.nombre, logo: p.logo, providerLogo: p.logo };
                });
            }
            return {
                id: item.id || 'u-' + idx,
                title: titulo,
                image: imagenPlaygroundAHtml(item),
                provider: providerPrim,
                providerLogo: providerPrimLogo,
                providers: providersMulti,
                type: tipo,
                level: nivel,
                duration: formatDuracionPlayground(item),
                language: item.idioma || 'Español',
                competency: competency,
                categoria: null,
                courseSource: 'ubits',
                status: 'default',
                progress: 0,
                descripcion: item.descripcion,
                expertos: item.expertos,
                habilidadPrincipalId: item.habilidadPrincipalId,
                habilidadesSecundariasIds: item.habilidadesSecundariasIds,
                competenciaPrincipalId: item.competenciaPrincipalId,
                nivelIngles: item.nivelIngles,
                aliadoId: item.aliadoId,
                nivelId: item.nivelId || null,
                providersAliadosIds: item.providersAliadosIds || null
            };
        });
    }

    function buildFiqshaCatalogFromJson(jsonData) {
        var rows = jsonData && jsonData.contents ? jsonData.contents : [];
        return rows.map(function (item, idx) {
            var fiqshaAliado = resolveAliadoPorId(item.proveedorAliadoId || 'aly-018');
            var provider = fiqshaAliado.nombre;
            var categoria = nombreCategoriaFiqshaDesdeItem(item);
            var titulo = item.titulo || item.title || 'Contenido Fiqsha';
            var dur = item.duration;
            if (!dur && item.tiempoValor != null && item.unidadTiempo === 'minutos') {
                dur = String(item.tiempoValor) + ' min';
            }
            if (!dur) dur = '60 min';
            var competencySoloCard = 'Trabajo en equipo';
            return {
                id: item.id || 'f-' + idx,
                title: titulo,
                image: imagenPlaygroundAHtml(item),
                provider: provider,
                providerLogo: fiqshaAliado.logo,
                type: item.tipoContenido || 'Curso',
                level: nivelNombreDesdeCatalogoItem(item, idx),
                duration: dur,
                language: item.idioma || 'Español',
                categoria: categoria,
                descripcion: item.descripcion,
                courseSource: 'empresa',
                status: 'default',
                progress: 0,
                competency: competencySoloCard,
                nivelId: item.nivelId || null,
                proveedorAliadoId: item.proveedorAliadoId || 'aly-018',
                categoriaFiqshaId: item.categoriaFiqshaId || null
            };
        });
    }

    function buildMerged() {
        var ubitsLocal = global.BDS_CONTENIDOS_UBITS || { contents: [] };
        var fiqshaLocal = global.BDS_CONTENIDOS_FIQSHA || { contents: [] };
        return buildUbitsCatalogFromJson(ubitsLocal).concat(buildFiqshaCatalogFromJson(fiqshaLocal));
    }

    global.CATALOGO_CURSOS_DRAWER = buildMerged();

    global.refreshCatalogoContenidosDrawer = function () {
        global.CATALOGO_CURSOS_DRAWER = buildMerged();
        return global.CATALOGO_CURSOS_DRAWER;
    };
})(typeof window !== 'undefined' ? window : this);
