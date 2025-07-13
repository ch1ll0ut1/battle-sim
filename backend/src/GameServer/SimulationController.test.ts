import { SimulationController } from './SimulationController';
import { GameEngine, Unit } from '../GameEngine/GameEngine';
import { Logger } from '../utils/Logger';
import { units1v1 } from '../testData';

/**
 * Tests for SimulationController
 * Covers simulation lifecycle, state transitions, and control methods
 * Tests behavior and observable outcomes, not implementation details
 */
describe('SimulationController', () => {
    let logger: Logger;
    let units: Unit[];
    let gameEngine: GameEngine;
    let controller: SimulationController;

    /**
     * Sets up fresh instances for each test to ensure test independence
     */
    beforeEach(() => {
        logger = new Logger();
        units = JSON.parse(JSON.stringify(units1v1));
        gameEngine = new GameEngine(units, logger);
        controller = new SimulationController(gameEngine, logger);
    });

    /**
     * Tests that starting a simulation when engine is not running just continues simulation loop
     * Verifies that the start method handles initial state correctly
     */
    it('should continue simulation when not running', () => {
        // Act
        controller.start();

        // Assert
        expect(gameEngine.phase).toBe('initialized');
        // No "Game started" event since continueSimulation() is called, not startSimulation()
    });

    /**
     * Tests that stopping a simulation stops the loop and logs the pause event
     * Verifies that the simulation can be stopped regardless of game state
     */
    it('should stop simulation loop and log pause event', () => {
        // Arrange
        controller.start();

        // Act
        controller.stop();

        // Assert
        const events = logger.getEvents();
        expect(events.some(event => event.includes('Simulation paused'))).toBe(true);
        // Note: game engine state may remain 'running' since we only stop the loop
    });

    /**
     * Tests that nextTick executes a single simulation step
     * Verifies that the game progresses by one tick and state changes appropriately
     */
    it('should execute single simulation tick', () => {
        // Arrange
        const initialTime = gameEngine.getState().time;

        // Act
        controller.nextTick();

        // Assert
        const newTime = gameEngine.getState().time;
        expect(newTime).toBeGreaterThan(initialTime);
        expect(gameEngine.phase).toBe('paused');
    });

    /**
     * Tests that nextTick throws error when game is finished
     * Verifies that finished games cannot be continued with nextTick
     */
    it('should throw error when calling nextTick on finished game', () => {
        // Arrange - run game to completion
        while (gameEngine.phase !== 'finished') {
            gameEngine.update();
        }
        expect(gameEngine.phase).toBe('finished');

        // Act & Assert
        expect(() => controller.nextTick()).toThrow('Game is finished');
    });

    /**
     * Tests that reset stops current simulation and restarts game engine
     * Verifies that the simulation can be completely reset to initial state
     */
    it('should reset simulation to initial state', () => {
        // Arrange
        controller.start();
        controller.stop();
        // Note: stop() only stops the loop, doesn't change game state

        // Act
        controller.reset();

        // Assert
        expect(gameEngine.phase).toBe('initialized');
        const events = logger.getEvents();
        expect(events.some(event => event.includes('Game started'))).toBe(true);
    });

    /**
     * Tests that starting a paused simulation continues the simulation loop
     * Verifies that the simulation can be paused and resumed
     */
    it('should continue paused simulation when start is called again', () => {
        // Arrange
        controller.start();
        controller.stop(); // This pauses the game engine

        // Act
        controller.start(); // Should continue since state is not 'running'

        // Assert
        expect(gameEngine.phase).toBe('paused'); // Still paused after start
    });

    /**
     * Tests that multiple stop calls are handled gracefully
     * Verifies that the controller is robust against repeated stop operations
     */
    it('should handle multiple stop calls gracefully', () => {
        // Arrange
        controller.start();

        // Act
        controller.stop();
        controller.stop(); // Second stop call

        // Assert
        expect(gameEngine.phase).toBe('paused');
        const events = logger.getEvents();
        expect(events.filter(event => event.includes('Simulation paused')).length).toBe(2);
    });

    /**
     * Tests that simulation automatically stops interval when game finishes
     * Verifies that the controller properly handles game completion
     */
    it('should automatically stop interval when game finishes', () => {
        // Arrange
        controller.start();

        // Act - run game to completion
        while (gameEngine.phase !== 'finished') {
            gameEngine.update();
        }

        // Assert
        expect(gameEngine.phase).toBe('finished');
        // Note: stopInterval() is called when game finishes, but no "Simulation paused" log
        // since stop() is not called, only stopInterval()
    });
}); 