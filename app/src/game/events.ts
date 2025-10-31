import EventEmitter from 'eventemitter3';
import { debugConfig } from '../config/debug';
import { GameEngine } from '../engine/GameEngine/GameEngine';
import { logger } from '../engine/Logger';

export interface EventAction<T extends GameEvent = GameEvent> {
    eventType: T;
    args: GameEvents[T];
}

export enum GameEvent {
    // Action events (user initiated)
    initGame = 'action.initGame',
    resumeGame = 'action.resumeGame',
    pauseGame = 'action.pauseGame',
    nextTick = 'action.nextTick',

    // Game state events (backend responses/updates)
    /** Sent on initial connection when game is already running or after game start */
    gameStateChanged = 'game.stateChanged',
    gameStarted = 'game.started',
    gamePaused = 'game.paused',
    gameFinished = 'game.finished',
    tickFinished = 'game.tickFinished',

    // Unit events
    // unitCreated = 'unit.created',
    // unitUpdated = 'unit.updated',
    // unitMoved = 'unit.moved',
    // unitDied = 'unit.died',
    unitMovementUpdate = 'unit.movementUpdate',

    // Combat events
    attackPreparing = 'combat.attackPreparing',
    attackExecuting = 'combat.attackExecuting',
    attackCompleted = 'combat.attackCompleted',

    // // Map events
    // mapLoaded = 'map.loaded',
    // mapUpdated = 'map.updated',

    // Connection events
    connected = 'connection.connected',
    disconnected = 'connection.disconnected',
}

export interface GameEvents {
    [GameEvent.initGame]: [{ gameMode: string; map: string }];
    [GameEvent.resumeGame]: [];
    [GameEvent.pauseGame]: [];
    [GameEvent.nextTick]: [];

    [GameEvent.gameStateChanged]: [{ state: ReturnType<GameEngine['getState']> }];
    [GameEvent.gameStarted]: [];
    [GameEvent.gamePaused]: [];
    [GameEvent.gameFinished]: [];
    [GameEvent.tickFinished]: [{ time: number; delayTime: number }];

    [GameEvent.unitMovementUpdate]: [{
        unitId: number;
        changes: {
            position?: { x: number; y: number };
            direction?: number;
        };
    }];

    [GameEvent.attackPreparing]: [{
        attackerId: number;
        targetId: number;
        attackType: 'attack' | 'heavyAttack' | 'riposte';
    }];
    [GameEvent.attackExecuting]: [{
        attackerId: number;
        targetId: number;
        attackType: 'attack' | 'heavyAttack' | 'riposte';
    }];
    [GameEvent.attackCompleted]: [{
        attackerId: number;
        targetId: number;
    }];

    // TODO: cleanup
    // [GameEvent.unitCreated]: [{ unitId: number; unitData: object }];
    // [GameEvent.unitUpdated]: [{ unitId: number; unitData: object }];
    // [GameEvent.unitMoved]: [{ unitId: number; position: { x: number; y: number } }];
    // [GameEvent.unitDied]: [{ unitId: number }];

    // [GameEvent.mapLoaded]: [{ mapData: object }];
    // [GameEvent.mapUpdated]: [{ mapData: object }];

    [GameEvent.connected]: [];
    [GameEvent.disconnected]: [];
}

/**
 * Central event system for managing game events throughout the frontend application
 * Provides type-safe event handling and acts as the main communication hub between components
 * All user actions and state changes flow through this event system
 */
class GameEventsClass extends EventEmitter<GameEvents> {
    constructor() {
        super();
        this.setupLogging();
    }

    /**
     * Set up logging by listening to events and forwarding to logger
     */
    private setupLogging() {
        // Log all other events as debug messages when in debug mode
        if (debugConfig.enabled && debugConfig.logEvents) {
            const originalEmit = this.emit.bind(this);
            this.emit = (eventName, ...args) => {
                logger.debug(`Event: ${String(eventName)}`, ...args);

                if (this.listeners(eventName).length === 0) {
                    logger.debug(`No listeners for event: ${String(eventName)}`);
                }

                return originalEmit(eventName, ...args);
            };
        }
    }
}

// Export single instance using module scope
export const events = new GameEventsClass();
