import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * Button configuration interface
 */
export interface ButtonConfig {
    text: string;
    width: number;
    height: number;
    backgroundColor?: number;
    textColor?: number;
    fontSize?: number;
    onClick?: () => void;
}

/**
 * Reusable button component for PixiJS
 */
export class Button extends Container {
    private background!: Graphics;
    private textElement!: Text;
    private config: ButtonConfig;

    /**
   * Create a new button
   */
    constructor(config: ButtonConfig) {
        super();
        this.config = config;

        this.createBackground();
        this.createText();
        this.setupInteractivity();
    }

    /**
     * Create the button background
     */
    private createBackground(): void {
        this.background = new Graphics();
        this.background.fill({ color: this.config.backgroundColor ?? 0x4CAF50 });
        this.background.roundRect(0, 0, this.config.width, this.config.height, 8);
        this.addChild(this.background);
    }

    /**
     * Create the button text
     */
    private createText(): void {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: this.config.fontSize ?? 16,
            fill: this.config.textColor ?? 0xFFFFFF,
            align: 'center',
        });

        this.textElement = new Text({
            text: this.config.text,
            style,
        });

        // Center the text
        this.textElement.anchor.set(0.5);
        this.textElement.position.set(this.config.width / 2, this.config.height / 2);
        this.addChild(this.textElement);
    }

    /**
   * Setup button interactivity
   */
    private setupInteractivity(): void {
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerdown', () => {
            this.background.tint = 0xCCCCCC;
        });

        this.on('pointerup', () => {
            this.background.tint = 0xFFFFFF;
            if (this.config.onClick) {
                this.config.onClick();
            }
        });

        this.on('pointerover', () => {
            this.background.tint = 0xDDDDDD;
        });

        this.on('pointerout', () => {
            this.background.tint = 0xFFFFFF;
        });
    }

    /**
   * Update button text
   */
    setText(text: string): void {
        this.textElement.text = text;
    }

    /**
   * Enable or disable the button
   */
    setEnabled(enabled: boolean): void {
        this.eventMode = enabled ? 'static' : 'none';
        this.alpha = enabled ? 1 : 0.5;
    }
}
