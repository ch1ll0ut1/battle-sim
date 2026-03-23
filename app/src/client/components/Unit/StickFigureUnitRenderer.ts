import { Container, Graphics, Text } from 'pixi.js';
import { colors } from '../../../config/colors';
import { UnitState } from '../../../game/Unit/Unit';
import { HealthBar } from '../HealthBar/HealthBar';

/**
 * Alternative unit renderer that displays units as stick figures with:
 * - Circle head with face (3 dots for eyes and mouth)
 * - Rectangle body
 * - Two leg rectangles that animate while walking
 * - 8-directional rendering
 * - Weapon visualization (sword, bow, shield)
 * - Armor/helmet visualization
 */
export class StickFigureUnitRenderer {
    private container: Container;
    private unit: UnitState;
    private barsContainer: Container;
    private nameText: Text;
    private healthBar: HealthBar;

    // Body parts
    private headGraphics: Graphics;
    private bodyGraphics: Graphics;
    private leftLegGraphics: Graphics;
    private rightLegGraphics: Graphics;

    // Equipment
    private weaponGraphics: Graphics;
    private shieldGraphics: Graphics;
    private helmetGraphics: Graphics;

    // Animation state
    private walkCycle = 0;
    private previousPosition = { x: 0, y: 0 };

    constructor(unit: UnitState, parent: Container) {
        this.unit = unit;

        // Create Container
        this.container = new Container();
        this.container.label = `stick-figure-unit-${unit.id}`;
        parent.addChild(this.container);

        // Create bars container (not rotated with unit)
        this.barsContainer = new Container();
        this.barsContainer.label = 'bars';
        parent.addChild(this.barsContainer);

        // Create name text
        this.nameText = new Text({
            text: unit.name,
            style: {
                fontFamily: 'monospace',
                fontSize: 12,
                fill: colors.white,
            },
        });
        this.nameText.anchor.set(0.5, 1);
        this.barsContainer.addChild(this.nameText);

        // Create health bar
        this.healthBar = new HealthBar();
        this.barsContainer.addChild(this.healthBar);

        // Create body part graphics (will be initialized in init())
        this.headGraphics = new Graphics();
        this.bodyGraphics = new Graphics();
        this.leftLegGraphics = new Graphics();
        this.rightLegGraphics = new Graphics();
        this.weaponGraphics = new Graphics();
        this.shieldGraphics = new Graphics();
        this.helmetGraphics = new Graphics();

        this.previousPosition = { ...unit.movement.position };
    }

    /**
     * Initializes the stick figure graphics
     */
    public init() {
        const { x, y } = this.unit.movement.position;

        // Add all graphics to container in proper Z-order
        this.container.addChild(this.leftLegGraphics);
        this.container.addChild(this.rightLegGraphics);
        this.container.addChild(this.bodyGraphics);
        this.container.addChild(this.shieldGraphics);
        this.container.addChild(this.weaponGraphics);
        this.container.addChild(this.headGraphics);
        this.container.addChild(this.helmetGraphics);

        // Set labels
        this.headGraphics.label = 'head';
        this.bodyGraphics.label = 'body';
        this.leftLegGraphics.label = 'left-leg';
        this.rightLegGraphics.label = 'right-leg';
        this.weaponGraphics.label = 'weapon';
        this.shieldGraphics.label = 'shield';
        this.helmetGraphics.label = 'helmet';

        this.container.position.set(x, y);
        // Don't rotate container - we'll draw perspective instead

        // Set opacity for dead units
        if (!this.unit.health.isAlive) {
            this.container.alpha = 0.3;
        }

        this.redrawStickFigure();
        this.updateBars();
    }

    /**
     * Updates the stick figure based on unit state
     */
    public update(unit: UnitState) {
        this.unit = unit;
        const { x, y } = this.unit.movement.position;

        // Update walk cycle based on movement
        const moved = Math.abs(x - this.previousPosition.x) + Math.abs(y - this.previousPosition.y);
        if (moved > 0.5) {
            this.walkCycle += moved * 0.1;
        }
        this.previousPosition = { x, y };

        this.container.position.set(x, y);
        // Don't rotate container - we'll draw perspective instead

        // Update opacity for dead units
        this.container.alpha = this.unit.health.isAlive ? 1.0 : 0.3;

        this.redrawStickFigure();
        this.updateBars();
    }

    /**
     * Redraws the entire stick figure with current state
     */
    private redrawStickFigure() {
        const unitColor = this.getUnitColor();
        const isAlive = this.unit.health.isAlive;
        const isWalking = this.isUnitWalking();
        const direction = this.unit.movement.direction;

        // Clear all graphics
        this.headGraphics.clear();
        this.bodyGraphics.clear();
        this.leftLegGraphics.clear();
        this.rightLegGraphics.clear();
        this.weaponGraphics.clear();
        this.shieldGraphics.clear();
        this.helmetGraphics.clear();

        if (!isAlive) {
            this.drawDeadUnit(unitColor);
        } else {
            // Get facing direction (0-7 for 8 directions)
            const facingDir = this.getDirectionIndex(direction);

            this.drawHead(unitColor, facingDir);
            this.drawBody(unitColor, facingDir);
            this.drawLegs(unitColor, isWalking, facingDir);
            this.drawWeapon(facingDir);
            this.drawShield(facingDir);
            this.drawHelmet(facingDir);
        }
    }

    /**
     * Converts radian direction to one of 8 direction indices (0-7)
     * 0 = East (right), 1 = SE, 2 = South (down/toward viewer), 3 = SW,
     * 4 = West (left), 5 = NW, 6 = North (up/away), 7 = NE
     */
    private getDirectionIndex(direction: number): number {
        // Normalize direction to 0-2π range
        let normalizedDir = direction % (2 * Math.PI);
        if (normalizedDir < 0) normalizedDir += 2 * Math.PI;

        // Convert to 8 directions (each is 45°)
        const directionIndex = Math.round(normalizedDir / (Math.PI / 4)) % 8;
        return directionIndex;
    }

    /**
     * Draws the head with face (circle with skin color and black features)
     * Different perspectives for 8 directions
     */
    private drawHead(color: string, facingDir: number) {
        const headRadius = 6;
        const headY = -22; // Moved down to connect with body
        const skinColor = '#D4A574'; // Skin/flesh tone

        // Head circle with skin color
        this.headGraphics.circle(0, headY, headRadius).fill(skinColor);

        // Draw face based on direction (black features)
        const eyeSize = 1.0;
        const blackColor = '#000000';

        if (facingDir === 0) {
            // East (right) - side view facing right
            this.headGraphics.circle(3, headY, eyeSize).fill(blackColor); // Single eye on right
        } else if (facingDir === 1 || facingDir === 7) {
            // SE or NE - 3/4 view
            this.headGraphics.circle(-1, headY - 2, eyeSize).fill(blackColor);
            this.headGraphics.circle(4, headY - 2, eyeSize).fill(blackColor);
            this.headGraphics.circle(2, headY + 3, 1).fill(blackColor); // Mouth offset
        } else if (facingDir === 2) {
            // South (toward viewer) - front view
            this.headGraphics.circle(-3, headY - 2, eyeSize).fill(blackColor);
            this.headGraphics.circle(3, headY - 2, eyeSize).fill(blackColor);
            this.headGraphics.circle(0, headY + 3, 1).fill(blackColor); // Centered mouth
        } else if (facingDir === 3 || facingDir === 5) {
            // SW or NW - 3/4 view (mirror)
            this.headGraphics.circle(-4, headY - 2, eyeSize).fill(blackColor);
            this.headGraphics.circle(1, headY - 2, eyeSize).fill(blackColor);
            this.headGraphics.circle(-2, headY + 3, 1).fill(blackColor); // Mouth offset other way
        } else if (facingDir === 4) {
            // West (left) - side view facing left
            this.headGraphics.circle(-3, headY, eyeSize).fill(blackColor); // Single eye on left
        } else if (facingDir === 6) {
            // North (away from viewer) - back view (no face visible)
            // Just the head, no facial features
        }
    }

    /**
     * Draws the body rectangle with perspective (no borders)
     */
    private drawBody(color: string, facingDir: number) {
        const bodyHeight = 18;
        const bodyY = -16;

        if (facingDir === 0 || facingDir === 4) {
            // Side view (East or West) - narrower body
            const bodyWidth = 8;
            this.bodyGraphics.rect(-bodyWidth / 2, bodyY, bodyWidth, bodyHeight).fill(color);
        } else if (facingDir === 6) {
            // North (back view) - full width
            const bodyWidth = 12;
            this.bodyGraphics.rect(-bodyWidth / 2, bodyY, bodyWidth, bodyHeight).fill(color);
        } else {
            // Front and 3/4 views - full body width
            const bodyWidth = 12;
            this.bodyGraphics.rect(-bodyWidth / 2, bodyY, bodyWidth, bodyHeight).fill(color);
        }
    }

    /**
     * Draws the legs with walking animation and perspective (no borders)
     */
    private drawLegs(color: string, isWalking: boolean, facingDir: number) {
        const legWidth = 4;
        const baseLegHeight = 14;
        const legY = 2;

        // Calculate leg animation
        let leftLegHeight = baseLegHeight;
        let rightLegHeight = baseLegHeight;
        let leftLegY = legY;
        let rightLegY = legY;

        if (isWalking) {
            // Animate legs by shortening them alternately
            const legCyclePosition = Math.sin(this.walkCycle);
            const legAnimationAmount = 4;

            if (legCyclePosition > 0) {
                // Left leg forward (shorter)
                leftLegHeight = baseLegHeight - legAnimationAmount;
                leftLegY = legY + legAnimationAmount / 2;
            } else {
                // Right leg forward (shorter)
                rightLegHeight = baseLegHeight - legAnimationAmount;
                rightLegY = legY + legAnimationAmount / 2;
            }
        }

        // Adjust leg positions based on perspective
        let leftLegX = -legWidth - 1;
        let rightLegX = 1;

        if (facingDir === 0 || facingDir === 4) {
            // Side view - legs closer together
            leftLegX = -2;
            rightLegX = -1;
        }

        // Draw legs (no borders)
        this.leftLegGraphics.rect(leftLegX, leftLegY, legWidth, leftLegHeight).fill(color);
        this.rightLegGraphics.rect(rightLegX, rightLegY, legWidth, rightLegHeight).fill(color);
    }

    /**
     * Draws weapon (sword or bow) in right hand with perspective
     */
    private drawWeapon(facingDir: number) {
        const weaponName = this.unit.combat.weaponName;
        if (!weaponName) return;

        const weaponColor = '#B8860B'; // Dark golden/yellow tone

        if (weaponName.toLowerCase().includes('bow')) {
            this.drawBow(weaponColor, facingDir);
        } else if (weaponName.toLowerCase().includes('sword')) {
            this.drawSword(weaponColor, facingDir);
        } else {
            // Default sword-like weapon
            this.drawSword(weaponColor, facingDir);
        }
    }

    /**
     * Draws a sword in the right hand with perspective
     * Unit's right hand = sword (always)
     * Screen coordinates: -X is left, +X is right
     */
    private drawSword(color: string, facingDir: number) {
        const bladeLength = 16;
        const bladeWidth = 3;
        const handleLength = 6;
        const crossguardWidth = 5;
        const pommelSize = 2;

        if (facingDir === 0) {
            // East (facing right) - we see left side, sword on far side (barely visible)
            const swordX = 6;
            const swordY = -10;
            this.weaponGraphics.rect(swordX, swordY, 2, bladeLength + handleLength).fill({ color, alpha: 0.3 });
        } else if (facingDir === 1) {
            // SE (facing down-right) - we see left-front, sword on far side but visible
            const swordX = 8;
            const swordY = -10;
            // Blade with tapered point
            this.weaponGraphics.rect(swordX, swordY + 2, bladeWidth, bladeLength - 2).fill(color);
            this.weaponGraphics.rect(swordX + 1, swordY, 1, 2).fill(color); // Point
            // Crossguard
            this.weaponGraphics.rect(swordX - 1, swordY + bladeLength, crossguardWidth, 2).fill('#CD7F32');
            // Handle
            this.weaponGraphics.rect(swordX, swordY + bladeLength + 2, bladeWidth, handleLength - 2).fill('#8B4513');
            // Pommel
            this.weaponGraphics.rect(swordX, swordY + bladeLength + handleLength, bladeWidth, pommelSize).fill('#CD7F32');
        } else if (facingDir === 2) {
            // South (facing toward viewer) - sword in right hand appears on LEFT side of screen
            const swordX = -10;
            const swordY = -10;
            // Blade with tapered point
            this.weaponGraphics.rect(swordX, swordY + 2, bladeWidth, bladeLength - 2).fill(color);
            this.weaponGraphics.rect(swordX + 1, swordY, 1, 2).fill(color); // Point
            // Crossguard
            this.weaponGraphics.rect(swordX - 1, swordY + bladeLength, crossguardWidth, 2).fill('#CD7F32');
            // Handle
            this.weaponGraphics.rect(swordX, swordY + bladeLength + 2, bladeWidth, handleLength - 2).fill('#8B4513');
            // Pommel
            this.weaponGraphics.rect(swordX, swordY + bladeLength + handleLength, bladeWidth, pommelSize).fill('#CD7F32');
        } else if (facingDir === 3) {
            // SW (facing down-left) - we see right-front, sword on near side
            const swordX = -13;
            const swordY = -10;
            // Blade with tapered point
            this.weaponGraphics.rect(swordX, swordY + 2, bladeWidth, bladeLength - 2).fill(color);
            this.weaponGraphics.rect(swordX + 1, swordY, 1, 2).fill(color); // Point
            // Crossguard
            this.weaponGraphics.rect(swordX - 1, swordY + bladeLength, crossguardWidth, 2).fill('#CD7F32');
            // Handle
            this.weaponGraphics.rect(swordX, swordY + bladeLength + 2, bladeWidth, handleLength - 2).fill('#8B4513');
            // Pommel
            this.weaponGraphics.rect(swordX, swordY + bladeLength + handleLength, bladeWidth, pommelSize).fill('#CD7F32');
        } else if (facingDir === 4) {
            // West (facing left) - we see right side, sword on near side
            const swordX = -9;
            const swordY = -10;
            // Blade with tapered point
            this.weaponGraphics.rect(swordX, swordY + 2, bladeWidth, bladeLength - 2).fill(color);
            this.weaponGraphics.rect(swordX + 1, swordY, 1, 2).fill(color); // Point
            // Crossguard
            this.weaponGraphics.rect(swordX - 1, swordY + bladeLength, crossguardWidth, 2).fill('#CD7F32');
            // Handle
            this.weaponGraphics.rect(swordX, swordY + bladeLength + 2, bladeWidth, handleLength - 2).fill('#8B4513');
            // Pommel
            this.weaponGraphics.rect(swordX, swordY + bladeLength + handleLength, bladeWidth, pommelSize).fill('#CD7F32');
        } else if (facingDir === 5) {
            // NW (facing up-left) - we see right-back, sword on near side
            const swordX = -8;
            const swordY = -10;
            // Blade with tapered point
            this.weaponGraphics.rect(swordX, swordY + 2, bladeWidth, bladeLength - 2).fill(color);
            this.weaponGraphics.rect(swordX + 1, swordY, 1, 2).fill(color); // Point
            // Crossguard
            this.weaponGraphics.rect(swordX - 1, swordY + bladeLength, crossguardWidth, 2).fill('#CD7F32');
            // Handle
            this.weaponGraphics.rect(swordX, swordY + bladeLength + 2, bladeWidth, handleLength - 2).fill('#8B4513');
            // Pommel
            this.weaponGraphics.rect(swordX, swordY + bladeLength + handleLength, bladeWidth, pommelSize).fill('#CD7F32');
        } else if (facingDir === 6) {
            // North (back, facing away) - sword in right hand appears on RIGHT side of screen
            const swordX = 10;
            const swordY = -10;
            // Blade with tapered point
            this.weaponGraphics.rect(swordX, swordY + 2, bladeWidth, bladeLength - 2).fill(color);
            this.weaponGraphics.rect(swordX + 1, swordY, 1, 2).fill(color); // Point
            // Crossguard
            this.weaponGraphics.rect(swordX - 1, swordY + bladeLength, crossguardWidth, 2).fill('#CD7F32');
            // Handle
            this.weaponGraphics.rect(swordX, swordY + bladeLength + 2, bladeWidth, handleLength - 2).fill('#8B4513');
            // Pommel
            this.weaponGraphics.rect(swordX, swordY + bladeLength + handleLength, bladeWidth, pommelSize).fill('#CD7F32');
        } else if (facingDir === 7) {
            // NE (facing up-right) - we see left-back, sword on far side but visible
            const swordX = 8;
            const swordY = -10;
            this.weaponGraphics.rect(swordX, swordY, bladeWidth, bladeLength + handleLength).fill({ color, alpha: 0.5 });
        }
    }

    /**
     * Draws a bow in both hands with perspective
     */
    private drawBow(color: string, facingDir: number) {
        const bowRadius = 12;

        if (facingDir === 0 || facingDir === 4) {
            // Side view - bow in profile
            const bowX = facingDir === 0 ? 8 : -8;
            const bowY = -8;
            this.weaponGraphics.arc(bowX, bowY, bowRadius, -Math.PI / 2, Math.PI / 2).stroke({ color, width: 2 });
            this.weaponGraphics.moveTo(bowX, bowY - bowRadius).lineTo(bowX, bowY + bowRadius).stroke({ color: colors.white, width: 1 });
        } else if (facingDir === 2) {
            // Front view - bow held in front
            const bowX = 8;
            const bowY = -8;
            this.weaponGraphics.arc(bowX, bowY, bowRadius, -Math.PI / 2, Math.PI / 2).stroke({ color, width: 2 });
            this.weaponGraphics.moveTo(bowX, bowY - bowRadius).lineTo(bowX, bowY + bowRadius).stroke({ color: colors.white, width: 1 });
        } else if (facingDir === 6) {
            // Back view - bow on back
            const bowX = 0;
            const bowY = -10;
            this.weaponGraphics.arc(bowX, bowY, 8, -Math.PI / 2, Math.PI / 2).stroke({ color, width: 2, alpha: 0.5 });
        } else {
            // 3/4 views
            const bowX = (facingDir === 1 || facingDir === 7) ? 8 : -8;
            const bowY = -8;
            this.weaponGraphics.arc(bowX, bowY, bowRadius, -Math.PI / 2, Math.PI / 2).stroke({ color, width: 2 });
            this.weaponGraphics.moveTo(bowX, bowY - bowRadius).lineTo(bowX, bowY + bowRadius).stroke({ color: colors.white, width: 1 });
        }
    }

    /**
     * Draws a shield in the left hand with perspective
     * Unit's left hand = shield (always)
     * Screen coordinates: -X is left, +X is right
     */
    private drawShield(facingDir: number) {
        // Only draw shield if unit has a sword (warriors with shields)
        const weaponName = this.unit.combat.weaponName;
        if (!weaponName || weaponName.toLowerCase().includes('bow')) return;

        const shieldWidth = 6;
        const shieldHeight = 10;
        const shieldColor = '#B8860B'; // Same dark golden/yellow as weapon

        if (facingDir === 0) {
            // East (facing right) - we see left side, shield on near side
            const shieldX = -8;
            const shieldY = -12;
            this.shieldGraphics.rect(shieldX, shieldY, shieldWidth, shieldHeight).fill(shieldColor);
        } else if (facingDir === 1) {
            // SE (facing down-right) - we see left-front, shield on near side
            const shieldX = -8;
            const shieldY = -12;
            this.shieldGraphics.rect(shieldX, shieldY, shieldWidth, shieldHeight).fill(shieldColor);
        } else if (facingDir === 2) {
            // South (facing toward viewer) - shield in left hand appears on RIGHT side of screen
            const shieldX = 4;
            const shieldY = -12;
            this.shieldGraphics.rect(shieldX, shieldY, shieldWidth, shieldHeight).fill(shieldColor);
        } else if (facingDir === 3) {
            // SW (facing down-left) - we see right-front, shield on far side (barely visible)
            const shieldX = 6;
            const shieldY = -12;
            this.shieldGraphics.rect(shieldX, shieldY, 2, shieldHeight).fill({ color: shieldColor, alpha: 0.4 });
        } else if (facingDir === 4) {
            // West (facing left) - we see right side, shield on far side (not visible)
            return;
        } else if (facingDir === 5) {
            // NW (facing up-left) - we see right-back, shield on far side (barely visible)
            const shieldX = 6;
            const shieldY = -12;
            this.shieldGraphics.rect(shieldX, shieldY, 2, shieldHeight).fill({ color: shieldColor, alpha: 0.3 });
        } else if (facingDir === 6) {
            // North (back, facing away) - shield in left hand appears on LEFT side of screen
            const shieldX = -8;
            const shieldY = -12;
            this.shieldGraphics.rect(shieldX, shieldY, shieldWidth, shieldHeight).fill(shieldColor);
        } else if (facingDir === 7) {
            // NE (facing up-right) - we see left-back, shield on near side
            const shieldX = -8;
            const shieldY = -12;
            this.shieldGraphics.rect(shieldX, shieldY, shieldWidth, shieldHeight).fill({ color: shieldColor, alpha: 0.7 });
        }
    }

    /**
     * Draws a helmet if unit has armor with perspective
     * Simple dome/cap on top of head with eye holes showing the eyes
     */
    private drawHelmet(facingDir: number) {
        if (!this.unit.armor) return;

        const headRadius = 6;
        const headY = -22; // Match head position
        const helmetColor = '#708090'; // Gray metal color

        // Draw helmet as a dome covering the head
        this.helmetGraphics.arc(0, headY, headRadius + 1, -Math.PI, 0, false).fill(helmetColor);

        // Add eye holes based on facing direction
        const eyeHoleRadius = 1.5;
        const helmetEyeSize = 1.0; // Same as eyes without helmet
        const skinColor = '#D4A574'; // Same as head to show through
        const blackColor = '#000000';

        if (facingDir === 0) {
            // East (right) - single eye hole with eye
            this.helmetGraphics.circle(3, headY, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(3, headY, helmetEyeSize).fill(blackColor);
        } else if (facingDir === 1 || facingDir === 7) {
            // SE or NE - two eye holes with eyes
            this.helmetGraphics.circle(-1, headY - 2, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(-1, headY - 2, helmetEyeSize).fill(blackColor);
            this.helmetGraphics.circle(4, headY - 2, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(4, headY - 2, helmetEyeSize).fill(blackColor);
        } else if (facingDir === 2) {
            // South (front) - two eye holes with eyes
            this.helmetGraphics.circle(-3, headY - 2, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(-3, headY - 2, helmetEyeSize).fill(blackColor);
            this.helmetGraphics.circle(3, headY - 2, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(3, headY - 2, helmetEyeSize).fill(blackColor);
        } else if (facingDir === 3 || facingDir === 5) {
            // SW or NW - two eye holes with eyes
            this.helmetGraphics.circle(-4, headY - 2, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(-4, headY - 2, helmetEyeSize).fill(blackColor);
            this.helmetGraphics.circle(1, headY - 2, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(1, headY - 2, helmetEyeSize).fill(blackColor);
        } else if (facingDir === 4) {
            // West (left) - single eye hole with eye
            this.helmetGraphics.circle(-3, headY, eyeHoleRadius).fill(skinColor);
            this.helmetGraphics.circle(-3, headY, helmetEyeSize).fill(blackColor);
        }
        // No eye holes for back view (facingDir === 6)
    }

    /**
     * Draws a dead unit (lying down)
     */
    private drawDeadUnit(color: string) {
        // Dead units are drawn horizontally
        const bodyWidth = 18;
        const bodyHeight = 8;

        // Body
        this.bodyGraphics
            .rect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight)
            .fill({ color, alpha: 0.5 });
        this.bodyGraphics
            .rect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight)
            .stroke({ color: colors.white, width: 1 });

        // Head (smaller circle to the side)
        const headRadius = 5;
        const headX = bodyWidth / 2 + headRadius + 2;
        this.headGraphics
            .circle(headX, 0, headRadius)
            .fill({ color, alpha: 0.5 });
        this.headGraphics
            .circle(headX, 0, headRadius)
            .stroke({ color: colors.white, width: 1 });

        // X for eyes (dead)
        this.headGraphics
            .moveTo(headX - 2, -2)
            .lineTo(headX + 2, 2)
            .stroke({ color: colors.white, width: 1 });
        this.headGraphics
            .moveTo(headX - 2, 2)
            .lineTo(headX + 2, -2)
            .stroke({ color: colors.white, width: 1 });
    }

    /**
     * Checks if unit is currently walking based on movement state
     */
    private isUnitWalking(): boolean {
        const movementState = this.unit.movement as { currentSpeed?: number; isMoving?: boolean };
        return movementState.isMoving === true || (movementState.currentSpeed ?? 0) > 0.1;
    }

    /**
     * Updates health bar and name text position
     */
    private updateBars() {
        const { x, y } = this.unit.movement.position;

        // Clear existing bars
        this.barsContainer.removeChildren();

        // Re-add name text
        this.nameText.text = this.unit.name;
        this.nameText.position.set(x, y - 50);
        this.barsContainer.addChild(this.nameText);

        // Don't show health bar for dead units
        if (!this.unit.health.isAlive) {
            const statusText = new Text({
                text: 'DEAD',
                style: {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fill: colors.red,
                },
            });
            statusText.anchor.set(0.5, 0);
            statusText.position.set(x, y - 42);
            this.barsContainer.addChild(statusText);
            return;
        }

        // Update health bar with CE and Stamina
        this.healthBar.update({
            combatEffectiveness: this.unit.combat.combatEffectiveness,
            staminaPercentage: this.unit.stamina.staminaPercentage,
        });
        this.healthBar.position.set(x, y - 42);
        this.barsContainer.addChild(this.healthBar);

        // Show status indicators if critical
        if (!this.unit.health.isConscious) {
            const statusText = new Text({
                text: 'UNCONSCIOUS',
                style: {
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fill: colors.red,
                },
            });
            statusText.anchor.set(0.5, 0);
            statusText.position.set(x, y - 24);
            this.barsContainer.addChild(statusText);
        }
        else if (this.unit.stamina.staminaPercentage < 10) {
            const statusText = new Text({
                text: 'EXHAUSTED',
                style: {
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fill: colors.orange,
                },
            });
            statusText.anchor.set(0.5, 0);
            statusText.position.set(x, y - 24);
            this.barsContainer.addChild(statusText);
        }
    }

    /**
     * Gets unit color based on team and alive state
     */
    private getUnitColor(): string {
        if (!this.unit.health.isAlive) {
            return colors.gray;
        }
        return this.unit.team === 1 ? colors.blue : colors.red;
    }

    /**
     * Cleans up resources
     */
    public destroy() {
        this.container.destroy({ children: true });
        this.barsContainer.destroy({ children: true });
    }
}
