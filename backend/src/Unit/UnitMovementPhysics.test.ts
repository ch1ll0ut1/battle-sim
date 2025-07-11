import { Unit } from './Unit';
import { UnitMovementPhysics } from './UnitMovementPhysics';
import { UnitAttributesData } from './UnitAttributes';

/**
 * Comprehensive tests for UnitMovementPhysics
 * Tests behavior and business logic according to GAME_MECHANICS.md
 */
describe('UnitMovementPhysics', () => {
    let unit: Unit;
    let movement: UnitMovementPhysics;

    /**
     * Creates a test unit with specified attributes
     */
    const createTestUnit = (overrides: Partial<UnitAttributesData> = {}) => {
        const defaultAttributes: UnitAttributesData = {
            weight: 70,
            strength: 50,
            experience: 0.5,
            age: 25,
            gender: 'male'
        };
        
        const attributes = { ...defaultAttributes, ...overrides };
        const testUnit = new Unit(1, 'Test Unit', 1, attributes);
        // Set equipment weight for testing
        (testUnit.equipment as any).weight = 15; // Standard equipment weight
        return testUnit;
    };

    beforeEach(() => {
        unit = createTestUnit();
        movement = new UnitMovementPhysics(unit, { x: 0, y: 0 }, 0);
    });

    describe('Movement State Management', () => {
        /**
         * Tests basic movement state transitions follow expected patterns
         */
        test('starts in stationary state', () => {
            expect(movement.state).toBe('stationary');
            expect(movement.isMoving).toBe(false);
            expect(movement.currentSpeed).toBe(0);
        });

        /**
         * Tests movement initiation creates proper target state
         */
        test('moveTo sets up movement targets', () => {
            const target = { x: 10, y: 10 };
            
            movement.moveTo(target, false); // Walking
            expect(movement.isMoving).toBe(true);
            
            movement.moveTo(target, true); // Running  
            expect(movement.isMoving).toBe(true);
        });

        /**
         * Tests stop command properly clears movement state
         */
        test('stop clears movement targets', () => {
            movement.moveTo({ x: 10, y: 10 }, false);
            expect(movement.isMoving).toBe(true);
            
            movement.stop();
            // Should still be moving until physics brings it to rest
            // Test after physics update
            for (let i = 0; i < 10; i++) {
                movement.update(0.1);
            }
            expect(movement.state).toBe('stationary');
        });

        /**
         * Tests emergency stop behavior
         */
        test('emergency stop works correctly', () => {
            movement.moveTo({ x: 10, y: 10 }, true);
            movement.emergencyStop();
            
            // Should decelerate quickly
            for (let i = 0; i < 5; i++) {
                movement.update(0.1);
            }
            expect(movement.currentSpeed).toBeLessThan(0.1);
        });
    });

    describe('Physics Calculations', () => {
        /**
         * Tests weight affects movement speed according to game mechanics
         */
        test('weight affects maximum speed', () => {
            const lightUnit = createTestUnit({ weight: 60 }); // Light
            const heavyUnit = createTestUnit({ weight: 100 }); // Heavy
            
            const lightMovement = new UnitMovementPhysics(lightUnit);
            const heavyMovement = new UnitMovementPhysics(heavyUnit);
            
            lightMovement.moveTo({ x: 10, y: 0 }, false);
            heavyMovement.moveTo({ x: 10, y: 0 }, false);
            
            // Update to calculate max speeds
            lightMovement.update(0.1);
            heavyMovement.update(0.1);
            
            const lightSummary = lightMovement.getSummary();
            const heavySummary = heavyMovement.getSummary();
            
            // Lighter unit should have higher max speed
            expect(lightSummary.maxSpeed).toBeGreaterThan(heavySummary.maxSpeed);
        });

        /**
         * Tests strength affects movement and acceleration
         */
        test('strength affects acceleration and speed', () => {
            const weakUnit = createTestUnit({ strength: 30 });
            const strongUnit = createTestUnit({ strength: 80 });
            
            const weakMovement = new UnitMovementPhysics(weakUnit);
            const strongMovement = new UnitMovementPhysics(strongUnit);
            
            weakMovement.moveTo({ x: 10, y: 0 }, false);
            strongMovement.moveTo({ x: 10, y: 0 }, false);
            
            weakMovement.update(0.1);
            strongMovement.update(0.1);
            
            const weakSummary = weakMovement.getSummary();
            const strongSummary = strongMovement.getSummary();
            
            // Stronger unit should have better acceleration and max speed
            expect(strongSummary.acceleration).toBeGreaterThan(weakSummary.acceleration);
            expect(strongSummary.maxSpeed).toBeGreaterThan(weakSummary.maxSpeed);
        });

        /**
         * Tests running vs walking speed difference
         */
        test('running is faster than walking', () => {
            const walkingMovement = new UnitMovementPhysics(unit);
            const runningMovement = new UnitMovementPhysics(unit);
            
            walkingMovement.moveTo({ x: 10, y: 0 }, false); // Walking
            runningMovement.moveTo({ x: 10, y: 0 }, true);  // Running
            
            walkingMovement.update(0.1);
            runningMovement.update(0.1);
            
            const walkingSummary = walkingMovement.getSummary();
            const runningSummary = runningMovement.getSummary();
            
            // Running should be approximately 2x walking speed
            expect(runningSummary.maxSpeed).toBeCloseTo(walkingSummary.maxSpeed * 2, 1);
        });

        /**
         * Tests physics with realistic acceleration and deceleration
         */
        test('realistic acceleration and deceleration', () => {
            // Check initial state
            expect(movement.currentSpeed).toBe(0);
            
            movement.moveTo({ x: 10, y: 0 }, false);
            
            // Speed should still be 0 until first update
            expect(movement.currentSpeed).toBe(0);
            
            const speeds: number[] = [];
            
            // Accelerate for 2 seconds
            for (let i = 0; i < 20; i++) {
                movement.update(0.1);
                speeds.push(movement.currentSpeed);
            }
            
            // Should start at low speed and gradually increase
            expect(speeds[0]).toBeGreaterThan(0);
            expect(speeds[0]).toBeLessThan(0.5); // Should start slowly
            expect(speeds[2]).toBeGreaterThan(speeds[0]); // Early acceleration
            expect(speeds[4]).toBeGreaterThan(speeds[2]); // Still accelerating
            
            // By later updates, may have reached max speed, so test should be flexible
            const finalSpeed = speeds[speeds.length - 1];
            expect(finalSpeed).toBeGreaterThan(speeds[0]); // Should have accelerated overall
            
            // Now stop
            movement.stop();
            
            // Should decelerate
            const speedBeforeStop = movement.currentSpeed;
            for (let i = 0; i < 20; i++) {
                movement.update(0.1);
                speeds.push(movement.currentSpeed);
            }
            
            // Should eventually reach near zero
            expect(movement.currentSpeed).toBeLessThan(speedBeforeStop);
            expect(movement.currentSpeed).toBeLessThan(0.1);
        });
    });

    describe('Directional Movement', () => {
        /**
         * Tests facing direction is set correctly
         */
        test('faceTowards sets correct direction', () => {
            // Face east
            movement.faceTowards({ x: 10, y: 0 });
            expect(movement.getDirectionDegrees()).toBeCloseTo(0, 0);
            
            // Face north
            movement.faceTowards({ x: 0, y: 10 });
            expect(movement.getDirectionDegrees()).toBeCloseTo(90, 0);
            
            // Face west
            movement.faceTowards({ x: -10, y: 0 });
            expect(movement.getDirectionDegrees()).toBeCloseTo(180, 0);
            
            // Face south
            movement.faceTowards({ x: 0, y: -10 });
            expect(movement.getDirectionDegrees()).toBeCloseTo(270, 0);
        });

        /**
         * Tests turning mechanics work realistically
         */
        test('turning has momentum constraints', () => {
            // Start stationary
            movement.faceTowards({ x: 10, y: 0 }); // Face east
            
            // Should turn instantly when stationary
            movement.update(0.1);
            expect(movement.getDirectionDegrees()).toBeCloseTo(0, 1);
            
            // Now start moving fast
            movement.moveTo({ x: 20, y: 0 }, true); // Running east
            
            // Build up speed
            for (let i = 0; i < 20; i++) {
                movement.update(0.1);
            }
            
            // Now try to turn 180 degrees while moving fast
            movement.faceTowards({ x: -10, y: 0 }); // Face west
            
            // Should turn slowly due to momentum
            const directionBefore = movement.direction;
            movement.update(0.1);
            const directionAfter = movement.direction;
            
            const turnAmount = Math.abs(directionAfter - directionBefore);
            // Should not turn the full 180 degrees instantly
            expect(turnAmount).toBeLessThan(Math.PI);
        });

        /**
         * Tests position updates correctly during movement
         */
        test('position updates during movement', () => {
            const startX = movement.x;
            const startY = movement.y;
            
            movement.moveTo({ x: 10, y: 0 }, false);
            
            // Update for 1 second
            for (let i = 0; i < 10; i++) {
                movement.update(0.1);
            }
            
            // Should have moved east
            expect(movement.x).toBeGreaterThan(startX);
            expect(movement.y).toBeCloseTo(startY, 2); // Should stay roughly on same Y
        });
    });

    describe('Stamina Cost Calculations', () => {
        /**
         * Tests stamina costs follow game mechanics
         */
        test('calculates stamina costs correctly', () => {
            // Stationary should have no cost
            expect(movement.getStaminaCost()).toBe(0);
            
            // Walking should have moderate cost (let it reach walking speed)
            movement.moveTo({ x: 10, y: 0 }, false);
            for (let i = 0; i < 20; i++) movement.update(0.1); // Reach walking speed
            const walkingCost = movement.getStaminaCost();
            expect(walkingCost).toBeGreaterThan(0);
            
            // Running should cost more (let it reach higher running speed)
            movement.stop();
            for (let i = 0; i < 20; i++) movement.update(0.1); // Come to rest
            movement.moveTo({ x: 10, y: 0 }, true);
            for (let i = 0; i < 20; i++) movement.update(0.1); // Reach running speed
            const runningCost = movement.getStaminaCost();
            expect(runningCost).toBeGreaterThan(walkingCost);
        });

        /**
         * Tests weight affects stamina costs
         */
        test('weight affects stamina costs', () => {
            const lightUnit = createTestUnit({ weight: 60 });
            const heavyUnit = createTestUnit({ weight: 100 });
            
            const lightMovement = new UnitMovementPhysics(lightUnit);
            const heavyMovement = new UnitMovementPhysics(heavyUnit);
            
            // Move both units and let them reach their respective speeds
            lightMovement.moveTo({ x: 10, y: 0 }, false);
            heavyMovement.moveTo({ x: 10, y: 0 }, false);
            
            for (let i = 0; i < 20; i++) {
                lightMovement.update(0.1);
                heavyMovement.update(0.1);
            }
            
            // At their natural speeds, weight affects the cost calculation via weightMultiplier
            // Even if heavy unit moves slower, test the stamina cost formula directly
            const lightCost = lightMovement.getStaminaCost();
            const heavyCost = heavyMovement.getStaminaCost();
            
            // Both should have some cost when moving
            expect(lightCost).toBeGreaterThan(0);
            expect(heavyCost).toBeGreaterThan(0);
            
            // Heavier unit should cost more stamina
            expect(heavyCost).toBeGreaterThan(lightCost);
        });

        /**
         * Tests turning adds to stamina cost
         */
        test('turning increases stamina cost', () => {
            movement.moveTo({ x: 10, y: 0 }, false);
            // Build up some speed first
            for (let i = 0; i < 10; i++) {
                movement.update(0.1);
            }
            const straightCost = movement.getStaminaCost();
            
            // Now turn while moving (this should cause turning)
            movement.faceTowards({ x: 0, y: 10 });
            // Update a few times to start turning
            for (let i = 0; i < 3; i++) {
                movement.update(0.1);
            }
            const turningCost = movement.getStaminaCost();
            
            // Turning should add to stamina cost when actually turning
            expect(turningCost).toBeGreaterThanOrEqual(straightCost);
        });
    });

    describe('Game Mechanics Compliance', () => {
        /**
         * Tests base speeds match game mechanics specification
         */
        test('base speeds match game mechanics specification', () => {
            // Create standard unit (70kg, 50 strength, no equipment)
            const standardUnit = createTestUnit({ weight: 70, strength: 50 });
            (standardUnit.equipment as any).weight = 0;
            
            const standardMovement = new UnitMovementPhysics(standardUnit);
            
            // Walking speed should be close to 1.4 m/s base
            standardMovement.moveTo({ x: 10, y: 0 }, false);
            // Need multiple updates to reach max speed
            for (let i = 0; i < 30; i++) {
                standardMovement.update(0.1);
            }
            const walkingMaxSpeed = standardMovement.getSummary().maxSpeed;
            expect(walkingMaxSpeed).toBeCloseTo(1.4, 1);
            
            // Running speed should be close to 2.8 m/s base  
            standardMovement.stop();
            for (let i = 0; i < 30; i++) standardMovement.update(0.1); // Come to rest
            standardMovement.moveTo({ x: 10, y: 0 }, true); // Now run
            for (let i = 0; i < 30; i++) {
                standardMovement.update(0.1);
            }
            const runningMaxSpeed = standardMovement.getSummary().maxSpeed;
            expect(runningMaxSpeed).toBeCloseTo(2.8, 1);
        });

        /**
         * Tests strength bonuses work as specified
         */
        test('strength bonus caps at 25% as specified', () => {
            const superStrongUnit = createTestUnit({ strength: 100, weight: 70 });
            (superStrongUnit.equipment as any).weight = 0;
            
            const superStrongMovement = new UnitMovementPhysics(superStrongUnit);
            superStrongMovement.moveTo({ x: 10, y: 0 }, false);
            superStrongMovement.update(0.1);
            
            const maxSpeed = superStrongMovement.getSummary().maxSpeed;
            // Should be base speed (1.4) * 1.25 = 1.75 m/s max
            expect(maxSpeed).toBeLessThanOrEqual(1.75);
            expect(maxSpeed).toBeGreaterThan(1.4);
        });

        /**
         * Tests weight penalty calculations
         */
        test('weight penalty works as specified', () => {
            // 100kg total weight (30kg above optimal 70kg)
            // Should have 30 * 0.003 = 9% speed penalty
            const heavyUnit = createTestUnit({ weight: 85 });
            (heavyUnit.equipment as any).weight = 15; // Total 100kg
            
            const heavyMovement = new UnitMovementPhysics(heavyUnit);
            heavyMovement.moveTo({ x: 10, y: 0 }, false);
            heavyMovement.update(0.1);
            
            const maxSpeed = heavyMovement.getSummary().maxSpeed;
            const expectedSpeed = 1.4 * (1 - 0.09); // 9% penalty
            expect(maxSpeed).toBeCloseTo(expectedSpeed, 1);
        });
    });

    describe('Public API', () => {
        /**
         * Tests all public getters work correctly
         */
        test('provides correct position and direction getters', () => {
            expect(movement.x).toBe(0);
            expect(movement.y).toBe(0);
            expect(movement.direction).toBe(0);
            expect(movement.getDirectionDegrees()).toBe(0);
        });

        /**
         * Tests summary provides complete information
         */
        test('getSummary provides complete movement information', () => {
            movement.moveTo({ x: 10, y: 0 }, false);
            movement.update(0.1);
            
            const summary = movement.getSummary();
            
            expect(summary).toHaveProperty('position');
            expect(summary).toHaveProperty('direction');
            expect(summary).toHaveProperty('directionDegrees');
            expect(summary).toHaveProperty('state');
            expect(summary).toHaveProperty('currentSpeed');
            expect(summary).toHaveProperty('targetSpeed');
            expect(summary).toHaveProperty('currentTurnRate');
            expect(summary).toHaveProperty('maxSpeed');
            expect(summary).toHaveProperty('acceleration');
            expect(summary).toHaveProperty('maxTurnRate');
            expect(summary).toHaveProperty('staminaCost');
            
            expect(typeof summary.staminaCost).toBe('number');
        });

        /**
         * Tests direction vector calculation
         */
        test('getDirectionVector works correctly', () => {
            // Test cardinal directions
            movement.faceTowards({ x: 1, y: 0 }); // East
            movement.update(0.1);
            let vector = movement.getDirectionVector();
            expect(vector.x).toBeCloseTo(1, 1);
            expect(vector.y).toBeCloseTo(0, 1);
            
            movement.faceTowards({ x: 0, y: 1 }); // North
            movement.update(0.1);
            vector = movement.getDirectionVector();
            expect(vector.x).toBeCloseTo(0, 1);
            expect(vector.y).toBeCloseTo(1, 1);
        });
    });
}); 