import { Unit } from '../Unit';

/**
 * CombatCalculations provides pure functions for combat math
 * Single responsibility: Combat calculation formulas
 * No state, no side effects - just calculations
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CombatCalculations {
    /**
     * Calculates hit rate for an attack
     * From GAME_MECHANICS.md line 860-877
     */
    static calculateHitRate(attacker: Unit, defender: Unit): number {
        let baseHitRate = 0.7; // Base 70% hit rate

        // Weapon modifier
        const weapon = attacker.combat.getWeapon();
        if (weapon) {
            const hitRateModifier = attacker.combat.getHitRateModifier();
            baseHitRate *= hitRateModifier;
        }
        else {
            baseHitRate *= 0.5; // No weapon penalty
        }

        // Attacker experience bonus (up to +20%)
        baseHitRate += attacker.attributes.experience * 0.2;

        // Defender experience makes them harder to hit
        baseHitRate -= defender.attributes.experience * 0.1;

        // Attacker stamina effect
        const attackerStaminaEffect = attacker.stamina.staminaPercentage / 100;
        baseHitRate *= (0.5 + attackerStaminaEffect * 0.5);

        // Clamp between 10% and 95%
        return Math.max(0.1, Math.min(0.95, baseHitRate));
    }

    /**
     * Calculates damage for an attack
     * From GAME_MECHANICS.md line 879-893
     */
    static calculateDamage(attacker: Unit, isHeavyAttack: boolean): number {
        let baseDamage = 30; // Base damage

        const weapon = attacker.combat.getWeapon();

        // Weapon damage calculation
        if (weapon) {
            const primaryDamageType = weapon.getPrimaryDamageType();

            switch (primaryDamageType) {
                case 'cutting':
                    baseDamage = 40 + (weapon.edgeSharpness * 30); // 40-70
                    break;
                case 'piercing':
                    baseDamage = 35 + (weapon.pointGeometry * 25); // 35-60
                    break;
                case 'blunt':
                    baseDamage = 45 + (weapon.impactArea / 20); // 45-65
                    break;
            }

            // Weight affects damage
            baseDamage += weapon.weight * 2;
        }

        // Strength modifier (50-150% based on strength 0-100)
        baseDamage *= (0.5 + attacker.attributes.strength / 100);

        // Heavy attack modifier
        if (isHeavyAttack) {
            baseDamage *= 1.5;
        }

        // Experience bonus (up to +30%)
        baseDamage *= (1 + attacker.attributes.experience * 0.3);

        return Math.round(baseDamage);
    }

    /**
     * Calculates block success chance
     * Based on experience and arm functionality
     */
    static calculateBlockSuccess(defender: Unit): boolean {
        // Base block chance: 30-70% based on experience
        const blockChance = 0.3 + defender.attributes.experience * 0.4;

        // Arm functionality affects blocking
        const leftArmFunc = defender.health.getBodyPartFunctionality('leftArm');
        const rightArmFunc = defender.health.getBodyPartFunctionality('rightArm');
        const bestArmFunc = Math.max(leftArmFunc, rightArmFunc) / 100;

        const finalChance = blockChance * bestArmFunc;

        return Math.random() < finalChance;
    }

    /**
     * Calculates dodge success chance
     * Based on experience and leg functionality
     */
    static calculateDodgeSuccess(defender: Unit): boolean {
        // Base dodge chance: 20-50% based on experience
        const dodgeChance = 0.2 + defender.attributes.experience * 0.3;

        // Leg functionality affects dodging
        const leftLegFunc = defender.health.getBodyPartFunctionality('leftLeg');
        const rightLegFunc = defender.health.getBodyPartFunctionality('rightLeg');
        const worstLegFunc = Math.min(leftLegFunc, rightLegFunc) / 100;

        const finalChance = dodgeChance * worstLegFunc;

        return Math.random() < finalChance;
    }
}
