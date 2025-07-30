import { action } from '@storybook/addon-actions';
import { Button } from './Button';
import { createComponentStoryRender } from '../../../stories/pixiStorybook';

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
    render: createComponentStoryRender(Button),
};
