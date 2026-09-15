/**
 * UBITS Item — fila de lista (paridad React UbitsItem).
 */
function ubitsItemClass(variant, size, interactive) {
  var cls = ['ubits-item']
  if (variant === 'outline') cls.push('ubits-item--outline')
  if (variant === 'muted') cls.push('ubits-item--muted')
  if (size === 'sm') cls.push('ubits-item--sm')
  if (size === 'xs') cls.push('ubits-item--xs')
  if (interactive) cls.push('ubits-item--interactive')
  return cls.join(' ')
}

function renderUbitsItemDemo(mount, state) {
  if (!mount) return
  var size = state.size || 'default'
  var variant = state.variant || 'outline'
  var layout = state.layout || 'separated'
  var c = state.composition || 'archivos'
  var group = 'ubits-item-group ubits-item-group--' + (layout === 'joined' ? 'joined' : 'separated')
  var item = ubitsItemClass(variant, size, c === 'clicable')
  var html = ''

  function row(icon, title, desc, actions) {
    return (
      '<div class="' + item + '">' +
        (icon
          ? '<div class="ubits-item__media ubits-item__media--icon"><i class="' + icon + '" aria-hidden="true"></i></div>'
          : '') +
        '<div class="ubits-item__content">' +
          '<div class="ubits-item__title ubits-body-md-bold">' + title + '</div>' +
          (desc ? '<p class="ubits-item__description ubits-body-sm-regular">' + desc + '</p>' : '') +
        '</div>' +
        (actions ? '<div class="ubits-item__actions">' + actions + '</div>' : '') +
      '</div>'
    )
  }

  if (c === 'con-icono') {
    html =
      '<div class="' + group + '" style="max-width:480px;margin:0 auto;">' +
        row('far fa-envelope', 'Notificaciones por correo', 'Recibe actualizaciones en tu correo', '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm"><span>Configurar</span></button>') +
        row('far fa-bell', 'Notificaciones push', 'Avisos en el dispositivo', '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm"><span>Activar</span></button>') +
      '</div>'
  } else if (c === 'clicable') {
    html =
      '<div class="' + group + '" style="max-width:480px;margin:0 auto;">' +
        '<button type="button" class="' + item + '">' +
          '<div class="ubits-item__media ubits-item__media--icon"><i class="far fa-folder" aria-hidden="true"></i></div>' +
          '<div class="ubits-item__content"><div class="ubits-item__title ubits-body-md-bold">Normas de vacaciones</div><p class="ubits-item__description ubits-body-sm-regular">4 documentos · 1 colección</p></div>' +
          '<div class="ubits-item__actions"><i class="far fa-chevron-right" aria-hidden="true" style="color:var(--ubits-fg-1-medium);"></i></div>' +
        '</button>' +
        '<button type="button" class="' + item + '">' +
          '<div class="ubits-item__media ubits-item__media--icon"><i class="far fa-file-lines" aria-hidden="true"></i></div>' +
          '<div class="ubits-item__content"><div class="ubits-item__title ubits-body-md-bold">politica-vacaciones.txt</div><p class="ubits-item__description ubits-body-sm-regular">Texto · colección Normas</p></div>' +
          '<div class="ubits-item__actions"><i class="far fa-chevron-right" aria-hidden="true" style="color:var(--ubits-fg-1-medium);"></i></div>' +
        '</button>' +
      '</div>'
  } else if (c === 'archivos') {
    var fileSize = size === 'default' ? 'xs' : size
    var fileItem = ubitsItemClass(variant, fileSize, false)
    html =
      '<div class="' + group + '" style="max-width:520px;margin:0 auto;">' +
        '<div class="' + fileItem + '">' +
          '<div class="ubits-item__media ubits-item__media--icon"><i class="far fa-file-lines" aria-hidden="true"></i></div>' +
          '<div class="ubits-item__content"><div class="ubits-item__title ubits-body-md-bold">politica-vacaciones.txt</div><p class="ubits-item__description ubits-body-sm-regular">12 KB · Actualizado hace 2 horas</p></div>' +
          '<div class="ubits-item__actions"><span class="ubits-badge-tag ubits-badge-tag--soft ubits-badge-tag--success ubits-badge-tag--sm">Listo</span><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm"><span>Abrir</span></button></div>' +
        '</div>' +
        '<div class="' + fileItem + '">' +
          '<div class="ubits-item__media ubits-item__media--icon"><i class="far fa-file-lines" aria-hidden="true"></i></div>' +
          '<div class="ubits-item__content"><div class="ubits-item__title ubits-body-md-bold">protocolo-acoso.md</div><p class="ubits-item__description ubits-body-sm-regular">8 KB · Actualizado ayer</p></div>' +
          '<div class="ubits-item__actions"><span class="ubits-badge-tag ubits-badge-tag--soft ubits-badge-tag--warning ubits-badge-tag--sm">Borrador</span><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm"><span>Abrir</span></button></div>' +
        '</div>' +
      '</div>'
  } else if (c === 'personas' || c === 'actividad') {
    var initials = c === 'actividad' ? 'AR' : 'AR'
    html =
      '<div class="' + group + '" style="max-width:480px;margin:0 auto;">' +
        '<div class="' + item + '">' +
          '<div class="ubits-item__media" id="item-avatar-slot"></div>' +
          '<div class="ubits-item__content"><div class="ubits-item__title ubits-body-md-bold">Ana Ruiz</div><p class="ubits-item__description ubits-body-sm-regular">' +
            (c === 'actividad' ? 'Ana Ruiz subió un documento · hace 1 h' : 'People partner · Talento') +
          '</p></div>' +
          '<div class="ubits-item__actions"><button type="button" class="ubits-button ubits-button--secondary ubits-button--sm"><span>' +
            (c === 'actividad' ? 'Ver' : 'Seguir') +
          '</span></button></div>' +
        '</div>' +
      '</div>'
  } else if (c === 'con-badges') {
    html =
      '<div class="' + group + '" style="max-width:480px;margin:0 auto;">' +
        row(null, 'Colección pública', 'Visible para toda la empresa', '') +
        row(null, 'Colección privada', 'Solo personas o grupos elegidos', '') +
      '</div>'
  } else if (c === 'con-secciones') {
    html =
      '<div class="' + ubitsItemClass(variant, size, false) + '" style="max-width:480px;margin:0 auto;">' +
        '<div class="ubits-item__header"><span class="ubits-body-sm-bold">Hoy</span><span class="ubits-body-xs-regular" style="color:var(--ubits-fg-1-medium);">3 eventos</span></div>' +
        '<div class="ubits-item__content"><div class="ubits-item__title ubits-body-md-bold">Se indexó politica-vacaciones.txt</div><p class="ubits-item__description ubits-body-sm-regular">Colección Normas de vacaciones</p></div>' +
        '<div class="ubits-item__footer"><span class="ubits-body-xs-regular" style="color:var(--ubits-fg-1-medium);">Hace 12 min</span><button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs"><span>Ver</span></button></div>' +
      '</div>'
  } else {
    html =
      '<div class="' + group + '" style="max-width:440px;margin:0 auto;">' +
        row(null, 'Normas de vacaciones', '4 documentos · visibilidad pública', '') +
      '</div>'
  }

  mount.innerHTML = html
  var slot = mount.querySelector('#item-avatar-slot')
  if (slot && typeof renderAvatar === 'function') {
    slot.innerHTML = renderAvatar({ name: 'Ana Ruiz', initials: 'AR' }, { size: 'sm', initialsOnly: true })
  }
}

if (typeof window !== 'undefined') {
  window.renderUbitsItemDemo = renderUbitsItemDemo
}
