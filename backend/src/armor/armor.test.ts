import { Armor } from './armor'

describe('Armor', () => {
  describe('Individual Items', () => {
    it('should equip and retrieve individual armor items', () => {
      const armor = new Armor()
      
      armor.equip('helmet', 'plate')
      expect(armor.get('helmet')).toBeDefined()
      expect(armor.get('helmet')?.name).toContain('Plate')
      expect(armor.getWoundTypeProtection('helmet', 'cut')).toBeGreaterThan(0)
    })

    it('should return 0 protection for unequipped slots', () => {
      const armor = new Armor()
      expect(armor.getWoundTypeProtection('helmet', 'cut')).toBe(0)
    })

    it('should allow unequipping items', () => {
      const armor = new Armor()
      armor.equip('shirt', 'chainmail')
      const protectionWithArmor = armor.getWoundTypeProtection('shirt', 'cut')
      expect(protectionWithArmor).toBeGreaterThan(0)
      
      armor.unequip('shirt')
      expect(armor.getWoundTypeProtection('shirt', 'cut')).toBe(0)
      expect(armor.get('shirt')).toBeUndefined()
    })
  })

  describe('Material Types', () => {
    it('should have different protection values for different materials', () => {
      const leatherArmor = new Armor()
      const chainArmor = new Armor()
      const plateArmor = new Armor()
      
      leatherArmor.equip('helmet', 'leather')
      chainArmor.equip('helmet', 'chainmail')
      plateArmor.equip('helmet', 'plate')
      
      const leatherProtection = leatherArmor.getWoundTypeProtection('helmet', 'cut')
      const chainProtection = chainArmor.getWoundTypeProtection('helmet', 'cut')
      const plateProtection = plateArmor.getWoundTypeProtection('helmet', 'cut')
      
      expect(leatherProtection).toBeGreaterThan(0)
      expect(chainProtection).toBeGreaterThan(leatherProtection)
      expect(plateProtection).toBeGreaterThan(chainProtection)
    })

    it('should have different weights for different materials', () => {
      const leatherArmor = new Armor()
      const chainArmor = new Armor()
      const plateArmor = new Armor()
      
      leatherArmor.equip('shirt', 'leather')
      chainArmor.equip('shirt', 'chainmail')
      plateArmor.equip('shirt', 'plate')
      
      const leatherWeight = leatherArmor.getTotalWeight()
      const chainWeight = chainArmor.getTotalWeight()
      const plateWeight = plateArmor.getTotalWeight()
      
      expect(leatherWeight).toBeGreaterThan(0)
      expect(chainWeight).toBeGreaterThan(leatherWeight)
      expect(plateWeight).toBeGreaterThan(chainWeight)
    })
  })

  describe('Full Sets', () => {
    it('should create full leather set', () => {
      const leatherSet = Armor.createFullSet('leather')
      expect(leatherSet.getAllItems()).toHaveLength(6)
      expect(leatherSet.getTotalWeight()).toBeGreaterThan(0)
      expect(leatherSet.getWoundTypeProtection('helmet', 'cut')).toBeGreaterThan(0)
      expect(leatherSet.getWoundTypeProtection('shirt', 'cut')).toBeGreaterThan(0)
    })

    it('should create full chainmail set', () => {
      const chainSet = Armor.createFullSet('chainmail')
      expect(chainSet.getAllItems()).toHaveLength(6)
      expect(chainSet.getTotalWeight()).toBeGreaterThan(0)
      expect(chainSet.getWoundTypeProtection('helmet', 'cut')).toBeGreaterThan(0)
      expect(chainSet.getWoundTypeProtection('shirt', 'cut')).toBeGreaterThan(0)
    })

    it('should create full plate set', () => {
      const plateSet = Armor.createFullSet('plate')
      expect(plateSet.getAllItems()).toHaveLength(6)
      expect(plateSet.getTotalWeight()).toBeGreaterThan(0)
      expect(plateSet.getWoundTypeProtection('helmet', 'cut')).toBeGreaterThan(0)
      expect(plateSet.getWoundTypeProtection('shirt', 'cut')).toBeGreaterThan(0)
    })
  })

  describe('Partial Sets', () => {
    it('should create partial armor sets', () => {
      const partialSet = Armor.createPartialSet('chainmail', ['helmet', 'shirt'])
      expect(partialSet.getAllItems()).toHaveLength(2)
      expect(partialSet.getWoundTypeProtection('helmet', 'cut')).toBeGreaterThan(0)
      expect(partialSet.getWoundTypeProtection('shirt', 'cut')).toBeGreaterThan(0)
      expect(partialSet.getWoundTypeProtection('pants', 'cut')).toBe(0)
    })
  })

  describe('Weight Calculations', () => {
    it('should calculate total weight correctly', () => {
      const armor = new Armor()
      armor.equip('helmet', 'plate')
      armor.equip('shirt', 'chainmail')
      armor.equip('gloves', 'leather')
      
      const totalWeight = armor.getTotalWeight()
      expect(totalWeight).toBeGreaterThan(0)
      
      // Individual items should have weight
      const helmetWeight = armor.get('helmet')?.weight || 0
      const shirtWeight = armor.get('shirt')?.weight || 0
      const glovesWeight = armor.get('gloves')?.weight || 0
      
      expect(helmetWeight).toBeGreaterThan(0)
      expect(shirtWeight).toBeGreaterThan(0)
      expect(glovesWeight).toBeGreaterThan(0)
      
      // Total should be sum of individual items
      expect(totalWeight).toBe(helmetWeight + shirtWeight + glovesWeight)
    })

    it('should return 0 weight for empty armor', () => {
      const armor = new Armor()
      expect(armor.getTotalWeight()).toBe(0)
    })
  })

  describe('Protection Values', () => {
    it('should have realistic protection progression', () => {
      // Leather should be light but offer minimal protection
      const leatherHelmet = Armor.ARMOR_ITEMS.leather.helmet
      expect(leatherHelmet.cutProtection).toBeGreaterThan(0)
      expect(leatherHelmet.stabProtection).toBeGreaterThan(0)
      expect(leatherHelmet.crushProtection).toBeGreaterThan(0)
      expect(leatherHelmet.weight).toBeGreaterThan(0)
      
      // Chainmail should offer better protection with more weight
      const chainHelmet = Armor.ARMOR_ITEMS.chainmail.helmet
      expect(chainHelmet.cutProtection).toBeGreaterThan(leatherHelmet.cutProtection)
      expect(chainHelmet.stabProtection).toBeGreaterThan(leatherHelmet.stabProtection)
      expect(chainHelmet.crushProtection).toBeGreaterThan(leatherHelmet.crushProtection)
      expect(chainHelmet.weight).toBeGreaterThan(leatherHelmet.weight)
      
      // Plate should offer maximum protection with highest weight
      const plateHelmet = Armor.ARMOR_ITEMS.plate.helmet
      expect(plateHelmet.cutProtection).toBeGreaterThan(chainHelmet.cutProtection)
      expect(plateHelmet.stabProtection).toBeGreaterThan(chainHelmet.stabProtection)
      expect(plateHelmet.crushProtection).toBeGreaterThan(chainHelmet.crushProtection)
      expect(plateHelmet.weight).toBeGreaterThan(chainHelmet.weight)
    })
  })
}) 