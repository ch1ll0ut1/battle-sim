/**
 * Weapon system for combat simulation
 * Defines weapon characteristics that affect damage, hit rates, and stamina costs
 */

export type DamageType = 'cutting' | 'piercing' | 'blunt';

export type WeaponType
    = | 'sword'
      | 'axe'
      | 'mace'
      | 'spear'
      | 'dagger'
      | 'hammer'
      | 'polearm'
      | 'bow'
      | 'crossbow';

/**
 * Weapon represents a physical weapon with specific characteristics that affect combat
 * Each weapon has weight, length, damage types, and effectiveness modifiers
 */
export class Weapon {
    /**
     * Creates a new weapon with specified characteristics
     * @param name - Display name of the weapon
     * @param weight - Weight in kg, affects stamina drain and wielding requirements
     * @param length - Length in cm, affects reach and handling
     * @param weaponType - Category of weapon affecting damage and handling
     * @param possibleDamageTypes - Types of damage this weapon can inflict
     * @param edgeSharpness - Sharpness of blade (0-1) for cutting effectiveness
     * @param pointGeometry - Sharpness of point (0-1) for piercing effectiveness
     * @param impactArea - Surface area in cm² for blunt damage calculation
     */
    constructor(
        public readonly name: string,
        public readonly weight: number,
        public readonly length: number,
        public readonly weaponType: WeaponType,
        public readonly possibleDamageTypes: DamageType[],
        public readonly edgeSharpness = 0.5,
        public readonly pointGeometry = 0.5,
        public readonly impactArea = 10.0,
    ) {}

    /**
     * Checks if this weapon can perform a specific type of damage
     */
    canPerformDamageType(damageType: DamageType) {
        return this.possibleDamageTypes.includes(damageType);
    }

    /**
     * Gets the primary damage type this weapon is most effective at
     * Determined by weapon type and available damage types
     */
    getPrimaryDamageType(): DamageType {
        switch (this.weaponType) {
            case 'sword':
                return this.possibleDamageTypes.includes('cutting') ? 'cutting' : 'piercing';
            case 'axe':
                return 'cutting';
            case 'mace':
            case 'hammer':
                return 'blunt';
            case 'spear':
            case 'dagger':
                return 'piercing';
            case 'polearm':
                return this.possibleDamageTypes.includes('cutting') ? 'cutting' : 'piercing';
            case 'bow':
            case 'crossbow':
                return 'piercing';
            default:
                return this.possibleDamageTypes[0] ?? 'blunt';
        }
    }
}

/**
 * Creates a basic sword weapon for testing
 */
export function createBasicSword(): Weapon {
    return new Weapon(
        'Basic Sword',
        1.2, // 1.2 kg
        90, // 90 cm
        'sword',
        ['cutting', 'piercing'],
        0.7, // Good edge sharpness
        0.4, // Moderate point
        5.0, // Small impact area
    );
}

/**
 * Creates a basic spear weapon for testing
 */
export function createBasicSpear(): Weapon {
    return new Weapon(
        'Basic Spear',
        1.5, // 1.5 kg
        180, // 180 cm
        'spear',
        ['piercing', 'cutting'],
        0.3, // Poor edge
        0.8, // Excellent point
        3.0, // Very small impact area
    );
}

/**
 * Creates a basic mace weapon for testing
 */
export function createBasicMace(): Weapon {
    return new Weapon(
        'Basic Mace',
        2.0, // 2.0 kg
        70, // 70 cm
        'mace',
        ['blunt'],
        0.0, // No edge
        0.0, // No point
        20.0, // Large impact area
    );
}
