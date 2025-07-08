import { EventEmitter } from 'node:stream';
import { WebSocketServer, WebSocket } from 'ws';

/**
 * Message structure for WebSocket communication
 */
interface WebSocketMessage<T = any> {
    type: string;
    data: T;
}

type EventMessage = {
    'connect': [WebSocket],
    'message': [WebSocket, WebSocketMessage],
}

/**
 * Generic WebSocket server that broadcasts messages to connected clients
 */
export class WebsocketServer extends EventEmitter<EventMessage> {
    private wss: WebSocketServer;
    private clients: WebSocket[] = [];

    /**
     * Creates a new WebSocket server instance
     * @param port - Port number to listen on
     */
    constructor(port: number) {
        super();
        this.wss = new WebSocketServer({ port });
        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', this.handleServerError.bind(this));
    }

    /**
     * Sends a message to a specific client
     * 
     * @throws Error if client is not connected
     */
    send(ws: WebSocket, type: string, data: any): void {
        if (ws.readyState !== WebSocket.OPEN) {
            throw new Error('Client is not connected');
        }

        try {
            ws.send(JSON.stringify({ type, data }));
        } catch (error) {
            console.error('Error sending message to client:', { error, type });
            this.removeClient(ws);
        }
    }

    /**
     * Broadcasts a message to all connected clients
     */
    broadcast(type: string, data: any): void {
        const message = JSON.stringify({ type, data });

        this.clients.forEach(client => {
            try {
                client.send(message);
            } catch (error) {
                console.error('Error broadcasting to client:', { error, type });
                this.removeClient(client);
            }
        });
    }

    /**
     * Returns all connected clients
     */
    getClients(): WebSocket[] {
        // Only return clients that are actually connected
        return this.clients.filter(client => client.readyState === WebSocket.OPEN);
    }

    /**
     * Closes the WebSocket server
     */
    close(): void {
        // Close all client connections
        this.clients.forEach(client => {
            try {
                client.close();
            } catch (error) {
                console.error('Error closing client connection:', error);
            }
        });

        this.clients = [];

        // Remove all event listeners
        this.wss.removeAllListeners();

        // Close the server
        this.wss.close();
    }

    /**
     * Handles new WebSocket connections
     */
    private handleConnection(ws: WebSocket): void {
        // Wait for connection to be established
        if (ws.readyState === WebSocket.CONNECTING) {
            ws.once('open', () => this.setupClient(ws));
        } else if (ws.readyState === WebSocket.OPEN) {
            this.setupClient(ws);
        }
    }

    /**
     * Sets up event handlers for a connected client
     */
    private setupClient(ws: WebSocket): void {
        console.log('New client connected');
        this.clients.push(ws);

        ws.on('error', (error) => {
            console.error('WebSocket client error:', error);
            this.removeClient(ws);
        });

        ws.on('close', () => {
            this.removeClient(ws);
        });

        ws.on('message', (data: string) => {
            try {
                const message = JSON.parse(data) as WebSocketMessage;
                console.log('Received message:', message);
                if (this.validateMessage(message)) {
                    this.emit('message', ws, message);
                }
            } catch (error) {
                console.error('Error parsing message from client:', error);
            }
        });

        // Notify consumer of new connection
        this.emit('connect', ws);
    }

    /**
     * Validates a WebSocket message
     */
    private validateMessage(message: any): message is WebSocketMessage {
        console.log('Validating message:', message);
        return (
            message &&
            typeof message === 'object' &&
            typeof message.type === 'string' &&
            'data' in message
        );
    }

    /**
     * Removes a client from the clients list
     */
    private removeClient(ws: WebSocket): void {
        const index = this.clients.indexOf(ws);
        if (index !== -1) {
            this.clients.splice(index, 1);
        }
    }

    /**
     * Handles server-level WebSocket errors
     */
    private handleServerError(error: Error): void {
        console.error('WebSocket server error:', error);
    }
} 