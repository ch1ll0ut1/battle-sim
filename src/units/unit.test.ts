// Integration tests for Unit class
import { Unit } from './unit.js'

describe('Unit Integration', () => {
  it('should create a unit with basic stats', () => {
    const unit = new Unit(0.8, 70, 80)
    expect(unit.body.isAlive()).toBe(true)
    expect(unit.body.isConscious()).toBe(true)
    expect(unit.combat.getCombatEffectiveness()).toBeGreaterThan(0)
  })

  it('should update both body and combat systems', () => {
    const unit = new Unit(0.8, 70, 80)
    const initialStamina = unit.combat.stamina
    
    // Update the unit
    unit.update(1.0)
    
    // Verify that both systems were updated
    // Combat system should recover stamina when stationary
    expect(unit.combat.stamina).toBeGreaterThanOrEqual(initialStamina)
    // Body system should still be alive and conscious (no injuries)
    expect(unit.body.isAlive()).toBe(true)
    expect(unit.body.isConscious()).toBe(true)
  })

  it('should drain stamina when performing actions', () => {
    const unit = new Unit(0.8, 70, 80)
    const initialStamina = unit.combat.stamina
    
    // Perform several actions to drain stamina
    for (let i = 0; i < 5; i++) {
      unit.combat.performAction('attack')
    }
    
    // Stamina should be reduced after actions
    expect(unit.combat.stamina).toBeLessThan(initialStamina)
  })
}) 