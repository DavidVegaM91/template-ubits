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
 * - ai-panel (initAIPanel/openAIPanel/addAIPanelMessage/showAIPanelTyping)
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
            '    <button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm" id="cc-eval-ia-btn">' +
            '      <i class="far fa-sparkles"></i><span>Crear con IA</span>' +
            '    </button>' +
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
    // Agente conversacional (AI Panel) — port de Mafe
    // ---------------------------

    function evalAgentInit(rootEl, pageState) {
        if (typeof global.destroyAIPanel === 'function') global.destroyAIPanel();
        if (typeof global.initAIPanel !== 'function') return;

        // Guardamos referencias en el root para usar en router
        rootEl._ccEvalPageState = pageState;
        rootEl._ccEvalGenToken = null;
        rootEl._ccEvalState = null;

        global.initAIPanel({
            title: 'Agente de evaluaciones',
            agentLabel: 'Studio IA',
            welcomeTitle: 'Agente creador de evaluaciones',
            welcomeSubtitle: 'Te guiaré paso a paso para crear una evaluación alineada con tu contenido.',
            placeholder: 'Escribe aquí…',
            disclaimer: 'El agente puede cometer errores. Revisa las preguntas antes de publicar.',
            onSend: function (msg) {
                evalAgentHandleUserMsg(rootEl, String(msg || ''));
            },
            onClose: function () {}
        });
    }

    function evalAgentAddQuickReplies(choices, onPick) {
        var msgs = document.getElementById('ai-panel-messages');
        if (!msgs) return;
        var wrap = document.createElement('div');
        wrap.className = 'cc-eval-qr-wrap';
        choices.forEach(function (c) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cc-eval-qr-chip';
            btn.textContent = c.label;
            btn.addEventListener('click', function () {
                document.querySelectorAll('.cc-eval-qr-wrap').forEach(function (w) { w.remove(); });
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage(c.label, 'user');
                onPick(c.value);
            });
            wrap.appendChild(btn);
        });
        msgs.appendChild(wrap);
        var scroll = document.getElementById('ai-panel-scroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
    }

    function evalAgentAddMultiSelectChips(choices, preselected, onConfirm) {
        var msgs = document.getElementById('ai-panel-messages');
        if (!msgs) return;
        var wrap = document.createElement('div');
        wrap.className = 'cc-eval-qr-wrap cc-eval-qr-wrap--multi';
        var selected = {};
        (preselected || []).forEach(function (v) { selected[v] = true; });

        choices.forEach(function (c) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cc-eval-qr-chip' + (selected[c.value] ? ' cc-eval-qr-chip--on' : '');
            btn.textContent = c.label;
            btn.addEventListener('click', function () {
                if (selected[c.value]) {
                    delete selected[c.value];
                    btn.classList.remove('cc-eval-qr-chip--on');
                } else {
                    selected[c.value] = true;
                    btn.classList.add('cc-eval-qr-chip--on');
                }
            });
            wrap.appendChild(btn);
        });

        var confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = 'cc-eval-qr-chip cc-eval-qr-chip--confirm';
        confirmBtn.textContent = 'Generar evaluación →';
        confirmBtn.addEventListener('click', function () {
            var vals = Object.keys(selected);
            if (!vals.length) {
                confirmBtn.classList.add('cc-eval-qr-chip--shake');
                setTimeout(function () { confirmBtn.classList.remove('cc-eval-qr-chip--shake'); }, 400);
                return;
            }
            wrap.remove();
            var labels = choices.filter(function (c) { return selected[c.value]; }).map(function (c) { return c.label; });
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage(labels.join(', '), 'user');
            onConfirm(vals);
        });
        wrap.appendChild(confirmBtn);

        msgs.appendChild(wrap);
        var scroll = document.getElementById('ai-panel-scroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
    }

    function evalAgentStart(rootEl) {
        rootEl._ccEvalGenToken = null;
        rootEl._ccEvalState = {
            step: 'step1',
            _subStep: 'title',
            config: Object.assign({}, rootEl._ccEvalPageState.config),
            content: '',
            _maxQuestions: 10
        };
        if (typeof global.addAIPanelMessage === 'function') {
            global.addAIPanelMessage('¿Cómo se llamará la evaluación?', 'ai');
        }
    }

    function evalAgentHandleUserMsg(rootEl, text) {
        var state = rootEl._ccEvalState;
        if (!state || state.step === 'done') {
            evalAgentStart(rootEl);
            return;
        }
        text = String(text || '').trim();
        document.querySelectorAll('.cc-eval-qr-wrap').forEach(function (w) { w.remove(); });

        if (state.step === 'step1') {
            evalAgentHandleStep1(rootEl, text);
            return;
        }
        if (state.step === 'step2') {
            state.content = text;
            state.step = 'analyzing';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Contenido recibido. Analizando…', 'ai');
            evalAgentAnalyze(rootEl, text);
            return;
        }
        if (state.step === 'step3') {
            evalAgentHandleStep3(rootEl, text);
        }
    }

    function evalAgentHandleStep1(rootEl, text) {
        var state = rootEl._ccEvalState;
        var cfg = state.config;
        var sub = state._subStep;

        if (sub === 'title') {
            if (!text) {
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Necesito un nombre para continuar. ¿Cómo se llamará la evaluación?', 'ai');
                return;
            }
            cfg.title = text;
            state._subStep = 'minscore';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Cuál será el porcentaje mínimo de aprobación?', 'ai');
            evalAgentAddQuickReplies(
                [{ label: '60%', value: '60' }, { label: '70%', value: '70' }, { label: '80%', value: '80' }, { label: '90%', value: '90' }],
                function (v) { evalAgentHandleStep1(rootEl, v); }
            );
            return;
        }

        if (sub === 'minscore') {
            var score = parseInt(text.replace('%', ''), 10);
            if (isNaN(score) || score < 0 || score > 100) {
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Ingresa un número entre 0 y 100.', 'ai');
                return;
            }
            cfg.minScore = score;
            state._subStep = 'timelimit';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Quieres establecer un límite de tiempo para completar la evaluación?', 'ai');
            evalAgentAddQuickReplies([{ label: 'Sí', value: 'si' }, { label: 'No', value: 'no' }], function (v) { evalAgentHandleStep1(rootEl, v); });
            return;
        }

        if (sub === 'timelimit') {
            var yes = ['si', 'sí', 's', 'yes'].indexOf(text.toLowerCase()) !== -1;
            cfg.timeLimit = yes;
            if (yes) {
                state._subStep = 'timelimit_val';
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Cuántos minutos tendrán los usuarios?', 'ai');
            } else {
                state._subStep = 'attempts';
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Quieres limitar el número de intentos?', 'ai');
                evalAgentAddQuickReplies([{ label: 'Sí', value: 'si' }, { label: 'No', value: 'no' }], function (v) { evalAgentHandleStep1(rootEl, v); });
            }
            return;
        }

        if (sub === 'timelimit_val') {
            var mins = parseInt(text, 10);
            if (isNaN(mins) || mins < 1) {
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Ingresa un número de minutos mayor a 0.', 'ai');
                return;
            }
            cfg.timeLimitValue = mins;
            state._subStep = 'attempts';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Quieres limitar el número de intentos?', 'ai');
            evalAgentAddQuickReplies([{ label: 'Sí', value: 'si' }, { label: 'No', value: 'no' }], function (v) { evalAgentHandleStep1(rootEl, v); });
            return;
        }

        if (sub === 'attempts') {
            var yesA = ['si', 'sí', 's', 'yes'].indexOf(text.toLowerCase()) !== -1;
            cfg.limitAttempts = yesA;
            if (yesA) {
                state._subStep = 'attempts_val';
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Cuántos intentos permitirás?', 'ai');
            } else {
                state._subStep = 'ordering';
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Quieres mostrar las preguntas en orden aleatorio?', 'ai');
                evalAgentAddQuickReplies([{ label: 'Sí', value: 'si' }, { label: 'No', value: 'no' }], function (v) { evalAgentHandleStep1(rootEl, v); });
            }
            return;
        }

        if (sub === 'attempts_val') {
            var att = parseInt(text, 10);
            if (isNaN(att) || att < 1) {
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Ingresa un número de intentos mayor a 0.', 'ai');
                return;
            }
            cfg.attemptsValue = att;
            state._subStep = 'ordering';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Quieres mostrar las preguntas en orden aleatorio?', 'ai');
            evalAgentAddQuickReplies([{ label: 'Sí', value: 'si' }, { label: 'No', value: 'no' }], function (v) { evalAgentHandleStep1(rootEl, v); });
            return;
        }

        if (sub === 'ordering') {
            cfg.questionsRandom = ['si', 'sí', 's', 'yes'].indexOf(text.toLowerCase()) !== -1;
            state._subStep = 'aordering';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿También mostrar las opciones de respuesta en orden aleatorio?', 'ai');
            evalAgentAddQuickReplies([{ label: 'Sí', value: 'si' }, { label: 'No', value: 'no' }], function (v) { evalAgentHandleStep1(rootEl, v); });
            return;
        }

        if (sub === 'aordering') {
            cfg.answersRandom = ['si', 'sí', 's', 'yes'].indexOf(text.toLowerCase()) !== -1;
            state.step = 'step2';
            state._subStep = null;
            var summary = '✓ Configuración lista: "' + cfg.title + '" · ' + cfg.minScore + '% mínimo' +
                (cfg.timeLimit ? ' · ' + cfg.timeLimitValue + ' min' : '') +
                (cfg.limitAttempts ? ' · ' + cfg.attemptsValue + ' intentos' : '');
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage(summary, 'ai');
            setTimeout(function () {
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Pega aquí el texto del contenido para generar preguntas.', 'ai');
            }, 300);
        }
    }

    function evalAgentAnalyze(rootEl, content) {
        var state = rootEl._ccEvalState;
        var words = String(content || '').split(/\s+/).filter(Boolean).length;
        var maxQ = Math.min(Math.max(Math.floor(words / 70), 3), 20);
        var sugQ = state.config.timeLimit
            ? Math.max(3, Math.min(Math.floor(state.config.timeLimitValue / 3.5), maxQ))
            : Math.min(5, maxQ);
        state.config.questionCount = sugQ;
        state._maxQuestions = maxQ;

        setTimeout(function () {
            state.step = 'step3';
            state._subStep3 = 'count';
            if (typeof global.addAIPanelMessage === 'function') {
                global.addAIPanelMessage('✓ Contenido analizado. Capacidad estimada: hasta ' + maxQ + ' preguntas.', 'ai');
                global.addAIPanelMessage('¿Cuántas preguntas quieres generar? (máx. ' + maxQ + ')', 'ai');
            }
        }, 900);
    }

    function evalAgentHandleStep3(rootEl, text) {
        var state = rootEl._ccEvalState;
        var cfg = state.config;
        var sub = state._subStep3;

        if (sub === 'count') {
            var n = parseInt(text, 10);
            var max = state._maxQuestions || 20;
            if (isNaN(n) || n < 1) {
                if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Ingresa un número mayor a 0.', 'ai');
                return;
            }
            cfg.questionCount = Math.min(n, max);
            state._subStep3 = 'difficulty';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Qué nivel de dificultad?', 'ai');
            evalAgentAddQuickReplies(
                [{ label: 'Básico', value: 'basic' }, { label: 'Intermedio', value: 'intermediate' }, { label: 'Avanzado', value: 'advanced' }],
                function (v) { evalAgentHandleStep3(rootEl, v); }
            );
            return;
        }

        if (sub === 'difficulty') {
            var diffMap = { basico: 'basic', básico: 'basic', basic: 'basic', intermedio: 'intermediate', intermediate: 'intermediate', avanzado: 'advanced', advanced: 'advanced' };
            cfg.difficulty = diffMap[text.toLowerCase()] || 'intermediate';
            state._subStep3 = 'types';
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('¿Qué tipos de pregunta quieres incluir? Selecciona uno o varios.', 'ai');
            evalAgentAddMultiSelectChips(
                [
                    { value: 'multiple_choice_single_answer', label: 'Opción múltiple, una respuesta' },
                    { value: 'multiple_choice_multiple_answers', label: 'Opción múltiple, varias correctas' },
                    { value: 'binary', label: 'Verdadero / Falso' },
                    { value: 'closed_text', label: 'Texto cerrado' },
                    { value: 'essay', label: 'Ensayo' },
                    { value: 'matching', label: 'Emparejamiento' }
                ],
                ['multiple_choice_single_answer', 'binary'],
                function (vals) {
                    cfg.questionTypes = vals;
                    state.step = 'generating';
                    state._subStep3 = null;
                    evalAgentGenerate(rootEl);
                }
            );
        }
    }

    function genMockQuestions(topic, difficulty, count, questionTypes) {
        var T = topic || 'el tema';
        var pool = {
            basic: [
                { stmt: '¿Cuál es el principal objetivo de ' + T + '?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 1 },
                { stmt: '¿Qué define el concepto de ' + T + '?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 2 },
                { stmt: '¿Cuál es una característica clave de ' + T + '?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 2 }
            ],
            intermediate: [
                { stmt: '¿Cómo contribuye ' + T + ' al desempeño organizacional?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 1 },
                { stmt: '¿Cuál es el primer paso para implementar ' + T + ' en un equipo?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 2 },
                { stmt: '¿Qué indicador permite medir el impacto de ' + T + '?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 3 }
            ],
            advanced: [
                { stmt: '¿Cuál es el mayor riesgo al implementar ' + T + ' sin estrategia clara?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 3 },
                { stmt: 'Si ' + T + ' no genera resultados esperados, ¿cuál es la acción más adecuada?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 2 },
                { stmt: '¿Qué criterio priorizar al escalar ' + T + ' en la organización?', opts: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correct: 3 }
            ]
        };
        var pool2 = pool[difficulty] || pool.intermediate;
        var types = (questionTypes && questionTypes.length) ? questionTypes : ['multiple_choice_single_answer'];
        var slice = pool2.slice(0, Math.min(count, pool2.length));
        return slice.map(function (q, i) {
            return Object.assign({}, q, { agentType: types[i % types.length] });
        });
    }

    function showUndoBanner(rootEl, count, onUndo) {
        var existing = rootEl.querySelector('#cc-eval-undo-banner');
        if (existing) existing.remove();
        var bar = rootEl.querySelector('.cc-eval-config-bar');
        if (!bar || !bar.parentNode) return;
        var banner = document.createElement('div');
        banner.id = 'cc-eval-undo-banner';
        banner.className = 'cc-eval-undo-banner';
        banner.innerHTML =
            '<span class="cc-eval-undo-banner__msg ubits-body-sm-semibold"><i class="far fa-sparkles"></i> ' + count + ' preguntas generadas por IA</span>' +
            '<div class="cc-eval-undo-banner__actions">' +
            '<button type="button" class="cc-eval-undo-btn">Deshacer</button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only cc-eval-undo-close" aria-label="Cerrar"><i class="far fa-times"></i></button>' +
            '</div>';
        // Insertar justo debajo de la barra superior (solo existe cuando hay banner)
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

        var nextModels = (questions || []).map(function (q) {
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

        pageState.questions = nextModels;
        pageState.activeQId = nextModels.length ? 1 : 1;
        renderQuestions(rootEl, pageState);
        applyFocusModes(rootEl);

        showUndoBanner(rootEl, questions.length, function () {
            pageState.questions = prevModels;
            pageState.activeQId = prevActive;
            rootEl._ccEvalActiveQId = prevActive;
            renderQuestions(rootEl, pageState);
            applyFocusModes(rootEl);
        });
    }

    function evalAgentGenerate(rootEl) {
        var state = rootEl._ccEvalState;
        var token = Date.now();
        rootEl._ccEvalGenToken = token;
        function valid() { return rootEl._ccEvalGenToken === token; }

        var diffs = { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado' };
        var dlbl = diffs[state.config.difficulty] || state.config.difficulty;

        var rm1 = typeof global.showAIPanelTyping === 'function' ? global.showAIPanelTyping() : null;
        setTimeout(function () {
            if (!valid()) { rm1 && rm1(); return; }
            rm1 && rm1();
            if (typeof global.addAIPanelMessage === 'function') global.addAIPanelMessage('Generando ' + state.config.questionCount + ' preguntas de nivel ' + dlbl + '…', 'ai');
            var rm2 = typeof global.showAIPanelTyping === 'function' ? global.showAIPanelTyping() : null;
            setTimeout(function () {
                if (!valid()) { rm2 && rm2(); return; }
                rm2 && rm2();
                var questions = genMockQuestions(state.config.title || 'Evaluación', state.config.difficulty, state.config.questionCount, state.config.questionTypes);
                applyAIQuestions(rootEl, questions);
                // aplicar config al modal si existe abierto más tarde (guardamos en pageState)
                rootEl._ccEvalPageState.config = Object.assign({}, state.config);
                state.step = 'done';
                if (typeof global.addAIPanelMessage === 'function') {
                    global.addAIPanelMessage('✓ Evaluación "' + (state.config.title || 'Evaluación') + '" creada con ' + questions.length + ' preguntas. Puedes editarlas antes de publicar.', 'ai');
                }
                if (typeof global.closeAIPanel === 'function') setTimeout(global.closeAIPanel, 900);
            }, 1200);
        }, 900);
    }

    // ---------------------------
    // Wiring principal
    // ---------------------------

    function mountEvalIn(mountEl) {
        var pageKey = getActivePageKeyFromCrearContenido();
        var pageState = ensurePageState(pageKey);
        mountEl.innerHTML = buildExamFormHtml();

        var rootEl = mountEl.querySelector('[data-cc-eval-root]') || mountEl;
        rootEl._ccEvalPageState = pageState;
        rootEl._ccEvalCurrentPageKey = String(pageKey || 'default');

        var qSeq = 0;
        rootEl._ccEvalQSeq = 0;

        // Acción única de “Añadir pregunta” para evitar estados inconsistentes.
        rootEl._ccEvalAddQuestion = function () {
            addQuestionAndFocus(rootEl, pageState);
            qSeq = rootEl._ccEvalQSeq || 0;
        };

        // Render inicial desde estado (aunque esté vacío)
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

        var iaBtn = rootEl.querySelector('#cc-eval-ia-btn');
        if (iaBtn) {
            iaBtn.addEventListener('click', function () {
                evalAgentInit(rootEl, pageState);
                if (typeof global.openAIPanel === 'function') global.openAIPanel();
                setTimeout(function () {
                    if (typeof global.addAIPanelMessage === 'function') {
                        global.addAIPanelMessage('¡Hola! Soy el Agente de evaluaciones. Te guiaré paso a paso para crear una evaluación alineada con tu contenido.', 'ai');
                    }
                    setTimeout(function () { evalAgentStart(rootEl); }, 400);
                }, 250);
            });
        }

        // Persistencia por página: al activar otra página en el índice
        if (!rootEl._ccEvalBoundPageActivate) {
            rootEl._ccEvalBoundPageActivate = true;
            rootEl._ccEvalOnPageActivate = function (ev) {
                if (!ev || !ev.detail) return;
                // Solo si seguimos montados en el DOM (si volvimos a recursos, ignorar)
                if (!document.body.contains(rootEl)) return;
                var nextKey = ev.detail.pageKey != null ? String(ev.detail.pageKey) : '';
                if (!nextKey) return;
                var curKey = rootEl._ccEvalCurrentPageKey || getActivePageKeyFromCrearContenido();
                if (String(nextKey) === String(curKey)) return;

                // Guardar estado actual en su página
                persistCurrentPage(rootEl);

                // Cambiar a la nueva página y rehidratar
                switchToPage(rootEl, nextKey);
                qSeq = rootEl._ccEvalQSeq || 0;
                rootEl._ccEvalPageState = ensurePageState(nextKey);
            };
            document.addEventListener('ubits-paginas-creator-activate', rootEl._ccEvalOnPageActivate);
        }
    }

    // API pública
    global.rcMountEvalForm = function (mountEl) {
        if (!mountEl) return;
        mountEvalIn(mountEl);
    };
})(typeof window !== 'undefined' ? window : this);

