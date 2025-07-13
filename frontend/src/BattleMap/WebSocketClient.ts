/**
 * Handles WebSocket communication with the battle simulation server
 */
export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private readonly baseDelay = 100; // 100ms
    private readonly url: string;

    private onConnectionChange?: (isConnected: boolean) => void;
    private onBattleStateChange?: (battleState: any) => void;
    private onBattleLogChange?: (battleLog: any) => void;

    constructor(url: string = 'ws://localhost:8080') {
        this.url = url;
    }

    /**
     * Sets up event handlers for WebSocket communication
     */
    public setEventHandlers(
        onConnectionChange: (isConnected: boolean) => void,
        onBattleStateChange: (battleState: any) => void,
        onBattleLogChange: (battleLog: any) => void
    ) {
        this.onConnectionChange = onConnectionChange;
        this.onBattleStateChange = onBattleStateChange;
        this.onBattleLogChange = onBattleLogChange;
    }

    /**
     * Connects to the WebSocket server
     */
    public connect(): void {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            this.onConnectionChange?.(true);
            console.log('Connected to battle simulation server');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.onConnectionChange?.(false);
        };

        this.ws.onclose = () => {
            this.onConnectionChange?.(false);
            console.log('Disconnected from battle simulation server');
            this.attemptReconnect();
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event);
        };
    }

    /**
     * Sends a command to the server
     */
    public sendCommand(command: string): void {
        console.log(`Sending command: ${command}`, this.ws?.readyState);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'command', data: command }));
        }
    }

    /**
     * Closes the WebSocket connection
     */
    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * Attempts to reconnect with exponential backoff
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }

        const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Handles incoming WebSocket messages
     */
    private handleMessage(event: MessageEvent): void {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        switch (message.type) {
            case 'gameState':
                this.onBattleStateChange?.(message.data);
                break;
            case 'log':
                this.onBattleLogChange?.(message.data);
                break;
        }
    }
} 