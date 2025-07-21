import { CircularProgressBar } from '@pixi/ui';
import { animate, ObjectTarget } from 'motion';
import { BitmapText } from 'pixi.js';
import { Screen } from '../../../Engine/Screen';
import colors from '../../config/colors';
import font from '../../config/font';

export class LoadScreen extends Screen {
    static assetBundles = ['preload'];

    private progressBar: CircularProgressBar;
    private loadingText: BitmapText;

    constructor() {
        super();
        console.log('LoadScreen init');

        this.progressBar = new CircularProgressBar({
            ...colors.progressBar,
            radius: 100,
            lineWidth: 15,
            value: 20,
            backgroundAlpha: 0.5,
            fillAlpha: 0.8,
            cap: 'round',
        });

        this.addChild(this.progressBar);

        this.loadingText = new BitmapText({
            text: 'Loading...',
            style: { ...font.title },
        });

        this.addChild(this.loadingText);
    }

    resize(width: number, height: number): void {
        console.log('LoadScreen resize', width, height);

        this.loadingText.position.set(width * 0.5, height * 0.5 + 100);
        this.progressBar.position.set(width * 0.5, height * 0.5);
    }

    async show() {
        console.log('LoadScreen show');
        this.alpha = 0;
        const toAnimate: ObjectTarget<LoadScreen> = {
            alpha: 1,
        };
        await animate(this, toAnimate, {
            duration: 0.3,
            ease: 'linear',
            delay: 1,
        });
    }

    async hide() {
        console.log('LoadScreen hide');

        const toAnimate: ObjectTarget<LoadScreen> = {
            alpha: 0,
        };
        await animate(this, toAnimate, {
            duration: 0.3,
            ease: 'linear',
            delay: 1,
        });
    }

    async pause() {
        console.log('LoadScreen pause');
        return Promise.resolve();
    }

    async resume() {
        console.log('LoadScreen resume');
        return Promise.resolve();
    }

    prepare() {
        console.log('LoadScreen prepare');
    }

    reset() {
        console.log('LoadScreen reset');
    }

    update() {
        // console.log('update');
    }

    blur() {
        console.log('LoadScreen blur');
    }

    focus() {
        console.log('LoadScreen focus');
    }

    onLoad(progress: number) {
        console.log('LoadScreen onLoad', progress);
        this.progressBar.progress = progress;
    }
}
