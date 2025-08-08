import { Container, Graphics } from 'pixi.js';
import { createPixiStoryRender } from '../../../../.storybook/pixiStorybook';
import { colors } from '../../../config/colors';
import { GameEngine } from '../../../engine/GameEngine/GameEngine';
import { MovementSandbox } from '../../../engine/GameMode/MovementSandbox/MovementSandbox';
import { Logger } from '../../../engine/ServerLogger';
import { Map } from '../../../game/Map/Map';
import { Unit } from '../../../game/Unit/Unit';
import { isGameModeWithUnits } from './UnitController';
import { UnitRenderer } from './UnitRenderer';

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
     * Check if units have reached their destinations and turn them around
     */
    private checkAndUpdateMovements() {
        const runner = this.units[0];
        const walker = this.units[1];

        if (runner) {
            const runnerPos = runner.movement.getState().position;

            // Check if runner reached the end
            if (this.directionState.unit1 === 1 && runnerPos.x >= this.trackEndX - 10) {
                this.directionState.unit1 = -1;
                runner.movement.moveTo({ x: this.trackStartX, y: this.trackY }, true);
            }
            // Check if runner reached the start
            else if (this.directionState.unit1 === -1 && runnerPos.x <= this.trackStartX + 10) {
                this.directionState.unit1 = 1;
                runner.movement.moveTo({ x: this.trackEndX, y: this.trackY }, true);
            }
        }

        if (walker) {
            const walkerPos = walker.movement.getState().position;

            // Check if walker reached the end
            if (this.directionState.unit2 === 1 && walkerPos.x >= this.trackEndX - 10) {
                this.directionState.unit2 = -1;
                walker.movement.moveTo({ x: this.trackStartX, y: this.trackY + 80 }, false);
            }
            // Check if walker reached the start
            else if (this.directionState.unit2 === -1 && walkerPos.x <= this.trackStartX + 10) {
                this.directionState.unit2 = 1;
                walker.movement.moveTo({ x: this.trackEndX, y: this.trackY + 80 }, false);
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
