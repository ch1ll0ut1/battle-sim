/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import { Container } from 'pixi.js';

/**
 * Creates a standard story configuration object
 */
export function createStoryConfig(title: string, component: unknown, additionalArgs: Record<string, unknown> = {}) {
    return {
        title,
        component,
        args: additionalArgs,
    };
}
/**
 * Common context type for PIXI Storybook stories
 */
export interface PixiStoryContext {
    parameters: {
        pixi: {
            appReady: Promise<void>;
        };
    };
}

/**
 * Standard story return type for PIXI components
 */
export interface PixiStoryReturn {
    view: Container;
    update: () => void;
    destroy: () => void;
    resize: (rendererWidth: number, rendererHeight: number) => void;
}

/**
 * Function type for creating PIXI components
 */
export type ComponentFactory<T extends Container> = () => T;

/**
 * Creates a standard PIXI story render function
 * This eliminates duplication in story creation by providing a common pattern
 */
export function createPixiStoryRender<T extends Container>(
    componentFactory: ComponentFactory<T> | ((args: unknown) => T),
    options: {
        centerComponent?: boolean;
        customResize?: (component: T, rendererWidth: number, rendererHeight: number) => void;
    } = {},
) {
    const { centerComponent = true, customResize } = options;

    return (args: unknown, ctx: PixiStoryContext): PixiStoryReturn => {
        const view = new Container();
        let component: T | undefined;

        // Wait for the PIXI app to be ready
        ctx.parameters.pixi.appReady.then(() => {
            component = componentFactory.length === 0
                ? (componentFactory as ComponentFactory<T>)()
                : (componentFactory as (args: unknown) => T)(args);

            // Add the component to the view
            view.addChild(component);
        }).catch(console.error);

        // Return required format for @pixi/storybook-vite
        return {
            view,
            update: () => {
                // Update logic can be added here if needed
            },
            destroy: () => {
                view.destroy();
            },
            resize: (rendererWidth: number, rendererHeight: number) => {
                if (customResize && component) {
                    customResize(component, rendererWidth, rendererHeight);
                }
                else if (centerComponent && component) {
                    view.x = rendererWidth / 2 - view.width / 2;
                    view.y = rendererHeight / 2 - view.height / 2;
                }
            },
        };
    };
}

export function createComponentStoryRender<T extends Container, TArgs>(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ComponentClass: new (args: TArgs) => T,
    options: {
        centerComponent?: boolean;
        customResize?: (component: T, rendererWidth: number, rendererHeight: number) => void;
    } = {},
) {
    return createPixiStoryRender((args: unknown) => new ComponentClass(args as TArgs), options);
}
