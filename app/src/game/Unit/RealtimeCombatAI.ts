import { ActionType } from './UnitAction';
import { Unit } from './Unit';
import { ReactionSystem } from './Combat/ReactionSystem';
import { AttackResolver } from './Combat/AttackResolver';

/**
 * RealtimeCombatAI makes real-time combat decisions for units
 * Single responsibility: AI decision making
 * Delegates to: ReactionSystem (reactions), AttackResolver (attack outcomes)
 */
export class RealtimeCombatAI {
    /**
     * Reaction system handles detection and timing
     */
    private reactionSystem = new ReactionSystem();

    /**
     * Detects if an enemy is attacking this unit
     * Delegates to ReactionSystem
     */
    detectIncomingAttack(defender: Unit, attacker: Unit, currentTime: number) {
        const attackerAction = attacker.combat.getCurrentAction();

        if (!attackerAction) {
            return;
        }

        // Only react to attacks targeting this unit
        if (attackerAction.target !== defender) {
            return;
        }

        this.reactionSystem.registerIncomingAttack(defender, attacker, currentTime);
    }

    /**
     * Checks if unit should take defensive action
     * Delegates to ReactionSystem
     */
    private shouldDefend(unit: Unit, currentTime: number): { defend: true; attacker: Unit } | { defend: false } {
        const attacker = this.reactionSystem.checkReactionReady(unit, currentTime);
        if (attacker) {
            return { defend: true, attacker };
        }
        return { defend: false };
    }

    /**
     * Decides what action a unit should take
     * Single responsibility: AI decision logic only
     */
    decideAction(unit: Unit, enemy: Unit, currentTime: number): ActionType | null {
        // Can't act if not alive or conscious
        if (!unit.health.isAlive() || !unit.health.isConscious()) {
            return null;
        }

        // Can't decide new action if currently performing one
        if (!unit.combat.isIdle()) {
            return null;
        }

        // Clear old pending reactions
        this.reactionSystem.cleanup(currentTime);

        // Check if we need to defend against incoming attack
        const defenseCheck = this.shouldDefend(unit, currentTime);
        if (defenseCheck.defend) {
            // Decide between block and dodge
            if (unit.combat.canPerformAction('block') && unit.attributes.experience > 0.3) {
                return 'block';
            }
            if (unit.combat.canPerformAction('dodge') && unit.stamina.staminaPercentage > 15) {
                return 'dodge';
            }
            // Can't defend, just take the hit
            return null;
        }

        // Check if we should be defensive (low health, low stamina)
        if (this.shouldBeDefensive(unit)) {
            // Just wait/rest to recover
            return null;
        }

        // Offensive actions
        if (unit.combat.canPerformAction('attack') && unit.stamina.staminaPercentage > 10) {
            const combatEffectiveness = unit.combat.getCombatEffectiveness();

            // Use heavy attack if we have resources and good effectiveness
            if (unit.combat.canPerformAction('heavyAttack')
              && unit.stamina.staminaPercentage > 30
              && combatEffectiveness > 0.7) {
                return 'heavyAttack';
            }

            // Normal attack
            return 'attack';
        }

        // Default: idle/rest
        return null;
    }

    /**
     * Determines if unit should take defensive posture
     */
    private shouldBeDefensive(unit: Unit) {
        // Low consciousness
        if (unit.health.getConsciousness() < 50) {
            return true;
        }

        // Low stamina
        if (unit.stamina.staminaPercentage < 25) {
            return true;
        }

        // Low combat effectiveness
        if (unit.combat.getCombatEffectiveness() < 0.4) {
            return true;
        }

        // High blood loss
        if (unit.health.getBloodLoss() > 20) {
            return true;
        }

        return false;
    }

    /**
     * Resolves an attack that has completed execution
     * Delegates to AttackResolver
     */
    resolveAttackExecution(attacker: Unit, defender: Unit, isHeavyAttack: boolean): string {
        return AttackResolver.resolveAttack(attacker, defender, isHeavyAttack);
    }
}
