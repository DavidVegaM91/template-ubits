/**
 * catalogo-competencias-drawer.js
 *
 * PARA QUÉ SIRVE
 * Construye en memoria el catálogo que alimenta el drawer “Agregar competencias” (cards por
 * competencia, habilidades, imágenes e iconos). Une los maestros de competencias y habilidades
 * en estructuras listas para la UI. No persiste datos ni es una BD: solo lee lo ya cargado en window.
 *
 * DÓNDE SE USA (carga este archivo con <script src="...">)
 * - ubits-colaborador/lms-creator/crear-plan-competencias.html
 * - ubits-colaborador/lms-creator/detalle-plan-competencias.html
 * - ubits-colaborador/aprendizaje/catalogo.html
 * - ubits-colaborador/aprendizaje/catalogo-v5.html
 *
 * DEPENDENCIAS (orden obligatorio antes de este script)
 * - ../../bd-master/bd-master-competencias.js
 * - ../../bd-master/bd-master-habilidades.js
 * (desde lms-creator/; desde aprendizaje/ la ruta a bd-master ya está en esas páginas)
 *
 * EXPONE EN window
 * CATALOGO_COMPETENCIAS_DRAWER, CATALOGO_ACADEMIAS, COMPETENCIA_IMAGE_MAP, HABILIDAD_ICON_MAP
 * refreshCatalogoCompetenciasDrawer()
 */
(function (global) {
    'use strict';

    function iconForDrawer(iconoFontAwesome) {
        if (!iconoFontAwesome) return 'fa-circle';
        var parts = String(iconoFontAwesome).trim().split(/\s+/);
        if (parts.length >= 2 && /^(far|fas|fab)$/i.test(parts[0])) {
            return parts.slice(1).join(' ');
        }
        return parts[0].indexOf('fa-') === 0 ? parts[0] : 'fa-circle';
    }

    function buildAll() {
        var comps = (global.BD_MASTER_COMPETENCIAS && global.BD_MASTER_COMPETENCIAS.competencias) || [];
        var habs = (global.BD_MASTER_HABILIDADES && global.BD_MASTER_HABILIDADES.habilidades) || [];

        var byComp = {};
        habs.forEach(function (h) {
            var cid = h.competenciaId;
            if (!cid) return;
            if (!byComp[cid]) byComp[cid] = [];
            byComp[cid].push(h);
        });
        Object.keys(byComp).forEach(function (cid) {
            byComp[cid].sort(function (a, b) {
                return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
            });
        });

        var competenciaImageMap = {};
        var habilidadIconMap = {};
        var listaPlana = [];

        comps.forEach(function (comp) {
            var id = comp.id;
            var nombre = comp.nombre || '';
            if (comp.archivoImagen) competenciaImageMap[nombre] = comp.archivoImagen;
            var listH = (byComp[id] || []).map(function (h) {
                habilidadIconMap[h.nombre] = iconForDrawer(h.iconoFontAwesome);
                return h.nombre;
            });
            listaPlana.push({
                id: id,
                nombre: nombre,
                academia: 'Catálogo UBITS',
                habilidades: listH
            });
        });

        listaPlana.sort(function (a, b) {
            return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
        });

        var academiasNested = [{
            nombre: 'Catálogo UBITS',
            competencias: listaPlana.map(function (item) {
                return { nombre: item.nombre, habilidades: item.habilidades.slice() };
            })
        }];

        return {
            listaPlana: listaPlana,
            academiasNested: academiasNested,
            competenciaImageMap: competenciaImageMap,
            habilidadIconMap: habilidadIconMap
        };
    }

    function applyBuilt(built) {
        global.CATALOGO_COMPETENCIAS_DRAWER = built.listaPlana;
        global.CATALOGO_ACADEMIAS = built.academiasNested;
        global.COMPETENCIA_IMAGE_MAP = built.competenciaImageMap;
        global.HABILIDAD_ICON_MAP = built.habilidadIconMap;
    }

    applyBuilt(buildAll());

    global.refreshCatalogoCompetenciasDrawer = function () {
        applyBuilt(buildAll());
        return global.CATALOGO_COMPETENCIAS_DRAWER;
    };
})(typeof window !== 'undefined' ? window : this);
