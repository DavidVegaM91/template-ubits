/**
 * Learn Question (learn-question)
 * Componente reutilizable para renderizar/editar preguntas de aprendizaje/evaluación.
 *
 * Renderizado: createLearnQuestion({ containerId, ... })
 *
 * API:
 *  - getModel()
 *  - setMode(mode)
 *  - validate()
 *
 * mode:
 *  - 'edit' | 'read' | 'read_error' | 'edit_error' | 'collab' | 'collab_feedback'
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

  function generadoConIaBadgeMarkup() {
    if (typeof global.getGeneradoConIaBadgeHtml === 'function') {
      return global.getGeneradoConIaBadgeHtml();
    }
    return (
      '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs ubits-badge-tag--with-icon learn-question__ia-badge" role="status">' +
      '<i class="far fa-sparkles"></i>' +
      '<span class="ubits-badge-tag__text">Generado con IA</span></span>'
    );
  }

  function normalizeModel(model, qId) {
    var m = model && typeof model === 'object' ? model : {};
    var type = String(m.type || 'multiple_choice_single');
    var out = {
      id: qId,
      type: type,
      generatedByAi: !!(m.generatedByAi),
      statement: String(m.statement || ''),
      instructionHtml: String(m.instructionHtml || ''),
      options: Array.isArray(m.options) ? m.options.map(function (o) {
        return { text: String((o && o.text) || ''), correct: !!(o && o.correct) };
      }) : [],
      trueFalseCorrect: String(m.trueFalseCorrect || ''),
      shortAnswer: m.shortAnswer ? { answer: String(m.shortAnswer.answer || ''), accuracy: String(m.shortAnswer.accuracy || 'exact') } : { answer: '', accuracy: 'exact' },
      essay: m.essay ? { minWords: String(m.essay.minWords || '') } : { minWords: '' },
      pairs: Array.isArray(m.pairs) ? m.pairs.map(function (p) { return { a: String((p && p.a) || ''), b: String((p && p.b) || '' ) }; }) : [],
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

    if (type === 'multiple_choice_single' || type === 'multiple_choice_multiple') {
      if (out.options.length < 2) out.options = [{ text: '', correct: false }, { text: '', correct: false }];
    }
    if (type === 'matching') {
      if (out.pairs.length < 2) out.pairs = [{ a: '', b: '' }, { a: '', b: '' }];
    }
    if (type === 'fill_blank') {
      if (!out.fillBlank.options || out.fillBlank.options.length < 2) out.fillBlank.options = ['', ''];
    }
    return out;
  }

  function countCorrect(model) {
    if (!model) return 0;
    if (model.type === 'multiple_choice_single' || model.type === 'multiple_choice_multiple') {
      return (model.options || []).filter(function (o) { return o && o.correct; }).length;
    }
    if (model.type === 'true_false') return model.trueFalseCorrect ? 1 : 0;
    return 0;
  }

  function validateLearnQuestionModel(model) {
    var t = model.type;
    var missing = {};
    function miss(k) { missing[k] = true; }

    if (t !== 'instruction') {
      if (!String(model.statement || '').trim()) miss('statement');
    } else {
      if (!String(model.instructionHtml || '').replace(/<[^>]+>/g, '').trim()) miss('instruction');
    }

    if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
      var opts = model.options || [];
      if (opts.length < 2) miss('options');
      for (var i = 0; i < opts.length; i++) {
        if (!String((opts[i] && opts[i].text) || '').trim()) miss('options_text');
      }
      var cc = countCorrect(model);
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

  function createLearnQuestion(options) {
    options = options || {};
    var containerId = options.containerId;
    if (!containerId) return null;
    var host = document.getElementById(containerId);
    if (!host) return null;

    var qId = options.qId != null ? Number(options.qId) : 1;
    var mode = String(options.mode || 'read');
    var model = normalizeModel(options.model, qId);

    var root = document.createElement('div');
    root.className = 'learn-question learn-question--readonly';
    root.setAttribute('data-learn-question', 'true');
    root.setAttribute('data-q-id', String(qId));
    root.tabIndex = 0;

    root.innerHTML =
      '<div class="learn-question__header">' +
      '  <span class="learn-question__badge">' +
      '    <i class="far ' + qTypeIcon(model.type) + ' learn-question__type-icon" aria-hidden="true"></i>' +
      '    <span class="learn-question__title-cluster">' +
      '      <span class="ubits-body-sm-semibold learn-question__num">Pregunta ' + qId + '</span>' +
      (model.generatedByAi ? generadoConIaBadgeMarkup() : '') +
      '    </span>' +
      '  </span>' +
      '  <button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--sm ubits-button--icon-only learn-question__delete" aria-label="Eliminar pregunta" data-tooltip="Eliminar pregunta" data-tooltip-delay="1000">' +
      '    <i class="far fa-trash"></i>' +
      '  </button>' +
      '</div>' +
      '<div class="learn-question__body">' +
      '  <div class="learn-question__mode-mount"></div>' +
      '  <p class="learn-question__hint ubits-body-xs-regular" style="display:none;"></p>' +
      '</div>';

    host.innerHTML = '';
    host.appendChild(root);

    // Helper de error (debajo del contenedor, estilo File Upload)
    var helper = document.createElement('p');
    helper.className = 'ubits-body-sm-regular learn-question__helper';
    helper.setAttribute('data-learn-question-helper', 'true');
    helper.style.display = 'none';
    helper.innerHTML =
      '<span class="learn-question__helper-msg">' +
      '  <i class="far fa-circle-exclamation" aria-hidden="true"></i>' +
      '  <span>Campos sin diligenciar</span>' +
      '</span>';
    host.appendChild(helper);

    var iconEl = root.querySelector('.learn-question__type-icon');
    var modeMount = root.querySelector('.learn-question__mode-mount');
    var hintEl = root.querySelector('.learn-question__hint');
    var bodyEl = root.querySelector('.learn-question__body');
    var deleteBtn = root.querySelector('.learn-question__delete');

    var inputApis = {};

    function teardown() {
      if (!modeMount) return;
      modeMount.innerHTML = '';
      inputApis = {};
      // Asegurar que el hint vuelva a su "home" (debajo de modeMount) para modos lectura/colaborador.
      if (bodyEl && hintEl && hintEl.parentNode && hintEl.parentNode !== bodyEl) {
        bodyEl.appendChild(hintEl);
      }
    }

    function setRootModeClasses() {
      root.classList.remove('learn-question--editing', 'learn-question--readonly', 'learn-question--error', 'learn-question--feedback');
      if (mode === 'edit' || mode === 'edit_error') root.classList.add('learn-question--editing');
      else root.classList.add('learn-question--readonly');
      if (mode === 'read_error' || mode === 'edit_error') root.classList.add('learn-question--error');
      if (mode === 'collab_feedback') root.classList.add('learn-question--feedback');
    }

    function setHint(text, visible, isError) {
      if (!hintEl) return;
      hintEl.style.display = visible ? '' : 'none';
      hintEl.classList.toggle('learn-question__hint--error', !!isError);
      if (!visible) return;
      hintEl.innerHTML = '<i class="far fa-circle-info" aria-hidden="true"></i><span>' + esc(text) + '</span>';
    }

    function refreshHintCorrectness() {
      // Colaborador: el texto informativo debe estar encima de las opciones.
      if (mode === 'collab' || mode === 'collab_feedback') {
        var tCollab = model.type;
        if (tCollab === 'multiple_choice_multiple') {
          setHint('Selecciona una o más respuestas.', true, false);
          return;
        }
        if (tCollab === 'multiple_choice_single' || tCollab === 'true_false') {
          setHint('Selecciona una respuesta.', true, false);
          return;
        }
        setHint('', false, false);
        return;
      }

      // Regla: en modos de lectura NO se muestra el texto informativo.
      if (!(mode === 'edit' || mode === 'edit_error')) {
        setHint('', false, false);
        return;
      }
      var t = model.type;
      if (!(t === 'multiple_choice_single' || t === 'multiple_choice_multiple' || t === 'true_false')) {
        setHint('', false, false);
        return;
      }
      var correctCount = countCorrect(model);
      if (correctCount >= 1) {
        setHint('', false, false);
        return;
      }
      var msg = 'Debes indicar cuál es la respuesta correcta';
      if (t === 'multiple_choice_multiple') msg = 'Debes indicar cuáles son las respuestas correctas';
      if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
        msg = 'Debes tener al menos dos opciones y ' + (t === 'multiple_choice_multiple' ? 'marcar las correctas' : 'una marcada como correcta');
      }
      setHint(msg, true, mode === 'edit_error');
    }

    function applyInvalidStates() {
      var v = validateLearnQuestionModel(model);
      if (mode !== 'edit_error') return v;
      if (inputApis.statement && v.missing.statement) inputApis.statement.setState('invalid');
      // fill_blank: si los marcadores {{n}} están mal, el campo principal debe entrar en error
      if (inputApis.statement && (v.missing.fill_markers || v.missing.fill_markers_range)) inputApis.statement.setState('invalid');
      if (inputApis.shortAnswer && v.missing.short_answer) inputApis.shortAnswer.setState('invalid');
      if (inputApis.essayMinWords && v.missing.essay_min_words) inputApis.essayMinWords.setState('invalid');
      if (inputApis.ratingMin && v.missing.rating_range) inputApis.ratingMin.setState('invalid');
      if (inputApis.ratingMax && v.missing.rating_range) inputApis.ratingMax.setState('invalid');

      // Opciones MCQ: marcar invalid si están vacías en el caso extremo de edit_error
      if (v.missing.options_text) {
        (model.options || []).forEach(function (o, idx) {
          var api = inputApis['opt_' + (idx + 1)];
          if (api && (!o || !String(o.text || '').trim())) api.setState('invalid');
        });
      }
      // Matching: inputs vacíos
      if (v.missing.pairs_text) {
        (model.pairs || []).forEach(function (p, idx) {
          var aApi = inputApis['pairA_' + (idx + 1)];
          var bApi = inputApis['pairB_' + (idx + 1)];
          if (aApi && (!p || !String(p.a || '').trim())) aApi.setState('invalid');
          if (bApi && (!p || !String(p.b || '').trim())) bApi.setState('invalid');
        });
      }
      // Fill blank: opciones vacías
      if (v.missing.fill_options_text) {
        var fb = (model.fillBlank && model.fillBlank.options) ? model.fillBlank.options : [];
        fb.forEach(function (t, idx) {
          var api2 = inputApis['fb_' + (idx + 1)];
          if (api2 && !String(t || '').trim()) api2.setState('invalid');
        });
      }
      return v;
    }

    function updateErrorHelperFromState(validation) {
      if (!helper) return;
      // Regla: helper visible solo en modos error, y debe ir debajo del card.
      var isErrorMode = (mode === 'read_error' || mode === 'edit_error');
      if (!isErrorMode) {
        helper.style.display = 'none';
        return;
      }
      // En read_error: siempre visible. En edit_error: visible si hay faltantes.
      if (mode === 'read_error') {
        helper.style.display = 'flex';
        return;
      }
      // En edit_error: siempre visible (el modo representa el caso más extremo).
      helper.style.display = 'flex';
    }

    function renderEdit() {
      teardown();
      if (!modeMount) return;

      var typeWrapId = 'learn-q-' + qId + '-type-wrap';
      var stmtWrapId = 'learn-q-' + qId + '-stmt-wrap';

      modeMount.innerHTML =
        '<div><div id="' + typeWrapId + '"></div></div>' +
        '<div id="' + stmtWrapId + '"></div>' +
        '<div class="learn-question__options" id="learn-q-' + qId + '-options"></div>' +
        '<div id="learn-q-' + qId + '-actions"></div>';

      // El hint informativo debe ir antes de las respuestas (antes de options).
      var optEl = modeMount.querySelector('#learn-q-' + qId + '-options');
      if (hintEl && optEl) {
        modeMount.insertBefore(hintEl, optEl);
      }

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
            if (iconEl) iconEl.className = 'far ' + qTypeIcon(model.type) + ' learn-question__type-icon';
            render();
          }
        });

        inputApis.statement = global.createInput({
          containerId: stmtWrapId,
          type: 'textarea',
          label: 'Pregunta o enunciado',
          size: 'md',
          placeholder: model.type === 'fill_blank' ? 'Oración a completar' : 'Escribe la pregunta aquí...',
          value: model.statement,
          helperText: mode === 'edit_error' ? 'Campo requerido' : '',
          showHelper: mode === 'edit_error',
          onChange: function (v) {
            model.statement = String(v || '');
            refreshHintCorrectness();
          }
        });
      }

      renderTypeSpecificEdit();
      refreshHintCorrectness();
      applyInvalidStates();
    }

    function renderTypeSpecificEdit() {
      var optMount = modeMount.querySelector('#learn-q-' + qId + '-options');
      var actionMount = modeMount.querySelector('#learn-q-' + qId + '-actions');
      if (!optMount) return;
      optMount.innerHTML = '';
      if (actionMount) actionMount.innerHTML = '';

      if (model.type === 'instruction') {
        // ocultar statement
        var stmtWrap = modeMount.querySelector('#learn-q-' + qId + '-stmt-wrap');
        if (stmtWrap) stmtWrap.style.display = 'none';

        var editorId = 'learn-q-' + qId + '-inst-editor';
        optMount.innerHTML =
          '<div class="learn-question__instruction">' +
          '  <div class="learn-question__instruction-toolbar">' +
          '    <button type="button" class="learn-question__rt-btn" data-cmd="bold" aria-label="Negrita"><i class="far fa-bold"></i></button>' +
          '    <button type="button" class="learn-question__rt-btn" data-cmd="italic" aria-label="Cursiva"><i class="far fa-italic"></i></button>' +
          '    <button type="button" class="learn-question__rt-btn" data-cmd="underline" aria-label="Subrayado"><i class="far fa-underline"></i></button>' +
          '    <span class="learn-question__rt-sep" aria-hidden="true"></span>' +
          '    <button type="button" class="learn-question__rt-btn" data-cmd="insertOrderedList" aria-label="Lista ordenada"><i class="far fa-list-ol"></i></button>' +
          '    <button type="button" class="learn-question__rt-btn" data-cmd="insertUnorderedList" aria-label="Lista no ordenada"><i class="far fa-list-ul"></i></button>' +
          '  </div>' +
          '  <div class="learn-question__instruction-editor ubits-body-sm-regular" id="' + editorId + '" contenteditable="true" data-placeholder="Escribe una instrucción para el estudiante..."></div>' +
          '</div>';

        var editor = optMount.querySelector('#' + editorId);
        if (editor) {
          editor.innerHTML = model.instructionHtml || '';
          editor.addEventListener('input', function () {
            model.instructionHtml = String(editor.innerHTML || '');
          });
        }
        optMount.querySelectorAll('.learn-question__rt-btn').forEach(function (btn) {
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

      // restaurar statement
      var stmtWrap2 = modeMount.querySelector('#learn-q-' + qId + '-stmt-wrap');
      if (stmtWrap2) stmtWrap2.style.display = '';

      if (model.type === 'true_false') {
        optMount.innerHTML =
          ['Verdadero', 'Falso'].map(function (label, idx) {
            var val = idx === 0 ? 'true' : 'false';
            return (
              '<div class="learn-question__opt-row">' +
              '<label class="ubits-radio ubits-radio--sm learn-question__opt-correct" title="Marcar como correcta">' +
              '<input type="radio" class="ubits-radio__input learn-question__opt-check" name="q-' + qId + '-correct" value="' + val + '" aria-label="Marcar como correcta">' +
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
            refreshHintCorrectness();
          });
        });
        refreshHintCorrectness();
        return;
      }

      if (model.type === 'multiple_choice_single' || model.type === 'multiple_choice_multiple') {
        var isMulti = model.type === 'multiple_choice_multiple';
        var groupName = 'q-' + qId + '-correct';

        (model.options || []).forEach(function (o, idx) {
          var optNum = idx + 1;
          var row = document.createElement('div');
          row.className = 'learn-question__opt-row';
          row.setAttribute('data-opt-id', String(optNum));
          var inputWrapId = 'learn-opt-' + qId + '-' + optNum + '-wrap';
          var checkHtml = isMulti
            ? '<label class="ubits-checkbox ubits-checkbox--sm learn-question__opt-correct" title="Marcar como correcta">' +
              '<input type="checkbox" class="ubits-checkbox__input learn-question__opt-check" name="' + groupName + '" value="' + optNum + '" aria-label="Marcar como correcta">' +
              '<span class="ubits-checkbox__box" aria-hidden="true"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
              '<span class="ubits-checkbox__label ubits-body-sm-regular" style="display:none;">Correcta</span>' +
              '</label>'
            : '<label class="ubits-radio ubits-radio--sm learn-question__opt-correct" title="Marcar como correcta">' +
              '<input type="radio" class="ubits-radio__input learn-question__opt-check" name="' + groupName + '" value="' + optNum + '" aria-label="Marcar como correcta">' +
              '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
              '<span class="ubits-radio__label ubits-body-sm-regular" style="display:none;">Correcta</span>' +
              '</label>';
          row.innerHTML =
            checkHtml +
            '<div id="' + inputWrapId + '" class="learn-question__opt-text"></div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Eliminar opción"><i class="far fa-times"></i></button>';
          optMount.appendChild(row);

          if (typeof global.createInput === 'function') {
            inputApis['opt_' + optNum] = global.createInput({
              containerId: inputWrapId,
              type: 'text',
              label: '',
              showLabel: false,
              size: 'sm',
              placeholder: 'Opción de respuesta',
              value: o.text,
              helperText: mode === 'edit_error' ? 'Campo requerido' : '',
              showHelper: mode === 'edit_error',
              onChange: function (v) { model.options[idx].text = String(v || ''); }
            });
          }

          var chk = row.querySelector('.learn-question__opt-check');
          if (chk) chk.checked = !!o.correct;
          if (chk) {
            chk.addEventListener('change', function () {
              if (!isMulti) {
                model.options.forEach(function (x, xi) { x.correct = (xi === idx) ? chk.checked : false; });
                optMount.querySelectorAll('.learn-question__opt-row').forEach(function (r) {
                  var rid = parseInt(r.getAttribute('data-opt-id') || '0', 10);
                  var c = r.querySelector('.learn-question__opt-check');
                  if (c && rid && model.options[rid - 1]) c.checked = !!model.options[rid - 1].correct;
                });
              } else {
                model.options[idx].correct = chk.checked;
              }
              refreshHintCorrectness();
            });
          }

          var delBtn = row.querySelector('button');
          if (delBtn) {
            delBtn.addEventListener('click', function () {
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

        refreshHintCorrectness();
        return;
      }

      if (model.type === 'short_answer') {
        var wrapId = 'learn-q-' + qId + '-sa';
        optMount.innerHTML =
          '<div id="' + wrapId + '"></div>' +
          '<div class="learn-question__sa-accuracy">' +
          '  <p class="ubits-body-xs-semibold learn-question__sa-accuracy-title">Define la exactitud de la respuesta</p>' +
          '  <label class="learn-question__sa-accuracy-opt"><input type="radio" name="q-' + qId + '-accuracy" value="exact"><span class="ubits-body-sm-regular">Exacta</span></label>' +
          '  <label class="learn-question__sa-accuracy-opt"><input type="radio" name="q-' + qId + '-accuracy" value="ignore_accents"><span class="ubits-body-sm-regular">Ignorar acentos</span></label>' +
          '  <label class="learn-question__sa-accuracy-opt"><input type="radio" name="q-' + qId + '-accuracy" value="any"><span class="ubits-body-sm-regular">Cualquier respuesta</span></label>' +
          '</div>';
        if (typeof global.createInput === 'function') {
          inputApis.shortAnswer = global.createInput({
            containerId: wrapId,
            type: 'text',
            label: 'Escribe la respuesta correcta',
            size: 'md',
            placeholder: 'Respuesta correcta...',
            value: model.shortAnswer.answer,
            helperText: mode === 'edit_error' ? 'Campo requerido' : '',
            showHelper: mode === 'edit_error',
            onChange: function (v) { model.shortAnswer.answer = String(v || ''); }
          });
        }
        var acc = model.shortAnswer.accuracy || 'exact';
        var accEl = optMount.querySelector('input[name="q-' + qId + '-accuracy"][value="' + esc(acc) + '"]');
        if (accEl) accEl.checked = true;
        optMount.querySelectorAll('input[name="q-' + qId + '-accuracy"]').forEach(function (r) {
          r.addEventListener('change', function () { if (r.checked) model.shortAnswer.accuracy = String(r.value || 'exact'); });
        });
        return;
      }

      if (model.type === 'essay') {
        var mwId = 'learn-q-' + qId + '-mw';
        optMount.innerHTML =
          '<div id="' + mwId + '"></div>' +
          '<p class="learn-question__essay-hint ubits-body-xs-regular">Ingresa un número entre 1 y 100 para el mínimo de palabras.</p>';
        if (typeof global.createInput === 'function') {
          inputApis.essayMinWords = global.createInput({
            containerId: mwId,
            type: 'number',
            label: 'Número mínimo de palabras (opcional)',
            size: 'md',
            min: 1,
            max: 100,
            value: model.essay.minWords,
            helperText: mode === 'edit_error' ? 'Campo requerido' : '',
            showHelper: mode === 'edit_error',
            onChange: function (v) { model.essay.minWords = String(v || ''); }
          });
        }
        return;
      }

      if (model.type === 'matching') {
        (model.pairs || []).forEach(function (pair, idx) {
          var pairNum = idx + 1;
          var pairEl = document.createElement('div');
          pairEl.className = 'learn-question__match-pair';
          pairEl.innerHTML =
            '<div class="learn-question__match-pair-header">' +
            '  <span class="ubits-body-xs-semibold">Pareja ' + pairNum + '</span>' +
            '  <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Eliminar pareja"><i class="far fa-trash"></i></button>' +
            '</div>' +
            '<div id="learn-match-' + qId + '-' + pairNum + '-a"></div>' +
            '<div id="learn-match-' + qId + '-' + pairNum + '-b" style="margin-top:6px;"></div>';
          optMount.appendChild(pairEl);
          var del = pairEl.querySelector('button');
          if (del) {
            del.addEventListener('click', function () {
              if ((model.pairs || []).length <= 2) {
                if (typeof global.showToast === 'function') global.showToast('warning', 'Mínimo 2 parejas.');
                return;
              }
              model.pairs.splice(idx, 1);
              render();
            });
          }
          if (typeof global.createInput === 'function') {
            inputApis['pairA_' + pairNum] = global.createInput({ containerId: 'learn-match-' + qId + '-' + pairNum + '-a', type: 'text', label: '', size: 'sm', showLabel: false, placeholder: 'Escribe una opción', value: pair.a, helperText: mode === 'edit_error' ? 'Campo requerido' : '', showHelper: mode === 'edit_error', onChange: function (v) { model.pairs[idx].a = String(v || ''); } });
            inputApis['pairB_' + pairNum] = global.createInput({ containerId: 'learn-match-' + qId + '-' + pairNum + '-b', type: 'text', label: '', size: 'sm', showLabel: false, placeholder: 'Escribe su par', value: pair.b, helperText: mode === 'edit_error' ? 'Campo requerido' : '', showHelper: mode === 'edit_error', onChange: function (v) { model.pairs[idx].b = String(v || ''); } });
          }
        });
        if (actionMount) {
          var addPair = document.createElement('button');
          addPair.type = 'button';
          addPair.className = 'ubits-button ubits-button--secondary ubits-button--xs';
          addPair.innerHTML = '<i class="far fa-plus"></i><span>Añadir pareja</span>';
          addPair.addEventListener('click', function () { model.pairs.push({ a: '', b: '' }); render(); });
          actionMount.appendChild(addPair);
        }
        return;
      }

      if (model.type === 'fill_blank') {
        var fb = model.fillBlank && model.fillBlank.options ? model.fillBlank.options : [];
        fb.forEach(function (txt, idx) {
          var optNum = idx + 1;
          var row = document.createElement('div');
          row.className = 'learn-question__fb-opt-row';
          row.innerHTML =
            '<span class="learn-question__fb-badge ubits-body-xs-semibold">{{' + optNum + '}}</span>' +
            '<div id="learn-fb-' + qId + '-' + optNum + '" class="learn-question__fb-opt-input"></div>' +
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
              containerId: 'learn-fb-' + qId + '-' + optNum,
              type: 'text',
              label: '',
              size: 'sm',
              showLabel: false,
              placeholder: 'Opción de respuesta',
              value: txt,
              helperText: mode === 'edit_error' ? 'Campo requerido' : '',
              showHelper: mode === 'edit_error',
              onChange: function (v) { model.fillBlank.options[idx] = String(v || ''); }
            });
          }
        });
        if (actionMount) {
          var addFb = document.createElement('button');
          addFb.type = 'button';
          addFb.className = 'ubits-button ubits-button--secondary ubits-button--xs';
          addFb.innerHTML = '<i class="far fa-plus"></i><span>Añadir opción de respuesta</span>';
          addFb.addEventListener('click', function () { model.fillBlank.options.push(''); render(); });
          actionMount.appendChild(addFb);
        }
        // hint siempre visible para fill_blank
        var vfb = validateLearnQuestionModel(model);
        var err = mode === 'edit_error' && (vfb.missing.fill_markers || vfb.missing.fill_markers_range);
        setHint('Reemplaza cada palabra faltante con un marcador de doble llave y número. Usa el número de la opción correcta. Por ejemplo: {{2}}.', true, err);
        return;
      }

      if (model.type === 'rating_scale') {
        var minId = 'learn-q-' + qId + '-rmin';
        var maxId = 'learn-q-' + qId + '-rmax';
        var minLblId = 'learn-q-' + qId + '-rminlbl';
        var maxLblId = 'learn-q-' + qId + '-rmaxlbl';
        optMount.innerHTML =
          '<div class="learn-question__rating-config">' +
          '  <div class="learn-question__rating-row">' +
          '    <div id="' + minId + '"></div>' +
          '    <div id="' + maxId + '"></div>' +
          '  </div>' +
          '  <div class="learn-question__rating-row">' +
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

    function renderRead() {
      teardown();
      if (!modeMount) return;
      var t = model.type;
      var html = '';
      if (t === 'instruction') {
        var txt = String(model.instructionHtml || '').replace(/<[^>]+>/g, '').trim();
        html += '<div class="learn-question__readonly-text ubits-body-md-regular">' + esc(txt || (mode === 'read_error' ? 'Pregunta o enunciado' : '—')) + '</div>';
      } else {
        var stmt = String(model.statement || '').trim();
        html += '<div class="learn-question__readonly-text ubits-body-md-regular">' + esc(stmt || (mode === 'read_error' ? 'Pregunta o enunciado' : '—')) + '</div>';
      }
      if (t === 'multiple_choice_single' || t === 'multiple_choice_multiple') {
        html += '<div class="learn-question__readonly-opts">';
        (model.options || []).forEach(function (o, idx) {
          var markCorrect = !!(o && o.correct);
          var txtOpt = String((o && o.text) || '').trim();
          var fallback = mode === 'read_error' ? 'Opción de respuesta' : '—';
          if (t === 'multiple_choice_multiple') {
            html += '<label class="ubits-checkbox ubits-checkbox--sm learn-question__readonly-opt">' +
              '<input type="checkbox" class="ubits-checkbox__input" disabled ' + (markCorrect ? 'checked' : '') + '>' +
              '<span class="ubits-checkbox__box" aria-hidden="true"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
              '<span class="ubits-checkbox__label ubits-body-sm-regular">' + esc(txtOpt || fallback) + '</span>' +
              '</label>';
          } else {
            html += '<label class="ubits-radio ubits-radio--sm learn-question__readonly-opt">' +
              '<input type="radio" class="ubits-radio__input" disabled ' + (markCorrect ? 'checked' : '') + '>' +
              '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
              '<span class="ubits-radio__label ubits-body-sm-regular">' + esc(txtOpt || fallback) + '</span>' +
              '</label>';
          }
        });
        html += '</div>';
      }
      if (t === 'true_false') {
        html += '<div class="learn-question__readonly-opts">';
        var tfVal = String(model.trueFalseCorrect || '');
        ['Verdadero', 'Falso'].forEach(function (lbl, idx2) {
          var val = idx2 === 0 ? 'true' : 'false';
          var markTf = tfVal === val;
          html += '<label class="ubits-radio ubits-radio--sm learn-question__readonly-opt">' +
            '<input type="radio" class="ubits-radio__input" disabled ' + (markTf ? 'checked' : '') + '>' +
            '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
            '<span class="ubits-radio__label ubits-body-sm-regular">' + esc(lbl) + '</span>' +
            '</label>';
        });
        html += '</div>';
      }
      if (t === 'short_answer') {
        var sa = String(model.shortAnswer && model.shortAnswer.answer || '').trim();
        html += '<p class="ubits-body-sm-regular learn-question__readonly-short">' +
          '<span class="ubits-body-sm-semibold">Respuesta correcta: </span>' +
          esc(sa || '—') +
          '</p>';
      }
      modeMount.innerHTML = html;
      setHint('', false, false);
    }

    function renderCollab(withFeedback) {
      teardown();
      if (!modeMount) return;
      var t = model.type;
      var html = '';
      html += '<div class="learn-question__readonly-text ubits-body-md-regular">' + esc(t === 'instruction'
        ? String(model.instructionHtml || '').replace(/<[^>]+>/g, '').trim()
        : String(model.statement || '').trim()) + '</div>';

      function showBasicNotReady() {
        html += '<p class="ubits-body-sm-regular" style="color:var(--ubits-fg-1-medium); margin:0;">Este tipo de pregunta aún no tiene modo colaborador en el prototipo.</p>';
      }

      if (t === 'multiple_choice_single') {
        html += '<div class="learn-question__options">';
        (model.options || []).forEach(function (o, idx) {
          var feedbackSlot = withFeedback ? ('<div class="learn-question__opt-feedback-slot" data-opt-feedback-slot="' + (idx + 1) + '"></div>') : '';
          html += '<label class="ubits-radio ubits-radio--md learn-question__opt-correct">' +
            '<input type="radio" class="ubits-radio__input" name="collab-q-' + qId + '" value="' + (idx + 1) + '">' +
            '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
            '<span class="ubits-radio__label ubits-body-sm-regular">' + esc(o.text || '—') + '</span>' +
            '</label>' + feedbackSlot;
        });
        html += '</div>';
      } else if (t === 'multiple_choice_multiple') {
        html += '<div class="learn-question__options">';
        (model.options || []).forEach(function (o, idx) {
          var feedbackSlot2 = withFeedback ? ('<div class="learn-question__opt-feedback-slot" data-opt-feedback-slot="' + (idx + 1) + '"></div>') : '';
          html += '<label class="ubits-checkbox ubits-checkbox--md learn-question__opt-correct">' +
            '<input type="checkbox" class="ubits-checkbox__input" name="collab-q-' + qId + '" value="' + (idx + 1) + '">' +
            '<span class="ubits-checkbox__box" aria-hidden="true"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
            '<span class="ubits-checkbox__label ubits-body-sm-regular">' + esc(o.text || '—') + '</span>' +
            '</label>' + feedbackSlot2;
        });
        html += '</div>';
      } else if (t === 'true_false') {
        html += '<div class="learn-question__options">';
        ['true', 'false'].forEach(function (val, idx) {
          var lbl = idx === 0 ? 'Verdadero' : 'Falso';
          var feedbackSlot3 = withFeedback ? ('<div class="learn-question__opt-feedback-slot" data-opt-feedback-slot="' + val + '"></div>') : '';
          html += '<label class="ubits-radio ubits-radio--md learn-question__opt-correct">' +
            '<input type="radio" class="ubits-radio__input" name="collab-q-' + qId + '" value="' + val + '">' +
            '<span class="ubits-radio__circle" aria-hidden="true"></span>' +
            '<span class="ubits-radio__label ubits-body-sm-regular">' + esc(lbl) + '</span>' +
            '</label>' + feedbackSlot3;
        });
        html += '</div>';
      } else if (t === 'short_answer') {
        var ansWrap = 'learn-collab-q-' + qId + '-sa';
        html += '<div id="' + ansWrap + '"></div>';
        setTimeout(function () {
          if (typeof global.createInput === 'function') {
            global.createInput({ containerId: ansWrap, type: 'text', label: 'Tu respuesta', size: 'md', placeholder: 'Escribe tu respuesta' });
          }
        }, 0);
      } else {
        showBasicNotReady();
      }

      modeMount.innerHTML = html;
      // Colaborador: el hint debe ir encima de las opciones.
      var optsEl = modeMount.querySelector('.learn-question__options');
      if (optsEl && hintEl) modeMount.insertBefore(hintEl, optsEl);
      refreshHintCorrectness();

      if (withFeedback) {
        // Feedback: solo se muestra cuando se selecciona una opción, y va debajo de la opción seleccionada.
        function clearAllSlots() {
          modeMount.querySelectorAll('[data-opt-feedback-slot]').forEach(function (slot) { slot.innerHTML = ''; });
        }
        function renderSlot(key, ok) {
          clearAllSlots();
          var slot = modeMount.querySelector('[data-opt-feedback-slot="' + key + '"]');
          if (!slot) return;
          slot.innerHTML =
            '<div class="learn-question__opt-feedback ' + (ok ? 'learn-question__opt-feedback--correct' : 'learn-question__opt-feedback--incorrect') + '">' +
            '  <i class="far ' + (ok ? 'fa-check-circle' : 'fa-times-circle') + '" aria-hidden="true"></i>' +
            '  <span class="ubits-body-xs-semibold">' + (ok ? 'Correcto' : 'Incorrecto') + '</span>' +
            '</div>';
        }

        var inputs = modeMount.querySelectorAll('input');
        inputs.forEach(function (inp) {
          inp.addEventListener('change', function () {
            var ok = false;
            if (t === 'multiple_choice_single') {
              var pick = modeMount.querySelector('input[name="collab-q-' + qId + '"]:checked');
              var pi = pick ? parseInt(pick.value, 10) : 0;
              ok = !!(model.options && model.options[pi - 1] && model.options[pi - 1].correct);
              if (pick) renderSlot(String(pi), ok);
            } else if (t === 'true_false') {
              var pick2 = modeMount.querySelector('input[name="collab-q-' + qId + '"]:checked');
              ok = pick2 ? String(pick2.value) === String(model.trueFalseCorrect) : false;
              if (pick2) renderSlot(String(pick2.value), ok);
            } else if (t === 'multiple_choice_multiple') {
              ok = true;
              var checks = Array.prototype.slice.call(modeMount.querySelectorAll('input[name="collab-q-' + qId + '"]'));
              checks.forEach(function (c, idx) {
                var should = !!(model.options && model.options[idx] && model.options[idx].correct);
                if (!!c.checked !== should) ok = false;
              });
              // En multi-select, mostramos feedback debajo de la última opción tocada.
              var last = String(inp.value || '');
              if (last) renderSlot(last, ok);
            }
          });
        });
      }
    }

    function render() {
      setRootModeClasses();
      if (iconEl) iconEl.className = 'far ' + qTypeIcon(model.type) + ' learn-question__type-icon';

      if (mode === 'edit' || mode === 'edit_error') renderEdit();
      else if (mode === 'collab' || mode === 'collab_feedback') renderCollab(mode === 'collab_feedback');
      else renderRead();

      // Footer: solo edición
      refreshHintCorrectness();
      updateErrorHelperFromState();
    }

    function setMode(nextMode) {
      mode = String(nextMode || 'read');
      render();
    }

    function getModel() {
      return normalizeModel(model, qId);
    }

    function validate() {
      var v = validateLearnQuestionModel(model);
      applyInvalidStates();
      updateErrorHelperFromState(v);
      return v;
    }

    // Eventos externos
    root.addEventListener('click', function (e) {
      var t = e && e.target;
      if (!t || !t.closest) return;
      // Lectura: opciones con radio/checkbox deshabilitados; el clic debe abrir edición (onRequestFocus), no quedar bloqueado por el guard de .ubits-radio/.ubits-checkbox.
      if (t.closest('.learn-question__readonly-opt')) {
        if (typeof options.onRequestFocus === 'function') options.onRequestFocus(qId);
        e.preventDefault();
        return;
      }
      // No pedir foco si el usuario interactúa con controles internos (radio/checkbox, inputs, botones, etc.)
      if (t.closest('button') ||
        t.closest('input') ||
        t.closest('textarea') ||
        t.closest('.ubits-radio') ||
        t.closest('.ubits-checkbox') ||
        t.closest('.ubits-switch') ||
        t.closest('.ubits-dropdown-menu__content')) return;
      if (typeof options.onRequestFocus === 'function') options.onRequestFocus(qId);
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (typeof options.onRequestFocus === 'function') options.onRequestFocus(qId);
      }
    });

    if (deleteBtn) deleteBtn.addEventListener('click', function () { if (typeof options.onDelete === 'function') options.onDelete(qId); });

    render();

    return { el: root, setMode: setMode, getModel: getModel, validate: validate };
  }

  global.createLearnQuestion = createLearnQuestion;
  global.validateLearnQuestionModel = validateLearnQuestionModel;
})(typeof window !== 'undefined' ? window : this);

