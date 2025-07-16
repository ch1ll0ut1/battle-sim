import { Container, Text, TextStyle } from 'pixi.js';
import { Button } from '../../UI/Button';
import { MapData } from '../types/MapData';

/**
 * Map properties panel for editing map settings
 */
export class MapProperties extends Container {
    private mapData: MapData;
    private onMapResize: (width: number, height: number) => void;
    private widthText!: Text;
    private heightText!: Text;

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
    }

    private createPropertiesPanel(screenWidth: number, screenHeight: number): void {
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
        this.createMapInfo(panelX, panelY + 120);
    }

    private createSizeControls(x: number, y: number): void {
        const labelStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            fill: 0xCCCCCC,
        });

        const valueStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
        });

        // Width controls
        const widthLabel = new Text({
            text: 'Width:',
            style: labelStyle,
        });
        widthLabel.position.set(x, y);
        this.addChild(widthLabel);

        this.widthText = new Text({
            text: `${this.mapData.width}cm`,
            style: valueStyle,
        });
        this.widthText.position.set(x + 50, y);
        this.addChild(this.widthText);

        // Width buttons
        const widthDecButton = new Button({
            text: '-',
            width: 25,
            height: 25,
            backgroundColor: 0xF44336,
            fontSize: 12,
            onClick: () => { this.adjustMapSize(-100, 0); },
        });
        widthDecButton.position.set(x + 120, y - 5);
        this.addChild(widthDecButton);

        const widthIncButton = new Button({
            text: '+',
            width: 25,
            height: 25,
            backgroundColor: 0x4CAF50,
            fontSize: 12,
            onClick: () => { this.adjustMapSize(100, 0); },
        });
        widthIncButton.position.set(x + 150, y - 5);
        this.addChild(widthIncButton);

        // Height controls
        const heightLabel = new Text({
            text: 'Height:',
            style: labelStyle,
        });
        heightLabel.position.set(x, y + 30);
        this.addChild(heightLabel);

        this.heightText = new Text({
            text: `${this.mapData.height}cm`,
            style: valueStyle,
        });
        this.heightText.position.set(x + 50, y + 30);
        this.addChild(this.heightText);

        // Height buttons
        const heightDecButton = new Button({
            text: '-',
            width: 25,
            height: 25,
            backgroundColor: 0xF44336,
            fontSize: 12,
            onClick: () => { this.adjustMapSize(0, -100); },
        });
        heightDecButton.position.set(x + 120, y + 25);
        this.addChild(heightDecButton);

        const heightIncButton = new Button({
            text: '+',
            width: 25,
            height: 25,
            backgroundColor: 0x4CAF50,
            fontSize: 12,
            onClick: () => { this.adjustMapSize(0, 100); },
        });
        heightIncButton.position.set(x + 150, y + 25);
        this.addChild(heightIncButton);
    }

    private createMapInfo(x: number, y: number): void {
        const infoStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            fill: 0xCCCCCC,
        });

        const treeCountText = new Text({
            text: `Trees: ${this.mapData.trees.length}`,
            style: infoStyle,
        });
        treeCountText.position.set(x, y);
        this.addChild(treeCountText);
    }

    private adjustMapSize(widthDelta: number, heightDelta: number): void {
        const newWidth = Math.max(500, this.mapData.width + widthDelta);
        const newHeight = Math.max(500, this.mapData.height + heightDelta);

        this.mapData.width = newWidth;
        this.mapData.height = newHeight;

        this.widthText.text = `${newWidth}cm`;
        this.heightText.text = `${newHeight}cm`;

        this.onMapResize(newWidth, newHeight);
    }

    updateMapData(mapData: MapData): void {
        this.mapData = mapData;
        this.widthText.text = `${mapData.width}cm`;
        this.heightText.text = `${mapData.height}cm`;
    }
}
