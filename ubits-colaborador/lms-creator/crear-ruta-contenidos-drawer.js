/**
 * Drawer «Añadir contenidos» — flujo crear-ruta (catálogo UBITS + empresa, sin rutas).
 * Requiere: drawer.js, input.js, dropdown-menu.js, card-content-compact.js, empty-state.js,
 * catalogo-contenidos-drawer.js (+ bd-master).
 */
(function () {
    'use strict';

    var DRAWER_ID = 'crear-ruta-drawer-contenidos';
    var PAGE_SIZE = 12;

    function getCatalogo() {
        if (typeof window.refreshCatalogoContenidosDrawer === 'function') {
            return window.refreshCatalogoContenidosDrawer({ excludeRutas: true });
        }
        return (window.CATALOGO_CURSOS_DRAWER || []).filter(function (c) {
            return c.type !== 'Ruta de aprendizaje';
        });
    }

    function openCrearRutaContenidosDrawer(opts) {
        opts = opts || {};
        var catalogo = getCatalogo();
        var seleccionados = [];
        var filter = 'all';
        var visibleCount = PAGE_SIZE;
        var viewOnlySelected = false;

        function idsYaEnRuta() {
            var ids = opts.alreadyAddedIds || [];
            return ids.map(String);
        }

        function filtrados() {
            var q = '';
            var searchIn = document.querySelector('#' + DRAWER_ID + ' .crear-ruta-drawer-search-input');
            if (searchIn) q = String(searchIn.value || '').trim().toLowerCase();
            var list = catalogo.slice();
            var blocked = idsYaEnRuta();
            list = list.filter(function (c) {
                return blocked.indexOf(String(c.id)) === -1;
            });
            if (filter === 'ubits') list = list.filter(function (c) { return c.courseSource === 'ubits'; });
            else if (filter === 'empresa') list = list.filter(function (c) { return c.courseSource === 'empresa'; });
            if (q) {
                list = list.filter(function (c) {
                    return (c.title || '').toLowerCase().indexOf(q) !== -1;
                });
            }
            if (viewOnlySelected) {
                var selIds = seleccionados.map(function (x) { return String(x.id); });
                list = list.filter(function (c) { return selIds.indexOf(String(c.id)) !== -1; });
            }
            return list;
        }

        function updateFooterBtn() {
            var btn = document.getElementById('crear-ruta-drawer-btn-agregar');
            if (!btn) return;
            var n = seleccionados.length;
            btn.disabled = n === 0;
            btn.setAttribute('aria-disabled', n === 0 ? 'true' : 'false');
            var span = btn.querySelector('span');
            if (span) span.textContent = n > 0 ? 'Agregar (' + n + ')' : 'Agregar';
        }

        function updateVerSeleccionadosBar() {
            var bar = document.getElementById('crear-ruta-drawer-sel-bar');
            var btn = document.getElementById('crear-ruta-drawer-ver-seleccionados');
            if (!bar || !btn) return;
            var n = seleccionados.length;
            var icon = btn.querySelector('i');
            var span = btn.querySelector('span');
            if (n === 0) {
                viewOnlySelected = false;
                bar.classList.remove('is-visible');
                if (icon) icon.className = 'far fa-eye';
                if (span) span.textContent = 'Ver seleccionados';
                btn.classList.remove('ubits-button--active');
                return;
            }
            bar.classList.add('is-visible');
            if (viewOnlySelected) {
                if (icon) icon.className = 'far fa-eye-slash';
                if (span) span.textContent = 'Dejar de ver seleccionados (' + n + ')';
                btn.classList.add('ubits-button--active');
            } else {
                if (icon) icon.className = 'far fa-eye';
                if (span) span.textContent = 'Ver seleccionados (' + n + ')';
                btn.classList.remove('ubits-button--active');
            }
        }

        function renderCards() {
            var overlay = document.getElementById(DRAWER_ID);
            if (!overlay) return;
            var grid = overlay.querySelector('#crear-ruta-drawer-cards');
            var emptyHost = overlay.querySelector('#crear-ruta-drawer-empty-search');
            if (!grid) return;
            var list = filtrados();
            if (!list.length) {
                grid.innerHTML = '';
                grid.style.display = 'none';
                if (emptyHost && typeof window.loadEmptyState === 'function') {
                    emptyHost.style.display = '';
                    var hasQuery = false;
                    var si = overlay.querySelector('.crear-ruta-drawer-search-input');
                    if (si && String(si.value || '').trim()) hasQuery = true;
                    if (viewOnlySelected && seleccionados.length > 0) {
                        window.loadEmptyState('crear-ruta-drawer-empty-search', {
                            icon: 'fa-search',
                            iconSize: 'lg',
                            title: 'No se encontraron resultados',
                            description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                            buttons: {
                                secondary: {
                                    text: 'Limpiar búsqueda',
                                    onClick: function () {
                                        if (si) {
                                            si.value = '';
                                            si.dispatchEvent(new Event('input', { bubbles: true }));
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        window.loadEmptyState('crear-ruta-drawer-empty-search', {
                            icon: hasQuery ? 'fa-search' : 'fa-folder-open',
                            iconSize: 'lg',
                            title: hasQuery ? 'No se encontraron resultados' : 'Sin contenidos disponibles',
                            description: hasQuery
                                ? 'Intenta ajustar tu búsqueda.'
                                : 'No hay más contenidos para añadir o ya están en la ruta.',
                            buttons: hasQuery
                                ? {
                                      secondary: {
                                          text: 'Limpiar búsqueda',
                                          onClick: function () {
                                              if (si) {
                                                  si.value = '';
                                                  si.dispatchEvent(new Event('input', { bubbles: true }));
                                              }
                                          }
                                      }
                                  }
                                : {}
                        });
                    }
                }
                updateVerSeleccionadosBar();
                updateFooterBtn();
                var resultadosPadEmpty = grid.closest('.drawer-cursos-resultados-bg');
                if (typeof window.syncDrawerResultadosScrollPadding === 'function') {
                    window.syncDrawerResultadosScrollPadding(resultadosPadEmpty);
                }
                return;
            }
            if (emptyHost) {
                emptyHost.style.display = 'none';
                emptyHost.innerHTML = '';
            }
            grid.style.display = '';
            var slice = list.slice(0, visibleCount);
            if (typeof window.loadCardContentCompact === 'function') {
                window.loadCardContentCompact('crear-ruta-drawer-cards', slice);
            }
            var cards = grid.querySelectorAll('.course-card-compact');
            cards.forEach(function (cardEl, idx) {
                var course = slice[idx];
                if (!course) return;
                cardEl.style.cursor = 'pointer';
                cardEl.dataset.courseId = course.id;
                var sel = seleccionados.some(function (x) { return String(x.id) === String(course.id); });
                cardEl.classList.toggle('course-card-compact--selected', sel);
            });
            updateVerSeleccionadosBar();
            updateFooterBtn();
            var resultadosPad = grid.closest('.drawer-cursos-resultados-bg');
            if (typeof window.syncDrawerResultadosScrollPadding === 'function') {
                window.syncDrawerResultadosScrollPadding(resultadosPad);
            }
        }

        function alignFilterDropdownToButtonRight(filterOverlayId, filterBtn) {
            var ov = document.getElementById(filterOverlayId);
            var cnt = ov ? ov.querySelector('.ubits-dropdown-menu__content') : null;
            if (!cnt || !filterBtn) return;
            var br = filterBtn.getBoundingClientRect();
            cnt.style.left = 'auto';
            cnt.style.right = window.innerWidth - br.right + 'px';
        }

        function openFilterDropdown(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            var filterBtn = document.getElementById('crear-ruta-drawer-filter-btn');
            if (
                !filterBtn ||
                typeof window.getDropdownMenuHtml !== 'function' ||
                typeof window.openDropdownMenu !== 'function' ||
                typeof window.closeDropdownMenu !== 'function'
            ) {
                return;
            }
            var filterOverlayId = 'crear-ruta-drawer-filter-overlay';
            var existing = document.getElementById(filterOverlayId);
            if (existing) existing.remove();
            document.body.insertAdjacentHTML(
                'beforeend',
                window.getDropdownMenuHtml({
                    overlayId: filterOverlayId,
                    contentId: filterOverlayId + '-content',
                    radioGroup: true,
                    radioName: filterOverlayId + '-radio',
                    options: [
                        { text: 'Todos', value: 'all', selected: filter === 'all' },
                        { text: 'Solo catálogo UBITS', value: 'ubits', selected: filter === 'ubits' },
                        { text: 'Solo catálogo propio', value: 'empresa', selected: filter === 'empresa' }
                    ]
                })
            );
            var filterOverlay = document.getElementById(filterOverlayId);
            if (filterOverlay) {
                filterOverlay.addEventListener('click', function (ev) {
                    if (ev.target === filterOverlay) {
                        window.closeDropdownMenu(filterOverlayId);
                        if (filterOverlay.parentNode) filterOverlay.remove();
                    }
                });
                var content = filterOverlay.querySelector('.ubits-dropdown-menu__content');
                if (content) content.addEventListener('click', function (ev) { ev.stopPropagation(); });
                filterOverlay.querySelectorAll('input[type=radio]').forEach(function (radio) {
                    radio.addEventListener('change', function () {
                        filter = this.value;
                        window.closeDropdownMenu(filterOverlayId);
                        if (filterOverlay.parentNode) filterOverlay.remove();
                        visibleCount = PAGE_SIZE;
                        renderCards();
                    });
                });
            }
            window.openDropdownMenu(filterOverlayId, filterBtn, { alignRight: true });
            alignFilterDropdownToButtonRight(filterOverlayId, filterBtn);
            requestAnimationFrame(function () {
                alignFilterDropdownToButtonRight(filterOverlayId, filterBtn);
            });
        }

        function bindDrawerInteractions() {
            var overlay = document.getElementById(DRAWER_ID);
            if (!overlay || overlay.getAttribute('data-crear-ruta-drawer-bound') === 'true') return;
            overlay.setAttribute('data-crear-ruta-drawer-bound', 'true');

            var grid = overlay.querySelector('#crear-ruta-drawer-cards');
            if (grid) {
                grid.addEventListener('click', function (e) {
                    var card = e.target.closest('.course-card-compact');
                    if (!card || !card.dataset.courseId) return;
                    var course = catalogo.find(function (c) { return String(c.id) === String(card.dataset.courseId); });
                    if (!course) return;
                    var ix = seleccionados.findIndex(function (x) { return String(x.id) === String(course.id); });
                    if (ix !== -1) seleccionados.splice(ix, 1);
                    else seleccionados.push(course);
                    renderCards();
                });
            }

            var resultados = overlay.querySelector('.crear-ruta-drawer-resultados');
            if (resultados) {
                var cardsGrid = overlay.querySelector('#crear-ruta-drawer-cards');
                if (typeof window.observeDrawerResultadosScrollPadding === 'function') {
                    window.observeDrawerResultadosScrollPadding(resultados, cardsGrid);
                }
                resultados.addEventListener('scroll', function () {
                    var el = resultados;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
                        var total = filtrados().length;
                        if (visibleCount < total) {
                            visibleCount += PAGE_SIZE;
                            renderCards();
                        }
                    }
                    if (typeof window.syncDrawerResultadosScrollPadding === 'function') {
                        window.syncDrawerResultadosScrollPadding(el);
                    }
                });
            }

        }

        function onVerSeleccionadosClick() {
            if (!seleccionados.length) return;
            viewOnlySelected = !viewOnlySelected;
            visibleCount = PAGE_SIZE;
            renderCards();
        }

        function confirmAgregar() {
            if (!seleccionados.length) return;
            var items = seleccionados.map(function (c) {
                return Object.assign({}, c);
            });
            if (typeof window.closeDrawer === 'function') {
                window.closeDrawer(DRAWER_ID);
            }
            var agregados = items.length;
            if (typeof opts.onConfirm === 'function') {
                var ret = opts.onConfirm(items);
                if (typeof ret === 'number' && ret >= 0) agregados = ret;
            }
            if (agregados > 0 && typeof window.showToast === 'function') {
                var msg =
                    agregados === 1
                        ? 'Se agregó 1 contenido exitosamente'
                        : 'Se agregaron ' + agregados + ' contenidos exitosamente';
                window.showToast('success', msg, { containerId: 'ubits-toast-container' });
            }
        }

        var bodyHtml =
            '<div class="drawer-agregar-cursos drawer-agregar-cursos--single-col crear-ruta-drawer-body">' +
            '<span class="drawer-agregar-cursos__section-title ubits-body-sm-semibold">Buscar y agregar contenidos</span>' +
            '<div class="drawer-cursos-search-row">' +
            '<div id="crear-ruta-drawer-search-wrap" class="drawer-cursos-search-input-wrap"></div>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" id="crear-ruta-drawer-filter-btn" aria-label="Filtrar por origen" data-tooltip="Filtrar por origen" data-tooltip-delay="1000"><i class="far fa-filter"></i></button>' +
            '</div>' +
            '<div class="drawer-wiz-cursos-action-bar drawer-cursos-action-bar" id="crear-ruta-drawer-sel-bar">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="crear-ruta-drawer-ver-seleccionados">' +
            '<i class="far fa-eye"></i><span>Ver seleccionados</span></button>' +
            '</div>' +
            '<div class="drawer-cursos-resultados-bg crear-ruta-drawer-resultados">' +
            '<div id="crear-ruta-drawer-empty-search" class="drawer-contenidos-empty-search-wrap" style="display:none"></div>' +
            '<div class="drawer-cursos-cards-grid" id="crear-ruta-drawer-cards"></div>' +
            '</div></div>';

        var footerHtml =
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="crear-ruta-drawer-btn-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="crear-ruta-drawer-btn-agregar" disabled aria-disabled="true"><span>Agregar</span></button>';

        if (typeof window.openDrawer !== 'function') return;

        var existing = document.getElementById(DRAWER_ID);
        if (existing) existing.remove();
        existing = null;

        window.openDrawer({
            overlayId: DRAWER_ID,
            title: 'Añadir contenidos',
            bodyHtml: bodyHtml,
            footerHtml: footerHtml,
            size: 'lg',
            onClose: function () {
                var ov = document.getElementById(DRAWER_ID);
                if (ov) ov.removeAttribute('data-crear-ruta-drawer-bound');
            }
        });

        setTimeout(function () {
            var overlay = document.getElementById(DRAWER_ID);
            if (!overlay) return;
            overlay.removeAttribute('data-crear-ruta-drawer-bound');
            if (typeof window.createInput === 'function') {
                window.createInput({
                    containerId: 'crear-ruta-drawer-search-wrap',
                    type: 'search',
                    placeholder: 'Buscar contenido…',
                    size: 'sm',
                    onChange: function () {
                        visibleCount = PAGE_SIZE;
                        renderCards();
                    }
                });
                setTimeout(function () {
                    var inp = overlay.querySelector('#crear-ruta-drawer-search-wrap input');
                    if (inp) inp.classList.add('crear-ruta-drawer-search-input');
                }, 50);
            }
            var cancel = document.getElementById('crear-ruta-drawer-btn-cancel');
            if (cancel) {
                cancel.addEventListener('click', function () {
                    if (typeof window.closeDrawer === 'function') window.closeDrawer(DRAWER_ID);
                });
            }
            var btnAgregar = document.getElementById('crear-ruta-drawer-btn-agregar');
            if (btnAgregar) {
                btnAgregar.addEventListener('click', confirmAgregar);
            }
            var btnVerSel = document.getElementById('crear-ruta-drawer-ver-seleccionados');
            if (btnVerSel) {
                btnVerSel.addEventListener('click', onVerSeleccionadosClick);
            }
            var filterBtn = document.getElementById('crear-ruta-drawer-filter-btn');
            if (filterBtn) {
                filterBtn.addEventListener('click', openFilterDropdown);
            }
            bindDrawerInteractions();
            renderCards();
            if (typeof window.initTooltip === 'function') {
                window.initTooltip('#' + DRAWER_ID + ' [data-tooltip]');
            }
        }, 80);
    }

    window.openCrearRutaContenidosDrawer = openCrearRutaContenidosDrawer;
})();
