/**
 * Markup compartido — paso Contenidos / drawer «Buscar y agregar contenidos».
 * Toolbar panel (plain) + vista tabla (default) + vista cuadrícula (cards).
 * @param {string} [idPrefix] drawer-wiz | drawer-editplan | '' (drawer-cursos-*)
 */
(function (window) {
    'use strict';

    function resolveId(idPrefix, suffix) {
        if (idPrefix) return idPrefix + '-' + suffix;
        return 'drawer-' + suffix;
    }

    function getDrawerContenidosCatalogSectionHtml(idPrefix) {
        idPrefix = idPrefix != null ? idPrefix : 'drawer-wiz';
        var p = idPrefix;
        var I = function (s) { return resolveId(p, s); };

        return (
            '<div class="drawer-agregar-cursos drawer-agregar-cursos--single-col">' +
            '  <span class="drawer-agregar-cursos__section-title ubits-body-sm-semibold">Buscar y agregar contenidos</span>' +
            '  <div class="ubits-toolbar-panel ubits-toolbar-panel--plain drawer-contenidos-toolbar" id="' + I('cursos-toolbar') + '">' +
            '    <div class="ubits-toolbar-panel__bar">' +
            '      <div class="ubits-toolbar-panel__title-block">' +
            '        <span class="ubits-toolbar-panel__meta">' +
            '          <span class="ubits-body-sm-regular" id="' + I('cursos-meta-count') + '" aria-live="polite">0/0</span>' +
            '          <span class="ubits-body-sm-regular">resultados</span>' +
            '        </span>' +
            '      </div>' +
            '      <div class="ubits-toolbar-panel__actions">' +
            '        <div class="drawer-wiz-cursos-action-bar drawer-cursos-action-bar" id="' + I('cursos-action-bar') + '">' +
            '          <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="' + I('cursos-ver-seleccionados') + '">' +
            '            <i class="far fa-eye"></i><span>Ver seleccionados</span></button>' +
            '        </div>' +
            '        <div class="ubits-toolbar-panel__search-group" id="' + I('cursos-search-group') + '">' +
            '          <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ubits-toolbar-panel__search-toggle" id="' + I('cursos-search-toggle') + '" data-tooltip="Buscar" data-tooltip-delay="1000" aria-label="Buscar">' +
            '            <i class="far fa-magnifying-glass"></i></button>' +
            '          <div id="' + I('cursos-search-inline') + '" class="ubits-toolbar-panel__search-inline" style="display:none;" aria-hidden="true"></div>' +
            '          <span class="drawer-cursos-filtros-btn-wrap" style="display:none;">' +
            '            <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ubits-toolbar-panel__filter-btn drawer-cursos-filtros-btn" id="' + I('cursos-filter-btn') + '" data-tooltip="Filtrar" data-tooltip-delay="1000" aria-label="Filtrar"><i class="far fa-filter"></i></button>' +
            '          </span>' +
            '        </div>' +
            '        <div class="ubits-toolbar-panel__control-group">' +
            '          <span class="ubits-toolbar-panel__control-label ubits-body-sm-regular">Ver como:</span>' +
            '          <div class="ubits-button-group" role="group" aria-label="Ver como:" data-variant="selectable" data-value="list" id="' + I('cursos-view-group') + '">' +
            '            <button type="button" class="ubits-button ubits-button--active ubits-button--sm" data-value="list" aria-pressed="true">' +
            '              <i class="far fa-list-ul"></i><span>Tabla</span></button>' +
            '            <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-value="grid" aria-pressed="false">' +
            '              <i class="far fa-grid-2"></i><span>Cuadrícula</span></button>' +
            '          </div>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '  <div class="drawer-cursos-resultados-bg drawer-cursos-resultados-bg--paso2-full">' +
            '    <div id="' + I('contenidos-empty-search') + '" class="drawer-contenidos-empty-search-wrap" style="display:none;"></div>' +
            '    <div class="drawer-contenidos-table-wrap" id="' + I('cursos-table-wrap') + '">' +
            '      <div class="ubits-table-wrapper drawer-contenidos-table-scroll">' +
            '        <table class="ubits-table drawer-contenidos-catalog-table" id="' + I('cursos-catalog-table') + '">' +
            '          <thead><tr id="' + I('cursos-catalog-thead-row') + '"></tr></thead>' +
            '          <tbody id="' + I('cursos-catalog-tbody') + '"></tbody>' +
            '        </table>' +
            '      </div>' +
            '    </div>' +
            '    <div class="drawer-cursos-cards-grid" id="' + I('cursos-cards-container') + '" style="display:none;"></div>' +
            '  </div>' +
            '</div>'
        );
    }

    window.getDrawerContenidosCatalogSectionHtml = getDrawerContenidosCatalogSectionHtml;
})(window);
