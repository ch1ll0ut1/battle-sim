import { Unit } from './Unit';
import { UnitAttributesData } from './UnitAttributes';
import { createBasicSword } from './Weapon';
import { Position } from './Position';
import { createPlateArmor } from './Armor';

/**
 * WarriorFactory creates units with different experience levels
 * Single responsibility: Warrior creation with balanced attributes
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class WarriorFactory {
    private static unitIdCounter = 1;

    /**
     * Creates a novice warrior (0.1 experience)
     * Low stamina, weak attacks, slow reactions
     * @param withArmor - If true, equips plate armor
     */
    static createNovice(name: string, team: number, position: Position, direction = 0, withArmor = false): Unit {
        const attributes: UnitAttributesData = {
            weight: 75,
            strength: 35, // Weak
            experience: 0.1, // Novice
            age: 20,
            gender: 'male',
        };

        const unit = new Unit(
            this.unitIdCounter++,
            name,
            team,
            attributes,
            position,
            direction,
        );

        unit.combat.equipWeapon(createBasicSword());
        if (withArmor) {
            unit.equipArmor(createPlateArmor());
        }
        return unit;
    }

    /**
     * Creates a trained warrior (0.3 experience)
     * Moderate survivability, decent blocks/dodges
     * Medium stamina, average attacks
     */
    static createTrained(name: string, team: number, position: Position, direction = 0): Unit {
        const attributes: UnitAttributesData = {
            weight: 75,
            strength: 50, // Average
            experience: 0.3, // Trained
            age: 25,
            gender: 'male',
        };

        const unit = new Unit(
            this.unitIdCounter++,
            name,
            team,
            attributes,
            position,
            direction,
        );

        unit.combat.equipWeapon(createBasicSword());
        return unit;
    }

    /**
     * Creates a veteran warrior (0.5 experience)
     * High stamina, powerful attacks, fast reactions
     * Should fight 20-30 seconds against another veteran (with armor)
     * @param withArmor - If true, equips plate armor
     */
    static createVeteran(name: string, team: number, position: Position, direction = 0, withArmor = false): Unit {
        const attributes: UnitAttributesData = {
            weight: 75,
            strength: 70, // Strong
            experience: 0.5, // Veteran
            age: 32,
            gender: 'male',
        };

        const unit = new Unit(
            this.unitIdCounter++,
            name,
            team,
            attributes,
            position,
            direction,
        );

        unit.combat.equipWeapon(createBasicSword());
        if (withArmor) {
            unit.equipArmor(createPlateArmor());
        }
        return unit;
    }

    /**
     * Creates an elite warrior (0.95 experience)
     * Peak stamina, devastating attacks, lightning-fast reactions
     * Should fight 40-60 seconds against another elite (with armor)
     * @param withArmor - If true, equips plate armor
     */
    static createElite(name: string, team: number, position: Position, direction = 0, withArmor = false): Unit {
        const attributes: UnitAttributesData = {
            weight: 72, // Lean
            strength: 90, // Peak strength
            experience: 0.95, // Elite
            age: 35,
            gender: 'male',
        };

        const unit = new Unit(
            this.unitIdCounter++,
            name,
            team,
            attributes,
            position,
            direction,
        );

        unit.combat.equipWeapon(createBasicSword());
        if (withArmor) {
            unit.equipArmor(createPlateArmor());
        }
        return unit;
    }

    /**
     * Resets the unit ID counter (useful for testing)
     */
    static resetCounter() {
        this.unitIdCounter = 1;
    }
}
