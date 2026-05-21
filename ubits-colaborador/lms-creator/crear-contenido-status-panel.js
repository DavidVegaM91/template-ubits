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
        global.statusPanelUpdateItem(PANEL_ID, id, {
            status: 'success',
            subtitle: 'Listo · Haz clic para ver',
            onClick: pageKey
                ? function () {
                      var el = document.querySelector('[data-paginas-creator-key="' + pageKey + '"]');
                      if (el && typeof global.setPaginasCreatorActiveItem === 'function') {
                          global.setPaginasCreatorActiveItem(el);
                      }
                  }
                : null
        });
    }

    function removeJob(id) {
        delete _pageKeys[id];
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
