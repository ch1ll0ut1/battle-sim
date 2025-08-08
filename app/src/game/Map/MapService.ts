import { isServer } from '../../engine/environment';
import { JsonFileManager } from '../../engine/JsonFileManager';
import { Map } from './Map';
import { Terrain } from './Terrain/Terrain';
import { TreeState } from './Terrain/Tree';

interface MapFile {
    width: number;
    height: number;
    trees: TreeState[];
}

const isMapFile = (file: unknown): file is MapFile => {
    return typeof file === 'object' && file !== null && 'width' in file && 'height' in file && 'trees' in file;
};

export class MapService {
    private fileManager: JsonFileManager<Map>;

    constructor() {
        if (!isServer) {
            throw new Error('File operations are not supported in the browser');
        }
        this.fileManager = new JsonFileManager<Map>('data/maps', 'json');
    }

    async loadMap(name: string): Promise<Map> {
        const file = await this.fileManager.loadFile(name);

        if (!isMapFile(file)) {
            throw new Error('Invalid map file');
        }

        const terrain = new Terrain(file.trees);

        // TODO: temporarily make map very small
        // return new Map(1000, 1000, terrain);

        return new Map(file.width, file.height, terrain);
    }

    async saveMap(name: string, map: Map) {
        return this.fileManager.writeFile(name, map);

        // TODO: implement map saving
        // events.emit(GameEvent.saveMap, name, map);
        throw new Error('Map saving is not implemented');
    }
}
