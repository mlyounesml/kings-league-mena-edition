export enum GameState { MainMenu, TeamSelect, MatchLive, Shootout, GameOver }
export const StateToScene: Record<GameState, string> = {
  [GameState.MainMenu]: 'MainMenu',
  [GameState.TeamSelect]: 'TeamSelect',
  [GameState.MatchLive]: 'MatchLive',
  [GameState.Shootout]: 'Shootout',
  [GameState.GameOver]: 'GameOver',
};
export class GameManager {
  static instance = new GameManager();
  state = GameState.MainMenu;
  homeId = 'dr7'; awayId = 'abo';
  score = { home: 0, away: 0 };
  private constructor() {}
  change(to: GameState, scene: Phaser.Scenes.ScenePlugin) {
    this.state = to;
    scene.start(StateToScene[to]);
  }
}
