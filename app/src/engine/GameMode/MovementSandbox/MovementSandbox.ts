import { Unit } from '../../../game/Unit/Unit';
import { UnitAttributesData } from '../../../game/Unit/UnitAttributes';
import { GameMode } from '../GameMode';

export class MovementSandbox extends GameMode {
    private nextUnitId = 0; // Start from 2 since we already have Unit 1
    private units: Unit[] = [];

    reset() {
        this.logger.log('MovementSandbox reset');
        this.nextUnitId = 0;
        this.units = [this.createRandomUnit()];
    }

    update(deltaTime: number) {
        this.logger.debug(`MovementSandbox: ${deltaTime}`);

        // Give units random move order
        this.units.filter(unit => !unit.movement.isMoving).forEach((unit) => {
            unit.movement.moveTo(this.generateMoveToPosition(unit));
        });

        // Each unit takes action
        this.units.forEach((unit) => {
            unit.update(deltaTime);
        });
    }

    getState() {
        return {
            units: this.units.map(unit => unit.getState()),
        };
    }

    handleCommand(command: string, data?: unknown) {
        this.logger.debug(`MovementSandbox: ${command}`, data);
    }

    /**
     * Generates random attributes for a unit within valid ranges
     */
    private generateRandomAttributes(): UnitAttributesData {
        return {
            weight: Math.floor(Math.random() * 80) + 40, // 40-120 kg
            strength: Math.floor(Math.random() * 80) + 20, // 20-100
            experience: Math.random(), // 0-1
            age: Math.floor(Math.random() * 60) + 1, // 1-60 years
            gender: Math.random() < 0.5 ? 'male' : 'female',
        };
    }

    /**
     * Generates a random position within the map bounds based on a random distance from current position
     */
    private generateRandomPosition() {
        const { width, height } = this.engine.map;

        return {
            x: Math.random() * width,
            y: Math.random() * height,
        };
    }

    private generateMoveToPosition(unit: Unit) {
        const { width, height } = this.engine.map;
        const { x, y } = unit.movement.position;

        // Generate random distance (50-300 units)
        const maxDistance = Math.random() * 250 + 50;

        // Generate random direction (0 to 2π radians)
        const angle = Math.random() * 2 * Math.PI;

        // Calculate new position based on current position + distance in random direction
        const newX = x + Math.cos(angle) * maxDistance;
        const newY = y + Math.sin(angle) * maxDistance;

        // Clamp to map bounds
        return {
            x: Math.max(0, Math.min(width, newX)),
            y: Math.max(0, Math.min(height, newY)),
        };
    }

    /**
     * Creates a new random unit and adds it to the simulation
     */
    private createRandomUnit(): Unit {
        const attributes = this.generateRandomAttributes();
        // For new units, generate a completely random position within map bounds
        const position = this.generateRandomPosition();
        const team = Math.floor(Math.random() * 2) + 1; // Team 1 or 2
        const name = `Random Unit ${this.nextUnitId}`;

        const unit = new Unit(
            this.nextUnitId,
            name,
            team,
            attributes,
            position,
        );

        this.nextUnitId++;

        this.logger.log(`Created random unit: ${name} (ID: ${unit.id}, Team: ${team})`);
        return unit;
    }
}
