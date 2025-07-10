import { Unit } from './Unit';
import { UnitAttributesData } from './UnitAttributes';

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
            expect(summary.location.position).toEqual({ x: 15, y: 20 });
            expect(summary.location.direction).toBe(Math.PI / 2);
            expect(summary.attributes).toEqual(testAttributes);
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

}) 