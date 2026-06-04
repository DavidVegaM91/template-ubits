/**
 * Paso Visibilidad — crear ruta (LMS Creator).
 * Borrador: selección directa. Público, Privado y Oculto: modal de confirmación antes de aplicar.
 * Privado: botón «Seleccionar colaboradores» + drawer de usuarios.
 */
(function () {
    'use strict';

    var MODAL_PUBLICAR = 'cr-visibilidad-modal-publicar';
    var MODAL_OCULTAR = 'cr-visibilidad-modal-ocultar';
    var DRAWER_COLAB_OVERLAY_ID = 'cr-visibilidad-drawer-colaboradores';

    var VISIBILIDAD_META = {
        borrador: { label: 'Borrador', modifier: 'info' },
        publico: { label: 'Público', modifier: 'success' },
        privado: { label: 'Privado', modifier: 'warning' },
        oculto: { label: 'Oculto', modifier: 'neutral' }
    };

    var currentVisibilidad = 'borrador';
    var borradorLocked = false;
    var privadoColabBtnEnabled = false;
    var privadoColaboradores = [];
    var wired = false;
    var privadoColabBtnWired = false;

    function isPublishedVisibilidad(value) {
        return value === 'publico' || value === 'privado' || value === 'oculto';
    }

    function getBorradorCard() {
        var group = getVisibilidadGroup();
        return group ? group.querySelector('[data-visibilidad="borrador"]') : null;
    }

    function setBorradorCardDisabled(disabled) {
        var card = getBorradorCard();
        if (!card) return;
        var input = card.querySelector('.ubits-radio__input');
        card.classList.toggle('ubits-selection-card--disabled', disabled);
        if (input) input.disabled = disabled;
        card.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    }

    function lockBorradorSelection() {
        borradorLocked = true;
        setBorradorCardDisabled(true);
    }

    function getVisibilidadGroup() {
        return document.querySelector('.publicacion-paso__cards');
    }

    function setRadioChecked(value) {
        var group = getVisibilidadGroup();
        if (!group) return;
        group.querySelectorAll('input[name="crear-ruta-visibilidad"]').forEach(function (radio) {
            radio.checked = radio.value === value;
        });
    }

    function updateHeaderVisibilidadTag(value) {
        var tag = document.getElementById('crear-ruta-visibilidad-header-tag');
        if (!tag) return;
        var meta = VISIBILIDAD_META[value] || VISIBILIDAD_META.borrador;
        tag.className =
            'ubits-status-tag ubits-status-tag--sm ubits-status-tag--' + meta.modifier;
        var textEl = tag.querySelector('.ubits-status-tag__text');
        if (textEl) textEl.textContent = meta.label;
    }

    function applyVisibilidad(value) {
        if (!VISIBILIDAD_META[value]) return;
        currentVisibilidad = value;
        setRadioChecked(value);
        updateHeaderVisibilidadTag(value);
        if (isPublishedVisibilidad(value)) {
            lockBorradorSelection();
        }
        syncPrivadoColabButton();
    }

    function escapeHtmlVisibilidad(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getUsernameEmpleado(e) {
        if (e.username) return e.username;
        var palabras = (e.nombre || '').toLowerCase().split(' ').filter(function (p) {
            return p.length > 0;
        });
        var iniciales = palabras
            .map(function (p) {
                return p.charAt(0);
            })
            .join('');
        return iniciales ? iniciales + '@fiqsha.demo' : 'user@fiqsha.demo';
    }

    function getPrivadoColabButton() {
        return document.getElementById('cr-visibilidad-privado-colab-btn');
    }

    function updatePrivadoColabButtonLabel() {
        var btn = getPrivadoColabButton();
        if (!btn) return;
        var count = privadoColaboradores.length;
        var labelSpan = btn.querySelector('span');
        if (!labelSpan) return;
        if (count > 0) {
            labelSpan.textContent = 'Editar selección (' + count + ')';
        } else {
            labelSpan.textContent = 'Seleccionar colaboradores';
        }
    }

    function syncPrivadoColabButton() {
        var btn = getPrivadoColabButton();
        if (!btn) return;
        var show = currentVisibilidad === 'privado' && privadoColabBtnEnabled;
        btn.hidden = !show;
        btn.setAttribute('aria-hidden', show ? 'false' : 'true');
        if (show) {
            updatePrivadoColabButtonLabel();
        }
    }

    function buildDrawerColabRowHtml(row) {
        var avatarUrl =
            row.avatar && String(row.avatar).trim()
                ? String(row.avatar).replace(/"/g, '&quot;')
                : '';
        var usuarioCell =
            '<div class="detalle-plan-usuario-cell">' +
            (avatarUrl
                ? '<span class="ubits-avatar ubits-avatar--sm"><img src="' +
                  avatarUrl +
                  '" alt="' +
                  escapeHtmlVisibilidad(row.nombre) +
                  '" class="ubits-avatar__img"></span>'
                : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>') +
            '<span class="ubits-body-sm-regular">' +
            escapeHtmlVisibilidad(row.nombre) +
            '</span></div>';
        return (
            '<td data-col="username"><span class="ubits-body-sm-regular">' +
            escapeHtmlVisibilidad(row.username) +
            '</span></td>' +
            '<td data-col="nombre">' +
            usuarioCell +
            '</td>' +
            '<td data-col="correo"><span class="ubits-body-sm-regular">' +
            escapeHtmlVisibilidad(row.correo) +
            '</span></td>' +
            '<td data-col="area"><span class="ubits-body-sm-regular">' +
            escapeHtmlVisibilidad(row.area) +
            '</span></td>' +
            '<td data-col="lider"><span class="ubits-body-sm-regular">' +
            escapeHtmlVisibilidad(row.lider) +
            '</span></td>'
        );
    }

    function initDrawerSeleccionColaboradores(overlay, isEdit) {
        if (!overlay) return;

        var initialSelectedIds = isEdit ? privadoColaboradores.map(function (c) { return c.id; }) : [];
        var empleadosDrawerRaw =
            typeof TAREAS_PLANES_DB !== 'undefined' &&
            typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function'
                ? TAREAS_PLANES_DB.getEmpleadosEjemplo()
                : [];
        var empleadosDrawer = empleadosDrawerRaw.map(function (e, idx) {
            var id = e.id || e.idColaborador || 'E' + (idx + 1);
            return {
                id: id,
                username: getUsernameEmpleado(e),
                nombre: (e.nombre || '').trim(),
                correo: getUsernameEmpleado(e),
                area: (e.area || '').trim(),
                lider: (e.jefe || '').trim(),
                avatar: e.avatar || null
            };
        });

        overlay._empleadosDrawer = empleadosDrawer;
        overlay._isEditColab = isEdit;

        var container = overlay.querySelector('#cr-visibilidad-drawer-colab-dt-container');
        if (container && typeof createUbitsDataTable === 'function') {
            overlay._drawerColabTablaRef = createUbitsDataTable({
                containerId: 'cr-visibilidad-drawer-colab-dt-container',
                tableId: 'cr-visibilidad-drawer-colab-table',
                title: 'Lista de colaboradores',
                columns: [
                    { id: 'username', label: 'Username', filterable: true },
                    { id: 'nombre', label: 'Nombre del usuario', filterable: true },
                    { id: 'correo', label: 'Correo electrónico', filterable: true },
                    { id: 'area', label: 'Área', filterable: true },
                    { id: 'lider', label: 'Líder', filterable: true }
                ],
                getData: function () {
                    return empleadosDrawer;
                },
                rowIdField: 'id',
                buildRowHtml: buildDrawerColabRowHtml,
                features: {
                    checkboxes: true,
                    search: true,
                    filters: true,
                    verSeleccionados: true,
                    resultsCount: true
                },
                initialSelectedIds: initialSelectedIds,
                emptyState: { message: 'No hay colaboradores', icon: 'far fa-user' },
                i18n: {
                    selectAll: 'Seleccionar todo',
                    deselectAll: 'Deseleccionar todo',
                    verSeleccionados: 'Ver seleccionados',
                    buscar: 'Buscar'
                }
            });
            container.style.flexDirection = 'column';
        }

        var cancelBtn = overlay.querySelector('#cr-visibilidad-drawer-colab-cancel');
        var saveBtn = overlay.querySelector('#cr-visibilidad-drawer-colab-save');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                if (typeof closeDrawer === 'function') closeDrawer(DRAWER_COLAB_OVERLAY_ID);
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var ref = overlay._drawerColabTablaRef;
                var empleados = overlay._empleadosDrawer || [];
                var mapById = {};
                empleados.forEach(function (e) {
                    mapById[e.id] = e;
                });

                if (ref && typeof ref.getSelectedIds === 'function') {
                    var ids = ref.getSelectedIds();
                    if (overlay._isEditColab) {
                        privadoColaboradores.length = 0;
                        ids.forEach(function (id) {
                            var emp = mapById[id];
                            if (emp) {
                                privadoColaboradores.push({
                                    id: emp.id,
                                    nombre: emp.nombre,
                                    correo: emp.correo,
                                    area: emp.area || '',
                                    avatar: emp.avatar || null
                                });
                            }
                        });
                    } else {
                        ids.forEach(function (id) {
                            var emp = mapById[id];
                            if (
                                emp &&
                                !privadoColaboradores.some(function (i) {
                                    return (
                                        i.id === emp.id ||
                                        (i.correo === emp.correo && i.nombre === emp.nombre)
                                    );
                                })
                            ) {
                                privadoColaboradores.push({
                                    id: emp.id,
                                    nombre: emp.nombre,
                                    correo: emp.correo,
                                    area: emp.area || '',
                                    avatar: emp.avatar || null
                                });
                            }
                        });
                    }
                }

                updatePrivadoColabButtonLabel();
                if (typeof window.triggerCrearRutaFakeSave === 'function') {
                    window.triggerCrearRutaFakeSave();
                }
                if (typeof closeDrawer === 'function') closeDrawer(DRAWER_COLAB_OVERLAY_ID);
            });
        }
    }

    function abrirDrawerSeleccionColaboradores() {
        if (typeof openDrawer !== 'function') return;

        var isEdit = privadoColaboradores.length > 0;
        var tituloDrawer = isEdit ? 'Editar selección' : 'Seleccionar usuarios';
        var labelFooter = isEdit ? 'Guardar' : 'Agregar';
        var bodyHtml =
            '<div class="drawer-usuarios-panel drawer-usuarios-panel--colaborador" style="display:block">' +
            '<div id="cr-visibilidad-drawer-colab-dt-container" class="drawer-colab-dt-wrapper"></div>' +
            '</div>';
        var footerHtml =
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cr-visibilidad-drawer-colab-cancel"><span class="ubits-body-sm-regular">Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cr-visibilidad-drawer-colab-save"><span class="ubits-body-sm-regular">' +
            labelFooter +
            '</span></button>';

        var overlay = openDrawer({
            overlayId: DRAWER_COLAB_OVERLAY_ID,
            title: tituloDrawer,
            bodyHtml: bodyHtml,
            footerHtml: footerHtml,
            size: 'lg',
            onClose: function () {}
        });

        initDrawerSeleccionColaboradores(overlay, isEdit);
    }

    function wirePrivadoColabButton() {
        if (privadoColabBtnWired) return;
        var btn = getPrivadoColabButton();
        if (!btn) return;
        privadoColabBtnWired = true;

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            abrirDrawerSeleccionColaboradores();
        });
        btn.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
    }

    function modalBodyParagraph(text) {
        return (
            '<p class="ubits-body-md-regular publicacion-paso__modal-text">' +
            text +
            '</p>'
        );
    }

    function openPublicarModal(onConfirm) {
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') {
            if (typeof onConfirm === 'function') onConfirm();
            return;
        }

        window.openModal({
            overlayId: MODAL_PUBLICAR,
            title: 'Publicar ruta',
            bodyHtml:
                modalBodyParagraph(
                    'Al publicar esta ruta, estará disponible para <strong>tus colaboradores</strong>. Confirma que todo esté listo, ya que luego <strong>solo será posible realizar cambios limitados</strong>, como modificar el orden de contenidos o reemplazar contenidos de la ruta.'
                ),
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cr-visibilidad-publicar-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cr-visibilidad-publicar-confirm"><span>Sí, publicar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });

        var overlay = document.getElementById(MODAL_PUBLICAR);
        if (!overlay) return;

        function closeModalFn() {
            window.closeModal(MODAL_PUBLICAR);
        }

        var cancelBtn = overlay.querySelector('#cr-visibilidad-publicar-cancel');
        var confirmBtn = overlay.querySelector('#cr-visibilidad-publicar-confirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModalFn);
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                closeModalFn();
                if (typeof onConfirm === 'function') onConfirm();
            });
        }
    }

    function openOcultarModal(onConfirm) {
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') {
            if (typeof onConfirm === 'function') onConfirm();
            return;
        }

        window.openModal({
            overlayId: MODAL_OCULTAR,
            title: 'Ocultar ruta',
            bodyHtml:
                modalBodyParagraph(
                    'Al ocultar esta ruta, se volverá <strong>invisible para nuevos estudiantes</strong>. <strong>Aquellos que ya estén cursándola podrán finalizarla sin problemas</strong>.'
                ) +
                modalBodyParagraph('<strong>¿Estás seguro de que deseas ocultarla?</strong>'),
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cr-visibilidad-ocultar-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cr-visibilidad-ocultar-confirm"><span>Sí, ocultar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });

        var overlay = document.getElementById(MODAL_OCULTAR);
        if (!overlay) return;

        function closeModalFn() {
            window.closeModal(MODAL_OCULTAR);
        }

        var cancelBtn = overlay.querySelector('#cr-visibilidad-ocultar-cancel');
        var confirmBtn = overlay.querySelector('#cr-visibilidad-ocultar-confirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModalFn);
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                closeModalFn();
                if (typeof onConfirm === 'function') onConfirm();
            });
        }
    }

    function openConfirmModalForVisibilidad(value, onConfirm) {
        if (value === 'publico' || value === 'privado') {
            openPublicarModal(onConfirm);
            return;
        }
        if (value === 'oculto') {
            openOcultarModal(onConfirm);
        }
    }

    function wireCrearRutaVisibilidadSelection() {
        var group = getVisibilidadGroup();
        if (!group) return;

        group.addEventListener('change', function (e) {
            var input = e.target;
            if (!input || input.type !== 'radio' || input.name !== 'crear-ruta-visibilidad') return;

            var nextValue = input.value;
            if (nextValue === currentVisibilidad) return;

            if (nextValue === 'borrador') {
                if (borradorLocked) {
                    setRadioChecked(currentVisibilidad);
                    return;
                }
                applyVisibilidad('borrador');
                return;
            }

            if (nextValue === 'publico' || nextValue === 'privado' || nextValue === 'oculto') {
                setRadioChecked(currentVisibilidad);
                openConfirmModalForVisibilidad(nextValue, function () {
                    privadoColabBtnEnabled = nextValue === 'privado';
                    applyVisibilidad(nextValue);
                });
                return;
            }

            setRadioChecked(currentVisibilidad);
        });
    }

    window.initCrearRutaPublicacionStepOnce = function () {
        if (wired) return;
        wired = true;
        privadoColabBtnEnabled = false;
        applyVisibilidad(currentVisibilidad);
        syncPrivadoColabButton();
        wirePrivadoColabButton();
        wireCrearRutaVisibilidadSelection();
    };

    window.getCrearRutaVisibilidad = function () {
        return currentVisibilidad;
    };

    window.getCrearRutaPrivadoColaboradores = function () {
        return privadoColaboradores.slice();
    };
})();
