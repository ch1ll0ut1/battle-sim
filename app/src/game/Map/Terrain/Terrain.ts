import { TreeState } from './Tree';

export interface TerrainState {
    trees: TreeState[];
}

export class Terrain {
    public trees: TreeState[] = [];

    constructor(trees: TreeState[]) {
        this.trees = trees;
    }

    public getState(): TerrainState {
        return {
            trees: this.trees,
        };
    }
}
