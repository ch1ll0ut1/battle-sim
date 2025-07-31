import { beforeEach, describe, expect, it } from 'vitest';
import { Unit } from './Unit';
import { UnitMovement } from './UnitMovement';

describe('UnitMovement', () => {
    let mockUnit: Unit;

    beforeEach(() => {
        // Create a mock unit for testing
        mockUnit = new Unit(1, 'Test Unit', 1, {
            weight: 75,
            strength: 60,
            experience: 0,
            age: 20,
            gender: 'male',
        });
    });

    /**
     * Tests basic creation and initial state
     */
    describe('Constructor', () => {
        it('should create UnitMovement with default values', () => {
            const movement = new UnitMovement(mockUnit);

            expect(movement.x).toBe(0);
            expect(movement.y).toBe(0);
            expect(movement.direction).toBe(0);
            expect(movement.state).toBe('stationary');
            expect(movement.isMoving).toBe(false);
        });

        it('should create UnitMovement with custom position and direction', () => {
            const movement = new UnitMovement(mockUnit, { x: 10, y: 20 }, Math.PI);

            expect(movement.x).toBe(10);
            expect(movement.y).toBe(20);
            expect(movement.direction).toBe(Math.PI);
            expect(movement.state).toBe('stationary');
        });

        it('should normalize direction on creation', () => {
            const movement = new UnitMovement(mockUnit, { x: 0, y: 0 }, 3 * Math.PI);
            expect(movement.direction).toBeCloseTo(Math.PI, 5);
        });
    });

    /**
     * Tests position getters (no setters since they were removed)
     */
    describe('Position Management', () => {
        let movement: UnitMovement;

        beforeEach(() => {
            movement = new UnitMovement(mockUnit, { x: 15, y: 25 });
        });

        it('should get position coordinates', () => {
            expect(movement.x).toBe(15);
            expect(movement.y).toBe(25);
        });
    });

    /**
     * Tests direction getters and face towards
     */
    describe('Direction Management', () => {
        let movement: UnitMovement;

        beforeEach(() => {
            movement = new UnitMovement(mockUnit);
        });

        it('should get direction', () => {
            const movement = new UnitMovement(mockUnit, { x: 0, y: 0 }, Math.PI / 2);
            expect(movement.direction).toBeCloseTo(Math.PI / 2, 5);
        });

        it('should convert direction to degrees', () => {
            const movement = new UnitMovement(mockUnit, { x: 0, y: 0 }, Math.PI / 2);
            expect(movement.getDirectionDegrees()).toBeCloseTo(90, 5);

            const movement2 = new UnitMovement(mockUnit, { x: 0, y: 0 }, Math.PI);
            expect(movement2.getDirectionDegrees()).toBeCloseTo(180, 5);
        });

        it('should face towards target position', () => {
            movement.faceTowards({ x: 1, y: 0 });
            expect(movement.direction).toBeCloseTo(0, 5);

            movement.faceTowards({ x: 0, y: 1 });
            expect(movement.direction).toBeCloseTo(Math.PI / 2, 5);
        });
    });

    /**
     * Tests action-based movement system
     */
    describe('Action-Based Movement', () => {
        let movement: UnitMovement;

        beforeEach(() => {
            movement = new UnitMovement(mockUnit, { x: 0, y: 0 });
        });

        it('should initiate walking movement to target', () => {
            const target = { x: 10, y: 0 };
            movement.moveTo(target);

            expect(movement.state).toBe('walking');
            expect(movement.isMoving).toBe(true);
            expect(movement.direction).toBeCloseTo(0, 5);
        });

        it('should initiate running movement when urgent', () => {
            const target = { x: 10, y: 0 };
            movement.moveTo(target, true);

            expect(movement.state).toBe('running');
            expect(movement.isMoving).toBe(true);
        });

        it('should stop movement', () => {
            movement.moveTo({ x: 10, y: 0 });
            expect(movement.isMoving).toBe(true);

            movement.stop();
            expect(movement.state).toBe('stationary');
            expect(movement.isMoving).toBe(false);
        });

        it('should not move when update called without target', () => {
            const originalX = movement.x;
            const originalY = movement.y;
            movement.update(0.1);
            expect(movement.x).toBe(originalX);
            expect(movement.y).toBe(originalY);
        });
    });

    /**
     * Tests time-based movement processing with attribute modifiers
     */
    describe('Time-Based Movement Processing', () => {
        let movement: UnitMovement;

        beforeEach(() => {
            movement = new UnitMovement(mockUnit, { x: 0, y: 0 });
        });

        it('should move towards target over time while walking', () => {
            // With strength 60 and weight 75, speed = 1.4 * (1 + 0.05) * (1 - 0.025) = ~1.435 m/s
            const expectedSpeed = 1.4 * (1 + (60 - 50) * 0.005) * (1 - (75 - 70) * 0.005);
            movement.moveTo({ x: expectedSpeed, y: 0 });

            movement.update(1.0);

            expect(movement.x).toBeCloseTo(expectedSpeed, 2);
            expect(movement.y).toBeCloseTo(0, 5);
            expect(movement.state).toBe('stationary');
            expect(movement.isMoving).toBe(false);
        });

        it('should move faster while running', () => {
            // Running speed is 2x walking speed with same modifiers
            const baseSpeed = 1.4 * (1 + (60 - 50) * 0.005) * (1 - (75 - 70) * 0.005);
            const runningSpeed = baseSpeed * 2;
            movement.moveTo({ x: runningSpeed, y: 0 }, true);

            movement.update(1.0);

            expect(movement.x).toBeCloseTo(runningSpeed, 2);
            expect(movement.state).toBe('stationary');
        });

        it('should make partial progress towards distant target', () => {
            const expectedSpeed = 1.4 * (1 + (60 - 50) * 0.005) * (1 - (75 - 70) * 0.005);
            movement.moveTo({ x: 10, y: 0 });

            movement.update(0.5);

            expect(movement.x).toBeCloseTo(expectedSpeed * 0.5, 2);
            expect(movement.y).toBeCloseTo(0, 5);
            expect(movement.state).toBe('walking');
            expect(movement.isMoving).toBe(true);
        });

        it('should handle diagonal movement', () => {
            const expectedSpeed = 1.4 * (1 + (60 - 50) * 0.005) * (1 - (75 - 70) * 0.005);
            movement.moveTo({ x: 1, y: 1 });
            const distance = Math.sqrt(2);

            movement.update(distance / expectedSpeed);

            expect(movement.x).toBeCloseTo(1, 2);
            expect(movement.y).toBeCloseTo(1, 2);
            expect(movement.isMoving).toBe(false);
        });

        it('should snap to target when very close', () => {
            movement.moveTo({ x: 0.005, y: 0 });

            movement.update(0.1);

            expect(movement.x).toBe(0.005);
            expect(movement.y).toBe(0);
            expect(movement.isMoving).toBe(false);
        });
    });

    /**
     * Tests summary and state information
     */
    describe('Summary and State', () => {
        let movement: UnitMovement;

        beforeEach(() => {
            movement = new UnitMovement(mockUnit, { x: 5, y: 10 }, Math.PI / 4);
        });

        it('should provide comprehensive summary', () => {
            movement.moveTo({ x: 15, y: 20 });

            const summary = movement.getState();

            expect(summary.position).toEqual({ x: 5, y: 10 });
            expect(summary.direction).toBeCloseTo(Math.PI / 4, 5);
            expect(summary.directionDegrees).toBeCloseTo(45, 5);
            expect(summary.state).toBe('walking');
            expect(summary.targetPosition).toEqual({ x: 15, y: 20 });
        });

        it('should show stationary state when not moving', () => {
            const summary = movement.getState();

            expect(summary.state).toBe('stationary');
            expect(summary.targetPosition).toBeNull();
        });
    });

    /**
     * Tests update method behavior
     */
    describe('Update Method', () => {
        let movement: UnitMovement;

        beforeEach(() => {
            movement = new UnitMovement(mockUnit);
        });

        it('should handle update when stationary', () => {
            const originalPosition = { x: movement.x, y: movement.y };

            movement.update(1.0);

            expect(movement.x).toBe(originalPosition.x);
            expect(movement.y).toBe(originalPosition.y);
            expect(movement.state).toBe('stationary');
        });

        it('should not crash with zero deltaTime', () => {
            movement.moveTo({ x: 1, y: 1 });

            expect(() => movement.update(0)).not.toThrow();
            expect(movement.isMoving).toBe(true);
        });

        it('should handle very large deltaTime', () => {
            movement.moveTo({ x: 1, y: 0 });

            movement.update(1000);

            expect(movement.x).toBe(1);
            expect(movement.isMoving).toBe(false);
        });
    });

    /**
     * Tests attribute-based speed calculations
     */
    describe('Speed Calculations', () => {
        it('should apply strength bonus correctly', () => {
            const strongUnit = {
                attributes: { strength: 80, weight: 70 }, // +15% strength bonus, no weight penalty
            };
            const movement = new UnitMovement(strongUnit as Unit, { x: 0, y: 0 });

            // Expected speed: 1.4 * 1.15 = 1.61 m/s
            const expectedDistance = 1.4 * 1.15;
            movement.moveTo({ x: expectedDistance, y: 0 });
            movement.update(1.0);

            expect(movement.x).toBeCloseTo(expectedDistance, 2);
            expect(movement.isMoving).toBe(false);
        });

        it('should apply weight penalty correctly', () => {
            const heavyUnit = {
                attributes: { strength: 50, weight: 90 }, // no strength bonus, -10% weight penalty
            };
            const movement = new UnitMovement(heavyUnit as Unit, { x: 0, y: 0 });

            // Expected speed: 1.4 * 0.9 = 1.26 m/s
            const expectedDistance = 1.4 * 0.9;
            movement.moveTo({ x: expectedDistance, y: 0 });
            movement.update(1.0);

            expect(movement.x).toBeCloseTo(expectedDistance, 2);
            expect(movement.isMoving).toBe(false);
        });

        it('should combine strength bonus and weight penalty', () => {
            const mixedUnit = {
                attributes: { strength: 70, weight: 80 }, // +10% strength, -5% weight
            };
            const movement = new UnitMovement(mixedUnit as Unit, { x: 0, y: 0 });

            // Expected speed: 1.4 * 1.1 * 0.95 = 1.463 m/s
            const expectedDistance = 1.4 * 1.1 * 0.95;
            movement.moveTo({ x: expectedDistance, y: 0 });
            movement.update(1.0);

            expect(movement.x).toBeCloseTo(expectedDistance, 2);
            expect(movement.isMoving).toBe(false);
        });
    });
});
