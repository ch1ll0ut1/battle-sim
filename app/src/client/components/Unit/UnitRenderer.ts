import { Container, Graphics, Text } from 'pixi.js';
import { colors } from '../../../config/colors';
import { UnitState } from '../../../game/Unit/Unit';
import { HealthBar } from '../HealthBar/HealthBar';

export class UnitRenderer {
    private container: Container;
    private unit: UnitState;
    private barsContainer: Container;
    private nameText: Text;
    private healthBar: HealthBar;
    private unitCircle: Graphics;
    private directionLine: Graphics;

    constructor(unit: UnitState, parent: Container) {
        this.unit = unit;

        // Create Container
        this.container = new Container();
        this.container.label = `unit-${unit.id}`;
        parent.addChild(this.container);

        // Create bars container (not rotated with unit)
        this.barsContainer = new Container();
        this.barsContainer.label = 'bars';
        parent.addChild(this.barsContainer);

        // Create name text
        this.nameText = new Text({
            text: unit.name,
            style: {
                fontFamily: 'monospace',
                fontSize: 12,
                fill: colors.white,
            },
        });
        this.nameText.anchor.set(0.5, 1);
        this.barsContainer.addChild(this.nameText);

        // Create health bar
        this.healthBar = new HealthBar();
        this.barsContainer.addChild(this.healthBar);

        // Create unit graphics (will be initialized in init())
        this.unitCircle = new Graphics();
        this.directionLine = new Graphics();
    }

    public init() {
        const { x, y } = this.unit.movement.position;
        const direction = this.unit.movement.direction;

        // Unit body (color based on team and alive state)
        const unitColor = this.getUnitColor();
        this.unitCircle.circle(0, 0, 15).fill(unitColor);
        this.unitCircle.label = 'unit-circle';

        this.directionLine.lineTo(20, 0).stroke({ color: colors.white, width: 2 });
        this.directionLine.label = 'unit-direction-line';

        this.container.addChild(this.unitCircle);
        this.container.addChild(this.directionLine);

        this.container.position.set(x, y);
        this.container.rotation = direction;

        // Set opacity for dead units
        if (!this.unit.health.isAlive) {
            this.container.alpha = 0.3;
        }

        this.updateBars();
    }

    public update(unit: UnitState) {
        this.unit = unit;
        const { x, y } = this.unit.movement.position;
        const direction = this.unit.movement.direction;

        this.container.position.set(x, y);
        this.container.rotation = direction;

        // Update visual state based on alive status
        const unitColor = this.getUnitColor();
        this.unitCircle.clear().circle(0, 0, 15).fill(unitColor);

        // Update opacity for dead units
        this.container.alpha = this.unit.health.isAlive ? 1.0 : 0.3;

        this.updateBars();
    }

    /**
     * Updates health bar and name text position
     */
    private updateBars() {
        const { x, y } = this.unit.movement.position;

        // Clear existing bars
        this.barsContainer.removeChildren();

        // Re-add name text
        this.nameText.text = this.unit.name;
        this.nameText.position.set(x, y - 50);
        this.barsContainer.addChild(this.nameText);

        // Don't show health bar for dead units
        if (!this.unit.health.isAlive) {
            const statusText = new Text({
                text: 'DEAD',
                style: {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fill: colors.red,
                },
            });
            statusText.anchor.set(0.5, 0);
            statusText.position.set(x, y - 42);
            this.barsContainer.addChild(statusText);
            return;
        }

        // Update health bar with CE and Stamina
        this.healthBar.update({
            combatEffectiveness: this.unit.combat.combatEffectiveness,
            staminaPercentage: this.unit.stamina.staminaPercentage,
        });
        this.healthBar.position.set(x, y - 42);
        this.barsContainer.addChild(this.healthBar);

        // Show status indicators if critical
        if (!this.unit.health.isConscious) {
            const statusText = new Text({
                text: 'UNCONSCIOUS',
                style: {
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fill: colors.red,
                },
            });
            statusText.anchor.set(0.5, 0);
            statusText.position.set(x, y - 24);
            this.barsContainer.addChild(statusText);
        }
        else if (this.unit.stamina.staminaPercentage < 10) {
            const statusText = new Text({
                text: 'EXHAUSTED',
                style: {
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fill: colors.orange,
                },
            });
            statusText.anchor.set(0.5, 0);
            statusText.position.set(x, y - 24);
            this.barsContainer.addChild(statusText);
        }
    }

    /**
     * Gets unit color based on team and alive state
     */
    private getUnitColor(): string {
        if (!this.unit.health.isAlive) {
            return colors.gray;
        }
        return this.unit.team === 1 ? colors.blue : colors.red;
    }

    public destroy() {
        this.container.destroy({ children: true });
        this.barsContainer.destroy({ children: true });
    }
}
