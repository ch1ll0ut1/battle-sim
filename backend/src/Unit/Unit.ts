import { movementConfig } from '../config/movement.js';
import { TickUpdate } from '../utils/TickUpdate.js';
import { Position } from './Position.js';
import { UnitAttributes, UnitAttributesData } from './UnitAttributes.js';
import { UnitMovement } from './UnitMovement.js';
import { UnitMovementPhysics } from './UnitMovementPhysics.js';
import { UnitStamina } from './UnitStamina.js';

/**
 * Core unit class that represents a combatant in the battle simulation.
 * Uses component-based architecture for modularity and extensibility.
 * This is the main entity that other systems interact with.
 */
export class Unit implements TickUpdate {
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
    readonly movement: UnitMovement | UnitMovementPhysics;

    /**
     * Stamina component handles energy levels, consumption, and recovery
     * Manages recovery context automatically based on unit state
     */
    readonly stamina: UnitStamina;

    /**
     * Equipment weight in kg (armor, weapons, carried items)
     * TODO: Refactor to proper Equipment/Inventory system later
     */
    readonly equipment = {
        weight: 0,
    };

    // Placeholder for future components - these will be added as we build the system
    // readonly combat: CombatComponent;     // Will handle actions, combat state, pain
    // readonly body: BodyComponent;         // Will handle injuries, health, body parts  
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

        if (movementConfig.movementSystem === 'simple') {
            this.movement = new UnitMovement(this, position, direction);
        } else {
            this.movement = new UnitMovementPhysics(this, position, direction);
        }

        // Initialize stamina component with full stamina
        this.stamina = new UnitStamina(this, 100);
    }

    /**
     * Gets the total weight of the unit including body weight and equipment
     */
    get weight(): number {
        return this.attributes.weight + this.equipment.weight;
    }

    /**
     * Gets a comprehensive summary of this unit for display/serialization
     * @returns Object containing all unit information
     */
    getState() {
        return {
            id: this.id,
            name: this.name,
            team: this.team,
            attributes: this.attributes.getState(),
            movement: this.movement.getState(),
            stamina: this.stamina.getState()
        };
    }

    /**
     * Updates the unit's state and all component systems
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime: number): void {
        // Update movement component first
        this.movement.update(deltaTime);
        
        // Update stamina (it will derive recovery context automatically)
        this.stamina.update(deltaTime);
        
        // TODO: When other components are implemented, call their update methods here
        // this.combat.update(deltaTime);
        // this.body.update(deltaTime);
        // this.work.update(deltaTime);
    }
} 