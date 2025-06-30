import { Unit } from '../units/unit.js'

export class Battle {
  public units: Unit[]
  public time: number = 0
  public isActive: boolean = true

  constructor(units: Unit[]) {
    this.units = units
  }

  /**
   * Update the battle state by deltaTime seconds
   * - Updates all units (movement, stamina, perception, etc.)
   * - Resolves combat interactions
   */
  update(deltaTime: number) {
    if (!this.isActive) return
    this.time += deltaTime

    // 1. Update all units
    for (const unit of this.units) {
      unit.update(deltaTime)
    }

    // 2. Resolve combat and interactions
    this.resolveCombat()

    // 3. End condition: only one or zero units left alive
    if (this.units.filter(u => u.body.isAlive()).length <= 1) {
      this.isActive = false
    }
  }

  /**
   * Resolve combat and other interactions between units
   * (To be expanded: attacks, blocks, targeting, etc.)
   */
  resolveCombat() {
    // Placeholder: In a real system, resolve attacks, blocks, etc.
    // For now, this is a stub for future combat logic
  }
} 