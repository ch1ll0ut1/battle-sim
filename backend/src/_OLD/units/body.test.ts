// Tests for UnitBody (injury, pain, shock, body part functionality, armor)
import { Armor } from '../armor/armor.js'
import { Injuries } from '../injuries/injuries.js'
import { UnitBody } from './body.js'
import { Unit } from './unit.js'

describe('UnitBody', () => {
  let unit: Unit
  let body: UnitBody
  let armor: Armor

  beforeEach(() => {
    unit = new Unit(1, 'Test Unit', 0.8, 70, 80)
    body = new UnitBody(80, 70, 0.5) // Average weight/strength/experience
    armor = new Armor()
  })

  describe('Injury System', () => {
    it('should handle injuries and blood loss', () => {
      const injury = Injuries.DEEP_CUT.createInjury('torso')
      body.receiveInjury(injury)
      expect(body.injuries).toHaveLength(1)

      const initialBloodLoss = body.getBloodLoss()
      body.updateInjuries(1)
      expect(body.getBloodLoss()).toBeGreaterThan(initialBloodLoss)
    })

    it('should handle multiple injuries', () => {
      body.receiveInjury(Injuries.DEEP_CUT.createInjury('leftArm'))
      body.receiveInjury(Injuries.STAB_WOUND.createInjury('rightLeg'))
      expect(body.injuries).toHaveLength(2)
    })

    it('should track consciousness', () => {
      const injury = Injuries.SEVERE_HEAD_TRAUMA.createInjury('head')
      expect(body.isConscious()).toBe(true)
      body.receiveInjury(injury)
      body.updateInjuries(5)
      expect(body.isConscious()).toBe(false)
    })

    it('should handle fatal conditions', () => {
      const injury = Injuries.HEART_PENETRATION.createInjury('torso')
      expect(body.isAlive()).toBe(true)
      body.receiveInjury(injury)
      body.updateInjuries(1)
      expect(body.isAlive()).toBe(false)
    })

    it.skip('should handle armor effects', () => {
      // Test with plate armor which has high protection
      body.armor.equip('shirt', 'plate')

      // Test complete protection (≥90%)
      const cutInjury = Injuries.DEEP_CUT.createInjury('torso')
      body.receiveInjury(cutInjury)
      expect(body.injuries).toHaveLength(0) // Should be completely blocked (100% cut protection)

      // Test damage conversion (>80%)
      const stabInjury = Injuries.DEEP_STAB.createInjury('torso')
      body.receiveInjury(stabInjury)
      const convertedInjury = body.injuries[0]
      expect(convertedInjury.woundType).toBe('crush')
      expect(convertedInjury.bleedingRate).toBe(0) // Crush damage doesn't cause bleeding

      // Test damage reduction
      body = new UnitBody(80, 70, 0.5) // Reset body
      body.armor.equip('shirt', 'leather') // Use leather which has lower protection

      const testInjury = Injuries.DEEP_CUT.createInjury('torso')
      body.receiveInjury(testInjury)
      const reducedInjury = body.injuries[0]
      expect(reducedInjury.shock).toBeLessThan(testInjury.shock * 1.5)
      expect(reducedInjury.pain).toBeLessThan(testInjury.pain * 1.2)
      expect(reducedInjury.bleedingRate).toBeLessThan(testInjury.bleedingRate)
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
    it.skip('should handle armor integration with injuries', () => {
      // Test with plate armor which has high protection
      body.armor.equip('shirt', 'plate')

      // Test complete protection (≥90%)
      const cutInjury = Injuries.DEEP_CUT.createInjury('torso')
      body.receiveInjury(cutInjury)
      expect(body.injuries).toHaveLength(0) // Should be completely blocked (100% cut protection)

      // Test damage conversion (>80%)
      const stabInjury = Injuries.DEEP_STAB.createInjury('torso')
      body.receiveInjury(stabInjury)
      const convertedInjury = body.injuries[0]
      expect(convertedInjury.woundType).toBe('crush')
      expect(convertedInjury.bleedingRate).toBe(0) // Crush damage doesn't cause bleeding

      // Test damage reduction with lighter armor
      body = new UnitBody(80, 70, 0.5) // Reset body
      body.armor.equip('shirt', 'leather') // Use leather which has lower protection

      const testInjury = Injuries.DEEP_CUT.createInjury('torso')
      body.receiveInjury(testInjury)
      const reducedInjury = body.injuries[1] // Note: index 1 since we have a previous injury
      expect(reducedInjury.shock).toBeLessThan(testInjury.shock * 1.5)
      expect(reducedInjury.pain).toBeLessThan(testInjury.pain * 1.2)
      expect(reducedInjury.bleedingRate).toBeLessThan(testInjury.bleedingRate)
    })

    it.skip('should apply body part multipliers with armor', () => {
      body.armor.equip('helmet', 'chainmail')
      body.armor.equip('shirt', 'chainmail')

      // Head injuries should have higher shock and pain multipliers
      const headInjury = Injuries.DEEP_CUT.createInjury('head')
      body.receiveInjury(headInjury)
      const modifiedHeadInjury = body.injuries[0]
      expect(modifiedHeadInjury.woundType).toBe('crush') // Converted due to chainmail
      expect(modifiedHeadInjury.shock).toBeLessThan(headInjury.shock * 2.0) // Head multiplier
      expect(modifiedHeadInjury.pain).toBeLessThan(headInjury.pain * 1.8) // Head multiplier

      // Torso injuries should have medium multipliers
      const torsoInjury = Injuries.DEEP_CUT.createInjury('torso')
      body.receiveInjury(torsoInjury)
      const modifiedTorsoInjury = body.injuries[1]
      expect(modifiedTorsoInjury.woundType).toBe('crush') // Converted due to chainmail
      expect(modifiedTorsoInjury.shock).toBeLessThan(torsoInjury.shock * 1.5) // Torso multiplier
      expect(modifiedTorsoInjury.pain).toBeLessThan(torsoInjury.pain * 1.2) // Torso multiplier
    })

    it.skip('should handle armor weight limits based on body attributes', () => {
      // Strong, heavy unit should handle plate armor
      const strongBody = new UnitBody(100, 90, 0.5) // Heavy weight, high strength
      strongBody.armor.equipFullSet('plate')
      expect(strongBody.canWearArmor(strongBody.armor.getTotalWeight())).toBe(true)

      // Weak, light unit should struggle with heavy armor
      const weakBody = new UnitBody(50, 40, 0.5) // Light weight, low strength
      weakBody.armor.equipFullSet('plate')
      expect(weakBody.canWearArmor(weakBody.armor.getTotalWeight())).toBe(false)
      
      // But should handle leather armor fine
      weakBody.armor.equipFullSet('leather')
      expect(weakBody.canWearArmor(weakBody.armor.getTotalWeight())).toBe(true)
    })

    it('should integrate armor with injury severity and consciousness', () => {
      // No armor - severe injury should cause unconsciousness
      const severeInjury = Injuries.SEVERE_HEAD_TRAUMA.createInjury('head')
      body.receiveInjury(severeInjury)
      expect(body.isConscious()).toBe(false)

      // With plate armor - similar injury should be reduced
      body = new UnitBody(80, 70, 0.5) // Reset body
      body.armor.equip('helmet', 'plate')
      body.receiveInjury(severeInjury)
      expect(body.isConscious()).toBe(true) // Protected by armor
    })
  })
}) 