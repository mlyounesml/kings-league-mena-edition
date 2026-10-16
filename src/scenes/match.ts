import Phaser from 'phaser';
import { GameManager, GameState } from '../core/GameStateMachine';
import { InputManager } from '../systems/InputManager';
import { formationSlots, isPassSafe } from '../systems/TeamAI';
import { drawCard, canActivate, markUsed } from '../systems/SecretCardSystem';
import type { TeamCardState, Card } from '../systems/SecretCardSystem';

// Top-down arcade: circle players, ball with friction, kickoff run from goal lines.
export class MatchLiveScene extends Phaser.Scene {
  private input2 = new InputManager();
  private players: Phaser.GameObjects.Arc[] = [];
  private foes: Phaser.GameObjects.Arc[] = [];
  private ball!: Phaser.GameObjects.Arc;
  private bv = { x: 0, y: 0 };
  private clock = 0; private phase = 'OPEN_PLAY';
  private card!: Card; private cardSt: TeamCardState = { drawn: 'PENALTY', globalReadyAt: 0, perCard: {}, doubleUntil: 0, suspendedIds: [] };
  private scoreT!: Phaser.GameObjects.Text; private cardT!: Phaser.GameObjects.Text;
  constructor() { super('MatchLive'); }
  create() {
    this.cameras.main.setBackgroundColor('#0a0e1a');
    this.input2.init(this);
    // pitch neon
    this.add.rectangle(525, 340, 1050, 680).setStrokeStyle(3, 0x00d4ff, 0.6);
    this.add.circle(525, 340, 90).setStrokeStyle(2, 0xffd700, 0.6);
    this.add.line(0, 0, 525, 0, 525, 680, 0xffffff, 0.15);
    // kickoff run: teams at goal lines, ball center
    const home = formationSlots(false), away = formationSlots(true);
    home.forEach((s) => this.players.push(this.add.circle(s.home.x, 660, 14, 0xffd700)));
    away.forEach((s) => this.foes.push(this.add.circle(s.home.x, 20, 14, 0x00d4ff)));
    this.ball = this.add.circle(525, 340, 8, 0xffffff);
    this.card = drawCard();
    this.scoreT = this.add.text(16, 12, '', { fontSize: '22px', color: '#fff' });
    this.cardT = this.add.text(1050 - 16, 12, `CARD [C]: ${this.card}`, { fontSize: '20px', color: '#ffd700' }).setOrigin(1, 0);
    this.add.text(525, 640, 'WASD move | K pass | SPACE shoot | C card', { fontSize: '16px', color: '#888' }).setOrigin(0.5);
  }
  update(_: number, dt: number) {
    const dts = dt / 1000; this.clock += dts;
    if (this.clock > 180) { // 3min arcade
      const s = GameManager.instance.score;
      if (s.home === s.away) GameManager.instance.change(GameState.Shootout, this.scene);
      else GameManager.instance.change(GameState.GameOver, this.scene);
      return;
    }
    const { mx, my } = this.input2.poll();
    const me = this.players[6];
    me.x += mx * 260 * dts; me.y += my * 260 * dts;
    me.x = Phaser.Math.Clamp(me.x, 20, 1030); me.y = Phaser.Math.Clamp(me.y, 20, 660);
    // simple CPU: closest chases ball, others return home
    const slots = formationSlots(true);
    this.foes.forEach((f, i) => {
      const h = slots[i] ?? { home: { x: 525, y: 200 } };
      const dist = Math.hypot(f.x - this.ball.x, f.y - this.ball.y);
      const tx = i === 0 ? this.ball.x : (dist < 220 ? this.ball.x : h.home.x);
      const ty = i === 0 ? this.ball.y : (dist < 220 ? this.ball.y : h.home.y);
      f.x += Phaser.Math.Clamp(tx - f.x, -1, 1) * 190 * dts;
      f.y += Phaser.Math.Clamp(ty - f.y, -1, 1) * 190 * dts;
    });
    // teammates support: follow loosely
    this.players.forEach((p, i) => {
      if (i === 6) return;
      p.x += (Phaser.Math.Clamp(this.ball.x - p.x, -1, 1) * 40 + (525 - p.x) * 0.2) * dts;
      p.y += (Phaser.Math.Clamp(this.ball.y - p.y, -1, 1) * 40 + (340 - p.y) * 0.2) * dts;
    });
    // ball physics + dribble/kick
    this.ball.x += this.bv.x * dts; this.ball.y += this.bv.y * dts;
    this.bv.x *= 0.985; this.bv.y *= 0.985;
    if (Math.hypot(me.x - this.ball.x, me.y - this.ball.y) < 24) {
      this.ball.x = me.x; this.ball.y = me.y - 20; // dribble
    }
    const s = this.input2.consume();
    if (s.p) { // pass to nearest safe mate
      const mates = this.players.filter((p) => p !== me);
      const opps = this.foes.map((f) => ({ x: f.x, y: f.y }));
      const tgt = mates.find((m) => isPassSafe({ x: me.x, y: me.y }, { x: m.x, y: m.y }, opps)) ?? mates[0];
      this.bv = { x: (tgt.x - me.x) * 4, y: (tgt.y - me.y) * 4 };
    }
    if (s.s) { const pow = 300 + Math.min(s.held, 40) * 18; this.bv = { x: mx * pow || (Math.random() - 0.5) * pow, y: -Math.abs(pow) }; }
    if (s.c) {
      const diff = GameManager.instance.score.home - GameManager.instance.score.away;
      if (canActivate(this.cardSt, this.card, this.clock, diff, this.phase, true, false)) {
        markUsed(this.cardSt, this.card, this.clock, diff < 0);
        if (this.card === 'PENALTY' || this.card === 'SHOOTOUT') { this.bv = { x: 0, y: -700 }; }
        if (this.card === 'DOUBLE_X2') this.cameras.main.flash(200, 255, 215, 0);
        this.cardT.setText('CARD USED ✓');
      }
    }
    // goals: top/bottom lines
    if (this.ball.y < 12) { this.goal(true); } else if (this.ball.y > 668) { this.goal(false); }
    const sc = GameManager.instance.score;
    this.scoreT.setText(`${GameManager.instance.homeId.toUpperCase()} ${sc.home} - ${sc.away} ${GameManager.instance.awayId.toUpperCase()}  ${Math.floor(this.clock)}s`);
  }
  private goal(homeScored: boolean) {
    const mult = this.clock < this.cardSt.doubleUntil ? 2 : 1;
    if (homeScored) GameManager.instance.score.home += mult; else GameManager.instance.score.away += 1;
    this.ball.setPosition(525, 340); this.bv = { x: 0, y: 0 };
    this.cameras.main.flash(150, 255, 215, 0);
  }
}
