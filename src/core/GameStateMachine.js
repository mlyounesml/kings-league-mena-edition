export var GameState;
(function (GameState) {
    GameState[GameState["MainMenu"] = 0] = "MainMenu";
    GameState[GameState["TeamSelect"] = 1] = "TeamSelect";
    GameState[GameState["MatchLive"] = 2] = "MatchLive";
    GameState[GameState["Shootout"] = 3] = "Shootout";
    GameState[GameState["GameOver"] = 4] = "GameOver";
})(GameState || (GameState = {}));
export const StateToScene = {
    [GameState.MainMenu]: 'MainMenu',
    [GameState.TeamSelect]: 'TeamSelect',
    [GameState.MatchLive]: 'MatchLive',
    [GameState.Shootout]: 'Shootout',
    [GameState.GameOver]: 'GameOver',
};
export class GameManager {
    constructor() {
        this.state = GameState.MainMenu;
        this.homeId = 'dr7';
        this.awayId = 'abo';
        this.score = { home: 0, away: 0 };
    }
    change(to, scene) {
        this.state = to;
        scene.start(StateToScene[to]);
    }
}
GameManager.instance = new GameManager();
