/* ========================================
   IA PANEL — Contenido demo para vista artifact (quiz / flashcards)
   Mismos datos base que Modo estudio IA (study-chat.js), sin depender de él.
   Requiere: radio-button.css, modo-estudio-ia-tutor-panel.css (o estilos equivalentes del tutor),
   ubits-ia-chat.css, button.css, typography.
   ======================================== */

(function (global) {
    /** Misma base que TUTOR_QUIZ.liderazgo en study-chat.js */
    var DEMO_QUIZ_LIDERAZGO = [
        { q: '¿Qué define principalmente a un líder?', options: ['Solo da órdenes', 'Inspira y guía al equipo hacia un objetivo', 'Trabaja solo', 'Evita conflictos'], correct: 1, explanation: 'Un líder inspira y guía al equipo hacia un objetivo común, no solo da órdenes.' },
        { q: '¿Cuál es un estilo de liderazgo participativo?', options: ['Autocrático', 'Democrático', 'Laissez-faire', 'Directivo'], correct: 1, explanation: 'El estilo democrático fomenta la participación del equipo en las decisiones.' },
        { q: 'La inteligencia emocional en el liderazgo ayuda a:', options: ['Ignorar sentimientos', 'Gestionar equipos con empatía y autoconocimiento', 'Solo dar feedback negativo', 'Evitar la comunicación'], correct: 1, explanation: 'La IE permite gestionar equipos con empatía, autoconocimiento y comunicación efectiva.' },
        { q: 'La delegación efectiva consiste en:', options: ['Hacer todo uno mismo', 'Asignar tareas y autoridad manteniendo responsabilidad', 'Evitar dar instrucciones', 'Solo supervisar resultados'], correct: 1, explanation: 'Delegar bien es asignar tareas y autoridad a otros manteniendo responsabilidad y seguimiento.' },
        { q: 'Un líder transformacional se caracteriza por:', options: ['Mantener el statu quo', 'Inspirar cambios positivos y una visión compartida', 'Evitar el contacto con el equipo', 'Solo medir resultados'], correct: 1, explanation: 'El liderazgo transformacional inspira cambios y motiva con una visión compartida.' }
    ];

    /** Misma base que TUTOR_FLASHCARDS.comunicacion en study-chat.js */
    var DEMO_FLASHCARDS_COMUNICACION = [
        { front: 'Comunicación no verbal', back: 'Mensajes transmitidos con gestos, postura, mirada y tono de voz.' },
        { front: 'Barreras de comunicación', back: 'Ruido, suposiciones, emociones o idioma que dificultan el entendimiento.' },
        { front: 'Parafrasear', back: 'Repetir con tus palabras lo que dijo el otro para confirmar que entendiste.' },
        { front: 'Escucha activa', back: 'Atender con atención plena, hacer preguntas y resumir lo que dijo el otro.' },
        { front: 'Mensaje yo', back: 'Expresar lo que sientes o necesitas sin culpar: "Yo me siento..." en lugar de "Tú siempre..."' }
    ];

    function getQuizScoreTierModifier_(accuracy) {
        var a = Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)));
        if (a >= 80) return 'ubits-ia-chat-side__quiz-score--success';
        if (a >= 60) return 'ubits-ia-chat-side__quiz-score--warning';
        return 'ubits-ia-chat-side__quiz-score--error';
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escAttr(s) {
        return String(s).replace(/"/g, '&quot;');
    }

    function shuffleQuizOptions(questions) {
        if (!questions || !questions.length) return questions;
        return questions.map(function (qu) {
            var opts = qu.options.slice();
            var correctIdx = qu.correct;
            var correctValue = opts[correctIdx];
            for (var i = opts.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = opts[i];
                opts[i] = opts[j];
                opts[j] = t;
            }
            var newCorrect = opts.indexOf(correctValue);
            return { q: qu.q, options: opts, correct: newCorrect, explanation: qu.explanation };
        });
    }

    function cloneQuestions() {
        return DEMO_QUIZ_LIDERAZGO.map(function (qu) {
            return { q: qu.q, options: qu.options.slice(), correct: qu.correct, explanation: qu.explanation };
        });
    }

    function buildArtifactQuizHtml() {
        var questions = shuffleQuizOptions(cloneQuestions());
        var totalQuestions = questions.length;
        var progressBlock = typeof segmentedProgressHtml === 'function'
            ? segmentedProgressHtml({
                total: totalQuestions,
                current: 0,
                mode: 'segments',
                size: 'sm',
                track: 'default',
                ariaLabel: 'Progreso del quiz'
            })
            : '<div class="ubits-segmented-progress ubits-segmented-progress--segments ubits-segmented-progress--sm" role="group" aria-label="Progreso del quiz"></div>';
        var questionsHtml = questions.map(function (qu, i) {
            var optsHtml = qu.options.map(function (opt, j) {
                var letter = String.fromCharCode(65 + j);
                return '<label class="ubits-ia-chat-side__quiz-opt" data-option-index="' + j + '">' +
                    '<div class="ubits-ia-chat-side__quiz-opt-row ubits-radio ubits-radio--sm">' +
                    '<input type="radio" name="ia-panel-artifact-quiz-' + i + '" class="ubits-radio__input" value="' + j + '">' +
                    '<span class="ubits-radio__circle"></span>' +
                    '<span class="ubits-radio__label"><span class="ubits-ia-chat-side__quiz-opt-letter">' + letter + '</span> ' +
                    '<span class="ubits-ia-chat-side__quiz-opt-text">' + esc(opt) + '</span></span></div></label>';
            }).join('');
            return '<div class="ubits-ia-chat-side__quiz-q" data-index="' + i + '" data-correct-index="' + qu.correct + '" data-explanation="' + escAttr(qu.explanation || '') + '" ' + (i > 0 ? 'style="display:none;"' : '') + '>' +
                '<p class="ubits-body-md-regular ubits-ia-chat-side__quiz-question-text">' + (i + 1) + '. ' + esc(qu.q) + '</p>' +
                '<div class="ubits-ia-chat-side__quiz-options">' + optsHtml + '</div>' +
                '<div class="ubits-ia-chat-side__quiz-feedback" style="display:none;" role="status" aria-hidden="true"></div></div>';
        }).join('');

        return '<div class="ubits-ia-chat-side__content ubits-ia-chat-side__quiz ia-panel-artifact-tutor" data-topic="liderazgo" data-quiz-total="' + totalQuestions + '">' +
            '<div class="ubits-ia-chat-side__body">' +
            '<div class="ubits-ia-chat-side__quiz-progress">' + progressBlock +
            '<span class="ubits-ia-chat-side__quiz-progress-text">1 / ' + totalQuestions + '</span>' +
            '<span class="ubits-ia-chat-side__quiz-progress-stats">' +
            '<span class="ubits-ia-chat-side__quiz-progress-stat-pill ubits-ia-chat-side__quiz-progress-wrong" data-tooltip="Respuestas incorrectas" aria-label="Respuestas incorrectas"><i class="far fa-times"></i><span class="ubits-ia-chat-side__quiz-progress-wrong-n">0</span></span>' +
            '<span class="ubits-ia-chat-side__quiz-progress-stat-pill ubits-ia-chat-side__quiz-progress-correct" data-tooltip="Respuestas correctas" aria-label="Respuestas correctas"><i class="far fa-check"></i><span class="ubits-ia-chat-side__quiz-progress-correct-n">0</span></span>' +
            '</span></div>' +
            '<div class="ubits-ia-chat-side__quiz-questions">' + questionsHtml + '</div>' +
            '<div class="ubits-ia-chat-side__quiz-result" style="display:none;" role="region" aria-label="Resultados del quiz"></div>' +
            '</div>' +
            '<div class="ubits-ia-chat-side__footer">' +
            '<div class="ubits-ia-chat-side__quiz-actions">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="ia-panel-artifact-quiz-back" style="display:none;"><span>Anterior</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="ia-panel-artifact-quiz-next" style="display:none;"><span>Siguiente</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="ia-panel-artifact-quiz-submit" style="display:none;"><span>Hecho</span></button>' +
            '</div></div></div>';
    }

    function buildArtifactFlashcardsHtml() {
        var cards = DEMO_FLASHCARDS_COMUNICACION.slice();
        var fcTotal = cards.length;
        var fcProgressBlock = typeof segmentedProgressHtml === 'function'
            ? segmentedProgressHtml({
                total: fcTotal,
                current: 0,
                mode: 'segments',
                size: 'sm',
                track: 'subtle',
                ariaLabel: 'Progreso de flashcards'
            })
            : '<div class="ubits-segmented-progress ubits-segmented-progress--segments ubits-segmented-progress--sm ubits-segmented-progress--track-subtle" role="group" aria-label="Progreso de flashcards"></div>';
        var cardsJson = JSON.stringify(cards).replace(/'/g, '&#39;');
        return '<div class="ubits-ia-chat-side__content ubits-ia-chat-side__flashcards ia-panel-artifact-tutor" data-topic="comunicacion" data-fc-set="0">' +
            '<div class="ubits-ia-chat-side__body">' +
            '<div class="ubits-ia-chat-side__fc-main">' +
            '<div class="ubits-ia-chat-side__fc-progress">' +
            fcProgressBlock +
            '<span class="ubits-ia-chat-side__fc-progress-text">1 / ' + fcTotal + '</span></div>' +
            '<div class="ubits-ia-chat-side__fc-card" data-index="0" role="button" tabindex="0" aria-label="Clic para voltear la tarjeta">' +
            '<div class="ubits-ia-chat-side__fc-card-inner">' +
            '<div class="ubits-ia-chat-side__fc-face ubits-ia-chat-side__fc-front"><p class="ubits-body-md-regular">' + esc(cards[0].front) + '</p></div>' +
            '<div class="ubits-ia-chat-side__fc-face ubits-ia-chat-side__fc-back"><p class="ubits-body-md-regular">' + esc(cards[0].back) + '</p></div>' +
            '</div></div>' +
            '<p class="ubits-ia-chat-side__fc-hint ubits-body-sm-regular">Tocá la tarjeta para girarla y ver la respuesta.</p>' +
            '<div class="ubits-ia-chat-side__fc-deck" data-cards=\'' + cardsJson + '\' style="display:none;"></div>' +
            '</div>' +
            '<div class="ubits-ia-chat-side__fc-result" style="display:none;" role="region" aria-label="Resumen"></div>' +
            '</div>' +
            '<div class="ubits-ia-chat-side__footer">' +
            '<div class="ubits-ia-chat-side__fc-actions">' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="ia-panel-artifact-fc-shuffle"><i class="far fa-shuffle"></i><span>Barajar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="ia-panel-artifact-fc-prev" style="display:none;"><i class="far fa-chevron-left"></i><span>Anterior</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="ia-panel-artifact-fc-next"><span>Siguiente</span><i class="far fa-chevron-right"></i></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="ia-panel-artifact-fc-done" style="display:none;"><span>Hecho</span></button>' +
            '</div></div></div>';
    }

    function artifactQuizHintHtml() {
        return '<p class="ubits-body-sm-regular ubits-ia-chat-side__artifact-back-hint">Usa el botón Atrás en la cabecera del panel para volver al chat.</p>';
    }

    function bindArtifactQuiz(panel) {
        if (!panel) return;
        var questions = panel.querySelectorAll('.ubits-ia-chat-side__quiz-q');
        var progressWrap = panel.querySelector('.ubits-ia-chat-side__quiz-progress');
        var segmentedProgressRoot = progressWrap ? progressWrap.querySelector('.ubits-segmented-progress') : null;
        var progressText = panel.querySelector('.ubits-ia-chat-side__quiz-progress-text');
        var progressWrongN = panel.querySelector('.ubits-ia-chat-side__quiz-progress-wrong-n');
        var progressCorrectN = panel.querySelector('.ubits-ia-chat-side__quiz-progress-correct-n');
        var backBtn = panel.querySelector('#ia-panel-artifact-quiz-back');
        var nextBtn = panel.querySelector('#ia-panel-artifact-quiz-next');
        var submitBtn = panel.querySelector('#ia-panel-artifact-quiz-submit');
        var resultDiv = panel.querySelector('.ubits-ia-chat-side__quiz-result');
        var questionsContainer = panel.querySelector('.ubits-ia-chat-side__quiz-questions');
        var actionsDiv = panel.querySelector('.ubits-ia-chat-side__quiz-actions');
        var currentIdx = 0;
        var total = questions.length;
        var answers = [];
        var correctCount = 0;
        var wrongCount = 0;

        function updateProgressBar() {
            if (progressText) progressText.textContent = (currentIdx + 1) + ' / ' + total;
            if (segmentedProgressRoot && typeof setSegmentedProgressValue === 'function') {
                setSegmentedProgressValue(segmentedProgressRoot, currentIdx);
            }
            if (progressWrongN) progressWrongN.textContent = wrongCount;
            if (progressCorrectN) progressCorrectN.textContent = correctCount;
        }

        function showImmediateFeedback(qEl, selectedValue, correctIdx, explanation) {
            var opts = qEl.querySelectorAll('.ubits-ia-chat-side__quiz-opt');
            var explanationEsc = (explanation || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
            opts.forEach(function (label, j) {
                var existing = label.querySelector('.ubits-ia-chat-side__quiz-opt-inline-feedback');
                if (existing) existing.remove();
                label.classList.remove('ubits-ia-chat-side__quiz-opt--correct', 'ubits-ia-chat-side__quiz-opt--wrong');
                var input = label.querySelector('input');
                if (input) input.disabled = true;
                if (j === correctIdx) {
                    label.classList.add('ubits-ia-chat-side__quiz-opt--correct');
                    label.insertAdjacentHTML('beforeend', '<div class="ubits-ia-chat-side__quiz-opt-inline-feedback ubits-ia-chat-side__quiz-opt-inline-feedback--correct">' +
                        '<span class="ubits-ia-chat-side__quiz-opt-inline-feedback-status"><i class="far fa-check"></i> Respuesta correcta</span>' +
                        (explanationEsc ? '<p class="ubits-ia-chat-side__quiz-opt-inline-feedback-explanation">' + explanationEsc + '</p>' : '') + '</div>');
                } else if (j === selectedValue && j !== correctIdx) {
                    label.classList.add('ubits-ia-chat-side__quiz-opt--wrong');
                    label.insertAdjacentHTML('beforeend', '<div class="ubits-ia-chat-side__quiz-opt-inline-feedback ubits-ia-chat-side__quiz-opt-inline-feedback--wrong">' +
                        '<span class="ubits-ia-chat-side__quiz-opt-inline-feedback-status"><i class="far fa-times"></i> Respuesta incorrecta</span>' +
                        (explanationEsc ? '<p class="ubits-ia-chat-side__quiz-opt-inline-feedback-explanation">' + explanationEsc + '</p>' : '') + '</div>');
                }
            });
            if (selectedValue === correctIdx) correctCount++; else wrongCount++;
        }

        function bindResultFooter() {
            var rev = panel.querySelector('#ia-panel-artifact-quiz-review');
            var ret = panel.querySelector('#ia-panel-artifact-quiz-retry');
            if (ret) ret.onclick = function () { openQuizDemo(); };
            if (rev) {
                rev.onclick = function () {
                    resultDiv.style.display = 'none';
                    if (progressWrap) progressWrap.style.display = 'flex';
                    questionsContainer.style.display = 'block';
                    currentIdx = 0;
                    questions.forEach(function (q, i) { q.style.display = i === 0 ? 'block' : 'none'; });
                    actionsDiv.innerHTML =
                        '<div class="ubits-ia-chat-side__quiz-result-actions">' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="ia-panel-artifact-quiz-review-prev"><span>Anterior</span></button>' +
                        '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="ia-panel-artifact-quiz-review-next"><span>Siguiente</span></button></div>';
                    var prev = panel.querySelector('#ia-panel-artifact-quiz-review-prev');
                    var next = panel.querySelector('#ia-panel-artifact-quiz-review-next');
                    function syncReview() {
                        questions.forEach(function (q, i) { q.style.display = i === currentIdx ? 'block' : 'none'; });
                        if (prev) prev.style.display = currentIdx > 0 ? 'inline-flex' : 'none';
                        if (next) {
                            var sp = next.querySelector('span');
                            if (sp) sp.textContent = currentIdx < total - 1 ? 'Siguiente' : 'Volver a resultados';
                        }
                    }
                    if (prev) prev.onclick = function () { currentIdx--; syncReview(); };
                    if (next) {
                        next.onclick = function () {
                            if (currentIdx < total - 1) { currentIdx++; syncReview(); }
                            else {
                                questionsContainer.style.display = 'none';
                                if (progressWrap) progressWrap.style.display = 'none';
                                resultDiv.style.display = 'block';
                                actionsDiv.innerHTML =
                                    '<div class="ubits-ia-chat-side__quiz-result-actions">' +
                                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="ia-panel-artifact-quiz-review"><span>Revisar respuestas</span></button>' +
                                    '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="ia-panel-artifact-quiz-retry"><span>Reintentar</span></button></div>';
                                bindResultFooter();
                            }
                        };
                    }
                    syncReview();
                };
            }
        }

        function showResultsScreen() {
            var accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            var skipped = total - correctCount - wrongCount;
            var scoreTierMod = getQuizScoreTierModifier_(accuracy);
            resultDiv.innerHTML =
                '<div class="ubits-ia-chat-side__quiz-result-screen">' +
                '<h2 class="ubits-ia-chat-side__quiz-result-title">Quiz completado</h2>' +
                '<div class="ubits-ia-chat-side__quiz-result-cards">' +
                '<div class="ubits-ia-chat-side__quiz-result-card"><span class="ubits-ia-chat-side__quiz-result-card-label">Puntuación</span>' +
                '<span class="ubits-ia-chat-side__quiz-result-card-value ubits-ia-chat-side__quiz-score ' + scoreTierMod + '">' + correctCount + '/' + total + '</span></div>' +
                '<div class="ubits-ia-chat-side__quiz-result-card"><span class="ubits-ia-chat-side__quiz-result-card-label">Precisión</span>' +
                '<span class="ubits-ia-chat-side__quiz-result-card-value ubits-ia-chat-side__quiz-score ' + scoreTierMod + '">' + accuracy + '%</span></div>' +
                '<div class="ubits-ia-chat-side__quiz-result-card ubits-ia-chat-side__quiz-result-card--breakdown">' +
                '<div class="ubits-ia-chat-side__quiz-result-breakdown">' +
                '<div class="ubits-ia-chat-side__quiz-result-row"><span>Correctas</span><span>' + correctCount + '</span></div>' +
                '<div class="ubits-ia-chat-side__quiz-result-row"><span>Incorrectas</span><span>' + wrongCount + '</span></div>' +
                '<div class="ubits-ia-chat-side__quiz-result-row"><span>Omitidas</span><span>' + skipped + '</span></div>' +
                '</div></div></div>' + artifactQuizHintHtml() + '</div>';
            questionsContainer.style.display = 'none';
            if (progressWrap) progressWrap.style.display = 'none';
            actionsDiv.innerHTML =
                '<div class="ubits-ia-chat-side__quiz-result-actions">' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="ia-panel-artifact-quiz-review"><span>Revisar respuestas</span></button>' +
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="ia-panel-artifact-quiz-retry"><span>Reintentar</span></button>' +
                '</div>';
            actionsDiv.style.display = 'flex';
            resultDiv.style.display = 'block';
            bindResultFooter();
        }

        function updateVisibility() {
            questions.forEach(function (q, i) { q.style.display = i === currentIdx ? 'block' : 'none'; });
            if (backBtn) backBtn.style.display = currentIdx > 0 ? 'inline-flex' : 'none';
            if (nextBtn) nextBtn.style.display = currentIdx < total - 1 ? 'inline-flex' : 'none';
            if (submitBtn) submitBtn.style.display = currentIdx === total - 1 ? 'inline-flex' : 'none';
            updateProgressBar();
        }

        questions.forEach(function (qEl, i) {
            var inputs = qEl.querySelectorAll('input[type="radio"]');
            inputs.forEach(function (input) {
                input.addEventListener('change', function () {
                    var val = parseInt(this.value, 10);
                    answers[i] = val;
                    var correctIdx = parseInt(qEl.getAttribute('data-correct-index'), 10);
                    var explanation = (qEl.getAttribute('data-explanation') || '').replace(/&quot;/g, '"');
                    showImmediateFeedback(qEl, val, correctIdx, explanation);
                    updateVisibility();
                });
            });
        });
        if (backBtn) backBtn.addEventListener('click', function () { currentIdx--; updateVisibility(); });
        if (nextBtn) nextBtn.addEventListener('click', function () { currentIdx++; updateVisibility(); });
        if (submitBtn) submitBtn.addEventListener('click', showResultsScreen);
        updateVisibility();

        if (typeof global.initTooltip === 'function') {
            global.setTimeout(function () { global.initTooltip('#ia-panel-artifact-scroll [data-tooltip]'); }, 0);
        }
    }

    function bindArtifactFlashcards(panel) {
        if (!panel) return;
        var deck = panel.querySelector('.ubits-ia-chat-side__fc-deck');
        var cards = JSON.parse(deck.getAttribute('data-cards').replace(/&#39;/g, "'"));
        var fcIndex = 0;
        var cardEl = panel.querySelector('.ubits-ia-chat-side__fc-card');
        var frontEl = panel.querySelector('.ubits-ia-chat-side__fc-front');
        var backEl = panel.querySelector('.ubits-ia-chat-side__fc-back');
        var fcProgressWrap = panel.querySelector('.ubits-ia-chat-side__fc-progress');
        var fcSegmentedRoot = fcProgressWrap ? fcProgressWrap.querySelector('.ubits-segmented-progress') : null;
        var progressText = panel.querySelector('.ubits-ia-chat-side__fc-progress-text');
        var fcMain = panel.querySelector('.ubits-ia-chat-side__fc-main');
        var resultDiv = panel.querySelector('.ubits-ia-chat-side__fc-result');
        var actionsDiv = panel.querySelector('.ubits-ia-chat-side__fc-actions');
        var footerHtml = actionsDiv.innerHTML;

        function navBtns() {
            return {
                prev: panel.querySelector('#ia-panel-artifact-fc-prev'),
                next: panel.querySelector('#ia-panel-artifact-fc-next'),
                done: panel.querySelector('#ia-panel-artifact-fc-done'),
                shuffle: panel.querySelector('#ia-panel-artifact-fc-shuffle')
            };
        }

        function updateFcProgress() {
            if (fcSegmentedRoot && typeof setSegmentedProgressValue === 'function') {
                setSegmentedProgressValue(fcSegmentedRoot, fcIndex);
            }
            if (progressText) progressText.textContent = (fcIndex + 1) + ' / ' + cards.length;
            var n = navBtns();
            var isFirst = fcIndex === 0;
            var isLast = fcIndex === cards.length - 1;
            if (n.prev) n.prev.style.display = isFirst ? 'none' : '';
            if (n.next) n.next.style.display = isLast ? 'none' : '';
            if (n.done) n.done.style.display = isLast ? '' : 'none';
        }

        function showCard() {
            frontEl.innerHTML = '<p class="ubits-body-md-regular">' + esc(cards[fcIndex].front) + '</p>';
            backEl.innerHTML = '<p class="ubits-body-md-regular">' + esc(cards[fcIndex].back) + '</p>';
            cardEl.classList.remove('ubits-ia-chat-side__fc-card--flipped');
            cardEl.setAttribute('data-index', fcIndex);
            updateFcProgress();
        }

        function flipCard() {
            cardEl.classList.toggle('ubits-ia-chat-side__fc-card--flipped');
        }

        function bindNav() {
            var n = navBtns();
            if (n.prev) {
                n.prev.onclick = function (e) {
                    e.stopPropagation();
                    fcIndex = (fcIndex - 1 + cards.length) % cards.length;
                    showCard();
                };
            }
            if (n.next) {
                n.next.onclick = function (e) {
                    e.stopPropagation();
                    fcIndex = Math.min(fcIndex + 1, cards.length - 1);
                    showCard();
                };
            }
            if (n.done) {
                n.done.onclick = function (e) {
                    e.stopPropagation();
                    showFcDone();
                };
            }
            if (n.shuffle) {
                n.shuffle.onclick = function (e) {
                    e.stopPropagation();
                    for (var i = cards.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var t = cards[i];
                        cards[i] = cards[j];
                        cards[j] = t;
                    }
                    fcIndex = 0;
                    deck.setAttribute('data-cards', JSON.stringify(cards).replace(/'/g, '&#39;'));
                    showCard();
                };
            }
        }

        function showFcDone() {
            resultDiv.innerHTML =
                '<div class="ubits-ia-chat-side__quiz-result-screen">' +
                '<h2 class="ubits-ia-chat-side__quiz-result-title">Flashcards completadas</h2>' +
                artifactQuizHintHtml() + '</div>';
            if (fcMain) fcMain.style.display = 'none';
            if (actionsDiv) {
                actionsDiv.innerHTML =
                    '<div class="ubits-ia-chat-side__quiz-result-actions">' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="ia-panel-artifact-fc-review"><span>Revisar tarjetas</span></button>' +
                    '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="ia-panel-artifact-fc-retry"><span>Reintentar</span></button></div>';
                actionsDiv.style.display = 'flex';
            }
            resultDiv.style.display = 'block';
            var rev = panel.querySelector('#ia-panel-artifact-fc-review');
            var ret = panel.querySelector('#ia-panel-artifact-fc-retry');
            if (rev) {
                rev.onclick = function () {
                    resultDiv.style.display = 'none';
                    resultDiv.innerHTML = '';
                    if (fcMain) fcMain.style.display = '';
                    actionsDiv.innerHTML = footerHtml;
                    bindNav();
                    fcIndex = 0;
                    showCard();
                };
            }
            if (ret) ret.onclick = function () { openFlashcardsDemo(); };
        }

        if (cardEl) {
            cardEl.addEventListener('click', function (e) {
                if (e.target.closest('button') || e.target.closest('.ubits-ia-chat-side__fc-actions')) return;
                flipCard();
            });
            cardEl.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
            });
        }
        bindNav();
        showCard();
    }

    function openQuizDemo() {
        if (typeof global.openIAPanelArtifactView !== 'function') return;
        var html = buildArtifactQuizHtml();
        global.openIAPanelArtifactView(html, {
            title: 'Quiz · Liderazgo',
            onAfterMount: function () {
                var root = document.querySelector('#ia-panel-artifact-scroll .ubits-ia-chat-side__content');
                if (root) bindArtifactQuiz(root);
            }
        });
    }

    function openFlashcardsDemo() {
        if (typeof global.openIAPanelArtifactView !== 'function') return;
        var html = buildArtifactFlashcardsHtml();
        global.openIAPanelArtifactView(html, {
            title: 'Flashcards · Comunicación',
            onAfterMount: function () {
                var root = document.querySelector('#ia-panel-artifact-scroll .ubits-ia-chat-side__content');
                if (root) bindArtifactFlashcards(root);
            }
        });
    }

    global.UbitsIAPanelArtifactContent = {
        openQuizDemo: openQuizDemo,
        openFlashcardsDemo: openFlashcardsDemo,
        buildArtifactQuizHtml: buildArtifactQuizHtml,
        buildArtifactFlashcardsHtml: buildArtifactFlashcardsHtml,
        bindArtifactQuiz: bindArtifactQuiz,
        bindArtifactFlashcards: bindArtifactFlashcards
    };
})(typeof window !== 'undefined' ? window : this);
