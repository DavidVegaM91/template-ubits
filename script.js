// Template UBITS - Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const sidebar = document.getElementById('sidebar');
    const topNav = document.getElementById('topNav');
    const navButtons = document.querySelectorAll('.nav-button');
    const navTabs = document.querySelectorAll('.nav-tab');
    const contentArea = document.querySelector('.content-area');
    const tooltip = document.getElementById('tooltip');

    // Función para ajustar el sidebar según el alto de la pantalla
    function adjustSidebarHeight() {
        const windowHeight = window.innerHeight;
        const topMargin = 16; // Margen superior
        const bottomMargin = 16; // Margen inferior
        const availableHeight = windowHeight - topMargin - bottomMargin;
        
        // El sidebar debe tener al menos 578px de alto
        const sidebarHeight = Math.max(578, availableHeight);
        
        sidebar.style.height = `${sidebarHeight}px`;
        sidebar.style.minHeight = `578px`;
        
        // Ajustar posición para mantener margen de 16px arriba y abajo
        const topPosition = topMargin;
        sidebar.style.top = `${topPosition}px`;
        sidebar.style.bottom = 'auto';
        

    }

    // Función para ajustar el alto del contenedor principal
    function adjustMainContentHeight() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const isMobile = windowWidth <= 768;
        
        const topMargin = isMobile ? 12 : 16; // Margen superior
        const bottomMargin = isMobile ? 12 : 16; // Margen inferior
        const availableHeight = windowHeight - topMargin - bottomMargin;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.height = `${availableHeight}px`;
            mainContent.style.maxHeight = `${availableHeight}px`;
        }
    }

    // Función para alternar modo oscuro
    function toggleDarkMode() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', newTheme);
        
        // Cambiar icono del botón
        const darkModeButton = document.querySelector('#darkmode-toggle i');
        if (darkModeButton) {
            if (newTheme === 'dark') {
                darkModeButton.className = 'far fa-sun';
            } else {
                darkModeButton.className = 'far fa-moon';
            }
        }
        
        // Cambiar tooltip del botón
        const darkModeButtonContainer = document.querySelector('#darkmode-toggle');
        if (darkModeButtonContainer) {
            if (newTheme === 'dark') {
                darkModeButtonContainer.setAttribute('data-tooltip', 'Modo claro');
            } else {
                darkModeButtonContainer.setAttribute('data-tooltip', 'Modo oscuro');
            }
        }
        
        console.log(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
        console.log('🎯 Estado de navegación mantenido - no se cambió de sección');
    }

    // Función para cargar tema guardado
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            
            // Actualizar icono y tooltip si es modo oscuro
            if (savedTheme === 'dark') {
                const darkModeButton = document.querySelector('#darkmode-toggle i');
                const darkModeButtonContainer = document.querySelector('#darkmode-toggle');
                
                if (darkModeButton) {
                    darkModeButton.className = 'far fa-sun';
                }
                
                if (darkModeButtonContainer) {
                    darkModeButtonContainer.setAttribute('data-tooltip', 'Modo claro');
                }
            }
        }
    }

    // Función para ajustar el nav superior según el ancho de la pantalla
    function adjustTopNavWidth() {
        // Ya no es necesaria - el CSS se encarga del ancho
        console.log('🎯 Top Nav: CSS se encarga del ancho automáticamente');
    }

    // Función para manejar la navegación del sidebar
    function handleSidebarNavigation(event) {
        const button = event.currentTarget;
        const section = button.dataset.section;
        
        // Remover clase active de todos los botones del sidebar
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        // Agregar clase active al botón clickeado del sidebar
        button.classList.add('active');
        
        // Activar siempre la Sección 1 del nav superior
        navTabs.forEach(tab => tab.classList.remove('active'));
        const section1Tab = document.querySelector('[data-tab="section1"]');
        if (section1Tab) {
            section1Tab.classList.add('active');
        }
        
        // Actualizar el contenido con la sección del sidebar + sección 1
        updateContentArea(section);
    }

    // Función para manejar la navegación de tabs
    function handleTabNavigation(event) {
        const tab = event.currentTarget;
        const tabName = tab.dataset.tab;
        
        // Remover clase active de todos los tabs
        navTabs.forEach(t => t.classList.remove('active'));
        
        // Agregar clase active al tab clickeado
        tab.classList.add('active');
        
        // Aquí puedes agregar lógica para cambiar el contenido
        console.log(`Cambiando a tab: ${tabName}`);
        
        // Ejemplo: cambiar el contenido del área principal
        updateContentArea(tabName);
    }

    // Función para actualizar el área de contenido
    function updateContentArea(section) {
        const contentPlaceholder = contentArea.querySelector('.content-placeholder');
        
        if (contentPlaceholder) {
            const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
            contentPlaceholder.innerHTML = `
                <h2>${sectionName}</h2>
                <p>Contenido de la sección: ${sectionName}</p>
                <p>Subsección activa: Sección 1</p>
                <p>Personaliza este contenido según tus necesidades</p>
            `;
        }
    }

    // Función para manejar el responsive
    function handleResponsive() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Ajustar sidebar para pantallas pequeñas
        if (windowWidth <= 768) {
            sidebar.style.width = '80px';
            sidebar.style.minWidth = '80px';
            sidebar.style.left = '8px';
            
            // Ajustar contenedor principal para mobile
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.left = '108px';
                mainContent.style.right = '12px';
            }
        } else {
            sidebar.style.width = '96px';
            sidebar.style.minWidth = '96px';
            sidebar.style.left = '11px';
            
            // Restaurar posición del contenedor principal
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.left = '131px';
                mainContent.style.right = '12px';
            }
        }
        
        // Ajustar para pantallas con poco alto
        if (windowHeight <= 600) {
            sidebar.style.padding = '12px 22px';
        } else {
            sidebar.style.padding = '16px 28px';
        }
        
        // Reajustar dimensiones
        adjustSidebarHeight();
        adjustMainContentHeight();
    }

    // Event listeners
    navButtons.forEach(button => {
        // Solo agregar navegación a botones que tengan data-section
        if (button.dataset.section) {
            button.addEventListener('click', handleSidebarNavigation);
        }
        
        // Tooltip hover para todos los botones
        button.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            tooltip.textContent = tooltipText;
            tooltip.style.opacity = '1';
            
            // Posicionar tooltip a la derecha del botón
            const rect = this.getBoundingClientRect();
            tooltip.style.left = (rect.right + 20) + 'px';
            tooltip.style.top = (rect.top + rect.height/2 - tooltip.offsetHeight/2) + 'px';
        });
        
        button.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
        });
        
        // Manejo especial para el botón de modo oscuro
        if (button.id === 'darkmode-toggle') {
            button.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir navegación normal
                e.stopPropagation(); // Evitar que se propague el evento
                toggleDarkMode();
            });
        }
    });

    navTabs.forEach(tab => {
        tab.addEventListener('click', handleTabNavigation);
    });

    // Event listeners para responsive
    window.addEventListener('resize', () => {
        handleResponsive();
        adjustMainContentHeight();
    });
    window.addEventListener('orientationchange', () => {
        handleResponsive();
        adjustMainContentHeight();
    });

    // Inicialización
    function init() {
        console.log('🚀 Inicializando Template UBITS...');
        
        adjustSidebarHeight();
        adjustMainContentHeight();
        handleResponsive();
        
        // Cargar tema guardado
        loadSavedTheme();
        
        // Establecer estado inicial
        const defaultSection = document.querySelector('[data-section="aprendizaje"]');
        if (defaultSection) {
            defaultSection.classList.add('active');
        }
        
        const defaultTab = document.querySelector('[data-tab="section1"]');
        if (defaultTab) {
            defaultTab.classList.add('active');
        }
        
        // Cargar contenido inicial
        updateContentArea('aprendizaje');
    }

    // Inicializar la aplicación
    init();

    // Función para exportar configuración (útil para el equipo)
    window.exportConfig = function() {
        const config = {
            sidebar: {
                width: '96px',
                backgroundColor: '#202837',
                borderRadius: '8px',
                shadow: '0px 1px 2px 0px rgba(0,0,0,0.14), 0px 0px 2px 0px rgba(0,0,0,0.12)'
            },
            topNav: {
                height: '40px',
                backgroundColor: '#ffffff',
                borderRadius: '8px'
            },
            colors: {
                primary: '#0c5bef',
                secondary: '#5c646f',
                background: '#f3f3f4',
                white: '#ffffff',
                dark: '#202837',
                lightGray: '#98a6b3',
                border: '#d0d2d5'
            },
            fonts: {
                primary: 'Noto Sans',
                weights: [400, 600]
            },
            spacing: {
                sidebarPadding: '16px 8px',
                navGap: '8px',
                contentGap: '24px'
            }
        };
        
        console.log('Configuración del template:', config);
        return config;
    };

    // Función para personalizar colores (útil para el equipo)
    window.customizeColors = function(primaryColor, secondaryColor) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', primaryColor || '#0c5bef');
        root.style.setProperty('--secondary-color', secondaryColor || '#5c646f');
        
        // Aplicar cambios dinámicamente
        document.querySelectorAll('.nav-button.active').forEach(btn => {
            btn.style.backgroundColor = primaryColor || '#0c5bef';
        });
        
        document.querySelectorAll('.nav-tab.active::after').forEach(tab => {
            tab.style.backgroundColor = primaryColor || '#0c5bef';
        });
    };
});

// Función para mostrar información del template
function showTemplateInfo() {
    console.log(`
    🚀 TEMPLATE UBITS - DASHBOARD
    
    📁 Archivos incluidos:
    - index.html (estructura HTML)
    - styles.css (estilos CSS)
    - script.js (funcionalidad JavaScript)
    
    🎨 Características:
    - Sidebar responsive que se adapta al alto de pantalla
    - Nav superior que se adapta al ancho de pantalla
    - Estados de botones: Default, Hover, Active
    - Colores y espaciados exactos del diseño Figma
    - Fuente Noto Sans con pesos 400 y 600
    - Iconos Font Awesome 6 Pro
    
    🔧 Funciones disponibles:
    - exportConfig(): Exporta la configuración del template
    - customizeColors(primary, secondary): Personaliza colores
    
    📱 Responsive:
    - Mobile: sidebar 80px, ajustes de padding
    - Low height: reducción de espaciados
    
    💡 Para personalizar:
    1. Modifica los colores en CSS variables
    2. Cambia los iconos en el HTML
    3. Ajusta el contenido en updateContentArea()
    4. Personaliza los nombres de secciones
    `);
}

// Mostrar información al cargar
document.addEventListener('DOMContentLoaded', showTemplateInfo);
