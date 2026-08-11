/**
 * Tabla de colaboradores — paso Participantes del drawer «Agregar asignación».
 * Columnas visibles por defecto = las 5 actuales; resto opcionales vía columnsToggle.
 */
(function (window) {
    'use strict';

    var DPC = {};

    function escapeDrawerHtml(t) {
        if (t == null) return '';
        var d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function displayCell(val) {
        if (val == null || String(val).trim() === '') return '-';
        return String(val);
    }

    DPC.getUsernameEmpleado = function (e) {
        if (e.username) return e.username;
        if (e.correoElectronico) return e.correoElectronico;
        var palabras = (e.nombre || e.nombreCompleto || '').toLowerCase().split(' ').filter(function (p) {
            return p.length > 0;
        });
        var iniciales = palabras.map(function (p) { return p.charAt(0); }).join('');
        return iniciales ? iniciales + '@fiqsha.demo' : 'user@fiqsha.demo';
    };

    DPC.mapEmpleadoParaDrawerColab = function (e, idx) {
        e = e || {};
        var username = DPC.getUsernameEmpleado(e);
        var id = e.id || e.idColaborador || ('E' + ((idx != null ? idx : 0) + 1));
        return {
            id: id,
            username: username,
            nombre: (e.nombre || e.nombreCompleto || '').trim(),
            correo: (e.correoElectronico || e.username || username || '').trim(),
            area: (e.area || '').trim(),
            lider: (e.jefe || e.lider || '').trim(),
            avatar: e.avatar || null,
            cargo: (e.cargo || e.cargoEnEmpresa || '').trim(),
            dni: e.dni != null ? String(e.dni) : '',
            pais: (e.pais || '').trim(),
            ciudad: (e.ciudad || '').trim(),
            nivelEnEmpresa: (e.nivelEnEmpresa || '').trim(),
            columnaA: (e.columnaA || '').trim(),
            columnaB: (e.columnaB || '').trim()
        };
    };

    DPC.getDrawerParticipantesColabColumns = function () {
        return [
            { id: 'username', label: 'Username', filterable: true, defaultVisible: true },
            { id: 'nombre', label: 'Nombre del usuario', filterable: true, defaultVisible: true },
            { id: 'correo', label: 'Correo electrónico', filterable: true, defaultVisible: true },
            { id: 'area', label: 'Área', filterable: true, defaultVisible: true },
            { id: 'lider', label: 'Líder', filterable: true, defaultVisible: true },
            { id: 'cargo', label: 'Cargo', filterable: true, defaultVisible: false },
            { id: 'dni', label: 'DNI', filterable: true, defaultVisible: false },
            { id: 'pais', label: 'País', filterable: true, defaultVisible: false },
            { id: 'ciudad', label: 'Ciudad', filterable: true, defaultVisible: false },
            { id: 'nivelEnEmpresa', label: 'Nivel en empresa', filterable: true, defaultVisible: false },
            { id: 'columnaA', label: 'Columna A', filterable: true, defaultVisible: false },
            { id: 'columnaB', label: 'Columna B', filterable: true, defaultVisible: false }
        ];
    };

    DPC.buildDrawerParticipantesColabRowHtml = function (row) {
        row = row || {};
        var avatarUrl = (row.avatar && String(row.avatar).trim()) ? String(row.avatar).replace(/"/g, '&quot;') : '';
        var usuarioCell =
            '<div class="detalle-plan-usuario-cell">' +
            (avatarUrl
                ? '<span class="ubits-avatar ubits-avatar--sm"><img src="' + avatarUrl + '" alt="' + escapeDrawerHtml(row.nombre) + '" class="ubits-avatar__img"></span>'
                : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>') +
            '<span class="ubits-body-sm-regular">' + escapeDrawerHtml(displayCell(row.nombre)) + '</span></div>';

        function textCell(col, val, extra) {
            var attrs = extra || '';
            return (
                '<td data-col="' + col + '"' + attrs + '><span class="ubits-body-sm-regular">' + escapeDrawerHtml(displayCell(val)) + '</span></td>'
            );
        }

        return (
            textCell('username', row.username) +
            '<td data-col="nombre">' + usuarioCell + '</td>' +
            textCell('correo', row.correo) +
            textCell('area', row.area) +
            textCell('lider', row.lider) +
            textCell('cargo', row.cargo) +
            textCell('dni', row.dni) +
            textCell('pais', row.pais) +
            textCell('ciudad', row.ciudad) +
            textCell('nivelEnEmpresa', row.nivelEnEmpresa) +
            textCell('columnaA', row.columnaA) +
            textCell('columnaB', row.columnaB)
        );
    };

    DPC.getDefaultDrawerParticipantesI18n = function () {
        return {
            selectAll: 'Seleccionar todo',
            deselectAll: 'Deseleccionar todo',
            verSeleccionados: 'Ver seleccionados',
            buscar: 'Buscar',
            columnasVisibles: 'Columnas visibles'
        };
    };

    /**
     * @param {Object} opts - containerId, tableId, getData, emptyState, i18n, title, searchColumnIds, initialSelectedIds
     */
    DPC.createDrawerParticipantesColabDataTable = function (opts) {
        opts = opts || {};
        if (typeof window.createUbitsDataTable !== 'function') return null;
        return window.createUbitsDataTable({
            containerId: opts.containerId,
            tableId: opts.tableId,
            title: opts.title != null ? opts.title : 'Lista de colaboradores',
            columns: DPC.getDrawerParticipantesColabColumns(),
            getData: opts.getData,
            rowIdField: 'id',
            buildRowHtml: DPC.buildDrawerParticipantesColabRowHtml,
            features: {
                checkboxes: true,
                search: true,
                filters: true,
                verSeleccionados: true,
                resultsCount: true,
                columnsToggle: true
            },
            emptyState: opts.emptyState || { message: 'No hay colaboradores', icon: 'far fa-user' },
            i18n: Object.assign({}, DPC.getDefaultDrawerParticipantesI18n(), opts.i18n || {}),
            searchColumnIds: opts.searchColumnIds,
            initialSelectedIds: opts.initialSelectedIds
        });
    };

    window.DrawerParticipantesColabTable = DPC;
})(window);
