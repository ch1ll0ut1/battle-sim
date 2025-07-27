/* eslint-disable @typescript-eslint/no-empty-function */
import { action } from '@storybook/addon-actions';
import { Button } from './Button';
import { Container } from 'pixi.js';

export default {
    title: 'Button',
    component: Button,
    argTypes: {
        type: {
            control: 'select',
            options: ['primary', 'secondary'],
        },
    },
    args: {
        type: 'primary',
        label: 'Button',
        onClick: action('onBunnyClick'),
    },
};

export const Default = {
    render: (args: { type: 'primary' | 'secondary'; label: string; onClick: () => void }, ctx: { parameters: { pixi: { appReady: Promise<void> } } }) => {
        const view = new Container();

        ctx.parameters.pixi.appReady.then(() => {
            // const button = new Button('primary', 'Button', () => action('onBunnyClick'));
            const button = new Button(args.type, args.label, args.onClick);
            view.addChild(button);
        }).catch(console.error);

        return {
            view,
            update: () => {},
            destroy: () => {
                view.destroy();
            },
            resize: (rendererWidth: number, rendererHeight: number) => {
                view.x = rendererWidth / 2 - view.width / 2;
                view.y = rendererHeight / 2 - view.height / 2;
            },
        };
    },
};
