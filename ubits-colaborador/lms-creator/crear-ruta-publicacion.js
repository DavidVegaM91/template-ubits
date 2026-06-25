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

    function initDrawerSeleccionColaboradores(overlay, isEdit) {
        if (!overlay) return;

        var DPC = window.DrawerParticipantesColabTable;
        var initialSelectedIds = isEdit ? privadoColaboradores.map(function (c) { return c.id; }) : [];
        var empleadosDrawerRaw =
            typeof TAREAS_PLANES_DB !== 'undefined' &&
            typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function'
                ? TAREAS_PLANES_DB.getEmpleadosEjemplo()
                : [];
        var empleadosDrawer = empleadosDrawerRaw.map(function (e, idx) {
            return DPC && typeof DPC.mapEmpleadoParaDrawerColab === 'function'
                ? DPC.mapEmpleadoParaDrawerColab(e, idx)
                : e;
        });

        overlay._empleadosDrawer = empleadosDrawer;
        overlay._isEditColab = isEdit;

        var container = overlay.querySelector('#cr-visibilidad-drawer-colab-dt-container');
        if (container && DPC && typeof DPC.createDrawerParticipantesColabDataTable === 'function') {
            overlay._drawerColabTablaRef = DPC.createDrawerParticipantesColabDataTable({
                containerId: 'cr-visibilidad-drawer-colab-dt-container',
                tableId: 'cr-visibilidad-drawer-colab-table',
                getData: function () {
                    return empleadosDrawer;
                },
                initialSelectedIds: initialSelectedIds
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
            '<div class="drawer-usuarios-panel drawer-usuarios-panel--colaborador">' +
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
