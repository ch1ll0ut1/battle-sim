import { GameEngine } from '../GameEngine/GameEngine';
import { Logger } from '../ServerLogger';
import { TickUpdate } from '../TickUpdate';

export abstract class GameMode implements TickUpdate {
    protected logger: Logger;
    protected engine: GameEngine;

    constructor(logger: Logger, engine: GameEngine) {
        this.logger = logger;
        this.engine = engine;
    }

    abstract reset(): void;
    abstract handleCommand(command: string, data?: unknown): void;
    abstract update(deltaTime: number): void;
    abstract getState(): unknown;
}

export type GameModeConstructor = new (logger: Logger, engine: GameEngine) => GameMode;
