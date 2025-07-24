const config = {
    // use glob matching, eg: ../src/stories/**/*.stories.@(ts|tsx|js|jsx|mdx)
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    staticDirs: ['../raw-assets'],
    logLevel: 'debug',
    addons: [
        '@storybook/addon-actions',
        '@storybook/addon-backgrounds',
        '@storybook/addon-controls',
        '@storybook/addon-viewport',
        '@storybook/addon-links',
        '@storybook/addon-highlight',
        '@storybook/addon-docs',
    ],
    core: {
        channelOptions: { allowFunction: false, maxDepth: 10 },
        disableTelemetry: true,
    },
    features: {
        buildStoriesJson: true,
        breakingChangesV7: true,
    },
    framework: '@pixi/storybook-vite',
};

// eslint-disable-next-line import/no-default-export
export default config;
