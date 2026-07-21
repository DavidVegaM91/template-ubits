/**
 * UBITS Notifications Menu
 *
 * Panel de notificaciones del header (no es dropdown-menu).
 *
 * Uso:
 *   const root = createNotificationsMenu({
 *     items: [{ id, title, description, date, onClick? }],
 *     hasUnread: true,
 *   });
 *   container.appendChild(root);
 */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * @param {Object} config
   * @param {Array<{id:string,title:string,description:string,date:string,onClick?:Function}>} [config.items]
   * @param {boolean} [config.hasUnread=false] - Attention badge dot en el botón (como badgeDot del Button React)
   * @param {string} [config.tooltip='Notificaciones']
   * @param {string} [config.emptyTitle='No hay notificaciones']
   * @param {string} [config.emptyDescription='Cuando haya novedades, aparecerán aquí.']
   * @returns {HTMLElement}
   */
  function createNotificationsMenu(config) {
    config = config || {};
    var items = Array.isArray(config.items) ? config.items : [];
    var hasUnread = !!config.hasUnread;
    var tooltip = config.tooltip || 'Notificaciones';
    var emptyTitle = config.emptyTitle || 'No hay notificaciones';
    var emptyDescription = config.emptyDescription || 'Cuando haya novedades, aparecerán aquí.';

    var root = document.createElement('div');
    root.className = 'ubits-notifications-menu';

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className =
      'ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ubits-button--pill';
    trigger.setAttribute('aria-label', tooltip);
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('data-tooltip', tooltip);
    trigger.innerHTML = '<i class="far fa-bell" aria-hidden="true"></i>';
    if (hasUnread) {
      trigger.innerHTML +=
        '<span class="ubits-attention-badge ubits-attention-badge--sm ubits-attention-badge--error ubits-attention-badge--dot-only" aria-hidden="true"></span>';
    }

    var panelId = 'ubits-notifications-menu-panel-' + Math.random().toString(36).slice(2, 9);
    trigger.setAttribute('aria-controls', panelId);

    var panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'ubits-notifications-menu__panel';
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-label', tooltip);

    function renderItems() {
      panel.innerHTML = '';
      if (!items.length) {
        var empty = document.createElement('div');
        empty.className = 'ubits-notifications-menu__empty';
        empty.innerHTML =
          '<p class="ubits-body-md-bold" style="margin:0 0 4px;">' +
          escapeHtml(emptyTitle) +
          '</p><p class="ubits-body-sm-regular" style="margin:0;">' +
          escapeHtml(emptyDescription) +
          '</p>';
        panel.appendChild(empty);
        return;
      }
      items.forEach(function (item) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ubits-notifications-menu__item';
        btn.setAttribute('role', 'menuitem');
        btn.innerHTML =
          '<span class="ubits-notifications-menu__title ubits-body-sm-bold">' +
          escapeHtml(item.title) +
          '</span>' +
          '<span class="ubits-notifications-menu__desc ubits-body-xs-regular">' +
          escapeHtml(item.description) +
          '</span>' +
          '<span class="ubits-notifications-menu__date ubits-body-xs-regular">' +
          escapeHtml(item.date) +
          '</span>';
        btn.addEventListener('click', function () {
          if (typeof item.onClick === 'function') item.onClick(item);
          close();
        });
        panel.appendChild(btn);
      });
    }

    function open() {
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      if (panel.classList.contains('is-open')) close();
      else open();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener('mousedown', function (e) {
      if (!root.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    renderItems();
    root.appendChild(trigger);
    root.appendChild(panel);

    root._ubitsNotificationsMenu = {
      open: open,
      close: close,
      toggle: toggle,
      setItems: function (next) {
        items = Array.isArray(next) ? next : [];
        renderItems();
      },
    };

    return root;
  }

  global.createNotificationsMenu = createNotificationsMenu;
})(typeof window !== 'undefined' ? window : this);
