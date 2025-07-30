import { EventEmitter } from 'eventemitter3';

interface WebSocketClientEvents {
    connected: [];
    disconnected: [code: number, reason: string];
    message: [type: string, data: unknown];
    error: [error: Event];
}

/**
 * Basic WebSocket client that handles connection management, reconnection, and message sending/receiving
 * Focused purely on WebSocket protocol concerns without application-specific logic
 * Extends EventEmitter for clean event handling
 */
export class WebSocketClient extends EventEmitter<WebSocketClientEvents> {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectInterval = 3000;
    private maxReconnectAttempts = 10;
    private reconnectAttempts = 0;
    private reconnectTimer: number | null = null;
    private isConnecting = false;

    /**
     * Creates a new WebSocketClient instance
     * @param url - WebSocket server URL (e.g., 'ws://localhost:3001')
     */
    constructor(url: string) {
        super();
        this.url = url;
    }

    /**
     * Establishes WebSocket connection to the server
     * @returns Promise that resolves when connection is established
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
                resolve();
                return;
            }

            this.isConnecting = true;
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.clearReconnectTimer();
                this.emit('connected');
                resolve();
            };

            this.ws.onmessage = (event: MessageEvent<string>) => {
                try {
                    const message = JSON.parse(event.data) as { type: string; data: unknown };
                    this.emit('message', message.type, message.data);
                }
                catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                this.isConnecting = false;
                this.ws = null;

                this.emit('disconnected', event.code, event.reason);

                // Attempt reconnection if not manually closed
                if (event.code !== 1000) {
                    this.attemptReconnect();
                }
            };

            this.ws.onerror = (error: Event) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
                reject(new Error(JSON.stringify(error)));
            };
        });
    }

    /**
     * Closes the WebSocket connection
     */
    disconnect(): void {
        this.clearReconnectTimer();

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
    }

    /**
     * Sends a message to the server
     * @param type - Message type identifier
     * @param data - Message payload
     */
    send(type: string, data: unknown): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected, cannot send message:', type, data);
            return;
        }

        const message = { type, data };
        this.ws.send(JSON.stringify(message));
    }

    /**
     * Gets the current connection state
     */
    get isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Attempts to reconnect to the WebSocket server with exponential backoff
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimer = window.setTimeout(() => {
            this.connect().catch(() => {
                // Failed to reconnect, will try again
            });
        }, delay);
    }

    /**
     * Clears the reconnection timer
     */
    private clearReconnectTimer(): void {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}
