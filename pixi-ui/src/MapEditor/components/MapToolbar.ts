import { Container, Text, TextStyle } from 'pixi.js';
import { Button } from '../../UI/Button';
import { MapData, TreeData } from '../types/MapData';
import { generateTreesForMap } from '../utils/TreeGenerator';

/**
 * Map editor toolbar with tools and actions
 */
export class MapToolbar extends Container {
    private onBack: () => void;
    private onSave: (mapData: MapData) => void;
    private onToolSelect: (tool: string) => void;
    private onGenerateTrees: (trees: TreeData[]) => void;
    private mapData: MapData;
    private selectedTool = 'tree';

    constructor(
        screenWidth: number,
        mapData: MapData,
        onBack: () => void,
        onSave: (mapData: MapData) => void,
        onToolSelect: (tool: string) => void,
        onGenerateTrees: (trees: TreeData[]) => void,
    ) {
        super();
        this.mapData = mapData;
        this.onBack = onBack;
        this.onSave = onSave;
        this.onToolSelect = onToolSelect;
        this.onGenerateTrees = onGenerateTrees;

        this.createToolbar(screenWidth);
    }

    private createToolbar(screenWidth: number): void {
        // Back button
        const backButton = new Button({
            text: 'Back',
            width: 100,
            height: 40,
            backgroundColor: 0x666666,
            fontSize: 14,
            onClick: this.onBack,
        });
        backButton.position.set(20, 20);
        this.addChild(backButton);

        // Save button
        const saveButton = new Button({
            text: 'Save Map',
            width: 120,
            height: 40,
            backgroundColor: 0x4CAF50,
            fontSize: 14,
            onClick: () => { this.onSave(this.mapData); },
        });
        saveButton.position.set(screenWidth - 140, 20);
        this.addChild(saveButton);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
        });

        const title = new Text({
            text: 'Map Editor',
            style: titleStyle,
        });
        title.position.set(screenWidth / 2 - 60, 25);
        this.addChild(title);

        // Tool buttons
        this.createToolButtons();

        // Generate trees button
        this.createGenerateTreesButton();
    }

    private createToolButtons(): void {
        const toolY = 80;
        const tools = [
            { id: 'tree', name: 'Tree', color: 0x4CAF50 },
            { id: 'erase', name: 'Erase', color: 0xF44336 },
        ];

        tools.forEach((tool, index) => {
            const button = new Button({
                text: tool.name,
                width: 80,
                height: 35,
                backgroundColor: this.selectedTool === tool.id ? 0x2196F3 : tool.color,
                fontSize: 14,
                onClick: () => {
                    this.selectedTool = tool.id;
                    this.onToolSelect(tool.id);
                    this.updateToolButtons();
                },
            });

            button.position.set(20 + (90 * index), toolY);
            this.addChild(button);
        });
    }

    private createGenerateTreesButton(): void {
        const generateButton = new Button({
            text: 'Generate Trees',
            width: 140,
            height: 35,
            backgroundColor: 0xFF9800,
            fontSize: 14,
            onClick: () => {
                const trees = generateTreesForMap(this.mapData);
                this.onGenerateTrees(trees);
            },
        });

        generateButton.position.set(220, 80);
        this.addChild(generateButton);
    }

    private updateToolButtons(): void {
        // Remove and recreate tool buttons to update their appearance
        this.removeChildren();
        this.createToolbar(800); // TODO: Pass actual screen width
    }

    updateMapData(mapData: MapData): void {
        this.mapData = mapData;
    }
}
