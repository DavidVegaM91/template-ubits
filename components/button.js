/* ========================================
   UBITS BUTTON COMPONENT - DOCUMENTACIÓN
   ======================================== */

/**
 * UBITS BUTTON COMPONENT
 * 
 * IMPORTANTE: Este componente NO requiere JavaScript.
 * Es puramente CSS y se renderiza usando HTML directo.
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/button.css">
 * 2. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 3. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 4. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Button básico -->
 * <button class="ubits-button ubits-button--primary ubits-button--md">
 *   <i class="far fa-check"></i>
 *   <span>Texto del botón</span>
 * </button>
 * 
 * <!-- Button sin icono -->
 * <button class="ubits-button ubits-button--secondary ubits-button--sm">
 *   <span>Botón simple</span>
 * </button>
 * 
 * <!-- Button icono único -->
 * <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only">
 *   <i class="far fa-trash"></i>
 * </button>
 * 
 * <!-- Button con badge -->
 * <button class="ubits-button ubits-button--primary ubits-button--md">
 *   <i class="far fa-bell"></i>
 *   <span>Notificaciones</span>
 *   <span class="ubits-button__badge"></span>
 * </button>
 * ```
 * 
 * VARIANTES DISPONIBLES:
 * - ubits-button--primary (azul)
 * - ubits-button--secondary (gris)
 * - ubits-button--tertiary (transparente)
 * 
 * TAMAÑOS DISPONIBLES:
 * - ubits-button--sm (32px altura)
 * - ubits-button--md (40px altura) - POR DEFECTO
 * - ubits-button--lg (48px altura)
 * 
 * MODIFICADORES:
 * - ubits-button--icon-only (solo icono, sin texto)
 * 
 * ESTRUCTURA HTML CORRECTA:
 * 1. Button con icono y texto: <i> + <span>
 * 2. Button solo texto: <span>
 * 3. Button solo icono: <i> + class ubits-button--icon-only
 * 
 * ICONOS FONTAWESOME:
 * - Usar siempre clase 'far' (outline)
 * - Ejemplos: fa-check, fa-plus, fa-trash, fa-edit, fa-save
 * 
 * EVENTOS:
 * - onClick: Agregar manualmente onclick="miFuncion()"
 * - Hover/Focus: Automáticos via CSS
 * 
 * EJEMPLOS COMPLETOS:
 * ```html
 * <!-- Botón principal con acción -->
 * <button class="ubits-button ubits-button--primary ubits-button--md" onclick="guardar()">
 *   <i class="far fa-save"></i>
 *   <span>Guardar cambios</span>
 * </button>
 * 
 * <!-- Botón secundario -->
 * <button class="ubits-button ubits-button--secondary ubits-button--sm" onclick="cancelar()">
 *   <span>Cancelar</span>
 * </button>
 * 
 * <!-- Botón de eliminar (icono único) -->
 * <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="eliminar()">
 *   <i class="far fa-trash"></i>
 * </button>
 * 
 * <!-- Botón con notificación -->
 * <button class="ubits-button ubits-button--primary ubits-button--md" onclick="verNotificaciones()">
 *   <i class="far fa-bell"></i>
 *   <span>Notificaciones</span>
 *   <span class="ubits-button__badge"></span>
 * </button>
 * ```
 * 
 * NOTAS IMPORTANTES:
 * - NO existe button.js - es puramente CSS
 * - SIEMPRE usar clases UBITS oficiales
 * - NO inventar clases personalizadas
 * - Iconos FontAwesome obligatorios para iconos
 * - Estructura HTML específica requerida
 */

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

/**
 * RENDERIZADO DEL COMPONENTE BUTTON
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/button.css">
 * 2. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 3. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 4. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <button class="ubits-button ubits-button--primary ubits-button--md">
 *   <i class="far fa-check"></i>
 *   <span>Texto del botón</span>
 * </button>
 * ```
 * 
 * VARIANTES: primary (azul), secondary (gris), tertiary (transparente)
 * TAMAÑOS: sm (32px), md (40px), lg (48px)
 * MODIFICADORES: icon-only (solo icono)
 * FEATURES: hover, focus, active states automáticos via CSS
 */

// Exportar documentación para referencia
window.UBITS_BUTTON_DOCS = {
    variants: ['primary', 'secondary', 'tertiary'],
    sizes: ['sm', 'md', 'lg'],
    modifiers: ['icon-only'],
    structure: {
        withIcon: '<i class="far fa-icon"></i><span>text</span>',
        textOnly: '<span>text</span>',
        iconOnly: '<i class="far fa-icon"></i> + ubits-button--icon-only'
    }
};

