import { promises as fs } from 'fs';

export class JsonFileManager<T extends object> {
    private dir: string;
    private fileExtension: string;

    constructor(dir: string, fileExtension = 'json') {
        this.dir = dir;
        this.fileExtension = fileExtension;
    }

    async loadDirectory() {
        const files = await fs.readdir(this.dir);
        return files.filter(file => file.endsWith(`.${this.fileExtension}`));
    }

    async loadFile(name: string): Promise<T> {
        const file = await fs.readFile(`./src/${this.dir}/${name}.${this.fileExtension}`, 'utf8');
        return JSON.parse(file) as T;
    }

    async writeFile(name: string, data: T) {
        await fs.writeFile(`./src/${this.dir}/${name}.${this.fileExtension}`, JSON.stringify(data, null, 2));
    }
}
