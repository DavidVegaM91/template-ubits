/**
 * UBITS Confetti — mismo efecto que Pilot_Hub_Mockup.html (launchConfetti).
 * Rectángulos de colores con rotación, balanceo lateral y desvanecimiento.
 *
 * Uso: launchUbitsConfetti();
 * No requiere CSS; el canvas lleva estilos inline. Opcional: .ubits-confetti-canvas { z-index: … }
 */
function launchUbitsConfetti() {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    var canvas = document.createElement('canvas');
    canvas.className = 'ubits-confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var cols = ['#3b82f6', '#22c55e', '#f59e0b', '#fb7185', '#a78bfa', '#06b6d4', '#ffffff'];
    var ps = [];
    var i;
    for (i = 0; i < 150; i++) {
        ps.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 60,
            vx: Math.random() * 5 - 2.5,
            vy: Math.random() * 3 + 2.5,
            ta: Math.random() * Math.PI * 2,
            tai: Math.random() * 0.09 + 0.04,
            r: Math.random() * 5 + 3,
            c: cols[Math.floor(Math.random() * cols.length)],
            rot: Math.random() * 360,
            rotV: Math.random() * 8 - 4
        });
    }
    var fr = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ps.forEach(function (p) {
            p.ta += p.tai;
            p.y += p.vy + fr * 0.01;
            p.x += p.vx + Math.sin(p.ta) * 0.9;
            p.rot += p.rotV;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.c;
            ctx.globalAlpha = Math.max(0, 1 - fr / 180);
            ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2.2);
            ctx.restore();
        });
        fr++;
        if (fr < 220) {
            requestAnimationFrame(draw);
        } else if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }
    draw();
}

if (typeof window !== 'undefined') {
    window.launchUbitsConfetti = launchUbitsConfetti;
}
