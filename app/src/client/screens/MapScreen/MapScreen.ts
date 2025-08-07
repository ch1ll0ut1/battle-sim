import { Container, Graphics, Ticker } from 'pixi.js';
import { Camera } from '../../../engine/Renderer/Camera/Camera';
import { Screen } from '../../../engine/Renderer/Screen/Screen';
import { events, GameEvent } from '../../../game/events';
import { Map } from '../../../game/Map/Map';
import { TreeState } from '../../../game/Map/Terrain/Tree';
import { PlaybackControls } from '../../components/PlaybackControls/PlaybackControls';
import { UnitController } from '../../components/Unit/UnitController';

/**
 * MapScreen demonstrates camera usage with world Container injection
 * Creates a world container with sample content and provides camera controls
 */
export class MapScreen extends Screen {
    private camera?: Camera;
    private controls?: PlaybackControls;
    private worldContainer: Container;
    private unitController: UnitController;

    constructor() {
        super();

        this.worldContainer = new Container();
        this.worldContainer.label = 'world-container';

        this.unitController = new UnitController();
    }

    async prepare() {
        // Prepare unit controller to load and update units
        this.unitController.init(this.worldContainer);

        // Create game session
        events.emit(GameEvent.initGame, { gameMode: 'map', map: 'small' });

        await new Promise<void>((resolve) => {
            events.once(GameEvent.gameStateChanged, (state) => {
                // Draw map & terrain
                this.drawMap(this.worldContainer, state.state.map);

                // Init Camera
                this.camera = new Camera(this.worldContainer, this.worldContainer.width, this.worldContainer.height);
                this.addChild(this.camera);
                this.camera.init();

                // Add playback controls
                this.controls = new PlaybackControls();
                this.addChild(this.controls);

                resolve();
            });
        });
    }

    private drawMap(worldContainer: Container, map: ReturnType<Map['getState']>) {
        const { width, height, terrain } = map;

        // Add a dark green background
        const background = new Graphics();
        background.rect(0, 0, width, height).fill({ color: 0x003300 });
        background.label = 'map-background';
        worldContainer.addChild(background);

        // Add the trees
        terrain.trees.forEach((tree, index) => {
            // if (index > 10) return;
            // this.drawTree(worldContainer, tree);
        });
    }

    private drawTree(worldContainer: Container, tree: TreeState) {
        const { x, y } = tree.position;

        // const sprite = new Sprite();
        // sprite.position.set(tree.position.x, tree.position.y);
        // sprite.anchor.set(0.5, 0.5); // Center the sprite

        const graphics = new Graphics();
        graphics.position.set(x, y);
        graphics.label = 'tree';

        graphics.circle(0, 0, tree.canopyRadius).fill({ color: 0x2F4F2F, alpha: 0.5 });
        graphics.circle(0, 0, tree.trunkRadius).fill({ color: 0x8D6E63 });

        worldContainer.addChild(graphics);
    }

    /**
     * Update camera every tick
     */
    update(ticker: Ticker) {
        if (this.camera) {
            this.camera.update(ticker);
        }
    }

    /**
     * Resize camera viewport
     */
    resize(width: number, height: number) {
        if (this.camera) {
            this.camera.resize(width, height);
        }
    }

    /**
     * Clean up camera resources
     */
    destroy() {
        if (this.camera) {
            this.camera.destroy();
        }

        super.destroy();
    }
}
