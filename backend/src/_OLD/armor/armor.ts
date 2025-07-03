/**
 * Armor - Represents armor that can block hits but has weak points
 * 
 * This class manages armor items that provide protection against injuries.
 * Different materials offer varying levels of protection and weight trade-offs.
 * Armor reduces shock and pain from injuries but doesn't prevent damage.
 */

import { WoundType } from "../injuries/injury"

export type ArmorSlot = 'shoes' | 'pants' | 'shirt' | 'gloves' | 'shoulders' | 'helmet'
export type ArmorMaterial = 'leather' | 'chainmail' | 'plate'


export interface ArmorItem {
  /**
   * The slot where this armor item is equipped
   * Maps to specific body parts and determines where protection is applied
   */
  slot: ArmorSlot

  /**
   * The material type of the armor item
   * Determines base protection values and weight
   */
  material: ArmorMaterial

  /**
   * The weight of the armor item in kilograms
   * Affects movement speed and stamina consumption
   */
  weight: number

  /**
   * The display name of the armor item
   * Used for UI and logging purposes
   */
  name: string

  /**
   * Protection value against cutting damage (0-100)
   * Higher values provide better protection against slashing and cutting attacks
   */
  cutProtection: number

  /**
   * Protection value against stabbing damage (0-100)
   * Higher values provide better protection against piercing and thrusting attacks
   */
  stabProtection: number

  /**
   * Protection value against crushing damage (0-100)
   * Higher values provide better protection against blunt force trauma
   */
  crushProtection: number
}

/**
 * Armor manages individual armor items and provides protection calculations.
 * Each armor item has a slot, material type, and protection values.
 * Armor can be equipped individually or as complete sets.
 */
export class Armor {
  /**
   * Map of currently equipped armor items by slot
   * Empty slots have no protection
   */
  private equipped: Map<ArmorSlot, ArmorItem> = new Map()

  /**
   * Predefined armor items for different materials and slots
   * 
   * Leather Armor:
   * - Light weight (0.3-1.5 kg)
   * - Cut protection: 30-45%
   * - Stab protection: 20-35%
   * - Crush protection: 10-25%
   * - Best for mobility and stealth
   * 
   * Chainmail:
   * - Medium weight (0.8-3.0 kg)
   * - Cut protection: 80-90%
   * - Stab protection: 60-70%
   * - Crush protection: 30-40%
   * - Good balance of protection and weight
   * 
   * Plate:
   * - Heavy weight (1.2-5.0 kg)
   * - Cut protection: 95-100%
   * - Stab protection: 90-95%
   * - Crush protection: 80-90%
   * - Maximum protection at cost of weight
   */
  static readonly ARMOR_ITEMS: Record<ArmorMaterial, Record<ArmorSlot, ArmorItem>> = {
    leather: {
      shoes: { slot: 'shoes', material: 'leather', weight: 0.5, name: 'Leather Boots',
        cutProtection: 50, stabProtection: 30, crushProtection: 10 },
      pants: { slot: 'pants', material: 'leather', weight: 1.0, name: 'Leather Pants',
        cutProtection: 55, stabProtection: 35, crushProtection: 15 },
      shirt: { slot: 'shirt', material: 'leather', weight: 1.5, name: 'Leather Jerkin',
        cutProtection: 60, stabProtection: 40, crushProtection: 20 },
      gloves: { slot: 'gloves', material: 'leather', weight: 0.3, name: 'Leather Gloves',
        cutProtection: 50, stabProtection: 30, crushProtection: 10 },
      shoulders: { slot: 'shoulders', material: 'leather', weight: 0.8, name: 'Leather Pauldrons',
        cutProtection: 55, stabProtection: 35, crushProtection: 15 },
      helmet: { slot: 'helmet', material: 'leather', weight: 0.7, name: 'Leather Cap',
        cutProtection: 65, stabProtection: 45, crushProtection: 25 }
    },
    chainmail: {
      shoes: { slot: 'shoes', material: 'chainmail', weight: 2.0, name: 'Chain Boots',
        cutProtection: 80, stabProtection: 40, crushProtection: 20 },
      pants: { slot: 'pants', material: 'chainmail', weight: 3.5, name: 'Chain Leggings',
        cutProtection: 85, stabProtection: 45, crushProtection: 25 },
      shirt: { slot: 'shirt', material: 'chainmail', weight: 4.5, name: 'Chain Hauberk',
        cutProtection: 90, stabProtection: 55, crushProtection: 30 },
      gloves: { slot: 'gloves', material: 'chainmail', weight: 1.0, name: 'Chain Gauntlets',
        cutProtection: 80, stabProtection: 40, crushProtection: 20 },
      shoulders: { slot: 'shoulders', material: 'chainmail', weight: 2.0, name: 'Chain Pauldrons',
        cutProtection: 85, stabProtection: 45, crushProtection: 25 },
      helmet: { slot: 'helmet', material: 'chainmail', weight: 2.5, name: 'Chain Coif',
        cutProtection: 90, stabProtection: 50, crushProtection: 30 }
    },
    plate: {
      shoes: { slot: 'shoes', material: 'plate', weight: 3.0, name: 'Plate Greaves',
        cutProtection: 95, stabProtection: 75, crushProtection: 60 },
      pants: { slot: 'pants', material: 'plate', weight: 5.0, name: 'Plate Cuisses',
        cutProtection: 98, stabProtection: 85, crushProtection: 65 },
      shirt: { slot: 'shirt', material: 'plate', weight: 8.0, name: 'Plate Cuirass',
        cutProtection: 100, stabProtection: 95, crushProtection: 75 },
      gloves: { slot: 'gloves', material: 'plate', weight: 2.0, name: 'Plate Gauntlets',
        cutProtection: 95, stabProtection: 75, crushProtection: 60 },
      shoulders: { slot: 'shoulders', material: 'plate', weight: 4.0, name: 'Plate Pauldrons',
        cutProtection: 98, stabProtection: 85, crushProtection: 65 },
      helmet: { slot: 'helmet', material: 'plate', weight: 3.5, name: 'Plate Helm',
        cutProtection: 100, stabProtection: 90, crushProtection: 70 }
    }
  }

  /**
   * Equips an armor item in the specified slot
   * Replaces any existing item in that slot
   * @param slot - The armor slot to equip
   * @param material - The material type of the armor item
   */
  equip(slot: ArmorSlot, material: ArmorMaterial): void {
    this.equipped.set(slot, Armor.ARMOR_ITEMS[material][slot])
  }

  /**
   * Removes an armor item from the specified slot
   * @param slot - The armor slot to unequip
   */
  unequip(slot: ArmorSlot): void {
    this.equipped.delete(slot)
  }

  /**
   * Gets the armor item equipped in the specified slot
   * @param slot - The armor slot to check
   * @returns The equipped armor item or undefined if slot is empty
   */
  get(slot: ArmorSlot): ArmorItem | undefined {
    return this.equipped.get(slot)
  }

  /**
   * Gets all currently equipped armor items
   * @returns Array of equipped armor items
   */
  getAllItems(): ArmorItem[] {
    return Array.from(this.equipped.values())
  }

  /**
   * Equips a full set of armor of the specified material
   * @param material - The material type to equip
   */
  equipFullSet(material: ArmorMaterial): void {
    const armorSet = Armor.ARMOR_ITEMS[material]
    for (const item of Object.values(armorSet)) {
      this.equip(item.slot, material)
    }
  }

  /**
   * Gets the total weight of all equipped armor items
   * @returns Total weight in kg
   */
  getTotalWeight(): number {
    return Array.from(this.equipped.values()).reduce((total, item) => total + item.weight, 0)
  }

  /**
   * Creates a complete armor set of the specified material
   * Equips all available slots for the material type
   * @param material - The material type for the full set
   * @returns New Armor instance with full set equipped
   */
  static createFullSet(material: ArmorMaterial): Armor {
    const armor = new Armor()
    Object.keys(Armor.ARMOR_ITEMS[material]).forEach((slot) => {
      armor.equip(slot as ArmorSlot, material)
    })
    return armor
  }

  /**
   * Creates a partial armor set with specific items
   * @param material - The material type for the items
   * @param slots - Array of slots to equip
   * @returns New Armor instance with specified items equipped
   */
  static createPartialSet(material: ArmorMaterial, slots: ArmorSlot[]): Armor {
    const armor = new Armor()
    slots.forEach(slot => {
      armor.equip(slot, material)
    })
    return armor
  }

  /**
   * Gets the protection value for a specific wound type in the specified armor slot
   * @param slot - The armor slot to check
   * @param woundType - The type of wound to get protection against
   * @returns Protection value (0-100) or 0 if no armor equipped
   */
  getWoundTypeProtection(slot: ArmorSlot, woundType: WoundType): number {
    const item = this.equipped.get(slot)
    if (!item) return 0

    switch (woundType) {
      case 'cut':
      case 'amputation':
        return item.cutProtection
      case 'stab':
        return item.stabProtection
      case 'crush':
        return item.crushProtection
      default:
        return 0
    }
  }
} 