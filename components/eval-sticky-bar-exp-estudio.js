/**
 * EvalStickyBarExpEstudio — sticky timer + intentos.
 * evalStickyBarExpEstudioHtml({ remainingSeconds, attempt, maxAttempts, className })
 * formatEvalStickyTime(seconds) → "M:SS min"
 * createEvalStickyBarExpEstudio({ container, remainingSeconds, attempt, maxAttempts, onTick, onExpire })
 */
(function (global) {
  'use strict';

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatEvalStickyTime(totalSeconds) {
    var s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + pad2(r) + ' min';
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function evalStickyBarExpEstudioHtml(opts) {
    opts = opts || {};
    var seconds = Math.max(0, Math.floor(Number(opts.remainingSeconds) || 0));
    var attempt = opts.attempt != null ? Number(opts.attempt) : 1;
    var maxAttempts = opts.maxAttempts != null ? Number(opts.maxAttempts) : 2;
    var urgent = seconds > 0 && seconds <= 60;
    var cls = ['ubits-eval-sticky-bar-exp'];
    if (urgent) cls.push('ubits-eval-sticky-bar-exp--urgent');
    if (opts.className) cls.push(opts.className);

    return (
      '<div class="' +
      cls.join(' ') +
      '" role="status" aria-live="polite">' +
      '<div class="ubits-eval-sticky-bar-exp__time">' +
      '<i class="far fa-clock" aria-hidden="true"></i>' +
      '<span>Tiempo restante:</span>' +
      '<span class="ubits-eval-sticky-bar-exp__value" data-role="time-value">' +
      escapeHtml(formatEvalStickyTime(seconds)) +
      '</span></div>' +
      '<span class="ubits-eval-sticky-bar-exp__sep" aria-hidden="true"></span>' +
      '<div class="ubits-eval-sticky-bar-exp__attempts">' +
      '<span class="ubits-eval-sticky-bar-exp__attempts-text" data-role="attempts">' +
      'Intentos: ' +
      attempt +
      ' de ' +
      maxAttempts +
      '</span></div></div>'
    );
  }

  function createEvalStickyBarExpEstudio(opts) {
    opts = opts || {};
    var container =
      opts.container ||
      (opts.containerId ? document.getElementById(opts.containerId) : null);
    if (!container) return null;

    var seconds = Math.max(0, Math.floor(Number(opts.remainingSeconds) || 0));
    var attempt = opts.attempt != null ? Number(opts.attempt) : 1;
    var maxAttempts = opts.maxAttempts != null ? Number(opts.maxAttempts) : 2;
    var timerId = null;

    function render() {
      container.innerHTML = evalStickyBarExpEstudioHtml({
        remainingSeconds: seconds,
        attempt: attempt,
        maxAttempts: maxAttempts,
        className: opts.className
      });
    }

    function tick() {
      if (seconds <= 0) {
        stop();
        if (typeof opts.onExpire === 'function') opts.onExpire();
        return;
      }
      seconds -= 1;
      render();
      if (typeof opts.onTick === 'function') opts.onTick(seconds);
      if (seconds <= 0) {
        stop();
        if (typeof opts.onExpire === 'function') opts.onExpire();
      }
    }

    function start() {
      stop();
      if (opts.autoStart === false) return;
      timerId = setInterval(tick, 1000);
    }

    function stop() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }

    render();
    start();

    return {
      getRemainingSeconds: function () {
        return seconds;
      },
      setRemainingSeconds: function (value) {
        seconds = Math.max(0, Math.floor(Number(value) || 0));
        render();
      },
      setAttempts: function (a, t) {
        attempt = a;
        if (t != null) maxAttempts = t;
        render();
      },
      start: start,
      stop: stop,
      destroy: function () {
        stop();
        container.innerHTML = '';
      }
    };
  }

  global.formatEvalStickyTime = formatEvalStickyTime;
  global.evalStickyBarExpEstudioHtml = evalStickyBarExpEstudioHtml;
  global.createEvalStickyBarExpEstudio = createEvalStickyBarExpEstudio;
})(typeof window !== 'undefined' ? window : this);
