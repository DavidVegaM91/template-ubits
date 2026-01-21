// UBITS Toast Component
// API: showToast(type, message, options?)
// 
// TYPES:
// - 'success' - Verde (3.5s)
// - 'info' - Azul (3.5s) 
// - 'warning' - Amarillo (5s)
// - 'error' - Rojo (6.5s)
//
// OPTIONS:
// - duration: number (milliseconds, 0 = persistent)
// - noClose: boolean (hide close button)
// - pauseOnHover: boolean (pause on mouse hover)
// - action: {label: string, onClick: function} (action button)
// - containerId: string (custom container ID)
//
// EXAMPLES:
// showToast('success', '¡Operación exitosa!');
// showToast('info', 'Ya estás en la documentación 😆', { duration: 3500 });
// showToast('error', 'Error al guardar', { noClose: true });
// showToast('warning', 'Datos no guardados', { 
//   action: { label: 'Guardar', onClick: () => save() } 
// });

(function() {
  const DEFAULTS = {
    durations: { success: 3500, info: 3500, warning: 5000, error: 6500 },
    maxVisible: 3,
    pauseOnHover: true
  };

  function ensureContainer(containerId) {
    const id = containerId || 'ubits-toast-container';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
    }
    return el;
  }

  function getRole(type) {
    if (type === 'warning' || type === 'error') return { role: 'alert', ariaLive: 'assertive' };
    return { role: 'status', ariaLive: 'polite' };
  }

  function limitStack(container, maxVisible) {
    const items = Array.from(container.querySelectorAll('.ubits-toast'));
    if (items.length <= maxVisible) return;
    // remove the oldest beyond limit
    const overflow = items.length - maxVisible;
    for (let i = 0; i < overflow; i++) {
      const node = items[i];
      safelyRemove(node);
    }
  }

  function safelyRemove(node) {
    if (!node) return;
    node.classList.add('ubits-toast--exit');
    setTimeout(() => node.remove(), 180);
  }

  function createToastElement(type, message, opts) {
    const toast = document.createElement('div');
    toast.className = `ubits-toast ubits-toast--${type}`;

    const { role, ariaLive } = getRole(type);
    toast.setAttribute('role', role);
    toast.setAttribute('aria-live', ariaLive);

    // Icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'ubits-toast__icon';
    const icon = document.createElement('i');
    icon.className = getIconClass(type);
    iconWrap.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.className = 'ubits-toast__content';
    const text = document.createElement('div');
    text.className = 'ubits-toast__text ubits-body-sm-regular';
    text.textContent = message;
    content.appendChild(text);

    // Optional action
    if (opts && opts.action && opts.action.label && typeof opts.action.onClick === 'function') {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'ubits-button ubits-button--tertiary ubits-button--sm';
      actionBtn.innerHTML = `<span>${opts.action.label}</span>`;
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        opts.action.onClick();
      });
      content.appendChild(actionBtn);
    }

    // Close button (optional)
    let closeBtn;
    if (!opts || !opts.noClose) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'ubits-toast__close';
      closeBtn.setAttribute('aria-label', 'Cerrar notificación');
      const closeIcon = document.createElement('i');
      closeIcon.className = 'far fa-times';
      closeBtn.appendChild(closeIcon);
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        safelyRemove(toast);
      });
    }

    toast.appendChild(iconWrap);
    toast.appendChild(content);
    if (closeBtn) toast.appendChild(closeBtn);

    // Enter animation flag
    requestAnimationFrame(() => toast.classList.add('ubits-toast--enter'));

    return toast;
  }

  function getIconClass(type) {
    switch (type) {
      case 'success': return 'far fa-check-circle';
      case 'warning': return 'far fa-exclamation-triangle';
      case 'error': return 'far fa-times-circle';
      default: return 'far fa-info-circle';
    }
  }

  function showToast(type, message, options = {}) {
    const container = ensureContainer(options.containerId);
    const toast = createToastElement(type, message, options);
    container.appendChild(toast);

    // Limit visible stack
    limitStack(container, DEFAULTS.maxVisible);

    // Duration handling
    const base = DEFAULTS.durations[type] || DEFAULTS.durations.info;
    const duration = typeof options.duration === 'number' ? options.duration : base;
    let remaining = duration;
    let timerId;
    let startTs;

    function startTimer() {
      if (!duration || duration <= 0) return; // persistent
      startTs = performance.now();
      timerId = setTimeout(() => safelyRemove(toast), remaining);
    }

    function pauseTimer() {
      if (!timerId) return;
      clearTimeout(timerId);
      timerId = null;
      if (startTs) {
        const elapsed = performance.now() - startTs;
        remaining = Math.max(0, remaining - elapsed);
      }
    }

    if (options.pauseOnHover !== false && duration && duration > 0) {
      toast.addEventListener('mouseenter', pauseTimer);
      toast.addEventListener('mouseleave', startTimer);
      toast.addEventListener('focusin', pauseTimer);
      toast.addEventListener('focusout', startTimer);
    }

    startTimer();

    return toast;
  }

  // Expose globally
  window.showToast = showToast;

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

/**
 * RENDERIZADO DEL COMPONENTE TOAST
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/toast.css">
 * 2. JS: <script src="components/toast.js"></script>
 * 3. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 4. Container: <div id="ubits-toast-container"></div>
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Container obligatorio -->
 * <div id="ubits-toast-container"></div>
 * 
 * <!-- JavaScript -->
 * <script>
 * showToast('success', '¡Operación exitosa!');
 * showToast('info', 'Información importante', { duration: 3500 });
 * showToast('warning', 'Advertencia', { noClose: true });
 * showToast('error', 'Error crítico', { 
 *   action: { label: 'Reintentar', onClick: () => retry() } 
 * });
 * </script>
 * ```
 * 
 * TIPOS DISPONIBLES: 'success', 'info', 'warning', 'error'
 * DURACIONES: success/info (3.5s), warning (5s), error (6.5s)
 * FEATURES: auto-close, pause on hover, stacking (max 3), accessible
 */
})();


