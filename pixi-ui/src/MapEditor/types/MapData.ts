/**
 * Position interface for map elements
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Tree data structure for the map editor
 */
export interface TreeData {
    position: Position;
    trunkRadius: number;
    canopyRadius: number;
}

/**
 * Map data structure for the map editor
 */
export interface MapData {
    name: string;
    width: number;
    height: number;
    trees: TreeData[];
}

/**
 * Map editor configuration
 */
export interface MapEditorConfig {
    onBack: () => void;
    onSave: (mapData: MapData) => void;
    screenWidth: number;
    screenHeight: number;
}
