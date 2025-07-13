import { GameEngine } from "../../GameEngine/GameEngine";
import { Unit } from "../../Unit/Unit";
import { Logger } from "../../utils/Logger";
import { GameMode } from "../GameMode";

export class MovementSandbox extends GameMode {
    private units: Unit[] = [];

    reset() {
        this.logger.log('MovementSandbox started');

        this.units.push(new Unit(
            1, 
            "Unit 1", 
            1, 
            { weight: 1, strength: 1, experience: 1, age: 1, gender: "male" }, 
            { x: 50, y: 50 },
        ));

    }

    update(deltaTime: number) {
        console.log(`MovementSandbox: ${deltaTime}`);

        // Each unit takes action
        this.units.forEach(unit => unit.update(deltaTime));
    }

    getState() {
        return {
            units: this.units.map(unit => unit.getState())
        };
    }

    handleCommand(command: string, data?: any) {
        console.log(`MovementSandbox: ${command}`);
    }
}