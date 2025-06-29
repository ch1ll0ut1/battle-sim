// Realistic injury definitions with severity levels and wound types

import { InjuryType, WoundType } from './injury.js'
import { BodyPart } from '../units/body.js'
import { InjurySeverity } from './injury.js'

export class Injuries {
  // Minor Injuries - Superficial wounds with minimal impact
  static readonly SCRATCH = new InjuryType({
    name: 'Scratch',
    severity: 'minor',
    woundType: 'cut',
    bleedingRate: 0.5,
    pain: 10,
    shock: 5,
    isFatal: false,
    description: 'A superficial scratch that causes minimal bleeding and pain'
  })

  static readonly BRUISE = new InjuryType({
    name: 'Bruise',
    severity: 'minor',
    woundType: 'crush',
    bleedingRate: 0,
    pain: 15,
    shock: 3,
    isFatal: false,
    description: 'A bruise caused by blunt force trauma, no bleeding but some pain'
  })

  static readonly SMALL_CUT = new InjuryType({
    name: 'Small Cut',
    severity: 'minor',
    woundType: 'cut',
    bleedingRate: 0.5,
    pain: 20,
    shock: 8,
    isFatal: false,
    description: 'A small cut that bleeds slightly and causes moderate pain'
  })

  // Moderate Injuries - Significant but non-disabling wounds
  static readonly DEEP_CUT = new InjuryType({
    name: 'Deep Cut',
    severity: 'moderate',
    woundType: 'cut',
    bleedingRate: 2,
    pain: 35,
    shock: 15,
    isFatal: false,
    description: 'A deep cut that bleeds moderately and causes significant pain'
  })

  static readonly STAB_WOUND = new InjuryType({
    name: 'Stab Wound',
    severity: 'moderate',
    woundType: 'stab',
    bleedingRate: 2,
    pain: 40,
    shock: 20,
    isFatal: false,
    description: 'A penetrating stab wound that bleeds steadily and causes sharp pain'
  })

  static readonly BROKEN_FINGER = new InjuryType({
    name: 'Broken Finger',
    severity: 'moderate',
    woundType: 'crush',
    bleedingRate: 0,
    pain: 45,
    shock: 12,
    isFatal: false,
    description: 'A broken finger that causes intense pain but no bleeding'
  })

  static readonly MUSCLE_DAMAGE = new InjuryType({
    name: 'Muscle Damage',
    severity: 'moderate',
    woundType: 'crush',
    bleedingRate: 1,
    pain: 30,
    shock: 18,
    isFatal: false,
    description: 'Damage to muscle tissue that impairs movement and causes pain'
  })

  // Severe Injuries - Major wounds that significantly impair function
  static readonly DEEP_STAB = new InjuryType({
    name: 'Deep Stab',
    severity: 'severe',
    woundType: 'stab',
    bleedingRate: 5,
    pain: 60,
    shock: 35,
    isFatal: false,
    description: 'A deep stab wound that bleeds heavily and causes severe pain'
  })

  static readonly BROKEN_BONE = new InjuryType({
    name: 'Broken Bone',
    severity: 'severe',
    woundType: 'crush',
    bleedingRate: 2,
    pain: 70,
    shock: 40,
    isFatal: false,
    description: 'A broken bone that causes intense pain and impairs function'
  })

  static readonly SEVERE_BURN = new InjuryType({
    name: 'Severe Burn',
    severity: 'severe',
    woundType: 'crush',
    bleedingRate: 0,
    pain: 80,
    shock: 30,
    isFatal: false,
    description: 'A severe burn that causes extreme pain and tissue damage'
  })

  static readonly ARTERIAL_CUT = new InjuryType({
    name: 'Arterial Cut',
    severity: 'severe',
    woundType: 'cut',
    bleedingRate: 8,
    pain: 50,
    shock: 45,
    isFatal: false,
    description: 'A cut that damages an artery, causing heavy bleeding'
  })

  // Critical Injuries - Life-threatening wounds that severely disable function
  static readonly COMPOUND_FRACTURE = new InjuryType({
    name: 'Compound Fracture',
    severity: 'critical',
    woundType: 'crush',
    bleedingRate: 8,
    pain: 85,
    shock: 60,
    isFatal: false,
    description: 'A compound fracture where bone breaks through skin, causing heavy bleeding'
  })

  static readonly ORGAN_DAMAGE = new InjuryType({
    name: 'Organ Damage',
    severity: 'critical',
    woundType: 'stab',
    bleedingRate: 10,
    pain: 90,
    shock: 70,
    isFatal: false,
    description: 'Damage to internal organs causing severe bleeding and shock'
  })

  static readonly SEVERE_HEAD_TRAUMA = new InjuryType({
    name: 'Severe Head Trauma',
    severity: 'critical',
    woundType: 'crush',
    bleedingRate: 6,
    pain: 75,
    shock: 80,
    isFatal: false,
    description: 'Severe trauma to the head causing brain damage and unconsciousness'
  })

  static readonly ARTERIAL_PUNCTURE = new InjuryType({
    name: 'Arterial Puncture',
    severity: 'critical',
    woundType: 'stab',
    bleedingRate: 12,
    pain: 65,
    shock: 75,
    isFatal: false,
    description: 'A puncture wound that damages a major artery, causing rapid blood loss'
  })

  static readonly DEEP_ARTERIAL_CUT = new InjuryType({
    name: 'Deep Arterial Cut',
    severity: 'critical',
    woundType: 'cut',
    bleedingRate: 15,
    pain: 80,
    shock: 65,
    isFatal: false,
    description: 'A deep cut that severs a major artery, causing life-threatening blood loss'
  })

  // Fatal Injuries - Mortal wounds leading to death
  static readonly DECAPITATION = new InjuryType({
    name: 'Decapitation',
    severity: 'fatal',
    woundType: 'cut',
    bleedingRate: 20,
    pain: 100,
    shock: 100,
    isFatal: true,
    timeToDeath: 5,
    description: 'Complete severing of the head, causing immediate death'
  })

  static readonly THROAT_CUT = new InjuryType({
    name: 'Throat Cut',
    severity: 'fatal',
    woundType: 'cut',
    bleedingRate: 18,
    pain: 95,
    shock: 90,
    isFatal: true,
    timeToDeath: 10,
    description: 'A deep cut across the throat that severs major blood vessels, causing rapid death'
  })

  static readonly HEART_PENETRATION = new InjuryType({
    name: 'Heart Penetration',
    severity: 'fatal',
    woundType: 'stab',
    bleedingRate: 15,
    pain: 95,
    shock: 100,
    isFatal: true,
    timeToDeath: 8,
    description: 'A stab wound that penetrates the heart, causing rapid death'
  })

  static readonly LUNG_COLLAPSE = new InjuryType({
    name: 'Lung Collapse',
    severity: 'fatal',
    woundType: 'stab',
    bleedingRate: 12,
    pain: 85,
    shock: 90,
    isFatal: true,
    timeToDeath: 12,
    description: 'Severe damage to the lungs causing respiratory failure'
  })

  static readonly LIMB_AMPUTATION = new InjuryType({
    name: 'Limb Amputation',
    severity: 'fatal',
    woundType: 'amputation',
    bleedingRate: 12,
    pain: 90,
    shock: 85,
    isFatal: true,
    isAmputation: true,
    permanentEffect: 'loss of limb',
    timeToDeath: 15,
    description: 'Complete severing of a limb, causing massive blood loss and shock'
  })

  // Get all injuries by severity
  static getMinorInjuries(): InjuryType[] {
    return [
      this.SCRATCH,
      this.BRUISE,
      this.SMALL_CUT
    ]
  }

  static getModerateInjuries(): InjuryType[] {
    return [
      this.DEEP_CUT,
      this.STAB_WOUND,
      this.BROKEN_FINGER,
      this.MUSCLE_DAMAGE
    ]
  }

  static getSevereInjuries(): InjuryType[] {
    return [
      this.DEEP_STAB,
      this.BROKEN_BONE,
      this.SEVERE_BURN,
      this.ARTERIAL_CUT
    ]
  }

  static getCriticalInjuries(): InjuryType[] {
    return [
      this.COMPOUND_FRACTURE,
      this.ORGAN_DAMAGE,
      this.SEVERE_HEAD_TRAUMA,
      this.ARTERIAL_PUNCTURE,
      this.DEEP_ARTERIAL_CUT
    ]
  }

  static getFatalInjuries(): InjuryType[] {
    return [
      this.DECAPITATION,
      this.THROAT_CUT,
      this.HEART_PENETRATION,
      this.LUNG_COLLAPSE,
      this.LIMB_AMPUTATION
    ]
  }

  static getAllInjuries(): InjuryType[] {
    return [
      ...this.getMinorInjuries(),
      ...this.getModerateInjuries(),
      ...this.getSevereInjuries(),
      ...this.getCriticalInjuries(),
      ...this.getFatalInjuries()
    ]
  }

  // Find injury by name
  static findByName(name: string): InjuryType | undefined {
    return this.getAllInjuries().find(injury => 
      injury.name.toLowerCase() === name.toLowerCase()
    )
  }

  // Get injuries by severity
  static getInjuriesBySeverity(severity: InjurySeverity): InjuryType[] {
    return this.getAllInjuries().filter(injury => injury.severity === severity)
  }

  // Get injuries by wound type
  static getInjuriesByWoundType(woundType: WoundType): InjuryType[] {
    return this.getAllInjuries().filter(injury => injury.woundType === woundType)
  }

  // Get injuries that would prevent combat
  static getCombatPreventingInjuries(): InjuryType[] {
    return this.getAllInjuries().filter(injury => injury.wouldPreventCombat())
  }

  // Create injury by name for a specific body part
  static createInjuryByName(name: string, bodyPart: BodyPart) {
    const injuryType = this.findByName(name)
    if (!injuryType) {
      throw new Error(`Injury type "${name}" not found`)
    }
    return injuryType.createInjury(bodyPart)
  }

  // Get random injury by severity
  static getRandomInjuryBySeverity(severity: InjurySeverity): InjuryType {
    const injuries = this.getInjuriesBySeverity(severity)
    if (injuries.length === 0) {
      throw new Error(`No injuries found for severity: ${severity}`)
    }
    return injuries[Math.floor(Math.random() * injuries.length)]
  }

  // Get random injury by wound type
  static getRandomInjuryByWoundType(woundType: WoundType): InjuryType {
    const injuries = this.getInjuriesByWoundType(woundType)
    if (injuries.length === 0) {
      throw new Error(`No injuries found for wound type: ${woundType}`)
    }
    return injuries[Math.floor(Math.random() * injuries.length)]
  }
} 