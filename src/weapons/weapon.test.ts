import { Weapon } from './weapon'

describe('Weapon', () => {
  describe('constructor', () => {
    it('should create a weapon with correct stats', () => {
      const sword = new Weapon('Sword', 3.0, 100, 'sword', ['cutting', 'piercing'], 0.8, 0.7, 8.0)
      
      expect(sword.name).toBe('Sword')
      expect(sword.weight).toBe(3.0)
      expect(sword.length).toBe(100)
      expect(sword.weaponType).toBe('sword')
      expect(sword.possibleDamageTypes).toEqual(['cutting', 'piercing'])
      expect(sword.edgeSharpness).toBe(0.8)
      expect(sword.pointGeometry).toBe(0.7)
      expect(sword.impactArea).toBe(8.0)
    })
  })

  describe('canPerformDamageType', () => {
    it('should return true for supported damage types', () => {
      const sword = new Weapon('Sword', 3.0, 100, 'sword', ['cutting', 'piercing'])
      
      expect(sword.canPerformDamageType('cutting')).toBe(true)
      expect(sword.canPerformDamageType('piercing')).toBe(true)
    })

    it('should return false for unsupported damage types', () => {
      const sword = new Weapon('Sword', 3.0, 100, 'sword', ['cutting', 'piercing'])
      
      expect(sword.canPerformDamageType('blunt')).toBe(false)
    })
  })

  describe('getPrimaryDamageType', () => {
    it('should return cutting for swords with cutting capability', () => {
      const sword = new Weapon('Sword', 3.0, 100, 'sword', ['cutting', 'piercing'])
      
      expect(sword.getPrimaryDamageType()).toBe('cutting')
    })

    it('should return piercing for daggers', () => {
      const dagger = new Weapon('Dagger', 0.5, 25, 'dagger', ['piercing'])
      
      expect(dagger.getPrimaryDamageType()).toBe('piercing')
    })

    it('should return blunt for hammers', () => {
      const hammer = new Weapon('Hammer', 4.0, 80, 'hammer', ['blunt'])
      
      expect(hammer.getPrimaryDamageType()).toBe('blunt')
    })

    it('should return cutting for axes', () => {
      const axe = new Weapon('Axe', 4.0, 80, 'axe', ['cutting'])
      
      expect(axe.getPrimaryDamageType()).toBe('cutting')
    })
  })
}) 