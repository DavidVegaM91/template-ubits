// UBITS Playground - Dashboard JavaScript
// Este archivo contiene funcionalidades globales compartidas por todas las páginas

// ===== MODO OSCURO / CLARO =====

/**
 * Alterna entre modo oscuro y claro
 * Usada por: sidebar.js, tab-bar.js
 */
function toggleDarkMode() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', newTheme);
    
    // Cambiar icono del botón del sidebar
    const darkModeButton = document.querySelector('#darkmode-toggle i');
    if (darkModeButton) {
        if (newTheme === 'dark') {
            darkModeButton.className = 'fa fa-sun-bright';
        } else {
            darkModeButton.className = 'fa fa-moon';
        }
    }
    
    // Cambiar icono del tab-bar
    const tabBarIcon = document.querySelector('[data-tab="modo-oscuro"] .tab-bar-icon');
    if (tabBarIcon) {
        if (newTheme === 'dark') {
            tabBarIcon.className = 'fa fa-sun-bright tab-bar-icon';
        } else {
            tabBarIcon.className = 'far fa-moon tab-bar-icon';
        }
    }
    
    // Cambiar texto del tab-bar
    const tabBarText = document.querySelector('[data-tab="modo-oscuro"] .tab-bar-text');
    if (tabBarText) {
        if (newTheme === 'dark') {
            tabBarText.textContent = 'Modo claro';
        } else {
            tabBarText.textContent = 'Modo oscuro';
        }
    }
    
    // Cambiar tooltip del botón
    const darkModeButtonContainer = document.querySelector('#darkmode-toggle');
    if (darkModeButtonContainer) {
        if (newTheme === 'dark') {
            darkModeButtonContainer.setAttribute('data-tooltip', 'Modo claro');
            darkModeButtonContainer.setAttribute('data-theme', 'dark');
        } else {
            darkModeButtonContainer.setAttribute('data-tooltip', 'Modo oscuro');
            darkModeButtonContainer.setAttribute('data-theme', 'light');
        }
        
        // Reinicializar tooltip si la función está disponible
        if (typeof updateDarkModeTooltip === 'function') {
            updateDarkModeTooltip();
        }
    }
    
    console.log(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
}

/**
 * Inicializa el toggle de modo oscuro
 * Usada por: sidebar.js
 */
function initDarkModeToggle() {
    const darkModeButton = document.querySelector('#darkmode-toggle');
    if (darkModeButton) {
        darkModeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleDarkMode();
        });
    }
}

/**
 * Carga el tema guardado en localStorage
 */
function loadSavedTheme() {
    // Solo cargar tema guardado si el body NO tiene data-theme explícito
    const bodyTheme = document.body.getAttribute('data-theme');
    if (bodyTheme && bodyTheme !== '') {
        return; // Respetar el tema explícito del HTML
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        
        // Actualizar icono y tooltip según el tema guardado
        const darkModeButton = document.querySelector('#darkmode-toggle i');
        const darkModeButtonContainer = document.querySelector('#darkmode-toggle');
        
        if (savedTheme === 'dark') {
            if (darkModeButton) {
                darkModeButton.className = 'fa fa-sun-bright';
            }
            if (darkModeButtonContainer) {
                darkModeButtonContainer.setAttribute('data-tooltip', 'Modo claro');
                darkModeButtonContainer.setAttribute('data-theme', 'dark');
            }
        } else {
            if (darkModeButton) {
                darkModeButton.className = 'fa fa-moon';
            }
            if (darkModeButtonContainer) {
                darkModeButtonContainer.setAttribute('data-tooltip', 'Modo oscuro');
                darkModeButtonContainer.setAttribute('data-theme', 'light');
            }
        }
        
        // Reinicializar tooltip si la función está disponible
        if (typeof updateDarkModeTooltip === 'function') {
            setTimeout(() => {
                updateDarkModeTooltip();
            }, 100);
        }
    }
}

// ===== LMS CREATOR — PLANES DE FORMACIÓN (vuelta con pestaña #competencias) =====

/**
 * URL para volver a planes-formacion.html respetando la última pestaña activa.
 * planes-formacion.html guarda en sessionStorage al cambiar de tab o al cargar con hash.
 * @returns {string} p. ej. "planes-formacion.html" o "planes-formacion.html#competencias"
 */
function getPlanesFormacionBackUrl() {
    try {
        var h = sessionStorage.getItem('ubits-planes-formacion-return-hash');
        if (h === '#competencias') return 'planes-formacion.html#competencias';
    } catch (e) { /* sessionStorage no disponible */ }
    return 'planes-formacion.html';
}

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
    // Cargar tema guardado
    loadSavedTheme();
    
    console.log('🚀 UBITS Playground inicializado');
});
