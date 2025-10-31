import { TickUpdate } from '../../engine/TickUpdate';
import {
    BodyPart,
    BODY_PART_PAIN_MULTIPLIERS,
    BODY_PART_SHOCK_MULTIPLIERS,
    Injury,
    InjurySeverity,
} from './Injury';
import { Unit } from './Unit';

/**
 * Consciousness threshold - above this to be able to fight
 */
const CONSCIOUSNESS_THRESHOLD = 30;

export interface UnitHealthState {
    consciousness: number;
    bloodLoss: number;
    isAlive: boolean;
    isConscious: boolean;
    totalPain: number;
    injuries: number;
    bodyPartFunctionality: {
        head: number;
        torso: number;
        leftArm: number;
        rightArm: number;
        leftLeg: number;
        rightLeg: number;
    };
}

/**
 * UnitHealth manages all physical health aspects including injuries, consciousness, and blood loss
 * Tracks injuries to body parts and calculates their effects on combat effectiveness
 * Integrates with Unit to access attributes for resistance calculations
 */
export class UnitHealth implements TickUpdate {
    /**
     * List of all injuries sustained by the unit
     * Each injury affects specific body parts and contributes to overall pain/shock
     */
    private injuries: Injury[] = [];

    /**
     * Current consciousness level (0-100)
     * 0 = unconscious, 100 = fully conscious
     * Affected by shock, blood loss, and injury severity
     */
    private consciousness = 100;

    /**
     * Current blood loss level (0-100)
     * 0 = no blood loss, 40 = fatal blood loss
     * Accumulates from bleeding injuries over time
     * Unit dies when blood loss reaches 40% (realistic fatal threshold)
     */
    private bloodLoss = 0;

    /**
     * Creates a new health component for a unit
     * @param unit - Reference to parent unit for accessing attributes
     */
    constructor(private unit: Unit) {}

    /**
     * Processes a new injury and applies it to the unit
     * Applies body part multipliers to shock and pain
     * Immediately reduces consciousness based on shock
     */
    receiveInjury(injury: Injury) {
        // Create a copy and apply body part multipliers
        const modifiedInjury: Injury = {
            ...injury,
            shock: injury.shock * BODY_PART_SHOCK_MULTIPLIERS[injury.bodyPart],
            pain: injury.pain * BODY_PART_PAIN_MULTIPLIERS[injury.bodyPart],
        };

        // Add the injury
        this.injuries.push(modifiedInjury);

        // Immediate shock effect on consciousness
        const shockMultiplier = modifiedInjury.severity === 'fatal' ? 1.0 : 0.5;
        this.consciousness = Math.max(0, this.consciousness - (modifiedInjury.shock * shockMultiplier));
    }

    /**
     * Updates injury effects over time including bleeding and consciousness
     * Accumulates blood loss from all bleeding injuries
     * Updates consciousness based on shock and blood loss
     */
    update(deltaTime: number) {
        // Accumulate blood loss from all bleeding injuries
        let totalBleeding = 0;
        for (const injury of this.injuries) {
            totalBleeding += injury.bleedingRate;
        }
        this.bloodLoss = Math.min(100, this.bloodLoss + (totalBleeding * deltaTime));

        // Update consciousness based on ongoing shock and blood loss
        const totalShock = this.injuries.reduce((sum, injury) => sum + injury.shock, 0);
        const shockEffect = (totalShock / 100) * (1 - this.unit.attributes.experience * 0.5);
        const bloodLossEffect = this.bloodLoss / 100;

        // Gradual consciousness degradation (reduced from immediate shock)
        this.consciousness = Math.max(0, this.consciousness - (shockEffect + bloodLossEffect) * deltaTime * 0.5);
    }

    /**
     * Checks if the unit is alive
     * Unit is alive if consciousness > 0 and blood loss < 40%
     */
    isAlive() {
        return this.consciousness > 0 && this.bloodLoss < 40;
    }

    /**
     * Checks if the unit is conscious enough to fight
     * Uses consciousness threshold to determine combat capability
     */
    isConscious() {
        return this.consciousness > CONSCIOUSNESS_THRESHOLD;
    }

    /**
     * Gets the current consciousness level
     */
    getConsciousness() {
        return this.consciousness;
    }

    /**
     * Gets the current blood loss level
     */
    getBloodLoss() {
        return this.bloodLoss;
    }

    /**
     * Gets all injuries affecting a specific body part
     */
    getInjuriesByBodyPart(bodyPart: BodyPart): Injury[] {
        return this.injuries.filter(injury => injury.bodyPart === bodyPart);
    }

    /**
     * Calculates total pain from all injuries
     * Pain affects combat effectiveness
     */
    getTotalPain() {
        return this.injuries.reduce((sum, injury) => sum + injury.pain, 0);
    }

    /**
     * Calculates total shock from all injuries
     * Shock affects consciousness
     */
    getTotalShock() {
        return this.injuries.reduce((sum, injury) => sum + injury.shock, 0);
    }

    /**
     * Gets the functionality level of a body part (0-100)
     * Affected by injuries to that part
     */
    getBodyPartFunctionality(bodyPart: BodyPart) {
        const injuries = this.getInjuriesByBodyPart(bodyPart);

        // Check for amputation or permanent loss
        if (injuries.some(injury => injury.isAmputation)) {
            return 0; // No functionality if part is lost
        }

        // Calculate functionality reduction from injuries
        const severityPenalty: Record<InjurySeverity, number> = {
            minor: 10,
            moderate: 30,
            severe: 60,
            critical: 80,
            fatal: 100,
        };

        let totalPenalty = 0;
        for (const injury of injuries) {
            // Add severity penalty
            totalPenalty += severityPenalty[injury.severity] || 0;

            // Add pain penalty (up to 20% additional reduction)
            totalPenalty += (injury.pain / 100) * 20;
        }

        return Math.max(0, 100 - totalPenalty);
    }

    /**
     * Gets a summary of the health state for serialization/display
     */
    getState(): UnitHealthState {
        return {
            consciousness: this.consciousness,
            bloodLoss: this.bloodLoss,
            isAlive: this.isAlive(),
            isConscious: this.isConscious(),
            totalPain: this.getTotalPain(),
            injuries: this.injuries.length,
            bodyPartFunctionality: {
                head: this.getBodyPartFunctionality('head'),
                torso: this.getBodyPartFunctionality('torso'),
                leftArm: this.getBodyPartFunctionality('leftArm'),
                rightArm: this.getBodyPartFunctionality('rightArm'),
                leftLeg: this.getBodyPartFunctionality('leftLeg'),
                rightLeg: this.getBodyPartFunctionality('rightLeg'),
            },
        };
    }
}
