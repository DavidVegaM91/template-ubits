/**
 * Paso Visibilidad — crear contenido (LMS Creator).
 * Borrador: selección directa. Público, Privado y Oculto: modal de confirmación antes de aplicar.
 */
(function () {
    'use strict';

    var MODAL_PUBLICAR = 'cc-visibilidad-modal-publicar';
    var MODAL_OCULTAR = 'cc-visibilidad-modal-ocultar';

    var VISIBILIDAD_META = {
        borrador: { label: 'Borrador', modifier: 'info' },
        publico: { label: 'Público', modifier: 'success' },
        privado: { label: 'Privado', modifier: 'warning' },
        oculto: { label: 'Oculto', modifier: 'neutral' }
    };

    var currentVisibilidad = 'borrador';
    var wired = false;

    function getVisibilidadGroup() {
        return document.querySelector('.publicacion-paso__cards');
    }

    function setRadioChecked(value) {
        var group = getVisibilidadGroup();
        if (!group) return;
        group.querySelectorAll('input[name="crear-contenido-visibilidad"]').forEach(function (radio) {
            radio.checked = radio.value === value;
        });
    }

    function updateHeaderVisibilidadTag(value) {
        var tag = document.getElementById('crear-contenido-visibilidad-header-tag');
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
            title: 'Publicar contenido',
            bodyHtml:
                modalBodyParagraph(
                    'Al publicar este contenido, estará disponible para <strong>tus colaboradores</strong>. Confirma que todo esté listo, ya que luego <strong>solo será posible realizar cambios limitados</strong>, como modificar textos.'
                ),
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-visibilidad-publicar-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-visibilidad-publicar-confirm"><span>Sí, publicar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });

        var overlay = document.getElementById(MODAL_PUBLICAR);
        if (!overlay) return;

        function closeModal() {
            window.closeModal(MODAL_PUBLICAR);
        }

        var cancelBtn = overlay.querySelector('#cc-visibilidad-publicar-cancel');
        var confirmBtn = overlay.querySelector('#cc-visibilidad-publicar-confirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                closeModal();
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
            title: 'Ocultar contenido',
            bodyHtml:
                modalBodyParagraph(
                    'Al ocultar este contenido, se volverá <strong>invisible para nuevos estudiantes</strong>. <strong>Aquellos que ya estén cursándolo podrán finalizarlo sin problemas</strong>.'
                ) +
                modalBodyParagraph('<strong>¿Estás seguro de que deseas ocultarlo?</strong>'),
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-visibilidad-ocultar-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-visibilidad-ocultar-confirm"><span>Sí, ocultar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });

        var overlay = document.getElementById(MODAL_OCULTAR);
        if (!overlay) return;

        function closeModal() {
            window.closeModal(MODAL_OCULTAR);
        }

        var cancelBtn = overlay.querySelector('#cc-visibilidad-ocultar-cancel');
        var confirmBtn = overlay.querySelector('#cc-visibilidad-ocultar-confirm');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                closeModal();
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

    function wireCrearContenidoVisibilidadSelection() {
        var group = getVisibilidadGroup();
        if (!group) return;

        group.addEventListener('change', function (e) {
            var input = e.target;
            if (!input || input.type !== 'radio' || input.name !== 'crear-contenido-visibilidad') return;

            var nextValue = input.value;
            if (nextValue === currentVisibilidad) return;

            if (nextValue === 'borrador') {
                applyVisibilidad('borrador');
                return;
            }

            if (nextValue === 'publico' || nextValue === 'privado' || nextValue === 'oculto') {
                setRadioChecked(currentVisibilidad);
                openConfirmModalForVisibilidad(nextValue, function () {
                    applyVisibilidad(nextValue);
                });
                return;
            }

            setRadioChecked(currentVisibilidad);
        });
    }

    window.initCrearContenidoPublicacionStepOnce = function () {
        if (wired) return;
        wired = true;
        applyVisibilidad(currentVisibilidad);
        wireCrearContenidoVisibilidadSelection();
    };

    window.getCrearContenidoVisibilidad = function () {
        return currentVisibilidad;
    };
})();
