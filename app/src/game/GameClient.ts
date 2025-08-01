import { logger } from '../engine/Logger';
import { WebSocketClient } from '../engine/WebSocketClient';
import { EventAction, events, GameEvent, GameEvents } from './events';

/**
 * GameClient handles backend communication and automatically forwards action events to the server
 * Server message types directly match GameEvent enum values
 * Queues actions while disconnected and sends them when reconnected
 */
class GameClientClass {
    private wsClient: WebSocketClient | null = null;
    private actionQueue: EventAction[] = [];

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Connect to the game server
     */
    async connect(url: string) {
        this.wsClient = new WebSocketClient(url);
        this.setupWebSocketListeners();

        try {
            await this.wsClient.connect();
        }
        catch (error) {
            logger.error('Failed to connect to server:', error);
        }
    }

    /**
     * Set up event listeners for all action events
     */
    private setupEventListeners() {
        // Listen for all action events and forward them to the server
        Object.values(GameEvent).forEach((eventValue) => {
            if (eventValue.startsWith('action.')) {
                events.on(eventValue, (...args: GameEvents[GameEvent]) => {
                    this.sendActionEvent(eventValue, args);
                });
            }
        });
    }

    /**
     * Send an action event to the server or queue it if disconnected
     */
    private sendActionEvent<T extends GameEvent>(eventType: T, args: GameEvents[T], allowQueue = true) {
        if (!Array.isArray(args) || args.length > 1) {
            throw new Error(`Invalid args for Action ${eventType}: ${JSON.stringify(args)}`);
        }

        if (!this.wsClient?.isConnected) {
            if (allowQueue) {
                this.queueAction(eventType, args);
            }
            else {
                throw new Error('Not connected to server');
            }
            return;
        }

        try {
            this.wsClient.send(eventType, args.length === 1 ? args[0] : {});
        }
        catch (error) {
            logger.error(`Failed to send action '${eventType}' ${allowQueue ? '(add to queue)' : ''}`, error);

            if (!allowQueue) {
                throw error;
            }

            this.queueAction(eventType, args);
        }
    }

    /**
     * Queue an action for later sending
     */
    private queueAction<T extends GameEvent>(eventType: T, args: GameEvents[T]) {
        this.actionQueue.push({
            eventType,
            args,
        });
        logger.debug(`Queued action '${eventType}' (queue size: ${this.actionQueue.length})`);
    }

    /**
     * Set up WebSocket event listeners to handle server messages
     */
    private setupWebSocketListeners() {
        if (!this.wsClient) return;

        this.wsClient.on('connected', () => {
            logger.info('Connected to game server');
            events.emit(GameEvent.connected);
            this.sendQueuedActions();
        });

        this.wsClient.on('disconnected', (code, reason) => {
            logger.info(`Disconnected from server: ${code} ${reason}`);
            events.emit(GameEvent.disconnected);
        });

        this.wsClient.on('message', (type, data) => {
            this.handleServerMessage(type as GameEvent, data as GameEvents[GameEvent]);
        });

        this.wsClient.on('error', (error) => {
            logger.error('WebSocket error:', error);
        });
    }

    /**
     * Handle incoming messages from the server by directly emitting the event
     */
    private handleServerMessage(type: GameEvent, data: unknown) {
        if (Object.values(GameEvent).includes(type)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            events.emit(type as keyof GameEvents, data as any);
        }
        else {
            throw new Error(`Unknown server message type: ${type}`);
        }
    }

    /**
     * Send all queued actions to the server
     */
    private sendQueuedActions() {
        if (!this.wsClient) {
            throw new Error('No WebSocket client to send queued actions');
        }

        if (this.actionQueue.length === 0) return;

        logger.info(`Sending ${this.actionQueue.length} queued actions`);

        while (this.actionQueue.length > 0) {
            const action = this.actionQueue.shift();
            if (!action) {
                throw new Error('No action to send');
            }

            this.sendActionEvent(action.eventType, action.args, false);
        }
    }
}

// Export single instance
export const gameClient = new GameClientClass();
