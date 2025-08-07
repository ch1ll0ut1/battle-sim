import { Container } from 'pixi.js';
import { GameMode } from '../../../engine/GameMode/GameMode';
import { events, GameEvent } from '../../../game/events';
import { UnitState } from '../../../game/Unit/Unit';
import { deepMerge, DeepPartial } from '../../utils/deepMerge';
import { UnitRenderer } from './UnitRenderer';

const isGameModeWithUnits = (gameMode: unknown): gameMode is GameMode & { units: UnitState[] } => {
    return typeof gameMode === 'object' && gameMode !== null && 'units' in gameMode;
};

export class UnitController {
    private units: UnitState[] = [];
    private unitsById: Record<UnitState['id'], UnitState> = {};
    private renderersByUnitId: Record<UnitState['id'], UnitRenderer> = {};
    private view = new Container();

    init(worldContainer: Container) {
        worldContainer.addChild(this.view);
        this.view.zIndex = 1000;

        events.on(GameEvent.gameStateChanged, (state) => {
            if (!isGameModeWithUnits(state.state.gameMode)) {
                throw new Error('Game mode does not have units');
            }
            state.state.gameMode.units.forEach((unit) => {
                this.addUnit(unit);
            });
        });

        events.on(GameEvent.unitMovementUpdate, ({ unitId, changes }) => {
            this.updateUnit(unitId, { movement: changes });
        });
    }

    private addUnit(unit: UnitState) {
        this.units.push(unit);
        this.unitsById[unit.id] = unit;

        const renderer = new UnitRenderer(unit, this.view);
        this.renderersByUnitId[unit.id] = renderer;

        renderer.init();
    }

    private updateUnit(id: UnitState['id'], changes: DeepPartial<UnitState>) {
        const existingUnit = this.unitsById[id];
        const renderer = this.renderersByUnitId[id];

        if (!existingUnit || !renderer) {
            throw new Error(`Unit or renderer not found for unit id ${id}`);
        }

        deepMerge(existingUnit, changes);

        renderer.update(existingUnit);
    }
}
