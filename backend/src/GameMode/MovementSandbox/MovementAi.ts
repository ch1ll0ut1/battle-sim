import { TickUpdate } from '../../utils/TickUpdate';

export class MovementAi implements TickUpdate {
    update(deltaTime: number): void {
        console.log(`MovementAi: ${deltaTime}`);
    }

    getState() {
        return {};
    }
}
