import { WebsocketServer } from '../utils/WebsocketServer.js';
import { SimulationController } from './SimulationController.js';
import { GameEngine } from '../GameEngine/GameEngine.js';
import { Logger } from '../utils/Logger.js';
import { WebSocket } from 'ws';

/**
 * Main game server that orchestrates WebSocket connections, command processing, and simulation control
 * Handles the complete game server lifecycle including setup, command routing, and cleanup
 */
export class GameServer {
    private wsServer: WebsocketServer;
    private simulationController: SimulationController;
    private gameEngine: GameEngine;
    private logger: Logger;

    /**
     * Creates a new GameServer instance
     * @param port - The port number to run the WebSocket server on
     * @param units - Array of units participating in the game
     */
    constructor(port: number) {
        this.wsServer = new WebsocketServer(port);
        this.logger = new Logger();
        this.gameEngine = new GameEngine(this.logger, 'movement-sandbox');
        this.simulationController = new SimulationController(this.gameEngine, this.logger);
        
        this.setupEventHandlers();
    }

    /**
     * Gracefully shuts down the game server
     * Stops the simulation and closes the WebSocket server
     */
    shutdown(): void {
        if (this.simulationController.isRunning()) {
            this.simulationController.stop();
        }

        this.wsServer.close();
    }

    /**
     * Sets up event handlers for WebSocket messages and logger events
     * Routes incoming commands to the simulation controller and broadcasts log events
     */
    private setupEventHandlers(): void {
        this.wsServer.on('message', (ws, message) => {
            this.handleCommand(ws, message);
        });
        
        this.logger.on('log', (message) => {
            this.wsServer.broadcast('log', message);
        });

        this.wsServer.on('connect', this.handleNewClient.bind(this));

        this.gameEngine.on('updated', () => {
            this.wsServer.broadcast('gameState', this.gameEngine.getState());
        });
    }

    /**
     * Handles incoming WebSocket commands and delegates to the simulation controller
     * Validates command format and routes to appropriate simulation control methods
     * @param ws - The WebSocket connection that sent the command
     * @param message - The command message object
     */
    private handleCommand(ws: any, message: any): void {
        if (message.type !== 'command') return;
        
        console.log(`Received command: ${message.data}`);
        switch (message.data) {
            case 'start':
                this.simulationController.start();
                break;
            case 'stop':
                this.simulationController.stop();
                break;
            case 'nextTick':
                this.simulationController.nextTick();
                break;
            case 'reset':
                this.simulationController.reset();
                break;
            default:
                throw new Error(`Unknown command: ${message.data}`);
        }
    }

    private handleNewClient(ws: WebSocket) {
        this.wsServer.send(ws, 'gameState', this.gameEngine.getState());
        this.wsServer.send(ws, 'log', this.logger.getEvents());
    }
} 