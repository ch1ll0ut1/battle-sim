import { Container, Text, TextStyle } from 'pixi.js';

/**
 * Title component for the main menu
 */
export class Title extends Container {
    private titleText!: Text;
    private subtitleText!: Text;

    constructor(screenWidth: number) {
        super();
        this.createTitle(screenWidth);
        this.createSubtitle(screenWidth);
    }

    private createTitle(screenWidth: number): void {
        const titleStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 56,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
            dropShadow: {
                color: 0x000000,
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            },
        });

        this.titleText = new Text({
            text: 'Battle Simulation',
            style: titleStyle,
        });

        this.titleText.anchor.set(0.5);
        this.titleText.position.set(screenWidth / 2, 120);
        this.addChild(this.titleText);
    }

    private createSubtitle(screenWidth: number): void {
        const subtitleStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            fill: 0xCCCCCC,
            align: 'center',
            fontStyle: 'italic',
        });

        this.subtitleText = new Text({
            text: 'Choose your game mode',
            style: subtitleStyle,
        });

        this.subtitleText.anchor.set(0.5);
        this.subtitleText.position.set(screenWidth / 2, 170);
        this.addChild(this.subtitleText);
    }

    updatePosition(screenWidth: number): void {
        this.titleText.position.set(screenWidth / 2, 120);
        this.subtitleText.position.set(screenWidth / 2, 170);
    }
}
