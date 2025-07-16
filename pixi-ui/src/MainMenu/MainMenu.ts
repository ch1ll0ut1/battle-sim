import { Container } from 'pixi.js';
import { Title } from './components/Title';
import { GameModeButtonList } from './components/GameModeButtonList';

/**
 * Main menu screen configuration
 */
export interface MainMenuConfig {
    onGameModeSelect: (gameModeId: string) => void;
    screenWidth: number;
    screenHeight: number;
}

/**
 * Main menu screen component - composes title and button list
 */
export class MainMenu extends Container {
    private config: MainMenuConfig;
    private title: Title;
    private buttonList: GameModeButtonList;

    /**
     * Create the main menu screen
     */
    constructor(config: MainMenuConfig) {
        super();
        this.config = config;

        this.title = new Title(config.screenWidth);
        this.buttonList = new GameModeButtonList(config.screenWidth, config.onGameModeSelect);

        this.addChild(this.title);
        this.addChild(this.buttonList);
    }

    /**
     * Update the screen size and reposition components
     */
    updateScreenSize(width: number, height: number): void {
        this.config.screenWidth = width;
        this.config.screenHeight = height;

        this.title.updatePosition(width);
        this.buttonList.updateLayout(width);
    }
}
