import { Injuries } from './injuries.js'

describe('InjuryType', () => {
  describe('Basic Functionality', () => {
    it('should create injury instances correctly', () => {
      const scratch = Injuries.SCRATCH
      const injury = scratch.createInjury('leftArm')
      
      expect(injury.bodyPart).toBe('leftArm')
      expect(injury.severity).toBe('minor')
      expect(injury.woundType).toBe('cut')
      expect(injury.bleedingRate).toBe(0.5)
      expect(injury.pain).toBe(10)
      expect(injury.shock).toBe(5)
      expect(injury.isFatal).toBe(false)
    })

    it('should return correct functionality penalty', () => {
      expect(Injuries.SCRATCH.getFunctionalityPenalty()).toBe(5)
      expect(Injuries.DEEP_CUT.getFunctionalityPenalty()).toBe(15)
      expect(Injuries.BROKEN_BONE.getFunctionalityPenalty()).toBe(40)
      expect(Injuries.COMPOUND_FRACTURE.getFunctionalityPenalty()).toBe(60)
      expect(Injuries.DECAPITATION.getFunctionalityPenalty()).toBe(100)
    })

    it('should correctly identify combat-preventing injuries', () => {
      expect(Injuries.SCRATCH.wouldPreventCombat()).toBe(false)
      expect(Injuries.DEEP_CUT.wouldPreventCombat()).toBe(false)
      expect(Injuries.COMPOUND_FRACTURE.wouldPreventCombat()).toBe(true)
      expect(Injuries.DECAPITATION.wouldPreventCombat()).toBe(true)
    })

    it('should provide meaningful descriptions', () => {
      expect(Injuries.SCRATCH.getEffectDescription()).toContain('superficial')
      expect(Injuries.DECAPITATION.getEffectDescription()).toContain('death')
    })
  })

  describe('Injury Categories', () => {
    it('should categorize injuries by severity correctly', () => {
      const minorInjuries = Injuries.getMinorInjuries()
      const moderateInjuries = Injuries.getModerateInjuries()
      const severeInjuries = Injuries.getSevereInjuries()
      const criticalInjuries = Injuries.getCriticalInjuries()
      const fatalInjuries = Injuries.getFatalInjuries()

      expect(minorInjuries.length).toBeGreaterThan(0)
      expect(moderateInjuries.length).toBeGreaterThan(0)
      expect(severeInjuries.length).toBeGreaterThan(0)
      expect(criticalInjuries.length).toBeGreaterThan(0)
      expect(fatalInjuries.length).toBeGreaterThan(0)

      minorInjuries.forEach(injury => expect(injury.severity).toBe('minor'))
      moderateInjuries.forEach(injury => expect(injury.severity).toBe('moderate'))
      severeInjuries.forEach(injury => expect(injury.severity).toBe('severe'))
      criticalInjuries.forEach(injury => expect(injury.severity).toBe('critical'))
      fatalInjuries.forEach(injury => expect(injury.severity).toBe('fatal'))
    })

    it('should categorize injuries by wound type correctly', () => {
      const cutInjuries = Injuries.getInjuriesByWoundType('cut')
      const stabInjuries = Injuries.getInjuriesByWoundType('stab')
      const crushInjuries = Injuries.getInjuriesByWoundType('crush')
      const amputationInjuries = Injuries.getInjuriesByWoundType('amputation')

      expect(cutInjuries.length).toBeGreaterThan(0)
      expect(stabInjuries.length).toBeGreaterThan(0)
      expect(crushInjuries.length).toBeGreaterThan(0)
      expect(amputationInjuries.length).toBeGreaterThan(0)

      cutInjuries.forEach(injury => expect(injury.woundType).toBe('cut'))
      stabInjuries.forEach(injury => expect(injury.woundType).toBe('stab'))
      crushInjuries.forEach(injury => expect(injury.woundType).toBe('crush'))
      amputationInjuries.forEach(injury => expect(injury.woundType).toBe('amputation'))
    })
  })

  describe('Factory Methods', () => {
    it('should find injuries by name', () => {
      const scratch = Injuries.findByName('Scratch')
      const decapitation = Injuries.findByName('Decapitation')
      
      expect(scratch).toBeDefined()
      expect(scratch?.name).toBe('Scratch')
      expect(decapitation).toBeDefined()
      expect(decapitation?.name).toBe('Decapitation')
    })

    it('should create injuries by name', () => {
      const injury = Injuries.createInjuryByName('Scratch', 'leftArm')
      expect(injury.bodyPart).toBe('leftArm')
      expect(injury.severity).toBe('minor')
    })

    it('should throw error for non-existent injury names', () => {
      expect(() => Injuries.createInjuryByName('NonExistent', 'head')).toThrow()
    })

    it('should get random injuries by severity', () => {
      const randomMinor = Injuries.getRandomInjuryBySeverity('minor')
      const randomFatal = Injuries.getRandomInjuryBySeverity('fatal')
      
      expect(randomMinor.severity).toBe('minor')
      expect(randomFatal.severity).toBe('fatal')
    })

    it('should get random injuries by wound type', () => {
      const randomCut = Injuries.getRandomInjuryByWoundType('cut')
      const randomStab = Injuries.getRandomInjuryByWoundType('stab')
      
      expect(randomCut.woundType).toBe('cut')
      expect(randomStab.woundType).toBe('stab')
    })
  })

  describe('Realistic Injury Properties', () => {
    it('should have realistic bleeding rates', () => {
      // Minor injuries should have low bleeding rates
      Injuries.getMinorInjuries().forEach(injury => {
        expect(injury.bleedingRate).toBeLessThanOrEqual(1)
      })

      // Fatal injuries should have high bleeding rates
      Injuries.getFatalInjuries().forEach(injury => {
        expect(injury.bleedingRate).toBeGreaterThanOrEqual(12)
      })
    })

    it('should have realistic pain and shock values', () => {
      // All injuries should have pain and shock within valid ranges
      Injuries.getAllInjuries().forEach(injury => {
        expect(injury.pain).toBeGreaterThanOrEqual(0)
        expect(injury.pain).toBeLessThanOrEqual(100)
        expect(injury.shock).toBeGreaterThanOrEqual(0)
        expect(injury.shock).toBeLessThanOrEqual(100)
      })
    })

    it('should have fatal injuries marked correctly', () => {
      Injuries.getFatalInjuries().forEach(injury => {
        expect(injury.isFatal).toBe(true)
        expect(injury.timeToDeath).toBeDefined()
        expect(injury.timeToDeath).toBeGreaterThan(0)
      })

      Injuries.getMinorInjuries().forEach(injury => {
        expect(injury.isFatal).toBe(false)
      })
    })
  })
}) 