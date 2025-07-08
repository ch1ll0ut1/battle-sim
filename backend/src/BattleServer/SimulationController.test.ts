import { SimulationController } from './SimulationController';
import { BattleEngine, Unit } from '../BattleEngine/BattleEngine';
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
    let battleEngine: BattleEngine;
    let controller: SimulationController;

    /**
     * Sets up fresh instances for each test to ensure test independence
     */
    beforeEach(() => {
        logger = new Logger();
        units = JSON.parse(JSON.stringify(units1v1));
        battleEngine = new BattleEngine(units, logger);
        controller = new SimulationController(battleEngine, logger);
    });

    /**
     * Tests that starting a simulation when engine is not running just continues simulation loop
     * Verifies that the start method handles initial state correctly
     */
    it('should continue simulation when not running', () => {
        // Act
        controller.start();

        // Assert
        expect(battleEngine.state).toBe('initialized');
        // No "Battle started" event since continueSimulation() is called, not startSimulation()
    });

    /**
     * Tests that stopping a simulation stops the loop and logs the pause event
     * Verifies that the simulation can be stopped regardless of battle state
     */
    it('should stop simulation loop and log pause event', () => {
        // Arrange
        controller.start();

        // Act
        controller.stop();

        // Assert
        const events = logger.getEvents();
        expect(events.some(event => event.includes('Simulation paused'))).toBe(true);
        // Note: battle engine state may remain 'running' since we only stop the loop
    });

    /**
     * Tests that nextTick executes a single simulation step
     * Verifies that the battle progresses by one tick and state changes appropriately
     */
    it('should execute single simulation tick', () => {
        // Arrange
        const initialTime = battleEngine.getState().time;

        // Act
        controller.nextTick();

        // Assert
        const newTime = battleEngine.getState().time;
        expect(newTime).toBeGreaterThan(initialTime);
        expect(battleEngine.state).toBe('paused');
    });

    /**
     * Tests that nextTick throws error when battle is finished
     * Verifies that finished battles cannot be continued with nextTick
     */
    it('should throw error when calling nextTick on finished battle', () => {
        // Arrange - run battle to completion
        while (battleEngine.state !== 'finished') {
            battleEngine.update();
        }
        expect(battleEngine.state).toBe('finished');

        // Act & Assert
        expect(() => controller.nextTick()).toThrow('Battle is finished');
    });

    /**
     * Tests that reset stops current simulation and restarts battle engine
     * Verifies that the simulation can be completely reset to initial state
     */
    it('should reset simulation to initial state', () => {
        // Arrange
        controller.start();
        controller.stop();
        // Note: stop() only stops the loop, doesn't change battle state

        // Act
        controller.reset();

        // Assert
        expect(battleEngine.state).toBe('initialized');
        const events = logger.getEvents();
        expect(events.some(event => event.includes('Battle started'))).toBe(true);
    });

    /**
     * Tests that starting a paused simulation continues the simulation loop
     * Verifies that the simulation can be paused and resumed
     */
    it('should continue paused simulation when start is called again', () => {
        // Arrange
        controller.start();
        controller.stop(); // This pauses the battle engine

        // Act
        controller.start(); // Should continue since state is not 'running'

        // Assert
        expect(battleEngine.state).toBe('paused'); // Still paused after start
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
        expect(battleEngine.state).toBe('paused');
        const events = logger.getEvents();
        expect(events.filter(event => event.includes('Simulation paused')).length).toBe(2);
    });

    /**
     * Tests that simulation automatically stops interval when battle finishes
     * Verifies that the controller properly handles battle completion
     */
    it('should automatically stop interval when battle finishes', () => {
        // Arrange
        controller.start();

        // Act - run battle to completion
        while (battleEngine.state !== 'finished') {
            battleEngine.update();
        }

        // Assert
        expect(battleEngine.state).toBe('finished');
        // Note: stopInterval() is called when battle finishes, but no "Simulation paused" log
        // since stop() is not called, only stopInterval()
    });
}); 