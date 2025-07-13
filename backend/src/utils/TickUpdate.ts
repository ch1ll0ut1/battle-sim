export interface TickUpdate {
    update(deltaTime: number): void;
    getState(): any;
}

