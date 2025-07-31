import { beforeEach, describe, expect, it } from 'vitest';
import { Unit } from './Unit';
import { UnitAttributes, UnitAttributesData } from './UnitAttributes';
import { UnitStamina } from './UnitStamina';

describe('UnitStamina', () => {
    let unit: Unit;
    let stamina: UnitStamina;

    beforeEach(() => {
        const attributesData: UnitAttributesData = {
            weight: 100,
            strength: 50,
            experience: 1.0,
            age: 25,
            gender: 'male',
        };
        const attributes = new UnitAttributes(attributesData);
        const position = { x: 0, y: 0 };
        unit = new Unit(1, 'test-unit', 1, attributesData, position);
        stamina = new UnitStamina(unit);
    });

    describe('initialization', () => {
        it('should calculate max stamina correctly using strength-based formula', () => {
            // Expected calculation:
            // baseStamina = strength * 1.4 = 50 * 1.4 = 70
            // experienceBonus = experience * 20 = 1.0 * 20 = 20
            // conditioningBonus = min(strength/weight * 10, 20) = min(50/100 * 10, 20) = min(5, 20) = 5
            // maxStamina = 70 + 20 + 5 = 95
            expect(stamina.maxStamina).toBe(95);
        });

        it('should start with full stamina by default', () => {
            expect(stamina.stamina).toBe(95);
            expect(stamina.staminaPercentage).toBe(100);
        });

        it('should start with custom percentage when specified', () => {
            const customStamina = new UnitStamina(unit, 50);
            expect(customStamina.stamina).toBe(47.5); // 50% of 95
            expect(customStamina.staminaPercentage).toBe(50);
        });
    });

    describe('recovery context', () => {
        it('should return resting context when unit is stationary', () => {
            expect(stamina.recoveryContext).toBe('resting');
        });

        it('should return moving context when unit is moving', () => {
            unit.movement.moveTo({ x: 10, y: 0 }, false); // Walking
            expect(stamina.recoveryContext).toBe('moving');
        });

        it('should return moving context when unit is running', () => {
            unit.movement.moveTo({ x: 10, y: 0 }, true); // Running
            expect(stamina.recoveryContext).toBe('moving');
        });

        it('should return exhausted context when unit is exhausted', () => {
            stamina.setStamina(5); // Below 10% threshold
            expect(stamina.recoveryContext).toBe('exhausted');
        });
    });

    describe('stamina consumption', () => {
        it('should consume stamina using calibrated weight modifier', () => {
            const consumed = stamina.consumeStamina(20);
            // Current calibrated calculation:
            // experienceModifier = 1 - (1.0 * 0.3) = 0.7
            // weightModifier = 1.0 + (100-70)*0.01 - (50-50)*0.01 = 1.3
            // Final cost = 20 * 0.7 * 1.3 = 18.2
            expect(consumed).toBeCloseTo(18.2, 1);
            expect(stamina.stamina).toBeLessThan(95);
        });

        it('should apply calibrated weight modifier to stamina costs', () => {
            // Current weight modifier = 1.0 + (100-70)*0.01 - (50-50)*0.01 = 1.3
            const consumed = stamina.consumeStamina(10);
            // Expected: 10 * experienceModifier * weightModifier * painModifier
            // experienceModifier = 1 - (1.0 * 0.3) = 0.7
            // Final cost = 10 * 0.7 * 1.3 = 9.1
            expect(consumed).toBeCloseTo(9.1, 1);
        });

        it('should apply experience reduction to stamina costs', () => {
            // Create unit with no experience
            const noExpAttributesData: UnitAttributesData = {
                weight: 100,
                strength: 50,
                experience: 0,
                age: 25,
                gender: 'male',
            };
            const noExpAttributes = new UnitAttributes(noExpAttributesData);
            const noExpUnit = new Unit(2, 'no-exp', 1, noExpAttributesData, { x: 0, y: 0 });
            const noExpStamina = new UnitStamina(noExpUnit);

            // Test consumption with experience vs without
            const withExpCost = stamina.consumeStamina(10);
            const withoutExpCost = noExpStamina.consumeStamina(10);

            expect(withExpCost).toBeLessThan(withoutExpCost);
        });

        it('should not consume more stamina than available', () => {
            stamina.setStamina(5);
            const consumed = stamina.consumeStamina(50);
            expect(consumed).toBeLessThanOrEqual(5);
            expect(stamina.stamina).toBe(0);
        });
    });

    describe('stamina recovery', () => {
        beforeEach(() => {
            stamina.setStamina(50); // Start at half stamina
        });

        it('should recover stamina at correct rate for resting context', () => {
            // Unit should be resting by default (stationary)
            expect(stamina.recoveryContext).toBe('resting');

            // Resting recovery: 8% per second = 0.08 * 95 = 7.6 absolute units per second
            stamina.recoverStamina(1.0);

            // Expected: 7.6 * experienceModifier = 7.6 * 1.2 = 9.12
            expect(stamina.stamina).toBeCloseTo(59.12, 1);
        });

        it('should use moving context for both walking and running', () => {
            // Set unit to walking
            unit.movement.moveTo({ x: 10, y: 0 }, false);
            expect(stamina.recoveryContext).toBe('moving');

            // Set unit to running
            unit.movement.moveTo({ x: 10, y: 0 }, true);
            expect(stamina.recoveryContext).toBe('moving');
        });

        it('should not recover when exhausted', () => {
            stamina.setStamina(5); // Below 10% threshold
            expect(stamina.isExhausted).toBe(true);
            expect(stamina.recoveryContext).toBe('exhausted');

            stamina.recoverStamina(1.0);
            expect(stamina.stamina).toBe(5);
        });

        it('should not exceed max stamina during recovery', () => {
            stamina.setStamina(92);
            stamina.recoverStamina(1.0);
            expect(stamina.stamina).toBe(95);
        });

        it('should apply experience bonus to recovery rate', () => {
            // Create unit with no experience
            const noExpAttributesData: UnitAttributesData = {
                weight: 100,
                strength: 50,
                experience: 0,
                age: 25,
                gender: 'male',
            };
            const noExpAttributes = new UnitAttributes(noExpAttributesData);
            const noExpUnit = new Unit(3, 'no-exp', 1, noExpAttributesData, { x: 0, y: 0 });
            const noExpStamina = new UnitStamina(noExpUnit);
            noExpStamina.setStamina(50);

            // Recover for both units
            stamina.setStamina(50);
            stamina.recoverStamina(1.0);
            noExpStamina.recoverStamina(1.0);

            // Unit with experience should recover faster
            expect(stamina.stamina).toBeGreaterThan(noExpStamina.stamina);
        });
    });

    describe('exhaustion states', () => {
        it('should identify exhausted state correctly', () => {
            stamina.setStamina(8); // Below 10% of 95
            expect(stamina.isExhausted).toBe(true);
            expect(stamina.staminaPercentage).toBeLessThan(10);
        });

        it('should identify non-exhausted state correctly', () => {
            stamina.setStamina(10); // Above 10% of 95
            expect(stamina.isExhausted).toBe(false);
            expect(stamina.staminaPercentage).toBeGreaterThanOrEqual(10);
        });
    });

    describe('max stamina calculation', () => {
        it('should recalculate max stamina when attributes change', () => {
            const originalMax = stamina.maxStamina;

            // Increase strength
            unit.attributes.strength = 60;
            stamina.recalculateMaxStamina();

            expect(stamina.maxStamina).toBeGreaterThan(originalMax);
        });

        it('should proportionally adjust current stamina when max changes', () => {
            stamina.setStamina(47.5); // 50% of original max (95)

            // Double strength to increase max stamina
            unit.attributes.strength = 100;
            stamina.recalculateMaxStamina();

            // Should still be at 50% of new max
            expect(stamina.staminaPercentage).toBeCloseTo(50, 1);
        });

        it('should cap conditioning bonus at 20', () => {
            // Create strong unit to test conditioning cap
            const strongAttributesData: UnitAttributesData = {
                weight: 50, // Low weight for high conditioning ratio
                strength: 100, // Max valid strength
                experience: 1.0,
                age: 25,
                gender: 'male',
            };
            const strongAttributes = new UnitAttributes(strongAttributesData);
            const strongUnit = new Unit(4, 'strong', 1, strongAttributesData, { x: 0, y: 0 });
            const strongStamina = new UnitStamina(strongUnit);

            // baseStamina = 100 * 1.4 = 140
            // experienceBonus = 1.0 * 20 = 20
            // conditioningBonus = min(100/50 * 10, 20) = min(20, 20) = 20
            // maxStamina = 140 + 20 + 20 = 180
            expect(strongStamina.maxStamina).toBe(180);
        });
    });

    describe('utility methods', () => {
        it('should provide accurate summary with calibrated weight modifier', () => {
            stamina.setStamina(47.5);
            const summary = stamina.getState();

            expect(summary.stamina).toBe(47.5);
            expect(summary.maxStamina).toBe(95);
            expect(summary.staminaPercentage).toBe(50);
            expect(summary.isExhausted).toBe(false);
            expect(summary.weightModifier).toBe(1.3); // Calibrated formula: 1.0 + (100-70)*0.01 - (50-50)*0.01
            expect(summary.recoveryContext).toBe('resting');
        });

        it('should update correctly with delta time', () => {
            stamina.setStamina(50);
            const initialStamina = stamina.stamina;

            stamina.update(0.5); // Half second of recovery

            expect(stamina.stamina).toBeGreaterThan(initialStamina);
        });

        it('should enforce stamina bounds when setting manually', () => {
            stamina.setStamina(-10);
            expect(stamina.stamina).toBe(0);

            stamina.setStamina(200);
            expect(stamina.stamina).toBe(95); // maxStamina
        });
    });
});
