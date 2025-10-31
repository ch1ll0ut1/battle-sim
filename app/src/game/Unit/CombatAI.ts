import { Unit } from './Unit';
import { CombatAction } from './UnitCombat';
import { CombatCalculations } from './Combat/CombatCalculations';

/**
 * CombatAI makes combat decisions for units based on their state and enemy state
 * Extracted from _OLD combat-engine.ts and adapted for new architecture
 */
export class CombatAI {
    /**
     * Decides what action a unit should take based on current situation
     * @param unit - The unit making the decision
     * @param enemy - The enemy unit being faced
     * @returns The action the unit should take
     */
    decideAction(unit: Unit, enemy: Unit): CombatAction {
        // If unit can't fight, just defend
        if (!unit.health.isAlive() || !unit.health.isConscious()) {
            return 'defend';
        }

        // If enemy is dead, no need to act
        if (!enemy.health.isAlive()) {
            return 'defend';
        }

        // Consider defensive actions if low on health or stamina
        if (this.shouldDefend(unit)) {
            // Try to block if we can
            if (unit.combat.canPerformAction('block') && unit.attributes.experience > 0.3) {
                return 'block';
            }
            // Try to dodge if we have stamina
            if (unit.combat.canPerformAction('dodge') && unit.stamina.staminaPercentage > 15) {
                return 'dodge';
            }
            // Otherwise just defend
            return 'defend';
        }

        // If we're in good position, attack
        if (unit.combat.canPerformAction('attack') && unit.stamina.staminaPercentage > 10) {
            // Use heavy attack if we have enough stamina and good combat effectiveness
            const combatEffectiveness = unit.combat.getCombatEffectiveness();
            if (unit.combat.canPerformAction('heavyAttack') && unit.stamina.staminaPercentage > 30 && combatEffectiveness > 0.7) {
                return 'heavyAttack';
            }
            // Otherwise normal attack
            return 'attack';
        }

        // If low stamina, try to recover
        if (unit.stamina.staminaPercentage < 20) {
            return 'defend';
        }

        // Default to defensive stance
        return 'defend';
    }

    /**
     * Determines if a unit should take defensive actions
     * Based on health, stamina, and combat effectiveness
     */
    private shouldDefend(unit: Unit) {
        // Low health consciousness
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
     * Resolves an attack action from attacker to defender
     * Handles hit chance, damage calculation, and injury application
     * @param attacker - The unit performing the attack
     * @param defender - The unit being attacked
     * @param isHeavyAttack - Whether this is a heavy attack
     * @returns Combat result message
     */
    resolveAttack(attacker: Unit, defender: Unit, isHeavyAttack: boolean): string {
        // Consume stamina for the attack
        if (!attacker.combat.performAction(isHeavyAttack ? 'heavyAttack' : 'attack')) {
            return `${attacker.name} tried to attack but couldn't!`;
        }

        // Calculate hit rate
        const hitRate = CombatCalculations.calculateHitRate(attacker, defender);

        // Check if attack hits
        if (Math.random() < hitRate) {
            // Calculate damage
            const damage = CombatCalculations.calculateDamage(attacker, isHeavyAttack);

            // Get injury details before applying
            const injuryInfo = attacker.combat.createInjuryFromDamage(damage);

            // Apply damage to defender
            attacker.combat.applyDamageToTarget(defender, damage);

            // Get weapon info
            const weapon = attacker.combat.getWeapon();
            const weaponName = weapon ? weapon.name : 'bare hands';

            // Format body part name
            const bodyPartName = injuryInfo.bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase().trim();

            // Get wound type description
            const woundVerb = {
                cut: 'cuts',
                stab: 'stabs',
                crush: 'crushes',
                amputation: 'severs',
            }[injuryInfo.woundType];

            const attackType = isHeavyAttack ? ' (heavy)' : '';
            return `${attacker.name} ${woundVerb} ${defender.name}'s ${bodyPartName} with ${weaponName}${attackType} [${injuryInfo.severity}]`;
        }
        else {
            return `${attacker.name} attacks ${defender.name}, but misses`;
        }
    }

    /**
     * Resolves an attack vs block interaction
     * @param attacker - The unit attacking
     * @param defender - The unit blocking
     * @param isHeavyAttack - Whether this is a heavy attack
     * @returns Combat result message
     */
    resolveAttackVsBlock(attacker: Unit, defender: Unit, isHeavyAttack: boolean): string {
        // Consume stamina for actions
        if (!attacker.combat.performAction(isHeavyAttack ? 'heavyAttack' : 'attack')) {
            return `${attacker.name} tried to attack but couldn't!`;
        }
        if (!defender.combat.performAction('block')) {
            return `${defender.name} tried to block but couldn't!`;
        }

        const hitRate = CombatCalculations.calculateHitRate(attacker, defender);
        const blockSuccess = CombatCalculations.calculateBlockSuccess(defender);

        if (Math.random() < hitRate) {
            const baseDamage = CombatCalculations.calculateDamage(attacker, isHeavyAttack);
            const weapon = attacker.combat.getWeapon();
            const weaponName = weapon ? weapon.name : 'bare hands';

            if (blockSuccess) {
                // Attack hits but is blocked - reduced damage (30%)
                const damage = baseDamage * 0.3;
                const injuryInfo = attacker.combat.createInjuryFromDamage(damage);
                attacker.combat.applyDamageToTarget(defender, damage);

                const bodyPartName = injuryInfo.bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
                return `${attacker.name} attacks with ${weaponName}, ${defender.name} blocks! [glancing blow to ${bodyPartName}, ${injuryInfo.severity}]`;
            }
            else {
                // Attack hits, block failed
                const injuryInfo = attacker.combat.createInjuryFromDamage(baseDamage);
                attacker.combat.applyDamageToTarget(defender, baseDamage);

                const bodyPartName = injuryInfo.bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
                const woundVerb = {
                    cut: 'cuts',
                    stab: 'stabs',
                    crush: 'crushes',
                    amputation: 'severs',
                }[injuryInfo.woundType];

                return `${attacker.name} breaks through ${defender.name}'s block, ${woundVerb} ${bodyPartName} [${injuryInfo.severity}]`;
            }
        }
        else {
            return `${attacker.name} attacks ${defender.name}, but misses`;
        }
    }

    /**
     * Resolves an attack vs dodge interaction
     * @param attacker - The unit attacking
     * @param dodger - The unit dodging
     * @param isHeavyAttack - Whether this is a heavy attack
     * @returns Combat result message
     */
    resolveAttackVsDodge(attacker: Unit, dodger: Unit, isHeavyAttack: boolean): string {
        // Consume stamina for actions
        if (!attacker.combat.performAction(isHeavyAttack ? 'heavyAttack' : 'attack')) {
            return `${attacker.name} tried to attack but couldn't!`;
        }
        if (!dodger.combat.performAction('dodge')) {
            return `${dodger.name} tried to dodge but couldn't!`;
        }

        const hitRate = CombatCalculations.calculateHitRate(attacker, dodger);
        const dodgeSuccess = CombatCalculations.calculateDodgeSuccess(dodger);

        if (Math.random() < hitRate && !dodgeSuccess) {
            const damage = CombatCalculations.calculateDamage(attacker, isHeavyAttack);
            const injuryInfo = attacker.combat.createInjuryFromDamage(damage);
            attacker.combat.applyDamageToTarget(dodger, damage);

            const weapon = attacker.combat.getWeapon();
            const weaponName = weapon ? weapon.name : 'bare hands';
            const bodyPartName = injuryInfo.bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
            const woundVerb = {
                cut: 'cuts',
                stab: 'stabs',
                crush: 'crushes',
                amputation: 'severs',
            }[injuryInfo.woundType];

            return `${dodger.name} tries to dodge but ${attacker.name} ${woundVerb} their ${bodyPartName} with ${weaponName} [${injuryInfo.severity}]`;
        }
        else {
            const veteranStatus = dodger.attributes.experience > 0.5 ? 'Veteran' : 'Novice';
            return `${attacker.name} attacks ${dodger.name}, but ${veteranStatus} dodges!`;
        }
    }

    /**
     * Resolves combat between two units for one turn
     * Both units decide on actions and then actions are resolved
     * @param unitA - First unit
     * @param unitB - Second unit
     * @returns Array of combat result messages
     */
    resolveCombatTurn(unitA: Unit, unitB: Unit): string[] {
        const messages: string[] = [];

        // Both units decide their actions
        const actionA = this.decideAction(unitA, unitB);
        const actionB = this.decideAction(unitB, unitA);

        // Resolve actions based on what each unit chose
        // Attack vs Block
        if ((actionA === 'attack' || actionA === 'heavyAttack') && actionB === 'block') {
            messages.push(this.resolveAttackVsBlock(unitA, unitB, actionA === 'heavyAttack'));
        }
        else if ((actionB === 'attack' || actionB === 'heavyAttack') && actionA === 'block') {
            messages.push(this.resolveAttackVsBlock(unitB, unitA, actionB === 'heavyAttack'));
        }
        // Attack vs Dodge
        else if ((actionA === 'attack' || actionA === 'heavyAttack') && actionB === 'dodge') {
            messages.push(this.resolveAttackVsDodge(unitA, unitB, actionA === 'heavyAttack'));
        }
        else if ((actionB === 'attack' || actionB === 'heavyAttack') && actionA === 'dodge') {
            messages.push(this.resolveAttackVsDodge(unitB, unitA, actionB === 'heavyAttack'));
        }
        // Mutual attacks (both attack each other)
        else if ((actionA === 'attack' || actionA === 'heavyAttack') && (actionB === 'attack' || actionB === 'heavyAttack')) {
            messages.push(this.resolveAttack(unitA, unitB, actionA === 'heavyAttack'));
            messages.push(this.resolveAttack(unitB, unitA, actionB === 'heavyAttack'));
        }
        // Single attacks
        else if (actionA === 'attack' || actionA === 'heavyAttack') {
            messages.push(this.resolveAttack(unitA, unitB, actionA === 'heavyAttack'));
        }
        else if (actionB === 'attack' || actionB === 'heavyAttack') {
            messages.push(this.resolveAttack(unitB, unitA, actionB === 'heavyAttack'));
        }
        // Defensive actions
        else {
            if (actionA === 'defend') {
                messages.push(`${unitA.name} takes defensive stance`);
            }
            if (actionB === 'defend') {
                messages.push(`${unitB.name} takes defensive stance`);
            }
        }

        return messages;
    }
}
