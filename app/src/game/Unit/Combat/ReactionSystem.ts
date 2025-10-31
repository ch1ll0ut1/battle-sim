import { Unit } from '../Unit';

/**
 * Reaction time base (280ms from GAME_MECHANICS.md line 226)
 */
const BASE_REACTION_TIME = 0.28;

/**
 * Tracks a pending reaction to an incoming attack
 */
interface PendingReaction {
    attacker: Unit;
    detectedAt: number;
    reactionTime: number;
}

/**
 * ReactionSystem handles detection and timing of reactions to incoming attacks
 * Single responsibility: Managing reaction state and timing
 */
export class ReactionSystem {
    /**
     * Tracks pending reactions per unit
     */
    private pendingReactions = new Map<number, PendingReaction>();

    /**
     * Calculates reaction time for a unit based on experience, fatigue, and injuries
     * From GAME_MECHANICS.md line 226-234
     */
    calculateReactionTime(unit: Unit) {
        const baseTime = BASE_REACTION_TIME;

        // Experience improves reaction time up to 20%
        const experienceBonus = unit.attributes.experience * 0.2;

        // Fatigue (low stamina) increases reaction time up to 50%
        const staminaPercentage = unit.stamina.staminaPercentage;
        const fatiguePenalty = staminaPercentage < 50 ? (50 - staminaPercentage) / 100 : 0;

        // Head injuries and blood loss increase reaction time up to 30%
        const headFunc = unit.health.getBodyPartFunctionality('head');
        const bloodLoss = unit.health.getBloodLoss();
        const headPenalty = (100 - headFunc) / 100 * 0.3;
        const bloodLossPenalty = (bloodLoss / 40) * 0.3; // 40% blood loss is fatal

        const finalReactionTime = baseTime * (1 - experienceBonus) * (1 + fatiguePenalty) * (1 + headPenalty) * (1 + bloodLossPenalty);

        // Clamp between 220ms and 600ms
        return Math.max(0.22, Math.min(0.6, finalReactionTime));
    }

    /**
     * Registers an incoming attack that the defender needs to react to
     */
    registerIncomingAttack(defender: Unit, attacker: Unit, currentTime: number) {
        // Already reacting to this attacker
        if (this.pendingReactions.has(attacker.id)) {
            return;
        }

        // Calculate reaction time
        const reactionTime = this.calculateReactionTime(defender);

        // Register pending reaction
        this.pendingReactions.set(attacker.id, {
            attacker,
            detectedAt: currentTime,
            reactionTime,
        });
    }

    /**
     * Checks if reaction time has passed for an incoming attack
     * Returns the attacker if unit should defend, null otherwise
     */
    checkReactionReady(unit: Unit, currentTime: number): Unit | null {
        const reactions = Array.from(this.pendingReactions.entries());

        for (const [attackerId, reaction] of reactions) {
            const elapsed = currentTime - reaction.detectedAt;

            // Reaction time has passed
            if (elapsed >= reaction.reactionTime) {
                // Check if attacker is still attacking this unit (not blocking/dodging)
                const attackerAction = reaction.attacker.combat.getCurrentAction();
                const isAttacking = attackerAction
                  && (attackerAction.type === 'attack' || attackerAction.type === 'heavyAttack')
                  && attackerAction.target === unit
                  && attackerAction.state === 'executing';

                if (isAttacking) {
                    return reaction.attacker;
                }

                // Attack is over or was interrupted, remove reaction
                this.pendingReactions.delete(attackerId);
            }
        }

        return null;
    }

    /**
     * Cleans up old pending reactions (>2 seconds)
     */
    cleanup(currentTime: number) {
        const reactions = Array.from(this.pendingReactions.entries());

        for (const [attackerId, reaction] of reactions) {
            const elapsed = currentTime - reaction.detectedAt;
            if (elapsed > 2.0) {
                this.pendingReactions.delete(attackerId);
            }
        }
    }
}
