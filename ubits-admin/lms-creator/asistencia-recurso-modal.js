/**
 * Modal «Agregar asistencia» — LMS Creator T2.
 * Instrucciones (opcional) + autoasistencia + sesiones con nombre y fecha/hora.
 * `autoAsistencia` sustituye al antiguo «Sesión libre»: aquel decidía si había
 * ventanas de fecha (y al activarlo borraba las sesiones); este solo decide
 * QUIÉN confirma. Las sesiones son ahora siempre obligatorias.
 *
 * API:
 *   openAsistenciaRecursoModal({ initialData?, lockPastSessions?, onReady(payload), onBack?, onDismiss? })
 *   asistenciaRecursoRenderedHtml(payload) → HTML readonly para Recursos
 *
 * Depende: modal.js, input.js, rich-text-editor.js, inline-edit.css, switch.css, button, tooltip
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'cc-asistencia-recurso-modal';
    var RTE_ID = 'cc-asistencia-rte';
    var LIST_ID = 'cc-asistencia-session-list';
    var FREE_ID = 'cc-asistencia-free-session';
    var CONFIRM_ID = 'cc-asistencia-recurso-confirm';
    var ADD_ID = 'cc-asistencia-add-session';
    var SESSIONS_WRAP_ID = 'cc-asistencia-sessions-wrap';

    var _onReady = null;
    var _onDismiss = null;
    var _onBack = null;
    var _confirmed = false;
    var _goingBack = false;
    var _sessions = [];
    var _lockedIds = {};
    var _lockPast = false;
    var _autoAsistencia = false;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function newSessionId() {
        return 'as-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    }

    function defaultSessionName(index) {
        return 'Sesión ' + (index + 1);
    }

    function sessionNameFromDraft(draft, index) {
        var name = String((draft && draft.name) || '').trim();
        return name || defaultSessionName(index);
    }

    function parseUiDate(dateStr) {
        var m = String(dateStr || '')
            .trim()
            .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!m) return null;
        var d = Number(m[1]);
        var mo = Number(m[2]);
        var y = Number(m[3]);
        if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
        return { y: y, m: mo, d: d };
    }

    function formatUiDate(iso) {
        var d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        return dd + '/' + mm + '/' + d.getFullYear();
    }

    function formatTimeFromIso(iso) {
        var d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function normalizeTime(raw) {
        var t = String(raw || '').trim();
        var m = t.match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return null;
        var h = Number(m[1]);
        var min = Number(m[2]);
        if (h < 0 || h > 23 || min < 0 || min > 59) return null;
        return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
    }

    function toIso(dateStr, timeStr) {
        var date = parseUiDate(dateStr);
        var time = normalizeTime(timeStr);
        if (!date || !time) return null;
        var parts = time.split(':');
        var dt = new Date(date.y, date.m - 1, date.d, Number(parts[0]), Number(parts[1]), 0, 0);
        if (Number.isNaN(dt.getTime())) return null;
        return dt.toISOString();
    }

    function isSessionDraftComplete(draft) {
        return !!(toIso(draft.date, draft.startTime) && toIso(draft.date, draft.endTime));
    }

    function isSessionDatePast(iso, now) {
        now = now || new Date();
        var d = new Date(iso);
        if (Number.isNaN(d.getTime())) return false;
        var sessionDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return sessionDay < today;
    }

    function draftsFromInitial(sessions) {
        if (!sessions || !sessions.length) return [];
        return sessions.map(function (s, index) {
            return {
                id: s.id || newSessionId(),
                name: String(s.label || '').trim() || defaultSessionName(index),
                date: formatUiDate(s.startIso),
                startTime: formatTimeFromIso(s.startIso),
                endTime: formatTimeFromIso(s.endIso),
            };
        });
    }

    function formatSessionWindow(startIso, endIso) {
        var start = new Date(startIso);
        var end = new Date(endIso);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
        var dateFmt = new Intl.DateTimeFormat('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        var timeFmt = new Intl.DateTimeFormat('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return dateFmt.format(start) + ' · ' + timeFmt.format(start) + ' – ' + timeFmt.format(end);
    }

    function closeOverlay() {
        if (typeof global.closeModal === 'function') global.closeModal(OVERLAY_ID);
    }

    function handleDismiss() {
        if (_confirmed || _goingBack) {
            _goingBack = false;
            return;
        }
        var cb = _onDismiss;
        _onReady = null;
        _onDismiss = null;
        _onBack = null;
        if (typeof cb === 'function') cb();
    }

    function hasLockedSessions() {
        return Object.keys(_lockedIds).length > 0;
    }

    function canConfirm() {
        if (!_sessions.length) return false;
        return _sessions.every(isSessionDraftComplete);
    }

    function syncConfirmBtn(overlay) {
        var btn = overlay && overlay.querySelector('#' + CONFIRM_ID);
        if (!btn) return;
        var ok = canConfirm();
        btn.disabled = !ok;
        btn.classList.toggle('ubits-button--primary', ok);
        btn.classList.toggle('ubits-button--secondary', !ok);
    }

    function buildRteHtml(initialHtml) {
        var toolbar =
            typeof global.richTextEditorToolbarAndFileInputHtml === 'function'
                ? global.richTextEditorToolbarAndFileInputHtml()
                : '';
        var emptyClass = String(initialHtml || '').replace(/<br\s*\/?>/gi, '').trim() ? '' : ' is-empty';
        return (
            '<div class="ubits-rich-text-editor ubits-rich-text-editor--show-required-hint" data-rich-text-editor id="' +
            RTE_ID +
            '">' +
            '<div class="ubits-rich-text-editor__label-row">' +
            '<p class="ubits-rich-text-editor__label ubits-body-sm-semibold">Instrucciones' +
            ' <span class="ubits-input-mandatory">(opcional)</span></p>' +
            '</div>' +
            toolbar +
            '<div class="ubits-rich-text-editor__editor-shell">' +
            '<div class="ubits-rich-text-editor__field ubits-body-md-regular' +
            emptyClass +
            '" contenteditable="true" data-placeholder="Escribe las instrucciones para los estudiantes…">' +
            (initialHtml || '') +
            '</div></div></div>'
        );
    }

    function buildBodyHtml() {
        return (
            '<div class="cc-asistencia-recurso-modal">' +
            '<div class="cc-asistencia-recurso-modal__layout">' +
            '<div class="cc-asistencia-recurso-modal__section" id="cc-asistencia-rte-mount"></div>' +
            '<div class="cc-asistencia-recurso-modal__section">' +
            '<div class="cc-asistencia-recurso-modal__switch-row">' +
            '<p class="ubits-body-md-bold cc-asistencia-recurso-modal__title">Autoasistencia</p>' +
            '<label class="ubits-switch ubits-switch--md">' +
            '<input type="checkbox" class="ubits-switch__input" role="switch" id="' +
            FREE_ID +
            '" aria-label="Autoasistencia">' +
            '<span class="ubits-switch__track"><span class="ubits-switch__thumb"></span></span>' +
            '</label></div>' +
            '<p class="ubits-body-sm-regular cc-asistencia-recurso-modal__hint" id="cc-asistencia-free-hint"></p>' +
            '</div>' +
            '<div class="cc-asistencia-recurso-modal__section" id="' +
            SESSIONS_WRAP_ID +
            '">' +
            '<div id="' +
            LIST_ID +
            '" class="cc-asistencia-recurso-modal__session-list"></div>' +
            '<div class="cc-asistencia-recurso-modal__add-row">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' +
            ADD_ID +
            '"><span>Agregar sesión</span></button>' +
            '</div>' +
            '</div></div></div>'
        );
    }

    function updateFreeHint(overlay) {
        var hint = overlay.querySelector('#cc-asistencia-free-hint');
        if (!hint) return;
        hint.textContent =
            'Si está activa, el participante confirma su propia asistencia. Si está desactivada, ' +
            'el administrador es quien confirma la asistencia de los participantes.';
    }

    function syncFreeUi(overlay) {
        var wrap = overlay.querySelector('#' + SESSIONS_WRAP_ID);
        var sw = overlay.querySelector('#' + FREE_ID);
        if (sw) sw.checked = !!_autoAsistencia;
        if (wrap) wrap.hidden = false;
        updateFreeHint(overlay);
        syncConfirmBtn(overlay);
    }

    function renderSessionList(overlay) {
        var list = overlay.querySelector('#' + LIST_ID);
        if (!list) return;
        if (!_sessions.length) {
            list.innerHTML =
                '<p class="ubits-body-sm-regular cc-asistencia-recurso-modal__hint">Añade al menos una sesión.</p>';
            syncConfirmBtn(overlay);
            return;
        }

        list.innerHTML = _sessions
            .map(function (session, index) {
                var locked = !!_lockedIds[session.id];
                var sid = esc(session.id);
                return (
                    '<div class="cc-asistencia-session-card' +
                    (locked ? ' is-locked' : '') +
                    '" data-session-id="' +
                    sid +
                    '">' +
                    '<div class="cc-asistencia-session-card__top">' +
                    '<label class="ubits-body-sm-bold" for="cc-asistencia-name-' +
                    sid +
                    '">Nombre de la sesión</label>' +
                    (locked
                        ? ''
                        : '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--sm ubits-button--icon-only" data-asistencia-remove="' +
                          sid +
                          '" aria-label="Eliminar sesión" data-tooltip="Eliminar sesión"><i class="far fa-trash"></i></button>') +
                    '</div>' +
                    '<div class="cc-asistencia-session-card__name">' +
                    '<input type="text" id="cc-asistencia-name-' +
                    sid +
                    '" class="ubits-input ubits-input--md" maxlength="80" placeholder="Nombre de la sesión" aria-label="Nombre de la sesión" value="' +
                    esc(session.name) +
                    '"' +
                    (locked ? ' disabled' : '') +
                    '>' +
                    '</div>' +
                    (locked
                        ? '<p class="ubits-body-sm-regular cc-asistencia-recurso-modal__hint">Esta sesión ya ocurrió y no se puede editar ni eliminar.</p>'
                        : '') +
                    '<div class="cc-asistencia-session-card__fields">' +
                    '<div id="cc-asistencia-date-' +
                    sid +
                    '"></div>' +
                    '<div id="cc-asistencia-start-' +
                    sid +
                    '"></div>' +
                    '<div id="cc-asistencia-end-' +
                    sid +
                    '"></div>' +
                    '</div></div>'
                );
            })
            .join('');

        _sessions.forEach(function (session, index) {
            var locked = !!_lockedIds[session.id];
            var card = list.querySelector('[data-session-id="' + session.id + '"]');
            if (!card) return;
            var nameInput = card.querySelector('.cc-asistencia-session-card__name input');
            if (nameInput && !locked) {
                nameInput.addEventListener('input', function () {
                    session.name = nameInput.value;
                });
                nameInput.addEventListener('blur', function () {
                    var next = String(nameInput.value || '').trim() || defaultSessionName(index);
                    session.name = next;
                    nameInput.value = next;
                });
            }

            if (typeof global.createInput !== 'function') return;
            var inputState = locked ? 'disabled' : 'default';
            global.createInput({
                containerId: 'cc-asistencia-date-' + session.id,
                type: 'calendar',
                label: 'Fecha',
                size: 'md',
                value: session.date,
                placeholder: 'dd/mm/aaaa',
                mandatory: true,
                mandatoryType: 'obligatorio',
                state: inputState,
                onChange: function (val) {
                    if (locked) return;
                    session.date = String(val || '');
                    syncConfirmBtn(overlay);
                },
            });
            global.createInput({
                containerId: 'cc-asistencia-start-' + session.id,
                type: 'text',
                label: 'Hora inicio',
                size: 'md',
                value: session.startTime,
                placeholder: '09:00',
                mandatory: true,
                mandatoryType: 'obligatorio',
                state: inputState,
                onChange: function (val) {
                    if (locked) return;
                    session.startTime = String(val || '');
                    syncConfirmBtn(overlay);
                },
            });
            global.createInput({
                containerId: 'cc-asistencia-end-' + session.id,
                type: 'text',
                label: 'Hora fin',
                size: 'md',
                value: session.endTime,
                placeholder: '10:00',
                mandatory: true,
                mandatoryType: 'obligatorio',
                state: inputState,
                onChange: function (val) {
                    if (locked) return;
                    session.endTime = String(val || '');
                    syncConfirmBtn(overlay);
                },
            });
        });

        if (typeof global.initTooltip === 'function') {
            global.initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
        }
        syncConfirmBtn(overlay);
    }

    function asistenciaRecursoRenderedHtml(payload) {
        payload = payload || {};
        var instructions = String(payload.instructionsHtml || '').trim();
        var sessions = payload.sessions || [];
        var instructionsBlock = instructions
            ? '<div class="cc-asistencia-rendered__instructions ubits-body-md-regular">' +
              instructions +
              '</div>'
            : '';
        var sessionsHtml;
        if (!sessions.length) {
            sessionsHtml = '<p class="ubits-body-md-regular cc-asistencia-rendered__free">Sin sesiones</p>';
        } else {
            sessionsHtml =
                '<ul class="cc-asistencia-rendered__list">' +
                sessions
                    .map(function (session) {
                        var windowLabel = formatSessionWindow(session.startIso, session.endIso);
                        return (
                            '<li class="cc-asistencia-rendered__item">' +
                            '<p class="ubits-body-md-semibold cc-asistencia-rendered__label">' +
                            esc(session.label || 'Sesión') +
                            '</p>' +
                            (windowLabel
                                ? '<p class="ubits-body-sm-regular cc-asistencia-rendered__window">' +
                                  esc(windowLabel) +
                                  '</p>'
                                : '') +
                            '</li>'
                        );
                    })
                    .join('') +
                '</ul>';
        }

        return (
            '<div class="ubits-resources-block cc-asistencia-rendered" data-cc-asistencia-rendered="true">' +
            '<div class="cc-asistencia-rendered__widget">' +
            '<p class="ubits-body-md-bold cc-asistencia-rendered__heading">Instrucciones</p>' +
            instructionsBlock +
            '<p class="ubits-body-md-bold cc-asistencia-rendered__heading-sessions">Sesiones</p>' +
            sessionsHtml +
            '</div>' +
            '<div class="cc-asistencia-rendered__footer">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="cc-editar-asistencia-recurso">' +
            '<i class="far fa-pencil"></i><span>Editar</span></button>' +
            '</div></div>'
        );
    }

    function confirmFromOverlay(overlay) {
        if (!canConfirm()) return;
        var instructionsHtml =
            typeof global.getRichTextHtml === 'function' ? global.getRichTextHtml('#' + RTE_ID) : '';
        var builtSessions = _sessions.map(function (draft, index) {
            return {
                id: draft.id,
                label: sessionNameFromDraft(draft, index),
                startIso: toIso(draft.date, draft.startTime),
                endIso: toIso(draft.date, draft.endTime),
            };
        });
        var payload = {
            instructionsHtml: instructionsHtml,
            sessions: builtSessions,
            autoAsistencia: !!_autoAsistencia,
            gradingEnabled: false,
            passingScore: null,
        };
        _confirmed = true;
        var cb = _onReady;
        _onReady = null;
        _onDismiss = null;
        _onBack = null;
        closeOverlay();
        if (typeof cb === 'function') cb(payload);
    }

    function openAsistenciaRecursoModal(opts) {
        opts = opts || {};
        if (typeof global.openModal !== 'function') {
            console.warn('[asistencia-recurso-modal] modal.js no está cargado.');
            return;
        }

        _confirmed = false;
        _goingBack = false;
        _onReady = typeof opts.onReady === 'function' ? opts.onReady : null;
        _onDismiss = typeof opts.onDismiss === 'function' ? opts.onDismiss : null;
        _onBack = typeof opts.onBack === 'function' ? opts.onBack : null;
        _lockPast = !!opts.lockPastSessions;
        var initial = opts.initialData || null;
        _sessions = draftsFromInitial(initial && initial.sessions);
        _autoAsistencia = !!(initial && initial.autoAsistencia);
        _lockedIds = {};
        if (_lockPast && initial && initial.sessions) {
            initial.sessions.forEach(function (s) {
                if (s && s.id && isSessionDatePast(s.startIso)) _lockedIds[s.id] = true;
            });
        }

        setTimeout(function () {
            var overlay = global.openModal({
                overlayId: OVERLAY_ID,
                title: 'Agregar asistencia',
                bodyHtml: buildBodyHtml(),
                footerHtml:
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' +
                    CONFIRM_ID +
                    '" disabled><span>Confirmar</span></button>',
                size: 'full',
                closeOnOverlayClick: false,
                onClose: handleDismiss,
            });
            if (!overlay) overlay = document.getElementById(OVERLAY_ID);
            if (!overlay) return;

            if (_onBack) {
                var header =
                    overlay.querySelector('.ubits-modal-header .ubits-modal-full-inner') ||
                    overlay.querySelector('.ubits-modal-header');
                if (header) {
                    var back = document.createElement('button');
                    back.type = 'button';
                    back.id = 'cc-asistencia-recurso-back';
                    back.className =
                        'ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only';
                    back.setAttribute('aria-label', 'Volver');
                    back.setAttribute('data-tooltip', 'Volver');
                    back.innerHTML = '<i class="far fa-arrow-left"></i>';
                    back.addEventListener('click', function () {
                        var cb = _onBack;
                        _goingBack = true;
                        _onReady = null;
                        _onDismiss = null;
                        _onBack = null;
                        closeOverlay();
                        if (typeof cb === 'function') cb();
                    });
                    header.insertBefore(back, header.firstChild);
                }
            }

            var rteMount = overlay.querySelector('#cc-asistencia-rte-mount');
            if (rteMount) {
                rteMount.innerHTML = buildRteHtml(initial && initial.instructionsHtml);
                if (typeof global.initRichTextEditor === 'function') {
                    global.initRichTextEditor('#' + RTE_ID);
                }
            }

            var addBtn = overlay.querySelector('#' + ADD_ID);
            if (addBtn) {
                addBtn.addEventListener('click', function () {
                    _sessions.push({
                        id: newSessionId(),
                        name: defaultSessionName(_sessions.length),
                        date: '',
                        startTime: '09:00',
                        endTime: '10:00',
                    });
                    renderSessionList(overlay);
                });
            }

            overlay.addEventListener('click', function (ev) {
                var del = ev.target.closest('[data-asistencia-remove]');
                if (!del) return;
                var id = del.getAttribute('data-asistencia-remove');
                if (!id || _lockedIds[id]) return;
                _sessions = _sessions.filter(function (s) {
                    return s.id !== id;
                });
                renderSessionList(overlay);
            });

            var freeSw = overlay.querySelector('#' + FREE_ID);
            if (freeSw) {
                freeSw.addEventListener('change', function () {
                    _autoAsistencia = !!freeSw.checked;
                    syncFreeUi(overlay);
                });
            }

            var confirmBtn = overlay.querySelector('#' + CONFIRM_ID);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function () {
                    confirmFromOverlay(overlay);
                });
            }

            renderSessionList(overlay);
            syncFreeUi(overlay);
            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
            }
        }, 0);
    }

    global.openAsistenciaRecursoModal = openAsistenciaRecursoModal;
    global.asistenciaRecursoRenderedHtml = asistenciaRecursoRenderedHtml;
})(typeof window !== 'undefined' ? window : this);
