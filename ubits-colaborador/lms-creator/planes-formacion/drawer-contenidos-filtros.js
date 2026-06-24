/**
 * Modal de filtros del catálogo en drawer «Agregar asignación» / «Editar contenidos».
 * Mismos criterios que u-corporativa.html + filtro de catálogo (UBITS / propio).
 */
(function (window) {
    'use strict';

    function createEmptyFilters() {
        return { tipo: '', categoriaId: '', nivelId: '', idioma: '', catalogo: '' };
    }

    function cloneFilters(f) {
        f = f || {};
        return {
            tipo: f.tipo || '',
            categoriaId: f.categoriaId || '',
            nivelId: f.nivelId || '',
            idioma: f.idioma || '',
            catalogo: f.catalogo || ''
        };
    }

    function hasActiveFilters(f) {
        f = f || {};
        return !!(f.tipo || f.categoriaId || f.nivelId || f.idioma || f.catalogo);
    }

    function getAppliedCount(f) {
        f = f || {};
        var n = 0;
        if (f.tipo) n++;
        if (f.categoriaId) n++;
        if (f.nivelId) n++;
        if (f.idioma) n++;
        if (f.catalogo) n++;
        return n;
    }

    function cursoPassesFilters(curso, f) {
        f = f || {};
        if (f.catalogo === 'ubits' && curso.courseSource !== 'ubits') return false;
        if (f.catalogo === 'empresa' && curso.courseSource !== 'empresa') return false;
        if (f.tipo && (curso.type || '') !== f.tipo) return false;
        if (f.categoriaId && (curso.categoriaFiqshaId || '') !== f.categoriaId) return false;
        if (f.nivelId && (curso.nivelId || '') !== f.nivelId) return false;
        if (f.idioma && String(curso.language || '').trim() !== f.idioma) return false;
        return true;
    }

    function filterCursosBySearchAndFilters(cursos, searchQ, f) {
        var q = (searchQ || '').trim().toLowerCase();
        return (cursos || []).filter(function (c) {
            if (!cursoPassesFilters(c, f)) return false;
            if (!q) return true;
            return (
                (c.title && c.title.toLowerCase().includes(q)) ||
                (c.competency && c.competency.toLowerCase().includes(q)) ||
                (c.categoria && String(c.categoria).toLowerCase().includes(q)) ||
                (c.type && c.type.toLowerCase().includes(q)) ||
                (c.level && c.level.toLowerCase().includes(q))
            );
        });
    }

    function getFilterBadgeHost(btn) {
        if (!btn) return null;
        var wrap = btn.closest('.drawer-cursos-filtros-btn-wrap');
        return wrap || btn;
    }

    function resolveFilterDomId(idPrefix, suffix) {
        if (idPrefix) return idPrefix + '-' + suffix;
        return 'drawer-' + suffix;
    }

    function escapeHtmlChip(t) {
        if (t == null) return '';
        return String(t)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function resolveCategoriaNombre(id) {
        var catRoot = window.BD_MASTER_CATEGORIAS_FIQSHA;
        if (!id || !catRoot || !Array.isArray(catRoot.categorias)) return id || '';
        var found = catRoot.categorias.find(function (c) { return c && String(c.id) === String(id); });
        return (found && found.nombre) ? found.nombre : id;
    }

    function resolveNivelNombre(id) {
        var nivRoot = window.BD_MASTER_NIVELES_CONTENIDO;
        if (!id || !nivRoot || !Array.isArray(nivRoot.niveles)) return id || '';
        var found = nivRoot.niveles.find(function (n) { return n && String(n.id) === String(id); });
        return (found && found.nombre) ? found.nombre : id;
    }

    /** Etiqueta corta solo para chips de filtros aplicados (el modal conserva textos largos). */
    function resolveCatalogoChipLabel(val) {
        if (val === 'ubits') return 'UBITS';
        if (val === 'empresa') return 'propio';
        return val || '';
    }

    function filtrosAplicadosSectionHtml(idPrefix) {
        var wrapId = resolveFilterDomId(idPrefix, 'cursos-filtros-aplicados');
        var chipsId = resolveFilterDomId(idPrefix, 'cursos-filtros-chips-container');
        var clearId = resolveFilterDomId(idPrefix, 'cursos-clear-filters-btn');
        return (
            '<div class="drawer-filtros-aplicados widget-filtros-aplicados" id="' +
            wrapId +
            '" style="display:none" aria-live="polite">' +
            '<span class="ubits-body-sm-regular">Filtros aplicados:</span>' +
            '<div class="filtros-chips-container" id="' +
            chipsId +
            '"></div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs" id="' +
            clearId +
            '" aria-label="Limpiar todos los filtros">' +
            '<i class="far fa-filter-slash"></i><span>Limpiar filtros</span></button>' +
            '</div>'
        );
    }

    function ensureFiltrosAplicadosDom(overlay, idPrefix) {
        if (!overlay) return;
        var wrapId = resolveFilterDomId(idPrefix, 'cursos-filtros-aplicados');
        if (overlay.querySelector('#' + wrapId)) return;
        var btnId = resolveFilterDomId(idPrefix, 'cursos-filter-btn');
        var filterBtn = overlay.querySelector('#' + btnId);
        var anchor =
            overlay.querySelector('#' + resolveFilterDomId(idPrefix, 'cursos-toolbar')) ||
            (filterBtn ? filterBtn.closest('.drawer-cursos-search-row') : null);
        if (anchor) anchor.insertAdjacentHTML('afterend', filtrosAplicadosSectionHtml(idPrefix));
    }

    function renderFiltrosAplicados(options) {
        options = options || {};
        var overlay = options.overlay;
        var idPrefix = options.idPrefix != null ? options.idPrefix : 'drawer-wiz';
        if (!overlay) return;
        ensureFiltrosAplicadosDom(overlay, idPrefix);

        var f = cloneFilters(options.filters);
        var columnFilters = options.columnFilters || null;
        var columnFilterLabels = options.columnFilterLabels || { tipo: 'Tipo', level: 'Nivel', provider: 'Proveedor' };
        var wrapId = resolveFilterDomId(idPrefix, 'cursos-filtros-aplicados');
        var chipsId = resolveFilterDomId(idPrefix, 'cursos-filtros-chips-container');
        var clearId = resolveFilterDomId(idPrefix, 'cursos-clear-filters-btn');
        var wrap = overlay.querySelector('#' + wrapId);
        var chipsCont = overlay.querySelector('#' + chipsId);
        var clearBtn = overlay.querySelector('#' + clearId);
        if (!wrap || !chipsCont) return;

        var chips = [];
        if (f.catalogo) {
            chips.push({
                kind: 'modal',
                key: 'catalogo',
                label: 'Catálogo',
                value: resolveCatalogoChipLabel(f.catalogo)
            });
        }
        if (f.tipo) {
            chips.push({ kind: 'modal', key: 'tipo', label: 'Tipo', value: f.tipo });
        }
        if (f.categoriaId) {
            chips.push({
                kind: 'modal',
                key: 'categoriaId',
                label: 'Categoría',
                value: resolveCategoriaNombre(f.categoriaId)
            });
        }
        if (f.nivelId) {
            chips.push({
                kind: 'modal',
                key: 'nivelId',
                label: 'Nivel',
                value: resolveNivelNombre(f.nivelId)
            });
        }
        if (f.idioma) {
            chips.push({ kind: 'modal', key: 'idioma', label: 'Idioma', value: f.idioma });
        }
        if (columnFilters) {
            Object.keys(columnFilterLabels).forEach(function (colKey) {
                (columnFilters[colKey] || []).forEach(function (val) {
                    chips.push({
                        kind: 'column',
                        colKey: colKey,
                        label: columnFilterLabels[colKey],
                        value: val
                    });
                });
            });
        }

        function notifyChange(next) {
            if (options.filterBtn) {
                updateFilterButtonBadge(
                    options.filterBtn,
                    next,
                    options.badgeId || (options.filterBtn.id ? options.filterBtn.id + '-badge' : 'drawer-cursos-filter-badge')
                );
            }
            if (typeof options.onFiltersChange === 'function') options.onFiltersChange(cloneFilters(next));
        }

        if (chips.length === 0) {
            wrap.style.display = 'none';
            chipsCont.innerHTML = '';
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        wrap.style.display = 'flex';
        if (clearBtn) clearBtn.style.display = '';
        chipsCont.innerHTML = chips
            .map(function (chip, index) {
                var full = chip.label + ': ' + chip.value;
                var labelVal = full.replace(/"/g, '&quot;');
                return (
                    '<span class="ubits-chip ubits-chip--xs ubits-chip--close drawer-contenidos-filtro-chip" data-chip-index="' +
                    index +
                    '" data-tooltip="' +
                    labelVal +
                    '">' +
                    '<span class="ubits-chip__text">' +
                    escapeHtmlChip(full) +
                    '</span>' +
                    '<button type="button" class="ubits-chip__close" data-chip-index="' +
                    index +
                    '" aria-label="Quitar filtro"><i class="far fa-times"></i></button></span>'
                );
            })
            .join('');

        chipsCont.querySelectorAll('.ubits-chip__close').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(btn.getAttribute('data-chip-index'), 10);
                if (isNaN(idx) || !chips[idx]) return;
                var chip = chips[idx];
                if (chip.kind === 'column') {
                    if (typeof options.onColumnFilterRemove === 'function') {
                        options.onColumnFilterRemove(chip.colKey, chip.value);
                    }
                    return;
                }
                var next = cloneFilters(f);
                next[chip.key] = '';
                notifyChange(next);
            });
        });

        if (clearBtn) {
            clearBtn.onclick = function (e) {
                e.preventDefault();
                if (typeof options.onColumnFiltersClear === 'function') options.onColumnFiltersClear();
                notifyChange(createEmptyFilters());
            };
        }

        if (typeof initTooltip === 'function') {
            initTooltip('#' + chipsId + ' .ubits-chip[data-tooltip]');
        }
    }

    function updateFilterButtonBadge(btn, f, badgeId) {
        if (!btn) return;
        var host = getFilterBadgeHost(btn);
        var c = getAppliedCount(f);
        var bid = badgeId || (btn.id ? btn.id + '-badge' : 'drawer-cursos-filter-badge');
        var badge = document.getElementById(bid);
        if (c <= 0) {
            if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
            btn.classList.remove('ubits-button--active');
            btn.setAttribute('aria-label', 'Filtrar');
            return;
        }
        if (!badge) {
            badge = document.createElement('span');
            badge.id = bid;
            badge.className = 'ubits-attention-badge ubits-attention-badge--sm ubits-attention-badge--error';
            host.appendChild(badge);
        } else if (badge.parentNode !== host) {
            host.appendChild(badge);
        }
        badge.textContent = String(c);
        badge.classList.toggle('ubits-attention-badge--circle', c >= 1 && c <= 9);
        btn.classList.add('ubits-button--active');
        btn.setAttribute(
            'aria-label',
            'Filtrar (' + c + ' ' + (c === 1 ? 'filtro aplicado' : 'filtros aplicados') + ')'
        );
    }

    function filterButtonHtml(btnId) {
        return (
            '<span class="drawer-cursos-filtros-btn-wrap">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ubits-toolbar-panel__filter-btn drawer-cursos-filtros-btn" id="' +
            btnId +
            '" data-tooltip="Filtrar" data-tooltip-delay="1000" aria-label="Filtrar"><i class="far fa-filter"></i></button>' +
            '</span>'
        );
    }

    function openFiltrosModal(activeFilters, onApply, modalOverlayId) {
        if (typeof openModal !== 'function' || typeof createInput !== 'function') {
            if (typeof showToast === 'function') {
                showToast('error', 'Carga modal.js e input.js para usar filtros.');
            }
            return;
        }
        var DCF = window.DrawerContenidosFiltros;
        var pending = cloneFilters(activeFilters);
        var overlayId = modalOverlayId || 'drawer-contenidos-filtros-modal';
        var tiposRoot = window.BD_MASTER_TIPOS_CONTENIDO;
        var catRoot = window.BD_MASTER_CATEGORIAS_FIQSHA;
        var nivRoot = window.BD_MASTER_NIVELES_CONTENIDO;

        var selectTipos = [{ value: '', text: 'Todos los tipos' }];
        if (tiposRoot && Array.isArray(tiposRoot.tipos)) {
            tiposRoot.tipos.forEach(function (t) {
                if (t && t.nombre) selectTipos.push({ value: t.nombre, text: t.nombre });
            });
        }
        var selectCat = [{ value: '', text: 'Todas las categorías' }];
        if (catRoot && Array.isArray(catRoot.categorias)) {
            catRoot.categorias.forEach(function (c) {
                if (c && c.id) selectCat.push({ value: c.id, text: c.nombre || c.id });
            });
        }
        var selectNiv = [{ value: '', text: 'Todos los niveles' }];
        if (nivRoot && Array.isArray(nivRoot.niveles)) {
            nivRoot.niveles.forEach(function (n) {
                if (n && n.id) selectNiv.push({ value: n.id, text: n.nombre || n.id });
            });
        }
        var selectIdioma = [
            { value: '', text: 'Todos los idiomas' },
            { value: 'Español', text: 'Español' },
            { value: 'Inglés', text: 'Inglés' },
            { value: 'Portugués', text: 'Portugués' }
        ];
        var selectCatalogo = [
            { value: '', text: 'Todos los catálogos' },
            { value: 'ubits', text: 'Solo catálogo UBITS' },
            { value: 'empresa', text: 'Solo catálogo propio' }
        ];

        var fieldId = function (key) {
            return overlayId + '-field-' + key;
        };

        var bodyHtml =
            '<div class="ucorp-filtros-modal-fields drawer-contenidos-filtros-modal-fields">' +
            '<div id="' + fieldId('tipo') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('categoria') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('nivel') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('idioma') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('catalogo') + '" class="ucorp-filtros-modal-field"></div>' +
            '</div>';

        var overlay = openModal({
            overlayId: overlayId,
            title: 'Filtros',
            bodyHtml: bodyHtml,
            size: 'sm',
            closeOnOverlayClick: true,
            footerTertiary: {
                text: 'Borrar filtros',
                onClick: function () {
                    var cleared = createEmptyFilters();
                    if (typeof closeModal === 'function') closeModal(overlayId);
                    if (typeof onApply === 'function') onApply(cleared);
                }
            },
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' +
                overlayId +
                '-aplicar"><span>Aplicar</span></button>'
        });

        if (overlay) {
            overlay.classList.add('drawer-contenidos-filtros-modal');
        }
        var tertiaryBtn = overlay ? overlay.querySelector('#' + overlayId + '-footer-tertiary') : null;
        if (tertiaryBtn) {
            tertiaryBtn.classList.remove('ubits-button--tertiary');
            tertiaryBtn.classList.add('ubits-button--secondary');
        }

        function bindPending(key, val) {
            pending[key] = val != null ? String(val) : '';
        }

        createInput({
            containerId: fieldId('tipo'),
            type: 'select',
            label: '',
            placeholder: 'Tipo de contenido',
            size: 'md',
            selectOptions: selectTipos,
            value: pending.tipo,
            onChange: function (v) { bindPending('tipo', v); }
        });
        createInput({
            containerId: fieldId('categoria'),
            type: 'select',
            label: '',
            placeholder: 'Categoría',
            size: 'md',
            selectOptions: selectCat,
            value: pending.categoriaId,
            onChange: function (v) { bindPending('categoriaId', v); }
        });
        createInput({
            containerId: fieldId('nivel'),
            type: 'select',
            label: '',
            placeholder: 'Nivel',
            size: 'md',
            selectOptions: selectNiv,
            value: pending.nivelId,
            onChange: function (v) { bindPending('nivelId', v); }
        });
        createInput({
            containerId: fieldId('idioma'),
            type: 'select',
            label: '',
            placeholder: 'Idioma',
            size: 'md',
            selectOptions: selectIdioma,
            value: pending.idioma,
            onChange: function (v) { bindPending('idioma', v); }
        });
        createInput({
            containerId: fieldId('catalogo'),
            type: 'select',
            label: '',
            placeholder: 'Catálogo',
            size: 'md',
            selectOptions: selectCatalogo,
            value: pending.catalogo,
            onChange: function (v) { bindPending('catalogo', v); }
        });

        var aplicarBtn = document.getElementById(overlayId + '-aplicar');
        if (aplicarBtn) {
            aplicarBtn.addEventListener('click', function () {
                if (typeof closeModal === 'function') closeModal(overlayId);
                if (typeof onApply === 'function') onApply(cloneFilters(pending));
            });
        }
    }

    function wireFilterButton(filterBtn, getFilters, setFilters, onApply, modalOverlayId, chipCtx) {
        if (!filterBtn || !window.DrawerContenidosFiltros) return;
        var DCF = window.DrawerContenidosFiltros;
        var badgeId = filterBtn.id ? filterBtn.id + '-badge' : 'drawer-cursos-filter-badge';

        function applyFilters(newFilters) {
            var next = cloneFilters(newFilters);
            setFilters(next);
            DCF.updateFilterButtonBadge(filterBtn, next, badgeId);
            if (chipCtx && chipCtx.overlay) {
                DCF.renderFiltrosAplicados({
                    overlay: chipCtx.overlay,
                    idPrefix: chipCtx.idPrefix != null ? chipCtx.idPrefix : 'drawer-wiz',
                    filters: next,
                    filterBtn: filterBtn,
                    badgeId: badgeId,
                    onFiltersChange: function (updated) {
                        applyFilters(updated);
                        if (typeof onApply === 'function') onApply(updated);
                    }
                });
            }
            if (typeof onApply === 'function') onApply(next);
        }

        applyFilters(getFilters());
        filterBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            DCF.openFiltrosModal(getFilters(), function (newFilters) {
                applyFilters(newFilters);
            }, modalOverlayId);
        });
        if (typeof initTooltip === 'function') {
            initTooltip('#' + filterBtn.id);
        }
    }

    window.DrawerContenidosFiltros = {
        createEmptyFilters: createEmptyFilters,
        cloneFilters: cloneFilters,
        hasActiveFilters: hasActiveFilters,
        getAppliedCount: getAppliedCount,
        cursoPassesFilters: cursoPassesFilters,
        filterCursosBySearchAndFilters: filterCursosBySearchAndFilters,
        updateFilterButtonBadge: updateFilterButtonBadge,
        filterButtonHtml: filterButtonHtml,
        openFiltrosModal: openFiltrosModal,
        wireFilterButton: wireFilterButton,
        resolveFilterDomId: resolveFilterDomId,
        filtrosAplicadosSectionHtml: filtrosAplicadosSectionHtml,
        ensureFiltrosAplicadosDom: ensureFiltrosAplicadosDom,
        renderFiltrosAplicados: renderFiltrosAplicados
    };
})(window);
