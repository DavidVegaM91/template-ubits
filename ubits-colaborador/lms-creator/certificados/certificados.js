/**
 * LMS Creator — Descarga de certificados
 * Modos: global | contenido | colaborador
 * Deep links por hash (ver PLAN.md)
 */
(function () {
    'use strict';

    var MODAL_CONFIRMACION_ID = 'certificados-modal-confirmacion';
    var MODAL_SIN_RESULTADOS_ID = 'certificados-modal-sin-resultados';

    var currentMode = 'global';
    var currentUiState = 'empty';
    var suppressHashWrite = false;

    var form = {
        fechaInicial: '',
        fechaFinal: '',
        email: '',
        emailConfirm: '',
        incluirInactivos: false,
        contenidoId: '',
        colaboradorId: '',
        tipoContenidos: 'propios'
    };

    var contenidoOptions = [];
    var colaboradorOptions = [];
    var inputsMounted = false;

    var DEMO = {
        fechaInicial: '2026-01-01',
        fechaFinal: '2026-06-30',
        email: 'juanbarraza@empresa.com.co',
        emailConfirm: 'juanbarraza@empresa.com.co',
        certificadosCount: 128,
        minutosEntrega: 15
    };

    var HASH_SPECS = [
        { key: 'global', mode: 'global', uiState: 'empty' },
        { key: 'global-filled', mode: 'global', uiState: 'filled' },
        { key: 'global-confirmacion', mode: 'global', uiState: 'confirmacion' },
        { key: 'global-sin-resultados', mode: 'global', uiState: 'sin-resultados' },
        { key: 'global-validacion', mode: 'global', uiState: 'validacion' },
        { key: 'global-error', mode: 'global', uiState: 'error' },
        { key: 'contenido', mode: 'contenido', uiState: 'empty' },
        { key: 'contenido-filled', mode: 'contenido', uiState: 'filled' },
        { key: 'contenido-confirmacion', mode: 'contenido', uiState: 'confirmacion' },
        { key: 'contenido-sin-resultados', mode: 'contenido', uiState: 'sin-resultados' },
        { key: 'contenido-validacion', mode: 'contenido', uiState: 'validacion' },
        { key: 'contenido-error', mode: 'contenido', uiState: 'error' },
        { key: 'colaborador', mode: 'colaborador', uiState: 'empty' },
        { key: 'colaborador-filled', mode: 'colaborador', uiState: 'filled' },
        { key: 'colaborador-confirmacion', mode: 'colaborador', uiState: 'confirmacion' },
        { key: 'colaborador-sin-resultados', mode: 'colaborador', uiState: 'sin-resultados' },
        { key: 'colaborador-validacion', mode: 'colaborador', uiState: 'validacion' },
        { key: 'colaborador-error', mode: 'colaborador', uiState: 'error' }
    ];

    function hashKeyFromSpec(spec) {
        return '#' + spec.key;
    }

    function parseLocationHash() {
        var raw = (window.location.hash || '').replace(/^#/, '').trim();
        if (!raw) {
            return { mode: 'global', uiState: 'empty', key: 'global' };
        }
        for (var i = 0; i < HASH_SPECS.length; i++) {
            if (HASH_SPECS[i].key === raw) {
                return {
                    mode: HASH_SPECS[i].mode,
                    uiState: HASH_SPECS[i].uiState,
                    key: HASH_SPECS[i].key
                };
            }
        }
        return { mode: 'global', uiState: 'empty', key: 'global' };
    }

    function hashKeyForModeState(mode, uiState) {
        var target = mode + (uiState === 'empty' ? '' : '-' + uiState);
        for (var i = 0; i < HASH_SPECS.length; i++) {
            if (HASH_SPECS[i].key === target) {
                return hashKeyFromSpec(HASH_SPECS[i]);
            }
        }
        return '#' + mode;
    }

    function setLocationHash(mode, uiState, replace) {
        if (suppressHashWrite) return;
        var next = hashKeyForModeState(mode, uiState);
        if (window.location.hash === next) return;
        if (typeof history.replaceState === 'function' && replace) {
            history.replaceState(null, '', window.location.pathname + window.location.search + next);
        } else if (typeof history.pushState === 'function') {
            history.pushState(null, '', window.location.pathname + window.location.search + next);
        } else {
            window.location.hash = next;
        }
    }

    function getCatalogoContenidos() {
        var list = [];
        var u = window.BDS_CONTENIDOS_UBITS && window.BDS_CONTENIDOS_UBITS.contents;
        var f = window.BDS_CONTENIDOS_FIQSHA && window.BDS_CONTENIDOS_FIQSHA.contents;
        if (Array.isArray(u)) list = list.concat(u);
        if (Array.isArray(f)) list = list.concat(f);
        return list;
    }

    function buildContenidoOptions() {
        return getCatalogoContenidos().slice(0, 40).map(function (c) {
            return { value: String(c.id), label: c.title || c.name || 'Contenido' };
        });
    }

    function buildColaboradorOptions() {
        var cols = window.BD_MASTER_COLABORADORES && window.BD_MASTER_COLABORADORES.colaboradores;
        if (!Array.isArray(cols)) return [];
        return cols.slice(0, 55).map(function (c) {
            var nombre = c.nombreCompleto || [c.nombre, c.apellido].filter(Boolean).join(' ').trim();
            var user = c.username || c.usuario || '';
            var mail = c.correoElectronico || c.email || c.correo || '';
            var label = nombre || 'Colaborador';
            if (user || mail) {
                label += ' (' + [user, mail].filter(Boolean).join(' - ') + ')';
            }
            return { value: String(c.id || c.idColaborador), label: label };
        });
    }

    function getContenidoLabelById(id) {
        var found = contenidoOptions.find(function (o) { return o.value === String(id); });
        return found ? found.label : '';
    }

    function getColaboradorLabelById(id) {
        var found = colaboradorOptions.find(function (o) { return o.value === String(id); });
        return found ? found.label : '';
    }

    function formatDateHuman(iso) {
        if (!iso) return '';
        var parts = String(iso).split('-');
        if (parts.length !== 3) return iso;
        var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        var d = parseInt(parts[2], 10);
        var m = parseInt(parts[1], 10) - 1;
        var y = parts[0];
        if (isNaN(d) || m < 0 || m > 11) return iso;
        return d + ' de ' + months[m] + ' de ' + y;
    }

    function formatDateRangeHuman() {
        var a = formatDateHuman(form.fechaInicial);
        var b = formatDateHuman(form.fechaFinal);
        if (!a && !b) return '';
        if (a && b) return a + ' – ' + b;
        return a || b;
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    }

    function parseIsoDate(value) {
        if (!value) return null;
        var p = String(value).split('-');
        if (p.length !== 3) return null;
        var dt = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
        return isNaN(dt.getTime()) ? null : dt;
    }

    function daysBetween(startIso, endIso) {
        var a = parseIsoDate(startIso);
        var b = parseIsoDate(endIso);
        if (!a || !b) return null;
        return Math.round((b - a) / (1000 * 60 * 60 * 24));
    }

    function validateForm(showErrors) {
        var errors = [];
        if (currentMode === 'contenido' && !form.contenidoId) {
            errors.push({ field: 'contenido', message: 'Selecciona un contenido.' });
        }
        if (currentMode === 'colaborador' && !form.colaboradorId) {
            errors.push({ field: 'colaborador', message: 'Selecciona un colaborador.' });
        }
        if (!form.fechaInicial) {
            errors.push({ field: 'fechaInicial', message: 'La fecha inicial es obligatoria.' });
        }
        if (!form.fechaFinal) {
            errors.push({ field: 'fechaFinal', message: 'La fecha final es obligatoria.' });
        }
        if (form.fechaInicial && form.fechaFinal) {
            var span = daysBetween(form.fechaInicial, form.fechaFinal);
            if (span != null && span < 0) {
                errors.push({ field: 'fechaFinal', message: 'La fecha final debe ser posterior a la inicial.' });
            }
            if (span != null && span > 366) {
                errors.push({ field: 'fechaFinal', message: 'El rango máximo permitido es de un año.' });
            }
        }
        if (!form.email) {
            errors.push({ field: 'email', message: 'El correo de destino es obligatorio.' });
        } else if (!isValidEmail(form.email)) {
            errors.push({ field: 'email', message: 'Ingresa un correo válido.' });
        }
        if (!form.emailConfirm) {
            errors.push({ field: 'emailConfirm', message: 'Confirma el correo de destino.' });
        } else if (form.email !== form.emailConfirm) {
            errors.push({ field: 'emailConfirm', message: 'Los correos no coinciden.' });
        }

        if (showErrors) {
            applyFieldValidation(errors);
        } else {
            clearFieldValidation();
        }

        return errors.length === 0;
    }

    function setInputState(containerId, state, helperText) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var input = container.querySelector('.ubits-input');
        var wrapper = container.querySelector('.ubits-input-wrapper');
        if (!input) return;

        if (state === 'invalid') {
            input.classList.add('ubits-input--invalid');
            if (wrapper) wrapper.classList.add('ubits-input-wrapper--invalid');
            var helperEl = container.querySelector('.ubits-input-helper-text');
            if (!helperEl) {
                var helperWrap = document.createElement('div');
                helperWrap.className = 'ubits-input-helper';
                helperEl = document.createElement('span');
                helperEl.className = 'ubits-input-helper-text';
                helperWrap.appendChild(helperEl);
                container.appendChild(helperWrap);
            }
            helperEl.textContent = helperText || 'Campo requerido';
            return;
        }

        input.classList.remove('ubits-input--invalid');
        if (wrapper) wrapper.classList.remove('ubits-input-wrapper--invalid');
        var existingHelper = container.querySelector('.ubits-input-helper');
        if (existingHelper && !existingHelper.querySelector('.ubits-input-counter')) {
            existingHelper.remove();
        }
    }

    function clearFieldValidation() {
        [
            'certificados-input-contenido',
            'certificados-input-colaborador',
            'certificados-input-fecha-inicial',
            'certificados-input-fecha-final',
            'certificados-input-email',
            'certificados-input-email-confirm'
        ].forEach(function (id) {
            setInputState(id, 'default');
        });
        hideFormAlert();
    }

    function applyFieldValidation(errors) {
        clearFieldValidation();
        var map = {
            contenido: 'certificados-input-contenido',
            colaborador: 'certificados-input-colaborador',
            fechaInicial: 'certificados-input-fecha-inicial',
            fechaFinal: 'certificados-input-fecha-final',
            email: 'certificados-input-email',
            emailConfirm: 'certificados-input-email-confirm'
        };
        errors.forEach(function (err) {
            var cid = map[err.field];
            if (cid) setInputState(cid, 'invalid', err.message);
        });
        if (errors.length && typeof window.showAlert === 'function') {
            showFormAlert('error', 'Revisa los campos marcados antes de continuar.');
        }
    }

    function showFormAlert(variant, message) {
        var mount = document.getElementById('certificados-alert-mount');
        if (!mount) return;
        mount.hidden = false;
        mount.innerHTML = '';
        if (typeof window.showAlert === 'function') {
            window.showAlert(variant, message, { containerId: 'certificados-alert-mount', showClose: true });
        }
    }

    function hideFormAlert() {
        var mount = document.getElementById('certificados-alert-mount');
        if (mount) {
            mount.hidden = true;
            mount.innerHTML = '';
        }
    }

    function updateSubmitButton() {
        var btn = document.getElementById('certificados-btn-solicitar');
        if (!btn) return;
        var ok = validateForm(false);
        btn.disabled = !ok;
    }

    function syncToggleUi() {
        var toggle = document.getElementById('certificados-toggle-inactivos');
        if (toggle) toggle.checked = !!form.incluirInactivos;
    }

    function syncModeRadios(mode) {
        var radio = document.querySelector('input[name="certificados-modo"][value="' + mode + '"]');
        if (radio) radio.checked = true;
    }

    function updateModePanels(mode) {
        var contenidoWrap = document.getElementById('certificados-field-contenido-wrap');
        var colabWrap = document.getElementById('certificados-field-colaborador-wrap');
        var tipoWrap = document.getElementById('certificados-field-tipo-contenidos-wrap');
        var hint = document.getElementById('certificados-form-hint');

        if (contenidoWrap) contenidoWrap.hidden = mode !== 'contenido';
        if (colabWrap) colabWrap.hidden = mode !== 'colaborador';
        if (tipoWrap) tipoWrap.hidden = mode !== 'colaborador';

        if (hint) {
            if (mode === 'global') {
                hint.textContent = 'Selecciona un rango de fechas y te enviaremos por correo un archivo .zip con todos los certificados generados en ese periodo.';
            } else {
                hint.textContent = 'Al finalizar el proceso, recibirás en tu correo un archivo .zip con los certificados.';
            }
        }
    }

    function remountSelectInputs() {
        if (!inputsMounted || typeof window.createInput !== 'function') return;

        if (document.getElementById('certificados-input-contenido')) {
            window.createInput({
                containerId: 'certificados-input-contenido',
                type: 'select',
                label: 'Buscar contenido',
                placeholder: 'Selecciona un contenido',
                size: 'md',
                selectOptions: [{ value: '', label: 'Selecciona un contenido' }].concat(contenidoOptions),
                value: form.contenidoId,
                onChange: function (v) {
                    form.contenidoId = v || '';
                    updateSubmitButton();
                }
            });
        }

        if (document.getElementById('certificados-input-colaborador')) {
            window.createInput({
                containerId: 'certificados-input-colaborador',
                type: 'select',
                label: 'Buscar colaborador',
                placeholder: 'Selecciona un colaborador',
                size: 'md',
                selectOptions: [{ value: '', label: 'Selecciona un colaborador' }].concat(colaboradorOptions),
                value: form.colaboradorId,
                onChange: function (v) {
                    form.colaboradorId = v || '';
                    updateSubmitButton();
                }
            });
        }
    }

    function mountFormInputs() {
        if (inputsMounted || typeof window.createInput !== 'function') return;

        contenidoOptions = buildContenidoOptions();
        colaboradorOptions = buildColaboradorOptions();

        window.createInput({
            containerId: 'certificados-input-fecha-inicial',
            type: 'calendar',
            label: 'Fecha inicial',
            placeholder: 'dd / mm / aaaa',
            size: 'md',
            value: form.fechaInicial,
            onChange: function (v) {
                form.fechaInicial = v || '';
                updateSubmitButton();
            }
        });

        window.createInput({
            containerId: 'certificados-input-fecha-final',
            type: 'calendar',
            label: 'Fecha final',
            placeholder: 'dd / mm / aaaa',
            size: 'md',
            value: form.fechaFinal,
            onChange: function (v) {
                form.fechaFinal = v || '';
                updateSubmitButton();
            }
        });

        window.createInput({
            containerId: 'certificados-input-email',
            type: 'email',
            label: 'Correo de destino',
            placeholder: 'Escribe el correo',
            size: 'md',
            value: form.email,
            onChange: function (v) {
                form.email = (v || '').trim();
                updateSubmitButton();
            }
        });

        window.createInput({
            containerId: 'certificados-input-email-confirm',
            type: 'email',
            label: 'Confirmar correo',
            placeholder: 'Escribe el correo',
            size: 'md',
            value: form.emailConfirm,
            onChange: function (v) {
                form.emailConfirm = (v || '').trim();
                updateSubmitButton();
            }
        });

        window.createInput({
            containerId: 'certificados-input-tipo-contenidos',
            type: 'select',
            label: 'Tipo de contenidos',
            placeholder: 'Selecciona una opción',
            size: 'md',
            selectOptions: [
                { value: 'propios', label: 'Solo contenidos propios' },
                { value: 'todos', label: 'Todos los contenidos' },
                { value: 'ubits', label: 'Solo contenidos UBITS' }
            ],
            value: form.tipoContenidos,
            onChange: function (v) {
                form.tipoContenidos = v || 'propios';
                updateSubmitButton();
            }
        });

        remountSelectInputs();
        inputsMounted = true;
    }

    function setFormValues(values) {
        form.fechaInicial = values.fechaInicial || '';
        form.fechaFinal = values.fechaFinal || '';
        form.email = values.email || '';
        form.emailConfirm = values.emailConfirm || '';
        form.incluirInactivos = !!values.incluirInactivos;
        form.contenidoId = values.contenidoId || '';
        form.colaboradorId = values.colaboradorId || '';
        form.tipoContenidos = values.tipoContenidos || 'propios';
        syncToggleUi();
        remountSelectInputs();
        remountCalendarAndEmailInputs();
        updateSubmitButton();
    }

    function remountCalendarAndEmailInputs() {
        if (!inputsMounted) return;
        ['certificados-input-fecha-inicial', 'certificados-input-fecha-final', 'certificados-input-email', 'certificados-input-email-confirm'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            var cfg = {
                'certificados-input-fecha-inicial': { type: 'calendar', label: 'Fecha inicial', key: 'fechaInicial' },
                'certificados-input-fecha-final': { type: 'calendar', label: 'Fecha final', key: 'fechaFinal' },
                'certificados-input-email': { type: 'email', label: 'Correo de destino', key: 'email' },
                'certificados-input-email-confirm': { type: 'email', label: 'Confirmar correo', key: 'emailConfirm' }
            }[id];
            if (!cfg) return;
            window.createInput({
                containerId: id,
                type: cfg.type,
                label: cfg.label,
                placeholder: cfg.type === 'calendar' ? 'dd / mm / aaaa' : 'Escribe el correo',
                size: 'md',
                value: form[cfg.key],
                onChange: function (v) {
                    form[cfg.key] = cfg.type === 'email' ? (v || '').trim() : (v || '');
                    updateSubmitButton();
                }
            });
        });
    }

    function resetFormEmpty() {
        setFormValues({
            fechaInicial: '',
            fechaFinal: '',
            email: '',
            emailConfirm: '',
            incluirInactivos: false,
            contenidoId: '',
            colaboradorId: '',
            tipoContenidos: 'propios'
        });
        clearFieldValidation();
    }

    function applyDemoFilled() {
        var demoContenido = contenidoOptions[0] ? contenidoOptions[0].value : '';
        var demoColaborador = colaboradorOptions[0] ? colaboradorOptions[0].value : '';
        if (colaboradorOptions.length > 3) demoColaborador = colaboradorOptions[3].value;

        setFormValues({
            fechaInicial: DEMO.fechaInicial,
            fechaFinal: DEMO.fechaFinal,
            email: DEMO.email,
            emailConfirm: DEMO.emailConfirm,
            incluirInactivos: false,
            contenidoId: demoContenido,
            colaboradorId: demoColaborador,
            tipoContenidos: 'propios'
        });
        clearFieldValidation();
    }

    function modalRow(iconClass, label, value) {
        return (
            '<p class="certificados-modal-row">' +
            '<span class="certificados-modal-row__icon"><i class="far ' + iconClass + '"></i></span>' +
            '<span class="certificados-modal-row__text">' +
            '<span class="certificados-modal-row__label">' + label + '</span> ' + value +
            '</span></p>'
        );
    }

    function buildConfirmacionBody() {
        var rows = '';
        rows += modalRow('fa-file-certificate', 'Certificados encontrados:', DEMO.certificadosCount + ' certificados');
        if (currentMode === 'contenido' && form.contenidoId) {
            rows += modalRow('fa-book-open', 'Contenido:', getContenidoLabelById(form.contenidoId));
        }
        if (currentMode === 'colaborador' && form.colaboradorId) {
            rows += modalRow('fa-user', 'Colaborador:', getColaboradorLabelById(form.colaboradorId));
        }
        rows += modalRow('fa-calendar', 'Rango de fechas:', formatDateRangeHuman());
        rows += modalRow('fa-envelope', 'Enviar a:', form.email);
        rows += modalRow('fa-clock', 'Tiempo de entrega:', 'Aproximadamente ' + DEMO.minutosEntrega + ' minutos');
        rows += '<p class="certificados-modal-row"><span class="certificados-modal-row__icon"><i class="far fa-triangle-exclamation"></i></span><span class="certificados-modal-row__text certificados-modal-note-title ubits-body-md-semibold">Nota importante</span></p>';
        rows += '<p class="certificados-modal-note-text ubits-body-md-regular">El enlace de descarga estará disponible por 2 días. Después de ese tiempo, deberás volver a generar la solicitud desde esta plataforma.</p>';
        return '<div class="certificados-modal-body">' + rows + '</div>';
    }

    function buildSinResultadosBody() {
        var intro = '<p class="ubits-body-md-regular">No encontramos certificados generados para:</p>';
        var rows = '';
        if (currentMode === 'contenido' && form.contenidoId) {
            rows += modalRow('fa-book-open', 'Contenido:', getContenidoLabelById(form.contenidoId));
        }
        if (currentMode === 'colaborador' && form.colaboradorId) {
            rows += modalRow('fa-user', 'Colaborador:', getColaboradorLabelById(form.colaboradorId));
        }
        rows += modalRow('fa-calendar', 'Rango de fechas:', formatDateRangeHuman());
        var why = 'Nadie ha finalizado contenidos en ese periodo.';
        if (currentMode === 'contenido') {
            why = 'Nadie ha completado ese contenido en el periodo seleccionado.';
        }
        if (currentMode === 'colaborador') {
            why = 'Ese colaborador no tiene certificados emitidos en el periodo seleccionado.';
        }
        rows += modalRow('fa-circle-question', '¿Por qué puede estar pasando esto?', '');
        rows += '<p class="ubits-body-md-regular certificados-modal-note-text">' + why + '</p>';
        return '<div class="certificados-modal-body">' + intro + rows + '</div>';
    }

    function openConfirmacionModal() {
        if (typeof window.openModal !== 'function') return;
        window.openModal({
            overlayId: MODAL_CONFIRMACION_ID,
            title: 'Revisa y confirma tu solicitud',
            bodyHtml: buildConfirmacionBody(),
            size: 'md',
            closeOnOverlayClick: true,
            footerHtml: '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="certificados-modal-confirm-ok"><span>Entendido</span></button>',
            onClose: function () {
                currentUiState = 'filled';
                setLocationHash(currentMode, 'filled', true);
            }
        });
        setTimeout(function () {
            var ok = document.getElementById('certificados-modal-confirm-ok');
            if (ok) {
                ok.addEventListener('click', function () {
                    if (typeof window.closeModal === 'function') window.closeModal(MODAL_CONFIRMACION_ID);
                    if (typeof window.showToast === 'function') {
                        window.showToast('success', 'Solicitud registrada. Revisa tu correo en unos minutos.');
                    }
                });
            }
        }, 0);
    }

    function openSinResultadosModal() {
        if (typeof window.openModal !== 'function') return;
        window.openModal({
            overlayId: MODAL_SIN_RESULTADOS_ID,
            title: 'No se encontraron certificados',
            bodyHtml: buildSinResultadosBody(),
            size: 'md',
            closeOnOverlayClick: true,
            footerHtml: '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="certificados-modal-nores-ok"><span>Entendido</span></button>'
        });
        setTimeout(function () {
            var ok = document.getElementById('certificados-modal-nores-ok');
            if (ok) {
                ok.addEventListener('click', function () {
                    if (typeof window.closeModal === 'function') window.closeModal(MODAL_SIN_RESULTADOS_ID);
                });
            }
        }, 0);
    }

    function closeCertificadosModals() {
        if (typeof window.closeModal === 'function') {
            window.closeModal(MODAL_CONFIRMACION_ID);
            window.closeModal(MODAL_SIN_RESULTADOS_ID);
        }
    }

    function mockHasResults() {
        if (currentUiState === 'sin-resultados') return false;
        if (form.fechaFinal === '2026-01-15') return false;
        return true;
    }

    function handleSolicitarClick() {
        if (!validateForm(true)) {
            currentUiState = 'validacion';
            setLocationHash(currentMode, 'validacion', true);
            return;
        }
        if (mockHasResults()) {
            currentUiState = 'confirmacion';
            setLocationHash(currentMode, 'confirmacion', true);
            openConfirmacionModal();
        } else {
            currentUiState = 'sin-resultados';
            setLocationHash(currentMode, 'sin-resultados', true);
            openSinResultadosModal();
        }
    }

    function applyUiState(uiState) {
        closeCertificadosModals();
        hideFormAlert();

        if (uiState === 'empty') {
            resetFormEmpty();
        } else if (uiState === 'filled' || uiState === 'confirmacion' || uiState === 'sin-resultados' || uiState === 'validacion' || uiState === 'error') {
            if (uiState !== 'validacion') {
                applyDemoFilled();
            } else {
                resetFormEmpty();
            }
        }

        if (uiState === 'validacion') {
            validateForm(true);
        }

        if (uiState === 'error') {
            applyDemoFilled();
            if (typeof window.showToast === 'function') {
                window.showToast('error', 'No pudimos procesar la solicitud. Inténtalo de nuevo en unos minutos.');
            } else {
                showFormAlert('error', 'No pudimos procesar la solicitud. Inténtalo de nuevo en unos minutos.');
            }
        }

        if (uiState === 'confirmacion') {
            openConfirmacionModal();
        }

        if (uiState === 'sin-resultados') {
            openSinResultadosModal();
        }

        updateSubmitButton();
    }

    function setMode(mode, opts) {
        opts = opts || {};
        currentMode = mode;
        syncModeRadios(mode);
        updateModePanels(mode);
        if (!opts.keepUiState) {
            currentUiState = 'empty';
            applyUiState('empty');
        }
        if (!opts.skipHash) {
            setLocationHash(mode, currentUiState, !!opts.replaceHash);
        }
        updateSubmitButton();
    }

    function applyCertificadosHash(opts) {
        opts = opts || {};
        var parsed = parseLocationHash();
        suppressHashWrite = true;
        currentMode = parsed.mode;
        currentUiState = parsed.uiState;
        syncModeRadios(parsed.mode);
        updateModePanels(parsed.mode);
        applyUiState(parsed.uiState);
        if (!opts.skipNormalize && parsed.key !== hashKeyForModeState(parsed.mode, parsed.uiState).replace('#', '')) {
            setLocationHash(parsed.mode, parsed.uiState, true);
        }
        suppressHashWrite = false;
        updateSubmitButton();
    }

    function bindEvents() {
        document.querySelectorAll('.certificados-mode-card input[name="certificados-modo"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (!radio.checked) return;
                currentMode = radio.value;
                currentUiState = 'empty';
                syncModeRadios(currentMode);
                updateModePanels(currentMode);
                applyUiState('empty');
                setLocationHash(currentMode, 'empty', false);
            });
        });

        var toggle = document.getElementById('certificados-toggle-inactivos');
        if (toggle) {
            toggle.addEventListener('change', function () {
                form.incluirInactivos = toggle.checked;
                updateSubmitButton();
            });
        }

        var btn = document.getElementById('certificados-btn-solicitar');
        if (btn) {
            btn.addEventListener('click', handleSolicitarClick);
        }

        window.addEventListener('hashchange', function () {
            applyCertificadosHash({ skipNormalize: true });
        });
    }

    window.initCertificadosPage = function initCertificadosPage() {
        mountFormInputs();
        bindEvents();
        applyCertificadosHash();
    };
})();
