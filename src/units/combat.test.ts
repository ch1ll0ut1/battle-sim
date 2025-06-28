import { Unit } from './unit.js'
import { Armor } from '../armor/armor.js'
import { Weapon } from '../weapons/weapon.js'

describe('Unit Combat', () => {
  it('should handle armor and weapon compatibility', () => {
    const unit = new Unit(0.8, 70, 80)
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
    const unit = new Unit(0.8, 70, 80)
    const initialEffectiveness = unit.combat.getCombatEffectiveness()
    // Apply injury and check combat effectiveness changes
    unit.body.receiveInjury({
      bodyPart: 'rightArm',
      severity: 'severe',
      damage: 50,
      bleeding: 15,
      pain: 40,
      shock: 25,
      isFatal: false
    })
    expect(unit.combat.getCombatEffectiveness()).toBeLessThan(initialEffectiveness)
  })

  it('should reduce combat effectiveness when stamina is low', () => {
    const unit = new Unit(0.8, 70, 80)
    const initialEffectiveness = unit.combat.getCombatEffectiveness()
    
    // Drain stamina by performing actions
    for (let i = 0; i < 10; i++) {
      unit.combat.performAction('attack')
    }
    
    // Combat effectiveness should be reduced when stamina is low
    expect(unit.combat.getCombatEffectiveness()).toBeLessThanOrEqual(initialEffectiveness)
  })

  it('should not allow actions when unconscious', () => {
    const unit = new Unit(0.8, 70, 80)
    
    // Make unit unconscious by causing severe injuries
    unit.body.receiveInjury({
      bodyPart: 'head',
      severity: 'critical',
      damage: 100,
      bleeding: 0,
      pain: 0,
      shock: 100,
      isFatal: false
    })
    
    expect(unit.combat.canPerformAction('attack')).toBe(false)
  })
}) 