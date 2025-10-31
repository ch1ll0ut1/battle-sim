import { Unit } from './Unit';

/**
 * UnitAi interface defines autonomous behavior for units
 * Different game modes can inject different AI implementations
 * Single responsibility: Define AI contract
 */
export interface UnitAi {
    /**
     * Updates the unit's autonomous behavior
     * Called every frame by Unit.update()
     * @param unit - The unit this AI is controlling
     * @param deltaTime - Time elapsed since last update
     */
    update(unit: Unit, deltaTime: number): void;

    /**
     * Resets AI state (called when battle/mode resets)
     */
    reset(): void;
}
