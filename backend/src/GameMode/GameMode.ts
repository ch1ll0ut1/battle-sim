import { GameEngine } from "../GameEngine/GameEngine";
import { Logger } from "../utils/Logger";
import { TickUpdate } from "../utils/TickUpdate";
import { MovementSandbox } from "./MovementSandbox/MovementSandbox";

export abstract class GameMode implements TickUpdate {
    protected logger: Logger;
    protected engine: GameEngine;


    constructor(logger: Logger, engine: GameEngine) {
        this.logger = logger;
        this.engine = engine;

        this.reset();
    }

    abstract reset(): void;
    abstract handleCommand(command: string, data?: any): void;
    abstract update(deltaTime: number): void;
    abstract getState(): any;
}

type GameModeConstructor = new (logger: Logger, engine: GameEngine) => GameMode;

export const GameModeType = {
    'movement-sandbox': MovementSandbox,
} as const satisfies Record<string, GameModeConstructor>;