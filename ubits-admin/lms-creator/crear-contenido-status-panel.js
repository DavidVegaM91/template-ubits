/**
 * Status panel en Crear contenido — sustituye cc-gen-widget.
 * API compatible: ccGenWidget.addJob, finishJob, removeJob (SCORM / video modales).
 */
(function (global) {
    'use strict';

    var PANEL_ID = 'cc-crear-contenido-status-panel';
    var MOUNT_ID = 'cc-status-panel-mount';

    var TYPE_ICONS = {
        scorm: 'fa-cube',
        video: 'fa-video'
    };

    var _pageKeys = {};
    var _jobTypes = {};
    var _alerted = {};
    var READY_ALERTS_ID = 'cc-resource-ready-alerts';

    function readyAlertCopy(type) {
        return type === 'scorm'
            ? 'Tu presentación SCORM ya está lista.'
            : 'Tu video ya está listo.';
    }

    function ensureReadyAlertsMount() {
        var mount = document.getElementById(READY_ALERTS_ID);
        if (mount) return mount;
        mount = document.createElement('div');
        mount.id = READY_ALERTS_ID;
        mount.className = 'cc-resource-ready-alerts';
        mount.setAttribute('aria-live', 'polite');
        document.body.appendChild(mount);
        return mount;
    }

    function goToGeneratedPage(pageKey) {
        if (!pageKey) return;
        var hash = String(location.hash || '');
        if (hash.indexOf('recursos') === -1) {
            location.hash = '#recursos';
        }
        var el = document.querySelector('[data-paginas-creator-key="' + pageKey + '"]');
        if (el && typeof global.setPaginasCreatorActiveItem === 'function') {
            global.setPaginasCreatorActiveItem(el);
        }
    }

    function showReadyAlert(type, pageKey) {
        var mount = ensureReadyAlertsMount();
        var alertEl = document.createElement('div');
        alertEl.className = 'ubits-alert ubits-alert--success ubits-alert--with-action';
        alertEl.setAttribute('role', 'alert');
        alertEl.innerHTML =
            '<div class="ubits-alert__icon"><i class="far fa-check-circle"></i></div>' +
            '<div class="ubits-alert__content">' +
            '<span class="ubits-alert__text">' + readyAlertCopy(type) + '</span>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-alert__action">' +
            '<span>Ver página</span>' +
            '</button>' +
            '</div>' +
            '<button type="button" class="ubits-alert__close" aria-label="Cerrar alerta">' +
            '<i class="far fa-times"></i>' +
            '</button>';
        var actionBtn = alertEl.querySelector('.ubits-alert__action');
        var closeBtn = alertEl.querySelector('.ubits-alert__close');
        if (actionBtn) {
            actionBtn.addEventListener('click', function () {
                goToGeneratedPage(pageKey);
                if (alertEl.parentNode) alertEl.parentNode.removeChild(alertEl);
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                if (alertEl.parentNode) alertEl.parentNode.removeChild(alertEl);
            });
        }
        mount.appendChild(alertEl);
    }

    function initPanel() {
        if (typeof global.renderStatusPanelHtml !== 'function' || typeof global.initStatusPanel !== 'function') {
            return;
        }
        var mount = document.getElementById(MOUNT_ID);
        if (!mount || mount.dataset.statusPanelMounted === '1') return;
        mount.dataset.statusPanelMounted = '1';
        mount.insertAdjacentHTML(
            'beforeend',
            global.renderStatusPanelHtml({
                id: PANEL_ID,
                title: 'Generando recursos',
                titleIcon: 'fa-sparkles',
                useIaTitleIcon: true,
                placement: 'bottom-left',
                hidden: true
            })
        );
        global.initStatusPanel(PANEL_ID, {
            autoTitle: true,
            titleLoading: 'Generando recursos',
            titleDone: 'Recursos generados',
            hidden: false
        });
    }

    function addJob(id, opts) {
        opts = opts || {};
        if (typeof global.statusPanelAddItem !== 'function') return;
        initPanel();
        removeJob(id);
        _pageKeys[id] = opts.pageKey || null;
        _jobTypes[id] = opts.type || 'video';
        global.statusPanelAddItem(PANEL_ID, id, {
            title: opts.label != null ? String(opts.label) : '…',
            subtitle: 'Generando...',
            status: 'loading',
            icon: TYPE_ICONS[opts.type] || 'fa-sparkles'
        });
    }

    function finishJob(id) {
        if (typeof global.statusPanelUpdateItem !== 'function') return;
        var pageKey = _pageKeys[id];
        var type = _jobTypes[id] || 'video';
        global.statusPanelUpdateItem(PANEL_ID, id, {
            status: 'success',
            subtitle: 'Listo · Haz clic para ver',
            onClick: pageKey
                ? function () {
                      goToGeneratedPage(pageKey);
                  }
                : null
        });
        if (!_alerted[id]) {
            showReadyAlert(type, pageKey);
            _alerted[id] = true;
        }
    }

    function removeJob(id) {
        delete _pageKeys[id];
        delete _jobTypes[id];
        delete _alerted[id];
        if (typeof global.statusPanelRemoveItem === 'function') {
            global.statusPanelRemoveItem(PANEL_ID, id);
        }
    }

    /** Recurso borrado en la página pero el ítem sigue visible en el panel (estado error). */
    function markJobDeleted(id) {
        if (typeof global.statusPanelUpdateItem !== 'function') return;
        initPanel();
        global.statusPanelUpdateItem(PANEL_ID, id, {
            status: 'error',
            subtitle: 'Se eliminó el recurso',
            onClick: null
        });
    }

    function markJobDeletedForPage(pageKey, type) {
        if (!pageKey || !type) return;
        markJobDeleted(String(pageKey) + '-' + type);
    }

    global.ccGenWidget = {
        addJob: addJob,
        finishJob: finishJob,
        removeJob: removeJob,
        markJobDeleted: markJobDeleted,
        markJobDeletedForPage: markJobDeletedForPage
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPanel);
    } else {
        initPanel();
    }
})(typeof window !== 'undefined' ? window : this);
