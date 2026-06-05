/**
 * UBITS Segmented progress — avance por ítems discretos (quiz, flashcards).
 *
 * segmentedProgressHtml({ total, current, mode, sliderThreshold, size, track, id, className, ariaLabel })
 * setSegmentedProgressValue(root, currentIndex, opts?)
 * createSegmentedProgress({ containerId | container, ... })
 *
 * Modos: segments (≤ umbral, default 19) · slider (20+ o mode: 'slider')
 * Tamaños: sm (segmentos 6px / track 6px) · lg (segmentos 8px / track 8px)
 * Requiere: segmented-progress.css + tokens UBITS
 */
(function (global) {
    'use strict';

    var SIZES = ['sm', 'lg'];
    var DEFAULT_SLIDER_THRESHOLD = 19;

    function clampIndex(value, total) {
        var n = Math.floor(Number(value));
        if (isNaN(n)) return 0;
        return Math.max(0, Math.min(Math.max(0, total - 1), n));
    }

    function normalizeSize(size) {
        var s = String(size || 'sm').toLowerCase();
        return SIZES.indexOf(s) >= 0 ? s : 'sm';
    }

    function resolveSegmentedProgressMode(total, mode, sliderThreshold) {
        var threshold = sliderThreshold != null ? Number(sliderThreshold) : DEFAULT_SLIDER_THRESHOLD;
        if (isNaN(threshold)) threshold = DEFAULT_SLIDER_THRESHOLD;
        var m = String(mode || 'auto').toLowerCase();
        if (m === 'segments' || m === 'slider') return m;
        return total > threshold ? 'slider' : 'segments';
    }

    function buildSegmentedProgressClassNames(opts) {
        opts = opts || {};
        var mode = resolveSegmentedProgressMode(opts.total || 0, opts.mode, opts.sliderThreshold);
        var size = normalizeSize(opts.size);
        var classes = [
            'ubits-segmented-progress',
            'ubits-segmented-progress--' + mode,
            'ubits-segmented-progress--' + size
        ];
        if (opts.track === 'subtle') {
            classes.push('ubits-segmented-progress--track-subtle');
        }
        if (opts.className) {
            classes.push(opts.className);
        }
        return classes.join(' ');
    }

    function sliderPercent(currentIndex, total) {
        if (total <= 0) return 0;
        if (total === 1) return 100;
        return ((currentIndex + 1) / total) * 100;
    }

    function segmentsHtml(total, currentIndex) {
        var parts = [];
        for (var i = 0; i < total; i++) {
            var filled = i <= currentIndex ? ' ubits-segmented-progress__segment--filled' : '';
            parts.push(
                '<span class="ubits-segmented-progress__segment' + filled + '" data-segment-index="' + i + '"></span>'
            );
        }
        return '<div class="ubits-segmented-progress__segments">' + parts.join('') + '</div>';
    }

    function sliderHtml(currentIndex, total) {
        var pct = sliderPercent(currentIndex, total);
        return (
            '<div class="ubits-segmented-progress__slider">' +
                '<div class="ubits-segmented-progress__track">' +
                    '<div class="ubits-segmented-progress__fill" style="width:' + pct + '%"></div>' +
                    '<div class="ubits-segmented-progress__thumb" style="left:' + pct + '%"></div>' +
                '</div>' +
            '</div>'
        );
    }

    function segmentedProgressHtml(opts) {
        opts = opts || {};
        var total = Math.max(0, Math.floor(Number(opts.total) || 0));
        var currentIndex = clampIndex(opts.current != null ? opts.current : 0, total || 1);
        var mode = resolveSegmentedProgressMode(total, opts.mode, opts.sliderThreshold);
        var idAttr = opts.id ? ' id="' + String(opts.id).replace(/"/g, '') + '"' : '';
        var ariaLabel = opts.ariaLabel || 'Progreso por ítems';

        var inner = total === 0
            ? '<div class="ubits-segmented-progress__segments"></div>'
            : (mode === 'slider' ? sliderHtml(currentIndex, total) : segmentsHtml(total, currentIndex));

        return (
            '<div class="' + buildSegmentedProgressClassNames(Object.assign({}, opts, { total: total, mode: mode })) + '"' +
            idAttr +
            ' role="group" aria-label="' + String(ariaLabel).replace(/"/g, '&quot;') + '"' +
            ' data-total="' + total + '" data-mode="' + mode + '" data-current="' + currentIndex + '">' +
            inner +
            '</div>'
        );
    }

    function resolveSegmentedProgressRoot(root) {
        if (!root) return null;
        if (root.classList && root.classList.contains('ubits-segmented-progress')) return root;
        if (root.querySelector) return root.querySelector('.ubits-segmented-progress');
        return null;
    }

    function applySegmentedProgressState(root, currentIndex) {
        if (!root) return;
        var total = parseInt(root.getAttribute('data-total'), 10) || 0;
        var idx = clampIndex(currentIndex, total || 1);
        var mode = root.getAttribute('data-mode') || 'segments';

        root.setAttribute('data-current', String(idx));

        if (mode === 'slider') {
            var pct = sliderPercent(idx, total);
            var fill = root.querySelector('.ubits-segmented-progress__fill');
            var thumb = root.querySelector('.ubits-segmented-progress__thumb');
            if (fill) fill.style.width = pct + '%';
            if (thumb) thumb.style.left = pct + '%';
            return;
        }

        var segments = root.querySelectorAll('.ubits-segmented-progress__segment');
        segments.forEach(function (seg, i) {
            seg.classList.toggle('ubits-segmented-progress__segment--filled', i <= idx);
        });
    }

    function setSegmentedProgressValue(root, currentIndex) {
        applySegmentedProgressState(resolveSegmentedProgressRoot(root), currentIndex);
    }

    function createSegmentedProgress(opts) {
        opts = opts || {};
        var container = opts.container;
        if (!container && opts.containerId) {
            container = document.getElementById(opts.containerId);
        }
        if (!container) return null;

        container.innerHTML = segmentedProgressHtml(opts);
        var root = container.querySelector('.ubits-segmented-progress');
        var total = Math.max(0, Math.floor(Number(opts.total) || 0));

        return {
            getValue: function () {
                return parseInt(root.getAttribute('data-current'), 10) || 0;
            },
            setValue: function (index) {
                applySegmentedProgressState(root, index);
            },
            getTotal: function () {
                return total;
            },
            getElement: function () {
                return root;
            },
            destroy: function () {
                container.innerHTML = '';
            }
        };
    }

    global.segmentedProgressHtml = segmentedProgressHtml;
    global.setSegmentedProgressValue = setSegmentedProgressValue;
    global.createSegmentedProgress = createSegmentedProgress;
    global.resolveSegmentedProgressMode = resolveSegmentedProgressMode;
})(typeof window !== 'undefined' ? window : this);
