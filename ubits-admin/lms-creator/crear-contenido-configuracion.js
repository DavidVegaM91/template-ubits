/**
 * Paso Ajustes — hub Visibilidad + Pesos + Tipo de navegación + Impacto (solo editar).
 * Depende de: createInput (opcional), empty-state, toast.
 */
(function (global) {
    'use strict';

    var PANEL = 'hub'; // hub | visibilidad | pesos | navegacion | impacto
    var FORCE_PESOS_EMPTY = false;
    var PESOS = {}; // pageKey -> number
    var TIPO_NAVEGACION = 'lineal'; // lineal | libre
    var READONLY = false;
    var wired = false;

    var TIPO_NAVEGACION_LABEL = {
        lineal: 'Lineal',
        libre: 'Libre'
    };

    function redistributeEqual(ids) {
        var n = ids.length;
        var out = {};
        if (n <= 0) return out;
        if (n === 1) {
            out[ids[0]] = 100;
            return out;
        }
        var base = Math.floor(100 / n);
        var rem = 100 - base * n;
        ids.forEach(function (id, i) {
            out[id] = base + (i < rem ? 1 : 0);
        });
        return out;
    }

    function syncPesosForIds(ids) {
        var prevIds = Object.keys(PESOS)
            .filter(function (id) {
                return ids.indexOf(id) !== -1;
            })
            .sort();
        var nextIds = ids.slice().sort();
        var same =
            prevIds.length === nextIds.length &&
            prevIds.every(function (id, i) {
                return id === nextIds[i];
            });
        if (!same) {
            var redistributed = redistributeEqual(ids);
            Object.keys(PESOS).forEach(function (k) {
                if (ids.indexOf(k) === -1) delete PESOS[k];
            });
            ids.forEach(function (id) {
                PESOS[id] = redistributed[id];
            });
            return;
        }
        if (ids.length === 1) {
            PESOS[ids[0]] = 100;
            return;
        }
        var missing = false;
        ids.forEach(function (id) {
            if (PESOS[id] == null) missing = true;
        });
        if (missing) {
            var red = redistributeEqual(ids);
            ids.forEach(function (id) {
                PESOS[id] = red[id];
            });
        }
    }

    /** Visibles suman 100%; ocultas = 0%. Redistribuye si cambió el set con peso. */
    function syncPesosForItems(items) {
        items = items || [];
        var visibleIds = [];
        items.forEach(function (it) {
            if (!it.hidden) visibleIds.push(it.id);
        });
        var prevPoolIds = Object.keys(PESOS)
            .filter(function (id) {
                return items.some(function (it) {
                    return it.id === id;
                });
            })
            .filter(function (id) {
                var it = items.filter(function (x) {
                    return x.id === id;
                })[0];
                if (!it.hidden) return true;
                return (parseInt(PESOS[id], 10) || 0) > 0;
            })
            .sort();
        var nextSorted = visibleIds.slice().sort();
        var same =
            prevPoolIds.length === nextSorted.length &&
            prevPoolIds.every(function (id, i) {
                return id === nextSorted[i];
            });
        if (!same) {
            var red = redistributeEqual(visibleIds);
            visibleIds.forEach(function (id) {
                PESOS[id] = red[id];
            });
        } else {
            syncPesosForIds(visibleIds);
        }
        items.forEach(function (it) {
            if (it.hidden) PESOS[it.id] = 0;
        });
    }

    function sumPesos(ids) {
        return ids.reduce(function (acc, id) {
            return acc + (parseInt(PESOS[id], 10) || 0);
        }, 0);
    }

    function isPesosComplete(ids) {
        if (ids.length === 0) return true;
        if (ids.length === 1) return (parseInt(PESOS[ids[0]], 10) || 0) === 100;
        return sumPesos(ids) === 100;
    }

    function listEvalPages() {
        var keysMap = global._ccEvalPageKeys || {};
        var items = [];
        var mount = document.getElementById('crear-contenido-recursos-indice-mount');
        Object.keys(keysMap).forEach(function (pk) {
            if (!keysMap[pk]) return;
            var title = 'Evaluación';
            var hidden = false;
            var hiddenSinceIso = '';
            if (mount) {
                var item = mount.querySelector(
                    '.ubits-paginas-creator__item[data-paginas-creator-key="' +
                        pk.replace(/"/g, '\\"') +
                        '"]'
                );
                if (item) {
                    var label = item.querySelector('.ubits-paginas-creator__label');
                    var t = label ? String(label.textContent || '').trim() : '';
                    if (t) title = t;
                    hidden =
                        item.getAttribute('data-paginas-hidden') === 'true' ||
                        item.classList.contains('ubits-paginas-creator__item--hidden');
                    hiddenSinceIso = item.getAttribute('data-paginas-hidden-since') || '';
                }
            }
            items.push({
                id: pk,
                title: title,
                hidden: hidden,
                hiddenSinceIso: hiddenSinceIso
            });
        });
        if (mount) {
            var ordered = [];
            mount.querySelectorAll('.ubits-paginas-creator__item[data-paginas-creator-key]').forEach(function (el) {
                var pk = el.getAttribute('data-paginas-creator-key') || '';
                if (!pk || !keysMap[pk]) return;
                var found = items.filter(function (it) {
                    return it.id === pk;
                })[0];
                if (found) ordered.push(found);
            });
            if (ordered.length) return ordered;
        }
        return items;
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getVisibilidadSummary() {
        if (typeof global.getCrearContenidoVisibilidad === 'function') {
            var v = global.getCrearContenidoVisibilidad();
            var map = {
                borrador: 'Borrador',
                publico: 'Público',
                privado: 'Privado',
                oculto: 'Oculto',
                archivado: 'Archivado'
            };
            return map[v] || 'Borrador';
        }
        var checked = document.querySelector(
            'input[name="crear-contenido-visibilidad"]:checked, input[name="editar-contenido-visibilidad"]:checked'
        );
        if (!checked) return 'Borrador';
        var map2 = {
            borrador: 'Borrador',
            publico: 'Público',
            privado: 'Privado',
            oculto: 'Oculto',
            archivado: 'Archivado'
        };
        return map2[checked.value] || 'Borrador';
    }

    function formatPesosSummary(items) {
        var visible = (items || []).filter(function (i) {
            return !i.hidden;
        });
        if (!items.length) return 'Sin evaluaciones en este contenido.';
        if (!visible.length) return 'Todas las evaluaciones están ocultas.';
        if (visible.length === 1) return 'Automático · 100%';
        var ids = visible.map(function (i) {
            return i.id;
        });
        var sum = sumPesos(ids);
        if (sum !== 100) return 'Incompleto · ' + sum + '% de 100%';
        return visible
            .map(function (it) {
                return it.title + ' (' + (parseInt(PESOS[it.id], 10) || 0) + '%)';
            })
            .join(' · ');
    }

    function hashForConfigPanel(panel) {
        if (panel === 'visibilidad') return '#ajustes-visibilidad';
        if (panel === 'pesos') return '#ajustes-pesos';
        if (panel === 'navegacion') return '#ajustes-navegacion';
        if (panel === 'impacto') return '#ajustes-impacto';
        return '#ajustes';
    }

    function isPesosEmptyDemoHash(hash) {
        return String(hash || '').replace(/^#/, '') === 'ajustes-pesos-empty';
    }

    function panelFromConfigHash(hash) {
        var h = String(hash || '').replace(/^#/, '');
        if (h === 'ajustes-visibilidad' || h === 'configuracion-visibilidad') return 'visibilidad';
        if (
            h === 'ajustes-pesos' ||
            h === 'configuracion-pesos' ||
            h === 'ajustes-pesos-empty'
        ) {
            return 'pesos';
        }
        if (h === 'ajustes-navegacion' || h === 'configuracion-navegacion') return 'navegacion';
        if (h === 'ajustes-impacto') return 'impacto';
        if (
            h === 'ajustes' ||
            h === 'configuracion' ||
            h === 'visibilidad' ||
            h === 'publicacion'
        ) {
            return 'hub';
        }
        return null;
    }

    function isLegacyConfigHash(hash) {
        var h = String(hash || '').replace(/^#/, '');
        return (
            h === 'visibilidad' ||
            h === 'publicacion' ||
            h === 'configuracion' ||
            h === 'configuracion-visibilidad' ||
            h === 'configuracion-pesos' ||
            h === 'configuracion-navegacion'
        );
    }

    function syncNavegacionRadios() {
        document
            .querySelectorAll('input[name="crear-contenido-tipo-navegacion"]')
            .forEach(function (input) {
                input.checked = input.value === TIPO_NAVEGACION;
                input.disabled = READONLY;
            });
    }

    function setPanel(next, opts) {
        opts = opts || {};
        var hub = document.getElementById('cc-config-hub');
        var pVis = document.getElementById('cc-config-panel-visibilidad');
        var pPesos = document.getElementById('cc-config-panel-pesos');
        var pNav = document.getElementById('cc-config-panel-navegacion');
        var pImpacto = document.getElementById('cc-config-panel-impacto');
        var title = document.getElementById('cc-config-step-title');
        if (next === 'impacto' && !pImpacto) next = 'hub';
        if (next === 'navegacion' && !pNav) next = 'hub';
        PANEL = next;
        if (next === 'pesos') {
            FORCE_PESOS_EMPTY =
                opts.forcePesosEmpty === true ||
                (!!opts.skipUrl && isPesosEmptyDemoHash(location.hash));
        } else {
            FORCE_PESOS_EMPTY = false;
        }
        if (hub) hub.hidden = next !== 'hub';
        if (pVis) pVis.hidden = next !== 'visibilidad';
        if (pPesos) pPesos.hidden = next !== 'pesos';
        if (pNav) pNav.hidden = next !== 'navegacion';
        if (pImpacto) pImpacto.hidden = next !== 'impacto';
        if (title) title.hidden = next !== 'hub';
        if (next === 'hub') refreshHubCards();
        if (next === 'pesos') renderPesosPanel();
        if (next === 'navegacion') syncNavegacionRadios();
        if (
            next === 'impacto' &&
            pImpacto &&
            typeof global.renderEditarContenidoImpactoSettings === 'function'
        ) {
            global.renderEditarContenidoImpactoSettings(
                document.getElementById('cc-config-impacto-mount'),
                READONLY
            );
        }
        if (!opts.skipUrl && typeof history.replaceState === 'function') {
            history.replaceState(null, '', location.pathname + location.search + hashForConfigPanel(next));
        }
    }

    function refreshHubCards() {
        var items = listEvalPages();
        syncPesosForIds(
            items.map(function (i) {
                return i.id;
            })
        );
        var visDesc = document.getElementById('cc-config-card-visibilidad-desc');
        var pesosDesc = document.getElementById('cc-config-card-pesos-desc');
        var pesosCard = document.getElementById('cc-config-card-pesos');
        var navDesc = document.getElementById('cc-config-card-navegacion-desc');
        var impactoDesc = document.getElementById('cc-config-card-impacto-desc');
        if (visDesc) visDesc.textContent = getVisibilidadSummary();
        if (pesosDesc) pesosDesc.textContent = formatPesosSummary(items);
        if (navDesc) navDesc.textContent = TIPO_NAVEGACION_LABEL[TIPO_NAVEGACION] || 'Lineal';
        if (impactoDesc && typeof global.getEditarContenidoImpactoSummary === 'function') {
            impactoDesc.textContent = global.getEditarContenidoImpactoSummary();
        }
        if (pesosCard) {
            var visibleIds = items
                .filter(function (i) {
                    return !i.hidden;
                })
                .map(function (i) {
                    return i.id;
                });
            var warn = visibleIds.length >= 2 && !isPesosComplete(visibleIds);
            pesosCard.classList.toggle('cc-config-hub-card--warn', warn);
        }
    }

    function renderPesosPanel() {
        var mount = document.getElementById('cc-config-pesos-mount');
        if (!mount) return;
        var items = FORCE_PESOS_EMPTY ? [] : listEvalPages();
        syncPesosForItems(items);
        if (!items.length) {
            mount.innerHTML =
                '<div class="cc-config-pesos-empty" id="cc-config-pesos-empty"></div>';
            var emptyHost = document.getElementById('cc-config-pesos-empty');
            if (emptyHost && typeof global.loadEmptyState === 'function') {
                global.loadEmptyState(emptyHost, {
                    icon: 'fa-clipboard-list-check',
                    title: 'Aún no hay evaluaciones',
                    description:
                        'Agrega evaluaciones en Recursos. Cuando exista al menos una, aquí verás su peso en la nota final.',
                    iconSize: 'md'
                });
            } else if (emptyHost) {
                emptyHost.innerHTML =
                    '<p class="ubits-body-md-regular">Aún no hay evaluaciones. Agrégalas en Recursos.</p>';
            }
            return;
        }
        var visible = items.filter(function (i) {
            return !i.hidden;
        });
        var canEdit = !READONLY && visible.length >= 2;
        var intro =
            visible.length === 0
                ? 'Todas las evaluaciones están ocultas. Muéstralas en Recursos para asignar pesos.'
                : visible.length === 1
                  ? 'Con una sola evaluación visible, el peso es automáticamente el 100% de la nota final. Las ocultas quedan en 0%.'
                  : 'Asigna el porcentaje de cada evaluación visible. Las ocultas quedan en 0%.';
        var ids = visible.map(function (i) {
            return i.id;
        });
        var total = sumPesos(ids);
        var complete = isPesosComplete(ids);
        var totalTone = visible.length < 2 ? 'neutral' : complete ? 'ok' : total === 0 ? 'neutral' : 'error';
        var barWidth = Math.max(0, Math.min(100, total));
        var totalHtml =
            visible.length >= 2
                ? '<div class="cc-config-pesos-total-block" aria-live="polite">' +
                  '<span class="ubits-body-sm-regular">El total debe ser 100%. Llevas</span>' +
                  '<strong class="ubits-heading-h2 cc-config-pesos-total-num' +
                  (totalTone === 'ok' ? ' cc-config-pesos-total-num--ok' : '') +
                  (totalTone === 'error' ? ' cc-config-pesos-total-num--error' : '') +
                  '">' +
                  total +
                  '</strong>' +
                  '<span class="ubits-heading-h2">/100</span>' +
                  '</div>'
                : '';
        var barHtml = '';
        if (visible.length >= 2 && typeof global.progressBarHtml === 'function') {
            barHtml = global.progressBarHtml({
                value: barWidth,
                size: 'lg',
                rounded: true,
                track: 'subtle',
                ariaLabel: 'Total de pesos de evaluación',
                autoComplete: totalTone === 'ok',
                className: totalTone === 'error' ? 'cc-config-pesos-bar--error' : ''
            });
        }
        var rows = items
            .map(function (it, index) {
                var isHidden = !!it.hidden;
                var val = isHidden ? 0 : parseInt(PESOS[it.id], 10) || 0;
                var ocultaLabel = 'Oculta';
                if (isHidden && it.hiddenSinceIso && typeof global.formatDateDDMmmAAAA === 'function') {
                    var fl = global.formatDateDDMmmAAAA(it.hiddenSinceIso);
                    if (fl) ocultaLabel = 'Oculta · ' + fl;
                }
                var tagHtml = isHidden
                    ? '<span class="ubits-status-tag ubits-status-tag--neutral ubits-status-tag--xs ubits-status-tag--icon-left" aria-label="' +
                      escapeHtml(ocultaLabel) +
                      '">' +
                      '<i class="far fa-eye-slash" aria-hidden="true"></i>' +
                      '<span class="ubits-status-tag__text">' +
                      escapeHtml(ocultaLabel) +
                      '</span></span>'
                    : '';
                return (
                    '<li class="cc-config-pesos-row' +
                    (isHidden ? ' cc-config-pesos-row--hidden' : '') +
                    '">' +
                    '<div class="cc-config-pesos-row__main">' +
                    '<span class="ubits-body-sm-regular cc-config-pesos-row__index" aria-hidden="true">' +
                    (index + 1) +
                    '</span>' +
                    '<div class="cc-config-pesos-row__text">' +
                    '<p class="ubits-body-md-bold cc-config-pesos-row__label">' +
                    escapeHtml(it.title) +
                    '</p>' +
                    tagHtml +
                    '</div></div>' +
                    '<div class="cc-config-pesos-row__input">' +
                    '<input type="number" class="ubits-input ubits-input--sm" min="0" max="100" ' +
                    (canEdit && !isHidden ? '' : 'disabled ') +
                    'value="' +
                    val +
                    '" data-cc-peso-input="' +
                    escapeHtml(it.id) +
                    '" aria-label="Peso de ' +
                    escapeHtml(it.title) +
                    '" />' +
                    '<span class="cc-config-pesos-row__suffix" aria-hidden="true">%</span>' +
                    '</div></li>'
                );
            })
            .join('');
        mount.innerHTML =
            '<div class="cc-config-pesos-body">' +
            '<div class="cc-config-pesos-header">' +
            '<p class="ubits-body-sm-regular cc-config-pesos-intro">' +
            escapeHtml(intro) +
            '</p>' +
            totalHtml +
            '</div>' +
            barHtml +
            '<ul class="cc-config-pesos-list">' +
            '<li class="cc-config-pesos-list-head" aria-hidden="true">' +
            '<span class="ubits-body-xs-regular cc-config-pesos-list-head__label">Evaluación</span>' +
            '<span class="ubits-body-xs-regular cc-config-pesos-list-head__peso">Peso</span>' +
            '</li>' +
            rows +
            '</ul></div>';

        mount.querySelectorAll('[data-cc-peso-input]').forEach(function (input) {
            input.addEventListener('input', function () {
                var id = input.getAttribute('data-cc-peso-input');
                var n = parseInt(input.value, 10);
                if (isNaN(n)) n = 0;
                if (n < 0) n = 0;
                if (n > 100) n = 100;
                PESOS[id] = n;
                renderPesosPanel();
            });
        });
    }

    function wireOnce() {
        if (wired) return;
        var step = document.getElementById('crear-contenido-step-publicacion');
        if (!step || !document.getElementById('cc-config-hub')) return;
        wired = true;

        var cardVis = document.getElementById('cc-config-card-visibilidad');
        var cardPesos = document.getElementById('cc-config-card-pesos');
        var cardNav = document.getElementById('cc-config-card-navegacion');
        var cardImpacto = document.getElementById('cc-config-card-impacto');
        var backVis = document.getElementById('cc-config-back-visibilidad');
        var backPesos = document.getElementById('cc-config-back-pesos');
        var backNav = document.getElementById('cc-config-back-navegacion');
        var backImpacto = document.getElementById('cc-config-back-impacto');

        if (cardVis) {
            cardVis.addEventListener('click', function () {
                setPanel('visibilidad');
            });
            cardVis.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPanel('visibilidad');
                }
            });
        }
        if (cardPesos) {
            cardPesos.addEventListener('click', function () {
                setPanel('pesos');
            });
            cardPesos.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPanel('pesos');
                }
            });
        }
        if (cardNav) {
            cardNav.addEventListener('click', function () {
                setPanel('navegacion');
            });
            cardNav.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPanel('navegacion');
                }
            });
        }
        if (cardImpacto) {
            cardImpacto.addEventListener('click', function () {
                setPanel('impacto');
            });
            cardImpacto.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPanel('impacto');
                }
            });
        }
        if (backVis) backVis.addEventListener('click', function () { setPanel('hub'); });
        if (backPesos) backPesos.addEventListener('click', function () { setPanel('hub'); });
        if (backNav) backNav.addEventListener('click', function () { setPanel('hub'); });
        if (backImpacto) backImpacto.addEventListener('click', function () { setPanel('hub'); });

        document.addEventListener('change', function (e) {
            var t = e.target;
            if (!t || !t.name) return;
            if (
                t.name === 'crear-contenido-visibilidad' ||
                t.name === 'editar-contenido-visibilidad'
            ) {
                if (PANEL === 'hub') refreshHubCards();
            }
            if (t.name === 'crear-contenido-tipo-navegacion') {
                if (t.value === 'lineal' || t.value === 'libre') {
                    TIPO_NAVEGACION = t.value;
                    if (PANEL === 'hub') refreshHubCards();
                }
            }
        });
    }

    function initConfiguracionHub(options) {
        options = options || {};
        READONLY = !!options.readonly;
        if (options.tipoNavegacion === 'lineal' || options.tipoNavegacion === 'libre') {
            TIPO_NAVEGACION = options.tipoNavegacion;
        }
        wireOnce();
        syncNavegacionRadios();
        var panel =
            options.panel != null
                ? options.panel
                : panelFromConfigHash(location.hash) || 'hub';
        var forceEmpty =
            options.forcePesosEmpty === true || isPesosEmptyDemoHash(location.hash);
        setPanel(panel, {
            skipUrl: !!options.skipUrl || forceEmpty,
            forcePesosEmpty: forceEmpty,
        });
        refreshHubCards();
    }

    function showConfiguracionHub() {
        setPanel('hub');
        refreshHubCards();
    }

    function getEvalPesosMap() {
        var items = listEvalPages();
        syncPesosForItems(items);
        var out = {};
        items.forEach(function (it) {
            out[it.id] = it.hidden ? 0 : parseInt(PESOS[it.id], 10) || 0;
        });
        return out;
    }

    function areEvalPesosValidForPublish() {
        var items = listEvalPages();
        syncPesosForItems(items);
        var ids = items
            .filter(function (i) {
                return !i.hidden;
            })
            .map(function (i) {
                return i.id;
            });
        return isPesosComplete(ids);
    }

    function openPesosPanelIfInvalid() {
        var items = listEvalPages();
        syncPesosForItems(items);
        var ids = items
            .filter(function (i) {
                return !i.hidden;
            })
            .map(function (i) {
                return i.id;
            });
        if (ids.length >= 2 && !isPesosComplete(ids)) {
            setPanel('pesos');
            return true;
        }
        return false;
    }

    function refreshPesosFromRecursos() {
        refreshHubCards();
        if (PANEL === 'pesos') renderPesosPanel();
    }

    function getTipoNavegacion() {
        return TIPO_NAVEGACION === 'libre' ? 'libre' : 'lineal';
    }

    function setTipoNavegacion(value) {
        if (value === 'lineal' || value === 'libre') {
            TIPO_NAVEGACION = value;
            syncNavegacionRadios();
            if (PANEL === 'hub') refreshHubCards();
        }
    }

    global.initCrearContenidoConfiguracionHub = initConfiguracionHub;
    global.showCrearContenidoConfiguracionHub = showConfiguracionHub;
    global.getCrearContenidoEvalPesos = getEvalPesosMap;
    global.areCrearContenidoEvalPesosValid = areEvalPesosValidForPublish;
    global.openCrearContenidoPesosIfInvalid = openPesosPanelIfInvalid;
    global.refreshCrearContenidoConfigHub = refreshHubCards;
    global.ccConfigRefreshPesos = refreshPesosFromRecursos;
    global.hashForCrearContenidoConfigPanel = hashForConfigPanel;
    global.panelFromCrearContenidoConfigHash = panelFromConfigHash;
    global.isPesosEmptyDemoHash = isPesosEmptyDemoHash;
    global.isLegacyCrearContenidoConfigHash = isLegacyConfigHash;
    global.setCrearContenidoConfigPanel = setPanel;
    global.getCrearContenidoTipoNavegacion = getTipoNavegacion;
    global.setCrearContenidoTipoNavegacion = setTipoNavegacion;
})(typeof window !== 'undefined' ? window : this);
