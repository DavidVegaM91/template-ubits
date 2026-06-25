/* =============================================================================
   ia-chat-streaming.js — Comportamiento transversal de chats IA (UBITS)
   Pensando + espera, revelado palabra a palabra por párrafo.
   Cargar ANTES de study-chat.js, group-creation-chat.js o ia-panel.js.
   Expone UbitsIaChatTime.formatMessageTimeLabel (fechas en pie de mensaje IA).
   - afterMinDelay(ms, fn): espera ms y luego ejecuta fn (orden pensando → respuesta).
   - withMinDelay(ms, fn): ejecuta fn al inicio y alarga hasta ms si acabó antes (p. ej. fetch).
   ============================================================================= */
(function (global) {
    'use strict';

    var MIN_THINKING_MS = 1000;
    var WORD_DELAY_MS = 35;
    var BETWEEN_PARAGRAPH_PAUSE_MS = 48;

    function escapeHtml(str) {
        if (str == null || str === '') return '';
        var div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    /**
     * Envuelve tokens separados por espacio en spans .ubits-ia-chat-thread__word
     */
    function wrapWordsInSpans(html) {
        if (!html || !String(html).trim()) return html;
        var tokens = String(html).split(/\s+/).filter(function (t) { return t.length > 0; });
        return tokens.map(function (t) {
            return '<span class="ubits-ia-chat-thread__word">' + t + '</span>';
        }).join(' ');
    }

    function linkifyLine(line) {
        var linkRegex = /(https?:\/\/[^\s]+)/g;
        return String(line).replace(linkRegex,
            '<a href="$1" class="ubits-ia-chat-thread__link" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    /**
     * HTML interno del globo IA: un <p class="message-text"> por línea no vacía, con palabras animables.
     */
    function buildAiGlobeInnerHtmlFromPlainText(text) {
        var raw = String(text || '');
        var lines = raw.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
        if (!lines.length) {
            var t = raw.trim();
            if (!t) return '';
            lines = [t];
        }
        return lines.map(function (line) {
            var safe = escapeHtml(line);
            return '<p class="ubits-ia-chat-thread__message-text">' + wrapWordsInSpans(linkifyLine(safe)) + '</p>';
        }).join('');
    }

    /**
     * Fila “Pensando” (misma estructura que study-chat); data-ia-chat-thinking para remover.
     */
    function thinkingIndicatorHtml(label) {
        var lab = (label != null && label !== '') ? String(label) : 'Pensando';
        return '<div class="ubits-ia-chat-thread__message ubits-ia-chat-thread__message--ai" data-ia-chat-thinking="1" aria-live="polite" role="status">' +
            '<div class="ubits-ia-chat-thread__text-globe ubits-ia-chat-thread__text-globe--ai ubits-ia-chat-thread__text-globe--thinking-indicator">' +
            '<span class="ubits-ia-chat-thread__thinking-line">' +
            '<span class="ubits-ia-chat-thread__thinking-label">' + escapeHtml(lab) + '</span>' +
            '<span class="ubits-ia-chat-thread__thinking-dots" aria-hidden="true"></span>' +
            '<span class="ubits-ia-chat-thread__thinking-shimmer" aria-hidden="true"></span>' +
            '</span></div></div>';
    }

    function removeThinkingRows(container) {
        if (!container) return;
        container.querySelectorAll('[data-ia-chat-thinking="1"]').forEach(function (n) {
            n.remove();
        });
    }

    /**
     * Anima palabras párrafo a párrafo (orden vertical).
     * @param {HTMLElement} messageEl - .ubits-ia-chat-thread__message--ai o equivalente con globo IA
     * @param {function(): void} [onComplete]
     */
    function animateWordsParagraphByParagraph(messageEl, onComplete) {
        if (!messageEl) {
            if (onComplete) onComplete();
            return;
        }
        var globe = messageEl.querySelector('.ubits-ia-chat-thread__text-globe--ai');
        if (!globe) {
            if (onComplete) onComplete();
            return;
        }
        var paras = globe.querySelectorAll('.ubits-ia-chat-thread__message-text');
        if (!paras.length) {
            if (onComplete) onComplete();
            return;
        }
        var delay = WORD_DELAY_MS;
        var tAccum = 0;

        function runPara(pi) {
            if (pi >= paras.length) {
                if (onComplete) onComplete();
                return;
            }
            var words = paras[pi].querySelectorAll('.ubits-ia-chat-thread__word');
            if (!words.length) {
                paras[pi].style.opacity = '1';
                tAccum += BETWEEN_PARAGRAPH_PAUSE_MS;
                setTimeout(function () { runPara(pi + 1); }, BETWEEN_PARAGRAPH_PAUSE_MS);
                return;
            }
            var i;
            for (i = 0; i < words.length; i++) {
                (function (w, idx, start) {
                    setTimeout(function () {
                        w.classList.add('ubits-ia-chat-thread__word--visible');
                    }, start + idx * delay);
                })(words[i], i, tAccum);
            }
            tAccum += words.length * delay + BETWEEN_PARAGRAPH_PAUSE_MS;
            setTimeout(function () { runPara(pi + 1); }, words.length * delay + BETWEEN_PARAGRAPH_PAUSE_MS);
        }
        runPara(0);
    }

    /**
     * Marca fin de stream de palabras: quita --typing, añade --typing-done (acciones / extras en CSS).
     */
    function finishAiMessageStreamReveal(messageEl) {
        if (!messageEl) return;
        messageEl.classList.remove('ubits-ia-chat-thread__message--typing');
        messageEl.classList.add('ubits-ia-chat-thread__message--typing-done');
    }

    /**
     * Promise que resuelve tras al menos minMs (desde la llamada).
     * Útil cuando workFn hace trabajo real primero (p. ej. fetch) y quieres un mínimo total.
     */
    function withMinDelay(minMs, workFn) {
        var t0 = Date.now();
        var p = typeof workFn === 'function' ? Promise.resolve(workFn()) : Promise.resolve();
        return p.then(function (result) {
            var elapsed = Date.now() - t0;
            var wait = minMs - elapsed;
            if (wait <= 0) return result;
            return new Promise(function (resolve) {
                setTimeout(function () { resolve(result); }, wait);
            });
        });
    }

    /**
     * Espera minMs y luego ejecuta workFn (orden “pensando” → respuesta).
     * No ejecuta workFn hasta pasado el tiempo; distinto de withMinDelay.
     */
    function afterMinDelay(minMs, workFn) {
        var ms = Math.max(0, Number(minMs) || 0);
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                if (typeof workFn !== 'function') {
                    resolve();
                    return;
                }
                try {
                    var r = workFn();
                    if (r && typeof r.then === 'function') {
                        r.then(resolve).catch(reject);
                    } else {
                        resolve(r);
                    }
                } catch (err) {
                    reject(err);
                }
            }, ms);
        });
    }

    /** Misma lógica relativa que comentarios en task-detail; >2 días: "22 abr, 02:50 p.m." */
    function pad2(n) {
        return String(n).padStart(2, '0');
    }
    function formatMessageTimeAbsoluteShort(d) {
        var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        var dia = d.getDate();
        var mes = meses[d.getMonth()];
        var h = d.getHours();
        var m = d.getMinutes();
        var am = h < 12;
        if (h === 0) h = 12;
        else if (h > 12) h -= 12;
        return dia + ' ' + mes + ', ' + pad2(h) + ':' + pad2(m) + ' ' + (am ? 'a.m.' : 'p.m.');
    }
    function formatMessageTimeLabel(d) {
        if (!(d instanceof Date) || isNaN(d.getTime())) return '';
        var now = new Date();
        var diffMs = now - d;
        if (diffMs < 0) return formatMessageTimeAbsoluteShort(d);
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMs / 3600000);
        var diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return 'Hace ' + (diffMins <= 1 ? 'un momento' : diffMins + ' min');
        if (diffHours < 24) return 'Hace ' + (diffHours === 1 ? '1 h' : diffHours + ' h');
        if (diffDays <= 2) return 'Hace ' + (diffDays === 1 ? '1 día' : diffDays + ' días');
        return formatMessageTimeAbsoluteShort(d);
    }

    global.UbitsIaChatStreaming = {
        MIN_THINKING_MS: MIN_THINKING_MS,
        WORD_DELAY_MS: WORD_DELAY_MS,
        BETWEEN_PARAGRAPH_PAUSE_MS: BETWEEN_PARAGRAPH_PAUSE_MS,
        escapeHtml: escapeHtml,
        wrapWordsInSpans: wrapWordsInSpans,
        buildAiGlobeInnerHtmlFromPlainText: buildAiGlobeInnerHtmlFromPlainText,
        thinkingIndicatorHtml: thinkingIndicatorHtml,
        removeThinkingRows: removeThinkingRows,
        animateWordsParagraphByParagraph: animateWordsParagraphByParagraph,
        finishAiMessageStreamReveal: finishAiMessageStreamReveal,
        withMinDelay: withMinDelay,
        afterMinDelay: afterMinDelay
    };

    global.UbitsIaChatTime = {
        formatMessageTimeLabel: formatMessageTimeLabel
    };

    /** Texto legal transversal bajo el input en todos los chats IA (panel, modo estudio, grupos…). */
    var DEFAULT_IA_DISCLAIMER_TEXT = 'El agente puede cometer errores; verifica la información.';
    global.UbitsIaChatDisclaimer = {
        DEFAULT_TEXT: DEFAULT_IA_DISCLAIMER_TEXT
    };
})(typeof window !== 'undefined' ? window : this);
