import { Container, FederatedPointerEvent, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * Slider configuration interface
 */
export interface SliderConfig {
    width: number;
    height?: number;
    minValue: number;
    maxValue: number;
    value: number;
    step?: number;
    onChange?: (value: number) => void;
}

/**
 * Reusable slider component for PixiJS
 */
export class Slider extends Container {
    private background!: Graphics;
    private track!: Graphics;
    private thumb!: Graphics;
    private valueText!: Text;
    private config: SliderConfig;
    private isDragging = false;
    private thumbWidth = 20;

    constructor(config: SliderConfig) {
        super();
        this.config = {
            height: 30,
            step: 1,
            ...config,
        };
        this.createSlider();
        this.setupInteractivity();
    }

    private createSlider(): void {
        const { width, height } = this.config;

        // Create background track
        this.background = new Graphics();
        this.background.roundRect(0, height! / 2 - 3, width, 6, 3).fill({ color: 0x333333 });
        this.background.roundRect(0, height! / 2 - 3, width, 6, 3).stroke({ color: 0x666666, width: 1 });
        this.addChild(this.background);

        // Create filled track
        this.track = new Graphics();
        this.addChild(this.track);

        // Create thumb
        this.thumb = new Graphics();
        this.addChild(this.thumb);

        // Create value text
        const textStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            fill: 0xFFFFFF,
            align: 'center',
        });

        this.valueText = new Text({
            text: this.config.value.toString(),
            style: textStyle,
        });
        this.valueText.anchor.set(0.5);
        this.valueText.position.set(width / 2, -10);
        this.addChild(this.valueText);

        this.updateVisuals();
    }

    private updateVisuals(): void {
        const { width, height, minValue, maxValue, value } = this.config;
        const trackHeight = height! / 2;

        // Calculate thumb position
        const normalizedValue = (value - minValue) / (maxValue - minValue);
        const thumbX = normalizedValue * (width - this.thumbWidth) + this.thumbWidth / 2;

        // Update filled track
        this.track.clear();
        this.track.roundRect(0, trackHeight - 3, thumbX, 6, 3).fill({ color: 0x4CAF50 });

        // Update thumb
        this.thumb.clear();
        this.thumb.circle(thumbX, trackHeight, this.thumbWidth / 2).fill({ color: 0xFFFFFF });
        this.thumb.circle(thumbX, trackHeight, this.thumbWidth / 2).stroke({ color: 0x4CAF50, width: 2 });

        // Update value text
        this.valueText.text = value.toFixed(1);
    }

    private setupInteractivity(): void {
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointermove', this.onPointerMove.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerupoutside', this.onPointerUp.bind(this));
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        this.isDragging = true;
        this.updateValueFromPosition(event.getLocalPosition(this).x);
    }

    private onPointerMove(event: FederatedPointerEvent): void {
        if (this.isDragging) {
            this.updateValueFromPosition(event.getLocalPosition(this).x);
        }
    }

    private onPointerUp(): void {
        this.isDragging = false;
    }

    private updateValueFromPosition(x: number): void {
        const { width, minValue, maxValue, step } = this.config;

        // Constrain x to slider bounds
        x = Math.max(0, Math.min(width, x));

        // Calculate normalized position
        const normalizedPosition = x / width;

        // Calculate raw value
        const rawValue = minValue + normalizedPosition * (maxValue - minValue);

        // Apply step if specified
        const steppedValue = step ? Math.round(rawValue / step) * step : rawValue;

        // Constrain to min/max
        const newValue = Math.max(minValue, Math.min(maxValue, steppedValue));

        if (newValue !== this.config.value) {
            this.config.value = newValue;
            this.updateVisuals();

            if (this.config.onChange) {
                this.config.onChange(newValue);
            }
        }
    }

    setValue(value: number): void {
        this.config.value = Math.max(this.config.minValue, Math.min(this.config.maxValue, value));
        this.updateVisuals();
    }

    getValue(): number {
        return this.config.value;
    }
}
