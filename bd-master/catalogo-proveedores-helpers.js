/**
 * Resolución de aliados/proveedores para catálogos UBITS + Fiqsha.
 * Requiere: bd-master-aliados.js cargado antes.
 */
(function (global) {
    'use strict';

    var UBITS_ALIADO_ID = 'aly-001';
    var FIQSHA_ALIADO_ID = 'aly-018';

    function getAliadosByIdMap() {
        var out = {};
        var arr = (global.BD_MASTER_ALIADOS && global.BD_MASTER_ALIADOS.aliados) || [];
        for (var i = 0; i < arr.length; i++) {
            out[arr[i].id] = arr[i];
        }
        return out;
    }

    function logoAliadoAPagina(logoRel, imagesPrefix) {
        imagesPrefix = imagesPrefix || '../../';
        if (!logoRel) {
            return imagesPrefix + 'images/Favicons/UBITS.jpg';
        }
        var rel = String(logoRel).replace(/^\.\//, '');
        if (rel.indexOf('images/') === 0) {
            return imagesPrefix + rel;
        }
        return imagesPrefix + rel;
    }

    function resolveAliadoDisplay(aliadoId, imagesPrefix, options) {
        options = options || {};
        imagesPrefix = imagesPrefix || '../../';
        var byId = getAliadosByIdMap();
        var a = aliadoId ? byId[aliadoId] : null;

        if (a) {
            return {
                id: a.id,
                nombre: a.nombre,
                logo: logoAliadoAPagina(a.logo, imagesPrefix)
            };
        }

        if (options.defaultEmpresa) {
            var fiqsha = byId[FIQSHA_ALIADO_ID];
            if (fiqsha) {
                return {
                    id: fiqsha.id,
                    nombre: fiqsha.nombre,
                    logo: logoAliadoAPagina(fiqsha.logo, imagesPrefix)
                };
            }
        }

        return {
            id: aliadoId || null,
            nombre: 'UBITS',
            logo: logoAliadoAPagina('images/Favicons/UBITS.jpg', imagesPrefix)
        };
    }

    function resolvePrimaryAliadoId(item) {
        if (!item) return UBITS_ALIADO_ID;
        var ids = item.providersAliadosIds;
        if (ids && ids.length) {
            for (var i = 0; i < ids.length; i++) {
                if (ids[i] && ids[i] !== UBITS_ALIADO_ID) {
                    return ids[i];
                }
            }
            return ids[0];
        }
        return item.aliadoId || UBITS_ALIADO_ID;
    }

    function resolveProveedoresCatalogoUbits(item, imagesPrefix) {
        if (!item) {
            return [resolveAliadoDisplay(UBITS_ALIADO_ID, imagesPrefix)];
        }

        var ids = item.providersAliadosIds;
        if (ids && ids.length) {
            return ids.map(function (aid) {
                return resolveAliadoDisplay(aid, imagesPrefix);
            });
        }

        var nombres = item.providersNombres;
        if (nombres && nombres.length) {
            var arr = (global.BD_MASTER_ALIADOS && global.BD_MASTER_ALIADOS.aliados) || [];
            return nombres.map(function (nombre) {
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].nombre === nombre) {
                        return resolveAliadoDisplay(arr[j].id, imagesPrefix);
                    }
                }
                return {
                    id: null,
                    nombre: nombre,
                    logo: logoAliadoAPagina('images/Favicons/UBITS.jpg', imagesPrefix)
                };
            });
        }

        return [resolveAliadoDisplay(item.aliadoId || UBITS_ALIADO_ID, imagesPrefix)];
    }

    function buildProvidersMultiForCard(item, provs) {
        var tipo = item && item.tipoContenido ? item.tipoContenido : '';
        if (!provs || provs.length <= 1) return null;
        if (tipo !== 'Ruta de aprendizaje' && tipo !== 'Programa') return null;
        return provs.map(function (p) {
            return {
                name: p.nombre,
                provider: p.nombre,
                logo: p.logo,
                providerLogo: p.logo
            };
        });
    }

    function buildProvidersMultiForCard(item, provs) {
        var tipo = item && item.tipoContenido ? item.tipoContenido : '';
        if (!provs || provs.length <= 1) return null;
        if (tipo !== 'Ruta de aprendizaje' && tipo !== 'Programa') return null;
        return provs.map(function (p) {
            return {
                name: p.nombre,
                provider: p.nombre,
                logo: p.logo,
                providerLogo: p.logo
            };
        });
    }

    function isContenidoEmpresaFiqsha(item) {
        if (!item) return false;
        return item.origen === 'empresa_fiqsha' ||
            item.catalogoId === 'catalogo_fiqsha' ||
            (!!item.proveedorAliadoId && !(item.providersAliadosIds && item.providersAliadosIds.length));
    }

    function findCatalogoContentByTitle(title) {
        if (!title) return null;
        var key = String(title).toLowerCase().trim();
        var pools = [];
        if (global.BDS_CONTENIDOS_UBITS && global.BDS_CONTENIDOS_UBITS.contents) {
            pools = pools.concat(global.BDS_CONTENIDOS_UBITS.contents);
        }
        if (global.BDS_CONTENIDOS_FIQSHA && global.BDS_CONTENIDOS_FIQSHA.contents) {
            pools = pools.concat(global.BDS_CONTENIDOS_FIQSHA.contents);
        }
        for (var i = 0; i < pools.length; i++) {
            var c = pools[i];
            var t = (c.titulo || c.title || '').toLowerCase().trim();
            if (t === key) return c;
        }
        return null;
    }

    /** Proveedor primario (nombre + logo) para cualquier ítem de catálogo UBITS o Fiqsha. */
    function resolveProviderFromCatalogoItem(item, imagesPrefix) {
        imagesPrefix = imagesPrefix || '../../';
        if (!item) {
            return resolveAliadoDisplay(UBITS_ALIADO_ID, imagesPrefix);
        }
        if (isContenidoEmpresaFiqsha(item)) {
            return resolveAliadoDisplay(item.proveedorAliadoId || FIQSHA_ALIADO_ID, imagesPrefix, { defaultEmpresa: true });
        }
        return resolveAliadoDisplay(resolvePrimaryAliadoId(item), imagesPrefix);
    }

    /** Parchea provider/providerLogo en un objeto card plano buscando por título en la BD. */
    function patchCardProviderFromBdByTitle(cardItem, imagesPrefix) {
        if (!cardItem || !cardItem.title) return cardItem;
        var content = findCatalogoContentByTitle(cardItem.title);
        if (!content) return cardItem;
        var prov = resolveProviderFromCatalogoItem(content, imagesPrefix || '../../');
        cardItem.provider = prov.nombre;
        cardItem.providerLogo = prov.logo;
        var provs = resolveProveedoresCatalogoUbits(content, imagesPrefix || '../../');
        var multi = buildProvidersMultiForCard(content, provs);
        if (multi) {
            cardItem.providers = multi;
        } else {
            delete cardItem.providers;
        }
        return cardItem;
    }

    /** Campos provider + providerLogo (+ providers opcional) para cards de aprendizaje/tareas. */
    function resolveLearningContentProviderFields(content, imagesPrefix) {
        var prov = resolveProviderFromCatalogoItem(content, imagesPrefix || '../../');
        var out = {
            provider: prov.nombre,
            providerLogo: prov.logo
        };
        if (content && !isContenidoEmpresaFiqsha(content)) {
            var provs = resolveProveedoresCatalogoUbits(content, imagesPrefix || '../../');
            var multi = buildProvidersMultiForCard(content, provs);
            if (multi) out.providers = multi;
        }
        return out;
    }

    function logoPathFromCatalogoItem(c, imagesPrefix) {
        imagesPrefix = imagesPrefix || '../../';
        if (c && c.imagen) {
            return imagesPrefix + String(c.imagen).replace(/^\.\//, '');
        }
        return imagesPrefix + 'images/Profile-image.jpg';
    }

    /** Card completa para loadCardContent desde ítem de BD. extras: { progress, status, competency } */
    function buildCardFromCatalogoContent(c, imagesPrefix, extras) {
        extras = extras || {};
        imagesPrefix = imagesPrefix || '../../';
        var provFields = resolveLearningContentProviderFields(c, imagesPrefix);
        var durMin = c && c.tiempoValor != null ? String(c.tiempoValor) : '60';
        var pct = extras.progress != null ? Number(extras.progress) : 0;
        if (isNaN(pct)) pct = 0;
        var card = {
            type: (c && c.tipoContenido) || 'Curso',
            title: (c && (c.titulo || c.title)) || '',
            provider: provFields.provider,
            providerLogo: provFields.providerLogo,
            duration: durMin + ' min',
            level: extras.level || 'Intermedio',
            progress: pct,
            status: extras.status != null ? extras.status : (pct >= 100 ? 'completed' : (pct > 0 ? 'progress' : 'default')),
            image: logoPathFromCatalogoItem(c, imagesPrefix),
            competency: extras.competency || '',
            language: (c && c.idioma) ? String(c.idioma).trim() : 'Español'
        };
        if (provFields.providers) card.providers = provFields.providers;
        return card;
    }

    global.CATALOGO_PROVEEDORES = {
        UBITS_ALIADO_ID: UBITS_ALIADO_ID,
        FIQSHA_ALIADO_ID: FIQSHA_ALIADO_ID,
        resolveAliadoDisplay: resolveAliadoDisplay,
        resolvePrimaryAliadoId: resolvePrimaryAliadoId,
        resolveProveedoresCatalogoUbits: resolveProveedoresCatalogoUbits,
        buildProvidersMultiForCard: buildProvidersMultiForCard,
        isContenidoEmpresaFiqsha: isContenidoEmpresaFiqsha,
        findCatalogoContentByTitle: findCatalogoContentByTitle,
        resolveProviderFromCatalogoItem: resolveProviderFromCatalogoItem,
        patchCardProviderFromBdByTitle: patchCardProviderFromBdByTitle,
        resolveLearningContentProviderFields: resolveLearningContentProviderFields,
        buildCardFromCatalogoContent: buildCardFromCatalogoContent
    };
})(typeof window !== 'undefined' ? window : this);
