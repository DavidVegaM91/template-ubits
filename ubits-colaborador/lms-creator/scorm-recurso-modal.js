/**
 * LMS Creator — Modal «Agregar SCORM» + Modal edición inline + Color Picker HSV
 * Genera presentaciones Thomas-Kilmann sobre conversaciones difíciles.
 * Depende: modal.js, input.js, file-upload.js
 */
(function (global) {
    'use strict';

    var OVERLAY_ID      = 'cc-scorm-recurso-modal';
    var EDIT_OVERLAY_ID = 'cc-scorm-edit-modal';
    var SCORM_GEN_TOKEN_COST = 15;

    /* ══════════════════════════════════════
       COLOR UTILITIES
    ══════════════════════════════════════ */
    function hsvToRgb(h, s, v) {
        var c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c, r, g, b;
        if      (h<60)  {r=c;g=x;b=0;} else if (h<120) {r=x;g=c;b=0;}
        else if (h<180) {r=0;g=c;b=x;} else if (h<240) {r=0;g=x;b=c;}
        else if (h<300) {r=x;g=0;b=c;} else            {r=c;g=0;b=x;}
        return {r:Math.round((r+m)*255), g:Math.round((g+m)*255), b:Math.round((b+m)*255)};
    }

    function rgbToHsv(r,g,b) {
        r/=255;g/=255;b/=255;
        var max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
        var h, s=max===0?0:d/max, v=max;
        if (max===min) {h=0;}
        else if (max===r) {h=((g-b)/d+(g<b?6:0))/6;}
        else if (max===g) {h=((b-r)/d+2)/6;}
        else              {h=((r-g)/d+4)/6;}
        return {h:h*360, s:s, v:v};
    }

    function rgbToHex(r,g,b) { return '#'+[r,g,b].map(function(v){return ('0'+v.toString(16)).slice(-2);}).join(''); }

    function hexToRgb(hex) {
        var c=hex.replace('#','');
        if (c.length===3) c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        return {r:parseInt(c.slice(0,2),16)||0, g:parseInt(c.slice(2,4),16)||0, b:parseInt(c.slice(4,6),16)||0};
    }

    function darkenHex(hex, amt) {
        var rgb=hexToRgb(hex), hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);
        hsv.v=Math.max(0, hsv.v-amt);
        var r2=hsvToRgb(hsv.h,hsv.s,hsv.v);
        return rgbToHex(r2.r,r2.g,r2.b);
    }

    function contrastColor(hex) {
        var rgb=hexToRgb(hex);
        return (0.299*rgb.r+0.587*rgb.g+0.114*rgb.b)/255 > 0.55 ? '#1a1a2e' : '#ffffff';
    }

    function esc(s) {
        if (s==null) return '';
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ══════════════════════════════════════
       ESTADO
    ══════════════════════════════════════ */
    var _onScormReady   = null;
    var _currentPageKey = null;
    var _currentTab     = 'ia';
    var _titulo         = '';
    var _numSlides      = 6;
    var _color          = '#0C5BEF';
    var _pendingFiles   = [];
    var _pendingImgs    = [];
    var _zipFile        = null;
    var _tituloInputApi = null;
    var _stepperApi     = null;

    /* Edición por pageKey */
    var _scormDataStore = {};   /* pageKey → { slides, color, titulo, scormHtml } */

    /* Color picker state */
    var _cpH=246, _cpS=0.73, _cpV=0.90;
    var _cpPickerEl  = null;
    var _cpSwatchEl  = null;
    var _cpOnChange  = null;  /* callback(hex) */
    var _cpDragSV=false, _cpDragH=false;

    /* ══════════════════════════════════════
       TOKENS
    ══════════════════════════════════════ */
    function getTokens() { return global._ubitsAiTokenPool!=null ? global._ubitsAiTokenPool : 50; }

    function trySpendTokens(cost) {
        var cur=getTokens();
        if (cur<cost) {
            if (typeof global.showToast==='function') global.showToast('warning','No tienes suficientes tokens ('+cost+' requeridos).',{containerId:'ubits-toast-container'});
            return false;
        }
        var next=Math.max(0,cur-cost);
        global._ubitsAiTokenPool=next;
        if (typeof global.setAIPanelTokensBadgeValue==='function') global.setAIPanelTokensBadgeValue(next);
        var badge=document.getElementById('cc-scorm-modal-tokens-badge');
        if (badge) { var num=badge.querySelector('.ubits-badge-tag__token-number'); if(num) num.textContent=String(next); }
        return true;
    }

    function emitChanged(detail) { try { document.dispatchEvent(new CustomEvent('ubits-recursos-changed',{detail:detail||{}})); } catch(e){} }

    /* ══════════════════════════════════════
       COLOR PICKER
    ══════════════════════════════════════ */
    function cpSyncFromHex(hex) {
        var rgb=hexToRgb(hex), hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);
        _cpH=hsv.h; _cpS=hsv.s; _cpV=hsv.v;
    }

    function cpHex() { var rgb=hsvToRgb(_cpH,_cpS,_cpV); return rgbToHex(rgb.r,rgb.g,rgb.b); }

    function cpDrawSV(canvas, hue) {
        var ctx=canvas.getContext('2d'), w=canvas.width, h=canvas.height;
        var base=hsvToRgb(hue,1,1);
        var gH=ctx.createLinearGradient(0,0,w,0);
        gH.addColorStop(0,'#fff');
        gH.addColorStop(1,'rgb('+base.r+','+base.g+','+base.b+')');
        ctx.fillStyle=gH; ctx.fillRect(0,0,w,h);
        var gV=ctx.createLinearGradient(0,0,0,h);
        gV.addColorStop(0,'rgba(0,0,0,0)'); gV.addColorStop(1,'rgba(0,0,0,1)');
        ctx.fillStyle=gV; ctx.fillRect(0,0,w,h);
    }

    function cpDrawHue(canvas) {
        var ctx=canvas.getContext('2d'), w=canvas.width, h=canvas.height;
        var g=ctx.createLinearGradient(0,0,w,0);
        for (var i=0;i<=360;i+=30) { var c=hsvToRgb(i,1,1); g.addColorStop(i/360,'rgb('+c.r+','+c.g+','+c.b+')'); }
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    }

    function cpUpdateUI() {
        if (!_cpPickerEl) return;
        var hex=cpHex();
        var svCanvas=_cpPickerEl.querySelector('.cc-cp-sv-canvas');
        if (svCanvas) cpDrawSV(svCanvas, _cpH);
        var cur=_cpPickerEl.querySelector('.cc-cp-sv-cursor');
        if (cur) { cur.style.left=(_cpS*100)+'%'; cur.style.top=((1-_cpV)*100)+'%'; }
        var thumb=_cpPickerEl.querySelector('.cc-cp-hue-thumb');
        if (thumb) thumb.style.left=(_cpH/360*100)+'%';
        var prev=_cpPickerEl.querySelector('.cc-cp-preview-circle');
        if (prev) prev.style.background=hex;
        var hexIn=_cpPickerEl.querySelector('.cc-cp-hex-input');
        if (hexIn && document.activeElement!==hexIn) hexIn.value=hex.toUpperCase();
        if (_cpSwatchEl) _cpSwatchEl.style.background=hex;
        _color=hex;
        if (_cpOnChange) _cpOnChange(hex);
        refreshPreview();
    }

    function buildCpPanel() {
        var el=document.createElement('div');
        el.className='cc-cp-panel'; el.id='cc-cp-panel-scorm';
        el.innerHTML=
            '<div class="cc-cp-canvas-wrap">'+
                '<canvas class="cc-cp-sv-canvas" width="228" height="148"></canvas>'+
                '<div class="cc-cp-sv-cursor"></div>'+
            '</div>'+
            '<div class="cc-cp-controls">'+
                '<div class="cc-cp-left">'+
                    '<button type="button" class="cc-cp-eyedropper" title="Cuentagotas (decorativo)"><i class="far fa-eye-dropper"></i></button>'+
                    '<div class="cc-cp-preview-circle"></div>'+
                '</div>'+
                '<div class="cc-cp-hue-wrap">'+
                    '<div class="cc-cp-hue-track">'+
                        '<canvas class="cc-cp-hue-canvas" width="156" height="14"></canvas>'+
                        '<div class="cc-cp-hue-thumb"></div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div class="cc-cp-hex-area">'+
                '<span class="cc-cp-hex-label">HEX</span>'+
                '<input type="text" class="cc-cp-hex-input" maxlength="7" placeholder="#4F46E5">'+
            '</div>';
        return el;
    }

    function positionCp(trigger) {
        if (!_cpPickerEl) return;
        var rect=trigger.getBoundingClientRect(), pH=260, pW=228;
        var spaceBelow=window.innerHeight-rect.bottom;
        var top=spaceBelow>pH ? rect.bottom+6 : rect.top-pH-6;
        var left=Math.max(8, Math.min(rect.left, window.innerWidth-pW-8));
        _cpPickerEl.style.top=top+'px'; _cpPickerEl.style.left=left+'px';
    }

    function openCpPanel(swatchEl, onChangeCb) {
        closeCpPanel();
        _cpSwatchEl=swatchEl;
        _cpOnChange=onChangeCb||null;
        cpSyncFromHex(_color);
        _cpPickerEl=buildCpPanel();
        document.body.appendChild(_cpPickerEl);
        var svCanvas=_cpPickerEl.querySelector('.cc-cp-sv-canvas');
        var hueCanvas=_cpPickerEl.querySelector('.cc-cp-hue-canvas');
        if (hueCanvas) cpDrawHue(hueCanvas);
        positionCp(swatchEl);
        cpUpdateUI();
        wireCpEvents(svCanvas);
        setTimeout(function(){ document.addEventListener('mousedown',cpOutside,true); document.addEventListener('keydown',cpKey,true); },0);
    }

    function closeCpPanel() {
        if (_cpPickerEl) { _cpPickerEl.remove(); _cpPickerEl=null; }
        document.removeEventListener('mousedown',cpOutside,true);
        document.removeEventListener('keydown',cpKey,true);
        _cpOnChange=null;
    }

    function cpOutside(e) { if (_cpPickerEl && !_cpPickerEl.contains(e.target) && e.target!==_cpSwatchEl) closeCpPanel(); }
    function cpKey(e) { if (e.key==='Escape') closeCpPanel(); }

    function wireCpEvents(svCanvas) {
        if (!_cpPickerEl) return;
        var svWrap=_cpPickerEl.querySelector('.cc-cp-canvas-wrap');
        var hueTrack=_cpPickerEl.querySelector('.cc-cp-hue-track');

        svWrap.addEventListener('mousedown', function(e){ _cpDragSV=true; moveSV(e,svCanvas); });
        hueTrack.addEventListener('mousedown', function(e){ _cpDragH=true; moveHue(e); });

        document.addEventListener('mousemove', function(e){
            if (_cpDragSV) moveSV(e,svCanvas);
            if (_cpDragH)  moveHue(e);
        });
        document.addEventListener('mouseup', function(){ _cpDragSV=false; _cpDragH=false; });

        var hexIn=_cpPickerEl.querySelector('.cc-cp-hex-input');
        if (hexIn) hexIn.addEventListener('input', function(){
            var v=hexIn.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(v)) { cpSyncFromHex(v); cpUpdateUI(); }
        });
    }

    function moveSV(e, canvas) {
        var rect=canvas.getBoundingClientRect();
        _cpS=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
        _cpV=Math.max(0,Math.min(1,1-(e.clientY-rect.top)/rect.height));
        cpUpdateUI();
    }

    function moveHue(e) {
        var canvas=_cpPickerEl.querySelector('.cc-cp-hue-canvas');
        if (!canvas) return;
        var rect=canvas.getBoundingClientRect();
        _cpH=Math.max(0,Math.min(360,((e.clientX-rect.left)/rect.width)*360));
        cpUpdateUI();
    }

    /* Función global para que el iframe de edición abra el picker */
    global.ccScormOpenColorPicker = function(swatchEl, onChangeCb) { openCpPanel(swatchEl, onChangeCb); };

    /* ══════════════════════════════════════
       THOMAS-KILMANN CONTENT (5–15 slides)
    ══════════════════════════════════════ */

    /* Pool completo de 15 slides (índice 0-14) */
    function buildPool() {
        return [
            /* 0 — Intro */
            { type:'intro', icon:'fa-comments', title:'Conversaciones difíciles según Thomas-Kilmann', body:'Aprende a elegir el modo de respuesta correcto ante el conflicto' },

            /* 1 — ¿Por qué evitamos? (quote) */
            { type:'quote', title:'¿Por qué evitamos?',
              body:'El silencio parece protector, pero solo pospone lo inevitable — y transforma conflictos pequeños en grandes con el tiempo.',
              author:'Hallazgo central del modelo Thomas-Kilmann' },

            /* 2 — El modelo */
            { type:'content', icon:'fa-compass', title:'El modelo Thomas-Kilmann: 5 modos de respuesta',
              body:'Dos dimensiones definen cómo respondemos al conflicto:',
              bullets:['Asertividad: cuánto priorizas tus propias necesidades', 'Cooperación: cuánto priorizas las necesidades del otro', 'Tu punto en ese mapa define tu modo natural de respuesta'] },

            /* 3 — Competidor */
            { type:'content', icon:'fa-chess-king', title:'Modo Competidor: "Yo gano, tú pierdes"',
              bullets:['Alta asertividad, baja cooperación', 'Útil en decisiones urgentes o cuando proteges valores no negociables', 'Riesgo: deja a la otra parte sin agencia y puede generar resentimiento', 'Consejo: úsalo con consciencia, no como hábito por defecto'] },

            /* 4 — Colaborador */
            { type:'content', icon:'fa-handshake', title:'Modo Colaborador: "Ganamos juntos"',
              bullets:['Alta asertividad, alta cooperación', 'El modo ideal cuando la relación y el resultado importan por igual', 'Requiere tiempo, disposición y confianza mutua para funcionar', 'Consejo: invita a explorar intereses reales, no posiciones iniciales'] },

            /* 5 — Comprometido */
            { type:'content', icon:'fa-scale-balanced', title:'Modo Comprometido: el arte de ceder a medias',
              bullets:['Asertividad y cooperación moderadas', 'Adecuado cuando ambas partes tienen algo válido que ceder', 'La solución satisface parcialmente a todos, no plenamente a ninguno', 'Consejo: úsalo cuando el tiempo apremia y la relación es estable'] },

            /* 6 — Evasivo */
            { type:'content', icon:'fa-eye-slash', title:'Modo Evasivo: elegir no pelear (por ahora)',
              bullets:['Baja asertividad, baja cooperación', 'Estratégico cuando el momento no es el adecuado para la conversación', 'Peligroso si se usa de forma crónica: los temas no resueltos acumulan presión', 'Consejo: distingue si evitas por táctica o por miedo'] },

            /* 7 — Complaciente */
            { type:'content', icon:'fa-hand-holding-heart', title:'Modo Complaciente: ceder con intención',
              bullets:['Baja asertividad, alta cooperación', 'Valioso cuando preservar la relación supera el beneficio de "ganar"', 'Riesgo: si es un patrón, erosiona tu credibilidad y bienestar', 'Consejo: comprueba que cedes por elección, no por presión externa'] },

            /* 8 — Keypoint stat */
            { type:'keypoint', icon:'fa-chart-line', stat:'85%', statement:'de los equipos han vivido un conflicto que se agravó por no abordarlo a tiempo', desc:'Fuente: estudios de clima organizacional en LATAM, 2022–2024' },

            /* 9 — Antes de la conversación (steps) */
            { type:'steps', icon:'fa-clipboard-check', title:'Antes de la conversación: prepárate', tagLabel:'Preparación',
              bullets:['Define tu objetivo: ¿qué resultado realmente necesitas?', 'Identifica tu modo natural y evalúa si es el más adecuado', 'Anticipa las emociones de la otra persona y prepara tu respuesta', 'Elige el momento y espacio adecuados para reducir la tensión'] },

            /* 10 — Durante la conversación (steps) */
            { type:'steps', icon:'fa-ear-listen', title:'Durante la conversación: habilidades clave', tagLabel:'En práctica',
              bullets:['Escucha activa: entiende antes de responder', 'Usa "yo" en lugar de "tú": "Me preocupa" en vez de "Siempre haces"', 'Mantén el foco en el problema, no en la persona', 'Confirma lo que escuchaste: parafrasea y verifica antes de continuar'] },

            /* 11 — Cómo elegir el modo */
            { type:'content', icon:'fa-map-pin', title:'Cómo elegir tu modo Thomas-Kilmann',
              bullets:['¿La relación importa más que el resultado inmediato? → Colabora o Complace', '¿Es urgente sin tiempo para negociar? → Compite con transparencia', '¿Necesitas tiempo para pensar y calmarte? → Evade con fecha de retorno', '¿Ambos tienen algo que ganar cediendo? → Comprométete'] },

            /* 12 — Errores comunes */
            { type:'content', icon:'fa-circle-xmark', title:'Errores comunes y cómo evitarlos',
              bullets:['Escalar el tono: provoca que la otra parte entre en modo defensivo', 'Mezclar varios temas en una sola conversación (limpiar el cajón)', 'Buscar validación en lugar de solución real al problema', 'Esperar el momento perfecto… que nunca llega'] },

            /* 13 — Keypoint stat 2 */
            { type:'keypoint', icon:'fa-stopwatch', stat:'3 seg', statement:'es todo el tiempo que tiene el cerebro antes de activar el modo de amenaza en una conversación tensa', desc:'Por eso prepararse previamente cambia el resultado de cualquier conversación difícil' },

            /* 14 — Summary */
            { type:'summary', title:'Lo que aprendiste', bullets:['El modelo Thomas-Kilmann ofrece 5 modos de respuesta al conflicto', 'No hay un modo ideal universal: el contexto define la elección correcta', 'Prepararse antes cambia el resultado de cualquier conversación difícil', 'Puedes desarrollar flexibilidad para moverte entre modos según la situación'] }
        ];
    }

    /* Qué índices usar según número de slides (5–15) */
    var SLIDE_PICKS = {
        5:  [0, 2, 4, 5, 14],
        6:  [0, 2, 3, 4, 5, 14],
        7:  [0, 2, 3, 4, 5, 8, 14],
        8:  [0, 1, 2, 4, 5, 8, 9, 14],
        9:  [0, 1, 2, 3, 4, 5, 8, 11, 14],
        10: [0, 1, 2, 3, 4, 5, 6, 8, 11, 14],
        11: [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 14],
        12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 14],
        13: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14],
        14: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14],
        15: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    };

    function generateSlides(n) {
        var pool = buildPool();
        var picks = SLIDE_PICKS[Math.max(5, Math.min(15, n))] || SLIDE_PICKS[6];
        return picks.map(function(i){ return pool[i]; });
    }

    /* ══════════════════════════════════════
       SCORM HTML (vista previa y bloque)
    ══════════════════════════════════════ */
    function buildSlideHtml(slide, idx, editMode) {
        var base = '<div class="sp-slide sp-slide--'+slide.type+'" data-idx="'+idx+'">';

        if (slide.type==='intro') {
            return base +
                '<div class="sp-slide-icon"><i class="fas '+(slide.icon||'fa-comments')+'"></i></div>' +
                '<h1'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h1>' +
                '<p'+(editMode?' data-sp-key="slide-'+idx+'-body" contenteditable="true"':'')+'>'+esc(slide.body||'')+'</p>' +
                '<div class="sp-start-hint"><i class="fas fa-arrow-right"></i><span>Navega con los botones de abajo</span></div>' +
            '</div>';

        } else if (slide.type==='content') {
            var bullets=(slide.bullets||[]).map(function(b,bi){
                return '<li'+(editMode?' data-sp-key="slide-'+idx+'-bullet-'+bi+'" contenteditable="true"':'')+'>'+esc(b)+'</li>';
            }).join('');
            return base +
                '<div class="sp-slide-card">' +
                    '<div class="sp-slide-tag"><i class="fas '+(slide.icon||'fa-book-open')+'"></i>Contenido</div>' +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    (slide.body ? '<p class="sp-body-intro"'+(editMode?' data-sp-key="slide-'+idx+'-body" contenteditable="true"':'')+'>'+esc(slide.body)+'</p>' : '') +
                    (bullets ? '<ul>'+bullets+'</ul>' : '') +
                '</div>' +
            '</div>';

        } else if (slide.type==='steps') {
            var stepItems=(slide.bullets||[]).map(function(b,bi){
                return '<div class="sp-step-item">' +
                    '<div class="sp-step-num">'+(bi+1)+'</div>' +
                    '<div class="sp-step-text"'+(editMode?' data-sp-key="slide-'+idx+'-bullet-'+bi+'" contenteditable="true"':'')+'>'+esc(b)+'</div>' +
                '</div>';
            }).join('');
            return base +
                '<div class="sp-slide-card">' +
                    '<div class="sp-slide-tag"><i class="fas '+(slide.icon||'fa-list-ol')+'"></i>'+(slide.tagLabel||'Paso a paso')+'</div>' +
                    '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                    '<div class="sp-steps-list">'+stepItems+'</div>' +
                '</div>' +
            '</div>';

        } else if (slide.type==='quote') {
            return base +
                '<i class="fas fa-quote-left sp-quote-icon"></i>' +
                '<div class="sp-quote-text"'+(editMode?' data-sp-key="slide-'+idx+'-body" contenteditable="true"':'')+'>'+esc(slide.body||slide.title||'')+'</div>' +
                (slide.author ? '<div class="sp-quote-author"'+(editMode?' data-sp-key="slide-'+idx+'-author" contenteditable="true"':'')+'>— '+esc(slide.author)+'</div>' : '') +
            '</div>';

        } else if (slide.type==='keypoint') {
            return base +
                '<div class="sp-kp-icon"><i class="fas '+(slide.icon||'fa-lightbulb')+'"></i></div>' +
                '<div class="sp-kp-number"'+(editMode?' data-sp-key="slide-'+idx+'-stat" contenteditable="true"':'')+'>'+esc(slide.stat||'')+'</div>' +
                '<div class="sp-kp-statement"'+(editMode?' data-sp-key="slide-'+idx+'-statement" contenteditable="true"':'')+'>'+esc(slide.statement||'')+'</div>' +
                (slide.desc ? '<div class="sp-kp-desc"'+(editMode?' data-sp-key="slide-'+idx+'-desc" contenteditable="true"':'')+'>'+esc(slide.desc)+'</div>' : '') +
            '</div>';

        } else if (slide.type==='summary') {
            var sItems=(slide.bullets||[]).map(function(b,bi){
                return '<li'+(editMode?' data-sp-key="slide-'+idx+'-bullet-'+bi+'" contenteditable="true"':'')+'>'+
                    '<i class="fas fa-check"></i><span>'+esc(b)+'</span></li>';
            }).join('');
            return base +
                '<div class="sp-sum-check"><i class="fas fa-trophy"></i></div>' +
                '<h2'+(editMode?' data-sp-key="slide-'+idx+'-title" contenteditable="true"':'')+'>'+esc(slide.title)+'</h2>' +
                (sItems ? '<ul class="sp-sum-list">'+sItems+'</ul>' : '') +
            '</div>';
        }

        return base + '</div>';
    }

    function buildScormCss(color) {
        var rgb=hexToRgb(color), dark=darkenHex(color,0.25), ct=contrastColor(color);
        return ':root{--accent:'+color+';--ar:'+rgb.r+';--ag:'+rgb.g+';--ab:'+rgb.b+';--dark:'+dark+';--ct:'+ct+';--bg:#f8f9fc;--white:#fff;--tp:#1a1a2e;--ts:#4a4a6a;--tm:#8a8aaa;}' +
        '*{box-sizing:border-box;margin:0;padding:0;}' +
        'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--tp);height:100vh;overflow:hidden;display:flex;flex-direction:column;}' +
        '.sp-header{background:var(--white);border-bottom:1px solid rgba(0,0,0,.07);flex-shrink:0;}' +
        '.sp-pb{height:3px;background:rgba(var(--ar),var(--ag),var(--ab),.15);}' +
        '.sp-pf{height:100%;background:var(--accent);transition:width .5s cubic-bezier(.4,0,.2,1);}' +
        '.sp-hi{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;}' +
        '.sp-title{font-size:13px;font-weight:700;color:var(--tp);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%;}' +
        '.sp-ct{font-size:12px;color:var(--tm);font-weight:500;}' +
        '.sp-color-trigger{display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:var(--tm);font-weight:500;padding:3px 8px;border-radius:6px;border:1px solid rgba(0,0,0,.1);background:rgba(0,0,0,.03);transition:background .15s;}' +
        '.sp-color-trigger:hover{background:rgba(0,0,0,.07);}' +
        '.sp-color-swatch{width:14px;height:14px;border-radius:3px;background:var(--accent);border:1px solid rgba(0,0,0,.15);}' +
        '.sp-stage{flex:1;overflow:hidden;position:relative;min-height:0;}' +
        '.sp-slides{position:absolute;inset:0;}' +
        /* Slide base */
        '.sp-slide{position:absolute;inset:0;opacity:0;transform:translateX(32px);transition:opacity .35s ease,transform .35s ease;pointer-events:none;display:flex;align-items:center;justify-content:center;padding:28px 36px;gap:16px;}' +
        '.sp-slide.active{opacity:1;transform:translateX(0);pointer-events:auto;}' +
        '.sp-slide.exit-left{opacity:0;transform:translateX(-32px);}' +
        /* Intro */
        '.sp-slide--intro{background:linear-gradient(145deg,var(--accent) 0%,var(--dark) 100%);flex-direction:column;text-align:center;gap:18px;}' +
        '.sp-slide-icon{width:76px;height:76px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff;backdrop-filter:blur(8px);}' +
        '.sp-slide--intro h1{font-size:clamp(20px,4vw,32px);font-weight:800;color:#fff;line-height:1.25;max-width:520px;}' +
        '.sp-slide--intro p{font-size:14px;color:rgba(255,255,255,.8);max-width:420px;line-height:1.65;}' +
        '.sp-start-hint{display:flex;align-items:center;gap:8px;color:rgba(255,255,255,.5);font-size:12px;margin-top:2px;}' +
        /* Content + Steps: stage con fondo tintado, card centrada interior */
        '.sp-slide--content,.sp-slide--steps{background:color-mix(in srgb,var(--accent) 5%,#f2f5fb);padding:28px 36px;}' +
        '.sp-slide-card{display:flex;flex-direction:column;gap:14px;background:var(--white);border-radius:14px;box-shadow:0 6px 32px rgba(0,0,0,.09);padding:32px;border-left:4px solid var(--accent);max-width:660px;width:100%;overflow-y:auto;}' +
        '.sp-slide-tag{display:inline-flex;align-items:center;gap:7px;padding:3px 11px;border-radius:100px;background:rgba(var(--ar),var(--ag),var(--ab),.1);color:var(--accent);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}' +
        '.sp-slide-card h2{font-size:clamp(17px,3vw,24px);font-weight:800;color:var(--tp);line-height:1.3;}' +
        '.sp-body-intro{font-size:14px;color:var(--ts);line-height:1.6;}' +
        'ul{list-style:none;display:flex;flex-direction:column;gap:8px;}' +
        'ul li{display:flex;align-items:flex-start;gap:11px;font-size:13px;color:var(--ts);line-height:1.55;}' +
        'ul li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:5px;}' +
        '.sp-sum-list li::before{display:none;}' +
        /* Steps */
        '.sp-steps-list{display:flex;flex-direction:column;gap:12px;}' +
        '.sp-step-item{display:flex;align-items:flex-start;gap:14px;}' +
        '.sp-step-num{width:30px;height:30px;min-width:30px;border-radius:50%;background:var(--accent);color:var(--ct);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;}' +
        '.sp-step-text{flex:1;font-size:13px;color:var(--ts);line-height:1.6;padding-top:5px;}' +
        /* Quote */
        '.sp-slide--quote{background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 9%,#fff) 0%,color-mix(in srgb,var(--accent) 2%,#fff) 100%);flex-direction:column;text-align:center;gap:20px;}' +
        '.sp-quote-icon{font-size:56px;color:var(--accent);opacity:0.22;line-height:1;margin-bottom:-10px;}' +
        '.sp-quote-text{font-size:clamp(17px,3vw,24px);font-weight:700;font-style:italic;color:var(--tp);max-width:560px;line-height:1.55;}' +
        '.sp-quote-author{font-size:13px;color:var(--tm);font-weight:500;letter-spacing:0.03em;}' +
        /* Keypoint */
        '.sp-slide--keypoint{background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 10%,#fff) 0%,color-mix(in srgb,var(--accent) 3%,#fff) 100%);flex-direction:column;text-align:center;gap:14px;}' +
        '.sp-kp-icon{font-size:40px;color:var(--accent);}' +
        '.sp-kp-number{font-size:clamp(48px,10vw,84px);font-weight:900;color:var(--accent);line-height:1;letter-spacing:-2px;}' +
        '.sp-kp-statement{font-size:clamp(15px,2.5vw,20px);font-weight:700;color:var(--tp);max-width:500px;line-height:1.4;}' +
        '.sp-kp-desc{font-size:12px;color:var(--tm);max-width:420px;line-height:1.6;}' +
        /* Summary */
        '.sp-slide--summary{background:linear-gradient(145deg,var(--accent) 0%,var(--dark) 100%);flex-direction:column;text-align:center;gap:18px;}' +
        '.sp-sum-check{width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;}' +
        '.sp-slide--summary h2{font-size:clamp(19px,3.5vw,28px);font-weight:800;color:#fff;}' +
        '.sp-sum-list{list-style:none;display:flex;flex-direction:column;gap:9px;text-align:left;max-width:420px;}' +
        '.sp-sum-list li{display:flex;align-items:flex-start;gap:10px;color:rgba(255,255,255,.9);font-size:13px;line-height:1.55;}' +
        '.sp-sum-list li i{color:rgba(255,255,255,.65);flex-shrink:0;margin-top:2px;}' +
        '.sp-sum-list li span{flex:1;}' +
        /* Edit mode */
        '[contenteditable]:hover{outline:2px dashed rgba(var(--ar),var(--ag),var(--ab),.45);border-radius:4px;cursor:text;}' +
        '[contenteditable]:focus{outline:2px solid var(--accent);background:rgba(255,255,255,.12);border-radius:4px;}' +
        /* Footer */
        '.sp-footer{display:flex;align-items:center;justify-content:space-between;padding:11px 18px;background:var(--white);border-top:1px solid rgba(0,0,0,.06);flex-shrink:0;}' +
        '.sp-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;border:none;}' +
        '.sp-btn-p{background:#f0f0f8;color:var(--ts);}' +
        '.sp-btn-p:hover:not(:disabled){background:#e4e4f0;}' +
        '.sp-btn-n{background:var(--accent);color:var(--ct);}' +
        '.sp-btn-n:hover:not(:disabled){filter:brightness(1.08);}' +
        '.sp-btn:disabled{opacity:.4;cursor:not-allowed;}' +
        '.sp-dots{display:flex;align-items:center;gap:5px;}' +
        '.sp-dot{width:6px;height:6px;border-radius:50%;background:#d0d0e0;transition:all .3s;cursor:pointer;border:none;padding:0;}' +
        '.sp-dot.active{background:var(--accent);width:16px;border-radius:3px;}';
    }

    function buildScormScript(n, editMode) {
        return 'var cur=0,tot='+n+';' +
        'function nav(d){' +
        '  if((d<0&&cur===0)||(d>0&&cur===tot-1))return;' +
        '  var ss=document.querySelectorAll(".sp-slide"),prev=cur;' +
        '  cur=Math.max(0,Math.min(tot-1,cur+d));' +
        '  if(d>0){ss[prev].classList.add("exit-left");}' +
        '  ss[prev].classList.remove("active");' +
        '  if(d<0){' +
        '    ss[cur].style.transition="none";ss[cur].style.transform="translateX(-32px)";ss[cur].style.opacity="0";' +
        '    ss[cur].offsetHeight;' +
        '    ss[cur].style.transition="";ss[cur].style.transform="";ss[cur].style.opacity="";}' +
        '  ss[cur].classList.add("active");' +
        '  setTimeout(function(){if(d>0)ss[prev].classList.remove("exit-left");},380);' +
        '  upd();}' +
        'function gotoSlide(i){var ss=document.querySelectorAll(".sp-slide");ss[cur].classList.remove("active");cur=i;ss[cur].classList.add("active");upd();}' +
        'function upd(){' +
        '  var pf=document.getElementById("sp-pf");if(pf)pf.style.width=((cur+1)/tot*100)+"%";' +
        '  var ct=document.getElementById("sp-ct-num");if(ct)ct.textContent=(cur+1)+" / "+tot;' +
        '  document.getElementById("sp-prev").disabled=cur===0;' +
        '  document.getElementById("sp-next").disabled=cur===tot-1;' +
        '  document.querySelectorAll(".sp-dot").forEach(function(d,i){d.classList.toggle("active",i===cur);});}' +
        (editMode ? 'function openColorPicker(el){try{parent.ccScormOpenColorPicker(el,function(hex){document.documentElement.style.setProperty("--accent",hex);var sw=document.getElementById("sp-cpsw");if(sw)sw.style.background=hex;});}catch(e){}}' : '') +
        'document.addEventListener("DOMContentLoaded",function(){' +
        '  var ss=document.querySelectorAll(".sp-slide");if(ss[0])ss[0].classList.add("active");' +
        '  var dc=document.getElementById("sp-dots");' +
        '  for(var i=0;i<tot;i++){(function(idx){var d=document.createElement("button");d.className="sp-dot"+(idx===0?" active":"");d.addEventListener("click",function(){gotoSlide(idx);});dc.appendChild(d);})(i);}' +
        '  upd();});';
    }

    function generateScormHtml(titulo, slides, color, editMode) {
        var n=slides.length;
        var slidesHtml=slides.map(function(s,i){return buildSlideHtml(s,i,editMode||false);}).join('\n');
        var css=buildScormCss(color);
        var script=buildScormScript(n, editMode||false);

        var colorTrigger = editMode
            ? '<button class="sp-color-trigger" onclick="openColorPicker(this)" aria-label="Cambiar color"><div class="sp-color-swatch" id="sp-cpsw"></div><span>Color principal</span></button>'
            : '';

        return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">'+
            '<style>'+css+'</style></head><body>'+
            '<div class="sp-header">'+
                '<div class="sp-pb"><div class="sp-pf" id="sp-pf"></div></div>'+
                '<div class="sp-hi">'+
                    colorTrigger+
                    '<span class="sp-title">'+esc(titulo)+'</span>'+
                    '<span class="sp-ct" id="sp-ct-num">1 / '+n+'</span>'+
                '</div>'+
            '</div>'+
            '<div class="sp-stage"><div class="sp-slides">'+slidesHtml+'</div></div>'+
            '<div class="sp-footer">'+
                '<button class="sp-btn sp-btn-p" id="sp-prev" onclick="nav(-1)"><i class="fas fa-arrow-left"></i><span>Anterior</span></button>'+
                '<div class="sp-dots" id="sp-dots"></div>'+
                '<button class="sp-btn sp-btn-n" id="sp-next" onclick="nav(1)"><span>Siguiente</span><i class="fas fa-arrow-right"></i></button>'+
            '</div>'+
            '<script>'+script+'<\/script></body></html>';
    }

    /* ══════════════════════════════════════
       PREVIEW PASO 1 (columna derecha)
    ══════════════════════════════════════ */
    function buildPreviewHtml() {
        var col=_color, dark=darkenHex(col,0.2), ct=contrastColor(col);
        var tit=esc(_titulo||'Título del módulo');
        var n=_numSlides;
        var slides=[
            /* 0 — Intro */
            '<div class="pv-slide pv-intro">'+
                '<div class="pv-icon"><i class="fas fa-presentation-screen"></i></div>'+
                '<div class="pv-title">'+tit+'</div>'+
                '<div class="pv-badge"><i class="fas fa-layer-group"></i>'+n+' slides · Presentación</div>'+
            '</div>',
            /* 1 — Content card */
            '<div class="pv-slide pv-content">'+
                '<div class="pv-card">'+
                    '<div class="pv-tag"><i class="fas fa-book-open"></i>Contenido</div>'+
                    '<div class="pv-card-title">Punto clave del módulo</div>'+
                    '<ul class="pv-list">'+
                        '<li>Bullet con contenido de tu contexto</li>'+
                        '<li>Otro punto relevante del tema</li>'+
                        '<li>Idea adicional generada por la IA</li>'+
                    '</ul>'+
                '</div>'+
            '</div>',
            /* 2 — Summary */
            '<div class="pv-slide pv-summary">'+
                '<div class="pv-trophy"><i class="fas fa-trophy"></i></div>'+
                '<div class="pv-sum-title">Lo que aprendiste</div>'+
                '<ul class="pv-sum-list">'+
                    '<li><i class="fas fa-check"></i><span>Conclusión clave del módulo</span></li>'+
                    '<li><i class="fas fa-check"></i><span>Otro aprendizaje de tu tema</span></li>'+
                '</ul>'+
            '</div>'
        ];
        var tot=slides.length;
        return '<!DOCTYPE html><html><head><meta charset="UTF-8">'+
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">'+
        '<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8f9fc;height:100vh;display:flex;flex-direction:column;overflow:hidden;}'+
        '.ph{background:#fff;border-bottom:1px solid #eee;flex-shrink:0;}'+
        '.ph-pb{height:3px;background:rgba(0,0,0,.07);}'+
        '.ph-pf{height:100%;background:'+col+';width:33%;transition:width .4s;}'+
        '.ph-hi{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;gap:8px;}'+
        '.ph-title{font-size:11px;font-weight:700;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;}'+
        '.ph-ctr{font-size:11px;color:#aaa;flex-shrink:0;}'+
        '.pm{flex:1;overflow:hidden;position:relative;}'+
        '.pv-slide{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:12px;text-align:center;opacity:0;transform:translateX(24px);transition:opacity .3s,transform .3s;pointer-events:none;}'+
        '.pv-slide.active{opacity:1;transform:translateX(0);pointer-events:auto;}'+
        '.pv-slide.exit{opacity:0;transform:translateX(-24px);}'+
        /* Intro */
        '.pv-intro{background:linear-gradient(145deg,'+col+' 0%,'+dark+' 100%);}'+
        '.pv-icon{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;}'+
        '.pv-title{font-size:14px;font-weight:800;color:#fff;max-width:220px;line-height:1.3;}'+
        '.pv-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;background:rgba(255,255,255,.18);color:rgba(255,255,255,.9);font-size:10px;font-weight:600;}'+
        /* Content */
        '.pv-content{background:color-mix(in srgb,'+col+' 5%,#f2f5fb);}'+
        '.pv-card{background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.08);padding:18px;border-left:3px solid '+col+';width:100%;max-width:260px;text-align:left;display:flex;flex-direction:column;gap:10px;}'+
        '.pv-tag{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;background:rgba(0,0,0,.06);color:'+col+';font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}'+
        '.pv-card-title{font-size:12px;font-weight:800;color:#1a1a2e;line-height:1.35;}'+
        '.pv-list{list-style:none;display:flex;flex-direction:column;gap:5px;}'+
        '.pv-list li{font-size:10px;color:#4a4a6a;display:flex;align-items:flex-start;gap:6px;line-height:1.5;}'+
        '.pv-list li::before{content:"";width:5px;height:5px;border-radius:50%;background:'+col+';flex-shrink:0;margin-top:4px;}'+
        /* Summary */
        '.pv-summary{background:linear-gradient(145deg,'+col+' 0%,'+dark+' 100%);}'+
        '.pv-trophy{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;}'+
        '.pv-sum-title{font-size:14px;font-weight:800;color:#fff;}'+
        '.pv-sum-list{list-style:none;display:flex;flex-direction:column;gap:6px;text-align:left;max-width:220px;}'+
        '.pv-sum-list li{display:flex;align-items:flex-start;gap:7px;color:rgba(255,255,255,.9);font-size:10px;line-height:1.5;}'+
        '.pv-sum-list li i{color:rgba(255,255,255,.65);font-size:9px;margin-top:2px;flex-shrink:0;}'+
        /* Footer */
        '.pf{background:#fff;border-top:1px solid #eee;display:flex;align-items:center;justify-content:space-between;padding:7px 12px;flex-shrink:0;}'+
        '.pf-btn{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:7px;font-size:10px;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:opacity .15s;}'+
        '.pf-btn:disabled{opacity:.35;cursor:not-allowed;}'+
        '.pf-btn-p{background:#f0f0f8;color:#888;}'+
        '.pf-btn-n{background:'+col+';color:'+ct+';}'+
        '.pf-dots{display:flex;align-items:center;gap:4px;}'+
        '.pf-dot{width:5px;height:5px;border-radius:50%;background:#d0d0e0;border:none;padding:0;cursor:pointer;}'+
        '.pf-dot.a{background:'+col+';width:12px;border-radius:3px;}'+
        '</style></head><body>'+
        '<div class="ph">'+
            '<div class="ph-pb"><div class="ph-pf" id="pf-bar"></div></div>'+
            '<div class="ph-hi"><span class="ph-title">'+tit+'</span><span class="ph-ctr" id="pf-ctr">1 / '+n+'</span></div>'+
        '</div>'+
        '<div class="pm">'+slides.join('')+'</div>'+
        '<div class="pf">'+
            '<button class="pf-btn pf-btn-p" id="pf-prev" onclick="nav(-1)" disabled><i class="fas fa-arrow-left"></i><span>Anterior</span></button>'+
            '<div class="pf-dots" id="pf-dots"></div>'+
            '<button class="pf-btn pf-btn-n" id="pf-next" onclick="nav(1)"><span>Siguiente</span><i class="fas fa-arrow-right"></i></button>'+
        '</div>'+
        '<script>'+
        'var cur=0,tot='+tot+',realTot='+n+';'+
        'function nav(d){'+
        '  if((d<0&&cur===0)||(d>0&&cur===tot-1))return;'+
        '  var ss=document.querySelectorAll(".pv-slide"),prev=cur;'+
        '  cur=Math.max(0,Math.min(tot-1,cur+d));'+
        '  if(d>0){ss[prev].classList.add("exit");}'+
        '  ss[prev].classList.remove("active");'+
        '  if(d<0){ss[cur].style.transition="none";ss[cur].style.transform="translateX(-24px)";ss[cur].style.opacity="0";ss[cur].offsetHeight;ss[cur].style.transition="";ss[cur].style.transform="";ss[cur].style.opacity="";}'+
        '  ss[cur].classList.add("active");'+
        '  setTimeout(function(){if(d>0)ss[prev].classList.remove("exit");},350);'+
        '  upd();}'+
        'function upd(){'+
        '  var realCur=Math.round(cur/(tot-1)*(realTot-1))+1;'+
        '  var bar=document.getElementById("pf-bar");if(bar)bar.style.width=(realCur/realTot*100)+"%";'+
        '  var ctr=document.getElementById("pf-ctr");if(ctr)ctr.textContent=realCur+" / "+realTot;'+
        '  document.getElementById("pf-prev").disabled=cur===0;'+
        '  document.getElementById("pf-next").disabled=cur===tot-1;'+
        '  document.querySelectorAll(".pf-dot").forEach(function(d,i){d.classList.toggle("a",i===cur);});}'+
        'document.addEventListener("DOMContentLoaded",function(){'+
        '  var ss=document.querySelectorAll(".pv-slide");if(ss[0])ss[0].classList.add("active");'+
        '  var dc=document.getElementById("pf-dots");'+
        '  for(var i=0;i<tot;i++){(function(idx){var d=document.createElement("button");d.className="pf-dot"+(idx===0?" a":"");d.onclick=function(){gotoSlide(idx);};dc.appendChild(d);})(i);}'+
        '  upd();});'+
        'function gotoSlide(i){var ss=document.querySelectorAll(".pv-slide");ss[cur].classList.remove("active");cur=i;ss[cur].classList.add("active");upd();}'+
        '<\/script></body></html>';
    }

    function refreshPreview() {
        var frame=document.getElementById('cc-sm-preview-frame');
        if (!frame) return;
        frame.srcdoc=buildPreviewHtml();
    }

    /* ══════════════════════════════════════
       BLOQUE RENDERIZADO
    ══════════════════════════════════════ */
    function buildRenderedBlock(scormHtml, pageKey) {
        var editBtn = pageKey
            ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="cc-editar-scorm-recurso"><i class="far fa-pencil"></i><span>Editar SCORM</span></button>'
            : '';
        var escaped = scormHtml.replace(/"/g, '&quot;');
        return '<div class="ubits-resources-block ubits-resources-block--stack">' +
            '<div class="ubits-resources-block__surface" style="padding:0;">' +
                '<div class="cc-scorm-iframe-container">' +
                    '<iframe srcdoc="'+escaped+'" allowfullscreen></iframe>' +
                '</div>' +
            '</div>' +
            '<div class="ubits-resources-block__footer" style="display:flex;align-items:center;gap:var(--gap-sm);">' +
                editBtn +
                '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso"><i class="far fa-trash-alt"></i><span>Eliminar</span></button>' +
            '</div>' +
        '</div>';
    }

    /* ══════════════════════════════════════
       MODAL HTML BUILDERS
    ══════════════════════════════════════ */
    function buildTabBar() {
        return '<div class="cc-sm-tabbar-wrap">' +
            '<div class="cc-vmodal-tabbar" id="cc-sm-tabbar" role="tablist">' +
                '<div class="cc-vmodal-tabbar__group">' +
                    '<button type="button" class="ubits-tab ubits-tab--sm ubits-tab--active" role="tab" aria-selected="true" data-cc-stab="ia"><span>SCORM con IA</span></button>' +
                    '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-stab="subir"><span>Subir .zip</span></button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function buildIaPanel() {
        return '<div class="cc-smodal-panel" id="cc-stab-ia">' +
            '<div class="cc-sm-main-layout">' +
                '<div class="cc-sm-left-col">' +
                    /* Título */
                    '<div id="cc-sm-titulo-wrap"></div>' +
                    /* Contexto IA (igual que evaluaciones) */
                    '<div>' +
                        '<span class="cc-sm-context-label">Contexto para la IA</span>' +
                        '<div class="ubits-ia-chat-thread__input-area">' +
                            '<div class="ai-panel__input-box">' +
                                '<input type="file" id="cc-sm-files" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx" multiple hidden>' +
                                '<div class="ai-panel__pending-images-strip" id="cc-sm-pending-imgs" style="display:none;"></div>' +
                                '<div class="ai-panel__pending-files-strip" id="cc-sm-pending-files" style="display:none;"></div>' +
                                '<textarea id="cc-sm-context-input" class="ai-panel__input ubits-body-md-regular" rows="2" placeholder="Adjunta un archivo o describe el contexto específico de tu equipo o industria"></textarea>' +
                                '<div class="ai-panel__input-actions">' +
                                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ai-panel__attach-btn" id="cc-sm-attach" aria-label="Adjuntar"><i class="far fa-plus"></i></button>' +
                                    '<div class="ai-panel__input-spacer"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    /* Número de slides */
                    '<div id="cc-sm-num-stepper-wrap"></div>' +
                    /* Color */
                    '<div class="cc-sm-color-row">' +
                        '<span class="cc-sm-row-label" style="margin-bottom:0">Color principal</span>' +
                        '<button type="button" class="cc-sm-cp-swatch" id="cc-sm-cp-swatch" style="background:'+_color+';" aria-label="Seleccionar color principal"></button>' +
                    '</div>' +
                '</div>' +
                /* Columna derecha: preview */
                '<div class="cc-sm-right-col">' +
                    '<div class="cc-sm-preview-wrap">' +
                        '<iframe id="cc-sm-preview-frame" class="cc-sm-preview-iframe" srcdoc="" title="Vista previa SCORM"></iframe>' +
                    '</div>' +
                    '<p class="ubits-body-xs-regular cc-via-preview-hint">Vista previa orientativa. Las slides finales usarán tu contenido</p>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function buildSubirPanel() {
        return '<div class="cc-smodal-panel cc-smodal-panel--hidden" id="cc-stab-subir">' +
            '<div class="cc-sm-subir-layout"><div id="cc-sm-zip-fu-wrap"></div></div>' +
        '</div>';
    }

    function buildModalBody() {
        return '<div class="cc-smodal">' + buildTabBar() + buildIaPanel() + buildSubirPanel() + '</div>';
    }

    function buildModalFooterHtml() {
        return '<button type="button" class="ubits-button ubits-button--primary ubits-button--md ubits-button--with-token-cost" id="cc-sm-footer-generate">' +
                '<span class="ubits-button__token-cost" aria-hidden="true">' +
                    '<span class="ubits-button__token-number">'+SCORM_GEN_TOKEN_COST+'</span>' +
                    '<i class="far fa-coin-vertical"></i>' +
                '</span>' +
                '<span>Generar presentación</span>' +
            '</button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-sm-footer-cargar-zip" style="display:none;" disabled><span>Cargar SCORM</span></button>';
    }

    function applyAiModalChrome(overlay) {
        var titleSpan=overlay.querySelector('.ubits-modal-title');
        if (titleSpan) titleSpan.textContent = 'Agregar SCORM';

        var mc=overlay.querySelector('.ubits-modal-content');
        if (mc) {
            mc.classList.add('portada-ia-modal-content','cc-scorm-ia-modal-content');
            mc.style.backgroundColor='var(--surface-default,#FFFFFF)';
            mc.style.backgroundImage=
                'radial-gradient(ellipse 100% 80% at 10% 0%,rgba(var(--modo-ia-glow-orb-rgb-1,26,107,255),0.15) 0%,transparent 50%),'+
                'radial-gradient(ellipse 95% 78% at 50% 0%,rgba(var(--modo-ia-glow-orb-rgb-2,76,230,255),0.15) 0%,transparent 48%),'+
                'radial-gradient(ellipse 95% 75% at 90% 0%,rgba(var(--modo-ia-glow-orb-rgb-3,255,84,22),0.15) 0%,transparent 50%)';
        }
        var mh=overlay.querySelector('.ubits-modal-header');
        if (mh) { mh.style.background='transparent'; mh.style.borderBottom=''; }
        var mb=overlay.querySelector('.ubits-modal-body');
        if (mb) { mb.style.padding='var(--padding-xl)'; mb.style.overflow='hidden'; mb.style.display='flex'; mb.style.flexDirection='column'; mb.style.maxHeight=''; mb.style.flex=''; }

        var closeBtn=overlay.querySelector('.ubits-modal-close');
        var tok=getTokens();
        if (mh && closeBtn) {
            var wrap=document.createElement('div');
            wrap.style.cssText='display:inline-flex;align-items:center;gap:var(--gap-sm)';
            var badge=document.createElement('span');
            badge.id='cc-scorm-modal-tokens-badge';
            badge.className='ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs';
            badge.setAttribute('tabindex','0');
            badge.setAttribute('data-tooltip','Tokens restantes');
            badge.setAttribute('data-tooltip-delay','0');
            badge.setAttribute('data-tooltip-tap-toggle','');
            badge.setAttribute('aria-label',tok+' tokens restantes');
            badge.innerHTML='<span class="ubits-badge-tag__token-cost" aria-hidden="true"><i class="far fa-coin-vertical"></i><span class="ubits-badge-tag__token-number">'+tok+'</span></span>';
            wrap.appendChild(badge); wrap.appendChild(closeBtn); mh.appendChild(wrap);
            if (typeof global.initTooltip==='function') global.initTooltip('#cc-scorm-modal-tokens-badge');
        }
    }

    /* ══════════════════════════════════════
       INTERACTIONS — MODAL PRINCIPAL
    ══════════════════════════════════════ */
    function switchToTab(tab) {
        _currentTab=tab;
        var bar=document.getElementById('cc-sm-tabbar');
        if (bar) bar.querySelectorAll('[data-cc-stab]').forEach(function(b){
            var on=b.getAttribute('data-cc-stab')===tab;
            b.classList.toggle('ubits-tab--active',on);
            b.setAttribute('aria-selected',on?'true':'false');
        });
        ['ia','subir'].forEach(function(p){
            var el=document.getElementById('cc-stab-'+p);
            if (el) el.classList.toggle('cc-smodal-panel--hidden',p!==tab);
        });
        /* Footer: generar ↔ cargar según tab */
        var genBtn   = document.getElementById('cc-sm-footer-generate');
        var cargarBtn= document.getElementById('cc-sm-footer-cargar-zip');
        if (tab==='ia') {
            if (genBtn)    genBtn.style.display='';
            if (cargarBtn) cargarBtn.style.display='none';
        } else {
            if (genBtn)    genBtn.style.display='none';
            if (cargarBtn) cargarBtn.style.display='';
            initZipUpload();
        }
    }

    function initTituloInput() {
        if (typeof global.createInput!=='function') return;
        var wrap=document.getElementById('cc-sm-titulo-wrap');
        if (!wrap || wrap.querySelector('input')) return;
        _tituloInputApi = global.createInput({
            containerId:'cc-sm-titulo-wrap', type:'text',
            label:'Título de la presentación', placeholder:'Ej: Introducción al liderazgo', size:'md',
            mandatory: true, mandatoryType: 'obligatorio',
            showHelper: false, helperText: 'Campo requerido',
            onChange:function(v){
                _titulo=v;
                if (_tituloInputApi && v.trim()) _tituloInputApi.setState('default');
                refreshPreview();
            }
        });
        if (_titulo) { var inp=wrap.querySelector('input'); if(inp) inp.value=_titulo; }
    }

    function initStepperInput() {
        if (typeof global.createNumberStepper!=='function') return;
        var wrap=document.getElementById('cc-sm-num-stepper-wrap');
        if (!wrap || wrap.querySelector('.ubits-number-stepper')) return;
        _stepperApi = global.createNumberStepper({
            containerId: 'cc-sm-num-stepper-wrap',
            label: 'Número de slides',
            value: _numSlides, min: 5, max: 15, step: 1, size: 'md',
            onChange: function(v){ _numSlides=v; refreshPreview(); }
        });
    }

    function wireIaPanel() {
        var panel=document.getElementById('cc-stab-ia');
        if (!panel || panel._ccWired) return;
        panel._ccWired=true;

        panel.addEventListener('click', function(e) {
            var swatch=e.target.closest('#cc-sm-cp-swatch');
            if (swatch) { openCpPanel(swatch, null); return; }

            var att=e.target.closest('#cc-sm-attach');
            if (att) { var fi=document.getElementById('cc-sm-files'); if(fi) fi.click(); return; }
        });

        /* Limpiar error de contexto al escribir */
        var ctxTa=document.getElementById('cc-sm-context-input');
        if (ctxTa) ctxTa.addEventListener('input', function(){
            var box=ctxTa.closest('.ai-panel__input-box');
            if (box) box.classList.remove('ai-panel__input-box--context-error');
        });

        /* File attach */
        var fileIn=document.getElementById('cc-sm-files');
        if (fileIn) fileIn.addEventListener('change', function(){
            if (!this.files||!this.files.length) return;
            Array.prototype.forEach.call(this.files, function(f){
                if (f.type && f.type.startsWith('image/')) {
                    var reader=new FileReader();
                    reader.onload=function(e){
                        _pendingImgs.push({name:f.name, src:e.target.result});
                        renderPendingImgs();
                    };
                    reader.readAsDataURL(f);
                } else {
                    _pendingFiles.push({name:f.name, type:f.type, size:f.size});
                    renderPendingFiles();
                }
            });
            fileIn.value='';
        });
    }

    function renderPendingImgs() {
        var strip=document.getElementById('cc-sm-pending-imgs');
        if (!strip) return;
        if (!_pendingImgs.length) { strip.style.display='none'; strip.innerHTML=''; return; }
        strip.style.display='flex';
        strip.innerHTML=_pendingImgs.map(function(img,i){
            return '<div class="ai-panel__pending-img-wrap">'+
                '<img src="'+img.src+'" alt="'+esc(img.name)+'">'+
                '<button type="button" class="ai-panel__pending-img-remove" data-sm-rm-img="'+i+'" aria-label="Quitar imagen"><i class="far fa-times"></i></button>'+
            '</div>';
        }).join('');
        strip.querySelectorAll('[data-sm-rm-img]').forEach(function(btn){
            btn.addEventListener('click',function(){ _pendingImgs.splice(parseInt(btn.getAttribute('data-sm-rm-img')),1); renderPendingImgs(); });
        });
    }

    function renderPendingFiles() {
        var strip=document.getElementById('cc-sm-pending-files');
        if (!strip) return;
        if (!_pendingFiles.length) { strip.style.display='none'; strip.innerHTML=''; return; }
        strip.style.display='flex';
        strip.innerHTML=_pendingFiles.map(function(f,i){
            return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close ai-panel__pending-file-chip">'+
                '<i class="far fa-file-lines"></i><span class="ubits-chip__text">'+esc(f.name)+'</span>'+
                '<button type="button" class="ubits-chip__close" data-sm-rm-file="'+i+'" aria-label="Quitar archivo"><i class="far fa-times"></i></button>'+
            '</span>';
        }).join('');
        strip.querySelectorAll('[data-sm-rm-file]').forEach(function(btn){
            btn.addEventListener('click',function(){ _pendingFiles.splice(parseInt(btn.getAttribute('data-sm-rm-file')),1); renderPendingFiles(); });
        });
    }

    function wireTabBar() {
        var bar=document.getElementById('cc-sm-tabbar');
        if (!bar||bar._ccWired) return;
        bar._ccWired=true;
        bar.addEventListener('click',function(e){
            var b=e.target.closest('[data-cc-stab]');
            if (b) switchToTab(b.getAttribute('data-cc-stab'));
        });
    }

    function syncPageTitle(newTitle) {
        var activeItem = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
        if (!activeItem) return;
        var labelEl = activeItem.querySelector('.ubits-paginas-creator__label');
        if (labelEl) labelEl.textContent = newTitle;
        var titleInp = document.getElementById('crear-contenido-recursos-page-title');
        if (titleInp) {
            titleInp.value = newTitle;
            if (typeof global.autoResizeInlineEdit === 'function') global.autoResizeInlineEdit(titleInp);
        }
        document.dispatchEvent(new CustomEvent('ubits-paginas-creator-label-save', {
            bubbles: true,
            detail: { pageKey: _currentPageKey, newLabel: newTitle }
        }));
    }

    function wireFooter() {
        var genBtn=document.getElementById('cc-sm-footer-generate');
        if (genBtn&&!genBtn._ccWired) {
            genBtn._ccWired=true;
            genBtn.addEventListener('click',function(){
                var titWrap=document.getElementById('cc-sm-titulo-wrap');
                var titInp=titWrap ? titWrap.querySelector('input') : null;
                var tit=(titInp ? titInp.value.trim() : _titulo);
                var ctxTa=document.getElementById('cc-sm-context-input');
                var ctx=ctxTa ? ctxTa.value.trim() : '';
                var valid=true;

                if (!tit) {
                    if (_tituloInputApi) _tituloInputApi.setState('invalid');
                    else if (titInp) titInp.focus();
                    valid=false;
                }
                if (!ctx) {
                    var box=ctxTa ? ctxTa.closest('.ai-panel__input-box') : null;
                    if (box) box.classList.add('ai-panel__input-box--context-error');
                    if (!tit && ctxTa) ctxTa.focus();
                    else if (ctxTa) ctxTa.focus();
                    valid=false;
                }
                if (!valid) return;

                _titulo=tit;
                if (!trySpendTokens(SCORM_GEN_TOKEN_COST)) return;
                syncPageTitle(_titulo);
                var slides=generateSlides(_numSlides);
                var pageKey=_currentPageKey;
                var scormHtml=generateScormHtml(_titulo,slides,_color,false);
                if (pageKey) _scormDataStore[pageKey]={slides:slides, color:_color, titulo:_titulo, scormHtml:scormHtml};
                closeModal(OVERLAY_ID);
                startScormWidget({pageKey:pageKey, titulo:_titulo, slides:slides, color:_color, scormHtml:scormHtml});
            });
        }

        var cargarBtn=document.getElementById('cc-sm-footer-cargar-zip');
        if (cargarBtn&&!cargarBtn._ccWired) {
            cargarBtn._ccWired=true;
            cargarBtn.addEventListener('click', confirmZipLoad);
        }
    }

    function confirmZipLoad() {
        var html = '<div class="ubits-resources-block ubits-resources-block--stack">' +
            '<div class="ubits-resources-block__surface" style="padding:0;">' +
                '<div class="cc-scorm-iframe-container">' +
                    '<iframe src="simulador-scorm.html" allowfullscreen></iframe>' +
                '</div>' +
            '</div>' +
            '<div class="ubits-resources-block__footer" style="display:flex;align-items:center;gap:var(--gap-sm);">' +
                '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso"><i class="far fa-trash-alt"></i><span>Eliminar</span></button>' +
            '</div>' +
        '</div>';
        closeModal(OVERLAY_ID);
        if (_onScormReady) _onScormReady(html);
        emitChanged({type:'scorm',pageKey:_currentPageKey,source:'upload'});
    }

    function initZipUpload() {
        var wrap=document.getElementById('cc-sm-zip-fu-wrap');
        if (!wrap||typeof global.createFileUpload!=='function') return;
        if (wrap.querySelector('.ubits-file-upload')) return;
        global.createFileUpload({
            containerId:'cc-sm-zip-fu-wrap', id:'cc-sm-zip-fu',
            title:'Paquete SCORM (.zip)', accept:'.zip,application/zip,application/x-zip-compressed',
            maxSizeMb:250, maxLabel:'250 MB', formats:'ZIP · Hasta 250 MB',
            onChange:function(file){
                _zipFile=file||null;
                var btn=document.getElementById('cc-sm-footer-cargar-zip');
                if (!file) { if(btn) btn.disabled=true; return; }
                var fu=document.getElementById('cc-sm-zip-fu');
                if (fu&&typeof global.fileUploadSetProgress==='function') {
                    var p=0, iv=setInterval(function(){
                        p+=6; global.fileUploadSetProgress(fu,p);
                        if(p>=100){ clearInterval(iv); setTimeout(function(){
                            if(typeof global.fileUploadClearProgress==='function') global.fileUploadClearProgress(fu);
                            if(typeof global.fileUploadSetSuccess==='function') global.fileUploadSetSuccess(fu,'Archivo listo.');
                            if(btn) btn.disabled=false;
                        },200); }
                    },80);
                } else { if(btn) btn.disabled=false; }
            }
        });
    }

    /* ══════════════════════════════════════
       MODAL DE EDICIÓN INLINE
    ══════════════════════════════════════ */
    function openScormEditModal(pageKey) {
        var stored=_scormDataStore[pageKey];
        if (!stored) return;

        var editHtml=generateScormHtml(stored.titulo, stored.slides, stored.color, true);
        var escaped=editHtml.replace(/"/g,'&quot;');

        var overlay=openModal({
            overlayId:       EDIT_OVERLAY_ID,
            title:           'Editar presentación',
            size:            'lg',
            bodyHtml:        '<div class="cc-scorm-edit-iframe-wrap"><iframe id="cc-scorm-edit-iframe" class="cc-scorm-edit-iframe" srcdoc="'+escaped+'" allowfullscreen></iframe></div>',
            footerHtml:      '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-scorm-edit-cancel"><span>Cancelar</span></button>'+
                             '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-scorm-edit-save"><span>Guardar</span></button>',
            closeOnOverlayClick: false
        });
        if (!overlay) return;

        var cancelBtn=overlay.querySelector('#cc-scorm-edit-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click',function(){ closeCpPanel(); closeModal(EDIT_OVERLAY_ID); });

        var saveBtn=overlay.querySelector('#cc-scorm-edit-save');
        if (saveBtn) saveBtn.addEventListener('click',function(){
            collectEditedSlides(pageKey, stored);
            closeCpPanel();
            closeModal(EDIT_OVERLAY_ID);
        });
    }

    function collectEditedSlides(pageKey, stored) {
        var iframe=document.getElementById('cc-scorm-edit-iframe');
        if (!iframe||!iframe.contentDocument) return;
        var doc=iframe.contentDocument;

        /* Leer campos editados */
        var newSlides=JSON.parse(JSON.stringify(stored.slides));
        doc.querySelectorAll('[data-sp-key]').forEach(function(el){
            var key=el.getAttribute('data-sp-key'); // "slide-0-title"
            var parts=key.split('-');
            if (parts.length<3||parts[0]!=='slide') return;
            var idx=parseInt(parts[1]);
            var field=parts.slice(2).join('-');
            if (isNaN(idx)||!newSlides[idx]) return;
            var text=(el.textContent||el.innerText||'').trim();
            if (field.indexOf('bullet-')===0) {
                var bi=parseInt(field.replace('bullet-',''));
                if (!newSlides[idx].bullets) newSlides[idx].bullets=[];
                newSlides[idx].bullets[bi]=text;
            } else {
                newSlides[idx][field]=text;
            }
        });

        /* Leer color actual del iframe */
        var newColor=doc.documentElement.style.getPropertyValue('--accent').trim()||stored.color;

        /* Regenerar */
        var newHtml=generateScormHtml(stored.titulo, newSlides, newColor, false);
        _scormDataStore[pageKey]={slides:newSlides, color:newColor, titulo:stored.titulo, scormHtml:newHtml};

        var blockHtml=buildRenderedBlock(newHtml, pageKey);
        if (_onScormReady) _onScormReady(blockHtml);
        else {
            var mount=document.getElementById('crear-contenido-recursos-resources-mount');
            if (mount) mount.innerHTML=blockHtml;
        }
        emitChanged({type:'scorm',pageKey:pageKey,source:'edit'});
    }

    /* ══════════════════════════════════════
       OPEN MODAL PRINCIPAL
    ══════════════════════════════════════ */
    function openScormRecursoModal(opts) {
        _onScormReady   = (opts&&opts.onScormReady)||null;
        _currentPageKey = (opts&&opts.pageKey)||null;
        _currentTab     = 'ia';
        _zipFile        = null;
        _pendingFiles   = [];
        _pendingImgs    = [];

        var stored=_currentPageKey?_scormDataStore[_currentPageKey]:null;
        _color          = stored ? stored.color : '#0C5BEF';
        _titulo         = stored ? stored.titulo : '';
        _numSlides      = 6;
        _tituloInputApi = null;
        _stepperApi     = null;
        cpSyncFromHex(_color);

        var overlay=openModal({
            overlayId:           OVERLAY_ID,
            title:               'Agregar SCORM',
            bodyHtml:            buildModalBody(),
            footerHtml:          buildModalFooterHtml(),
            size:                'md',
            closeOnOverlayClick: false
        });
        if (overlay) applyAiModalChrome(overlay);

        setTimeout(function(){
            initTituloInput();
            initStepperInput();
            wireTabBar();
            wireIaPanel();
            wireFooter();
            refreshPreview();
        },0);
    }

    /* ══════════════════════════════════════
       GENERACIÓN + WIDGET UNIFICADO
    ══════════════════════════════════════ */
    function startScormWidget(job) {
        var jobId = (job.pageKey || 'scorm') + '-scorm';

        if (typeof global.ccGenWidget !== 'undefined') {
            global.ccGenWidget.addJob(jobId, { type: 'scorm', label: job.titulo || 'SCORM', pageKey: job.pageKey });
        }

        var innerLoader = typeof global.getIaLoaderHTML === 'function'
            ? global.getIaLoaderHTML({ label: 'Generando presentación' })
            : '<p role="status" aria-live="polite">Generando presentación…</p>';
        if (_onScormReady) _onScormReady('<div class="cc-scorm-ia-loader-host">' + innerLoader + '</div>');

        setTimeout(function () {
            var blockHtml = buildRenderedBlock(job.scormHtml, job.pageKey);
            if (_onScormReady) { _onScormReady(blockHtml); _onScormReady = null; }
            if (typeof global.ccGenWidget !== 'undefined') global.ccGenWidget.finishJob(jobId);
            updateScormIndexIcon(job.pageKey);
            emitChanged({ type: 'scorm', pageKey: job.pageKey, source: 'ai' });
        }, 6000);
    }

    function updateScormIndexIcon(pageKey) {
        if (!pageKey) return;
        var item = document.querySelector('[data-paginas-creator-key="' + pageKey + '"]');
        if (!item) return;
        var iconEl = item.querySelector('.ubits-paginas-creator__drag-handle i');
        if (iconEl && typeof global.paginasCreatorIconClass === 'function') {
            iconEl.className = global.paginasCreatorIconClass('scorm');
        }
    }

    /* ══════════════════════════════════════
       PUBLIC API
    ══════════════════════════════════════ */
    global.openScormRecursoModal = openScormRecursoModal;
    global.openScormEditModal    = openScormEditModal;
    global.ccScormDataStore      = _scormDataStore;

}(window));
