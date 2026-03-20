/**
 * LMS Creator (y páginas que lo enlacen): arma el catálogo del drawer de competencias
 * leyendo bd-master-competencias.js + bd-master-habilidades.js. No es una base de datos.
 *
 * Cargar DESPUÉS de: bd-master-competencias.js, bd-master-habilidades.js
 *
 * Expone: CATALOGO_COMPETENCIAS_DRAWER, CATALOGO_ACADEMIAS, COMPETENCIA_IMAGE_MAP, HABILIDAD_ICON_MAP
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
