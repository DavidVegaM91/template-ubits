// 🚀 CONFIGURACIÓN AVANZADA DEL TEMPLATE UBITS
// ================================================
// 
// Este archivo te permite personalizar fácilmente:
// - Colores del tema
// - Navegación del sidebar
// - Tabs superiores
// - Breakpoints responsive
// - Espaciados y tipografía
//
// ¡Modifica estos valores según tu proyecto!

const UBITS_CONFIG = {
    // 🎨 PALETA DE COLORES PRINCIPAL
    colors: {
        // Colores del tema claro
        light: {
            primary: '#0c5bef',        // Azul principal
            secondary: '#5c646f',      // Gris secundario
            background: '#F3F3F4',     // Fondo principal
            surface: '#FFFFFF',        // Superficies blancas
            sidebar: '#202837',        // Color del sidebar
            border: '#E2E6E9',         // Bordes
            text: {
                primary: '#212E3B',    // Texto principal
                secondary: '#4E5965',  // Texto secundario
                muted: '#98A6B3'       // Texto atenuado
            }
        },
        
        // Colores del tema oscuro
        dark: {
            primary: '#0c5bef',        // Azul principal (mismo)
            secondary: '#5c646f',      // Gris secundario (mismo)
            background: '#0E1825',     // Fondo oscuro
            surface: '#202837',        // Superficies oscuras
            sidebar: '#202837',        // Sidebar (mismo)
            border: '#4F5561',         // Bordes oscuros
            text: {
                primary: '#EDEEEF',    // Texto principal claro
                secondary: '#D0D2D5',  // Texto secundario claro
                muted: '#98A6B3'       // Texto atenuado (mismo)
            }
        }
    },

    // 🧭 NAVEGACIÓN DEL SIDEBAR
    sidebar: {
        // Configuración de botones de navegación
        navigation: [
            {
                id: 'dashboard',
                name: 'Dashboard',
                icon: 'fa-chart-line',
                tooltip: 'Dashboard',
                defaultActive: true
            },
            {
                id: 'usuarios',
                name: 'Usuarios',
                icon: 'fa-users',
                tooltip: 'Gestión de Usuarios'
            },
            {
                id: 'productos',
                name: 'Productos',
                icon: 'fa-box',
                tooltip: 'Catálogo de Productos'
            },
            {
                id: 'ventas',
                name: 'Ventas',
                icon: 'fa-chart-bar',
                tooltip: 'Análisis de Ventas'
            },
            {
                id: 'reportes',
                name: 'Reportes',
                icon: 'fa-file-chart-line',
                tooltip: 'Reportes y Analytics'
            },
            {
                id: 'configuracion',
                name: 'Configuración',
                icon: 'fa-gear',
                tooltip: 'Configuración del Sistema'
            }
        ],
        
        // Configuración del footer
        footer: [
            {
                id: 'perfil',
                name: 'Mi Perfil',
                icon: 'fa-user',
                tooltip: 'Mi Perfil',
                type: 'avatar' // Especial: muestra avatar circular
            },
            {
                id: 'darkmode',
                name: 'Modo Oscuro',
                icon: 'fa-moon',
                tooltip: 'Modo Oscuro',
                type: 'toggle' // Especial: toggle de tema
            }
        ]
    },

    // 📊 NAVEGACIÓN SUPERIOR (TABS)
    topNav: {
        tabs: [
            {
                id: 'general',
                name: 'General',
                icon: 'fa-chart-line'
            },
            {
                id: 'detallado',
                name: 'Detallado',
                icon: 'fa-chart-pie'
            },
            {
                id: 'tendencias',
                name: 'Tendencias',
                icon: 'fa-chart-line-up'
            },
            {
                id: 'comparativo',
                name: 'Comparativo',
                icon: 'fa-chart-column'
            }
        ]
    },

    // 📱 CONFIGURACIÓN RESPONSIVE
    responsive: {
        breakpoints: {
            mobile: 768,    // Sidebar se reduce a 80px
            tablet: 1024,   // Breakpoint para tablets
            desktop: 1200   // Breakpoint para desktop
        },
        
        sidebar: {
            mobile: {
                width: 80,
                left: 8
            },
            desktop: {
                width: 96,
                left: 11
            }
        },
        
        // Espaciados para pantallas con poco alto
        lowHeight: {
            threshold: 600,
            sidebarPadding: '12px 22px',
            sidebarGap: 12
        }
    },

    // 📏 ESPACIADOS Y TIPOGRAFÍA
    spacing: {
        sidebar: {
            padding: '16px 28px',
            gap: 16,
            buttonGap: 8
        },
        mainContent: {
            gap: 24,
            padding: 16
        },
        topNav: {
            height: 40,
            padding: '0 16px'
        }
    },

    // 🔤 TIPOGRAFÍA
    typography: {
        fontFamily: 'Noto Sans, sans-serif',
        weights: [400, 600],
        sizes: {
            h1: '32px',
            h2: '24px',
            h3: '20px',
            body: '16px',
            small: '14px',
            caption: '12px'
        }
    },

    // 🎭 ESTADOS DE BOTONES
    buttonStates: {
        default: {
            background: 'rgba(255, 255, 255, 0)',
            color: '#d0d2d5'
        },
        hover: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
        },
        active: {
            background: '#0c5bef',
            color: '#ffffff'
        },
        focus: {
            outline: '2px solid #0c5bef',
            outlineOffset: '2px'
        },
        pressed: {
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'scale(0.95)'
        }
    }
};

// 🔧 FUNCIONES DE CONFIGURACIÓN
// ===============================

// Función para aplicar la configuración
function applyConfig() {
    console.log('🚀 Aplicando configuración UBITS...');
    
    // Aplicar colores del tema
    applyThemeColors();
    
    // Aplicar navegación del sidebar
    applySidebarNavigation();
    
    // Aplicar tabs superiores
    applyTopNavTabs();
    
    console.log('✅ Configuración aplicada correctamente');
}

// Aplicar colores del tema
function applyThemeColors() {
    const root = document.documentElement;
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const themeColors = UBITS_CONFIG.colors[currentTheme];
    
    // Aplicar variables CSS
    Object.entries(themeColors).forEach(([key, value]) => {
        if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
                root.style.setProperty(`--${key}-${subKey}`, subValue);
            });
        } else {
            root.style.setProperty(`--${key}`, value);
        }
    });
}

// Aplicar navegación del sidebar
function applySidebarNavigation() {
    const sidebarBody = document.querySelector('.sidebar-body');
    if (!sidebarBody) return;
    
    // Limpiar navegación existente
    sidebarBody.innerHTML = '';
    
    // Crear botones según la configuración
    UBITS_CONFIG.sidebar.navigation.forEach(item => {
        const button = createNavButton(item);
        sidebarBody.appendChild(button);
    });
}

// Aplicar tabs superiores
function applyTopNavTabs() {
    const navTabs = document.querySelector('.nav-tabs');
    if (!navTabs) return;
    
    // Limpiar tabs existentes
    navTabs.innerHTML = '';
    
    // Crear tabs según la configuración
    UBITS_CONFIG.topNav.tabs.forEach(tab => {
        const tabButton = createTabButton(tab);
        navTabs.appendChild(tabButton);
    });
}

// Crear botón de navegación
function createNavButton(config) {
    const button = document.createElement('button');
    button.className = `nav-button ${config.defaultActive ? 'active' : ''}`;
    button.setAttribute('data-section', config.id);
    button.setAttribute('data-tooltip', config.tooltip);
    
    button.innerHTML = `<i class="far ${config.icon}"></i>`;
    
    return button;
}

// Crear tab superior
function createTabButton(config) {
    const button = document.createElement('button');
    button.className = `nav-tab ${config.id === 'general' ? 'active' : ''}`;
    button.setAttribute('data-tab', config.id);
    
    button.innerHTML = `
        <i class="far ${config.icon}"></i>
        <span>${config.name}</span>
    `;
    
    return button;
}

// 🌙 FUNCIONES DE TEMA
// =====================

// Cambiar tema
function changeTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    applyThemeColors();
    localStorage.setItem('ubits-theme', theme);
}

// Obtener tema actual
function getCurrentTheme() {
    return document.body.getAttribute('data-theme') || 'light';
}

// Toggle tema
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
}

// 📱 FUNCIONES RESPONSIVE
// ========================

// Aplicar configuración responsive
function applyResponsiveConfig() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Aplicar configuración según breakpoint
    if (windowWidth <= UBITS_CONFIG.responsive.breakpoints.mobile) {
        const mobileConfig = UBITS_CONFIG.responsive.sidebar.mobile;
        sidebar.style.width = `${mobileConfig.width}px`;
        sidebar.style.left = `${mobileConfig.left}px`;
    } else {
        const desktopConfig = UBITS_CONFIG.responsive.sidebar.desktop;
        sidebar.style.width = `${desktopConfig.width}px`;
        sidebar.style.left = `${desktopConfig.left}px`;
    }
    
    // Aplicar configuración para pantallas con poco alto
    if (windowHeight <= UBITS_CONFIG.responsive.lowHeight.threshold) {
        sidebar.style.padding = UBITS_CONFIG.responsive.lowHeight.sidebarPadding;
        sidebar.style.gap = `${UBITS_CONFIG.responsive.lowHeight.sidebarGap}px`;
    }
}

// 🎨 FUNCIONES DE PERSONALIZACIÓN
// ================================

// Personalizar colores del tema
function customizeThemeColors(primary, secondary, background) {
    if (primary) UBITS_CONFIG.colors.light.primary = primary;
    if (secondary) UBITS_CONFIG.colors.light.secondary = secondary;
    if (background) UBITS_CONFIG.colors.light.background = background;
    
    applyThemeColors();
    console.log('🎨 Colores del tema personalizados');
}

// Agregar nueva sección al sidebar
function addSidebarSection(id, name, icon, tooltip) {
    const newSection = {
        id,
        name,
        icon,
        tooltip,
        defaultActive: false
    };
    
    UBITS_CONFIG.sidebar.navigation.push(newSection);
    applySidebarNavigation();
    console.log(`➕ Nueva sección agregada: ${name}`);
}

// Agregar nuevo tab superior
function addTopNavTab(id, name, icon) {
    const newTab = { id, name, icon };
    UBITS_CONFIG.topNav.tabs.push(newTab);
    applyTopNavTabs();
    console.log(`➕ Nuevo tab agregado: ${name}`);
}

// 📋 EXPORTAR CONFIGURACIÓN
// ==========================

// Exportar configuración completa
function exportFullConfig() {
    return {
        config: UBITS_CONFIG,
        currentTheme: getCurrentTheme(),
        timestamp: new Date().toISOString()
    };
}

// Exportar configuración para desarrollo
function exportDevConfig() {
    return {
        colors: UBITS_CONFIG.colors,
        responsive: UBITS_CONFIG.responsive,
        spacing: UBITS_CONFIG.spacing
    };
}

// 🚀 INICIALIZACIÓN
// ===================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Template UBITS - Configuración Avanzada Cargada');
    
    // Aplicar configuración inicial
    applyConfig();
    
    // Aplicar configuración responsive
    applyResponsiveConfig();
    
    // Escuchar cambios de ventana
    window.addEventListener('resize', applyResponsiveConfig);
    
    console.log('✨ Template listo para personalizar');
});

// 🌐 EXPONER FUNCIONES GLOBALMENTE
window.UBITS_CONFIG = UBITS_CONFIG;
window.applyConfig = applyConfig;
window.changeTheme = changeTheme;
window.toggleTheme = toggleTheme;
window.customizeThemeColors = customizeThemeColors;
window.addSidebarSection = addSidebarSection;
window.addTopNavTab = addTopNavTab;
window.exportFullConfig = exportFullConfig;
window.exportDevConfig = exportDevConfig;

console.log('🔧 Funciones de configuración UBITS disponibles globalmente');
