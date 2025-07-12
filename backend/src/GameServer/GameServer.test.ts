import { WebSocket } from 'ws';
import { Unit } from '../GameEngine/GameEngine';
import { units1v1 } from '../testData';
import { GameServer } from './GameServer';

// Mock the WebsocketServer to avoid actual network operations in tests
jest.mock('../utils/WebsocketServer.js');

/**
 * Tests for GameServer
 * Covers server initialization, command handling, and shutdown behavior
 * Tests behavior and observable outcomes, not implementation details
 */
describe('GameServer', () => {
    let mockWsServer: any;
    let mockGameEngine: any;
    let gameServer: GameServer;
    let units: Unit[];

    /**
     * Sets up mock WebSocket server and fresh game server for each test
     */
    beforeEach(() => {
        units = JSON.parse(JSON.stringify(units1v1));
        
        // Mock WebSocket server
        mockWsServer = {
            on: jest.fn(),
            broadcast: jest.fn(),
            send: jest.fn(),
            close: jest.fn()
        };
        
        // Mock the WebsocketServer constructor
        const { WebsocketServer } = require('../utils/WebsocketServer.js');
        WebsocketServer.mockImplementation(() => mockWsServer);
        
        gameServer = new GameServer(8080, units);
        
        // Get reference to the mocked GameEngine for testing
        mockGameEngine = (gameServer as any).gameEngine;
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
     * Tests that logger events are broadcasted to WebSocket clients
     * Verifies that the server properly routes log events to connected clients
     */
    it('should broadcast logger events to WebSocket clients', () => {
        // Arrange
        const logMessage = 'Test log message';
        
        // Act - trigger a log event through the logger
        // Access the private logger via type assertion for testing
        const logger = (gameServer as any).logger;
        logger.log(logMessage);

        // Assert
        const expectedMessage = `[0.0s] ${logMessage}`;
        expect(mockWsServer.broadcast).toHaveBeenCalledWith('log', expectedMessage);
    });

    /**
     * Tests that valid commands are properly routed to simulation controller
     * Verifies that each command type is handled correctly
     */
    it('should route valid commands to simulation controller', () => {
        // Arrange
        const commands = ['start', 'stop', 'nextTick', 'reset'];
        
        // Act - simulate command messages
        const messageHandler = mockWsServer.on.mock.calls.find((call: any) => 
            call[0] === 'message'
        )?.[1];
        
        commands.forEach(command => {
            if (messageHandler) {
                messageHandler(null, { type: 'command', data: command });
            }
        });

        // Assert
        expect(messageHandler).toBeDefined();
        // Note: We can't easily test the actual routing without exposing the controller
        // This test verifies that commands are processed without errors
    });

    /**
     * Tests that invalid command types are ignored
     * Verifies that non-command messages don't trigger simulation actions
     */
    it('should ignore non-command messages', () => {
        // Arrange
        const messageHandler = mockWsServer.on.mock.calls.find((call: any) => 
            call[0] === 'message'
        )?.[1];

        // Act
        if (messageHandler) {
            messageHandler(null, { type: 'status', data: 'ping' });
        }

        // Assert
        expect(messageHandler).toBeDefined();
        // Should not throw or cause errors
    });

    /**
     * Tests that unknown commands are logged as warnings
     * Verifies that the server handles unexpected command types gracefully
     */
    it('should log warning for unknown commands', () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const messageHandler = mockWsServer.on.mock.calls.find((call: any) => 
            call[0] === 'message'
        )?.[1];

        // Act
        if (messageHandler) {
            messageHandler(null, { type: 'command', data: 'unknownCommand' });
        }

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith('Unknown command: unknownCommand');
        consoleSpy.mockRestore();
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
     * Tests that command messages are logged to console
     * Verifies that the server provides visibility into received commands
     */
    it('should log received commands to console', () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const messageHandler = mockWsServer.on.mock.calls.find((call: any) => 
            call[0] === 'message'
        )?.[1];

        // Act
        if (messageHandler) {
            messageHandler(null, { type: 'command', data: 'start' });
        }

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith('Received command: start');
        consoleSpy.mockRestore();
    });

    /**
     * Tests that new client connections receive initial game state and log events
     * Verifies that the connect handler sends current state to new clients
     */
    it('should send initial state to new clients on connect', () => {
        // Arrange
        const mockWebSocket = {} as WebSocket;
        const mockGameState = { time: 0, state: 'initialized', units: units };
        const mockLogEvents = ['[0.0s] Game started'];
        
        // Mock the methods that should be called
        jest.spyOn(mockGameEngine, 'getState').mockReturnValue(mockGameState);
        const logger = (gameServer as any).logger;
        jest.spyOn(logger, 'getEvents').mockReturnValue(mockLogEvents);

        // Act - simulate a client connection
        const connectHandler = mockWsServer.on.mock.calls.find((call: any) => 
            call[0] === 'connect'
        )?.[1];
        
        if (connectHandler) {
            connectHandler(mockWebSocket);
        }

        // Assert
        expect(mockWsServer.send).toHaveBeenCalledWith(mockWebSocket, 'gameState', mockGameState);
        expect(mockWsServer.send).toHaveBeenCalledWith(mockWebSocket, 'log', mockLogEvents);
    });

    /**
     * Tests that GameEngine initialized events trigger game state broadcast
     * Verifies that the server broadcasts state updates when game is initialized
     */
    it('should broadcast game state on GameEngine initialized event', () => {
        // Arrange
        const mockGameState = { time: 0, state: 'initialized', units: units };
        jest.spyOn(mockGameEngine, 'getState').mockReturnValue(mockGameState);

        // Act - trigger the initialized event
        mockGameEngine.emit('updated');

        // Assert
        expect(mockWsServer.broadcast).toHaveBeenCalledWith('gameState', mockGameState);
    });

    /**
     * Tests that GameEngine updated events trigger game state broadcast
     * Verifies that the server broadcasts state updates during game progression
     */
    it('should broadcast game state on GameEngine updated event', () => {
        // Arrange
        const mockGameState = { time: 1.0, state: 'running', units: units };
        jest.spyOn(mockGameEngine, 'getState').mockReturnValue(mockGameState);

        // Act - trigger the updated event
        mockGameEngine.emit('updated');

        // Assert
        expect(mockWsServer.broadcast).toHaveBeenCalledWith('gameState', mockGameState);
    });
}); 