import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameEngine } from '../GameEngine/GameEngine';
import { MovementSandbox } from '../GameMode/MovementSandbox/MovementSandbox';
import { Logger } from '../ServerLogger';
import { SimulationController } from './SimulationController';

describe('SimulationController', () => {
    let logger: Logger;
    let engine: GameEngine;
    let controller: SimulationController;

    beforeEach(() => {
        logger = new Logger();
        engine = new GameEngine(logger, MovementSandbox);
        controller = new SimulationController(engine, logger);
    });

    afterEach(() => {
        if (engine.phase === 'running') {
            controller.pause();
        }
    });

    it('starts the simulation from initialized state and sets phase to running', () => {
        // Arrange
        expect(engine.phase).toBe('initialized');

        // Act
        controller.start();

        // Assert
        expect(engine.phase).toBe('running');
        expect(engine.getState().time).toBe(0.1);
    });

    it('pauses the simulation and sets phase to paused', () => {
        // Arrange
        controller.start();

        // Act
        controller.pause();

        // Assert
        expect(engine.phase).toBe('paused');
    });

    it('executes a single simulation tick and advances time', () => {
        // Arrange
        const initialTime = engine.getState().time;

        // Act
        controller.nextTick();
        const newTime = engine.getState().time;

        // Assert
        expect(newTime).toBeGreaterThan(initialTime);
        expect(engine.phase).toBe('paused');
    });

    it('resets the simulation to initial state and clears time', () => {
        // Arrange
        controller.start();

        // Act
        controller.reset();

        // Assert
        expect(engine.phase).toBe('initialized');
        expect(engine.getState().time).toBe(0);
    });

    it('throws if start is called when already running', () => {
        // Arrange
        controller.start();

        // Act & Assert
        expect(() => controller.start()).toThrow('GameEngine is already running');
    });

    it('throws if nextTick is called when game is finished', () => {
        // Arrange
        (engine as any)._phase = 'finished';

        // Act & Assert
        expect(() => controller.nextTick()).toThrow('Game is finished');
    });

    it('can start, pause, and resume the simulation', () => {
        // Arrange
        controller.start();

        // Act
        controller.pause();

        // Assert
        expect(engine.phase).toBe('paused');

        // Act again
        controller.start();

        // Assert again
        expect(engine.phase).toBe('running');
    });

    it('stops the interval when stop is called', () => {
        // Arrange
        controller.start();

        // Act
        controller.pause();

        // Assert
        // should not throw because its not running
        expect(() => controller.start()).not.toThrow();
    });

    it('after reset ready to start again', () => {
        // Arrange
        controller.start();

        // Act
        controller.reset();

        // Assert
        expect(() => controller.start()).not.toThrow();
    });

    /**
     * Tests that starting the simulation triggers exactly two update() calls:
     * one immediately on start, and one by the interval after 100ms.
     * Uses Jest fake timers to simulate time passage and checks update call count and engine time.
     */
    it('starts interval and calls update exactly twice (immediate and after 100ms)', () => {
        vi.useFakeTimers();
        const updateSpy = vi.spyOn(engine, 'update');
        controller.start();

        // Fast-forward time by 100ms (should trigger one interval update after the immediate one)
        vi.advanceTimersByTime(engine.turnInterval * 1000);

        // The first update is called immediately, the second by the interval
        expect(updateSpy).toHaveBeenCalledTimes(2);
        expect(engine.getState().time).toBeCloseTo(engine.turnInterval * 2);

        controller.pause();
        vi.useRealTimers();
    });
});
