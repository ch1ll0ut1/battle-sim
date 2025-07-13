import { GameEngine } from "../GameEngine/GameEngine";
import { Logger } from "../utils/Logger";
import { TickUpdate } from "../utils/TickUpdate";

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

export type GameModeConstructor = new (logger: Logger, engine: GameEngine) => GameMode;

