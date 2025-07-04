import { WebSocketServer, WebSocket } from 'ws';

/**
 * Generic WebSocket server that broadcasts messages to connected clients
 */
export class WebsocketServer {
    private wss: WebSocketServer;
    private clients: WebSocket[] = [];
    private onClientConnectCallback?: (ws: WebSocket) => void;

    /**
     * Creates a new WebSocket server instance
     * @param port - Port number to listen on
     */
    constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', this.handleServerError.bind(this));
    }

    /**
     * Registers a callback to be called when a new client connects
     * @param callback - Function to be called with the new WebSocket client
     */
    onClientConnect(callback: (ws: WebSocket) => void): void {
        this.onClientConnectCallback = callback;
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
        this.clients.push(ws);

        ws.on('error', (error) => {
            console.error('WebSocket client error:', error);
            this.removeClient(ws);
        });

        ws.on('close', () => {
            this.removeClient(ws);
        });

        // Notify consumer of new connection
        if (this.onClientConnectCallback) {
            this.onClientConnectCallback(ws);
        }
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

    /**
     * Sends a message to a specific client
     * @returns true if message was sent successfully, false otherwise
     */
    send(ws: WebSocket, type: string, data: any) {
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
    broadcast(type: string, data: any) {
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
} 