/* ========================================
   UBITS STATUS TAG COMPONENT - DOCUMENTACIÓN
   ======================================== */

/**
 * UBITS STATUS TAG COMPONENT
 * 
 * IMPORTANTE: Este componente NO requiere JavaScript para renderizar.
 * Es puramente CSS y se renderiza usando HTML directo.
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/status-tag.css">
 * 2. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 3. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 4. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Status tag sin icono -->
 * <span class="ubits-status-tag ubits-status-tag--success ubits-status-tag--sm">
 *   <span class="ubits-status-tag__text">Activo</span>
 * </span>
 * 
 * <!-- Status tag con icono a la izquierda -->
 * <span class="ubits-status-tag ubits-status-tag--success ubits-status-tag--sm ubits-status-tag--icon-left">
 *   <i class="ubits-status-tag__icon far fa-check-circle"></i>
 *   <span class="ubits-status-tag__text">Activo</span>
 * </span>
 * 
 * <!-- Status tag con icono a la derecha -->
 * <span class="ubits-status-tag ubits-status-tag--info ubits-status-tag--sm ubits-status-tag--icon-right">
 *   <span class="ubits-status-tag__text">Pendiente</span>
 *   <i class="ubits-status-tag__icon far fa-clock"></i>
 * </span>
 * ```
 * 
 * VARIANTES DISPONIBLES:
 * - ubits-status-tag--success (verde)
 * - ubits-status-tag--info (azul)
 * - ubits-status-tag--warning (amarillo)
 * - ubits-status-tag--error (rojo)
 * - ubits-status-tag--neutral (gris)
 * 
 * TAMAÑOS DISPONIBLES:
 * - ubits-status-tag--xs (extra pequeño - 20px de alto)
 * - ubits-status-tag--sm (pequeño - 28px de alto)
 * - ubits-status-tag--md (mediano - 36px de alto)
 * - ubits-status-tag--lg (grande - 40px de alto)
 * 
 * POSICIONES DE ICONO:
 * - Sin icono (por defecto)
 * - ubits-status-tag--icon-left (icono a la izquierda)
 * - ubits-status-tag--icon-right (icono a la derecha)
 * 
 * ESTRUCTURA HTML CORRECTA:
 * 1. Tag sin icono: <span class="ubits-status-tag__text">Texto</span>
 * 2. Tag con icono izquierda: <i class="ubits-status-tag__icon"> + <span class="ubits-status-tag__text">
 * 3. Tag con icono derecha: <span class="ubits-status-tag__text"> + <i class="ubits-status-tag__icon">
 * 
 * ICONOS FONTAWESOME:
 * - Usar siempre clase 'far' (outline)
 * - Ejemplos: fa-check-circle, fa-info-circle, fa-exclamation-triangle, fa-times-circle, fa-clock
 * 
 * EJEMPLOS COMPLETOS:
 * ```html
 * <!-- Success sin icono -->
 * <span class="ubits-status-tag ubits-status-tag--success ubits-status-tag--sm">
 *   <span class="ubits-status-tag__text">Completado</span>
 * </span>
 * 
 * <!-- Info con icono izquierda -->
 * <span class="ubits-status-tag ubits-status-tag--info ubits-status-tag--sm ubits-status-tag--icon-left">
 *   <i class="ubits-status-tag__icon far fa-info-circle"></i>
 *   <span class="ubits-status-tag__text">En proceso</span>
 * </span>
 * 
 * <!-- Warning con icono derecha -->
 * <span class="ubits-status-tag ubits-status-tag--warning ubits-status-tag--sm ubits-status-tag--icon-right">
 *   <span class="ubits-status-tag__text">Atención</span>
 *   <i class="ubits-status-tag__icon far fa-exclamation-triangle"></i>
 * </span>
 * 
 * <!-- Error extra pequeño -->
 * <span class="ubits-status-tag ubits-status-tag--error ubits-status-tag--xs">
 *   <span class="ubits-status-tag__text">Error</span>
 * </span>
 * 
 * <!-- Neutral grande con icono -->
 * <span class="ubits-status-tag ubits-status-tag--neutral ubits-status-tag--lg ubits-status-tag--icon-left">
 *   <i class="ubits-status-tag__icon far fa-circle"></i>
 *   <span class="ubits-status-tag__text">Neutral</span>
 * </span>
 * ```
 * 
 * NOTAS IMPORTANTES:
 * - NO existe función JavaScript - es puramente CSS
 * - SIEMPRE usar clases UBITS oficiales
 * - NO inventar clases personalizadas
 * - Iconos FontAwesome opcionales pero recomendados
 * - Estructura HTML específica requerida
 * - Los colores usan tokens UBITS oficiales
 * - La tipografía usa clases UBITS oficiales
 */

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

