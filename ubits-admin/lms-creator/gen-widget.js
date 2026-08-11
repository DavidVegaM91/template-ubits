/**
 * Unified Generation Widget — muestra todos los recursos en proceso de generación IA.
 * API: ccGenWidget.addJob(id, opts), ccGenWidget.finishJob(id), ccGenWidget.removeJob(id)
 */
(function (global) {
    'use strict';

    var WIDGET_ID = 'cc-gen-widget';

    var TYPE_ICONS = {
        scorm: 'fa-file-zipper',
        video: 'fa-video',
    };

    var _jobs       = [];   /* [{ id, type, label, pageKey, status:'generating'|'done' }] */
    var _minimized  = false;
    var _hidden     = false;

    function esc(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function getWidget() { return document.getElementById(WIDGET_ID); }

    /* ─── Render ─── */
    function renderWidget() {
        var w = getWidget();
        if (!w) return;

        if (!_jobs.length || _hidden) { w.style.display = 'none'; return; }
        w.style.display = '';
        w.classList.toggle('cc-gw--minimized', _minimized);

        /* Header title */
        var titleEl = w.querySelector('.cc-gw-title-text');
        if (titleEl) {
            var gen = _jobs.filter(function(j){ return j.status==='generating'; }).length;
            titleEl.textContent = gen > 0 ? 'Generando recursos' : 'Recursos generados';
        }

        /* Items */
        var body = w.querySelector('.cc-gw-body');
        if (!body) return;
        body.innerHTML = _jobs.map(function(job) {
            var icon    = TYPE_ICONS[job.type] || 'fa-sparkles';
            var sub     = job.status === 'generating' ? 'Generando...' : 'Listo · Haz clic para ver';
            var status  = job.status === 'generating'
                ? '<div class="cc-gw-loader" role="status" aria-label="Generando"></div>'
                : '<div class="cc-gw-done-check"><i class="far fa-check"></i></div>';
            return (
                '<div class="cc-gw-item' + (job.status==='done' ? ' cc-gw-item--done' : '') + '"' +
                    ' data-gw-id="' + esc(job.id) + '">' +
                    '<i class="far ' + icon + ' cc-gw-item-icon" aria-hidden="true"></i>' +
                    '<div class="cc-gw-item-info">' +
                        '<span class="cc-gw-item-name">' + esc(job.label) + '</span>' +
                        '<span class="cc-gw-item-sublabel">' + sub + '</span>' +
                    '</div>' +
                    '<div class="cc-gw-item-status">' + status + '</div>' +
                '</div>'
            );
        }).join('');

        body.querySelectorAll('.cc-gw-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var jobId = item.getAttribute('data-gw-id');
                var job   = find(jobId);
                if (!job || job.status !== 'done' || !job.pageKey) return;
                var el = document.querySelector('[data-paginas-creator-key="' + job.pageKey + '"]');
                if (el && typeof global.setPaginasCreatorActiveItem === 'function') {
                    global.setPaginasCreatorActiveItem(el);
                }
            });
        });
    }

    function find(id) {
        for (var i = 0; i < _jobs.length; i++) { if (_jobs[i].id === id) return _jobs[i]; }
        return null;
    }

    /* ─── Public API ─── */
    function addJob(id, opts) {
        removeJob(id);  /* evitar duplicados */
        _jobs.push({
            id:      id,
            type:    (opts && opts.type)    || 'scorm',
            label:   (opts && opts.label)   || '...',
            pageKey: (opts && opts.pageKey) || null,
            status:  'generating',
        });
        _minimized = false;
        _hidden    = false;
        renderWidget();
    }

    function finishJob(id) {
        var job = find(id);
        if (job) { job.status = 'done'; renderWidget(); }
    }

    function removeJob(id) {
        _jobs = _jobs.filter(function(j){ return j.id !== id; });
        renderWidget();
    }

    /* ─── Wire ─── */
    function wireWidget() {
        var w = getWidget();
        if (!w || w._ccGwWired) return;
        w._ccGwWired = true;

        var minBtn = w.querySelector('.cc-gw-minimize-btn');
        if (minBtn) minBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            _minimized = !_minimized;
            renderWidget();
        });

        var closeBtn = w.querySelector('.cc-gw-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            _jobs   = [];
            _hidden = false;
            renderWidget();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireWidget);
    } else {
        wireWidget();
    }

    global.ccGenWidget = { addJob: addJob, finishJob: finishJob, removeJob: removeJob };

}(window));
