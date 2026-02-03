/* ========================================
   SEGUIMIENTO - Base de datos realista
   Empresa: Decoraciones Premium S.A.S.
   Descripción: Empresa colombiana dedicada a la venta, 
   reparación e instalación de productos decorativos de lujo
   (persianas, pérgolas, toldos, papel de colgadura, 
   polarizados, grama sintética, etc.)
   ======================================== */

const EMPRESA_DATA = {
    nombre: 'Decoraciones Premium S.A.S.',
    descripcion: 'Empresa colombiana dedicada a la venta, reparación e instalación de productos decorativos de lujo.',
    empleados: 51, // 50 empleados + 1 Gerente General
    fundada: 2015
};

// ============================================
// GERENTE GENERAL (1 persona - máxima autoridad)
// ============================================
const GERENTE_GENERAL = {
    id: 'GG001',
    nombre: 'Patricia Elena Bermúdez Ríos',
    cargo: 'Gerente General',
    area: 'Gerencia General',
    genero: 'F',
    avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop',
    username: 'pateleber@fiqsha.demo'
};

// ============================================
// ÁREAS DE LA EMPRESA (7 áreas)
// ============================================
const AREAS = [
    { id: 0, nombre: 'Gerencia General', descripcion: 'Dirección estratégica y toma de decisiones' },
    { id: 1, nombre: 'Ventas', descripcion: 'Asesoría comercial y cierre de negocios' },
    { id: 2, nombre: 'Instalaciones', descripcion: 'Instalación de productos en sitio' },
    { id: 3, nombre: 'Reparaciones', descripcion: 'Servicio técnico y mantenimiento' },
    { id: 4, nombre: 'Atención al Cliente', descripcion: 'Soporte y seguimiento postventa' },
    { id: 5, nombre: 'Logística', descripcion: 'Bodega, inventarios y entregas' },
    { id: 6, nombre: 'Administración', descripcion: 'Gestión administrativa y financiera' },
    { id: 7, nombre: 'Marketing', descripcion: 'Publicidad, diseño y redes sociales' }
];

// ============================================
// JEFES DE ÁREA (7 jefes)
// ============================================
const JEFES = [
    {
        id: 'J001',
        nombre: 'Ricardo Ospina Duque',
        cargo: 'Director Comercial',
        area: 'Ventas',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
        username: 'rospid@fiqsha.demo'
    },
    {
        id: 'J002',
        nombre: 'Fernando Castro Restrepo',
        cargo: 'Jefe de Instalaciones',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        username: 'fcastr@fiqsha.demo'
    },
    {
        id: 'J003',
        nombre: 'Claudia Vargas Mendoza',
        cargo: 'Jefe de Servicio Técnico',
        area: 'Reparaciones',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
        username: 'cvargm@fiqsha.demo'
    },
    {
        id: 'J004',
        nombre: 'Andrea Suárez Gómez',
        cargo: 'Coordinadora de Atención al Cliente',
        area: 'Atención al Cliente',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        username: 'asuarg@fiqsha.demo'
    },
    {
        id: 'J005',
        nombre: 'Jorge Ramírez Torres',
        cargo: 'Jefe de Logística',
        area: 'Logística',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        username: 'jramit@fiqsha.demo'
    },
    {
        id: 'J006',
        nombre: 'Mónica Jiménez Pérez',
        cargo: 'Gerente Administrativa',
        area: 'Administración',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        username: 'mjimep@fiqsha.demo'
    },
    {
        id: 'J007',
        nombre: 'Alejandro Moreno Ruiz',
        cargo: 'Director de Marketing',
        area: 'Marketing',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        username: 'amorer@fiqsha.demo'
    }
];

// ============================================
// EMPLEADOS (51 total: 25 hombres, 26 mujeres)
// Incluye: 1 Gerente General + 7 jefes + 43 empleados
// ============================================
const EMPLEADOS = [
    // ========== GERENTE GENERAL (1) ==========
    {
        id: 'E001',
        idColaborador: '1011000001',
        nombre: GERENTE_GENERAL.nombre,
        cargo: GERENTE_GENERAL.cargo,
        area: GERENTE_GENERAL.area,
        genero: GERENTE_GENERAL.genero,
        avatar: GERENTE_GENERAL.avatar,
        jefe: null, // No tiene jefe, es la máxima autoridad
        esJefe: true,
        esGerenteGeneral: true
    },
    // ========== JEFES DE ÁREA (7) ==========
    ...JEFES.map((j, i) => ({
        id: `E${String(i + 2).padStart(3, '0')}`,
        idColaborador: `10${String(1000002 + i)}`,
        nombre: j.nombre,
        cargo: j.cargo,
        area: j.area,
        genero: j.genero,
        avatar: j.avatar,
        jefe: GERENTE_GENERAL.nombre, // Reportan a la Gerente General
        esJefe: true
    })),
    
    // ========== VENTAS (6 empleados) ==========
    {
        id: 'E009',
        idColaborador: '1011000009',
        nombre: 'Carlos Andrés García López',
        cargo: 'Asesor Comercial Senior',
        area: 'Ventas',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        jefe: 'Ricardo Ospina Duque',
        esJefe: false
    },
    {
        id: 'E010',
        idColaborador: '1011000010',
        nombre: 'Laura Valentina Rodríguez Martínez',
        cargo: 'Asesora Comercial',
        area: 'Ventas',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        jefe: 'Ricardo Ospina Duque',
        esJefe: false
    },
    {
        id: 'E011',
        idColaborador: '1011000011',
        nombre: 'Miguel Ángel Hernández Díaz',
        cargo: 'Asesor Comercial',
        area: 'Ventas',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
        jefe: 'Ricardo Ospina Duque',
        esJefe: false
    },
    {
        id: 'E011',
        idColaborador: '1011000011',
        nombre: 'Natalia Sofía Torres Sánchez',
        cargo: 'Asesora Comercial',
        area: 'Ventas',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
        jefe: 'Ricardo Ospina Duque',
        esJefe: false
    },
    {
        id: 'E012',
        idColaborador: '1011000012',
        nombre: 'Sebastián Felipe Gómez Álvarez',
        cargo: 'Ejecutivo de Cuenta Corporativa',
        area: 'Ventas',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop',
        jefe: 'Ricardo Ospina Duque',
        esJefe: false
    },
    {
        id: 'E013',
        idColaborador: '1011000013',
        nombre: 'Juliana Andrea Pérez Castro',
        cargo: 'Ejecutiva de Cuenta Corporativa',
        area: 'Ventas',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        jefe: 'Ricardo Ospina Duque',
        esJefe: false
    },
    
    // ========== INSTALACIONES (8 empleados) ==========
    {
        id: 'E014',
        idColaborador: '1011000014',
        nombre: 'Juan David López González',
        cargo: 'Técnico Instalador de Persianas',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    {
        id: 'E015',
        idColaborador: '1011000015',
        nombre: 'Diego Alejandro Martínez Romero',
        cargo: 'Técnico Instalador de Pérgolas',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    {
        id: 'E016',
        idColaborador: '1011000016',
        nombre: 'Camilo Ernesto Sánchez Vargas',
        cargo: 'Técnico Instalador de Toldos',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    {
        id: 'E017',
        idColaborador: '1011000017',
        nombre: 'Andrés Felipe Ruiz Mendoza',
        cargo: 'Técnico Instalador de Polarizados',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    {
        id: 'E018',
        idColaborador: '1011000018',
        nombre: 'Santiago José Díaz Suárez',
        cargo: 'Técnico Instalador de Grama Sintética',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    {
        id: 'E019',
        idColaborador: '1011000019',
        nombre: 'Daniel Esteban Ortiz Restrepo',
        cargo: 'Técnico Instalador de Papel de Colgadura',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    {
        id: 'E020',
        idColaborador: '1011000020',
        nombre: 'Carolina María Álvarez Torres',
        cargo: 'Coordinadora de Instalaciones',
        area: 'Instalaciones',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    {
        id: 'E021',
        idColaborador: '1011000021',
        nombre: 'Iván Mauricio Romero Jiménez',
        cargo: 'Auxiliar de Instalaciones',
        area: 'Instalaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=100&h=100&fit=crop',
        jefe: 'Fernando Castro Restrepo',
        esJefe: false
    },
    
    // ========== REPARACIONES (6 empleados) ==========
    {
        id: 'E022',
        idColaborador: '1011000022',
        nombre: 'José Luis González Pérez',
        cargo: 'Técnico de Reparación de Persianas',
        area: 'Reparaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=100&h=100&fit=crop',
        jefe: 'Claudia Vargas Mendoza',
        esJefe: false
    },
    {
        id: 'E023',
        idColaborador: '1011000023',
        nombre: 'Diana Patricia Morales Herrera',
        cargo: 'Técnica de Reparación de Cortinas',
        area: 'Reparaciones',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
        jefe: 'Claudia Vargas Mendoza',
        esJefe: false
    },
    {
        id: 'E024',
        idColaborador: '1011000024',
        nombre: 'Pablo Antonio Castro Ríos',
        cargo: 'Técnico de Reparación de Toldos',
        area: 'Reparaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop',
        jefe: 'Claudia Vargas Mendoza',
        esJefe: false
    },
    {
        id: 'E025',
        idColaborador: '1011000025',
        nombre: 'Sandra Milena Rojas Pineda',
        cargo: 'Técnica de Reparación de Pérgolas',
        area: 'Reparaciones',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop',
        jefe: 'Claudia Vargas Mendoza',
        esJefe: false
    },
    {
        id: 'E026',
        idColaborador: '1011000026',
        nombre: 'Gustavo Hernán Mejía López',
        cargo: 'Técnico Senior de Mantenimiento',
        area: 'Reparaciones',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=100&h=100&fit=crop',
        jefe: 'Claudia Vargas Mendoza',
        esJefe: false
    },
    {
        id: 'E027',
        idColaborador: '1011000027',
        nombre: 'Marcela Isabel Duque Vásquez',
        cargo: 'Coordinadora de Garantías',
        area: 'Reparaciones',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop',
        jefe: 'Claudia Vargas Mendoza',
        esJefe: false
    },
    
    // ========== ATENCIÓN AL CLIENTE (6 empleados) ==========
    {
        id: 'E028',
        idColaborador: '1011000028',
        nombre: 'Paola Andrea Hernández Gil',
        cargo: 'Agente de Servicio al Cliente',
        area: 'Atención al Cliente',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop',
        jefe: 'Andrea Suárez Gómez',
        esJefe: false
    },
    {
        id: 'E029',
        idColaborador: '1011000029',
        nombre: 'Nicolás Esteban Vargas Quintero',
        cargo: 'Agente de Servicio al Cliente',
        area: 'Atención al Cliente',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop',
        jefe: 'Andrea Suárez Gómez',
        esJefe: false
    },
    {
        id: 'E030',
        idColaborador: '1011000030',
        nombre: 'Valentina Isabel Ospina Mejía',
        cargo: 'Especialista en Seguimiento Postventa',
        area: 'Atención al Cliente',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&h=100&fit=crop',
        jefe: 'Andrea Suárez Gómez',
        esJefe: false
    },
    {
        id: 'E031',
        idColaborador: '1011000031',
        nombre: 'Óscar Eduardo Restrepo Cárdenas',
        cargo: 'Especialista en Quejas y Reclamos',
        area: 'Atención al Cliente',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop',
        jefe: 'Andrea Suárez Gómez',
        esJefe: false
    },
    {
        id: 'E032',
        idColaborador: '1011000032',
        nombre: 'Isabella Sofía Muñoz Arias',
        cargo: 'Agente de Cotizaciones',
        area: 'Atención al Cliente',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=100&h=100&fit=crop',
        jefe: 'Andrea Suárez Gómez',
        esJefe: false
    },
    {
        id: 'E033',
        idColaborador: '1011000033',
        nombre: 'Camila Andrea Cárdenas Lozano',
        cargo: 'Recepcionista',
        area: 'Atención al Cliente',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop',
        jefe: 'Andrea Suárez Gómez',
        esJefe: false
    },
    
    // ========== LOGÍSTICA (6 empleados) ==========
    {
        id: 'E034',
        idColaborador: '1011000034',
        nombre: 'Luis Fernando Giraldo Ochoa',
        cargo: 'Coordinador de Bodega',
        area: 'Logística',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop',
        jefe: 'Jorge Ramírez Torres',
        esJefe: false
    },
    {
        id: 'E035',
        idColaborador: '1011000035',
        nombre: 'Lina María Salazar Bedoya',
        cargo: 'Auxiliar de Inventarios',
        area: 'Logística',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=100&h=100&fit=crop',
        jefe: 'Jorge Ramírez Torres',
        esJefe: false
    },
    {
        id: 'E036',
        idColaborador: '1011000036',
        nombre: 'Hernán Darío Zapata Monsalve',
        cargo: 'Conductor de Entregas',
        area: 'Logística',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&h=100&fit=crop',
        jefe: 'Jorge Ramírez Torres',
        esJefe: false
    },
    {
        id: 'E037',
        idColaborador: '1011000037',
        nombre: 'Ángela Patricia Londoño Henao',
        cargo: 'Auxiliar de Despachos',
        area: 'Logística',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop',
        jefe: 'Jorge Ramírez Torres',
        esJefe: false
    },
    {
        id: 'E038',
        idColaborador: '1011000038',
        nombre: 'Eduardo José Arango Uribe',
        cargo: 'Conductor de Entregas',
        area: 'Logística',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop',
        jefe: 'Jorge Ramírez Torres',
        esJefe: false
    },
    {
        id: 'E039',
        idColaborador: '1011000039',
        nombre: 'Vanessa Alejandra Botero Ríos',
        cargo: 'Coordinadora de Rutas',
        area: 'Logística',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=100&h=100&fit=crop',
        jefe: 'Jorge Ramírez Torres',
        esJefe: false
    },
    
    // ========== ADMINISTRACIÓN (6 empleados) ==========
    {
        id: 'E040',
        idColaborador: '1011000040',
        nombre: 'Lucía Fernanda Correa Marín',
        cargo: 'Contadora',
        area: 'Administración',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=100&h=100&fit=crop',
        jefe: 'Mónica Jiménez Pérez',
        esJefe: false
    },
    {
        id: 'E041',
        idColaborador: '1011000041',
        nombre: 'Felipe Andrés Montoya Jaramillo',
        cargo: 'Auxiliar Contable',
        area: 'Administración',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=100&h=100&fit=crop',
        jefe: 'Mónica Jiménez Pérez',
        esJefe: false
    },
    {
        id: 'E042',
        idColaborador: '1011000042',
        nombre: 'Daniela Cristina Velásquez Parra',
        cargo: 'Analista de Recursos Humanos',
        area: 'Administración',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=100&h=100&fit=crop',
        jefe: 'Mónica Jiménez Pérez',
        esJefe: false
    },
    {
        id: 'E043',
        idColaborador: '1011000043',
        nombre: 'Mauricio Alberto Escobar Flórez',
        cargo: 'Analista de Compras',
        area: 'Administración',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        jefe: 'Mónica Jiménez Pérez',
        esJefe: false
    },
    {
        id: 'E044',
        idColaborador: '1011000044',
        nombre: 'Paula Alejandra Naranjo Galeano',
        cargo: 'Asistente Administrativa',
        area: 'Administración',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=100&h=100&fit=crop',
        jefe: 'Mónica Jiménez Pérez',
        esJefe: false
    },
    {
        id: 'E045',
        idColaborador: '1011000045',
        nombre: 'Catalina María Hoyos Rendón',
        cargo: 'Tesorera',
        area: 'Administración',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=100&h=100&fit=crop',
        jefe: 'Mónica Jiménez Pérez',
        esJefe: false
    },
    
    // ========== MARKETING (5 empleados) ==========
    {
        id: 'E046',
        idColaborador: '1011000046',
        nombre: 'Alejandra María Saldarriaga Tobón',
        cargo: 'Diseñadora Gráfica',
        area: 'Marketing',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1617727553252-65863c156eb0?w=100&h=100&fit=crop',
        jefe: 'Alejandro Moreno Ruiz',
        esJefe: false
    },
    {
        id: 'E047',
        idColaborador: '1011000047',
        nombre: 'David Santiago Gutiérrez Ossa',
        cargo: 'Community Manager',
        area: 'Marketing',
        genero: 'M',
        avatar: null, // Usuario sin imagen - mostrará icono de user
        jefe: 'Alejandro Moreno Ruiz',
        esJefe: false
    },
    {
        id: 'E048',
        idColaborador: '1011000048',
        nombre: 'Sara Valentina Castaño Sierra',
        cargo: 'Fotógrafa de Producto',
        area: 'Marketing',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1508243771214-6e95d137426b?w=100&h=100&fit=crop',
        jefe: 'Alejandro Moreno Ruiz',
        esJefe: false
    },
    {
        id: 'E049',
        idColaborador: '1011000049',
        nombre: 'Mateo José Gómez Cardona',
        cargo: 'Especialista en Pauta Digital',
        area: 'Marketing',
        genero: 'M',
        avatar: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=100&h=100&fit=crop',
        jefe: 'Alejandro Moreno Ruiz',
        esJefe: false
    },
    {
        id: 'E050',
        idColaborador: '1011000050',
        nombre: 'María José Aristizábal Correa',
        cargo: 'Analista de Contenidos',
        area: 'Marketing',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
        jefe: 'Alejandro Moreno Ruiz',
        esJefe: false
    }
];

// ============================================
// PLANES DE FORMACIÓN POR ÁREA
// ============================================
const PLANES_POR_AREA = {
    'Gerencia General': [
        { nombre: 'Liderazgo Estratégico Empresarial', descripcion: 'Desarrollo de competencias directivas de alto nivel' },
        { nombre: 'Transformación Digital Organizacional', descripcion: 'Implementación de estrategias de innovación digital' },
        { nombre: 'Gestión del Talento y Cultura Organizacional', descripcion: 'Fortalecimiento del capital humano' }
    ],
    'Ventas': [
        { nombre: 'Técnicas de Venta Consultiva', descripcion: 'Formación en metodologías de venta profesional' },
        { nombre: 'Conocimiento de Productos Decorativos', descripcion: 'Dominio técnico del catálogo de productos' },
        { nombre: 'Negociación y Cierre de Ventas', descripcion: 'Estrategias para cerrar negocios efectivamente' }
    ],
    'Instalaciones': [
        { nombre: 'Certificación Técnica en Instalaciones', descripcion: 'Programa de certificación para instaladores' },
        { nombre: 'Seguridad Industrial y Trabajo en Alturas', descripcion: 'Normativas de seguridad laboral' },
        { nombre: 'Nuevas Técnicas de Instalación 2025', descripcion: 'Actualización en métodos de instalación' }
    ],
    'Reparaciones': [
        { nombre: 'Diagnóstico y Solución de Fallas', descripcion: 'Metodología para identificar y reparar problemas' },
        { nombre: 'Mantenimiento Preventivo', descripcion: 'Protocolos de mantenimiento programado' },
        { nombre: 'Gestión de Garantías', descripcion: 'Procedimientos para atención de garantías' }
    ],
    'Atención al Cliente': [
        { nombre: 'Excelencia en Servicio al Cliente', descripcion: 'Formación en atención de clase mundial' },
        { nombre: 'Manejo de Objeciones y Quejas', descripcion: 'Técnicas para resolver conflictos' },
        { nombre: 'Comunicación Efectiva', descripcion: 'Habilidades de comunicación verbal y escrita' }
    ],
    'Logística': [
        { nombre: 'Gestión de Inventarios', descripcion: 'Control y optimización de inventarios' },
        { nombre: 'Logística de Última Milla', descripcion: 'Eficiencia en entregas y rutas' },
        { nombre: 'Manejo Seguro de Cargas', descripcion: 'Protocolos para manipulación de productos' }
    ],
    'Administración': [
        { nombre: 'Excel Avanzado y Herramientas Digitales', descripcion: 'Dominio de herramientas ofimáticas' },
        { nombre: 'Gestión Financiera Básica', descripcion: 'Fundamentos de finanzas empresariales' },
        { nombre: 'Normativa Tributaria Actualizada', descripcion: 'Actualización en temas fiscales' }
    ],
    'Marketing': [
        { nombre: 'Marketing Digital y Redes Sociales', descripcion: 'Estrategias de marketing en plataformas digitales' },
        { nombre: 'Fotografía y Edición de Producto', descripcion: 'Técnicas de fotografía comercial' },
        { nombre: 'Copywriting y Contenidos', descripcion: 'Redacción persuasiva para ventas' }
    ]
};

// ============================================
// TAREAS ESPECÍFICAS POR CARGO
// Todas las tareas inician con verbos de acción
// ============================================
const TAREAS_POR_CARGO = {
    // GERENCIA GENERAL
    'Gerente General': [
        'Revisar y aprobar presupuesto anual de la compañía',
        'Liderar reunión mensual de comité directivo con jefes de área',
        'Evaluar indicadores clave de desempeño (KPIs) del mes',
        'Aprobar plan estratégico comercial del primer trimestre',
        'Revisar estados financieros y proyecciones de cierre',
        'Completar curso de liderazgo ejecutivo certificado',
        'Participar en taller de transformación digital para CEOs',
        'Definir objetivos estratégicos del año para cada área',
        'Aprobar contrataciones clave para expansión de operaciones',
        'Presentar resultados trimestrales a junta de socios'
    ],
    // VENTAS
    'Asesor Comercial Senior': [
        'Estudiar el perfil del cliente ideal para productos decorativos',
        'Practicar técnicas de levantamiento de necesidades con clientes',
        'Preparar presentación de soluciones personalizadas',
        'Dominar el catálogo digital de persianas y cortinas',
        'Realizar 3 cotizaciones completas con cierre de venta',
        'Presentar evaluación práctica: simulación de venta completa',
        'Asistir al taller de argumentario para pérgolas premium',
        'Completar curso de fidelización de clientes corporativos',
        'Obtener certificación como asesor experto en toldos',
        'Ejecutar visita comercial supervisada por el director'
    ],
    'Asesora Comercial': [
        'Revisar el portafolio completo de productos decorativos',
        'Aplicar técnicas de prospección en 5 clientes nuevos',
        'Registrar 10 oportunidades en el CRM correctamente',
        'Practicar medición básica para elaborar cotizaciones',
        'Memorizar las políticas de precios y descuentos vigentes',
        'Presentar evaluación de conocimiento de productos',
        'Asistir al taller de atención al cliente en punto de venta',
        'Completar curso de comunicación persuasiva',
        'Elaborar propuesta comercial para cliente real',
        'Obtener certificación como asesora de productos de lujo'
    ],
    'Asesor Comercial': [
        'Revisar el portafolio completo de productos decorativos',
        'Aplicar técnicas de prospección en 5 clientes nuevos',
        'Registrar 10 oportunidades en el CRM correctamente',
        'Practicar medición básica para elaborar cotizaciones',
        'Memorizar las políticas de precios y descuentos vigentes',
        'Presentar evaluación de conocimiento de productos',
        'Asistir al taller de atención al cliente en punto de venta',
        'Completar curso de comunicación persuasiva',
        'Elaborar propuesta comercial para cliente real',
        'Obtener certificación como asesor de productos de lujo'
    ],
    'Ejecutivo de Cuenta Corporativa': [
        'Analizar las 5 cuentas empresariales más importantes',
        'Practicar técnicas de negociación con gerentes de compras',
        'Elaborar propuesta para proyecto corporativo de más de $50M',
        'Coordinar instalación masiva en cliente corporativo',
        'Documentar seguimiento de 3 contratos corporativos activos',
        'Asistir al taller de presentaciones ejecutivas efectivas',
        'Completar curso de licitaciones y contratación pública',
        'Resolver caso práctico de cuenta corporativa',
        'Obtener certificación como ejecutivo de grandes cuentas',
        'Liderar negociación de contrato anual con cliente clave'
    ],
    'Ejecutiva de Cuenta Corporativa': [
        'Analizar las 5 cuentas empresariales más importantes',
        'Practicar técnicas de negociación con gerentes de compras',
        'Elaborar propuesta para proyecto corporativo de más de $50M',
        'Coordinar instalación masiva en cliente corporativo',
        'Documentar seguimiento de 3 contratos corporativos activos',
        'Asistir al taller de presentaciones ejecutivas efectivas',
        'Completar curso de licitaciones y contratación pública',
        'Resolver caso práctico de cuenta corporativa',
        'Obtener certificación como ejecutiva de grandes cuentas',
        'Liderar negociación de contrato anual con cliente clave'
    ],
    
    // INSTALACIONES
    'Técnico Instalador de Persianas': [
        'Identificar los 8 tipos de persianas y sus mecanismos',
        'Realizar medición precisa en 5 ventanas diferentes',
        'Instalar persiana enrollable bajo supervisión',
        'Instalar persiana vertical en oficina del showroom',
        'Calibrar motor de persiana automatizada correctamente',
        'Presentar evaluación práctica de instalación completa',
        'Asistir al taller de solución de problemas comunes',
        'Obtener certificación como instalador autorizado nivel 1',
        'Completar curso de persianas automatizadas y domótica',
        'Ejecutar instalación en proyecto real de cliente'
    ],
    'Técnico Instalador de Pérgolas': [
        'Diferenciar tipos de pérgolas: madera, aluminio, bioclimáticas',
        'Calcular estructura básica para pérgola de 4x3 metros',
        'Preparar terreno y anclar bases para pérgola residencial',
        'Ensamblar y montar estructura de pérgola aluminio',
        'Instalar cubierta y realizar acabados finales',
        'Presentar evaluación de instalación de pérgola completa',
        'Asistir al taller de trabajo seguro en alturas',
        'Obtener certificación como instalador de pérgolas bioclimáticas',
        'Completar curso de impermeabilización y drenaje',
        'Ejecutar proyecto de pérgola residencial de inicio a fin'
    ],
    'Técnico Instalador de Toldos': [
        'Identificar los tipos de toldos y materiales disponibles',
        'Medir y diseñar toldo para terraza de 6 metros',
        'Instalar brazos extensibles siguiendo el manual técnico',
        'Tensar y ajustar lona correctamente sin arrugas',
        'Motorizar toldo retráctil y programar control remoto',
        'Presentar evaluación de instalación de toldo completo',
        'Asistir al taller de mantenimiento de mecanismos',
        'Obtener certificación como instalador de toldos motorizados',
        'Completar curso de toldos para exteriores comerciales',
        'Ejecutar instalación en fachada comercial real'
    ],
    'Técnico Instalador de Polarizados': [
        'Estudiar los tipos de películas de control solar disponibles',
        'Preparar y limpiar superficie de vidrio correctamente',
        'Cortar y aplicar película en ventana de 1.5x1.2 metros',
        'Eliminar burbujas y defectos de aplicación',
        'Instalar película de seguridad en puerta de vidrio',
        'Presentar evaluación de polarizado de ventana completa',
        'Asistir al taller de polarizado de vidrios curvos',
        'Obtener certificación como instalador de películas 3M',
        'Completar curso de películas decorativas y esmeriladas',
        'Ejecutar proyecto de polarizado en edificio comercial'
    ],
    'Técnico Instalador de Grama Sintética': [
        'Conocer los tipos de grama sintética y sus aplicaciones',
        'Preparar terreno base nivelado de 20m²',
        'Instalar malla antihierba en área preparada',
        'Cortar y unir rollos de grama sin costuras visibles',
        'Realizar relleno de arena y cepillado final',
        'Presentar evaluación de instalación en área de 20m²',
        'Asistir al taller de grama para canchas deportivas',
        'Obtener certificación como instalador de césped artificial',
        'Completar curso de drenaje y mantenimiento',
        'Ejecutar proyecto de jardín residencial completo'
    ],
    'Técnico Instalador de Papel de Colgadura': [
        'Identificar tipos de papeles y vinilos decorativos',
        'Preparar pared con resanes y base adecuada',
        'Aplicar papel sin burbujas en pared de 3x2.5 metros',
        'Cortar y empalmar patrones de diseño correctamente',
        'Realizar acabados y sellado en bordes y esquinas',
        'Presentar evaluación de empapelado de habitación',
        'Asistir al taller de instalación de murales fotográficos',
        'Obtener certificación como instalador de papeles premium',
        'Completar curso de vinilos texturizados 3D',
        'Ejecutar proyecto de decoración integral en cliente'
    ],
    'Coordinadora de Instalaciones': [
        'Planificar rutas de instalación para la semana',
        'Asignar técnicos a 10 proyectos según especialidad',
        'Controlar tiempos y materiales de 5 instalaciones',
        'Llamar a 10 clientes para confirmar citas de instalación',
        'Resolver 3 imprevistos en obra durante la semana',
        'Asistir al taller de liderazgo de equipos técnicos',
        'Completar curso de Excel para programación de obras',
        'Presentar evaluación de coordinación de proyecto múltiple',
        'Obtener certificación como coordinador de operaciones',
        'Gestionar semana completa de instalaciones sin retrasos'
    ],
    'Auxiliar de Instalaciones': [
        'Cargar y descargar materiales en 5 instalaciones',
        'Identificar y usar herramientas básicas correctamente',
        'Preparar espacio de trabajo antes de cada instalación',
        'Realizar limpieza post-instalación en 10 proyectos',
        'Aplicar normas de seguridad en todas las instalaciones',
        'Asistir al taller de manejo seguro de escaleras',
        'Completar curso de primeros auxilios básicos',
        'Presentar evaluación de asistencia en instalación completa',
        'Obtener certificación como auxiliar de instalaciones nivel 1',
        'Apoyar en 10 instalaciones diferentes sin errores'
    ],
    
    // REPARACIONES
    'Técnico de Reparación de Persianas': [
        'Diagnosticar fallas en 5 persianas con diferentes problemas',
        'Reparar mecanismo de cadena en persiana vertical',
        'Cambiar motor y sensores de persiana motorizada',
        'Reemplazar láminas dañadas en persiana horizontal',
        'Lubricar y dar mantenimiento preventivo a 10 persianas',
        'Presentar evaluación de reparación de 5 fallas comunes',
        'Asistir al taller de actualización de persianas antiguas',
        'Obtener certificación como técnico de servicio autorizado',
        'Completar curso de programación de motores Somfy',
        'Atender 20 servicios de garantía satisfactoriamente'
    ],
    'Técnica de Reparación de Cortinas': [
        'Identificar componentes de los 6 tipos de cortinas',
        'Reparar riel y soportes de cortina de sala',
        'Ajustar pliegues y caídas de cortina de tela',
        'Cambiar tela y forro de cortina deteriorada',
        'Dar mantenimiento a cortina motorizada marca Hunter',
        'Presentar evaluación de reparación integral de cortina',
        'Asistir al taller de restauración de cortinas antiguas',
        'Obtener certificación como técnica especializada en cortinas',
        'Completar curso de cortinas automatizadas',
        'Completar 15 servicios de reparación satisfactoriamente'
    ],
    'Técnico de Reparación de Toldos': [
        'Diagnosticar 5 fallas comunes en toldos retráctiles',
        'Reparar brazos extensibles de toldo de terraza',
        'Cambiar lona deteriorada de toldo de 4 metros',
        'Ajustar tensión y alineación de toldo comercial',
        'Reparar motor y control de toldo motorizado',
        'Presentar evaluación de reparación de toldo completo',
        'Asistir al taller de impermeabilización de lonas',
        'Obtener certificación como técnico de toldos senior',
        'Completar curso de toldos comerciales de gran formato',
        'Atender garantías corporativas de 3 clientes empresariales'
    ],
    'Técnica de Reparación de Pérgolas': [
        'Inspeccionar estructura de 5 pérgolas en campo',
        'Reparar poste dañado de pérgola de madera',
        'Cambiar lamas bioclimáticas defectuosas',
        'Sellar y proteger estructura contra humedad',
        'Dar mantenimiento a sistema de drenaje de pérgola',
        'Presentar evaluación de restauración de pérgola',
        'Asistir al taller de pintura y acabados de madera',
        'Obtener certificación como técnica en pérgolas premium',
        'Completar curso de sistemas bioclimáticos avanzados',
        'Ejecutar 10 proyectos de mantenimiento sin retrabajos'
    ],
    'Técnico Senior de Mantenimiento': [
        'Realizar diagnóstico avanzado en 5 casos complejos',
        'Resolver 3 casos críticos que otros técnicos no pudieron',
        'Capacitar a 2 técnicos junior en técnicas de reparación',
        'Elaborar 5 informes técnicos detallados para gerencia',
        'Coordinar con 3 proveedores técnicos para repuestos',
        'Asistir al taller de resolución de casos críticos',
        'Completar curso de nuevas tecnologías en decoración',
        'Presentar evaluación de mentoría a técnico nuevo',
        'Obtener certificación como técnico master',
        'Liderar proyecto de mantenimiento preventivo anual'
    ],
    'Coordinadora de Garantías': [
        'Estudiar las políticas de garantía de todos los productos',
        'Clasificar 20 reclamos según tipo y gravedad',
        'Coordinar con 3 proveedores la reposición de productos',
        'Actualizar seguimiento de 15 casos abiertos en sistema',
        'Generar reporte mensual de garantías para gerencia',
        'Asistir al taller de negociación con clientes insatisfechos',
        'Completar curso de marco legal de garantías en Colombia',
        'Resolver caso de garantía complejo con cliente VIP',
        'Obtener certificación como especialista en postventa',
        'Cerrar 50 casos de garantía con satisfacción del cliente'
    ],
    
    // ATENCIÓN AL CLIENTE
    'Agente de Servicio al Cliente': [
        'Memorizar protocolo de atención telefónica de la empresa',
        'Registrar 20 tickets correctamente en el sistema',
        'Resolver 15 consultas frecuentes sin escalar',
        'Escalar 5 casos complejos siguiendo el protocolo',
        'Registrar información de 30 clientes en el CRM',
        'Presentar evaluación de simulación de llamadas',
        'Asistir al taller de control de emociones en llamadas difíciles',
        'Obtener certificación como agente de servicio nivel 1',
        'Completar curso de WhatsApp Business para atención',
        'Atender 100 llamadas con calificación satisfactoria'
    ],
    'Especialista en Seguimiento Postventa': [
        'Enviar encuesta de satisfacción a 50 clientes',
        'Realizar llamadas de seguimiento a 20 instalaciones recientes',
        'Identificar 5 oportunidades de venta cruzada con clientes',
        'Inscribir 10 clientes en el programa de referidos',
        'Contactar 15 clientes VIP para programa de fidelización',
        'Asistir al taller de técnicas de upselling',
        'Completar curso de NPS y métricas de satisfacción',
        'Ejecutar campaña de seguimiento completa de 100 clientes',
        'Obtener certificación como especialista en experiencia del cliente',
        'Recuperar 20 clientes inactivos de más de 6 meses'
    ],
    'Especialista en Quejas y Reclamos': [
        'Clasificar 30 quejas y reclamos por tipología',
        'Responder 20 casos siguiendo protocolos de gravedad',
        'Documentar 15 casos con toda la información requerida',
        'Aplicar 5 compensaciones siguiendo políticas de la empresa',
        'Prevenir 3 escalamientos legales con solución oportuna',
        'Asistir al taller de manejo de clientes agresivos',
        'Completar curso de resolución de conflictos',
        'Resolver caso crítico de cliente importante',
        'Obtener certificación como especialista PQRS',
        'Cerrar 30 casos con satisfacción del cliente'
    ],
    'Agente de Cotizaciones': [
        'Dominar el sistema de cotizaciones de la empresa',
        'Calcular precios correctos para 30 productos diferentes',
        'Aplicar descuentos autorizados en 10 cotizaciones',
        'Dar seguimiento a 20 cotizaciones pendientes',
        'Convertir 5 cotizaciones en pedidos confirmados',
        'Asistir al taller de cotizaciones para proyectos grandes',
        'Completar curso de Excel para presupuestos',
        'Elaborar 50 cotizaciones sin errores de cálculo',
        'Obtener certificación como agente de cotizaciones',
        'Atender stand en feria comercial del sector'
    ],
    'Recepcionista': [
        'Aplicar protocolo de atención presencial con 20 visitantes',
        'Gestionar agenda y confirmar 30 citas de la semana',
        'Direccionar 50 llamadas a las áreas correctas',
        'Atender 15 visitantes y proveedores profesionalmente',
        'Organizar correspondencia entrante y saliente del día',
        'Asistir al taller de imagen profesional',
        'Completar curso de etiqueta empresarial',
        'Presentar evaluación de simulación de recepción',
        'Obtener certificación como recepcionista profesional',
        'Mantener recepción impecable durante 1 mes completo'
    ],
    
    // LOGÍSTICA
    'Coordinador de Bodega': [
        'Organizar almacén por familias de productos',
        'Implementar control FIFO en productos perecederos',
        'Recibir y verificar 10 pedidos de mercancía',
        'Despachar 25 pedidos diarios sin errores',
        'Realizar inventario cíclico semanal de una sección',
        'Asistir al taller de optimización de espacios',
        'Completar curso de WMS básico',
        'Presentar conciliación de inventario físico vs sistema',
        'Obtener certificación como coordinador de almacén',
        'Ejecutar reorganización completa de bodega'
    ],
    'Auxiliar de Inventarios': [
        'Contar productos de una sección completa de bodega',
        'Registrar 100 movimientos en sistema de inventarios',
        'Etiquetar 50 productos nuevos correctamente',
        'Reportar diferencias encontradas en conteos',
        'Ubicar 30 productos en estantería según planograma',
        'Asistir al taller de Excel para control de inventarios',
        'Completar curso de manejo de códigos de barras',
        'Presentar evaluación de inventario de sección completa',
        'Obtener certificación como auxiliar de inventarios nivel 1',
        'Participar en conteo de inventario trimestral'
    ],
    'Conductor de Entregas': [
        'Planificar ruta diaria de 8 entregas eficientemente',
        'Cargar vehículo de forma segura sin dañar productos',
        'Documentar 100% de entregas con firma del cliente',
        'Aplicar técnicas de manejo defensivo en ruta',
        'Atender cliente en entrega con actitud de servicio',
        'Asistir al taller de primeros auxilios en carretera',
        'Completar curso de mantenimiento básico de vehículos',
        'Realizar 50 entregas consecutivas sin novedades',
        'Obtener certificación como conductor profesional',
        'Dominar rutas de Bogotá y municipios cercanos'
    ],
    'Auxiliar de Despachos': [
        'Preparar 15 pedidos diarios correctamente',
        'Embalar productos frágiles sin riesgo de daño',
        'Documentar despachos con guías y remisiones',
        'Coordinar recogida con 3 transportadoras diferentes',
        'Registrar trazabilidad de 20 envíos en sistema',
        'Asistir al taller de embalaje de pérgolas y toldos',
        'Completar curso de logística de última milla',
        'Despachar 30 pedidos diarios sin errores',
        'Obtener certificación como auxiliar de despachos nivel 1',
        'Gestionar despachos nacionales a 5 ciudades'
    ],
    'Coordinadora de Rutas': [
        'Diseñar rutas eficientes para 5 conductores',
        'Asignar vehículos y conductores según carga',
        'Monitorear flota por GPS durante jornada completa',
        'Resolver 3 imprevistos de ruta durante la semana',
        'Generar reporte de indicadores de cumplimiento',
        'Asistir al taller de Google Maps para logística',
        'Completar curso de gestión de flotas',
        'Presentar planificación semanal de rutas optimizadas',
        'Obtener certificación como coordinadora de transporte',
        'Optimizar ruta existente reduciendo 15% de tiempo'
    ],
    
    // ADMINISTRACIÓN
    'Contadora': [
        'Actualizar conocimientos en normas NIIF vigentes',
        'Ejecutar cierre contable del mes de enero',
        'Preparar declaración de IVA bimestral',
        'Realizar auditoría interna de gastos del trimestre',
        'Presentar informes financieros a gerencia general',
        'Asistir al taller de software contable actualizado',
        'Completar curso de reforma tributaria 2025',
        'Ejecutar cierre fiscal del año anterior',
        'Renovar certificación como contador público actualizado',
        'Presentar estados financieros a junta directiva'
    ],
    'Auxiliar Contable': [
        'Registrar 50 facturas de compra en sistema contable',
        'Realizar conciliación bancaria de 3 cuentas',
        'Causar nómina quincenal de 50 empleados',
        'Archivar documentos contables del mes',
        'Apoyar en preparación de declaraciones tributarias',
        'Asistir al taller de Excel para contabilidad',
        'Completar curso de facturación electrónica',
        'Presentar conciliación bancaria mensual sin diferencias',
        'Obtener certificación como auxiliar contable nivel 1',
        'Apoyar en cierre mensual bajo supervisión'
    ],
    'Analista de Recursos Humanos': [
        'Ejecutar proceso de selección para 2 vacantes',
        'Liquidar nómina quincenal y novedades',
        'Organizar actividad de bienestar para el equipo',
        'Aplicar evaluación de desempeño a 10 empleados',
        'Coordinar capacitación técnica para instaladores',
        'Asistir al taller de entrevistas por competencias',
        'Completar curso de legislación laboral colombiana',
        'Ejecutar proceso de selección completo exitosamente',
        'Obtener certificación como analista de RRHH',
        'Implementar plan de bienestar trimestral'
    ],
    'Analista de Compras': [
        'Evaluar 5 proveedores actuales por desempeño',
        'Negociar mejores precios con proveedor de telas',
        'Generar 20 órdenes de compra sin errores',
        'Coordinar importación de motores desde China',
        'Calificar 3 proveedores nuevos según criterios',
        'Asistir al taller de negociación efectiva',
        'Completar curso de comercio internacional básico',
        'Cerrar negociación exitosa con proveedor nuevo',
        'Obtener certificación como analista de compras',
        'Lograr reducción de costos del 5% en categoría'
    ],
    'Asistente Administrativa': [
        'Gestionar agenda de gerencia para la semana',
        'Elaborar 10 documentos y cartas oficiales',
        'Organizar reunión mensual de directivos',
        'Archivar documentos del mes según sistema',
        'Atender 5 proveedores y gestionar sus requerimientos',
        'Asistir al taller de Microsoft Office avanzado',
        'Completar curso de redacción empresarial',
        'Organizar evento corporativo de fin de mes',
        'Obtener certificación como asistente ejecutiva',
        'Gestionar agenda de gerencia impecablemente por 1 mes'
    ],
    'Tesorera': [
        'Elaborar flujo de caja proyectado del mes',
        'Programar y ejecutar pagos a 30 proveedores',
        'Gestionar recaudo de cartera vencida mayor a 30 días',
        'Conciliar 5 cuentas bancarias de la empresa',
        'Gestionar relación con 2 bancos para líneas de crédito',
        'Asistir al taller de gestión de tesorería',
        'Completar curso de prevención de fraude',
        'Ejecutar cierre de tesorería mensual sin diferencias',
        'Obtener certificación como tesorera certificada',
        'Elaborar proyección de flujo de caja trimestral'
    ],
    
    // MARKETING
    'Diseñadora Gráfica': [
        'Aplicar manual de identidad visual en todas las piezas',
        'Diseñar 5 páginas del catálogo de productos 2026',
        'Crear 15 piezas para redes sociales del mes',
        'Diseñar material POP para punto de venta',
        'Proponer diseño de empaque para nueva línea',
        'Asistir al taller de Adobe Creative Suite avanzado',
        'Completar curso de tendencias de diseño 2025',
        'Entregar campaña visual completa para temporada',
        'Obtener certificación como diseñadora gráfica digital',
        'Ejecutar rediseño completo del catálogo anual'
    ],
    'Community Manager': [
        'Definir estrategia de redes sociales del trimestre',
        'Crear calendario de contenidos para enero',
        'Responder 100% de comentarios y mensajes en 24 horas',
        'Gestionar comunidad activa en Instagram y Facebook',
        'Analizar métricas y presentar informe semanal',
        'Asistir al taller de herramientas de programación',
        'Completar curso de tendencias en redes sociales 2026',
        'Ejecutar campaña de engagement con meta de 5% interacción',
        'Obtener certificación como Community Manager profesional',
        'Lograr crecimiento de seguidores del 20% en el mes'
    ],
    'Fotógrafa de Producto': [
        'Fotografiar 20 productos nuevos con técnica profesional',
        'Montar iluminación de estudio para sesión de pérgolas',
        'Realizar sesión fotográfica de 3 espacios decorados',
        'Editar 50 fotografías en Lightroom con estilo de marca',
        'Organizar banco de imágenes por categoría de producto',
        'Asistir al taller de fotografía con smartphone profesional',
        'Completar curso de fotografía 360° de productos',
        'Entregar sesión fotográfica completa de nueva colección',
        'Obtener certificación como fotógrafa comercial',
        'Producir catálogo fotográfico de temporada verano'
    ],
    'Especialista en Pauta Digital': [
        'Crear campaña de Google Ads para persianas motorizadas',
        'Configurar campaña de Facebook Ads con segmentación',
        'Optimizar segmentación de audiencias en campañas activas',
        'Mejorar rendimiento de 3 campañas con bajo CTR',
        'Generar reporte de ROI de campañas del mes',
        'Asistir al taller de A/B testing en anuncios',
        'Completar curso de remarketing y retargeting',
        'Lograr campaña con ROI positivo mayor al 300%',
        'Obtener certificación de Google Ads',
        'Gestionar presupuesto mensual de $5M en pauta'
    ],
    'Analista de Contenidos': [
        'Definir estrategia de contenidos del trimestre',
        'Optimizar SEO de 10 páginas del sitio web',
        'Redactar 4 artículos de blog sobre decoración',
        'Crear campaña de email marketing para base de datos',
        'Escribir copy persuasivo para 5 landing pages',
        'Asistir al taller de WordPress para blog corporativo',
        'Completar curso de storytelling de marca',
        'Entregar plan de contenidos trimestral aprobado',
        'Obtener certificación como Content Strategist',
        'Publicar 20 artículos de blog optimizados para SEO'
    ],
    
    // JEFES (tareas de liderazgo)
    'Director Comercial': [
        'Elaborar planeación estratégica comercial del trimestre',
        'Realizar reunión semanal de seguimiento con equipo de ventas',
        'Analizar mercado y competencia para definir estrategia',
        'Presentar presupuesto y forecast de ventas a gerencia',
        'Cerrar negociación con 2 clientes estratégicos',
        'Asistir al taller de liderazgo de equipos de alto rendimiento',
        'Completar curso de estrategia comercial B2B',
        'Presentar plan comercial anual a junta directiva',
        'Renovar certificación como director comercial',
        'Liderar apertura de nuevo canal de ventas en región'
    ],
    'Jefe de Instalaciones': [
        'Coordinar reunión semanal con equipo de 8 técnicos',
        'Planificar capacidad instalada para cumplir demanda',
        'Implementar control de calidad en 20 instalaciones',
        'Verificar cumplimiento de normas de seguridad industrial',
        'Gestionar 2 subcontratistas para proyectos especiales',
        'Asistir al taller de resolución de conflictos en obra',
        'Completar curso de Lean Manufacturing',
        'Lograr mejora del 15% en tiempos de instalación',
        'Obtener certificación como jefe de operaciones',
        'Implementar nuevo proceso de instalación de pérgolas'
    ],
    'Jefe de Servicio Técnico': [
        'Gestionar operación de servicio postventa del mes',
        'Definir y monitorear KPIs de servicio técnico',
        'Coordinar abastecimiento de repuestos con compras',
        'Capacitar a 3 técnicos en nuevos productos',
        'Negociar con proveedores técnicos mejores condiciones',
        'Asistir al taller de mejora continua en servicios',
        'Completar curso de gestión de garantías',
        'Lograr reducción del 20% en tiempos de respuesta',
        'Obtener certificación como gerente de servicio',
        'Implementar programa de fidelización para clientes VIP'
    ],
    'Coordinadora de Atención al Cliente': [
        'Diseñar mapa de experiencia del cliente actualizado',
        'Coordinar equipo de 6 agentes de servicio',
        'Analizar métricas de satisfacción semanalmente',
        'Actualizar protocolos de atención del área',
        'Gestionar situación de crisis con cliente importante',
        'Asistir al taller de Customer Experience Management',
        'Completar curso de NPS y Voice of Customer',
        'Lograr mejora de 10 puntos en NPS del trimestre',
        'Obtener certificación como Customer Experience Manager',
        'Rediseñar journey del cliente para mejorar experiencia'
    ],
    'Jefe de Logística': [
        'Optimizar cadena de suministro reduciendo lead times',
        'Gestionar flota de 3 vehículos y 4 conductores',
        'Controlar inventarios manteniendo rotación óptima',
        'Negociar tarifas con 2 transportadoras nacionales',
        'Presentar indicadores logísticos mensuales a gerencia',
        'Asistir al taller de Lean Logistics',
        'Completar curso de Supply Chain Management',
        'Lograr reducción del 10% en costos logísticos',
        'Obtener certificación como Supply Chain Manager',
        'Implementar nuevo sistema WMS en bodega'
    ],
    'Gerente Administrativa': [
        'Supervisar gestión financiera de la empresa',
        'Coordinar con RRHH temas de nómina y bienestar',
        'Verificar cumplimiento legal y normativo de la empresa',
        'Elaborar planeación presupuestal del año',
        'Implementar controles internos en áreas administrativas',
        'Asistir al taller de liderazgo administrativo',
        'Completar curso de gobierno corporativo',
        'Ejecutar cierre administrativo anual exitosamente',
        'Renovar certificación como gerente administrativa',
        'Liderar implementación de nuevo sistema ERP'
    ],
    'Director de Marketing': [
        'Definir estrategia de marca para el año',
        'Presentar plan de marketing digital a gerencia',
        'Administrar presupuesto de marketing de $50M mensuales',
        'Liderar equipo creativo de 5 personas',
        'Medir y reportar ROI de todas las campañas',
        'Asistir al taller de marketing de contenidos',
        'Completar curso de Growth Marketing',
        'Ejecutar campaña anual de posicionamiento de marca',
        'Obtener certificación como director de marketing digital',
        'Liderar lanzamiento de nueva línea de productos'
    ]
};

// ============================================
// ESTADOS Y PRIORIDADES
// ============================================
const ESTADOS = ['Iniciada', 'Vencida', 'Finalizada'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];

// ============================================
// FUNCIÓN PARA GENERAR FECHAS
// ============================================
function formatearFecha(fecha) {
    const dia = fecha.getDate();
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    // Formato: "1 ene 2026 08:00"
    return `${dia} ${mes} ${anio} ${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

// ============================================
// FUNCIÓN PARA GENERAR AVANCE DE PLANES
// Los planes tienen avances variables: 0%, 10%, 20%, 30%, etc.
// ============================================
function generarAvancePlan(fechaFin, estado, fechaHoy) {
    if (estado === 'Finalizada') {
        return 100;
    }
    
    // Si ya venció (estado Vencida)
    if (fechaFin < fechaHoy) {
        // Vencida: avances típicos incompletos (40%, 50%, 60%, 70%, 80%)
        const avancesPosibles = [40, 50, 60, 70, 80];
        return avancesPosibles[Math.floor(Math.random() * avancesPosibles.length)];
    }
    
    // Si aún no vence, calcular avance proporcional basado en tareas completadas
    // Asumimos que el plan tiene 5 tareas y calculamos cuántas deberían estar completas
    const inicioMes = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1);
    const diasTranscurridos = Math.floor((fechaHoy - inicioMes) / (1000 * 60 * 60 * 24));
    const diasTotales = Math.floor((fechaFin - inicioMes) / (1000 * 60 * 60 * 24));
    
    if (diasTotales <= 0) return 0;
    
    // Avance en múltiplos de 20 (cada tarea = 20%)
    const avanceEsperado = Math.floor((diasTranscurridos / diasTotales) * 100);
    const avanceRedondeado = Math.round(avanceEsperado / 20) * 20;
    
    return Math.max(0, Math.min(80, avanceRedondeado));
}

// ============================================
// FUNCIÓN PARA GENERAR AVANCE DE TAREAS
// Las tareas son binarias: 0% (no hecha) o 100% (completada)
// ============================================
function generarAvanceTarea(estado) {
    if (estado === 'Finalizada') {
        return 100;
    }
    // Iniciada o Vencida = 0% (no se ha completado aún)
    return 0;
}

// ============================================
// DETERMINAR ESTADO BASADO EN FECHA
// ============================================
function determinarEstado(fechaFin, fechaCreacion, fechaHoy) {
    // Si la fecha de vencimiento ya pasó
    if (fechaFin < fechaHoy) {
        // 70% probabilidad de haberla completado a tiempo
        if (Math.random() < 0.7) {
            return 'Finalizada';
        }
        // 30% se venció sin completar
        return 'Vencida';
    }
    
    // Si vence hoy o en el futuro
    // 10% probabilidad de ya haberla terminado antes de tiempo
    if (Math.random() < 0.1) {
        return 'Finalizada';
    }
    
    return 'Iniciada';
}

// ============================================
// FUNCIÓN PARA GENERAR USERNAME (EMAIL)
// Formato: primeras letras de cada palabra + @fiqsha.demo
// Ejemplo: "Patricia Elena Bermúdez Ríos" → "pateleber@fiqsha.demo"
// ============================================
function generarUsername(nombre) {
    const palabras = nombre.toLowerCase().split(' ').filter(p => p.length > 0);
    const iniciales = palabras.map(p => p.charAt(0)).join('');
    return `${iniciales}@fiqsha.demo`;
}

// ============================================
// FUNCIÓN PARA OBTENER HORA DE CREACIÓN SEGÚN TIPO DE EMPLEADO
// Ordenamiento "más reciente primero" → horas tardías aparecen primero
// Gerente General: 8:00-9:00 (aparece al final)
// Jefes: 10:00-11:00 (aparecen después)
// Empleados: 14:00-15:00 (aparecen primero)
// ============================================
function obtenerHoraCreacion(empleado) {
    const area = empleado.area || '';
    const cargo = empleado.cargo || '';
    
    // Gerente General
    if (area === 'Gerencia General' || empleado.nombre === GERENTE_GENERAL.nombre) {
        // Hora temprana: 8:00-9:00 (aparece al final con ordenamiento "más reciente primero")
        return { hora: 8, minutos: Math.floor(Math.random() * 60) };
    }
    
    // Jefes (cargos que incluyen "Jefe", "Director", "Gerente", "Coordinador")
    const cargoLower = cargo.toLowerCase();
    if (cargoLower.includes('jefe') || 
        cargoLower.includes('director') || 
        cargoLower.includes('gerente') || 
        cargoLower.includes('coordinador') ||
        cargoLower.includes('coordinadora')) {
        // Hora media: 10:00-11:00
        return { hora: 10, minutos: Math.floor(Math.random() * 60) };
    }
    
    // Empleados regulares
    // Hora tardía: 14:00-15:00 (aparecen primero con ordenamiento "más reciente primero")
    return { hora: 14, minutos: Math.floor(Math.random() * 60) };
}

// ============================================
// FUNCIÓN PARA OBTENER EL JEFE DE UN EMPLEADO
// Jerarquía: Empleados → Jefe de Área → Gerente General
// ============================================
function obtenerJefe(area, esJefeDeArea = false) {
    // Si es Gerencia General, no tiene jefe (o podría ser "Junta Directiva")
    if (area === 'Gerencia General') {
        return 'Junta Directiva';
    }
    
    // Si es jefe de área, reporta a la Gerente General
    if (esJefeDeArea) {
        return GERENTE_GENERAL.nombre;
    }
    
    // Empleados regulares reportan al jefe de su área
    const jefe = JEFES.find(j => j.area === area);
    return jefe ? jefe.nombre : GERENTE_GENERAL.nombre;
}

// ============================================
// FUNCIÓN AUXILIAR: GENERAR ACTIVIDADES PARA UN MES
// Parámetros: año, mes (0-11), fechaHoy (Date)
// ============================================
function generarActividadesPorMes(anio, mes, fechaHoy, idActividadInicial) {
    const actividades = [];
    let idActividad = idActividadInicial;
    
    // Calcular semanas del mes (días laborales)
    // Diciembre 2025: 1 dic (lun) - 31 dic (mié)
    // Enero 2026: 1 ene (jue) - 31 ene (vie)
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0); // Último día del mes
    
    // Calcular semanas laborales del mes (lunes a viernes)
    const SEMANAS = [];
    let fechaActual = new Date(primerDia);
    
    // Encontrar el primer lunes del mes (o el primer día si es lunes)
    const diaSemanaPrimero = primerDia.getDay();
    const diasHastaLunes = diaSemanaPrimero === 0 ? 6 : (diaSemanaPrimero === 1 ? 0 : diaSemanaPrimero - 1);
    let lunesActual = new Date(primerDia);
    if (diasHastaLunes > 0) {
        lunesActual.setDate(primerDia.getDate() + (7 - diasHastaLunes));
    }
    
    // Generar semanas mientras haya lunes dentro del mes
    while (lunesActual <= ultimoDia) {
        const viernesSemana = new Date(lunesActual);
        viernesSemana.setDate(lunesActual.getDate() + 4);
        
        // Asegurar que no exceda el último día del mes
        const finSemana = viernesSemana > ultimoDia ? ultimoDia : viernesSemana;
        
        // Solo agregar si el lunes está dentro del mes
        if (lunesActual <= ultimoDia) {
            SEMANAS.push({
                inicio: new Date(lunesActual),
                fin: new Date(finSemana),
                nombre: `Semana ${SEMANAS.length + 1}`
            });
        }
        
        // Avanzar al siguiente lunes
        lunesActual.setDate(lunesActual.getDate() + 7);
    }
    
    // Si no hay semanas, crear al menos una con todo el mes
    if (SEMANAS.length === 0) {
        SEMANAS.push({
            inicio: new Date(primerDia),
            fin: new Date(ultimoDia),
            nombre: 'Semana 1'
        });
    }
    
    // Helper: obtener tareas del cargo de un empleado
    function getTareasDelCargo(empleado) {
        let t = TAREAS_POR_CARGO[empleado.cargo];
        if (!t) {
            const cargoBase = Object.keys(TAREAS_POR_CARGO).find(c =>
                empleado.cargo.includes(c.replace('Asesora', 'Asesor').replace('Técnica', 'Técnico'))
            );
            t = cargoBase ? TAREAS_POR_CARGO[cargoBase] : TAREAS_POR_CARGO['Asistente Administrativa'];
        }
        return t;
    }

    // Planes por ÁREA: cada plan es grupal (varias personas con tareas dentro del mismo plan)
    // Nombre del plan: "Nombre del plan - Área" (ej. "Técnicas de Venta Consultiva - Ventas")
    const areasConPlanes = Object.keys(PLANES_POR_AREA).filter(area =>
        EMPLEADOS.some(e => e.area === area)
    );

    areasConPlanes.forEach(area => {
        const empleadosArea = EMPLEADOS.filter(e => e.area === area);
        const planesArea = PLANES_POR_AREA[area] || PLANES_POR_AREA['Administración'];
        const planesDelMes = [...planesArea].sort(() => Math.random() - 0.5).slice(0, 2);

        planesDelMes.forEach((plan, planIdx) => {
            const nombrePlan = `${plan.nombre} - ${area}`;
            const prioridadPlan = planIdx === 0 ? 'Alta' : 'Media';
            const fechaCreacionPlan = new Date(primerDia);
            fechaCreacionPlan.setHours(10, Math.floor(Math.random() * 60));
            const fechaFinPlan = new Date(ultimoDia);

            // Repartir las 5 tareas entre 3-4 personas del área (round-robin)
            const numPersonas = Math.min(4, Math.max(2, empleadosArea.length));
            const empleadosPlan = [...empleadosArea].sort(() => Math.random() - 0.5).slice(0, numPersonas);

            const tareasGeneradas = [];
            const mitadSemanas = Math.ceil(SEMANAS.length / 2);
            const semanasPlan = planIdx === 0 ? SEMANAS.slice(0, mitadSemanas) : SEMANAS.slice(mitadSemanas);
            let tareaIndex = 0;
            const fechaCreacionTareas = new Date(primerDia.getFullYear(), primerDia.getMonth(), planIdx === 0 ? primerDia.getDate() : Math.ceil(ultimoDia.getDate() / 2), 10, 0);

            semanasPlan.forEach((semana, idxSemana) => {
                const cant = idxSemana < semanasPlan.length - 1 ? 2 : 5 - tareaIndex;
                for (let i = 0; i < cant && tareaIndex < 5; i++) {
                    const empleado = empleadosPlan[tareaIndex % empleadosPlan.length];
                    const tareasCargo = getTareasDelCargo(empleado);
                    const nombreTarea = tareasCargo[tareaIndex % tareasCargo.length];
                    const fechaCreacionTarea = new Date(fechaCreacionTareas);
                    fechaCreacionTarea.setMinutes(fechaCreacionTarea.getMinutes() + tareaIndex * 5);
                    const fechaFinTarea = new Date(semana.fin);

                    const estadoTarea = determinarEstado(fechaFinTarea, fechaCreacionTarea, fechaHoy);
                    const avanceTarea = generarAvanceTarea(estadoTarea);
                    const diasRestantes = Math.floor((fechaFinTarea - fechaHoy) / (1000 * 60 * 60 * 24));
                    let prioridadTarea = estadoTarea === 'Vencida' ? 'Alta' : diasRestantes <= 3 ? 'Alta' : diasRestantes <= 7 ? 'Media' : 'Baja';

                    tareasGeneradas.push({
                        id: idActividad++,
                        tipo: 'tarea',
                        nombre: nombreTarea,
                        plan: nombrePlan,
                        asignado: { nombre: empleado.nombre, avatar: empleado.avatar, username: empleado.username || generarUsername(empleado.nombre) },
                        idColaborador: empleado.idColaborador,
                        area: empleado.area,
                        lider: empleado.area === 'Gerencia General' ? null : obtenerJefe(empleado.area, empleado.esJefe),
                        cargo: empleado.cargo,
                        estado: estadoTarea,
                        prioridad: prioridadTarea,
                        avance: avanceTarea,
                        fechaCreacion: formatearFecha(fechaCreacionTarea),
                        fechaFinalizacion: formatearFecha(fechaFinTarea),
                        creador: empleado.area === 'Gerencia General' ? empleado.nombre : (Math.random() < 0.5 ? obtenerJefe(empleado.area, empleado.esJefe) : empleado.nombre),
                        comentarios: Math.floor(Math.random() * 4)
                    });
                    tareaIndex++;
                }
            });

            const totalTareas = tareasGeneradas.length;
            const tareasFinalizadas = tareasGeneradas.filter(t => t.estado === 'Finalizada').length;
            const avancePlan = totalTareas > 0 ? Math.round((tareasFinalizadas / totalTareas) * 100) : 0;
            const estadoPlan = avancePlan === 100 ? 'Finalizada' : fechaFinPlan < fechaHoy ? 'Vencida' : 'Iniciada';

            const asignadosPlan = [];
            const vistos = new Set();
            tareasGeneradas.forEach(t => {
                const k = t.asignado.nombre;
                if (!vistos.has(k)) {
                    vistos.add(k);
                    asignadosPlan.push({
                        id: t.idColaborador,
                        nombre: t.asignado.nombre,
                        avatar: t.asignado.avatar,
                        username: t.asignado.username || generarUsername(t.asignado.nombre)
                    });
                }
            });

            const primerAsignado = asignadosPlan[0];
            const creadorPlan = empleadosArea[Math.floor(Math.random() * empleadosArea.length)];

            actividades.push({
                id: idActividad++,
                tipo: 'plan',
                nombre: nombrePlan,
                plan: nombrePlan,
                asignado: primerAsignado || { nombre: creadorPlan.nombre, avatar: creadorPlan.avatar, username: creadorPlan.username || generarUsername(creadorPlan.nombre) },
                asignados: asignadosPlan,
                idColaborador: creadorPlan.idColaborador,
                area: area,
                lider: area === 'Gerencia General' ? null : obtenerJefe(area, false),
                cargo: creadorPlan.cargo,
                estado: estadoPlan,
                prioridad: prioridadPlan,
                avance: avancePlan,
                fechaCreacion: formatearFecha(fechaCreacionPlan),
                fechaFinalizacion: formatearFecha(fechaFinPlan),
                creador: area === 'Gerencia General' ? creadorPlan.nombre : (Math.random() < 0.5 ? obtenerJefe(area, false) : creadorPlan.nombre),
                comentarios: Math.floor(Math.random() * 6)
            });

            tareasGeneradas.forEach(t => actividades.push(t));
        });
    });

    return { actividades, siguienteId: idActividad };
}

// ============================================
// GENERAR BASE DE DATOS DE ACTIVIDADES
// Genera datos para ABRIL 2025, MAYO 2025, JUNIO 2025, JULIO 2025, AGOSTO 2025, SEPTIEMBRE 2025, OCTUBRE 2025, NOVIEMBRE 2025, DICIEMBRE 2025, ENERO 2026, FEBRERO 2026 y MARZO 2026
// Distribución semanal realista (días laborales)
// Fecha actual simulada: 22 de marzo de 2026 (domingo)
// ============================================
function generarBaseDeDatos() {
    const actividades = [];
    let idActividad = 10001;
    const hoy = new Date(2026, 2, 22); // Domingo 22 de marzo de 2026
    
    // Generar actividades para ABRIL 2025
    const actividadesAbril = generarActividadesPorMes(2025, 3, hoy, idActividad);
    actividades.push(...actividadesAbril.actividades);
    idActividad = actividadesAbril.siguienteId;
    
    // Generar actividades para MAYO 2025
    const actividadesMayo = generarActividadesPorMes(2025, 4, hoy, idActividad);
    actividades.push(...actividadesMayo.actividades);
    idActividad = actividadesMayo.siguienteId;
    
    // Generar actividades para JUNIO 2025
    const actividadesJunio = generarActividadesPorMes(2025, 5, hoy, idActividad);
    actividades.push(...actividadesJunio.actividades);
    idActividad = actividadesJunio.siguienteId;
    
    // Generar actividades para JULIO 2025
    const actividadesJulio = generarActividadesPorMes(2025, 6, hoy, idActividad);
    actividades.push(...actividadesJulio.actividades);
    idActividad = actividadesJulio.siguienteId;
    
    // Generar actividades para AGOSTO 2025
    const actividadesAgosto = generarActividadesPorMes(2025, 7, hoy, idActividad);
    actividades.push(...actividadesAgosto.actividades);
    idActividad = actividadesAgosto.siguienteId;
    
    // Generar actividades para SEPTIEMBRE 2025
    const actividadesSeptiembre = generarActividadesPorMes(2025, 8, hoy, idActividad);
    actividades.push(...actividadesSeptiembre.actividades);
    idActividad = actividadesSeptiembre.siguienteId;
    
    // Generar actividades para OCTUBRE 2025
    const actividadesOctubre = generarActividadesPorMes(2025, 9, hoy, idActividad);
    actividades.push(...actividadesOctubre.actividades);
    idActividad = actividadesOctubre.siguienteId;
    
    // Generar actividades para NOVIEMBRE 2025
    const actividadesNoviembre = generarActividadesPorMes(2025, 10, hoy, idActividad);
    actividades.push(...actividadesNoviembre.actividades);
    idActividad = actividadesNoviembre.siguienteId;
    
    // Generar actividades para DICIEMBRE 2025
    const actividadesDiciembre = generarActividadesPorMes(2025, 11, hoy, idActividad);
    actividades.push(...actividadesDiciembre.actividades);
    idActividad = actividadesDiciembre.siguienteId;
    
    // Generar actividades para ENERO 2026
    const actividadesEnero = generarActividadesPorMes(2026, 0, hoy, idActividad);
    actividades.push(...actividadesEnero.actividades);
    idActividad = actividadesEnero.siguienteId;
    
    // Generar actividades para FEBRERO 2026
    const actividadesFebrero = generarActividadesPorMes(2026, 1, hoy, idActividad);
    actividades.push(...actividadesFebrero.actividades);
    idActividad = actividadesFebrero.siguienteId;
    
    // Generar actividades para MARZO 2026
    const actividadesMarzo = generarActividadesPorMes(2026, 2, hoy, idActividad);
    actividades.push(...actividadesMarzo.actividades);
    
    return actividades;
}

// ============================================
// ALCANCE LÍDER (TASK_VIEW_SCOPE_LEADER)
// Devuelve solo actividades de reportes directos del líder.
// Misma base de datos, sin duplicar.
// ============================================
function getReportesDirectos(nombreLider) {
    if (!nombreLider || !EMPLEADOS) return [];
    return EMPLEADOS.filter(function(e) { return e.jefe === nombreLider; }).map(function(e) { return e.nombre; });
}

function getActividadesParaLider(nombreLider) {
    var todas = generarBaseDeDatos();
    var nombresReportes = getReportesDirectos(nombreLider);
    var setReportes = new Set(nombresReportes);
    return todas.filter(function(act) {
        if (act.tipo === 'tarea') {
            return act.asignado && setReportes.has(act.asignado.nombre);
        }
        if (act.tipo === 'plan') {
            if (act.creador && setReportes.has(act.creador)) return true;
            if (act.asignados && act.asignados.length) {
                return act.asignados.some(function(a) { return a && setReportes.has(a.nombre); });
            }
        }
        return false;
    });
}

// ============================================
// EXPORTAR DATOS
// ============================================
const SEGUIMIENTO_DATABASE = {
    empresa: EMPRESA_DATA,
    areas: AREAS,
    jefes: JEFES,
    empleados: EMPLEADOS,
    planesFormacion: PLANES_POR_AREA,
    tareasFormacion: TAREAS_POR_CARGO,
    estados: ESTADOS,
    prioridades: PRIORIDADES,
    generarActividades: generarBaseDeDatos,
    getReportesDirectos: getReportesDirectos,
    getActividadesParaLider: getActividadesParaLider
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SEGUIMIENTO_DATABASE = SEGUIMIENTO_DATABASE;
}
