/**
 * UBITS — File Upload layouts (ReUI)
 * createFileUpload({ layout: 'basic' | 'avatar' | 'gallery' | 'progress' | 'table' | 'images' | 'sortable' | 'cards' | 'cover' })
 */
(function () {
    'use strict';

    var LAYOUTS = {
        basic: 1, avatar: 1, gallery: 1, progress: 1, table: 1,
        images: 1, sortable: 1, cards: 1, cover: 1
    };

    var seq = 0;
    function nextId() {
        seq += 1;
        return 'fu-layout-' + seq;
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatSize(bytes) {
        if (typeof formatFileSize === 'function') return formatFileSize(bytes);
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1).replace(/\.0$/, '') + ' KB';
        return (bytes / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB';
    }

    function isImage(file) {
        if ((file.type || '').indexOf('image/') === 0) return true;
        return /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name || '');
    }

    function fileIcon(file) {
        var type = (file.type || '').toLowerCase();
        var name = (file.name || '').toLowerCase();
        if (isImage(file)) return 'fa-image';
        if (type.indexOf('pdf') !== -1 || name.slice(-4) === '.pdf') return 'fa-file-pdf';
        if (type.indexOf('zip') !== -1 || /\.(zip|rar)$/i.test(name)) return 'fa-file-zipper';
        if (type.indexOf('sheet') !== -1 || /\.(xlsx?|csv)$/i.test(name)) return 'fa-file-spreadsheet';
        if (type.indexOf('word') !== -1 || /\.docx?$/i.test(name)) return 'fa-file-word';
        return 'fa-file-lines';
    }

    function fileLabel(file) {
        var type = (file.type || '').toLowerCase();
        var name = (file.name || '').toLowerCase();
        if (isImage(file)) return 'Imagen';
        if (type.indexOf('pdf') !== -1 || name.slice(-4) === '.pdf') return 'PDF';
        if (type.indexOf('zip') !== -1 || /\.(zip|rar)$/i.test(name)) return 'Archivo';
        if (type.indexOf('sheet') !== -1 || /\.(xlsx?|csv)$/i.test(name)) return 'Excel';
        if (type.indexOf('word') !== -1 || /\.docx?$/i.test(name)) return 'Word';
        return 'Archivo';
    }

    function usesProgress(layout) {
        return layout === 'progress' || layout === 'table' || layout === 'images' || layout === 'cards';
    }

    function progressHtml(pct) {
        var value = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
        if (typeof progressBarHtml === 'function') {
            return progressBarHtml({ value: value, size: 'sm', rounded: true, track: 'subtle', autoComplete: true });
        }
        return '<div class="ubits-progress-bar ubits-progress-bar--sm" role="progressbar" aria-valuenow="' + value + '">' +
            '<div class="ubits-progress-bar__track"><div class="ubits-progress-bar__fill" style="width:' + value + '%"></div></div></div>';
    }

    function thumbHtml(file, size) {
        var dim = size || 48;
        if (file.previewUrl && isImage(file)) {
            return '<img class="ubits-fu-layout__thumb" src="' + escapeHtml(file.previewUrl) + '" alt="" style="width:' + dim + 'px;height:' + dim + 'px">';
        }
        return '<span class="ubits-fu-layout__thumb-icon" style="width:' + dim + 'px;height:' + dim + 'px" aria-hidden="true"><i class="far ' + fileIcon(file) + '"></i></span>';
    }

    function iconBtn(action, id, label, icon) {
        return '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only" data-fu-' + action + '="' + escapeHtml(id) + '" aria-label="' + escapeHtml(label) + '" data-tooltip="' + escapeHtml(label) + '">' +
            '<i class="far ' + icon + '"></i></button>';
    }

    function badge(color, text) {
        return '<span class="ubits-badge-tag ubits-badge-tag--soft ubits-badge-tag--' + color + ' ubits-badge-tag--sm"><span class="ubits-badge-tag__text">' + escapeHtml(text) + '</span></span>';
    }

    function dropzoneBlock(opts) {
        var asLink = opts.asLink;
        var hint = asLink
            ? escapeHtml(opts.hint) + ' <button type="button" class="ubits-fu-layout__text-btn" data-fu-open>' + escapeHtml(opts.cta) + '</button>'
            : escapeHtml(opts.hint);
        var cta = asLink ? '' : (
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-fu-open>' +
            '<i class="far fa-arrow-up-from-bracket"></i><span>' + escapeHtml(opts.cta) + '</span></button>'
        );
        return '<div class="ubits-fu-layout__surface" data-fu-surface>' +
            '<span class="ubits-fu-layout__icon-well" aria-hidden="true"><i class="far ' + opts.icon + '"></i></span>' +
            '<p class="ubits-body-md-bold">' + escapeHtml(opts.title) + '</p>' +
            '<p class="ubits-body-sm-regular ubits-fu-layout__meta">' + hint + '</p>' +
            '<p class="ubits-body-xs-regular ubits-fu-layout__meta">' + escapeHtml(opts.formats) + '</p>' +
            cta +
            '</div>';
    }

    function renderLayout(layout, files, ctx) {
        var file = files[0];
        if (layout === 'basic') {
            return '<div class="ubits-fu-layout__basic">' +
                '<div class="ubits-fu-layout__basic-row">' +
                '<span class="ubits-fu-layout__basic-preview" aria-hidden="true">' +
                (file && file.previewUrl ? '<img src="' + escapeHtml(file.previewUrl) + '" alt="">' : '<i class="far fa-circle-user"></i>') +
                '</span>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" data-fu-open">' +
                (file ? 'Cambiar imagen' : 'Subir imagen') + '</button></div>' +
                (file
                    ? '<p class="ubits-body-xs-regular ubits-fu-layout__meta">' + escapeHtml(file.name) +
                    ' <button type="button" class="ubits-fu-layout__text-btn" data-fu-remove="' + file.id + '">Quitar</button></p>'
                    : '<p class="ubits-body-xs-regular ubits-fu-layout__meta">Sin imagen</p>') +
                '</div>';
        }
        if (layout === 'avatar') {
            var av = file && file.previewUrl
                ? '<div class="ubits-avatar ubits-avatar--xl"><img class="ubits-avatar__img" src="' + escapeHtml(file.previewUrl) + '" alt=""></div>'
                : '<div class="ubits-avatar ubits-avatar--xl"><span class="ubits-avatar__initials">AV</span></div>';
            return '<div class="ubits-fu-layout__avatar-wrap">' +
                '<div class="ubits-fu-layout__avatar-stage">' +
                '<div class="ubits-fu-layout__avatar-drop' + (file ? ' ubits-fu-layout__avatar-drop--filled' : '') + '" data-fu-surface data-fu-open>' + av + '</div>' +
                (file ? '<span class="ubits-fu-layout__avatar-remove">' + iconBtn('remove', file.id, 'Quitar avatar', 'fa-xmark') + '</span>' : '') +
                '</div>' +
                '<p class="ubits-body-sm-bold">' + (file ? 'Avatar cargado' : 'Subir avatar') + '</p>' +
                '<p class="ubits-body-xs-regular ubits-fu-layout__meta">PNG, JPG de hasta ' + ctx.maxSizeMb + ' MB</p>' +
                '</div>';
        }
        if (layout === 'cover') {
            return '<div class="ubits-fu-layout__cover" data-fu-surface data-fu-open>' +
                (file && file.previewUrl
                    ? '<img class="ubits-fu-layout__cover-img" src="' + escapeHtml(file.previewUrl) + '" alt="">'
                    : '<div class="ubits-fu-layout__cover-empty"><i class="far fa-image" aria-hidden="true"></i><p class="ubits-body-sm-bold">Sube una portada</p><p class="ubits-body-xs-regular ubits-fu-layout__meta">PNG o JPG de hasta ' + ctx.maxSizeMb + ' MB</p></div>') +
                (file
                    ? '<div class="ubits-fu-layout__cover-actions">' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-fu-open>Cambiar</button>' +
                    '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" data-fu-remove="' + file.id + '">Quitar</button></div>'
                    : '') +
                '</div>';
        }

        var surface = '';
        if (layout === 'gallery') {
            surface = dropzoneBlock({ icon: 'fa-image', title: 'Sube imágenes a la galería', hint: 'Arrastra imágenes aquí o haz clic para buscar', cta: 'Seleccionar imágenes', formats: ctx.formats });
        } else if (layout === 'progress') {
            surface = dropzoneBlock({ icon: 'fa-arrow-up-from-bracket', title: 'Sube tus archivos', hint: 'Arrastra archivos aquí o haz clic para buscar', cta: 'Seleccionar archivos', formats: ctx.formats });
        } else if (layout === 'table') {
            surface = dropzoneBlock({ icon: 'fa-cloud-arrow-up', title: 'Suelta archivos aquí', hint: 'Tamaño máximo: ' + ctx.maxSizeMb + ' MB', cta: 'Buscar archivos', formats: ctx.formats, asLink: true });
        } else if (layout === 'images') {
            surface = dropzoneBlock({ icon: 'fa-image', title: 'Sube imágenes', hint: 'Arrastra o selecciona fotos del producto', cta: 'Seleccionar imágenes', formats: ctx.formats });
        } else if (layout === 'sortable') {
            surface = dropzoneBlock({ icon: 'fa-layer-group', title: 'Imágenes ordenables', hint: 'Arrastra las miniaturas para cambiar el orden', cta: 'Agregar imágenes', formats: ctx.formats });
        } else if (layout === 'cards') {
            surface = dropzoneBlock({ icon: 'fa-files', title: 'Sube archivos', hint: 'Cada archivo se muestra como una tarjeta', cta: 'Seleccionar archivos', formats: ctx.formats });
        }

        var body = '';
        if (files.length && layout === 'gallery') {
            var total = files.reduce(function (acc, f) { return acc + f.size; }, 0);
            body = '<div class="ubits-fu-layout__toolbar"><p class="ubits-body-sm-bold">Galería (' + files.length.toLocaleString('es-CO') + (ctx.maxFiles ? '/' + ctx.maxFiles : '') + ')</p>' +
                '<p class="ubits-body-xs-regular ubits-fu-layout__meta">Total: ' + formatSize(total) + '</p>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-fu-clear>Limpiar todo</button></div>' +
                '<div class="ubits-fu-layout__grid">' + files.map(function (f) {
                    return '<div class="ubits-fu-layout__grid-item">' +
                        (f.previewUrl ? '<img src="' + escapeHtml(f.previewUrl) + '" alt="">' : thumbHtml(f, 160)) +
                        '<div class="ubits-fu-layout__grid-overlay">' +
                        (f.previewUrl ? iconBtn('preview', f.id, 'Ver', 'fa-magnifying-glass-plus') : '') +
                        iconBtn('remove', f.id, 'Quitar', 'fa-xmark') +
                        '</div><div class="ubits-fu-layout__grid-caption"><span class="ubits-body-xs-bold">' + escapeHtml(f.name) + '</span><span class="ubits-body-xs-regular">' + formatSize(f.size) + '</span></div></div>';
                }).join('') + '</div>';
        }
        if (files.length && layout === 'progress') {
            var completed = files.filter(function (f) { return f.status === 'completed'; }).length;
            var failed = files.filter(function (f) { return f.status === 'error'; }).length;
            var uploading = files.filter(function (f) { return f.status === 'uploading'; }).length;
            body = '<div class="ubits-fu-layout__toolbar"><p class="ubits-body-sm-bold">Progreso de carga</p><div class="ubits-fu-layout__badges">' +
                (completed ? badge('success', 'Listos: ' + completed.toLocaleString('es-CO')) : '') +
                (failed ? badge('error', 'Fallidos: ' + failed.toLocaleString('es-CO')) : '') +
                (uploading ? badge('gray', 'Cargando: ' + uploading.toLocaleString('es-CO')) : '') +
                '</div><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-fu-clear>Limpiar todo</button></div>' +
                '<ul class="ubits-fu-layout__file-rows">' + files.map(function (f) {
                    return '<li class="ubits-fu-layout__file-row">' + thumbHtml(f) +
                        '<div class="ubits-fu-layout__file-meta"><span class="ubits-body-sm-bold">' + escapeHtml(f.name) + '</span>' +
                        '<span class="ubits-body-xs-regular ubits-fu-layout__meta">' + formatSize(f.size) + '</span>' +
                        (f.status === 'uploading' ? progressHtml(f.progress || 0) : '') +
                        (f.status === 'error' ? '<p class="ubits-body-xs-regular" style="color:var(--ubits-feedback-accent-error)">No se pudo subir. Intenta de nuevo. ' + iconBtn('retry', f.id, 'Reintentar', 'fa-arrows-rotate') + '</p>' : '') +
                        '</div>' + iconBtn('remove', f.id, 'Quitar archivo', 'fa-xmark') + '</li>';
                }).join('') + '</ul>';
        }
        if (files.length && layout === 'table') {
            body = '<div class="ubits-fu-layout__toolbar"><p class="ubits-body-sm-bold">Archivos (' + files.length.toLocaleString('es-CO') + ')</p>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-fu-open><i class="far fa-cloud-arrow-up"></i><span>Agregar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-fu-clear><i class="far fa-trash-can"></i><span>Quitar todos</span></button></div>' +
                '<table class="ubits-fu-layout__table ubits-body-sm-regular"><thead><tr><th>Nombre</th><th>Tipo</th><th>Peso</th><th>Acciones</th></tr></thead><tbody>' +
                files.map(function (f) {
                    return '<tr><td class="ubits-fu-layout__table-name"><i class="far ' + fileIcon(f) + '" aria-hidden="true"></i> ' + escapeHtml(f.name) +
                        (f.status === 'error' ? ' ' + badge('error', 'Error') : '') + '</td>' +
                        '<td>' + badge('gray', fileLabel(f)) + '</td>' +
                        '<td>' + formatSize(f.size) + '</td>' +
                        '<td>' + (f.status === 'error' ? iconBtn('retry', f.id, 'Reintentar', 'fa-arrows-rotate') : iconBtn('remove', f.id, 'Quitar', 'fa-trash-can')) + '</td></tr>';
                }).join('') + '</tbody></table>';
        }
        if (files.length && layout === 'images') {
            body = '<div class="ubits-fu-layout__image-cards">' + files.map(function (f) {
                return '<div class="ubits-card ubits-card--sm"><div class="ubits-card__content"><div class="ubits-fu-layout__card-row">' +
                    thumbHtml(f, 72) + '<div class="ubits-fu-layout__file-meta"><span class="ubits-body-sm-bold">' + escapeHtml(f.name) + '</span>' +
                    '<span class="ubits-body-xs-regular ubits-fu-layout__meta">' + formatSize(f.size) + '</span>' +
                    (f.status === 'uploading' ? progressHtml(f.progress || 0) : '') +
                    '</div>' + iconBtn('remove', f.id, 'Quitar', 'fa-xmark') + '</div></div></div>';
            }).join('') + '</div>';
        }
        if (files.length && layout === 'sortable') {
            body = '<div class="ubits-fu-layout__sort-grid">' + files.map(function (f) {
                return '<div class="ubits-fu-layout__sort-item" draggable="true" data-fu-sort-item="' + f.id + '">' +
                    (f.previewUrl ? '<img src="' + escapeHtml(f.previewUrl) + '" alt="">' : thumbHtml(f, 120)) +
                    '<span class="ubits-fu-layout__sort-handle" aria-hidden="true"><i class="far fa-grip-lines"></i></span>' +
                    '<span class="ubits-fu-layout__sort-remove">' + iconBtn('remove', f.id, 'Quitar', 'fa-xmark') + '</span></div>';
            }).join('') + '</div>';
        }
        if (files.length && layout === 'cards') {
            body = '<div class="ubits-fu-layout__cards">' + files.map(function (f) {
                return '<div class="ubits-card ubits-card--sm"><div class="ubits-card__content"><div class="ubits-fu-layout__card-row">' +
                    thumbHtml(f, 56) + '<div class="ubits-fu-layout__file-meta"><span class="ubits-body-sm-bold">' + escapeHtml(f.name) + '</span>' +
                    '<span class="ubits-body-xs-regular ubits-fu-layout__meta">' + fileLabel(f) + ' · ' + formatSize(f.size) + '</span>' +
                    (f.status === 'uploading' ? progressHtml(f.progress || 0) : '') +
                    '</div>' + iconBtn('remove', f.id, 'Quitar', 'fa-xmark') + '</div></div></div>';
            }).join('') + '</div>';
        }

        return '<div class="ubits-fu-layout__stack">' + surface + body + '</div>';
    }

    function createFileUploadLayout(opts) {
        var container = document.getElementById(opts.containerId);
        if (!container) return null;
        var layout = opts.layout;
        if (!LAYOUTS[layout]) layout = 'basic';
        var id = opts.id || ('ubits-fu-' + opts.containerId);
        var accept = opts.accept || '';
        var maxMb = opts.maxSizeMb || 5;
        var maxFiles = opts.maxFiles;
        var multiple = opts.multiple !== false && layout !== 'basic' && layout !== 'avatar' && layout !== 'cover';
        var formats = opts.formats || ('Archivos • Hasta ' + maxMb + ' MB');
        var single = layout === 'basic' || layout === 'avatar' || layout === 'cover';

        container.innerHTML =
            '<div class="ubits-file-upload ubits-fu-layout" id="' + id + '" data-file-upload data-fu-layout="' + layout + '">' +
            '<div data-fu-mount></div>' +
            '<input type="file" class="ubits-fu-layout__input" data-file-upload-input' +
            (accept ? ' accept="' + escapeHtml(accept) + '"' : '') +
            (multiple ? ' multiple' : '') + '>' +
            '<div class="ubits-fu-layout__lightbox" data-fu-lightbox hidden><img alt="Vista previa"></div>' +
            '</div>';

        var el = document.getElementById(id);
        if (!el) return null;

        var inputEl = el.querySelector('[data-file-upload-input]');
        var mount = el.querySelector('[data-fu-mount]');
        var lightbox = el.querySelector('[data-fu-lightbox]');
        var files = [];
        var dragId = null;
        var tick = null;
        var ctx = { maxSizeMb: maxMb, maxFiles: maxFiles, formats: formats };

        function paint() {
            mount.innerHTML = renderLayout(layout, files, ctx);
        }

        function openDialog() {
            if (inputEl) inputEl.click();
        }

        function clearAll() {
            files = [];
            if (inputEl) inputEl.value = '';
            paint();
        }

        function removeAt(idToRemove) {
            files = files.filter(function (f) { return f.id !== idToRemove; });
            paint();
        }

        function retry(idToRetry) {
            files = files.map(function (f) {
                if (f.id !== idToRetry) return f;
                return { id: f.id, name: f.name, size: f.size, type: f.type, previewUrl: f.previewUrl, status: 'uploading', progress: 0 };
            });
            paint();
            startTick();
        }

        function startTick() {
            if (tick) return;
            if (!usesProgress(layout)) return;
            tick = setInterval(function () {
                var any = false;
                files = files.map(function (f) {
                    if (f.status !== 'uploading') return f;
                    any = true;
                    var next = Math.min(100, (f.progress || 0) + 12);
                    if (next >= 100) return { id: f.id, name: f.name, size: f.size, type: f.type, previewUrl: f.previewUrl, status: 'completed', progress: 100 };
                    return { id: f.id, name: f.name, size: f.size, type: f.type, previewUrl: f.previewUrl, status: 'uploading', progress: next };
                });
                paint();
                if (!any) {
                    clearInterval(tick);
                    tick = null;
                }
            }, 280);
        }

        function readPreview(fileObj, stored) {
            if (!isImage(stored) || !fileObj) return;
            var reader = new FileReader();
            reader.onload = function (ev) {
                stored.previewUrl = ev.target && ev.target.result ? String(ev.target.result) : null;
                paint();
            };
            reader.readAsDataURL(fileObj);
        }

        function applyIncoming(list) {
            if (!list || !list.length) return;
            if (single) {
                var f = list[0];
                var stored = {
                    id: nextId(), name: f.name, size: f.size, type: f.type,
                    status: 'completed', progress: 100, previewUrl: null, real: f
                };
                files = [stored];
                readPreview(f, stored);
                paint();
                return;
            }
            var room = typeof maxFiles === 'number' && maxFiles > 0 ? Math.max(0, maxFiles - files.length) : Number.POSITIVE_INFINITY;
            list.slice(0, room).forEach(function (f) {
                var item = {
                    id: nextId(), name: f.name, size: f.size, type: f.type,
                    status: usesProgress(layout) ? 'uploading' : 'completed',
                    progress: usesProgress(layout) ? 0 : 100,
                    previewUrl: null, real: f
                };
                files.push(item);
                readPreview(f, item);
            });
            paint();
            startTick();
        }

        function injectMocks(items) {
            files = (items || []).map(function (item) {
                var status = item.status || (usesProgress(layout) ? 'uploading' : 'completed');
                return {
                    id: nextId(),
                    name: item.name,
                    size: (typeof item.sizeKb === 'number' ? item.sizeKb : 0) * 1024,
                    type: item.type,
                    previewUrl: item.previewUrl || null,
                    status: status,
                    progress: status === 'uploading' ? 0 : 100
                };
            });
            paint();
            startTick();
        }

        el.addEventListener('click', function (e) {
            var open = e.target.closest('[data-fu-open]');
            if (open) {
                e.preventDefault();
                e.stopPropagation();
                openDialog();
                return;
            }
            var rem = e.target.closest('[data-fu-remove]');
            if (rem) {
                e.preventDefault();
                e.stopPropagation();
                removeAt(rem.getAttribute('data-fu-remove'));
                return;
            }
            var clr = e.target.closest('[data-fu-clear]');
            if (clr) {
                e.preventDefault();
                clearAll();
                return;
            }
            var rt = e.target.closest('[data-fu-retry]');
            if (rt) {
                e.preventDefault();
                retry(rt.getAttribute('data-fu-retry'));
                return;
            }
            var prev = e.target.closest('[data-fu-preview]');
            if (prev && lightbox) {
                e.preventDefault();
                var found = files.filter(function (f) { return f.id === prev.getAttribute('data-fu-preview'); })[0];
                if (found && found.previewUrl) {
                    lightbox.querySelector('img').src = found.previewUrl;
                    lightbox.hidden = false;
                }
            }
        });

        if (lightbox) {
            lightbox.addEventListener('click', function () { lightbox.hidden = true; });
        }

        el.addEventListener('dragover', function (e) {
            if (!e.target.closest('[data-fu-surface],[data-fu-sort-item]')) return;
            e.preventDefault();
            var surface = e.target.closest('[data-fu-surface]');
            if (surface) surface.classList.add('ubits-fu-layout__surface--drag');
        });
        el.addEventListener('dragleave', function (e) {
            var surface = e.target.closest('[data-fu-surface]');
            if (surface && !surface.contains(e.relatedTarget)) surface.classList.remove('ubits-fu-layout__surface--drag');
        });
        el.addEventListener('drop', function (e) {
            var sortItem = e.target.closest('[data-fu-sort-item]');
            if (sortItem && dragId) {
                e.preventDefault();
                e.stopPropagation();
                var toId = sortItem.getAttribute('data-fu-sort-item');
                var from = -1;
                var to = -1;
                files.forEach(function (f, i) {
                    if (f.id === dragId) from = i;
                    if (f.id === toId) to = i;
                });
                if (from >= 0 && to >= 0 && from !== to) {
                    var moved = files.splice(from, 1)[0];
                    files.splice(to, 0, moved);
                    paint();
                }
                dragId = null;
                return;
            }
            var surface = e.target.closest('[data-fu-surface]');
            if (!surface) return;
            e.preventDefault();
            surface.classList.remove('ubits-fu-layout__surface--drag');
            var list = e.dataTransfer && e.dataTransfer.files ? Array.prototype.slice.call(e.dataTransfer.files) : [];
            if (list.length) applyIncoming(list);
        });
        el.addEventListener('dragstart', function (e) {
            var item = e.target.closest('[data-fu-sort-item]');
            if (!item) return;
            dragId = item.getAttribute('data-fu-sort-item');
            item.classList.add('ubits-fu-layout__sort-item--dragging');
        });

        if (inputEl) {
            inputEl.addEventListener('change', function () {
                var list = this.files ? Array.prototype.slice.call(this.files) : [];
                if (list.length) applyIncoming(list);
                this.value = '';
            });
        }

        el._fileUploadInjectMocks = injectMocks;
        el._fileUploadClearAll = clearAll;

        paint();
        return el;
    }

    window.createFileUploadLayout = createFileUploadLayout;
}());
