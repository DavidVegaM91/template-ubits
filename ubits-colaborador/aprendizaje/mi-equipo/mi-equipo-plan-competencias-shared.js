/**
 * Mi equipo — lógica compartida para planes de competencias (drawers, catálogo, helpers).
 */
(function (global) {
    'use strict';

    function escapeDrawerHtml(t) {
        if (t == null) return '';
        return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeHtmlAttr(t) {
        if (t == null) return '';
        return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getCompetenciasImageBase() {
        return '../../../images/imagenes competencias/';
    }

    function refreshCatalogo() {
        if (typeof global.refreshCatalogoCompetenciasDrawer === 'function') {
            global.refreshCatalogoCompetenciasDrawer();
        }
        return {
            catalogo: (global.CATALOGO_COMPETENCIAS_DRAWER || []).slice(),
            imageMap: global.COMPETENCIA_IMAGE_MAP || {},
            iconMap: global.HABILIDAD_ICON_MAP || {}
        };
    }

    function getUsernameColaborador(c) {
        if (c.username) return c.username;
        var palabras = (c.nombre || '').toLowerCase().split(' ').filter(function (p) { return p.length > 0; });
        var iniciales = palabras.map(function (p) { return p.charAt(0); }).join('');
        return iniciales ? iniciales + '@fiqsha.demo' : 'user@fiqsha.demo';
    }

    function getColaboradoresDisponiblesMiEquipo() {
        var DPC = global.DrawerParticipantesColabTable;
        if (typeof global.getMiEquipoColaboradoresParaDrawer === 'function') {
            var raw = global.getMiEquipoColaboradoresParaDrawer();
            if (DPC && typeof DPC.mapEmpleadoParaDrawerColab === 'function') {
                return raw.map(function (e, idx) { return DPC.mapEmpleadoParaDrawerColab(e, idx); });
            }
            return raw;
        }
        var subs = typeof global.getMiEquipoSubordinadosDirectos === 'function' ? global.getMiEquipoSubordinadosDirectos() : [];
        return subs.map(function (c, idx) {
            return DPC ? DPC.mapEmpleadoParaDrawerColab(c, idx) : c;
        });
    }

    function renderCompetenciaProgressBlock(progress, status) {
        var value = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
        var isComplete = status === 'completed' || status === 'complete';
        if (typeof global.progressBarHtml === 'function') {
            return '<div class="drawer-competencia-card-progress"' + (isComplete ? ' data-status="completed"' : '') + '>' +
                global.progressBarHtml({
                    value: value,
                    size: 'sm',
                    rounded: false,
                    track: 'static',
                    status: isComplete ? 'complete' : undefined,
                    autoComplete: status === 'completed' || status === 'complete',
                    ariaLabel: 'Progreso de competencia'
                }) + '</div>';
        }
        return '<div class="drawer-competencia-card-progress"><span class="ubits-body-sm-regular">' + value + '%</span></div>';
    }

    function reorderHabilidadesGridWithAnimation(grid, compId, cursosSeleccionados) {
        var sel = cursosSeleccionados.find(function (x) { return x.id === compId; });
        if (!sel || !sel.habilidades) return;
        var rows = [].slice.call(grid.children);
        if (!rows.length) return;
        var order = sel.habilidades.slice();
        var oldRects = rows.map(function (r) { return r.getBoundingClientRect(); });
        rows.sort(function (a, b) {
            return order.indexOf(a.getAttribute('data-habilidad')) - order.indexOf(b.getAttribute('data-habilidad'));
        });
        rows.forEach(function (r) { grid.appendChild(r); });
        grid.offsetHeight;
        var newRects = rows.map(function (r) { return r.getBoundingClientRect(); });
        rows.forEach(function (r, i) {
            var oldR = oldRects[i];
            var newR = newRects[i];
            if (!oldR || !newR) return;
            r.style.transition = 'none';
            r.style.transform = 'translate(' + (oldR.left - newR.left) + 'px,' + (oldR.top - newR.top) + 'px)';
        });
        requestAnimationFrame(function () {
            rows.forEach(function (r) {
                r.style.transition = 'transform 0.22s ease-out';
                r.style.transform = '';
            });
            requestAnimationFrame(function () {
                setTimeout(function () { rows.forEach(function (r) { r.style.transition = ''; }); }, 230);
            });
        });
    }

    function getDrawerCompetenciasBodyHtml(idPrefix) {
        var p = idPrefix || 'drawer-mi-equipo-comp';
        return '<div class="drawer-agregar-cursos drawer-agregar-cursos--single-col">' +
            '<div class="drawer-agregar-cursos__left">' +
            '  <span class="drawer-agregar-cursos__section-title ubits-body-sm-semibold">Buscar y agregar competencias (máximo 8)</span>' +
            '  <div class="drawer-cursos-search-row">' +
            '    <div id="' + p + '-search-container" class="drawer-cursos-search-input-wrap"></div>' +
            '  </div>' +
            '  <div class="drawer-cursos-resultados-bg drawer-cursos-resultados-bg--dos-columnas">' +
            '    <div id="' + p + '-empty-search" class="drawer-competencias-empty-search-wrap" style="display:none;"></div>' +
            '    <div class="drawer-competencias-cards-grid" id="' + p + '-cards-container"></div>' +
            '  </div>' +
            '</div></div>';
    }

    function initDrawerCompetenciasEditor(overlay, opts) {
        opts = opts || {};
        var idPrefix = opts.idPrefix || 'drawer-mi-equipo-comp';
        var cat = refreshCatalogo();
        var catalogoCompetencias = cat.catalogo;
        var competenciaImageMap = cat.imageMap;
        var habilidadIconMap = cat.iconMap;
        var imageBase = getCompetenciasImageBase();
        var cursosSeleccionados = (opts.initialSelection || []).map(function (c) {
            return {
                id: c.id,
                title: c.title || c.nombre || c.id,
                nombre: c.nombre || c.title,
                habilidades: (c.habilidades || []).slice(),
                habilidadesDesactivadas: (c.habilidadesDesactivadas || []).slice(),
                progress: c.progress,
                status: c.status
            };
        });
        var maxItems = opts.maxItems != null ? opts.maxItems : 8;

        var searchWrapId = idPrefix + '-search-container';
        var searchWrap = overlay.querySelector('#' + searchWrapId);
        if (searchWrap) searchWrap.innerHTML = '';
        if (typeof global.createInput === 'function') {
            global.createInput({
                containerId: searchWrapId,
                type: 'search',
                placeholder: 'Buscar competencias...',
                size: 'sm',
                showLabel: false
            });
        }
        var searchInput = overlay.querySelector('#' + searchWrapId + ' input');
        var cardsContainer = overlay.querySelector('#' + idPrefix + '-cards-container');
        var emptySearchContainer = overlay.querySelector('#' + idPrefix + '-empty-search');
        var emptySearchId = idPrefix + '-empty-search';

        function getFiltrados() {
            var q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
            if (!q) return catalogoCompetencias.slice();
            return catalogoCompetencias.filter(function (comp) {
                if (comp.nombre && comp.nombre.toLowerCase().includes(q)) return true;
                if (comp.academia && comp.academia.toLowerCase().includes(q)) return true;
                if (comp.habilidades && comp.habilidades.some(function (h) { return h.toLowerCase().includes(q); })) return true;
                return false;
            });
        }

        function buildCardHtml(comp, isSelected, isDisabled) {
            var imgName = competenciaImageMap[comp.nombre] || 'Accountability.jpg';
            var imgPath = imageBase + imgName;
            var selectedItem = cursosSeleccionados.find(function (x) { return x.id === comp.id; });
            var isExpanded = !!selectedItem;
            var desactivadas = (selectedItem && selectedItem.habilidadesDesactivadas) ? selectedItem.habilidadesDesactivadas.slice() : [];
            var baseHabilidades = (selectedItem && selectedItem.habilidades && selectedItem.habilidades.length)
                ? selectedItem.habilidades.slice()
                : (comp.habilidades || []).slice();
            var checkedList = baseHabilidades.filter(function (h) { return desactivadas.indexOf(h) === -1; });
            var uncheckedList = desactivadas.slice();
            var habilidadesOrder = checkedList.concat(uncheckedList);
            var habilidadesHtml = habilidadesOrder.map(function (h, idx) {
                var icon = habilidadIconMap[h] || 'fa-circle';
                var isUnchecked = desactivadas.indexOf(h) !== -1;
                var rowClass = 'drawer-habilidad-row drawer-habilidad-row--draggable' + (isUnchecked ? ' drawer-habilidad-row--unchecked' : '');
                var checkChecked = isUnchecked ? '' : ' checked';
                return '<div class="' + rowClass + '" draggable="' + (isUnchecked ? 'false' : 'true') + '" data-competencia-id="' + escapeDrawerHtml(comp.id) + '" data-habilidad="' + escapeDrawerHtml(h) + '" data-skill-index="' + idx + '" role="button">' +
                    '<span class="drawer-habilidad-drag" aria-hidden="true"><i class="fas fa-grip-vertical"></i></span>' +
                    '<i class="far ' + icon + ' drawer-habilidad-icon"></i>' +
                    '<span class="ubits-body-sm-regular drawer-habilidad-title">' + escapeDrawerHtml(h) + '</span>' +
                    '<label class="ubits-checkbox ubits-checkbox--sm drawer-habilidad-check-wrap" onclick="event.stopPropagation();"><input type="checkbox" class="ubits-checkbox__input drawer-habilidad-check" data-habilidad="' + escapeDrawerHtml(h) + '"' + checkChecked + '><span class="ubits-checkbox__box"><i class="far fa-check"></i></span><span class="ubits-checkbox__label" aria-hidden="true"></span></label></div>';
            }).join('');
            var cardClass = 'drawer-competencia-card competencia-card-v1' + (isSelected ? ' drawer-competencia-card--selected' : '') + (isExpanded ? ' expanded' : '') + (isDisabled ? ' drawer-competencia-card--disabled' : '');
            var checkChecked = isSelected ? ' checked' : '';
            var checkDisabled = isDisabled ? ' disabled' : '';
            return '<div class="drawer-competencia-card-wrapper">' +
                '<div class="' + cardClass + '" data-competencia-id="' + escapeDrawerHtml(comp.id) + '" role="button" tabindex="0">' +
                '<img src="' + escapeDrawerHtml(imgPath) + '" alt="" class="competencia-card-v1-image" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop\'">' +
                '<div class="competencia-card-v1-content">' +
                '<p class="ubits-body-sm-semibold competencia-card-v1-title"><span class="competencia-card-v1-title-text">' + escapeDrawerHtml(comp.nombre) + '</span></p>' +
                '<p class="ubits-body-xs-regular competencia-card-v1-count">' + (comp.habilidades ? comp.habilidades.length : 0) + ' habilidades</p>' +
                '</div>' +
                '<span class="drawer-competencia-card-check">' +
                '<label class="ubits-checkbox ubits-checkbox--sm drawer-competencia-card-checkbox">' +
                '<input type="checkbox" class="ubits-checkbox__input" tabindex="-1"' + checkChecked + checkDisabled + '>' +
                '<span class="ubits-checkbox__box"><i class="far fa-check"></i></span></label></span></div>' +
                '<div class="competencia-habilidades-container drawer-competencias-habilidades' + (isExpanded ? ' is-visible' : '') + '" data-competencia-id="' + escapeDrawerHtml(comp.id) + '">' +
                '<p class="ubits-body-sm-regular drawer-habilidades-copy">Estas son las habilidades de esta competencia. Ordénalas por prioridad para tu equipo.</p>' +
                '<div class="competencias-habilidades-grid">' + habilidadesHtml + '</div></div></div>';
        }

        function filtrarYRenderizarCards() {
            if (!cardsContainer) return;
            var filtrados = getFiltrados();
            var q = (searchInput && searchInput.value) ? searchInput.value.trim() : '';
            if (q && filtrados.length === 0) {
                if (emptySearchContainer) {
                    emptySearchContainer.style.display = 'block';
                    emptySearchContainer.innerHTML = '';
                    if (typeof global.loadEmptyState === 'function') {
                        global.loadEmptyState(emptySearchId, {
                            icon: 'fa-search',
                            iconSize: 'lg',
                            title: 'No se encontraron resultados',
                            description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                            buttons: { secondary: { text: 'Limpiar búsqueda', icon: 'fa-times', onClick: function () {} } }
                        });
                        setTimeout(function () {
                            var btn = emptySearchContainer.querySelector('.ubits-button--secondary');
                            if (btn) {
                                btn.onclick = function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (searchInput) { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); }
                                    filtrarYRenderizarCards();
                                };
                            }
                        }, 50);
                    }
                }
                cardsContainer.style.display = 'none';
                if (typeof opts.onSync === 'function') opts.onSync();
                return;
            }
            if (emptySearchContainer) {
                emptySearchContainer.style.display = 'none';
                emptySearchContainer.innerHTML = '';
            }
            cardsContainer.style.display = '';
            var isMaxReached = cursosSeleccionados.length >= maxItems;
            var columns = [[], [], []];
            filtrados.forEach(function (comp, i) { columns[i % 3].push(comp); });
            cardsContainer.innerHTML = '<div class="drawer-competencias-grid-v1">' + columns.map(function (col) {
                return '<div class="drawer-competencias-column">' + col.map(function (comp) {
                    var isSelected = cursosSeleccionados.some(function (x) { return x.id === comp.id; });
                    return buildCardHtml(comp, isSelected, isMaxReached && !isSelected);
                }).join('') + '</div>';
            }).join('') + '</div>';

            cardsContainer.querySelectorAll('.drawer-competencia-card').forEach(function (cardEl) {
                cardEl.addEventListener('click', function (e) {
                    if (e.target.closest('.drawer-competencia-card-check')) e.preventDefault();
                    var id = cardEl.getAttribute('data-competencia-id');
                    var comp = catalogoCompetencias.find(function (c) { return c.id === id; });
                    if (!comp) return;
                    var idx = cursosSeleccionados.findIndex(function (x) { return x.id === id; });
                    if (idx === -1 && cursosSeleccionados.length >= maxItems) return;
                    if (idx !== -1) cursosSeleccionados.splice(idx, 1);
                    else cursosSeleccionados.push({ id: comp.id, title: comp.nombre, nombre: comp.nombre, habilidades: (comp.habilidades || []).slice(), habilidadesDesactivadas: [] });
                    filtrarYRenderizarCards();
                });
            });
            cardsContainer.querySelectorAll('.drawer-habilidad-row--draggable').forEach(function (rowEl) {
                rowEl.addEventListener('dragstart', function (e) {
                    e.dataTransfer.setData('text/plain', rowEl.getAttribute('data-competencia-id') + '|' + rowEl.getAttribute('data-skill-index'));
                    e.dataTransfer.effectAllowed = 'move';
                });
                rowEl.addEventListener('dragover', function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
                rowEl.addEventListener('drop', function (e) {
                    e.preventDefault();
                    var data = (e.dataTransfer.getData('text/plain') || '').split('|');
                    var compId = data[0];
                    var fromIdx = parseInt(data[1], 10);
                    var toRow = e.currentTarget;
                    var toIdx = parseInt(toRow.getAttribute('data-skill-index'), 10);
                    if (compId !== toRow.getAttribute('data-competencia-id') || isNaN(fromIdx) || isNaN(toIdx) || fromIdx === toIdx) return;
                    var sel = cursosSeleccionados.find(function (x) { return x.id === compId; });
                    if (!sel || !sel.habilidades || !sel.habilidades.length) return;
                    var desactivadas = sel.habilidadesDesactivadas || [];
                    var checkedList = sel.habilidades.filter(function (h) { return desactivadas.indexOf(h) === -1; });
                    var order = checkedList.concat(desactivadas.slice());
                    var item = order.splice(fromIdx, 1)[0];
                    order.splice(toIdx, 0, item);
                    sel.habilidades = order.slice();
                    sel.habilidadesDesactivadas = order.filter(function (h) { return desactivadas.indexOf(h) !== -1; });
                    filtrarYRenderizarCards();
                });
            });
            cardsContainer.querySelectorAll('.drawer-habilidad-check').forEach(function (chk) {
                chk.addEventListener('change', function (e) {
                    e.stopPropagation();
                    var row = chk.closest('.drawer-habilidad-row');
                    if (!row) return;
                    var compId = row.getAttribute('data-competencia-id');
                    var habilidad = chk.getAttribute('data-habilidad');
                    var sel = cursosSeleccionados.find(function (x) { return x.id === compId; });
                    if (!sel) return;
                    sel.habilidadesDesactivadas = sel.habilidadesDesactivadas || [];
                    var desactivadas = sel.habilidadesDesactivadas;
                    var isNowChecked = chk.checked;
                    if (isNowChecked) {
                        var idx = desactivadas.indexOf(habilidad);
                        if (idx !== -1) desactivadas.splice(idx, 1);
                        var idxInH = sel.habilidades.indexOf(habilidad);
                        if (idxInH !== -1) sel.habilidades.splice(idxInH, 1);
                        sel.habilidades.splice(sel.habilidades.length - desactivadas.length, 0, habilidad);
                    } else {
                        desactivadas.push(habilidad);
                        var idxInH2 = sel.habilidades.indexOf(habilidad);
                        if (idxInH2 !== -1) sel.habilidades.splice(idxInH2, 1);
                        sel.habilidades.push(habilidad);
                    }
                    row.classList.toggle('drawer-habilidad-row--unchecked', !isNowChecked);
                    row.draggable = isNowChecked;
                    var grid = row.closest('.competencias-habilidades-grid');
                    if (grid) reorderHabilidadesGridWithAnimation(grid, compId, cursosSeleccionados);
                });
            });
            if (typeof opts.onSync === 'function') opts.onSync();
        }

        if (searchInput) {
            searchInput.addEventListener('input', filtrarYRenderizarCards);
            searchInput.addEventListener('keyup', filtrarYRenderizarCards);
        }
        filtrarYRenderizarCards();

        overlay._miEquipoCompSeleccionados = cursosSeleccionados;
        return {
            getSelection: function () {
                return cursosSeleccionados.map(function (c) {
                    var desactivadas = c.habilidadesDesactivadas || [];
                    return {
                        id: c.id,
                        title: c.title || c.nombre || c.id,
                        nombre: c.nombre || c.title,
                        habilidades: (c.habilidades || []).filter(function (h) { return desactivadas.indexOf(h) === -1; }),
                        progress: c.progress != null ? c.progress : 0,
                        status: c.status || 'default'
                    };
                });
            }
        };
    }

    function openDrawerAgregarCompetencias(opts) {
        opts = opts || {};
        var overlayId = opts.overlayId || 'drawer-agregar-competencias-mi-equipo';
        var idPrefix = opts.idPrefix || 'drawer-mi-equipo-comp';
        var title = opts.title || 'Agregar competencias';
        var footerHtml = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' + idPrefix + '-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' + idPrefix + '-apply"><span>Agregar</span></button>';
        if (typeof global.openDrawer !== 'function') return null;
        global.openDrawer({
            overlayId: overlayId,
            title: title,
            bodyHtml: getDrawerCompetenciasBodyHtml(idPrefix),
            footerHtml: footerHtml,
            size: 'lg',
            onClose: opts.onClose || function () {}
        });
        var overlay = document.getElementById(overlayId);
        if (!overlay) return null;
        var editor = initDrawerCompetenciasEditor(overlay, {
            idPrefix: idPrefix,
            initialSelection: opts.initialSelection || [],
            maxItems: opts.maxItems
        });
        var cancelBtn = overlay.querySelector('#' + idPrefix + '-cancel');
        var applyBtn = overlay.querySelector('#' + idPrefix + '-apply');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                if (typeof global.closeDrawer === 'function') global.closeDrawer(overlayId);
            });
        }
        if (applyBtn) {
            applyBtn.addEventListener('click', function () {
                var sel = editor.getSelection();
                if (typeof global.closeDrawer === 'function') global.closeDrawer(overlayId);
                if (typeof opts.onApply === 'function') opts.onApply(sel);
            });
        }
        return editor;
    }

    function openPanelCompetenciasReadOnly(opts) {
        opts = opts || {};
        var cat = refreshCatalogo();
        var competenciaImageMap = cat.imageMap;
        var imageBase = getCompetenciasImageBase();
        var list = opts.competencias || [];
        var sinProgreso = !!opts.sinProgreso;
        var userName = opts.userName || 'Estudiante';
        var overlayId = opts.overlayId || 'drawer-competencias-estudiante';
        var bodyHtml = '<div class="detalle-plan-panel-competencias"><div class="detalle-plan-drawer-cards-bg">' +
            '<div id="detalle-plan-compact-cards" class="detalle-plan-drawer-cards-grid"></div></div></div>';
        var footerHtml = '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="drawer-competencias-cerrar"><span>Cerrar</span></button>';
        if (typeof global.openDrawer !== 'function') return;
        global.openDrawer({
            overlayId: overlayId,
            title: userName + ' – competencias y progreso',
            bodyHtml: bodyHtml,
            footerHtml: footerHtml,
            size: 'sm',
            onClose: opts.onClose || function () {}
        });
        var overlay = document.getElementById(overlayId);
        if (!overlay) return;
        var compactContainer = overlay.querySelector('#detalle-plan-compact-cards');
        if (compactContainer) {
            compactContainer.innerHTML = list.map(function (c) {
                var progress = sinProgreso ? 0 : (c.progress != null ? c.progress : 0);
                var status = sinProgreso ? 'default' : (c.status || 'default');
                var imgName = competenciaImageMap[c.nombre || c.title] || 'Accountability.jpg';
                var imgPath = imageBase + imgName;
                var nombre = c.title || c.nombre || '';
                var barraHtml = renderCompetenciaProgressBlock(progress, status);
                return '<div class="drawer-competencia-card-wrapper"><div class="drawer-competencia-card competencia-card-v1" data-competencia-id="' + escapeDrawerHtml(c.id) + '">' +
                    '<div class="drawer-competencia-card-row">' +
                    '<img src="' + escapeDrawerHtml(imgPath) + '" alt="" class="competencia-card-v1-image" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop\'">' +
                    '<div class="competencia-card-v1-content">' +
                    '<p class="ubits-body-sm-semibold competencia-card-v1-title"><span class="competencia-card-v1-title-text">' + escapeDrawerHtml(nombre) + '</span></p>' +
                    '<p class="ubits-body-xs-regular competencia-card-v1-count">' + (c.habilidades ? c.habilidades.length : 0) + ' habilidades</p></div>' +
                    '<span class="drawer-competencia-card-check"></span></div>' + barraHtml + '</div></div>';
            }).join('');
        }
        var cerrarBtn = overlay.querySelector('#drawer-competencias-cerrar');
        if (cerrarBtn) {
            cerrarBtn.addEventListener('click', function () {
                if (typeof global.closeDrawer === 'function') global.closeDrawer(overlayId);
                if (typeof opts.onClose === 'function') opts.onClose();
            });
        }
    }

    function getDrawerAgregarAsignacionWizardHtml() {
        var stepperHtml = '<nav id="drawer-wiz-stepper-nav-edit" class="drawer-wizard-stepper-nav" aria-label="Pasos de asignación">' +
            '<ol id="drawer-wiz-stepper-ol-edit" class="ubits-stepper ubits-stepper--horizontal ubits-stepper--horizontal-compact">' +
            '<li class="ubits-stepper__step ubits-stepper__step--active" data-step-label="Participantes">' +
            '<span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">1</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '<span class="ubits-stepper__label">Participantes</span></li>' +
            '<li class="ubits-stepper__rail" aria-hidden="true"></li>' +
            '<li class="ubits-stepper__step ubits-stepper__step--pending" data-step-label="Competencias">' +
            '<span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">2</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '<span class="ubits-stepper__label">Competencias</span></li>' +
            '</ol></nav>';
        var stepParticipantesHtml = '<div id="drawer-wizard-step2" class="drawer-wizard-step drawer-wizard-step--participantes">' +
            '<div class="drawer-usuarios-panel drawer-usuarios-panel--colaborador" id="drawer-usuarios-colaborador-panel" style="display:flex">' +
            '  <div id="drawer-colab-data-table-container" class="drawer-colab-dt-wrapper"></div>' +
            '</div></div>';
        var stepCompetenciasHtml = '<div id="drawer-wizard-step3" class="drawer-wizard-step" style="display:none">' +
            getDrawerCompetenciasBodyHtml('drawer-wiz') +
            '</div>';
        return '<div class="drawer-asignacion-wizard-root">' + stepperHtml + stepParticipantesHtml + stepCompetenciasHtml + '</div>';
    }

    function openDrawerAgregarAsignacionMiEquipo(opts) {
        opts = opts || {};
        var asignacionesData = opts.asignacionesData || [];
        var overlayId = 'drawer-mi-equipo-agregar-asignacion';
        var footerHtml = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="drawer-wiz-btn-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="drawer-wiz-btn-primary" disabled><span>Siguiente</span></button>';
        if (typeof global.openDrawer !== 'function') return;
        global.openDrawer({
            overlayId: overlayId,
            title: 'Agregar asignación',
            bodyHtml: getDrawerAgregarAsignacionWizardHtml(),
            footerHtml: footerHtml,
            size: 'lg',
            onClose: function () {
                var o = document.getElementById(overlayId);
                if (o) {
                    o._wizCompetenciasAttached = false;
                    o._wizCursosSeleccionados = [];
                    o._miEquipoCompSeleccionados = [];
                }
            }
        });
        var overlay = document.getElementById(overlayId);
        if (!overlay) return;

        overlay._wizCompetenciasAttached = false;
        overlay._wizardStep = 1;
        overlay._wizCursosSeleccionados = [];
        overlay._miEquipoCompSeleccionados = [];

        var stepParticipantes = overlay.querySelector('#drawer-wizard-step2');
        var stepCompetencias = overlay.querySelector('#drawer-wizard-step3');
        var stepperOlEdit = overlay.querySelector('#drawer-wiz-stepper-ol-edit');
        var btnPrimary = overlay.querySelector('#drawer-wiz-btn-primary');
        var btnCancel = overlay.querySelector('#drawer-wiz-btn-cancel');
        var DPC = global.DrawerParticipantesColabTable;
        var empleadosDrawer = getColaboradoresDisponiblesMiEquipo();

        function getColaboradoresDisponiblesParaAsignacion() {
            var tomados = {};
            asignacionesData.forEach(function (a) {
                if (a.colaboradorId) tomados[String(a.colaboradorId)] = true;
            });
            return empleadosDrawer.filter(function (e) { return !tomados[String(e.id)]; });
        }

        function setPrimaryLabel(text) {
            if (!btnPrimary) return;
            var sp = btnPrimary.querySelector('span');
            if (sp) sp.textContent = text;
            else btnPrimary.textContent = text;
        }
        function setSecondaryLabel(text) {
            if (!btnCancel) return;
            var sp = btnCancel.querySelector('span');
            if (sp) sp.textContent = text;
            else btnCancel.textContent = text;
        }

        function syncWizardPrimary() {
            if (!btnPrimary) return;
            var ws = overlay._wizardStep || 1;
            if (ws === 1) {
                setPrimaryLabel('Siguiente');
                var ref = overlay._drawerColabTablaRef;
                var dis = !ref || typeof ref.getSelectedIds !== 'function' || ref.getSelectedIds().length === 0;
                btnPrimary.disabled = dis;
                setSecondaryLabel('Cancelar');
            } else {
                setPrimaryLabel('Agregar');
                var sel = overlay._miEquipoCompSeleccionados || [];
                btnPrimary.disabled = sel.length === 0;
                setSecondaryLabel('Anterior');
            }
        }

        function showWizardStep(num) {
            overlay._wizardStep = num;
            if (stepParticipantes) stepParticipantes.style.display = num === 1 ? 'flex' : 'none';
            if (stepCompetencias) stepCompetencias.style.display = num === 2 ? 'block' : 'none';
            if (stepperOlEdit && typeof global.setStepperStepStates === 'function') {
                global.setStepperStepStates(stepperOlEdit, num === 1 ? 0 : 1);
            }
            if (num === 2 && !overlay._wizCompetenciasAttached) {
                overlay._miEquipoCompSeleccionados = [];
                overlay._wizCompEditor = initDrawerCompetenciasEditor(overlay, {
                    idPrefix: 'drawer-wiz',
                    onSync: syncWizardPrimary
                });
                overlay._wizCompetenciasAttached = true;
            }
            syncWizardPrimary();
        }

        var drawerColabContainer = overlay.querySelector('#drawer-colab-data-table-container');
        if (drawerColabContainer && DPC && typeof DPC.createDrawerParticipantesColabDataTable === 'function') {
            overlay._drawerColabTablaRef = DPC.createDrawerParticipantesColabDataTable({
                containerId: 'drawer-colab-data-table-container',
                tableId: 'drawer-mi-equipo-colab-table-wiz',
                getData: function () { return getColaboradoresDisponiblesParaAsignacion(); },
                emptyState: {
                    message: 'No hay colaboradores en tu equipo',
                    icon: 'far fa-user',
                    description: 'No se encontraron reportes directos disponibles para asignar en este plan.'
                },
                i18n: {
                    selectAll: 'Seleccionar todo',
                    deselectAll: 'Deseleccionar todo',
                    verSeleccionados: 'Ver seleccionados',
                    buscar: 'Buscar',
                    buscarPlaceholder: 'Buscar colaborador...'
                }
            });
            drawerColabContainer.addEventListener('change', function (e) {
                if (e.target && e.target.matches && e.target.matches('input[type="checkbox"]')) syncWizardPrimary();
            });
        }

        if (stepParticipantes) stepParticipantes.style.flexDirection = 'column';

        showWizardStep(1);

        if (stepperOlEdit && typeof global.wireDrawerWizardStepperBackNav === 'function') {
            global.wireDrawerWizardStepperBackNav(stepperOlEdit, {
                getCurrentStepIndex: function () { return (overlay._wizardStep || 1) - 1; },
                onGoToStep: function (n) { showWizardStep(n); }
            });
        }

        if (btnPrimary) {
            btnPrimary.onclick = function () {
                var ws = overlay._wizardStep || 1;
                if (ws === 1) {
                    overlay._wizCompetenciasAttached = false;
                    overlay._miEquipoCompSeleccionados = [];
                    showWizardStep(2);
                    return;
                }
                var ref = overlay._drawerColabTablaRef;
                var selectedIds = (ref && typeof ref.getSelectedIds === 'function') ? ref.getSelectedIds() : [];
                var editor = overlay._wizCompEditor;
                var competenciasSel = editor && typeof editor.getSelection === 'function' ? editor.getSelection() : [];
                if (typeof opts.onAdd === 'function') opts.onAdd(selectedIds, competenciasSel);
                if (typeof global.closeDrawer === 'function') global.closeDrawer(overlayId);
            };
        }
        if (btnCancel) {
            btnCancel.onclick = function () {
                var ws = overlay._wizardStep || 1;
                if (ws === 2) {
                    showWizardStep(1);
                    return;
                }
                if (typeof global.closeDrawer === 'function') global.closeDrawer(overlayId);
            };
        }
    }

    function buildAsignacionRowHtmlCompetencias(row) {
        var labelBtn = row.contenidosCount === 0 ? 'Agregar competencias' : String(row.contenidosCount) + ' competencias';
        var competenciasCell = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs js-asignacion-agregar-competencias" data-asignacion-id="' + escapeHtmlAttr(row.id) + '"><i class="far fa-plus"></i><span>' + escapeHtmlAttr(labelBtn) + '</span></button>';
        var avatarUrl = (row.avatar && String(row.avatar).trim()) ? String(row.avatar).replace(/"/g, '&quot;') : '';
        var usuarioCell = '<div class="detalle-plan-usuario-cell">' +
            (avatarUrl
                ? '<span class="ubits-avatar ubits-avatar--sm"><img src="' + avatarUrl + '" alt="' + escapeHtmlAttr(row.nombreUsuario) + '" class="ubits-avatar__img"></span>'
                : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>') +
            '<span class="ubits-body-sm-regular">' + escapeHtmlAttr(row.nombreUsuario) + '</span></div>';
        return '<td data-col="usuario">' + usuarioCell + '</td><td data-col="competencias">' + competenciasCell + '</td>';
    }

    function yyyyMmDdToDdMmYyyy(val) {
        if (!val || typeof val !== 'string') return '';
        var parts = val.trim().split('-');
        if (parts.length !== 3) return val;
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    function ddMmYyyyToYyyyMmDd(val) {
        if (!val || typeof val !== 'string') return '';
        var parts = val.trim().split('/');
        if (parts.length !== 3) return val;
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    }

    function parseDateInput(val) {
        if (!val) return null;
        var parts = String(val).trim().split('-');
        if (parts.length !== 3) {
            parts = String(val).trim().split('/');
            if (parts.length !== 3) return null;
            var y2 = parseInt(parts[2], 10);
            var m2 = parseInt(parts[1], 10) - 1;
            var d2 = parseInt(parts[0], 10);
            var dt2 = new Date(y2, m2, d2);
            return isNaN(dt2.getTime()) ? null : dt2;
        }
        var y = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10) - 1;
        var d = parseInt(parts[2], 10);
        var dt = new Date(y, m, d);
        return isNaN(dt.getTime()) ? null : dt;
    }

    function computeEstadoNuevoPlan(fechaInicioStr) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var inicio = parseDateInput(fechaInicioStr);
        if (!inicio) return 'Planeado';
        inicio.setHours(0, 0, 0, 0);
        if (inicio.getTime() > today.getTime()) return 'Planeado';
        return 'Procesando 0%';
    }

    function buildCompetenciaPorUsuarioFromAsignaciones(asignacionesData) {
        var out = {};
        (asignacionesData || []).forEach(function (a) {
            if (a.colaboradorId) out[String(a.colaboradorId)] = (a.contenidos || []).slice();
        });
        return out;
    }

    function buildDetalleRowsFromPlan(plan) {
        var competenciaPorUsuario = plan.competenciaPorUsuario || {};
        var subs = typeof global.getMiEquipoSubordinadosDirectos === 'function' ? global.getMiEquipoSubordinadosDirectos() : [];
        var byId = {};
        subs.forEach(function (c) { byId[String(c.id || c.idColaborador)] = c; });
        var ultimoAccesoOpciones = ['Hace 2 horas', 'Hace 5 horas', 'Hace 1 día', 'Hace 2 días', 'Hace 3 días', 'Hace 5 días'];
        var rows = [];
        Object.keys(competenciaPorUsuario).forEach(function (cid, idx) {
            var col = byId[String(cid)];
            if (!col) return;
            var comps = competenciaPorUsuario[cid] || [];
            var progreso = 0;
            if (comps.length) {
                var sum = comps.reduce(function (acc, c) { return acc + (c.progress != null ? c.progress : 0); }, 0);
                progreso = Math.round(sum / comps.length);
            }
            rows.push({
                id: String(cid),
                colaboradorId: String(cid),
                usuario: (col.nombre || '').trim(),
                avatar: col.avatar || null,
                ultimoAcceso: ultimoAccesoOpciones[idx % ultimoAccesoOpciones.length],
                ultimaFechaProgreso: plan.fechaFin || '-',
                progreso: progreso,
                contenidosCount: comps.length
            });
        });
        return rows;
    }

    global.MiEquipoPlanCompetenciasShared = {
        escapeDrawerHtml: escapeDrawerHtml,
        escapeHtmlAttr: escapeHtmlAttr,
        getCompetenciasImageBase: getCompetenciasImageBase,
        refreshCatalogo: refreshCatalogo,
        getUsernameColaborador: getUsernameColaborador,
        getColaboradoresDisponiblesMiEquipo: getColaboradoresDisponiblesMiEquipo,
        renderCompetenciaProgressBlock: renderCompetenciaProgressBlock,
        openDrawerAgregarCompetencias: openDrawerAgregarCompetencias,
        openPanelCompetenciasReadOnly: openPanelCompetenciasReadOnly,
        openDrawerAgregarAsignacionMiEquipo: openDrawerAgregarAsignacionMiEquipo,
        buildAsignacionRowHtmlCompetencias: buildAsignacionRowHtmlCompetencias,
        yyyyMmDdToDdMmYyyy: yyyyMmDdToDdMmYyyy,
        ddMmYyyyToYyyyMmDd: ddMmYyyyToYyyyMmDd,
        parseDateInput: parseDateInput,
        computeEstadoNuevoPlan: computeEstadoNuevoPlan,
        buildCompetenciaPorUsuarioFromAsignaciones: buildCompetenciaPorUsuarioFromAsignaciones,
        buildDetalleRowsFromPlan: buildDetalleRowsFromPlan
    };
})(window);
