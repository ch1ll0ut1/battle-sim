import { Container, Graphics } from 'pixi.js';
import { createPixiStoryRender } from '../../../../.storybook/pixiStorybook';
import { colors } from '../../../config/colors';
import { Unit } from '../../../game/Unit/Unit';
import { UnitAttributesData } from '../../../game/Unit/UnitAttributes';
import { Weapon } from '../../../game/Unit/Weapon';
import { createBasicSword } from '../../../game/Unit/Weapon';
import { createPlateArmor } from '../../../game/Unit/Armor';
import { StickFigureUnitRenderer } from './StickFigureUnitRenderer';

export default {
    title: 'Unit/StickFigureUnitRenderer',
    component: StickFigureUnitRenderer,
};

/**
 * Creates a basic bow weapon for testing
 */
function createBasicBow(): Weapon {
    return new Weapon(
        'Basic Bow',
        0.8, // 0.8 kg
        120, // 120 cm
        'bow',
        ['piercing'],
        0.0, // No edge
        0.0, // No point (arrows do the piercing)
        0.0, // No impact area
    );
}

/**
 * Helper to create a static unit for display
 */
function createStaticUnit(
    id: number,
    name: string,
    team: number,
    position: { x: number; y: number },
    direction: number,
    options: {
        withWeapon?: boolean;
        withBow?: boolean;
        withArmor?: boolean;
        isDead?: boolean;
    } = {},
): Unit {
    const attributes: UnitAttributesData = {
        weight: 75,
        strength: 50,
        experience: 0.5,
        age: 25,
        gender: 'male',
    };

    const unit = new Unit(id, name, team, attributes, position, direction);

    if (options.withWeapon) {
        unit.combat.equipWeapon(createBasicSword());
    }

    if (options.withBow) {
        unit.combat.equipWeapon(createBasicBow());
    }

    if (options.withArmor) {
        unit.equipArmor(createPlateArmor());
    }

    if (options.isDead) {
        // Simulate death by dealing massive damage to critical body parts
        // Apply multiple fatal injuries to ensure death
        for (let i = 0; i < 10; i++) {
            unit.health.receiveInjury({
                bodyPart: 'torso',
                woundType: 'cut',
                severity: 'fatal',
                bleedingRate: 100,
                shock: 100,
                pain: 100,
                isFatal: true,
                isAmputation: false,
                timeToDeath: 1,
            });
        }
        // Force an update to process the injuries
        unit.update(0.1);
    }

    return unit;
}


// ===== BASIC UNIT STORIES =====

/**
 * Normal unit without weapons - shows basic stick figure
 */
export const NormalUnitWithoutWeapons = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'normal-unit-no-weapons';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 300).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create unit at center
        const unit = createStaticUnit(1, 'Unarmed Warrior', 1, { x: 200, y: 150 }, 0, {});
        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        return container;
    }, { centerComponent: false }),
};

/**
 * Unit with sword and shield
 */
export const UnitWithWeapons = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'unit-with-weapons';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 300).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create unit at center
        const unit = createStaticUnit(1, 'Armed Warrior', 1, { x: 200, y: 150 }, 0, {
            withWeapon: true,
        });
        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        return container;
    }, { centerComponent: false }),
};

/**
 * Unit with weapons walking - demonstrates leg animation in a circle
 */
export const UnitWithWeaponsWalking = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'unit-walking';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 600, 400).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Draw circle path for reference
        const pathGraphics = new Graphics();
        pathGraphics.circle(300, 200, 100).stroke({ color: colors.white, width: 1, alpha: 0.3 });
        container.addChild(pathGraphics);

        // Create walking unit
        const centerX = 300;
        const centerY = 200;
        const radius = 100;
        const startAngle = 0;
        const startX = centerX + Math.cos(startAngle) * radius;
        const startY = centerY + Math.sin(startAngle) * radius;

        const unit = createStaticUnit(1, 'Walking Warrior', 1, { x: startX, y: startY }, 0, {
            withWeapon: true,
        });

        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        // Circular movement
        let angle = startAngle;
        let animationId: number;

        const animate = () => {
            // Update angle for circular motion
            angle += 0.015; // Speed of rotation

            // Calculate next position on circle (far ahead to ensure continuous movement)
            const targetAngle = angle + Math.PI / 4; // Always target 45° ahead
            const targetX = centerX + Math.cos(targetAngle) * radius;
            const targetY = centerY + Math.sin(targetAngle) * radius;

            // Give movement command to next position
            unit.movement.moveTo({ x: targetX, y: targetY }, false);

            // Update unit physics
            unit.update(0.016);

            renderer.update(unit.getState());
            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        const originalDestroy = container.destroy.bind(container);
        container.destroy = (options) => {
            cancelAnimationFrame(animationId);
            renderer.destroy();
            originalDestroy(options);
        };

        return container;
    }, { centerComponent: false }),
};

/**
 * Dead unit with weapons - lying down
 */
export const DeadUnitWithWeapons = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'dead-unit-with-weapons';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 300).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create dead unit
        const unit = createStaticUnit(1, 'Fallen Warrior', 1, { x: 200, y: 150 }, 0, {
            withWeapon: true,
            isDead: true,
        });
        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        return container;
    }, { centerComponent: false }),
};

/**
 * Dead unit without weapons
 */
export const DeadUnitWithoutWeapons = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'dead-unit-no-weapons';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 300).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create dead unit
        const unit = createStaticUnit(1, 'Fallen Soldier', 1, { x: 200, y: 150 }, 0, {
            isDead: true,
        });
        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        return container;
    }, { centerComponent: false }),
};

/**
 * Unit with helmet, armor, and weapons
 */
export const UnitWithArmorAndWeapons = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'unit-armored';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 300).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create armored unit
        const unit = createStaticUnit(1, 'Armored Knight', 1, { x: 200, y: 150 }, 0, {
            withWeapon: true,
            withArmor: true,
        });
        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        return container;
    }, { centerComponent: false }),
};

/**
 * Unit with bow
 */
export const UnitWithBow = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'unit-with-bow';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 300).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create archer
        const unit = createStaticUnit(1, 'Archer', 1, { x: 200, y: 150 }, 0, {
            withBow: true,
        });
        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        return container;
    }, { centerComponent: false }),
};

/**
 * Unit with bow and armor
 */
export const UnitWithBowAndArmor = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'unit-bow-armored';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 400, 300).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create armored archer
        const unit = createStaticUnit(1, 'Armored Archer', 1, { x: 200, y: 150 }, 0, {
            withBow: true,
            withArmor: true,
        });
        const renderer = new StickFigureUnitRenderer(unit.getState(), container);
        renderer.init();

        return container;
    }, { centerComponent: false }),
};

// ===== 8-DIRECTIONAL DISPLAY STORIES =====

/**
 * Shows unit with weapons in all 8 directions
 */
export const EightDirections_WithWeapons = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'eight-directions-weapons';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 800, 600).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        // Create circle showing all 8 angles
        const centerX = 400;
        const centerY = 300;
        const radius = 150;

        const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
        const angleLabels = ['E (0°)', 'SE (45°)', 'S (90°)', 'SW (135°)', 'W (180°)', 'NW (225°)', 'N (270°)', 'NE (315°)'];

        angles.forEach((angle, index) => {
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const unit = createStaticUnit(index + 1, angleLabels[index] ?? '', 1, { x, y }, angle, {
                withWeapon: true,
            });

            const renderer = new StickFigureUnitRenderer(unit.getState(), container);
            renderer.init();
        });

        // Draw center circle for reference
        const centerCircle = new Graphics();
        centerCircle.circle(centerX, centerY, 5).fill(colors.white);
        container.addChild(centerCircle);

        return container;
    }, { centerComponent: false }),
};

/**
 * Shows armored unit with weapons in all 8 directions
 */
export const EightDirections_ArmoredWithWeapons = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'eight-directions-armored';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 800, 600).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        const centerX = 400;
        const centerY = 300;
        const radius = 150;

        const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
        const angleLabels = ['E (0°)', 'SE (45°)', 'S (90°)', 'SW (135°)', 'W (180°)', 'NW (225°)', 'N (270°)', 'NE (315°)'];

        angles.forEach((angle, index) => {
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const unit = createStaticUnit(index + 1, angleLabels[index] ?? '', 2, { x, y }, angle, {
                withWeapon: true,
                withArmor: true,
            });

            const renderer = new StickFigureUnitRenderer(unit.getState(), container);
            renderer.init();
        });

        // Draw center circle for reference
        const centerCircle = new Graphics();
        centerCircle.circle(centerX, centerY, 5).fill(colors.white);
        container.addChild(centerCircle);

        return container;
    }, { centerComponent: false }),
};

/**
 * Shows archers in all 8 directions
 */
export const EightDirections_Archers = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'eight-directions-archers';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 800, 600).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        const centerX = 400;
        const centerY = 300;
        const radius = 150;

        const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
        const angleLabels = ['E (0°)', 'SE (45°)', 'S (90°)', 'SW (135°)', 'W (180°)', 'NW (225°)', 'N (270°)', 'NE (315°)'];

        angles.forEach((angle, index) => {
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const unit = createStaticUnit(index + 1, angleLabels[index] ?? '', 1, { x, y }, angle, {
                withBow: true,
            });

            const renderer = new StickFigureUnitRenderer(unit.getState(), container);
            renderer.init();
        });

        // Draw center circle for reference
        const centerCircle = new Graphics();
        centerCircle.circle(centerX, centerY, 5).fill(colors.white);
        container.addChild(centerCircle);

        return container;
    }, { centerComponent: false }),
};

/**
 * Comparison: Team 1 (Blue) vs Team 2 (Red) units side by side
 */
export const TeamComparison = {
    render: createPixiStoryRender(() => {
        const container = new Container();
        container.label = 'team-comparison';

        // Create background
        const bg = new Graphics();
        bg.rect(0, 0, 600, 400).fill({ color: colors.brown, alpha: 0.1 });
        container.addChild(bg);

        const configurations = [
            { name: 'Unarmed', options: {} },
            { name: 'With Sword', options: { withWeapon: true } },
            { name: 'Armored', options: { withWeapon: true, withArmor: true } },
            { name: 'Archer', options: { withBow: true } },
            { name: 'Dead', options: { withWeapon: true, isDead: true } },
        ];

        configurations.forEach((config, index) => {
            const xPos = 100 + index * 100;

            // Team 1 (Blue)
            const unit1 = createStaticUnit(index * 2 + 1, `Blue ${config.name}`, 1, { x: xPos, y: 150 }, 0, config.options);
            const renderer1 = new StickFigureUnitRenderer(unit1.getState(), container);
            renderer1.init();

            // Team 2 (Red)
            const unit2 = createStaticUnit(index * 2 + 2, `Red ${config.name}`, 2, { x: xPos, y: 250 }, Math.PI, config.options);
            const renderer2 = new StickFigureUnitRenderer(unit2.getState(), container);
            renderer2.init();
        });

        return container;
    }, { centerComponent: false }),
};
