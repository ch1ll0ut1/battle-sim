import { Unit } from "./Unit";

/**
 * Stamina recovery context affects recovery rates
 */
type StaminaRecoveryContext = 'resting' | 'moving' | 'combat' | 'exhausted';

const staminaRecoveryRates: Record<StaminaRecoveryContext, number> = {
    resting: 0.08,    // 8% per second when stationary - full aerobic recovery
    moving: 0.0,   // +0.01% per second - very minimal recovery while walking (nearly neutral)
    combat: 0.01,     // 1% per second during combat - adrenaline helps slightly
    exhausted: 0      // No recovery when exhausted
};

/**
 * UnitStamina manages a unit's energy level and ability to perform actions.
 * Handles stamina calculation, consumption, and recovery using absolute stamina units.
 * Implements the core stamina system from GAME_MECHANICS.md.
 */
export class UnitStamina {
    /**
     * Current stamina level (0 to maxStamina) in absolute units
     */
    private _stamina: number;

    /**
     * Maximum stamina capacity calculated from unit attributes
     */
    private _maxStamina: number;

    /**
     * Creates a new UnitStamina component
     * Calculates initial maximum stamina based on unit attributes
     * @param unit - Reference to the parent unit for accessing attributes
     * @param startingStaminaPercent - Starting stamina as percentage of max (defaults to 100%)
     */
    constructor(
        private unit: Unit,
        startingStaminaPercent: number = 100
    ) {
        this._maxStamina = this.calculateMaxStamina();
        this._stamina = (this._maxStamina * startingStaminaPercent) / 100;

        // Ensure stamina is within valid range
        this._stamina = Math.max(0, Math.min(this._stamina, this._maxStamina));
    }

    /**
     * Gets current stamina level in absolute units
     */
    get stamina(): number {
        return this._stamina;
    }

    /**
     * Gets maximum stamina capacity in absolute units
     */
    get maxStamina(): number {
        return this._maxStamina;
    }

    /**
     * Gets current stamina as percentage of maximum
     */
    get staminaPercentage(): number {
        return this._maxStamina > 0 ? (this._stamina / this._maxStamina) * 100 : 0;
    }

    /**
     * Checks if unit is exhausted (below 10% stamina)
     */
    get isExhausted(): boolean {
        return this.staminaPercentage < 10;
    }

    /**
     * Gets the current recovery context based on unit state
     * Derives context from movement and combat state automatically
     * 1. Exhausted - no recovery
     * 2. Combat - low recovery  
     * 3. Walking - medium recovery
     * 4. Resting - highest recovery (default)
     */
    get recoveryContext(): StaminaRecoveryContext {
        // If exhausted, no recovery regardless of other states
        if (this.isExhausted) {
            return 'exhausted';
        }

        if (this.unit.movement.isMoving) {
            return 'moving';
        }

        // TODO: When combat component is available, check combat state
        // if (this.unit.combat?.state === 'active') {
        //     return 'combat'; // Use combat rate for running (low recovery)
        // }

        return 'resting';
    }

    /**
     * Calculates maximum stamina based on unit attributes
     * Formula from GAME_MECHANICS.md (corrected):
     * baseStamina = strength * 1.4 (strength determines endurance capacity)
     * experienceBonus = experience * 20
     * conditioningBonus = min(strength/weight * 10, 20)
     * maxStamina = baseStamina + experienceBonus + conditioningBonus
     */
    private calculateMaxStamina(): number {
        const { weight, strength, experience } = this.unit.attributes;

        // Base stamina from strength (endurance capacity)
        const baseStamina = strength * 1.4;

        // Experience bonus: combat training improves stamina pool
        const experienceBonus = experience * 20;

        // Conditioning bonus: strength-to-weight ratio up to +20
        const conditioningRatio = strength / weight;
        const conditioningBonus = Math.min(conditioningRatio * 10, 20);

        return baseStamina + experienceBonus + conditioningBonus;
    }

    /**
     * Consumes stamina for an action
     * Applies experience reduction and weight/equipment modifiers
     * @param staminaAmount - Stamina cost in absolute units
     * @param actionType - Type of action for logging/debugging (optional)
     * @returns Actual stamina consumed
     */
    consumeStamina(staminaAmount: number, actionType?: string): number {
        // Apply experience reduction (up to 30% reduction)
        const experienceReduction = this.unit.attributes.experience * 0.3;
        const experienceModifier = 1 - experienceReduction;

        // Apply weight/equipment modifier
        const weightModifier = this.getWeightModifier();

        // TODO: Apply pain effects when pain system is available
        // Each 10 points of pain: +10% stamina costs
        const painModifier = 1.0; // Placeholder

        // Calculate final cost
        const finalAmount = staminaAmount * experienceModifier * weightModifier * painModifier;
        const actualConsumption = Math.min(finalAmount, this._stamina);

        this._stamina -= actualConsumption;

        return actualConsumption;
    }

    /**
     * Recovers stamina over time based on current recovery context
     * @param deltaTime - Time elapsed since last update in seconds
     */
    recoverStamina(deltaTime: number): void {
        if (this.isExhausted) {
            // No natural recovery when exhausted
            return;
        }

        const recoveryRate = this.getRecoveryRate();
        const recoveryAmount = recoveryRate * deltaTime;

        this._stamina = Math.min(this._stamina + recoveryAmount, this._maxStamina);
    }

    /**
     * Gets weight/equipment modifier for stamina costs
     * More realistic formula: moderate penalty based on weight vs strength
     * Base assumption: 70kg person with 50 strength = 1.0 multiplier
     */
    private getWeightModifier(): number {
        const { strength } = this.unit.attributes;
        const totalWeight = this.unit.weight;

        // Calculate weight excess/deficit from baseline (70kg)
        const baselineWeight = 70;
        const weightDifference = totalWeight - baselineWeight;
        
        // Calculate strength difference from baseline (50)
        const baselineStrength = 50;
        const strengthDifference = strength - baselineStrength;
        
        // Combined effect: +1% cost per kg over baseline, -1% per strength point over baseline
        const weightPenalty = weightDifference * 0.01;
        const strengthBonus = strengthDifference * 0.01;
        
        // Net modifier (minimum 0.8, maximum 1.5 for reasonable bounds)
        const modifier = 1.0 + weightPenalty - strengthBonus;
        return Math.max(0.8, Math.min(1.5, modifier));
    }

    /**
     * Gets recovery rate for current recovery context
     * Rates from GAME_MECHANICS.md (absolute units per second)
     * TODO: Apply pain effects when pain system is available
     * TODO: Apply experience bonus when experience system is available
     */
    private getRecoveryRate(): number {
        const percentageRate = staminaRecoveryRates[this.recoveryContext];
        const baseRecoveryRate = percentageRate * this._maxStamina;
    
        // Apply experience bonus (up to 20% improvement)
        const experienceBonus = this.unit.attributes.experience * 0.2;
        const experienceModifier = 1 + experienceBonus;

        // TODO: Apply pain effects when pain system is available
        // Each 10 points of pain: -5% recovery rate
        const painModifier = 1.0; // Placeholder

        // Calculate final recovery rate (absolute units per second)
        return baseRecoveryRate * experienceModifier * painModifier; 
    }



    /**
     * Forces stamina to a specific value (for testing or special events)
     * @param amount - New stamina amount in absolute units
     */
    setStamina(amount: number): void {
        this._stamina = Math.max(0, Math.min(amount, this._maxStamina));
    }

    /**
     * Recalculates maximum stamina (call when unit attributes change)
     * TODO: should be triggered by event when attributes changes
     */
    recalculateMaxStamina(): void {
        const oldMax = this._maxStamina;
        this._maxStamina = this.calculateMaxStamina();

        // Adjust current stamina proportionally if max changed
        if (oldMax > 0) {
            const ratio = this._stamina / oldMax;
            this._stamina = ratio * this._maxStamina;
        }
    }

    /**
     * Creates a summary object for serialization/display
     */
    getSummary() {
        return {
            stamina: this._stamina,
            maxStamina: this._maxStamina,
            staminaPercentage: this.staminaPercentage,
            isExhausted: this.isExhausted,
            weightModifier: this.getWeightModifier(),
            recoveryContext: this.recoveryContext
        };
    }

    /**
     * Updates stamina recovery over time
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime: number): void {
        this.recoverStamina(deltaTime);
    }
} 