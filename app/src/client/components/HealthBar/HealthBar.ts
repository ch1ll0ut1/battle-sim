import { Container, Graphics } from 'pixi.js';
import { colors } from '../../../config/colors';

export interface HealthBarData {
    combatEffectiveness: number; // 0-1
    staminaPercentage: number; // 0-100
}

/**
 * Reusable health bar component showing CE (red) and Stamina (yellow)
 * CE = Combat Effectiveness (the actual fighting ability)
 * Stamina = Energy level for actions
 */
export class HealthBar extends Container {
    private ceBar: Graphics;
    private staminaBar: Graphics;
    private background: Graphics;

    private readonly barWidth = 50;
    private readonly barHeight = 4;
    private readonly barSpacing = 6;

    constructor() {
        super();
        this.label = 'health-bar';

        // Create background
        this.background = new Graphics();
        this.addChild(this.background);

        // Create CE bar (combat effectiveness - red)
        this.ceBar = new Graphics();
        this.addChild(this.ceBar);

        // Create stamina bar (yellow)
        this.staminaBar = new Graphics();
        this.addChild(this.staminaBar);
    }

    /**
     * Updates the bars with new values
     */
    update(data: HealthBarData) {
        this.ceBar.clear();
        this.staminaBar.clear();
        this.background.clear();

        const cePercentage = data.combatEffectiveness; // Already 0-1
        const staminaPercentage = data.staminaPercentage / 100; // Convert to 0-1

        // Draw CE bar (top) - Red
        this.drawBar(
            0,
            0,
            cePercentage,
            colors.red,
        );

        // Draw Stamina bar (bottom) - Yellow
        this.drawBar(
            0,
            this.barSpacing,
            staminaPercentage,
            colors.yellow,
        );
    }

    /**
     * Draws a single bar at the specified position
     */
    private drawBar(x: number, y: number, percentage: number, color: string) {
        // Draw background
        this.background
            .rect(x - this.barWidth / 2, y, this.barWidth, this.barHeight)
            .fill({ color: 0x000000, alpha: 0.5 });

        // Draw filled portion
        const fillWidth = this.barWidth * Math.max(0, Math.min(1, percentage));
        if (fillWidth > 0) {
            if (y === 0) {
                // CE bar
                this.ceBar
                    .rect(x - this.barWidth / 2, y, fillWidth, this.barHeight)
                    .fill(color);
            }
            else {
                // Stamina bar
                this.staminaBar
                    .rect(x - this.barWidth / 2, y, fillWidth, this.barHeight)
                    .fill(color);
            }
        }
    }

    /**
     * Gets the total height of the health bar component
     */
    getHeight(): number {
        return this.barHeight * 2 + this.barSpacing;
    }
}
