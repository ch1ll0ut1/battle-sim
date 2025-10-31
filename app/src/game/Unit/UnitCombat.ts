import { TickUpdate } from '../../engine/TickUpdate';
import { BodyPart, createInjury, InjurySeverity, WoundType } from './Injury';
import { Unit } from './Unit';
import { ActionType, UnitAction } from './UnitAction';
import { CombatCalculations } from './Combat/CombatCalculations';
import { DamageType, Weapon } from './Weapon';

/**
 * Stamina costs for different combat actions
 */
const STAMINA_COSTS: Record<CombatAction, number> = {
    attack: 3,
    heavyAttack: 6,
    block: 2,
    dodge: 4,
    riposte: 2, // Faster, less committed than normal attack
    defend: 0,
};

/**
 * Body part functionality thresholds for actions
 */
const BODY_PART_THRESHOLDS = {
    attack: 60, // Arms must be above this to attack
    block: 60, // Arms must be above this to block
    dodge: 60, // Legs must be above this to dodge
};

export type CombatAction = 'attack' | 'heavyAttack' | 'block' | 'dodge' | 'riposte' | 'defend';

export interface UnitCombatState {
    isInCombat: boolean;
    weaponName: string | null;
    combatEffectiveness: number;
    canAttack: boolean;
    canBlock: boolean;
    canDodge: boolean;
    isStaggered: boolean;
    currentAction: {
        type: string;
        state: string;
        progress: number;
    } | null;
}

/**
 * UnitCombat handles all combat-related mechanics including actions, weapon handling,
 * and combat effectiveness calculations
 * Integrates with UnitStamina for action costs and UnitHealth for capability checks
 */
export class UnitCombat implements TickUpdate {
    /**
     * Currently equipped weapon
     */
    private weapon: Weapon | null = null;

    /**
     * Whether the unit is currently engaged in combat
     */
    private isInCombat = false;

    /**
     * Current action being performed (null if idle)
     */
    private currentAction: UnitAction | null = null;

    /**
     * Current simulation time (seconds)
     */
    private currentTime = 0;

    /**
     * Whether the unit has a counter-attack opportunity
     * Set to true after successful block, consumed on next attack
     */
    private hasCounterOpportunity = false;

    /**
     * Time when stagger effect will end (0 if not staggered)
     * Units cannot act while staggered after receiving a hit
     */
    private staggerEndTime = 0;

    /**
     * Creates a new combat component for a unit
     * @param unit - Reference to parent unit for accessing other components
     */
    constructor(private unit: Unit) {}

    /**
     * Equips a weapon for the unit
     * Heavy weapons will increase stamina drain and may reduce hit rates
     */
    equipWeapon(weapon: Weapon) {
        // Check if unit can wield this weapon based on strength
        const maxWeaponWeight = this.unit.attributes.strength * 0.3;
        if (weapon.weight > maxWeaponWeight) {
            // Unit is too weak to wield this weapon effectively
            return false;
        }

        this.weapon = weapon;
        return true;
    }

    /**
     * Gets the currently equipped weapon
     */
    getWeapon() {
        return this.weapon;
    }

    /**
     * Sets whether the unit is currently in combat
     */
    setCombatState(inCombat: boolean) {
        this.isInCombat = inCombat;
    }

    /**
     * Checks if the unit is in combat
     */
    getIsInCombat() {
        return this.isInCombat;
    }

    /**
     * Calculates hit rate modifier based on experience and weapon weight
     * Experienced units handle heavy weapons better
     */
    getHitRateModifier() {
        if (!this.weapon) {
            return 0.5; // Base hit rate without weapon
        }

        // Experience bonus
        const experienceBonus = this.unit.attributes.experience * 0.5;
        // Weight penalty
        const weightPenalty = this.weapon.weight * 0.1;

        return Math.max(0.1, 0.5 + experienceBonus - weightPenalty);
    }

    /**
     * Calculates overall combat effectiveness as a percentage (0.0 to 1.0)
     * Considers stamina, pain, consciousness, blood loss, and body part functionality
     */
    getCombatEffectiveness() {
        if (!this.unit.health.isAlive() || !this.unit.health.isConscious()) {
            return 0;
        }

        // Base stamina effectiveness
        const staminaPercentage = this.unit.stamina.staminaPercentage;
        let effectiveness = 0;

        if (staminaPercentage > 75) effectiveness = 1.0;
        else if (staminaPercentage > 50) effectiveness = 0.8;
        else if (staminaPercentage > 25) effectiveness = 0.6;
        else if (staminaPercentage > 10) effectiveness = 0.3;
        else effectiveness = 0.1;

        // Pain effects
        const totalPain = this.unit.health.getTotalPain();
        const painEffect = 1 - (totalPain / 100) * (1 - this.unit.attributes.experience * 0.5);

        // Consciousness effects
        const consciousnessEffect = this.unit.health.getConsciousness() / 100;

        // Blood loss effects
        const bloodLossEffect = 1 - (this.unit.health.getBloodLoss() / 100);

        // Body part functionality effects
        const armFunctionality = Math.min(
            this.unit.health.getBodyPartFunctionality('leftArm'),
            this.unit.health.getBodyPartFunctionality('rightArm'),
        ) / 100;

        const legFunctionality = Math.min(
            this.unit.health.getBodyPartFunctionality('leftLeg'),
            this.unit.health.getBodyPartFunctionality('rightLeg'),
        ) / 100;

        // Combine all effects
        return effectiveness * painEffect * consciousnessEffect * bloodLossEffect * armFunctionality * legFunctionality;
    }

    /**
     * Checks if the unit is currently staggered from a hit
     */
    isStaggered() {
        return this.currentTime < this.staggerEndTime;
    }

    /**
     * Applies stagger effect based on damage and hit location
     * @param damage - Amount of damage dealt (before armor reduction)
     * @param bodyPart - Body part that was hit
     * @param armorReduction - Armor damage reduction percentage (0-1)
     */
    applyStagger(damage: number, bodyPart: BodyPart, armorReduction: number) {
        // Base stagger time from damage (0.1-0.5s based on damage)
        const damageStagger = Math.min(0.5, damage / 200);

        // Body part multipliers
        const bodyPartMultiplier = bodyPart === 'head'
            ? 1.5
            : bodyPart === 'torso'
                ? 1.3
                : 1.0;

        // Armor reduces stagger significantly
        const armorMultiplier = 1 - (armorReduction * 0.7);

        // Experience reduces stagger recovery time
        const experienceMultiplier = 1 - (this.unit.attributes.experience * 0.3);

        const staggerDuration = damageStagger * bodyPartMultiplier * armorMultiplier * experienceMultiplier;
        this.staggerEndTime = this.currentTime + staggerDuration;
    }

    /**
     * Checks if the unit can perform a specific combat action
     * Validates stamina, consciousness, stagger, and required body part functionality
     */
    canPerformAction(action: CombatAction) {
        if (!this.unit.health.isAlive() || !this.unit.health.isConscious()) {
            return false;
        }

        // Cannot act while staggered
        if (this.isStaggered()) {
            return false;
        }

        // Check stamina
        const cost = STAMINA_COSTS[action];
        if (this.unit.stamina.stamina < cost) {
            return false;
        }

        // Check body part requirements for specific actions
        switch (action) {
            case 'attack':
            case 'heavyAttack': {
                const leftArmFunc = this.unit.health.getBodyPartFunctionality('leftArm');
                const rightArmFunc = this.unit.health.getBodyPartFunctionality('rightArm');
                // At least one arm must be functional
                return leftArmFunc > BODY_PART_THRESHOLDS.attack || rightArmFunc > BODY_PART_THRESHOLDS.attack;
            }
            case 'block': {
                const leftArmFunc = this.unit.health.getBodyPartFunctionality('leftArm');
                const rightArmFunc = this.unit.health.getBodyPartFunctionality('rightArm');
                // At least one arm must be functional
                return leftArmFunc > BODY_PART_THRESHOLDS.block || rightArmFunc > BODY_PART_THRESHOLDS.block;
            }
            case 'dodge': {
                // Both legs must be functional
                const leftLegFunc = this.unit.health.getBodyPartFunctionality('leftLeg');
                const rightLegFunc = this.unit.health.getBodyPartFunctionality('rightLeg');
                return leftLegFunc > BODY_PART_THRESHOLDS.dodge && rightLegFunc > BODY_PART_THRESHOLDS.dodge;
            }
            default:
                return true;
        }
    }

    /**
     * Performs a combat action if possible, consuming stamina
     * Returns true if the action was successfully performed
     */
    performAction(action: CombatAction) {
        if (!this.canPerformAction(action)) {
            return false;
        }

        const cost = STAMINA_COSTS[action];
        this.unit.stamina.consumeStamina(cost);
        return true;
    }

    /**
     * Creates an injury based on damage and weapon
     */
    createInjuryFromDamage(damage: number): { bodyPart: BodyPart; severity: InjurySeverity; woundType: WoundType } {
        // Select random body part
        const bodyParts: BodyPart[] = ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const bodyPart = bodyParts[Math.floor(Math.random() * bodyParts.length)] as BodyPart;

        // Determine severity based on damage
        let severity: InjurySeverity = 'minor';
        if (damage > 80) severity = 'fatal';
        else if (damage > 60) severity = 'critical';
        else if (damage > 40) severity = 'severe';
        else if (damage > 20) severity = 'moderate';

        // Determine wound type based on weapon's primary damage type
        let woundType: WoundType = 'cut';
        if (this.weapon) {
            const primaryDamageType = this.weapon.getPrimaryDamageType();
            switch (primaryDamageType) {
                case 'cutting':
                    woundType = 'cut';
                    break;
                case 'piercing':
                    woundType = 'stab';
                    break;
                case 'blunt':
                    woundType = 'crush';
                    break;
            }
        }

        // Handle amputation for fatal limb injuries
        if (severity === 'fatal' && (bodyPart === 'leftArm' || bodyPart === 'rightArm' || bodyPart === 'leftLeg' || bodyPart === 'rightLeg')) {
            woundType = 'amputation';
        }

        return { bodyPart, severity, woundType };
    }

    /**
     * Applies damage to a target unit, creating an injury and stagger effect
     * Armor reduces incoming damage and stagger before injury is created
     */
    applyDamageToTarget(target: Unit, damage: number) {
        // Apply armor damage reduction
        let finalDamage = damage;
        let armorReduction = 0;
        const armor = target.getArmor();
        if (armor) {
            const { bodyPart } = this.createInjuryFromDamage(damage);

            // Map body part to armor location
            let armorLocation: import('./Armor').ArmorLocation;
            if (bodyPart === 'head') {
                armorLocation = 'head';
            }
            else if (bodyPart === 'torso') {
                armorLocation = 'torso';
            }
            else if (bodyPart === 'leftArm' || bodyPart === 'rightArm') {
                armorLocation = 'arms';
            }
            else {
                armorLocation = 'legs';
            }

            const protection = armor.getProtection(armorLocation);
            armorReduction = protection;
            finalDamage = damage * (1 - protection);
        }

        const { bodyPart, severity, woundType } = this.createInjuryFromDamage(finalDamage);
        const injury = createInjury(bodyPart, severity, woundType, finalDamage);
        target.health.receiveInjury(injury);

        // Apply stagger effect
        target.combat.applyStagger(damage, bodyPart, armorReduction);
    }

    /**
     * Starts a new action if unit is idle
     * @param actionType - Type of action to start
     * @param target - Target unit (if applicable)
     * @returns True if action was started
     */
    startAction(actionType: ActionType, target: Unit | null = null) {
        // Can't start new action if currently performing one
        if (this.currentAction && this.currentAction.state !== 'idle') {
            return false;
        }

        // Check if unit can perform this action
        if (actionType !== 'idle' && !this.canPerformAction(actionType as CombatAction)) {
            return false;
        }

        // Create and start the action
        this.currentAction = new UnitAction(actionType, target, this.currentTime, this.unit);
        return true;
    }

    /**
     * Gets the current action being performed
     */
    getCurrentAction() {
        return this.currentAction;
    }

    /**
     * Checks if unit is currently idle (not performing an action)
     */
    isIdle() {
        return !this.currentAction || this.currentAction.state === 'idle';
    }

    /**
     * Sets counter-attack opportunity after successful block
     */
    setCounterOpportunity() {
        this.hasCounterOpportunity = true;
    }

    /**
     * Checks and consumes counter-attack opportunity
     */
    checkAndConsumeCounterOpportunity() {
        const hasOpportunity = this.hasCounterOpportunity;
        this.hasCounterOpportunity = false;
        return hasOpportunity;
    }

    /**
     * Interrupts the current action if possible
     * @returns True if action was interrupted
     */
    interruptAction() {
        if (this.currentAction) {
            return this.currentAction.interrupt();
        }
        return false;
    }

    /**
     * Updates combat state including action progression
     */
    update(deltaTime: number) {
        this.currentTime += deltaTime;

        // Update current action
        if (this.currentAction) {
            const isComplete = this.currentAction.update(this.currentTime);
            if (isComplete) {
                this.currentAction = null;
            }
        }
    }

    /**
     * Gets a summary of the combat state for serialization/display
     */
    getState(): UnitCombatState {
        return {
            isInCombat: this.isInCombat,
            weaponName: this.weapon?.name ?? null,
            combatEffectiveness: this.getCombatEffectiveness(),
            canAttack: this.canPerformAction('attack'),
            canBlock: this.canPerformAction('block'),
            canDodge: this.canPerformAction('dodge'),
            isStaggered: this.isStaggered(),
            currentAction: this.currentAction
                ? {
                    type: this.currentAction.type,
                    state: this.currentAction.state,
                    progress: this.currentAction.getProgress(this.currentTime),
                }
                : null,
        };
    }
}
