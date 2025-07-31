import { action } from '@storybook/addon-actions';
import { createComponentStoryRender } from '../../../../.storybook/pixiStorybook';
import { colors } from '../../../config/colors';
import { Button } from './Button';

export default {
    title: 'Button',
    component: Button,
    argTypes: {
        type: {
            control: 'select',
            options: ['primary', 'secondary'],
        },
    },
};

export const Primary = {
    args: {
        type: 'primary',
        label: 'Button',
        onClick: action('onPrimaryClick'),
    },
    render: createComponentStoryRender(Button),
};

export const PrimaryDisabled = {
    args: {
        type: 'primary',
        label: 'Button',
        onClick: action('onPrimaryClick'),
        disabled: true,
    },
    render: createComponentStoryRender(Button),
};

export const Secondary = {
    args: {
        type: 'secondary',
        label: 'Secondary Button',
        onClick: action('onSecondaryClick'),
    },
    render: createComponentStoryRender(Button),
};

export const SecondaryDisabled = {
    args: {
        type: 'secondary',
        label: 'Secondary Button',
        onClick: action('onSecondaryClick'),
        disabled: true,
    },
    render: createComponentStoryRender(Button),
};

export const Red = {
    args: {
        type: 'secondary',
        label: 'Red Button',
        onClick: action('onRedClick'),
        color: colors.red,
    },
    render: createComponentStoryRender(Button),
};

export const Blue = {
    args: {
        type: 'secondary',
        label: 'Blue Button',
        onClick: action('onBlueClick'),
        color: colors.blue,
    },
    render: createComponentStoryRender(Button),
};

export const Green = {
    args: {
        type: 'secondary',
        label: 'Green Button',
        onClick: action('onGreenClick'),
        color: colors.green,
    },
    render: createComponentStoryRender(Button),
};

export const Orange = {
    args: {
        type: 'secondary',
        label: 'Orange Button',
        onClick: action('onOrangeClick'),
        color: colors.orange,
    },
    render: createComponentStoryRender(Button),
};

export const OrangeDisabled = {
    args: {
        type: 'secondary',
        label: 'Orange Button',
        onClick: action('onOrangeClick'),
        color: colors.orange,
        disabled: true,
    },
    render: createComponentStoryRender(Button),
};

export const White = {
    args: {
        type: 'secondary',
        label: 'White Button',
        onClick: action('onOrangeClick'),
        color: colors.white,
    },
    render: createComponentStoryRender(Button),
};

export const Icon = {
    args: {
        type: 'secondary',
        label: '⚙',
        onClick: action('onIconClick'),
    },
    render: createComponentStoryRender(Button),
};

export const PurpleIcon = {
    args: {
        type: 'secondary',
        label: '⚡',
        onClick: action('onPurpleIconClick'),
        color: colors.purple,
    },
    render: createComponentStoryRender(Button),
};

export const PurpleIconDisabled = {
    args: {
        type: 'secondary',
        label: '⚡',
        onClick: action('onPurpleIconClick'),
        color: colors.purple,
        disabled: true,
    },
    render: createComponentStoryRender(Button),
};
