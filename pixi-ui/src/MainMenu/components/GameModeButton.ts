import { Button } from '../../UI/Button';
import { GameMode } from '../../Data/GameModes';

/**
 * Individual game mode button component
 */
export class GameModeButton extends Button {
    private gameMode: GameMode;

    constructor(gameMode: GameMode, colorIndex: number, onClick: (gameModeId: string) => void) {
        super({
            text: gameMode.name,
            width: 320,
            height: 70,
            backgroundColor: GameModeButton.getButtonColor(colorIndex),
            fontSize: 18,
            onClick: () => { onClick(gameMode.id); },
        });

        this.gameMode = gameMode;
    }

    private static getButtonColor(index: number): number {
        const colors = [0x4CAF50, 0x2196F3, 0xFF9800]; // Green, Blue, Orange
        return colors[index % colors.length];
    }

    getGameMode(): GameMode {
        return this.gameMode;
    }
}
