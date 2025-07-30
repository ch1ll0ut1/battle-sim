import EventEmitter from 'eventemitter3';
import { logger } from '../Engine/Logger';
import { debugConfig } from '../app/config/debug';

export interface EventAction<T extends GameEvent = GameEvent> {
    eventType: T;
    args: GameEvents[T];
}

export enum GameEvent {
    // Action events (user initiated)
    initGame = 'action.initGame',
    startGame = 'action.startGame',
    pauseGame = 'action.pauseGame',
    nextTick = 'action.nextTick',

    // Game state events (backend responses/updates)
    gameStateChanged = 'game.stateChanged',
    gameStarted = 'game.started',
    gameStopped = 'game.stopped',

    // Unit events
    unitCreated = 'unit.created',
    unitUpdated = 'unit.updated',
    unitMoved = 'unit.moved',
    unitDied = 'unit.died',

    // Map events
    mapLoaded = 'map.loaded',
    mapUpdated = 'map.updated',

    // Log events
    logMessage = 'log.message',

    // Connection events
    connected = 'connection.connected',
    disconnected = 'connection.disconnected',
}

export interface GameEvents {
    [GameEvent.initGame]: [{ gameMode: string; map: string }];
    [GameEvent.startGame]: [];
    [GameEvent.pauseGame]: [];
    [GameEvent.nextTick]: [];

    [GameEvent.gameStateChanged]: [{ state: object }];
    [GameEvent.gameStarted]: [];
    [GameEvent.gameStopped]: [];

    [GameEvent.unitCreated]: [{ unitId: number; unitData: object }];
    [GameEvent.unitUpdated]: [{ unitId: number; unitData: object }];
    [GameEvent.unitMoved]: [{ unitId: number; position: { x: number; y: number } }];
    [GameEvent.unitDied]: [{ unitId: number }];

    [GameEvent.mapLoaded]: [{ mapData: object }];
    [GameEvent.mapUpdated]: [{ mapData: object }];

    [GameEvent.logMessage]: [{ message: string }];

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
        // Log log events (passed through from backend)
        this.on(GameEvent.logMessage, (message) => {
            logger.info(message);
        });

        // Log all other events as debug messages when in debug mode
        if (debugConfig.enabled && debugConfig.logEvents) {
            const originalEmit = this.emit.bind(this);
            this.emit = (eventName, ...args) => {
                // Don't log the logMessage event again to avoid recursion
                if (eventName !== GameEvent.logMessage) {
                    logger.debug(`Event: ${String(eventName)}`, ...args);
                }
                return originalEmit(eventName, ...args);
            };
        }
    }
}

// Export single instance using module scope
export const events = new GameEventsClass();
