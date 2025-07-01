/**
 * Armor - Represents armor that can block hits but has weak points
 * 
 * This class manages armor pieces that provide protection against injuries.
 * Different materials offer varying levels of protection and weight trade-offs.
 * Armor reduces shock and pain from injuries but doesn't prevent damage.
 */

export type ArmorSlot = 'shoes' | 'pants' | 'shirt' | 'gloves' | 'shoulders' | 'helmet'
export type ArmorMaterial = 'leather' | 'chainmail' | 'plate'

export interface ArmorPiece {
  slot: ArmorSlot
  material: ArmorMaterial
  protection: number // 0-100
  weight: number // kg
  name: string
  // Specific protection values for different wound types
  cutProtection: number // 0-100 protection against cuts
  stabProtection: number // 0-100 protection against stabs
  crushProtection: number // 0-100 protection against crush damage
}

/**
 * Armor manages individual armor pieces and provides protection calculations.
 * Each armor piece has a slot, material type, and protection values.
 * Armor can be equipped individually or as complete sets.
 */
export class Armor {
  /**
   * Map of currently equipped armor pieces by slot
   * Empty slots have no protection
   */
  private pieces: Map<ArmorSlot, ArmorPiece> = new Map()

  /**
   * Predefined armor pieces for different materials and slots
   * Each material type has different protection characteristics:
   * - Leather: Light weight, good cut protection, minimal stab/crush protection
   * - Chainmail: Medium weight, excellent cut protection, good stab protection, minimal crush protection
   * - Plate: Heavy weight, excellent protection against all types
   */
  static readonly ARMOR_PIECES: Record<ArmorMaterial, Record<ArmorSlot, ArmorPiece>> = {
    leather: {
      shoes: { slot: 'shoes', material: 'leather', protection: 15, weight: 0.5, name: 'Leather Boots',
        cutProtection: 20, stabProtection: 10, crushProtection: 5 },
      pants: { slot: 'pants', material: 'leather', protection: 20, weight: 1.0, name: 'Leather Pants',
        cutProtection: 25, stabProtection: 15, crushProtection: 8 },
      shirt: { slot: 'shirt', material: 'leather', protection: 25, weight: 1.5, name: 'Leather Jerkin',
        cutProtection: 30, stabProtection: 20, crushProtection: 10 },
      gloves: { slot: 'gloves', material: 'leather', protection: 15, weight: 0.3, name: 'Leather Gloves',
        cutProtection: 20, stabProtection: 10, crushProtection: 5 },
      shoulders: { slot: 'shoulders', material: 'leather', protection: 20, weight: 0.8, name: 'Leather Pauldrons',
        cutProtection: 25, stabProtection: 15, crushProtection: 8 },
      helmet: { slot: 'helmet', material: 'leather', protection: 30, weight: 0.7, name: 'Leather Cap',
        cutProtection: 35, stabProtection: 25, crushProtection: 15 }
    },
    chainmail: {
      shoes: { slot: 'shoes', material: 'chainmail', protection: 35, weight: 1.2, name: 'Chain Boots',
        cutProtection: 70, stabProtection: 40, crushProtection: 15 },
      pants: { slot: 'pants', material: 'chainmail', protection: 45, weight: 2.5, name: 'Chain Leggings',
        cutProtection: 80, stabProtection: 50, crushProtection: 20 },
      shirt: { slot: 'shirt', material: 'chainmail', protection: 55, weight: 3.0, name: 'Chain Hauberk',
        cutProtection: 85, stabProtection: 60, crushProtection: 25 },
      gloves: { slot: 'gloves', material: 'chainmail', protection: 35, weight: 0.8, name: 'Chain Gauntlets',
        cutProtection: 70, stabProtection: 40, crushProtection: 15 },
      shoulders: { slot: 'shoulders', material: 'chainmail', protection: 40, weight: 1.5, name: 'Chain Pauldrons',
        cutProtection: 75, stabProtection: 45, crushProtection: 20 },
      helmet: { slot: 'helmet', material: 'chainmail', protection: 60, weight: 1.8, name: 'Chain Coif',
        cutProtection: 90, stabProtection: 65, crushProtection: 30 }
    },
    plate: {
      shoes: { slot: 'shoes', material: 'plate', protection: 60, weight: 2.0, name: 'Plate Greaves',
        cutProtection: 90, stabProtection: 80, crushProtection: 60 },
      pants: { slot: 'pants', material: 'plate', protection: 70, weight: 4.0, name: 'Plate Cuisses',
        cutProtection: 95, stabProtection: 85, crushProtection: 70 },
      shirt: { slot: 'shirt', material: 'plate', protection: 80, weight: 5.0, name: 'Plate Cuirass',
        cutProtection: 98, stabProtection: 90, crushProtection: 75 },
      gloves: { slot: 'gloves', material: 'plate', protection: 60, weight: 1.2, name: 'Plate Gauntlets',
        cutProtection: 90, stabProtection: 80, crushProtection: 60 },
      shoulders: { slot: 'shoulders', material: 'plate', protection: 65, weight: 2.5, name: 'Plate Pauldrons',
        cutProtection: 92, stabProtection: 82, crushProtection: 65 },
      helmet: { slot: 'helmet', material: 'plate', protection: 85, weight: 2.8, name: 'Plate Helm',
        cutProtection: 98, stabProtection: 95, crushProtection: 80 }
    }
  }

  /**
   * Equips an armor piece in the specified slot
   * Replaces any existing piece in that slot
   * @param slot - The armor slot to equip
   * @param material - The material type of the armor piece
   */
  equipPiece(slot: ArmorSlot, material: ArmorMaterial): void {
    this.pieces.set(slot, Armor.ARMOR_PIECES[material][slot])
  }

  /**
   * Removes an armor piece from the specified slot
   * @param slot - The armor slot to unequip
   */
  unequipPiece(slot: ArmorSlot): void {
    this.pieces.delete(slot)
  }

  /**
   * Gets the armor piece equipped in the specified slot
   * @param slot - The armor slot to check
   * @returns The equipped armor piece or undefined if slot is empty
   */
  getPiece(slot: ArmorSlot): ArmorPiece | undefined {
    return this.pieces.get(slot)
  }

  /**
   * Gets the protection value for the specified armor slot
   * @param slot - The armor slot to check
   * @returns Protection value (0-100) or 0 if no armor equipped
   */
  getProtection(slot: ArmorSlot): number {
    const piece = this.pieces.get(slot)
    return piece ? piece.protection : 0
  }

  /**
   * Gets all currently equipped armor pieces
   * @returns Array of equipped armor pieces
   */
  getAllPieces(): ArmorPiece[] {
    return Array.from(this.pieces.values())
  }

  /**
   * Equips a full set of armor of the specified material
   * @param material - The material type to equip
   */
  equipFullSet(material: ArmorMaterial): void {
    const armorSet = Armor.ARMOR_PIECES[material]
    for (const piece of Object.values(armorSet)) {
      this.equipPiece(piece.slot, material)
    }
  }

  /**
   * Gets the total weight of all equipped armor pieces
   * @returns Total weight in kg
   */
  getTotalWeight(): number {
    return Array.from(this.pieces.values()).reduce((total, piece) => total + piece.weight, 0)
  }

  /**
   * Creates a complete armor set of the specified material
   * Equips all available slots for the material type
   * @param material - The material type for the full set
   * @returns New Armor instance with full set equipped
   */
  static createFullSet(material: ArmorMaterial): Armor {
    const armor = new Armor()
    Object.keys(Armor.ARMOR_PIECES[material]).forEach(slot => {
      armor.equipPiece(slot as ArmorSlot, material)
    })
    return armor
  }

  /**
   * Creates a partial armor set with specific pieces
   * @param material - The material type for the pieces
   * @param slots - Array of slots to equip
   * @returns New Armor instance with specified pieces equipped
   */
  static createPartialSet(material: ArmorMaterial, slots: ArmorSlot[]): Armor {
    const armor = new Armor()
    slots.forEach(slot => {
      armor.equipPiece(slot, material)
    })
    return armor
  }

  /**
   * Determines if armor can block an incoming hit
   * Uses total protection value to calculate block chance
   * @returns True if the hit is blocked by armor
   */
  canBlockHit(): boolean {
    return Math.random() < this.getTotalProtection()
  }

  /**
   * Calculates total protection from all equipped armor pieces
   * @returns Total protection value (0-600 for full set)
   */
  getTotalProtection(): number {
    return this.getAllPieces().reduce((total, piece) => total + piece.protection, 0)
  }

  /**
   * Checks if a target area is a weak point (less protected)
   * @param targetArea - The body area being targeted
   * @returns True if the area has armor protection
   */
  isWeakPoint(targetArea: string): boolean {
    return this.getAllPieces().some(piece => piece.slot === targetArea)
  }

  /**
   * Gets the protection value for a specific wound type in the specified armor slot
   * @param slot - The armor slot to check
   * @param woundType - The type of wound to get protection against
   * @returns Protection value (0-100) or 0 if no armor equipped
   */
  getWoundTypeProtection(slot: ArmorSlot, woundType: 'cut' | 'stab' | 'crush'): number {
    const piece = this.pieces.get(slot)
    if (!piece) return 0

    switch (woundType) {
      case 'cut':
        return piece.cutProtection
      case 'stab':
        return piece.stabProtection
      case 'crush':
        return piece.crushProtection
      default:
        return 0
    }
  }
} 