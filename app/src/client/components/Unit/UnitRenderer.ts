import { Container, Graphics } from 'pixi.js';
import { colors } from '../../../config/colors';
import { UnitState } from '../../../game/Unit/Unit';

export class UnitRenderer {
    private container: Container;
    private unit: UnitState;

    constructor(unit: UnitState, parent: Container) {
        this.unit = unit;

        // Create Container
        this.container = new Container();
        this.container.label = `unit-${unit.id}`;
        parent.addChild(this.container);
    }

    public init() {
        const { x, y } = this.unit.movement.position;
        const direction = this.unit.movement.direction;

        const graphics = new Graphics().circle(0, 0, 50).fill(colors.blue);
        graphics.label = 'unit-circle';

        const directionLine = new Graphics().lineTo(50, 0).stroke({ color: colors.white, width: 2 });
        directionLine.label = 'unit-direction-line';

        this.container.addChild(graphics);
        this.container.addChild(directionLine);

        this.container.position.set(x, y);
        this.container.rotation = direction;
    }

    public update(unit: UnitState) {
        this.unit = unit;
        const { x, y } = this.unit.movement.position;
        const direction = this.unit.movement.direction;

        this.container.position.set(x, y);
        this.container.rotation = direction;
    }

    public destroy() {
        this.container.destroy({ children: true });
    }
}
