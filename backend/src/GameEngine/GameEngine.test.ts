import { MovementSandbox } from '../GameMode/MovementSandbox/MovementSandbox';
import { Logger } from '../utils/Logger';
import { GameEngine } from './GameEngine';

/**
 * Tests for GameEngine (public API and observable behavior only)
 * Covers phase transitions, event emission, logger events, and state updates.
 */
describe('GameEngine', () => {
    /**
   * Skipped: Simulates a complete game using runGame.
   * The only game mode (MovementSandbox) does not end at the moment.
   * This test should be enabled once a game mode with a completion condition is available.
   */
    it.skip('should run a full game and produce a result (skipped: no ending condition in current mode)', () => {
        // Arrange
        const logger = new Logger();
        const engine = new GameEngine(logger, MovementSandbox);

        // Act
        const result = engine.runGame();

        // Assert
        expect(result).toHaveProperty('duration');
        expect(result).toHaveProperty('events');
        expect(typeof result.duration).toBe('number');
        expect(Array.isArray(result.events)).toBe(true);
    });

    /**
   * Tests that update() advances time, changes phase, and emits 'updated' events.
   * Verifies that the phase transitions from 'initialized' to 'running' and time increases.
   */
    it('should advance time and phase on update', () => {
        const logger = new Logger();
        const engine = new GameEngine(logger, MovementSandbox);
        const initialState = engine.getState();
        expect(initialState.phase).toBe('initialized');
        expect(initialState.time).toBe(0);

        // Listen for 'updated' event
        const updatedSpy = jest.fn();
        engine.on('updated', updatedSpy);

        // Act: update by 0.5 seconds
        engine.update(0.5);
        const state = engine.getState();

        // Assert
        expect(state.phase).toBe('running');
        expect(state.time).toBeCloseTo(0.5);
        expect(updatedSpy).toHaveBeenCalled();
        expect(logger.getEvents().length).toBeGreaterThan(0);
    });

    /**
   * Tests that pause() changes the phase to 'paused' and emits 'updated'.
   * Verifies that the phase is set and event is emitted.
   */
    it('should pause the game and emit updated', () => {
        const logger = new Logger();
        const engine = new GameEngine(logger, MovementSandbox);
        engine.update(0.1);
        const updatedSpy = jest.fn();
        engine.on('updated', updatedSpy);

        // Act
        engine.pause();
        const state = engine.getState();

        // Assert
        expect(state.phase).toBe('paused');
        expect(updatedSpy).toHaveBeenCalled();
    });

    /**
   * Tests that reset() returns the engine to the initialized state and emits 'updated'.
   * Verifies that time is reset and logger is cleared.
   */
    it('should reset the game and emit updated', () => {
        const logger = new Logger();
        const engine = new GameEngine(logger, MovementSandbox);
        engine.update(1.0);
        expect(engine.getState().time).toBeGreaterThan(0);
        const updatedSpy = jest.fn();
        engine.on('updated', updatedSpy);

        // Act
        engine.reset();
        const state = engine.getState();

        // Assert
        expect(state.phase).toBe('initialized');
        expect(state.time).toBe(0);
        expect(updatedSpy).toHaveBeenCalled();
        expect(logger.getEvents()[0]).toMatch(/Game started/);
    });

    /**
   * Tests that update() after phase is set to 'finished' throws an error.
   * Simulates phase transition and checks error handling.
   */
    it('should throw if update is called after finished', () => {
        const logger = new Logger();
        const engine = new GameEngine(logger, MovementSandbox);
        // Manually set phase to finished for test
        (engine as any).phase = 'finished';
        expect(() => engine.update(0.1)).toThrow('Game is finished');
    });

    /**
   * Tests that the engine emits the 'finished' event when phase is set to 'finished'.
   * Verifies that listeners are notified.
   */
    it('should emit finished event when phase is set to finished', () => {
        const logger = new Logger();
        const engine = new GameEngine(logger, MovementSandbox);
        const finishedSpy = jest.fn();
        engine.on('finished', finishedSpy);
        // Act
        (engine as any).phase = 'finished';
        // Assert
        expect(finishedSpy).toHaveBeenCalled();
    });
});
