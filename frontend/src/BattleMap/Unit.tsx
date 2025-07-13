export type Unit = {
    id: number;
    name: string;
    movement: {
        position: { x: number; y: number; };
        direction: number;
    };
    experience: number;
    armorLevel: number;
    weapon: string | null;
    isAlive: boolean;
};
