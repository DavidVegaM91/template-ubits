/**
 * Flujo inmersivo «Agregar evaluación» — LMS Creator T2 (vanilla).
 * Pantalla completa sobre crear/editar (sin navegar: conserva el borrador).
 * Confirmar (≥1 pregunta) → el host crea la página. Cancelar → no nace página.
 *
 * API:
 *   openAgregarEvaluacionImmersive({ onConfirm({ draftPageKey }), onCancel? })
 *   closeAgregarEvaluacionImmersive()
 *
 * Depende: layout-immersive.css, evaluaciones-recurso.js, button.js/tooltip, toast
 */
(function (global) {
    'use strict';

    var ROOT_ID = 'cc-agregar-eval-immersive';
    var DRAFT_PAGE_KEY = 'cc-eval-add-draft';
    var BODY_OPEN_CLASS = 'cc-agregar-eval-open';

    var _onConfirm = null;
    var _onCancel = null;
    var _confirmed = false;

    function ensureRoot() {
        var root = document.getElementById(ROOT_ID);
        if (root) return root;

        root = document.createElement('div');
        root.id = ROOT_ID;
        root.setAttribute('hidden', '');
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-labelledby', 'cc-agregar-eval-title');
        root.innerHTML =
            '<div class="ubits-layout-immersive">' +
            '  <header class="ubits-layout-immersive__header" role="banner">' +
            '    <div class="ubits-layout-immersive__header-inner">' +
            '      <div class="ubits-layout-immersive__leading">' +
            '        <div class="ubits-layout-immersive__title-row">' +
            '          <span id="cc-agregar-eval-title" class="ubits-body-md-bold ubits-layout-immersive__title">Agregar evaluación</span>' +
            '        </div>' +
            '      </div>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="cc-agregar-eval-close" aria-label="Cerrar" data-tooltip="Cerrar"><i class="far fa-times" aria-hidden="true"></i></button>' +
            '    </div>' +
            '  </header>' +
            '  <main class="ubits-layout-immersive__main" id="cc-agregar-eval-main" tabindex="-1">' +
            '    <div class="cc-agregar-eval-immersive__stage ubits-layout-immersive__stage">' +
            '      <div id="cc-agregar-eval-mount" class="cc-agregar-eval-immersive__mount"></div>' +
            '    </div>' +
            '  </main>' +
            '  <footer class="ubits-layout-immersive__footer" role="contentinfo">' +
            '    <div class="ubits-layout-immersive__footer-inner">' +
            '      <div class="ubits-layout-immersive__footer-actions">' +
            '        <span class="ubits-layout-immersive__footer-grow" aria-hidden="true"></span>' +
            '        <div class="ubits-layout-immersive__footer-nav">' +
            '          <button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-agregar-eval-cancel"><span>Cancelar</span></button>' +
            '          <button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-agregar-eval-confirm" disabled aria-disabled="true"><span>Confirmar evaluación</span></button>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </footer>' +
            '</div>';
        document.body.appendChild(root);
        return root;
    }

    function getMount() {
        return document.getElementById('cc-agregar-eval-mount');
    }

    function setConfirmEnabled(enabled) {
        var btn = document.getElementById('cc-agregar-eval-confirm');
        if (!btn) return;
        btn.disabled = !enabled;
        btn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    }

    function refreshConfirmState() {
        var mount = getMount();
        var n = typeof global.ccEvalCountQuestions === 'function' ? global.ccEvalCountQuestions(mount) : 0;
        setConfirmEnabled(n >= 1);
    }

    function wireConfirmObserver(mount) {
        if (!mount || mount._ccEvalImmersiveWired) return;
        mount._ccEvalImmersiveWired = true;
        function bump() {
            setTimeout(refreshConfirmState, 0);
        }
        mount.addEventListener('click', bump);
        mount.addEventListener('input', bump);
        mount.addEventListener('change', bump);
        if (typeof MutationObserver === 'function') {
            var mo = new MutationObserver(bump);
            mo.observe(mount, { childList: true, subtree: true });
            mount._ccEvalImmersiveMo = mo;
        }
    }

    function leaveCancel() {
        if (_confirmed) return;
        var cb = _onCancel;
        teardown(true);
        if (typeof cb === 'function') cb();
    }

    function leaveConfirm() {
        var mount = getMount();
        if (typeof global.ccEvalPersistMount === 'function') {
            global.ccEvalPersistMount(mount);
        }
        var n = typeof global.ccEvalCountQuestions === 'function' ? global.ccEvalCountQuestions(mount) : 0;
        if (n < 1) {
            if (typeof global.showToast === 'function') {
                global.showToast('warning', 'Debe haber al menos una pregunta.', {
                    containerId: 'ubits-toast-container'
                });
            }
            setConfirmEnabled(false);
            return;
        }
        _confirmed = true;
        var cb = _onConfirm;
        teardown(false);
        if (typeof cb === 'function') {
            cb({ draftPageKey: DRAFT_PAGE_KEY });
        }
    }

    function teardown(clearDraft) {
        var root = document.getElementById(ROOT_ID);
        if (root) {
            root.setAttribute('hidden', '');
            var mount = getMount();
            if (mount) {
                if (mount._ccEvalImmersiveMo) {
                    try {
                        mount._ccEvalImmersiveMo.disconnect();
                    } catch (e) {}
                    mount._ccEvalImmersiveMo = null;
                }
                mount.innerHTML = '';
                mount._ccEvalImmersiveWired = false;
                mount._ccEvalRootEl = null;
            }
        }
        document.body.classList.remove(BODY_OPEN_CLASS);
        if (clearDraft && typeof global.ccEvalClearPageState === 'function') {
            global.ccEvalClearPageState(DRAFT_PAGE_KEY);
        }
        _onConfirm = null;
        _onCancel = null;
        _confirmed = false;
    }

    function closeAgregarEvaluacionImmersive() {
        teardown(true);
    }

    function openAgregarEvaluacionImmersive(opts) {
        opts = opts || {};
        /* Tras cerrar «Añadir página», un tick evita choque de overlays. */
        setTimeout(function () {
            _confirmed = false;
            _onConfirm = typeof opts.onConfirm === 'function' ? opts.onConfirm : null;
            _onCancel = typeof opts.onCancel === 'function' ? opts.onCancel : null;

            if (typeof global.ccEvalClearPageState === 'function') {
                global.ccEvalClearPageState(DRAFT_PAGE_KEY);
            }

            var root = ensureRoot();
            root.removeAttribute('hidden');
            document.body.classList.add(BODY_OPEN_CLASS);

            var mount = getMount();
            if (mount && typeof global.rcMountEvalForm === 'function') {
                global.rcMountEvalForm(mount, { pageKey: DRAFT_PAGE_KEY });
                wireConfirmObserver(mount);
            }

            setConfirmEnabled(false);

            var closeBtn = document.getElementById('cc-agregar-eval-close');
            var cancelBtn = document.getElementById('cc-agregar-eval-cancel');
            var confirmBtn = document.getElementById('cc-agregar-eval-confirm');

            if (closeBtn && !closeBtn._ccEvalImmersiveBound) {
                closeBtn._ccEvalImmersiveBound = true;
                closeBtn.addEventListener('click', leaveCancel);
            }
            if (cancelBtn && !cancelBtn._ccEvalImmersiveBound) {
                cancelBtn._ccEvalImmersiveBound = true;
                cancelBtn.addEventListener('click', leaveCancel);
            }
            if (confirmBtn && !confirmBtn._ccEvalImmersiveBound) {
                confirmBtn._ccEvalImmersiveBound = true;
                confirmBtn.addEventListener('click', leaveConfirm);
            }

            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#' + ROOT_ID + ' [data-tooltip]');
            }

            var main = document.getElementById('cc-agregar-eval-main');
            if (main && typeof main.focus === 'function') {
                try {
                    main.focus({ preventScroll: true });
                } catch (e) {
                    main.focus();
                }
            }
        }, 0);
    }

    global.openAgregarEvaluacionImmersive = openAgregarEvaluacionImmersive;
    global.closeAgregarEvaluacionImmersive = closeAgregarEvaluacionImmersive;
    global.CC_EVAL_ADD_DRAFT_PAGE_KEY = DRAFT_PAGE_KEY;
})(typeof window !== 'undefined' ? window : this);
