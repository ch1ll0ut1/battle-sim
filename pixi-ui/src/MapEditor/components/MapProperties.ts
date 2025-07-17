import { Container, Text, TextStyle } from 'pixi.js';
import { Slider } from '../../UI/Slider';
import { MapData } from '../types/MapData';

/**
 * Map properties panel for editing map settings
 */
export class MapProperties extends Container {
    private mapData: MapData;
    private onMapResize: (width: number, height: number) => void;
    private widthSlider!: Slider;
    private heightSlider!: Slider;
    private treeCountText!: Text;
    private fpsText!: Text;
    private fpsStartTime = performance.now();
    private fpsFrameCount = 0;

    constructor(
        screenWidth: number,
        screenHeight: number,
        mapData: MapData,
        onMapResize: (width: number, height: number) => void,
    ) {
        super();
        this.mapData = mapData;
        this.onMapResize = onMapResize;

        this.createPropertiesPanel(screenWidth, screenHeight);
        this.startFpsMonitoring();
    }

    private createPropertiesPanel(screenWidth: number, _screenHeight: number): void {
        const panelX = screenWidth - 200;
        const panelY = 140;

        // Properties title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
        });

        const title = new Text({
            text: 'Map Properties',
            style: titleStyle,
        });
        title.position.set(panelX, panelY);
        this.addChild(title);

        // Size controls
        this.createSizeControls(panelX, panelY + 30);

        // Map info
        this.createMapInfo(panelX, panelY + 140);
    }

    private createSizeControls(x: number, y: number): void {
        const labelStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            fill: 0xCCCCCC,
        });

        // Width controls
        const widthLabel = new Text({
            text: 'Width:',
            style: labelStyle,
        });
        widthLabel.position.set(x, y);
        this.addChild(widthLabel);

        this.widthSlider = new Slider({
            width: 140,
            height: 30,
            minValue: 1,
            maxValue: 100,
            value: this.mapData.width / 100000, // Convert from cm to km
            step: 0.1,
            onChange: (value) => {
                const newWidth = value * 100000; // Convert from km to cm
                this.mapData.width = newWidth;
                this.onMapResize(newWidth, this.mapData.height);
            },
        });
        this.widthSlider.position.set(x, y + 20);
        this.addChild(this.widthSlider);

        // Height controls
        const heightLabel = new Text({
            text: 'Height:',
            style: labelStyle,
        });
        heightLabel.position.set(x, y + 60);
        this.addChild(heightLabel);

        this.heightSlider = new Slider({
            width: 140,
            height: 30,
            minValue: 1,
            maxValue: 100,
            value: this.mapData.height / 100000, // Convert from cm to km
            step: 0.1,
            onChange: (value) => {
                const newHeight = value * 100000; // Convert from km to cm
                this.mapData.height = newHeight;
                this.onMapResize(this.mapData.width, newHeight);
            },
        });
        this.heightSlider.position.set(x, y + 80);
        this.addChild(this.heightSlider);
    }

    private createMapInfo(x: number, y: number): void {
        const infoStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            fill: 0xCCCCCC,
        });

        // Tree count
        this.treeCountText = new Text({
            text: `Trees: ${this.mapData.trees.length}`,
            style: infoStyle,
        });
        this.treeCountText.position.set(x, y);
        this.addChild(this.treeCountText);

        // FPS display
        this.fpsText = new Text({
            text: 'FPS: --',
            style: infoStyle,
        });
        this.fpsText.position.set(x, y + 20);
        this.addChild(this.fpsText);
    }

    updateMapData(mapData: MapData): void {
        this.mapData = mapData;
        this.widthSlider.setValue(mapData.width / 100000);
        this.heightSlider.setValue(mapData.height / 100000);
        this.treeCountText.text = `Trees: ${mapData.trees.length}`;
    }

    private startFpsMonitoring(): void {
        const updateFps = () => {
            this.fpsFrameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - this.fpsStartTime;

            if (elapsed >= 1000) { // Update every second
                const fps = Math.round((this.fpsFrameCount * 1000) / elapsed);
                this.fpsText.text = `FPS: ${fps}`;
                this.fpsFrameCount = 0;
                this.fpsStartTime = currentTime;
            }

            requestAnimationFrame(updateFps);
        };

        updateFps();
    }
}
