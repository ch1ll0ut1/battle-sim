import { Unit } from './Unit';
import { events, GameEvent } from '../events';

/**
 * Action types that units can perform in combat
 */
export type ActionType = 'attack' | 'heavyAttack' | 'block' | 'dodge' | 'riposte' | 'idle';

/**
 * Action state tracks the current phase of an action
 */
export type ActionState = 'idle' | 'executing' | 'recovering';

/**
 * Action timing configuration based on HEMA research
 * Recovery times increased to realistic values (time to return to guard and be ready)
 */
export const ACTION_TIMINGS = {
    attack: {
        execution: 0.4, // 400ms to execute
        recovery: 0.25, // 250ms recovery (was 100ms)
    },
    heavyAttack: {
        execution: 0.6, // 600ms to execute (slower)
        recovery: 0.35, // 350ms recovery (was 150ms)
    },
    block: {
        execution: 0.2, // 200ms to execute
        recovery: 0.15, // 150ms recovery (was 50ms)
    },
    dodge: {
        execution: 0.3, // 300ms to execute
        recovery: 0.1, // 100ms recovery
    },
    riposte: {
        execution: 0.3, // 300ms - faster than normal attack
        recovery: 0.15, // 150ms recovery
    },
    idle: {
        execution: 0,
        recovery: 0,
    },
};

/**
 * Represents a single combat action being performed by a unit
 * Tracks execution state, timing, and target
 */
export class UnitAction {
    /**
     * Type of action being performed
     */
    readonly type: ActionType;

    /**
     * Target unit (if applicable)
     */
    readonly target: Unit | null;

    /**
     * Current state of the action
     */
    state: ActionState;

    /**
     * Time when the action started (in seconds)
     */
    readonly startTime: number;

    /**
     * Time required to execute the action (in seconds)
     */
    readonly executionTime: number;

    /**
     * Time required to recover after execution (in seconds)
     */
    readonly recoveryTime: number;

    /**
     * Whether this action can be interrupted during execution
     * Recovery phase cannot be interrupted
     */
    canInterrupt: boolean;

    /**
     * Whether the action has been executed (damage applied, etc.)
     */
    hasExecuted: boolean;

    /**
     * Unit performing the action (stored for event emissions)
     */
    private readonly unit: Unit;

    /**
     * Creates a new action
     * @param type - Type of action
     * @param target - Target unit (if applicable)
     * @param currentTime - Current simulation time
     * @param unit - Unit performing the action (for timing modifiers)
     */
    constructor(type: ActionType, target: Unit | null, currentTime: number, unit: Unit) {
        this.unit = unit;
        this.type = type;
        this.target = target;
        this.state = 'executing';
        this.startTime = currentTime;
        this.hasExecuted = false;

        // Get base timings
        const baseTiming = ACTION_TIMINGS[type];
        let executionTime = baseTiming.execution;
        let recoveryTime = baseTiming.recovery;

        // Apply experience modifier (up to 25% faster execution, 20% faster recovery)
        // From GAME_MECHANICS.md line 171-177
        executionTime *= (1 - unit.attributes.experience * 0.25);
        recoveryTime *= (1 - unit.attributes.experience * 0.2);

        // Apply stamina effects (line 163-169)
        const staminaPercentage = unit.stamina.staminaPercentage;
        if (staminaPercentage < 50) {
            executionTime *= 1.2; // +20%
        }
        if (staminaPercentage < 25) {
            executionTime *= 1.5 / 1.2; // Total +50% (1.5x)
        }
        if (staminaPercentage < 10) {
            executionTime *= 2.0 / 1.5; // Total +100% (2.0x)
        }

        // Apply injury effects to execution time (line 157-161)
        // Reduced arm functionality for attack actions
        if (type === 'attack' || type === 'heavyAttack' || type === 'block' || type === 'riposte') {
            const leftArmFunc = unit.health.getBodyPartFunctionality('leftArm');
            const rightArmFunc = unit.health.getBodyPartFunctionality('rightArm');
            const bestArmFunc = Math.max(leftArmFunc, rightArmFunc);
            if (bestArmFunc < 100) {
                executionTime *= (100 / Math.max(bestArmFunc, 10)); // Prevent division by zero
            }
        }

        // Reduced leg functionality for dodge
        if (type === 'dodge') {
            const leftLegFunc = unit.health.getBodyPartFunctionality('leftLeg');
            const rightLegFunc = unit.health.getBodyPartFunctionality('rightLeg');
            const worstLegFunc = Math.min(leftLegFunc, rightLegFunc);
            if (worstLegFunc < 100) {
                executionTime *= (100 / Math.max(worstLegFunc, 10));
            }
        }

        this.executionTime = executionTime;
        this.recoveryTime = recoveryTime;

        // Ripostes are uninterruptible (committed response after successful block)
        // Other actions can be interrupted during execution
        this.canInterrupt = type !== 'riposte';

        // Emit attack events for offensive actions
        if (target && (type === 'attack' || type === 'heavyAttack' || type === 'riposte')) {
            events.emit(GameEvent.attackPreparing, {
                attackerId: unit.id,
                targetId: target.id,
                attackType: type,
            });
            events.emit(GameEvent.attackExecuting, {
                attackerId: unit.id,
                targetId: target.id,
                attackType: type,
            });
        }
    }

    /**
     * Updates the action state based on elapsed time
     * @param currentTime - Current simulation time
     * @returns True if action is complete
     */
    update(currentTime: number) {
        const elapsed = currentTime - this.startTime;

        if (this.state === 'executing') {
            if (elapsed >= this.executionTime) {
                // Execution phase complete, enter recovery
                this.state = 'recovering';
                this.canInterrupt = false;
                this.hasExecuted = true;

                // Emit attack completed event for offensive actions
                if (this.target && (this.type === 'attack' || this.type === 'heavyAttack' || this.type === 'riposte')) {
                    events.emit(GameEvent.attackCompleted, {
                        attackerId: this.unit.id,
                        targetId: this.target.id,
                    });
                }

                return false;
            }
        }
        else if (this.state === 'recovering') {
            if (elapsed >= this.executionTime + this.recoveryTime) {
                // Action complete
                this.state = 'idle';
                return true;
            }
        }

        return false;
    }

    /**
     * Gets the progress through the action (0.0 to 1.0)
     */
    getProgress(currentTime: number) {
        const elapsed = currentTime - this.startTime;
        const totalTime = this.executionTime + this.recoveryTime;
        return Math.min(1.0, elapsed / totalTime);
    }

    /**
     * Interrupts the action if possible
     * @returns True if action was interrupted
     */
    interrupt() {
        if (this.canInterrupt && this.state === 'executing') {
            this.state = 'idle';
            return true;
        }
        return false;
    }
}
