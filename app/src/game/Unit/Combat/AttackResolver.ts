import { Unit } from '../Unit';
import { CombatCalculations } from './CombatCalculations';

/**
 * AttackResolver handles resolution of completed attacks into combat messages
 * Single responsibility: Converting combat outcomes into descriptive messages
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AttackResolver {
    /**
     * Resolves an attack that has completed execution
     * Calculates hit, checks dodge/block, applies damage, returns message
     */
    static resolveAttack(attacker: Unit, defender: Unit, isHeavyAttack: boolean): string {
        // Calculate hit rate
        const hitRate = CombatCalculations.calculateHitRate(attacker, defender);

        // Check defender's current action
        const defenderAction = defender.combat.getCurrentAction();
        const isDodging = defenderAction && defenderAction.type === 'dodge' && defenderAction.state === 'executing';
        const isBlocking = defenderAction && defenderAction.type === 'block' && defenderAction.state === 'executing';

        // Check if dodging - successful dodges completely avoid attacks
        if (isDodging) {
            const dodgeSuccess = CombatCalculations.calculateDodgeSuccess(defender);
            if (dodgeSuccess) {
                return `${attacker.name} attacks ${defender.name}, but ${defender.name} dodges!`;
            }
        }

        // Check if attack hits
        if (Math.random() < hitRate) {
            const baseDamage = CombatCalculations.calculateDamage(attacker, isHeavyAttack);

            // Check if block is successful - blocks prevent ALL damage
            if (isBlocking) {
                const blockSuccess = CombatCalculations.calculateBlockSuccess(defender);
                if (blockSuccess) {
                    // Successful block creates counter-attack opportunity
                    defender.combat.setCounterOpportunity();
                    return `${attacker.name} attacks ${defender.name}, but ${defender.name} blocks!`;
                }
                // Block failed, full damage goes through
            }

            // Capture state before damage
            const beforeState = defender.getState();

            // Get injury details before applying
            const injuryInfo = attacker.combat.createInjuryFromDamage(baseDamage);

            // Apply damage
            attacker.combat.applyDamageToTarget(defender, baseDamage);

            // Capture state after damage
            const afterState = defender.getState();

            // Format message with state changes
            return this.formatHitMessage(attacker, defender, injuryInfo, isHeavyAttack, false, beforeState, afterState);
        }
        else {
            return `${attacker.name} attacks ${defender.name}, but misses`;
        }
    }

    /**
     * Formats a hit message with injury details and stat changes
     */
    private static formatHitMessage(
        attacker: Unit,
        defender: Unit,
        injuryInfo: { bodyPart: string; severity: string; woundType: string },
        isHeavyAttack: boolean,
        wasBlocked: boolean,
        beforeState: import('../Unit').UnitState,
        afterState: import('../Unit').UnitState,
    ): string {
        const weapon = attacker.combat.getWeapon();
        const weaponName = weapon ? weapon.name : 'bare hands';
        const bodyPartName = injuryInfo.bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase().trim();

        const woundVerb = {
            cut: 'cuts',
            stab: 'stabs',
            crush: 'crushes',
            amputation: 'severs',
        }[injuryInfo.woundType];

        const attackType = isHeavyAttack ? ' (heavy)' : '';
        const blockText = wasBlocked ? ' [blocked!]' : '';

        // Calculate stat changes
        const statChanges: string[] = [];

        const consciousnessChange = afterState.health.consciousness - beforeState.health.consciousness;
        if (Math.abs(consciousnessChange) > 0.1) {
            statChanges.push(`CONS${consciousnessChange.toFixed(0)}`);
        }

        const bloodLossChange = afterState.health.bloodLoss - beforeState.health.bloodLoss;
        if (Math.abs(bloodLossChange) > 0.1) {
            statChanges.push(`BL+${bloodLossChange.toFixed(1)}`);
        }

        const combatEffectivenessChange = (afterState.combat.combatEffectiveness - beforeState.combat.combatEffectiveness) * 100;
        if (Math.abs(combatEffectivenessChange) > 0.5) {
            statChanges.push(`CE${combatEffectivenessChange.toFixed(0)}`);
        }

        const statsText = statChanges.length > 0 ? ` (${statChanges.join(', ')})` : '';

        return `${attacker.name} ${woundVerb} ${defender.name}'s ${bodyPartName} with ${weaponName}${attackType}${blockText} [${injuryInfo.severity}]${statsText}`;
    }
}
