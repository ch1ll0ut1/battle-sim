import { Armor, ArmorSlot, ArmorMaterial } from './armor'

describe('Armor', () => {
  describe('Individual Pieces', () => {
    it('should equip and retrieve individual armor pieces', () => {
      const armor = new Armor()
      
      armor.equipPiece('helmet', 'plate')
      expect(armor.getPiece('helmet')).toBeDefined()
      expect(armor.getPiece('helmet')?.name).toContain('Plate')
      expect(armor.getProtection('helmet')).toBeGreaterThan(0)
    })

    it('should return 0 protection for unequipped slots', () => {
      const armor = new Armor()
      expect(armor.getProtection('helmet')).toBe(0)
    })

    it('should allow unequipping pieces', () => {
      const armor = new Armor()
      armor.equipPiece('shirt', 'chainmail')
      const protectionWithArmor = armor.getProtection('shirt')
      expect(protectionWithArmor).toBeGreaterThan(0)
      
      armor.unequipPiece('shirt')
      expect(armor.getProtection('shirt')).toBe(0)
      expect(armor.getPiece('shirt')).toBeUndefined()
    })
  })

  describe('Material Types', () => {
    it('should have different protection values for different materials', () => {
      const leatherArmor = new Armor()
      const chainArmor = new Armor()
      const plateArmor = new Armor()
      
      leatherArmor.equipPiece('helmet', 'leather')
      chainArmor.equipPiece('helmet', 'chainmail')
      plateArmor.equipPiece('helmet', 'plate')
      
      const leatherProtection = leatherArmor.getProtection('helmet')
      const chainProtection = chainArmor.getProtection('helmet')
      const plateProtection = plateArmor.getProtection('helmet')
      
      expect(leatherProtection).toBeGreaterThan(0)
      expect(chainProtection).toBeGreaterThan(leatherProtection)
      expect(plateProtection).toBeGreaterThan(chainProtection)
    })

    it('should have different weights for different materials', () => {
      const leatherArmor = new Armor()
      const chainArmor = new Armor()
      const plateArmor = new Armor()
      
      leatherArmor.equipPiece('shirt', 'leather')
      chainArmor.equipPiece('shirt', 'chainmail')
      plateArmor.equipPiece('shirt', 'plate')
      
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
      expect(leatherSet.getAllPieces()).toHaveLength(6)
      expect(leatherSet.getTotalWeight()).toBeGreaterThan(0)
      expect(leatherSet.getProtection('helmet')).toBeGreaterThan(0)
      expect(leatherSet.getProtection('shirt')).toBeGreaterThan(0)
    })

    it('should create full chainmail set', () => {
      const chainSet = Armor.createFullSet('chainmail')
      expect(chainSet.getAllPieces()).toHaveLength(6)
      expect(chainSet.getTotalWeight()).toBeGreaterThan(0)
      expect(chainSet.getProtection('helmet')).toBeGreaterThan(0)
      expect(chainSet.getProtection('shirt')).toBeGreaterThan(0)
    })

    it('should create full plate set', () => {
      const plateSet = Armor.createFullSet('plate')
      expect(plateSet.getAllPieces()).toHaveLength(6)
      expect(plateSet.getTotalWeight()).toBeGreaterThan(0)
      expect(plateSet.getProtection('helmet')).toBeGreaterThan(0)
      expect(plateSet.getProtection('shirt')).toBeGreaterThan(0)
    })
  })

  describe('Partial Sets', () => {
    it('should create partial armor sets', () => {
      const partialSet = Armor.createPartialSet('chainmail', ['helmet', 'shirt'])
      expect(partialSet.getAllPieces()).toHaveLength(2)
      expect(partialSet.getProtection('helmet')).toBeGreaterThan(0)
      expect(partialSet.getProtection('shirt')).toBeGreaterThan(0)
      expect(partialSet.getProtection('pants')).toBe(0)
    })
  })

  describe('Weight Calculations', () => {
    it('should calculate total weight correctly', () => {
      const armor = new Armor()
      armor.equipPiece('helmet', 'plate')
      armor.equipPiece('shirt', 'chainmail')
      armor.equipPiece('gloves', 'leather')
      
      const totalWeight = armor.getTotalWeight()
      expect(totalWeight).toBeGreaterThan(0)
      
      // Individual pieces should have weight
      const helmetWeight = armor.getPiece('helmet')?.weight || 0
      const shirtWeight = armor.getPiece('shirt')?.weight || 0
      const glovesWeight = armor.getPiece('gloves')?.weight || 0
      
      expect(helmetWeight).toBeGreaterThan(0)
      expect(shirtWeight).toBeGreaterThan(0)
      expect(glovesWeight).toBeGreaterThan(0)
      
      // Total should be sum of individual pieces
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
      const leatherHelmet = Armor.ARMOR_PIECES.leather.helmet
      expect(leatherHelmet.protection).toBeGreaterThan(0)
      expect(leatherHelmet.weight).toBeGreaterThan(0)
      
      // Chainmail should offer better protection with more weight
      const chainHelmet = Armor.ARMOR_PIECES.chainmail.helmet
      expect(chainHelmet.protection).toBeGreaterThan(leatherHelmet.protection)
      expect(chainHelmet.weight).toBeGreaterThan(leatherHelmet.weight)
      
      // Plate should offer maximum protection with highest weight
      const plateHelmet = Armor.ARMOR_PIECES.plate.helmet
      expect(plateHelmet.protection).toBeGreaterThan(chainHelmet.protection)
      expect(plateHelmet.weight).toBeGreaterThan(chainHelmet.weight)
    })
  })
}) 