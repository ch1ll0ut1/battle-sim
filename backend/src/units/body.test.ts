// Tests for UnitBody (injury, pain, shock, body part functionality, armor)
import { Armor } from '../armor/armor.js'
import { Injuries } from '../injuries/injuries.js'
import { Unit } from './unit.js'

describe('UnitBody', () => {
  let unit: Unit

  beforeEach(() => {
    unit = new Unit(1, 'Test Unit', 0.8, 70, 80)
  })

  describe('Injury Creation and Effects', () => {
    it('should handle minor injuries without significant combat impact', () => {
      const minorInjury = Injuries.SCRATCH.createInjury('leftArm')
      unit.body.receiveInjury(minorInjury)
      expect(unit.body.isAlive()).toBe(true)
      expect(unit.body.isConscious()).toBe(true)
      expect(unit.body.getTotalPain()).toBeGreaterThan(0)
      expect(unit.body.getTotalShock()).toBeGreaterThan(0)
    })
    it('should handle severe injuries that significantly impact combat', () => {
      const severeInjury = Injuries.BROKEN_BONE.createInjury('rightArm')
      unit.body.receiveInjury(severeInjury)
      expect(unit.body.isAlive()).toBe(true)
      expect(unit.body.isConscious()).toBe(true)
      expect(unit.body.getBodyPartFunctionality('rightArm')).toBeLessThan(100)
    })
    it('should handle fatal injuries that lead to death', () => {
      const fatalInjury = Injuries.HEART_PENETRATION.createInjury('torso')
      unit.body.receiveInjury(fatalInjury)
      expect(unit.body.isAlive()).toBe(false)
      expect(unit.body.isConscious()).toBe(false)
    })
    it('should accumulate multiple injuries correctly', () => {
      const injury1 = Injuries.DEEP_CUT.createInjury('leftLeg')
      const injury2 = Injuries.STAB_WOUND.createInjury('torso')
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
      const armInjury = Injuries.DEEP_STAB.createInjury('leftArm')
      const legInjury = Injuries.BROKEN_BONE.createInjury('rightLeg')
      unit.body.receiveInjury(armInjury)
      unit.body.receiveInjury(legInjury)
      // Unit can still attack and block with the remaining functional arm
      expect(unit.combat.canPerformAction('attack')).toBe(true)
      expect(unit.combat.canPerformAction('block')).toBe(true)
      // But cannot move with only one functional leg
      expect(unit.combat.canPerformAction('move')).toBe(false)
    })
    it('should prevent attack and block when both arms are severely damaged', () => {
      const leftArmInjury = Injuries.COMPOUND_FRACTURE.createInjury('leftArm')
      const rightArmInjury = Injuries.ORGAN_DAMAGE.createInjury('rightArm')
      unit.body.receiveInjury(leftArmInjury)
      unit.body.receiveInjury(rightArmInjury)
      // Unit cannot attack or block when both arms are critically damaged (functionality = 40, threshold = 60)
      expect(unit.combat.canPerformAction('attack')).toBe(false)
      expect(unit.combat.canPerformAction('block')).toBe(false)
    })
    it('should allow actions when at least one required body part is functional', () => {
      const leftArmInjury = Injuries.DEEP_STAB.createInjury('leftArm')
      unit.body.receiveInjury(leftArmInjury)
      expect(unit.combat.canPerformAction('attack', { handedness: 'one-handed' })).toBe(true)
      expect(unit.combat.canPerformAction('block', { handedness: 'one-handed' })).toBe(true)
      expect(unit.combat.canPerformAction('attack', { handedness: 'two-handed' })).toBe(false)
    })
  })

  describe('Pain and Shock Effects', () => {
    it('should reduce combat effectiveness based on pain tolerance', () => {
      const highPainInjury = Injuries.SEVERE_BURN.createInjury('torso')
      unit.body.receiveInjury(highPainInjury)
      const effectiveness = unit.combat.getCombatEffectiveness()
      expect(effectiveness).toBeLessThan(1.0)
    })
    it('should handle shock effects on consciousness', () => {
      const highShockInjury = Injuries.SEVERE_HEAD_TRAUMA.createInjury('head')
      unit.body.receiveInjury(highShockInjury)
      expect(unit.body.isConscious()).toBe(false)
      expect(unit.combat.getCombatEffectiveness()).toBe(0)
    })
  })

  describe('Blood Loss and Death', () => {
    it('should track blood loss from multiple injuries', () => {
      const bleedingInjury1 = Injuries.DEEP_CUT.createInjury('leftArm')
      const bleedingInjury2 = Injuries.ARTERIAL_CUT.createInjury('rightLeg')
      unit.body.receiveInjury(bleedingInjury1)
      unit.body.receiveInjury(bleedingInjury2)
      // Realistic fatal blood loss: 40% of 100 units = 40 units. Combined bleeding rate = 10/sec. 40/10 = 4s, so simulate 5s.
      unit.body.updateInjuries(5.0)
      expect(unit.body.isAlive()).toBe(false)
    })
  })

  describe('Injury Recovery and Permanent Damage', () => {
    it('should handle permanent damage correctly', () => {
      const permanentInjury = Injuries.LIMB_AMPUTATION.createInjury('rightArm')
      unit.body.receiveInjury(permanentInjury)
      expect(unit.body.getBodyPartFunctionality('rightArm')).toBeLessThan(100)
    })
  })

  describe('Armor System', () => {
    it('should reduce shock and pain based on armor protection', () => {
      const headInjury = Injuries.DEEP_STAB.createInjury('head')
      unit.body.receiveInjury(headInjury)
      const noArmorShock = unit.body.getTotalShock()
      const noArmorPain = unit.body.getTotalPain()
      
      const armoredUnit = new Unit(2, 'Armored Unit', 0.8, 70, 80)
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
      const headInjury = Injuries.DEEP_CUT.createInjury('head')
      const legInjury = Injuries.DEEP_CUT.createInjury('leftLeg')
      unit.body.receiveInjury(headInjury)
      const headShock = unit.body.getTotalShock()
      const headPain = unit.body.getTotalPain()
      
      const legUnit = new Unit(3, 'Leg Unit', 0.8, 70, 80)
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
      const heavyHeadInjury = Injuries.SEVERE_HEAD_TRAUMA.createInjury('head')
      const chainHelmet = new Armor()
      chainHelmet.equipPiece('helmet', 'chainmail')
      unit.body.equipArmor(chainHelmet)
      unit.body.receiveInjury(heavyHeadInjury)
      expect(unit.body.isConscious()).toBe(true)
    })
  })
}) 