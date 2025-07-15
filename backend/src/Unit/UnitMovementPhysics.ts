import { Position } from './Position.js';
import { Unit } from './Unit.js';
import { movementConfig } from '../config/movement.js';
import { TickUpdate } from '../utils/TickUpdate.js';

type MovementState = 'stationary' | 'accelerating' | 'moving' | 'decelerating';

export const METERS_TO_PIXELS = 100;

/**
 * Physics-based UnitMovement with realistic momentum, acceleration, and turning.
 * Implements the same public interface as UnitMovement for drop-in replacement.
 * This component manages where a unit is located, which direction it's facing,
 * and processes movement over time with realistic physics constraints.
 */
export class UnitMovementPhysics implements TickUpdate {
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
     * Physics state - current velocities
     */
    private _currentSpeed: number = 0;           // Current linear velocity (m/s)
    private _currentTurnRate: number = 0;        // Current angular velocity (rad/s)

    /**
     * Physics targets - where the unit wants to go
     */
    private _targetSpeed: number = 0;            // Target speed to reach
    private _targetDirection: number | null = null; // Target direction to turn towards
    private _isRunning: boolean = false;         // Whether unit is trying to run vs walk

    /**
     * Current movement state based on physics
     */
    private _movementState: MovementState = 'stationary';

    /**
     * Cached calculations for performance
     */
    private _maxSpeed: number = 0;
    private _acceleration: number = 0;
    private _maxTurnRate: number = 0;
    private _cacheValid: boolean = false;

    /**
     * Creates a new physics-based UnitMovement component
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
     * Checks if the unit is currently moving or has movement intent
     */
    get isMoving(): boolean {
        return this._currentSpeed > 0.1 || this._targetSpeed > 0.1;
    }

    /**
     * Gets current speed for external access
     */
    get currentSpeed(): number {
        return this._currentSpeed;
    }

    /**
     * Gets current turn rate for external access
     */
    get currentTurnRate(): number {
        return this._currentTurnRate;
    }

    /**
     * Initiates movement to a target position with realistic physics
     * Sets up movement targets that will be processed over time in update()
     * @param target - Position to move towards
     * @param urgent - If true, uses running speed; otherwise walking speed
     */
    moveTo(target: Position, urgent: boolean = false): void {
        this._isRunning = urgent;
        this._targetSpeed = this.calculateBaseSpeed();
        this.faceTowards(target);
        
        // Invalidate cache since movement parameters changed
        this.invalidateCache();
    }

    /**
     * Stops current movement with realistic deceleration
     */
    stop(): void {
        this._targetSpeed = 0;
        this._targetDirection = null;
        this._isRunning = false;
    }

    /**
     * Sets the target direction to face the given position
     * @param target - Position to face towards
     */
    faceTowards(target: Position): void {
        const newDirection = this.normalizeDirection(Math.atan2(
            target.y - this._position.y,
            target.x - this._position.x
        ));
        
        // If stationary, turn instantly (no momentum)
        if (this._currentSpeed < 0.1) {
            this._direction = newDirection;
            this._targetDirection = null;
        } else {
            // If moving, set as target for gradual turning
            this._targetDirection = newDirection;
        }
    }

    /**
     * Emergency stop with maximum deceleration
     */
    emergencyStop(): void {
        this._targetSpeed = 0;
        this._targetDirection = null;
        this._isRunning = false;
        // Could implement higher deceleration rate for emergency stops
    }

    /**
     * Calculates base movement speed (before physics constraints)
     */
    private calculateBaseSpeed(): number {
        const baseWalkingSpeed = 1.4; // m/s
        const runningMultiplier = this._isRunning ? 2.0 : 1.0;
        return baseWalkingSpeed * runningMultiplier;
    }

    /**
     * Calculates maximum speed based on current unit state and equipment
     */
    private calculateMaxSpeed(): number {
        const baseSpeed = this.calculateBaseSpeed();
        
        // Strength bonus: +0.5% per point above 50 (max +25%)
        const strengthBonus = Math.min(0.25, Math.max(0, (this.unit.attributes.strength - 50) * 0.005));
        
        // Total weight penalty: -0.3% per kg above 70kg (includes equipment)
        const weightPenalty = Math.max(0, (this.unit.weight - 70) * 0.003);
        
        // Stamina effect: Exponential degradation below 50%
        const staminaEffect = this.getStaminaEffect();
        
        // Leg injury effect: Minimum of both legs (placeholder for future body system)
        const legEffect = 1.0; // TODO: Integrate with body system when available
        
        return baseSpeed * (1 + strengthBonus) * (1 - weightPenalty) * staminaEffect * legEffect;
    }

    /**
     * Calculates acceleration based on strength-to-weight ratio
     */
    private calculateAcceleration(): number {
        const baseAcceleration = 3.0; // m/s²
        const strengthFactor = this.unit.attributes.strength / 50;
        const massInertiaFactor = 70 / this.unit.weight;
        const staminaFactor = this.getStaminaFactor();
        const legEffect = 1.0; // TODO: Integrate with body system
        
        return baseAcceleration * strengthFactor * massInertiaFactor * staminaFactor * legEffect;
    }

    /**
     * Calculates maximum turn rate based on momentum and weight
     */
    private calculateMaxTurnRate(): number {
        const baseTurnRate = 2 * Math.PI; // rad/s when stationary
        
        // Mass inertia: Heavier units have more rotational inertia
        const massInertiaPenalty = this.unit.attributes.weight / 70;
        
        // Linear momentum: Faster movement reduces turn rate significantly
        const speedRatio = this._currentSpeed / (this.calculateMaxSpeed() || 1);
        const linearMomentumPenalty = 1 + (speedRatio * speedRatio) * 2;
        
        // Equipment momentum: Heavy equipment adds rotational inertia
        const equipmentMomentumPenalty = 1 + (this.unit.equipment.weight / 30) * 0.5;
        
        // Stamina penalty: Low stamina affects coordination
        const staminaPenalty = this.getStaminaPenalty();
        
        return baseTurnRate / (massInertiaPenalty * linearMomentumPenalty * equipmentMomentumPenalty * staminaPenalty);
    }

    /**
     * Gets stamina effect on max speed based on current stamina level
     * According to GAME_MECHANICS.md: Above 50% = 1.0x, Below 50% = 0.4 + (stamina / 50) * 0.6
     */
    private getStaminaEffect(): number {
        const staminaPercent = this.unit.stamina.staminaPercentage;
        
        if (staminaPercent >= 50) {
            return 1.0;
        } else {
            // Linear degradation from 40% to 100% = 0.4 + (stamina / 50) * 0.6
            return 0.4 + (staminaPercent / 50) * 0.6;
        }
    }

    /**
     * Gets stamina factor for acceleration based on current stamina level
     * According to GAME_MECHANICS.md: Above 25% = 1.0x, Below 25% = penalty factor
     */
    private getStaminaFactor(): number {
        const staminaPercent = this.unit.stamina.staminaPercentage;
        
        if (staminaPercent >= 25) {
            return 1.0;
        } else {
            // Penalty factor = 25 / stamina (slower acceleration when exhausted)
            return Math.max(0.1, 25 / Math.max(1, staminaPercent)); // Prevent division by zero
        }
    }

    /**
     * Gets stamina penalty for turning based on current stamina level
     * According to GAME_MECHANICS.md: Above 25% = 1.0x, Below 25% = penalty factor
     */
    private getStaminaPenalty(): number {
        const staminaPercent = this.unit.stamina.staminaPercentage;
        
        if (staminaPercent >= 25) {
            return 1.0;
        } else {
            // Penalty factor = 25 / stamina (affects coordination for turning)
            return Math.max(0.1, 25 / Math.max(1, staminaPercent)); // Prevent division by zero
        }
    }

    /**
     * Calculates stamina cost per second based on current movement speed
     * Simple formula: faster movement = exponentially higher cost
     */
    private calculateStaminaCost(): number {
        const currentSpeed = this._currentSpeed;
        
        // No cost when stationary
        if (currentSpeed <= 0.1) {
            return 0;
        }
        
        // Base parameters  
        const baseSpeed = 1.0; // m/s - baseline walking speed
        const baseCost = 0.0025; // stamina units/s at baseline speed (fine-tuned for military entry standards)
        const weightMultiplier = this.unit.weight / 70; // Weight affects all movement
        
        // Speed factor: quadratic relationship (running is much more expensive)
        // speedFactor = (currentSpeed / baseSpeed)^2
        const speedFactor = Math.pow(currentSpeed / baseSpeed, 2);
        
        // Turning cost modifier: Up to +50% cost when turning at max rate
        const turningCostModifier = 1 + (this._currentTurnRate / (this._maxTurnRate || 1)) * 0.5;
        
        // Final cost: baseCost * speedFactor * weightMultiplier * turningModifier * drainFactor
        return baseCost * speedFactor * weightMultiplier * turningCostModifier * movementConfig.staminaDrainFactor;
    }

    /**
     * Gets current stamina cost for external access
     * @returns Stamina cost in absolute units per second
     */
    getStaminaCost(): number {
        return this.calculateStaminaCost();
    }

    /**
     * Updates stamina consumption during movement
     */
    private updateStaminaCosts(deltaTime: number): void {
        const staminaCost = this.calculateStaminaCost() * deltaTime;
        
        // Only consume stamina if actually moving
        if (staminaCost > 0) {
            this.unit.stamina.consumeStamina(staminaCost);
        }
    }

    /**
     * Updates cached physics calculations
     */
    private updateCache(): void {
        if (!this._cacheValid) {
            this._maxSpeed = this.calculateMaxSpeed();
            this._acceleration = this.calculateAcceleration();
            this._maxTurnRate = this.calculateMaxTurnRate();
            this._cacheValid = true;
        }
    }

    /**
     * Invalidates cache when unit state changes
     */
    invalidateCache(): void {
        this._cacheValid = false;
    }

    /**
     * Updates linear movement with realistic acceleration/deceleration
     */
    private updateLinearMovement(deltaTime: number): void {
        this.updateCache();
        
        const deceleration = this._acceleration * 2.0; // Can brake harder than accelerate
        
        if (this._currentSpeed < this._targetSpeed) {
            // Accelerating
            const speedIncrease = Math.min(this._acceleration * deltaTime, this._targetSpeed - this._currentSpeed);
            this._currentSpeed += speedIncrease;
        } else if (this._currentSpeed > this._targetSpeed) {
            // Decelerating
            const speedDecrease = Math.min(deceleration * deltaTime, this._currentSpeed - this._targetSpeed);
            this._currentSpeed -= speedDecrease;
        }
        
        // Cap at maximum possible speed
        this._currentSpeed = Math.min(this._currentSpeed, this._maxSpeed);
        
        // Update position based on current speed
        if (this._currentSpeed > 0) {
            const directionVector = this.getDirectionVector();
            this._position.x += directionVector.x * this._currentSpeed * deltaTime * METERS_TO_PIXELS;
            this._position.y += directionVector.y * this._currentSpeed * deltaTime * METERS_TO_PIXELS;
        }
    }

    /**
     * Updates angular movement with realistic turn rate limits
     */
    private updateAngularMovement(deltaTime: number): void {
        if (this._targetDirection === null) {
            this._currentTurnRate = 0;
            return;
        }
        
        this.updateCache();
        const angleDiff = this.getShortestAngleDifference(this._direction, this._targetDirection);
        const maxTurn = this._maxTurnRate * deltaTime;
        
        if (Math.abs(angleDiff) <= maxTurn) {
            // Snap to target when close enough
            this._direction = this._targetDirection;
            this._targetDirection = null;
            this._currentTurnRate = 0;
        } else {
            // Turn towards target at maximum rate
            const turnDirection = angleDiff > 0 ? 1 : -1;
            this._direction += maxTurn * turnDirection;
            this._direction = this.normalizeDirection(this._direction);
            this._currentTurnRate = this._maxTurnRate;
        }
    }

    /**
     * Updates movement state based on current physics
     */
    private updateMovementState(): void {
        const speedThreshold = 0.1; // m/s
        
        if (this._currentSpeed < speedThreshold && this._targetSpeed < speedThreshold) {
            this._movementState = 'stationary';
        } else if (this._currentSpeed < this._targetSpeed * 0.9) {
            this._movementState = 'accelerating';
        } else if (this._currentSpeed > this._targetSpeed * 1.1) {
            this._movementState = 'decelerating';
        } else {
            this._movementState = 'moving';
        }
    }

    /**
     * Gets the shortest angle difference between two directions
     */
    private getShortestAngleDifference(from: number, to: number): number {
        let diff = to - from;
        
        // Normalize to [-π, π]
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        
        return diff;
    }

    /**
     * Normalizes direction to be within [0, 2π) range
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
     */
    getDirectionDegrees(): number {
        return (this._direction * 180) / Math.PI;
    }

    /**
     * Gets a unit vector pointing in the current direction
     */
    getDirectionVector(): { x: number; y: number } {
        return {
            x: Math.cos(this._direction),
            y: Math.sin(this._direction)
        };
    }

    /**
     * Creates a summary object for serialization/display
     */
    getState() {
        return {
            position: { x: this._position.x, y: this._position.y },
            direction: this._direction,
            directionDegrees: this.getDirectionDegrees(),
            state: this._movementState,
            currentSpeed: this._currentSpeed,
            targetSpeed: this._targetSpeed,
            currentTurnRate: this._currentTurnRate,
            maxSpeed: this._maxSpeed,
            acceleration: this._acceleration,
            maxTurnRate: this._maxTurnRate,
            staminaCost: this.getStaminaCost()
        };
    }

    /**
     * Main physics update - processes movement and turning over time
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime: number): void {
        this.updateLinearMovement(deltaTime);
        this.updateAngularMovement(deltaTime);
        this.updateMovementState();
        this.updateStaminaCosts(deltaTime);
    }
} 