import { Weapon } from '../weapons/weapon'
import { UnitBody } from './body'

// Stamina costs for different actions
const STAMINA_COSTS = {
  attack: 3,
  heavyAttack: 6,
  move: 1,
  block: 2,
  dodge: 4,
  run: 2
}

// Passive stamina drain rates
const PASSIVE_DRAIN = {
  heavyWeapon: 0.5,
  heavyArmor: 0.3,
  moving: 0.8,
  lowStamina: 0.2
}

// Stamina recovery rates based on activity
const RECOVERY_RATES = {
  resting: 20,        // Standing still, not fighting
  lightActivity: 10,  // Walking, light movement
  fighting: 3,        // During combat (minimal recovery)
  exhausted: 0        // Below 10% stamina (no recovery)
}

// Body part functionality thresholds for actions
const BODY_PART_THRESHOLDS = {
  attack: 10,      // Both arms must be above this to attack
  block: 20,       // Both arms must be above this to block
  move: 15,        // Both legs must be above this to move
  dodge: 25        // Both legs must be above this to dodge
}

/**
 * UnitCombat handles all combat-related mechanics including stamina management,
 * weapon handling, action validation, and combat effectiveness calculations.
 * 
 * This class integrates with UnitBody to check physical capabilities and
 * determines what actions a unit can perform based on their current state.
 */
export class UnitCombat {
  /**
   * Current stamina level (0 to maxStamina)
   * Stamina is consumed by actions and passively drained by equipment/movement
   * When stamina is low, combat effectiveness is reduced
   */
  public stamina: number

  /**
   * Maximum stamina capacity calculated from unit's physical characteristics
   * Higher strength and better conditioning increase max stamina
   * Experience provides additional stamina bonus
   */
  public readonly maxStamina: number

  /**
   * Whether the unit is currently engaged in combat
   * Affects stamina recovery rates and may influence other mechanics
   * Units in combat recover stamina more slowly
   */
  public isInCombat: boolean = false

  /**
   * Current movement state affecting stamina drain and recovery
   * - stationary: No drain, fastest recovery
   * - walking: Light drain, moderate recovery  
   * - running: High drain, reduced recovery
   * - circling: Tactical movement for positioning
   */
  public movementState: 'stationary' | 'walking' | 'running' | 'circling' = 'stationary'

  /**
   * Currently equipped weapon that affects hit rates, stamina drain, and damage
   * Heavy weapons reduce accuracy but deal more damage
   * Null when no weapon is equipped
   */
  private weapon: Weapon | null = null

  /**
   * Creates a new combat system for a unit
   * @param experience - Combat experience (0.0-1.0) affecting weapon handling and stamina
   * @param body - Reference to unit's body for physical capability checks
   */
  constructor(
    public readonly experience: number, // 0.0 to 1.0 (0% to 100%)
    private readonly body: UnitBody
  ) {
    this.maxStamina = this.calculateMaxStamina()
    this.stamina = this.maxStamina
  }

  /**
   * Calculates maximum stamina based on unit's physical characteristics
   * Formula considers weight, strength, experience, and conditioning ratio
   * Well-conditioned units (high strength-to-weight ratio) get bonus stamina
   * @returns Maximum stamina value
   */
  private calculateMaxStamina(): number {
    // Base stamina calculation based on physical characteristics
    const baseStamina = (this.body.weight * 0.8) + (this.body.strength * 0.6)
    
    // Experience bonus (veterans have better conditioning)
    const experienceBonus = this.experience * 20
    
    // Conditioning factor based on strength-to-weight ratio
    const conditioningRatio = this.body.strength / Math.max(this.body.weight, 1)
    const conditioningBonus = Math.min(conditioningRatio * 10, 20) // Cap at 20 bonus
    
    return Math.round(baseStamina + experienceBonus + conditioningBonus)
  }

  /**
   * Equips a weapon for the unit
   * Heavy weapons will increase stamina drain and may reduce hit rates
   * @param weapon - The weapon to equip
   */
  equipWeapon(weapon: Weapon): void {
    this.weapon = weapon
  }

  /**
   * Gets the currently equipped weapon
   * @returns The equipped weapon or null if none equipped
   */
  getWeapon(): Weapon | null {
    return this.weapon
  }

  /**
   * Calculates hit rate modifier based on experience and weapon weight
   * Experienced units handle heavy weapons better
   * Units without weapons have reduced effectiveness
   * @returns Hit rate modifier (0.1 to 1.0)
   */
  getHitRateModifier(): number {
    if (!this.weapon) {
      return 0.5 // Base hit rate without weapon
    }
    
    // Higher experience units are better at handling heavy weapons
    const experienceBonus = this.experience * 0.5 // Max 0.5 bonus at 100% experience
    const weightPenalty = this.weapon.weight * 0.1
    
    return Math.max(0.1, 0.5 + experienceBonus - weightPenalty)
  }

  /**
   * Checks if the unit can effectively wield a given weapon
   * Based on unit's strength and weapon weight
   * @param weapon - The weapon to check
   * @returns True if the unit can wield the weapon
   */
  canWieldWeapon(weapon: Weapon): boolean {
    return this.body.canWieldWeapon(weapon.weight)
  }

  /**
   * Checks if the unit can wear armor of a given weight
   * Based on unit's weight and strength capacity
   * @param armorWeight - Weight of the armor in kg
   * @returns True if the unit can wear the armor
   */
  canWearArmor(armorWeight: number): boolean {
    return this.body.canWearArmor(armorWeight)
  }

  /**
   * Determines if the unit can effectively defend from a given attack angle
   * Experienced units are better at defending from side/back attacks
   * @param angle - Direction of the attack
   * @returns True if the unit can defend from this angle
   */
  canDefendFromAngle(angle: 'front' | 'side' | 'back'): boolean {
    // Higher experience units are better at defending from side/back attacks
    return this.experience > 0.5 // 50% experience threshold
  }

  /**
   * Updates stamina based on current conditions over time
   * Calculates drain from equipment/movement and recovery based on activity
   * @param deltaTime - Time elapsed since last update
   */
  updateStamina(deltaTime: number): void {
    // Calculate drain
    let drain = this.calculateStaminaDrain()
    
    // Calculate recovery
    let recovery = this.calculateStaminaRecovery()
    
    // Apply net change
    const netChange = recovery - drain
    const newStamina = this.stamina + (netChange * deltaTime)
    this.stamina = Math.max(0, Math.min(this.maxStamina, newStamina))
  }

  /**
   * Calculates passive stamina drain from current conditions
   * Heavy weapons, movement, and low stamina all cause drain
   * @returns Total stamina drain per time unit
   */
  private calculateStaminaDrain(): number {
    let drain = 0
    
    // Heavy weapon drain
    if (this.weapon && this.weapon.weight > 5) {
      drain += PASSIVE_DRAIN.heavyWeapon
    }
    
    // Movement drain
    if (this.movementState !== 'stationary') {
      drain += PASSIVE_DRAIN.moving
    }
    
    // Low stamina drain (exhaustion penalty)
    if (this.stamina < this.maxStamina * 0.1) {
      drain += PASSIVE_DRAIN.lowStamina
    }
    
    return drain
  }

  /**
   * Calculates stamina recovery based on current activity and conditioning
   * Resting provides fastest recovery, combat provides minimal recovery
   * Well-conditioned units recover faster
   * @returns Stamina recovery per time unit
   */
  private calculateStaminaRecovery(): number {
    // Too exhausted to recover
    if (this.stamina < this.maxStamina * 0.1) {
      return RECOVERY_RATES.exhausted
    }
    
    // Base recovery rates
    let baseRecovery = 0
    if (this.isInCombat) {
      baseRecovery = RECOVERY_RATES.fighting
    } else if (this.movementState === 'stationary') {
      baseRecovery = RECOVERY_RATES.resting
    } else {
      baseRecovery = RECOVERY_RATES.lightActivity
    }
    
    // Recovery modifier based on conditioning (strength-to-weight ratio)
    const conditioningRatio = this.body.strength / Math.max(this.body.weight, 1)
    const recoveryModifier = 0.7 + (conditioningRatio * 0.6) // 0.7x to 1.3x
    
    // Experience bonus to recovery
    const experienceBonus = this.experience * 5
    
    return Math.max(0, (baseRecovery * recoveryModifier) + experienceBonus)
  }

  /**
   * Sets the unit's current movement state
   * Affects stamina drain and recovery rates
   * @param state - New movement state
   */
  setMovementState(state: 'stationary' | 'walking' | 'running' | 'circling'): void {
    this.movementState = state
  }

  /**
   * Sets whether the unit is currently in combat
   * Affects stamina recovery rates
   * @param inCombat - True if unit is in combat
   */
  setCombatState(inCombat: boolean): void {
    this.isInCombat = inCombat
  }

  /**
   * Calculates overall combat effectiveness as a percentage (0.0 to 1.0)
   * Considers stamina, pain, consciousness, blood loss, and body part functionality
   * Dead or unconscious units have 0 effectiveness
   * @returns Combat effectiveness multiplier
   */
  getCombatEffectiveness(): number {
    if (!this.body.isAlive() || !this.body.isConscious()) {
      return 0
    }
    
    // Base stamina effectiveness
    const staminaPercentage = this.stamina / this.maxStamina
    let effectiveness = 0
    
    if (staminaPercentage > 0.75) effectiveness = 1.0
    else if (staminaPercentage > 0.5) effectiveness = 0.8
    else if (staminaPercentage > 0.25) effectiveness = 0.6
    else if (staminaPercentage > 0.1) effectiveness = 0.3
    else effectiveness = 0.1
    
    // Pain effects
    const totalPain = this.body.getTotalPain()
    const painEffect = 1 - (totalPain / 100) * (1 - this.experience * 0.5)
    
    // Consciousness effects
    const consciousnessEffect = this.body.getConsciousness() / 100
    
    // Blood loss effects
    const bloodLossEffect = 1 - (this.body.getBloodLoss() / 100)
    
    // Body part functionality effects
    const armFunctionality = Math.min(
      this.body.getBodyPartFunctionality('leftArm'),
      this.body.getBodyPartFunctionality('rightArm')
    ) / 100
    
    const legFunctionality = Math.min(
      this.body.getBodyPartFunctionality('leftLeg'),
      this.body.getBodyPartFunctionality('rightLeg')
    ) / 100
    
    // Combine all effects
    return effectiveness * painEffect * consciousnessEffect * bloodLossEffect * armFunctionality * legFunctionality
  }

  /**
   * Checks if the unit can perform a specific action
   * Validates stamina, consciousness, and required body part functionality
   * @param action - The action to check
   * @param options - Optional parameters like handedness for attacks/blocks
   * @returns True if the action can be performed
   */
  canPerformAction(
    action: 'attack' | 'heavyAttack' | 'move' | 'block' | 'dodge' | 'run',
    options?: { handedness?: 'one-handed' | 'two-handed' }
  ): boolean {
    if (!this.body.isAlive() || !this.body.isConscious()) {
      return false
    }
    
    // Check if unit has enough stamina
    const cost = STAMINA_COSTS[action]
    if (this.stamina < cost) {
      return false
    }
    
    // Check body part requirements for specific actions
    switch (action) {
      case 'attack':
      case 'heavyAttack': {
        const handedness = options?.handedness || 'two-handed'
        if (handedness === 'one-handed') {
          // At least one arm must be functional
          return (
            this.body.getBodyPartFunctionality('leftArm') > BODY_PART_THRESHOLDS.attack ||
            this.body.getBodyPartFunctionality('rightArm') > BODY_PART_THRESHOLDS.attack
          )
        } else {
          // Both arms must be functional
          return (
            this.body.getBodyPartFunctionality('leftArm') > BODY_PART_THRESHOLDS.attack &&
            this.body.getBodyPartFunctionality('rightArm') > BODY_PART_THRESHOLDS.attack
          )
        }
      }
      case 'move':
      case 'run':
        // Both legs must be functional
        return (
          this.body.getBodyPartFunctionality('leftLeg') > BODY_PART_THRESHOLDS.move &&
          this.body.getBodyPartFunctionality('rightLeg') > BODY_PART_THRESHOLDS.move
        )
      case 'block': {
        const handedness = options?.handedness || 'two-handed'
        if (handedness === 'one-handed') {
          return (
            this.body.getBodyPartFunctionality('leftArm') > BODY_PART_THRESHOLDS.block ||
            this.body.getBodyPartFunctionality('rightArm') > BODY_PART_THRESHOLDS.block
          )
        } else {
          return (
            this.body.getBodyPartFunctionality('leftArm') > BODY_PART_THRESHOLDS.block &&
            this.body.getBodyPartFunctionality('rightArm') > BODY_PART_THRESHOLDS.block
          )
        }
      }
      case 'dodge':
        // Both legs must be functional
        return (
          this.body.getBodyPartFunctionality('leftLeg') > BODY_PART_THRESHOLDS.dodge &&
          this.body.getBodyPartFunctionality('rightLeg') > BODY_PART_THRESHOLDS.dodge
        )
      default:
        return true
    }
  }

  /**
   * Performs an action if possible, consuming stamina
   * Validates the action can be performed before executing
   * @param action - The action to perform
   * @returns True if the action was successfully performed
   */
  performAction(action: 'attack' | 'heavyAttack' | 'move' | 'block' | 'dodge' | 'run'): boolean {
    if (!this.canPerformAction(action)) {
      return false
    }
    
    const cost = STAMINA_COSTS[action]
    this.stamina = Math.max(0, this.stamina - cost)
    return true
  }
} 