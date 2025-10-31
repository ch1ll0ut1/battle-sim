/**
 * Injury system for realistic combat damage simulation
 * Represents wounds with severity, bleeding, pain, and shock effects
 */

export type BodyPart = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

export type WoundType = 'cut' | 'stab' | 'crush' | 'amputation';

/**
 * Injury severity levels representing the realistic impact of wounds on body parts
 *
 * Each severity level affects body part functionality, bleeding rates, pain, and shock:
 *
 * - minor: Superficial wounds (10% functionality penalty)
 *   Examples: Small cuts, bruises, minor burns
 *   Effects: Minimal bleeding (0.5/sec), slight pain, negligible shock
 *   Combat impact: Almost none, unit can fight normally
 *
 * - moderate: Significant but non-disabling wounds (30% functionality penalty)
 *   Examples: Deep cuts, muscle damage, broken fingers
 *   Effects: Moderate bleeding (2/sec), noticeable pain, some shock
 *   Combat impact: Reduced effectiveness, but still combat capable
 *
 * - severe: Major wounds that significantly impair function (60% functionality penalty)
 *   Examples: Deep stab wounds, broken bones, severe burns
 *   Effects: Heavy bleeding (5/sec), high pain, significant shock
 *   Combat impact: Major reduction in effectiveness, may prevent certain actions
 *
 * - critical: Life-threatening wounds that severely disable function (80% functionality penalty)
 *   Examples: Compound fractures, arterial bleeding, organ damage
 *   Effects: Very heavy bleeding (8/sec), extreme pain, high shock
 *   Combat impact: Severe impairment, likely unconsciousness, near death
 *
 * - fatal: Mortal wounds leading to death (100% functionality penalty)
 *   Examples: Decapitation, heart/lung penetration, massive blood loss
 *   Effects: Fatal bleeding (12-20/sec), unbearable pain, complete shock
 *   Combat impact: Immediate death or rapid incapacitation
 */
export type InjurySeverity = 'minor' | 'moderate' | 'severe' | 'critical' | 'fatal';

/**
 * Represents an injury to a specific body part with realistic effects
 */
export interface Injury {
    bodyPart: BodyPart;
    severity: InjurySeverity;
    woundType: WoundType;
    bleedingRate: number; // units per second
    pain: number; // 0-100, affects combat effectiveness
    shock: number; // 0-100, affects consciousness
    isFatal: boolean;
    isAmputation: boolean;
    permanentEffect?: string;
    timeToDeath?: number; // seconds until death for fatal injuries
}

/**
 * Body part shock multipliers (how much shock each location causes)
 */
export const BODY_PART_SHOCK_MULTIPLIERS: Record<BodyPart, number> = {
    head: 2.0, // Head injuries cause much more shock
    torso: 1.5, // Torso injuries cause significant shock
    leftArm: 0.8, // Limb injuries cause less shock
    rightArm: 0.8,
    leftLeg: 0.6, // Leg injuries cause the least shock
    rightLeg: 0.6,
};

/**
 * Body part pain multipliers
 */
export const BODY_PART_PAIN_MULTIPLIERS: Record<BodyPart, number> = {
    head: 1.8, // Head injuries are very painful
    torso: 1.2, // Torso injuries are quite painful
    leftArm: 1.0, // Standard pain for limbs
    rightArm: 1.0,
    leftLeg: 0.9, // Leg injuries are slightly less painful
    rightLeg: 0.9,
};

/**
 * Creates a basic injury with specified parameters
 */
export function createInjury(
    bodyPart: BodyPart,
    severity: InjurySeverity,
    woundType: WoundType,
    damage: number,
): Injury {
    // Base values by severity
    const severityValues = {
        minor: { bleeding: 0.5, pain: 10, shock: 5, fatal: false },
        moderate: { bleeding: 2, pain: 25, shock: 15, fatal: false },
        severe: { bleeding: 5, pain: 45, shock: 30, fatal: false },
        critical: { bleeding: 8, pain: 70, shock: 50, fatal: false },
        fatal: { bleeding: 15, pain: 90, shock: 80, fatal: true },
    };

    const base = severityValues[severity];

    // Wound type modifiers
    const woundTypeModifiers = {
        cut: { bleeding: 1.2, pain: 1.0, shock: 0.9 },
        stab: { bleeding: 1.5, pain: 1.2, shock: 1.1 },
        crush: { bleeding: 0.6, pain: 1.3, shock: 1.2 },
        amputation: { bleeding: 2.0, pain: 1.5, shock: 2.0 },
    };

    const modifier = woundTypeModifiers[woundType];

    return {
        bodyPart,
        severity,
        woundType,
        bleedingRate: base.bleeding * modifier.bleeding,
        pain: base.pain * modifier.pain,
        shock: base.shock * modifier.shock,
        isFatal: base.fatal,
        isAmputation: woundType === 'amputation',
        timeToDeath: base.fatal ? 60 : undefined,
    };
}
