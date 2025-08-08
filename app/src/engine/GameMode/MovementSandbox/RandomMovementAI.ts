import { Map } from '../../../game/Map/Map';
import { Unit } from '../../../game/Unit/Unit';

/**
 * AI system that issues random movement orders to units
 * Used for benchmarking and testing movement systems
 */
export class RandomMovementAI {
    private readonly minDistance: number;
    private readonly maxDistance: number;
    private readonly map: Map;

    constructor(
        map: Map,
        minDistance = 50,
        maxDistance = 300,
    ) {
        this.map = map;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
    }

    /**
     * Updates units by issuing random movement orders to stationary units
     */
    updateUnits(units: Unit[]): void {
        units
            .filter(unit => !unit.movement.isMoving)
            .forEach((unit) => {
                const targetPosition = this.generateRandomMoveTarget(unit);
                unit.movement.moveTo(targetPosition);
            });
    }

    /**
     * Generates a random movement target based on unit's current position
     * Target is within minDistance to maxDistance range and stays within map bounds
     */
    private generateRandomMoveTarget(unit: Unit): { x: number; y: number } {
        const { x, y } = unit.movement.position;

        // Generate random distance within configured range
        const distance = Math.random() * (this.maxDistance - this.minDistance) + this.minDistance;

        // Generate random direction (0 to 2π radians)
        const angle = Math.random() * 2 * Math.PI;

        // Calculate new position based on current position + distance in random direction
        const newX = x + Math.cos(angle) * distance;
        const newY = y + Math.sin(angle) * distance;

        // Clamp to map bounds (getting current map size)
        return {
            x: Math.max(0, Math.min(this.map.width, newX)),
            y: Math.max(0, Math.min(this.map.height, newY)),
        };
    }
}
