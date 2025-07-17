import { Container } from 'pixi.js';
import { MapViewport } from '../UI/MapViewport';
import { MapCanvas } from './components/MapCanvas';
import { MapProperties } from './components/MapProperties';
import { MapToolbar } from './components/MapToolbar';
import { MapData, MapEditorConfig, TreeData } from './types/MapData';

/**
 * Map editor screen component - composes toolbar, canvas, and properties
 */
export class MapEditor extends Container {
    private config: MapEditorConfig;
    private mapData: MapData;
    private toolbar!: MapToolbar;
    private canvas!: MapCanvas;
    private properties!: MapProperties;
    private viewport!: MapViewport;

    /**
     * Create the map editor screen
     */
    constructor(config: MapEditorConfig) {
        super();
        this.config = config;

        // Initialize with default map data (1km x 1km)
        this.mapData = {
            name: 'New Map',
            width: 100000, // 1km = 100,000 cm
            height: 100000, // 1km = 100,000 cm
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

        // Create properties panel
        this.properties = new MapProperties(
            this.config.screenWidth,
            this.config.screenHeight,
            this.mapData,
            this.onMapResize.bind(this),
        );

        // Calculate viewport dimensions with proper spacing
        const spacing = 20; // 20px spacing
        const viewportX = spacing;
        const viewportY = 120 + spacing; // Space for toolbar + spacing
        const viewportWidth = this.config.screenWidth - 200 - (spacing * 2); // Space for properties panel + spacing on both sides
        const viewportHeight = this.config.screenHeight - 120 - (spacing * 2); // Space for toolbar + spacing top and bottom

        // Create viewport
        this.viewport = new MapViewport({
            width: viewportWidth,
            height: viewportHeight,
            worldWidth: this.mapData.width,
            worldHeight: this.mapData.height,
            minZoom: 0.0001, // Allow very small zoom for large maps
            maxZoom: 10.0,
        });
        this.viewport.position.set(viewportX, viewportY);

        // Create canvas
        this.canvas = new MapCanvas(
            this.mapData,
            this.onMapDataChange.bind(this),
        );

        // Add canvas to viewport's world container
        this.viewport.addWorldContent(this.canvas);

        // Make viewport focusable and focused for keyboard events
        this.viewport.eventMode = 'static';
        this.viewport.cursor = 'default';

        this.addChild(this.toolbar);
        this.addChild(this.properties);
        this.addChild(this.viewport);
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
        this.viewport.updateWorldSize(width, height);
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
