import { WebsocketServer } from '../utils/WebsocketServer.js';
import { SimulationController } from './SimulationController.js';
import { BattleEngine, Unit } from '../BattleEngine/BattleEngine.js';
import { Logger } from '../utils/Logger.js';
import { WebSocket } from 'ws';

/**
 * Main battle server that orchestrates WebSocket connections, command processing, and simulation control
 * Handles the complete battle server lifecycle including setup, command routing, and cleanup
 */
export class BattleServer {
    private wsServer: WebsocketServer;
    private simulationController: SimulationController;
    private battleEngine: BattleEngine;
    private logger: Logger;

    /**
     * Creates a new BattleServer instance
     * @param port - The port number to run the WebSocket server on
     * @param units - Array of units participating in the battle
     */
    constructor(port: number, units: Unit[]) {
        this.wsServer = new WebsocketServer(port);
        this.logger = new Logger();
        this.battleEngine = new BattleEngine(units, this.logger);
        this.simulationController = new SimulationController(this.battleEngine, this.logger);
        
        this.setupEventHandlers();
    }

    /**
     * Gracefully shuts down the battle server
     * Stops the simulation and closes the WebSocket server
     */
    shutdown(): void {
        this.simulationController.stop();
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

        this.battleEngine.on('updated', () => {
            this.wsServer.broadcast('battleState', this.battleEngine.getState());
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
                console.warn(`Unknown command: ${message.data}`);
        }
    }

    private handleNewClient(ws: WebSocket) {
        this.wsServer.send(ws, 'battleState', this.battleEngine.getState());
        this.wsServer.send(ws, 'log', this.logger.getEvents());
    }
} 