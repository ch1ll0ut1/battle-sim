import { Unit } from '../units/unit.js';
import { Position } from '../common/position.js';
import { BattleEngine } from './battle-engine.js';
import { Weapon } from '../weapons/weapon.js';

describe('BattleEngine', () => {
  let veteran: Unit;
  let novice: Unit;
  let engine: BattleEngine;

  beforeEach(() => {
    veteran = new Unit(
      1,
      'Veteran Swordsman',
      0.8, // High experience
      80,  // Average weight
      85,  // High strength
      new Position(0, 0),
      1
    );

    novice = new Unit(
      2,
      'Novice Swordsman',
      0.2, // Low experience
      70,  // Average weight
      70,  // Average strength
      new Position(2, 0), // Start 2 units away - outside attack range
      2
    );

    // Equip weapons and armor
    const veteranSword = new Weapon('longsword', 1.5, 100, 'sword', ['cutting', 'piercing'], 0.9, 0.8, 10);
    const noviceSword = new Weapon('shortsword', 1.0, 80, 'sword', ['cutting', 'piercing'], 0.7, 0.6, 6);
    veteran.combat.equipWeapon(veteranSword);
    novice.combat.equipWeapon(noviceSword);

    veteran.body.armor.equipFullSet('chainmail'); // Better armor for veteran
    novice.body.armor.equipFullSet('leather'); // Basic armor for novice

    engine = new BattleEngine([veteran, novice], 'detailed');
  });

  describe('Battle Simulation', () => {
    it('should simulate combat between units', () => {
      const result = engine.runBattle();
      const events = result.logger.getEvents();

      // Should have combat events
      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.type === 'action')).toBe(true);
    });

    it('should track unit positions', () => {
      const initialVeteranPos = veteran.position.clone();
      const initialNovicePos = novice.position.clone();

      const result = engine.runBattle();

      // Units should move during combat
      expect(veteran.position.equals(initialVeteranPos)).toBe(false);
      expect(novice.position.equals(initialNovicePos)).toBe(false);
    });

    it('should handle combat resolution', () => {
      const result = engine.runBattle();
      const events = result.logger.getEvents();

      // Should have combat resolution events
      expect(events.some(e => e.type === 'action' && e.description.includes('hits'))).toBe(true);
      expect(events.some(e => e.type === 'injury')).toBe(true);
    });

    it('should track unit status changes', () => {
      const result = engine.runBattle();
      const events = result.logger.getEvents();

      // Should have status change events
      expect(events.some(e => e.type === 'stat_change' || e.type === 'injury')).toBe(true);
    });

    it('should end battle appropriately', () => {
      const result = engine.runBattle();
      const events = result.logger.getEvents();
      
      // Should have an end event
      expect(events.some(e => e.type === 'end')).toBe(true);
      
      // One unit should be defeated
      expect(veteran.body.isAlive() || novice.body.isAlive()).toBe(true);
      expect(veteran.body.isAlive() && novice.body.isAlive()).toBe(false);
    });
  });

  describe('Combat Mechanics', () => {
    it('should handle stamina and fatigue', () => {
      const initialVeteranStamina = veteran.combat.stamina;
      const initialNoviceStamina = novice.combat.stamina;

      engine.runBattle();

      // Combat should drain stamina
      expect(veteran.combat.stamina).toBeLessThan(initialVeteranStamina);
      expect(novice.combat.stamina).toBeLessThan(initialNoviceStamina);
    });

    it('should apply experience effects', () => {
      const result = engine.runBattle();
      const events = result.logger.getEvents();

      // Veteran should be more effective in combat
      const veteranHits = events.filter(e => 
        e.type === 'action' && e.description.includes('hits') && e.unit?.id === veteran.id
      ).length;
      const noviceHits = events.filter(e => 
        e.type === 'action' && e.description.includes('hits') && e.unit?.id === novice.id
      ).length;

      expect(veteranHits).toBeGreaterThan(noviceHits);
    });

    it('should handle injuries realistically', () => {
      const result = engine.runBattle();
      const events = result.logger.getEvents();

      // Should have a mix of injury severities
      const injuries = events.filter(e => e.type === 'injury');
      expect(injuries.length).toBeGreaterThan(0);

      // Injuries should affect combat effectiveness
      const injuredUnit = injuries[0].unit as Unit;
      expect(injuredUnit.combat.getCombatEffectiveness()).toBeLessThan(1.0);
    });
  });
}); 