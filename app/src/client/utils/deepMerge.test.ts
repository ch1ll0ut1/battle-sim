import { deepMerge, deepMergeImmutable } from './deepMerge';

describe('deepMerge', () => {
    /**
     * Test deep merging of nested unit data structures
     * This simulates the exact scenario from MapScreen unit updates
     */
    test('should deep merge nested unit movement updates without losing other properties', () => {
        const existingUnit = {
            id: 1,
            name: 'Warrior',
            team: 1,
            movement: {
                position: { x: 10, y: 20 },
                direction: 1.5,
                state: 'moving',
                currentSpeed: 2.5,
                targetSpeed: 3.0,
            },
            stamina: {
                stamina: 80,
                maxStamina: 100,
                staminaPercentage: 80,
                isExhausted: false,
            },
        };

        const changes = {
            movement: {
                position: { x: 15 }, // Only updating x position
                currentSpeed: 3.0, // Only updating current speed
            },
        };

        deepMerge(existingUnit, changes);

        // Position.x should be updated
        expect(existingUnit.movement.position.x).toBe(15);
        // Position.y should be preserved
        expect(existingUnit.movement.position.y).toBe(20);
        // Direction should be preserved
        expect(existingUnit.movement.direction).toBe(1.5);
        // State should be preserved
        expect(existingUnit.movement.state).toBe('moving');
        // CurrentSpeed should be updated
        expect(existingUnit.movement.currentSpeed).toBe(3.0);
        // TargetSpeed should be preserved
        expect(existingUnit.movement.targetSpeed).toBe(3.0);
        // Stamina object should be completely untouched
        expect(existingUnit.stamina.stamina).toBe(80);
        expect(existingUnit.stamina.maxStamina).toBe(100);
    });

    /**
     * Test that Object.assign would break (for comparison)
     */
    test('demonstrates why Object.assign fails with nested objects', () => {
        const existingUnit = {
            movement: {
                position: { x: 10, y: 20 },
                direction: 1.5,
                state: 'moving',
            },
        };

        const changes = {
            movement: {
                position: { x: 15 }, // Only want to update x
            },
        };

        // Object.assign completely replaces the movement object
        Object.assign(existingUnit, changes);

        expect(existingUnit.movement.position.x).toBe(15);
        // These properties are LOST with Object.assign!
        expect(existingUnit.movement.position.y).toBeUndefined();
        expect(existingUnit.movement.direction).toBeUndefined();
        expect(existingUnit.movement.state).toBeUndefined();
    });

    /**
     * Test immutable version creates new object
     */
    test('deepMergeImmutable should create new object without modifying original', () => {
        const original = {
            id: 1,
            movement: { position: { x: 10, y: 20 } },
        };

        const changes = {
            movement: { position: { x: 15 } },
        };

        const result = deepMergeImmutable(original, changes);

        // Original should be unchanged
        expect(original.movement.position.x).toBe(10);
        expect(original.movement.position.y).toBe(20);

        // Result should have changes
        expect(result.movement.position.x).toBe(15);
        expect(result.movement.position.y).toBe(20);

        // Should be different objects
        expect(result).not.toBe(original);
        expect(result.movement).not.toBe(original.movement);
    });
});
