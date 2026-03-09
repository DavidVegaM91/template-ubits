/* ========================================
   UBITS TAB COMPONENT - DOCUMENTACIÓN
   ======================================== */

/**
 * UBITS TAB COMPONENT
 * 
 * IMPORTANTE: Este componente NO requiere JavaScript para renderizar.
 * Es puramente CSS y se renderiza usando HTML directo.
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/tab.css">
 * 2. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 3. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 4. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Tab inactivo sin icono (por defecto) -->
 * <button class="ubits-tab">
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab activo sin icono -->
 * <button class="ubits-tab ubits-tab--active">
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab inactivo con icono y texto -->
 * <button class="ubits-tab">
 *   <i class="far fa-grid"></i>
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab activo con icono y texto -->
 * <button class="ubits-tab ubits-tab--active">
 *   <i class="far fa-grid"></i>
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab solo con icono (icon-only) -->
 * <button class="ubits-tab ubits-tab--icon-only">
 *   <i class="far fa-grid"></i>
 * </button>
 * 
 * <!-- Tab activo solo con icono -->
 * <button class="ubits-tab ubits-tab--icon-only ubits-tab--active">
 *   <i class="far fa-grid"></i>
 * </button>
 * ```
 * 
 * NOTA IMPORTANTE: Los iconos son OPCIONALES. Por defecto, los tabs no incluyen iconos.
 * 
 * TAMAÑOS DISPONIBLES:
 * - ubits-tab--xs (extra pequeño - 28px de alto)
 * - ubits-tab--sm (pequeño - 32px de alto)
 * - ubits-tab (mediano - 40px de alto) - DEFAULT
 * - ubits-tab--lg (grande - 48px de alto)
 * 
 * ESTADOS DISPONIBLES:
 * - Default (inactivo): fondo gris claro (bg-2), texto e icono gris medio
 * - Active: fondo blanco (bg-1), texto e icono oscuro, texto bold
 * - Hover: cambio sutil en el fondo
 * - Disabled: fondo gris deshabilitado, cursor not-allowed
 * 
 * VARIANTES DISPONIBLES:
 * - ubits-tab--icon-only (solo icono, sin texto)
 * 
 * EJEMPLOS DE USO:
 * 
 * ```html
 * <!-- Tab pequeño con icono y texto -->
 * <button class="ubits-tab ubits-tab--sm">
 *   <i class="far fa-home"></i>
 *   <span>Inicio</span>
 * </button>
 * 
 * <!-- Tab grande activo -->
 * <button class="ubits-tab ubits-tab--lg ubits-tab--active">
 *   <i class="far fa-user"></i>
 *   <span>Perfil</span>
 * </button>
 * 
 * <!-- Tab extra pequeño solo icono -->
 * <button class="ubits-tab ubits-tab--xs ubits-tab--icon-only">
 *   <i class="far fa-settings"></i>
 * </button>
 * 
 * <!-- Tab con badge -->
 * <button class="ubits-tab ubits-tab--active">
 *   <i class="far fa-bell"></i>
 *   <span>Notificaciones</span>
 *   <span class="ubits-tab__badge"></span>
 * </button>
 * 
 * <!-- Grupo de tabs navegables sobre fondo bg-2 (por defecto) -->
 * <div style="display: flex; gap: 4px;">
 *   <button class="ubits-tab ubits-tab--active" onclick="setActiveTab(this)">
 *     <i class="far fa-home"></i>
 *     <span>Inicio</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-book"></i>
 *     <span>Cursos</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-chart-line"></i>
 *     <span>Métricas</span>
 *   </button>
 * </div>
 * 
 * <!-- Grupo de tabs sobre fondo blanco (dentro de secciones) -->
 * <div style="background: var(--ubits-bg-2); padding: 4px; border-radius: 8px; display: inline-flex; gap: 4px;">
 *   <button class="ubits-tab ubits-tab--active" onclick="setActiveTab(this)">
 *     <i class="far fa-home"></i>
 *     <span>Inicio</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-book"></i>
 *     <span>Cursos</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-chart-line"></i>
 *     <span>Métricas</span>
 *   </button>
 * </div>
 * ```
 * 
 * NOTAS IMPORTANTES:
 * - El componente tab usa los mismos altos que el componente button
 * - Los iconos son OPCIONALES - por defecto los tabs no tienen iconos
 * - Los iconos deben usar FontAwesome (preferiblemente outline: `far`) cuando se usen
 * - El texto usa tipografía UBITS (Noto Sans)
 * - El estado activo cambia el font-weight a 700 (bold)
 * - Todos los colores usan tokens UBITS (var(--ubits-*))
 * - Para tabs sin icono, simplemente omite el elemento <i>
 * 
 * GRUPOS DE TABS:
 * - Por defecto, los tabs se usan sobre fondo bg-2 (layout normal)
 * - Cuando los tabs están dentro de secciones con fondo bg-1 (blanco), deben tener un contenedor
 *   con fondo bg-2 y padding de 4px para mantener el contraste visual
 * - Gap entre tabs: 4px
 * - El primer tab del grupo suele estar activo por defecto
 */

