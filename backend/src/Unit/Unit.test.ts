import { Unit } from './Unit';
import { UnitAttributesData } from './UnitAttributes';
import { UnitMovementPhysics } from './UnitMovementPhysics';
import { movementConfig } from '../config/movement';

describe('Unit', () => {
    let testAttributes: UnitAttributesData;

    beforeEach(() => {
        // Create standard test attributes
        testAttributes = {
            weight: 75,
            strength: 60,
            experience: 0.5,
            age: 25,
            gender: 'male'
        };
    });

    /**
     * Tests basic unit creation and properties
     */
    describe('Constructor', () => {
        it('should create a unit with all required properties', () => {
            const unit = new Unit(1, 'Test Warrior', 1, testAttributes);

            expect(unit.id).toBe(1);
            expect(unit.name).toBe('Test Warrior');
            expect(unit.team).toBe(1);
            expect(unit.attributes.weight).toBe(75);
            expect(unit.attributes.strength).toBe(60);
            expect(unit.attributes.experience).toBe(0.5);
            expect(unit.attributes.age).toBe(25);
            expect(unit.attributes.gender).toBe('male');
            expect(unit.movement.x).toBe(0);
            expect(unit.movement.y).toBe(0);
            expect(unit.movement.direction).toBe(0);
        });

    });

    /**
     * Tests summary generation
     */
    describe('Summary Generation', () => {
        it('should generate comprehensive summary', () => {
            const unit = new Unit(
                7, 
                'Summary Test', 
                2, 
                testAttributes, 
                { x: 15, y: 20 }, 
                Math.PI / 2
            );

            const summary = unit.getSummary();

            expect(summary.id).toBe(7);
            expect(summary.name).toBe('Summary Test');
            expect(summary.team).toBe(2);
            expect(summary.movement.position).toEqual({ x: 15, y: 20 });
            expect(summary.movement.direction).toBe(Math.PI / 2);
            expect(summary.attributes).toEqual(testAttributes);
            expect(summary.stamina).toBeDefined();
            expect(summary.stamina.stamina).toBeGreaterThan(0);
            expect(summary.stamina.maxStamina).toBeGreaterThan(0);
        });
    });

    /**
     * Tests update method (placeholder for future components)
     */
    describe('Update Method', () => {
        it('should not crash when called', () => {
            const unit = new Unit(1, 'Test', 1, testAttributes);
            
            // Should not throw any errors
            expect(() => unit.update(0.1)).not.toThrow();
            expect(() => unit.update(1.0)).not.toThrow();
        });
    });

    /**
     * Tests realistic unit examples with diverse attributes
     */
    describe('Test integration with other components', () => {
        it('should integrate UnitAttributes', () => {
            const novice = new Unit(1, 'Test Unit', 1, testAttributes);

            expect(novice.attributes.getExperienceLevel()).toBe('Trained');
            expect(novice.attributes.getStrengthLevel()).toBe('Very Strong');
        });

        it('should integrate UnitMovement', () => {
            const unit = new Unit(1, 'Test Unit', 1, testAttributes);

            expect(unit.movement.x).toBe(0);
            expect(unit.movement.y).toBe(0);
            expect(unit.movement.direction).toBe(0);
        });
    });

    /**
     * Tests component lifecycle
     */
    describe('Component Lifecycle', () => {
        it('should update location component during unit update', () => {
            const unit = new Unit(1, 'Test Unit', 1, testAttributes);
            
            // Mock the location component update to verify it gets called
            const locationUpdateSpy = jest.spyOn(unit.movement, 'update');
            
            unit.update(0.1);
            
            expect(locationUpdateSpy).toHaveBeenCalledWith(0.1);
            
            locationUpdateSpy.mockRestore();
        });
    });

    /**
     * Integration tests for realistic endurance behavior
     * Tests the interaction between movement physics and stamina systems
     */
    describe('Endurance Integration Tests', () => {
        let originalMovementSystem: string;

        beforeEach(() => {
            // Switch to physics system for endurance testing
            originalMovementSystem = movementConfig.movementSystem;
            movementConfig.movementSystem = 'physics';
        });

        afterEach(() => {
            // Restore original movement system
            movementConfig.movementSystem = originalMovementSystem;
        });

        // Helper functions to create realistic unit types for testing
        const createFreshCivilian = (id: number, name: string) => new Unit(id, name, 1, {
            strength: 35,     // Basic human fitness, no conditioning
            weight: 82,       // Average weight + basic gear  
            experience: 0.0,  // No military experience
            age: 18,
            gender: 'male'
        });

        const createTrainedRecruit = (id: number, name: string) => new Unit(id, name, 1, {
            strength: 45,     // Completed basic training
            weight: 76,       // Improved fitness + gear
            experience: 0.3,  // Basic military training completed  
            age: 20,
            gender: 'male'
        });

        const createVeteranSoldier = (id: number, name: string) => new Unit(id, name, 1, {
            strength: 60,     // Well-conditioned through service
            weight: 75,       // Optimized fitness-to-gear ratio
            experience: 0.6,  // Significant field experience
            age: 25,
            gender: 'male'
        });

        const createEliteSoldier = (id: number, name: string) => new Unit(id, name, 1, {
            strength: 90,     // Peak physical conditioning
            weight: 72,       // Lean and optimized
            experience: 0.9,  // Elite training and extensive experience
            age: 28,
            gender: 'male'
        });

        // Running Endurance Tests
        /**
         * Tests fresh civilian running endurance
         * Expected: ~33 minutes (realistic baseline for untrained person)
         */
        it('should allow fresh civilian to run for ~30-35 minutes', () => {
            const civilian = createFreshCivilian(1, 'Fresh Civilian Runner');
            civilian.movement.moveTo({ x: 1000, y: 0 }, true);
            
            const deltaTime = 0.1;
            let totalTime = 0;
            
            while (civilian.stamina.staminaPercentage > 10 && totalTime < 3600/2) {
                civilian.update(deltaTime);
                totalTime += deltaTime;
            }
            
            const runningMinutes = totalTime / 60;
            expect(runningMinutes).toBeGreaterThan(25);
            expect(runningMinutes).toBeLessThan(40);
        });

        /**
         * Tests trained recruit running endurance  
         * Expected: ~60 minutes (basic training standard with improved conditioning)
         */
        it('should allow trained recruit to run for 50-70 minutes', () => {
            const recruit = createTrainedRecruit(2, 'Trained Recruit Runner');
            recruit.movement.moveTo({ x: 1000, y: 0 }, true);
            
            const deltaTime = 0.1;
            let totalTime = 0;
            
            while (recruit.stamina.staminaPercentage > 10 && totalTime < 3600) {
                recruit.update(deltaTime);
                totalTime += deltaTime;
            }
            
            const runningMinutes = totalTime / 60;
            expect(runningMinutes).toBeGreaterThan(50);
            expect(runningMinutes).toBeLessThan(75);
        });

        /**
         * Tests veteran soldier running endurance
         * Expected: ~106 minutes (experienced military standard with field conditioning)
         */
        it('should allow veteran soldier to run for 90-120 minutes', () => {
            const veteran = createVeteranSoldier(3, 'Veteran Soldier Runner');
            veteran.movement.moveTo({ x: 1000, y: 0 }, true);
            
            const deltaTime = 0.1;
            let totalTime = 0;
            
            while (veteran.stamina.staminaPercentage > 10 && totalTime < 3600 * 2) {
                veteran.update(deltaTime);
                totalTime += deltaTime;
            }
            
            const runningMinutes = totalTime / 60;
            expect(runningMinutes).toBeGreaterThan(90);
            expect(runningMinutes).toBeLessThan(125);
        });

        /**
         * Tests elite soldier running endurance
         * Expected: ~222 minutes (special forces level - can run for 3.5+ hours)
         */
        it('should allow elite soldier to run for 200-240 minutes', () => {
            const elite = createEliteSoldier(4, 'Elite Soldier Runner');
            elite.movement.moveTo({ x: 1000, y: 0 }, true);
            
            const deltaTime = 0.1;
            let totalTime = 0;
            
            while (elite.stamina.staminaPercentage > 10 && totalTime < 3600 * 4) {
                elite.update(deltaTime);
                totalTime += deltaTime;
            }
            
            const runningMinutes = totalTime / 60;
            expect(runningMinutes).toBeGreaterThan(195);
            expect(runningMinutes).toBeLessThan(250);
        });

        // Marching Endurance Tests
        /**
         * Tests fresh civilian marching endurance
         * Expected: ~2.2 hours of walking (limited endurance for untrained person)
         */
        it('should allow fresh civilian to march for ~2 hours', () => {
            const civilian = createFreshCivilian(5, 'Fresh Civilian Marcher');
            civilian.movement.moveTo({ x: 25000, y: 0 }, false); // 25km target
            
            const deltaTime = 1.0;
            let totalTime = 0;
            let distanceCovered = 0;
            
            const maxSafetyLimit = 4 * 3600; // 4 hours safety limit
            while (totalTime < maxSafetyLimit && civilian.stamina.staminaPercentage > 10) {
                const initialX = civilian.movement.x;
                civilian.update(deltaTime);
                const finalX = civilian.movement.x;
                distanceCovered = finalX;
                totalTime += deltaTime;
            }
            
            const hoursMarched = totalTime / 3600;
            const kmCovered = distanceCovered / 1000;
            
            // Should exhaust after ~2.2 hours of walking
            expect(hoursMarched).toBeGreaterThan(1.8);
            expect(hoursMarched).toBeLessThan(2.8);
            expect(kmCovered).toBeGreaterThan(8); // Should cover meaningful distance
            
            // Should actually exhaust, not hit time limit
            if (totalTime < maxSafetyLimit) {
                expect(civilian.stamina.staminaPercentage).toBeLessThanOrEqual(10);
            }
        });

        /**
         * Tests trained recruit marching endurance
         * Expected: ~4 hours of walking (basic training conditioning)
         */
        it('should allow trained recruit to march for ~4 hours', () => {
            const recruit = createTrainedRecruit(6, 'Trained Recruit Marcher');
            recruit.movement.moveTo({ x: 32000, y: 0 }, false); // 32km target
            
            const deltaTime = 1.0;
            let totalTime = 0;
            let distanceCovered = 0;
            
            const maxSafetyLimit = 6 * 3600; // 6 hours safety limit
            while (totalTime < maxSafetyLimit && recruit.stamina.staminaPercentage > 10) {
                const initialX = recruit.movement.x;
                recruit.update(deltaTime);
                const finalX = recruit.movement.x;
                distanceCovered = finalX;
                totalTime += deltaTime;
            }
            
            const hoursMarched = totalTime / 3600;
            const kmCovered = distanceCovered / 1000;
            
            // Should exhaust after ~4 hours of walking
            expect(hoursMarched).toBeGreaterThan(3.5);
            expect(hoursMarched).toBeLessThan(5.0);
            expect(kmCovered).toBeGreaterThan(17); // Should cover good distance
            
            // Should actually exhaust, not hit time limit
            if (totalTime < maxSafetyLimit) {
                expect(recruit.stamina.staminaPercentage).toBeLessThanOrEqual(10);
            }
        });

        /**
         * Tests veteran soldier marching endurance  
         * Expected: ~7 hours of walking (military operational standard)
         */
        it('should allow veteran soldier to march for ~7 hours', () => {
            const veteran = createVeteranSoldier(7, 'Veteran Soldier Marcher');
            veteran.movement.moveTo({ x: 40000, y: 0 }, false); // 40km target
            
            const deltaTime = 1.0;
            let totalTime = 0;
            let distanceCovered = 0;
            
            const maxSafetyLimit = 10 * 3600; // 10 hours safety limit
            while (totalTime < maxSafetyLimit && veteran.stamina.staminaPercentage > 10) {
                const initialX = veteran.movement.x;
                veteran.update(deltaTime);
                const finalX = veteran.movement.x;
                distanceCovered = finalX;
                totalTime += deltaTime;
            }
            
            const hoursMarched = totalTime / 3600;
            const kmCovered = distanceCovered / 1000;
            
            // Should exhaust after ~7 hours of walking
            expect(hoursMarched).toBeGreaterThan(6.0);
            expect(hoursMarched).toBeLessThan(8.5);
            expect(kmCovered).toBeGreaterThan(30); // Should cover substantial distance
            
            // Should actually exhaust, not hit time limit
            if (totalTime < maxSafetyLimit) {
                expect(veteran.stamina.staminaPercentage).toBeLessThanOrEqual(10);
            }
        });

        /**
         * Tests elite soldier marching endurance
         * Expected: ~14.8 hours of walking (special forces endurance)
         */
        it('should allow elite soldier to march for ~15 hours', () => {
            const elite = createEliteSoldier(8, 'Elite Soldier Marcher');
            elite.movement.moveTo({ x: 50000, y: 0 }, false); // 50km target
            
            const deltaTime = 1.0;
            let totalTime = 0;
            let distanceCovered = 0;
            
            const maxSafetyLimit = 18 * 3600; // 18 hours safety limit
            while (totalTime < maxSafetyLimit && elite.stamina.staminaPercentage > 10) {
                const initialX = elite.movement.x;
                elite.update(deltaTime);
                const finalX = elite.movement.x;
                distanceCovered = finalX;
                totalTime += deltaTime;
            }
            
            const hoursMarched = totalTime / 3600;
            const kmCovered = distanceCovered / 1000;
            
            // Should exhaust after ~14.8 hours of walking
            expect(hoursMarched).toBeGreaterThan(13.0);
            expect(hoursMarched).toBeLessThan(17.0);
            expect(kmCovered).toBeGreaterThan(45); // Should cover excellent distance
            
            // Should actually exhaust, not hit time limit
            if (totalTime < maxSafetyLimit) {
                expect(elite.stamina.staminaPercentage).toBeLessThanOrEqual(10);
            }
        });

        /**
         * Tests physics stability with large time steps during movement simulation
         * Verifies system handles low framerate scenarios without breaking
         */
        it('should handle high deltaTime without physics breaking', () => {
            const soldier = new Unit(7, 'High DeltaTime Test', 1, {
                strength: 60,
                weight: 75,
                experience: 0.7,
                age: 25,
                gender: 'male'
            });

            // Start running
            soldier.movement.moveTo({ x: 100, y: 0 }, true);
            
            // Test with very high deltaTime (1 second per update)
            const highDeltaTime = 1.0;
            const initialStamina = soldier.stamina.stamina;
            const initialPosition = { x: soldier.movement.x, y: soldier.movement.y };
            
            // Single large update
            soldier.update(highDeltaTime);
            
            // Verify stamina decreased appropriately for the time elapsed
            expect(soldier.stamina.stamina).toBeLessThan(initialStamina);
            const staminaLoss = initialStamina - soldier.stamina.stamina;
            expect(staminaLoss).toBeGreaterThan(0.01); // Should lose meaningful stamina in 1 second
            expect(staminaLoss).toBeLessThan(10); // But not excessive amounts
            
            // Verify position changed (unit should have moved)
            const distanceMoved = Math.sqrt(
                Math.pow(soldier.movement.x - initialPosition.x, 2) + 
                Math.pow(soldier.movement.y - initialPosition.y, 2)
            );
            expect(distanceMoved).toBeGreaterThan(0.5); // Should move reasonable distance in 1 second
            expect(distanceMoved).toBeLessThan(5); // But not teleport due to physics breaking
            
            // Verify current speed is reasonable (not infinite due to physics breakdown)
            if (soldier.movement instanceof UnitMovementPhysics) {
                expect(soldier.movement.currentSpeed).toBeGreaterThan(0);
                expect(soldier.movement.currentSpeed).toBeLessThan(10); // Reasonable max speed
            }
        });

        /**
         * Tests that multiple small deltaTime updates produce similar results to fewer large updates
         * This ensures our physics integration is stable and time-step independent
         */
        it('should produce consistent results regardless of deltaTime granularity', () => {
            // Create two identical soldiers
            const soldier1 = new Unit(8, 'Small Steps', 1, {
                strength: 60, weight: 75, experience: 0.7, age: 25, gender: 'male'
            });
            const soldier2 = new Unit(9, 'Large Steps', 1, {
                strength: 60, weight: 75, experience: 0.7, age: 25, gender: 'male'
            });

            // Both start running to same target
            soldier1.movement.moveTo({ x: 10, y: 0 }, true);
            soldier2.movement.moveTo({ x: 10, y: 0 }, true);
            
            // Soldier 1: Many small steps (typical game loop)
            const smallDeltaTime = 0.1;
            for (let i = 0; i < 30; i++) { // 3 seconds total
                soldier1.update(smallDeltaTime);
            }
            
            // Soldier 2: Fewer large steps
            const largeDeltaTime = 0.5;
            for (let i = 0; i < 6; i++) { // 3 seconds total
                soldier2.update(largeDeltaTime);
            }
            
            // Results should be reasonably similar (acceptable for game physics)
            const staminaDifference = Math.abs(soldier1.stamina.staminaPercentage - soldier2.stamina.staminaPercentage);
            expect(staminaDifference).toBeLessThan(2); // Within 2% stamina difference (acceptable for gameplay)
            
            const positionDifference = Math.sqrt(
                Math.pow(soldier1.movement.x - soldier2.movement.x, 2) + 
                Math.pow(soldier1.movement.y - soldier2.movement.y, 2)
            );
            expect(positionDifference).toBeLessThan(1.0); // Within 1 meter position difference (acceptable for battle sim)
        });
    });

}) 