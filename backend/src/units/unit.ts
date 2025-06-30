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

  public position: Position
  public direction: number = 0 // radians, 0 = facing right (x+)
  public movementTarget: Position | null = null
  public movementSpeed: number = 5 // units per second (example default)

  /**
   * Creates a new unit with specified physical characteristics
   * @param id - Unique identifier for the unit
   * @param name - Display name for the unit
   * @param experience - Combat experience (0.0-1.0) affecting weapon handling, stamina, shock resistance, and pain resistance
   * @param weight - Unit weight (0-200) affecting movement and armor capacity
   * @param strength - Physical strength (0-100) affecting damage and equipment capacity
   * @param position - Initial position of the unit
   */
  constructor(
    id: number,
    name: string,
    experience: number,
    weight: number,
    strength: number,
    position: Position = new Position(0, 0)
  ) {
    this.id = id
    this.name = name
    this.body = new UnitBody(weight, strength, experience)
    this.combat = new UnitCombat(experience, this.body)
    this.position = position
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
    const maxMove = this.movementSpeed * deltaTime
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
  update(deltaTime: number): void {
    if (this.movementTarget) {
      this.moveTowards(this.movementTarget, deltaTime)
      // If reached target, clear it
      if (this.position.distanceTo(this.movementTarget) < 0.01) {
        this.movementTarget = null
      }
    }
    this.body.updateInjuries(deltaTime)
    this.combat.updateStamina(deltaTime)
  }
} 