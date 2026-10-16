import Phaser from 'phaser';
import { MainMenuScene, TeamSelectScene, GameOverScene, ShootoutScene } from './scenes/menu';
import { MatchLiveScene } from './scenes/match';
new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 1050, height: 680,
    backgroundColor: '#0a0e1a',
    physics: { default: 'arcade' },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [MainMenuScene, TeamSelectScene, MatchLiveScene, ShootoutScene, GameOverScene],
});
