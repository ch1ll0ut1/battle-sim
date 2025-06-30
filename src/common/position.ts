/**
 * Position - Represents a 2D coordinate on the battlefield.
 * Provides utility methods for distance, direction, and movement.
 * Used for unit placement, movement, and spatial calculations in the simulation.
 */
export class Position {
  /**
   * Create a new position at (x, y)
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  constructor(public x: number, public y: number) {}

  /**
   * Calculate Euclidean distance to another position
   * @param other - The other position
   * @returns Distance as a float
   */
  distanceTo(other: Position): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate the angle (in radians) from this position to another
   * 0 radians is to the right (positive X axis), PI/2 is up (positive Y axis)
   * @param other - The target position
   * @returns Angle in radians
   */
  directionTo(other: Position): number {
    return Math.atan2(other.y - this.y, other.x - this.x); // radians
  }

  /**
   * Move towards a target position by a given distance
   * Returns a new Position instance (does not mutate original)
   * @param target - The position to move towards
   * @param distance - The distance to move
   * @returns New Position after moving
   */
  moveTowards(target: Position, distance: number): Position {
    const angle = this.directionTo(target);
    return new Position(
      this.x + Math.cos(angle) * distance,
      this.y + Math.sin(angle) * distance
    );
  }
} 