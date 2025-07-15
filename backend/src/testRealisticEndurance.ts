import { Unit } from './Unit/Unit.js';
import { UnitMovementPhysics } from './Unit/UnitMovementPhysics.js';
import { movementConfig } from './config/movement.js';

interface UnitTestResult {
    name: string;
    maxStamina: number;
    weightModifier: number;
    staminaConsumption: number;
    recoveryRate: number;
    totalStaminaConsumption: number;
    maxSpeed: number;
    avgSpeed: number;
    timeToExhaustion: number;
    finalStamina: number;
    distanceWalked: number; // in kilometers
}

/**
 * Comprehensive stamina and movement testing across different unit types and movement modes
 */
function testRealisticEndurance() {
    console.log('🏃‍♂️ Comprehensive Unit Endurance Analysis\n');

    // Force physics system for this test
    const originalSystem = movementConfig.movementSystem;
    movementConfig.movementSystem = 'physics';

    // Create unit types
    const unitCreators = [
        createFreshCivilian,
        createTrainedRecruit,
        createVeteranSoldier,
        createEliteSoldier,
    ];

    const results: UnitTestResult[] = [];

    // Test each unit type in both walking and running modes
    for (const createUnit of unitCreators) {
        // Walking test
        const walkingResult = runEnduranceTest(createUnit, false);
        results.push(walkingResult);

        // Running test
        const runningResult = runEnduranceTest(createUnit, true);
        results.push(runningResult);
    }

    // Print results table
    printResultsTable(results);

    // Restore original config
    movementConfig.movementSystem = originalSystem;
}

/**
 * Helper functions to create realistic unit types for testing
 */
function createFreshCivilian(id: number, name: string) {
    return new Unit(id, name, 1, {
        strength: 35, // Basic human fitness, no conditioning
        weight: 82, // Average weight + basic gear
        experience: 0.0, // No military experience
        age: 18,
        gender: 'male',
    });
}

function createTrainedRecruit(id: number, name: string) {
    return new Unit(id, name, 1, {
        strength: 45, // Completed basic training
        weight: 76, // Improved fitness + gear
        experience: 0.3, // Basic military training completed
        age: 20,
        gender: 'male',
    });
}

function createVeteranSoldier(id: number, name: string) {
    return new Unit(id, name, 1, {
        strength: 60, // Well-conditioned through service
        weight: 75, // Optimized fitness-to-gear ratio
        experience: 0.6, // Significant field experience
        age: 25,
        gender: 'male',
    });
}

function createEliteSoldier(id: number, name: string) {
    return new Unit(id, name, 1, {
        strength: 90, // Peak physical conditioning
        weight: 72, // Lean and optimized
        experience: 0.9, // Elite training and extensive experience
        age: 28,
        gender: 'male',
    });
}

/**
 * Run endurance test for a single unit type and movement mode
 */
function runEnduranceTest(
    createUnitFn: (id: number, name: string) => Unit,
    isRunning: boolean,
): UnitTestResult {
    const baseUnitName = createUnitFn.name.replace('create', '');
    const movementMode = isRunning ? 'Running' : 'Walking';
    const unitName = `${baseUnitName} ${movementMode}`;

    console.log(`Testing: ${unitName}`);

    // Create unit and start movement
    const unit = createUnitFn(1, unitName);
    unit.movement.moveTo({ x: 10000, y: 0 }, isRunning);

    // Update once to ensure physics calculations are current
    unit.update(0.1);

    // Get initial measurements
    const initialStaminaSummary = unit.stamina.getState();
    const movementPhysics = unit.movement as UnitMovementPhysics; // Cast since we're forcing physics system
    const initialMovementSummary = movementPhysics.getState();

    const maxStamina = initialStaminaSummary.maxStamina;
    const weightModifier = initialStaminaSummary.weightModifier;
    const maxSpeed = initialMovementSummary.maxSpeed;

    // Simulate movement
    const deltaTime = 0.1; // 100ms updates for accuracy
    let totalTime = 0;
    let totalDistance = 0;
    let lastPosition = { x: unit.movement.x, y: unit.movement.y };

    const maxTime = 24 * 3600; // 24 hours in seconds

    while (unit.stamina.stamina > 0 && totalTime < maxTime) {
        unit.update(deltaTime);
        totalTime += deltaTime;

        // Track distance for average speed calculation
        const currentPosition = { x: unit.movement.x, y: unit.movement.y };
        const distance = Math.sqrt(
            Math.pow(currentPosition.x - lastPosition.x, 2)
            + Math.pow(currentPosition.y - lastPosition.y, 2),
        );
        totalDistance += distance;
        lastPosition = currentPosition;
    }

    // Get final measurements
    const finalStaminaSummary = unit.stamina.getState();
    const finalMovementSummary = movementPhysics.getState();

    // Calculate metrics
    const avgSpeed = totalDistance / totalTime;
    const staminaConsumption = finalMovementSummary.staminaCost;

    // Estimate recovery rate by checking context and calculating
    const recoveryRate = estimateRecoveryRate(unit);
    const totalStaminaConsumption = staminaConsumption + recoveryRate;

    return {
        name: unitName,
        maxStamina: maxStamina,
        weightModifier: weightModifier,
        staminaConsumption: staminaConsumption,
        recoveryRate: recoveryRate,
        totalStaminaConsumption: totalStaminaConsumption,
        maxSpeed: maxSpeed,
        avgSpeed: avgSpeed,
        timeToExhaustion: totalTime,
        finalStamina: unit.stamina.stamina,
        distanceWalked: totalDistance / 1000, // Convert meters to kilometers
    };
}

/**
 * Estimate recovery rate based on stamina context
 * This is a workaround since getRecoveryRate() is private
 */
function estimateRecoveryRate(unit: Unit): number {
    const maxStamina = unit.stamina.maxStamina;
    const experience = unit.attributes.experience;

    // Base rates from GAME_MECHANICS.md
    const baseRate = unit.movement.isMoving ? 0.00025 : 0.08; // moving vs resting
    const recoveryRate = baseRate * maxStamina;

    // Apply experience bonus (up to 20% improvement)
    const experienceBonus = experience * 0.2;
    const experienceModifier = 1 + experienceBonus;

    return recoveryRate * experienceModifier;
}

/**
 * Print formatted results table
 */
function printResultsTable(results: UnitTestResult[]) {
    console.log('\n' + '='.repeat(150));
    console.log('📊 COMPREHENSIVE ENDURANCE TEST RESULTS');
    console.log('='.repeat(150));

    // Header
    const header = [
        'Unit Type'.padEnd(20),
        'MaxStamina'.padStart(10),
        'WeightMod'.padStart(9),
        'StamCons/s'.padStart(10),
        'Recovery/s'.padStart(10),
        'TotalCons/s'.padStart(11),
        'MaxSpeed'.padStart(9),
        'AvgSpeed'.padStart(9),
        'Time(min)'.padStart(9),
        'FinalStam'.padStart(10),
        'Dist(km)'.padStart(10),
    ].join(' | ');

    console.log(header);
    console.log('='.repeat(150));

    // Data rows
    for (const result of results) {
        const row = [
            result.name.padEnd(20),
            result.maxStamina.toFixed(1).padStart(10),
            result.weightModifier.toFixed(3).padStart(9),
            result.staminaConsumption.toFixed(4).padStart(10),
            result.recoveryRate.toFixed(4).padStart(10),
            result.totalStaminaConsumption.toFixed(4).padStart(11),
            result.maxSpeed.toFixed(2).padStart(9),
            result.avgSpeed.toFixed(2).padStart(9),
            (result.timeToExhaustion / 60).toFixed(1).padStart(9),
            result.finalStamina.toFixed(1).padStart(10),
            result.distanceWalked.toFixed(2).padStart(10),
        ].join(' | ');

        console.log(row);
    }

    console.log('='.repeat(150));

    // Analysis
    console.log('\n📈 ANALYSIS:');

    // Group by unit type for comparison
    const unitTypes = ['FreshCivilian', 'TrainedRecruit', 'VeteranSoldier', 'EliteSoldier'];

    for (const unitType of unitTypes) {
        const walkingResult = results.find(r => r.name.includes(unitType) && r.name.includes('Walking'));
        const runningResult = results.find(r => r.name.includes(unitType) && r.name.includes('Running'));

        if (walkingResult && runningResult) {
            const walkingTime = walkingResult.timeToExhaustion / 60;
            const runningTime = runningResult.timeToExhaustion / 60;
            const enduranceRatio = walkingTime / runningTime;

            const walkingDistance = walkingResult.distanceWalked;
            const runningDistance = runningResult.distanceWalked;
            const distanceRatio = walkingDistance / runningDistance;

            console.log(`${unitType}:`);
            console.log(`  Walking: ${walkingTime.toFixed(1)} min, ${walkingDistance.toFixed(1)} km`);
            console.log(`  Running: ${runningTime.toFixed(1)} min, ${runningDistance.toFixed(1)} km`);
            console.log(`  Time ratio: ${enduranceRatio.toFixed(1)}x, Distance ratio: ${distanceRatio.toFixed(1)}x (walking vs running)`);
            console.log();
        }
    }
}

// Run the test
testRealisticEndurance();
