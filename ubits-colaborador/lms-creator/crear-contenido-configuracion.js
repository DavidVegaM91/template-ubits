/**
 * Paso Configuración — hub Visibilidad + Pesos de evaluación (crear / editar contenido).
 * Depende de: createInput (opcional), empty-state, toast.
 */
(function (global) {
    'use strict';

    var PANEL = 'hub'; // hub | visibilidad | pesos
    var PESOS = {}; // pageKey -> number
    var READONLY = false;
    var wired = false;

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
        var prevIds = Object.keys(PESOS).sort();
        var nextIds = ids.slice().sort();
        var same =
            prevIds.length === nextIds.length &&
            prevIds.every(function (id, i) {
                return id === nextIds[i];
            });
        if (!same) {
            PESOS = redistributeEqual(ids);
            return;
        }
        if (ids.length === 1) {
            PESOS = {};
            PESOS[ids[0]] = 100;
            return;
        }
        var missing = false;
        ids.forEach(function (id) {
            if (PESOS[id] == null) missing = true;
        });
        if (missing) PESOS = redistributeEqual(ids);
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
                }
            }
            // También revisar primaryType en estado de recursos
            var st = global.CC_RECURSOS_PAGE_STATE && global.CC_RECURSOS_PAGE_STATE[pk];
            if (st && String(st.primaryType || '') === 'evaluacion-final') {
                /* keep */
            }
            items.push({ id: pk, title: title });
        });
        // Orden del índice si hay mount
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
        if (!items.length) return 'Sin evaluaciones en este contenido.';
        if (items.length === 1) return 'Automático · 100%';
        var ids = items.map(function (i) {
            return i.id;
        });
        var sum = sumPesos(ids);
        if (sum !== 100) return 'Incompleto · ' + sum + '% de 100%';
        return items
            .map(function (it) {
                return it.title + ' (' + (parseInt(PESOS[it.id], 10) || 0) + '%)';
            })
            .join(' · ');
    }

    function hashForConfigPanel(panel) {
        if (panel === 'visibilidad') return '#configuracion-visibilidad';
        if (panel === 'pesos') return '#configuracion-pesos';
        return '#configuracion';
    }

    function panelFromConfigHash(hash) {
        var h = String(hash || '');
        if (h === '#configuracion-visibilidad' || h === 'configuracion-visibilidad') return 'visibilidad';
        if (h === '#configuracion-pesos' || h === 'configuracion-pesos') return 'pesos';
        if (
            h === '#configuracion' ||
            h === 'configuracion' ||
            h === '#visibilidad' ||
            h === 'visibilidad' ||
            h === '#publicacion' ||
            h === 'publicacion'
        ) {
            return 'hub';
        }
        return null;
    }

    function setPanel(next, opts) {
        opts = opts || {};
        PANEL = next;
        var hub = document.getElementById('cc-config-hub');
        var pVis = document.getElementById('cc-config-panel-visibilidad');
        var pPesos = document.getElementById('cc-config-panel-pesos');
        var title = document.getElementById('cc-config-step-title');
        if (hub) hub.hidden = next !== 'hub';
        if (pVis) pVis.hidden = next !== 'visibilidad';
        if (pPesos) pPesos.hidden = next !== 'pesos';
        if (title) title.hidden = next !== 'hub';
        if (next === 'hub') refreshHubCards();
        if (next === 'pesos') renderPesosPanel();
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
        if (visDesc) visDesc.textContent = getVisibilidadSummary();
        if (pesosDesc) pesosDesc.textContent = formatPesosSummary(items);
        if (pesosCard) {
            var ids = items.map(function (i) {
                return i.id;
            });
            var warn = items.length >= 2 && !isPesosComplete(ids);
            pesosCard.classList.toggle('cc-config-hub-card--warn', warn);
        }
    }

    function renderPesosPanel() {
        var mount = document.getElementById('cc-config-pesos-mount');
        if (!mount) return;
        var items = listEvalPages();
        syncPesosForIds(
            items.map(function (i) {
                return i.id;
            })
        );
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
        var canEdit = !READONLY && items.length >= 2;
        var intro =
            items.length === 1
                ? 'Con una sola evaluación, el peso es automáticamente el 100% de la nota final.'
                : 'Asigna el porcentaje de cada evaluación.';
        var ids = items.map(function (i) {
            return i.id;
        });
        var total = sumPesos(ids);
        var complete = isPesosComplete(ids);
        var totalTone = items.length < 2 ? 'neutral' : complete ? 'ok' : total === 0 ? 'neutral' : 'error';
        var barWidth = Math.max(0, Math.min(100, total));
        var totalHtml =
            items.length >= 2
                ? '<div class="cc-config-pesos-total-block" aria-live="polite">' +
                  '<span class="ubits-body-md-regular">El total debe ser 100%. Llevas</span>' +
                  '<strong class="ubits-heading-h2 cc-config-pesos-total-num' +
                  (totalTone === 'ok' ? ' cc-config-pesos-total-num--ok' : '') +
                  (totalTone === 'error' ? ' cc-config-pesos-total-num--error' : '') +
                  '">' +
                  total +
                  '</strong>' +
                  '<span class="ubits-heading-h2">/100</span>' +
                  '</div>'
                : '';
        var barHtml =
            items.length >= 2
                ? '<div class="cc-config-pesos-bar" aria-hidden="true">' +
                  '<div class="cc-config-pesos-bar__fill' +
                  (totalTone === 'ok' ? ' cc-config-pesos-bar__fill--ok' : '') +
                  (totalTone === 'error' ? ' cc-config-pesos-bar__fill--error' : '') +
                  '" style="width:' +
                  barWidth +
                  '%"></div></div>'
                : '';
        var rows = items
            .map(function (it, index) {
                var val = parseInt(PESOS[it.id], 10) || 0;
                return (
                    '<li class="cc-config-pesos-row">' +
                    '<div class="cc-config-pesos-row__main">' +
                    '<span class="ubits-body-sm-regular cc-config-pesos-row__index" aria-hidden="true">' +
                    (index + 1) +
                    '</span>' +
                    '<p class="ubits-body-md-bold cc-config-pesos-row__label">' +
                    escapeHtml(it.title) +
                    '</p></div>' +
                    '<div class="cc-config-pesos-row__input">' +
                    '<input type="number" class="ubits-input ubits-input--sm" min="0" max="100" ' +
                    (canEdit ? '' : 'disabled ') +
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
            '<p class="ubits-body-md-regular cc-config-pesos-intro">' +
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
        var backVis = document.getElementById('cc-config-back-visibilidad');
        var backPesos = document.getElementById('cc-config-back-pesos');

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
        if (backVis) backVis.addEventListener('click', function () { setPanel('hub'); });
        if (backPesos) backPesos.addEventListener('click', function () { setPanel('hub'); });

        document.addEventListener('change', function (e) {
            var t = e.target;
            if (!t || !t.name) return;
            if (
                t.name === 'crear-contenido-visibilidad' ||
                t.name === 'editar-contenido-visibilidad'
            ) {
                if (PANEL === 'hub') refreshHubCards();
            }
        });
    }

    function initConfiguracionHub(options) {
        options = options || {};
        READONLY = !!options.readonly;
        wireOnce();
        var panel =
            options.panel != null
                ? options.panel
                : panelFromConfigHash(location.hash) || 'hub';
        setPanel(panel, { skipUrl: !!options.skipUrl });
        refreshHubCards();
    }

    function showConfiguracionHub() {
        setPanel('hub');
        refreshHubCards();
    }

    function getEvalPesosMap() {
        var items = listEvalPages();
        syncPesosForIds(
            items.map(function (i) {
                return i.id;
            })
        );
        var out = {};
        items.forEach(function (it) {
            out[it.id] = parseInt(PESOS[it.id], 10) || 0;
        });
        return out;
    }

    function areEvalPesosValidForPublish() {
        var items = listEvalPages();
        var ids = items.map(function (i) {
            return i.id;
        });
        syncPesosForIds(ids);
        return isPesosComplete(ids);
    }

    function openPesosPanelIfInvalid() {
        var items = listEvalPages();
        var ids = items.map(function (i) {
            return i.id;
        });
        if (ids.length >= 2 && !isPesosComplete(ids)) {
            setPanel('pesos');
            return true;
        }
        return false;
    }

    global.initCrearContenidoConfiguracionHub = initConfiguracionHub;
    global.showCrearContenidoConfiguracionHub = showConfiguracionHub;
    global.getCrearContenidoEvalPesos = getEvalPesosMap;
    global.areCrearContenidoEvalPesosValid = areEvalPesosValidForPublish;
    global.openCrearContenidoPesosIfInvalid = openPesosPanelIfInvalid;
    global.refreshCrearContenidoConfigHub = refreshHubCards;
    global.hashForCrearContenidoConfigPanel = hashForConfigPanel;
    global.panelFromCrearContenidoConfigHash = panelFromConfigHash;
    global.setCrearContenidoConfigPanel = setPanel;
})(typeof window !== 'undefined' ? window : this);
