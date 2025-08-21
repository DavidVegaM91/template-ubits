// 🚀 Template UBITS - Archivo de Configuración
// Personaliza aquí los valores principales del template

const UBITS_CONFIG = {
    // 🎨 Colores del Template
    colors: {
        primary: '#0c5bef',           // Color principal (azul)
        secondary: '#5c646f',         // Color secundario (gris)
        background: '#f3f3f4',        // Color de fondo principal
        white: '#ffffff',             // Color blanco
        dark: '#202837',              // Color del sidebar
        lightGray: '#98a6b3',         // Color gris claro
        border: '#d0d2d5',            // Color de bordes
        success: '#28a745',           // Color de éxito
        warning: '#ffc107',           // Color de advertencia
        danger: '#dc3545'             // Color de error
    },

    // 📱 Dimensiones Responsive
    responsive: {
        sidebar: {
            desktop: '96px',
            mobile: '80px',
            minHeight: '562px'
        },
        topNav: {
            height: '40px',
            mobileHeight: '36px'
        },
        breakpoints: {
            mobile: 768,
            lowHeight: 600
        }
    },

    // 🔤 Tipografía
    typography: {
        primaryFont: 'Noto Sans',
        fontWeights: [400, 600],
        fontSizes: {
            small: '12px',
            base: '16px',
            large: '20px',
            xlarge: '24px'
        }
    },

    // 📏 Espaciados
    spacing: {
        sidebarPadding: '16px 8px',
        navGap: '8px',
        contentGap: '24px',
        buttonPadding: '8px',
        borderRadius: '8px'
    },

    // 🎯 Configuración de Navegación
    navigation: {
        sidebar: {
            main: [
                {
                    id: 'dashboard',
                    icon: 'far fa-tachometer-alt',
                    label: 'Dashboard',
                    active: false
                },
                {
                    id: 'analytics',
                    icon: 'far fa-chart-line',
                    label: 'Analytics',
                    active: false
                },
                {
                    id: 'users',
                    icon: 'far fa-users',
                    label: 'Usuarios',
                    active: false
                },
                {
                    id: 'settings',
                    icon: 'far fa-cog',
                    label: 'Configuración',
                    active: false
                },
                {
                    id: 'reports',
                    icon: 'far fa-file-alt',
                    label: 'Reportes',
                    active: false
                },
                {
                    id: 'plans',
                    icon: 'far fa-star',
                    label: 'Planes',
                    active: true
                }
            ],
            footer: [
                {
                    id: 'admin',
                    icon: 'far fa-user-shield',
                    label: 'Administrador',
                    active: false
                },
                {
                    id: 'logout',
                    icon: 'far fa-sign-out-alt',
                    label: 'Cerrar Sesión',
                    active: false
                }
            ]
        },
        topNav: [
            {
                id: 'section1',
                icon: 'far fa-chart-line',
                label: 'Sección 1',
                active: true
            },
            {
                id: 'section2',
                icon: 'far fa-chart-line',
                label: 'Sección 2',
                active: false
            },
            {
                id: 'section3',
                icon: 'far fa-chart-line',
                label: 'Sección 3',
                active: false
            },
            {
                id: 'section4',
                icon: 'far fa-chart-line',
                label: 'Sección 4',
                active: false
            },
            {
                id: 'section5',
                icon: 'far fa-chart-line',
                label: 'Sección 5',
                active: false
            }
        ]
    },

    // ⚙️ Configuración General
    general: {
        appName: 'Template UBITS',
        version: '1.0.0',
        author: 'Equipo UBITS',
        enableAnimations: true,
        enableHoverEffects: true,
        enableResponsive: true
    },

    // 🔧 Funciones de Utilidad
    utils: {
        // Función para obtener colores
        getColor: function(colorName) {
            return this.colors[colorName] || this.colors.primary;
        },

        // Función para obtener configuración de navegación
        getNavConfig: function(type) {
            if (type === 'sidebar') {
                return {
                    main: this.navigation.sidebar.main || [],
                    footer: this.navigation.sidebar.footer || []
                };
            }
            return this.navigation[type] || [];
        },

        // Función para validar configuración
        validateConfig: function() {
            const required = ['colors', 'responsive', 'typography'];
            const missing = required.filter(key => !this[key]);
            
            if (missing.length > 0) {
                console.warn('Configuración incompleta:', missing);
                return false;
            }
            
            return true;
        }
    }
};

// 🔒 Hacer la configuración inmutable
Object.freeze(UBITS_CONFIG);

// 📤 Exportar para uso global
if (typeof window !== 'undefined') {
    window.UBITS_CONFIG = UBITS_CONFIG;
}

// 📝 Ejemplo de uso:
/*
// Cambiar colores dinámicamente
UBITS_CONFIG.colors.primary = '#FF6B6B';

// Obtener configuración de navegación
const sidebarItems = UBITS_CONFIG.utils.getNavConfig('sidebar');

// Validar configuración
if (UBITS_CONFIG.utils.validateConfig()) {
    console.log('Configuración válida');
}
*/

// 🎨 Función para aplicar configuración personalizada
function applyCustomConfig(customConfig) {
    if (typeof customConfig === 'object' && customConfig !== null) {
        // Aplicar colores personalizados
        if (customConfig.colors) {
            Object.assign(UBITS_CONFIG.colors, customConfig.colors);
        }
        
        // Aplicar navegación personalizada
        if (customConfig.navigation) {
            Object.assign(UBITS_CONFIG.navigation, customConfig.navigation);
        }
        
        // Aplicar configuración general
        if (customConfig.general) {
            Object.assign(UBITS_CONFIG.general, customConfig.general);
        }
        
        console.log('Configuración personalizada aplicada:', customConfig);
        return true;
    }
    
    console.error('Configuración personalizada inválida');
    return false;
}

// 📤 Exportar función de configuración personalizada
if (typeof window !== 'undefined') {
    window.applyCustomConfig = applyCustomConfig;
}

// 🚀 Inicialización automática
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Template UBITS configurado correctamente');
        console.log('📋 Usa UBITS_CONFIG para personalizar el template');
        console.log('🎨 Usa applyCustomConfig() para aplicar cambios dinámicos');
    });
}
