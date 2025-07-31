/**
 * Weapon - Represents weapons with type and possible damage types
 * 
 * This class defines the physical characteristics of weapons including weight,
 * length, damage types, and effectiveness modifiers. Weapons affect combat
 * through hit rates, damage calculation, and stamina requirements.
 */

export type DamageType = 'cutting' | 'piercing' | 'blunt'

export type WeaponType = 
  | 'sword' 
  | 'axe' 
  | 'mace' 
  | 'spear' 
  | 'dagger' 
  | 'hammer' 
  | 'polearm' 
  | 'bow' 
  | 'crossbow'

export interface WeaponProfile {
  name: string
  weight: number // kg
  length: number // cm
  weaponType: WeaponType
  possibleDamageTypes: DamageType[]
  // Physical characteristics for damage calculation
  edgeSharpness?: number // 0-1, for cutting weapons
  pointGeometry?: number // 0-1, for piercing weapons
  impactArea?: number // cm², for blunt weapons
}

/**
 * Weapon represents a physical weapon with specific characteristics that affect combat.
 * Each weapon has weight, length, damage types, and effectiveness modifiers that
 * determine how it performs in battle and what requirements units need to wield it.
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
    public readonly edgeSharpness: number = 0.5,
    public readonly pointGeometry: number = 0.5,
    public readonly impactArea: number = 10.0
  ) {}

  /**
   * Checks if this weapon can perform a specific type of damage
   * @param damageType - The type of damage to check
   * @returns True if the weapon can inflict this damage type
   */
  canPerformDamageType(damageType: DamageType): boolean {
    return this.possibleDamageTypes.includes(damageType)
  }

  /**
   * Gets the primary damage type this weapon is most effective at
   * Determined by weapon type and available damage types
   * @returns The most effective damage type for this weapon
   */
  getPrimaryDamageType(): DamageType {
    // Default logic based on weapon type
    switch (this.weaponType) {
      case 'sword':
        return this.possibleDamageTypes.includes('cutting') ? 'cutting' : 'piercing'
      case 'axe':
        return 'cutting'
      case 'mace':
      case 'hammer':
        return 'blunt'
      case 'spear':
      case 'dagger':
        return 'piercing'
      case 'polearm':
        return this.possibleDamageTypes.includes('cutting') ? 'cutting' : 'piercing'
      case 'bow':
      case 'crossbow':
        return 'piercing'
      default:
        return this.possibleDamageTypes[0] || 'blunt'
    }
  }
} 