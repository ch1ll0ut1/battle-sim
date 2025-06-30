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
}

/**
 * Armor manages individual armor pieces and provides protection calculations.
 * Each armor piece has a slot, material type, protection value, and weight.
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
   * Each material type has different protection and weight characteristics:
   * - Leather: Light weight, minimal protection
   * - Chainmail: Medium weight, good protection
   * - Plate: Heavy weight, maximum protection
   */
  static readonly ARMOR_PIECES: Record<ArmorMaterial, Record<ArmorSlot, ArmorPiece>> = {
    leather: {
      shoes: { slot: 'shoes', material: 'leather', protection: 15, weight: 0.5, name: 'Leather Boots' },
      pants: { slot: 'pants', material: 'leather', protection: 20, weight: 1.0, name: 'Leather Pants' },
      shirt: { slot: 'shirt', material: 'leather', protection: 25, weight: 1.5, name: 'Leather Jerkin' },
      gloves: { slot: 'gloves', material: 'leather', protection: 15, weight: 0.3, name: 'Leather Gloves' },
      shoulders: { slot: 'shoulders', material: 'leather', protection: 20, weight: 0.8, name: 'Leather Pauldrons' },
      helmet: { slot: 'helmet', material: 'leather', protection: 30, weight: 0.7, name: 'Leather Cap' }
    },
    chainmail: {
      shoes: { slot: 'shoes', material: 'chainmail', protection: 35, weight: 1.2, name: 'Chain Boots' },
      pants: { slot: 'pants', material: 'chainmail', protection: 45, weight: 2.5, name: 'Chain Leggings' },
      shirt: { slot: 'shirt', material: 'chainmail', protection: 55, weight: 3.0, name: 'Chain Hauberk' },
      gloves: { slot: 'gloves', material: 'chainmail', protection: 35, weight: 0.8, name: 'Chain Gauntlets' },
      shoulders: { slot: 'shoulders', material: 'chainmail', protection: 40, weight: 1.5, name: 'Chain Pauldrons' },
      helmet: { slot: 'helmet', material: 'chainmail', protection: 60, weight: 1.8, name: 'Chain Coif' }
    },
    plate: {
      shoes: { slot: 'shoes', material: 'plate', protection: 60, weight: 2.0, name: 'Plate Greaves' },
      pants: { slot: 'pants', material: 'plate', protection: 70, weight: 4.0, name: 'Plate Cuisses' },
      shirt: { slot: 'shirt', material: 'plate', protection: 80, weight: 5.0, name: 'Plate Cuirass' },
      gloves: { slot: 'gloves', material: 'plate', protection: 60, weight: 1.2, name: 'Plate Gauntlets' },
      shoulders: { slot: 'shoulders', material: 'plate', protection: 65, weight: 2.5, name: 'Plate Pauldrons' },
      helmet: { slot: 'helmet', material: 'plate', protection: 85, weight: 2.8, name: 'Plate Helm' }
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
   * Calculates the total weight of all equipped armor pieces
   * @returns Total armor weight in kg
   */
  getTotalWeight(): number {
    return Array.from(this.pieces.values()).reduce((total, piece) => total + piece.weight, 0)
  }

  /**
   * Gets all currently equipped armor pieces
   * @returns Array of all equipped armor pieces
   */
  getAllPieces(): ArmorPiece[] {
    return Array.from(this.pieces.values())
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
} 