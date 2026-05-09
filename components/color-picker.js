/**
 * UBITS Color Picker — panel flotante HSV + franja de matiz + HEX.
 * Basado en el picker del modal SCORM (LMS Creator).
 *
 * API:
 *   openColorPickerPopover({
 *     anchorEl: HTMLElement,     // elemento respecto al que se posiciona el panel
 *     initialHex: '#0C5BEF',     // opcional
 *     onChange: function (hex) {}, // opcional; en vivo al arrastrar o al validar HEX
 *     onClose: function () {},   // opcional; al cerrar (Escape, clic fuera, close())
 *     zIndex: 2000               // opcional
 *   })
 *   → { close: fn, getHex: fn, setHex: fn }
 *
 *   closeColorPickerPopover() — cierra el panel abierto por este componente (singleton).
 *
 * Requiere: color-picker.css + input.css + input.js (createInput para el campo HEX; cargar input.js antes de este script).
 *   Cuentagotas (EyeDropper): button.css + fontawesome-icons.css cuando el navegador expone la API.
 *
 * Notas:
 * - Solo un popover activo a la vez; abrir otro cierra el anterior.
 * - Los gradientes del lienzo SV usan blanco/negro estándar (modelo HSV), no tokens de marca.
 * - Sin API EyeDropper (p. ej. Firefox) no se renderiza el botón de cuentagotas.
 */
(function (global) {
    'use strict';

    var activeApi = null;
    var activePanel = null;
    var activeAnchor = null;
    var dragSV = false;
    var dragH = false;
    var hVal = 0;
    var sVal = 0;
    var vVal = 0;
    var onChangeCb = null;
    var onCloseCb = null;
    var moveHandler = null;
    var upHandler = null;
    var outsideHandler = null;
    var keyHandler = null;
    var hexInputApi = null;
    var cpHexSeq = 0;

    function nextHexMountId() {
        cpHexSeq += 1;
        return 'ubits-cp-hex-' + cpHexSeq;
    }

    function hsvToRgb(h, s, v) {
        var c = v * s;
        var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        var m = v - c;
        var r;
        var g;
        var b;
        if (h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (h < 300) {
            r = x;
            g = 0;
            b = c;
        } else {
            r = c;
            g = 0;
            b = x;
        }
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var d = max - min;
        var hh;
        var ss = max === 0 ? 0 : d / max;
        var vv = max;
        if (max === min) {
            hh = 0;
        } else if (max === r) {
            hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
            hh = ((b - r) / d + 2) / 6;
        } else {
            hh = ((r - g) / d + 4) / 6;
        }
        return { h: hh * 360, s: ss, v: vv };
    }

    function rgbToHex(r, g, b) {
        return (
            '#' +
            [r, g, b]
                .map(function (v) {
                    return ('0' + v.toString(16)).slice(-2);
                })
                .join('')
        );
    }

    function hexToRgb(hex) {
        var c = String(hex || '').replace('#', '');
        if (c.length === 3) {
            c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        }
        return {
            r: parseInt(c.slice(0, 2), 16) || 0,
            g: parseInt(c.slice(2, 4), 16) || 0,
            b: parseInt(c.slice(4, 6), 16) || 0
        };
    }

    function syncFromHex(hex) {
        var rgb = hexToRgb(hex);
        var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        hVal = hsv.h;
        sVal = hsv.s;
        vVal = hsv.v;
    }

    function currentHex() {
        var rgb = hsvToRgb(hVal, sVal, vVal);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    function drawSV(canvas, hue) {
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        var base = hsvToRgb(hue, 1, 1);
        var gH = ctx.createLinearGradient(0, 0, w, 0);
        gH.addColorStop(0, '#fff');
        gH.addColorStop(1, 'rgb(' + base.r + ',' + base.g + ',' + base.b + ')');
        ctx.fillStyle = gH;
        ctx.fillRect(0, 0, w, h);
        var gV = ctx.createLinearGradient(0, 0, 0, h);
        gV.addColorStop(0, 'rgba(0,0,0,0)');
        gV.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = gV;
        ctx.fillRect(0, 0, w, h);
    }

    function drawHue(canvas) {
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        var g = ctx.createLinearGradient(0, 0, w, 0);
        for (var i = 0; i <= 360; i += 30) {
            var c = hsvToRgb(i, 1, 1);
            g.addColorStop(i / 360, 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')');
        }
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    }

    function positionPanel(panel, anchor) {
        var rect = anchor.getBoundingClientRect();
        var pH = 260;
        var pW = 228;
        var gap = 2;
        var spaceBelow = window.innerHeight - rect.bottom;
        var top = spaceBelow > pH ? rect.bottom + gap : rect.top - pH - gap;
        var left = Math.max(8, Math.min(rect.left, window.innerWidth - pW - 8));
        panel.style.top = top + 'px';
        panel.style.left = left + 'px';
    }

    function teardown() {
        document.removeEventListener('mousemove', moveHandler, true);
        document.removeEventListener('mouseup', upHandler, true);
        if (outsideHandler) {
            document.removeEventListener('mousedown', outsideHandler, true);
        }
        if (keyHandler) {
            document.removeEventListener('keydown', keyHandler, true);
        }
        moveHandler = null;
        upHandler = null;
        outsideHandler = null;
        keyHandler = null;
        hexInputApi = null;
        dragSV = false;
        dragH = false;
        if (activePanel && activePanel.parentNode) {
            activePanel.parentNode.removeChild(activePanel);
        }
        activePanel = null;
        activeAnchor = null;
        onChangeCb = null;
        var cb = onCloseCb;
        onCloseCb = null;
        activeApi = null;
        if (cb) {
            try {
                cb();
            } catch (e) {}
        }
    }

    function updateUI() {
        if (!activePanel) return;
        var hex = currentHex();
        var svCanvas = activePanel.querySelector('.ubits-color-picker__sv-canvas');
        if (svCanvas) {
            drawSV(svCanvas, hVal);
        }
        var cur = activePanel.querySelector('.ubits-color-picker__sv-cursor');
        if (cur) {
            cur.style.left = sVal * 100 + '%';
            cur.style.top = (1 - vVal) * 100 + '%';
        }
        var thumb = activePanel.querySelector('.ubits-color-picker__hue-thumb');
        if (thumb) {
            thumb.style.left = (hVal / 360) * 100 + '%';
        }
        var prev = activePanel.querySelector('.ubits-color-picker__preview');
        if (prev) {
            prev.style.background = hex;
        }
        var hexField = activePanel.querySelector('.ubits-color-picker__hex-mount .ubits-input');
        if (hexInputApi && hexField && document.activeElement !== hexField) {
            hexInputApi.setValue(hex.toUpperCase());
        }
        if (activeAnchor && activeAnchor.style) {
            try {
                activeAnchor.style.background = hex;
            } catch (e2) {}
        }
        if (onChangeCb) {
            try {
                onChangeCb(hex);
            } catch (e3) {}
        }
    }

    function moveSV(e, canvas) {
        var rect = canvas.getBoundingClientRect();
        sVal = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        vVal = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
        updateUI();
    }

    function moveHue(e) {
        var canvas = activePanel.querySelector('.ubits-color-picker__hue-canvas');
        if (!canvas) return;
        var rect = canvas.getBoundingClientRect();
        hVal = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
        updateUI();
    }

    function hasEyedropperSupport() {
        return typeof global.EyeDropper === 'function';
    }

    function buildPanel(hexMountId) {
        var eyedropperHtml = hasEyedropperSupport()
            ? '<button type="button" class="ubits-color-picker__eyedropper ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" title="Elegir color de la pantalla" aria-label="Elegir color de la pantalla">' +
              '<i class="far fa-eye-dropper"></i>' +
              '</button>'
            : '';
        var el = document.createElement('div');
        el.className = 'ubits-color-picker';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Selector de color');
        el.innerHTML =
            '<div class="ubits-color-picker__sv-wrap">' +
            '<canvas class="ubits-color-picker__sv-canvas" width="228" height="148"></canvas>' +
            '<div class="ubits-color-picker__sv-cursor"></div>' +
            '</div>' +
            '<div class="ubits-color-picker__controls">' +
            '<div class="ubits-color-picker__controls-left">' +
            eyedropperHtml +
            '<div class="ubits-color-picker__preview"></div>' +
            '</div>' +
            '<div class="ubits-color-picker__hue-wrap">' +
            '<div class="ubits-color-picker__hue-track">' +
            '<canvas class="ubits-color-picker__hue-canvas" width="156" height="14"></canvas>' +
            '<div class="ubits-color-picker__hue-thumb"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ubits-color-picker__hex">' +
            '<div id="' +
            hexMountId +
            '" class="ubits-color-picker__hex-mount"></div>' +
            '</div>';
        return el;
    }

    function closeColorPickerPopover() {
        teardown();
    }

    function openColorPickerPopover(opts) {
        opts = opts || {};
        var anchor = opts.anchorEl;
        if (!anchor || !anchor.getBoundingClientRect) {
            return null;
        }

        closeColorPickerPopover();

        var initial = opts.initialHex != null ? String(opts.initialHex) : '#0C5BEF';
        if (!/^#[0-9a-fA-F]{6}$/.test(initial)) {
            initial = '#0C5BEF';
        }
        syncFromHex(initial);
        onChangeCb = typeof opts.onChange === 'function' ? opts.onChange : null;
        onCloseCb = typeof opts.onClose === 'function' ? opts.onClose : null;
        activeAnchor = anchor;

        var hexMountId = nextHexMountId();
        activePanel = buildPanel(hexMountId);
        if (opts.zIndex != null) {
            activePanel.style.zIndex = String(opts.zIndex);
        }
        document.body.appendChild(activePanel);

        hexInputApi = null;
        if (typeof global.createInput === 'function') {
            hexInputApi = global.createInput({
                containerId: hexMountId,
                label: 'HEX',
                labelPosition: 'left',
                type: 'text',
                size: 'sm',
                placeholder: '#0C5BEF',
                value: initial.toUpperCase(),
                showLabel: true,
                onChange: function (v) {
                    var t = String(v || '').trim();
                    if (/^#[0-9a-fA-F]{6}$/.test(t)) {
                        syncFromHex(t);
                        updateUI();
                    }
                }
            });
            var hexMountEl = document.getElementById(hexMountId);
            var rawHex = hexMountEl && hexMountEl.querySelector('.ubits-input');
            if (rawHex) {
                rawHex.setAttribute('maxlength', '7');
                rawHex.style.textTransform = 'uppercase';
            }
        } else if (typeof console !== 'undefined' && console.warn) {
            console.warn('UBITS Color picker: carga input.js antes de color-picker.js para el campo HEX.');
        }

        var svCanvas = activePanel.querySelector('.ubits-color-picker__sv-canvas');
        var hueCanvas = activePanel.querySelector('.ubits-color-picker__hue-canvas');
        if (hueCanvas) {
            drawHue(hueCanvas);
        }
        positionPanel(activePanel, anchor);
        updateUI();

        var svWrap = activePanel.querySelector('.ubits-color-picker__sv-wrap');
        var hueTrack = activePanel.querySelector('.ubits-color-picker__hue-track');

        svWrap.addEventListener('mousedown', function (e) {
            dragSV = true;
            moveSV(e, svCanvas);
        });
        hueTrack.addEventListener('mousedown', function (e) {
            dragH = true;
            moveHue(e);
        });

        moveHandler = function (e) {
            if (dragSV) {
                moveSV(e, svCanvas);
            }
            if (dragH) {
                moveHue(e);
            }
        };
        upHandler = function () {
            dragSV = false;
            dragH = false;
        };
        document.addEventListener('mousemove', moveHandler, true);
        document.addEventListener('mouseup', upHandler, true);

        outsideHandler = function (e) {
            if (activePanel && !activePanel.contains(e.target) && e.target !== activeAnchor) {
                closeColorPickerPopover();
            }
        };

        var eyedropperBtn = activePanel.querySelector('.ubits-color-picker__eyedropper');
        if (eyedropperBtn && hasEyedropperSupport()) {
            eyedropperBtn.addEventListener('click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                document.removeEventListener('mousedown', outsideHandler, true);
                new global.EyeDropper()
                    .open()
                    .then(function (result) {
                        var hex = result && result.sRGBHex;
                        if (hex && /^#[0-9a-fA-F]{6}$/.test(String(hex))) {
                            syncFromHex(String(hex));
                            updateUI();
                        }
                    })
                    .catch(function () {})
                    .then(function () {
                        if (activePanel && outsideHandler) {
                            document.addEventListener('mousedown', outsideHandler, true);
                        }
                    });
            });
        }

        keyHandler = function (e) {
            if (e.key === 'Escape') {
                closeColorPickerPopover();
            }
        };
        setTimeout(function () {
            document.addEventListener('mousedown', outsideHandler, true);
            document.addEventListener('keydown', keyHandler, true);
        }, 0);

        activeApi = {
            close: closeColorPickerPopover,
            getHex: function () {
                return currentHex();
            },
            setHex: function (hex) {
                if (!/^#[0-9a-fA-F]{6}$/.test(String(hex || ''))) return;
                syncFromHex(hex);
                updateUI();
            }
        };
        return activeApi;
    }

    global.openColorPickerPopover = openColorPickerPopover;
    global.closeColorPickerPopover = closeColorPickerPopover;
})(window);
