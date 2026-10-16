// Unified keyboard + touch. Game reads only this, never raw keys/pointers.
export class InputManager {
    constructor() {
        this.move = { x: 0, y: 0 };
        this.passDown = false;
        this.shootDown = false;
        this.shootHeld = 0;
        this.cardDown = false;
        this.joyVec = { x: 0, y: 0 };
    }
    init(scene) {
        if (matchMedia('(pointer:coarse)').matches)
            document.body.classList.add('coarse');
        const kb = scene.input.keyboard;
        this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,K,SPACE,C');
        kb.on('keydown-K', () => (this.passDown = true));
        kb.on('keydown-SPACE', () => (this.shootDown = true));
        kb.on('keydown-C', () => (this.cardDown = true));
        this.bindTouch(scene);
    }
    bindTouch(scene) {
        const stick = document.getElementById('stick'), knob = document.getElementById('knob');
        let sid = null, cx = 0, cy = 0;
        stick.addEventListener('pointerdown', (e) => { sid = e.pointerId; const r = stick.getBoundingClientRect(); cx = r.left + 60; cy = r.top + 60; stick.setPointerCapture(e.pointerId); });
        stick.addEventListener('pointermove', (e) => {
            if (e.pointerId !== sid)
                return;
            let dx = (e.clientX - cx) / 50, dy = (e.clientY - cy) / 50;
            const m = Math.hypot(dx, dy) || 1;
            if (m > 1) {
                dx /= m;
                dy /= m;
            }
            this.joyVec = { x: dx, y: dy };
            knob.style.left = 34 + dx * 34 + 'px';
            knob.style.top = 34 + dy * 34 + 'px';
        });
        const end = (e) => { if (e.pointerId === sid) {
            sid = null;
            this.joyVec = { x: 0, y: 0 };
            knob.style.left = '34px';
            knob.style.top = '34px';
        } };
        stick.addEventListener('pointerup', end);
        stick.addEventListener('pointercancel', end);
        const b = (id, fn) => document.getElementById(id)?.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(); });
        b('btn-pass', () => (this.passDown = true));
        b('btn-shoot', () => (this.shootDown = true));
        // double-tap confirm to avoid mis-taps on glowing card button
        let last = 0;
        document.getElementById('btn-card')?.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const n = performance.now();
            if (n - last < 400)
                this.cardDown = true;
            last = n;
        });
        scene.events.once('shutdown', () => document.body.classList.remove('coarse'));
    }
    poll() {
        let mx = this.joyVec.x, my = this.joyVec.y;
        const k = this.keys;
        if (k?.A.isDown || k?.LEFT.isDown)
            mx -= 1;
        if (k?.D.isDown || k?.RIGHT.isDown)
            mx += 1;
        if (k?.W.isDown || k?.UP.isDown)
            my -= 1;
        if (k?.S.isDown || k?.DOWN.isDown)
            my += 1;
        const m = Math.hypot(mx, my);
        if (m > 1) {
            mx /= m;
            my /= m;
        }
        if (k?.SPACE.isDown)
            this.shootHeld += 1;
        else
            this.shootHeld = 0;
        return { mx, my };
    }
    consume() { const s = { p: this.passDown, s: this.shootDown, c: this.cardDown, held: this.shootHeld }; this.passDown = this.shootDown = this.cardDown = false; return s; }
}
