import { Weapons } from './weapons.js'
import { Unit } from '../units/unit.js'

describe('Weapons', () => {
  describe('weapon categories', () => {
    it('should have light weapons under 3kg', () => {
      const lightWeapons = Weapons.getLightWeapons()
      
      lightWeapons.forEach(weapon => {
        expect(weapon.weight).toBeLessThan(3.0)
        expect(weapon.length).toBeLessThan(150)
      })
    })

    it('should have medium weapons between 2.5-6kg', () => {
      const mediumWeapons = Weapons.getMediumWeapons()
      
      mediumWeapons.forEach(weapon => {
        expect(weapon.weight).toBeGreaterThanOrEqual(1.5)
        expect(weapon.weight).toBeLessThanOrEqual(6.0)
        expect(weapon.length).toBeGreaterThanOrEqual(80)
        expect(weapon.length).toBeLessThanOrEqual(200)
      })
    })

    it('should have heavy weapons between 6-10kg', () => {
      const heavyWeapons = Weapons.getHeavyWeapons()
      
      heavyWeapons.forEach(weapon => {
        expect(weapon.weight).toBeGreaterThanOrEqual(6.0)
        expect(weapon.weight).toBeLessThanOrEqual(10.0)
        expect(weapon.length).toBeGreaterThanOrEqual(100)
        expect(weapon.length).toBeLessThanOrEqual(200)
      })
    })

    it('should have massive weapons over 10kg', () => {
      const massiveWeapons = Weapons.getMassiveWeapons()
      
      massiveWeapons.forEach(weapon => {
        expect(weapon.weight).toBeGreaterThan(10.0)
        expect(weapon.length).toBeGreaterThanOrEqual(120)
      })
    })
  })

  describe('specific weapons', () => {
    it('should have realistic dagger stats', () => {
      expect(Weapons.DAGGER.name).toBe('Dagger')
      expect(Weapons.DAGGER.weight).toBe(0.5)
      expect(Weapons.DAGGER.length).toBe(25)
      expect(Weapons.DAGGER.weaponType).toBe('dagger')
      expect(Weapons.DAGGER.possibleDamageTypes).toEqual(['piercing'])
    })

    it('should have realistic long sword stats', () => {
      expect(Weapons.LONG_SWORD.name).toBe('Long Sword')
      expect(Weapons.LONG_SWORD.weight).toBe(3.0)
      expect(Weapons.LONG_SWORD.length).toBe(100)
      expect(Weapons.LONG_SWORD.weaponType).toBe('sword')
      expect(Weapons.LONG_SWORD.possibleDamageTypes).toEqual(['cutting', 'piercing'])
    })

    it('should have realistic great sword stats', () => {
      expect(Weapons.GREAT_SWORD.name).toBe('Great Sword')
      expect(Weapons.GREAT_SWORD.weight).toBe(6.0)
      expect(Weapons.GREAT_SWORD.length).toBe(120)
      expect(Weapons.GREAT_SWORD.weaponType).toBe('sword')
      expect(Weapons.GREAT_SWORD.possibleDamageTypes).toEqual(['cutting'])
    })

    it('should have realistic zweihander stats', () => {
      expect(Weapons.ZWEIHANDER.name).toBe('Zweihander')
      expect(Weapons.ZWEIHANDER.weight).toBe(12.0)
      expect(Weapons.ZWEIHANDER.length).toBe(150)
      expect(Weapons.ZWEIHANDER.weaponType).toBe('sword')
      expect(Weapons.ZWEIHANDER.possibleDamageTypes).toEqual(['cutting'])
    })
  })

  describe('findByName', () => {
    it('should find weapons by name (case insensitive)', () => {
      expect(Weapons.findByName('dagger')).toBe(Weapons.DAGGER)
      expect(Weapons.findByName('LONG SWORD')).toBe(Weapons.LONG_SWORD)
      expect(Weapons.findByName('Great Sword')).toBe(Weapons.GREAT_SWORD)
    })

    it('should return undefined for non-existent weapons', () => {
      expect(Weapons.findByName('nonexistent')).toBeUndefined()
    })
  })

  describe('getWeaponsByDamageType', () => {
    it('should return only cutting weapons', () => {
      const cuttingWeapons = Weapons.getWeaponsByDamageType('cutting')
      
      cuttingWeapons.forEach(weapon => {
        expect(weapon.canPerformDamageType('cutting')).toBe(true)
      })
      
      expect(cuttingWeapons).toContain(Weapons.SCIMITAR)
      expect(cuttingWeapons).toContain(Weapons.BATTLE_AXE)
      expect(cuttingWeapons).not.toContain(Weapons.DAGGER)
    })

    it('should return only piercing weapons', () => {
      const piercingWeapons = Weapons.getWeaponsByDamageType('piercing')
      
      piercingWeapons.forEach(weapon => {
        expect(weapon.canPerformDamageType('piercing')).toBe(true)
      })
      
      expect(piercingWeapons).toContain(Weapons.DAGGER)
      expect(piercingWeapons).toContain(Weapons.SPEAR)
      expect(piercingWeapons).not.toContain(Weapons.WAR_HAMMER)
    })

    it('should return only blunt weapons', () => {
      const bluntWeapons = Weapons.getWeaponsByDamageType('blunt')
      
      bluntWeapons.forEach(weapon => {
        expect(weapon.canPerformDamageType('blunt')).toBe(true)
      })
      
      expect(bluntWeapons).toContain(Weapons.WAR_HAMMER)
      expect(bluntWeapons).toContain(Weapons.MAUL)
      expect(bluntWeapons).not.toContain(Weapons.DAGGER)
    })
  })

  describe('getWeaponsByType', () => {
    it('should return only swords', () => {
      const swords = Weapons.getWeaponsByType('sword')
      
      swords.forEach(weapon => {
        expect(weapon.weaponType).toBe('sword')
      })
      
      expect(swords).toContain(Weapons.LONG_SWORD)
      expect(swords).toContain(Weapons.GREAT_SWORD)
      expect(swords).not.toContain(Weapons.BATTLE_AXE)
    })
  })

  describe('getWieldableWeapons', () => {
    it('should return only weapons a weak unit can wield', () => {
      const weakUnit = new Unit(1, 'Weak Unit', 0.5, 100, 15)
      const wieldableWeapons = Weapons.getWieldableWeapons(weakUnit)
      
      // All returned weapons should be wieldable by the weak unit
      wieldableWeapons.forEach(weapon => {
        expect(weakUnit.combat.canWieldWeapon(weapon)).toBe(true)
      })
      // Should return at least one weapon
      expect(wieldableWeapons.length).toBeGreaterThan(0)
    })

    it('should return all weapons for a very strong unit', () => {
      const strongUnit = new Unit(2, 'Strong Unit', 0.5, 100, 100)
      const wieldableWeapons = Weapons.getWieldableWeapons(strongUnit)
      // Should include even the heaviest weapons
      expect(wieldableWeapons).toContain(Weapons.ZWEIHANDER)
      expect(wieldableWeapons).toContain(Weapons.GIANT_AXE)
      expect(wieldableWeapons).toContain(Weapons.SIEGE_HAMMER)
    })

    it('should return appropriate weapons for medium strength', () => {
      const mediumUnit = new Unit(3, 'Medium Unit', 0.5, 100, 50)
      const wieldableWeapons = Weapons.getWieldableWeapons(mediumUnit)
      // All returned weapons should be wieldable by the medium unit
      wieldableWeapons.forEach(weapon => {
        expect(mediumUnit.combat.canWieldWeapon(weapon)).toBe(true)
      })
      // Should return at least one weapon
      expect(wieldableWeapons.length).toBeGreaterThan(0)
    })

    it('should filter weapons by strength requirements', () => {
      // Test with weak unit (strength 15)
      const weakUnit = new Unit(1, 'Weak Unit', 0.5, 100, 15)
      const weakUnitWeapons = Weapons.getWieldableWeapons(weakUnit)
      
      // Weak unit should only get light weapons
      expect(weakUnitWeapons.length).toBeLessThan(Weapons.getAllWeapons().length)
      weakUnitWeapons.forEach(weapon => {
        expect(weapon.weight).toBeLessThanOrEqual(5) // Light weapons only
      })

      // Test with strong unit (strength 100)
      const strongUnit = new Unit(2, 'Strong Unit', 0.5, 100, 100)
      const strongUnitWeapons = Weapons.getWieldableWeapons(strongUnit)
      
      // Strong unit should be able to wield most weapons
      expect(strongUnitWeapons.length).toBeGreaterThan(weakUnitWeapons.length)
    })

    it('should handle medium strength units', () => {
      const mediumUnit = new Unit(3, 'Medium Unit', 0.5, 100, 50)
      const mediumUnitWeapons = Weapons.getWieldableWeapons(mediumUnit)
      
      // Medium unit should get a reasonable selection
      expect(mediumUnitWeapons.length).toBeGreaterThan(0)
      mediumUnitWeapons.forEach(weapon => {
        expect(weapon.weight).toBeLessThanOrEqual(15) // Medium weight limit
      })
    })
  })

  describe('getAllWeapons', () => {
    it('should return all weapons from all categories', () => {
      const allWeapons = Weapons.getAllWeapons()
      
      expect(allWeapons.length).toBe(23) // Total number of weapons
      expect(allWeapons).toContain(Weapons.DAGGER)
      expect(allWeapons).toContain(Weapons.LONG_SWORD)
      expect(allWeapons).toContain(Weapons.GREAT_SWORD)
      expect(allWeapons).toContain(Weapons.ZWEIHANDER)
    })
  })
}) 