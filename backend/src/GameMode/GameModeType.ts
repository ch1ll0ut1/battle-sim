import { GameModeConstructor } from './GameMode';
import { MovementSandbox } from './MovementSandbox/MovementSandbox';

export const GAME_MODE_TYPE = {
    movementSandbox: MovementSandbox,
} as const satisfies Record<string, GameModeConstructor>;
