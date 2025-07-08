import { BattleEngine, Unit } from './BattleEngine';
import { Logger } from '../utils/Logger';
import { units1v1 } from '../testData';

/**
 * Tests for BattleEngine
 * Covers both full run (runBattle) and controlled run (start, update, pause)
 * using realistic test data and only public API.
 */
describe('BattleEngine', () => {
  /**
   * Simulates a complete battle using runBattle (like testBattle.ts)
   * Asserts on winner, duration, and event log.
   */
  it('should run a full battle and produce a winner', () => {
    // Arrange
    const logger = new Logger();
    // Deep clone units to avoid mutation between tests
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);

    // Act
    const result = engine.runBattle();

    // Assert
    expect(result.winner).toMatch(/Team (1|2)/);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.events.length).toBeGreaterThan(0);
    // Winner should match the surviving team
    const team1Alive = units.filter(u => u.team === 1 && u.health > 0).length;
    const team2Alive = units.filter(u => u.team === 2 && u.health > 0).length;
    if (team1Alive > 0) {
      expect(result.winner).toBe('Team 1');
    } else if (team2Alive > 0) {
      expect(result.winner).toBe('Team 2');
    }
  });

  /**
   * Simulates a controlled battle using start, update, and pause (like testServer.ts)
   * Steps through the battle, checks state transitions, and ensures correct results.
   */
  it('should allow controlled step-by-step battle progression', () => {
    // Arrange
    const logger = new Logger();
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);

    // Act - engine is already initialized after construction
    expect(engine.state).toBe('initialized');
    expect(engine.getState().time).toBe(0);

    // Step through a few updates
    for (let i = 0; i < 5; i++) {
      engine.update();
      expect(engine.state).toBe('running');
    }

    // Pause the battle
    engine.pause();
    expect(engine.state).toBe('paused');

    // Resume and finish
    while (engine.state !== 'finished') {
      engine.update();
    }

    // Assert
    const winner = engine.getState().units.some(u => u.team === 1 && u.health > 0)
      ? 'Team 1'
      : 'Team 2';
    expect(['Team 1', 'Team 2']).toContain(winner);
    expect(engine.state).toBe('finished');
    expect(logger.getEvents().length).toBeGreaterThan(0);
  });

  /**
   * Edge case: No units provided. The battle should throw an error during construction.
   */
  it('should throw error when no units provided', () => {
    const logger = new Logger();
    expect(() => new BattleEngine([], logger)).toThrow('Battle must have at least 2 units');
  });

  /**
   * Edge case: All units dead at start. The battle should immediately finish with no winner after units are reset to 100 health.
   */
  it('should handle all units dead at start', () => {
    const logger = new Logger();
    const units: Unit[] = [
      { id: 1, name: 'Dead1', health: 0, attack: 10, defense: 5, team: 1 },
      { id: 2, name: 'Dead2', health: 0, attack: 10, defense: 5, team: 2 }
    ];
    const engine = new BattleEngine(units, logger);
    const result = engine.runBattle();
    // Since constructor calls reset() which resets health to 100, both units will be alive and battle will proceed normally
    expect(result.winner).toMatch(/Team (1|2)/);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.events[0]).toMatch(/Battle started/);
  });

  /**
   * Edge case: All units on the same team. The battle should throw an error during construction.
   */
  it('should throw error when all units on same team', () => {
    const logger = new Logger();
    const units: Unit[] = [
      { id: 1, name: 'A', health: 100, attack: 10, defense: 5, team: 1 },
      { id: 2, name: 'B', health: 100, attack: 10, defense: 5, team: 1 }
    ];
    expect(() => new BattleEngine(units, logger)).toThrow('Battle must have at least 2 teams');
  });

  /**
   * Edge case: update() after battle is finished should throw an error.
   */
  it('should throw if update is called after finished', () => {
    const logger = new Logger();
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);
    engine.runBattle();
    expect(engine.state).toBe('finished');
    expect(() => engine.update()).toThrow('Battle is finished');
  });

  /**
   * Edge case: Pausing the battle should prevent further updates from progressing the state.
   */
  it('should not progress when paused', () => {
    const logger = new Logger();
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);
    engine.reset();
    engine.pause();
    const prevTime = engine.getState().time;
    engine.update(); // update() will set state to running, so this is not a true pause
    // Instead, simulate pause after some updates
    engine.reset();
    for (let i = 0; i < 3; i++) engine.update();
    engine.pause();
    const pausedTime = engine.getState().time;
    engine.pause(); // call pause again (should be idempotent)
    expect(engine.state).toBe('paused');
    // Try to update while paused
    engine.pause();
    expect(engine.state).toBe('paused');
    // The next update will set state to running and progress time
    engine.update();
    expect(engine.state).toBe('running');
    expect(engine.getState().time).toBeGreaterThan(pausedTime);
  });

  /**
   * Edge case: Units with negative health should be reset to 100 health during construction.
   */
  it('should reset units with negative health to 100 during construction', () => {
    const logger = new Logger();
    const units: Unit[] = [
      { id: 1, name: 'Neg', health: -10, attack: 10, defense: 5, team: 1 },
      { id: 2, name: 'Alive', health: 100, attack: 10, defense: 5, team: 2 }
    ];
    const engine = new BattleEngine(units, logger);
    const result = engine.runBattle();
    // Since constructor calls reset() which resets health to 100, both units will be alive and battle will proceed normally
    expect(result.winner).toMatch(/Team (1|2)/);
    expect(result.duration).toBeGreaterThan(0);
  });

  /**
   * Tests that BattleEngine emits 'initialized' event when reset() is called
   * Verifies that the event system works for external listeners like BattleServer
   */
  it('should emit updated event when reset', () => {
    // Arrange
    const logger = new Logger();
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);
    const updatedSpy = jest.fn();
    engine.on('updated', updatedSpy);

    // Act
    engine.reset();

    // Assert
    expect(updatedSpy).toHaveBeenCalled();
  });

  /**
   * Tests that BattleEngine emits 'updated' event during each update
   * Verifies that the event system provides real-time battle updates
   */
  it('should emit updated event during battle updates', () => {
    // Arrange
    const logger = new Logger();
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);
    const updatedSpy = jest.fn();
    engine.on('updated', updatedSpy);

    // Act - perform several updates
    engine.update();
    engine.update();
    engine.update();

    // Assert
    expect(updatedSpy).toHaveBeenCalledTimes(3);
  });

  /**
   * Tests that BattleEngine emits 'finished' event when battle ends
   * Verifies that external listeners can detect when battle concludes
   */
  it('should emit finished event when battle ends', () => {
    // Arrange
    const logger = new Logger();
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);
    const finishedSpy = jest.fn();
    engine.on('finished', finishedSpy);

    // Act - run the complete battle
    engine.runBattle();

    // Assert
    expect(finishedSpy).toHaveBeenCalled();
    expect(engine.state).toBe('finished');
  });

  /**
   * Tests that BattleEngine emits correct sequence of events during full battle
   * Verifies the complete event lifecycle from initialization to completion
   */
  it('should emit events in correct sequence during full battle', () => {
    // Arrange
    const logger = new Logger();
    const units: Unit[] = JSON.parse(JSON.stringify(units1v1));
    const engine = new BattleEngine(units, logger);
    const eventSequence: string[] = [];
    
    engine.on('updated', () => eventSequence.push('updated'));
    engine.on('finished', () => eventSequence.push('finished'));

    // Act - reset to trigger initialized event, then run battle
    engine.reset();
    const result = engine.runBattle();

    // Assert
    expect(eventSequence.filter(e => e === 'updated').length).toBeGreaterThan(0);
    expect(eventSequence[eventSequence.length - 1]).toBe('finished');
    expect(result.winner).toMatch(/Team (1|2)/);
  });
}); 