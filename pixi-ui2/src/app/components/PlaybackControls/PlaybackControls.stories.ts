import { PlaybackControls } from './PlaybackControls';
import { createComponentStoryRender } from '../../../../.storybook/pixiStorybook';

export default {
    title: 'PlaybackControls',
    component: PlaybackControls,
    args: {},
};

export const Default = {
    render: createComponentStoryRender(PlaybackControls),
};
