// Test script to run a simple battle

import { Logger } from './utils/Logger.js';
import { GameEngine, Unit } from './GameEngine/GameEngine.js';
import { printBattleReport } from './utils/printBattleReport.js';
import { units1v1 } from './testData.js';

// Create logger and battle engine
const logger = new Logger();
const engine = new GameEngine(units1v1, logger);

// Run battle simulation
console.log('=== Battle Simulation ===\n');
console.log('Initial Teams:');
console.log('Team 1:', units1v1.filter(u => u.team === 1).map(u => u.name).join(', '));
console.log('Team 2:', units1v1.filter(u => u.team === 2).map(u => u.name).join(', '));
console.log('\nStarting battle...\n');

const result = engine.runGame();

// Display battle summary
printBattleReport(logger.getEvents(), result.duration, result.winner);