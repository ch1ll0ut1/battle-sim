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
            expect(unit.movement.position).toEqual({ x: 0, y: 0 });
            expect(unit.movement.direction).toBe(0);
        });

        it('should create a unit with custom position and direction', () => {
            const unit = new Unit(2, 'Archer', 2, testAttributes, { x: 10, y: 5 }, Math.PI);

            expect(unit.movement.position).toEqual({ x: 10, y: 5 });
            expect(unit.movement.direction).toBe(Math.PI);
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
    describe('Realistic Unit Examples', () => {
        it('should create a weak novice fighter', () => {
            const noviceAttributes: UnitAttributesData = {
                weight: 65,
                strength: 35,
                experience: 0.1,
                age: 18,
                gender: 'male'
            };
            const novice = new Unit(1, 'Green Recruit', 1, noviceAttributes);

            expect(novice.attributes.getExperienceLevel()).toBe('Novice');
            expect(novice.attributes.getStrengthLevel()).toBe('Average');
        });

        it('should create a strong veteran warrior', () => {
            const veteranAttributes: UnitAttributesData = {
                weight: 80,
                strength: 85,
                experience: 0.8,
                age: 35,
                gender: 'male'
            };
            const veteran = new Unit(2, 'Battle Hardened', 1, veteranAttributes);

            expect(veteran.attributes.getExperienceLevel()).toBe('Elite');
            expect(veteran.attributes.getStrengthLevel()).toBe('Exceptional');
        });

        it('should create an elite champion', () => {
            const eliteAttributes: UnitAttributesData = {
                weight: 75,
                strength: 95,
                experience: 0.95,
                age: 30,
                gender: 'male'
            };
            const elite = new Unit(3, 'Champion', 1, eliteAttributes);

            expect(elite.attributes.getExperienceLevel()).toBe('Legendary');
            expect(elite.attributes.getStrengthLevel()).toBe('Exceptional');
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
     * Tests additional unit examples with varied characteristics
     */
    describe('Additional Unit Variety', () => {
        it('should create an agile female scout', () => {
            const agileAttributes: UnitAttributesData = {
                weight: 55,
                strength: 70,
                experience: 0.6,
                age: 23,
                gender: 'female'
            };
            const scout = new Unit(10, 'Swift Scout', 2, agileAttributes);

            expect(scout.attributes.weight).toBe(55);
            expect(scout.attributes.gender).toBe('female');
            expect(scout.attributes.getExperienceLevel()).toBe('Veteran');
        });

        it('should create a strong male brute', () => {
            const strongAttributes: UnitAttributesData = {
                weight: 95,
                strength: 90,
                experience: 0.4,
                age: 30,
                gender: 'male'
            };
            const brute = new Unit(11, 'Heavy Hitter', 1, strongAttributes);

            expect(brute.attributes.weight).toBe(95);
            expect(brute.attributes.strength).toBe(90);
            expect(brute.attributes.getStrengthLevel()).toBe('Exceptional');
        });

        it('should create a balanced all-rounder', () => {
            const balancedAttributes: UnitAttributesData = {
                weight: 75,
                strength: 75,
                experience: 0.5,
                age: 28,
                gender: 'male'
            };
            const balanced = new Unit(12, 'Versatile Fighter', 1, balancedAttributes);

            expect(balanced.attributes.weight).toBe(75);
            expect(balanced.attributes.strength).toBe(75);
            expect(balanced.attributes.experience).toBe(0.5);
        });
    });

    /**
     * Tests attribute modification through direct assignment
     */
    describe('Attribute Modification', () => {
        it('should allow direct attribute assignment with setters', () => {
            const unit = new Unit(1, 'Test Unit', 1, testAttributes);
            
            // Should work with direct assignment (using setters)
            unit.attributes.weight = 100;
            unit.attributes.strength = 85;
            unit.attributes.experience = 0.7;
            
            expect(unit.attributes.weight).toBe(100);
            expect(unit.attributes.strength).toBe(85);
            expect(unit.attributes.experience).toBe(0.7);
            expect(unit.attributes.age).toBe(25); // unchanged
        });

        it('should validate when using direct assignment', () => {
            const unit = new Unit(1, 'Test Unit', 1, testAttributes);
            
            // Should throw error when trying to assign invalid values
            expect(() => { unit.attributes.weight = 200; }).toThrow('Physical weight must be between 40-120 kg');
            expect(() => { unit.attributes.strength = 150; }).toThrow('Physical strength must be between 0-100');
        });
    });
}) 