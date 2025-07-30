import { Container, Graphics, Ticker } from 'pixi.js';
import { Camera } from '../../../Engine/Camera';
import { Screen } from '../../../Engine/Screen';
import { PlaybackControls } from '../../components/PlaybackControls/PlaybackControls';

/**
 * MapScreen demonstrates camera usage with world Container injection
 * Creates a world container with sample content and provides camera controls
 */
export class MapScreen extends Screen {
    private camera: Camera;
    private controls: PlaybackControls;

    constructor() {
        super();

        const worldContainer = new Container();

        // Add some sample world content for testing
        this.addSampleWorldContent(worldContainer);

        // Init Camera
        this.camera = new Camera(worldContainer, worldContainer.width, worldContainer.height);
        this.addChild(this.camera);
        this.camera.init();

        // Add playback controls
        this.controls = new PlaybackControls();
        this.addChild(this.controls);
    }

    /**
     * Add sample content to the world for testing camera functionality
     */
    private addSampleWorldContent(worldContainer: Container) {
        // Create a grid pattern to help visualize camera movement
        const gridSize = 100;
        const worldWidth = 2000;
        const worldHeight = 1500;

        // Add a dark green background
        const background = new Graphics();
        background.rect(0, 0, worldWidth, worldHeight).fill({ color: 0x003300 });
        worldContainer.addChild(background);

        // Add grid lines
        for (let x = 0; x <= worldWidth; x += gridSize) {
            const line = new Graphics();
            line.moveTo(x, 0).lineTo(x, worldHeight).stroke({ width: 1, color: 0x333333 });
            worldContainer.addChild(line);
        }

        for (let y = 0; y <= worldHeight; y += gridSize) {
            const line = new Graphics();
            line.moveTo(0, y).lineTo(worldWidth, y).stroke({ width: 1, color: 0x333333 });
            worldContainer.addChild(line);
        }

        // Add some colored rectangles at various positions
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        for (let i = 0; i < 10; i++) {
            const rect = new Graphics();
            const x = Math.random() * (worldWidth - 50);
            const y = Math.random() * (worldHeight - 50);
            const color = colors[i % colors.length];

            rect.rect(x, y, 50, 50).fill({ color });
            worldContainer.addChild(rect);
        }

        // Add a center marker
        const centerMarker = new Graphics();
        centerMarker.circle(worldWidth / 2, worldHeight / 2, 20).fill({ color: 0xffffff });
        worldContainer.addChild(centerMarker);
    }

    /**
     * Update camera every tick
     */
    update(ticker: Ticker) {
        this.camera.update(ticker);
    }

    /**
     * Resize camera viewport
     */
    resize(width: number, height: number) {
        this.camera.resize(width, height);
    }

    /**
     * Clean up camera resources
     */
    destroy() {
        this.camera.destroy();
        super.destroy();
    }
}
