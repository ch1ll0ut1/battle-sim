import { colors } from '../src/app/config/colors';

const preview = {
    parameters: {
        layout: 'fullscreen',
        pixi: {
        // these are passed as options to `PIXI.Application` when instantiated by the
        // renderer
            applicationOptions: {
                background: colors.background,
                resizeTo: window,
                antialias: true,
                autoDensity: true,
                resolution: window.devicePixelRatio,
                roundPixels: true,
            },
            // optional, if you want to provide custom resize logic, pass a function here,
            // if nothing is provided, the default resize function is used, which looks like
            // this, where w and h will be the width and height of the storybook canvas.
            // resizeFn: (w, h) => {
            //     return {
            //         rendererWidth: w,
            //         rendererHeight: h,
            //         canvasWidth: w,
            //         canvasHeight: h,
            //     };
            // },
        },
    },
};

// eslint-disable-next-line import/no-default-export
export default preview;
