/**
 * Test script to run battle simulations from command line
 * Tests different warrior matchups using BattleMode
 */

import { GameEngine } from './engine/GameEngine/GameEngine';
import { BattleMode } from './engine/GameMode/BattleMode/BattleMode';
import { Logger } from './engine/ServerLogger';
import { Map } from './game/Map/Map';
import { WarriorFactory } from './game/Unit/WarriorFactory';

/**
 * Runs a battle simulation and prints results
 */
function runBattle(title: string, team1Factories: (() => import('./game/Unit/Unit').Unit)[], team2Factories: (() => import('./game/Unit/Unit').Unit)[]) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(title);
    console.log('='.repeat(60));

    const logger = new Logger();
    const map = new Map(1000, 600);

    // Create custom BattleMode with warrior factories
    class TestBattleMode extends BattleMode {
        constructor(logger: Logger, engine: GameEngine) {
            super(logger, engine, team1Factories, team2Factories);
        }
    }

    const engine = new GameEngine(logger, TestBattleMode, map);
    engine.reset();

    // Run simulation for max 30 seconds or until battle ends
    const maxTime = 30;
    const tickRate = 0.016; // 60 fps
    let elapsed = 0;

    while (elapsed < maxTime) {
        engine.update(tickRate);
        elapsed += tickRate;

        const state = engine.getState();
        const battleState = state.gameMode as { isBattleOver?: boolean };

        if (battleState.isBattleOver) {
            break;
        }
    }

    // Print final state
    const finalState = engine.getState();
    const battleState = finalState.gameMode as {
        units: { name: string; health: { consciousness: number; bloodLoss: number }; stamina: { staminaPercentage: number } }[];
        combatMessages: string[];
        isBattleOver: boolean;
    };

    console.log(`\nBattle Duration: ${elapsed.toFixed(2)}s`);
    console.log('\nFinal State:');
    battleState.units.forEach((unit) => {
        console.log(`  ${unit.name}:`);
        console.log(`    Consciousness: ${unit.health.consciousness.toFixed(1)}%`);
        console.log(`    Blood Loss: ${unit.health.bloodLoss.toFixed(1)}%`);
        console.log(`    Stamina: ${unit.stamina.staminaPercentage.toFixed(1)}%`);
    });

    console.log('\nCombat Log (last 10 messages):');
    const lastMessages = battleState.combatMessages.slice(-10);
    lastMessages.forEach((msg) => {
        console.log(`  ${msg}`);
    });
}

// Run different battle scenarios
console.log('\n🗡️  BATTLE SIMULATION TEST SUITE 🗡️\n');

// ===== UNARMORED SCENARIOS =====
console.log('═'.repeat(60));
console.log('UNARMORED COMBAT (No Armor)');
console.log('═'.repeat(60));

runBattle(
    'Novice vs Novice',
    [() => WarriorFactory.createNovice('Novice Red', 1, { x: 200, y: 300 }, 0, false)],
    [() => WarriorFactory.createNovice('Novice Blue', 2, { x: 800, y: 300 }, Math.PI, false)],
);

runBattle(
    'Novice vs Elite',
    [() => WarriorFactory.createNovice('Novice', 1, { x: 200, y: 300 }, 0, false)],
    [() => WarriorFactory.createElite('Elite', 2, { x: 800, y: 300 }, Math.PI, false)],
);

runBattle(
    'Elite vs Elite',
    [() => WarriorFactory.createElite('Elite Red', 1, { x: 200, y: 300 }, 0, false)],
    [() => WarriorFactory.createElite('Elite Blue', 2, { x: 800, y: 300 }, Math.PI, false)],
);

// 10v10 Mass Battle
console.log('\n' + '━'.repeat(60));
console.log('MASS BATTLE (10v10)');
console.log('━'.repeat(60));

const team1Novices = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createNovice(`Novice Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, false),
);
const team2Novices = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createNovice(`Novice Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, false),
);

runBattle(
    '10 Novice vs 10 Novice',
    team1Novices,
    team2Novices,
);

// ===== ARMORED SCENARIOS =====
console.log('\n' + '═'.repeat(60));
console.log('ARMORED COMBAT (Plate Armor)');
console.log('═'.repeat(60));

runBattle(
    'Novice vs Novice (Armored)',
    [() => WarriorFactory.createNovice('Novice Red', 1, { x: 200, y: 300 }, 0, true)],
    [() => WarriorFactory.createNovice('Novice Blue', 2, { x: 800, y: 300 }, Math.PI, true)],
);

runBattle(
    'Novice vs Elite (Armored)',
    [() => WarriorFactory.createNovice('Novice', 1, { x: 200, y: 300 }, 0, true)],
    [() => WarriorFactory.createElite('Elite', 2, { x: 800, y: 300 }, Math.PI, true)],
);

runBattle(
    'Elite vs Elite (Armored)',
    [() => WarriorFactory.createElite('Elite Red', 1, { x: 200, y: 300 }, 0, true)],
    [() => WarriorFactory.createElite('Elite Blue', 2, { x: 800, y: 300 }, Math.PI, true)],
);

// 10v10 Armored Mass Battle
console.log('\n' + '━'.repeat(60));
console.log('ARMORED MASS BATTLE (10v10)');
console.log('━'.repeat(60));

const team1NovicesArmored = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createNovice(`Novice Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, true),
);
const team2NovicesArmored = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createNovice(`Novice Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, true),
);

runBattle(
    '10 Novice vs 10 Novice (Armored)',
    team1NovicesArmored,
    team2NovicesArmored,
);

const team1Elites = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createElite(`Elite Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, false),
);
const team2Elites = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createElite(`Elite Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, false),
);

runBattle(
    '10 Elite vs 10 Elite',
    team1Elites,
    team2Elites,
);

const team1ElitesArmored = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createElite(`Elite Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, true),
);
const team2ElitesArmored = Array.from({ length: 10 }, (_, i) =>
    () => WarriorFactory.createElite(`Elite Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, true),
);

runBattle(
    '10 Elite vs 10 Elite (Armored)',
    team1ElitesArmored,
    team2ElitesArmored,
);

console.log(`\n${'='.repeat(60)}`);
console.log('All battle scenarios completed!');
console.log(`${'='.repeat(60)}\n`);
