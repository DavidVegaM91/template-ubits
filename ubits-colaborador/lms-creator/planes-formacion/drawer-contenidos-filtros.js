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

    function wireFilterButton(filterBtn, getFilters, setFilters, onApply, modalOverlayId) {
        if (!filterBtn || !window.DrawerContenidosFiltros) return;
        var DCF = window.DrawerContenidosFiltros;
        var badgeId = filterBtn.id ? filterBtn.id + '-badge' : 'drawer-cursos-filter-badge';
        DCF.updateFilterButtonBadge(filterBtn, getFilters(), badgeId);
        filterBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            DCF.openFiltrosModal(getFilters(), function (newFilters) {
                setFilters(newFilters);
                DCF.updateFilterButtonBadge(filterBtn, newFilters, badgeId);
                if (typeof onApply === 'function') onApply(newFilters);
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
        wireFilterButton: wireFilterButton
    };
})(window);
