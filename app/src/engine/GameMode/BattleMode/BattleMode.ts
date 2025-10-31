import { GameEngine } from '../../GameEngine/GameEngine';
import { Logger } from '../../ServerLogger';
import { Unit } from '../../../game/Unit/Unit';
import { GameMode } from '../GameMode';
import { UnitCombatAi } from './UnitCombatAi';

/**
 * BattleMode game mode for autonomous combat (1v1 or NvN)
 * Units have autonomous AI that handles movement and combat
 * Configurable with different warrior types via factory functions
 */
export class BattleMode extends GameMode {
    private units: Unit[] = [];
    private unitAis: UnitCombatAi[] = [];
    private combatMessages: string[] = [];
    private isBattleOver = false;
    private team1Factories: (() => Unit)[];
    private team2Factories: (() => Unit)[];

    /**
     * Creates a battle mode with custom warrior factories
     * @param team1Factories - Factory functions for team 1 warriors
     * @param team2Factories - Factory functions for team 2 warriors
     */
    constructor(
        logger: Logger,
        engine: GameEngine,
        team1Factories: (() => Unit)[],
        team2Factories: (() => Unit)[],
    ) {
        super(logger, engine);
        this.team1Factories = team1Factories;
        this.team2Factories = team2Factories;
    }

    /**
     * Resets the game mode and creates combat-ready units with autonomous AI
     */
    reset() {
        this.logger.log('BattleMode reset');
        this.units = [];
        this.unitAis = [];
        this.combatMessages = [];
        this.isBattleOver = false;

        // Create team 1 warriors
        for (const factory of this.team1Factories) {
            const warrior = factory();
            this.units.push(warrior);

            const ai = new UnitCombatAi();
            this.unitAis.push(ai);
            warrior.setAi(ai);
        }

        // Create team 2 warriors
        for (const factory of this.team2Factories) {
            const warrior = factory();
            this.units.push(warrior);

            const ai = new UnitCombatAi();
            this.unitAis.push(ai);
            warrior.setAi(ai);
        }

        // Give each AI access to all units (for enemy detection)
        this.unitAis.forEach((ai) => {
            ai.setAllUnits(this.units);
        });

        this.logger.log(`Created battle: Team 1 (${this.team1Factories.length} warriors) vs Team 2 (${this.team2Factories.length} warriors)`);
    }

    /**
     * Updates the game mode - units act autonomously via their AI
     */
    update(deltaTime: number) {
        if (this.isBattleOver) {
            // Battle is over, just update units
            this.units.forEach((unit) => {
                unit.update(deltaTime);
            });
            return;
        }

        // Check if one team has been eliminated
        const team1Alive = this.units.filter(u => u.team === 1 && u.health.isAlive()).length;
        const team2Alive = this.units.filter(u => u.team === 2 && u.health.isAlive()).length;

        if (team1Alive === 0 || team2Alive === 0) {
            this.isBattleOver = true;
            const winningTeam = team1Alive > 0 ? 1 : 2;
            this.logger.log(`Battle Over! Team ${winningTeam} wins! (${team1Alive} vs ${team2Alive} remaining)`);
            this.combatMessages.push(`Battle Over! Team ${winningTeam} wins!`);

            this.units.forEach((unit) => {
                unit.update(deltaTime);
            });
            return;
        }

        // Update all units - their AI will make autonomous decisions
        this.units.forEach((unit) => {
            unit.update(deltaTime);
        });

        // Collect combat messages from AI instances
        this.unitAis.forEach((ai) => {
            const messages = ai.getMessages();
            if (messages.length > 0) {
                this.combatMessages.push(...messages);
                ai.clearMessages();
            }
        });
    }

    /**
     * Gets the current state of the game mode
     */
    getState() {
        return {
            units: this.units.map(unit => unit.getState()),
            combatMessages: this.combatMessages,
            isBattleOver: this.isBattleOver,
        };
    }

    /**
     * Handles commands (not used in this mode)
     */
    handleCommand(command: string, data?: unknown) {
        this.logger.debug(`BattleMode: ${command}`, data);
    }
}
