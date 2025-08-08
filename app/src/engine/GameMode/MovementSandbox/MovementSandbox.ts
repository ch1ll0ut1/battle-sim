import { Unit } from '../../../game/Unit/Unit';
import { UnitAttributesData } from '../../../game/Unit/UnitAttributes';
import { GameMode } from '../GameMode';
import { RandomMovementAI } from './RandomMovementAI';

const DEFAULT_UNITS = 1000;

export class MovementSandbox extends GameMode {
    private nextUnitId = 0; // Start from 2 since we already have Unit 1
    private units: Unit[] = [];
    private movementAI: RandomMovementAI | null = null;

    reset() {
        this.logger.log('MovementSandbox reset');
        this.nextUnitId = 0;
        this.units = [];

        // Initialize movement AI with the current map
        this.movementAI = new RandomMovementAI(this.engine.map);

        // Create 100 initial units
        for (let i = 0; i < DEFAULT_UNITS; i++) {
            this.units.push(this.createRandomUnit());
        }
    }

    update(deltaTime: number) {
        this.logger.debug(`MovementSandbox: ${deltaTime}`);

        // Update unit physics first
        this.units.forEach((unit) => {
            unit.update(deltaTime);
        });

        // Then use AI to give units random move orders based on updated state
        if (this.movementAI) {
            this.movementAI.updateUnits(this.units);
        }
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
