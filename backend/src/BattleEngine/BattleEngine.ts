import { Logger } from '../utils/Logger.js';

/**
 * Represents a unit in the battle
 */
export interface Unit {
  id: number;
  name: string;
  health: number;
  attack: number;
  defense: number;
  team: number;
}

/**
 * Result of a battle simulation
 */
export interface BattleResult {
  winner?: string;
  duration: number;
  events: string[];
}

/**
 * BattleEngine class responsible for simulating battles and generating events
 */
export class BattleEngine {
  private units: Unit[];
  private logger: Logger;
  private isActive: boolean = false;
  private currentTime: number = 0;
  private readonly TURN_INTERVAL = 0.1; // 100ms per turn

  /**
   * Creates a new BattleEngine instance
   * @param units - Array of units participating in the battle
   * @param logger - Logger instance to record battle events
   */
  constructor(units: Unit[], logger: Logger) {
    this.units = units;
    this.logger = logger;
  }

  /**
   * Starts a new battle simulation
   */
  start(): void {
    this.isActive = true;
    this.currentTime = 0;
    this.logger.clear();
    this.logger.log('Battle started');
    
    // Log initial unit status
    this.units.forEach(unit => {
      this.logger.log(`${unit.name} enters the battle with ${unit.health} health`);
    });
  }

  /**
   * Updates the battle state by one turn
   * @returns true if battle is still active, false if ended
   */
  update(): boolean {
    if (!this.isActive) return false;

    this.currentTime += this.TURN_INTERVAL;
    this.logger.setTime(this.currentTime);

    // Each unit takes action
    this.units.forEach(unit => {
      if (unit.health <= 0) return;

      // Find target from opposite team
      const target = this.findTarget(unit);
      if (target) {
        this.processAttack(unit, target);
      }
    });

    // Check if battle should end
    this.checkBattleEnd();

    return this.isActive;
  }

  /**
   * Runs the complete battle simulation
   * @returns Battle result including winner and duration
   */
  runBattle(): BattleResult {
    this.start();

    // Run battle until it ends or max duration reached
    while (this.isActive && this.currentTime < 30) { // Max 30 seconds
      this.update();
    }

    const winner = this.determineWinner();
    if (winner) {
      this.logger.log(`${winner} wins the battle!`);
    } else {
      this.logger.log('Battle ends in a draw!');
    }

    return {
      winner: winner,
      duration: this.currentTime,
      events: this.logger.getEvents()
    };
  }

  /**
   * Finds a target for the given unit from the opposite team
   */
  private findTarget(unit: Unit): Unit | undefined {
    return this.units.find(u => 
      u.team !== unit.team && 
      u.health > 0
    );
  }

  /**
   * Processes an attack between two units
   */
  private processAttack(attacker: Unit, defender: Unit): void {
    this.logger.log(`${attacker.name} attacks ${defender.name}`);

    // Calculate damage
    const damage = Math.max(0, attacker.attack - defender.defense);
    if (damage > 0) {
      defender.health -= damage;
      this.logger.log(`${attacker.name} hits ${defender.name} for ${damage} damage`);
      
      if (defender.health <= 0) {
        defender.health = 0;
        this.logger.log(`${defender.name} has been defeated!`);
      }
    } else {
      this.logger.log(`${defender.name} blocks the attack`);
    }
  }

  /**
   * Checks if the battle should end
   */
  private checkBattleEnd(): void {
    const team1Alive = this.units.some(u => u.team === 1 && u.health > 0);
    const team2Alive = this.units.some(u => u.team === 2 && u.health > 0);

    if (!team1Alive || !team2Alive) {
      this.isActive = false;
    }
  }

  /**
   * Determines the winner of the battle
   */
  private determineWinner(): string | undefined {
    const team1Alive = this.units.filter(u => u.team === 1 && u.health > 0);
    const team2Alive = this.units.filter(u => u.team === 2 && u.health > 0);

    if (team1Alive.length > 0 && team2Alive.length === 0) {
      return 'Team 1';
    } else if (team2Alive.length > 0 && team1Alive.length === 0) {
      return 'Team 2';
    }
    return undefined;
  }
} 