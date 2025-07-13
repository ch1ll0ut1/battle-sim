import { GameModeConstructor } from "./GameMode";
import { MovementSandbox } from "./MovementSandbox/MovementSandbox";

export const GameModeType = {
    'movement-sandbox': MovementSandbox,
} as const satisfies Record<string, GameModeConstructor>;
