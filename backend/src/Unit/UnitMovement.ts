import { TickUpdate } from "../utils/TickUpdate";
import { Position } from "./Position";
import { Unit } from "./Unit";

/**
 * Movement state for simple movement system
 */
type MovementState = 'stationary' | 'walking' | 'running';

/**
 * Simple UnitMovement handles spatial positioning, orientation, and movement actions for units.
 * This component manages where a unit is located, which direction it's facing,
 * and processes movement over time based on unit attributes and physical state.
 * Uses simple instant movement with basic speed calculations.
 */
export class UnitMovement implements TickUpdate {
    /**
     * Current position on the battlefield
     * Coordinates are in battlefield units (meters)
     */
    private _position: Position;

    /**
     * Current facing direction in radians
     * 0 = facing right/east, π/2 = facing up/north, π = facing left/west, 3π/2 = facing down/south
     */
    private _direction: number;

    /**
     * Current movement state affecting speed and stamina
     */
    private _movementState: MovementState = 'stationary';

    /**
     * Target position for current movement action
     * Null when not moving
     */
    private _targetPosition: Position | null = null;

    /**
     * Creates a new UnitMovement component
     * @param unit - Reference to the parent unit for accessing attributes and body state
     * @param position - Starting position (defaults to origin)
     * @param direction - Starting direction in radians (defaults to 0/east)
     */
    constructor(
        private unit: Unit,
        position: Position = { x: 0, y: 0 },
        direction: number = 0
    ) {
        this._position = position;
        this._direction = this.normalizeDirection(direction);
    }

    /**
     * Gets the X coordinate
     */
    get x(): number {
        return this._position.x;
    }

    /**
     * Gets the Y coordinate
     */
    get y(): number {
        return this._position.y;
    }

    /**
     * Gets the current direction in radians
     */
    get direction(): number {
        return this._direction;
    }

    /**
     * Gets the current movement state
     */
    get state(): MovementState {
        return this._movementState;
    }

    /**
     * Checks if the unit is currently moving
     */
    get isMoving(): boolean {
        return this._movementState !== 'stationary';
    }

    /**
     * Initiates movement to a target position
     * Sets up movement state that will be processed over time in update()
     * @param target - Position to move towards
     * @param urgent - If true, uses running speed; otherwise walking speed
     */
    moveTo(target: Position, urgent: boolean = false): void {
        this._targetPosition = target;
        this._movementState = urgent ? 'running' : 'walking';
        
        // Face towards the target
        this.faceTowards(target);
    }

    /**
     * Stops current movement and returns to stationary state
     */
    stop(): void {
        this._movementState = 'stationary';
        this._targetPosition = null;
    }

    /**
     * Sets the direction to face the given position
     * @param target - Position to face towards
     */
    faceTowards(target: Position): void {
        this._direction = this.normalizeDirection(Math.atan2(
            target.y - this._position.y,
            target.x - this._position.x
        ));
    }

    /**
     * Calculates current movement speed in meters per second
     * Based on game mechanics: unit attributes, movement state, and future body state
     * @returns Movement speed in m/s
     */
    private calculateMovementSpeed(): number {
        // Base walking speed from game mechanics
        const baseWalkingSpeed = 1.4; // m/s
        
        // Running multiplier
        const speedMultiplier = this._movementState === 'running' ? 2.0 : 1.0;
        
        const { strength, weight } = this.unit.attributes;

        // TODO: When unit.attributes is implemented, add modifiers:
        // - Strength bonus: +0.5% per point above 50 (max +25%)
        const strengthBonus = strength > 50 ? (strength - 50) * 0.005 : 0;
        // - Weight penalty: -0.5% per kg above 70kg
        const weightPenalty = weight > 70 ? (weight - 70) * 0.005 : 0;
        // - Stamina penalty: linear reduction to 70% when below 50%
        // - Leg injury penalty: direct percentage reduction
        
        // For now, return base speed with running multiplier
        return baseWalkingSpeed * speedMultiplier * (1 + strengthBonus) * (1 - weightPenalty);
    }

    /**
     * Calculates distance to target position
     * @param target - Target position
     * @returns Distance in meters
     */
    private distanceTo(target: Position): number {
        const dx = target.x - this._position.x;
        const dy = target.y - this._position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Moves towards target position by the given distance
     * @param target - Target position
     * @param maxDistance - Maximum distance to move
     * @returns true if the target was reached, false otherwise
     */
    private moveTowards(target: Position, maxDistance: number) {
        const distance = this.distanceTo(target);
        
        if (distance <= maxDistance) {
            this._position = target;
            return true;
        }
        
        const ratio = maxDistance / distance;

        this._position.x = this._position.x + (target.x - this._position.x) * ratio;
        this._position.y = this._position.y + (target.y - this._position.y) * ratio;

        return false
    }

    /**
     * Normalizes direction to be within [0, 2π) range
     * @param direction - Direction in radians
     * @returns Normalized direction
     */
    private normalizeDirection(direction: number): number {
        const twoPi = 2 * Math.PI;
        let normalized = direction % twoPi;
        if (normalized < 0) {
            normalized += twoPi;
        }
        return normalized;
    }

    /**
     * Gets the direction in degrees for easier debugging/display
     * @returns Direction in degrees (0-360)
     */
    getDirectionDegrees(): number {
        return (this._direction * 180) / Math.PI;
    }

    /**
     * Creates a summary object for serialization/display
     * @returns Object containing position, direction, and movement state information
     */
    getState() {
        return {
            position: this._position,
            direction: this._direction,
            directionDegrees: this.getDirectionDegrees(),
            state: this._movementState,
            targetPosition: this._targetPosition
        };
    }

    /**
     * Processes movement over time based on current movement state
     * Updates position towards target if moving
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime: number): void {
        // Only process movement if we have a target and are moving
        if (!this.isMoving || !this._targetPosition) {
            return;
        }

        // Calculate current movement speed
        const currentSpeed = this.calculateMovementSpeed();
        
        // Calculate maximum distance we can move this frame
        const maxMoveDistance = currentSpeed * deltaTime;
        
        // Move towards target
        const reachedTarget = this.moveTowards(this._targetPosition, maxMoveDistance);
        
        if (reachedTarget) {
            this.stop();
        }
    }
} 