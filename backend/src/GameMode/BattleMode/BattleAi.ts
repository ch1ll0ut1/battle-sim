import { TickUpdate } from '../../utils/TickUpdate';

export class BattleAi implements TickUpdate {
    update(deltaTime: number): void {
        console.log(`BattleAi: ${deltaTime}`);
    }

    getState() {
        return {};
    }
}
