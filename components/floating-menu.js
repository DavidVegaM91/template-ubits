/* ========================================
   FLOATING MENU COMPONENT (MODAL)
   ======================================== */

const FLOATING_MENU_SECTIONS = [
    {
        id: 'aprendizaje',
        title: 'Aprendizaje',
        icon: 'far fa-graduation-cap',
        subitems: [
            { id: 'inicio', title: 'Inicio', icon: 'far fa-home', url: 'home-learn.html' },
            { id: 'catalogo', title: 'Catálogo', icon: 'far fa-book', url: 'catalogo.html' },
            { id: 'corporativa', title: 'U. Corporativa', icon: 'far fa-building-columns', url: 'universidad-corporativa.html' },
            { id: 'zona-estudio', title: 'Zona de estudio', icon: 'far fa-books', url: 'zona-estudio.html' }
        ]
    },
    {
        id: 'diagnostico',
        title: 'Diagnóstico',
        icon: 'far fa-chart-mixed',
        subitems: [
            { id: 'evaluaciones', title: 'Evaluaciones 360', icon: 'far fa-chart-pie', url: 'evaluaciones.html' },
            { id: 'objetivos', title: 'Objetivos', icon: 'far fa-bullseye', url: 'objetivos.html' }
        ]
    },
    {
        id: 'desempeno',
        title: 'Desempeño',
        icon: 'far fa-bars-progress',
        subitems: [
            { id: 'metricas', title: 'Métricas', icon: 'far fa-chart-line', url: 'metricas.html' },
            { id: 'reportes', title: 'Reportes', icon: 'far fa-file-chart', url: 'reportes.html' }
        ]
    },
            {
                id: 'encuestas',
                title: 'Encuestas',
                icon: 'far fa-clipboard-list-check',
                url: 'encuestas.html',
                isLink: true,
                clickable: false
            },
    {
        id: 'tareas',
        title: 'Tareas',
        icon: 'far fa-layer-group',
        subitems: [
            { id: 'planes', title: 'Planes', icon: 'far fa-calendar', url: 'planes.html' },
            { id: 'tareas', title: 'Tareas', icon: 'far fa-tasks', url: 'tareas.html' }
        ]
    },
    {
        id: 'ubits-ai',
        title: 'UBITS AI',
        icon: 'far fa-sparkles',
        url: 'ubits-ai.html',
        isLink: true,
        clickable: true
    }
];

function getFloatingMenuHTML() {
    const sectionsHTML = FLOATING_MENU_SECTIONS.map(section => {
        // Si es un enlace directo (no acordeón)
        if (section.isLink) {
            if (section.clickable) {
                return `
                    <a href="${section.url}" class="accordion-link direct-link" id="link-${section.id}">
                        <div class="accordion-icon-circle" id="circle-${section.id}">
                            <i class="${section.icon}" id="icon-${section.id}"></i>
                        </div>
                        <span class="ubits-body-md-regular">${section.title}</span>
                        <i class="far fa-chevron-right accordion-chevron"></i>
                    </a>
                `;
            } else {
                return `
                <a href="${section.url}" class="accordion-link direct-link" id="link-${section.id}">
                    <div class="accordion-icon-circle" id="circle-${section.id}">
                        <i class="${section.icon}" id="icon-${section.id}"></i>
                    </div>
                    <span class="ubits-body-md-regular">${section.title}</span>
                    <i class="far fa-chevron-right accordion-chevron"></i>
                </a>
                `;
            }
        }
        
        // Si es acordeón normal
        const subitemsHTML = section.subitems.map(subitem => `
            <a href="${subitem.url}" class="accordion-link" id="link-${subitem.id}">
                <div class="accordion-icon-circle" id="circle-${subitem.id}">
                    <i class="${subitem.icon}" id="icon-${subitem.id}"></i>
                </div>
                <span class="ubits-body-sm-regular">${subitem.title}</span>
            </a>
        `).join('');

        return `
            <div class="accordion-item">
                <div class="accordion-header" onclick="toggleAccordion('${section.id}')">
                    <div class="accordion-title">
                        <div class="accordion-icon-circle" id="circle-${section.id}">
                            <i class="${section.icon}" id="icon-${section.id}"></i>
                        </div>
                        <span class="ubits-body-md-regular">${section.title}</span>
                    </div>
                    <i class="far fa-chevron-down accordion-chevron" id="chevron-${section.id}"></i>
                </div>
                <div class="accordion-body" id="body-${section.id}">
                    ${subitemsHTML}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="floating-menu" id="floating-menu">
            <div class="floating-menu-header">
                <h2 class="floating-menu-title ubits-heading-h2">Módulos</h2>
                <button class="floating-menu-close" onclick="hideFloatingMenu()">
                    <i class="far fa-times"></i>
                </button>
            </div>
            <div class="floating-menu-content">
                ${sectionsHTML}
            </div>
        </div>
    `;
}

function loadFloatingMenu(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    container.innerHTML = getFloatingMenuHTML();
    addFloatingMenuEventListeners();
}

function addFloatingMenuEventListeners() {
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideFloatingMenu();
        }
    });

    // Cerrar al hacer click fuera del modal
    document.addEventListener('click', function(e) {
        const floatingMenu = document.getElementById('floating-menu');
        const modulosTab = document.querySelector('[data-tab="modulos"]');
        
        if (floatingMenu && floatingMenu.classList.contains('show')) {
            if (!floatingMenu.contains(e.target) && !modulosTab.contains(e.target)) {
                hideFloatingMenu();
            }
        }
    });
}

function showFloatingMenu() {
    const floatingMenu = document.getElementById('floating-menu');
    if (floatingMenu) {
        floatingMenu.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideFloatingMenu() {
    const floatingMenu = document.getElementById('floating-menu');
    if (floatingMenu) {
        floatingMenu.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function toggleAccordion(sectionId) {
    const body = document.getElementById(`body-${sectionId}`);
    const chevron = document.getElementById(`chevron-${sectionId}`);
    const circle = document.getElementById(`circle-${sectionId}`);
    const icon = document.getElementById(`icon-${sectionId}`);
    
    if (body && chevron && circle && icon) {
        if (body.style.display === 'block') {
            // Cerrar acordeón - estado default
            body.style.display = 'none';
            chevron.style.transform = 'rotate(0deg)';
            circle.classList.remove('active');
            icon.classList.remove('active');
        } else {
            // Abrir acordeón - estado activo
            body.style.display = 'block';
            chevron.style.transform = 'rotate(180deg)';
            circle.classList.add('active');
            icon.classList.add('active');
        }
    }
}

// Función para activar un accordion-link específico
function setActiveAccordionLink(linkId) {
    // Remover activo de todos los accordion-links
    document.querySelectorAll('.accordion-link .accordion-icon-circle').forEach(circle => {
        circle.classList.remove('active');
    });
    document.querySelectorAll('.accordion-link .accordion-icon-circle i').forEach(icon => {
        icon.classList.remove('active');
    });
    
    // Activar el link específico
    const circle = document.getElementById(`circle-${linkId}`);
    const icon = document.getElementById(`icon-${linkId}`);
    
    if (circle && icon) {
        circle.classList.add('active');
        icon.classList.add('active');
    }
}

// Exportar funciones al window global
window.getFloatingMenuHTML = getFloatingMenuHTML;
window.loadFloatingMenu = loadFloatingMenu;
window.showFloatingMenu = showFloatingMenu;
window.hideFloatingMenu = hideFloatingMenu;
window.toggleAccordion = toggleAccordion;
window.setActiveAccordionLink = setActiveAccordionLink;

// También exportar como funciones globales
function showFloatingMenu() {
    const floatingMenu = document.getElementById('floating-menu');
    if (floatingMenu) {
        floatingMenu.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideFloatingMenu() {
    const floatingMenu = document.getElementById('floating-menu');
    if (floatingMenu) {
        floatingMenu.classList.remove('show');
        document.body.style.overflow = '';
    }
}