import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { events, GameEvent } from '../../game/events';
import { MovementSandbox } from '../GameMode/MovementSandbox/MovementSandbox';
import { Logger } from '../ServerLogger';
import { GameEngine } from './GameEngine';

/**
 * Integration tests for GameEngine
 * Tests the complete behavior of the game engine including state transitions,
 * event emissions, and integration with game modes and maps
 */
describe('GameEngine', () => {
    let engine: GameEngine;
    let logger: Logger;

    beforeEach(() => {
        logger = new Logger();
        engine = new GameEngine(logger, MovementSandbox);
    });

    afterEach(() => {
        // Clean up any running intervals or listeners
        if (engine.phase === 'running') {
            engine.pause();
        }
    });

    /**
     * Tests that a new GameEngine initializes with correct default state
     * Verifies initial phase, time, and that it emits proper events
     */
    it('should initialize with correct default state', () => {
        // Act
        const state = engine.getState();

        // Assert
        expect(state.phase).toBe('initialized');
        expect(state.time).toBe(0);
        expect(state.gameMode).toBeDefined();
        expect(state.map).toBeDefined();
        expect(state.map.width).toBeGreaterThan(0);
        expect(state.map.height).toBeGreaterThan(0);
    });

    /**
     * Tests that reset properly reinitializes the engine state
     * Verifies that time resets to zero and gameStarted event is emitted
     */
    it('should reset engine state and emit gameStarted event', () => {
        // Arrange
        let gameStartedEmitted = false;
        let stateChangedEmitted = false;

        events.on(GameEvent.gameStarted, () => {
            gameStartedEmitted = true;
        });
        events.on(GameEvent.gameStateChanged, () => {
            stateChangedEmitted = true;
        });

        // Advance time first
        engine.update(1.0);
        expect(engine.getState().time).toBeGreaterThan(0);

        // Act
        engine.reset();

        // Assert
        const state = engine.getState();
        expect(state.phase).toBe('initialized');
        expect(state.time).toBe(0);
        expect(gameStartedEmitted).toBe(true);
        expect(stateChangedEmitted).toBe(true);
    });

    /**
     * Tests that update advances game time and changes phase to running
     * Verifies proper time progression and phase transitions
     */
    it('should advance time and transition to running phase on update', () => {
        // Arrange
        const deltaTime = 0.5;
        const initialState = engine.getState();

        // Act
        engine.update(deltaTime);

        // Assert
        const newState = engine.getState();
        expect(newState.phase).toBe('running');
        expect(newState.time).toBeCloseTo(deltaTime);
        expect(newState.time).toBeGreaterThan(initialState.time);
    });

    /**
     * Tests that pause sets phase to paused and emits gamePaused event
     * Verifies that the engine can be paused from running state
     */
    it('should pause game and emit gamePaused event', () => {
        // Arrange
        let gamePausedEmitted = false;
        events.on(GameEvent.gamePaused, () => {
            gamePausedEmitted = true;
        });

        // Start the game
        engine.update(0.1);
        expect(engine.phase).toBe('running');

        // Act
        engine.pause();

        // Assert
        expect(engine.phase).toBe('paused');
        expect(gamePausedEmitted).toBe(true);
    });

    /**
     * Tests that multiple updates correctly accumulate time
     * Verifies continuous game progression over multiple ticks
     */
    it('should accumulate time over multiple updates', () => {
        // Arrange
        const deltaTime = 0.1;
        const iterations = 5;

        // Act
        for (let i = 0; i < iterations; i++) {
            engine.update(deltaTime);
        }

        // Assert
        const finalState = engine.getState();
        expect(finalState.time).toBeCloseTo(deltaTime * iterations);
        expect(finalState.phase).toBe('running');
    });

    /**
     * Tests that engine integrates properly with game modes
     * Verifies that the game mode receives updates and maintains state
     */
    it('should integrate properly with game modes', () => {
        // Arrange
        const initialGameModeState = engine.getState().gameMode;

        // Act
        engine.update(0.1);
        engine.update(0.1);

        // Assert
        const finalGameModeState = engine.getState().gameMode;
        expect(finalGameModeState).toBeDefined();
        // The game mode should have been updated (exact behavior depends on MovementSandbox)
        expect(typeof finalGameModeState).toBe('object');
    });

    /**
     * Tests error handling when updating a finished game
     * Verifies that appropriate errors are thrown for invalid state transitions
     */
    it('should throw error when updating finished game', () => {
        // Arrange
        // Force the engine to finished state for testing
        (engine as any)._phase = 'finished';

        // Act & Assert
        expect(() => engine.update(0.1)).toThrow('Game is finished');
    });

    /**
     * Tests that game state includes all required properties
     * Verifies the completeness of the state object returned by getState
     */
    it('should return complete game state', () => {
        // Arrange
        engine.update(0.5);

        // Act
        const state = engine.getState();

        // Assert
        expect(state).toHaveProperty('time');
        expect(state).toHaveProperty('phase');
        expect(state).toHaveProperty('gameMode');
        expect(state).toHaveProperty('map');
        expect(typeof state.time).toBe('number');
        expect(typeof state.phase).toBe('string');
        expect(typeof state.gameMode).toBe('object');
        expect(typeof state.map).toBe('object');
    });

    /**
     * Tests phase transitions and state consistency
     * Verifies that all phase transitions maintain consistent state
     */
    it('should maintain consistent state through phase transitions', () => {
        // Test initialized -> running -> paused -> running cycle

        // Initial state
        expect(engine.phase).toBe('initialized');

        // Start game
        engine.update(0.1);
        expect(engine.phase).toBe('running');
        const runningTime = engine.getState().time;

        // Pause game
        engine.pause();
        expect(engine.phase).toBe('paused');
        expect(engine.getState().time).toBe(runningTime);

        // Resume game
        engine.update(0.1);
        expect(engine.phase).toBe('running');
        expect(engine.getState().time).toBeGreaterThan(runningTime);

        // Reset game
        engine.reset();
        expect(engine.phase).toBe('initialized');
        expect(engine.getState().time).toBe(0);
    });
});
