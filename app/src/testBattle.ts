// Test script to run a simple battle

import { units1v1 } from './data/testUnits';
import { GameEngine } from './engine/GameEngine/GameEngine';
import { MovementSandbox } from './engine/GameMode/MovementSandbox/MovementSandbox';
import { Logger } from './engine/ServerLogger';

// Create logger and battle engine
const logger = new Logger();
const engine = new GameEngine(logger, MovementSandbox);

// Run battle simulation
console.log('=== Battle Simulation ===\n');
console.log('Initial Teams:');
console.log('Team 1:', units1v1.filter(u => u.team === 1).map(u => u.name).join(', '));
console.log('Team 2:', units1v1.filter(u => u.team === 2).map(u => u.name).join(', '));
console.log('\nStarting battle...\n');

const result = engine.runGame();

// TODO: Re-implement battle mode
throw new Error('Not implemented');
// Display battle summary
// printBattleReport(logger.getEvents(), result.duration, result.winner);
