/**
 * Injury - Represents predefined injury types with realistic parameters
 * 
 * This class defines the characteristics of different injury types including
 * severity, bleeding rates, pain, shock, and effects on body part functionality.
 * Injuries are categorized by wound type and severity to create realistic
 * combat damage simulation.
 */

import { BodyPart } from '../units/unit.js'

export type WoundType = 'cut' | 'stab' | 'crush' | 'amputation'

export interface InjuryTypeProfile {
  name: string
  severity: InjurySeverity
  woundType: WoundType
  bleedingRate: number // units per second
  pain: number // 0-100
  shock: number // 0-100
  isFatal: boolean
  isAmputation?: boolean
  permanentEffect?: string
  timeToDeath?: number // seconds until death for fatal injuries
  description: string // Realistic description of the injury
}

/**
 * InjuryType represents a predefined injury with realistic parameters
 * based on medical knowledge and combat simulation requirements.
 */
export class InjuryType {
  public readonly name: string
  public readonly severity: InjurySeverity
  public readonly woundType: WoundType
  public readonly bleedingRate: number
  public readonly pain: number
  public readonly shock: number
  public readonly isFatal: boolean
  public readonly isAmputation: boolean
  public readonly permanentEffect?: string
  public readonly timeToDeath?: number
  public readonly description: string

  constructor(profile: InjuryTypeProfile) {
    this.name = profile.name
    this.severity = profile.severity
    this.woundType = profile.woundType
    this.bleedingRate = profile.bleedingRate
    this.pain = profile.pain
    this.shock = profile.shock
    this.isFatal = profile.isFatal
    this.isAmputation = profile.isAmputation || false
    this.permanentEffect = profile.permanentEffect
    this.timeToDeath = profile.timeToDeath
    this.description = profile.description
  }

  /**
   * Creates an injury instance for a specific body part
   * @param bodyPart - The body part that received the injury
   * @returns Injury object ready to be applied to a unit
   */
  createInjury(bodyPart: BodyPart) {
    return {
      bodyPart,
      severity: this.severity,
      woundType: this.woundType,
      bleedingRate: this.bleedingRate,
      pain: this.pain,
      shock: this.shock,
      isFatal: this.isFatal,
      isAmputation: this.isAmputation,
      permanentEffect: this.permanentEffect,
      timeToDeath: this.timeToDeath
    }
  }

  /**
   * Gets the functionality penalty for this injury type
   * @returns Functionality penalty percentage (0-100)
   */
  getFunctionalityPenalty(): number {
    const penalties: Record<InjurySeverity, number> = {
      minor: 5,
      moderate: 15,
      severe: 40,
      critical: 60,
      fatal: 100
    }
    return penalties[this.severity]
  }

  /**
   * Checks if this injury type would prevent combat actions
   * @returns True if the injury would significantly impair combat ability
   */
  wouldPreventCombat(): boolean {
    return this.severity === 'critical' || this.severity === 'fatal'
  }

  /**
   * Gets a human-readable description of the injury's effects
   * @returns Description of what this injury does to the victim
   */
  getEffectDescription(): string {
    return this.description
  }
}
/**
 * Injury severity levels representing the realistic impact of wounds on body parts
 *
 * Each severity level affects body part functionality, bleeding rates, pain, and shock:
 *
 * - minor: Superficial wounds (5% functionality penalty)
 *   Examples: Small cuts, bruises, minor burns
 *   Effects: Minimal bleeding (0.5/sec), slight pain, negligible shock
 *   Combat impact: Almost none, unit can fight normally
 *
 * - moderate: Significant but non-disabling wounds (15% functionality penalty)
 *   Examples: Deep cuts, muscle damage, broken fingers
 *   Effects: Moderate bleeding (2/sec), noticeable pain, some shock
 *   Combat impact: Reduced effectiveness, but still combat capable
 *
 * - severe: Major wounds that significantly impair function (40% functionality penalty)
 *   Examples: Deep stab wounds, broken bones, severe burns
 *   Effects: Heavy bleeding (5/sec), high pain, significant shock
 *   Combat impact: Major reduction in effectiveness, may prevent certain actions
 *
 * - critical: Life-threatening wounds that severely disable function (60% functionality penalty)
 *   Examples: Compound fractures, arterial bleeding, organ damage
 *   Effects: Very heavy bleeding (8/sec), extreme pain, high shock
 *   Combat impact: Severe impairment, likely unconsciousness, near death
 *
 * - fatal: Mortal wounds leading to death (100% functionality penalty)
 *   Examples: Decapitation, heart/lung penetration, massive blood loss
 *   Effects: Fatal bleeding (12-20/sec), unbearable pain, complete shock
 *   Combat impact: Immediate death or rapid incapacitation
 */

export type InjurySeverity = 'minor' | 'moderate' | 'severe' | 'critical' | 'fatal'
export interface Injury {
  bodyPart: BodyPart
  severity: InjurySeverity
  woundType: 'cut' | 'stab' | 'crush' | 'amputation'
  bleedingRate: number // realistic bleeding per second
  pain: number // 0-100, affects combat effectiveness
  shock: number // 0-100, affects consciousness
  isFatal: boolean
  isAmputation?: boolean
  permanentEffect?: string
  timeToDeath?: number // seconds until death for fatal injuries
}
 