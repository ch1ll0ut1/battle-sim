import { WebSocket } from 'ws';
import { events, GameEvent, GameEvents } from '../../game/events';
import { GameEngine } from '../GameEngine/GameEngine';
import { MovementSandbox } from '../GameMode/MovementSandbox/MovementSandbox';
import { Logger } from '../ServerLogger';
import { WebsocketServer } from '../WebsocketServer';
import { SimulationController } from './SimulationController';

/**
 * Main game server that orchestrates WebSocket connections, command processing, and simulation control
 * Handles the complete game server lifecycle including setup, command routing, and cleanup
 */
export class GameServer {
    private wsServer: WebsocketServer;
    private logger: Logger;
    #simulationController: SimulationController | null = null;
    #gameEngine: GameEngine | null = null;

    /**
     * Creates a new GameServer instance
     * @param port - The port number to run the WebSocket server on
     * @param units - Array of units participating in the game
     */
    constructor(port: number) {
        this.wsServer = new WebsocketServer(port);
        this.logger = new Logger();

        this.setupEventHandlers();
    }

    get gameEngine() {
        if (!this.#gameEngine) {
            throw new Error('GameEngine not initialized');
        }
        return this.#gameEngine;
    }

    get simulationController() {
        if (!this.#simulationController) {
            throw new Error('SimulationController not initialized');
        }
        return this.#simulationController;
    }

    private isInitialized() {
        return this.#gameEngine && this.#simulationController;
    }

    private handleNewClient(ws: WebSocket) {
        if (this.isInitialized()) {
            this.wsServer.send(ws, GameEvent.gameStateChanged, { state: this.gameEngine.getState() });
        }
    }

    /**
     * Sets up event handlers for WebSocket messages and logger events
     * Routes incoming commands to the simulation controller and broadcasts log events
     */
    private setupEventHandlers(): void {
        this.wsServer.on('message', (ws, message) => {
            const { type, data } = message;

            // @ts-expect-error TODO: add server-side validation
            events.emit(type, data);
        });

        this.wsServer.on('connect', this.handleNewClient.bind(this));

        // Listen for actions by the client
        events.on(GameEvent.initGame, () => {
            this.#gameEngine = new GameEngine(this.logger, MovementSandbox);
            this.#simulationController = new SimulationController(this.#gameEngine, this.logger);

            this.simulationController.start();
        });

        events.on(GameEvent.resumeGame, () => {
            this.simulationController.start();
        });

        events.on(GameEvent.pauseGame, () => {
            this.simulationController.pause();
        });

        events.on(GameEvent.nextTick, () => {
            this.simulationController.nextTick();
        });

        // Send state changes to the client
        Object.values(GameEvent).forEach((eventValue) => {
            if (!eventValue.startsWith('action.')) {
                events.on(eventValue, (...args: GameEvents[GameEvent]) => {
                    this.wsServer.broadcast(eventValue, args[0]);
                });
            }
        });
    }

    /**
     * Gracefully shuts down the game server
     * Stops the simulation and closes the WebSocket server
     */
    shutdown(): void {
        if (this.#simulationController?.isRunning()) {
            this.#simulationController.pause();
        }

        this.wsServer.close();
    }
}
