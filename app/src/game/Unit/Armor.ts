/**
 * Armor system for combat damage reduction
 * Based on historical effectiveness of medieval armor against cutting weapons
 */

export type ArmorType = 'none' | 'leather' | 'chainmail' | 'plate';

export type ArmorLocation = 'head' | 'torso' | 'arms' | 'legs';

/**
 * Armor represents protective equipment worn by a unit
 * Different armor types provide different levels of protection
 */
export class Armor {
    /**
     * Creates armor with specified protection levels
     * @param name - Display name
     * @param type - Type of armor
     * @param weight - Weight in kg (affects movement and stamina)
     * @param headProtection - Damage reduction for head (0-1.0)
     * @param torsoProtection - Damage reduction for torso (0-1.0)
     * @param armProtection - Damage reduction for arms (0-1.0)
     * @param legProtection - Damage reduction for legs (0-1.0)
     */
    constructor(
        public readonly name: string,
        public readonly type: ArmorType,
        public readonly weight: number,
        public readonly headProtection: number,
        public readonly torsoProtection: number,
        public readonly armProtection: number,
        public readonly legProtection: number,
    ) {}

    /**
     * Gets damage reduction for a specific body part
     * @param location - Body part location
     * @returns Damage reduction multiplier (0-1.0, where 1.0 = 100% reduction)
     */
    getProtection(location: ArmorLocation): number {
        switch (location) {
            case 'head':
                return this.headProtection;
            case 'torso':
                return this.torsoProtection;
            case 'arms':
                return this.armProtection;
            case 'legs':
                return this.legProtection;
        }
    }
}

/**
 * Creates no armor (unarmored)
 */
export function createNoArmor(): Armor {
    return new Armor(
        'No Armor',
        'none',
        0,
        0, // head
        0, // torso
        0, // arms
        0, // legs
    );
}

/**
 * Creates leather armor
 * Provides minimal protection against cuts
 * Light and flexible, minimal movement penalty
 */
export function createLeatherArmor(): Armor {
    return new Armor(
        'Leather Armor',
        'leather',
        8, // 8 kg
        0.2, // 20% head reduction (leather cap)
        0.3, // 30% torso reduction (leather vest)
        0.25, // 25% arm reduction
        0.25, // 25% leg reduction
    );
}

/**
 * Creates chainmail armor
 * Excellent protection against cuts, poor against blunt force
 * Heavy, significant movement penalty
 */
export function createChainmail(): Armor {
    return new Armor(
        'Chainmail',
        'chainmail',
        15, // 15 kg
        0.5, // 50% head reduction (mail coif)
        0.7, // 70% torso reduction (hauberk)
        0.6, // 60% arm reduction (mail sleeves)
        0.6, // 60% leg reduction (mail chausses)
    );
}

/**
 * Creates plate armor
 * Best protection against all weapon types
 * Very heavy, major movement and stamina penalty
 * Historical effectiveness: 85-95% damage reduction for quality plate
 */
export function createPlateArmor(): Armor {
    return new Armor(
        'Plate Armor',
        'plate',
        25, // 25 kg
        0.9, // 90% head reduction (full helm)
        0.9, // 90% torso reduction (breastplate + backplate)
        0.85, // 85% arm reduction (pauldrons + vambraces)
        0.85, // 85% leg reduction (cuisses + greaves)
    );
}
