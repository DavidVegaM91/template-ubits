/**
 * UBITS Progress bar — barra horizontal 0–100 %.
 *
 * progressBarHtml({ value, size, rounded, variant, status, track, width, className, id, ariaLabel })
 * createProgressBar({ containerId | container, ... }) → { getValue, setValue, setStatus, setRounded, destroy }
 *
 * Tamaños (altura del track): sm 5px · lg 8px
 * Relleno por defecto (sin variant): --ubits-accent-brand. variant: 'chart' solo casos excepcionales.
 * Requiere: progress-bar.css + tokens UBITS (colors, spacing vía styles.css)
 */
(function (global) {
    'use strict';

    var SIZES = ['sm', 'lg'];

    function normalizeProgressBarSize(size) {
        var s = String(size || 'sm').toLowerCase();
        if (s === 'xs' || s === 'md') return 'sm';
        return SIZES.indexOf(s) >= 0 ? s : 'sm';
    }

    function clampProgress(value) {
        var n = Math.round(Number(value));
        if (isNaN(n)) return 0;
        return Math.max(0, Math.min(100, n));
    }

    function buildProgressBarClassNames(opts) {
        opts = opts || {};
        var size = normalizeProgressBarSize(opts.size);
        var classes = ['ubits-progress-bar', 'ubits-progress-bar--' + size];

        if (opts.rounded) {
            classes.push('ubits-progress-bar--rounded');
        }
        if (opts.variant === 'chart') {
            /* Excepcional: no usar en cards ni flujos habituales; default = accent-brand */
            classes.push('ubits-progress-bar--variant-chart');
        }
        if (opts.track === 'static') {
            classes.push('ubits-progress-bar--track-static');
        } else if (opts.track === 'subtle') {
            classes.push('ubits-progress-bar--track-subtle');
        }
        var value = clampProgress(opts.value);
        var status = opts.status;
        if (status === 'complete' || value >= 100 && opts.autoComplete !== false) {
            classes.push('ubits-progress-bar--complete');
        }
        if (opts.className) {
            classes.push(opts.className);
        }
        return classes.join(' ');
    }

    function progressBarHtml(opts) {
        opts = opts || {};
        var value = clampProgress(opts.value);
        var idAttr = opts.id ? ' id="' + String(opts.id).replace(/"/g, '') + '"' : '';
        var style = opts.width ? ' style="width:' + String(opts.width).replace(/"/g, '') + '"' : '';
        var ariaLabel = opts.ariaLabel || 'Progreso';
        var statusAttr = opts.status === 'complete' || (value >= 100 && opts.autoComplete !== false)
            ? ' data-status="complete"'
            : '';

        return (
            '<div class="' + buildProgressBarClassNames(opts) + '"' + idAttr + style +
            ' role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + value + '"' +
            ' aria-label="' + String(ariaLabel).replace(/"/g, '&quot;') + '"' + statusAttr + '>' +
                '<div class="ubits-progress-bar__track">' +
                    '<div class="ubits-progress-bar__fill" style="width:' + value + '%"></div>' +
                '</div>' +
            '</div>'
        );
    }

    function progressBarRowHtml(opts) {
        opts = opts || {};
        var value = clampProgress(opts.value);
        var showPercent = opts.showPercent !== false;
        var rowClass = 'ubits-progress-bar-row';
        if (opts.fixedWidth60) {
            rowClass += ' ubits-progress-bar-row--fixed-60';
        }
        if (opts.rowClassName) {
            rowClass += ' ' + opts.rowClassName;
        }

        var barOpts = Object.assign({}, opts);
        delete barOpts.showPercent;
        delete barOpts.fixedWidth60;
        delete barOpts.rowClassName;

        return (
            '<div class="' + rowClass + '">' +
                progressBarHtml(barOpts) +
                (showPercent
                    ? '<span class="ubits-body-sm-regular ubits-progress-bar-row__label">' + value + '%</span>'
                    : '') +
            '</div>'
        );
    }

    function applyProgressBarState(root, opts) {
        if (!root) return;
        var value = clampProgress(opts.value != null ? opts.value : root.getAttribute('aria-valuenow'));
        var fill = root.querySelector('.ubits-progress-bar__fill');
        if (fill) {
            fill.style.width = value + '%';
        }
        root.setAttribute('aria-valuenow', String(value));

        var complete = opts.status === 'complete' || (value >= 100 && opts.autoComplete !== false);
        root.classList.toggle('ubits-progress-bar--complete', complete);
        if (complete) {
            root.setAttribute('data-status', 'complete');
        } else {
            root.removeAttribute('data-status');
        }
    }

    function setProgressBarValue(root, value, opts) {
        applyProgressBarState(root, Object.assign({}, opts || {}, { value: value }));
    }

    /** Celda de tabla: barra lg 60px + porcentaje (patrón ubits-table__cell-progress). */
    function tableProgressCellHtml(value, opts) {
        return progressBarRowHtml(Object.assign({
            value: value,
            size: 'lg',
            rounded: true,
            fixedWidth60: true,
            rowClassName: 'ubits-table__cell-progress',
            ariaLabel: 'Progreso'
        }, opts || {}));
    }

    function createProgressBar(opts) {
        opts = opts || {};
        var container = typeof opts.containerId === 'string'
            ? document.getElementById(opts.containerId)
            : opts.container;
        if (!container) return null;

        container.innerHTML = opts.withLabelRow
            ? progressBarRowHtml(opts)
            : progressBarHtml(opts);

        var root = container.querySelector('.ubits-progress-bar');
        if (!root) return null;

        return {
            getValue: function () {
                return clampProgress(root.getAttribute('aria-valuenow'));
            },
            setValue: function (v) {
                setProgressBarValue(root, v, opts);
            },
            setStatus: function (status) {
                applyProgressBarState(root, Object.assign({}, opts, {
                    value: root.getAttribute('aria-valuenow'),
                    status: status,
                    autoComplete: status === 'complete'
                }));
            },
            setRounded: function (rounded) {
                root.classList.toggle('ubits-progress-bar--rounded', !!rounded);
            },
            getElement: function () {
                return root;
            },
            destroy: function () {
                container.innerHTML = '';
            }
        };
    }

    global.progressBarHtml = progressBarHtml;
    global.progressBarRowHtml = progressBarRowHtml;
    global.tableProgressCellHtml = tableProgressCellHtml;
    global.createProgressBar = createProgressBar;
    global.setProgressBarValue = setProgressBarValue;
})(typeof window !== 'undefined' ? window : this);
