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
import { Position } from '../common/position.js'
import { ActionType, Action } from './action';

export type BodyPart = 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'head';

/**
 * Unit represents a complete combatant with integrated body and combat systems.
 * It manages the relationship between physical state, equipment, and combat capabilities.
 */
export class Unit {
  public readonly id: number
  public readonly name: string
  public readonly body: UnitBody
  public readonly combat: UnitCombat
  public position: Position
  public direction: number = 0 // radians, 0 = facing right (x+)

  /**
   * Current action for each body part (null if idle)
   */
  public bodyPartActions: Partial<Record<BodyPart, Action | null>> = {}

  /**
   * Team identifier (e.g., 1 or 2)
   */
  public readonly team: number;

  public movementAction: Action | null = null;

  /**
   * Creates a new unit with specified physical characteristics
   * @param id - Unique identifier for the unit
   * @param name - Display name for the unit
   * @param experience - Combat experience (0.0-1.0) affecting weapon handling, stamina, shock resistance, and pain resistance
   * @param weight - Unit weight (0-200) affecting movement and armor capacity
   * @param strength - Physical strength (0-100) affecting damage and equipment capacity
   * @param position - Initial position of the unit
   * @param team - Team identifier (e.g., 1 or 2)
   */
  constructor(
    id: number,
    name: string,
    experience: number,
    weight: number,
    strength: number,
    position: Position = new Position(0, 0),
    team: number = 1 // default to team 1
  ) {
    this.id = id
    this.name = name
    this.body = new UnitBody(weight, strength, experience)
    this.combat = new UnitCombat(experience, this.body)
    this.position = position
    this.team = team
    // direction defaults to 0 (facing right)
  }

  /**
   * Move towards a target position, updating position and direction
   */
  moveTowards(target: Position, deltaTime: number) {
    const distance = this.position.distanceTo(target)
    if (distance === 0) return
    // Update facing direction
    this.direction = this.position.directionTo(target)
    // Move up to max possible distance this tick
    const maxMove = this.body.getMovementSpeed() * deltaTime
    if (distance <= maxMove) {
      this.position = new Position(target.x, target.y)
    } else {
      this.position = this.position.moveTowards(target, maxMove)
    }
  }

  /**
   * Update the unit's state over time
   * If movementTarget is set, move towards it
   */
  update(deltaTime: number, currentTime?: number): void {
    update(deltaTime: number): void {
      if(this.movementTarget) {
      this.moveTowards(this.movementTarget, deltaTime)
      // If reached target, clear it
      if (this.position.distanceTo(this.movementTarget) < 0.01) {
        this.movementTarget = null
      }
    }

    // Update injuries and stamina
    this.body.updateInjuries(deltaTime)
    this.combat.updateStamina(deltaTime)

    /**
     * Calculates reaction time in seconds based on experience, fatigue, and injuries
     * @returns Reaction time in seconds
     */
    getReactionTime(): number {
      // Base reaction time for combat (choice reaction)
      const baseReactionTime = 0.28 // 280ms base for combat decisions

      // Experience can improve reaction time up to 20%
      const experienceBonus = this.combat.experience * 0.2

      // Fatigue increases reaction time up to 50%
      const fatiguePenalty = (1 - this.combat.stamina / this.combat.maxStamina) * 0.5

      // Head injuries and blood loss affect reaction time
      const headFunctionality = this.body.getBodyPartFunctionality('head') / 100
      const bloodLossPenalty = this.body.getBloodLoss() / 100 * 0.3 // Up to 30% slower

      // Calculate final reaction time
      const reactionTime = baseReactionTime *
        (1 - experienceBonus) * // Experience bonus
        (1 + fatiguePenalty) *  // Fatigue penalty
        (2 - headFunctionality) * // Head injury effect
        (1 + bloodLossPenalty)   // Blood loss effect

      // Clamp between realistic minimum and maximum
      return Math.max(0.22, Math.min(0.6, reactionTime))
    }
  } 