/**
 * UBITS Card — átomo de layout (paridad React UbitsCard).
 * Uso: markup BEM en card.css. Esta factory arma el HTML del playground.
 */
function ubitsCardClass(size, hoverable, extras) {
  var cls = ['ubits-card']
  if (size === 'sm') cls.push('ubits-card--sm')
  if (hoverable) cls.push('ubits-card--hoverable')
  if (extras) {
    extras.split(/\s+/).forEach(function (c) {
      if (c) cls.push(c)
    })
  }
  return cls.join(' ')
}

function ubitsCardKebab() {
  return (
    '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Opciones">' +
      '<i class="far fa-ellipsis-vertical"></i>' +
    '</button>'
  )
}

function ubitsCardBadge(kind, text, icon) {
  var cls = 'ubits-badge-tag ubits-badge-tag--sm ' + kind
  if (icon) cls += ' ubits-badge-tag--with-icon'
  return (
    '<span class="' + cls + '">' +
      (icon ? '<i class="' + icon + '"></i>' : '') +
      '<span class="ubits-badge-tag__text">' + text + '</span>' +
    '</span>'
  )
}

function renderUbitsCardDemo(mount, state) {
  if (!mount) return
  var size = state.size || 'default'
  var hover = state.composition === 'imagen-overlay' ? false : !!state.hoverable
  var c = state.composition || 'badge-acciones'
  var max = 'max-width:320px;margin:0 auto;'
  var html = ''
  var cover = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&h=360&fit=crop'
  var coverAlt = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1000&h=800&fit=crop'
  var avatars = [
    { avatar: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&fit=crop', name: 'Sofía' },
    { avatar: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&fit=crop', name: 'Martín' },
    { avatar: 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&fit=crop', name: 'Elena' },
    { avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop', name: 'Diego' },
    { avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop', name: 'Laura' },
    { avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop', name: 'Andrés' }
  ]

  if (c === 'header-borde') {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__header ubits-card__header--bordered">' +
          '<div class="ubits-card__title ubits-body-md-bold">Header con borde</div>' +
          '<div class="ubits-card__description ubits-body-sm-regular">El encabezado se separa del cuerpo con una línea.</div>' +
        '</div>' +
        '<div class="ubits-card__content"><p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">Úsalo cuando el título debe leerse como una barra, no como un bloque continuo.</p></div>' +
      '</div>'
  } else if (c === 'secciones') {
    html =
      '<div class="' + ubitsCardClass(size, hover, 'ubits-card--flush') + '" style="' + max + '">' +
        '<div class="ubits-card__header ubits-card__header--compact">' +
          '<div class="ubits-card__title ubits-body-md-bold">Encabezado</div>' +
          '<div class="ubits-card__action"><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm"><span>Acción</span></button></div>' +
        '</div>' +
        '<div class="ubits-card__content ubits-card__content--divided"><p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">Cada bloque llega al borde: encabezado, cuerpo y pie con líneas entre sí.</p></div>' +
        '<div class="ubits-card__footer ubits-card__footer--plain"><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--full-width"><span>Acción</span></button></div>' +
      '</div>'
  } else if (c === 'header-y-pie') {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__header ubits-card__header--bordered">' +
          '<div class="ubits-card__title ubits-body-md-bold">Header y pie</div>' +
        '</div>' +
        '<div class="ubits-card__content"><p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">El pie lleva una banda de fondo y se pega al borde inferior.</p></div>' +
        '<div class="ubits-card__footer"><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--full-width"><span>Acción</span></button></div>' +
      '</div>'
  } else if (c === 'con-enlace') {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__header"><div class="ubits-card__title ubits-body-md-bold">¿Necesitas ayuda con la solicitud?</div></div>' +
        '<div class="ubits-card__content"><p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">Sigue la guía paso a paso para certificar tus beneficios semanales.</p></div>' +
        '<div class="ubits-card__footer ubits-card__footer--plain">' +
          '<a href="#" class="ubits-button ubits-button--link ubits-button--sm" onclick="return false;"><span>Ver la guía</span><i class="far fa-arrow-up-right-from-square"></i></a>' +
        '</div>' +
      '</div>'
  } else if (c === 'con-menu') {
    var avatarBtn = typeof window.renderAvatar === 'function'
      ? window.renderAvatar({ avatar: avatars[0].avatar, name: avatars[0].name }, { size: 'xs' })
      : ''
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__header">' +
          '<div class="ubits-card__title ubits-body-md-bold">¿Necesitas ayuda con la solicitud?</div>' +
          '<div class="ubits-card__action">' + ubitsCardKebab() + '</div>' +
        '</div>' +
        '<div class="ubits-card__content"><p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">Sigue la guía paso a paso para certificar tus beneficios semanales.</p></div>' +
        '<div class="ubits-card__footer"><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm">' + avatarBtn + '<span>@sofia</span></button></div>' +
      '</div>'
  } else if (c === 'imagen-interna') {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__content">' +
          '<div class="ubits-card__media ubits-card__media--inset"><img src="' + cover + '" alt=""></div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
            ubitsCardBadge('ubits-badge-tag--outlined ubits-badge-tag--gray', 'Destacado', 'far fa-bell') +
            '<span class="ubits-body-xs-semibold" style="display:inline-flex;align-items:center;gap:4px;color:var(--ubits-fg-1-medium);"><i class="far fa-sparkles"></i>Recomendado</span>' +
          '</div>' +
          '<p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">Simplifica el trabajo desde el primer día. Tareas, proyectos y equipo en un solo lugar.</p>' +
          '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm"><span>Empezar</span><i class="far fa-arrow-right"></i></button>' +
        '</div>' +
      '</div>'
  } else if (c === 'imagen-overlay') {
    html =
      '<div class="' + ubitsCardClass(size, false, 'ubits-card--flush ubits-card--overlay') + '" style="' + max + '">' +
        '<div class="ubits-card__media ubits-card__media--overlay"><img src="' + coverAlt + '" alt=""><span class="ubits-card__overlay-fade" aria-hidden="true"></span></div>' +
        '<div class="ubits-card__overlay-body">' +
          '<h3 class="ubits-card__title ubits-body-md-bold">Efecto de escala</h3>' +
          '<div class="ubits-card__description ubits-body-sm-regular">La foto cubre el card, sube de escala al pasar el cursor y el texto queda sobre el degradado.</div>' +
        '</div>' +
      '</div>'
  } else if (c === 'imagen-borde') {
    html =
      '<div class="' + ubitsCardClass(size, hover, 'ubits-card--flush') + '" style="' + max + '">' +
        '<div class="ubits-card__content ubits-card__content--flush">' +
          '<div class="ubits-card__media"><img src="' + cover + '" alt=""></div>' +
          '<div style="display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;padding:24px;padding-top:0;">' +
            ubitsCardBadge('ubits-badge-tag--outlined ubits-badge-tag--gray', 'Destacado', 'far fa-bell') +
            '<p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">Acelera el proceso de diseño. Herramientas para todo el equipo.</p>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm"><span>Empezar</span><i class="far fa-arrow-right"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>'
  } else if (c === 'formulario') {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__header">' +
          '<div class="ubits-card__title ubits-body-md-bold">Iniciar sesión</div>' +
          '<div class="ubits-card__description ubits-body-sm-regular">Ingresa tu correo y contraseña para acceder.</div>' +
        '</div>' +
        '<div class="ubits-card__content">' +
          '<form onsubmit="return false;" style="display:flex;flex-direction:column;gap:20px;">' +
            '<div id="card-demo-email"></div>' +
            '<div id="card-demo-password"></div>' +
            '<button type="submit" class="ubits-button ubits-button--primary ubits-button--full-width"><span>Iniciar sesión</span></button>' +
            '<p class="ubits-body-xs-regular" style="margin:0;text-align:center;color:var(--ubits-fg-1-medium);">O continúa con</p>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--full-width"><i class="far fa-globe"></i><span>Google</span></button>' +
          '</form>' +
        '</div>' +
        '<div class="ubits-card__footer"><p class="ubits-body-xs-regular" style="margin:0;width:100%;text-align:center;color:var(--ubits-fg-1-medium);">Al continuar, aceptas los <a href="#" onclick="return false;" style="color:inherit;text-underline-offset:4px;">términos de servicio</a>.</p></div>' +
      '</div>'
  } else if (c === 'facturacion') {
    var open = !!state.billingOpen
    var bar = typeof window.progressBarHtml === 'function'
      ? window.progressBarHtml({ value: 90, size: 'sm', rounded: true })
      : ''
    var lines = [
      ['Solicitudes', '$210,84'],
      ['CPU activa', '$21,95'],
      ['Eventos', '$21,20'],
      ['Almacenamiento', '$20,45'],
      ['Ancho de banda', '$0,00']
    ].map(function (row) {
      return '<div style="display:flex;justify-content:space-between;gap:16px;"><span class="ubits-body-sm-semibold" style="color:var(--ubits-fg-1-high);">' + row[0] + '</span><span class="ubits-body-sm-regular" style="color:var(--ubits-fg-1-medium);">' + row[1] + '</span></div>'
    }).join('')
    html =
      '<div style="padding-bottom:24px;">' +
        '<div class="' + ubitsCardClass(size, hover, 'ubits-card--overflow-visible') + '" style="max-width:400px;margin:0 auto;position:relative;padding-bottom:4px;">' +
          '<div class="ubits-card__header">' +
            '<div class="ubits-card__title ubits-body-md-bold">Quedan 3 días del ciclo</div>' +
            '<div class="ubits-card__action"><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm"><span>Facturación</span></button></div>' +
          '</div>' +
          '<div class="ubits-card__content">' +
            '<div style="position:relative;overflow:hidden;max-height:' + (open ? '32rem' : '12rem') + ';">' +
              '<div style="display:flex;flex-direction:column;gap:8px;padding:16px;background:var(--ubits-bg-2);border-radius:var(--border-radius-lg);">' +
                '<div class="ubits-body-xs-semibold" style="display:flex;justify-content:space-between;color:var(--ubits-fg-1-medium);"><span>Crédito incluido</span><span>Cargos bajo demanda</span></div>' +
                '<div class="ubits-heading-h2" style="display:flex;justify-content:space-between;margin:0;"><span>$18,08 / $20</span><span>$0</span></div>' +
                bar +
              '</div>' +
              '<div style="display:flex;flex-direction:column;gap:16px;margin-top:16px;">' + lines + '</div>' +
              (open ? '' : '<div aria-hidden="true" style="position:absolute;inset-inline:0;bottom:0;height:80px;background:linear-gradient(to top,var(--ubits-bg-1),transparent);pointer-events:none;"></div>') +
            '</div>' +
          '</div>' +
          '<div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);z-index:2;">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ubits-button--pill" id="card-billing-toggle" aria-label="' + (open ? 'Contraer' : 'Expandir') + '"><i class="far fa-chevron-' + (open ? 'up' : 'down') + '"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>'
  } else if (c === 'estado') {
    html =
      '<div class="' + ubitsCardClass(size, hover, 'ubits-card--flush') + '" style="' + max + '">' +
        '<div class="ubits-card__content ubits-card__content--flush">' +
          '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;padding:32px 16px 24px;background:var(--ubits-bg-2);text-align:center;">' +
            '<span class="ubits-card__icon ubits-card__icon--brand" aria-hidden="true"><i class="far fa-terminal"></i></span>' +
            '<div class="ubits-card__title ubits-body-md-bold">Publicación lista</div>' +
            '<div class="ubits-card__description ubits-body-sm-regular">Tu app ya está en vivo</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:4px;padding:0 16px 24px;">' +
            '<div style="display:flex;justify-content:space-between;padding:10px 12px;border-radius:var(--border-radius-lg);background:var(--ubits-bg-2);"><span class="ubits-body-sm-semibold" style="color:var(--ubits-fg-1-high);">Entorno</span><span class="ubits-body-sm-regular" style="color:var(--ubits-fg-1-medium);">Producción</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding:10px 12px;border-radius:var(--border-radius-lg);"><span class="ubits-body-sm-semibold" style="color:var(--ubits-fg-1-high);">Región</span><span class="ubits-body-sm-regular" style="color:var(--ubits-fg-1-medium);">us-east-1</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding:10px 12px;border-radius:var(--border-radius-lg);background:var(--ubits-bg-2);"><span class="ubits-body-sm-semibold" style="color:var(--ubits-fg-1-high);">Versión</span><span class="ubits-body-sm-regular" style="color:var(--ubits-fg-1-medium);">v2.4.0</span></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:var(--border-radius-lg);"><span class="ubits-body-sm-semibold" style="color:var(--ubits-fg-1-high);">Estado</span><span class="ubits-status-tag ubits-status-tag--success ubits-status-tag--xs ubits-status-tag--icon-left"><i class="far fa-check-circle"></i><span class="ubits-status-tag__text">Saludable</span></span></div>' +
          '</div>' +
        '</div>' +
      '</div>'
  } else if (c === 'estadistica') {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__content">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
            '<span class="ubits-body-sm-semibold" style="color:var(--ubits-fg-1-medium);">Ingresos</span>' +
            ubitsCardKebab() +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<p class="ubits-heading-h2" style="margin:0;color:var(--ubits-fg-1-high);">$12,4 mil</p>' +
            ubitsCardBadge('ubits-badge-tag--soft ubits-badge-tag--success', '12,5%', 'far fa-arrow-up') +
          '</div>' +
          '<hr style="height:1px;border:0;margin:0;background:var(--ubits-border-1);">' +
          '<p class="ubits-body-xs-regular" style="margin:0;color:var(--ubits-fg-1-medium);">Vs. el mes pasado: <span class="ubits-body-xs-semibold" style="color:var(--ubits-fg-1-high);">$11,0 mil</span></p>' +
        '</div>' +
      '</div>'
  } else if (c === 'badge-acciones') {
    var list = typeof window.renderProfileList === 'function'
      ? window.renderProfileList(avatars, { size: 'xs', maxVisible: 3, showOverflowPopover: false })
      : ''
    html =
      '<div class="' + ubitsCardClass(size, hover, 'ubits-card--flush') + '" style="max-width:384px;margin:0 auto;">' +
        '<div class="ubits-card__header ubits-card__header--compact ubits-card__header--bordered">' +
          ubitsCardBadge('ubits-badge-tag--soft ubits-badge-tag--gray', 'En vivo', 'far fa-check') +
          '<div class="ubits-card__action">' + ubitsCardKebab() + '</div>' +
        '</div>' +
        '<div class="ubits-card__content">' +
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">' +
            '<div class="ubits-card__title ubits-body-md-bold">Nombre de la integración</div>' +
            ubitsCardBadge('ubits-badge-tag--soft ubits-badge-tag--success', 'Instalada') +
          '</div>' +
          '<div class="ubits-card__description ubits-body-sm-regular">Descripción corta de la integración y lo que hace, en una sola línea.</div>' +
          list +
        '</div>' +
        '<div class="ubits-card__footer"><button type="button" class="ubits-button ubits-button--secondary ubits-button--full-width"><span>Abrir</span></button></div>' +
      '</div>'
  } else if (c === 'con-icono') {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__content">' +
          '<span class="ubits-card__icon ubits-card__icon--brand" aria-hidden="true"><i class="far fa-bag-shopping"></i></span>' +
          '<a href="#" class="ubits-card__title ubits-card__title--link ubits-body-md-bold" onclick="return false;">Resumen de pedidos recientes</a>' +
          '<div class="ubits-card__description ubits-body-sm-regular">Revisa compras, actualizaciones y cambios de estado en un solo lugar.</div>' +
          '<a href="#" class="ubits-button ubits-button--link ubits-button--sm" onclick="return false;"><span>Ver pedidos</span><i class="far fa-chevron-right"></i></a>' +
        '</div>' +
      '</div>'
  } else if (c === 'label-enlace') {
    html =
      '<div class="' + ubitsCardClass(size, hover, 'ubits-card--flush') + '" style="' + max + '">' +
        '<div class="ubits-card__header ubits-card__header--bordered ubits-card__header--compact">' +
          '<div class="ubits-body-sm-semibold" style="display:flex;align-items:center;gap:8px;color:var(--ubits-fg-1-high);"><i class="far fa-book-open"></i>Documentación</div>' +
        '</div>' +
        '<div class="ubits-card__content">' +
          '<div class="ubits-card__description ubits-body-sm-regular">Guías, referencias de API y ejemplos para integrar la plataforma.</div>' +
          '<a href="#" class="ubits-button ubits-button--link ubits-button--sm" onclick="return false;"><i class="far fa-link"></i><span>Ver docs</span></a>' +
        '</div>' +
      '</div>'
  } else {
    html =
      '<div class="' + ubitsCardClass(size, hover) + '" style="' + max + '">' +
        '<div class="ubits-card__header">' +
          '<div class="ubits-card__title ubits-body-md-bold">Card estándar</div>' +
          '<div class="ubits-card__description ubits-body-sm-regular">Usa el tamaño default: padding y ritmo internos estándar.</div>' +
        '</div>' +
        '<div class="ubits-card__content"><p class="ubits-body-sm-regular" style="margin:0;color:var(--ubits-fg-1-medium);">El card admite la propiedad de tamaño. Default es el espaciado habitual.</p></div>' +
        '<div class="ubits-card__footer"><button type="button" class="ubits-button ubits-button--secondary ubits-button--full-width"><span>Acción</span></button></div>' +
      '</div>'
  }

  mount.innerHTML = html

  if (c === 'formulario' && typeof window.createInput === 'function') {
    window.createInput({
      containerId: 'card-demo-email',
      type: 'email',
      label: 'Correo',
      placeholder: 'nombre@empresa.com',
      size: 'sm'
    })
    window.createInput({
      containerId: 'card-demo-password',
      type: 'password',
      label: 'Contraseña',
      placeholder: 'Contraseña',
      size: 'sm'
    })
  }

  var toggle = mount.querySelector('#card-billing-toggle')
  if (toggle) {
    toggle.addEventListener('click', function () {
      state.billingOpen = !state.billingOpen
      renderUbitsCardDemo(mount, state)
    })
  }
}

if (typeof window !== 'undefined') {
  window.renderUbitsCardDemo = renderUbitsCardDemo
}
