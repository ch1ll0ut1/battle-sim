import { ButtonContainer } from '@pixi/ui';
import { Graphics } from 'pixi.js';
import { colors } from '../../../config/colors';
import { Label } from '../Label/Label';
import { generateButtonPalette } from './generateButtonPalette';

interface ButtonTheme {
    background: string;
    text: string;
    hover: {
        background: string;
        text: string;
    };
    active: {
        background: string;
        text: string;
    };
    disabled: {
        background: string;
        text: string;
    };
}

/**
 * A self-sizing, interactive Button component for PixiJS.
 * - Draws its own background using Graphics.
 * - Automatically sizes to fit the label with padding.
 * - Handles pointer events for click/tap.
 */
export class Button extends ButtonContainer {
    private bg: Graphics;
    private title: Label;
    private theme: ButtonTheme;
    private paddingX = 20;
    private paddingY = 10;
    private isActive = false;
    private isHovered = false;

    /**
     * Creates a new Button.
     * @param type - Visual style, e.g. 'primary' or 'secondary'.
     * @param label - The button text.
     * @param onClick - Callback for click/tap events.
     * @param color - Optional custom color to auto-generate palette from.
     */
    constructor(
        options: {
            type: 'primary' | 'secondary';
            label: string;
            onClick: () => void;
            color?: string;
            disabled?: boolean;
        },
    ) {
        super();
        const { type, label, onClick, color, disabled } = options;

        if (disabled) {
            this.button.enabled = false;
        }

        // Use custom color palette if provided, otherwise use default theme
        this.theme = color ? generateButtonPalette(color) : colors.button[type];

        // Create label
        this.title = new Label(type === 'primary' ? 'subTitle' : 'text', label);

        // Calculate width and height
        const width = this.title.width + this.paddingX * 2;
        const height = this.title.height + this.paddingY * 2;

        // Create background
        this.bg = new Graphics()
            .roundRect(-width / 2, -height / 2, width, height, 12)
            .fill(this.theme.background);
        this.bg.label = 'bg';

        // Center the label
        this.title.anchor.set(0.5);
        this.title.position.set(0, 0);

        // Add elements to container
        this.addChild(this.bg, this.title);

        // Add click event listener
        this.onPress.connect(onClick);

        this.setupInteraction();
        this.draw();
    }

    /**
     * Updates the button label and resizes the background.
     * @param newLabel - The new label text.
     */
    setLabel(newLabel: string) {
        this.title.text = newLabel;

        this.draw();
    }

    setEnabled(enabled: boolean) {
        this.button.enabled = enabled;
        this.draw();
    }

    private setupInteraction() {
        this.onHover.connect(() => {
            this.isHovered = true;
            this.draw();
        });

        this.onOut.connect(() => {
            this.isHovered = false;
            this.draw();
        });

        this.onDown.connect(() => {
            this.isActive = true;
            this.draw();
        });

        this.onUp.connect(() => {
            this.isActive = false;
            this.draw();
        });
    }

    private draw() {
        const width = this.title.width + this.paddingX * 2;
        const height = this.title.height + this.paddingY * 2;

        let backgroundColor = this.theme.background;
        let textColor = this.theme.text;

        if (!this.button.enabled) {
            backgroundColor = this.theme.disabled.background;
            textColor = this.theme.disabled.text;
        }
        else if (this.isActive) {
            backgroundColor = this.theme.active.background;
            textColor = this.theme.active.text;
        }
        else if (this.isHovered) {
            backgroundColor = this.theme.hover.background;
            textColor = this.theme.hover.text;
        }

        this.title.setColor(textColor);
        this.bg.clear()
            .roundRect(-width / 2, -height / 2, width, height, 12)
            .fill(backgroundColor);
    }
}
