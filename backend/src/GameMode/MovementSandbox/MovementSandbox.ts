import { Unit } from "../../Unit/Unit";
import { UnitAttributesData } from "../../Unit/UnitAttributes";
import { GameMode } from "../GameMode";

export class MovementSandbox extends GameMode {
    private nextUnitId = 0; // Start from 2 since we already have Unit 1
    private units: Unit[] = [this.createRandomUnit()];

    reset() {
        this.logger.log('MovementSandbox reset');
        this.nextUnitId = 0;
        this.units = [this.createRandomUnit()];
    }

    update(deltaTime: number) {
        this.logger.debug(`MovementSandbox: ${deltaTime}`);

        // Give units random move order
        this.units.filter(unit => !unit.movement.isMoving).forEach(unit => {
            unit.movement.moveTo(this.generateRandomPosition());
        });

        // Each unit takes action
        this.units.forEach(unit => unit.update(deltaTime));
    }

    getState() {
        return {
            units: this.units.map(unit => unit.getState())
        };
    }

    handleCommand(command: string, data?: any) {
        this.logger.debug(`MovementSandbox: ${command}`, data);

        switch (command) {
            case 'generateRandomUnit':
                const unit = this.createRandomUnit();
            break;
            
            default:
                this.logger.log(`Unknown command: ${command}`);
            break;
        }
    }

    /**
     * Generates random attributes for a unit within valid ranges
     */
    private generateRandomAttributes(): UnitAttributesData {
        return {
            weight: Math.floor(Math.random() * 80) + 40, // 40-120 kg
            strength: Math.floor(Math.random() * 100) + 1, // 1-100
            experience: Math.random(), // 0-1
            age: Math.floor(Math.random() * 60) + 1, // 1-60 years
            gender: Math.random() < 0.5 ? 'male' : 'female'
        };
    }

    /**
     * Generates a random position within a reasonable area
     */
    private generateRandomPosition(): { x: number, y: number } {
        return {
            x: Math.floor(Math.random() * 200) + 50, // 50-250
            y: Math.floor(Math.random() * 200) + 50  // 50-250
        };
    }

    /**
     * Creates a new random unit and adds it to the simulation
     */
    private createRandomUnit(): Unit {
        const attributes = this.generateRandomAttributes();
        const position = this.generateRandomPosition();
        const team = Math.floor(Math.random() * 2) + 1; // Team 1 or 2
        const name = `Random Unit ${this.nextUnitId}`;

        const unit = new Unit(
            this.nextUnitId,
            name,
            team,
            attributes,
            position
        );

        this.nextUnitId++;

        this.logger.log(`Created random unit: ${name} (ID: ${unit.id}, Team: ${team})`);
        return unit;
    }
}