/**
 * LMS Creator — Recurso "Evaluación final"
 * Se monta dentro del paso Recursos de crear-contenido.html (no es una página aparte).
 *
 * API global (para integrarse con crear-contenido.js):
 *   window.rcMountEvalForm(mountEl, mainEl?)
 *
 * Nota: Esta implementación es standalone (HTML + CSS + JS vanilla) y usa componentes UBITS existentes:
 * - Buttons / IA button
 * - createInput (inputs)
 * - ai-panel (Panel = agente conversacional). Modal «Generar evaluación» = flujo KISS sin chat (un CTA).
 */
(function (global) {
    'use strict';

    // =====================================================================================
    // Port del flujo avanzado + agente conversacional (Mafe)
    // =====================================================================================

    function drEsc(s) {
        var d = document.createElement('div');
        d.textContent = String(s == null ? '' : s);
        return d.innerHTML;
    }

    function ensureRootId(root) {
        if (!root || root.id) return root;
        root.id = 'cc-eval-root-' + String(Date.now()) + '-' + Math.floor(Math.random() * 1e6);
        return root;
    }

    function refreshTooltips(root) {
        if (!root || typeof global.initTooltip !== 'function') return;
        ensureRootId(root);
        global.initTooltip('#' + root.id + ' [data-tooltip]');
    }

    function getActivePageKeyFromCrearContenido() {
        var active = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
        return active ? (active.getAttribute('data-paginas-creator-key') || 'default') : 'default';
    }

    // Estado por página (para no mezclar evaluaciones entre páginas del índice)
    var CC_EVAL_STATE = {}; // pageKey -> { config, questionsSnapshotHtml? }

    function ensurePageState(pageKey) {
        var k = String(pageKey || 'default');
        if (!CC_EVAL_STATE[k]) {
            CC_EVAL_STATE[k] = {
                config: {
                    title: '',
                    minScore: 70,
                    timeLimit: false,
                    timeLimitValue: 30,
                    limitAttempts: false,
                    attemptsValue: 3,
                    limitQPerAttempt: false,
                    qPerAttemptValue: 5,
                    questionsRandom: false,
                    answersRandom: false,
                    questionCount: 5,
                    difficulty: 'intermediate',
                    questionTypes: ['multiple_choice_single_answer']
                },
                questions: [],
                activeQId: 1
            };
        }
        return CC_EVAL_STATE[k];
    }

    function defaultQuestionModel() {
        return {
            type: 'multiple_choice_single',
            statement: '',
            options: [
                { text: '', correct: false },
                { text: '', correct: false }
            ]
        };
    }

    // ---------------------------
    // Builder avanzado (HTML)
    // ---------------------------

    function buildExamFormHtml() {
        return (
            '<div class="cc-eval-root" data-cc-eval-root>' +
            '  <div class="cc-eval-config-bar">' +
            '    <p class="ubits-body-sm-semibold cc-eval-config-title">Contenido de la evaluación</p>' +
            '    <button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso">' +
            '      <i class="far fa-trash-alt"></i><span>Eliminar</span>' +
            '    </button>' +
            '    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="cc-eval-cfg-btn">' +
            '      <i class="far fa-gear"></i><span>Configuración</span>' +
            '    </button>' +
            '    <span class="cc-eval-ia-actions">' +
            '    <button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm" id="cc-eval-ia-modal-btn">' +
            '      <i class="far fa-sparkles"></i><span>Modal</span>' +
            '    </button>' +
            '    <button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm" id="cc-eval-ia-btn">' +
            '      <i class="far fa-sparkles"></i><span>Panel</span>' +
            '    </button>' +
            '    </span>' +
            '  </div>' +
            '  <div id="cc-eval-q-list" class="cc-eval-q-list"></div>' +
            '  <button type="button" class="ubits-button ubits-button--secondary ubits-button--md cc-eval-add-q" id="cc-eval-add-q">' +
            '    <i class="far fa-plus"></i><span>Añadir pregunta</span>' +
            '  </button>' +
            '</div>'
        );
    }

    function ensureEmptyHost(rootEl) {
        if (!rootEl) return null;
        var existing = rootEl.querySelector('#ccEvalEmptyHost');
        if (existing) return existing;
        var host = document.createElement('div');
        host.id = 'ccEvalEmptyHost';
        // Insertar debajo de la barra superior (y debajo del undo banner si existe)
        var undo = rootEl.querySelector('#cc-eval-undo-banner');
        if (undo && undo.parentNode === rootEl) {
            rootEl.insertBefore(host, undo.nextSibling);
            return host;
        }
        var bar = rootEl.querySelector('.cc-eval-config-bar');
        if (bar && bar.parentNode === rootEl) {
            rootEl.insertBefore(host, bar.nextSibling);
            return host;
        }
        rootEl.insertBefore(host, rootEl.firstChild);
        return host;
    }

    function renderEmptyStateIfNeeded(rootEl, onAddQuestion) {
        var qList = rootEl.querySelector('#cc-eval-q-list');
        if (!qList) return;
        var addBtn = rootEl.querySelector('#cc-eval-add-q');
        var hasQuestions = qList.querySelectorAll('[data-learn-question]').length > 0;
        if (hasQuestions) {
            var hostExisting = rootEl.querySelector('#ccEvalEmptyHost');
            if (hostExisting) hostExisting.remove();
            if (addBtn) addBtn.style.display = '';
            return;
        }
        if (typeof global.loadEmptyState !== 'function') return;
        if (addBtn) addBtn.style.display = 'none';
        var host = ensureEmptyHost(rootEl);
        if (!host) return;
        // Evitar re-render inútil si ya está montado (conserva handlers)
        if (host.classList && host.classList.contains('ubits-empty-state')) return;
        global.loadEmptyState('ccEvalEmptyHost', {
            icon: 'fa-clipboard-check',
            title: 'No has creado preguntas',
            description: 'Añade preguntas para validar que tus estudiantes han comprendido el contenido que has creado.',
            buttons: {
                secondary: {
                    text: 'Añadir pregunta',
                    icon: 'fa-plus',
                    onClick: function () {
                        if (typeof onAddQuestion === 'function') onAddQuestion();
                    }
                }
            }
        });
    }

    function snapshotModelsFromApis(rootEl) {
        var apis = rootEl && rootEl._ccEvalLqApis ? rootEl._ccEvalLqApis : [];
        return apis.map(function (api) { return api && typeof api.getModel === 'function' ? api.getModel() : null; }).filter(Boolean);
    }

    function ensureQuestionErrors(pageState, count) {
        if (!pageState) return [];
        if (!Array.isArray(pageState.questionErrors)) pageState.questionErrors = [];
        for (var i = pageState.questionErrors.length; i < count; i++) pageState.questionErrors[i] = false;
        if (pageState.questionErrors.length > count) pageState.questionErrors = pageState.questionErrors.slice(0, count);
        return pageState.questionErrors;
    }

    function setQuestionError(pageState, qId, hasError) {
        if (!pageState) return;
        ensureQuestionErrors(pageState, (pageState.questions || []).length);
        var idx = Number(qId) - 1;
        if (idx < 0) return;
        pageState.questionErrors[idx] = !!hasError;
    }

    function getQuestionError(pageState, qId) {
        if (!pageState || !Array.isArray(pageState.questionErrors)) return false;
        var idx = Number(qId) - 1;
        return idx >= 0 && idx < pageState.questionErrors.length ? !!pageState.questionErrors[idx] : false;
    }

    function validateApi(api) {
        if (!api || typeof api.validate !== 'function') return { ok: true, missing: {} };
        return api.validate() || { ok: true, missing: {} };
    }

    function wireActiveAutoRecovery(rootEl, pageState) {
        if (!rootEl) return;
        // Evitar múltiples listeners si re-renderizamos
        if (rootEl._ccEvalAutoRecoverWired) return;
        rootEl._ccEvalAutoRecoverWired = true;

        function maybeRecover() {
            if (!rootEl || !rootEl._ccEvalLqApis) return;
            var active = rootEl._ccEvalActiveQId ? Number(rootEl._ccEvalActiveQId) : 1;
            var api = rootEl._ccEvalLqApis[active - 1];
            if (!api) return;
            // Importante: NO re-renderizar en cada tecla. Solo recuperamos de error → ok.
            // Además, corremos esto async para permitir que `createInput` actualice el model primero.
            setTimeout(function () {
                // Solo aplica si la pregunta estaba en error (edit_error). En edit normal no escalamos a error.
                if (!getQuestionError(pageState, active)) return;
                var v = validateApi(api);
                if (!v.ok) return;
                setQuestionError(pageState, active, false);
                applyFocusModes(rootEl); // hará el único setMode necesario (edit)
            }, 0);
        }

        // input/change dentro del root → revalidar la activa
        rootEl.addEventListener('input', function () { maybeRecover(); }, true);
        rootEl.addEventListener('change', function () { maybeRecover(); }, true);
    }

    function applyFocusModes(rootEl) {
        var apis = rootEl && rootEl._ccEvalLqApis ? rootEl._ccEvalLqApis : [];
        var active = rootEl && rootEl._ccEvalActiveQId ? Number(rootEl._ccEvalActiveQId) : 1;
        var pageState = rootEl && rootEl._ccEvalPageState ? rootEl._ccEvalPageState : null;
        if (pageState) ensureQuestionErrors(pageState, apis.length);
        apis.forEach(function (api, idx) {
            if (!api || typeof api.setMode !== 'function') return;
            var qId = idx + 1;
            var hasErr = pageState ? getQuestionError(pageState, qId) : false;
            if (qId === active) api.setMode(hasErr ? 'edit_error' : 'edit');
            else api.setMode(hasErr ? 'read_error' : 'read');
        });
        refreshTooltips(rootEl);
    }

    function renderQuestions(rootEl, pageState) {
        var qList = rootEl.querySelector('#cc-eval-q-list');
        if (!qList) return { qSeq: 0 };

        var questions = (pageState && Array.isArray(pageState.questions)) ? pageState.questions : [];
        qList.innerHTML = '';
        rootEl._ccEvalLqApis = [];
        ensureQuestionErrors(pageState, questions.length);

        var active = pageState && pageState.activeQId ? Number(pageState.activeQId) : 1;
        if (!questions.length) active = 1;
        if (active < 1) active = 1;
        if (questions.length && active > questions.length) active = questions.length;
        pageState.activeQId = active;
        rootEl._ccEvalActiveQId = active;

        questions.forEach(function (q, idx) {
            var qId = idx + 1;
            var mountId = 'cc-eval-lq-q-' + qId;
            var mount = document.createElement('div');
            mount.id = mountId;
            qList.appendChild(mount);

            if (typeof global.createLearnQuestion === 'function') {
                var api = global.createLearnQuestion({
                    containerId: mountId,
                    qId: qId,
                    mode: qId === active ? (getQuestionError(pageState, qId) ? 'edit_error' : 'edit') : (getQuestionError(pageState, qId) ? 'read_error' : 'read'),
                    model: q,
                    onDelete: function (delId) {
                        pageState.questions = snapshotModelsFromApis(rootEl);
                        var iDel = Number(delId) - 1;
                        if (iDel >= 0 && iDel < pageState.questions.length) pageState.questions.splice(iDel, 1);
                        // Ajustar errores al borrar (mismo índice)
                        ensureQuestionErrors(pageState, pageState.questions.length + 1);
                        if (Array.isArray(pageState.questionErrors)) pageState.questionErrors.splice(iDel, 1);
                        if (!pageState.questions.length) pageState.activeQId = 1;
                        else pageState.activeQId = Math.min(pageState.activeQId, pageState.questions.length);
                        rootEl._ccEvalActiveQId = pageState.activeQId;
                        renderQuestions(rootEl, pageState);
                        renderEmptyStateIfNeeded(rootEl, function () { addQuestionAndFocus(rootEl, pageState); });
                    },
                    onRequestFocus: function (focusId) {
                        // Antes de cambiar foco: validar la activa y dejarla en read/read_error
                        var prevActive = rootEl && rootEl._ccEvalActiveQId ? Number(rootEl._ccEvalActiveQId) : 1;
                        var prevApi = rootEl && rootEl._ccEvalLqApis ? rootEl._ccEvalLqApis[prevActive - 1] : null;
                        if (prevApi) {
                            var vPrev = validateApi(prevApi);
                            setQuestionError(pageState, prevActive, !vPrev.ok);
                        }

                        // Persistir modelos actuales antes de cambiar de pregunta
                        pageState.questions = snapshotModelsFromApis(rootEl);
                        pageState.activeQId = Number(focusId) || 1;
                        rootEl._ccEvalActiveQId = pageState.activeQId;

                        // Al entrar: si tiene error → edit_error; si no → edit
                        applyFocusModes(rootEl);
                    }
                });
                rootEl._ccEvalLqApis.push(api);
            }
        });

        rootEl._ccEvalQSeq = questions.length;
        refreshTooltips(rootEl);
        wireActiveAutoRecovery(rootEl, pageState);
        renderEmptyStateIfNeeded(rootEl, function () { addQuestionAndFocus(rootEl, pageState); });
        return { qSeq: questions.length };
    }

    function addQuestionAndFocus(rootEl, pageState) {
        // Antes de crear una nueva: la pregunta activa pierde foco → validar y registrar error si aplica.
        var prevActive = rootEl && rootEl._ccEvalActiveQId ? Number(rootEl._ccEvalActiveQId) : 1;
        var prevApi = rootEl && rootEl._ccEvalLqApis ? rootEl._ccEvalLqApis[prevActive - 1] : null;
        if (prevApi) {
            var vPrev = validateApi(prevApi);
            setQuestionError(pageState, prevActive, !vPrev.ok);
        }

        pageState.questions = snapshotModelsFromApis(rootEl);
        pageState.questions.push(defaultQuestionModel());
        pageState.activeQId = pageState.questions.length;
        rootEl._ccEvalActiveQId = pageState.activeQId;
        ensureQuestionErrors(pageState, pageState.questions.length);
        // Nueva pregunta: NO debe arrancar en error. El error solo se registra al salir de foco.
        setQuestionError(pageState, pageState.activeQId, false);
        renderQuestions(rootEl, pageState);
        applyFocusModes(rootEl);
    }

    function qTypeIcon(type) {
        var icons = {
            multiple_choice_single: 'fa-circle-dot',
            multiple_choice_multiple: 'fa-square-check',
            true_false: 'fa-toggle-on',
            instruction: 'fa-align-left',
            short_answer: 'fa-keyboard',
            essay: 'fa-comment-lines',
            matching: 'fa-arrows-left-right',
            fill_blank: 'fa-underline',
            open_ended: 'fa-pen-line',
            rating_scale: 'fa-star-half-stroke'
        };
        return icons[type] || 'fa-circle-question';
    }

    function addExamQuestion(root, qId) {
        var qList = root.querySelector('#cc-eval-q-list');
        if (!qList) return;

        var defType = 'multiple_choice_single';
        var typeOpts = [
            { value: 'multiple_choice_single', label: 'Opción múltiple, única respuesta' },
            { value: 'multiple_choice_multiple', label: 'Opción múltiple, múltiple respuesta' },
            { value: 'true_false', label: 'Verdadero / Falso' },
            { value: 'instruction', label: 'Instrucción' },
            { value: 'short_answer', label: 'Pregunta corta' },
            { value: 'essay', label: 'Ensayo' },
            { value: 'matching', label: 'Emparejamiento' },
            { value: 'fill_blank', label: 'Palabra faltante' }
        ];

        var card = document.createElement('div');
        card.className = 'cc-exam-q-card';
        card.setAttribute('data-q-id', String(qId));
        card.setAttribute('data-q-current-type', defType);

        card.innerHTML =
            '<div class="cc-exam-q-card__header">' +
            '  <span class="cc-exam-q-badge">' +
            '    <i class="far ' + qTypeIcon(defType) + ' cc-exam-q-type-icon" id="cc-eval-q-' + qId + '-type-icon"></i>' +
            '    <span class="ubits-body-sm-semibold cc-exam-q-badge__num">Pregunta ' + qId + '</span>' +
            '  </span>' +
            '</div>' +
            '<div class="cc-exam-q-type-section">' +
            '  <div id="cc-eval-q-' + qId + '-type-wrap"></div>' +
            '</div>' +
            '<div id="cc-eval-q-' + qId + '-stmt-wrap"></div>' +
            '<p class="cc-exam-q-hint ubits-body-xs-regular" id="cc-eval-q-' + qId + '-hint">Debes tener al menos dos opciones y una marcada como correcta</p>' +
            '<div class="cc-exam-q-options" id="cc-eval-q-' + qId + '-options"></div>' +
            '<div class="cc-exam-q-footer-addopt" id="cc-eval-q-' + qId + '-addopt-row">' +
            '  <button type="button" class="ubits-button ubits-button--secondary ubits-button--xs" id="cc-eval-q-' + qId + '-add-opt">' +
            '    <i class="far fa-plus"></i><span>Añadir opción de respuesta</span>' +
            '  </button>' +
            '</div>' +
            '<div class="cc-exam-q-footer-addpair" id="cc-eval-q-' + qId + '-addpair-row" style="display:none;">' +
            '  <button type="button" class="cc-exam-add-opt-link" id="cc-eval-q-' + qId + '-add-pair">+ Añadir pareja</button>' +
            '</div>' +
            '<div class="cc-exam-q-card__footer">' +
            '  <span class="ubits-body-xs-regular" style="color:var(--ubits-fg-2-medium)"> </span>' +
            '  <div class="cc-exam-q-card__footer-actions">' +
            '    <button type="button" class="ubits-button ubits-button--error-secondary ubits-button--xs cc-exam-q-elim-btn">' +
            '      <i class="far fa-trash"></i><span>Eliminar</span>' +
            '    </button>' +
            '    <button type="button" class="ubits-button ubits-button--primary ubits-button--xs cc-exam-q-save-card-btn">' +
            '      <i class="far fa-check"></i><span>Guardar</span>' +
            '    </button>' +
            '  </div>' +
            '</div>';

        qList.appendChild(card);

        if (typeof global.createInput === 'function') {
            global.createInput({
                containerId: 'cc-eval-q-' + qId + '-stmt-wrap',
                type: 'textarea',
                label: 'Enunciado de la pregunta',
                size: 'md',
                placeholder: 'Escribe la pregunta aquí...'
            });
            var typeApi = global.createInput({
                containerId: 'cc-eval-q-' + qId + '-type-wrap',
                type: 'select',
                size: 'md',
                label: 'Tipo de pregunta',
                showLabel: true,
                value: defType,
                placeholder: 'Selecciona un tipo',
                selectOptions: typeOpts.map(function (o) { return { value: o.value, text: o.label }; }),
                onChange: function (v) {
                    onQuestionTypeChange(root, qId, String(v || defType));
                }
            });
            card._ccTypeInputApi = typeApi;
        }

        // Initial MC options
        var optCont = card.querySelector('#cc-eval-q-' + qId + '-options');
        addQuestionOption(qId, optCont, 1, defType);
        addQuestionOption(qId, optCont, 2, defType);

        // El select de tipo se maneja via createInput (onChange)

        var elimBtn = card.querySelector('.cc-exam-q-elim-btn');
        if (elimBtn) {
            elimBtn.addEventListener('click', function () {
                card.remove();
                renumberQuestions(qList);
                renderEmptyStateIfNeeded(root, function () {
                    var nextId = (root._ccEvalQSeq || 0) + 1;
                    root._ccEvalQSeq = nextId;
                    addExamQuestion(root, nextId);
                });
            });
        }
        var saveBtn = card.querySelector('.cc-exam-q-save-card-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                if (typeof global.showToast === 'function') global.showToast('success', 'Cambios guardados.');
                try {
                    document.dispatchEvent(new CustomEvent('ubits-recursos-changed', { detail: { type: 'evaluacion', action: 'save-question' } }));
                } catch (e) { /* noop */ }
            });
        }

        // Al crear una pregunta, el empty state debe desaparecer y mostrarse el botón inferior.
        renderEmptyStateIfNeeded(root, root._ccEvalAddQuestion);
    }

    function renumberQuestions(qListEl) {
        var cards = qListEl.querySelectorAll('.cc-exam-q-card');
        cards.forEach(function (card, idx) {
            var numEl = card.querySelector('.cc-exam-q-badge__num');
            if (numEl) numEl.textContent = 'Pregunta ' + (idx + 1);
        });
    }

    function buildTrueFalseOptions(qId) {
        return ['Verdadero', 'Falso'].map(function (label, idx) {
            var val = idx === 0 ? 'true' : 'false';
            return (
                '<div class="cc-exam-opt-row cc-exam-opt-row--static">' +
                '<label class="ubits-radio ubits-radio--sm cc-exam-opt-correct" title="Marcar como correcta">' +
                '<input type="radio" class="ubits-radio__input cc-exam-opt-check" name="q-' + qId + '-correct" value="' + val + '" aria-label="Marcar como correcta">' +
                '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
                '<span class="ubits-radio__label ubits-body-sm-regular">' + drEsc(label) + '</span>' +
                '</label>' +
                '</div>'
            );
        }).join('');
    }

    function buildRatingScaleBlock(qId) {
        return (
            '<div class="cc-exam-rating-config">' +
            '<div class="cc-exam-rating-config__row">' +
            '<div id="cc-eval-q-' + qId + '-rating-min-wrap"></div>' +
            '<div id="cc-eval-q-' + qId + '-rating-max-wrap"></div>' +
            '</div>' +
            '<div class="cc-exam-rating-config__row">' +
            '<div id="cc-eval-q-' + qId + '-rating-minlbl-wrap"></div>' +
            '<div id="cc-eval-q-' + qId + '-rating-maxlbl-wrap"></div>' +
            '</div>' +
            '</div>'
        );
    }

    function initRatingScaleInputs(qId) {
        if (typeof global.createInput !== 'function') return;
        global.createInput({ containerId: 'cc-eval-q-' + qId + '-rating-min-wrap', type: 'number', label: 'Valor mínimo', size: 'sm', value: '1', min: 0 });
        global.createInput({ containerId: 'cc-eval-q-' + qId + '-rating-max-wrap', type: 'number', label: 'Valor máximo', size: 'sm', value: '5', min: 2 });
        global.createInput({ containerId: 'cc-eval-q-' + qId + '-rating-minlbl-wrap', type: 'text', label: 'Etiqueta mínimo', size: 'sm', placeholder: 'Ej: Muy malo' });
        global.createInput({ containerId: 'cc-eval-q-' + qId + '-rating-maxlbl-wrap', type: 'text', label: 'Etiqueta máximo', size: 'sm', placeholder: 'Ej: Excelente' });
    }

    function buildInstructionBlock(qId) {
        return (
            '<div class="cc-exam-instruction-block">' +
            '<div class="cc-exam-instruction-toolbar">' +
            '<button type="button" class="cc-exam-rt-btn" data-cmd="bold" aria-label="Negrita"><i class="far fa-bold"></i></button>' +
            '<button type="button" class="cc-exam-rt-btn" data-cmd="italic" aria-label="Cursiva"><i class="far fa-italic"></i></button>' +
            '<button type="button" class="cc-exam-rt-btn" data-cmd="underline" aria-label="Subrayado"><i class="far fa-underline"></i></button>' +
            '<span class="cc-exam-rt-sep" aria-hidden="true"></span>' +
            '<button type="button" class="cc-exam-rt-btn" data-cmd="insertOrderedList" aria-label="Lista ordenada"><i class="far fa-list-ol"></i></button>' +
            '<button type="button" class="cc-exam-rt-btn" data-cmd="insertUnorderedList" aria-label="Lista no ordenada"><i class="far fa-list-ul"></i></button>' +
            '</div>' +
            '<div class="cc-exam-instruction-editor ubits-body-sm-regular" id="cc-eval-q-' + qId + '-inst-editor" contenteditable="true" data-placeholder="Escribe una instrucción para el estudiante..."></div>' +
            '</div>'
        );
    }

    function initInstructionToolbar(container, qId) {
        var editor = container.querySelector('#cc-eval-q-' + qId + '-inst-editor');
        if (!editor) return;
        container.querySelectorAll('.cc-exam-rt-btn').forEach(function (btn) {
            var cmd = btn.getAttribute('data-cmd');
            if (!cmd) return;
            btn.addEventListener('mousedown', function (e) {
                e.preventDefault();
                editor.focus();
                try {
                    document.execCommand(cmd, false, null);
                } catch (err) {}
            });
        });
    }

    function buildShortAnswerBlock(qId) {
        return (
            '<div class="cc-exam-sa-block">' +
            '<div id="cc-eval-q-' + qId + '-sa-answer-wrap"></div>' +
            '<div class="cc-exam-sa-accuracy">' +
            '<p class="ubits-body-xs-semibold cc-exam-sa-accuracy__title">Define la exactitud de la respuesta</p>' +
            '<label class="cc-exam-sa-accuracy__opt"><input type="radio" name="q-' + qId + '-accuracy" value="exact" checked><span class="ubits-body-sm-regular">Exacta</span></label>' +
            '<label class="cc-exam-sa-accuracy__opt"><input type="radio" name="q-' + qId + '-accuracy" value="ignore_accents"><span class="ubits-body-sm-regular">Ignorar acentos</span></label>' +
            '<label class="cc-exam-sa-accuracy__opt"><input type="radio" name="q-' + qId + '-accuracy" value="any"><span class="ubits-body-sm-regular">Cualquier respuesta</span></label>' +
            '</div>' +
            '</div>'
        );
    }

    function buildEssayBlock(qId) {
        return (
            '<div class="cc-exam-essay-block">' +
            '<div id="cc-eval-q-' + qId + '-essay-minwords-wrap"></div>' +
            '<p class="cc-exam-essay-hint ubits-body-xs-regular">Ingresa un número entre 1 y 100 para el mínimo de palabras.</p>' +
            '</div>'
        );
    }

    function addMatchingPair(qId, container, pairNum) {
        var pair = document.createElement('div');
        pair.className = 'cc-exam-match-pair';
        pair.setAttribute('data-pair-id', String(pairNum));
        pair.innerHTML =
            '<div class="cc-exam-match-pair__header">' +
            '  <span class="ubits-body-xs-semibold cc-exam-match-pair__label">Pareja ' + pairNum + '</span>' +
            '  <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only cc-exam-match-del-btn" aria-label="Eliminar pareja"><i class="far fa-trash"></i></button>' +
            '</div>' +
            '<div id="cc-eval-match-' + qId + '-' + pairNum + '-a-wrap"></div>' +
            '<div id="cc-eval-match-' + qId + '-' + pairNum + '-b-wrap" style="margin-top:6px;"></div>';
        container.appendChild(pair);
        pair.querySelector('.cc-exam-match-del-btn').addEventListener('click', function () {
            if (container.querySelectorAll('.cc-exam-match-pair').length <= 2) {
                if (typeof global.showToast === 'function') global.showToast('warning', 'Mínimo 2 parejas.');
                return;
            }
            pair.remove();
        });
        if (typeof global.createInput === 'function') {
            global.createInput({ containerId: 'cc-eval-match-' + qId + '-' + pairNum + '-a-wrap', type: 'text', label: '', size: 'sm', showLabel: false, placeholder: 'Escribe una opción' });
            global.createInput({ containerId: 'cc-eval-match-' + qId + '-' + pairNum + '-b-wrap', type: 'text', label: '', size: 'sm', showLabel: false, placeholder: 'Escribe su par' });
        }
    }

    function addFillBlankOption(qId, container, optNum) {
        var row = document.createElement('div');
        row.className = 'cc-exam-fb-opt-row';
        row.setAttribute('data-opt-id', String(optNum));
        row.innerHTML =
            '<span class="cc-exam-fb-badge ubits-body-xs-semibold">{{' + optNum + '}}</span>' +
            '<div id="cc-eval-fb-' + qId + '-' + optNum + '-wrap" class="cc-exam-fb-opt-input"></div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only cc-exam-opt-del" aria-label="Eliminar opción"><i class="far fa-trash"></i></button>';
        container.appendChild(row);
        row.querySelector('.cc-exam-opt-del').addEventListener('click', function () {
            if (container.querySelectorAll('.cc-exam-fb-opt-row').length <= 2) {
                if (typeof global.showToast === 'function') global.showToast('warning', 'Mínimo 2 opciones.');
                return;
            }
            row.remove();
        });
        if (typeof global.createInput === 'function') {
            global.createInput({ containerId: 'cc-eval-fb-' + qId + '-' + optNum + '-wrap', type: 'text', label: '', size: 'sm', showLabel: false, placeholder: 'Escribe una opción de respuesta' });
        }
    }

    function addQuestionOption(qId, container, optNum, questionType) {
        if (!container) return;
        var row = document.createElement('div');
        row.className = 'cc-exam-opt-row';
        row.setAttribute('data-opt-id', String(optNum));
        var checkHtml =
            questionType === 'multiple_choice_multiple'
                ? '<label class="ubits-checkbox ubits-checkbox--sm cc-exam-opt-correct" title="Marcar como correcta">' +
                  '<input type="checkbox" class="ubits-checkbox__input cc-exam-opt-check" name="q-' + qId + '-correct" value="' + optNum + '" aria-label="Marcar como correcta">' +
                  '<span class="ubits-checkbox__box" aria-hidden="true"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
                  '<span class="ubits-checkbox__label ubits-body-sm-regular cc-exam-opt-label-hidden">Correcta</span>' +
                  '</label>'
                : '<label class="ubits-radio ubits-radio--sm cc-exam-opt-correct" title="Marcar como correcta">' +
                  '<input type="radio" class="ubits-radio__input cc-exam-opt-check" name="q-' + qId + '-correct" value="' + optNum + '" aria-label="Marcar como correcta">' +
                  '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
                  '<span class="ubits-radio__label ubits-body-sm-regular cc-exam-opt-label-hidden">Correcta</span>' +
                  '</label>';
        row.innerHTML =
            checkHtml +
            '<div id="cc-eval-opt-' + qId + '-' + optNum + '-wrap" class="cc-exam-opt-text"></div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only cc-exam-opt-del" aria-label="Eliminar opción"><i class="far fa-times"></i></button>';
        container.appendChild(row);
        if (typeof global.createInput === 'function') {
            global.createInput({
                containerId: 'cc-eval-opt-' + qId + '-' + optNum + '-wrap',
                type: 'text',
                label: '',
                showLabel: false,
                size: 'sm',
                placeholder: 'Escribe una opción de respuesta'
            });
        }
        row.querySelector('.cc-exam-opt-del').addEventListener('click', function () {
            if (container.querySelectorAll('.cc-exam-opt-row').length <= 2) {
                if (typeof global.showToast === 'function') global.showToast('warning', 'Mínimo 2 opciones por pregunta.');
                return;
            }
            row.remove();
        });
    }

    function onQuestionTypeChange(root, qId, newType) {
        var card = root.querySelector('[data-q-id="' + qId + '"]');
        if (!card) return;
        card.setAttribute('data-q-current-type', newType);
        var optCont = card.querySelector('#cc-eval-q-' + qId + '-options');
        var addOptRow = card.querySelector('#cc-eval-q-' + qId + '-addopt-row');
        var addOptBtn = card.querySelector('#cc-eval-q-' + qId + '-add-opt');
        var addPairRow = card.querySelector('#cc-eval-q-' + qId + '-addpair-row');
        var addPairBtn = card.querySelector('#cc-eval-q-' + qId + '-add-pair');
        var hintEl = card.querySelector('#cc-eval-q-' + qId + '-hint');
        var stmtWrap = card.querySelector('#cc-eval-q-' + qId + '-stmt-wrap');
        var typeIconEl = card.querySelector('#cc-eval-q-' + qId + '-type-icon');

        if (typeIconEl) typeIconEl.className = 'far ' + qTypeIcon(newType) + ' cc-exam-q-type-icon';
        if (optCont) optCont.innerHTML = '';
        if (addOptRow) addOptRow.style.display = 'none';
        if (addPairRow) addPairRow.style.display = 'none';

        if (stmtWrap) {
            var ta = stmtWrap.querySelector('textarea');
            if (ta) {
                if (newType === 'fill_blank') ta.placeholder = 'Oración a completar';
                else if (newType === 'essay') ta.placeholder = 'Escribe la pregunta o enunciado';
                else ta.placeholder = 'Escribe la pregunta aquí...';
            }
            stmtWrap.style.display = newType === 'instruction' ? 'none' : '';
        }

        if (hintEl) {
            if (newType === 'multiple_choice_single' || newType === 'multiple_choice_multiple') {
                hintEl.textContent = 'Debes tener al menos dos opciones y una marcada como correcta';
                hintEl.style.display = '';
            } else if (newType === 'fill_blank') {
                hintEl.textContent = 'Reemplaza cada palabra faltante con un marcador de doble llave y número. Usa el número de la opción correcta. Por ejemplo: {{2}}.';
                hintEl.style.display = '';
            } else {
                hintEl.style.display = 'none';
            }
        }

        if (newType === 'true_false') {
            if (optCont) optCont.innerHTML = buildTrueFalseOptions(qId);
            return;
        }

        if (newType === 'multiple_choice_single' || newType === 'multiple_choice_multiple') {
            var mcCount = 2;
            addQuestionOption(qId, optCont, 1, newType);
            addQuestionOption(qId, optCont, 2, newType);
            if (addOptRow) addOptRow.style.display = '';
            if (addOptBtn) {
                var newBtn = addOptBtn.cloneNode(true);
                addOptBtn.parentNode.replaceChild(newBtn, addOptBtn);
                newBtn.addEventListener('click', function () {
                    if (mcCount >= 6) {
                        if (typeof global.showToast === 'function') global.showToast('warning', 'Máximo 6 opciones por pregunta.');
                        return;
                    }
                    mcCount += 1;
                    addQuestionOption(qId, optCont, mcCount, newType);
                });
            }
            return;
        }

        if (newType === 'rating_scale') {
            if (optCont) optCont.innerHTML = buildRatingScaleBlock(qId);
            initRatingScaleInputs(qId);
            return;
        }

        if (newType === 'instruction') {
            if (optCont) {
                optCont.innerHTML = buildInstructionBlock(qId);
                initInstructionToolbar(optCont, qId);
            }
            return;
        }

        if (newType === 'short_answer') {
            if (optCont) optCont.innerHTML = buildShortAnswerBlock(qId);
            if (typeof global.createInput === 'function') {
                global.createInput({ containerId: 'cc-eval-q-' + qId + '-sa-answer-wrap', type: 'text', label: 'Escribe la respuesta correcta', size: 'md', placeholder: 'Respuesta correcta...' });
            }
            return;
        }

        if (newType === 'essay') {
            if (optCont) optCont.innerHTML = buildEssayBlock(qId);
            if (typeof global.createInput === 'function') {
                global.createInput({ containerId: 'cc-eval-q-' + qId + '-essay-minwords-wrap', type: 'number', label: 'Número mínimo de palabras (opcional)', size: 'md', min: 1, max: 100 });
            }
            return;
        }

        if (newType === 'matching') {
            var pairCount = 2;
            addMatchingPair(qId, optCont, 1);
            addMatchingPair(qId, optCont, 2);
            if (addPairRow) addPairRow.style.display = '';
            if (addPairBtn) {
                var newPairBtn = addPairBtn.cloneNode(true);
                addPairBtn.parentNode.replaceChild(newPairBtn, addPairBtn);
                newPairBtn.addEventListener('click', function () {
                    pairCount += 1;
                    addMatchingPair(qId, optCont, pairCount);
                });
            }
            return;
        }

        if (newType === 'fill_blank') {
            var fbCount = 2;
            addFillBlankOption(qId, optCont, 1);
            addFillBlankOption(qId, optCont, 2);
            if (addOptRow) addOptRow.style.display = '';
            if (addOptBtn) {
                var newFbBtn = addOptBtn.cloneNode(true);
                addOptBtn.parentNode.replaceChild(newFbBtn, addOptBtn);
                newFbBtn.addEventListener('click', function () {
                    fbCount += 1;
                    addFillBlankOption(qId, optCont, fbCount);
                });
            }
        }
    }

    // ---------------------------
    // Config modal (UBITS modal.js)
    // ---------------------------

    var CC_EVAL_CFG_MODAL_ID = 'cc-eval-config-modal';
    var CC_EVAL_IA_MODAL_ID = 'cc-eval-ia-modal';

    function openEvalConfigModal(pageState) {
        if (typeof global.openModal !== 'function') return;
        var cfg = pageState.config;

        global.openModal({
            overlayId: CC_EVAL_CFG_MODAL_ID,
            title: 'Configuración de la evaluación',
            bodyHtml:
                '<div class="cc-eval-cfg-body">' +
                '  <div id="cc-eval-minscore-wrap"></div>' +
                '  <div class="cc-eval-toggle-list">' +
                '    <div class="cc-eval-toggle-row">' +
                '      <span class="ubits-body-sm-regular">Preguntas en orden aleatorio</span>' +
                '      <label class="ubits-switch ubits-switch--md">' +
                '        <input type="checkbox" class="ubits-switch__input" id="cc-eval-shuffle-q">' +
                '        <span class="ubits-switch__track"><span class="ubits-switch__thumb"></span></span>' +
                '      </label>' +
                '    </div>' +
                '    <div class="cc-eval-toggle-row">' +
                '      <span class="ubits-body-sm-regular">Opciones de respuesta en orden aleatorio</span>' +
                '      <label class="ubits-switch ubits-switch--md">' +
                '        <input type="checkbox" class="ubits-switch__input" id="cc-eval-shuffle-opts">' +
                '        <span class="ubits-switch__track"><span class="ubits-switch__thumb"></span></span>' +
                '      </label>' +
                '    </div>' +
                '    <div class="cc-eval-toggle-row">' +
                '      <span class="ubits-body-sm-regular">Limitar número de intentos</span>' +
                '      <label class="ubits-switch ubits-switch--md">' +
                '        <input type="checkbox" class="ubits-switch__input" id="cc-eval-limit-attempts">' +
                '        <span class="ubits-switch__track"><span class="ubits-switch__thumb"></span></span>' +
                '      </label>' +
                '    </div>' +
                '    <div class="cc-eval-toggle-sub" id="cc-eval-limit-attempts-sub" style="display:none;">' +
                '      <div id="cc-eval-max-attempts-wrap"></div>' +
                '      <div id="cc-eval-attempts-msg-wrap" style="margin-top:10px;"></div>' +
                '    </div>' +
                '    <div class="cc-eval-toggle-row">' +
                '      <span class="ubits-body-sm-regular">Tiempo límite para responder</span>' +
                '      <label class="ubits-switch ubits-switch--md">' +
                '        <input type="checkbox" class="ubits-switch__input" id="cc-eval-time-limit">' +
                '        <span class="ubits-switch__track"><span class="ubits-switch__thumb"></span></span>' +
                '      </label>' +
                '    </div>' +
                '    <div class="cc-eval-toggle-sub" id="cc-eval-time-limit-sub" style="display:none;">' +
                '      <div id="cc-eval-time-limit-min-wrap"></div>' +
                '    </div>' +
                '    <div class="cc-eval-toggle-row">' +
                '      <span class="ubits-body-sm-regular">Limitar número de preguntas a mostrar por intento</span>' +
                '      <label class="ubits-switch ubits-switch--md">' +
                '        <input type="checkbox" class="ubits-switch__input" id="cc-eval-limit-q-per-attempt">' +
                '        <span class="ubits-switch__track"><span class="ubits-switch__thumb"></span></span>' +
                '      </label>' +
                '    </div>' +
                '    <div class="cc-eval-toggle-sub" id="cc-eval-limit-q-per-attempt-sub" style="display:none;">' +
                '      <div id="cc-eval-q-per-attempt-wrap"></div>' +
                '    </div>' +
                '  </div>' +
                '</div>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-eval-cfg-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-eval-cfg-save"><span>Guardar</span></button>',
            size: 'md',
            closeOnOverlayClick: true
        });

        // Init inputs + sync values
        if (typeof global.createInput === 'function') {
            var minWrap = document.getElementById('cc-eval-minscore-wrap');
            if (minWrap) {
                minWrap.innerHTML = '';
                global.createInput({
                    containerId: 'cc-eval-minscore-wrap',
                    type: 'number',
                    label: 'Porcentaje requerido para aprobar',
                    size: 'md',
                    placeholder: '70',
                    min: 0,
                    max: 100,
                    value: String(cfg.minScore || 70)
                });
            }
        }

        var sq = document.getElementById('cc-eval-shuffle-q');
        var so = document.getElementById('cc-eval-shuffle-opts');
        var la = document.getElementById('cc-eval-limit-attempts');
        var tl = document.getElementById('cc-eval-time-limit');
        var lq = document.getElementById('cc-eval-limit-q-per-attempt');
        if (sq) sq.checked = !!cfg.questionsRandom;
        if (so) so.checked = !!cfg.answersRandom;
        if (la) la.checked = !!cfg.limitAttempts;
        if (tl) tl.checked = !!cfg.timeLimit;
        if (lq) lq.checked = !!cfg.limitQPerAttempt;

        function updateConditional(toggleEl, subId, fieldsInit) {
            var sub = document.getElementById(subId);
            if (!toggleEl || !sub) return;
            function apply() {
                sub.style.display = toggleEl.checked ? '' : 'none';
                if (toggleEl.checked && typeof fieldsInit === 'function') fieldsInit();
            }
            toggleEl.addEventListener('change', apply);
            apply();
        }

        updateConditional(la, 'cc-eval-limit-attempts-sub', function () {
            if (typeof global.createInput !== 'function') return;
            var w1 = document.getElementById('cc-eval-max-attempts-wrap');
            var w2 = document.getElementById('cc-eval-attempts-msg-wrap');
            if (w1 && !w1.hasChildNodes()) {
                global.createInput({ containerId: 'cc-eval-max-attempts-wrap', type: 'number', label: 'Número de intentos', size: 'md', value: String(cfg.attemptsValue || 3), min: 1, placeholder: '3' });
            }
            if (w2 && !w2.hasChildNodes()) {
                global.createInput({ containerId: 'cc-eval-attempts-msg-wrap', type: 'textarea', label: 'Mensaje para el estudiante', size: 'md', value: '' });
            }
        });

        updateConditional(tl, 'cc-eval-time-limit-sub', function () {
            if (typeof global.createInput !== 'function') return;
            var w = document.getElementById('cc-eval-time-limit-min-wrap');
            if (w && !w.hasChildNodes()) {
                global.createInput({ containerId: 'cc-eval-time-limit-min-wrap', type: 'number', label: 'Tiempo límite en minutos', size: 'md', value: String(cfg.timeLimitValue || 30), min: 1, placeholder: '30' });
            }
        });

        updateConditional(lq, 'cc-eval-limit-q-per-attempt-sub', function () {
            if (typeof global.createInput !== 'function') return;
            var w = document.getElementById('cc-eval-q-per-attempt-wrap');
            if (w && !w.hasChildNodes()) {
                global.createInput({ containerId: 'cc-eval-q-per-attempt-wrap', type: 'number', label: 'Número de preguntas por intento', size: 'md', value: String(cfg.qPerAttemptValue || 5), min: 1, placeholder: '5' });
            }
        });

        function close() {
            if (typeof global.closeModal === 'function') global.closeModal(CC_EVAL_CFG_MODAL_ID);
        }

        var cancel = document.getElementById('cc-eval-cfg-cancel');
        var save = document.getElementById('cc-eval-cfg-save');
        if (cancel) cancel.addEventListener('click', close);
        if (save) {
            save.addEventListener('click', function () {
                var msInp = document.querySelector('#cc-eval-minscore-wrap input');
                var minScore = msInp ? parseInt(msInp.value, 10) : 70;
                if (isNaN(minScore) || minScore < 0 || minScore > 100) minScore = 70;
                cfg.minScore = minScore;
                cfg.questionsRandom = !!(sq && sq.checked);
                cfg.answersRandom = !!(so && so.checked);
                cfg.limitAttempts = !!(la && la.checked);
                cfg.timeLimit = !!(tl && tl.checked);
                cfg.limitQPerAttempt = !!(lq && lq.checked);
                var attInp = document.querySelector('#cc-eval-max-attempts-wrap input');
                var tlInp = document.querySelector('#cc-eval-time-limit-min-wrap input');
                var qpInp = document.querySelector('#cc-eval-q-per-attempt-wrap input');
                if (attInp) {
                    var av = parseInt(attInp.value, 10);
                    cfg.attemptsValue = isNaN(av) || av < 1 ? 3 : av;
                }
                if (tlInp) {
                    var tv = parseInt(tlInp.value, 10);
                    cfg.timeLimitValue = isNaN(tv) || tv < 1 ? 30 : tv;
                }
                if (qpInp) {
                    var qpv = parseInt(qpInp.value, 10);
                    cfg.qPerAttemptValue = isNaN(qpv) || qpv < 1 ? 5 : qpv;
                }
                close();
                if (typeof global.showToast === 'function') global.showToast('success', 'Configuración guardada.');
            });
        }
    }

    // ---------------------------
    // Agente conversacional (AI Panel) — flujo rediseñado v2
    // Ruta A (rápida):  selección por defecto → material → confirmación con token button
    // Ruta B (larga):   Bottom Sheet Form config → material → count/difficulty/types → confirmación
    // ---------------------------

    var EVAL_AI_TOKEN_COST = 2;
    var EVAL_AI_TOPIC_DEFAULT = 'Resolución efectiva de conflictos en equipos de trabajo';

    // ---------------------------
    // Banco de 100 preguntas (tema: Resolución de conflictos en equipos)
    // ---------------------------
    var EVAL_QUESTION_BANK = {
        basic: [
            { stmt: '¿Qué es un conflicto en el contexto de un equipo de trabajo?', opts: ['Una discusión sin solución', 'Una situación de tensión entre personas con intereses distintos', 'Un problema técnico del proyecto', 'Una falta de recursos'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'El primer paso para resolver un conflicto en un equipo es:', opts: ['Ignorar la situación', 'Identificar y reconocer la existencia del conflicto', 'Escalar al director', 'Sancionar al responsable'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La escucha activa es clave para resolver conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Qué habilidad es fundamental para resolver conflictos efectivamente?', opts: ['Autoridad jerárquica', 'Empatía y comunicación asertiva', 'Rapidez en la decisión', 'Evitar la confrontación'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué significa "resolución colaborativa" de un conflicto?', opts: ['Que una parte gana y la otra cede', 'Que ambas partes buscan una solución que beneficie a todos', 'Que el líder decide sin consultar', 'Que se evita el tema'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Los conflictos siempre tienen un impacto negativo en los equipos.', opts: ['Verdadero', 'Falso'], correct: 1, agentType: 'binary' },
            { stmt: '¿Cuál de las siguientes es una señal temprana de conflicto en un equipo?', opts: ['Aumento de la productividad', 'Tensión en comunicaciones y reuniones', 'Mayor creatividad grupal', 'Reducción de errores'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'La mediación en un conflicto implica:', opts: ['Imponer una solución externa', 'Ignorar las emociones', 'Facilitar el diálogo entre las partes con ayuda de un tercero neutral', 'Separar físicamente a los involucrados'], correct: 2, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Evitar un conflicto es siempre la mejor estrategia.', opts: ['Verdadero', 'Falso'], correct: 1, agentType: 'binary' },
            { stmt: '¿Qué tipo de comunicación contribuye más a prevenir conflictos?', opts: ['Pasiva', 'Agresiva', 'Asertiva', 'Evasiva'], correct: 2, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál es el objetivo principal de resolver un conflicto en un equipo?', opts: ['Determinar quién tiene razón', 'Restaurar la colaboración y el enfoque en metas comunes', 'Sancionar a los involucrados', 'Eliminar las diferencias de opinión'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La falta de claridad en roles puede generar conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'Una causa común de conflictos en equipos es:', opts: ['El exceso de recursos', 'La ambigüedad en responsabilidades y expectativas', 'La alta motivación del equipo', 'La comunicación clara'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué significa "win-win" en resolución de conflictos?', opts: ['Que solo una parte gana', 'Que ambas partes obtienen beneficios', 'Que el conflicto se pospone', 'Que el conflicto se intensifica'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La empatía ayuda a desescalar conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Cuál es la actitud más adecuada al dar retroalimentación en un conflicto?', opts: ['Crítica generalizada', 'Descripción específica del comportamiento sin juicios de valor', 'Silencio total', 'Tono agresivo para enfatizar el punto'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'Un ambiente psicológicamente seguro en el equipo:', opts: ['Impide que surjan conflictos', 'Facilita que los conflictos se expresen y resuelvan de forma constructiva', 'Aumenta la competencia interna', 'No tiene relación con los conflictos'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Escuchar sin interrumpir es una técnica de resolución de conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Cuál de estos no es un estilo de manejo de conflictos?', opts: ['Colaboración', 'Evasión', 'Competencia', 'Delegación técnica'], correct: 3, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué debe hacer un líder al detectar un conflicto incipiente?', opts: ['Esperar a que escale', 'Intervenir oportunamente para facilitar el diálogo', 'Ignorarlo si no afecta resultados', 'Transferir a los involucrados a otros equipos'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La negociación es una herramienta útil en la resolución de conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'El estilo "acomodarse" en gestión de conflictos implica:', opts: ['Imponer la solución propia', 'Ceder a las demandas del otro para mantener la armonía', 'Buscar solución conjunta', 'Ignorar el conflicto'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál de estas prácticas reduce los conflictos por malentendidos?', opts: ['Usar lenguaje técnico complejo', 'Confirmar comprensión al final de cada conversación', 'Evitar reuniones del equipo', 'Comunicar solo por email'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Un conflicto no resuelto puede afectar la moral del equipo.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Qué es la inteligencia emocional en el contexto del conflicto?', opts: ['Ignorar las emociones propias', 'La capacidad de reconocer y gestionar emociones propias y ajenas', 'Actuar solo con lógica', 'Suprimir reacciones emocionales'], correct: 1, agentType: 'multiple_choice_single_answer' }
        ],
        intermediate: [
            { stmt: '¿Cuál es la diferencia entre un conflicto de tarea y uno de relación en un equipo?', opts: ['Son exactamente lo mismo', 'El de tarea se refiere a desacuerdos sobre el trabajo; el de relación involucra tensiones interpersonales', 'El de relación es más productivo', 'El de tarea siempre escala más'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'El modelo de Thomas-Kilmann identifica cuántos estilos de manejo de conflictos:', opts: ['3', '4', '5', '6'], correct: 2, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué estrategia es más efectiva cuando el conflicto involucra valores fundamentales diferentes?', opts: ['Competencia directa', 'Evasión temporal mientras se establece confianza', 'Compromiso inmediato', 'Mediación con un facilitador externo'], correct: 3, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Los conflictos de proceso (cómo se realiza el trabajo) pueden ser beneficiosos si se gestionan bien.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'Al aplicar escucha activa en un conflicto, ¿qué elementos son esenciales?', opts: ['Interrupción frecuente y reformulación agresiva', 'Contacto visual, parafraseo y preguntas abiertas', 'Hablar más que el interlocutor', 'Tomar notas sin confirmar comprensión'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál de estas acciones puede escalar un conflicto en vez de resolverlo?', opts: ['Usar "yo" en lugar de "tú"', 'Establecer un acuerdo de normas de diálogo', 'Generalizar con frases como "siempre" o "nunca"', 'Buscar intereses comunes'], correct: 2, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuándo es más apropiado usar el estilo "compromiso" en conflictos?', opts: ['Cuando el tiempo es crítico y la relación no importa', 'Cuando ambas partes tienen poder similar y una solución parcial es aceptable', 'Cuando una parte tiene toda la razón', 'Cuando el conflicto es de valores fundamentales'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La retroalimentación basada en hechos es más efectiva que la basada en interpretaciones.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'En un equipo con alta diversidad cultural, los conflictos suelen originarse más frecuentemente por:', opts: ['Diferencias salariales', 'Normas de comunicación y valores culturales diferentes', 'Exceso de creatividad', 'Alto desempeño individual'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál es la función del BATNA (Mejor alternativa a un acuerdo negociado) en un conflicto?', opts: ['Imponer la solución preferida', 'Conocer la opción mínima aceptable para mantener poder en la negociación', 'Evadir el conflicto indefinidamente', 'Escalar a la gerencia'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué técnica ayuda a separar personas del problema en la resolución de conflictos?', opts: ['Negociación posicional', 'Negociación basada en intereses (Fisher y Ury)', 'Arbitraje unilateral', 'Evasión sistemática'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Los conflictos mal gestionados pueden convertirse en oportunidades de innovación.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Cuál es el rol del facilitador en una sesión de resolución de conflictos?', opts: ['Decidir quién tiene razón', 'Guiar el proceso de diálogo de forma neutral sin imponer soluciones', 'Reemplazar al líder del equipo', 'Documentar sanciones'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'La comunicación no violenta (CNV) en conflictos incluye:', opts: ['Observación, sentimiento, necesidad, petición', 'Acusación, demanda, sanción, archivo', 'Juicio, evaluación, corrección, archivo', 'Amenaza, negación, imposición, cierre'], correct: 0, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué distingue a un mediador de un árbitro en la resolución de conflictos?', opts: ['El mediador decide; el árbitro facilita', 'El árbitro decide; el mediador facilita sin imponer', 'Ambos tienen el mismo rol', 'El árbitro es siempre externo; el mediador siempre interno'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La confianza previa entre integrantes del equipo facilita la resolución de conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Cuál es un síntoma de que un conflicto ha escalado al nivel de crisis?', opts: ['Reuniones más frecuentes', 'Parálisis en la toma de decisiones y ruptura de la comunicación', 'Mayor claridad en los roles', 'Incremento en la productividad'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuándo es adecuado usar el estilo "competencia" para resolver un conflicto?', opts: ['Cuando el tiempo no importa', 'En situaciones de emergencia donde se requiere decisión rápida', 'Cuando hay tiempo para construir consenso', 'En conflictos de valores'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'El "efecto halagador" en percepciones puede distorsionar la resolución de conflictos porque:', opts: ['Hace que se sobrevalore la posición del más querido', 'Facilita el acuerdo entre partes', 'Elimina sesgos cognitivos', 'Reduce la complejidad del conflicto'], correct: 0, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Documentar los acuerdos alcanzados tras un conflicto reduce la probabilidad de recaída.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'La técnica "reencuadre" en conflictos consiste en:', opts: ['Cambiar de opinión por presión', 'Reformular la situación desde una perspectiva diferente para facilitar nuevas soluciones', 'Ignorar las emociones del otro', 'Escalar el conflicto a la dirección'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál de los siguientes factores organizacionales contribuye más a la frecuencia de conflictos?', opts: ['Claridad en la visión', 'Ambigüedad de roles y recursos escasos', 'Retroalimentación continua', 'Autonomía del equipo'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? El estilo "colaboración" siempre requiere más tiempo que otros estilos de gestión de conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Qué papel juegan los acuerdos de equipo en la prevención de conflictos?', opts: ['Ninguno relevante', 'Establecen expectativas claras que reducen malentendidos futuros', 'Aumentan la burocracia', 'Solo sirven en equipos nuevos'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál de estos tipos de conflicto es generalmente más beneficioso para el equipo si se gestiona bien?', opts: ['Conflicto de relación', 'Conflicto de proceso', 'Conflicto de tarea', 'Conflicto de valores'], correct: 2, agentType: 'multiple_choice_single_answer' }
        ],
        advanced: [
            { stmt: '¿Cómo influye el sesgo de atribución en la escalada de conflictos interpersonales en equipos?', opts: ['No influye en conflictos laborales', 'Lleva a atribuir causas negativas al comportamiento ajeno mientras se justifica el propio, intensificando el conflicto', 'Siempre reduce la intensidad del conflicto', 'Solo afecta conflictos entre pares de distinto nivel jerárquico'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'En equipos de alto rendimiento, ¿cuál es la relación óptima entre conflicto de tarea y conflicto de relación?', opts: ['Ambos en niveles altos para maximizar creatividad', 'Conflicto de tarea moderado y conflicto de relación mínimo', 'Ambos minimizados para mantener armonía', 'Conflicto de relación elevado para generar debate'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La dinámica de pensamiento grupal puede generar conflictos encubiertos que afectan el desempeño a largo plazo.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'Al aplicar el modelo de negociación de Harvard en un conflicto organizacional, ¿qué principio es central?', opts: ['Mantener posiciones rígidas hasta llegar a un acuerdo', 'Separar a las personas del problema y centrarse en intereses, no posiciones', 'Evitar la comunicación directa entre las partes', 'Priorizar la ganancia unilateral'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál de los siguientes enfoques sistémicos es más efectivo para transformar culturas organizacionales con conflictos crónicos?', opts: ['Sanciones individuales frecuentes', 'Rediseño de estructuras de incentivos, roles y procesos de comunicación', 'Mayor vigilancia del comportamiento', 'Aislamiento de los generadores de conflicto'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué impacto tiene el conflicto de proceso no gestionado en la eficiencia de un equipo?', opts: ['Genera innovación sostenida', 'Genera redundancias, ambigüedad y pérdida de tiempo en coordinación', 'Mejora la distribución de roles', 'Reduce la burocracia interna'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La seguridad psicológica del equipo (Edmondson) es un predictor del manejo constructivo de conflictos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'En conflictos interculturales dentro de equipos globales, ¿qué dimensión de Hofstede es más relevante para predecir la tolerancia al conflicto abierto?', opts: ['Orientación al largo plazo', 'Individualismo vs. colectivismo', 'Distancia al poder', 'Indulgencia vs. restricción'], correct: 2, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál es la limitación más significativa del arbitraje como método de resolución de conflictos en equipos?', opts: ['Es demasiado lento', 'La solución impuesta puede generar resentimiento y reducir la apropiación del acuerdo', 'Solo funciona en contextos legales', 'No puede aplicarse en conflictos de relación'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cómo afecta la identidad de grupo (in-group/out-group) a la resolución de conflictos entre subgrupos dentro de un mismo equipo?', opts: ['La refuerza positivamente siempre', 'Puede generar sesgos que favorecen al propio subgrupo y dificultan soluciones imparciales', 'No tiene impacto medible', 'Simplifica la mediación al establecer grupos claros'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? El conflicto constructivo en equipos puede ser diseñado intencionalmente mediante técnicas como el "abogado del diablo".', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'Al diseñar una intervención para resolver un conflicto organizacional, ¿qué debe priorizarse en el diagnóstico inicial?', opts: ['Identificar al responsable del conflicto', 'Comprender las causas raíz, los intereses de cada parte y el contexto sistémico', 'Determinar la sanción más apropiada', 'Consultar solo al líder formal del equipo'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué diferencia a la negociación integrativa de la distributiva en el contexto de conflictos laborales?', opts: ['La integrativa busca repartir un recurso fijo; la distributiva amplía el valor disponible', 'La integrativa amplía el valor conjunto; la distributiva asume que los recursos son fijos y uno gana lo que pierde el otro', 'Ambas son equivalentes en resultados', 'La distributiva siempre produce mejores resultados a largo plazo'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? Los conflictos de valores requieren estrategias de resolución diferentes a los conflictos de tarea.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Cuál es el riesgo de aplicar la estrategia de "evasión" de forma reiterada ante un conflicto recurrente?', opts: ['Mejora la cohesión del equipo a largo plazo', 'El conflicto subyacente se intensifica y puede explotar de manera descontrolada', 'Reduce la frecuencia total de conflictos', 'Establece un patrón saludable de autonomía'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'En la práctica de la mediación transformativa, ¿cuál es el objetivo central en contraste con la mediación evaluativa?', opts: ['Alcanzar un acuerdo económico rápido', 'Transformar la calidad de la interacción entre las partes, no solo llegar a un acuerdo', 'Determinar la culpabilidad de cada parte', 'Documentar el conflicto para futuros litigios'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cómo puede el líder de un equipo diseñar estructuras preventivas ante conflictos recurrentes?', opts: ['Eliminando la diversidad de perfiles', 'Creando foros de retroalimentación periódica, roles claros y normas explícitas de comunicación', 'Reduciendo las interdependencias entre miembros', 'Aumentando la supervisión directa'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? La conciencia de los propios sesgos cognitivos mejora la calidad de las decisiones durante un conflicto.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: 'En una negociación multipartes dentro de un equipo, ¿cuál es el mayor desafío estructural?', opts: ['Definir el lugar físico de la negociación', 'Manejar coaliciones cambiantes y alinear intereses divergentes sin excluir voces', 'Documentar los acuerdos en tiempo real', 'Seleccionar al facilitador adecuado'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Cuál es la evidencia de que una cultura organizacional promueve la gestión constructiva de conflictos?', opts: ['Los conflictos son infrecuentes e invisibles', 'Los miembros pueden expresar desacuerdos sin miedo a repercusiones y existen canales formales para resolverlos', 'Las decisiones se toman sin debate', 'Solo los líderes tienen autoridad para señalar problemas'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué relación existe entre la interdependencia de tareas y la frecuencia de conflictos en equipos?', opts: ['Mayor interdependencia, menos conflictos', 'Mayor interdependencia, mayor probabilidad de conflictos si no hay coordinación efectiva', 'No existe relación demostrable', 'La interdependencia elimina el conflicto de relación'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Verdadero o falso? El feedback de 360° puede ser una herramienta preventiva ante conflictos de relación en equipos.', opts: ['Verdadero', 'Falso'], correct: 0, agentType: 'binary' },
            { stmt: '¿Cuál de estos enfoques teóricos explica mejor por qué los conflictos persistentes deterioran el capital social del equipo?', opts: ['Teoría de la motivación de Maslow', 'Teoría del intercambio social y el capital de confianza acumulado', 'Modelo DISC de comportamiento', 'Teoría X e Y de McGregor'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: 'Cuando un conflicto involucra a integrantes de distintos niveles jerárquicos, ¿qué riesgo adicional debe gestionarse?', opts: ['Mayor creatividad en la solución', 'Desequilibrio de poder que puede inhibir la expresión libre del miembro de menor rango', 'Agilidad en la resolución por claridad de autoridad', 'Reducción del conflicto por respeto a la jerarquía'], correct: 1, agentType: 'multiple_choice_single_answer' },
            { stmt: '¿Qué mide el "Índice de apertura al conflicto" en un equipo y por qué es relevante?', opts: ['La frecuencia de disputas formales', 'La disposición del equipo a expresar y gestionar desacuerdos de forma productiva, predictor de innovación y adaptabilidad', 'El número de sanciones aplicadas', 'El porcentaje de conflictos escalados a recursos humanos'], correct: 1, agentType: 'multiple_choice_single_answer' }
        ]
    };

    function genMockQuestions(topic, difficulty, count, questionTypes) {
        var pool = EVAL_QUESTION_BANK[difficulty] || EVAL_QUESTION_BANK.intermediate;
        var types = (questionTypes && questionTypes.length) ? questionTypes : ['multiple_choice_single_answer'];
        // Mezclar el pool (Fisher-Yates) para variedad
        var shuffled = pool.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
        }
        // Filtrar por tipos si se especificaron
        var filtered = types.length
            ? shuffled.filter(function (q) { return types.indexOf(q.agentType) !== -1; })
            : shuffled;
        if (!filtered.length) filtered = shuffled; // fallback si el tipo no existe en el pool
        var wanted = Math.min(count, filtered.length, shuffled.length);
        return filtered.slice(0, wanted).map(function (q, i) {
            return Object.assign({}, q, { agentType: types[i % types.length] });
        });
    }

    // ---------------------------
    // Helpers de UI del agente
    // ---------------------------

    function _evalSyncTokensBadges(remaining) {
        var n = parseInt(remaining, 10);
        if (isNaN(n) || n < 0) n = 0;
        if (typeof global.setAIPanelTokensBadgeValue === 'function') {
            global.setAIPanelTokensBadgeValue(n);
        }
        var mb = document.getElementById('cc-eval-ia-modal-tokens-badge');
        if (mb) {
            var numEl = mb.querySelector('.ubits-badge-tag__token-number');
            if (numEl) numEl.textContent = String(n);
            mb.setAttribute('aria-label', String(n) + ' tokens restantes');
        }
    }

    function cleanupEvalIaModalAlternate(rootEl) {
        if (typeof global.setAIPanelAlternateMount === 'function') global.setAIPanelAlternateMount(null);
        if (rootEl) rootEl._ccEvalIaUiMode = null;
    }

    function evalAgentCloseUiForGeneration(rootEl) {
        if (rootEl && rootEl._ccEvalIaUiMode === 'modal') {
            if (typeof global.closeModal === 'function') global.closeModal(CC_EVAL_IA_MODAL_ID);
            rootEl._ccEvalIaUiMode = null;
            return;
        }
        if (typeof global.closeAIPanel === 'function') global.closeAIPanel();
    }

    /** Lee valores de los Inputs del modal y devuelve un objeto config listo para generar. */
    function _evalReadModalFieldConfig(fieldApis, baseCfg) {
        var next = Object.assign({}, baseCfg || {});
        if (!fieldApis || !fieldApis.qCount || !fieldApis.difficulty || !fieldApis.minScore) return next;
        var q = parseInt(fieldApis.qCount.getValue(), 10);
        next.questionCount = isNaN(q) ? 10 : Math.min(20, Math.max(1, q));
        var d = String(fieldApis.difficulty.getValue() || '').trim();
        next.difficulty = ['basic', 'intermediate', 'advanced'].indexOf(d) !== -1 ? d : 'intermediate';
        var m = parseInt(fieldApis.minScore.getValue(), 10);
        if (isNaN(m)) next.minScore = 70;
        else next.minScore = Math.min(100, Math.max(0, m));
        return next;
    }

    /** Compositor estilo panel IA (textarea + adjuntos) dentro del modal de evaluación. */
    function _evalWireIaModalComposer(overlay) {
        var pendingImg = [];
        var pendingFiles = [];
        overlay._ccEvalModalPendingImages = pendingImg;
        overlay._ccEvalModalPendingFiles = pendingFiles;

        var fileIn = overlay.querySelector('#cc-eval-ia-modal-files');
        var attachBtn = overlay.querySelector('#cc-eval-ia-modal-attach');
        var ta = overlay.querySelector('#cc-eval-ia-modal-context-input');

        function escAttr(s) {
            return String(s == null ? '' : s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function renderImgs() {
            var strip = overlay.querySelector('#cc-eval-ia-modal-pending-images');
            if (!strip) return;
            if (!pendingImg.length) {
                strip.innerHTML = '';
                strip.style.display = 'none';
                return;
            }
            strip.style.display = 'flex';
            strip.innerHTML = pendingImg
                .map(function (src, idx) {
                    return (
                        '<div class="ai-panel__pending-img-wrap">' +
                        '<img src="' +
                        escAttr(src) +
                        '" alt="Imagen adjunta" class="ai-panel__pending-img" />' +
                        '<button type="button" class="ai-panel__pending-img-remove" data-cc-eval-pidx="' +
                        idx +
                        '" aria-label="Eliminar imagen">' +
                        '<i class="far fa-times"></i></button>' +
                        '</div>'
                    );
                })
                .join('');
            strip.querySelectorAll('[data-cc-eval-pidx]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var idx = Number(btn.getAttribute('data-cc-eval-pidx'));
                    if (isNaN(idx)) return;
                    pendingImg.splice(idx, 1);
                    renderImgs();
                });
            });
        }

        function renderFiles() {
            var strip = overlay.querySelector('#cc-eval-ia-modal-pending-files');
            if (!strip) return;
            if (!pendingFiles.length) {
                strip.innerHTML = '';
                strip.style.display = 'none';
                return;
            }
            strip.style.display = 'flex';
            strip.innerHTML = pendingFiles
                .map(function (f, idx) {
                    return (
                        '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close ai-panel__pending-file-chip">' +
                        '<i class="far fa-file-lines"></i><span class="ubits-chip__text">' +
                        escAttr((f && f.name) ? f.name : 'Archivo') +
                        '</span>' +
                        '<button type="button" class="ubits-chip__close ai-panel__pending-file-remove" data-cc-eval-fidx="' +
                        idx +
                        '" aria-label="Quitar archivo"><i class="far fa-times"></i></button>' +
                        '</span>'
                    );
                })
                .join('');
            strip.querySelectorAll('[data-cc-eval-fidx]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var idx = Number(btn.getAttribute('data-cc-eval-fidx'));
                    if (isNaN(idx)) return;
                    pendingFiles.splice(idx, 1);
                    renderFiles();
                });
            });
        }

        if (attachBtn && fileIn) {
            attachBtn.addEventListener('click', function () {
                fileIn.click();
            });
            fileIn.addEventListener('change', function () {
                var files = this.files;
                if (!files || !files.length) return;
                var toLoad = 0;
                var i;
                for (i = 0; i < files.length; i++) {
                    if (files[i].type && files[i].type.indexOf('image/') === 0) toLoad++;
                }
                var loaded = 0;
                for (var j = 0; j < files.length; j++) {
                    var file = files[j];
                    if (file.type && file.type.indexOf('image/') === 0) {
                        (function (f) {
                            var reader = new FileReader();
                            reader.onload = function () {
                                if (reader.result) pendingImg.push(String(reader.result));
                                loaded++;
                                if (loaded >= toLoad) renderImgs();
                            };
                            reader.readAsDataURL(f);
                        })(file);
                    } else {
                        pendingFiles.push({ name: file.name, type: file.type, size: file.size });
                    }
                }
                renderFiles();
                if (toLoad === 0) renderImgs();
                this.value = '';
            });
        }

        if (ta) {
            ta.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 140) + 'px';
            });
            var box = overlay.querySelector('.cc-eval-ia-modal-simple__composer');
            if (box) {
                box.addEventListener('mousedown', function (e) {
                    if (e.button !== 0) return;
                    if (e.target.closest('button')) return;
                    if (e.target === ta) return;
                    requestAnimationFrame(function () {
                        try {
                            ta.focus({ preventScroll: true });
                        } catch (err) {
                            ta.focus();
                        }
                    });
                });
            }
        }
    }

    function _evalModalHasContext(overlay) {
        var ta = overlay.querySelector('#cc-eval-ia-modal-context-input');
        var text = ta ? String(ta.value || '').trim() : '';
        var imgs = overlay._ccEvalModalPendingImages || [];
        var fds = overlay._ccEvalModalPendingFiles || [];
        return !!(text || imgs.length || fds.length);
    }

    function _evalBuildModalContextContent(overlay) {
        var ta = overlay.querySelector('#cc-eval-ia-modal-context-input');
        var text = ta ? String(ta.value || '').trim() : '';
        var imgs = overlay._ccEvalModalPendingImages || [];
        var fds = overlay._ccEvalModalPendingFiles || [];
        var parts = [];
        if (text) parts.push(text);
        fds.forEach(function (f) {
            parts.push('[Adjunto: ' + String((f && f.name) ? f.name : 'archivo') + ']');
        });
        if (imgs.length) parts.push('[' + imgs.length + ' imagen(es) adjunta(s)]');
        return parts.join('\n');
    }

    /** Monta los tres Inputs UBITS dentro del modal (tras insertarse en el DOM). */
    function _evalMountIaModalInputs(cfg, qCount, minSc, difficultyKey) {
        if (typeof global.createInput !== 'function') return null;
        var q = Math.min(20, Math.max(1, qCount));
        var diff = difficultyKey || 'intermediate';
        if (['basic', 'intermediate', 'advanced'].indexOf(diff) === -1) diff = 'intermediate';

        var apis = {};
        apis.qCount = global.createInput({
            containerId: 'cc-eval-ia-modal-wrap-qcount',
            type: 'number',
            label: 'Número de preguntas',
            showLabel: false,
            size: 'md',
            value: String(q),
            min: 1,
            max: 20,
            placeholder: '10'
        });
        apis.difficulty = global.createInput({
            containerId: 'cc-eval-ia-modal-wrap-difficulty',
            type: 'select',
            label: 'Nivel',
            showLabel: false,
            size: 'md',
            placeholder: 'Selecciona…',
            value: diff,
            selectOptions: [
                { value: 'basic', text: 'Básico' },
                { value: 'intermediate', text: 'Intermedio' },
                { value: 'advanced', text: 'Avanzado' }
            ]
        });
        var msVal = Number(minSc);
        if (isNaN(msVal)) msVal = 70;
        msVal = Math.min(100, Math.max(0, msVal));
        apis.minScore = global.createInput({
            containerId: 'cc-eval-ia-modal-wrap-minscore',
            type: 'number',
            label: 'Nota mínima para aprobar',
            showLabel: false,
            size: 'md',
            value: String(msVal),
            min: 0,
            max: 100,
            placeholder: '70',
            rightIcon: 'fa-percent'
        });
        return apis;
    }

    /** Asocia cada Input del modal al título visible (cabecera de tarjeta) para lectores de pantalla. */
    function _evalWireIaModalParamAria(overlay) {
        if (!overlay || !overlay.querySelector) return;
        var pairs = [
            ['cc-eval-ia-modal-wrap-qcount', 'cc-eval-ia-modal-title-qcount'],
            ['cc-eval-ia-modal-wrap-difficulty', 'cc-eval-ia-modal-title-difficulty'],
            ['cc-eval-ia-modal-wrap-minscore', 'cc-eval-ia-modal-title-minscore']
        ];
        for (var i = 0; i < pairs.length; i++) {
            var wrapId = pairs[i][0];
            var titleId = pairs[i][1];
            var wrap = overlay.querySelector('#' + wrapId);
            if (!wrap) continue;
            var input = wrap.querySelector('.ubits-input');
            if (input && overlay.querySelector('#' + titleId)) {
                input.setAttribute('aria-labelledby', titleId);
            }
        }
    }

    /**
     * Modal KISS: sin chat. Parámetros editables (preguntas, nivel, nota), contexto opcional y un CTA.
     * El panel conserva el agente conversacional completo.
     */
    function openEvalIaModal(rootEl) {
        if (typeof global.openModal !== 'function') return;
        var cfg =
            rootEl._ccEvalPageState && rootEl._ccEvalPageState.config
                ? rootEl._ccEvalPageState.config
                : {};
        var qCount = cfg.questionCount != null ? Number(cfg.questionCount) : 10;
        if (isNaN(qCount) || qCount < 1) qCount = 10;
        var minSc = cfg.minScore != null ? Number(cfg.minScore) : 70;
        if (isNaN(minSc)) minSc = 70;

        var cost = EVAL_AI_TOKEN_COST;
        var currentTokens = _evalGetTokens();
        var canAfford = currentTokens >= cost;
        var genDisabled = canAfford ? '' : ' disabled aria-disabled="true"';
        var genTitle = canAfford ? '' : ' title="No tienes suficientes tokens (' + cost + ' requeridos)."';

        var contextPh =
            'Adjunta un archivo o escribe detalladamente el tema del asunto de la evaluación';

        var bodyHtml =
            '<div class="cc-eval-ia-modal-simple">' +
            '<div class="cc-eval-ia-modal-simple__params">' +
            '<p class="ubits-body-sm-semibold cc-eval-ia-modal-simple__params-title">' +
            drEsc('Parámetros de la generación') +
            '</p>' +
            '<div class="cc-eval-ia-modal-simple__params-grid">' +
            '<div class="cc-eval-ia-modal-simple__param-card">' +
            '<div class="cc-eval-ia-modal-simple__param-head">' +
            '<div class="cc-eval-ia-modal-simple__param-accent" aria-hidden="true"><i class="far fa-list-ol"></i></div>' +
            '<span id="cc-eval-ia-modal-title-qcount" class="cc-eval-ia-modal-simple__param-label ubits-body-sm-bold">' +
            drEsc('Número de preguntas') +
            '</span></div>' +
            '<div id="cc-eval-ia-modal-wrap-qcount" class="cc-eval-ia-modal-simple__input-mount"></div>' +
            '</div>' +
            '<div class="cc-eval-ia-modal-simple__param-card">' +
            '<div class="cc-eval-ia-modal-simple__param-head">' +
            '<div class="cc-eval-ia-modal-simple__param-accent" aria-hidden="true"><i class="far fa-gauge"></i></div>' +
            '<span id="cc-eval-ia-modal-title-difficulty" class="cc-eval-ia-modal-simple__param-label ubits-body-sm-bold">' +
            drEsc('Nivel') +
            '</span></div>' +
            '<div id="cc-eval-ia-modal-wrap-difficulty" class="cc-eval-ia-modal-simple__input-mount"></div>' +
            '</div>' +
            '<div class="cc-eval-ia-modal-simple__param-card">' +
            '<div class="cc-eval-ia-modal-simple__param-head">' +
            '<div class="cc-eval-ia-modal-simple__param-accent" aria-hidden="true"><i class="far fa-bullseye"></i></div>' +
            '<span id="cc-eval-ia-modal-title-minscore" class="cc-eval-ia-modal-simple__param-label ubits-body-sm-bold">' +
            drEsc('Nota mínima para aprobar') +
            '</span></div>' +
            '<div id="cc-eval-ia-modal-wrap-minscore" class="cc-eval-ia-modal-simple__input-mount"></div>' +
            '</div>' +
            '</div></div>' +
            '<label class="ubits-body-sm-semibold cc-eval-ia-modal-simple__label" for="cc-eval-ia-modal-context-input">' +
            drEsc('Contexto para la IA') +
            '</label>' +
            '<div class="ubits-ia-chat-thread__input-area cc-eval-ia-modal-simple__composer-area">' +
            '<div class="ai-panel__input-box cc-eval-ia-modal-simple__composer">' +
            '<input type="file" id="cc-eval-ia-modal-files" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx" multiple hidden />' +
            '<div class="ai-panel__pending-images-strip" id="cc-eval-ia-modal-pending-images" style="display:none;"></div>' +
            '<div class="ai-panel__pending-files-strip" id="cc-eval-ia-modal-pending-files" style="display:none;"></div>' +
            '<textarea id="cc-eval-ia-modal-context-input" class="ai-panel__input ubits-body-md-regular" rows="2" placeholder="' +
            drEsc(contextPh) +
            '" aria-required="true"></textarea>' +
            '<div class="ai-panel__input-actions">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ai-panel__attach-btn" id="cc-eval-ia-modal-attach" aria-label="Adjuntar">' +
            '<i class="far fa-plus"></i>' +
            '</button>' +
            '<div class="ai-panel__input-spacer"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<button type="button" id="cc-eval-ia-modal-generate"' +
            genDisabled +
            genTitle +
            ' class="ubits-button ubits-button--primary ubits-button--md ubits-button--with-token-cost cc-eval-ia-modal-simple__cta">' +
            '<span class="ubits-button__token-cost" aria-hidden="true">' +
            '<i class="far fa-coin-vertical"></i>' +
            '<span class="ubits-button__token-number">' +
            String(cost) +
            '</span></span>' +
            '<span>Generar evaluación</span>' +
            '</button>' +
            '</div>';

        var overlay = global.openModal({
            overlayId: CC_EVAL_IA_MODAL_ID,
            title: 'Generar evaluación',
            bodyHtml: bodyHtml,
            size: 'md',
            onClose: function () {
                cleanupEvalIaModalAlternate(rootEl);
            }
        });

        overlay._ccEvalIaFieldApis = _evalMountIaModalInputs(cfg, qCount, minSc, cfg.difficulty || 'intermediate');
        _evalWireIaModalParamAria(overlay);
        _evalWireIaModalComposer(overlay);

        var svgIcon =
            '<i class="far fa-sparkles" style="font-size:16px;margin-right:8px;flex-shrink:0;background:linear-gradient(135deg,var(--modo-ia-gradient-a) 0%,var(--modo-ia-gradient-b) 35.59%,var(--modo-ia-gradient-c) 67.19%,var(--modo-ia-gradient-d) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;"></i>';

        var titleSpan = overlay.querySelector('.ubits-modal-title');
        if (titleSpan) {
            titleSpan.innerHTML =
                '<div style="display:flex; align-items:center;">' + svgIcon + 'Generar evaluación</div>';
        }

        var modalHeaderEl = overlay.querySelector('.ubits-modal-header');
        var closeBtnEl = overlay.querySelector('.ubits-modal-close');
        if (modalHeaderEl && closeBtnEl) {
            var actionsWrap = document.createElement('div');
            actionsWrap.style.display = 'inline-flex';
            actionsWrap.style.alignItems = 'center';
            actionsWrap.style.gap = 'var(--gap-sm)';

            var tokensBadge = document.createElement('span');
            tokensBadge.id = 'cc-eval-ia-modal-tokens-badge';
            tokensBadge.className = 'ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs';
            tokensBadge.setAttribute('tabindex', '0');
            tokensBadge.setAttribute('data-tooltip', 'Número de tokens restantes.');
            tokensBadge.setAttribute('data-tooltip-delay', '1000');
            tokensBadge.setAttribute('aria-label', currentTokens + ' tokens restantes');
            tokensBadge.innerHTML =
                '<span class="ubits-badge-tag__token-cost" aria-hidden="true">' +
                '<i class="far fa-coin-vertical"></i>' +
                '<span class="ubits-badge-tag__token-number">' +
                String(currentTokens) +
                '</span>' +
                '</span>';

            actionsWrap.appendChild(tokensBadge);
            actionsWrap.appendChild(closeBtnEl);
            modalHeaderEl.appendChild(actionsWrap);

            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#cc-eval-ia-modal-tokens-badge');
            }
        }

        var modalContent = overlay.querySelector('.ubits-modal-content');
        if (modalContent) {
            modalContent.classList.add('portada-ia-modal-content', 'cc-eval-ia-modal-content');
            modalContent.style.backgroundColor = 'var(--ubits-bg-1)';
            modalContent.style.backgroundImage =
                'radial-gradient(ellipse 100% 80% at 10% 0%, rgba(var(--modo-ia-glow-orb-rgb-1, 26, 107, 255), 0.15) 0%, transparent 50%),' +
                'radial-gradient(ellipse 95% 78% at 50% 0%, rgba(var(--modo-ia-glow-orb-rgb-2, 76, 230, 255), 0.15) 0%, transparent 48%),' +
                'radial-gradient(ellipse 95% 75% at 90% 0%, rgba(var(--modo-ia-glow-orb-rgb-3, 255, 84, 22), 0.15) 0%, transparent 50%)';
            var modalHeader = overlay.querySelector('.ubits-modal-header');
            if (modalHeader) {
                modalHeader.style.background = 'transparent';
                modalHeader.style.borderBottom = '';
            }
            var modalBody = overlay.querySelector('.ubits-modal-body');
            if (modalBody) {
                modalBody.style.padding = 'var(--padding-xl, 32px)';
                modalBody.style.overflow = 'auto';
                modalBody.style.display = 'flex';
                modalBody.style.flexDirection = 'column';
                modalBody.style.minHeight = '0';
            }
        }

        var genBtn = overlay.querySelector('#cc-eval-ia-modal-generate');
        var contextTa = overlay.querySelector('#cc-eval-ia-modal-context-input');
        if (genBtn && canAfford) {
            genBtn.addEventListener('click', function () {
                if (!_evalModalHasContext(overlay)) {
                    if (typeof global.showToast === 'function') {
                        global.showToast(
                            'warning',
                            'Describe el tema o adjunta material para continuar.'
                        );
                    }
                    if (contextTa) contextTa.focus();
                    return;
                }
                genBtn.disabled = true;
                var spent = _evalSpendTokens(cost);
                _evalSyncTokensBadges(spent);
                var nextCfg = _evalReadModalFieldConfig(overlay._ccEvalIaFieldApis, cfg);
                if (rootEl._ccEvalPageState && rootEl._ccEvalPageState.config) {
                    Object.assign(rootEl._ccEvalPageState.config, nextCfg);
                }
                rootEl._ccEvalState = {
                    step: 'generating',
                    config: Object.assign({}, nextCfg),
                    content: _evalBuildModalContextContent(overlay)
                };
                rootEl._ccEvalIaUiMode = null;
                overlay._ccEvalIaFieldApis = null;
                overlay._ccEvalModalPendingImages = null;
                overlay._ccEvalModalPendingFiles = null;
                if (typeof global.closeModal === 'function') global.closeModal(CC_EVAL_IA_MODAL_ID);
                setTimeout(function () {
                    evalAgentRunGeneration(rootEl);
                }, 150);
            });
        }

        setTimeout(function () {
            if (contextTa) contextTa.focus();
        }, 120);
    }

    function _evalMsg(text, opts) {
        if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage(text, 'ai', null, opts);
    }

    function _evalUserMsg(text) {
        if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage(text, 'user');
    }

    function _evalTyping(cb, delay) {
        var rm = typeof global.showAIPanelTyping === 'function' ? global.showAIPanelTyping() : null;
        setTimeout(function () { rm && rm(); cb(); }, delay || 1200);
    }

    function _evalGetTokens() {
        return window._ubitsAiTokenPool != null ? window._ubitsAiTokenPool : 50;
    }

    function _evalSpendTokens(n) {
        var cur = _evalGetTokens();
        window._ubitsAiTokenPool = Math.max(0, cur - n);
        return window._ubitsAiTokenPool;
    }

    // ---------------------------
    // Confirmación final + botón "Generar evaluación" con costo en tokens
    // (misma estructura que el botón de portada en el panel IA)
    // ---------------------------

    function evalAgentShowConfirmation(rootEl) {
        var state = rootEl._ccEvalState;
        var count = (state && state.config && state.config.questionCount) ? state.config.questionCount : 10;
        var topic = EVAL_AI_TOPIC_DEFAULT;
        var cost = EVAL_AI_TOKEN_COST;
        var remaining = _evalGetTokens();
        var canAfford = remaining >= cost;

        var btnDisabled = canAfford ? '' : ' disabled';
        var btnTitle = canAfford ? '' : ' title="No tienes suficientes tokens (' + cost + ' requeridos)."';
        var richHtml =
            '<p class="ubits-body-md-regular" style="margin:0 0 12px;">Voy a generar <strong>' + count +
            ' preguntas</strong> sobre el tema <strong>"' + topic + '"</strong>.</p>' +
            '<button type="button" id="cc-eval-gen-confirm-btn"' + btnDisabled + btnTitle +
            ' class="ubits-button ubits-button--primary ubits-button--sm ubits-button--with-token-cost">' +
            '<span class="ubits-button__token-cost" aria-hidden="true"><i class="far fa-coin-vertical"></i><span class="ubits-button__token-number">' + cost + '</span></span>' +
            '<span>Generar evaluación</span>' +
            '</button>';

        _evalMsg('', { richHtml: richHtml, hideAiCopy: true });

        setTimeout(function () {
            var btn = document.getElementById('cc-eval-gen-confirm-btn');
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (!canAfford) return;
                btn.disabled = true;
                var spent = _evalSpendTokens(cost);
                _evalSyncTokensBadges(spent);
                state.step = 'generating';
                evalAgentCloseUiForGeneration(rootEl);
                setTimeout(function () { evalAgentRunGeneration(rootEl); }, 150);
            });
        }, 100);
    }

    // ---------------------------
    // Generación — IA Loader (16:9, mismo componente que portada)
    // ---------------------------

    function evalAgentShowSkeleton(rootEl) {
        var existing = document.getElementById('cc-eval-ai-gen-overlay');
        if (existing) existing.remove();
        var qList = rootEl.querySelector('#cc-eval-q-list');
        if (!qList) return;

        // Ocultar empty state y botón Añadir durante la generación
        var emptyHost = rootEl.querySelector('#ccEvalEmptyHost');
        if (emptyHost) emptyHost.style.display = 'none';
        var addBtn = rootEl.querySelector('#cc-eval-add-q');
        if (addBtn) addBtn.style.display = 'none';

        var loaderHtml =
            typeof getIaLoaderHTML === 'function'
                ? getIaLoaderHTML({ label: 'Generando preguntas' })
                : '<p class="ubits-body-md-regular" role="status" aria-live="polite">Generando preguntas\u2026</p>';

        var overlay = document.createElement('div');
        overlay.id = 'cc-eval-ai-gen-overlay';
        overlay.className = 'cc-portada-ai-generating cc-eval-ai-gen-overlay';
        overlay.setAttribute('aria-busy', 'true');
        overlay.innerHTML =
            '<div class="cc-portada-ai-generating__stage">' +
            '<div class="cc-portada-ai-generating__ia-host">' +
            loaderHtml +
            '</div>' +
            '</div>';

        var parent = qList.parentNode;
        if (parent) {
            parent.insertBefore(overlay, qList);
        }
    }

    function evalAgentRemoveSkeleton() {
        var overlay = document.getElementById('cc-eval-ai-gen-overlay');
        if (overlay) overlay.remove();
    }

    function evalAgentRunGeneration(rootEl) {
        var state = rootEl._ccEvalState;
        evalAgentShowSkeleton(rootEl);
        setTimeout(function () {
            evalAgentRemoveSkeleton();
            var questions = genMockQuestions(
                EVAL_AI_TOPIC_DEFAULT,
                (state && state.config && state.config.difficulty) || 'intermediate',
                (state && state.config && state.config.questionCount) || 10,
                (state && state.config && state.config.questionTypes) || ['multiple_choice_single_answer', 'binary']
            );
            applyAIQuestions(rootEl, questions);
            if (rootEl._ccEvalPageState) {
                rootEl._ccEvalPageState.config = Object.assign({}, (state && state.config) || {});
            }
            if (state) state.step = 'done';
        }, 4000);
    }

    // ---------------------------
    // INIT del agente
    // ---------------------------

    function evalAgentInit(rootEl, pageState) {
        if (typeof global.destroyAIPanel === 'function') global.destroyAIPanel();
        if (typeof global.initAIPanel !== 'function') return;

        rootEl._ccEvalPageState = pageState;
        rootEl._ccEvalGenToken = null;
        rootEl._ccEvalState = null;

        var currentTokens = _evalGetTokens();

        global.initAIPanel({
            title: 'Agente de evaluaciones',
            agentLabel: 'Studio IA',
            welcomeTitle: 'Agente creador de evaluaciones',
            welcomeSubtitle: 'Crea una evaluación con IA en segundos.',
            placeholder: 'Escribe aquí…',
            disclaimer: 'El agente puede cometer errores. Revisa las preguntas antes de publicar.',
            tokensBadge: { value: currentTokens },
            onSend: function (msg) {
                evalAgentHandleUserMsg(rootEl, String(msg || ''));
            },
            onClose: function () {}
        });
    }

    function evalAgentStart(rootEl) {
        rootEl._ccEvalGenToken = null;
        rootEl._ccEvalState = {
            step: 'path_select',
            config: Object.assign({}, (rootEl._ccEvalPageState && rootEl._ccEvalPageState.config) || {}),
            content: '',
            questionCount: 10
        };

        // Mostrar card-based selection dentro del mensaje IA
        _evalMsg('¿Cómo quieres crear la evaluación?');
        setTimeout(function () {
            if (typeof global.addAIPanelInteraction === 'function') {
                global.addAIPanelInteraction('cards', {
                    items: [
                        {
                            value: 'fast',
                            emoji: '⚡',
                            title: 'Configuración estándar',
                            description: '70% para aprobar, sin límite de tiempo ni de intentos.'
                        },
                        {
                            value: 'long',
                            emoji: '⚙️',
                            title: 'Configurar desde cero',
                            description: 'Personaliza nombre, puntaje mínimo, tiempo, número de preguntas y tipos.'
                        }
                    ],
                    onReply: function (value) {
                        var state = rootEl._ccEvalState;
                        if (!state) return;
                        if (value === 'fast') {
                            state.step = 'fast_await_material';
                            state.config.minScore = 70;
                            state.config.timeLimit = false;
                            state.config.limitAttempts = false;
                            state.config.questionsRandom = true;
                            state.config.answersRandom = true;
                            state.config.questionCount = 10;
                            state.config.difficulty = 'intermediate';
                            state.config.questionTypes = ['multiple_choice_single_answer', 'binary'];
                            // Reflejar configuración en el pageState para que el modal la muestre
                            if (rootEl._ccEvalPageState) Object.assign(rootEl._ccEvalPageState.config, state.config);
                            setTimeout(function () {
                                _evalMsg('¡Perfecto! Cuéntame sobre el tema de la evaluación. Escribe el contenido directamente o adjunta un archivo (doc, pdf, txt).');
                            }, 200);
                        } else {
                            state.step = 'long_config';
                            setTimeout(function () { evalAgentStartLongConfig(rootEl); }, 200);
                        }
                    }
                });
            }
        }, 300);
    }

    function evalAgentHandleUserMsg(rootEl, text) {
        var state = rootEl._ccEvalState;
        if (!state || state.step === 'done') {
            evalAgentStart(rootEl);
            return;
        }
        text = String(text || '').trim();

        // Ignorar texto antes de elegir la card de path
        if (state.step === 'path_select') return;

        // Ruta larga — paso: nombre de la evaluación por chat
        if (state.step === 'long_await_name') {
            if (!text) {
                _evalMsg('Necesito un nombre para continuar. ¿Cómo se llamará la evaluación?');
                return;
            }
            state.config.title = text;
            evalAgentUpdatePageTitle(rootEl, text);
            state.step = 'long_await_bsf';
            setTimeout(function () { evalAgentShowConfigBSF(rootEl); }, 300);
            return;
        }

        // Ambas rutas — material base
        if (state.step === 'fast_await_material' || state.step === 'long_await_material') {
            if (!text) return;
            state.content = text;
            state.step = 'analyzing';
            _evalTyping(function () {
                state.step = 'pre_confirm';
                if (state._longPath) {
                    evalAgentAskTypes(rootEl);
                } else {
                    evalAgentShowConfirmation(rootEl);
                }
            }, 1800);
            return;
        }
    }

    /** Actualiza el label de la página activa en el Índice Creator */
    function evalAgentUpdatePageTitle(rootEl, newTitle) {
        var activeItem = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
        if (!activeItem) return;
        var labelEl = activeItem.querySelector('.ubits-paginas-creator__label');
        if (labelEl) labelEl.textContent = newTitle;
        // Sincronizar el input "Escribe el título de la página" en el panel derecho
        var titleInp = document.getElementById('crear-contenido-recursos-page-title');
        if (titleInp) {
            titleInp.value = newTitle;
            if (typeof window.autoResizeInlineEdit === 'function') {
                window.autoResizeInlineEdit(titleInp);
            }
        }
        // Persistir via evento del componente
        var pageKey = rootEl._ccEvalCurrentPageKey || getActivePageKeyFromCrearContenido();
        document.dispatchEvent(new CustomEvent('ubits-paginas-creator-label-save', {
            bubbles: true,
            detail: { pageKey: pageKey, newLabel: newTitle }
        }));
    }

    // ---------------------------
    // RUTA LARGA: flujo por pasos
    // ---------------------------

    function evalAgentStartLongConfig(rootEl) {
        var state = rootEl._ccEvalState;
        state.step = 'long_await_name';
        _evalMsg('¿Cómo se llamará la evaluación?');
    }

    /** Bottom Sheet Form: puntaje mínimo + tiempo + cantidad + dificultad */
    function evalAgentShowConfigBSF(rootEl) {
        _evalMsg('Perfecto. Ahora configura los ajustes de la evaluación.');
        setTimeout(function () {
            if (typeof global.addAIPanelInteraction !== 'function') return;
            global.addAIPanelInteraction('bottom-sheet', {
                steps: [
                    {
                        question: '¿Puntaje mínimo de aprobación?',
                        type: 'single',
                        options: [
                            { label: '60% — Aprobación básica', value: '60' },
                            { label: '70% — Estándar recomendado', value: '70' },
                            { label: '80% — Nivel intermedio', value: '80' },
                            { label: '90% — Alto desempeño', value: '90' }
                        ]
                    },
                    {
                        question: '¿Límite de tiempo?',
                        type: 'single',
                        options: [
                            { label: 'Sin límite de tiempo', value: 'none' },
                            { label: '30 minutos', value: '30' },
                            { label: '45 minutos', value: '45' },
                            { label: '60 minutos', value: '60' },
                            { label: '90 minutos', value: '90' }
                        ]
                    },
                    {
                        question: '¿Cuántas preguntas quieres generar?',
                        type: 'single',
                        options: [
                            { label: '5 preguntas', value: '5' },
                            { label: '10 preguntas', value: '10' },
                            { label: '15 preguntas', value: '15' },
                            { label: '20 preguntas', value: '20' }
                        ],
                        freeText: true
                    },
                    {
                        question: '¿Nivel de dificultad?',
                        type: 'single',
                        freeText: false,
                        options: [
                            { label: 'Básico', value: 'basic' },
                            { label: 'Intermedio', value: 'intermediate' },
                            { label: 'Avanzado', value: 'advanced' }
                        ]
                    }
                ],
                onReply: function (answers) {
                    var state = rootEl._ccEvalState;
                    if (!state) return;
                    // answers[idx] = { selected: [], freeText: '' }
                    var scoreAns = answers[0] || {};
                    var scoreRaw = String((scoreAns.selected && scoreAns.selected[0]) || scoreAns.freeText || '70').replace('%', '');
                    var scoreVal = parseInt(scoreRaw, 10);

                    var timeAns = answers[1] || {};
                    var timeVal = String((timeAns.selected && timeAns.selected[0]) || timeAns.freeText || 'none');

                    var countAns = answers[2] || {};
                    var countRaw = String((countAns.selected && countAns.selected[0]) || countAns.freeText || '10');
                    var countVal = parseInt(countRaw, 10);

                    var diffAns = answers[3] || {};
                    var diffVal = String((diffAns.selected && diffAns.selected[0]) || diffAns.freeText || 'intermediate');

                    state.config.minScore = isNaN(scoreVal) ? 70 : scoreVal;
                    state.config.timeLimit = timeVal !== 'none';
                    state.config.timeLimitValue = timeVal !== 'none' ? parseInt(timeVal, 10) : null;
                    state.config.questionCount = isNaN(countVal) || countVal < 1 ? 10 : Math.min(countVal, 20);
                    state.config.difficulty = diffVal;
                    state.config.limitAttempts = false;
                    state.config.questionsRandom = true;
                    state.config.answersRandom = true;
                    state._longPath = true;
                    state.step = 'long_await_material';

                    // Aplicar config al pageState para que el modal la refleje
                    if (rootEl._ccEvalPageState) {
                        Object.assign(rootEl._ccEvalPageState.config, state.config);
                    }

                    var summary = '✓ ' + (isNaN(scoreVal) ? 70 : scoreVal) + '% mínimo' +
                        (timeVal !== 'none' ? ' · ' + timeVal + ' min' : '') +
                        ' · ' + state.config.questionCount + ' preguntas' +
                        ' · ' + ({ basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' }[diffVal] || diffVal);
                    _evalMsg(summary);
                    setTimeout(function () {
                        _evalMsg('Ahora cuéntame sobre el tema de la evaluación. Escribe el contenido o adjunta un archivo.');
                    }, 400);
                }
            });
        }, 500);
    }

    function evalAgentAskTypes(rootEl) {
        var state = rootEl._ccEvalState;
        state.step = 'long_types';
        setTimeout(function () {
            _evalMsg('¿Qué tipos de pregunta quieres incluir? Elige uno o varios.');
            if (typeof global.addAIPanelInteraction === 'function') {
                global.addAIPanelInteraction('multiselect', {
                    items: [
                        { value: 'multiple_choice_single_answer', label: 'Múltiple, una correcta' },
                        { value: 'multiple_choice_multiple_answers', label: 'Múltiple, varias correctas' },
                        { value: 'binary', label: 'Verdadero / Falso' },
                        { value: 'closed_text', label: 'Texto cerrado' },
                        { value: 'essay', label: 'Ensayo' },
                        { value: 'matching', label: 'Emparejamiento' }
                    ],
                    confirmLabel: 'Listo →',
                    onReply: function (valsCsv) {
                        // valsCsv = 'val1,val2,...'
                        var vals = valsCsv ? valsCsv.split(',') : ['multiple_choice_single_answer'];
                        state.config.questionTypes = vals;
                        state.step = 'pre_confirm';
                        setTimeout(function () { evalAgentShowConfirmation(rootEl); }, 300);
                    }
                });
            }
        }, 300);
    }

    function showUndoBanner(rootEl, count, onUndo) {
        var existing = rootEl.querySelector('#cc-eval-undo-banner');
        if (existing) existing.remove();
        var bar = rootEl.querySelector('.cc-eval-config-bar');
        if (!bar || !bar.parentNode) return;
        // Usar el componente oficial ubits-alert con variante IA y con-acción
        var banner = document.createElement('div');
        banner.id = 'cc-eval-undo-banner';
        banner.className = 'ubits-alert ubits-alert--ia ubits-alert--with-action';
        banner.setAttribute('role', 'status');
        banner.innerHTML =
            '<div class="ubits-alert__icon"><i class="far fa-sparkles"></i></div>' +
            '<div class="ubits-alert__content">' +
            '<span class="ubits-alert__text ubits-body-sm-semibold">' + count + ' preguntas generadas por IA</span>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-alert__action cc-eval-undo-btn">' +
            '<span>Deshacer</span>' +
            '</button>' +
            '</div>' +
            '<button type="button" class="ubits-alert__close cc-eval-undo-close" aria-label="Cerrar">' +
            '<i class="far fa-times"></i>' +
            '</button>';
        bar.parentNode.insertBefore(banner, bar.nextSibling);
        banner.querySelector('.cc-eval-undo-btn').addEventListener('click', function () {
            onUndo();
            banner.remove();
            if (typeof global.showToast === 'function') global.showToast('info', 'Se deshizo la generación de preguntas.');
        });
        banner.querySelector('.cc-eval-undo-close').addEventListener('click', function () { banner.remove(); });
    }

    // ---------------------------
    // Persistencia por página (serializar ↔ hidratar)
    // ---------------------------

    function _num(v, fallback) {
        var n = parseInt(v, 10);
        return isNaN(n) ? (fallback == null ? 0 : fallback) : n;
    }

    function _text(v) {
        return String(v == null ? '' : v).trim();
    }

    function collectExamStateFromDom(rootEl) {
        var qList = rootEl.querySelector('#cc-eval-q-list');
        var cards = qList ? qList.querySelectorAll('.cc-exam-q-card') : [];
        var out = { questions: [] };
        cards.forEach(function (card) {
            var qid = card.getAttribute('data-q-id') || '';
            var t = card.getAttribute('data-q-current-type') || 'multiple_choice_single';
            var stmtTA = card.querySelector('#cc-eval-q-' + qid + '-stmt-wrap textarea');
            var instEd = card.querySelector('#cc-eval-q-' + qid + '-inst-editor');
            var q = {
                type: t,
                statement: stmtTA ? String(stmtTA.value || '') : '',
                instructionHtml: instEd ? String(instEd.innerHTML || '') : '',
                points: 0
            };

            if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
                q.options = [];
                var optRows = card.querySelectorAll('.cc-exam-opt-row');
                optRows.forEach(function (r) {
                    if (r.classList.contains('cc-exam-opt-row--static')) return;
                    var optId = r.getAttribute('data-opt-id') || '';
                    var inp = r.querySelector('#cc-eval-opt-' + qid + '-' + optId + '-wrap input');
                    var chk = r.querySelector('.cc-exam-opt-check');
                    q.options.push({
                        text: inp ? String(inp.value || '') : '',
                        correct: !!(chk && chk.checked)
                    });
                });
            } else if (t === 'true_false') {
                var tfChecked = card.querySelector('input[name="q-' + qid + '-correct"]:checked');
                q.trueFalseCorrect = tfChecked ? String(tfChecked.value || '') : '';
            } else if (t === 'short_answer') {
                var ans = card.querySelector('#cc-eval-q-' + qid + '-sa-answer-wrap input');
                var acc = card.querySelector('input[name="q-' + qid + '-accuracy"]:checked');
                q.shortAnswer = { answer: ans ? String(ans.value || '') : '', accuracy: acc ? String(acc.value || '') : 'exact' };
            } else if (t === 'essay') {
                var mw = card.querySelector('#cc-eval-q-' + qid + '-essay-minwords-wrap input');
                q.essay = { minWords: mw ? String(mw.value || '') : '' };
            } else if (t === 'matching') {
                q.pairs = [];
                card.querySelectorAll('.cc-exam-match-pair').forEach(function (pairEl) {
                    var pid = pairEl.getAttribute('data-pair-id') || '';
                    var a = pairEl.querySelector('#cc-eval-match-' + qid + '-' + pid + '-a-wrap input');
                    var b = pairEl.querySelector('#cc-eval-match-' + qid + '-' + pid + '-b-wrap input');
                    q.pairs.push({ a: a ? String(a.value || '') : '', b: b ? String(b.value || '') : '' });
                });
            } else if (t === 'fill_blank') {
                q.fillBlank = { options: [] };
                card.querySelectorAll('.cc-exam-fb-opt-row').forEach(function (row) {
                    var oid = row.getAttribute('data-opt-id') || '';
                    var inp2 = row.querySelector('#cc-eval-fb-' + qid + '-' + oid + '-wrap input');
                    q.fillBlank.options.push(inp2 ? String(inp2.value || '') : '');
                });
            } else if (t === 'rating_scale') {
                var minV = card.querySelector('#cc-eval-q-' + qid + '-rating-min-wrap input');
                var maxV = card.querySelector('#cc-eval-q-' + qid + '-rating-max-wrap input');
                var minL = card.querySelector('#cc-eval-q-' + qid + '-rating-minlbl-wrap input');
                var maxL = card.querySelector('#cc-eval-q-' + qid + '-rating-maxlbl-wrap input');
                q.rating = {
                    min: minV ? String(minV.value || '') : '',
                    max: maxV ? String(maxV.value || '') : '',
                    minLabel: minL ? String(minL.value || '') : '',
                    maxLabel: maxL ? String(maxL.value || '') : ''
                };
            }

            out.questions.push(q);
        });
        return out;
    }

    function hydrateExamStateIntoDom(rootEl, pageState) {
        return renderQuestions(rootEl, pageState);
    }

    function persistCurrentPage(rootEl) {
        var pk = rootEl && rootEl._ccEvalCurrentPageKey ? String(rootEl._ccEvalCurrentPageKey) : getActivePageKeyFromCrearContenido();
        var pageState = ensurePageState(pk);
        pageState.questions = snapshotModelsFromApis(rootEl);
        pageState.activeQId = rootEl && rootEl._ccEvalActiveQId ? Number(rootEl._ccEvalActiveQId) : (pageState.activeQId || 1);
        // Revalidar activa antes de persistir (para mantener read_error coherente al cambiar de página)
        var active = rootEl && rootEl._ccEvalActiveQId ? Number(rootEl._ccEvalActiveQId) : 1;
        var api = rootEl && rootEl._ccEvalLqApis ? rootEl._ccEvalLqApis[active - 1] : null;
        if (api) {
            var v = validateApi(api);
            setQuestionError(pageState, active, !v.ok);
        }
    }

    function switchToPage(rootEl, nextPageKey) {
        var pk = String(nextPageKey || 'default');
        var ps = ensurePageState(pk);
        rootEl._ccEvalCurrentPageKey = pk;
        var r = hydrateExamStateIntoDom(rootEl, ps);
        rootEl._ccEvalQSeq = r && r.qSeq != null ? r.qSeq : 0;
        rootEl._ccEvalActiveQId = ps.activeQId || 1;
        applyFocusModes(rootEl);
    }

    // ---------------------------
    // Validaciones avanzadas por tipo
    // ---------------------------

    function parseFillBlankMarkers(text) {
        var t = String(text || '');
        var re = /\{\{\s*(\d+)\s*\}\}/g;
        var m;
        var nums = [];
        while ((m = re.exec(t))) {
            nums.push(parseInt(m[1], 10));
        }
        return nums.filter(function (n) { return !isNaN(n) && n > 0; });
    }

    function validateExamBeforeSave(rootEl) {
        var qList = rootEl.querySelector('#cc-eval-q-list');
        var cards = qList ? Array.prototype.slice.call(qList.querySelectorAll('.cc-exam-q-card')) : [];
        if (!cards.length) {
            if (typeof global.showToast === 'function') global.showToast('warning', 'Añade al menos una pregunta.');
            return false;
        }

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var qid = card.getAttribute('data-q-id') || '';
            var t = card.getAttribute('data-q-current-type') || 'multiple_choice_single';
            var stmtEl = card.querySelector('#cc-eval-q-' + qid + '-stmt-wrap textarea');
            var stmt = stmtEl ? _text(stmtEl.value) : '';

            if (t !== 'instruction') {
                if (!stmt) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'La pregunta ' + (i + 1) + ' no tiene enunciado.');
                    return false;
                }
            }

            if (t === 'instruction') {
                var inst = card.querySelector('#cc-eval-q-' + qid + '-inst-editor');
                var instTxt = inst ? _text(inst.textContent) : '';
                if (!instTxt) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'La instrucción ' + (i + 1) + ' está vacía.');
                    return false;
                }
            }

            if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
                var rows = Array.prototype.slice.call(card.querySelectorAll('.cc-exam-opt-row')).filter(function (r) {
                    return !r.classList.contains('cc-exam-opt-row--static');
                });
                if (rows.length < 2) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'La pregunta ' + (i + 1) + ' debe tener al menos 2 opciones.');
                    return false;
                }
                var correctCount = 0;
                for (var r = 0; r < rows.length; r++) {
                    var rid = rows[r].getAttribute('data-opt-id') || String(r + 1);
                    var inp = rows[r].querySelector('#cc-eval-opt-' + qid + '-' + rid + '-wrap input');
                    var val = inp ? _text(inp.value) : '';
                    if (!val) {
                        if (typeof global.showToast === 'function') global.showToast('warning', 'Completa todas las opciones de la pregunta ' + (i + 1) + '.');
                        return false;
                    }
                    var chk = rows[r].querySelector('.cc-exam-opt-check');
                    if (chk && chk.checked) correctCount += 1;
                }
                if (correctCount < 1) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'Marca al menos una respuesta correcta en la pregunta ' + (i + 1) + '.');
                    return false;
                }
                if (t === 'multiple_choice_single' && correctCount !== 1) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'La pregunta ' + (i + 1) + ' debe tener exactamente 1 respuesta correcta.');
                    return false;
                }
            }

            if (t === 'true_false') {
                var tfChecked = card.querySelector('input[name="q-' + qid + '-correct"]:checked');
                if (!tfChecked) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'Selecciona la respuesta correcta (Verdadero/Falso) en la pregunta ' + (i + 1) + '.');
                    return false;
                }
            }

            if (t === 'matching') {
                var pairs = card.querySelectorAll('.cc-exam-match-pair');
                if (!pairs || pairs.length < 2) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'La pregunta ' + (i + 1) + ' debe tener al menos 2 parejas.');
                    return false;
                }
                for (var p = 0; p < pairs.length; p++) {
                    var pid = pairs[p].getAttribute('data-pair-id') || String(p + 1);
                    var a = pairs[p].querySelector('#cc-eval-match-' + qid + '-' + pid + '-a-wrap input');
                    var b = pairs[p].querySelector('#cc-eval-match-' + qid + '-' + pid + '-b-wrap input');
                    if (!_text(a && a.value) || !_text(b && b.value)) {
                        if (typeof global.showToast === 'function') global.showToast('warning', 'Completa ambas columnas en todas las parejas de la pregunta ' + (i + 1) + '.');
                        return false;
                    }
                }
            }

            if (t === 'fill_blank') {
                var markers = parseFillBlankMarkers(stmt);
                if (!markers.length) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'La pregunta ' + (i + 1) + ' debe incluir al menos un marcador {{n}}.');
                    return false;
                }
                var fbRows = card.querySelectorAll('.cc-exam-fb-opt-row');
                if (!fbRows || fbRows.length < 2) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'La pregunta ' + (i + 1) + ' debe tener al menos 2 opciones para completar.');
                    return false;
                }
                var maxOpt = fbRows.length;
                for (var f = 0; f < fbRows.length; f++) {
                    var oid = fbRows[f].getAttribute('data-opt-id') || String(f + 1);
                    var finp = fbRows[f].querySelector('#cc-eval-fb-' + qid + '-' + oid + '-wrap input');
                    if (!_text(finp && finp.value)) {
                        if (typeof global.showToast === 'function') global.showToast('warning', 'Completa todas las opciones de la pregunta ' + (i + 1) + '.');
                        return false;
                    }
                }
                for (var m = 0; m < markers.length; m++) {
                    if (markers[m] < 1 || markers[m] > maxOpt) {
                        if (typeof global.showToast === 'function') global.showToast('warning', 'En la pregunta ' + (i + 1) + ', el marcador {{' + markers[m] + '}} no coincide con ninguna opción.');
                        return false;
                    }
                }
            }

            if (t === 'short_answer') {
                var ans = card.querySelector('#cc-eval-q-' + qid + '-sa-answer-wrap input');
                if (!_text(ans && ans.value)) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'Escribe la respuesta correcta en la pregunta ' + (i + 1) + '.');
                    return false;
                }
            }

            if (t === 'essay') {
                var mw = card.querySelector('#cc-eval-q-' + qid + '-essay-minwords-wrap input');
                if (mw && _text(mw.value)) {
                    var nMw = _num(mw.value, 0);
                    if (nMw < 1 || nMw > 100) {
                        if (typeof global.showToast === 'function') global.showToast('warning', 'El mínimo de palabras debe estar entre 1 y 100 en la pregunta ' + (i + 1) + '.');
                        return false;
                    }
                }
            }

            if (t === 'rating_scale') {
                var minV = card.querySelector('#cc-eval-q-' + qid + '-rating-min-wrap input');
                var maxV = card.querySelector('#cc-eval-q-' + qid + '-rating-max-wrap input');
                var aMin = _num(minV && minV.value, NaN);
                var aMax = _num(maxV && maxV.value, NaN);
                if (isNaN(aMin) || isNaN(aMax) || aMax <= aMin) {
                    if (typeof global.showToast === 'function') global.showToast('warning', 'Revisa los valores mínimo/máximo de la escala en la pregunta ' + (i + 1) + '.');
                    return false;
                }
            }
        }

        return true;
    }

    function applyAIQuestions(rootEl, questions) {
        var pageState = rootEl && rootEl._ccEvalPageState ? rootEl._ccEvalPageState : null;
        if (!pageState) return;

        var prevModels = snapshotModelsFromApis(rootEl);
        var prevActive = rootEl && rootEl._ccEvalActiveQId ? Number(rootEl._ccEvalActiveQId) : 1;

        var typeMap = {
            multiple_choice_single_answer: 'multiple_choice_single',
            multiple_choice_multiple_answers: 'multiple_choice_multiple',
            binary: 'true_false',
            closed_text: 'short_answer',
            essay: 'essay',
            matching: 'matching'
        };

        var aiModels = (questions || []).map(function (q) {
            var t = typeMap[q && q.agentType] || 'multiple_choice_single';
            var m = { type: t, statement: String((q && q.stmt) || '').trim() };
            if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
                var opts = Array.isArray(q && q.opts) ? q.opts : [];
                if (opts.length < 2) opts = ['',''];
                m.options = opts.map(function (txt, idx) {
                    var isCorrect = false;
                    if (t === 'multiple_choice_single') {
                        isCorrect = (typeof q.correct === 'number') ? (idx === (q.correct + 1) - 1) : false;
                    }
                    return { text: String(txt || ''), correct: isCorrect };
                });
            }
            if (t === 'true_false') {
                m.trueFalseCorrect = '';
            }
            if (t === 'short_answer') {
                m.shortAnswer = { answer: '', accuracy: 'exact' };
            }
            if (t === 'essay') {
                m.essay = { minWords: '' };
            }
            if (t === 'matching') {
                m.pairs = [{ a: '', b: '' }, { a: '', b: '' }];
            }
            return m;
        });

        // Las preguntas IA se AGREGAN después de las preguntas manuales existentes
        var nextModels = prevModels.concat(aiModels);

        pageState.questions = nextModels;
        pageState.activeQId = prevModels.length ? prevActive : 1;
        renderQuestions(rootEl, pageState);
        applyFocusModes(rootEl);

        showUndoBanner(rootEl, questions.length, function () {
            // Deshacer: restaurar solo las preguntas manuales anteriores
            pageState.questions = prevModels;
            pageState.activeQId = prevActive;
            rootEl._ccEvalActiveQId = prevActive;
            renderQuestions(rootEl, pageState);
            applyFocusModes(rootEl);
            renderEmptyStateIfNeeded(rootEl, function () { addQuestionAndFocus(rootEl, pageState); });
        });
    }

    // ---------------------------
    // Wiring principal
    // ---------------------------

    // Registro global: qué pageKeys tienen recurso de evaluación activo
    if (!global._ccEvalPageKeys) global._ccEvalPageKeys = {};

    function mountEvalIn(mountEl) {
        var pageKey = getActivePageKeyFromCrearContenido();
        var pageState = ensurePageState(pageKey);

        // Marcar esta página como página de evaluación
        global._ccEvalPageKeys[String(pageKey)] = true;

        mountEl.innerHTML = buildExamFormHtml();

        var rootEl = mountEl.querySelector('[data-cc-eval-root]') || mountEl;
        rootEl._ccEvalPageState = pageState;
        rootEl._ccEvalCurrentPageKey = String(pageKey || 'default');
        // Persistir también en mountEl (sobrevive a re-renders de rootEl)
        mountEl._ccEvalCurrentPageKey = String(pageKey || 'default');
        // Referencia directa al rootEl actual (no usar querySelector que falla tras innerHTML replace)
        mountEl._ccEvalRootEl = rootEl;

        var qSeq = 0;
        rootEl._ccEvalQSeq = 0;

        rootEl._ccEvalAddQuestion = function () {
            addQuestionAndFocus(rootEl, pageState);
            qSeq = rootEl._ccEvalQSeq || 0;
        };

        var restored = hydrateExamStateIntoDom(rootEl, pageState);
        qSeq = restored.qSeq;
        rootEl._ccEvalQSeq = qSeq;
        rootEl._ccEvalActiveQId = pageState.activeQId || 1;
        applyFocusModes(rootEl);
        renderEmptyStateIfNeeded(rootEl, rootEl._ccEvalAddQuestion);

        var addBtn = rootEl.querySelector('#cc-eval-add-q');
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                if (typeof rootEl._ccEvalAddQuestion === 'function') {
                    rootEl._ccEvalAddQuestion();
                }
            });
        }

        var cfgBtn = rootEl.querySelector('#cc-eval-cfg-btn');
        if (cfgBtn) {
            cfgBtn.addEventListener('click', function () {
                openEvalConfigModal(pageState);
            });
        }

        var iaModalBtn = rootEl.querySelector('#cc-eval-ia-modal-btn');
        if (iaModalBtn) {
            iaModalBtn.addEventListener('click', function () {
                if (typeof global.closeAIPanel === 'function') global.closeAIPanel();
                rootEl._ccEvalIaUiMode = 'modal';
                openEvalIaModal(rootEl);
            });
        }

        var iaBtn = rootEl.querySelector('#cc-eval-ia-btn');
        if (iaBtn) {
            iaBtn.addEventListener('click', function () {
                if (typeof global.closeModal === 'function') global.closeModal(CC_EVAL_IA_MODAL_ID);
                rootEl._ccEvalIaUiMode = 'panel';
                evalAgentInit(rootEl, pageState);
                if (typeof global.openAIPanel === 'function') global.openAIPanel();
                setTimeout(function () {
                    if (typeof global.addAIPanelMessage === 'function') {
                        global.addAIPanelMessage('¡Hola! Soy el Agente de evaluaciones. Voy a ayudarte a crear preguntas sobre el tema de tu contenido.', 'ai');
                    }
                    setTimeout(function () { evalAgentStart(rootEl); }, 400);
                }, 250);
            });
        }

        // Persistencia por página: usamos mountEl como ancla estable del listener.
        // Removemos cualquier listener anterior para evitar duplicados al re-montar.
        if (mountEl._ccEvalActivateHandler) {
            document.removeEventListener('ubits-paginas-creator-activate', mountEl._ccEvalActivateHandler);
            mountEl._ccEvalActivateHandler = null;
        }

        mountEl._ccEvalActivateHandler = function (ev) {
            if (!ev || !ev.detail) return;
            if (!document.body.contains(mountEl)) return;
            var nextKey = ev.detail.pageKey != null ? String(ev.detail.pageKey) : '';
            if (!nextKey) return;

            // curKey: preferir mountEl (más estable que rootEl que puede cambiar)
            var curKey = mountEl._ccEvalCurrentPageKey
                || (mountEl.querySelector('[data-cc-eval-root]') || {})._ccEvalCurrentPageKey
                || getActivePageKeyFromCrearContenido();
            if (String(nextKey) === String(curKey)) return;

            // Cerrar panel IA y modal de evaluación (exclusivo de la página de evaluación)
            if (typeof global.closeAIPanel === 'function') global.closeAIPanel();
            if (typeof global.closeModal === 'function') global.closeModal(CC_EVAL_IA_MODAL_ID);
            if (typeof global.setAIPanelAlternateMount === 'function') global.setAIPanelAlternateMount(null);

            // Persistir estado de la página actual usando el rootEl vigente.
            // mountEl._ccEvalRootEl apunta siempre al rootEl del último montaje y sobrevive
            // al innerHTML replace que crear-contenido.js hace al cambiar de página.
            var curRoot = mountEl._ccEvalRootEl || mountEl.querySelector('[data-cc-eval-root]') || mountEl;
            if (curRoot._ccEvalCurrentPageKey) {
                persistCurrentPage(curRoot);
            }

            // Actualizar pageKey trackeado en mountEl
            mountEl._ccEvalCurrentPageKey = nextKey;

            // Si la siguiente página es de evaluación, re-montar después de que
            // crear-contenido.js muestre el resources-block (setTimeout(0) lo espera).
            if (global._ccEvalPageKeys && global._ccEvalPageKeys[nextKey]) {
                setTimeout(function () {
                    if (!document.body.contains(mountEl)) return;
                    mountEvalIn(mountEl);
                }, 0);
            }
            // Si no es página de evaluación, crear-contenido.js gestiona el resources-block.
        };

        document.addEventListener('ubits-paginas-creator-activate', mountEl._ccEvalActivateHandler);
    }

    // API pública
    global.rcMountEvalForm = function (mountEl) {
        if (!mountEl) return;
        mountEvalIn(mountEl);
    };
})(typeof window !== 'undefined' ? window : this);

