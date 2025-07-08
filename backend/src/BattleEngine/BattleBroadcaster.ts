import { WebsocketServer } from '../utils/WebsocketServer.js';
import { Logger } from '../utils/Logger.js';
import { BattleEngine, Unit } from './BattleEngine.js';
import { WebSocket } from 'ws';

/**
 * Handles broadcasting battle-specific messages via WebSocket
 */
export class BattleBroadcaster {
  private wsServer: WebsocketServer;
  private engine: BattleEngine;
  private logger: Logger;

  /**
   * Creates a new BattleBroadcaster instance
   */
  constructor(wsServer: WebsocketServer, engine: BattleEngine, logger: Logger) {
    this.wsServer = wsServer;
    this.engine = engine;
    this.logger = logger;

    // Register connection callback
    this.wsServer.on('connect', this.handleNewClient.bind(this));
  }

  /**
   * Handles new client connections
   */
  private handleNewClient(ws: WebSocket): void {
    console.log('Sending initial state to client');
    this.wsServer.send(ws, 'battleState', this.engine.getState());
    this.wsServer.send(ws, 'battleLog', this.logger.getEvents());
  }

  /**
   * Broadcasts current battle state to all clients
   */
  broadcastState() {
    this.wsServer.broadcast('battleState', this.engine.getState());
  }

  /**
   * Broadcasts both state and log updates
   */
  broadcastUpdates() {
    this.broadcastState();
  }
} 