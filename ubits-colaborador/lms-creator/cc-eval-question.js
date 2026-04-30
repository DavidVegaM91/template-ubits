/**
 * LMS Creator — Componente: Pregunta de evaluación
 * Montaje y control de modos/validación sin hardcodear HTML desde el builder.
 *
 * API global:
 *   window.CC_EVAL_QUESTION.mount(hostEl, options) -> api
 *
 * options:
 *  - qId: number
 *  - model: objeto (type, statement, options, correct, pairs, etc.)
 *  - mode: 'edit' | 'read' | 'read_error' | 'edit_error' | 'collab' | 'collab_feedback'
 *  - onDelete(qId)
 *  - onRequestFocus(qId)
 */
(function (global) {
  'use strict';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  function qTypeIcon(type) {
    var icons = {
      multiple_choice_single: 'fa-circle-dot',
      multiple_choice_multiple: 'fa-square-check',
      true_false: 'fa-toggle-on',
      instruction: 'fa-align-left',
      short_answer: 'fa-keyboard',
      essay: 'fa-comment-lines',
      matching: 'fa-arrows-left-right',
      fill_blank: 'fa-underline',
      rating_scale: 'fa-star-half-stroke'
    };
    return icons[type] || 'fa-circle-question';
  }

  function parseFillBlankMarkers(text) {
    var t = String(text || '');
    var re = /\{\{\s*(\d+)\s*\}\}/g;
    var m;
    var nums = [];
    while ((m = re.exec(t))) nums.push(parseInt(m[1], 10));
    return nums.filter(function (n) { return !isNaN(n) && n > 0; });
  }

  function normalizeModel(model, qId) {
    var m = model && typeof model === 'object' ? model : {};
    var type = String(m.type || 'multiple_choice_single');
    var out = {
      id: qId,
      type: type,
      statement: String(m.statement || ''),
      instructionHtml: String(m.instructionHtml || ''),
      options: Array.isArray(m.options) ? m.options.map(function (o) {
        return { text: String((o && o.text) || ''), correct: !!(o && o.correct) };
      }) : [],
      trueFalseCorrect: String(m.trueFalseCorrect || ''),
      shortAnswer: m.shortAnswer ? { answer: String(m.shortAnswer.answer || ''), accuracy: String(m.shortAnswer.accuracy || 'exact') } : { answer: '', accuracy: 'exact' },
      essay: m.essay ? { minWords: String(m.essay.minWords || '') } : { minWords: '' },
      pairs: Array.isArray(m.pairs) ? m.pairs.map(function (p) { return { a: String((p && p.a) || ''), b: String((p && p.b) || '') }; }) : [],
      fillBlank: m.fillBlank && Array.isArray(m.fillBlank.options)
        ? { options: m.fillBlank.options.map(function (t) { return String(t || ''); }) }
        : { options: [] },
      rating: m.rating ? {
        min: String(m.rating.min || '1'),
        max: String(m.rating.max || '5'),
        minLabel: String(m.rating.minLabel || ''),
        maxLabel: String(m.rating.maxLabel || '')
      } : { min: '1', max: '5', minLabel: '', maxLabel: '' }
    };

    // Defaults por tipo
    if (type === 'multiple_choice_single' || type === 'multiple_choice_multiple') {
      if (out.options.length < 2) out.options = [{ text: '', correct: false }, { text: '', correct: false }];
    }
    if (type === 'matching') {
      if (out.pairs.length < 2) out.pairs = [{ a: '', b: '' }, { a: '', b: '' }];
    }
    if (type === 'fill_blank') {
      if (!out.fillBlank.options || out.fillBlank.options.length < 2) out.fillBlank.options = ['',''];
    }
    return out;
  }

  function createDom(hostEl, qId) {
    var root = document.createElement('div');
    root.className = 'cc-eval-q is-readonly';
    root.setAttribute('data-cc-eval-q', 'true');
    root.setAttribute('data-q-id', String(qId));
    root.tabIndex = 0;

    root.innerHTML =
      '<div class="cc-eval-q__header">' +
      '  <span class="cc-eval-q__badge">' +
      '    <i class="far ' + qTypeIcon('multiple_choice_single') + ' cc-eval-q__type-icon" aria-hidden="true"></i>' +
      '    <span class="ubits-body-sm-semibold cc-eval-q__num">Pregunta ' + qId + '</span>' +
      '  </span>' +
      '</div>' +
      '<div class="cc-eval-q__body">' +
      '  <div class="cc-eval-q__mode-mount"></div>' +
      '  <p class="cc-eval-q__hint ubits-body-xs-regular" style="display:none;"></p>' +
      '  <div class="cc-eval-q__error-row ubits-body-xs-regular"><i class="far fa-circle-exclamation" aria-hidden="true"></i><span>Campos sin diligenciar</span></div>' +
      '  <div class="cc-eval-q__feedback ubits-body-xs-semibold"><i class="far fa-check-circle" aria-hidden="true"></i><span></span></div>' +
      '</div>' +
      '<div class="cc-eval-q__footer">' +
      '  <button type="button" class="ubits-button ubits-button--error-secondary ubits-button--xs cc-eval-q__delete" data-tooltip="Eliminar pregunta" data-tooltip-delay="1000">' +
      '    <i class="far fa-trash"></i><span>Eliminar</span>' +
      '  </button>' +
      '  <button type="button" class="ubits-button ubits-button--primary ubits-button--xs cc-eval-q__save">' +
      '    <i class="far fa-check"></i><span>Guardar</span>' +
      '  </button>' +
      '</div>';

    hostEl.innerHTML = '';
    hostEl.appendChild(root);
    return root;
  }

  function setRootModeClasses(root, mode) {
    root.classList.remove('is-editing', 'is-readonly', 'is-error', 'is-feedback');
    if (mode === 'edit' || mode === 'edit_error') root.classList.add('is-editing');
    else root.classList.add('is-readonly');
    if (mode === 'read_error' || mode === 'edit_error') root.classList.add('is-error');
    if (mode === 'collab_feedback') root.classList.add('is-feedback');
  }

  function buildHintHtml(text, isError) {
    return '<i class="far fa-circle-info" aria-hidden="true"></i><span>' + esc(text) + '</span>';
  }

  function countCorrectFromModel(model) {
    if (!model) return 0;
    if (model.type === 'multiple_choice_single' || model.type === 'multiple_choice_multiple') {
      return (model.options || []).filter(function (o) { return o && o.correct; }).length;
    }
    if (model.type === 'true_false') return model.trueFalseCorrect ? 1 : 0;
    return 0;
  }

  function validateModel(model) {
    var t = model.type;
    var missing = {};
    function miss(k) { missing[k] = true; }

    if (t !== 'instruction') {
      if (!String(model.statement || '').trim()) miss('statement');
    }

    if (t === 'instruction') {
      if (!String(model.instructionHtml || '').replace(/<[^>]+>/g, '').trim()) miss('instruction');
    }

    if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
      var opts = model.options || [];
      if (opts.length < 2) miss('options');
      for (var i = 0; i < opts.length; i++) {
        if (!String((opts[i] && opts[i].text) || '').trim()) miss('options_text');
      }
      var cc = countCorrectFromModel(model);
      if (cc < 1) miss('correct');
      if (t === 'multiple_choice_single' && cc !== 1) miss('correct_single');
    }

    if (t === 'true_false') {
      if (!model.trueFalseCorrect) miss('correct');
    }

    if (t === 'short_answer') {
      if (!String(model.shortAnswer && model.shortAnswer.answer || '').trim()) miss('short_answer');
    }

    if (t === 'essay') {
      var mw = String(model.essay && model.essay.minWords || '').trim();
      if (mw) {
        var n = parseInt(mw, 10);
        if (isNaN(n) || n < 1 || n > 100) miss('essay_min_words');
      }
    }

    if (t === 'matching') {
      var pairs = model.pairs || [];
      if (pairs.length < 2) miss('pairs');
      for (var p = 0; p < pairs.length; p++) {
        if (!String(pairs[p].a || '').trim() || !String(pairs[p].b || '').trim()) miss('pairs_text');
      }
    }

    if (t === 'fill_blank') {
      var markers = parseFillBlankMarkers(model.statement || '');
      if (!markers.length) miss('fill_markers');
      var fb = (model.fillBlank && model.fillBlank.options) ? model.fillBlank.options : [];
      if (fb.length < 2) miss('fill_options');
      for (var f = 0; f < fb.length; f++) {
        if (!String(fb[f] || '').trim()) miss('fill_options_text');
      }
      for (var m = 0; m < markers.length; m++) {
        if (markers[m] < 1 || markers[m] > fb.length) miss('fill_markers_range');
      }
    }

    if (t === 'rating_scale') {
      var minV = parseInt(String(model.rating && model.rating.min || ''), 10);
      var maxV = parseInt(String(model.rating && model.rating.max || ''), 10);
      if (isNaN(minV) || isNaN(maxV) || maxV <= minV) miss('rating_range');
    }

    return { ok: Object.keys(missing).length === 0, missing: missing };
  }

  function mount(hostEl, options) {
    if (!hostEl) return null;
    options = options || {};
    var qId = options.qId != null ? Number(options.qId) : 1;
    var mode = String(options.mode || 'read');
    var model = normalizeModel(options.model, qId);

    var root = createDom(hostEl, qId);
    var iconEl = root.querySelector('.cc-eval-q__type-icon');
    var modeMount = root.querySelector('.cc-eval-q__mode-mount');
    var hintEl = root.querySelector('.cc-eval-q__hint');
    var deleteBtn = root.querySelector('.cc-eval-q__delete');
    var saveBtn = root.querySelector('.cc-eval-q__save');
    var feedbackEl = root.querySelector('.cc-eval-q__feedback');
    var feedbackTextEl = feedbackEl ? feedbackEl.querySelector('span') : null;

    var inputApis = {}; // statement/type/...

    function teardown() {
      if (!modeMount) return;
      modeMount.innerHTML = '';
      inputApis = {};
    }

    function setHint(text, visible, isError) {
      if (!hintEl) return;
      hintEl.style.display = visible ? '' : 'none';
      hintEl.classList.toggle('is-error', !!isError);
      if (visible) hintEl.innerHTML = buildHintHtml(text, isError);
    }

    function refreshHintForCorrectness() {
      var t = model.type;
      if (!(t === 'multiple_choice_single' || t === 'multiple_choice_multiple' || t === 'true_false')) {
        setHint('', false, false);
        return;
      }
      var correctCount = countCorrectFromModel(model);
      var needsHint = correctCount < 1;
      if (!needsHint) {
        setHint('', false, false);
        return;
      }
      var base = 'Debes indicar cuál es la respuesta correcta';
      if (t === 'multiple_choice_multiple') base = 'Debes indicar cuáles son las respuestas correctas';
      if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
        base = 'Debes tener al menos dos opciones y ' + (t === 'multiple_choice_multiple' ? 'marcar las correctas' : 'una marcada como correcta');
      }
      var isErr = (mode === 'edit_error' && needsHint);
      setHint(base, true, isErr);
    }

    function applyInvalidStatesFromValidation() {
      var v = validateModel(model);
      if (mode !== 'edit_error') return v;
      // Solo marcamos invalid en campos que siguen vacíos/incorrectos
      if (inputApis.statement && v.missing.statement) inputApis.statement.setState('invalid');
      if (inputApis.shortAnswer && (v.missing.short_answer)) inputApis.shortAnswer.setState('invalid');
      if (inputApis.essayMinWords && v.missing.essay_min_words) inputApis.essayMinWords.setState('invalid');
      if (inputApis.ratingMin && v.missing.rating_range) inputApis.ratingMin.setState('invalid');
      if (inputApis.ratingMax && v.missing.rating_range) inputApis.ratingMax.setState('invalid');
      return v;
    }

    function renderEdit() {
      teardown();
      if (!modeMount) return;

      // Tipo de pregunta
      var typeWrapId = 'cc-eval-q-' + qId + '-type-wrap';
      var stmtWrapId = 'cc-eval-q-' + qId + '-stmt-wrap';
      modeMount.innerHTML =
        '<div class="cc-eval-q__type">' +
        '  <div id="' + typeWrapId + '"></div>' +
        '</div>' +
        '<div id="' + stmtWrapId + '"></div>' +
        '<div class="cc-eval-q__options" id="cc-eval-q-' + qId + '-options"></div>' +
        '<div class="cc-eval-q__edit-actions" id="cc-eval-q-' + qId + '-actions"></div>';

      if (typeof global.createInput === 'function') {
        inputApis.type = global.createInput({
          containerId: typeWrapId,
          type: 'select',
          size: 'md',
          label: 'Tipo de pregunta',
          showLabel: true,
          value: model.type,
          placeholder: 'Selecciona un tipo',
          selectOptions: [
            { value: 'multiple_choice_single', text: 'Opción múltiple, única respuesta' },
            { value: 'multiple_choice_multiple', text: 'Opción múltiple, múltiple respuesta' },
            { value: 'true_false', text: 'Verdadero / Falso' },
            { value: 'instruction', text: 'Instrucción' },
            { value: 'short_answer', text: 'Pregunta corta' },
            { value: 'essay', text: 'Ensayo' },
            { value: 'matching', text: 'Emparejamiento' },
            { value: 'fill_blank', text: 'Palabra faltante' },
            { value: 'rating_scale', text: 'Escala de valoración' }
          ],
          onChange: function (v) {
            model.type = String(v || model.type);
            if (iconEl) iconEl.className = 'far ' + qTypeIcon(model.type) + ' cc-eval-q__type-icon';
            render();
          }
        });

        inputApis.statement = global.createInput({
          containerId: stmtWrapId,
          type: 'textarea',
          label: 'Enunciado de la pregunta',
          size: 'md',
          placeholder: model.type === 'fill_blank' ? 'Oración a completar' : 'Escribe la pregunta aquí...',
          value: model.statement,
          onChange: function (v) {
            model.statement = String(v || '');
            refreshHintForCorrectness();
          }
        });
      }

      renderTypeSpecificEdit();
      refreshHintForCorrectness();
      applyInvalidStatesFromValidation();
    }

    function renderTypeSpecificEdit() {
      var optMount = modeMount.querySelector('#cc-eval-q-' + qId + '-options');
      var actionMount = modeMount.querySelector('#cc-eval-q-' + qId + '-actions');
      if (!optMount) return;
      optMount.innerHTML = '';
      if (actionMount) actionMount.innerHTML = '';

      // Instrucción (sin statement textarea)
      if (model.type === 'instruction') {
        var instId = 'cc-eval-q-' + qId + '-inst-editor';
        if (inputApis.statement) {
          var stmtWrap = modeMount.querySelector('#cc-eval-q-' + qId + '-stmt-wrap');
          if (stmtWrap) stmtWrap.style.display = 'none';
        }
        optMount.innerHTML =
          '<div class="cc-exam-instruction-block">' +
          '  <div class="cc-exam-instruction-toolbar">' +
          '    <button type="button" class="cc-exam-rt-btn" data-cmd="bold" aria-label="Negrita"><i class="far fa-bold"></i></button>' +
          '    <button type="button" class="cc-exam-rt-btn" data-cmd="italic" aria-label="Cursiva"><i class="far fa-italic"></i></button>' +
          '    <button type="button" class="cc-exam-rt-btn" data-cmd="underline" aria-label="Subrayado"><i class="far fa-underline"></i></button>' +
          '    <span class="cc-exam-rt-sep" aria-hidden="true"></span>' +
          '    <button type="button" class="cc-exam-rt-btn" data-cmd="insertOrderedList" aria-label="Lista ordenada"><i class="far fa-list-ol"></i></button>' +
          '    <button type="button" class="cc-exam-rt-btn" data-cmd="insertUnorderedList" aria-label="Lista no ordenada"><i class="far fa-list-ul"></i></button>' +
          '  </div>' +
          '  <div class="cc-exam-instruction-editor ubits-body-sm-regular" id="' + instId + '" contenteditable="true" data-placeholder="Escribe una instrucción para el estudiante..."></div>' +
          '</div>';
        var editor = optMount.querySelector('#' + instId);
        if (editor) {
          editor.innerHTML = model.instructionHtml || '';
          editor.addEventListener('input', function () {
            model.instructionHtml = String(editor.innerHTML || '');
          });
        }
        optMount.querySelectorAll('.cc-exam-rt-btn').forEach(function (btn) {
          var cmd = btn.getAttribute('data-cmd');
          if (!cmd) return;
          btn.addEventListener('mousedown', function (e) {
            e.preventDefault();
            if (editor) editor.focus();
            try { document.execCommand(cmd, false, null); } catch (err) {}
          });
        });
        return;
      }

      // Restaurar statement si estaba oculto
      var stmtWrap2 = modeMount.querySelector('#cc-eval-q-' + qId + '-stmt-wrap');
      if (stmtWrap2) stmtWrap2.style.display = '';

      // Verdadero/Falso
      if (model.type === 'true_false') {
        optMount.innerHTML =
          ['Verdadero', 'Falso'].map(function (label, idx) {
            var val = idx === 0 ? 'true' : 'false';
            return (
              '<div class="cc-eval-q__opt-row cc-eval-q__opt-row--static">' +
              '<label class="ubits-radio ubits-radio--sm cc-eval-q__opt-correct" title="Marcar como correcta">' +
              '<input type="radio" class="ubits-radio__input cc-eval-q__opt-check" name="q-' + qId + '-correct" value="' + val + '" aria-label="Marcar como correcta">' +
              '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
              '<span class="ubits-radio__label ubits-body-sm-regular">' + esc(label) + '</span>' +
              '</label>' +
              '</div>'
            );
          }).join('');
        var checked = optMount.querySelector('input[name="q-' + qId + '-correct"][value="' + esc(model.trueFalseCorrect) + '"]');
        if (checked) checked.checked = true;
        optMount.querySelectorAll('input[name="q-' + qId + '-correct"]').forEach(function (inp) {
          inp.addEventListener('change', function () {
            model.trueFalseCorrect = inp.checked ? String(inp.value || '') : '';
            refreshHintForCorrectness();
          });
        });
        refreshHintForCorrectness();
        return;
      }

      // Opción múltiple
      if (model.type === 'multiple_choice_single' || model.type === 'multiple_choice_multiple') {
        var isMulti = model.type === 'multiple_choice_multiple';
        var groupName = 'q-' + qId + '-correct';
        (model.options || []).forEach(function (o, idx) {
          var optNum = idx + 1;
          var row = document.createElement('div');
          row.className = 'cc-eval-q__opt-row';
          row.setAttribute('data-opt-id', String(optNum));
          var checkHtml = isMulti
            ? '<label class="ubits-checkbox ubits-checkbox--sm cc-eval-q__opt-correct" title="Marcar como correcta">' +
              '<input type="checkbox" class="ubits-checkbox__input cc-eval-q__opt-check" name="' + groupName + '" value="' + optNum + '" aria-label="Marcar como correcta">' +
              '<span class="ubits-checkbox__box" aria-hidden="true"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
              '<span class="ubits-checkbox__label ubits-body-sm-regular" style="display:none;">Correcta</span>' +
              '</label>'
            : '<label class="ubits-radio ubits-radio--sm cc-eval-q__opt-correct" title="Marcar como correcta">' +
              '<input type="radio" class="ubits-radio__input cc-eval-q__opt-check" name="' + groupName + '" value="' + optNum + '" aria-label="Marcar como correcta">' +
              '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
              '<span class="ubits-radio__label ubits-body-sm-regular" style="display:none;">Correcta</span>' +
              '</label>';
          var inputWrapId = 'cc-eval-opt-' + qId + '-' + optNum + '-wrap';
          row.innerHTML =
            checkHtml +
            '<div id="' + inputWrapId + '" class="cc-eval-q__opt-text"></div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only cc-eval-q__opt-del" aria-label="Eliminar opción">' +
            '  <i class="far fa-times"></i>' +
            '</button>';
          optMount.appendChild(row);
          if (typeof global.createInput === 'function') {
            var api = global.createInput({
              containerId: inputWrapId,
              type: 'text',
              label: '',
              showLabel: false,
              size: 'sm',
              placeholder: 'Escribe una opción de respuesta',
              value: o.text,
              onChange: function (v) {
                model.options[idx].text = String(v || '');
              }
            });
            inputApis['opt_' + optNum] = api;
          }
          var chk = row.querySelector('.cc-eval-q__opt-check');
          if (chk) chk.checked = !!o.correct;
          if (chk) {
            chk.addEventListener('change', function () {
              if (!isMulti) {
                model.options.forEach(function (x, xi) { x.correct = (xi === idx) ? chk.checked : false; });
                // refrescar el resto
                optMount.querySelectorAll('.cc-eval-q__opt-row').forEach(function (r) {
                  var rid = parseInt(r.getAttribute('data-opt-id') || '0', 10);
                  var c = r.querySelector('.cc-eval-q__opt-check');
                  if (c && rid && model.options[rid - 1]) c.checked = !!model.options[rid - 1].correct;
                });
              } else {
                model.options[idx].correct = chk.checked;
              }
              refreshHintForCorrectness();
            });
          }
          var del = row.querySelector('.cc-eval-q__opt-del');
          if (del) {
            del.addEventListener('click', function () {
              if ((model.options || []).length <= 2) {
                if (typeof global.showToast === 'function') global.showToast('warning', 'Mínimo 2 opciones por pregunta.');
                return;
              }
              model.options.splice(idx, 1);
              render();
            });
          }
        });
        if (actionMount) {
          var addBtn = document.createElement('button');
          addBtn.type = 'button';
          addBtn.className = 'ubits-button ubits-button--secondary ubits-button--xs';
          addBtn.innerHTML = '<i class="far fa-plus"></i><span>Añadir opción de respuesta</span>';
          addBtn.addEventListener('click', function () {
            if ((model.options || []).length >= 6) {
              if (typeof global.showToast === 'function') global.showToast('warning', 'Máximo 6 opciones por pregunta.');
              return;
            }
            model.options.push({ text: '', correct: false });
            render();
          });
          actionMount.appendChild(addBtn);
        }
        refreshHintForCorrectness();
        return;
      }

      // Pregunta corta
      if (model.type === 'short_answer') {
        var wrapId = 'cc-eval-q-' + qId + '-sa-answer-wrap';
        optMount.innerHTML =
          '<div id="' + wrapId + '"></div>' +
          '<div class="cc-exam-sa-accuracy">' +
          '  <p class="ubits-body-xs-semibold cc-exam-sa-accuracy__title">Define la exactitud de la respuesta</p>' +
          '  <label class="cc-exam-sa-accuracy__opt"><input type="radio" name="q-' + qId + '-accuracy" value="exact"><span class="ubits-body-sm-regular">Exacta</span></label>' +
          '  <label class="cc-exam-sa-accuracy__opt"><input type="radio" name="q-' + qId + '-accuracy" value="ignore_accents"><span class="ubits-body-sm-regular">Ignorar acentos</span></label>' +
          '  <label class="cc-exam-sa-accuracy__opt"><input type="radio" name="q-' + qId + '-accuracy" value="any"><span class="ubits-body-sm-regular">Cualquier respuesta</span></label>' +
          '</div>';
        if (typeof global.createInput === 'function') {
          inputApis.shortAnswer = global.createInput({
            containerId: wrapId,
            type: 'text',
            label: 'Escribe la respuesta correcta',
            size: 'md',
            placeholder: 'Respuesta correcta...',
            value: model.shortAnswer.answer,
            onChange: function (v) { model.shortAnswer.answer = String(v || ''); }
          });
        }
        var acc = model.shortAnswer.accuracy || 'exact';
        var accEl = optMount.querySelector('input[name="q-' + qId + '-accuracy"][value="' + esc(acc) + '"]');
        if (accEl) accEl.checked = true;
        optMount.querySelectorAll('input[name="q-' + qId + '-accuracy"]').forEach(function (r) {
          r.addEventListener('change', function () {
            if (r.checked) model.shortAnswer.accuracy = String(r.value || 'exact');
          });
        });
        return;
      }

      // Ensayo
      if (model.type === 'essay') {
        var mwId = 'cc-eval-q-' + qId + '-essay-minwords-wrap';
        optMount.innerHTML =
          '<div id="' + mwId + '"></div>' +
          '<p class="cc-exam-essay-hint ubits-body-xs-regular">Ingresa un número entre 1 y 100 para el mínimo de palabras.</p>';
        if (typeof global.createInput === 'function') {
          inputApis.essayMinWords = global.createInput({
            containerId: mwId,
            type: 'number',
            label: 'Número mínimo de palabras (opcional)',
            size: 'md',
            min: 1,
            max: 100,
            value: model.essay.minWords,
            onChange: function (v) { model.essay.minWords = String(v || ''); }
          });
        }
        return;
      }

      // Matching
      if (model.type === 'matching') {
        var pairs = model.pairs || [];
        pairs.forEach(function (pair, idx) {
          var pairNum = idx + 1;
          var pairEl = document.createElement('div');
          pairEl.className = 'cc-exam-match-pair';
          pairEl.innerHTML =
            '<div class="cc-exam-match-pair__header">' +
            '  <span class="ubits-body-xs-semibold cc-exam-match-pair__label">Pareja ' + pairNum + '</span>' +
            '  <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Eliminar pareja"><i class="far fa-trash"></i></button>' +
            '</div>' +
            '<div id="cc-eval-match-' + qId + '-' + pairNum + '-a-wrap"></div>' +
            '<div id="cc-eval-match-' + qId + '-' + pairNum + '-b-wrap" style="margin-top:6px;"></div>';
          optMount.appendChild(pairEl);
          var delBtn = pairEl.querySelector('button');
          if (delBtn) {
            delBtn.addEventListener('click', function () {
              if ((model.pairs || []).length <= 2) {
                if (typeof global.showToast === 'function') global.showToast('warning', 'Mínimo 2 parejas.');
                return;
              }
              model.pairs.splice(idx, 1);
              render();
            });
          }
          if (typeof global.createInput === 'function') {
            var aApi = global.createInput({ containerId: 'cc-eval-match-' + qId + '-' + pairNum + '-a-wrap', type: 'text', label: '', size: 'sm', showLabel: false, placeholder: 'Escribe una opción', value: pair.a, onChange: function (v) { model.pairs[idx].a = String(v || ''); } });
            var bApi = global.createInput({ containerId: 'cc-eval-match-' + qId + '-' + pairNum + '-b-wrap', type: 'text', label: '', size: 'sm', showLabel: false, placeholder: 'Escribe su par', value: pair.b, onChange: function (v) { model.pairs[idx].b = String(v || ''); } });
            inputApis['pairA_' + pairNum] = aApi;
            inputApis['pairB_' + pairNum] = bApi;
          }
        });
        if (actionMount) {
          var addPair = document.createElement('button');
          addPair.type = 'button';
          addPair.className = 'ubits-button ubits-button--secondary ubits-button--xs';
          addPair.innerHTML = '<i class="far fa-plus"></i><span>Añadir pareja</span>';
          addPair.addEventListener('click', function () {
            model.pairs.push({ a: '', b: '' });
            render();
          });
          actionMount.appendChild(addPair);
        }
        return;
      }

      // Fill blank
      if (model.type === 'fill_blank') {
        var fb = model.fillBlank && model.fillBlank.options ? model.fillBlank.options : [];
        fb.forEach(function (txt, idx) {
          var optNum = idx + 1;
          var row = document.createElement('div');
          row.className = 'cc-exam-fb-opt-row';
          row.innerHTML =
            '<span class="cc-exam-fb-badge ubits-body-xs-semibold">{{' + optNum + '}}</span>' +
            '<div id="cc-eval-fb-' + qId + '-' + optNum + '-wrap" class="cc-exam-fb-opt-input"></div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Eliminar opción"><i class="far fa-trash"></i></button>';
          optMount.appendChild(row);
          var del = row.querySelector('button');
          if (del) {
            del.addEventListener('click', function () {
              if ((model.fillBlank.options || []).length <= 2) {
                if (typeof global.showToast === 'function') global.showToast('warning', 'Mínimo 2 opciones.');
                return;
              }
              model.fillBlank.options.splice(idx, 1);
              render();
            });
          }
          if (typeof global.createInput === 'function') {
            inputApis['fb_' + optNum] = global.createInput({
              containerId: 'cc-eval-fb-' + qId + '-' + optNum + '-wrap',
              type: 'text',
              label: '',
              size: 'sm',
              showLabel: false,
              placeholder: 'Escribe una opción de respuesta',
              value: txt,
              onChange: function (v) { model.fillBlank.options[idx] = String(v || ''); }
            });
          }
        });
        if (actionMount) {
          var addFb = document.createElement('button');
          addFb.type = 'button';
          addFb.className = 'ubits-button ubits-button--secondary ubits-button--xs';
          addFb.innerHTML = '<i class="far fa-plus"></i><span>Añadir opción de respuesta</span>';
          addFb.addEventListener('click', function () {
            model.fillBlank.options.push('');
            render();
          });
          actionMount.appendChild(addFb);
        }
        // Hint siempre visible para fill blank
        setHint('Reemplaza cada palabra faltante con un marcador de doble llave y número. Usa el número de la opción correcta. Por ejemplo: {{2}}.', true, mode === 'edit_error' && (validateModel(model).missing.fill_markers || validateModel(model).missing.fill_markers_range));
        return;
      }

      // Rating scale
      if (model.type === 'rating_scale') {
        var minId = 'cc-eval-q-' + qId + '-rating-min-wrap';
        var maxId = 'cc-eval-q-' + qId + '-rating-max-wrap';
        var minLblId = 'cc-eval-q-' + qId + '-rating-minlbl-wrap';
        var maxLblId = 'cc-eval-q-' + qId + '-rating-maxlbl-wrap';
        optMount.innerHTML =
          '<div class="cc-exam-rating-config">' +
          '  <div class="cc-exam-rating-config__row">' +
          '    <div id="' + minId + '"></div>' +
          '    <div id="' + maxId + '"></div>' +
          '  </div>' +
          '  <div class="cc-exam-rating-config__row">' +
          '    <div id="' + minLblId + '"></div>' +
          '    <div id="' + maxLblId + '"></div>' +
          '  </div>' +
          '</div>';
        if (typeof global.createInput === 'function') {
          inputApis.ratingMin = global.createInput({ containerId: minId, type: 'number', label: 'Valor mínimo', size: 'sm', value: model.rating.min, min: 0, onChange: function (v) { model.rating.min = String(v || ''); } });
          inputApis.ratingMax = global.createInput({ containerId: maxId, type: 'number', label: 'Valor máximo', size: 'sm', value: model.rating.max, min: 2, onChange: function (v) { model.rating.max = String(v || ''); } });
          global.createInput({ containerId: minLblId, type: 'text', label: 'Etiqueta mínimo', size: 'sm', value: model.rating.minLabel, placeholder: 'Ej: Muy malo', onChange: function (v) { model.rating.minLabel = String(v || ''); } });
          global.createInput({ containerId: maxLblId, type: 'text', label: 'Etiqueta máximo', size: 'sm', value: model.rating.maxLabel, placeholder: 'Ej: Excelente', onChange: function (v) { model.rating.maxLabel = String(v || ''); } });
        }
        return;
      }
    }

    function renderRead(isError) {
      teardown();
      if (!modeMount) return;
      var stmt = String(model.statement || '').trim();
      var t = model.type;

      var html = '';
      if (t === 'instruction') {
        var txt = String(model.instructionHtml || '').replace(/<[^>]+>/g, '').trim();
        html += '<div class="cc-eval-q__readonly-text ubits-body-md-regular">' + esc(txt || '—') + '</div>';
      } else {
        html += '<div class="cc-eval-q__readonly-text ubits-body-md-regular">' + esc(stmt || '—') + '</div>';
      }

      // Opciones (solo texto; sin marcar correctas)
      if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
        html += '<div class="cc-eval-q__readonly-opts">';
        (model.options || []).forEach(function (o) {
          html += '<div class="cc-eval-q__readonly-opt"><span class="cc-eval-q__readonly-opt-marker" aria-hidden="true"></span><span class="cc-eval-q__readonly-opt-text ubits-body-sm-regular">' + esc(o.text || '—') + '</span></div>';
        });
        html += '</div>';
      }
      if (t === 'true_false') {
        html += '<div class="cc-eval-q__readonly-opts">';
        ['Verdadero', 'Falso'].forEach(function (lbl) {
          html += '<div class="cc-eval-q__readonly-opt"><span class="cc-eval-q__readonly-opt-marker" aria-hidden="true"></span><span class="cc-eval-q__readonly-opt-text ubits-body-sm-regular">' + esc(lbl) + '</span></div>';
        });
        html += '</div>';
      }
      if (t === 'matching') {
        html += '<div class="cc-eval-q__readonly-meta ubits-body-sm-regular">Emparejamiento (' + (model.pairs || []).length + ' parejas)</div>';
      }
      if (t === 'fill_blank') {
        html += '<div class="cc-eval-q__readonly-meta ubits-body-sm-regular">Palabra faltante (' + ((model.fillBlank && model.fillBlank.options) ? model.fillBlank.options.length : 0) + ' opciones)</div>';
      }
      if (t === 'short_answer') {
        html += '<div class="cc-eval-q__readonly-meta ubits-body-sm-regular">Pregunta corta</div>';
      }
      if (t === 'essay') {
        html += '<div class="cc-eval-q__readonly-meta ubits-body-sm-regular">Ensayo</div>';
      }
      if (t === 'rating_scale') {
        html += '<div class="cc-eval-q__readonly-meta ubits-body-sm-regular">Escala (' + esc(model.rating.min) + '–' + esc(model.rating.max) + ')</div>';
      }

      modeMount.innerHTML = html;
      setHint('', false, false);
    }

    function renderCollab(withFeedback) {
      // Por ahora: lectura + inputs de respuesta del colaborador (sin mostrar correctas)
      teardown();
      if (!modeMount) return;
      var t = model.type;

      var html = '';
      html += '<div class="cc-eval-q__readonly-text ubits-body-md-regular">' + esc(model.type === 'instruction'
        ? String(model.instructionHtml || '').replace(/<[^>]+>/g, '').trim()
        : String(model.statement || '').trim()) + '</div>';

      if (t === 'multiple_choice_single') {
        html += '<div class="cc-eval-q__options">';
        (model.options || []).forEach(function (o, idx) {
          html += '<label class="ubits-radio ubits-radio--md cc-eval-q__opt-correct">' +
            '<input type="radio" class="ubits-radio__input" name="collab-q-' + qId + '" value="' + (idx + 1) + '">' +
            '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
            '<span class="ubits-radio__label ubits-body-sm-regular">' + esc(o.text || '—') + '</span>' +
            '</label>';
        });
        html += '</div>';
      } else if (t === 'multiple_choice_multiple') {
        html += '<div class="cc-eval-q__options">';
        (model.options || []).forEach(function (o, idx) {
          html += '<label class="ubits-checkbox ubits-checkbox--md cc-eval-q__opt-correct">' +
            '<input type="checkbox" class="ubits-checkbox__input" name="collab-q-' + qId + '" value="' + (idx + 1) + '">' +
            '<span class="ubits-checkbox__box" aria-hidden="true"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
            '<span class="ubits-checkbox__label ubits-body-sm-regular">' + esc(o.text || '—') + '</span>' +
            '</label>';
        });
        html += '</div>';
      } else if (t === 'true_false') {
        html += '<div class="cc-eval-q__options">';
        ['true', 'false'].forEach(function (val, idx) {
          var lbl = idx === 0 ? 'Verdadero' : 'Falso';
          html += '<label class="ubits-radio ubits-radio--md cc-eval-q__opt-correct">' +
            '<input type="radio" class="ubits-radio__input" name="collab-q-' + qId + '" value="' + val + '">' +
            '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
            '<span class="ubits-radio__label ubits-body-sm-regular">' + esc(lbl) + '</span>' +
            '</label>';
        });
        html += '</div>';
      } else if (t === 'short_answer') {
        var ansWrap = 'cc-collab-q-' + qId + '-sa';
        html += '<div id="' + ansWrap + '"></div>';
        setTimeout(function () {
          if (typeof global.createInput === 'function') {
            global.createInput({ containerId: ansWrap, type: 'text', label: 'Tu respuesta', size: 'md', placeholder: 'Escribe tu respuesta' });
          }
        }, 0);
      } else {
        html += '<p class="ubits-body-sm-regular" style="color:var(--ubits-fg-1-medium); margin:0;">Este tipo de pregunta aún no tiene modo colaborador en el prototipo.</p>';
      }

      modeMount.innerHTML = html;
      setHint('', false, false);

      if (withFeedback) {
        // Feedback inmediato (solo demo): se evalúa contra correctas del modelo
        var inputs = modeMount.querySelectorAll('input');
        inputs.forEach(function (inp) {
          inp.addEventListener('change', function () {
            var ok = false;
            if (t === 'multiple_choice_single') {
              var pick = modeMount.querySelector('input[name="collab-q-' + qId + '"]:checked');
              var pi = pick ? parseInt(pick.value, 10) : 0;
              ok = !!(model.options && model.options[pi - 1] && model.options[pi - 1].correct);
            } else if (t === 'true_false') {
              var pick2 = modeMount.querySelector('input[name="collab-q-' + qId + '"]:checked');
              ok = pick2 ? String(pick2.value) === String(model.trueFalseCorrect) : false;
            } else if (t === 'multiple_choice_multiple') {
              ok = true;
              var checks = Array.prototype.slice.call(modeMount.querySelectorAll('input[name="collab-q-' + qId + '"]'));
              checks.forEach(function (c, idx) {
                var should = !!(model.options && model.options[idx] && model.options[idx].correct);
                if (!!c.checked !== should) ok = false;
              });
            }
            if (feedbackEl && feedbackTextEl) {
              feedbackEl.classList.toggle('is-correct', ok);
              feedbackEl.classList.toggle('is-incorrect', !ok);
              feedbackEl.querySelector('i').className = ok ? 'far fa-check-circle' : 'far fa-times-circle';
              feedbackTextEl.textContent = ok ? 'Correcto' : 'Incorrecto';
            }
          });
        });
      }
    }

    function render() {
      setRootModeClasses(root, mode);
      if (iconEl) iconEl.className = 'far ' + qTypeIcon(model.type) + ' cc-eval-q__type-icon';

      if (mode === 'edit' || mode === 'edit_error') renderEdit();
      else if (mode === 'collab' || mode === 'collab_feedback') renderCollab(mode === 'collab_feedback');
      else renderRead(mode === 'read_error');

      // Footer visible solo en edición
      var footer = root.querySelector('.cc-eval-q__footer');
      if (footer) footer.style.display = (mode === 'edit' || mode === 'edit_error') ? '' : 'none';

      // Error row visible por CSS cuando is-error
      // Feedback visible por CSS cuando is-feedback
      refreshHintForCorrectness();
    }

    function setMode(nextMode) {
      mode = String(nextMode || 'read');
      render();
    }

    function getModel() {
      return normalizeModel(model, qId);
    }

    function validate() {
      var v = validateModel(model);
      applyInvalidStatesFromValidation();
      return v;
    }

    // Wiring: focus request
    root.addEventListener('click', function (e) {
      var t = e && e.target;
      // Evitar que botones internos disparen focus request redundante
      if (t && t.closest && (t.closest('button') || t.closest('input') || t.closest('textarea'))) return;
      if (typeof options.onRequestFocus === 'function') options.onRequestFocus(qId);
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (typeof options.onRequestFocus === 'function') options.onRequestFocus(qId);
      }
    });

    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        if (typeof options.onDelete === 'function') options.onDelete(qId);
      });
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        // Guardar solo valida; el builder decide persistencia global
        var v = validate();
        if (v.ok) {
          if (typeof global.showToast === 'function') global.showToast('success', 'Cambios guardados.');
        } else {
          if (typeof global.showToast === 'function') global.showToast('warning', 'Campos sin diligenciar.');
        }
      });
    }

    render();

    return {
      el: root,
      setMode: setMode,
      getModel: getModel,
      validate: validate
    };
  }

  global.CC_EVAL_QUESTION = {
    mount: mount,
    validateModel: validateModel
  };
})(typeof window !== 'undefined' ? window : this);

