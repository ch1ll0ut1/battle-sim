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
    private isHovered = false;
    private isActive = false;

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
     * Create the button background with border and drop shadow
     */
    private createBackground(): void {
        if (this.children.length > 0) this.removeChildAt(0);
        this.background = new Graphics();

        // Draw drop shadow (manual)
        this.background.alpha = 1;
        this.background.fill({ color: 0x000000, alpha: 0.13 });
        this.background.roundRect(3, 5, this.config.width, this.config.height, 12);

        // Determine background color based on state
        let bgColor = this.config.backgroundColor ?? 0x4CAF50;
        if (this.isActive) {
            bgColor = 0x1976D2;
        }
        else if (this.isHovered) {
            bgColor = 0x42A5F5;
        }

        // Draw button background
        this.background.fill({ color: bgColor });
        this.background.roundRect(0, 0, this.config.width, this.config.height, 12);
        // Border
        this.background.stroke({ color: 0x222F3E, width: 2 });
        this.background.roundRect(0, 0, this.config.width, this.config.height, 12);
        this.addChildAt(this.background, 0);
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
            fontWeight: 'bold',
            dropShadow: false,
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
            this.isActive = true;
            this.createBackground();
        });

        this.on('pointerup', () => {
            this.isActive = false;
            this.createBackground();
            if (this.config.onClick) {
                this.config.onClick();
            }
        });

        this.on('pointerover', () => {
            this.isHovered = true;
            this.createBackground();
        });

        this.on('pointerout', () => {
            this.isHovered = false;
            this.isActive = false;
            this.createBackground();
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
