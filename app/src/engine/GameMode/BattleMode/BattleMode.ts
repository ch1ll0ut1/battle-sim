import { Unit } from '../../../game/Unit/Unit';
import { GameEngine } from '../../GameEngine/GameEngine';
import { Logger } from '../../ServerLogger';
import { BattleAi } from './BattleAi';

/**
 * Result of a game simulation
 */
interface GameResult {
    winner?: string;
    duration: number;
    events: string[];
}

export class BattleMode {
    private logger: Logger;
    private battleAI: BattleAi;
    private teams: Record<number, Unit[]> = {};
    private units: Unit[] = [];
    private engine: GameEngine;

    constructor(logger: Logger, engine: GameEngine) {
        this.logger = logger;
        this.battleAI = new BattleAi();
        // this.units = units1v1.map(unit => new Unit(unit.id, unit.name, ));
        this.engine = engine;
    }

    update(deltaTime: number) {
        // Use existing battle engine
        // TODO: implement deltaTime
        //   this.battleEngine.update(deltaTime);

        // TODO: implement AI and remove combat logic from BattleEngine
        // Apply mode-specific AI behavior
        //   this.battleAI.update(this.battleEngine.getUnits(), deltaTime);

        // Check if game should end
        this.checkGameEnd();
    }

    reset() {
        this.teams = {};

        // this.units.forEach(unit => {
        //     // Unit Reset
        //     unit.health = 100;

        //     // Log initial unit status
        //     this.logger.log(`${unit.name} enters the game with ${unit.health} health`);

        //     // Track teams
        //     if (this.teams[unit.team] === undefined) {
        //         this.teams[unit.team] = [];
        //     }
        //     this.teams[unit.team].push(unit);
        // });

        this.validateTeams();
    }

    /**
     * Checks if the game should end
     */
    private checkGameEnd() {
        // const team1Alive = this.units.some(u => u.team === 1 && u.health > 0);
        // const team2Alive = this.units.some(u => u.team === 2 && u.health > 0);

        // if (!team1Alive || !team2Alive) {
        //     this.logger.log(`${team1Alive ? 'Team 1' : 'Team 2'} wins the game!`);
        //     this.engine.emit('finished');
        // }
    }

    private validateTeams() {
        if (this.units.length < 2) {
            throw new Error('Game must have at least 2 units');
        }

        const teams = Object.values(this.teams);
        if (teams.length <= 1) {
            throw new Error('Game must have at least 2 teams');
        }

        teams.forEach((team) => {
            if (team.length === 0) {
                throw new Error('Team has no units');
            }
        });
    }

    /**
     * Determines the winner of the game
     */
    private determineWinner(): string | undefined {
        // const team1Alive = this.units.filter(u => u.team === 1 && u.health > 0);
        // const team2Alive = this.units.filter(u => u.team === 2 && u.health > 0);

        // if (team1Alive.length > 0 && team2Alive.length === 0) {
        //     return 'Team 1';
        // } else if (team2Alive.length > 0 && team1Alive.length === 0) {
        //     return 'Team 2';
        // }

        return undefined;
    }
}
