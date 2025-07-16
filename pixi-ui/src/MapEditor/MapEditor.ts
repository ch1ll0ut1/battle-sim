import { Container } from 'pixi.js';
import { MapData, MapEditorConfig, TreeData } from './types/MapData';
import { MapToolbar } from './components/MapToolbar';
import { MapCanvas } from './components/MapCanvas';
import { MapProperties } from './components/MapProperties';

/**
 * Map editor screen component - composes toolbar, canvas, and properties
 */
export class MapEditor extends Container {
    private config: MapEditorConfig;
    private mapData: MapData;
    private toolbar!: MapToolbar;
    private canvas!: MapCanvas;
    private properties!: MapProperties;

    /**
     * Create the map editor screen
     */
    constructor(config: MapEditorConfig) {
        super();
        this.config = config;

        // Initialize with default map data
        this.mapData = {
            name: 'New Map',
            width: 1000,
            height: 800,
            trees: [],
        };

        this.createComponents();
    }

    private createComponents(): void {
        // Create toolbar
        this.toolbar = new MapToolbar(
            this.config.screenWidth,
            this.mapData,
            this.config.onBack,
            this.config.onSave,
            this.onToolSelect.bind(this),
            this.onGenerateTrees.bind(this),
        );

        // Create canvas
        this.canvas = new MapCanvas(
            this.mapData,
            this.onMapDataChange.bind(this),
        );

        // Create properties panel
        this.properties = new MapProperties(
            this.config.screenWidth,
            this.config.screenHeight,
            this.mapData,
            this.onMapResize.bind(this),
        );

        this.addChild(this.toolbar);
        this.addChild(this.canvas);
        this.addChild(this.properties);
    }

    private onToolSelect(tool: string): void {
        this.canvas.setSelectedTool(tool);
    }

    private onGenerateTrees(trees: TreeData[]): void {
        this.mapData.trees = trees;
        this.canvas.setTrees(trees);
        this.properties.updateMapData(this.mapData);
    }

    private onMapDataChange(mapData: MapData): void {
        this.mapData = mapData;
        this.toolbar.updateMapData(mapData);
        this.properties.updateMapData(mapData);
    }

    private onMapResize(width: number, height: number): void {
        this.mapData.width = width;
        this.mapData.height = height;
        this.canvas.updateSize(width, height);
        this.toolbar.updateMapData(this.mapData);
    }

    /**
     * Update the screen size and reposition components
     */
    updateScreenSize(width: number, height: number): void {
        this.config.screenWidth = width;
        this.config.screenHeight = height;

        // Recreate components with new dimensions
        this.removeChildren();
        this.createComponents();
    }
}
