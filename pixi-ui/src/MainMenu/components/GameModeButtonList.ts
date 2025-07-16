import { Container } from 'pixi.js';
import { GAME_MODES } from '../../Data/GameModes';
import { GameModeButton } from './GameModeButton';

/**
 * Container for game mode buttons with layout management
 */
export class GameModeButtonList extends Container {
    private buttons: GameModeButton[] = [];
    private buttonSpacing = 20;
    private startY = 250;

    constructor(screenWidth: number, onGameModeSelect: (gameModeId: string) => void) {
        super();
        this.createButtons(screenWidth, onGameModeSelect);
    }

    private createButtons(screenWidth: number, onGameModeSelect: (gameModeId: string) => void): void {
        GAME_MODES.forEach((gameMode, index) => {
            const button = new GameModeButton(gameMode, index, onGameModeSelect);

            button.position.set(
                (screenWidth - 320) / 2, // Center horizontally
                this.startY + (70 + this.buttonSpacing) * index,
            );

            this.buttons.push(button);
            this.addChild(button);
        });
    }

    updateLayout(screenWidth: number): void {
        this.buttons.forEach((button, index) => {
            button.position.set(
                (screenWidth - 320) / 2,
                this.startY + (70 + this.buttonSpacing) * index,
            );
        });
    }
}
