/* ========================================
   UBITS ACCORDION COMPONENT
   ======================================== */

(function () {
    'use strict';

    var VALID_SIZES = ['sm', 'md', 'lg'];
    var VALID_VARIANTS = ['filled', 'line', 'plain'];
    var VALID_INDICATORS = ['chevron', 'plus'];
    var VALID_TRIGGERS = ['header', 'footer'];
    var VALID_INDICATOR_POSITIONS = ['start', 'end'];

    function resolveSize(size) {
        return VALID_SIZES.indexOf(size) >= 0 ? size : 'md';
    }

    function resolveVariant(variant) {
        return VALID_VARIANTS.indexOf(variant) >= 0 ? variant : 'filled';
    }

    function resolveIndicator(indicator) {
        return VALID_INDICATORS.indexOf(indicator) >= 0 ? indicator : 'chevron';
    }

    function resolveTrigger(triggerPosition) {
        return VALID_TRIGGERS.indexOf(triggerPosition) >= 0 ? triggerPosition : 'header';
    }

    function resolveIndicatorPosition(pos) {
        return VALID_INDICATOR_POSITIONS.indexOf(pos) >= 0 ? pos : 'end';
    }

    function escapeAttr(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function buildAccordionHTML(config) {
        var size = resolveSize(config.size);
        var variant = resolveVariant(config.variant);
        var indicator = resolveIndicator(config.indicator);
        var indicatorPosition = resolveIndicatorPosition(config.indicatorPosition);
        var triggerPosition = resolveTrigger(config.triggerPosition);
        var title = String(config.title || '').trim();
        if (!title) {
            throw new Error('Accordion: "title" es obligatorio.');
        }

        var itemId = config.id || ('ubits-accordion-' + Math.random().toString(36).slice(2, 10));
        var contentId = itemId + '-content';
        var isOpen = Boolean(config.isOpen);
        var disabled = Boolean(config.disabled);
        var highlighted = Boolean(config.highlighted);
        var number = config.number !== undefined && config.number !== null && String(config.number).trim() !== ''
            ? String(config.number).trim()
            : '';
        var description = config.description !== undefined && config.description !== null
            ? String(config.description).trim()
            : '';
        var icon = config.icon !== undefined && config.icon !== null && String(config.icon).trim() !== ''
            ? String(config.icon).trim()
            : '';
        var leadingHtml = config.leadingHtml ? String(config.leadingHtml) : '';
        var trailingHtml = config.trailingHtml ? String(config.trailingHtml) : '';
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
        var disabledAttr = disabled ? ' disabled aria-disabled="true"' : '';

        var leadingBlock = '';
        if (leadingHtml) {
            leadingBlock = '<span class="ubits-accordion__leading">' + leadingHtml + '</span>';
        } else if (icon) {
            leadingBlock = '<span class="ubits-accordion__icon" aria-hidden="true"><i class="' + escapeAttr(icon) + '"></i></span>';
        } else if (number) {
            leadingBlock = '<span class="ubits-accordion__number ' + numberClass + '">' + number + '</span>';
        }

        var headerDescriptionHTML = description
            ? '<p class="ubits-accordion__description ' + descriptionClass + '">' + description + '</p>'
            : '';
        var trailingBlock = trailingHtml
            ? '<span class="ubits-accordion__trailing">' + trailingHtml + '</span>'
            : '';

        var indicatorIcon = indicator === 'plus'
            ? (isOpen ? 'far fa-minus' : 'far fa-plus')
            : 'far fa-chevron-down';
        var chevronClass = 'ubits-accordion__chevron' + (indicator === 'plus' ? ' ubits-accordion__chevron--plus' : '');

        var indicatorSpan = '<span class="' + chevronClass + '" aria-hidden="true"><i class="' + indicatorIcon + '"></i></span>';
        var titleRow = '' +
            '<div class="ubits-accordion__title-row">' +
                '<span class="ubits-accordion__title ' + titleClass + '">' + title + '</span>' +
                trailingBlock +
            '</div>';

        var headerHTML = '' +
            '<button type="button" class="ubits-accordion__header" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="' + contentId + '"' + disabledAttr + '>' +
                (indicatorPosition === 'start' ? indicatorSpan : '') +
                '<div class="ubits-accordion__title-wrap">' +
                    leadingBlock +
                    '<div class="ubits-accordion__title-content">' +
                        titleRow +
                        headerDescriptionHTML +
                    '</div>' +
                '</div>' +
                (indicatorPosition === 'end' ? indicatorSpan : '') +
            '</button>';

        var contentHTML = '' +
            '<div class="ubits-accordion__content" id="' + contentId + '"' + hiddenAttr + '>' +
                contentHtml +
            '</div>';

        var bodyOrder = triggerPosition === 'footer'
            ? contentHTML + headerHTML
            : headerHTML + contentHTML;

        var extraClasses = '';
        if (highlighted) extraClasses += ' ubits-accordion--highlighted';
        if (disabled) extraClasses += ' ubits-accordion--disabled';
        if (triggerPosition === 'footer') extraClasses += ' ubits-accordion--footer-trigger';

        return '' +
            '<div class="ubits-accordion ubits-accordion--' + size + ' ubits-accordion--' + variant + extraClasses + '" data-open="' + (isOpen ? 'true' : 'false') + '" data-indicator="' + indicator + '" data-indicator-position="' + indicatorPosition + '" data-trigger="' + triggerPosition + '" id="' + itemId + '">' +
                bodyOrder +
            '</div>';
    }

    function syncIndicatorIcon(accordionEl, shouldOpen) {
        var chevron = accordionEl.querySelector('.ubits-accordion__chevron');
        if (!chevron) return;
        var icon = chevron.querySelector('i');
        if (!icon) return;
        var indicator = accordionEl.getAttribute('data-indicator') || 'chevron';
        if (indicator === 'plus') {
            icon.className = shouldOpen ? 'far fa-minus' : 'far fa-plus';
        } else {
            icon.className = 'far fa-chevron-down';
        }
    }

    function setAccordionState(accordionEl, shouldOpen) {
        var header = accordionEl.querySelector('.ubits-accordion__header');
        var content = accordionEl.querySelector('.ubits-accordion__content');
        if (!header || !content) return;
        if (accordionEl.classList.contains('ubits-accordion--disabled') || header.disabled) return;

        accordionEl.setAttribute('data-open', shouldOpen ? 'true' : 'false');
        header.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        content.hidden = !shouldOpen;
        syncIndicatorIcon(accordionEl, shouldOpen);
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

    /**
     * Grupo de acordeones: allowMultiple controla si varios pueden quedar abiertos.
     * config: {
     *   containerId, items: [...], size, variant, separated,
     *   indicator, indicatorPosition, triggerPosition, allowMultiple
     * }
     * Ítem: title, contentHtml, number, description, icon, leadingHtml, trailingHtml,
     *       isOpen, disabled, highlighted, id
     */
    function createAccordionGroup(config) {
        if (!config || !config.containerId) {
            throw new Error('Accordion group: "containerId" es obligatorio.');
        }
        var container = document.getElementById(config.containerId);
        if (!container) {
            throw new Error('Accordion group: contenedor "' + config.containerId + '" no encontrado.');
        }

        var items = Array.isArray(config.items) ? config.items : [];
        var allowMultiple = Boolean(config.allowMultiple);
        var shared = {
            size: config.size,
            variant: config.variant,
            indicator: config.indicator,
            indicatorPosition: config.indicatorPosition,
            triggerPosition: config.triggerPosition
        };

        var separated = Boolean(config.separated);
        container.innerHTML = '<div class="ubits-accordion-group' + (separated ? ' ubits-accordion-group--separated' : '') + '"></div>';
        var groupEl = container.querySelector('.ubits-accordion-group');

        items.forEach(function (itemConfig) {
            var wrap = document.createElement('div');
            wrap.innerHTML = buildAccordionHTML(Object.assign({}, shared, itemConfig));
            var accordionEl = wrap.firstChild;
            groupEl.appendChild(accordionEl);
        });

        var nodes = groupEl.querySelectorAll('.ubits-accordion');
        nodes.forEach(function (accordionEl) {
            var header = accordionEl.querySelector('.ubits-accordion__header');
            if (!header) return;
            header.addEventListener('click', function () {
                if (accordionEl.classList.contains('ubits-accordion--disabled') || header.disabled) return;
                var willOpen = accordionEl.getAttribute('data-open') !== 'true';
                if (!allowMultiple && willOpen) {
                    nodes.forEach(function (sibling) {
                        if (sibling !== accordionEl) setAccordionState(sibling, false);
                    });
                }
                setAccordionState(accordionEl, willOpen);
            });
            accordionEl.dataset.accordionReady = 'true';
        });

        return groupEl;
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
    window.createAccordionGroup = createAccordionGroup;
    window.initAccordions = initAccordions;
    window.toggleAccordion = toggleAccordion;
    window.setAccordionState = setAccordionState;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initAccordions();
        });
    } else {
        initAccordions();
    }
})();
