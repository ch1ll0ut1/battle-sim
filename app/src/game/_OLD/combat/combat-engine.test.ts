import { Unit } from '../units/unit.js'
import { Weapons } from '../weapons/weapons.js'
import { CombatEngine } from './combat-engine.js'

describe('CombatEngine', () => {
  describe('Injury Creation', () => {
    it('should create cut injuries for cutting weapons', () => {
      const attacker = new Unit(1, 'Attacker', 0.8, 70, 80)
      const defender = new Unit(2, 'Defender', 0.8, 70, 80)
      
      // Equip cutting weapon
      attacker.combat.equipWeapon(Weapons.BATTLE_AXE)
      
      const engine = new CombatEngine([attacker, defender])
      
      // Simulate a hit with high damage to get a clear injury type
      const damage = 50 // This should result in 'severe' injury
      const injury = (engine as any).createInjury(damage, Weapons.BATTLE_AXE)
      
      expect(injury.woundType).toBe('cut')
      expect(injury.severity).toBe('severe')
    })

    it('should create stab injuries for piercing weapons', () => {
      const attacker = new Unit(1, 'Attacker', 0.8, 70, 80)
      const defender = new Unit(2, 'Defender', 0.8, 70, 80)
      
      // Equip piercing weapon
      attacker.combat.equipWeapon(Weapons.SPEAR)
      
      const engine = new CombatEngine([attacker, defender])
      
      // Simulate a hit with high damage to get a clear injury type
      const damage = 50 // This should result in 'severe' injury
      const injury = (engine as any).createInjury(damage, Weapons.SPEAR)
      
      expect(injury.woundType).toBe('stab')
      expect(injury.severity).toBe('severe')
    })

    it('should create crush injuries for blunt weapons', () => {
      const attacker = new Unit(1, 'Attacker', 0.8, 70, 80)
      const defender = new Unit(2, 'Defender', 0.8, 70, 80)
      
      // Equip blunt weapon
      attacker.combat.equipWeapon(Weapons.WAR_HAMMER)
      
      const engine = new CombatEngine([attacker, defender])
      
      // Simulate a hit with high damage to get a clear injury type
      const damage = 50 // This should result in 'severe' injury
      const injury = (engine as any).createInjury(damage, Weapons.WAR_HAMMER)
      
      expect(injury.woundType).toBe('crush')
      expect(injury.severity).toBe('severe')
    })

    it('should create amputation injuries for fatal limb injuries regardless of weapon', () => {
      const attacker = new Unit(1, 'Attacker', 0.8, 70, 80)
      const defender = new Unit(2, 'Defender', 0.8, 70, 80)
      
      // Equip any weapon
      attacker.combat.equipWeapon(Weapons.BATTLE_AXE)
      
      const engine = new CombatEngine([attacker, defender])
      
      // Simulate a fatal hit to a limb
      const damage = 90 // This should result in 'fatal' injury
      const injury = (engine as any).createInjury(damage, Weapons.BATTLE_AXE)
      
      // If the body part is a limb, it should be amputation
      if (injury.bodyPart === 'leftArm' || injury.bodyPart === 'rightArm' || 
          injury.bodyPart === 'leftLeg' || injury.bodyPart === 'rightLeg') {
        expect(injury.woundType).toBe('amputation')
      }
      expect(injury.severity).toBe('fatal')
    })

    it('should create consistent injury types for the same weapon and damage', () => {
      const attacker = new Unit(1, 'Attacker', 0.8, 70, 80)
      const defender = new Unit(2, 'Defender', 0.8, 70, 80)
      
      attacker.combat.equipWeapon(Weapons.DAGGER)
      
      const engine = new CombatEngine([attacker, defender])
      
      // Test multiple times with same weapon and damage
      const damage = 40
      const injury1 = (engine as any).createInjury(damage, Weapons.DAGGER)
      const injury2 = (engine as any).createInjury(damage, Weapons.DAGGER)
      const injury3 = (engine as any).createInjury(damage, Weapons.DAGGER)
      
      // All should be stab injuries (piercing weapon)
      expect(injury1.woundType).toBe('stab')
      expect(injury2.woundType).toBe('stab')
      expect(injury3.woundType).toBe('stab')
      
      // All should have same severity
      expect(injury1.severity).toBe(injury2.severity)
      expect(injury2.severity).toBe(injury3.severity)
    })

    it('should handle weapons with multiple damage types correctly', () => {
      const attacker = new Unit(1, 'Attacker', 0.8, 70, 80)
      const defender = new Unit(2, 'Defender', 0.8, 70, 80)
      
      // Long sword can do both cutting and piercing, but primary is cutting
      attacker.combat.equipWeapon(Weapons.LONG_SWORD)
      
      const engine = new CombatEngine([attacker, defender])
      
      const damage = 50
      const injury = (engine as any).createInjury(damage, Weapons.LONG_SWORD)
      
      // Should use primary damage type (cutting)
      expect(injury.woundType).toBe('cut')
    })

    it('should create appropriate injuries for different damage levels', () => {
      const attacker = new Unit(1, 'Attacker', 0.8, 70, 80)
      const defender = new Unit(2, 'Defender', 0.8, 70, 80)
      
      attacker.combat.equipWeapon(Weapons.BATTLE_AXE)
      
      const engine = new CombatEngine([attacker, defender])
      
      // Test different damage levels
      const minorInjury = (engine as any).createInjury(15, Weapons.BATTLE_AXE)
      const moderateInjury = (engine as any).createInjury(30, Weapons.BATTLE_AXE)
      const severeInjury = (engine as any).createInjury(50, Weapons.BATTLE_AXE)
      const criticalInjury = (engine as any).createInjury(70, Weapons.BATTLE_AXE)
      const fatalInjury = (engine as any).createInjury(90, Weapons.BATTLE_AXE)
      
      expect(minorInjury.severity).toBe('minor')
      expect(moderateInjury.severity).toBe('moderate')
      expect(severeInjury.severity).toBe('severe')
      expect(criticalInjury.severity).toBe('critical')
      expect(fatalInjury.severity).toBe('fatal')
      
      // All should be cut injuries for axe, except fatal limb injuries which become amputation
      expect(minorInjury.woundType).toBe('cut')
      expect(moderateInjury.woundType).toBe('cut')
      expect(severeInjury.woundType).toBe('cut')
      expect(criticalInjury.woundType).toBe('cut')
      
      // Fatal injuries to limbs become amputation, others remain cut
      if (fatalInjury.bodyPart === 'leftArm' || fatalInjury.bodyPart === 'rightArm' || 
          fatalInjury.bodyPart === 'leftLeg' || fatalInjury.bodyPart === 'rightLeg') {
        expect(fatalInjury.woundType).toBe('amputation')
      } else {
        expect(fatalInjury.woundType).toBe('cut')
      }
    })
  })
}) 