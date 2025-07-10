import { UnitAttributes, UnitAttributesData } from './UnitAttributes';

describe('UnitAttributes', () => {
    /**
     * Tests basic creation and property access
     */
    describe('Constructor and Property Access', () => {
        it('should create UnitAttributes with valid parameters', () => {
            const attributes: UnitAttributesData = {
                weight: 75,
                strength: 60,
                experience: 0.5,
                age: 30,
                gender: 'male'
            };
            const manager = new UnitAttributes(attributes);

            expect(manager.weight).toBe(75);
            expect(manager.strength).toBe(60);
            expect(manager.experience).toBe(0.5);
            expect(manager.age).toBe(30);
            expect(manager.gender).toBe('male');
        });

        it('should use all provided attribute values', () => {
            const attributes: UnitAttributesData = {
                weight: 70,
                strength: 50,
                experience: 0.3,
                age: 25,
                gender: 'female'
            };
            const manager = new UnitAttributes(attributes);

            expect(manager.age).toBe(25);
            expect(manager.gender).toBe('female');
        });
    });

    /**
     * Tests validation of attribute ranges
     */
    describe('Validation', () => {
        it('should validate weight range', () => {
            expect(() => new UnitAttributes({ weight: 39, strength: 50, experience: 0.5, age: 25, gender: 'male' })).toThrow('Physical weight must be between 40-120 kg');
            expect(() => new UnitAttributes({ weight: 121, strength: 50, experience: 0.5, age: 25, gender: 'male' })).toThrow('Physical weight must be between 40-120 kg');
        });

        it('should validate strength range', () => {
            expect(() => new UnitAttributes({ weight: 70, strength: -1, experience: 0.5, age: 25, gender: 'male' })).toThrow('Physical strength must be between 0-100');
            expect(() => new UnitAttributes({ weight: 70, strength: 101, experience: 0.5, age: 25, gender: 'male' })).toThrow('Physical strength must be between 0-100');
        });

        it('should validate experience range', () => {
            expect(() => new UnitAttributes({ weight: 70, strength: 50, experience: -0.1, age: 25, gender: 'male' })).toThrow('Combat experience must be between 0-1');
            expect(() => new UnitAttributes({ weight: 70, strength: 50, experience: 1.1, age: 25, gender: 'male' })).toThrow('Combat experience must be between 0-1');
        });

        it('should validate age range', () => {
            expect(() => new UnitAttributes({ weight: 70, strength: 50, experience: 0.5, age: -1, gender: 'male' })).toThrow('Age must be between 0-60 years');
            expect(() => new UnitAttributes({ weight: 70, strength: 50, experience: 0.5, age: 61, gender: 'male' })).toThrow('Age must be between 0-60 years');
        });
    });

    /**
     * Tests setter behavior with validation and logging
     */
    describe('Property Setters', () => {
        let attributes: UnitAttributes;
        let consoleSpy: jest.SpyInstance;

        beforeEach(() => {
            attributes = new UnitAttributes({
                weight: 70,
                strength: 50,
                experience: 0.5,
                age: 25,
                gender: 'male'
            });
            consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it('should allow direct weight assignment with validation and logging', () => {
            attributes.weight = 80;

            expect(attributes.weight).toBe(80);
            expect(consoleSpy).toHaveBeenCalledWith('UnitAttributes updated: weight: 70 → 80');
        });

        it('should allow direct strength assignment with validation and logging', () => {
            attributes.strength = 60;

            expect(attributes.strength).toBe(60);
            expect(consoleSpy).toHaveBeenCalledWith('UnitAttributes updated: strength: 50 → 60');
        });

        it('should allow direct experience assignment with validation and logging', () => {
            attributes.experience = 0.8;

            expect(attributes.experience).toBe(0.8);
            expect(consoleSpy).toHaveBeenCalledWith('UnitAttributes updated: experience: 0.5 → 0.8');
        });

        it('should allow direct age assignment with validation and logging', () => {
            attributes.age = 30;

            expect(attributes.age).toBe(30);
            expect(consoleSpy).toHaveBeenCalledWith('UnitAttributes updated: age: 25 → 30');
        });

        it('should allow direct gender assignment with validation and logging', () => {
            attributes.gender = 'female';

            expect(attributes.gender).toBe('female');
            expect(consoleSpy).toHaveBeenCalledWith('UnitAttributes updated: gender: male → female');
        });

        it('should validate during direct assignment', () => {
            expect(() => {
                attributes.weight = 200;
            }).toThrow('Physical weight must be between 40-120 kg');

            // Original values should be unchanged
            expect(attributes.weight).toBe(70);
        });

        it('should not log when setting same value', () => {
            attributes.weight = 70; // Same value

            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });



    /**
     * Tests experience level calculations
     */
    describe('Experience Levels', () => {
        it('should return correct experience levels', () => {
            expect(new UnitAttributes({ weight: 70, strength: 50, experience: 0.0, age: 25, gender: 'male' }).getExperienceLevel()).toBe('Untrained');
            expect(new UnitAttributes({ weight: 70, strength: 50, experience: 0.2, age: 25, gender: 'male' }).getExperienceLevel()).toBe('Novice');
            expect(new UnitAttributes({ weight: 70, strength: 50, experience: 0.4, age: 25, gender: 'male' }).getExperienceLevel()).toBe('Trained');
            expect(new UnitAttributes({ weight: 70, strength: 50, experience: 0.7, age: 25, gender: 'male' }).getExperienceLevel()).toBe('Veteran');
            expect(new UnitAttributes({ weight: 70, strength: 50, experience: 0.9, age: 25, gender: 'male' }).getExperienceLevel()).toBe('Elite');
            expect(new UnitAttributes({ weight: 70, strength: 50, experience: 1.0, age: 25, gender: 'male' }).getExperienceLevel()).toBe('Legendary');
        });
    });

    /**
     * Tests strength level calculations
     */
    describe('Strength Levels', () => {
        it('should return correct strength levels', () => {
            expect(new UnitAttributes({ weight: 70, strength: 15, experience: 0.5, age: 25, gender: 'male' }).getStrengthLevel()).toBe('Weak');
            expect(new UnitAttributes({ weight: 70, strength: 30, experience: 0.5, age: 25, gender: 'male' }).getStrengthLevel()).toBe('Average');
            expect(new UnitAttributes({ weight: 70, strength: 50, experience: 0.5, age: 25, gender: 'male' }).getStrengthLevel()).toBe('Strong');
            expect(new UnitAttributes({ weight: 70, strength: 70, experience: 0.5, age: 25, gender: 'male' }).getStrengthLevel()).toBe('Very Strong');
            expect(new UnitAttributes({ weight: 70, strength: 90, experience: 0.5, age: 25, gender: 'male' }).getStrengthLevel()).toBe('Exceptional');
        });
    });

    /**
     * Tests summary generation
     */
    describe('Summary Generation', () => {
        it('should generate complete summary', () => {
            const attributesData: UnitAttributesData = {
                weight: 75,
                strength: 80,
                experience: 0.6,
                age: 28,
                gender: 'female'
            };
            const manager = new UnitAttributes(attributesData);

            const summary = manager.getSummary();

            expect(summary.weight).toBe(75);
            expect(summary.strength).toBe(80);
            expect(summary.experience).toBe(0.6);
            expect(summary.age).toBe(28);
            expect(summary.gender).toBe('female');
        });
    });
}); 