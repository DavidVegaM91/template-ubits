/**
 * UBITS Select — átomo de selección única.
 * Internamente reusa createInput({ type: 'select' }) + dropdown-menu.
 * API alineada a React UbitsSelect (label, options ricas, clearable, sizes).
 */
(function (global) {
  'use strict';

  /**
   * @param {Object} opts
   * @param {string} opts.containerId
   * @param {string} [opts.label]
   * @param {boolean} [opts.showLabel=true]
   * @param {'top'|'left'} [opts.labelPosition='top']
   * @param {string} [opts.placeholder='Selecciona una opción']
   * @param {string} [opts.value]
   * @param {Array} [opts.options] - { value, label|text, description?, icon?, avatar?, dotColor?, leftHtml?, metaText?, statusTag?, disabled?, isSectionLabel?, divider? }
   * @param {Function} [opts.onChange]
   * @param {'xs'|'sm'|'md'|'lg'} [opts.size='md']
   * @param {boolean} [opts.disabled]
   * @param {string|string[]} [opts.error]
   * @param {string} [opts.helperText]
   * @param {boolean} [opts.showHelper]
   * @param {boolean} [opts.mandatory]
   * @param {'obligatorio'|'opcional'} [opts.mandatoryType]
   * @param {'text'|'asterisk'} [opts.mandatoryStyle]
   * @param {boolean} [opts.clearable]
   * @param {boolean} [opts.multiple]
   * @param {string[]} [opts.values]
   * @param {string} [opts.multipleSummaryLabel]
   * @param {'default'|'badge-only'} [opts.valueDisplay='default']
   */
  function createSelect(opts) {
    if (typeof createInput !== 'function') {
      console.error('createSelect requiere components/input.js');
      return null;
    }
    opts = opts || {};
    var options = (opts.options || []).map(function (o) {
      if (o.divider) return { divider: true, value: '', text: '' };
      if (o.isSectionLabel) return { isSectionLabel: true, value: '', text: o.label || o.text || '' };
      var leftIcon = o.icon ? String(o.icon).replace(/^far fa-|^fas fa-|^fa-/, '') : undefined;
      var leftHtml = o.leftHtml;
      if (!leftHtml && o.dotColor) {
        leftHtml =
          '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
          String(o.dotColor).replace(/"/g, '') +
          '" aria-hidden="true"></span>';
      }
      return {
        value: o.value,
        text: o.label || o.text || '',
        label: o.label || o.text || '',
        description: o.description,
        leftIcon: leftIcon,
        leftHtml: leftHtml,
        dotColor: o.dotColor,
        avatar: o.avatar,
        metaText: o.metaText,
        statusTag: o.statusTag,
        disabled: o.disabled,
      };
    });

    return createInput({
      containerId: opts.containerId,
      type: 'select',
      label: opts.label,
      showLabel: opts.showLabel !== false,
      labelPosition: opts.labelPosition || 'top',
      placeholder: opts.placeholder || 'Selecciona una opción',
      value: opts.multiple ? '' : (opts.value || ''),
      selectOptions: options,
      multiple: !!opts.multiple,
      selectValues: opts.values || [],
      multipleSummaryLabel: opts.multipleSummaryLabel,
      valueDisplay: opts.valueDisplay || 'default',
      clearable: !!opts.clearable,
      onChange: opts.onChange,
      size: opts.size || 'md',
      disabled: !!opts.disabled,
      error: opts.error,
      helperText: opts.helperText,
      showHelper: !!opts.showHelper,
      mandatory: !!opts.mandatory,
      mandatoryType: opts.mandatoryType || 'obligatorio',
      mandatoryStyle: opts.mandatoryStyle || 'text',
      state: opts.disabled ? 'disabled' : opts.error ? 'invalid' : 'default',
    });
  }

  global.createSelect = createSelect;
})(typeof window !== 'undefined' ? window : this);
