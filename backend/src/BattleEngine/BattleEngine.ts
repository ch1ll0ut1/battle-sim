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

type State = 'initialized' | 'paused' | 'running' | 'finished';

/**
 * BattleEngine class responsible for simulating battles and generating events
 * Simulation flow is handled by SimulationController (for controllable server) & runBattle() (for CLI)
 */
export class BattleEngine {
    state: State = 'initialized';
    private units: Unit[];
    private logger: Logger;
    private currentTime: number = 0;
    private readonly TURN_INTERVAL = 0.1; // 100ms per turn
    private teams: Record<number, Unit[]> = {};

    /**
     * Creates a new BattleEngine instance
     * @param units - Array of units participating in the battle
     * @param logger - Logger instance to record battle events
     */
    constructor(units: Unit[], logger: Logger) {
        this.units = units;
        this.logger = logger;

        this.reset();
    }

    /**
     * Starts a new battle simulation
     */
    reset() {
        this.state = 'initialized';
        this.currentTime = 0;
        this.logger.clear();
        this.logger.log('Battle started');
        this.teams = {};

        this.units.forEach(unit => {
            // Unit Reset
            unit.health = 100;
            
            // Log initial unit status
            this.logger.log(`${unit.name} enters the battle with ${unit.health} health`);

            // Track teams
            if (this.teams[unit.team] === undefined) {
                this.teams[unit.team] = [];
            }
            this.teams[unit.team].push(unit);
        });

        this.validateTeams();
    }

    /**
     * Updates the battle state by one turn (used for server)
     */
    update() {
        if (this.state === 'finished') {
            throw new Error('Battle is finished');
        }

        if (this.state !== 'running') {
            this.state = 'running';
        }

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
    }

    /**
     * Pauses the battle (just sets the state to paused)
     */
    pause() {
        this.state = 'paused';
    }

    /**
     * Runs the complete battle simulation (used for CLI)
     * @returns Battle result including winner and duration
     */
    runBattle(): BattleResult {
        // Run battle until it ends
        while (this.state !== 'finished') {
            this.update();
            this.checkBattleEnd();
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

    getState() {
        return { time: this.currentTime, state: this.state, units: this.units };
    }

    private validateTeams() {
        if (this.units.length < 2) {
            throw new Error('Battle must have at least 2 units');
        }

        const teams = Object.values(this.teams)
        if (teams.length <= 1) {
            throw new Error('Battle must have at least 2 teams');
        }

        teams.forEach(team => {
            if (team.length === 0) {
                throw new Error('Team has no units');
            }
        });
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
    private processAttack(attacker: Unit, defender: Unit) {
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
    private checkBattleEnd() {
        const team1Alive = this.units.some(u => u.team === 1 && u.health > 0);
        const team2Alive = this.units.some(u => u.team === 2 && u.health > 0);

        if (!team1Alive || !team2Alive) {
            this.state = 'finished';
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