/**
 * Available game modes in the application
 */
export interface GameMode {
    id: string;
    name: string;
    description: string;
    icon?: string;
}

/**
 * Dummy game modes data
 */
export const GAME_MODES: GameMode[] = [
    {
        id: 'quick_battle',
        name: 'Quick Battle',
        description: 'Fast skirmish mode with preset maps and units',
    },
    {
        id: 'movement_sandbox',
        name: 'Movement Sandbox',
        description: 'Test unit movement and positioning in a free environment',
    },
    {
        id: 'map_editor',
        name: 'Map Editor',
        description: 'Create and edit custom maps for battles',
    },
];

/**
 * Get a game mode by ID
 */
export function getGameMode(id: string): GameMode | undefined {
    return GAME_MODES.find(mode => mode.id === id);
}
