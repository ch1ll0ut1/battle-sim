import { UnitAttributes, UnitAttributesData } from './UnitAttributes.js';
import { UnitMovement, Position } from './UnitMovement.js';

/**
 * Core unit class that represents a combatant in the battle simulation.
 * Uses component-based architecture for modularity and extensibility.
 * This is the main entity that other systems interact with.
 */
export class Unit {
    /**
     * Unique identifier for this unit
     */
    readonly id: number;

    /**
     * Display name for this unit
     */
    readonly name: string;

    /**
     * Team identifier (1, 2, etc.)
     * Units on the same team don't fight each other
     */
    readonly team: number;

    /**
     * Core physical and mental attributes manager
     * Contains weight, strength, experience, age, gender and related methods
     */
    readonly attributes: UnitAttributes;

    /**
     * Location component handles position and facing direction
     */
    readonly movement: UnitMovement;

    // Placeholder for future components - these will be added as we build the system
    // readonly combat: CombatComponent;     // Will handle stamina, actions, combat state
    // readonly body: BodyComponent;         // Will handle injuries, health, body parts  
    // readonly movement: MovementComponent; // Will handle pathfinding, speed calculations, spatial queries
    // readonly work: WorkComponent;         // Will handle non-combat activities

    /**
     * Creates a new Unit instance
     * @param id - Unique identifier
     * @param name - Display name
     * @param team - Team identifier
     * @param attributes - Core physical/mental attributes object
     * @param position - Starting position (defaults to origin)
     * @param direction - Starting direction in radians (defaults to 0/east)
     */
    constructor(
        id: number,
        name: string,
        team: number,
        attributes: UnitAttributesData,
        position: Position = { x: 0, y: 0 },
        direction: number = 0
    ) {
        this.id = id;
        this.name = name;
        this.team = team;
        this.attributes = new UnitAttributes(attributes);
        this.movement = new UnitMovement(this, position, direction);
    }

    /**
     * Gets a comprehensive summary of this unit for display/serialization
     * @returns Object containing all unit information
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            team: this.team,
            attributes: this.attributes.getSummary(),
            location: this.movement.getSummary()
        };
    }

    /**
     * Updates the unit's state (placeholder for component updates)
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime: number): void {
        // Update all components
        this.movement.update(deltaTime);
        
        // TODO: When other components are implemented, call their update methods here
        // this.combat.update(deltaTime);
        // this.body.update(deltaTime);
        // this.movement.update(deltaTime);
        // this.work.update(deltaTime);
    }
} 