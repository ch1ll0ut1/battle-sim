import { Container, Graphics } from 'pixi.js';
import { colors } from '../../../config/colors';
import { EventAction, events, GameEvent } from '../../../game/events';
import { Button } from '../Button/Button';

interface ButtonConfig {
    label: string;
    action: EventAction;
    color: string;
}

const buttonConfig: ButtonConfig[] = [{
    label: '▶',
    color: colors.green,
    action: {
        eventType: GameEvent.resumeGame,
        args: [],
    },
}, {
    label: '⏸',
    color: colors.orange,
    action: {
        eventType: GameEvent.pauseGame,
        args: [],
    },
}, {
    label: '⏭',
    color: colors.blue,
    action: {
        eventType: GameEvent.nextTick,
        args: [],
    },
}, {
    label: '↺',
    color: colors.red,
    action: {
        eventType: GameEvent.initGame,
        args: [{ gameMode: 'test', map: 'test' }],
    },
}];

const yPadding = 10;
const xPadding = 20;

export class PlaybackControls extends Container {
    private background: Graphics;
    private buttons = new Map<string, Button>();

    constructor() {
        super();
        this.background = this.createBackground();
        this.buttons = this.createButtons();
        this.resize();
    }

    private resize() {
        const { totalWidth, totalHeight } = this.calculateDimensions();
        this.background.clear()
            .roundRect(0, 0, totalWidth, totalHeight, 8)
            .fill({ color: 0x2a2a2a, alpha: 0.9 })
            .stroke({ width: 2, color: 0x555555 });
    }

    /**
     * Create the background panel sized to fit the buttons
     */
    private createBackground() {
        const background = new Graphics();
        this.addChild(background);
        return background;
    }

    /**
     * Calculate the total dimensions needed for all buttons with padding
     */
    private calculateDimensions() {
        let totalButtonWidth = 0;
        let maxButtonHeight = 0;

        this.buttons.forEach((button) => {
            totalButtonWidth += button.width;
            maxButtonHeight = Math.max(maxButtonHeight, button.height);
        });

        const totalWidth = totalButtonWidth + (this.buttons.size + 1) * xPadding;
        const totalHeight = maxButtonHeight + yPadding * 2;

        return { totalWidth, totalHeight, maxButtonHeight };
    }

    /**
     * Create and position buttons
     */
    private createButtons() {
        const buttons = new Map<string, Button>();

        // First, create all buttons to calculate their sizes
        buttonConfig.forEach((config) => {
            const button = new Button({
                type: 'secondary',
                label: config.label,
                color: config.color,
                onClick: () => {
                    const action = config.action;
                    events.emit(action.eventType, ...action.args);
                },
            });
            buttons.set(config.label, button);
            this.addChild(button);
        });

        // Now position them properly
        this.positionButtons(buttons);

        return buttons;
    }

    /**
     * Position all buttons horizontally with proper spacing and vertical centering
     */
    private positionButtons(buttons: Map<string, Button>) {
        let currentX = xPadding;

        buttonConfig.forEach((config) => {
            const button = buttons.get(config.label);
            if (button) {
                button.x = currentX + button.width / 2; // Button centers itself
                button.y = yPadding + button.height / 2; // Center vertically
                currentX += button.width + xPadding;
            }
        });
    }
}
