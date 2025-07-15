import { Tree } from "./Tree";

export class Terrain {
    public trees: Tree[] = [];
    
    public getState() {
        return {
            trees: this.trees,
        };
    }
}