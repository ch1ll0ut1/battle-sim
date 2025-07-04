// Test script to run a simple battle

import { Logger } from './utils/Logger.js';
import { BattleEngine, Unit } from './BattleEngine/BattleEngine.js';
import { printBattleReport } from './utils/printBattleReport.js';

// Create test units
const units: Unit[] = [
  // Team 1
  {
    id: 1,
    name: 'Knight',
    health: 100,
    attack: 15,
    defense: 10,
    team: 1
  },
  {
    id: 2,
    name: 'Archer',
    health: 80,
    attack: 20,
    defense: 5,
    team: 1
  },
  // Team 2
  {
    id: 3,
    name: 'Warrior',
    health: 90,
    attack: 18,
    defense: 8,
    team: 2
  },
  {
    id: 4,
    name: 'Mage',
    health: 70,
    attack: 25,
    defense: 3,
    team: 2
  }
];

// Create logger and battle engine
const logger = new Logger();
const engine = new BattleEngine(units, logger);

// Run battle simulation
console.log('=== Battle Simulation ===\n');
console.log('Initial Teams:');
console.log('Team 1:', units.filter(u => u.team === 1).map(u => u.name).join(', '));
console.log('Team 2:', units.filter(u => u.team === 2).map(u => u.name).join(', '));
console.log('\nStarting battle...\n');

const result = engine.runBattle();

// Display battle summary
printBattleReport(logger.getEvents(), result.duration, result.winner);