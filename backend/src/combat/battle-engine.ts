import { Unit } from '../units/unit.js';
import { Action, ActionTarget } from '../units/actions/action.js';
import { BodyPartType } from '../units/actions/body-part.js';
import { ParallelActionManager } from '../units/actions/parallel-action-manager.js';
import { BattleLogger, LogLevel } from './battle-logger.js';
import { Position } from '../common/position.js';
import { Injuries } from '../injuries/injuries.js';

export interface BattleState {
  units: Unit[];
  isActive: boolean;
  startTime: number;
  currentTime: number;
}

export interface BattleResult {
  winner: Unit | undefined;
  logger: BattleLogger;
  duration: number;
  logLevel: LogLevel;
}

export class BattleEngine {
  private battleState: BattleState;
  private logger: BattleLogger;
  private actionManagers: Map<number, ParallelActionManager>; // Unit ID -> Action Manager
  private readonly TURN_INTERVAL = 0.1; // 100ms intervals for realistic reaction time
  private readonly ATTACK_RANGE = 1.0; // 1 meter range for melee combat

  constructor(units: Unit[], logLevel: LogLevel = 'actions') {
    this.battleState = {
      units,
      isActive: true,
      startTime: 0,
      currentTime: 0
    };
    this.logger = new BattleLogger(logLevel);
    this.actionManagers = new Map(
      units.map(unit => [unit.id, new ParallelActionManager()])
    );
  }

  /**
   * Starts a new battle
   */
  start(): void {
    this.battleState.startTime = 0;
    this.battleState.currentTime = 0;
    this.battleState.isActive = true;
    this.logger.clear();
    this.logger.logBattleStart(this.battleState.units);
  }

  /**
   * Updates the battle state by one turn interval
   * Returns true if battle is still active, false if it has ended
   */
  update(): boolean {
    if (!this.battleState.isActive) return false;

    this.executeCombatTurn();
    this.battleState.currentTime += this.TURN_INTERVAL;
    this.logger.setTime(this.battleState.currentTime);
    
    // Check for battle end conditions
    this.checkBattleEnd();

    return this.battleState.isActive;
  }

  /**
   * Runs a complete battle simulation immediately
   */
  runBattle(): BattleResult {
    this.start();

    // Run for at least 5 seconds to allow units to close distance and engage
    let minDuration = 5.0;
    while (this.battleState.currentTime < minDuration) {
      this.update();
    }

    // Continue until battle ends or max duration reached
    while (this.battleState.isActive && this.battleState.currentTime < 60) { // Max 1 minute
      this.update();
    }

    const winner = this.determineWinner();
    this.logger.logBattleEnd(winner);

    return {
      winner,
      logger: this.logger,
      duration: this.battleState.currentTime,
      logLevel: this.logger.logLevel
    };
  }

  /**
   * Gets the current battle state
   */
  getBattleState(): BattleState {
    return { ...this.battleState };
  }

  /**
   * Gets the battle logger
   */
  getLogger(): BattleLogger {
    return this.logger;
  }

  /**
   * Executes a single combat turn with unit decision making and action resolution
   */
  private executeCombatTurn(): void {
    // Update all units
    for (const unit of this.battleState.units) {
      const wasAlive = unit.body.isAlive();
      
      // Update unit state
      unit.update(this.TURN_INTERVAL);
      this.logger.logStatChanges(unit);

      // Check if unit died during update
      if (wasAlive && !unit.body.isAlive()) {
        this.logger.logDeath(unit, 'Fatal injuries');
      }

      if (!unit.body.isAlive()) continue;

      // Get action manager for this unit
      const actionManager = this.actionManagers.get(unit.id)!;

      // Update ongoing actions
      const completedActions = actionManager.update(this.TURN_INTERVAL);
      
      // Process completed actions
      for (const [bodyPart, action] of completedActions) {
        this.resolveCompletedAction(unit, bodyPart, action);
      }

      // Make decisions and start new actions if possible
      if (unit.body.isConscious()) {
        this.decideActions(unit, actionManager);
      }
    }
  }

  /**
   * Unit decides what actions to take based on current situation
   */
  private decideActions(unit: Unit, actionManager: ParallelActionManager): void {
    // Find nearest enemy
    const nearestEnemy = this.findNearestEnemy(unit);
    if (!nearestEnemy) return;

    const distance = unit.position.distanceTo(nearestEnemy.position);
    const direction = unit.position.directionTo(nearestEnemy.position);

    // Head tracking
    if (Math.abs(direction - unit.direction) > 0.1) {
      if (actionManager.startAction('rotate', BodyPartType.HEAD, { direction }, undefined, this.battleState.currentTime)) {
        unit.combat.drainStamina(5); // Small stamina cost for rotation
      }
    }

    // Movement and Combat
    if (distance > this.ATTACK_RANGE + 0.1) { // If clearly out of range, move closer
      // Calculate a point within attack range
      const moveDistance = distance - this.ATTACK_RANGE + 0.1; // Leave 0.1m buffer
      const moveTarget: ActionTarget = {
        position: unit.position.moveTowards(nearestEnemy.position, moveDistance)
      };

      if (unit.combat.stamina >= 10 && unit.combat.canPerformAction('move')) { // Check stamina before starting
        if (actionManager.startAction('move', BodyPartType.LEFT_LEG, moveTarget, undefined, this.battleState.currentTime)) {
          unit.combat.drainStamina(5); // Drain per leg
        }
        if (actionManager.startAction('move', BodyPartType.RIGHT_LEG, moveTarget, undefined, this.battleState.currentTime)) {
          unit.combat.drainStamina(5);
        }
      }
    } else if (distance <= this.ATTACK_RANGE) { // If in range, attack
      const attackTarget: ActionTarget = { unit: nearestEnemy };
      
      // Try attack with both arms if possible
      if (unit.combat.stamina >= 20 && unit.combat.canPerformAction('attack')) { // Check stamina before starting
        if (unit.body.getBodyPartFunctionality(BodyPartType.LEFT_ARM) > 60) {
          if (actionManager.startAction('attack', BodyPartType.LEFT_ARM, attackTarget, undefined, this.battleState.currentTime)) {
            unit.combat.drainStamina(10); // Drain per arm
          }
        }
        if (unit.body.getBodyPartFunctionality(BodyPartType.RIGHT_ARM) > 60) {
          if (actionManager.startAction('attack', BodyPartType.RIGHT_ARM, attackTarget, undefined, this.battleState.currentTime)) {
            unit.combat.drainStamina(10);
          }
        }
      }
    }
  }

  /**
   * Resolves a completed action and its effects
   */
  private resolveCompletedAction(unit: Unit, bodyPart: BodyPartType, action: Action): void {
    switch (action.state.type) {
      case 'attack':
        this.resolveAttack(unit, bodyPart, action);
        break;
      case 'move':
        this.resolveMovement(unit, action);
        break;
      case 'rotate':
        this.resolveRotation(unit, action);
        break;
    }
  }

  /**
   * Resolves an attack action
   */
  private resolveAttack(unit: Unit, bodyPart: BodyPartType, action: Action): void {
    const target = action.state.target?.unit as Unit;
    if (!target || !target.body.isAlive()) return;

    const hitChance = this.calculateHitChance(unit, target, bodyPart);
    const hit = Math.random() < hitChance;

    if (hit) {
      const damage = this.calculateDamage(unit, bodyPart);
      const targetBodyPart = this.chooseTargetBodyPart();
      
      // Create injury based on damage level
      let injuryType;
      if (damage > 70) { // Reduced threshold for fatal injuries
        injuryType = Injuries.getRandomInjuryBySeverity('fatal');
      } else if (damage > 50) { // Reduced threshold for severe injuries
        injuryType = Injuries.getRandomInjuryBySeverity('severe');
      } else if (damage > 30) { // Reduced threshold for moderate injuries
        injuryType = Injuries.getRandomInjuryBySeverity('moderate');
      } else {
        injuryType = Injuries.getRandomInjuryBySeverity('minor');
      }

      const injury = injuryType.createInjury(targetBodyPart);
      target.body.receiveInjury(injury);

      this.logger.logAction(unit, action, target, { hit: true, damage });
      this.logger.logInjury(target, targetBodyPart, injuryType.woundType, injuryType.severity);

      // Check if target died from this attack
      if (!target.body.isAlive()) {
        this.logger.logDeath(target, `Fatal ${injuryType.woundType} to ${targetBodyPart}`);
      }
    } else {
      this.logger.logAction(unit, action, target, { hit: false });
    }

    // Drain stamina for attack
    unit.combat.drainStamina(20); // Increased stamina cost
  }

  /**
   * Resolves a movement action
   */
  private resolveMovement(unit: Unit, action: Action): void {
    const targetPos = action.state.target?.position as Position;
    if (!targetPos) return;

    const moveSpeed = unit.body.getMovementSpeed() * this.TURN_INTERVAL;
    const newPos = unit.position.moveTowards(targetPos, moveSpeed);
    unit.position.x = newPos.x;
    unit.position.y = newPos.y;
    
    this.logger.logAction(unit, action);

    // Drain stamina for movement
    unit.combat.drainStamina(10);
  }

  /**
   * Resolves a rotation action
   */
  private resolveRotation(unit: Unit, action: Action): void {
    const targetDirection = action.state.target?.direction;
    if (targetDirection === undefined) return;

    unit.direction = targetDirection;
    this.logger.logAction(unit, action);
  }

  /**
   * Calculates hit chance based on unit stats and conditions
   */
  private calculateHitChance(unit: Unit, target: Unit, bodyPart: BodyPartType): number {
    const baseChance = 0.7; // Increased base chance to 70%
    const partFunctionality = unit.body.getBodyPartFunctionality(bodyPart) / 100;
    const experienceBonus = unit.combat.experience * 0.3; // Experience has more impact
    const staminaEffect = (unit.combat.stamina / unit.combat.maxStamina) * 0.8 + 0.2; // Stamina has less severe impact
    const targetMovementPenalty = target.body.getMovementSpeed() * 0.15;
    const distancePenalty = Math.max(0, unit.position.distanceTo(target.position) - 1) * 0.1;

    return Math.min(0.95, Math.max(0.2,
      baseChance * partFunctionality * (1 + experienceBonus) * staminaEffect * (1 - targetMovementPenalty - distancePenalty)
    ));
  }

  /**
   * Calculates damage based on unit stats and body part
   */
  private calculateDamage(unit: Unit, bodyPart: BodyPartType): number {
    const baseDamage = 45; // Increased base damage
    const partFunctionality = unit.body.getBodyPartFunctionality(bodyPart) / 100;
    const strengthBonus = (unit.body.strength / 100) * 0.5; // Strength has less impact
    const staminaEffect = (unit.combat.stamina / unit.combat.maxStamina) * 0.7 + 0.3; // Stamina has less severe impact
    const experienceBonus = unit.combat.experience * 0.2; // Experience affects damage

    return Math.round(
      baseDamage * partFunctionality * (1 + strengthBonus + experienceBonus) * staminaEffect
    );
  }

  /**
   * Chooses a random body part to hit based on realistic targeting
   */
  private chooseTargetBodyPart(): BodyPartType {
    const weights = {
      [BodyPartType.HEAD]: 0.1,
      [BodyPartType.TORSO]: 0.3,
      [BodyPartType.LEFT_ARM]: 0.15,
      [BodyPartType.RIGHT_ARM]: 0.15,
      [BodyPartType.LEFT_LEG]: 0.15,
      [BodyPartType.RIGHT_LEG]: 0.15
    };

    const roll = Math.random();
    let cumulative = 0;
    for (const [part, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (roll <= cumulative) {
        return part as BodyPartType;
      }
    }
    return BodyPartType.TORSO; // Fallback
  }

  /**
   * Finds the nearest enemy unit
   */
  private findNearestEnemy(unit: Unit): Unit | null {
    let nearestEnemy: Unit | null = null;
    let nearestDistance = Infinity;

    for (const otherUnit of this.battleState.units) {
      if (otherUnit.id === unit.id || otherUnit.team === unit.team || !otherUnit.body.isAlive()) {
        continue;
      }

      const distance = unit.position.distanceTo(otherUnit.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = otherUnit;
      }
    }

    return nearestEnemy;
  }

  /**
   * Checks if battle should end
   */
  private checkBattleEnd(): void {
    // Count alive units per team
    const aliveByTeam = new Map<number, number>();
    for (const unit of this.battleState.units) {
      if (unit.body.isAlive()) {
        aliveByTeam.set(unit.team, (aliveByTeam.get(unit.team) || 0) + 1);
      }
    }

    // Battle ends if only one or zero teams have units alive
    if (aliveByTeam.size <= 1) {
      this.battleState.isActive = false;
    }
  }

  /**
   * Determines the winner of the battle
   */
  private determineWinner(): Unit | undefined {
    const aliveUnits = this.battleState.units.filter(unit => unit.body.isAlive());
    return aliveUnits.length === 1 ? aliveUnits[0] : undefined;
  }
} 