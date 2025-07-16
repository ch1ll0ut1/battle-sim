import { Container, Text, TextStyle } from 'pixi.js';
import { GAME_MODES } from '../Data/GameModes';
import { Button } from '../UI/Button';

/**
 * Main menu screen configuration
 */
export interface MainMenuConfig {
    onGameModeSelect: (gameModeId: string) => void;
    screenWidth: number;
    screenHeight: number;
}

/**
 * Main menu screen component
 */
export class MainMenu extends Container {
    private config: MainMenuConfig;

    /**
   * Create the main menu screen
   */
    constructor(config: MainMenuConfig) {
        super();
        this.config = config;

        this.createTitle();
        this.createGameModeButtons();
    }

    /**
   * Create the game title
   */
    private createTitle(): void {
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
        });

        const title = new Text({
            text: 'Battle Simulation',
            style: titleStyle,
        });

        title.anchor.set(0.5);
        title.position.set(this.config.screenWidth / 2, 100);
        this.addChild(title);
    }

    /**
   * Create game mode selection buttons
   */
    private createGameModeButtons(): void {
        const buttonWidth = 300;
        const buttonHeight = 60;
        const buttonSpacing = 80;
        const startY = 250;

        GAME_MODES.forEach((gameMode, index) => {
            const button = new Button({
                text: gameMode.name,
                width: buttonWidth,
                height: buttonHeight,
                backgroundColor: 0x2196F3,
                fontSize: 18,
                onClick: () => { this.config.onGameModeSelect(gameMode.id); },
            });

            button.position.set(
                (this.config.screenWidth - buttonWidth) / 2,
                startY + (buttonHeight + buttonSpacing) * index,
            );

            this.addChild(button);
        });
    }
}
