import { Armor, ArmorSlot } from '../armor/armor.js'
import { Injury, InjurySeverity } from '../injuries/injury.js'

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

export type BodyPart = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg'

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
  public readonly injuries: Injury[] = []

  /**
   * Current consciousness level (0-100)
   * 0 = unconscious, 100 = fully conscious
   * Affected by shock, blood loss, and injury severity
   * Below threshold prevents combat actions
   */
  private consciousness: number = 100 // 0-100, 0 = unconscious

  /**
   * Current blood loss level (0-100)
   * 0 = no blood loss, 40 = fatal blood loss
   * Accumulates from bleeding injuries over time
   * High blood loss causes unconsciousness and death
   * Realistic model: Unit dies when blood loss reaches 40% (realistic fatal threshold)
   * Blood loss accumulates at the combined rate of all bleeding injuries per second
   * Example: Two injuries with bleeding rates 2 and 5 = 7 units/second blood loss
   */
  private bloodLoss: number = 0

  /**
   * Currently equipped armor that provides protection against injuries
   * Armor reduces shock and pain from injuries but doesn't prevent damage
   * Null when no armor is equipped
   */
  readonly armor: Armor

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
  ) {
    this.armor = new Armor()
  }

  getWoundTypeProtection(bodyPart: BodyPart, woundType: 'cut' | 'stab' | 'crush'): number {
    const slot = BODY_PART_TO_ARMOR_SLOT[bodyPart]
    return this.armor.getWoundTypeProtection(slot, woundType)
  }

  /**
   * Reduces injury severity by specified number of levels
   * @param severity - The original severity level
   * @param levels - Number of levels to reduce (defaults to 1)
   */
  private getReducedSeverity(severity: InjurySeverity, levels: number = 1): InjurySeverity {
    const severityLevels: InjurySeverity[] = ['minor', 'moderate', 'severe', 'critical', 'fatal']
    const currentIndex = severityLevels.indexOf(severity)
    const newIndex = Math.max(0, currentIndex - levels)
    return severityLevels[newIndex]
  }

  /**
   * Processes a new injury, applying armor protection and body part effects
   * @param injury - The injury to process
   */
  receiveInjury(injury: Injury): void {
    // Get armor protection for this wound type
    const slot = BODY_PART_TO_ARMOR_SLOT[injury.bodyPart]
    const armorProtection = this.armor.getWoundTypeProtection(slot, injury.woundType === 'amputation' ? 'crush' : injury.woundType)
    // Apply armor protection effects
    if (armorProtection >= 90) {
      // Complete protection - no injury
      return
    }

    // Create a copy of the injury to modify
    const modifiedInjury: Injury = { ...injury }

    if (armorProtection >= 80) {
      // Convert to crush damage with reduced severity
      modifiedInjury.woundType = 'crush'
      modifiedInjury.severity = this.getReducedSeverity(modifiedInjury.severity, 2)
      modifiedInjury.shock *= 0.5
      modifiedInjury.pain *= 0.5
      modifiedInjury.bleedingRate = 0
    } else if (armorProtection >= 60) {
      // Significant reduction
      modifiedInjury.severity = this.getReducedSeverity(modifiedInjury.severity, 2)
      modifiedInjury.shock *= 0.6
      modifiedInjury.pain *= 0.6
      modifiedInjury.bleedingRate *= 0.3
    } else if (armorProtection >= 40) {
      // Moderate reduction
      modifiedInjury.severity = this.getReducedSeverity(modifiedInjury.severity)
      modifiedInjury.shock *= 0.8
      modifiedInjury.pain *= 0.8
      modifiedInjury.bleedingRate *= 0.6
    } else if (armorProtection >= 20) {
      // Minor reduction
      modifiedInjury.shock *= 0.9
      modifiedInjury.pain *= 0.9
      modifiedInjury.bleedingRate *= 0.8
    }

    // Apply body part multipliers
    modifiedInjury.shock *= BODY_PART_SHOCK_MULTIPLIERS[modifiedInjury.bodyPart]
    modifiedInjury.pain *= BODY_PART_PAIN_MULTIPLIERS[modifiedInjury.bodyPart]

    // Add the injury
    this.injuries.push(modifiedInjury)

    // Update unit status
    this.consciousness = Math.max(0, this.consciousness - (modifiedInjury.shock * (modifiedInjury.severity === 'fatal' ? 1.0 : 0.5)))
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
      totalBleeding += injury.bleedingRate
    }
    this.bloodLoss = Math.min(100, this.bloodLoss + (totalBleeding * deltaTime))
    
    // Update consciousness based on blood loss and shock
    const totalShock = this.injuries.reduce((sum, injury) => sum + injury.shock, 0)
    const shockEffect = (totalShock / 100) * (1 - this.experience * 0.5)
    const bloodLossEffect = this.bloodLoss / 100
    
    this.consciousness = Math.max(0, this.consciousness - (shockEffect + bloodLossEffect) * deltaTime)
    
    // Check for death
    if (!this.isAlive()) {
        // TODO: call battle logger log to log death
        console.log('Unit died')
    }
  }

  /**
   * Checks if the unit is alive
   * Unit is alive if consciousness > 0 and blood loss < 40%
   * @returns True if the unit is alive
   */
  isAlive(): boolean {
    return this.consciousness > 0 && this.bloodLoss < 40
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
   * Gets the functionality level of a body part (0-100)
   * Affected by injuries to that part
   * @param bodyPart - The body part to check
   * @returns Functionality level (0-100)
   */
  getBodyPartFunctionality(bodyPart: BodyPart): number {
    const injuries = this.getInjuriesByBodyPart(bodyPart)
    
    // Check for amputation or permanent loss
    if (injuries.some(injury => injury.isAmputation)) {
      return 0 // No functionality if part is lost
    }
    
    // Calculate functionality reduction from injuries
    const severityPenalty: Record<string, number> = {
      minor: 10,
      moderate: 30,
      severe: 60,
      critical: 80,
      fatal: 100
    }

    let totalPenalty = 0
    for (const injury of injuries) {
      // Add severity penalty
      totalPenalty += severityPenalty[injury.severity] || 0
      
      // Add pain penalty (up to 20% additional reduction)
      totalPenalty += (injury.pain / 100) * 20
    }
    
    return Math.max(0, 100 - totalPenalty)
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

  /**
   * Calculates realistic movement speed (m/s) based on strength, weight, armor, injuries, and experience.
   * - Base speed: determined by strength and experience
   * - Armor penalty: heavier armor reduces speed (diminishing returns)
   * - Weight penalty: heavier units move slower, lighter units move faster
   * - Leg injuries: directly reduce speed (multiplicative)
   * - Experience: more experienced units move more efficiently (modest effect)
   */
  getMovementSpeed(): number {
    // Base speed: 1.5 m/s + 0.03 * strength + 0.01 * experience * 100
    // (1.5 m/s is a brisk walk, 3 m/s is a run)
    const baseSpeed = 1.5 + 0.03 * this.strength + 0.01 * this.experience * 100;

    // Armor penalty: each 10kg of armor reduces speed by 15%
    const armorPenalty = 1 - 0.015 * this.armor.getTotalWeight();

    // Weight penalty: 70kg is neutral; heavier is slower, lighter is faster
    const weightPenalty = 1 - 0.005 * (this.weight - 70);

    // Leg injuries: if either leg is badly injured, speed drops sharply
    const leftLegFunc = this.getBodyPartFunctionality('leftLeg');
    const rightLegFunc = this.getBodyPartFunctionality('rightLeg');
    const injuryPenalty = Math.min(leftLegFunc, rightLegFunc) / 100;

    // Final speed calculation
    let speed = baseSpeed * armorPenalty * weightPenalty * injuryPenalty;
    if (speed < 0.1) speed = 0.1; // Clamp to minimum
    return speed;
  }
}
