import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TerrainType } from '../Data/Maps';
import { Button } from '../UI/Button';

/**
 * Map editor configuration
 */
export interface MapEditorConfig {
    onBack: () => void;
    onSave: (mapData: MapEditorData) => void;
    screenWidth: number;
    screenHeight: number;
}

/**
 * Map editor data structure
 */
export interface MapEditorData {
    name: string;
    width: number;
    height: number;
    terrain: TerrainType[][];
}

/**
 * Map editor screen component
 */
export class MapEditor extends Container {
    private config: MapEditorConfig;
    private gridContainer!: Container;
    private selectedTerrain: TerrainType = TerrainType.grass;
    private mapData: MapEditorData;
    private gridSize = 20;
    private cellSize = 30;

    /**
   * Create the map editor screen
   */
    constructor(config: MapEditorConfig) {
        super();
        this.config = config;

        // Initialize with default map data
        this.mapData = {
            name: 'New Map',
            width: 20,
            height: 15,
            terrain: this.createEmptyTerrain(20, 15),
        };

        this.createUI();
        this.createGrid();
        this.createTerrainPalette();
    }

    /**
   * Create empty terrain array
   */
    private createEmptyTerrain(width: number, height: number): TerrainType[][] {
        const terrain: TerrainType[][] = [];
        for (let y = 0; y < height; y++) {
            const row: TerrainType[] = [];
            for (let x = 0; x < width; x++) {
                row.push(TerrainType.grass);
            }
            terrain.push(row);
        }
        return terrain;
    }

    /**
   * Create the UI elements
   */
    private createUI(): void {
        // Back button
        const backButton = new Button({
            text: 'Back',
            width: 100,
            height: 40,
            backgroundColor: 0x666666,
            onClick: () => { this.config.onBack(); },
        });
        backButton.position.set(20, 20);
        this.addChild(backButton);

        // Save button
        const saveButton = new Button({
            text: 'Save Map',
            width: 120,
            height: 40,
            backgroundColor: 0x4CAF50,
            onClick: () => { this.config.onSave(this.mapData); },
        });
        saveButton.position.set(this.config.screenWidth - 140, 20);
        this.addChild(saveButton);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center',
        });

        const title = new Text({
            text: 'Map Editor',
            style: titleStyle,
        });
        title.position.set(this.config.screenWidth / 2 - 50, 25);
        this.addChild(title);
    }

    /**
   * Create the editable grid
   */
    private createGrid(): void {
        this.gridContainer = new Container();
        this.gridContainer.position.set(50, 100);
        this.addChild(this.gridContainer);

        this.drawGrid();
    }

    /**
   * Draw the grid cells
   */
    private drawGrid(): void {
        this.gridContainer.removeChildren();

        for (let y = 0; y < this.mapData.height; y++) {
            for (let x = 0; x < this.mapData.width; x++) {
                const cell = new Graphics();
                const terrainType = this.mapData.terrain[y][x];

                // Set color based on terrain type
                const color = this.getTerrainColor(terrainType);
                cell.fill({ color });
                cell.rect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

                // Add border
                cell.stroke({ color: 0x333333, width: 1 });
                cell.rect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);

                // Make cell interactive
                cell.eventMode = 'static';
                cell.cursor = 'pointer';
                cell.on('pointerdown', () => {
                    this.mapData.terrain[y][x] = this.selectedTerrain;
                    this.drawGrid();
                });

                this.gridContainer.addChild(cell);
            }
        }
    }

    /**
   * Get color for terrain type
   */
    private getTerrainColor(terrainType: TerrainType): number {
        switch (terrainType) {
            case TerrainType.grass: return 0x7CB342;
            case TerrainType.forest: return 0x388E3C;
            case TerrainType.mountain: return 0x8D6E63;
            case TerrainType.water: return 0x1976D2;
            case TerrainType.road: return 0xD7CCC8;
            default: return 0x7CB342;
        }
    }

    /**
   * Create terrain type selection palette
   */
    private createTerrainPalette(): void {
        const paletteY = this.config.screenHeight - 80;
        const terrainTypes = Object.values(TerrainType);
        const buttonSize = 40;
        const spacing = 10;
        const startX = 50;

        terrainTypes.forEach((terrainType, index) => {
            const button = new Button({
                text: terrainType.charAt(0).toUpperCase(),
                width: buttonSize,
                height: buttonSize,
                backgroundColor: this.getTerrainColor(terrainType),
                fontSize: 14,
                onClick: () => {
                    this.selectedTerrain = terrainType;
                },
            });

            button.position.set(startX + (buttonSize + spacing) * index, paletteY);
            this.addChild(button);
        });

        // Add label
        const labelStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
        });

        const label = new Text({
            text: 'Terrain Types:',
            style: labelStyle,
        });
        label.position.set(50, paletteY - 25);
        this.addChild(label);
    }
}
