/**
 * Unit represents a complete combatant with physical characteristics, combat abilities,
 * and equipment. It integrates the body system (injuries, consciousness) with the
 * combat system (stamina, actions) to create a realistic battle simulation entity.
 * 
 * Each unit has unique physical attributes that affect their combat performance,
 * equipment capacity, and injury resistance. The unit coordinates between different
 * systems to determine what actions are possible and how effective they are.
 */

import { UnitBody } from './body.js'
import { UnitCombat } from './combat.js'

export type BodyPart = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg'

export type InjurySeverity = 'minor' | 'moderate' | 'severe' | 'critical' | 'fatal'

export interface Injury {
  bodyPart: BodyPart
  severity: InjurySeverity
  damage: number // 0-100, reduces body part functionality
  bleeding: number // 0-100, causes blood loss over time
  pain: number // 0-100, affects combat effectiveness
  shock: number // 0-100, affects consciousness
  isFatal: boolean
  timeToDeath?: number // seconds until death for fatal injuries
  permanentDamage?: number // 0-100, permanent reduction in functionality
}

/**
 * Unit represents a complete combatant with integrated body and combat systems.
 * It manages the relationship between physical state, equipment, and combat capabilities.
 */
export class Unit {
  /**
   * Unique identifier for the unit
   */
  public readonly id: number

  /**
   * Display name for the unit
   */
  public readonly name: string

  /**
   * Physical body system managing injuries, consciousness, and armor
   * Handles injury effects, body part functionality, and equipment capacity
   */
  public readonly body: UnitBody

  /**
   * Combat system managing stamina, actions, and combat effectiveness
   * Handles weapon wielding, action validation, and performance calculations
   */
  public readonly combat: UnitCombat

  /**
   * Creates a new unit with specified physical characteristics
   * @param id - Unique identifier for the unit
   * @param name - Display name for the unit
   * @param experience - Combat experience (0.0-1.0) affecting weapon handling, stamina, shock resistance, and pain resistance
   * @param weight - Unit weight (0-200) affecting movement and armor capacity
   * @param strength - Physical strength (0-100) affecting damage and equipment capacity
   */
  constructor(
    id: number,
    name: string,
    experience: number,
    weight: number,
    strength: number
  ) {
    this.id = id
    this.name = name
    this.body = new UnitBody(weight, strength, experience)
    this.combat = new UnitCombat(experience, this.body)
  }

  /**
   * Updates the unit's state over time
   * Processes injury effects, stamina changes, and consciousness updates
   * @param deltaTime - Time elapsed since last update
   */
  update(deltaTime: number): void {
    this.body.updateInjuries(deltaTime)
    this.combat.updateStamina(deltaTime)
  }
} 