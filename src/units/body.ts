import { Injury, BodyPart } from './unit.js'
import { Armor, ArmorSlot } from '../armor/armor.js'

// Consciousness threshold - above this to be able to fight
const CONSCIOUSNESS_THRESHOLD = 30

// Body part shock multipliers (how much shock each location causes)
const BODY_PART_SHOCK_MULTIPLIERS: Record<BodyPart, number> = {
  head: 2.0,      // Head injuries cause much more shock
  torso: 1.5,     // Torso injuries cause significant shock
  leftArm: 0.8,   // Limb injuries cause less shock
  rightArm: 0.8,
  leftLeg: 0.6,   // Leg injuries cause the least shock
  rightLeg: 0.6
}

// Body part pain multipliers
const BODY_PART_PAIN_MULTIPLIERS: Record<BodyPart, number> = {
  head: 1.8,      // Head injuries are very painful
  torso: 1.2,     // Torso injuries are quite painful
  leftArm: 1.0,   // Standard pain for limbs
  rightArm: 1.0,
  leftLeg: 0.9,   // Leg injuries are slightly less painful
  rightLeg: 0.9
}

// Map body parts to armor slots
const BODY_PART_TO_ARMOR_SLOT: Record<BodyPart, ArmorSlot> = {
  head: 'helmet',
  torso: 'shirt',
  leftArm: 'gloves',  // Simplified mapping
  rightArm: 'gloves',
  leftLeg: 'pants',   // Simplified mapping
  rightLeg: 'pants'
}

/**
 * UnitBody handles all physical aspects of a unit including injuries, consciousness,
 * blood loss, and armor integration. It manages the relationship between physical
 * damage and combat effectiveness.
 */
export class UnitBody {
  /**
   * List of all injuries sustained by the unit
   * Each injury affects specific body parts and contributes to overall pain/shock
   * Injuries can accumulate and have permanent effects
   */
  private injuries: Injury[] = []

  /**
   * Current consciousness level (0-100)
   * 0 = unconscious, 100 = fully conscious
   * Affected by shock, blood loss, and injury severity
   * Below threshold prevents combat actions
   */
  private consciousness: number = 100 // 0-100, 0 = unconscious

  /**
   * Current blood loss level (0-100)
   * 0 = no blood loss, 100 = fatal blood loss
   * Accumulates from bleeding injuries over time
   * High blood loss causes unconsciousness and death
   */
  private bloodLoss: number = 0 // 0-100, 100 = fatal blood loss

  /**
   * Currently equipped armor that provides protection against injuries
   * Armor reduces shock and pain from injuries but doesn't prevent damage
   * Null when no armor is equipped
   */
  private armor: Armor | null = null

  /**
   * Creates a new unit body with specified physical characteristics
   * @param weight - Unit weight (0-200) affecting movement and armor capacity
   * @param strength - Physical strength (0-100) affecting damage and equipment capacity
   * @param experience - Combat experience (0.0-1.0) affecting shock and pain resistance
   */
  constructor(
    public readonly weight: number, // 0-200, affects movement and armor capacity
    public readonly strength: number, // 0-100, affects damage and armor capacity
    public readonly experience: number, // 0.0-1.0, affects shock and pain resistance from combat experience
  ) {}

  /**
   * Equips armor on the unit
   * Armor provides protection that reduces injury effects
   * @param armor - The armor to equip
   */
  equipArmor(armor: Armor): void {
    this.armor = armor
  }

  /**
   * Gets the armor protection value for a specific body part
   * Maps body parts to armor slots and returns protection value
   * @param bodyPart - The body part to check protection for
   * @returns Protection value (0-100) or 0 if no armor equipped
   */
  getArmorProtection(bodyPart: BodyPart): number {
    if (!this.armor) return 0
    const slot = BODY_PART_TO_ARMOR_SLOT[bodyPart]
    return this.armor.getProtection(slot)
  }

  /**
   * Gets the total weight of currently equipped armor
   * @returns Total armor weight in kg, or 0 if no armor equipped
   */
  getArmorWeight(): number {
    return this.armor ? this.armor.getTotalWeight() : 0
  }

  /**
   * Processes a new injury, applying armor protection and body part effects
   * Armor reduces shock and pain but doesn't prevent damage
   * Different body parts have different shock/pain multipliers
   * @param injury - The injury to receive
   */
  receiveInjury(injury: Injury): void {
    // Apply armor protection to reduce injury effects
    const armorProtection = this.getArmorProtection(injury.bodyPart)
    const armorReduction = armorProtection / 100 // 0.0 to 1.0

    // Calculate modified injury effects based on armor and body part
    const shockMultiplier = BODY_PART_SHOCK_MULTIPLIERS[injury.bodyPart]
    const painMultiplier = BODY_PART_PAIN_MULTIPLIERS[injury.bodyPart]
    
    // Armor reduces shock and pain, but not damage (armor can be penetrated)
    const modifiedShock = injury.shock * shockMultiplier * (1 - armorReduction * 0.7) // Armor reduces shock by up to 70%
    const modifiedPain = injury.pain * painMultiplier * (1 - armorReduction * 0.5)   // Armor reduces pain by up to 50%
    
    // Create modified injury
    const modifiedInjury: Injury = {
      ...injury,
      shock: Math.round(modifiedShock),
      pain: Math.round(modifiedPain)
    }

    this.injuries.push(modifiedInjury)
    
    // Immediate effects
    if (injury.isFatal) {
      this.consciousness = Math.max(0, this.consciousness - modifiedShock)
    } else {
      // Non-fatal injuries also cause immediate shock
      this.consciousness = Math.max(0, this.consciousness - (modifiedShock * 0.5))
    }
    
    // Update blood loss
    this.bloodLoss = Math.min(100, this.bloodLoss + injury.bleeding)
  }

  /**
   * Updates injury effects over time including bleeding and consciousness
   * Accumulates blood loss from all bleeding injuries
   * Updates consciousness based on shock and blood loss
   * @param deltaTime - Time elapsed since last update
   */
  updateInjuries(deltaTime: number): void {
    // Update bleeding and blood loss
    let totalBleeding = 0
    for (const injury of this.injuries) {
      totalBleeding += injury.bleeding
    }
    
    this.bloodLoss = Math.min(100, this.bloodLoss + (totalBleeding * deltaTime))
    
    // Update consciousness based on blood loss and shock
    const totalShock = this.injuries.reduce((sum, injury) => sum + injury.shock, 0)
    const shockEffect = (totalShock / 100) * (1 - this.experience * 0.5)
    const bloodLossEffect = this.bloodLoss / 100
    
    this.consciousness = Math.max(0, this.consciousness - (shockEffect + bloodLossEffect) * deltaTime)
    
    // Check for death
    if (this.bloodLoss >= 100 || this.consciousness <= 0) {
      this.die()
    }
  }

  /**
   * Handles unit death by setting consciousness to 0
   * Called when blood loss reaches 100% or consciousness reaches 0
   */
  private die(): void {
    this.consciousness = 0
    // TODO: Implement death handling
  }

  /**
   * Checks if the unit is alive
   * Unit is alive if consciousness > 0 and blood loss < 100%
   * @returns True if the unit is alive
   */
  isAlive(): boolean {
    return this.consciousness > 0 && this.bloodLoss < 100
  }

  /**
   * Checks if the unit is conscious enough to fight
   * Uses consciousness threshold to determine combat capability
   * @returns True if the unit is conscious
   */
  isConscious(): boolean {
    return this.consciousness > CONSCIOUSNESS_THRESHOLD
  }

  /**
   * Gets the current consciousness level
   * @returns Consciousness value (0-100)
   */
  getConsciousness(): number {
    return this.consciousness
  }

  /**
   * Gets the current blood loss level
   * @returns Blood loss value (0-100)
   */
  getBloodLoss(): number {
    return this.bloodLoss
  }

  /**
   * Gets a copy of all current injuries
   * @returns Array of all injuries
   */
  getInjuries(): Injury[] {
    return [...this.injuries]
  }

  /**
   * Gets all injuries affecting a specific body part
   * @param bodyPart - The body part to check
   * @returns Array of injuries for the specified body part
   */
  getInjuriesByBodyPart(bodyPart: BodyPart): Injury[] {
    return this.injuries.filter(injury => injury.bodyPart === bodyPart)
  }

  /**
   * Calculates total pain from all injuries
   * Pain affects combat effectiveness and can cause unconsciousness
   * @returns Total pain value
   */
  getTotalPain(): number {
    return this.injuries.reduce((sum, injury) => sum + injury.pain, 0)
  }

  /**
   * Calculates total shock from all injuries
   * Shock affects consciousness and can cause unconsciousness
   * @returns Total shock value
   */
  getTotalShock(): number {
    return this.injuries.reduce((sum, injury) => sum + injury.shock, 0)
  }

  /**
   * Calculates the functionality percentage of a specific body part
   * Functionality is reduced by damage and permanent damage from injuries
   * 100% = fully functional, 0% = completely disabled
   * @param bodyPart - The body part to check
   * @returns Functionality percentage (0-100)
   */
  getBodyPartFunctionality(bodyPart: BodyPart): number {
    const injuries = this.getInjuriesByBodyPart(bodyPart)
    if (injuries.length === 0) return 100
    
    const totalDamage = injuries.reduce((sum, injury) => sum + injury.damage, 0)
    const permanentDamage = injuries.reduce((sum, injury) => sum + (injury.permanentDamage || 0), 0)
    
    return Math.max(0, 100 - totalDamage - permanentDamage)
  }

  /**
   * Checks if the unit can wear armor of a given weight
   * Based on unit's weight and strength capacity
   * Formula: maxArmorWeight = (weight * 0.5) + (strength * 0.3)
   * @param armorWeight - Weight of the armor in kg
   * @returns True if the unit can wear the armor
   */
  canWearArmor(armorWeight: number): boolean {
    const maxArmorWeight = (this.weight * 0.5) + (this.strength * 0.3)
    return armorWeight <= maxArmorWeight
  }

  /**
   * Checks if the unit can wield a weapon of a given weight
   * Based on unit's strength capacity
   * Formula: maxWeaponWeight = strength * 0.3 (30% of strength)
   * @param weaponWeight - Weight of the weapon in kg
   * @returns True if the unit can wield the weapon
   */
  canWieldWeapon(weaponWeight: number): boolean {
    const maxWeaponWeight = this.strength * 0.3 // 30% of strength as max weapon weight
    return weaponWeight <= maxWeaponWeight
  }
} 