// Tests for UnitBody (injury, pain, shock, body part functionality, armor)
import { Unit, Injury, BodyPart } from './unit'
import { Armor } from '../armor/armor'

describe('UnitBody', () => {
  let unit: Unit

  beforeEach(() => {
    unit = new Unit(0.8, 70, 80)
  })

  describe('Injury Creation and Effects', () => {
    it('should handle minor injuries without significant combat impact', () => {
      const minorInjury: Injury = {
        bodyPart: 'leftArm',
        severity: 'minor',
        damage: 10,
        bleeding: 5,
        pain: 15,
        shock: 5,
        isFatal: false
      }
      unit.body.receiveInjury(minorInjury)
      expect(unit.body.isAlive()).toBe(true)
      expect(unit.body.isConscious()).toBe(true)
      expect(unit.body.getTotalPain()).toBeGreaterThan(0)
      expect(unit.body.getTotalShock()).toBeGreaterThan(0)
    })
    it('should handle severe injuries that significantly impact combat', () => {
      const severeInjury: Injury = {
        bodyPart: 'rightArm',
        severity: 'severe',
        damage: 60,
        bleeding: 20,
        pain: 50,
        shock: 30,
        isFatal: false
      }
      unit.body.receiveInjury(severeInjury)
      expect(unit.body.isAlive()).toBe(true)
      expect(unit.body.isConscious()).toBe(true)
      expect(unit.body.getBodyPartFunctionality('rightArm')).toBeLessThan(100)
    })
    it('should handle fatal injuries that lead to death', () => {
      const fatalInjury: Injury = {
        bodyPart: 'head',
        severity: 'fatal',
        damage: 100,
        bleeding: 80,
        pain: 100,
        shock: 100,
        isFatal: true,
        timeToDeath: 30
      }
      unit.body.receiveInjury(fatalInjury)
      expect(unit.body.isAlive()).toBe(false)
      expect(unit.body.isConscious()).toBe(false)
    })
    it('should accumulate multiple injuries correctly', () => {
      const injury1: Injury = {
        bodyPart: 'leftLeg',
        severity: 'moderate',
        damage: 30,
        bleeding: 10,
        pain: 25,
        shock: 15,
        isFatal: false
      }
      const injury2: Injury = {
        bodyPart: 'torso',
        severity: 'moderate',
        damage: 25,
        bleeding: 15,
        pain: 30,
        shock: 20,
        isFatal: false
      }
      unit.body.receiveInjury(injury1)
      unit.body.receiveInjury(injury2)
      expect(unit.body.getInjuries()).toHaveLength(2)
      expect(unit.body.getTotalPain()).toBeGreaterThan(0)
      expect(unit.body.getTotalShock()).toBeGreaterThan(0)
      expect(unit.body.getBodyPartFunctionality('leftLeg')).toBeLessThan(100)
      expect(unit.body.getBodyPartFunctionality('torso')).toBeLessThan(100)
    })
  })

  describe('Body Part Functionality', () => {
    it('should prevent actions when required body parts are severely damaged', () => {
      const armInjury: Injury = {
        bodyPart: 'leftArm',
        severity: 'severe',
        damage: 95,
        bleeding: 15,
        pain: 40,
        shock: 20,
        isFatal: false
      }
      const legInjury: Injury = {
        bodyPart: 'rightLeg',
        severity: 'severe',
        damage: 95,
        bleeding: 20,
        pain: 45,
        shock: 25,
        isFatal: false
      }
      unit.body.receiveInjury(armInjury)
      unit.body.receiveInjury(legInjury)
      expect(unit.combat.canPerformAction('attack')).toBe(false)
      expect(unit.combat.canPerformAction('move')).toBe(false)
      expect(unit.combat.canPerformAction('block')).toBe(false)
    })
    it('should allow actions when at least one required body part is functional', () => {
      const leftArmInjury: Injury = {
        bodyPart: 'leftArm',
        severity: 'severe',
        damage: 90,
        bleeding: 15,
        pain: 40,
        shock: 20,
        isFatal: false
      }
      unit.body.receiveInjury(leftArmInjury)
      expect(unit.combat.canPerformAction('attack', { handedness: 'one-handed' })).toBe(true)
      expect(unit.combat.canPerformAction('block', { handedness: 'one-handed' })).toBe(true)
      expect(unit.combat.canPerformAction('attack', { handedness: 'two-handed' })).toBe(false)
    })
  })

  describe('Pain and Shock Effects', () => {
    it('should reduce combat effectiveness based on pain tolerance', () => {
      const highPainInjury: Injury = {
        bodyPart: 'torso',
        severity: 'severe',
        damage: 40,
        bleeding: 20,
        pain: 80,
        shock: 30,
        isFatal: false
      }
      unit.body.receiveInjury(highPainInjury)
      const effectiveness = unit.combat.getCombatEffectiveness()
      expect(effectiveness).toBeLessThan(1.0)
    })
    it('should handle shock effects on consciousness', () => {
      const highShockInjury: Injury = {
        bodyPart: 'head',
        severity: 'critical',
        damage: 50,
        bleeding: 30,
        pain: 60,
        shock: 80,
        isFatal: false
      }
      unit.body.receiveInjury(highShockInjury)
      expect(unit.body.isConscious()).toBe(false)
      expect(unit.combat.getCombatEffectiveness()).toBe(0)
    })
  })

  describe('Blood Loss and Death', () => {
    it('should track blood loss from multiple injuries', () => {
      const bleedingInjury1: Injury = {
        bodyPart: 'leftArm',
        severity: 'moderate',
        damage: 30,
        bleeding: 25,
        pain: 20,
        shock: 10,
        isFatal: false
      }
      const bleedingInjury2: Injury = {
        bodyPart: 'rightLeg',
        severity: 'severe',
        damage: 50,
        bleeding: 40,
        pain: 35,
        shock: 20,
        isFatal: false
      }
      unit.body.receiveInjury(bleedingInjury1)
      unit.body.receiveInjury(bleedingInjury2)
      unit.body.updateInjuries(2.0)
      expect(unit.body.isAlive()).toBe(false)
    })
  })

  describe('Injury Recovery and Permanent Damage', () => {
    it('should handle permanent damage correctly', () => {
      const permanentInjury: Injury = {
        bodyPart: 'rightArm',
        severity: 'critical',
        damage: 40,
        bleeding: 20,
        pain: 30,
        shock: 25,
        isFatal: false,
        permanentDamage: 30
      }
      unit.body.receiveInjury(permanentInjury)
      expect(unit.body.getBodyPartFunctionality('rightArm')).toBeLessThan(100)
    })
  })

  describe('Armor System', () => {
    it('should reduce shock and pain based on armor protection', () => {
      const headInjury: Injury = {
        bodyPart: 'head',
        severity: 'severe',
        damage: 50,
        bleeding: 20,
        pain: 60,
        shock: 70,
        isFatal: false
      }
      unit.body.receiveInjury(headInjury)
      const noArmorShock = unit.body.getTotalShock()
      const noArmorPain = unit.body.getTotalPain()
      
      const armoredUnit = new Unit(0.8, 70, 80)
      const plateHelmet = new Armor()
      plateHelmet.equipPiece('helmet', 'plate')
      armoredUnit.body.equipArmor(plateHelmet)
      armoredUnit.body.receiveInjury(headInjury)
      const armoredShock = armoredUnit.body.getTotalShock()
      const armoredPain = armoredUnit.body.getTotalPain()
      
      expect(armoredShock).toBeLessThan(noArmorShock)
      expect(armoredPain).toBeLessThan(noArmorPain)
    })
    
    it('should have different effects based on body part location', () => {
      const headInjury: Injury = {
        bodyPart: 'head',
        severity: 'moderate',
        damage: 30,
        bleeding: 15,
        pain: 40,
        shock: 50,
        isFatal: false
      }
      const legInjury: Injury = {
        bodyPart: 'leftLeg',
        severity: 'moderate',
        damage: 30,
        bleeding: 15,
        pain: 40,
        shock: 50,
        isFatal: false
      }
      unit.body.receiveInjury(headInjury)
      const headShock = unit.body.getTotalShock()
      const headPain = unit.body.getTotalPain()
      
      const legUnit = new Unit(0.8, 70, 80)
      legUnit.body.receiveInjury(legInjury)
      const legShock = legUnit.body.getTotalShock()
      const legPain = legUnit.body.getTotalPain()
      
      expect(headShock).toBeGreaterThan(legShock)
      expect(headPain).toBeGreaterThan(legPain)
    })
    
    it('should handle armor coverage for different body parts', () => {
      const fullPlateArmor = Armor.createFullSet('plate')
      unit.body.equipArmor(fullPlateArmor)
      
      expect(unit.body.getArmorProtection('head')).toBeGreaterThan(0)
      expect(unit.body.getArmorProtection('torso')).toBeGreaterThan(0)
      expect(unit.body.getArmorProtection('leftArm')).toBeGreaterThan(0) // Maps to gloves
      expect(unit.body.getArmorProtection('rightLeg')).toBeGreaterThan(0) // Maps to pants
    })
    
    it('should cause unconsciousness with high shock head injuries even with armor', () => {
      const heavyHeadInjury: Injury = {
        bodyPart: 'head',
        severity: 'critical',
        damage: 60,
        bleeding: 30,
        pain: 80,
        shock: 90,
        isFatal: false
      }
      const chainHelmet = new Armor()
      chainHelmet.equipPiece('helmet', 'chainmail')
      unit.body.equipArmor(chainHelmet)
      unit.body.receiveInjury(heavyHeadInjury)
      expect(unit.body.isConscious()).toBe(true)
    })
  })
}) 