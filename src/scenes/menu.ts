import Phaser from 'phaser';
import { GameManager, GameState } from '../core/GameStateMachine';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }
  create() {
    this.cameras.main.setBackgroundColor('#0a0e1a');
    this.add.text(525, 200, 'MENA KINGS LEAGUE 🏆', { fontSize: '48px', color: '#ffd700' }).setOrigin(0.5);
    this.add.text(525, 260, 'Spain 🇪🇸 (soon)  Americas 🇲🇽 (soon)  World Cup 🌍 (soon)', { fontSize: '18px', color: '#00d4ff' }).setOrigin(0.5);
    this.add.text(525, 360, 'اضغط ENTER / المس للبدء', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.input.keyboard?.once('keydown-ENTER', () => GameManager.instance.change(GameState.TeamSelect, this.scene));
    this.input.once('pointerdown', () => GameManager.instance.change(GameState.TeamSelect, this.scene));
  }
}
export class TeamSelectScene extends Phaser.Scene {
  constructor() { super('TeamSelect'); }
  create() {
    this.cameras.main.setBackgroundColor('#0a0e1a');
    const teams = ['dr7', 'sxb', 'abo', 'abs', 'trb', 'rdz'];
    this.add.text(525, 80, 'اختر فريقك', { fontSize: '36px', color: '#ffd700' }).setOrigin(0.5);
    teams.forEach((t, i) => {
      const y = 160 + i * 60;
      const txt = this.add.text(525, y, t.toUpperCase(), { fontSize: '28px', color: '#00d4ff', backgroundColor: '#111827' }).setOrigin(0.5).setInteractive();
      txt.on('pointerdown', () => { GameManager.instance.homeId = t; GameManager.instance.awayId = teams[(i + 2) % teams.length]; GameManager.instance.change(GameState.MatchLive, this.scene); });
    });
  }
}
export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }
  create() {
    this.cameras.main.setBackgroundColor('#0a0e1a');
    const s = GameManager.instance.score;
    this.add.text(525, 250, `نهاية المباراة ${s.home} - ${s.away}`, { fontSize: '44px', color: '#ffd700' }).setOrigin(0.5);
    this.add.text(525, 350, 'ENTER للعودة', { fontSize: '22px', color: '#fff' }).setOrigin(0.5);
    this.input.keyboard?.once('keydown-ENTER', () => GameManager.instance.change(GameState.MainMenu, this.scene));
    this.input.once('pointerdown', () => GameManager.instance.change(GameState.MainMenu, this.scene));
  }
}
export class ShootoutScene extends Phaser.Scene {
  constructor() { super('Shootout'); }
  private t = 5;
  create() {
    this.cameras.main.setBackgroundColor('#0a0e1a');
    this.add.text(525, 200, 'SHOOTOUT — 5 ثوان انفراد', { fontSize: '32px', color: '#ffd700' }).setOrigin(0.5);
    this.time.addEvent({ delay: 1000, repeat: 4, callback: () => { this.t--; if (this.t <= 0) GameManager.instance.change(GameState.GameOver, this.scene); } });
    // arcade: 50% goal auto, real aiming in MatchLiveScene extension
    this.time.delayedCall(2500, () => { if (Math.random() < 0.5) GameManager.instance.score.home++; });
  }
}
