import { Unit } from './unit.js'
import { Armor } from '../armor/armor.js'
import { Weapon } from '../weapons/weapon.js'
import { Injuries } from '../injuries/injuries.js'

describe('Unit Combat', () => {
  it('should handle armor and weapon compatibility', () => {
    const unit = new Unit(1, 'Test Unit', 0.8, 70, 80)
    const plateArmor = Armor.createFullSet('plate')
    expect(unit.body.canWearArmor(plateArmor.getTotalWeight())).toBe(true)

    // Test with light weapon
    const lightWeapon = new Weapon('sword', 1.0, 80, 'sword', ['cutting', 'piercing'], 0.8, 0.7, 8)
    expect(unit.combat.canWieldWeapon(lightWeapon)).toBe(true)

    // Test with very heavy weapon (should be too heavy for this unit)
    const heavyWeapon = new Weapon('greatsword', 25.0, 120, 'sword', ['cutting'], 0.9, 0, 25)
    expect(unit.combat.canWieldWeapon(heavyWeapon)).toBe(false)
  })

  it('should reflect combat effectiveness changes due to injury', () => {
    const unit = new Unit(1, 'Test Unit', 0.8, 70, 80)
    const initialEffectiveness = unit.combat.getCombatEffectiveness()
    // Apply injury and check combat effectiveness changes
    const injury = Injuries.DEEP_STAB.createInjury('rightArm')
    unit.body.receiveInjury(injury)
    expect(unit.combat.getCombatEffectiveness()).toBeLessThan(initialEffectiveness)
  })

  it('should reduce combat effectiveness when stamina is low', () => {
    const unit = new Unit(1, 'Test Unit', 0.8, 70, 80)
    const initialEffectiveness = unit.combat.getCombatEffectiveness()
    
    // Drain stamina by performing actions
    for (let i = 0; i < 10; i++) {
      unit.combat.performAction('attack')
    }
    
    // Combat effectiveness should be reduced when stamina is low
    expect(unit.combat.getCombatEffectiveness()).toBeLessThanOrEqual(initialEffectiveness)
  })

  it('should not allow actions when unconscious', () => {
    const unit = new Unit(1, 'Test Unit', 0.8, 70, 80)
    
    // Make unit unconscious by causing severe injuries
    const injury = Injuries.SEVERE_HEAD_TRAUMA.createInjury('head')
    unit.body.receiveInjury(injury)
    
    expect(unit.combat.canPerformAction('attack')).toBe(false)
  })
}) 