import { Container, Graphics, Text } from 'pixi.js';
import { createPixiStoryRender } from '../../../../.storybook/pixiStorybook';
import { colors } from '../../../config/colors';
import { GameEngine } from '../../../engine/GameEngine/GameEngine';
import { BattleMode } from '../../../engine/GameMode/BattleMode/BattleMode';
import { MovementSandbox } from '../../../engine/GameMode/MovementSandbox/MovementSandbox';
import { Logger } from '../../../engine/ServerLogger';
import { Map } from '../../../game/Map/Map';
import { Unit } from '../../../game/Unit/Unit';
import { WarriorFactory } from '../../../game/Unit/WarriorFactory';
import { isGameModeWithUnits } from './UnitController';
import { UnitRenderer } from './UnitRenderer';
import { PlaybackControls } from '../PlaybackControls/PlaybackControls';
import { events, GameEvent } from '../../../game/events';

export default {
    title: 'Unit/UnitRenderer',
    component: UnitRenderer,
};

/**
 * Creates a custom MovementSandbox that controls two units running back and forth on a track
 */
// @ts-expect-error - this is a test class
class TrackMovementSandbox extends MovementSandbox {
    private units: Unit[] = [];
    private trackStartX = 200;
    private trackEndX = 800;
    private trackY = 300;
    private directionState = { unit1: 1, unit2: 1 }; // 1 for right, -1 for left

    reset() {
        this.logger.log('TrackMovementSandbox reset');
        this.units = [];

        // Create unit 1 (runner) - starts at the left side
        const runnerAttributes = {
            weight: 70,
            strength: 80,
            experience: 0.8,
            age: 25,
            gender: 'male' as const,
        };
        const runner = new Unit(
            1,
            'Runner',
            1,
            runnerAttributes,
            { x: this.trackStartX, y: this.trackY },
            0,
        );
        this.units.push(runner);

        // Create unit 2 (walker) - starts at the left side, slightly offset
        const walkerAttributes = {
            weight: 65,
            strength: 60,
            experience: 0.5,
            age: 30,
            gender: 'female' as const,
        };
        const walker = new Unit(
            2,
            'Walker',
            2,
            walkerAttributes,
            { x: this.trackStartX, y: this.trackY + 80 },
            0,
        );
        this.units.push(walker);

        // Start initial movements
        this.giveMovementCommands();
    }

    update(deltaTime: number) {
        this.logger.debug(`TrackMovementSandbox: ${deltaTime}`);

        // Update units
        this.units.forEach((unit) => {
            unit.update(deltaTime);
        });

        // Check if units need to turn around
        this.checkAndUpdateMovements();
    }

    getState() {
        return {
            units: this.units.map(unit => unit.getState()),
        };
    }

    handleCommand(command: string, data?: unknown) {
        this.logger.debug(`TrackMovementSandbox: ${command}`, data);
    }

    /**
     * Give initial movement commands to both units
     */
    private giveMovementCommands() {
        const runner = this.units[0];
        const walker = this.units[1];

        if (runner) {
            // Runner goes to the end with urgency (running)
            runner.movement.moveTo({ x: this.trackEndX, y: this.trackY }, true);
        }

        if (walker) {
            // Walker goes to the end without urgency (walking)
            walker.movement.moveTo({ x: this.trackEndX, y: this.trackY + 80 }, false);
        }
    }

    /**
     * Check if units have stopped moving (reached their destination) and turn them around
     */
    private checkAndUpdateMovements() {
        const runner = this.units[0];
        const walker = this.units[1];

        if (runner) {
            // Check if runner has stopped moving (no movement intent)
            if (!runner.movement.isMoving) {
                if (this.directionState.unit1 === 1) {
                    // Was going right, now turn around and go left
                    this.directionState.unit1 = -1;
                    runner.movement.moveTo({ x: this.trackStartX, y: this.trackY }, true);
                }
                else {
                    // Was going left, now turn around and go right
                    this.directionState.unit1 = 1;
                    runner.movement.moveTo({ x: this.trackEndX, y: this.trackY }, true);
                }
            }
        }

        if (walker) {
            // Check if walker has stopped moving (no movement intent)
            if (!walker.movement.isMoving) {
                if (this.directionState.unit2 === 1) {
                    // Was going right, now turn around and go left
                    this.directionState.unit2 = -1;
                    walker.movement.moveTo({ x: this.trackStartX, y: this.trackY + 80 }, false);
                }
                else {
                    // Was going left, now turn around and go right
                    this.directionState.unit2 = 1;
                    walker.movement.moveTo({ x: this.trackEndX, y: this.trackY + 80 }, false);
                }
            }
        }
    }
}

export const MovementPhysicsDemo = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'movement-physics-demo';

        // Create small map (1000x600)
        const map = new Map(1000, 600);
        const logger = new Logger();

        // Create game engine with our custom track sandbox
        const engine = new GameEngine(logger, TrackMovementSandbox, map);
        engine.reset();

        // Create track visualization
        const trackContainer = new Container();
        trackContainer.label = 'track';

        // Draw track lanes
        const trackGraphics = new Graphics();

        // Track background
        trackGraphics.rect(150, 250, 700, 160).fill({ color: colors.brown, alpha: 0.3 });

        // Lane divider
        trackGraphics.rect(150, 330, 700, 2).fill(colors.white);

        // Start position marker (green)
        trackGraphics.rect(190, 250, 20, 160).fill(colors.green);

        // End position marker (red)
        trackGraphics.rect(790, 250, 20, 160).fill(colors.red);

        // Track borders
        trackGraphics.rect(150, 250, 700, 4).fill(colors.white); // top
        trackGraphics.rect(150, 406, 700, 4).fill(colors.white); // bottom

        trackContainer.addChild(trackGraphics);
        container.addChild(trackContainer);

        // Create unit renderers
        const unitRenderers: UnitRenderer[] = [];

        // Function to create and update unit renderers
        const updateRenderers = () => {
            const gameState = engine.getState();
            if (!isGameModeWithUnits(gameState.gameMode)) {
                throw new Error('Game mode does not have units');
            }
            const units = gameState.gameMode.units;

            // Remove old renderers if count changed
            while (unitRenderers.length > units.length) {
                const renderer = unitRenderers.pop();
                if (renderer) {
                    renderer.destroy();
                }
            }

            // Create new renderers or update existing ones
            units.forEach((unitState, index) => {
                if (index < unitRenderers.length) {
                    // Update existing renderer
                    unitRenderers[index]?.update(unitState);
                }
                else {
                    // Create new renderer
                    const renderer = new UnitRenderer(unitState, container);
                    renderer.init();
                    unitRenderers.push(renderer);
                }
            });
        };

        // Create initial renderers
        updateRenderers();

        // Animation loop
        let animationId: number;
        const animate = () => {
            // Update game engine
            engine.update(0.016); // ~60fps

            // Update renderers
            updateRenderers();

            animationId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Return container with cleanup
        const originalDestroy = container.destroy.bind(container);
        container.destroy = (options) => {
            cancelAnimationFrame(animationId);
            unitRenderers.forEach((renderer) => {
                renderer.destroy();
            });
            originalDestroy(options);
        };

        return container;
    }, { centerComponent: false }),
};

/**
 * Helper function to create combat demo with different warrior types
 */
function createCombatDemo(
    team1Factories: (() => Unit)[],
    team2Factories: (() => Unit)[],
    title: string,
) {
    return createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'combat-demo';

        const map = new Map(1000, 600);
        const logger = new Logger();

        // Create custom BattleMode game mode class
        class CustomBattleMode extends BattleMode {
            constructor(logger: Logger, engine: GameEngine) {
                super(logger, engine, team1Factories, team2Factories);
            }
        }

        const engine = new GameEngine(logger, CustomBattleMode, map);
        engine.reset();

        // Playback state
        let isPaused = false;
        let elapsedTime = 0;

        // Unit renderers array (needs to be let for reset)
        let unitRenderers: UnitRenderer[] = [];

        // Set up event listeners for playback controls
        events.on(GameEvent.pauseGame, () => {
            isPaused = true;
        });

        events.on(GameEvent.resumeGame, () => {
            isPaused = false;
        });

        events.on(GameEvent.nextTick, () => {
            engine.update(0.016);
            updateRenderers();
            updateCombatLog();
            updateStatsPanel();
        });

        events.on(GameEvent.initGame, () => {
            // Reset the battle
            engine.reset();
            elapsedTime = 0;
            isPaused = false;
            unitRenderers = [];
            updateRenderers();
            updateCombatLog();
            updateStatsPanel();
        });

        // Create arena visualization
        const arenaContainer = new Container();
        arenaContainer.label = 'arena';

        const arenaGraphics = new Graphics();
        arenaGraphics.rect(100, 200, 800, 300).fill({ color: colors.brown, alpha: 0.2 });
        arenaGraphics.rect(100, 200, 800, 4).fill(colors.white);
        arenaGraphics.rect(100, 496, 800, 4).fill(colors.white);
        arenaGraphics.rect(100, 200, 4, 300).fill(colors.white);
        arenaGraphics.rect(896, 200, 4, 300).fill(colors.white);
        arenaGraphics.rect(498, 200, 4, 300).fill({ color: colors.white, alpha: 0.3 });

        arenaContainer.addChild(arenaGraphics);
        container.addChild(arenaContainer);

        // Create title
        const titleText = new Text({
            text: title,
            style: {
                fontFamily: 'monospace',
                fontSize: 16,
                fill: colors.white,
            },
        });
        titleText.position.set(500, 100);
        titleText.anchor.set(0.5, 0.5);
        container.addChild(titleText);

        // Create playback controls using the reusable component
        const playbackControls = new PlaybackControls();
        playbackControls.position.set(350, 130);
        container.addChild(playbackControls);

        // Create elapsed time display
        const timeText = new Text({
            text: 'Time: 0.00s',
            style: {
                fontFamily: 'monospace',
                fontSize: 12,
                fill: colors.white,
            },
        });
        timeText.position.set(700, 137);
        container.addChild(timeText);

        // Create stats panel
        const statsContainer = new Container();
        statsContainer.label = 'stats';
        statsContainer.position.set(20, 200);

        const statsText = new Text({
            text: '',
            style: {
                fontFamily: 'monospace',
                fontSize: 10,
                fill: colors.white,
            },
        });
        statsContainer.addChild(statsText);
        container.addChild(statsContainer);

        const updateStatsPanel = () => {
            const gameState = engine.getState();
            if (!isGameModeWithUnits(gameState.gameMode)) return;

            const units = gameState.gameMode.units;
            const statsLines: string[] = [];

            units.forEach((unit, index) => {
                statsLines.push(`━━━ ${unit.name} ━━━`);

                // Position & Movement
                statsLines.push(`Position: (${unit.movement.position.x.toFixed(0)}, ${unit.movement.position.y.toFixed(0)})`);
                statsLines.push(`Direction: ${unit.movement.direction.toFixed(2)} rad`);
                const movementState = unit.movement as { currentSpeed?: number };
                if (movementState.currentSpeed !== undefined) {
                    statsLines.push(`Speed: ${movementState.currentSpeed.toFixed(2)} m/s`);
                }

                // Combat Effectiveness Breakdown
                statsLines.push(`Combat Eff: ${(unit.combat.combatEffectiveness * 100).toFixed(0)}%`);
                statsLines.push(`  ├─ Experience: ${(unit.attributes.experience * 100).toFixed(0)}%`);
                statsLines.push(`  ├─ Stamina: ${unit.stamina.staminaPercentage.toFixed(0)}%`);
                statsLines.push(`  ├─ Consciousness: ${unit.health.consciousness.toFixed(0)}%`);
                statsLines.push(`  └─ Blood Loss: ${unit.health.bloodLoss.toFixed(1)}%`);

                // Current Action
                if (unit.combat.currentAction) {
                    const progress = unit.combat.currentAction.progress;
                    statsLines.push(`Action: ${unit.combat.currentAction.type} (${(progress * 100).toFixed(0)}%)`);
                    statsLines.push(`  State: ${unit.combat.currentAction.state}`);
                } else {
                    statsLines.push(`Action: Idle`);
                }

                // Status
                if (!unit.health.isAlive) {
                    statsLines.push(`Status: DEAD ☠`);
                } else if (!unit.health.isConscious) {
                    statsLines.push(`Status: UNCONSCIOUS`);
                } else if (unit.combat.isStaggered) {
                    statsLines.push(`Status: STAGGERED`);
                } else if (unit.stamina.staminaPercentage < 10) {
                    statsLines.push(`Status: EXHAUSTED`);
                }

                if (index < units.length - 1) statsLines.push('');
            });

            statsText.text = statsLines.join('\n');
        };

        // Create combat log container
        const combatLogContainer = new Container();
        combatLogContainer.label = 'combat-log';
        combatLogContainer.position.set(50, 520);

        const combatLogText = new Text({
            text: '━━━ Combat Log ━━━\n',
            style: {
                fontFamily: 'monospace',
                fontSize: 12,
                fill: colors.white,
            },
        });
        combatLogContainer.addChild(combatLogText);
        container.addChild(combatLogContainer);

        const updateCombatLog = () => {
            const gameState = engine.getState();
            const combatState = gameState.gameMode as { combatMessages?: string[]; isBattleOver?: boolean };

            if (combatState.combatMessages && combatState.combatMessages.length > 0) {
                const lastMessages = combatState.combatMessages.slice(-8); // Show more messages
                const timestampedMessages = lastMessages.map((msg) => {
                    return `[${elapsedTime.toFixed(2)}s] ${msg}`;
                });
                combatLogText.text = '━━━ Combat Log ━━━\n' + timestampedMessages.join('\n');
            } else {
                combatLogText.text = '━━━ Combat Log ━━━\nWaiting for combat...';
            }

            if (combatState.isBattleOver) {
                combatLogText.style.fill = colors.green;
            }
        };

        const updateRenderers = () => {
            const gameState = engine.getState();
            if (!isGameModeWithUnits(gameState.gameMode)) {
                throw new Error('Game mode does not have units');
            }
            const units = gameState.gameMode.units;

            while (unitRenderers.length > units.length) {
                const renderer = unitRenderers.pop();
                if (renderer) {
                    renderer.destroy();
                }
            }

            units.forEach((unitState, index) => {
                if (index < unitRenderers.length) {
                    unitRenderers[index]?.update(unitState);
                }
                else {
                    const renderer = new UnitRenderer(unitState, container);
                    renderer.init();
                    unitRenderers.push(renderer);
                }
            });
        };

        updateRenderers();
        updateStatsPanel();

        let animationId: number;
        const animate = () => {
            if (!isPaused) {
                const deltaTime = 0.016;
                engine.update(deltaTime);
                elapsedTime += deltaTime;
                timeText.text = `Time: ${elapsedTime.toFixed(2)}s`;
                updateRenderers();
                updateCombatLog();
                updateStatsPanel();

                // Auto-pause when battle is over
                const gameState = engine.getState();
                const battleState = gameState.gameMode as { isBattleOver?: boolean };
                if (battleState.isBattleOver) {
                    isPaused = true;
                }
            }
            animationId = requestAnimationFrame(animate);
        };

        animate();

        const originalDestroy = container.destroy.bind(container);
        container.destroy = (options) => {
            cancelAnimationFrame(animationId);
            unitRenderers.forEach((renderer) => {
                renderer.destroy();
            });
            // Clean up event listeners
            events.removeAllListeners(GameEvent.pauseGame);
            events.removeAllListeners(GameEvent.resumeGame);
            events.removeAllListeners(GameEvent.nextTick);
            events.removeAllListeners(GameEvent.initGame);
            originalDestroy(options);
        };

        return container;
    }, { centerComponent: false });
}

// ===== UNARMORED SCENARIOS =====

/**
 * Novice vs Novice (Unarmored) - Quick brutal fight
 */
export const NoviceVsNovice = createCombatDemo(
    [() => WarriorFactory.createNovice('Novice Red', 1, { x: 200, y: 300 }, 0, false)],
    [() => WarriorFactory.createNovice('Novice Blue', 2, { x: 800, y: 300 }, Math.PI, false)],
    'Novice vs Novice (Unarmored)',
);

/**
 * Novice vs Elite (Unarmored) - Elite should dominate
 */
export const NoviceVsElite = createCombatDemo(
    [() => WarriorFactory.createNovice('Novice', 1, { x: 200, y: 300 }, 0, false)],
    [() => WarriorFactory.createElite('Elite', 2, { x: 800, y: 300 }, Math.PI, false)],
    'Novice vs Elite (Unarmored)',
);

/**
 * Elite vs Elite (Unarmored) - Legendary duel
 */
export const EliteVsElite = createCombatDemo(
    [() => WarriorFactory.createElite('Elite Red', 1, { x: 200, y: 300 }, 0, false)],
    [() => WarriorFactory.createElite('Elite Blue', 2, { x: 800, y: 300 }, Math.PI, false)],
    'Elite vs Elite (Unarmored)',
);

// ===== ARMORED SCENARIOS =====

/**
 * Novice vs Novice (Armored) - Longer fight with armor protection
 */
export const NoviceVsNoviceArmored = createCombatDemo(
    [() => WarriorFactory.createNovice('Novice Red', 1, { x: 200, y: 300 }, 0, true)],
    [() => WarriorFactory.createNovice('Novice Blue', 2, { x: 800, y: 300 }, Math.PI, true)],
    'Novice vs Novice (Armored)',
);

/**
 * Novice vs Elite (Armored) - Elite should still dominate but longer
 */
export const NoviceVsEliteArmored = createCombatDemo(
    [() => WarriorFactory.createNovice('Novice', 1, { x: 200, y: 300 }, 0, true)],
    [() => WarriorFactory.createElite('Elite', 2, { x: 800, y: 300 }, Math.PI, true)],
    'Novice vs Elite (Armored)',
);

/**
 * Elite vs Elite (Armored) - Epic armored duel
 */
export const EliteVsEliteArmored = createCombatDemo(
    [() => WarriorFactory.createElite('Elite Red', 1, { x: 200, y: 300 }, 0, true)],
    [() => WarriorFactory.createElite('Elite Blue', 2, { x: 800, y: 300 }, Math.PI, true)],
    'Elite vs Elite (Armored)',
);

// ===== MASS BATTLE SCENARIOS (10v10) =====

/**
 * 10 Novice vs 10 Novice (Unarmored) - Mass melee chaos
 */
export const MassBattle10NoviceVs10Novice = createCombatDemo(
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createNovice(`Novice Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, false),
    ),
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createNovice(`Novice Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, false),
    ),
    '10 Novice vs 10 Novice (Unarmored)',
);

/**
 * 10 Novice vs 10 Novice (Armored) - Armored mass battle
 */
export const MassBattle10NoviceVs10NoviceArmored = createCombatDemo(
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createNovice(`Novice Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, true),
    ),
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createNovice(`Novice Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, true),
    ),
    '10 Novice vs 10 Novice (Armored)',
);

/**
 * 10 Elite vs 10 Elite (Unarmored) - Elite mass battle
 */
export const MassBattle10EliteVs10Elite = createCombatDemo(
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createElite(`Elite Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, false),
    ),
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createElite(`Elite Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, false),
    ),
    '10 Elite vs 10 Elite (Unarmored)',
);

/**
 * 10 Elite vs 10 Elite (Armored) - Epic armored mass battle
 */
export const MassBattle10EliteVs10EliteArmored = createCombatDemo(
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createElite(`Elite Red ${i + 1}`, 1, { x: 200 + i * 60, y: 200 }, 0, true),
    ),
    Array.from({ length: 10 }, (_, i) =>
        () => WarriorFactory.createElite(`Elite Blue ${i + 1}`, 2, { x: 200 + i * 60, y: 400 }, Math.PI, true),
    ),
    '10 Elite vs 10 Elite (Armored)',
);

/**
 * Original Combat Demo (kept for backward compatibility)
 */
export const CombatDemo = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'combat-demo';

        // Create map
        const map = new Map(1000, 600);
        const logger = new Logger();

        // Create custom BattleMode game mode class with default warriors
        class CustomBattleMode extends BattleMode {
            constructor(logger: Logger, engine: GameEngine) {
                super(logger, engine,
                    [() => WarriorFactory.createTrained('Warrior 1', 1, { x: 200, y: 300 }, 0)],
                    [() => WarriorFactory.createTrained('Warrior 2', 2, { x: 800, y: 300 }, Math.PI)]);
            }
        }

        // Create game engine with battle mode
        const engine = new GameEngine(logger, CustomBattleMode, map);
        engine.reset();

        // Create arena visualization
        const arenaContainer = new Container();
        arenaContainer.label = 'arena';

        const arenaGraphics = new Graphics();

        // Arena floor
        arenaGraphics.rect(100, 200, 800, 300).fill({ color: colors.brown, alpha: 0.2 });

        // Arena borders
        arenaGraphics.rect(100, 200, 800, 4).fill(colors.white); // top
        arenaGraphics.rect(100, 496, 800, 4).fill(colors.white); // bottom
        arenaGraphics.rect(100, 200, 4, 300).fill(colors.white); // left
        arenaGraphics.rect(896, 200, 4, 300).fill(colors.white); // right

        // Center line
        arenaGraphics.rect(498, 200, 4, 300).fill({ color: colors.white, alpha: 0.3 });

        arenaContainer.addChild(arenaGraphics);
        container.addChild(arenaContainer);

        // Create combat log container
        const combatLogContainer = new Container();
        combatLogContainer.label = 'combat-log';
        combatLogContainer.position.set(50, 520);

        const combatLogText = new Text({
            text: 'Combat Log:\n',
            style: {
                fontFamily: 'monospace',
                fontSize: 12,
                fill: colors.white,
            },
        });
        combatLogContainer.addChild(combatLogText);
        container.addChild(combatLogContainer);

        // Create unit renderers
        const unitRenderers: UnitRenderer[] = [];

        // Function to update combat log
        const updateCombatLog = () => {
            const gameState = engine.getState();
            const combatState = gameState.gameMode as { combatMessages?: string[]; isBattleOver?: boolean };

            if (combatState.combatMessages && combatState.combatMessages.length > 0) {
                const lastMessages = combatState.combatMessages.slice(-5);
                combatLogText.text = 'Combat Log:\n' + lastMessages.join('\n');
            }

            if (combatState.isBattleOver) {
                combatLogText.style.fill = colors.green;
            }
        };

        // Function to create and update unit renderers
        const updateRenderers = () => {
            const gameState = engine.getState();
            if (!isGameModeWithUnits(gameState.gameMode)) {
                throw new Error('Game mode does not have units');
            }
            const units = gameState.gameMode.units;

            // Remove old renderers if count changed
            while (unitRenderers.length > units.length) {
                const renderer = unitRenderers.pop();
                if (renderer) {
                    renderer.destroy();
                }
            }

            // Create new renderers or update existing ones
            units.forEach((unitState, index) => {
                if (index < unitRenderers.length) {
                    // Update existing renderer
                    unitRenderers[index]?.update(unitState);
                }
                else {
                    // Create new renderer
                    const renderer = new UnitRenderer(unitState, container);
                    renderer.init();
                    unitRenderers.push(renderer);
                }
            });
        };

        // Create initial renderers
        updateRenderers();

        // Animation loop
        let animationId: number;
        const animate = () => {
            // Update game engine with real-time deltaTime for realistic action timing
            // 60fps = ~0.016s per frame
            engine.update(0.016);

            // Update renderers
            updateRenderers();

            // Update combat log
            updateCombatLog();

            animationId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Return container with cleanup
        const originalDestroy = container.destroy.bind(container);
        container.destroy = (options) => {
            cancelAnimationFrame(animationId);
            unitRenderers.forEach((renderer) => {
                renderer.destroy();
            });
            originalDestroy(options);
        };

        return container;
    }, { centerComponent: false }),
};
