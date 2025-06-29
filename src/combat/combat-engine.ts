// Combat Engine - Handles real-time battle mechanics and unit interactions

import { Injuries } from '../injuries/injuries.js'
import { InjurySeverity } from '../injuries/injury.js'
import { Unit } from '../units/unit.js'
import { BodyPart } from '../units/body.js'
import { Weapon } from '../weapons/weapon.js'
import { BattleLogger } from './battle-logger.js'

export interface CombatResult {
  hit: boolean
  blocked: boolean
  dodged: boolean
  fatal: boolean
  damage: number
  injury?: any
}

export interface CombatAction {
  type: 'attack' | 'block' | 'dodge' | 'defend' | 'move'
  target?: Unit
  style?: 'normal' | 'heavy' | 'quick'
  direction?: 'front' | 'side' | 'back'
  handedness?: 'one-handed' | 'two-handed'
}

export interface BattleState {
  units: Unit[]
  isActive: boolean
  startTime: number
  currentTime: number
}

export class CombatEngine {
  private battleState: BattleState
  private logger: BattleLogger
  private readonly TURN_INTERVAL = 0.1 // 100ms intervals for realistic reaction time

  constructor(units: Unit[]) {
    this.battleState = {
      units,
      isActive: true,
      startTime: 0,
      currentTime: 0
    }
    this.logger = new BattleLogger()
  }

  /**
   * Runs a complete battle simulation
   * @param logLevel - Level of detail for event logging
   * @returns Battle result with winner and events
   */
  runBattle(logLevel: 'summary' | 'events' | 'detailed' = 'events'): BattleResult {
    this.battleState.startTime = Date.now()
    this.battleState.currentTime = 0
    this.logger.clear()

    this.logger.setTime(this.battleState.currentTime)
    this.logger.log(`Battle started between ${this.battleState.units.length} units`)

    while (this.battleState.isActive && this.battleState.currentTime < 300) { // Max 5 minutes
      this.executeCombatTurn()
      this.battleState.currentTime += this.TURN_INTERVAL
      this.logger.setTime(this.battleState.currentTime)
      
      // Check for battle end conditions
      this.checkBattleEnd()
    }

    const winner = this.determineWinner()
    this.logger.log(`Battle ended - ${winner ? 'Unit victorious' : 'Draw'}`)

    return {
      winner,
      logger: this.logger,
      duration: this.battleState.currentTime,
      logLevel
    }
  }

  /**
   * Executes a single combat turn with unit decision making and action resolution
   */
  private executeCombatTurn(): void {
    const [unitA, unitB] = this.battleState.units

    if (!unitA.body.isAlive() || !unitB.body.isAlive()) return

    // Unit A decides action
    const actionA = this.decideAction(unitA, unitB)
    
    // Unit B sees Unit A's action and can react
    const actionB = this.decideReaction(unitB, unitA, actionA)

    // Resolve both actions simultaneously
    this.resolveActions(unitA, actionA, unitB, actionB)

    // Update unit states
    this.updateUnits()
  }

  /**
   * Unit decides what action to take based on current situation
   */
  private decideAction(unit: Unit, enemy: Unit): CombatAction {
    // If enemy is attacking, consider defensive actions
    if (this.isEnemyAttacking(enemy)) {
      if (unit.combat.canPerformAction('block') && unit.combat.experience > 0.3) {
        return { type: 'block', target: enemy }
      }
      if (unit.combat.canPerformAction('dodge') && unit.combat.stamina > 15) {
        return { type: 'dodge', direction: 'side' }
      }
    }

    // If we're in good position, attack
    if (unit.combat.canPerformAction('attack') && unit.combat.stamina > 10) {
      const style = unit.combat.stamina > 30 ? 'normal' : 'quick'
      return { 
        type: 'attack', 
        target: enemy, 
        style,
        handedness: 'one-handed' // Default to one-handed for now
      }
    }

    // If low stamina, try to recover
    if (unit.combat.stamina < 20) {
      return { type: 'defend' }
    }

    // Default to defensive stance
    return { type: 'defend' }
  }

  /**
   * Unit reacts to enemy's action based on reaction time and experience
   */
  private decideReaction(unit: Unit, enemy: Unit, enemyAction: CombatAction): CombatAction {
    // Calculate reaction time based on experience
    const reactionTime = this.calculateReactionTime(unit)
    
    // If enemy is attacking and we can react in time
    if (enemyAction.type === 'attack' && reactionTime < this.TURN_INTERVAL) {
      if (unit.combat.canPerformAction('block') && unit.combat.experience > 0.2) {
        return { type: 'block', target: enemy }
      }
      if (unit.combat.canPerformAction('dodge') && unit.combat.stamina > 10) {
        return { type: 'dodge', direction: 'back' }
      }
    }

    // Otherwise, continue with planned action
    return this.decideAction(unit, enemy)
  }

  /**
   * Resolves both units' actions simultaneously
   */
  private resolveActions(unitA: Unit, actionA: CombatAction, unitB: Unit, actionB: CombatAction): void {
    // Handle blocking first
    if (actionA.type === 'attack' && actionB.type === 'block') {
      this.resolveAttackVsBlock(unitA, actionA, unitB, actionB)
    } else if (actionB.type === 'attack' && actionA.type === 'block') {
      this.resolveAttackVsBlock(unitB, actionB, unitA, actionA)
    }
    // Handle dodging
    else if (actionA.type === 'attack' && actionB.type === 'dodge') {
      this.resolveAttackVsDodge(unitA, actionA, unitB, actionB)
    } else if (actionB.type === 'attack' && actionA.type === 'dodge') {
      this.resolveAttackVsDodge(unitB, actionB, unitA, actionA)
    }
    // Handle mutual attacks
    else if (actionA.type === 'attack' && actionB.type === 'attack') {
      this.resolveMutualAttack(unitA, actionA, unitB, actionB)
    }
    // Handle single attacks
    else if (actionA.type === 'attack') {
      this.resolveSingleAttack(unitA, actionA, unitB)
    } else if (actionB.type === 'attack') {
      this.resolveSingleAttack(unitB, actionB, unitA)
    }
    // Handle defensive actions
    else {
      this.resolveDefensiveActions(unitA, actionA, unitB, actionB)
    }
  }

  /**
   * Resolves attack vs block interaction
   */
  private resolveAttackVsBlock(attacker: Unit, attackAction: CombatAction, blocker: Unit, blockAction: CombatAction): void {
    const hitRate = this.calculateHitRate(attacker, blocker, attackAction)
    const blockSuccess = this.calculateBlockSuccess(blocker, attackAction)
    
    if (Math.random() < hitRate) {
      if (blockSuccess) {
        // Attack hits but is blocked
        const damage = this.calculateDamage(attacker, attackAction) * 0.3 // Reduced damage
        this.applyDamage(attacker, blocker, damage, false)
        this.logger.log(`${attacker.name}#${attacker.id} attacks ${blocker.name}#${blocker.id}, but attack is blocked`)
      } else {
        // Attack hits and isn't blocked
        const damage = this.calculateDamage(attacker, attackAction)
        this.applyDamage(attacker, blocker, damage, true)
        this.logger.log(`${attacker.name}#${attacker.id} attacks ${blocker.name}#${blocker.id}, hits for ${Math.round(damage)} damage`)
      }
    } else {
      this.logger.log(`${attacker.name}#${attacker.id} attacks ${blocker.name}#${blocker.id}, but misses`)
    }
  }

  /**
   * Resolves attack vs dodge interaction
   */
  private resolveAttackVsDodge(attacker: Unit, attackAction: CombatAction, dodger: Unit, dodgeAction: CombatAction): void {
    const hitRate = this.calculateHitRate(attacker, dodger, attackAction)
    const dodgeSuccess = this.calculateDodgeSuccess(dodger, attackAction)
    
    if (Math.random() < hitRate && !dodgeSuccess) {
      const damage = this.calculateDamage(attacker, attackAction)
      this.applyDamage(attacker, dodger, damage, true)
      this.logger.log(`${attacker.name}#${attacker.id} attacks ${dodger.name}#${dodger.id}, hits for ${Math.round(damage)} damage`)
    } else {
      this.logger.log(`${attacker.name}#${attacker.id} attacks ${dodger.name}#${dodger.id}, but ${dodger.combat.experience > 0.5 ? 'Veteran' : 'Novice'} dodges`)
    }
  }

  /**
   * Resolves mutual attack (both units attack each other)
   */
  private resolveMutualAttack(unitA: Unit, actionA: CombatAction, unitB: Unit, actionB: CombatAction): void {
    const hitRateA = this.calculateHitRate(unitA, unitB, actionA)
    const hitRateB = this.calculateHitRate(unitB, unitA, actionB)
    
    const hitA = Math.random() < hitRateA
    const hitB = Math.random() < hitRateB
    
    if (hitA) {
      const damageA = this.calculateDamage(unitA, actionA)
      this.applyDamage(unitA, unitB, damageA, true)
      this.logger.log(`${unitA.name}#${unitA.id} attacks ${unitB.name}#${unitB.id}, hits for ${Math.round(damageA)} damage`)
    } else {
      this.logger.log(`${unitA.name}#${unitA.id} attacks ${unitB.name}#${unitB.id}, but misses`)
    }
    
    if (hitB) {
      const damageB = this.calculateDamage(unitB, actionB)
      this.applyDamage(unitB, unitA, damageB, true)
      this.logger.log(`${unitB.name}#${unitB.id} attacks ${unitA.name}#${unitA.id}, hits for ${Math.round(damageB)} damage`)
    } else {
      this.logger.log(`${unitB.name}#${unitB.id} attacks ${unitA.name}#${unitA.id}, but misses`)
    }
  }

  /**
   * Resolves single attack (one unit attacks, other defends)
   */
  private resolveSingleAttack(attacker: Unit, attackAction: CombatAction, defender: Unit): void {
    const hitRate = this.calculateHitRate(attacker, defender, attackAction)
    
    if (Math.random() < hitRate) {
      const damage = this.calculateDamage(attacker, attackAction)
      this.applyDamage(attacker, defender, damage, true)
      this.logger.log(`${attacker.name}#${attacker.id} attacks ${defender.name}#${defender.id}, hits for ${Math.round(damage)} damage`)
    } else {
      this.logger.log(`${attacker.name}#${attacker.id} attacks ${defender.name}#${defender.id}, but misses`)
    }
  }

  /**
   * Resolves defensive actions (both units defending, moving, etc.)
   */
  private resolveDefensiveActions(unitA: Unit, actionA: CombatAction, unitB: Unit, actionB: CombatAction): void {
    // Both units are being defensive, just log their actions
    if (actionA.type === 'defend') {
      this.logger.log(`${unitA.name}#${unitA.id} takes defensive stance`)
    }
    if (actionB.type === 'defend') {
      this.logger.log(`${unitB.name}#${unitB.id} takes defensive stance`)
    }
  }

  /**
   * Calculates hit rate based on weapon, experience, and target
   */
  private calculateHitRate(attacker: Unit, target: Unit, action: CombatAction): number {
    let baseHitRate = 0.7 // Base 70% hit rate
    
    // Weapon modifier
    const weapon = attacker.combat.getWeapon()
    if (weapon) {
      baseHitRate *= attacker.combat.getHitRateModifier()
    } else {
      baseHitRate *= 0.5 // No weapon penalty
    }
    
    // Experience bonus
    baseHitRate += attacker.combat.experience * 0.2
    
    // Target experience (more experienced targets are harder to hit)
    baseHitRate -= target.combat.experience * 0.1
    
    // Stamina effect
    const staminaEffect = attacker.combat.stamina / attacker.combat.maxStamina
    baseHitRate *= (0.5 + staminaEffect * 0.5)
    
    return Math.max(0.1, Math.min(0.95, baseHitRate))
  }

  /**
   * Calculates damage based on weapon, strength, and attack style
   */
  private calculateDamage(attacker: Unit, action: CombatAction): number {
    let baseDamage = 30 // Base damage
    
    // Weapon damage calculation
    const weapon = attacker.combat.getWeapon()
    if (weapon) {
      // Calculate damage based on weapon characteristics
      const primaryDamageType = weapon.getPrimaryDamageType()
      
      switch (primaryDamageType) {
        case 'cutting':
          baseDamage = 40 + (weapon.edgeSharpness * 30) // 40-70 damage
          break
        case 'piercing':
          baseDamage = 35 + (weapon.pointGeometry * 25) // 35-60 damage
          break
        case 'blunt':
          baseDamage = 45 + (weapon.impactArea / 20) // 45-65 damage
          break
      }
      
      // Weight affects damage (heavier weapons do more damage)
      baseDamage += weapon.weight * 2
    }
    
    // Strength modifier
    baseDamage *= (0.5 + attacker.body.strength / 100)
    
    // Attack style modifier
    if (action.style === 'heavy') {
      baseDamage *= 1.5
    } else if (action.style === 'quick') {
      baseDamage *= 0.7
    }
    
    // Experience bonus
    baseDamage *= (1 + attacker.combat.experience * 0.3)
    
    return Math.round(baseDamage)
  }

  /**
   * Calculates block success chance
   */
  private calculateBlockSuccess(blocker: Unit, attackAction: CombatAction): boolean {
    const blockChance = 0.3 + blocker.combat.experience * 0.4 // 30-70% based on experience
    return Math.random() < blockChance
  }

  /**
   * Calculates dodge success chance
   */
  private calculateDodgeSuccess(dodger: Unit, attackAction: CombatAction): boolean {
    const dodgeChance = 0.2 + dodger.combat.experience * 0.3 // 20-50% based on experience
    return Math.random() < dodgeChance
  }

  /**
   * Calculates reaction time based on experience
   */
  private calculateReactionTime(unit: Unit): number {
    // Base reaction time 0.2s, reduced by experience
    return 0.2 - (unit.combat.experience * 0.15) // 0.05s to 0.2s
  }

  /**
   * Applies damage and creates injury
   */
  private applyDamage(attacker: Unit, target: Unit, damage: number, createInjury: boolean): void {
    if (createInjury) {
      const injury = this.createInjury(damage, attacker.combat.getWeapon())
      target.body.receiveInjury(injury)
    }
  }

  /**
   * Creates an injury based on damage and weapon
   */
  private createInjury(damage: number, weapon: Weapon | null): any {
    const bodyParts: BodyPart[] = ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg']
    const bodyPart = bodyParts[Math.floor(Math.random() * bodyParts.length)]
    
    // Determine severity based on damage
    let severity: InjurySeverity = 'minor'
    if (damage > 80) severity = 'fatal'
    else if (damage > 60) severity = 'critical'
    else if (damage > 40) severity = 'severe'
    else if (damage > 20) severity = 'moderate'

    // Determine wound type based on weapon's primary damage type
    let woundType: 'cut' | 'stab' | 'crush' | 'amputation' = 'cut'
    if (weapon) {
      const primaryDamageType = weapon.getPrimaryDamageType()
      switch (primaryDamageType) {
        case 'cutting':
          woundType = 'cut'
          break
        case 'piercing':
          woundType = 'stab'
          break
        case 'blunt':
          woundType = 'crush'
          break
      }
    }
    
    // Handle amputation for fatal limb injuries (overrides weapon type)
    if (severity === 'fatal' && (bodyPart === 'leftArm' || bodyPart === 'rightArm' || bodyPart === 'leftLeg' || bodyPart === 'rightLeg')) {
      woundType = 'amputation'
    }

    // Get appropriate injury type based on severity and wound type
    const availableInjuries = Injuries.getInjuriesBySeverity(severity)
      .filter(injury => injury.woundType === woundType)
    
    if (availableInjuries.length === 0) {
      throw new Error(`No injuries found for severity: ${severity} and woundType: ${woundType}`)
    }

    // Select random injury from available options
    const selectedInjury = availableInjuries[Math.floor(Math.random() * availableInjuries.length)]
    return selectedInjury.createInjury(bodyPart)
  }

  /**
   * Checks if enemy is currently attacking
   */
  private isEnemyAttacking(enemy: Unit): boolean {
    // For now, assume enemy might be attacking
    // In a more complex system, we'd track enemy's last action
    return Math.random() < 0.3 // 30% chance enemy is attacking
  }

  /**
   * Updates all units (stamina, injuries, etc.)
   */
  private updateUnits(): void {
    this.battleState.units.forEach(unit => {
      unit.update(this.TURN_INTERVAL)
    })
  }

  /**
   * Checks if battle should end
   */
  private checkBattleEnd(): void {
    const aliveUnits = this.battleState.units.filter(unit => unit.body.isAlive())
    if (aliveUnits.length <= 1) {
      this.battleState.isActive = false
    }
  }

  /**
   * Determines the winner of the battle
   */
  private determineWinner(): Unit | null {
    const aliveUnits = this.battleState.units.filter(unit => unit.body.isAlive())
    return aliveUnits.length === 1 ? aliveUnits[0] : null
  }
}

export interface BattleResult {
  winner: Unit | null
  logger: BattleLogger
  duration: number
  logLevel: string
} 