/* ========================================
   UBITS IA-BUTTON COMPONENT - DOCUMENTACIÓN
   ======================================== */

/**
 * UBITS IA-BUTTON COMPONENT
 * 
 * IMPORTANTE: Este componente NO requiere JavaScript para renderizar.
 * Es puramente CSS y se renderiza usando HTML directo.
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/ia-button.css">
 * 2. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 3. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 4. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- IA-Button Primary con texto e iconos -->
 * <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md">
 *   <i class="far fa-sparkles"></i>
 *   <span>Button text</span>
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * 
 * <!-- IA-Button Secondary con texto e iconos -->
 * <button class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--md">
 *   <i class="far fa-sparkles"></i>
 *   <span>Button text</span>
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * 
 * <!-- IA-Button Primary icon-only -->
 * <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--icon-only ubits-ia-button--md">
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * 
 * <!-- IA-Button con estado Active -->
 * <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md ubits-ia-button--active">
 *   <i class="far fa-sparkles"></i>
 *   <span>Button text</span>
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * 
 * <!-- IA-Button Disabled -->
 * <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md" disabled>
 *   <i class="far fa-sparkles"></i>
 *   <span>Button text</span>
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * ```
 * 
 * VARIANTES DISPONIBLES:
 * - ubits-ia-button--primary (con gradiente radial azul)
 * - ubits-ia-button--secondary (outlined con borde azul)
 * 
 * TAMAÑOS DISPONIBLES:
 * - ubits-ia-button--sm (pequeño - padding 8px 12px)
 * - ubits-ia-button--md (mediano - padding 12px 16px) - POR DEFECTO
 * - ubits-ia-button--lg (grande - padding 16px 20px)
 * 
 * ESTADOS DISPONIBLES:
 * - Default: estado normal
 * - Hover: cambio sutil en opacidad (primary) o fondo (secondary)
 * - Pressed/Active: opacidad reducida y ligero desplazamiento
 * - Focused: box-shadow azul de 4px
 * - Active (programático): fondo rgba(12,91,239,0.15) y texto azul
 * - Disabled: fondo gris deshabilitado, cursor not-allowed
 * 
 * CARACTERÍSTICAS ESPECIALES:
 * - Border radius completo (pill shape - 1000px)
 * - Badge opcional (punto rojo en esquina superior derecha)
 * - Iconos opcionales a izquierda y derecha del texto
 * - Gradiente radial en variante Primary
 * - Diseñado específicamente para casos de uso de IA
 * 
 * EJEMPLOS DE USO:
 * 
 * ```html
 * <!-- IA-Button Primary completo -->
 * <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md">
 *   <i class="far fa-sparkles"></i>
 *   <span>Generar con IA</span>
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * 
 * <!-- IA-Button Secondary -->
 * <button class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--md">
 *   <i class="far fa-sparkles"></i>
 *   <span>Otra acción</span>
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * 
 * <!-- IA-Button solo con icono izquierdo -->
 * <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md">
 *   <i class="far fa-sparkles"></i>
 *   <span>Button text</span>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * 
 * <!-- IA-Button icon-only pequeño -->
 * <button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--icon-only ubits-ia-button--sm">
 *   <i class="far fa-sparkles"></i>
 *   <span class="ubits-ia-button__badge"></span>
 * </button>
 * ```
 * 
 * NOTAS IMPORTANTES:
 * - El badge es opcional (no siempre debe estar presente)
 * - Los iconos son opcionales pero recomendados para mantener consistencia visual
 * - El gradiente radial es específico de este componente y no debe modificarse
 * - El border radius completo (pill shape) es característico de este componente
 * - Usar preferiblemente el icono "fa-sparkles" para casos de IA
 * - Todos los colores usan tokens UBITS cuando es posible
 * - El componente soporta modo oscuro automáticamente
 * 
 * DIFERENCIAS CON UBITS-BUTTON:
 * - Border radius completo (pill shape) vs 8px
 * - Gradiente radial en Primary vs color sólido
 * - Badge siempre presente vs opcional
 * - Diseñado específicamente para casos de IA
 * - Estados Active con fondo rgba(12,91,239,0.15) y texto azul
 */

