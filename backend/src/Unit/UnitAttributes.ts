import { TickUpdate } from '../utils/TickUpdate';

/**
 * Type that represents the data structure for unit attributes
 */
export interface UnitAttributesData {
    weight: number;
    strength: number;
    experience: number;
    age: number;
    gender: 'male' | 'female';
}

/**
 * Attribute configuration with validation function
 */
interface AttributeConfig<T = unknown> {
    description: string;
    unit?: string;
    validate: (value: T) => void;
}

/**
 * Configuration object defining all attributes with their validation rules
 */
const ATTRIBUTE_CONFIG: Record<keyof UnitAttributesData, AttributeConfig> = {
    weight: {
        description: 'Physical weight',
        unit: 'kg',
        validate: (value: unknown) => {
            if (typeof value !== 'number') {
                throw new Error(`Physical weight must be a number, got ${typeof value}`);
            }

            if (value < 40 || value > 120) {
                throw new Error(`Physical weight must be between 40-120 kg, got ${value}`);
            }
        },
    },
    strength: {
        description: 'Physical strength',
        validate: (value: unknown) => {
            if (typeof value !== 'number') {
                throw new Error(`Physical strength must be a number, got ${typeof value}`);
            }

            if (value < 0 || value > 100) {
                throw new Error(`Physical strength must be between 0-100, got ${value}`);
            }
        },
    },
    experience: {
        description: 'Combat experience',
        validate: (value: unknown) => {
            if (typeof value !== 'number') {
                throw new Error(`Combat experience must be a number, got ${typeof value}`);
            }

            if (value < 0 || value > 1) {
                throw new Error(`Combat experience must be between 0-1, got ${value}`);
            }
        },
    },
    age: {
        description: 'Age',
        unit: 'years',
        validate: (value: unknown) => {
            if (typeof value !== 'number') {
                throw new Error(`Age must be a number, got ${typeof value}`);
            }

            if (value < 0 || value > 60) {
                throw new Error(`Age must be between 0-60 years, got ${value}`);
            }
        },
    },
    gender: {
        description: 'Unit gender',
        validate: (value: unknown) => {
            if (typeof value !== 'string') {
                throw new Error(`Unit gender must be a string, got ${typeof value}`);
            }

            if (!['male', 'female'].includes(value)) {
                throw new Error(`Unit gender must be one of: male, female, got ${value}`);
            }
        },
    },
};

/**
 * Manager class that handles unit attributes validation, calculations, and utility methods.
 * Uses static getters/setters with a private data object for optimal performance.
 */
export class UnitAttributes implements TickUpdate {
    private data: UnitAttributesData;

    /**
     * Creates a new UnitAttributes instance with validation
     * @param attributes - Unit attributes object containing all properties
     */
    constructor(attributes: UnitAttributesData) {
        this.data = attributes;
        this.validateAll();
    }

    /**
     * Weight getter
     */
    get weight(): number {
        return this.data.weight;
    }

    /**
     * Weight setter with validation and logging
     */
    set weight(value: number) {
        ATTRIBUTE_CONFIG.weight.validate(value);
        this.logChange('weight', this.data.weight, value);
        this.data.weight = value;
    }

    /**
     * Strength getter
     */
    get strength(): number {
        return this.data.strength;
    }

    /**
     * Strength setter with validation and logging
     */
    set strength(value: number) {
        ATTRIBUTE_CONFIG.strength.validate(value);
        this.logChange('strength', this.data.strength, value);
        this.data.strength = value;
    }

    /**
     * Experience getter
     */
    get experience(): number {
        return this.data.experience;
    }

    /**
     * Experience setter with validation and logging
     */
    set experience(value: number) {
        ATTRIBUTE_CONFIG.experience.validate(value);
        this.logChange('experience', this.data.experience, value);
        this.data.experience = value;
    }

    /**
     * Age getter
     */
    get age(): number {
        return this.data.age;
    }

    /**
     * Age setter with validation and logging
     */
    set age(value: number) {
        ATTRIBUTE_CONFIG.age.validate(value);
        this.logChange('age', this.data.age, value);
        this.data.age = value;
    }

    /**
     * Gender getter
     */
    get gender(): 'male' | 'female' {
        return this.data.gender;
    }

    /**
     * Gender setter with validation and logging
     */
    set gender(value: 'male' | 'female') {
        ATTRIBUTE_CONFIG.gender.validate(value);
        this.logChange('gender', this.data.gender, value);
        this.data.gender = value;
    }

    /**
     * Logs a change if the value is different
     * @param key - The attribute key
     * @param oldValue - The old value
     * @param newValue - The new value
     */
    private logChange<K extends keyof UnitAttributesData>(
        key: K,
        oldValue: UnitAttributesData[K],
        newValue: UnitAttributesData[K],
    ): void {
        if (newValue !== oldValue) {
            console.log(`UnitAttributes updated: ${key}: ${oldValue} → ${newValue}`);
        }
    }

    /**
     * Validates all current attributes using config validation functions
     */
    private validateAll(): void {
        Object.entries(ATTRIBUTE_CONFIG).forEach(([key, config]) => {
            const typedKey = key as keyof UnitAttributesData;
            config.validate(this.data[typedKey]);
        });
    }

    /**
     * Gets the experience level description for display purposes
     * @returns Human-readable experience level
     */
    getExperienceLevel(): string {
        const exp = this.data.experience;
        if (exp < 0.1) return 'Untrained';
        if (exp < 0.3) return 'Novice';
        if (exp < 0.6) return 'Trained';
        if (exp < 0.8) return 'Veteran';
        if (exp < 0.95) return 'Elite';
        return 'Legendary';
    }

    /**
     * Gets the strength level description for display purposes
     * @returns Human-readable strength level
     */
    getStrengthLevel(): string {
        const str = this.data.strength;
        if (str < 20) return 'Weak';
        if (str < 40) return 'Average';
        if (str < 60) return 'Strong';
        if (str < 80) return 'Very Strong';
        return 'Exceptional';
    }

    /**
     * Creates a summary object for serialization/display
     * @returns Object containing all attributes
     */
    getState(): UnitAttributesData {
        return this.data;
    }

    update(deltaTime: number): void {
        // noop
    }
}
