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
    this.wsServer.onClientConnect(this.handleNewClient.bind(this));
  }

  /**
   * Handles new client connections
   */
  private handleNewClient(ws: WebSocket): void {
    // Send initial state to new client
    const state = this.getBattleState();
    this.wsServer.send(ws, 'battleState', state);
    this.wsServer.send(ws, 'battleLog', this.logger.getEvents());
  }

  /**
   * Gets current battle state
   */
  private getBattleState(): any {
    return {
      units: this.engine['units'].map(unit => ({
        id: unit.id,
        name: unit.name,
        health: unit.health,
        team: unit.team
      }))
    };
  }

  /**
   * Broadcasts current battle state to all clients
   */
  broadcastState() {
    this.wsServer.broadcast('battleState', this.getBattleState());
  }

  /**
   * Broadcasts battle log to all clients
   */
  broadcastLog() {
    // TODO: dont send full log but only what has not been sent yet
    this.wsServer.broadcast('battleLog', this.logger.getEvents());
  }

  /**
   * Broadcasts both state and log updates
   */
  broadcastUpdates() {
    this.broadcastState();
    this.broadcastLog();
  }
} 