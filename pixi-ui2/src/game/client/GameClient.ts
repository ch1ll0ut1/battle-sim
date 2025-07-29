import { WebSocketClient } from '../../Engine/WebSocketClient';
import { events, GameEvent, GameEvents } from '../events';
import { logger } from '../../Engine/Logger';

interface QueuedAction<T extends GameEvent = GameEvent> {
    eventType: T;
    args: GameEvents[T];
}

/**
 * GameClient handles backend communication and automatically forwards action events to the server
 * Server message types directly match GameEvent enum values
 * Queues actions while disconnected and sends them when reconnected
 */
class GameClientClass {
    private wsClient: WebSocketClient | null = null;
    private actionQueue: QueuedAction[] = [];

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
    private sendActionEvent<T extends GameEvent>(eventType: T, args: GameEvents[T]) {
        if (!this.wsClient?.isConnected) {
            this.queueAction(eventType, args);
            return;
        }

        try {
            // Send the event in the backend's expected format
            this.wsClient.send(eventType, args.length === 1 ? args[0] : args);
        }
        catch (error) {
            // If sending fails (e.g., connection lost), queue the action
            logger.error(`Failed to send action '${eventType}', queueing it:`, error);
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
            this.wsClient.send(action.eventType, action.args.length === 1 ? action.args[0] : action.args);
        }
    }

    /**
     * Handle incoming messages from the server by directly emitting the event
     */
    private handleServerMessage<T extends GameEvent>(type: T, data: GameEvents[T]) {
        // Check if the message type matches a GameEvent enum value
        if (Object.values(GameEvent).includes(type)) {
            events.emit(type as keyof GameEvents, data);
        }
        else {
            throw new Error(`Unknown server message type: ${type}`);
        }
    }
}

// Export single instance
export const gameClient = new GameClientClass();
