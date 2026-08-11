/**
 * Modal de filtros del catálogo en drawer «Agregar asignación» / «Editar contenidos».
 * Mismos criterios que u-corporativa.html + filtro de catálogo (UBITS / propio).
 */
(function (window) {
    'use strict';

    function createEmptyFilters() {
        return {
            tipo: '',
            categoriaId: '',
            nivelId: '',
            idioma: '',
            catalogo: '',
            competenciaId: '',
            habilidadId: '',
            aliadoId: '',
            experto: '',
            nivelIngles: '',
            conCertificacion: ''
        };
    }

    function cloneFilters(f) {
        f = f || {};
        return {
            tipo: f.tipo || '',
            categoriaId: f.categoriaId || '',
            nivelId: f.nivelId || '',
            idioma: f.idioma || '',
            catalogo: f.catalogo || '',
            competenciaId: f.competenciaId || '',
            habilidadId: f.habilidadId || '',
            aliadoId: f.aliadoId || '',
            experto: f.experto || '',
            nivelIngles: f.nivelIngles || '',
            conCertificacion: f.conCertificacion || ''
        };
    }

    function hasActiveFilters(f) {
        f = f || {};
        return !!(
            f.tipo ||
            f.categoriaId ||
            f.nivelId ||
            f.idioma ||
            f.catalogo ||
            f.competenciaId ||
            f.habilidadId ||
            f.aliadoId ||
            f.experto ||
            f.nivelIngles ||
            f.conCertificacion === 'si'
        );
    }

    function getAppliedCount(f) {
        f = f || {};
        var n = 0;
        if (f.tipo) n++;
        if (f.categoriaId) n++;
        if (f.nivelId) n++;
        if (f.idioma) n++;
        if (f.catalogo) n++;
        if (f.competenciaId) n++;
        if (f.habilidadId) n++;
        if (f.aliadoId) n++;
        if (f.experto) n++;
        if (f.nivelIngles) n++;
        if (f.conCertificacion === 'si') n++;
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
        if (f.competenciaId && (curso.competenciaPrincipalId || '') !== f.competenciaId) return false;
        if (f.habilidadId && (curso.habilidadPrincipalId || '') !== f.habilidadId) return false;
        if (f.aliadoId) {
            var aid = curso.aliadoId || curso.proveedorAliadoId || '';
            if (String(aid) !== String(f.aliadoId)) return false;
        }
        if (f.experto && String(curso.experto || '').trim() !== f.experto) return false;
        if (f.nivelIngles && String(curso.nivelIngles || '').trim() !== f.nivelIngles) return false;
        if (f.conCertificacion === 'si' && !curso.conCertificacion) return false;
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
                (c.level && c.level.toLowerCase().includes(q)) ||
                (c.habilidad && String(c.habilidad).toLowerCase().includes(q)) ||
                (c.experto && String(c.experto).toLowerCase().includes(q)) ||
                (c.aliado && String(c.aliado).toLowerCase().includes(q)) ||
                (c.catalogoLabel && String(c.catalogoLabel).toLowerCase().includes(q))
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

    function resolveCompetenciaNombre(id) {
        var root = window.BD_MASTER_COMPETENCIAS;
        if (!id || !root || !Array.isArray(root.competencias)) return id || '';
        var found = root.competencias.find(function (c) { return c && String(c.id) === String(id); });
        return (found && found.nombre) ? found.nombre : id;
    }

    function resolveHabilidadNombre(id) {
        var root = window.BD_MASTER_HABILIDADES;
        if (!id || !root || !Array.isArray(root.habilidades)) return id || '';
        var found = root.habilidades.find(function (h) { return h && String(h.id) === String(id); });
        return (found && found.nombre) ? found.nombre : id;
    }

    function resolveAliadoNombre(id) {
        var root = window.BD_MASTER_ALIADOS;
        if (!id || !root || !Array.isArray(root.aliados)) return id || '';
        var found = root.aliados.find(function (a) { return a && String(a.id) === String(id); });
        return (found && found.nombre) ? found.nombre : id;
    }

    /** Etiqueta corta solo para chips de filtros aplicados (el modal conserva textos largos). */
    function resolveCatalogoChipLabel(val) {
        if (val === 'ubits') return 'Catálogo UBITS';
        if (val === 'empresa') return 'Catálogo Fiqsha';
        return val || '';
    }

    function resolveCertificacionChipLabel(val) {
        if (val === 'si') return 'Sí';
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
        var columnFilterLabels = options.columnFilterLabels || {
            tipo: 'Tipo',
            level: 'Nivel',
            aliado: 'Aliado',
            catalogo: 'Catálogo',
            competenciaCategoria: 'Competencia / Categoría',
            habilidad: 'Habilidad',
            experto: 'Experto',
            idioma: 'Idioma',
            nivelIngles: 'Nivel de inglés',
            certificacion: 'Con certificación'
        };
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
        if (f.competenciaId) {
            chips.push({
                kind: 'modal',
                key: 'competenciaId',
                label: 'Competencia',
                value: resolveCompetenciaNombre(f.competenciaId)
            });
        }
        if (f.habilidadId) {
            chips.push({
                kind: 'modal',
                key: 'habilidadId',
                label: 'Habilidad',
                value: resolveHabilidadNombre(f.habilidadId)
            });
        }
        if (f.aliadoId) {
            chips.push({
                kind: 'modal',
                key: 'aliadoId',
                label: 'Aliado',
                value: resolveAliadoNombre(f.aliadoId)
            });
        }
        if (f.experto) {
            chips.push({ kind: 'modal', key: 'experto', label: 'Experto', value: f.experto });
        }
        if (f.nivelIngles) {
            chips.push({ kind: 'modal', key: 'nivelIngles', label: 'Nivel de inglés', value: f.nivelIngles });
        }
        if (f.conCertificacion === 'si') {
            chips.push({
                kind: 'modal',
                key: 'conCertificacion',
                label: 'Con certificación',
                value: resolveCertificacionChipLabel(f.conCertificacion)
            });
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
            { value: 'ubits', text: 'Catálogo UBITS' },
            { value: 'empresa', text: 'Catálogo Fiqsha' }
        ];
        var compRoot = window.BD_MASTER_COMPETENCIAS;
        var habRoot = window.BD_MASTER_HABILIDADES;
        var aliRoot = window.BD_MASTER_ALIADOS;
        var selectComp = [{ value: '', text: 'Todas las competencias' }];
        if (compRoot && Array.isArray(compRoot.competencias)) {
            compRoot.competencias.forEach(function (c) {
                if (c && c.id) selectComp.push({ value: c.id, text: c.nombre || c.id });
            });
        }
        var selectHab = [{ value: '', text: 'Todas las habilidades' }];
        if (habRoot && Array.isArray(habRoot.habilidades)) {
            habRoot.habilidades.forEach(function (h) {
                if (h && h.id) selectHab.push({ value: h.id, text: h.nombre || h.id });
            });
        }
        var selectAliado = [{ value: '', text: 'Todos los aliados' }];
        if (aliRoot && Array.isArray(aliRoot.aliados)) {
            aliRoot.aliados.forEach(function (a) {
                if (a && a.id) selectAliado.push({ value: a.id, text: a.nombre || a.id });
            });
        }
        var expertoSet = {};
        (window.CATALOGO_CURSOS_DRAWER || []).forEach(function (c) {
            if (c && c.experto) expertoSet[String(c.experto).trim()] = true;
        });
        var selectExperto = [{ value: '', text: 'Todos los expertos' }];
        Object.keys(expertoSet)
            .sort(function (a, b) { return a.localeCompare(b, 'es'); })
            .forEach(function (name) {
                selectExperto.push({ value: name, text: name });
            });
        var selectNivelIngles = [
            { value: '', text: 'Todos los niveles de inglés' },
            { value: 'A1', text: 'A1' },
            { value: 'A2', text: 'A2' },
            { value: 'B1', text: 'B1' },
            { value: 'B2', text: 'B2' },
            { value: 'C1', text: 'C1' },
            { value: 'C2', text: 'C2' }
        ];

        var fieldId = function (key) {
            return overlayId + '-field-' + key;
        };

        var bodyHtml =
            '<div class="ucorp-filtros-modal-fields drawer-contenidos-filtros-modal-fields">' +
            '<div id="' + fieldId('catalogo') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('tipo') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('competencia') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('habilidad') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('categoria') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('aliado') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('nivel') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('experto') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('idioma') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('nivelIngles') + '" class="ucorp-filtros-modal-field"></div>' +
            '<div id="' + fieldId('conCertificacion') + '" class="ucorp-filtros-modal-field"></div>' +
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
            containerId: fieldId('catalogo'),
            type: 'select',
            label: '',
            placeholder: 'Catálogo',
            size: 'md',
            selectOptions: selectCatalogo,
            value: pending.catalogo,
            onChange: function (v) { bindPending('catalogo', v); }
        });
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
            containerId: fieldId('competencia'),
            type: 'select',
            label: '',
            placeholder: 'Competencia',
            size: 'md',
            selectOptions: selectComp,
            value: pending.competenciaId,
            onChange: function (v) { bindPending('competenciaId', v); }
        });
        createInput({
            containerId: fieldId('habilidad'),
            type: 'select',
            label: '',
            placeholder: 'Habilidad',
            size: 'md',
            selectOptions: selectHab,
            value: pending.habilidadId,
            onChange: function (v) { bindPending('habilidadId', v); }
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
            containerId: fieldId('aliado'),
            type: 'select',
            label: '',
            placeholder: 'Aliado',
            size: 'md',
            selectOptions: selectAliado,
            value: pending.aliadoId,
            onChange: function (v) { bindPending('aliadoId', v); }
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
            containerId: fieldId('experto'),
            type: 'select',
            label: '',
            placeholder: 'Experto',
            size: 'md',
            selectOptions: selectExperto,
            value: pending.experto,
            onChange: function (v) { bindPending('experto', v); }
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
            containerId: fieldId('nivelIngles'),
            type: 'select',
            label: '',
            placeholder: 'Nivel de inglés',
            size: 'md',
            selectOptions: selectNivelIngles,
            value: pending.nivelIngles,
            onChange: function (v) { bindPending('nivelIngles', v); }
        });

        var certSwitchId = overlayId + '-switch-conCertificacion';
        var certField = document.getElementById(fieldId('conCertificacion'));
        if (certField) {
            certField.className = 'ucorp-filtros-modal-field drawer-contenidos-filtro-switch-field';
            var certChecked = pending.conCertificacion === 'si';
            certField.innerHTML =
                '<label class="ubits-switch ubits-switch--md" for="' +
                certSwitchId +
                '">' +
                '<input type="checkbox" class="ubits-switch__input" id="' +
                certSwitchId +
                '" role="switch" aria-checked="' +
                (certChecked ? 'true' : 'false') +
                '" aria-label="Con certificación"' +
                (certChecked ? ' checked' : '') +
                '>' +
                '<span class="ubits-switch__track" aria-hidden="true"><span class="ubits-switch__thumb"></span></span>' +
                '<span class="ubits-switch__label ubits-body-md-regular">Con certificación</span>' +
                '</label>';
            var certInput = document.getElementById(certSwitchId);
            if (certInput) {
                certInput.addEventListener('change', function () {
                    pending.conCertificacion = certInput.checked ? 'si' : '';
                    certInput.setAttribute('aria-checked', certInput.checked ? 'true' : 'false');
                });
            }
        }

        var aplicarBtn = document.getElementById(overlayId + '-aplicar');
        if (aplicarBtn) {
            aplicarBtn.addEventListener('click', function () {
                var certInputApply = document.getElementById(certSwitchId);
                if (certInputApply) {
                    pending.conCertificacion = certInputApply.checked ? 'si' : '';
                }
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
