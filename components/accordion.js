/* ========================================
   UBITS ACCORDION COMPONENT
   ======================================== */

(function () {
    'use strict';

    var VALID_SIZES = ['sm', 'md', 'lg'];
    var VALID_VARIANTS = ['filled', 'line'];

    function resolveSize(size) {
        return VALID_SIZES.indexOf(size) >= 0 ? size : 'md';
    }

    function resolveVariant(variant) {
        return VALID_VARIANTS.indexOf(variant) >= 0 ? variant : 'filled';
    }

    function buildAccordionHTML(config) {
        var size = resolveSize(config.size);
        var variant = resolveVariant(config.variant);
        var title = String(config.title || '').trim();
        if (!title) {
            throw new Error('Accordion: "title" es obligatorio.');
        }

        var itemId = config.id || ('ubits-accordion-' + Math.random().toString(36).slice(2, 10));
        var contentId = itemId + '-content';
        var isOpen = Boolean(config.isOpen);
        var number = config.number !== undefined && config.number !== null && String(config.number).trim() !== ''
            ? String(config.number).trim()
            : '';
        var description = config.description !== undefined && config.description !== null
            ? String(config.description).trim()
            : '';
        var contentHtml = config.contentHtml ? String(config.contentHtml) : '';

        var titleClassBySize = {
            sm: 'ubits-body-sm-bold',
            md: 'ubits-body-md-bold',
            lg: 'ubits-heading-h2'
        };
        var numberClassBySize = {
            sm: 'ubits-body-sm-regular',
            md: 'ubits-body-md-regular',
            lg: 'ubits-body-md-bold'
        };
        var descriptionClassBySize = {
            sm: 'ubits-body-sm-regular',
            md: 'ubits-body-sm-regular',
            lg: 'ubits-body-md-regular'
        };
        var titleClass = titleClassBySize[size];
        var numberClass = numberClassBySize[size];
        var descriptionClass = descriptionClassBySize[size];
        var hiddenAttr = isOpen ? '' : ' hidden';
        var numberHTML = number ? '<span class="ubits-accordion__number ' + numberClass + '">' + number + '</span>' : '';
        var headerDescriptionHTML = description
            ? '<p class="ubits-accordion__description ' + descriptionClass + '">' + description + '</p>'
            : '';
        var bodyHTML = contentHtml || '';

        return '' +
            '<div class="ubits-accordion ubits-accordion--' + size + ' ubits-accordion--' + variant + '" data-open="' + (isOpen ? 'true' : 'false') + '" id="' + itemId + '">' +
                '<button type="button" class="ubits-accordion__header" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="' + contentId + '">' +
                    '<div class="ubits-accordion__title-wrap">' +
                        numberHTML +
                        '<div class="ubits-accordion__title-content">' +
                            '<span class="ubits-accordion__title ' + titleClass + '">' + title + '</span>' +
                            headerDescriptionHTML +
                        '</div>' +
                    '</div>' +
                    '<span class="ubits-accordion__chevron" aria-hidden="true"><i class="far fa-chevron-down"></i></span>' +
                '</button>' +
                '<div class="ubits-accordion__content" id="' + contentId + '"' + hiddenAttr + '>' +
                    bodyHTML +
                '</div>' +
            '</div>';
    }

    function setAccordionState(accordionEl, shouldOpen) {
        var header = accordionEl.querySelector('.ubits-accordion__header');
        var content = accordionEl.querySelector('.ubits-accordion__content');
        if (!header || !content) return;

        accordionEl.setAttribute('data-open', shouldOpen ? 'true' : 'false');
        header.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        content.hidden = !shouldOpen;
    }

    function toggleAccordion(target) {
        var accordionEl = typeof target === 'string' ? document.querySelector(target) : target;
        if (!accordionEl || !accordionEl.classList.contains('ubits-accordion')) return;

        var isOpen = accordionEl.getAttribute('data-open') === 'true';
        setAccordionState(accordionEl, !isOpen);
    }

    function initAccordions(selector) {
        var targetSelector = selector || '.ubits-accordion';
        var accordions = document.querySelectorAll(targetSelector);

        accordions.forEach(function (accordionEl) {
            if (accordionEl.dataset.accordionReady === 'true') return;

            var header = accordionEl.querySelector('.ubits-accordion__header');
            if (!header) return;

            header.addEventListener('click', function () {
                toggleAccordion(accordionEl);
            });

            accordionEl.dataset.accordionReady = 'true';
        });
    }

    function createAccordion(config) {
        if (!config || !config.containerId) {
            throw new Error('Accordion: "containerId" es obligatorio.');
        }

        var container = document.getElementById(config.containerId);
        if (!container) {
            throw new Error('Accordion: contenedor "' + config.containerId + '" no encontrado.');
        }

        container.innerHTML = buildAccordionHTML(config);
        var accordionEl = container.querySelector('.ubits-accordion');
        initAccordions('#' + accordionEl.id);
        return accordionEl;
    }

    window.createAccordion = createAccordion;
    window.initAccordions = initAccordions;
    window.toggleAccordion = toggleAccordion;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initAccordions();
        });
    } else {
        initAccordions();
    }
})();
