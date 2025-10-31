import { TickUpdate } from '../../engine/TickUpdate';
import { Position } from './Position';
import { UnitAi } from './UnitAi';
import { UnitAttributes, UnitAttributesData } from './UnitAttributes';
import { UnitCombat, UnitCombatState } from './UnitCombat';
import { UnitHealth, UnitHealthState } from './UnitHealth';
import { UnitMovementPhysics, UnitMovementState } from './UnitMovementPhysics';
import { UnitStamina, UnitStaminaState } from './UnitStamina';

/**
 * Unit state is a snapshot of the unit's state at a given time.
 * It is used to render the unit and to update the unit's state on the client.
 */
export interface UnitState {
    id: number;
    name: string;
    team: number;
    attributes: UnitAttributesData;
    movement: UnitMovementState;
    stamina: UnitStaminaState;
    health: UnitHealthState;
    combat: UnitCombatState;
    armor: string;
    equipment: {
        weight: number;
    };
};

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
    readonly movement: /* UnitMovement |  */UnitMovementPhysics;

    /**
     * Stamina component handles energy levels, consumption, and recovery
     * Manages recovery context automatically based on unit state
     */
    readonly stamina: UnitStamina;

    /**
     * Health component handles injuries, consciousness, blood loss, and body part functionality
     * Tracks all physical damage and its effects on combat effectiveness
     */
    readonly health: UnitHealth;

    /**
     * Combat component handles actions, weapon handling, and combat calculations
     * Integrates with health and stamina for realistic combat mechanics
     */
    readonly combat: UnitCombat;

    /**
     * AI component that controls autonomous unit behavior
     * Injected by game mode (e.g., UnitCombatAi for battle scenarios)
     * Null means unit has no autonomous behavior
     */
    private ai: UnitAi | null = null;

    /**
     * Armor worn by the unit
     */
    private armor: import('./Armor').Armor | null = null;

    /**
     * Equipment weight in kg (armor, weapons, carried items)
     */
    get equipmentWeight(): number {
        return (this.armor?.weight ?? 0);
    }

    // Placeholder for future components
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
        direction = 0,
    ) {
        this.id = id;
        this.name = name;
        this.team = team;
        this.attributes = new UnitAttributes(attributes);

        // if (movementConfig.movementSystem === 'simple') {
        //     this.movement = new UnitMovement(this, position, direction);
        // }
        // else {
        // }
        this.movement = new UnitMovementPhysics(this, position, direction);

        // Initialize stamina component with full stamina
        this.stamina = new UnitStamina(this, 100);

        // Initialize health component
        this.health = new UnitHealth(this);

        // Initialize combat component
        this.combat = new UnitCombat(this);
    }

    /**
     * Gets the total weight of the unit including body weight and equipment
     */
    get weight() {
        return this.attributes.weight + this.equipmentWeight;
    }

    /**
     * Equips armor on the unit
     */
    equipArmor(armor: import('./Armor').Armor) {
        this.armor = armor;
    }

    /**
     * Gets the currently equipped armor
     */
    getArmor() {
        return this.armor;
    }

    /**
     * Gets a comprehensive summary of this unit for display/serialization
     * @returns Object containing all unit information
     */
    getState(): UnitState {
        return {
            id: this.id,
            name: this.name,
            team: this.team,
            attributes: this.attributes.getState(),
            movement: this.movement.getState(),
            stamina: this.stamina.getState(),
            health: this.health.getState(),
            combat: this.combat.getState(),
            armor: this.armor?.name ?? 'None',
            equipment: {
                weight: this.equipmentWeight,
            },
        };
    }

    /**
     * Sets the AI for this unit
     * Game modes inject AI implementations to control unit behavior
     * @param ai - AI implementation or null to remove AI
     */
    setAi(ai: UnitAi | null) {
        this.ai = ai;
    }

    /**
     * Updates the unit's state and all component systems
     * @param deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime: number) {
        // Let AI make decisions first (if present)
        if (this.ai) {
            this.ai.update(this, deltaTime);
        }

        // Update movement component
        this.movement.update(deltaTime);

        // Update stamina (it will derive recovery context automatically)
        this.stamina.update(deltaTime);

        // Update health (injuries, bleeding, consciousness)
        this.health.update(deltaTime);

        // Update combat state
        this.combat.update(deltaTime);

        // TODO: When other components are implemented, call their update methods here
        // this.work.update(deltaTime);
    }
}
