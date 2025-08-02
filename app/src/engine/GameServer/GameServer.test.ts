import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocket } from 'ws';
import { units1v1 } from '../../data/testUnits';
import { events, GameEvent } from '../../game/events';
import { Unit } from '../../game/Unit/Unit';
import { WebsocketServer } from '../WebsocketServer';
import { GameServer } from './GameServer';

// Mock the WebsocketServer to avoid actual network operations in tests
vi.mock('../WebsocketServer');

/**
 * Tests for GameServer
 * Covers server initialization, command handling, and shutdown behavior
 * Tests behavior and observable outcomes, not implementation details
 */
describe('GameServer', () => {
    let mockWsServer: any;
    let gameServer: GameServer;
    let units: Unit[];

    /**
     * Sets up mock WebSocket server and fresh game server for each test
     */
    beforeEach(() => {
        units = JSON.parse(JSON.stringify(units1v1));

        // Mock WebSocket server
        mockWsServer = {
            on: vi.fn(),
            broadcast: vi.fn(),
            send: vi.fn(),
            close: vi.fn(),
        };

        // Mock the WebsocketServer constructor
        vi.mocked(WebsocketServer).mockImplementation(() => mockWsServer);

        gameServer = new GameServer(8080);
    });

    afterEach(() => {
        gameServer.shutdown();
    });

    /**
     * Tests that GameServer initializes with correct components
     * Verifies that WebSocket server is created and event handlers are set up
     */
    it('should initialize with WebSocket server and event handlers', () => {
        // Assert - should have message and connect handlers
        expect(mockWsServer.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(mockWsServer.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockWsServer.on).toHaveBeenCalledTimes(2);
    });

    /**
     * Tests that shutdown properly stops simulation and closes WebSocket server
     * Verifies that the server cleans up resources when shutting down
     */
    it('should shutdown gracefully', () => {
        // Act
        gameServer.shutdown();

        // Assert
        expect(mockWsServer.close).toHaveBeenCalled();
    });

    /**
     * Tests that new client connections receive initial game state
     * Verifies that the connect handler sends current state to new clients
     */
    it('should send initial state to new clients on connect', () => {
        // Arrange
        const mockWebSocket = {} as WebSocket;
        events.emit(GameEvent.initGame, { gameMode: 'test', map: 'test' });

        // Get actual game state from the real GameEngine
        const actualGameState = gameServer.gameEngine.getState();

        // Act - simulate a client connection
        const connectHandler = mockWsServer.on.mock.calls.find((call: any) =>
            call[0] === 'connect',
        )?.[1];

        if (connectHandler) {
            connectHandler(mockWebSocket);
        }

        // Assert
        expect(mockWsServer.send).toHaveBeenCalledWith(mockWebSocket, GameEvent.gameStateChanged, { state: actualGameState });
    });

    /**
     * Tests that GameEngine initialized events trigger game state broadcast
     * Verifies that the server broadcasts state updates when game is initialized
     */
    it('should broadcast game state on GameEngine initialized event', () => {
        // Arrange
        const testGameState = { time: 0, state: 'initialized', units: units };

        // Act - trigger the initialized event
        events.emit(GameEvent.gameStateChanged, { state: testGameState });

        // Assert
        expect(mockWsServer.broadcast).toHaveBeenCalledWith(GameEvent.gameStateChanged, { state: testGameState });
    });

    /**
     * Tests that GameEngine tickFinished events trigger tick data broadcast
     * Verifies that the server broadcasts tick updates when engine finishes an update
     */
    it('should broadcast tick data on GameEngine tickFinished event', () => {
        // Arrange
        const mockTickData = { time: 0.1, delayTime: 0.1 };

        // Act - trigger the tickFinished event
        events.emit(GameEvent.tickFinished, mockTickData);

        // Assert
        expect(mockWsServer.broadcast).toHaveBeenCalledWith(GameEvent.tickFinished, mockTickData);
    });

    it('should throw error if gameEngine is not initialized', () => {
        expect(() => gameServer.gameEngine).toThrow('GameEngine not initialized');
    });

    it('should initialize gameEngine on initGame event', () => {
        events.emit(GameEvent.initGame, { gameMode: 'test', map: 'test' });
        expect(gameServer.gameEngine).toBeDefined();
        expect(gameServer.gameEngine.phase).toBe('initialized');
        expect(gameServer.gameEngine.map).toBeDefined();
        expect(gameServer.gameEngine.gameMode).toBeDefined();
    });

    it('should send gameStateChanged event on gameEngine initialized event', () => {
        events.emit(GameEvent.initGame, { gameMode: 'test', map: 'test' });
        expect(mockWsServer.broadcast).toHaveBeenCalledWith(GameEvent.gameStateChanged, { state: gameServer.gameEngine.getState() });
    });

    // TODO: implement valdiation
    it.skip('should throw error if invalid GameEvent is received', () => {
        // @ts-expect-error invalidGameEvent389274 is not defined in the events enum
        expect(() => events.emit('invalidGameEvent389274', { data: 'test' })).toThrow('Invalid event');
    });
});
